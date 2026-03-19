import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import api from '../api';

const Notifications = ({ onClose }) => {
  const { notifications, setNotifications } = useApp();

  useEffect(() => {
    api.get('/notifications').then(res => setNotifications(res.data)).catch(console.error);
  }, [setNotifications]);

  return (
    <div className="notifications-panel">
      <div className="notifications-header">
        <h3>الإشعارات</h3>
        <button onClick={onClose}>✕</button>
      </div>
      <div className="notifications-list">
        {notifications.length === 0 ? <p className="empty">لا توجد إشعارات</p> : (
          notifications.map(n => (
            <div key={n.id} className="notification-item">
              {n.type === 'like' && `❤️ ${n.full_name} أعجب بمنشورك`}
              {n.type === 'follow' && `👤 ${n.full_name} بدأ متابعتك`}
              {n.type === 'comment' && `💬 ${n.full_name} علّق على منشورك`}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default Notifications;
