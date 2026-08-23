import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getProductBannersAr, deleteProductBannerAr, deleteAllProductBannersAr, ProductBanner } from '../../services/merchandiseApi';

export function ProductBannersArAdmin() {
  const [banners, setBanners] = useState<ProductBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingAll, setDeletingAll] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const items = await getProductBannersAr();
      setBanners(items);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load Arabic product banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const handleDelete = async (key: string) => {
    if (!confirm(`Delete banner ${key}?`)) return;
    try {
      await deleteProductBannerAr(key);
      setBanners(prev => prev.filter(b => b.key !== key));
      toast.success('Banner deleted');
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Delete ALL Arabic product banners? This cannot be undone.')) return;
    setDeletingAll(true);
    try {
      await deleteAllProductBannersAr();
      setBanners([]);
      toast.success('All Arabic banners deleted');
    } catch (e: any) {
      toast.error(e?.message || 'Delete all failed');
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">Arabic Product Banners</h1>
          <p className="text-sm text-gray-500">List and delete Arabic product banners used by the mobile app.</p>
        </div>
        <div>
          <button
            onClick={handleDeleteAll}
            className="px-3 py-2 rounded bg-red-600 text-white"
            disabled={deletingAll || loading}
          >
            {deletingAll ? 'Deleting…' : 'Delete All Arabic Banners'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-500">Loading…</div>
      ) : banners.length === 0 ? (
        <div className="py-10 text-center text-gray-500">No Arabic product banners found.</div>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div key={b.key} className="flex items-center gap-3 p-3 rounded border">
              <img src={b.image} alt={b.title || b.label} className="w-28 h-16 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm truncate" style={{ maxWidth: 600 }}>{b.title || b.label || b.key}</div>
                    <div className="text-xs text-gray-500">{b.key} • {b.active ? 'active' : 'inactive'}</div>
                  </div>
                  <div className="text-right text-xs text-gray-500">{b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}</div>
                </div>
              </div>
              <div>
                <button onClick={() => handleDelete(b.key)} className="px-3 py-1 rounded bg-red-100 text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductBannersArAdmin;
