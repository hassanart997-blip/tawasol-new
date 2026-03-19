والصق:
const pool = require('../db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      `SELECT p.*, u.username, u.full_name,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) as liked
       FROM posts p JOIN users u ON p.user_id = u.id
       WHERE p.video_url IS NOT NULL ORDER BY p.created_at DESC LIMIT 30`,
      [user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
