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
    const path = req.url.replace('/api/posts', '').split('?')[0];

    // GET /api/posts - جلب المنشورات
    if (path === '' && req.method === 'GET') {
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

    // POST /api/posts - إضافة منشور
    if (path === '' && req.method === 'POST') {
      const { content, image_url, video_url } = req.body;
      const result = await pool.query(
        `INSERT INTO posts (user_id, content, image_url, video_url) VALUES ($1, $2, $3, $4) RETURNING *`,
        [user.id, content, image_url, video_url]
      );
      const post = result.rows[0];
      const userRes = await pool.query('SELECT username, full_name, profile_picture FROM users WHERE id = $1', [user.id]);
      return res.status(201).json({ ...post, ...userRes.rows[0], liked: false, likes_count: 0, comments_count: 0 });
    }

    // GET /api/posts/explore
    if (path === '/explore' && req.method === 'GET') {
      const result = await pool.query(
        `SELECT p.*, u.username, u.full_name,
          (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
         FROM posts p JOIN users u ON p.user_id = u.id
         WHERE p.image_url IS NOT NULL AND p.user_id != $1
         ORDER BY likes_count DESC LIMIT 30`,
        [user.id]
      );
      return res.json(result.rows);
    }

    // GET /api/posts/reels
    if (path === '/reels' && req.method === 'GET') {
      const result = await pool.query(
        `SELECT p.*, u.username, u.full_name,
          (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
          EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) as liked
         FROM posts p JOIN users u ON p.user_id = u.id
         WHERE p.video_url IS NOT NULL ORDER BY p.created_at DESC LIMIT 30`,
        [user.id]
      );
      return res.json(result.rows);
    }

    // GET /api/posts/stories
    if (path === '/stories' && req.method === 'GET') {
      const result = await pool.query(
        `SELECT s.*, u.username, u.full_name, u.profile_picture
         FROM stories s JOIN users u ON s.user_id = u.id
         WHERE (s.user_id IN (SELECT following_id FROM follows WHERE follower_id = $1) OR s.user_id = $1)
         AND s.created_at > NOW() - INTERVAL '24 hours'
         ORDER BY s.created_at DESC`,
        [user.id]
      );
      return res.json(result.rows);
    }

    // POST /api/posts/stories
    if (path === '/stories' && req.method === 'POST') {
      const { mediaUrl } = req.body;
      const result = await pool.query(
        `INSERT INTO stories (user_id, media_url) VALUES ($1, $2) RETURNING *`,
        [user.id, mediaUrl]
      );
      return res.status(201).json(result.rows[0]);
    }

    res.status(404).json({ error: 'Not found' });
  } catch (err) {
    if (err.message === 'Unauthorized') return res.status(401).json({ error: 'Unauthorized' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
