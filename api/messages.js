const pool = require('../db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    if (req.method === 'GET') {
      const result = await pool.query(
        `SELECT m.*, u.username as sender_name FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.sender_id = $1 OR m.receiver_id = $1
         ORDER BY m.created_at ASC`,
        [user.id]
      );
      return res.json(result.rows);
    }
    if (req.method === 'POST') {
      const { receiver_id, content } = req.body;
      if (!receiver_id || !content) return res.status(400).json({ error: 'Receiver and content required' });
      const result = await pool.query(
        `INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *`,
        [user.id, receiver_id, content]
      );
      return res.status(201).json({ ...result.rows[0], sender_name: user.username });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
