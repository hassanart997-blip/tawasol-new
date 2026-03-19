import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/users/friends'), api.get('/users/suggestions')])
      .then(([f, s]) => { setFriends(f.data); setSuggestions(s.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleFollow = async (targetId) => {
    try {
      await api.post('/users/follow', { targetId });
      setFriends(prev => [...prev, suggestions.find(s => s.id === targetId)]);
      setSuggestions(prev => prev.filter(s => s.id !== targetId));
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div style={{padding:'1rem'}}>
      <h3>أصدقاؤك ({friends.length})</h3>
      {friends.map(f => (
        <Link key={f.id} to={`/profile/${f.id}`} style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 0',textDecoration:'none',color:'inherit'}}>
          <div className="avatar-placeholder">{f.full_name?.charAt(0).toUpperCase()}</div>
          <div><strong>{f.full_name}</strong><div style={{fontSize:'12px',color:'#8e8e8e'}}>@{f.username}</div></div>
        </Link>
      ))}
      <h3 style={{marginTop:'1.5rem'}}>اقتراحات</h3>
      {suggestions.map(s => (
        <div key={s.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 0',justifyContent:'space-between'}}>
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            <div className="avatar-placeholder">{s.full_name?.charAt(0).toUpperCase()}</div>
            <div><strong>{s.full_name}</strong><div style={{fontSize:'12px',color:'#8e8e8e'}}>@{s.username}</div></div>
          </div>
          <button onClick={() => handleFollow(s.id)} style={{background:'#0095f6',color:'#fff',border:'none',borderRadius:'8px',padding:'6px 16px',cursor:'pointer',fontWeight:'bold'}}>متابعة</button>
        </div>
      ))}
    </div>
  );
};
export default Friends;
