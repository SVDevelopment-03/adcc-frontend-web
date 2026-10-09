/**
 * Plain-language names for permissions on the role screens. Each description
 * lists the dashboard sections the permission actually unlocks (see
 * SIDEBAR_ITEM_PERMISSION), so an admin can tell what a role will be able to do
 * without knowing the internal permission keys.
 */
const PERMISSION_DISPLAY: Record<string, { title: string; description: string }> = {
  view_dashboard: {
    title: 'Dashboard',
    description: 'See the dashboard home page with its summary numbers and charts.',
  },
  manage_events: {
    title: 'Events, Tracks & Challenges',
    description: 'Create and edit events, tracks and challenges; manage participants, check-ins and results.',
  },
  manage_communities: {
    title: 'Communities',
    description: 'Create and edit communities, manage their members and community posts.',
  },
  moderate_content: {
    title: 'Feed & Marketplace Moderation',
    description: "Approve or reject riders' feed posts and marketplace listings.",
  },
  manage_store: {
    title: 'E-commerce (Club Merchandise)',
    description: 'Manage club store products, categories and customer orders.',
  },
  manage_cms: {
    title: 'Blogs / News & Leads',
    description: 'Publish news articles, and view contact messages (leads) and newsletter subscribers.',
  },
  manage_users: {
    title: 'Users & Admins',
    description: 'View app users, suspend or activate them, and manage admin accounts.',
  },
  app_configuration: {
    title: 'Website Content, Notifications & Settings',
    description:
      'Edit website content, send push notifications, and change app settings, dropdown data, languages and event organisers.',
  },
  'admin.panel': {
    title: 'Badges & Full Admin Access',
    description: 'Manage badges and rewards, plus every other admin-only action. Give this to trusted admins only.',
  },
  'admin.manage_roles': {
    title: 'Roles & Permissions',
    description: 'Create roles and decide what each role is allowed to do.',
  },
  view_audit_log: {
    title: 'Audit Log',
    description: 'See the history of what each admin changed and when.',
  },
};

export function getPermissionDisplay(perm: { key: string; name?: string; description?: string }) {
  const known = PERMISSION_DISPLAY[perm.key];
  return {
    title: known?.title || perm.name || perm.key,
    description: known?.description || perm.description || '',
  };
}
