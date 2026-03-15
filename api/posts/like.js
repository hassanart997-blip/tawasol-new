const pool = require('../db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const { postId } = req.body;
    const postCheck = await pool.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
    if (!postCheck.rows[0]) return res.status(404).json({ error: 'Post not found' });
    const likeCheck = await pool.query('SELECT id FROM likes WHERE user_id = $1 AND post_id = $2', [user.id, postId]);
    if (likeCheck.rows.length > 0) {
      await pool.query('DELETE FROM likes WHERE user_id = $1 AND post_id = $2', [user.id, postId]);
      return res.json({ liked: false });
    } else {
      await pool.query('INSERT INTO likes (user_id, post_id) VALUES ($1, $2)', [user.id, postId]);
      const ownerId = postCheck.rows[0].user_id;
      if (ownerId !== user.id) {
        await pool.query(`INSERT INTO notifications (user_id, from_user_id, type, post_id) VALUES ($1, $2, 'like', $3)`, [ownerId, user.id, postId]);
      }
      return res.json({ liked: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
