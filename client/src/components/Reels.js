import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaHeart, FaRegHeart, FaComment, FaShare } from 'react-icons/fa';

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/posts/reels').then(res => setReels(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleLike = async (postId) => {
    try {
      const res = await api.post('/posts/like', { postId });
      setReels(prev => prev.map(r => r.id === postId ? { ...r, liked: res.data.liked, likes_count: (Number(r.likes_count)||0) + (res.data.liked?1:-1) } : r));
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (reels.length === 0) return <p style={{textAlign:'center',color:'#8e8e8e',padding:'2rem'}}>لا توجد ريلز بعد</p>;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'0',scrollSnapType:'y mandatory',overflowY:'auto',height:'calc(100vh - 130px)'}}>
      {reels.map(reel => (
        <div key={reel.id} style={{position:'relative',minHeight:'100%',scrollSnapAlign:'start',background:'#000'}}>
          <video src={reel.video_url} loop autoPlay muted style={{width:'100%',height:'100%',objectFit:'cover'}} />
          <div style={{position:'absolute',bottom:'1rem',right:'1rem',color:'#fff'}}>
            <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'4px'}}>
              <div className="avatar-placeholder small">{reel.full_name?.charAt(0).toUpperCase()}</div>
              <strong>{reel.username}</strong>
            </div>
          </div>
          <div style={{position:'absolute',bottom:'1rem',left:'1rem',display:'flex',flexDirection:'column',gap:'16px',alignItems:'center'}}>
            <button onClick={() => handleLike(reel.id)} style={{background:'none',border:'none',color:'#fff',display:'flex',flexDirection:'column',alignItems:'center',cursor:'pointer'}}>
              {reel.liked ? <FaHeart color="#ed4956" size={28} /> : <FaRegHeart size={28} />}
              <span style={{fontSize:'12px'}}>{reel.likes_count||0}</span>
            </button>
            <button style={{background:'none',border:'none',color:'#fff',cursor:'pointer'}}><FaComment size={28} /></button>
            <button style={{background:'none',border:'none',color:'#fff',cursor:'pointer'}}><FaShare size={28} /></button>
          </div>
        </div>
      ))}
    </div>
  );
};
export default Reels;
