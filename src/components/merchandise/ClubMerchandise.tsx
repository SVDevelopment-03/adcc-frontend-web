import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, TrendingUp, ShoppingBag, Package, ExternalLink, ArrowRight } from 'lucide-react';
import { getDashboardLanding, type DashboardLandingData } from '../../services/dashboardApi';
import { MerchandiseBannerUploader } from './MerchandiseBannerUploader';

export function ClubMerchandise() {
  const navigate = useNavigate();
  const [landing, setLanding] = useState<DashboardLandingData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDashboardLanding();
      setLanding(data);
    } catch {
      setLanding(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const stats = landing?.stats;

  const statCards = [
    {
      label: 'Revenue',
      value: '—',
      icon: <TrendingUp className="w-5 h-5" />,
      bg: '#FFF9EF',
      color: '#C12D32',
      note: 'Coming soon',
    },
    {
      label: 'Total Orders',
      value: '—',
      icon: <ShoppingBag className="w-5 h-5" />,
      bg: '#EFF6FF',
      color: '#3B82F6',
      note: 'Coming soon',
    },
    {
      label: 'Products',
      value: '—',
      icon: <Package className="w-5 h-5" />,
      bg: '#ECFDF5',
      color: '#10B981',
      note: 'Coming soon',
    },
    {
      label: 'Pending Approvals',
      value: loading ? '—' : String(stats?.pendingStoreItems ?? 0),
      icon: <ShoppingBag className="w-5 h-5" />,
      bg: stats?.pendingStoreItems ? '#FFFBEB' : '#F9FAFB',
      color: stats?.pendingStoreItems ? '#F59E0B' : '#9CA3AF',
      note: stats?.pendingStoreItems ? 'Needs review' : 'All clear',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#FFF9EF' }}>
            <Store className="w-6 h-6" style={{ color: '#C12D32' }} />
          </div>
          <div>
            <h1 className="text-3xl" style={{ color: '#333' }}>Club Merchandise</h1>
            <p className="text-sm mt-1" style={{ color: '#666' }}>ADCC official products and store management</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-white transition-all hover:shadow-lg"
          style={{ backgroundColor: '#C12D32' }}
        >
          <ExternalLink className="w-4 h-4" />
          Marketplace Moderation
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: card.bg }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: '#666' }}>{card.label}</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white">
                <span style={{ color: card.color }}>{card.icon}</span>
              </div>
            </div>
            <p className="text-3xl mb-1" style={{ color: card.color }}>{card.value}</p>
            <p className="text-xs" style={{ color: '#999' }}>{card.note}</p>
          </div>
        ))}
      </div>

      {/* Coming Soon Banner */}
      <div className="p-6 rounded-2xl border-2 border-dashed" style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA' }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFF9EF' }}>
            <Store className="w-6 h-6" style={{ color: '#C12D32' }} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg mb-1" style={{ color: '#333' }}>Full Merchandise Management Coming Soon</h3>
            <p className="text-sm" style={{ color: '#666' }}>
              Product catalog, order management, inventory tracking and revenue analytics will be available here.
              Marketplace moderation (approving vendor submissions) is available now.
            </p>
          </div>
          <button
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all hover:shadow-md shrink-0"
            style={{ backgroundColor: '#C12D32', color: '#fff' }}
          >
            Go to Marketplace
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 rounded-2xl bg-white shadow-sm">
        <h3 className="text-lg mb-4" style={{ color: '#333' }}>Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF9EF' }}>
              <ShoppingBag className="w-5 h-5" style={{ color: '#C12D32' }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#333' }}>Review Pending Items</p>
              <p className="text-xs" style={{ color: '#999' }}>
                {loading ? '—' : `${stats?.pendingStoreItems ?? 0} awaiting approval`}
              </p>
            </div>
          </button>

          <button
            className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-gray-200 text-left opacity-60 cursor-not-allowed"
            disabled
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
              <Package className="w-5 h-5" style={{ color: '#9CA3AF' }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#333' }}>Manage Products</p>
              <p className="text-xs" style={{ color: '#999' }}>Coming soon</p>
            </div>
          </button>

          <button
            className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-gray-200 text-left opacity-60 cursor-not-allowed"
            disabled
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
              <TrendingUp className="w-5 h-5" style={{ color: '#9CA3AF' }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#333' }}>Sales Analytics</p>
              <p className="text-xs" style={{ color: '#999' }}>Coming soon</p>
            </div>
          </button>
        </div>
      </div>

      <MerchandiseBannerUploader />
    </div>
  );
}
