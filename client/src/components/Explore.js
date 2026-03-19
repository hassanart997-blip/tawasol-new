import React, { useState, useEffect } from 'react';
import api from '../api';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/posts/explore').then(res => setPosts(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) return setResults([]);
    const t = setTimeout(() => {
      api.get(`/search?q=${search}`).then(res => setResults(res.data)).catch(console.error);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{padding:'1rem'}}>
        <input type="text" placeholder="🔍 ابحث عن مستخدمين..." value={search} onChange={e => setSearch(e.target.value)}
          style={{width:'100%',padding:'0.75rem',border:'1px solid #dbdbdb',borderRadius:'8px',fontSize:'14px',boxSizing:'border-box'}} />
        {results.length > 0 && (
          <div style={{background:'#fff',border:'1px solid #dbdbdb',borderRadius:'8px',marginTop:'4px'}}>
            {results.map(u => (
              <div key={u.id} style={{padding:'12px',display:'flex',gap:'10px',alignItems:'center'}}>
                <div className="avatar-placeholder small">{u.full_name?.charAt(0).toUpperCase()}</div>
                <div><strong>{u.full_name}</strong><div style={{fontSize:'12px',color:'#8e8e8e'}}>@{u.username}</div></div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="profile-posts">
        {posts.map(post => (
          <img key={post.id} src={post.image_url} alt={post.username} style={{width:'100%',aspectRatio:'1',objectFit:'cover'}} />
        ))}
      </div>
    </div>
  );
};
export default Explore;
