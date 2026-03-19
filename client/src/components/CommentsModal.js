import React, { useState, useEffect } from 'react';
import api from '../api';

const CommentsModal = ({ postId, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/posts/${postId}`).then(res => setComments(res.data)).catch(console.error).finally(() => setLoading(false));
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/posts/${postId}`, { content: newComment });
      setComments(prev => [res.data, ...prev]);
      setNewComment('');
    } catch (err) { console.error(err); }
  };

  return (
    <div className="comments-modal" onClick={onClose}>
      <div className="comments-content" onClick={e => e.stopPropagation()}>
        <div className="comments-header">
          <h3>التعليقات</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="comments-list">
          {loading ? <div className="spinner" /> : comments.length === 0 ? (
            <p className="no-comments">لا توجد تعليقات</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="comment-item">
                <div className="comment-avatar">{c.full_name?.charAt(0).toUpperCase()}</div>
                <div className="comment-body"><strong>{c.username}</strong> {c.content}</div>
              </div>
            ))
          )}
        </div>
        <div className="add-comment">
          <input type="text" placeholder="أضف تعليقاً..." value={newComment} onChange={e => setNewComment(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddComment()} />
          <button onClick={handleAddComment}>نشر</button>
        </div>
      </div>
    </div>
  );
};
export default CommentsModal;
