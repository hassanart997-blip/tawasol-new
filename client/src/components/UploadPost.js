import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { uploadFile } from '../api';
import api from '../api';

const UploadPost = () => {
  const { user, setPosts } = useApp();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!content.trim() && !image) return;
    setLoading(true);
    try {
      let image_url = null;
      if (image) image_url = await uploadFile(image, 'posts');
      const res = await api.post('/posts', { content, image_url });
      setPosts(prev => [res.data, ...prev]);
      setContent(''); setImage(null); setPreview(null);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="upload-post">
      <div className="upload-header">
        <div className="avatar-placeholder small">{user?.full_name?.charAt(0).toUpperCase()}</div>
        <input type="text" placeholder="ما الجديد؟" value={content} onChange={e => setContent(e.target.value)} />
      </div>
      {preview && (
        <div className="image-preview">
          <img src={preview} alt="preview" />
          <button onClick={() => { setImage(null); setPreview(null); }}>✕</button>
        </div>
      )}
      <div className="upload-actions">
        <button onClick={() => fileRef.current.click()}>📷</button>
        <input type="file" ref={fileRef} style={{display:'none'}} onChange={handleImageChange} accept="image/*,video/*" />
        <button className="post-btn" onClick={handleSubmit} disabled={loading}>{loading ? 'نشر...' : 'نشر'}</button>
      </div>
    </div>
  );
};
export default UploadPost;
