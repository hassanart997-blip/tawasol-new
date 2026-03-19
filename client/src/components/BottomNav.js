import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FaHome, FaSearch, FaUser, FaComments, FaVideo } from 'react-icons/fa';

const BottomNav = () => {
  const { user } = useApp();
  return (
    <nav className="bottom-nav">
      <NavLink to="/feed" className={({ isActive }) => isActive ? 'active' : ''}><FaHome /></NavLink>
      <NavLink to="/explore" className={({ isActive }) => isActive ? 'active' : ''}><FaSearch /></NavLink>
      <NavLink to="/reels" className={({ isActive }) => isActive ? 'active' : ''}><FaVideo /></NavLink>
      <NavLink to="/chat" className={({ isActive }) => isActive ? 'active' : ''}><FaComments /></NavLink>
      <NavLink to={`/profile/${user?.id}`} className={({ isActive }) => isActive ? 'active' : ''}><FaUser /></NavLink>
    </nav>
  );
};
export default BottomNav;
