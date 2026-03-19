const pool = require('../db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      `SELECT s.*, u.username, u.full_name, u.profile_picture
       FROM stories s JOIN users u ON s.user_id = u.id
       WHERE (s.user_id IN (SELECT following_id FROM follows WHERE follower_id = $1) OR s.user_id = $1)
       AND s.created_at > NOW() - INTERVAL '24 hours'
       ORDER BY s.created_at DESC`,
      [user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
