import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'حدث خطأ' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setPosts([]);
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <AppContext.Provider value={{ user, setUser, loading, posts, setPosts, notifications, setNotifications, unreadCount, theme, toggleTheme, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
