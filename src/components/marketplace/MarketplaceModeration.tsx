import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Star, AlertTriangle, Search, Eye, Ban, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  approveStoreItem,
  deleteStoreItem,
  getAdminStoreItems,
  getAdminStoreItemsCount,
  markStoreItemSold,
  rejectStoreItem,
  setStoreItemFeatured,
  StoreItem,
} from '../../services/storeApi';

function timeAgo(input?: string): string {
  if (!input) return '';
  const t = new Date(input).getTime();
  if (!Number.isFinite(t)) return '';
  const diff = Date.now() - t;
  const seconds = Math.max(0, Math.floor(diff / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getConditionColor(condition: string | undefined): string {
  const c = String(condition ?? '');
  if (c.includes('New')) return '#10B981';
  if (c.includes('Excellent')) return '#3B82F6';
  return '#F59E0B';
}

export function MarketplaceModeration() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'reported' | 'sold'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [counts, setCounts] = useState({ pending: 0, approved: 0, reported: 0, sold: 0 });
  const [isCountsLoading, setIsCountsLoading] = useState(false);

  const backendStatusForTab = (tab: typeof activeTab): string => {
    if (tab === 'pending') return 'Pending';
    if (tab === 'approved') return 'Approved';
    if (tab === 'sold') return 'Sold';
    // Backend doesn't have "Reported" for store items; map to Rejected.
    return 'Rejected';
  };

  const refreshCounts = useCallback(async () => {
    setIsCountsLoading(true);
    try {
      const [pending, approved, reported, sold] = await Promise.all([
        getAdminStoreItemsCount({ status: 'Pending' }),
        getAdminStoreItemsCount({ status: 'Approved' }),
        getAdminStoreItemsCount({ status: 'Rejected' }),
        getAdminStoreItemsCount({ status: 'Sold' }),
      ]);
      setCounts({ pending, approved, reported, sold });
    } catch (err) {
      setCounts({ pending: 0, approved: 0, reported: 0, sold: 0 });
    } finally {
      setIsCountsLoading(false);
    }
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const status = backendStatusForTab(activeTab);
      const data = await getAdminStoreItems({ status, limit: 100 });

      const term = searchTerm.trim().toLowerCase();
      const filtered =
        term.length === 0
          ? data
          : data.filter((item) => {
              const title = String(item.title ?? '').toLowerCase();
              const description = String(item.description ?? '').toLowerCase();
              const seller = String(item.createdBy?.fullName ?? '').toLowerCase();
              return title.includes(term) || description.includes(term) || seller.includes(term);
            });

      setItems(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('marketplace.toasts.loadError'));
      toast.error(t('marketplace.toasts.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchTerm, t]);

  useEffect(() => {
    void refreshCounts();
  }, [refreshCounts]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const handleApprove = async (itemId: string | undefined) => {
    if (!itemId) return;
    try {
      setActionId(itemId);
      const res = await approveStoreItem(itemId);
      if (res?.success) {
        toast.success(res.message ?? t('marketplace.toasts.itemApproved'));
        await Promise.all([fetchItems(), refreshCounts()]);
      } else {
        toast.error(res?.message ?? t('marketplace.toasts.approveFailed'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('marketplace.toasts.approveFailed'));
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (itemId: string | undefined) => {
    if (!itemId) return;
    try {
      setActionId(itemId);
      const res = await rejectStoreItem(itemId);
      if (res?.success) {
        toast.success(res.message ?? t('marketplace.toasts.itemRejected'));
        await Promise.all([fetchItems(), refreshCounts()]);
      } else {
        toast.error(res?.message ?? t('marketplace.toasts.rejectFailed'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('marketplace.toasts.rejectFailed'));
    } finally {
      setActionId(null);
    }
  };

  const handleFeature = async (item: StoreItem) => {
    const itemId = item.id ?? item._id;
    if (!itemId) return;
    try {
      setActionId(itemId);
      const res = await setStoreItemFeatured(itemId, !item.isFeatured);
      if (res?.success) {
        toast.success(res.message ?? t('marketplace.toasts.itemFeatured'));
        await Promise.all([fetchItems(), refreshCounts()]);
      } else {
        toast.error(res?.message ?? t('marketplace.toasts.featureFailed'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('marketplace.toasts.featureFailed'));
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (itemId: string | undefined) => {
    if (!itemId) return;
    try {
      setActionId(itemId);
      const res = await deleteStoreItem(itemId);
      if (res?.success) {
        toast.success(res.message ?? 'Item deleted successfully');
        setShowDeleteModal(null);
        await Promise.all([fetchItems(), refreshCounts()]);
      } else {
        toast.error(res?.message ?? 'Failed to delete item');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setActionId(null);
    }
  };

  const formatPrice = (item: StoreItem) => {
    const symbol = item.currency === 'AED' ? 'AED' : item.currency;
    return `${symbol} ${Number(item.price).toLocaleString()}`;
  };

  const getItemImage = (item: StoreItem): string | undefined =>
    item.coverImage ?? (item.photos?.length ? item.photos[0] : undefined);

  const handleMarkSold = async (itemId: string | undefined) => {
    if (!itemId) return;
    try {
      setActionId(itemId);
      const res = await markStoreItemSold(itemId);
      if (res?.success) {
        toast.success(res.message ?? 'Item marked as sold');
        await Promise.all([fetchItems(), refreshCounts()]);
      } else {
        toast.error(res?.message ?? 'Failed to mark item as sold');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to mark item as sold');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('marketplace.title')}</h1>
        <p style={{ color: '#666' }}>{t('marketplace.subtitle')}</p>
      </div>

      {error ? (
        <div className="p-6 rounded-2xl bg-red-50 text-red-700">{error}</div>
      ) : null}

      {/* Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: '#ECC180' }}>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>Pending Review</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>
            {isCountsLoading ? '—' : counts.pending.toLocaleString()}
          </p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5" style={{ color: '#10B981' }} />
            <span className="text-sm" style={{ color: '#666' }}>Approved</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>
            {isCountsLoading ? '—' : counts.approved.toLocaleString()}
          </p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-2">
            <Ban className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>Reported</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>
            {isCountsLoading ? '—' : counts.reported.toLocaleString()}
          </p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-5 h-5" style={{ color: '#F59E0B' }} />
            <span className="text-sm" style={{ color: '#666' }}>Sold</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>
            {isCountsLoading ? '—' : counts.sold.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
          <input
            type="text"
            placeholder="Search by item or seller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {(['pending', 'approved', 'reported', 'sold'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-3 px-2 text-sm capitalize"
              style={{
                color: activeTab === tab ? '#C12D32' : '#666',
                borderBottom: activeTab === tab ? '2px solid #C12D32' : '2px solid transparent',
              }}
            >
              {tab} ({isCountsLoading ? '—' : counts[tab].toLocaleString()})
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#C12D32' }} />
        </div>
      ) : null}

      {!isLoading && items.length === 0 ? (
        <div className="text-center py-12 p-6 rounded-2xl bg-white">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#ECC180' }} />
          <h3 className="text-xl mb-2" style={{ color: '#333' }}>
            No {activeTab} items
          </h3>
          <p style={{ color: '#666' }}>
            {searchTerm.trim()
              ? 'Try adjusting your search'
              : activeTab === 'pending'
                ? 'All items have been reviewed'
                : activeTab === 'approved'
                  ? 'No approved items yet'
                  : activeTab === 'reported'
                    ? 'No reported items at the moment'
                    : 'No sold items yet'}
          </p>
        </div>
      ) : null}

      {!isLoading && items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => {
            const itemId = item.id ?? item._id;
            const imageUrl = getItemImage(item);
            const sellerName = item.createdBy?.fullName ?? '—';
            const sellerAvatar = (item as any).createdBy?.profileImage ?? (item as any).sellerAvatar ?? null;
            const views = (item as any).views ?? (item as any).viewCount ?? 0;
            const createdLabel = timeAgo(item.createdAt);
            const reportReason = (item as any).reportReason ?? (item as any).reportedReason ?? null;

            return (
              <div
                key={itemId ?? item.title + item.price}
                className="p-6 rounded-2xl shadow-sm bg-white hover:shadow-md transition-all relative"
              >
                {item.isFeatured ? (
                  <div
                    className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs text-white flex items-center gap-1"
                    style={{ backgroundColor: '#F59E0B' }}
                  >
                    <Star className="w-3 h-3 fill-current" />
                    Featured
                  </div>
                ) : null}

                {activeTab === 'reported' ? (
                  <div
                    className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs text-white"
                    style={{ backgroundColor: '#EF4444' }}
                  >
                    ⚠️ Reported
                  </div>
                ) : null}

                <div className="flex gap-4">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.title}
                      className="w-32 h-32 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => itemId && navigate(`/marketplace/${itemId}/edit`)}
                    />
                  ) : (
                    <div
                      className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center"
                      style={{ color: '#999' }}
                    >
                      {t('marketplace.noImage', 'No image')}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium mb-1 truncate" style={{ color: '#333' }}>
                      {item.title}
                    </h3>
                    <p className="text-lg mb-2" style={{ color: '#C12D32' }}>
                      {formatPrice(item)}
                    </p>

                    <div className="flex items-center gap-2 mb-2">
                      {sellerAvatar ? (
                        <img src={sellerAvatar} alt={sellerName} className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs" style={{ color: '#666' }}>
                          {sellerName.trim().slice(0, 1).toUpperCase() || '—'}
                        </div>
                      )}
                      <span className="text-sm" style={{ color: '#666' }}>{sellerName}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {item.condition ? (
                        <span
                          className="px-2 py-1 rounded text-xs text-white"
                          style={{ backgroundColor: getConditionColor(item.condition) }}
                        >
                          {item.condition}
                        </span>
                      ) : null}
                      {item.category ? (
                        <span className="text-xs" style={{ color: '#999' }}>
                          {item.category}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-3 text-xs mb-3" style={{ color: '#999' }}>
                      <span>👁️ {Number(views || 0).toLocaleString()} views</span>
                      {createdLabel ? <span>{createdLabel}</span> : null}
                    </div>

                    {activeTab === 'reported' && reportReason ? (
                      <div
                        className="p-2 rounded text-xs mb-3"
                        style={{ backgroundColor: '#FEF2F2', color: '#C12D32' }}
                      >
                        ⚠️ {reportReason}
                      </div>
                    ) : null}

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => itemId && navigate(`/marketplace/${itemId}/edit`)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all hover:shadow-md"
                        style={{ backgroundColor: '#ECC180', color: '#333' }}
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>

                      {activeTab !== 'sold' ? (
                        <button
                          onClick={() => handleApprove(itemId)}
                          disabled={actionId === itemId || activeTab === 'approved'}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{ backgroundColor: '#10B981' }}
                        >
                          <CheckCircle className="w-3 h-3" />
                          {actionId === itemId ? '...' : 'Approve'}
                        </button>
                      ) : null}

                      {activeTab !== 'sold' ? (
                        <button
                          onClick={() => handleReject(itemId)}
                          disabled={actionId === itemId}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{ backgroundColor: '#C12D32' }}
                        >
                          <XCircle className="w-3 h-3" />
                          {actionId === itemId ? '...' : 'Reject'}
                        </button>
                      ) : null}

                      {activeTab === 'approved' ? (
                        <>
                          <button
                            onClick={() => handleFeature(item)}
                            disabled={actionId === itemId}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ backgroundColor: item.isFeatured ? '#6B7280' : '#F59E0B', color: '#fff' }}
                          >
                            <Star className="w-3 h-3" />
                            {actionId === itemId ? '...' : item.isFeatured ? 'Unfeature' : 'Feature'}
                          </button>
                          <button
                            onClick={() => handleMarkSold(itemId)}
                            disabled={actionId === itemId}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#6B7280', color: '#fff' }}
                          >
                            {actionId === itemId ? '...' : 'Mark Sold'}
                          </button>
                        </>
                      ) : null}

                      <button
                        onClick={() => itemId && setShowDeleteModal(itemId)}
                        disabled={actionId === itemId || !itemId}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#374151' }}
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {showDeleteModal ? (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl mb-2" style={{ color: '#333' }}>Delete Item</h3>
            <p className="text-sm mb-6" style={{ color: '#666' }}>
              Are you sure you want to permanently delete this listing? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 rounded-lg border border-gray-200"
                style={{ color: '#666' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(showDeleteModal)}
                disabled={actionId === showDeleteModal}
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: '#374151', opacity: actionId === showDeleteModal ? 0.6 : 1 }}
              >
                {actionId === showDeleteModal ? 'Deleting...' : 'Delete Item'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
