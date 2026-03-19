const pool = require('../db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const { targetId } = req.body;
    if (targetId === user.id) return res.status(400).json({ error: 'Cannot follow yourself' });
    const followCheck = await pool.query('SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2', [user.id, targetId]);
    if (followCheck.rows.length > 0) {
      await pool.query('DELETE FROM follows WHERE follower_id = $1 AND following_id = $2', [user.id, targetId]);
      return res.json({ following: false });
    } else {
      await pool.query('INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)', [user.id, targetId]);
      await pool.query(`INSERT INTO notifications (user_id, from_user_id, type) VALUES ($1, $2, 'follow')`, [targetId, user.id]);
      return res.json({ following: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
