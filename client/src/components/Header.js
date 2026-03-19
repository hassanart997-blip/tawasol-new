import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FaSignOutAlt, FaBell, FaSun, FaMoon } from 'react-icons/fa';

const Header = ({ onNotificationClick }) => {
  const { logout, theme, toggleTheme, unreadCount } = useApp();
  return (
    <header className="app-header">
      <div className="logo">
        <Link to="/feed"><h1>تواصل</h1></Link>
      </div>
      <div className="header-actions">
        <button onClick={toggleTheme}>{theme === 'light' ? <FaMoon /> : <FaSun />}</button>
        <button onClick={onNotificationClick}>
          <FaBell />
          {unreadCount > 0 && <span className="badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>
        <button onClick={logout}><FaSignOutAlt /></button>
      </div>
    </header>
  );
};
export default Header;
