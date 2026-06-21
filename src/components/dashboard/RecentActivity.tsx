import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Calendar, MessageSquare, Package, ShoppingBag, Star, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminNotifications, type AdminNotification } from '../../services/adminNotificationsApi';

function getActivityIcon(type: string) {
  switch (type) {
    case 'event':
      return <Calendar className="w-5 h-5" />;
    case 'user':
      return <Users className="w-5 h-5" />;
    case 'post':
    case 'community':
      return <MessageSquare className="w-5 h-5" />;
    case 'marketplace':
      return <ShoppingBag className="w-5 h-5" />;
    case 'inventory':
    case 'store':
      return <Package className="w-5 h-5" />;
    case 'rating':
      return <Star className="w-5 h-5" />;
    default:
      return <Bell className="w-5 h-5" />;
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case 'event':
      return '#C12D32';
    case 'user':
      return '#CF9F0C';
    case 'post':
      return '#ECC180';
    case 'marketplace':
      return '#E1C06E';
    case 'rating':
      return '#10B981';
    case 'community':
      return '#7C3AED';
    default:
      return '#64748B';
  }
}

function formatRelativeTime(createdAt: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return createdAt ? createdAt : '—';
  }
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

export function RecentActivity() {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadActivities = async () => {
      setLoading(true);
      try {
        const notifications = await getAdminNotifications(6);
        if (mounted) {
          setActivities(notifications);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : t('dashboard.failedToLoadRecentActivity', 'Unable to load recent activity');
        toast.error(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadActivities();
    return () => {
      mounted = false;
    };
  }, [t]);

  return (
    <div className="p-6 rounded-2xl shadow-sm bg-white">
      <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('dashboard.recentActivity')}</h2>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="text-sm text-gray-500">{t('dashboard.loading', 'Loading...')}</div>
        </div>
      ) : activities.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <div className="text-sm text-gray-500">{t('dashboard.noRecentActivity', 'No recent activity found')}</div>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const color = getActivityColor(activity.type);
            const icon = getActivityIcon(activity.type);
            const title = activity.title || t('dashboard.activityTitle', 'Notification');
            const description = activity.description && activity.description !== title ? activity.description : undefined;
            return (
              <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
                  <div style={{ color }}>{icon}</div>
                </div>
                <div className="flex-1">
                  <p className="text-sm mb-1 font-medium" style={{ color: '#333' }}>{title}</p>
                  {description ? (
                    <p className="text-sm mb-1" style={{ color: '#555' }}>{description}</p>
                  ) : null}
                  <p className="text-xs" style={{ color: '#999' }}>{formatRelativeTime(activity.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
