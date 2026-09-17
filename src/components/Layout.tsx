import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { UserRole } from '../App';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SuperAdminDashboard } from './dashboard/SuperAdminDashboard';
import { ContentManagerDashboard } from './dashboard/ContentManagerDashboard';
import { CommunityManagerDashboard } from './dashboard/CommunityManagerDashboard';
import { ModeratorDashboard } from './dashboard/ModeratorDashboard';
import { EventsList } from './events/EventsList';
import { EventCreate } from './events/EventCreate';
import { EventDetail } from './events/EventDetail';
import { EventParticipants } from './events/EventParticipants';
import { EventResults } from './events/EventResults';
import { EventEdit } from './events/EventEdit';
import { StaticDataManager } from './lookups/StaticDataManager';
import { CommunitiesList } from './communities/CommunitiesList';
import { CommunityCreate } from './communities/CommunityCreate';
import { CommunityDetail } from './communities/CommunityDetail';
import { CommunityEdit } from './communities/CommunityEdit';
import { TracksList } from './tracks/TracksList';
import { TrackCreate } from './tracks/TrackCreate';
import { TrackDetail } from './tracks/TrackDetail';
import { TrackEdit } from './tracks/TrackEdit';
import { ChallengesList } from './challenges/ChallengesList';
import { ChallengeDetail } from './challenges/ChallengeDetail';
import { ChallengeCreate } from './challenges/ChallengeCreate';
import { FeedModeration } from './feed/FeedModeration';
import { MarketplaceModeration } from './marketplace/MarketplaceModeration';
import { Merchandise } from './merchandise/Merchandise';
import { MarketplaceItemEdit } from './marketplace/MarketplaceItemEdit';
import { CMS } from './cms/CMS';
import { MediaLibrary } from './media/MediaLibrary';
import { PushNotifications } from './push/PushNotifications';
import { NewsList } from './news/NewsList';
import { NewsCreate } from './news/NewsCreate';
import { NewsEdit } from './news/NewsEdit';
import { UsersList } from './users/UsersList';
import { UserCreate } from './users/UserCreate';
import { AdminsList } from './users/AdminsList';
import { AdminCreate } from './users/AdminCreate';
import { AdminEdit } from './users/AdminEdit';
import { Reports } from './reports/Reports';
import { ContactMessagesList } from './contact-messages/ContactMessagesList';
import { NewsletterSubscribersList } from './newsletter/NewsletterSubscribersList';
import { AppConfig } from './config/AppConfig';
import { RolesPermissions } from './roles/RolesPermissions';
import { RoleCreate } from './roles/RoleCreate';
import { RoleEdit } from './roles/RoleEdit';
import { RoleDetail } from './roles/RoleDetail';
import { BadgesList } from './badges/BadgesList';
import { BadgesCreate } from './badges/BadgesCreate';
import { LanguagesList } from './languages/LanguagesList';
import { AdminNotificationsPage } from './notifications/AdminNotificationsPage';
import { ProductBannersArAdmin } from './admin/ProductBannersArAdmin';
import { AuditLog } from './audit-log/AuditLog';
import { getMyPermissions, getMyRbac, getRoleById, type RbacRole } from '../services/rbacService';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import {
  createPermissionChecker,
  getDefaultRouteForPermissions,
  permissionKeysFromRole,
  SIDEBAR_ITEM_PERMISSION,
  type SidebarItemId,
} from '../rbac/rbacKeys';

function normalizeRoleSlug(input: string): string {
  return input.trim().toLowerCase().replace(/[\s_]+/g, '-');
}

function slugToUserRole(slug: string | undefined): UserRole | null {
  if (!slug) return null;
  const s = normalizeRoleSlug(slug);
  const aliases: Record<string, UserRole> = {
    'super-admin': 'Admin',
    superadmin: 'Admin',
    admin: 'Admin',
    'content-manager': 'content-manager',
    'contentent-manager': 'content-manager',
    contentmanager: 'content-manager',
    content: 'content-manager',
    'community-manager': 'community-manager',
    communitymanager: 'community-manager',
    community: 'community-manager',
    moderator: 'moderator',
    moderate: 'moderator',
  };
  if (aliases[s]) return aliases[s];
  const keys: UserRole[] = ['Admin', 'content-manager', 'community-manager', 'moderator'];
  if (keys.includes(s as UserRole)) return s as UserRole;
  return null;
}

export function Layout() {
  const { userProfile } = useAuth();
  const [currentRole, setCurrentRole] = useState<UserRole>('moderator');
  const [myRole, setMyRole] = useState<Partial<RbacRole> | undefined>(undefined);
  const [permissionSet, setPermissionSet] = useState<Set<string>>(new Set<string>());
  const [rbacLoaded, setRbacLoaded] = useState(false);
  const { locale, setLocale } = useLocale();

  // The admin dashboard is English-only, regardless of whatever language the
  // public site was left in (they share one locale/i18n instance). Force it
  // back to English the moment the admin shell mounts.
  useEffect(() => {
    if (locale !== 'en') {
      void setLocale('en');
    }
    // Intentionally run once on mount only — this isn't meant to fight a user
    // re-selecting a language elsewhere while the dashboard is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadMyAccess = async () => {
      try {
        const myRbac = await getMyRbac();
        if (myRbac.role || (myRbac.permissions && myRbac.permissions.length > 0)) {
          setMyRole(myRbac.role);
          const fakeRole = { permissions: myRbac.permissions } as RbacRole;
          setPermissionSet(permissionKeysFromRole(fakeRole));
          return;
        }

        const roleId = userProfile?.roleId;
        if (roleId) {
          const role = await getRoleById(roleId);
          setMyRole(role);
          setPermissionSet(permissionKeysFromRole(role));
          return;
        }

        const result = await getMyPermissions();
        setMyRole(result.role);
        const fakeRole = { permissions: result.permissions } as RbacRole;
        setPermissionSet(permissionKeysFromRole(fakeRole));
      } catch (error: any) {
        console.error('Error loading RBAC permissions in layout', error);
        toast.error(error?.response?.data?.message || 'Failed to load your permissions');
        setMyRole(undefined);
        setPermissionSet(new Set<string>());
      } finally {
        setRbacLoaded(true);
      }
    };
    void loadMyAccess();
  }, [userProfile?.roleId]);

  useEffect(() => {
    const mapped =
      slugToUserRole(myRole?.slug) ||
      slugToUserRole(myRole?.name) ||
      slugToUserRole(userProfile?.role);
    if (mapped) setCurrentRole(mapped);
  }, [myRole?.slug, myRole?.name, userProfile?.role]);

  // A legacy `role: 'Admin'` only means "unrestricted" when the account has
  // no assigned RBAC role — assignUserRole() stamps the legacy field to
  // 'Admin' on every custom-role assignment too (kept for schema/back-compat
  // reasons), so checking the legacy field alone would treat every
  // custom-role user as a super admin on the client while the backend (which
  // does check for an absent roleId) correctly restricts them — showing menu
  // items and controls the account's real permissions can't actually use.
  const isSuperAdminRole =
    normalizeRoleSlug(myRole?.slug || '') === 'super-admin' ||
    (!myRole && normalizeRoleSlug(userProfile?.role || '') === 'super-admin') ||
    (!myRole && normalizeRoleSlug(userProfile?.role || '') === 'admin');
  const rbacReady = rbacLoaded && !!userProfile;

  const hasPermission = useMemo(
    () =>
      createPermissionChecker({
        rbacReady,
        isSuperAdminRole,
        permissionSet,
      }),
    [rbacReady, isSuperAdminRole, permissionSet],
  );

  const Unauthorized = () => (
    <div className="rounded-2xl p-8 bg-white shadow-sm">
      <h2 className="text-2xl mb-2" style={{ color: '#333' }}>Unauthorized</h2>
      <p style={{ color: '#666' }}>You are not allowed to access this page.</p>
    </div>
  );

  const NoAccessAssigned = () => (
    <div className="rounded-2xl p-8 bg-white shadow-sm">
      <h2 className="text-2xl mb-2" style={{ color: '#333' }}>No access assigned</h2>
      <p style={{ color: '#666' }}>
        Your role doesn't have any permissions yet. Ask a Super Admin to assign one under Admin Users.
      </p>
    </div>
  );

  const Loading = () => (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#C12D32' }} />
    </div>
  );

  // The first admin section this role's permissions actually unlock — used
  // to land freshly-logged-in users somewhere real (see withRoleSidebarAccess
  // below and the root "/" redirect) instead of always trying "/dashboard"
  // and hitting Unauthorized when a role lacks view_dashboard.
  const defaultRoute = useMemo(
    () => (rbacReady ? getDefaultRouteForPermissions(hasPermission) : null),
    [rbacReady, hasPermission],
  );

  const withPermission = (permissionKey: string, element: React.ReactElement) =>
    hasPermission(permissionKey) ? element : <Unauthorized />;
  const withRoleSidebarAccess = (sidebarItem: SidebarItemId, element: React.ReactElement) => {
    if (!rbacReady) return <Loading />;
    const requiredPerm = SIDEBAR_ITEM_PERMISSION[sidebarItem];
    if (!requiredPerm || hasPermission(requiredPerm)) return element;
    // "/dashboard" is the universal landing page — instead of a dead-end
    // Unauthorized wall the moment someone without view_dashboard logs in,
    // send them to the first section their permissions do unlock.
    if (sidebarItem === 'dashboard') {
      return defaultRoute && defaultRoute !== '/dashboard' ? (
        <Navigate to={defaultRoute} replace />
      ) : (
        <NoAccessAssigned />
      );
    }
    return <Unauthorized />;
  };

  const roleTitle = useMemo(() => {
    if (myRole?.name) return myRole.name;
    if (userProfile?.role) return userProfile.role;
    return currentRole;
  }, [myRole?.name, userProfile?.role, currentRole]);

  function BadgesEditWrapper() {
    const { id } = useParams<{ id: string }>();
    if (!id) return null;
    return <BadgesCreate navigate={() => {}} badgeId={id} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9EF' }}>
      <TopBar roleTitle={roleTitle} />
      <div className="flex">
        <Sidebar hasPermission={hasPermission} />
        <main className="flex-1 p-8 ml-64 mt-16">
          <Routes>
            <Route
              path="/dashboard"
              element={withRoleSidebarAccess(
                'dashboard',
                currentRole === 'Admin' ? (
                  <SuperAdminDashboard />
                ) : currentRole === 'content-manager' ? (
                  <ContentManagerDashboard />
                ) : currentRole === 'community-manager' ? (
                  <CommunityManagerDashboard />
                ) : (
                  <ModeratorDashboard />
                ),
              )}
            />

            <Route path="/events" element={withRoleSidebarAccess('events', <EventsList navigate={() => {}} role={currentRole} />)} />
            <Route path="/events/create" element={withRoleSidebarAccess('events', <EventCreate navigate={() => {}} role={currentRole} />)} />
            <Route path="/events/:id/edit" element={withRoleSidebarAccess('events', <EventEdit navigate={() => {}} role={currentRole} />)} />
            <Route path="/events/:id" element={withRoleSidebarAccess('events', <EventDetail />)} />
            <Route path="/events/:id/event-participants" element={withRoleSidebarAccess('events', <EventParticipants role={currentRole} />)} />
            <Route path="/events/:id/results" element={withRoleSidebarAccess('events', <EventResults />)} />

            <Route path="/communities" element={withRoleSidebarAccess('communities', <CommunitiesList role={currentRole} />)} />
            <Route path="/communities/create" element={withRoleSidebarAccess('communities', <CommunityCreate />)} />
            <Route path="/communities/:id/edit" element={withRoleSidebarAccess('communities', <CommunityEdit navigate={() => {}} role={currentRole} />)} />
            <Route path="/communities/:id" element={withRoleSidebarAccess('communities', <CommunityDetail />)} />

            <Route path="/challenges" element={withRoleSidebarAccess('challenges', <ChallengesList role={currentRole} />)} />
            <Route path="/challenges/create" element={withRoleSidebarAccess('challenges', <ChallengeCreate />)} />
            <Route path="/challenges/:id" element={withRoleSidebarAccess('challenges', <ChallengeDetail role={currentRole} />)} />
            <Route path="/challenges/:id/edit" element={withRoleSidebarAccess('challenges', <ChallengeCreate />)} />

            <Route path="/tracks" element={withRoleSidebarAccess('tracks', <TracksList navigate={() => {}} role={currentRole} />)} />
            <Route path="/tracks/create" element={withRoleSidebarAccess('tracks', <TrackCreate navigate={() => {}} role={currentRole} />)} />
            <Route path="/tracks/:id" element={withRoleSidebarAccess('tracks', <TrackDetail navigate={() => {}} role={currentRole} />)} />
            <Route path="/tracks/:id/edit" element={withRoleSidebarAccess('tracks', <TrackEdit navigate={() => {}} role={currentRole} />)} />

            <Route path="/badges" element={withRoleSidebarAccess('badges', <BadgesList navigate={() => {}} role={currentRole} />)} />
            <Route path="/badges/create" element={withRoleSidebarAccess('badges', <BadgesCreate navigate={() => {}} />)} />
            <Route path="/badges/:id/edit" element={withRoleSidebarAccess('badges', <BadgesEditWrapper />)} />
            <Route path="/feed" element={withRoleSidebarAccess('feed', <FeedModeration />)} />
            <Route path="/marketplace" element={withRoleSidebarAccess('marketplace', <MarketplaceModeration navigate={() => {}} role={currentRole} />)} />
            <Route path="/merchandise" element={withRoleSidebarAccess('merchandise', <Merchandise navigate={() => {}} />)} />
            <Route path="/marketplace/:id/edit" element={withRoleSidebarAccess('marketplace', <MarketplaceItemEdit />)} />
            <Route path="/cms" element={withRoleSidebarAccess('cms', <CMS />)} />
            <Route path="/media" element={withRoleSidebarAccess('media', <MediaLibrary />)} />
            <Route path="/push" element={withRoleSidebarAccess('push', <PushNotifications />)} />

            <Route path="/news" element={withRoleSidebarAccess('news', <NewsList />)} />
            <Route path="/news/create" element={withRoleSidebarAccess('news', <NewsCreate />)} />
            <Route path="/news/:id/edit" element={withRoleSidebarAccess('news', <NewsEdit />)} />
            <Route path="/users" element={withRoleSidebarAccess('users', <UsersList />)} />
            <Route path="/users/create" element={withRoleSidebarAccess('users', <UserCreate />)} />
            <Route path="/admins" element={withRoleSidebarAccess('admins', <AdminsList />)} />
            <Route path="/admins/create" element={withRoleSidebarAccess('admins', <AdminCreate />)} />
            <Route path="/admins/:id/edit" element={withRoleSidebarAccess('admins', <AdminEdit />)} />
            <Route path="/reports" element={withRoleSidebarAccess('reports', <Reports role={currentRole} />)} />
            <Route path="/contact-messages" element={withRoleSidebarAccess('contactMessages', <ContactMessagesList />)} />
            <Route path="/newsletter" element={withRoleSidebarAccess('newsletter', <NewsletterSubscribersList />)} />
            <Route path="/config" element={withRoleSidebarAccess('config', <AppConfig />)} />
            <Route path="/static-data" element={withRoleSidebarAccess('staticData', <StaticDataManager />)} />
            <Route path="/admin/product-banners-ar" element={withPermission('app_configuration', <ProductBannersArAdmin />)} />
            <Route path="/roles" element={withRoleSidebarAccess('roles', <RolesPermissions />)} />
            <Route path="/roles/create" element={withRoleSidebarAccess('roles', <RoleCreate />)} />
            <Route path="/roles/:id" element={withRoleSidebarAccess('roles', <RoleDetail />)} />
            <Route path="/roles/:id/edit" element={withRoleSidebarAccess('roles', <RoleEdit />)} />
            <Route path="/languages" element={withRoleSidebarAccess('languages', <LanguagesList />)} />
            <Route path="/audit-log" element={withRoleSidebarAccess('auditLog', <AuditLog />)} />
            <Route
              path="/notifications"
              element={withPermission('view_dashboard', <AdminNotificationsPage />)}
            />

            <Route path="/" element={<Navigate to={defaultRoute || '/dashboard'} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
