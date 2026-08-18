import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocaleProvider } from './contexts/LocaleContext';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { PublicLayout } from './components/public/PublicLayout';
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
import UserMarketplace from './components/user-marketplace/UserMarketplace';
import StoreDetailPage from './components/user-store-detail/userStoreDetail';
import UserNews from './components/user-news/UserNews';
import UserNewsDetail from './components/user-news-detail/UserNewsDetail';
import ContactUs from './components/contact-us/contactUs.jsx';
import { Home } from './components/home/Home';


export type UserRole = 'Admin' | 'content-manager' | 'community-manager' | 'moderator';

const publicRoutePrefixes = [
  '/home',
  '/login',
  '/register',
  '/aboutus',
  '/user-event',
  '/user-events',
  '/user-tracks',
  '/user-challenges',
  '/user-communities',
  '/user-adcc-store',
  '/user-store-detail',
  '/user-marketplace',
  '/user-news',
  '/contact-us',
];

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const pathname = normalizePathname(location.pathname);
  const isPublicRoute = publicRoutePrefixes.some(
    (route) => pathname === route || (route !== '/' && pathname.startsWith(`${route}/`)),
  );

  // Redirect to login when user becomes unauthenticated
  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicRoute) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isPublicRoute, loading, navigate]);

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

  const publicPage = (element: React.ReactNode) => (
    <PublicLayout>
      {element}
    </PublicLayout>
  );

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
            publicPage(
              <Register
                onSwitchToLogin={() => navigate('/login')}
                onRegisterSuccess={() => navigate('/dashboard')}
              />,
            )
          )
        } 
      />
      <Route path="/aboutus/*" element={publicPage(<AboutUs />)} />
      <Route path="/user-event" element={publicPage(<UserEvent />)} />
      <Route
        path="/user-event/:eventId"
        element={publicPage(<CommunitiesAbuDhabiGrandPrixRide />)}
      />
      <Route path="/user-events/*" element={publicPage(<UserEvent />)} />
      <Route path="/user-tracks" element={publicPage(<UserTracks />)} />
      <Route
        path="/user-tracks/:trackId"
        element={publicPage(<CommunitiesAlQuadraCyclePath />)}
      />
      <Route path="/user-challenges" element={publicPage(<UserChallenges />)} />
      <Route
        path="/user-challenges/:challengeId"
        element={publicPage(<CommunitiesMarchDistanceChallenge />)}
      />
      <Route path="/user-communities" element={publicPage(<UserCommunities />)} />
      <Route
        path="/user-communities/:communityId"
        element={publicPage(<CommunitiesAbuDhabiCyclingCommunity />)}
      />
      <Route path="/user-adcc-store/*" element={publicPage(<UserAdccStore />)} />
      <Route path="/user-marketplace" element={publicPage(<UserMarketplace />)} />
      <Route path="/user-marketplace/:id" element={publicPage(<StoreDetailPage />)} />
      <Route path="/user-news" element={publicPage(<UserNews />)} />
      <Route path="/user-news/:id" element={publicPage(<UserNewsDetail />)} />
      <Route path="/user-store-detail/*" element={publicPage(<StoreDetailPage />)} />

      <Route path="/contact-us/*" element={publicPage(<ContactUs />)} />

      <Route path="/home/*" element={publicPage(<Home />)} />
      
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
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/home"} replace />} 
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
