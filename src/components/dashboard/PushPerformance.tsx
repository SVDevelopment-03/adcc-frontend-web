import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface PushCampaign {
  id: string;
  title: string;
  audienceType: string;
  deliveryType: 'app' | 'email' | 'both';
  recipientCount: number;
  pushSuccessCount: number;
  pushFailureCount: number;
  emailCount: number;
  readCount: number;
  createdAt: string;
}

export function PushPerformance() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState<PushCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/v1/push-notifications/campaigns', { params: { limit: 4 } })
      .then((response) => {
        if (!cancelled) setCampaigns(response.data?.data?.campaigns ?? []);
      })
      .catch(() => {
        if (!cancelled) setCampaigns([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6 rounded-2xl shadow-sm bg-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl" style={{ color: '#333' }}>{t('dashboard.pushPerformance')}</h2>
        <button
          onClick={() => navigate('/push')}
          className="text-sm hover:underline"
          style={{ color: '#C12D32' }}
        >
          {t('dashboard.viewAll')}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[300px] text-sm" style={{ color: '#666' }}>
          {t('common.loading')}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-sm" style={{ color: '#666' }}>
          No campaigns sent yet
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const readRate = campaign.recipientCount > 0
              ? `${Math.round((campaign.readCount / campaign.recipientCount) * 100)}%`
              : '-';
            const isEmailOnly = campaign.deliveryType === 'email';
            return (
              <div key={campaign.id} className="p-4 rounded-xl" style={{ backgroundColor: '#FFF9EF' }}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-sm truncate" style={{ color: '#333' }}>{campaign.title}</span>
                  <span className="text-xs whitespace-nowrap" style={{ color: '#999' }}>
                    {new Date(campaign.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-xs mb-1" style={{ color: '#999' }}>{isEmailOnly ? 'Emails' : t('dashboard.sent')}</div>
                    <div className="text-sm" style={{ color: '#333' }}>
                      {(isEmailOnly ? campaign.emailCount : campaign.recipientCount).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs mb-1" style={{ color: '#999' }}>Push delivered</div>
                    <div className="text-sm" style={{ color: '#333' }}>
                      {isEmailOnly ? '-' : campaign.pushSuccessCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs mb-1" style={{ color: '#999' }}>Read in app</div>
                    <div className="text-sm" style={{ color: '#333' }}>
                      {isEmailOnly ? '-' : `${campaign.readCount.toLocaleString()} (${readRate})`}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
