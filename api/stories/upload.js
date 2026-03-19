const pool = require('../db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const { mediaUrl } = req.body;
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      `INSERT INTO stories (user_id, media_url) VALUES ($1, $2) RETURNING *`,
      [user.id, mediaUrl]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
