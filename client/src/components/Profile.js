import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../api';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useApp();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, postsRes] = await Promise.all([
          api.get(`/users/${userId}`),
          api.get('/posts')
        ]);
        setProfile(profileRes.data);
        setPosts(postsRes.data.filter(p => p.user_id === Number(userId) && p.image_url));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [userId]);

  const handleFollow = async () => {
    try {
      const res = await api.post('/users/follow', { targetId: Number(userId) });
      setProfile(prev => ({ ...prev, is_following: res.data.following }));
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!profile) return <div className="auth-container"><p>المستخدم غير موجود</p></div>;

  const isMe = currentUser?.id === Number(userId);

  return (
    <div>
      <div className="profile-header">
        <div className="avatar-placeholder large">{profile.full_name?.charAt(0).toUpperCase()}</div>
        <div className="profile-info">
          <h2>{profile.full_name}</h2>
          <p className="username">@{profile.username}</p>
          {profile.bio && <p className="bio">{profile.bio}</p>}
          <div className="stats">
            <span><strong>{profile.posts_count}</strong> منشور</span>
            <span><strong>{profile.followers_count}</strong> متابع</span>
            <span><strong>{profile.following_count}</strong> يتابع</span>
          </div>
          {!isMe && (
            <button className={`follow-btn ${profile.is_following ? 'following' : ''}`} onClick={handleFollow}>
              {profile.is_following ? 'إلغاء المتابعة' : 'متابعة'}
            </button>
          )}
        </div>
      </div>
      <div className="profile-posts">
        {posts.map(post => <img key={post.id} src={post.image_url} alt="post" />)}
      </div>
    </div>
  );
};
export default Profile;
