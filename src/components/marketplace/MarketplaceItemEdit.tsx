import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getStoreItemById, updateStoreItem, StoreItem } from '../../services/storeApi';

export function MarketplaceItemEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<StoreItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    currency: 'AED',
    price: '',
    contactMethod: 'InApp' as 'Call' | 'WhatsApp' | 'InApp',
    phoneNumber: '',
    city: '',
  });

  useEffect(() => {
    if (!id) return;
    const loadItem = async () => {
      try {
        setLoading(true);
        const data = await getStoreItemById(id);
        setItem(data);
        setFormData({
          title: data.title || '',
          description: data.description || '',
          category: data.category || '',
          condition: data.condition || '',
          currency: data.currency || 'AED',
          price: String(data.price ?? ''),
          contactMethod:
            data.contactMethod === 'Call' || data.contactMethod === 'WhatsApp'
              ? data.contactMethod
              : 'InApp',
          phoneNumber: data.phoneNumber || '',
          city: data.city || '',
        });
      } catch (error: any) {
        toast.error(error?.message || t('marketplace.toasts.loadError'));
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [id, t]);

  const handleSave = async () => {
    if (!id) return;

    const title = formData.title.trim();
    const description = formData.description.trim();
    const category = formData.category.trim();
    const condition = formData.condition.trim();
    const city = formData.city.trim();
    const currency = (formData.currency || 'AED').trim();
    const price = Number(formData.price);
    const phoneNumber = formData.phoneNumber.trim();
    const contactMethod = formData.contactMethod;

    if (!title || !description || !category || !condition || !city) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if ((contactMethod === 'Call' || contactMethod === 'WhatsApp') && phoneNumber.length < 5) {
      toast.error('Please enter a valid phone number');
      return;
    }

    try {
      setSaving(true);
      const res = await updateStoreItem(id, {
        title,
        description,
        category,
        condition,
        currency,
        price,
        contactMethod,
        phoneNumber: contactMethod === 'InApp' ? undefined : phoneNumber,
        city,
      });

      if (res?.success) {
        toast.success(res.message || 'Product updated successfully');
        navigate('/marketplace');
      } else {
        toast.error(res?.message || 'Failed to update product');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#C12D32' }} />
      </div>
    );
  }

  if (!item) {
    return <div className="text-center py-8" style={{ color: '#666' }}>Product not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/marketplace')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('marketplace.editItem', 'Edit Product')}</h1>
          <p style={{ color: '#666' }}>{item.title}</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl shadow-sm bg-white space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2" style={{ color: '#666' }}>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: '#666' }}>Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: '#666' }}>Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: '#666' }}>Condition</label>
            <input
              type="text"
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: '#666' }}>City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: '#666' }}>Contact Method</label>
            <select
              value={formData.contactMethod}
              onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value as 'Call' | 'WhatsApp' | 'InApp' })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="InApp">InApp</option>
              <option value="Call">Call</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-2" style={{ color: '#666' }}>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        {formData.contactMethod !== 'InApp' && (
          <div>
            <label className="block text-sm mb-2" style={{ color: '#666' }}>Phone Number</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all hover:shadow-lg disabled:opacity-60"
            style={{ backgroundColor: '#C12D32' }}
          >
            <Save className="w-5 h-5" />
            <span>{saving ? t('common.saving', 'Saving...') : t('marketplace.saveChanges', 'Save Changes')}</span>
          </button>
          <button
            onClick={() => navigate('/marketplace')}
            disabled={saving}
            className="px-6 py-3 rounded-xl border border-gray-200"
            style={{ color: '#666' }}
          >
            {t('common.cancel', 'Cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
