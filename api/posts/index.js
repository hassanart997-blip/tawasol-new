const pool = require('../db');
const jwt = require('jsonwebtoken');

const auth = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('Unauthorized');
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = async (req, res) => {
  try {
    const user = auth(req);
    if (req.method === 'GET') {
      const result = await pool.query(
        `SELECT p.*, u.username, u.full_name, u.profile_picture,
          (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
          EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) as liked
         FROM posts p JOIN users u ON p.user_id = u.id
         ORDER BY p.created_at DESC LIMIT 50`,
        [user.id]
      );
      return res.json(result.rows);
    }
    if (req.method === 'POST') {
      const { content, image_url, video_url } = req.body;
      const result = await pool.query(
        `INSERT INTO posts (user_id, content, image_url, video_url) VALUES ($1, $2, $3, $4) RETURNING *`,
        [user.id, content, image_url, video_url]
      );
      const post = result.rows[0];
      const userRes = await pool.query('SELECT username, full_name, profile_picture FROM users WHERE id = $1', [user.id]);
      return res.status(201).json({ ...post, ...userRes.rows[0], liked: false, likes_count: 0, comments_count: 0 });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    if (err.message === 'Unauthorized') return res.status(401).json({ error: 'Unauthorized' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
