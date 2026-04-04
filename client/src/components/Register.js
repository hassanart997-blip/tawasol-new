import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../api';

const Register = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', full_name: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('كلمتا المرور غير متطابقتين');
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', {
        username: form.username,
        email: form.email,
        full_name: form.full_name,
        password: form.password
      });
      localStorage.setItem('token', res.data.token);
      const loginRes = await login(form.email, form.password);
      if (loginRes.success) navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'حدث خطأ في التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>تواصل</h2>
      <p style={{textAlign:'center',color:'#8e8e8e',marginBottom:'1rem'}}>أنشئ حسابك وابدأ التواصل</p>
      <form onSubmit={handleSubmit}>
        <input name="full_name" placeholder="الاسم الكامل" value={form.full_name} onChange={handleChange} required />
        <input name="username" placeholder="اسم المستخدم" value={form.username} onChange={handleChange} required />
        <input name="email" type="email" placeholder="البريد الإلكتروني" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="كلمة المرور" value={form.password} onChange={handleChange} required />
        <input name="confirmPassword" type="password" placeholder="تأكيد كلمة المرور" value={form.confirmPassword} onChange={handleChange} required />
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={loading}>{loading ? 'جاري...' : 'إنشاء حساب'}</button>
      </form>
      <p className="auth-footer">لديك حساب؟ <Link to="/login">تسجيل الدخول</Link></p>
    </div>
  );
};
export default Register;
