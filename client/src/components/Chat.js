import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import api from '../api';

const Chat = () => {
  const { user } = useApp();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const messagesEndRef = useRef();

  useEffect(() => {
    api.get('/users/friends').then(res => setFriends(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedFriend) return;
    api.get('/messages').then(res => {
      const filtered = res.data.filter(m =>
        (m.sender_id === user.id && m.receiver_id === selectedFriend.id) ||
        (m.sender_id === selectedFriend.id && m.receiver_id === user.id)
      );
      setMessages(filtered);
    }).catch(console.error);
  }, [selectedFriend, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend) return;
    try {
      const res = await api.post('/messages', { receiver_id: selectedFriend.id, content: newMessage });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{display:'flex',height:'calc(100vh - 130px)',overflow:'hidden'}}>
      <div style={{width:'80px',borderLeft:'1px solid #dbdbdb',overflowY:'auto',padding:'8px 0'}}>
        {friends.map(f => (
          <div key={f.id} onClick={() => setSelectedFriend(f)}
            style={{padding:'8px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',background:selectedFriend?.id===f.id?'#efefef':'transparent'}}>
            <div className="avatar-placeholder small">{f.full_name?.charAt(0).toUpperCase()}</div>
            <span style={{fontSize:'10px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',width:'100%',textAlign:'center'}}>{f.username}</span>
          </div>
        ))}
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column'}}>
        {!selectedFriend ? (
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'#8e8e8e'}}>اختر صديقاً للمحادثة</div>
        ) : (
          <>
            <div style={{padding:'12px',borderBottom:'1px solid #dbdbdb',display:'flex',alignItems:'center',gap:'8px'}}>
              <div className="avatar-placeholder small">{selectedFriend.full_name?.charAt(0).toUpperCase()}</div>
              <strong>{selectedFriend.full_name}</strong>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:'1rem',display:'flex',flexDirection:'column',gap:'8px'}}>
              {messages.map(msg => (
                <div key={msg.id} style={{display:'flex',justifyContent:msg.sender_id===user.id?'flex-start':'flex-end'}}>
                  <div style={{background:msg.sender_id===user.id?'#0095f6':'#efefef',color:msg.sender_id===user.id?'#fff':'#262626',padding:'8px 12px',borderRadius:'18px',maxWidth:'70%',fontSize:'14px'}}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={{padding:'12px',borderTop:'1px solid #dbdbdb',display:'flex',gap:'8px'}}>
              <input type="text" placeholder="اكتب رسالة..." value={newMessage} onChange={e => setNewMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                style={{flex:1,padding:'8px 12px',border:'1px solid #dbdbdb',borderRadius:'20px',fontSize:'14px',background:'transparent'}} />
              <button onClick={sendMessage} style={{background:'#0095f6',color:'#fff',border:'none',borderRadius:'20px',padding:'8px 16px',cursor:'pointer',fontWeight:'bold'}}>إرسال</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default Chat;
