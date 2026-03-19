import React, { useState, useEffect } from 'react';
import api, { uploadFile } from '../api';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);

  useEffect(() => {
    api.get('/posts/stories').then(res => setStories(res.data)).catch(console.error);
  }, []);

  const handleAddStory = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const mediaUrl = await uploadFile(file, 'stories');
      await api.post('/stories/upload', { mediaUrl });
      alert('تم رفع القصة!');
    } catch (err) { console.error(err); }
  };

  return (
    <div className="stories">
      <div className="story-item story-add">
        <label style={{cursor:'pointer'}}>
          <div className="story-ring">+</div>
          <span>قصتك</span>
          <input type="file" accept="image/*,video/*" onChange={handleAddStory} style={{display:'none'}} />
        </label>
      </div>
      {stories.map(story => (
        <div key={story.id} className="story-item" onClick={() => setActiveStory(story)}>
          <div className="story-ring">
            {story.profile_picture
              ? <img src={story.profile_picture} alt={story.username} />
              : <div className="avatar-placeholder" style={{width:'100%',height:'100%',borderRadius:'50%'}}>{story.full_name?.charAt(0)}</div>
            }
          </div>
          <span>{story.username}</span>
        </div>
      ))}
      {activeStory && (
        <div className="comments-modal" onClick={() => setActiveStory(null)}>
          <div style={{maxWidth:'400px',borderRadius:'12px',overflow:'hidden'}} onClick={e => e.stopPropagation()}>
            <img src={activeStory.media_url} alt="story" style={{width:'100%'}} />
            <p style={{textAlign:'center',padding:'8px',background:'#fff'}}>{activeStory.username}</p>
          </div>
        </div>
      )}
    </div>
  );
};
export default Stories;
