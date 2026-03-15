const pool = require('../db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = req.query;
    const postCheck = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
    if (!postCheck.rows[0]) return res.status(404).json({ error: 'Post not found' });
    const post = postCheck.rows[0];
    if (req.method === 'GET') {
      const comments = await pool.query(
        `SELECT c.*, u.username, u.full_name FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = $1 ORDER BY c.created_at DESC`,
        [id]
      );
      return res.json(comments.rows);
    }
    if (req.method === 'POST') {
      const { content } = req.body;
      const result = await pool.query(
        `INSERT INTO comments (user_id, post_id, content) VALUES ($1, $2, $3) RETURNING *`,
        [user.id, id, content]
      );
      const userRes = await pool.query('SELECT username, full_name FROM users WHERE id = $1', [user.id]);
      return res.status(201).json({ ...result.rows[0], ...userRes.rows[0] });
    }
    if (req.method === 'PUT') {
      if (post.user_id !== user.id) return res.status(403).json({ error: 'Forbidden' });
      const { content } = req.body;
      const result = await pool.query('UPDATE posts SET content = $1 WHERE id = $2 RETURNING *', [content, id]);
      return res.json(result.rows[0]);
    }
    if (req.method === 'DELETE') {
      if (post.user_id !== user.id) return res.status(403).json({ error: 'Forbidden' });
      await pool.query('DELETE FROM posts WHERE id = $1', [id]);
      return res.json({ message: 'Post deleted' });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
