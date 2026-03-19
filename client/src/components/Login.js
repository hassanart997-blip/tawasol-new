import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Login = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await login(email, password);
    if (res.success) navigate('/feed');
    else setError(res.error);
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>تواصل</h2>
      <p style={{textAlign:'center',color:'#8e8e8e',marginBottom:'1rem'}}>سجل دخولك وابدأ التواصل</p>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={loading}>{loading ? 'جاري...' : 'دخول'}</button>
      </form>
      <p className="auth-footer">ليس لديك حساب؟ <Link to="/register">سجل الآن</Link></p>
    </div>
  );
};
export default Login;
