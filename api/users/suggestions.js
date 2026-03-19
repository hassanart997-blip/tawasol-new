const pool = require('../db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      `SELECT id, username, full_name, profile_picture FROM users
       WHERE id != $1 AND id NOT IN (SELECT following_id FROM follows WHERE follower_id = $1)
       ORDER BY RANDOM() LIMIT 10`,
      [user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
