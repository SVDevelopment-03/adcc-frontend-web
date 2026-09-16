import type { RbacPermission, RbacRole } from '../services/rbacService';

export type SidebarItemId =
  | 'dashboard'
  | 'events'
  | 'communities'
  | 'tracks'
  | 'challenges'
  | 'badges'
  | 'feed'
  | 'marketplace'
  | 'merchandise'
  | 'cms'
  | 'media'
  | 'push'
  | 'news'
  | 'users'
  | 'admins'
  | 'reports'
  | 'contactMessages'
  | 'newsletter'
  | 'config'
  | 'languages'
  | 'roles'
  | 'staticData';

/**
 * Sidebar menu id -> permission key actually enforced by the matching backend
 * route(s). This is the single source of truth for what a role needs to see
 * (and use) each admin section — every entry here was checked against the
 * real `requireStaffPermission(...)` / `isAdmin` guard on the backend route
 * the page calls, not just an aspirational label. `null` means the backend
 * doesn't gate it beyond "authenticated staff" (e.g. shared media library,
 * dashboard report stats), so it's visible to anyone signed in.
 *
 * A custom role only ever sees the sections its assigned permissions
 * actually unlock — there is no separate hardcoded per-role menu list to
 * keep in sync with this.
 */
export const SIDEBAR_ITEM_PERMISSION: Record<SidebarItemId, string | null> = {
  dashboard: 'view_dashboard',
  events: 'manage_events',
  communities: 'manage_communities',
  // Tracks and Challenges are both gated on the events management permission
  // on the backend (track.route.ts / challenge.route.ts) — there's no
  // separate manage_tracks/manage_challenges permission.
  tracks: 'manage_events',
  challenges: 'manage_events',
  badges: 'admin.panel',
  feed: 'moderate_content',
  marketplace: 'moderate_content',
  merchandise: 'manage_store',
  cms: 'app_configuration',
  media: null,
  push: 'app_configuration',
  news: 'manage_cms',
  users: 'manage_users',
  admins: 'manage_users',
  reports: null,
  contactMessages: 'manage_cms',
  newsletter: 'manage_cms',
  config: 'app_configuration',
  staticData: 'app_configuration',
  languages: 'app_configuration',
  roles: 'admin.manage_roles',
};

/**
 * Route each sidebar item lands on, in the same priority order the sidebar
 * itself lists them — used to find the best landing page for a role instead
 * of hardcoding "/dashboard" for everyone (a role without view_dashboard
 * would just hit an Unauthorized wall on login otherwise).
 */
export const SIDEBAR_ITEM_PATH: Record<SidebarItemId, string> = {
  dashboard: '/dashboard',
  events: '/events',
  communities: '/communities',
  tracks: '/tracks',
  challenges: '/challenges',
  badges: '/badges',
  feed: '/feed',
  marketplace: '/marketplace',
  merchandise: '/merchandise',
  cms: '/cms',
  media: '/media',
  push: '/push',
  news: '/news',
  users: '/users',
  admins: '/admins',
  reports: '/reports',
  contactMessages: '/contact-messages',
  newsletter: '/newsletter',
  config: '/config',
  staticData: '/static-data',
  languages: '/languages',
  roles: '/roles',
};

const SIDEBAR_ITEM_ORDER = Object.keys(SIDEBAR_ITEM_PATH) as SidebarItemId[];

/**
 * The first sidebar item (in priority order) a role can actually use, or
 * `null` if its permissions don't unlock any admin section at all. Used to
 * land a freshly-logged-in user somewhere real instead of always trying
 * "/dashboard" and showing Unauthorized when they lack view_dashboard.
 */
export function getDefaultRouteForPermissions(
  hasPermission: (permissionKey: string) => boolean,
): string | null {
  for (const item of SIDEBAR_ITEM_ORDER) {
    const requiredPerm = SIDEBAR_ITEM_PERMISSION[item];
    if (!requiredPerm || hasPermission(requiredPerm)) {
      return SIDEBAR_ITEM_PATH[item];
    }
  }
  return null;
}

const normalizePermissionKey = (key: string) =>
  key.toLowerCase().replace(/[\s-]+/g, '_');

/** Collect permission keys from a role (objects with .key or raw strings). */
export function permissionKeysFromRole(role: RbacRole | undefined): Set<string> {
  const set = new Set<string>();
  if (!role?.permissions?.length) return set;
  for (const p of role.permissions) {
    if (typeof p === 'string') {
      if (p.trim()) set.add(p);
      continue;
    }
    const obj = p as RbacPermission;
    if (obj.key) set.add(obj.key);
  }
  return set;
}

export interface PermissionCheckerOptions {
  rbacReady: boolean;
  /** When the user's role slug is super-admin, allow all (matches prior hardcoded behavior). */
  isSuperAdminRole: boolean;
  permissionSet: Set<string>;
}

/**
 * Returns true if the user may perform an action gated by the given permission key.
 */
export function createPermissionChecker(options: PermissionCheckerOptions) {
  const { rbacReady, isSuperAdminRole, permissionSet } = options;

  return function hasPermission(requiredKey: string): boolean {
    if (!rbacReady) return false;
    if (isSuperAdminRole) return true;

    const aliases =
      requiredKey === 'app_configuration'
        ? ['app_configuration', 'app_configure']
        : [requiredKey];

    const wanted = aliases.map(normalizePermissionKey);
    for (const k of permissionSet) {
      if (wanted.includes(normalizePermissionKey(k))) return true;
    }
    return false;
  };
}
