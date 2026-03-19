const pool = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  const path = req.url.replace('/api/auth', '').split('?')[0];

  if (path === '/register' && req.method === 'POST') {
    const { username, email, full_name, password } = req.body;
    if (!username || !email || !full_name || !password) return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        `INSERT INTO users (username, email, full_name, password) VALUES ($1, $2, $3, $4) RETURNING id, username, email, full_name`,
        [username, email, full_name, hashedPassword]
      );
      const user = result.rows[0];
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ user, token });
    } catch (err) {
      if (err.code === '23505') return res.status(400).json({ error: 'اسم المستخدم أو البريد الإلكتروني موجود مسبقاً' });
      return res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
  }

  if (path === '/login' && req.method === 'POST') {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];
      if (!user) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
      delete user.password;
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({ user, token });
    } catch (err) {
      return res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
  }

  if (path === '/me' && req.method === 'GET') {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const result = await pool.query(
        'SELECT id, username, email, full_name, bio, profile_picture FROM users WHERE id = $1',
        [decoded.id]
      );
      if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
      return res.json(result.rows[0]);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  res.status(404).json({ error: 'Not found' });
};
