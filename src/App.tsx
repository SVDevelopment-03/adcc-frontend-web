import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocaleProvider } from './contexts/LocaleContext';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/Layout';
import AboutUs from './components/about/AboutUs';
import UserEvent from './components/user-event/UserEvent';
import UserTracks from './components/user-tracks/UserTracks';
import UserChallenges from './components/user-challenges/UserChallenges';
import UserCommunities from './components/user-communities/UserCommunities';
import CommunitiesAbuDhabiGrandPrixRide from './components/communities-abu-dhabi-grand-prix-ride/CommunitiesAbuDhabiGrandPrixRide';
import CommunitiesAbuDhabiCyclingCommunity from './components/communities-abu-dhabi-cycling-community/CommunitiesAbuDhabiCyclingCommunity';
import CommunitiesAlQuadraCyclePath from './components/communities-al-quadra-cycle-path/CommunitiesAlQuadraCyclePath';
import CommunitiesMarchDistanceChallenge from './components/communities-march-distance-challenge/CommunitiesMarchDistanceChallenge';
import UserAdccStore from './components/user-adcc-store/UserAdccStore';
import StoreDetailPage from './components/user-store-detail/userStoreDetail';
import ContactUs from './components/contact-us/contactUs.jsx';
import { Home } from './components/home/Home';


export type UserRole = 'Admin' | 'content-manager' | 'community-manager' | 'moderator';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const publicRoutes = [
    '/home',
    '/login',
    '/register',
    '/aboutus',
    '/user-event',
    '/user-tracks',
    '/user-challenges',
    '/user-communities',
    '/communities-abu-dhabi-grand-prix-ride',
    '/communities-abu-dhabi-cycling-community',
    '/communities-al-quadra-cycle-path',
    '/communities-march-distance-challenge',
    '/user-adcc-store',
    '/user-store-detail',
    '/contact-us',
  ];

  // Redirect to login when user becomes unauthenticated
  useEffect(() => {
    if (!loading && !isAuthenticated && !publicRoutes.includes(location.pathname)) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#C12D32' }}></div>
          <p style={{ color: '#666' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login 
              onSwitchToRegister={() => navigate('/register')} 
              onLoginSuccess={() => navigate('/dashboard')} 
            />
          )
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Register 
              onSwitchToLogin={() => navigate('/login')} 
              onRegisterSuccess={() => navigate('/dashboard')} 
            />
          )
        } 
      />
      <Route path="/aboutus" element={<AboutUs />} />
      <Route path="/user-event" element={<UserEvent />} />
      <Route path="/user-tracks" element={<UserTracks />} />
      <Route path="/user-challenges" element={<UserChallenges />} />
      <Route path="/user-communities" element={<UserCommunities />} />
      <Route
        path="/communities-abu-dhabi-grand-prix-ride"
        element={<CommunitiesAbuDhabiGrandPrixRide />}
      />
      <Route
        path="/communities-abu-dhabi-cycling-community"
        element={<CommunitiesAbuDhabiCyclingCommunity />}
      />
      <Route
        path="/communities-al-quadra-cycle-path"
        element={<CommunitiesAlQuadraCyclePath />}
      />
      <Route
        path="/communities-march-distance-challenge"
        element={<CommunitiesMarchDistanceChallenge />}
      />
      <Route path="/user-adcc-store" element={<UserAdccStore />} />
      <Route path="/user-store-detail" element={<StoreDetailPage/>} />

      <Route path="/contact-us" element={<ContactUs />} />

      <Route path="/home" element={<Home />} />
      
      {/* Protected Routes - All routes are handled in Layout component */}
      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        } 
      />
      
      {/* Root redirect */}
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <LocaleProvider>
          <AppContent />
          <Toaster position="top-right" />
        </LocaleProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
