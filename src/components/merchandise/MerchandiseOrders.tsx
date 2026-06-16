import React, { useState } from 'react';
import {
  Search, ChevronDown, Package, Truck, CheckCircle, XCircle,
  Clock, RefreshCw, Eye, X, MapPin, CreditCard, Phone
} from 'lucide-react';
import { toast } from 'sonner';
import { Order, OrderStatus } from './merchandiseData';
import { updateMerchandiseOrderStatus, updateMerchandiseOrderTracking } from '../../services/merchandiseApi';

interface MerchandiseOrdersProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: '#F59E0B', bg: '#FFFBEB', icon: <Clock className="w-3.5 h-3.5" /> },
  confirmed: { label: 'Confirmed', color: '#3B82F6', bg: '#EFF6FF', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  processing: { label: 'Processing', color: '#8B5CF6', bg: '#F5F3FF', icon: <RefreshCw className="w-3.5 h-3.5" /> },
  shipped: { label: 'Shipped', color: '#0EA5E9', bg: '#F0F9FF', icon: <Truck className="w-3.5 h-3.5" /> },
  delivered: { label: 'Delivered', color: '#10B981', bg: '#ECFDF5', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Cancelled', color: '#6B7280', bg: '#F9FAFB', icon: <XCircle className="w-3.5 h-3.5" /> },
  refunded: { label: 'Refunded', color: '#C12D32', bg: '#FEF2F2', icon: <RefreshCw className="w-3.5 h-3.5" /> },
};

const statusFlow: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export function MerchandiseOrders({ orders, setOrders }: MerchandiseOrdersProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | OrderStatus>('all');
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  const filtered = orders.filter(o => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.userName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const updated = await updateMerchandiseOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
      if (viewOrder?.id === orderId) setViewOrder(prev => prev ? { ...prev, ...updated } : null);
      toast.success(`Order status updated to ${statusConfig[status].label}`);
    } catch (error) {
      toast.error((error as Error)?.message || 'Failed to update order status');
    }
  };

  const saveTracking = async (orderId: string) => {
    if (!trackingInput.trim()) return;
    try {
      const updated = await updateMerchandiseOrderTracking(orderId, trackingInput.trim());
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
      if (viewOrder?.id === orderId) setViewOrder(prev => prev ? { ...prev, ...updated } : null);
      toast.success('Tracking number saved');
      setTrackingInput('');
    } catch (error) {
      toast.error((error as Error)?.message || 'Failed to save tracking number');
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => ['confirmed', 'processing'].includes(o.status)).length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => !['cancelled', 'refunded'].includes(o.status)).reduce((s, o) => s + o.total, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, color: '#333', bg: '#FFF9EF', icon: <Package className="w-4 h-4" /> },
          { label: 'Pending', value: stats.pending, color: '#F59E0B', bg: '#FFFBEB', icon: <Clock className="w-4 h-4" /> },
          { label: 'Processing', value: stats.processing, color: '#8B5CF6', bg: '#F5F3FF', icon: <RefreshCw className="w-4 h-4" /> },
          { label: 'Shipped', value: stats.shipped, color: '#0EA5E9', bg: '#F0F9FF', icon: <Truck className="w-4 h-4" /> },
          { label: 'Delivered', value: stats.delivered, color: '#10B981', bg: '#ECFDF5', icon: <CheckCircle className="w-4 h-4" /> },
          { label: 'Revenue (AED)', value: stats.revenue.toLocaleString(), color: '#C12D32', bg: '#FEF2F2', icon: <CreditCard className="w-4 h-4" /> },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl shadow-sm" style={{ backgroundColor: s.bg }}>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: s.color }}>{s.icon}</span>
              <span className="text-xs" style={{ color: '#666' }}>{s.label}</span>
            </div>
            <p className="text-xl" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#999' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order # or customer..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
        >
          <option value="all">All Status</option>
          {(Object.keys(statusConfig) as OrderStatus[]).map(s => (
            <option key={s} value={s}>{statusConfig[s].label}</option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filtered.map(order => {
          const st = statusConfig[order.status];
          return (
            <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={order.userAvatar} alt={order.userName} className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium" style={{ color: '#333' }}>{order.orderNumber}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ color: st.color, backgroundColor: st.bg }}>
                        {st.icon}
                        {st.label}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: '#666' }}>{order.userName} · {new Date(order.createdAt).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: '#333' }}>AED {order.total.toLocaleString()}</p>
                    <p className="text-xs" style={{ color: '#999' }}>{order.items.reduce((s, i) => s + i.quantity, 0)} items</p>
                  </div>
                  <button
                    onClick={() => { setViewOrder(order); setTrackingInput(order.trackingNumber || ''); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all hover:shadow-sm"
                    style={{ backgroundColor: '#ECC180', color: '#333' }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                </div>
              </div>

              {/* Items preview */}
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl shrink-0" style={{ backgroundColor: '#FFF9EF' }}>
                    <img src={item.productImage} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <p className="text-xs" style={{ color: '#333' }}>{item.productName}</p>
                      <p className="text-xs" style={{ color: '#999' }}>
                        {[item.size, item.color].filter(Boolean).join(' / ')} · x{item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick status actions */}
              {!['delivered', 'cancelled', 'refunded'].includes(order.status) && (
                <div className="flex gap-2 mt-3">
                  {statusFlow.map((s, idx) => {
                    const currentIdx = statusFlow.indexOf(order.status as OrderStatus);
                    const isNext = idx === currentIdx + 1;
                    return isNext ? (
                      <button
                        key={s}
                        onClick={() => updateStatus(order.id, s)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-white transition-all hover:shadow-md"
                        style={{ backgroundColor: '#C12D32' }}
                      >
                        {statusConfig[s].icon}
                        Mark as {statusConfig[s].label}
                      </button>
                    ) : null;
                  })}
                  <button
                    onClick={() => updateStatus(order.id, 'cancelled')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all hover:bg-gray-100"
                    style={{ color: '#6B7280', backgroundColor: '#F9FAFB' }}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Package className="w-12 h-12 mx-auto mb-3" style={{ color: '#ECC180' }} />
            <p style={{ color: '#666' }}>No orders found</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto" onClick={() => setViewOrder(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full my-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl" style={{ color: '#333' }}>{viewOrder.orderNumber}</h3>
                <p className="text-sm" style={{ color: '#666' }}>
                  Placed {new Date(viewOrder.createdAt).toLocaleString('en-AE')}
                </p>
              </div>
              <button onClick={() => setViewOrder(null)}><X className="w-5 h-5" style={{ color: '#666' }} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Customer + Shipping */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFF9EF' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <img src={viewOrder.userAvatar} alt="" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#333' }}>{viewOrder.userName}</p>
                      <p className="text-xs" style={{ color: '#666' }}>{viewOrder.userEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" style={{ color: '#C12D32' }} />
                    <p className="text-sm font-medium" style={{ color: '#333' }}>Shipping Address</p>
                  </div>
                  <p className="text-sm" style={{ color: '#666' }}>{viewOrder.shippingAddress.name}</p>
                  <p className="text-sm" style={{ color: '#666' }}>{viewOrder.shippingAddress.line1}</p>
                  <p className="text-sm" style={{ color: '#666' }}>{viewOrder.shippingAddress.city}, {viewOrder.shippingAddress.emirate}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Phone className="w-3.5 h-3.5" style={{ color: '#999' }} />
                    <p className="text-sm" style={{ color: '#666' }}>{viewOrder.shippingAddress.phone}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4" style={{ color: '#3B82F6' }} />
                    <p className="text-sm font-medium" style={{ color: '#333' }}>Payment</p>
                  </div>
                  <p className="text-sm" style={{ color: '#666' }}>
                    {viewOrder.paymentMethod}
                    {viewOrder.paymentLast4 && ` ···· ${viewOrder.paymentLast4}`}
                  </p>
                </div>

                {/* Tracking */}
                <div className="p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4" style={{ color: '#0EA5E9' }} />
                    <p className="text-sm font-medium" style={{ color: '#333' }}>Tracking</p>
                  </div>
                  {viewOrder.trackingNumber ? (
                    <p className="text-sm font-mono" style={{ color: '#333' }}>{viewOrder.trackingNumber}</p>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={trackingInput}
                        onChange={e => setTrackingInput(e.target.value)}
                        placeholder="Enter tracking number..."
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                      <button onClick={() => saveTracking(viewOrder.id)} className="px-3 py-1.5 rounded-lg text-white text-sm" style={{ backgroundColor: '#C12D32' }}>Save</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Items + Summary */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-3" style={{ color: '#333' }}>Order Items</p>
                  <div className="space-y-3">
                    {viewOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F9FAFB' }}>
                        <img src={item.productImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate" style={{ color: '#333' }}>{item.productName}</p>
                          <p className="text-xs" style={{ color: '#999' }}>
                            {[item.size, item.color].filter(Boolean).join(' / ')} · x{item.quantity}
                          </p>
                        </div>
                        <p className="text-sm" style={{ color: '#C12D32' }}>AED {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFF9EF' }}>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#666' }}>Subtotal</span>
                      <span style={{ color: '#333' }}>AED {viewOrder.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#666' }}>Shipping</span>
                      <span style={{ color: viewOrder.shipping === 0 ? '#10B981' : '#333' }}>
                        {viewOrder.shipping === 0 ? 'Free' : `AED ${viewOrder.shipping}`}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-medium" style={{ color: '#333' }}>Total</span>
                      <span className="font-medium" style={{ color: '#C12D32' }}>AED {viewOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#333' }}>Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(statusConfig) as OrderStatus[]).map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(viewOrder.id, s)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all"
                        style={{
                          backgroundColor: viewOrder.status === s ? statusConfig[s].bg : '#F9FAFB',
                          color: viewOrder.status === s ? statusConfig[s].color : '#666',
                          border: viewOrder.status === s ? `1.5px solid ${statusConfig[s].color}` : '1.5px solid transparent',
                        }}
                      >
                        {statusConfig[s].icon}
                        {statusConfig[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => setViewOrder(null)} className="w-full mt-6 py-3 rounded-xl border border-gray-200 text-sm hover:bg-gray-50" style={{ color: '#666' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
