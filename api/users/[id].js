const pool = require('../db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const currentUser = jwt.verify(token, process.env.JWT_SECRET);
    const path = req.url.replace('/api/users', '').split('?')[0];

    // GET /api/users/friends
    if (path === '/friends' && req.method === 'GET') {
      const result = await pool.query(
        `SELECT u.id, u.username, u.full_name, u.profile_picture
         FROM users u JOIN follows f ON u.id = f.following_id
         WHERE f.follower_id = $1`,
        [currentUser.id]
      );
      return res.json(result.rows);
    }

    // GET /api/users/suggestions
    if (path === '/suggestions' && req.method === 'GET') {
      const result = await pool.query(
        `SELECT id, username, full_name, profile_picture FROM users
         WHERE id != $1 AND id NOT IN (SELECT following_id FROM follows WHERE follower_id = $1)
         ORDER BY RANDOM() LIMIT 10`,
        [currentUser.id]
      );
      return res.json(result.rows);
    }

    // GET /api/users/:id
    const id = path.replace('/', '');
    if (id && req.method === 'GET') {
      const result = await pool.query(
        `SELECT u.id, u.username, u.full_name, u.bio, u.profile_picture,
          (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS followers_count,
          (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following_count,
          (SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS posts_count,
          EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND following_id = u.id) AS is_following
         FROM users u WHERE u.id = $1`,
        [id, currentUser.id]
      );
      if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
      return res.json(result.rows[0]);
    }

    res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
