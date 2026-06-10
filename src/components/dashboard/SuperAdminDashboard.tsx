import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Building2, MapPin, Store, TrendingUp, ShoppingBag, Package } from 'lucide-react';
import { StatCard } from './StatCard';
import { UpcomingEvents } from './UpcomingEvents';
import { PendingApprovals } from './PendingApprovals';
import { CommunityGrowth } from './CommunityGrowth';
import { RecentActivity } from './RecentActivity';
import { PushPerformance } from './PushPerformance';
import { PopularTracks } from './PopularTracks';
import { getDashboardLanding, type DashboardLandingData } from '../../services/dashboardApi';

function formatStat(n: number): string {
  return n.toLocaleString();
}

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [landing, setLanding] = useState<DashboardLandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardLanding();
      setLanding(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.noResults'));
      setLanding(null);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = landing?.stats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('dashboard.title')}</h1>
        <p style={{ color: '#666' }}>{t('dashboard.welcome')}</p>
      </div>

      {error && (
        <div
          className="p-4 rounded-xl text-sm"
          style={{ backgroundColor: '#FFF3F3', color: '#C12D32' }}
        >
          {error}
        </div>
      )}

      {/* Row 1: Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label={t('dashboard.maleUsers')}
          value={loading ? '—' : formatStat(stats?.maleUsers ?? 0)}
          icon={<Users className="w-6 h-6" />}
          onClick={() => navigate('/users?gender=Male')}
        />
        <StatCard
          label={t('dashboard.femaleUsers')}
          value={loading ? '—' : formatStat(stats?.femaleUsers ?? 0)}
          icon={<Users className="w-6 h-6" />}
          onClick={() => navigate('/users?gender=Female')}
        />
        <StatCard
          label={t('dashboard.eventsThisMonth')}
          value={loading ? '—' : formatStat(stats?.eventsThisMonth ?? 0)}
          icon={<Calendar className="w-6 h-6" />}
          onClick={() => navigate('/events')}
        />
        <StatCard
          label={t('dashboard.activeTracks')}
          value={loading ? '—' : formatStat(stats?.activeTracks ?? 0)}
          icon={<MapPin className="w-6 h-6" />}
          onClick={() => navigate('/tracks')}
        />
        <StatCard
          label={t('dashboard.communities')}
          value={loading ? '—' : formatStat(stats?.activeCommunities ?? 0)}
          icon={<Building2 className="w-6 h-6" />}
          onClick={() => navigate('/communities')}
        />
      </div>

      {/* Row 2: Main Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UpcomingEvents loading={loading} upcomingEvent={landing?.upcomingEvent ?? null} />
        </div>
        <PendingApprovals
          pendingFeedPosts={stats?.pendingFeedPosts}
          pendingStoreItems={stats?.pendingStoreItems}
          reportedFeedPosts={stats?.reportedFeedPosts}
        />
      </div>

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CommunityGrowth
          loading={loading}
          series={landing?.communityStatsByMonth?.series}
        />
        <PushPerformance />
      </div>

      {/* Row 4: Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <PopularTracks
          loading={loading}
          tracksRankedByEvents={landing?.tracksRankedByEvents}
        />
      </div>

      {/* Row 5: Club Merchandise */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFF9EF' }}>
              <Store className="w-5 h-5" style={{ color: '#C12D32' }} />
            </div>
            <div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('dashboard.clubMerchandise', 'Club Merchandise')}</h2>
              <p className="text-sm" style={{ color: '#666' }}>{t('dashboard.clubMerchandiseSubtitle', 'ADCC official products and store overview')}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/marketplace')}
            className="px-4 py-2 rounded-lg text-sm transition-all hover:shadow-md"
            style={{ backgroundColor: '#C12D32', color: '#fff' }}
          >
            {t('dashboard.manageStore', 'Manage Store')}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFF9EF' }}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4" style={{ color: '#C12D32' }} />
              <span className="text-xs" style={{ color: '#666' }}>{t('dashboard.revenue', 'Revenue')}</span>
            </div>
            <p className="text-xl" style={{ color: '#C12D32' }}>—</p>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: '#EFF6FF' }}>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="w-4 h-4" style={{ color: '#3B82F6' }} />
              <span className="text-xs" style={{ color: '#666' }}>{t('dashboard.totalOrders', 'Total Orders')}</span>
            </div>
            <p className="text-xl" style={{ color: '#3B82F6' }}>—</p>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: '#ECFDF5' }}>
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4" style={{ color: '#10B981' }} />
              <span className="text-xs" style={{ color: '#666' }}>{t('dashboard.products', 'Products')}</span>
            </div>
            <p className="text-xl" style={{ color: '#10B981' }}>—</p>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: stats?.pendingStoreItems ? '#FFFBEB' : '#F9FAFB' }}>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="w-4 h-4" style={{ color: stats?.pendingStoreItems ? '#F59E0B' : '#9CA3AF' }} />
              <span className="text-xs" style={{ color: '#666' }}>{t('dashboard.pendingApprovals', 'Pending Approvals')}</span>
            </div>
            <p className="text-xl" style={{ color: stats?.pendingStoreItems ? '#F59E0B' : '#333' }}>
              {loading ? '—' : (stats?.pendingStoreItems ?? 0)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: '#F9FAFB', border: '1px dashed #E5E7EB' }}>
          <Store className="w-5 h-5 shrink-0" style={{ color: '#9CA3AF' }} />
          <p className="text-sm" style={{ color: '#666' }}>
            {t('dashboard.merchandiseComingSoon', 'Full merchandise management (products, orders, inventory) is coming soon. Marketplace moderation is available now.')}
          </p>
          <button
            onClick={() => navigate('/marketplace')}
            className="ml-auto text-xs underline shrink-0"
            style={{ color: '#C12D32' }}
          >
            {t('dashboard.goToMarketplace', 'Go to Marketplace')}
          </button>
        </div>
      </div>
    </div>
  );
}
