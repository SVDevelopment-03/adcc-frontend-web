import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, MapPin, TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';
import {
  getDashboardSummary,
  type DashboardSummaryData,
} from '../../services/dashboardApi';

function formatStat(n: number): string {
  return n.toLocaleString();
}

function formatGrowthPercent(n: number): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}${n}%`;
}

export function CommunityManagerDashboard() {
  const navigate = useNavigate();

  const { t, i18n } = useTranslation();
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.noResults'));
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const community = summary?.sections.community;
  const engagement = community?.communityEngagement;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('dashboard.communityManager.title')}</h1>
        <p style={{ color: '#666' }}>{t('dashboard.communityManager.subtitle')}</p>
      </div>

      {error && (
        <div
          className="p-4 rounded-xl text-sm"
          style={{ backgroundColor: '#FFF3F3', color: '#C12D32' }}
        >
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('dashboard.communityManager.totalMembers')}
          value={loading ? '—' : formatStat(community?.totalMembers ?? 0)}
          icon={<Users className="w-6 h-6" />}
          onClick={() => navigate('/communities')}
        />
        <StatCard
          label={t('dashboard.communityManager.activeChapters')}
          value={loading ? '—' : formatStat(community?.activeCommunities ?? 0)}
          icon={<MapPin className="w-6 h-6" />}
          onClick={() => navigate('/communities')}
        />
        <StatCard
          label={t('dashboard.communityManager.upcomingEvents')}
          value={loading ? '—' : formatStat(community?.upcomingEventsCount ?? 0)}
          icon={<Calendar className="w-6 h-6" />}
          onClick={() => navigate('/events')}
        />
        <StatCard
          label={t('dashboard.communityManager.monthlyGrowth')}
          value={loading ? '—' : (community ? formatGrowthPercent(community.monthlyGrowthPercent) : '0%')}
          icon={<TrendingUp className="w-6 h-6" />}
        />
      </div>

      {/* Chapter Growth */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl" style={{ color: '#333' }}>{t('dashboard.communityManager.chapterPerformance')}</h2>
          <button
            onClick={() => navigate('/communities')}
            className="text-sm hover:underline"
            style={{ color: '#C12D32' }}
          >
            {t('dashboard.viewAll')}
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFF9EF' }}>
            <p className="text-sm" style={{ color: '#666' }}>
              {loading ? '—' : t('common.noResults')}
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Events + Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('dashboard.communityManager.upcomingEvents')}</h2>
          <div className="space-y-3">
            {loading && (
              <div className="text-sm" style={{ color: '#666' }}>—</div>
            )}
            {!loading && (!community?.upcomingEvents?.length) && (
              <div className="text-sm" style={{ color: '#666' }}>{t('common.noResults')}</div>
            )}
            {!loading &&
              community?.upcomingEvents?.map((event) => {
                const date = event.eventDate
                  ? new Date(event.eventDate).toLocaleDateString(i18n.language, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—';
                return (
                  <div key={event.id} className="p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                    <div className="text-sm mb-1" style={{ color: '#333' }}>{event.title}</div>
                    <div className="flex items-center justify-between text-xs" style={{ color: '#666' }}>
                      <span>{date} • {event.city}{event.trackTitle ? ` • ${event.trackTitle}` : ''}</span>
                      <span>
                        {formatStat(event.registeredCount)} {t('dashboard.communityManager.registered')}
                        {event.maxParticipants != null ? ` / ${formatStat(event.maxParticipants)}` : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('dashboard.communityManager.communityEngagement')}</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#ECC180' }}>
              <div className="text-2xl mb-1" style={{ color: '#333' }}>
                {loading ? '—' : engagement?.averageEventRating != null ? String(engagement.averageEventRating) : '—'}
              </div>
              <div className="text-sm" style={{ color: '#666' }}>{t('dashboard.communityManager.avgEventRating')}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#E1C06E' }}>
              <div className="text-2xl mb-1" style={{ color: '#333' }}>
                {loading
                  ? '—'
                  : engagement?.memberSatisfactionPercent != null
                    ? `${engagement.memberSatisfactionPercent}%`
                    : '—'}
              </div>
              <div className="text-sm" style={{ color: '#666' }}>{t('dashboard.communityManager.memberSatisfaction')}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#CF9F0C', color: '#fff' }}>
              <div className="text-2xl mb-1">
                {loading ? '—' : formatStat(engagement?.monthlyActiveMembers ?? 0)}
              </div>
              <div className="text-sm opacity-90">{t('dashboard.communityManager.monthlyActiveMembers')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
