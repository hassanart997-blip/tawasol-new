import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import api from '../api';
import Stories from './Stories';
import UploadPost from './UploadPost';
import PostCard from './PostCard';

const Feed = () => {
  const { posts, setPosts } = useApp();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/posts').then(res => setPosts(res.data)).catch(console.error).finally(() => setLoading(false));
  }, [setPosts]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="feed">
      <Stories />
      <UploadPost />
      {posts.length === 0 ? (
        <p style={{textAlign:'center',color:'#8e8e8e',padding:'2rem'}}>لا توجد منشورات بعد</p>
      ) : (
        posts.map(post => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
};
export default Feed;
