import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocaleProvider } from './contexts/LocaleContext';
import { Login } from './components/auth/Login';
import ForgotPassword from './components/auth/ForgotPassword';
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
import MerchandiseDetailPage from './components/user-adcc-store/MerchandiseDetailPage';
import UserMarketplace from './components/user-marketplace/UserMarketplace';
import StoreDetailPage from './components/user-store-detail/userStoreDetail';
import UserNews from './components/user-news/UserNews';
import UserNewsDetail from './components/user-news-detail/UserNewsDetail';
import ContactUs from './components/contact-us/contactUs.jsx';
import PrivacyPolicy from './components/privacy-policy/PrivacyPolicy';
import { Home } from './components/home/Home';


// Keeps old /user-* links working by swapping the prefix and preserving the rest.
function LegacyRedirect({ from, to }: { from: string; to: string }) {
  const location = useLocation();
  const rest = location.pathname.slice(from.length);
  return <Navigate to={`${to}${rest}${location.search}${location.hash}`} replace />;
}

export type UserRole = 'Admin' | 'content-manager' | 'community-manager' | 'moderator';

const publicRoutePrefixes = [
  '/home',
  '/login',
  '/forgot',
  '/register',
  '/aboutus',
  '/events',
  '/tracks',
  '/challenges',
  '/communities',
  // Legacy prefixes, kept so their redirects render for visitors.
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
  '/privacy-policy',
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
  const isPublicRoute =
    pathname === '/' ||
    publicRoutePrefixes.some(
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
              onSwitchToForgot={() => navigate('/forgot')}
            />
          )
        } 
      />
      <Route
        path="/forgot"
        element={
          publicPage(
            <ForgotPassword onDone={() => navigate('/login')} />
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
      {/* Legacy /user-* URLs redirect to the new public paths. */}
      <Route path="/user-event/*" element={<LegacyRedirect from="/user-event" to="/events" />} />
      <Route path="/user-events/*" element={<LegacyRedirect from="/user-events" to="/events" />} />
      <Route path="/user-tracks/*" element={<LegacyRedirect from="/user-tracks" to="/tracks" />} />
      <Route path="/user-challenges/*" element={<LegacyRedirect from="/user-challenges" to="/challenges" />} />
      <Route path="/user-communities/*" element={<LegacyRedirect from="/user-communities" to="/communities" />} />
      {/* These paths are shared with the admin panel: visitors get the public
          pages, signed-in users fall through to the Layout routes below. */}
      {!isAuthenticated && (
        <>
          <Route path="/events" element={publicPage(<UserEvent />)} />
          <Route
            path="/events/:eventId"
            element={publicPage(<CommunitiesAbuDhabiGrandPrixRide />)}
          />
          <Route path="/tracks" element={publicPage(<UserTracks />)} />
          <Route
            path="/tracks/:trackId"
            element={publicPage(<CommunitiesAlQuadraCyclePath />)}
          />
          <Route path="/challenges" element={publicPage(<UserChallenges />)} />
          <Route
            path="/challenges/:challengeId"
            element={publicPage(<CommunitiesMarchDistanceChallenge />)}
          />
          <Route path="/communities" element={publicPage(<UserCommunities />)} />
          <Route
            path="/communities/:communityId"
            element={publicPage(<CommunitiesAbuDhabiCyclingCommunity />)}
          />
        </>
      )}
      <Route path="/user-adcc-store/product/:id" element={publicPage(<MerchandiseDetailPage />)} />
      <Route path="/user-adcc-store/*" element={publicPage(<UserAdccStore />)} />
      <Route path="/user-marketplace" element={publicPage(<UserMarketplace />)} />
      <Route path="/user-marketplace/:id" element={publicPage(<StoreDetailPage />)} />
      <Route path="/user-news" element={publicPage(<UserNews />)} />
      <Route path="/user-news/:id" element={publicPage(<UserNewsDetail />)} />
      <Route path="/user-store-detail/*" element={publicPage(<StoreDetailPage />)} />

      <Route path="/contact-us/*" element={publicPage(<ContactUs />)} />
      <Route path="/privacy-policy/*" element={publicPage(<PrivacyPolicy />)} />

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
      
      {/* Root - show Home page by default (no redirect) */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : publicPage(<Home />)}
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
