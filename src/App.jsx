import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Watchlist from './pages/Watchlist';
import PostDetail from './pages/PostDetail';
import EditProfile from './pages/EditProfile';
import Layout from './components/Layout';
import './App.css';
import Connections from './pages/Connections';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  return !user ? children : <Navigate to="/feed" />;
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a2e', color: '#e8e8ff', border: '1px solid #7c3aed' } }} />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/feed" />} />
          <Route path="feed" element={<Feed />} />
          <Route path="connections" element={<Connections />} />
          <Route path="profile/:id" element={<Profile />} />
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="watchlist" element={<Watchlist />} />
          <Route path="post/:id" element={<PostDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;