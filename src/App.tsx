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
import { ComingSoonPopup } from './components/public/ComingSoonPopup';
import AboutUs from './components/about/AboutUs';
import UserEvent from './components/user-event/UserEvent';
import UserTracks from './components/user-tracks/UserTracks';
import UserChallenges from './components/user-challenges/UserChallenges';
import UserCommunities from './components/user-communities/UserCommunities';
import CommunitiesAbuDhabiGrandPrixRide, { InternalEventRegisterPage } from './components/communities-abu-dhabi-grand-prix-ride/CommunitiesAbuDhabiGrandPrixRide';
import CommunitiesAbuDhabiCyclingCommunity from './components/communities-abu-dhabi-cycling-community/CommunitiesAbuDhabiCyclingCommunity';
import CommunitiesAlQuadraCyclePath from './components/communities-al-quadra-cycle-path/CommunitiesAlQuadraCyclePath';
import CommunitiesMarchDistanceChallenge from './components/communities-march-distance-challenge/CommunitiesMarchDistanceChallenge';
import UserAdccStore from './components/user-adcc-store/UserAdccStore';
import MerchandiseDetailPage from './components/user-adcc-store/MerchandiseDetailPage';
import { STORE_LAUNCHED } from './components/user-adcc-store/storeConfig';
import StoreComingSoon from './components/user-adcc-store/StoreComingSoon';
import UserMarketplace from './components/user-marketplace/UserMarketplace';
import StoreDetailPage from './components/user-store-detail/userStoreDetail';
import UserNews from './components/user-news/UserNews';
import UserNewsDetail from './components/user-news-detail/UserNewsDetail';
import ContactUs from './components/contact-us/contactUs.jsx';
import PrivacyPolicy from './components/privacy-policy/PrivacyPolicy';
import LaffahRideRegistration from './components/laffah-ride-registration/LaffahRideRegistration';
import { Home } from './components/home/Home';
import CustomPage from './components/public/CustomPage';
import { SiteRoutingProvider, useSiteRouting } from './contexts/SiteRoutingContext';
import { isAdminPath, isExternalUrl, publicPathsOf, resolveRedirect } from './services/siteRouting';
import { PublicNotFound } from './components/public/PublicNotFound';


// Keeps old /user-* links working by swapping the prefix and preserving the rest.
function LegacyRedirect({ from, to }: { from: string; to: string }) {
  const location = useLocation();
  const rest = location.pathname.slice(from.length);
  return <Navigate to={`${to}${rest}${location.search}${location.hash}`} replace />;
}

export type UserRole = 'Admin' | 'content-manager' | 'community-manager' | 'moderator';

// Fixed public paths; page URLs, custom pages and redirects managed in the
// dashboard (Pages) are added from the site routing.
const fixedPublicPrefixes = [
  '/home',
  '/login',
  '/forgot',
  '/register',
  // Legacy prefixes, kept so their redirects render for visitors.
  '/user-event',
  '/user-events',
  '/user-tracks',
  '/user-challenges',
  '/user-communities',
  '/user-store-detail',
];

// Public pages that look the same whether or not someone is signed in, so
// they can render straight away instead of waiting for the sign-in check.
const authIndependentPageIds = ['about', 'store', 'marketplace', 'news', 'contact', 'privacy', 'laffah'] as const;

const matchesPrefix = (pathname: string, route: string) =>
  pathname === route || (route !== '/' && pathname.startsWith(`${route}/`));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#C12D32' }}></div>
    </div>
  );
}

/** Sends the visitor to an external redirect target. */
function ExternalRedirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);
  return <PageLoader />;
}

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const { routing, ready: routingReady } = useSiteRouting();
  const paths = routing.pages;
  const pathname = normalizePathname(location.pathname);
  const lowerPath = pathname.toLowerCase();
  const publicRoutePrefixes = [...fixedPublicPrefixes, ...publicPathsOf(routing)];
  const authIndependentPrefixes = [
    '/home',
    '/user-store-detail',
    ...authIndependentPageIds.map((id) => paths[id]),
    ...routing.customPages,
  ];
  const isPublicRoute = pathname === '/' || publicRoutePrefixes.some((route) => matchesPrefix(lowerPath, route));

  // Dashboard redirects (Pages → Redirects, changed page URLs). Paths the
  // dashboard also uses wait for the sign-in check: staff get the dashboard.
  const redirectTarget =
    routingReady && !(loading && isAdminPath(pathname))
      ? resolveRedirect(pathname, routing, isAuthenticated)
      : null;

  // A visitor on a URL that is neither a site page nor a dashboard address
  // (an old or mistyped link) gets the public 404 page, not the staff login.
  const isUnknownPublicPath = !isAuthenticated && !isPublicRoute && !isAdminPath(pathname);

  // Redirect to login when user becomes unauthenticated. Waits for the site
  // routing so custom page URLs and redirect sources count as public.
  useEffect(() => {
    if (routingReady && !loading && !isAuthenticated && !isPublicRoute && !isUnknownPublicPath && !redirectTarget) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isPublicRoute, isUnknownPublicPath, loading, navigate, routingReady, redirectTarget]);

  const isAuthIndependentRoute = authIndependentPrefixes.some((route) => matchesPrefix(lowerPath, route));

  if (!routingReady) return <PageLoader />;
  if (redirectTarget) {
    return isExternalUrl(redirectTarget) ? (
      <ExternalRedirect to={redirectTarget} />
    ) : (
      <Navigate to={`${redirectTarget}${location.search}${location.hash}`} replace />
    );
  }

  if (loading && !isAuthIndependentRoute) {
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
      <Route path={`${paths.about}/*`} element={publicPage(<AboutUs />)} />
      {/* Legacy /user-* URLs redirect to the new public paths. */}
      <Route path="/user-event/*" element={<LegacyRedirect from="/user-event" to="/events" />} />
      <Route path="/user-events/*" element={<LegacyRedirect from="/user-events" to="/events" />} />
      <Route path="/user-tracks/*" element={<LegacyRedirect from="/user-tracks" to="/tracks" />} />
      <Route path="/user-challenges/*" element={<LegacyRedirect from="/user-challenges" to="/challenges" />} />
      <Route path="/user-communities/*" element={<LegacyRedirect from="/user-communities" to="/communities" />} />
      {/* Internal event registration form; no admin page uses this path */}
      <Route path={`${paths.events}/:eventId/register`} element={publicPage(<InternalEventRegisterPage />)} />
      {/* These paths are shared with the admin panel: visitors get the public
          pages, signed-in users fall through to the Layout routes below. */}
      {!isAuthenticated && (
        <>
          <Route path={paths.events} element={publicPage(<UserEvent />)} />
          <Route
            path={`${paths.events}/:eventId`}
            element={publicPage(<CommunitiesAbuDhabiGrandPrixRide />)}
          />
          <Route path={paths.tracks} element={publicPage(<UserTracks />)} />
          <Route
            path={`${paths.tracks}/:trackId`}
            element={publicPage(<CommunitiesAlQuadraCyclePath />)}
          />
          <Route path={paths.challenges} element={publicPage(<UserChallenges />)} />
          <Route
            path={`${paths.challenges}/:challengeId`}
            element={publicPage(<CommunitiesMarchDistanceChallenge />)}
          />
          <Route path={paths.communities} element={publicPage(<UserCommunities />)} />
          <Route
            path={`${paths.communities}/:communityId`}
            element={publicPage(<CommunitiesAbuDhabiCyclingCommunity />)}
          />
        </>
      )}
      <Route
        path={`${paths.store}/product/:id`}
        element={STORE_LAUNCHED ? publicPage(<MerchandiseDetailPage />) : <Navigate to={paths.store} replace />}
      />
      <Route
        path={`${paths.store}/*`}
        element={publicPage(STORE_LAUNCHED ? <UserAdccStore /> : <StoreComingSoon />)}
      />
      {/* Marketplace and News may share their URL with a dashboard section. */}
      {(!isAuthenticated || !isAdminPath(paths.marketplace)) && (
        <>
          <Route path={paths.marketplace} element={publicPage(<UserMarketplace />)} />
          <Route path={`${paths.marketplace}/:id`} element={publicPage(<StoreDetailPage />)} />
        </>
      )}
      {(!isAuthenticated || !isAdminPath(paths.news)) && (
        <>
          <Route path={paths.news} element={publicPage(<UserNews />)} />
          <Route path={`${paths.news}/:id`} element={publicPage(<UserNewsDetail />)} />
        </>
      )}
      <Route path="/user-store-detail/*" element={publicPage(<StoreDetailPage />)} />

      <Route path={`${paths.contact}/*`} element={publicPage(<ContactUs />)} />
      <Route path={`${paths.privacy}/*`} element={publicPage(<PrivacyPolicy />)} />
      <Route path={`${paths.laffah}/*`} element={publicPage(<LaffahRideRegistration />)} />

      {/* Pages built in the dashboard (Pages → New page). */}
      {routing.customPages.map((slug) => (
        <Route key={slug} path={slug} element={publicPage(<CustomPage key={slug} slug={slug} />)} />
      ))}

      <Route path="/home/*" element={publicPage(<Home />)} />
      
      {/* Protected Routes - All routes are handled in Layout component */}
      <Route 
        path="/*" 
        element={
          isUnknownPublicPath && !loading ? (
            publicPage(<PublicNotFound />)
          ) : (
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          )
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
          <SiteRoutingProvider>
            <AppContent />
          </SiteRoutingProvider>
          <Toaster position="top-right" />
          <ComingSoonPopup />
        </LocaleProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
