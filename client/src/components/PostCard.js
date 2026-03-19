import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../api';
import { FaHeart, FaRegHeart, FaComment, FaShare } from 'react-icons/fa';
import CommentsModal from './CommentsModal';

const PostCard = ({ post }) => {
  const { user } = useApp();
  const [liked, setLiked] = useState(post.liked);
  const [likesCount, setLikesCount] = useState(Number(post.likes_count) || 0);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    try {
      const res = await api.post('/posts/like', { postId: post.id });
      setLiked(res.data.liked);
      setLikesCount(prev => res.data.liked ? prev + 1 : prev - 1);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <Link to={`/profile/${post.user_id}`} className="post-author">
          <div className="avatar-placeholder small">{post.full_name?.charAt(0).toUpperCase()}</div>
          <span className="post-username">{post.username}</span>
        </Link>
      </div>
      {post.image_url && <img src={post.image_url} alt="post" className="post-image" />}
      {post.video_url && <video src={post.video_url} controls className="post-video" />}
      <div className="post-actions">
        <button onClick={handleLike} className="like-btn">
          {liked ? <FaHeart color="#ed4956" /> : <FaRegHeart />}
          <span>{likesCount}</span>
        </button>
        <button onClick={() => setShowComments(true)}><FaComment /></button>
        <button><FaShare /></button>
      </div>
      {post.content && <div className="post-content"><strong>{post.username}</strong> {post.content}</div>}
      {showComments && <CommentsModal postId={post.id} onClose={() => setShowComments(false)} />}
    </div>
  );
};
export default PostCard;
