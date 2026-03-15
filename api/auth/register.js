const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
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
    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') res.status(400).json({ error: 'اسم المستخدم أو البريد الإلكتروني موجود مسبقاً' });
    else res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
};
