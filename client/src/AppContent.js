import React, { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Notifications from './components/Notifications';

const Feed = lazy(() => import('./components/Feed'));
const Profile = lazy(() => import('./components/Profile'));
const Chat = lazy(() => import('./components/Chat'));
const Friends = lazy(() => import('./components/Friends'));
const Explore = lazy(() => import('./components/Explore'));
const Reels = lazy(() => import('./components/Reels'));
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));

const Spinner = () => <div className="loading-screen"><div className="spinner" /></div>;

function AppContent() {
  const { user, loading, theme } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  if (loading) return <Spinner />;

  return (
    <div className={`app-container theme-${theme}`} data-theme={theme}>
      {user ? (
        <>
          <Header onNotificationClick={() => setShowNotifications(true)} />
          {showNotifications && <Notifications onClose={() => setShowNotifications(false)} />}
          <main className="main-content">
            <Suspense fallback={<Spinner />}>
              <Routes>
                <Route path="/" element={<Navigate to="/feed" replace />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/reels" element={<Reels />} />
                <Route path="*" element={<Navigate to="/feed" replace />} />
              </Routes>
            </Suspense>
          </main>
          <BottomNav />
        </>
      ) : (
        <div className="auth-wrapper">
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </div>
      )}
    </div>
  );
}

export default AppContent;
