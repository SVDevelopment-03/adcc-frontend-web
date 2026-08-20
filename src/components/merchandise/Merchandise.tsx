import React, { useEffect, useState } from 'react';
import { Package, Layers, ShoppingBag, BarChart3, TrendingUp, Star, AlertCircle, Shield, Store } from 'lucide-react';
import { toast } from 'sonner';
import { Product, Category, Order } from './merchandiseData';
import { MerchandiseProducts } from './MerchandiseProducts';
import { MerchandiseCategories } from './MerchandiseCategories';
import { MerchandiseOrders } from './MerchandiseOrders';
import { MerchandiseBannerUploader } from './MerchandiseBannerUploader';
import {
  getMerchandiseProducts,
  getMerchandiseCategories,
  getMerchandiseOrders,
} from '../../services/merchandiseApi';

type MerchandiseTab = 'overview' | 'adcc-products' | 'vendor-products' | 'categories' | 'orders';

interface MerchandiseProps {
  navigate: (page: string) => void;
}

export function Merchandise({ navigate }: MerchandiseProps) {
  const [activeTab, setActiveTab] = useState<MerchandiseTab>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = {
    totalProducts: products.length,
    published: products.filter(p => p.status === 'published').length,
    draft: products.filter(p => p.status === 'draft').length,
    lowStock: products.filter(p => p.totalStock < 10 && p.status === 'published').length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    revenue: orders.filter(o => !['cancelled', 'refunded'].includes(o.status)).reduce((s, o) => s + o.total, 0),
    totalSold: products.reduce((s, p) => s + p.sold, 0),
  };

  const adccProducts = products.filter(p => !p.source || p.source === 'adcc');
  const vendorProducts = products.filter(p => p.source === 'vendor');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [loadedProducts, loadedCategories, loadedOrders] = await Promise.all([
          getMerchandiseProducts({ limit: 200 }),
          getMerchandiseCategories(),
          getMerchandiseOrders({ limit: 200 }),
        ]);
        setProducts(loadedProducts);
        setCategories(loadedCategories);
        setOrders(loadedOrders);
      } catch (error) {
        toast.error((error as Error)?.message || 'Failed to load merchandise data');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const tabs: { id: MerchandiseTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'adcc-products', label: 'ADCC Products', icon: <Shield className="w-4 h-4" /> },
    { id: 'vendor-products', label: 'Vendor Products', icon: <Store className="w-4 h-4" /> },
    { id: 'categories', label: 'Categories', icon: <Layers className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl mb-1" style={{ color: '#333' }}>Club Merchandise</h1>
          <p style={{ color: '#666' }}>Manage ADCC official products, orders and the member shop</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ backgroundColor: '#F5F5F5' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all"
            style={{
              backgroundColor: activeTab === tab.id ? '#fff' : 'transparent',
              color: activeTab === tab.id ? '#C12D32' : '#666',
              boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading merchandise data...</div>
      ) : activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Products', value: stats.totalProducts, sub: `${stats.published} published`, color: '#333', bg: '#FFF9EF', icon: <Package className="w-5 h-5" /> },
              { label: 'Total Revenue', value: `AED ${stats.revenue.toLocaleString()}`, sub: `${stats.totalSold} units sold`, color: '#C12D32', bg: '#FEF2F2', icon: <TrendingUp className="w-5 h-5" /> },
              { label: 'Total Orders', value: stats.totalOrders, sub: `${stats.pendingOrders} pending`, color: '#3B82F6', bg: '#EFF6FF', icon: <ShoppingBag className="w-5 h-5" /> },
              { label: 'Low Stock', value: stats.lowStock, sub: 'items need restocking', color: '#F59E0B', bg: '#FFFBEB', icon: <AlertCircle className="w-5 h-5" /> },
            ].map(kpi => (
              <div key={kpi.label} className="p-5 rounded-2xl shadow-sm" style={{ backgroundColor: kpi.bg }}>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: kpi.color }}>{kpi.icon}</span>
                  <span className="text-sm" style={{ color: '#666' }}>{kpi.label}</span>
                </div>
                <p className="text-2xl mb-0.5" style={{ color: kpi.color }}>{kpi.value}</p>
                <p className="text-xs" style={{ color: '#999' }}>{kpi.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Best Sellers */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5" style={{ color: '#F59E0B' }} />
                <h3 className="text-lg" style={{ color: '#333' }}>Best Sellers</h3>
              </div>
              <div className="space-y-3">
                {[...products].sort((a, b) => b.sold - a.sold).slice(0, 5).map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium" style={{ backgroundColor: idx === 0 ? '#ECC180' : '#F5F5F5', color: '#333' }}>
                      {idx + 1}
                    </span>
                    <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: '#333' }}>{p.name}</p>
                      <p className="text-xs" style={{ color: '#999' }}>AED {p.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium" style={{ color: '#C12D32' }}>{p.sold}</p>
                      <p className="text-xs" style={{ color: '#999' }}>sold</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg" style={{ color: '#333' }}>Recent Orders</h3>
                <button onClick={() => setActiveTab('orders')} className="text-xs" style={{ color: '#C12D32' }}>View all</button>
              </div>
              <div className="space-y-3">
                {orders.slice(0, 5).map(order => {
                  const statusColors: Record<string, { color: string; bg: string }> = {
                    pending: { color: '#F59E0B', bg: '#FFFBEB' },
                    confirmed: { color: '#3B82F6', bg: '#EFF6FF' },
                    processing: { color: '#8B5CF6', bg: '#F5F3FF' },
                    shipped: { color: '#0EA5E9', bg: '#F0F9FF' },
                    delivered: { color: '#10B981', bg: '#ECFDF5' },
                    cancelled: { color: '#6B7280', bg: '#F9FAFB' },
                    refunded: { color: '#C12D32', bg: '#FEF2F2' },
                  };
                  const sc = statusColors[order.status] || { color: '#666', bg: '#F9FAFB' };
                  return (
                    <div key={order.id} className="flex items-center gap-3">
                      <img src={order.userAvatar} alt="" className="w-8 h-8 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ color: '#333' }}>{order.userName}</p>
                        <p className="text-xs" style={{ color: '#999' }}>{order.orderNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm" style={{ color: '#333' }}>AED {order.total}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ color: sc.color, backgroundColor: sc.bg }}>{order.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>Category Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {categories.map(cat => {
                const catProducts = products.filter(p => p.categoryId === cat.id);
                const catRevenue = catProducts.reduce((s, p) => s + p.price * p.sold, 0);
                return (
                  <div key={cat.id} className="p-4 rounded-xl text-center" style={{ backgroundColor: '#FFF9EF' }}>
                    <div className="text-3xl mb-2">{cat.icon}</div>
                    <p className="text-sm font-medium mb-1" style={{ color: '#333' }}>{cat.name}</p>
                    <p className="text-xs" style={{ color: '#666' }}>{catProducts.length} products</p>
                    <p className="text-xs mt-0.5" style={{ color: '#C12D32' }}>AED {catRevenue.toLocaleString()}</p>
                    {!cat.active && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inactive</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <MerchandiseBannerUploader variant="en" />

          <MerchandiseBannerUploader variant="ar" />

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'ADCC Products', icon: <Shield className="w-5 h-5" />, tab: 'adcc-products' as MerchandiseTab, color: '#C12D32' },
              { label: 'Vendor Products', icon: <Store className="w-5 h-5" />, tab: 'vendor-products' as MerchandiseTab, color: '#3B82F6' },
              { label: 'View Orders', icon: <ShoppingBag className="w-5 h-5" />, tab: 'orders' as MerchandiseTab, color: '#10B981' },
            ].map(action => (
              <button
                key={action.label}
                onClick={() => setActiveTab(action.tab)}
                className="flex flex-col items-center gap-2 p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${action.color}15` }}>
                  <span style={{ color: action.color }}>{action.icon}</span>
                </div>
                <span className="text-sm" style={{ color: '#333' }}>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'adcc-products' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: '#FFF9EF', border: '1px solid #ECC180' }}>
            <Shield className="w-5 h-5" style={{ color: '#C12D32' }} />
            <div>
              <p className="font-medium" style={{ color: '#333' }}>ADCC Community Products</p>
              <p className="text-sm" style={{ color: '#666' }}>Official ADCC branded merchandise — jerseys, accessories, lifestyle and equipment.</p>
            </div>
            <span className="ml-auto px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#C12D32', color: '#fff' }}>
              {adccProducts.length} products
            </span>
          </div>
          <MerchandiseProducts
            products={adccProducts}
            categories={categories}
            defaultSource="adcc"
            setProducts={(updater) => {
              setProducts(prev => {
                const currentAdcc = prev.filter(p => !p.source || p.source === 'adcc');
                const updated = typeof updater === 'function' ? updater(currentAdcc) : updater;
                const vendorOnly = prev.filter(p => p.source === 'vendor');
                return [...updated, ...vendorOnly];
              });
            }}
          />
        </div>
      )}

      {activeTab === 'vendor-products' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <Store className="w-5 h-5" style={{ color: '#3B82F6' }} />
            <div>
              <p className="font-medium" style={{ color: '#333' }}>Other Vendor Products</p>
              <p className="text-sm" style={{ color: '#666' }}>Products from partner vendors and third-party suppliers listed on the ADCC store.</p>
            </div>
            <span className="ml-auto px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#3B82F6', color: '#fff' }}>
              {vendorProducts.length} products
            </span>
          </div>
          <MerchandiseProducts
            products={vendorProducts}
            categories={categories}
            defaultSource="vendor"
            setProducts={(updater) => {
              setProducts(prev => {
                const currentVendor = prev.filter(p => p.source === 'vendor');
                const updated = typeof updater === 'function' ? updater(currentVendor) : updater;
                const adccOnly = prev.filter(p => !p.source || p.source === 'adcc');
                return [...adccOnly, ...updated];
              });
            }}
          />
        </div>
      )}

      {activeTab === 'categories' && (
        <MerchandiseCategories categories={categories} setCategories={setCategories} />
      )}

      {activeTab === 'orders' && (
        <MerchandiseOrders orders={orders} setOrders={setOrders} />
      )}

    </div>
  );
}
