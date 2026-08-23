import React, { useEffect, useState } from 'react';
import { getProductBannersAr, deleteProductBannerAr, deleteAllProductBannersAr, ProductBanner } from '../../services/merchandiseApi';
import { toast } from 'sonner';

export const ProductBannersArAdmin: React.FC = () => {
  const [banners, setBanners] = useState<ProductBanner[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getProductBannersAr();
      setBanners(res);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load Arabic product banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDelete = async (key: string) => {
    if (!confirm('Delete this Arabic banner?')) return;
    try {
      await deleteProductBannerAr(key);
      toast.success('Deleted');
      setBanners((s) => s.filter((b) => b.key !== key));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete banner');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Delete ALL Arabic product banners? This cannot be undone.')) return;
    setDeletingAll(true);
    try {
      await deleteAllProductBannersAr();
      setBanners([]);
      toast.success('All Arabic banners deleted');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete all banners');
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="rounded-2xl p-8 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl" style={{ color: '#333' }}>Arabic Product Banners</h2>
        <div>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white mr-2"
            onClick={handleDeleteAll}
            disabled={deletingAll || banners.length === 0}
          >
            {deletingAll ? 'Deleting...' : 'Delete All'}
          </button>
          <button className="px-4 py-2 rounded bg-gray-100" onClick={load} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : banners.length === 0 ? (
        <div className="p-6 text-gray-600">No Arabic banners found.</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {banners.map((b) => (
            <div key={b.key} className="border rounded p-3 flex flex-col">
              {b.image ? (
                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                <img src={b.image} alt={`banner-${b.key}`} className="w-full h-40 object-contain mb-3" />
              ) : (
                <div className="w-full h-40 bg-gray-100 mb-3 flex items-center justify-center">No image</div>
              )}
              <div className="flex-1">
                <div className="font-semibold text-lg text-gray-800">{b.title || b.label || b.key}</div>
                <div className="text-sm text-gray-600 mt-1">{b.description}</div>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={() => handleDelete(b.key)}>Delete</button>
                <a className="px-3 py-1 rounded bg-blue-600 text-white" href={b.image} target="_blank" rel="noreferrer">Open</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductBannersArAdmin;
