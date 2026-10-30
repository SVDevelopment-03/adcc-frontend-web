import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserRole } from '../App';
import {
  LayoutDashboard,
  Calendar,
  Users,
  MapPin,
  Trophy,
  Award,
  MessageSquare,
  ShoppingBag,
  Store,
  FileText,
  Image,
  Bell,
  Mail,
  UserPlus,
  Newspaper,
  UserCog,
  BarChart3,
  Settings,
  Shield,
  Globe,
  Database,
  History,
  Building2,
  Bike,
  Handshake,
  Files,
} from 'lucide-react';
import { SIDEBAR_ITEM_PERMISSION } from '../rbac/rbacKeys';

interface SidebarProps {
  hasPermission: (permissionKey: string) => boolean;
}

interface MenuItemDef {
  id: string;
  labelKey: string;
  icon: React.ReactNode;
  roles: UserRole[];
  path: string;
  /** Rendered indented beneath the item above it. */
  isChild?: boolean;
}

export const menuItems: MenuItemDef[] = [
  { id: 'dashboard', labelKey: 'sidebar.dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['Admin', 'content-manager', 'community-manager', 'moderator'], path: '/dashboard' },
  { id: 'events', labelKey: 'sidebar.events', icon: <Calendar className="w-5 h-5" />, roles: ['Admin', 'content-manager', 'community-manager'], path: '/events' },
  { id: 'eventOrganizers', labelKey: 'sidebar.eventOrganizers', icon: <Building2 className="w-4 h-4" />, roles: ['Admin'], path: '/events/organizers', isChild: true },
  { id: 'communities', labelKey: 'sidebar.communities', icon: <Users className="w-5 h-5" />, roles: ['Admin', 'content-manager', 'community-manager'], path: '/communities' },
  { id: 'tracks', labelKey: 'sidebar.tracks', icon: <MapPin className="w-5 h-5" />, roles: ['Admin', 'community-manager'], path: '/tracks' },
  { id: 'challenges', labelKey: 'sidebar.challenges', icon: <Trophy className="w-5 h-5" />, roles: ['Admin', 'community-manager'], path: '/challenges' },
  { id: 'badges', labelKey: 'sidebar.badges', icon: <Award className="w-5 h-5" />, roles: ['Admin', 'community-manager'], path: '/badges' },
  { id: 'feed', labelKey: 'sidebar.feed', icon: <MessageSquare className="w-5 h-5" />, roles: ['Admin', 'community-manager', 'content-manager', 'moderator'], path: '/feed' },
  { id: 'marketplace', labelKey: 'sidebar.marketplace', icon: <ShoppingBag className="w-5 h-5" />, roles: ['Admin', 'community-manager', 'content-manager', 'moderator'], path: '/marketplace' },
  { id: 'merchandise', labelKey: 'sidebar.merchandise', icon: <Store className="w-5 h-5" />, roles: ['Admin'], path: '/merchandise' },
  { id: 'cms', labelKey: 'sidebar.cms', icon: <FileText className="w-5 h-5" />, roles: ['Admin', 'content-manager'], path: '/cms' },
  { id: 'pages', labelKey: 'sidebar.pages', icon: <Files className="w-5 h-5" />, roles: ['Admin', 'content-manager'], path: '/pages' },
  { id: 'partners', labelKey: 'sidebar.partners', icon: <Handshake className="w-5 h-5" />, roles: ['Admin', 'content-manager'], path: '/partners' },
  { id: 'media', labelKey: 'sidebar.media', icon: <Image className="w-5 h-5" />, roles: ['Admin', 'content-manager'], path: '/media' },
  { id: 'push', labelKey: 'sidebar.push', icon: <Bell className="w-5 h-5" />, roles: ['Admin', 'content-manager', 'community-manager'], path: '/push' },
  { id: 'news', labelKey: 'sidebar.news', icon: <Newspaper className="w-5 h-5" />, roles: ['Admin', 'content-manager'], path: '/news' },
  { id: 'users', labelKey: 'sidebar.users', icon: <UserCog className="w-5 h-5" />, roles: ['Admin', 'moderator'], path: '/users' },
  { id: 'admins', labelKey: 'sidebar.admins', icon: <Shield className="w-5 h-5" />, roles: ['Admin'], path: '/admins' },
  { id: 'reports', labelKey: 'sidebar.reports', icon: <BarChart3 className="w-5 h-5" />, roles: ['Admin', 'content-manager', 'community-manager', 'moderator'], path: '/reports' },
  { id: 'contactMessages', labelKey: 'sidebar.contactMessages', icon: <Mail className="w-5 h-5" />, roles: ['Admin', 'content-manager'], path: '/contact-messages' },
  { id: 'newsletter', labelKey: 'sidebar.newsletter', icon: <UserPlus className="w-5 h-5" />, roles: ['Admin', 'content-manager'], path: '/newsletter' },
  { id: 'laffahRideRegistrations', labelKey: 'sidebar.laffahRideRegistrations', icon: <Bike className="w-5 h-5" />, roles: ['Admin', 'content-manager'], path: '/laffah-ride-leads' },
  { id: 'config', labelKey: 'sidebar.config', icon: <Settings className="w-5 h-5" />, roles: ['Admin'], path: '/config' },
  { id: 'staticData', labelKey: 'sidebar.staticData', icon: <Database className="w-5 h-5" />, roles: ['Admin'], path: '/static-data' },
  { id: 'languages', labelKey: 'sidebar.languages', icon: <Globe className="w-5 h-5" />, roles: ['Admin'], path: '/languages' },
  { id: 'roles', labelKey: 'sidebar.roles', icon: <Shield className="w-5 h-5" />, roles: ['Admin'], path: '/roles' },
  { id: 'auditLog', labelKey: 'sidebar.auditLog', icon: <History className="w-5 h-5" />, roles: ['Admin'], path: '/audit-log' },
];

/** Menu items the current user's permissions unlock. */
export const getVisibleMenuItems = (hasPermission: (permissionKey: string) => boolean) =>
  menuItems.filter((item) => {
    const requiredPerm = SIDEBAR_ITEM_PERMISSION[item.id as keyof typeof SIDEBAR_ITEM_PERMISSION];
    if (!requiredPerm) return true;
    return hasPermission(requiredPerm);
  });

export function Sidebar({ hasPermission }: SidebarProps) {
  const { t } = useTranslation();

  const visibleItems = getVisibleMenuItems(hasPermission);

  return (
    <div className="scroller fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] overflow-x-scroll bg-white shadow-sm border-r border-gray-200 scroll-smooth">
      <div className="p-6">
        <nav className="space-y-1">
          {visibleItems.map(item => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg transition-all ${
                  item.isChild ? 'ms-6 px-4 py-2' : 'w-full px-4 py-3'
                } ${isActive ? '' : ''}`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? (item.isChild ? '#F6E3C5' : '#ECC180') : 'transparent',
                color: item.isChild ? '#555' : '#333',
              })}
            >
              {item.icon}
              <span className={item.isChild ? 'text-[13px]' : 'text-sm'}>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
