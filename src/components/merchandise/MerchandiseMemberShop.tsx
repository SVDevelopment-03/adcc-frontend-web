import React, { useState } from 'react';
import {
  Search, Heart, ShoppingCart, X, ChevronLeft, ChevronRight, Star,
  Minus, Plus, Truck, Shield, RotateCcw, Package, CheckCircle,
  CreditCard, MapPin, Bell, Clock, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { Product, Category, Order, OrderItem } from './merchandiseData';

interface CartItem {
  product: Product;
  variantId: string;
  size?: string;
  color?: string;
  colorHex?: string;
  quantity: number;
}

interface MemberShopProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

type ShopView = 'browse' | 'detail' | 'cart' | 'checkout' | 'confirmation' | 'history';


const statusColors: Record<string, { color: string; bg: string }> = {
  pending: { color: '#F59E0B', bg: '#FFFBEB' },
  confirmed: { color: '#3B82F6', bg: '#EFF6FF' },
  processing: { color: '#8B5CF6', bg: '#F5F3FF' },
  shipped: { color: '#0EA5E9', bg: '#F0F9FF' },
  delivered: { color: '#10B981', bg: '#ECFDF5' },
  cancelled: { color: '#6B7280', bg: '#F9FAFB' },
  refunded: { color: '#C12D32', bg: '#FEF2F2' },
};

export function MerchandiseMemberShop({ products, categories, orders, setOrders }: MemberShopProps) {
  const [view, setView] = useState<ShopView>('browse');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubcat, setActiveSubcat] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>('newest');
  const [memberOrders, setMemberOrders] = useState<Order[]>([]);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    email: '',
    phone: '',
    line1: '',
    city: '',
    emirate: '',
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    cardName: '',
  });

  const publishedProducts = products.filter(p => p.status === 'published');

  const filteredProducts = publishedProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || p.categoryId === activeCategory;
    const matchSubcat = activeSubcat === 'all' || p.subcategoryId === activeSubcat;
    return matchSearch && matchCat && matchSubcat;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'popular') return b.sold - a.sold;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartSubtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const cartShipping = cartSubtotal >= 400 ? 0 : 25;
  const cartTotal = cartSubtotal + cartShipping;

  const addToCart = () => {
    if (!selectedProduct) return;
    const variant = selectedProduct.variants[selectedVariantIdx];
    const existing = cart.find(c => c.product.id === selectedProduct.id && c.variantId === variant.id);
    if (existing) {
      setCart(c => c.map(item => item.product.id === selectedProduct.id && item.variantId === variant.id
        ? { ...item, quantity: item.quantity + quantity }
        : item
      ));
    } else {
      setCart(c => [...c, {
        product: selectedProduct,
        variantId: variant.id,
        size: variant.size,
        color: variant.color,
        colorHex: variant.colorHex,
        quantity,
      }]);
    }
    toast.success(`${selectedProduct.name} added to cart`);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(w => w.includes(productId) ? w.filter(id => id !== productId) : [...w, productId]);
    toast.success(wishlist.includes(productId) ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const removeFromCart = (productId: string, variantId: string) => {
    setCart(c => c.filter(i => !(i.product.id === productId && i.variantId === variantId)));
  };

  const updateCartQty = (productId: string, variantId: string, delta: number) => {
    setCart(c => c.map(i => {
      if (i.product.id === productId && i.variantId === variantId) {
        const newQty = i.quantity + delta;
        return newQty < 1 ? i : { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const placeOrder = () => {
    const orderItems: OrderItem[] = cart.map(i => ({
      productId: i.product.id,
      productName: i.product.name,
      productImage: i.product.images[0] || '',
      size: i.size,
      color: i.color,
      price: i.product.price,
      quantity: i.quantity,
    }));
    const newOrder: Order = {
      id: `member-${Date.now()}`,
      orderNumber: `ADCC-2024-${String(Math.floor(1000 + Math.random() * 9000))}`,
      userId: 'member1',
      userName: checkoutForm.name,
      userAvatar: 'https://i.pravatar.cc/150?img=20',
      userEmail: checkoutForm.email,
      items: orderItems,
      subtotal: cartSubtotal,
      shipping: cartShipping,
      total: cartTotal,
      status: 'confirmed',
      shippingAddress: {
        name: checkoutForm.name,
        line1: checkoutForm.line1,
        city: checkoutForm.city,
        emirate: checkoutForm.emirate,
        phone: checkoutForm.phone,
      },
      paymentMethod: checkoutForm.paymentMethod === 'card' ? 'Credit Card' : checkoutForm.paymentMethod === 'apple' ? 'Apple Pay' : 'Cash on Delivery',
      paymentLast4: checkoutForm.paymentMethod === 'card' ? checkoutForm.cardNumber.slice(-4) || '0000' : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMemberOrders(prev => [newOrder, ...prev]);
    setOrders(prev => [newOrder, ...prev]);
    setConfirmedOrder(newOrder);
    setCart([]);
    setView('confirmation');
  };

  const activeCat = categories.find(c => c.id === activeCategory);

  // ── Browse View ──────────────────────────────────────────
  if (view === 'browse') return (
    <div className="space-y-5">
      {/* Member Store Header */}
      <div className="p-6 rounded-2xl text-white" style={{ background: 'linear-gradient(135deg, #C12D32 0%, #8B1A1D 100%)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80 mb-1">Welcome to</p>
            <h2 className="text-2xl mb-1">ADCC Club Store</h2>
            <p className="text-sm opacity-80">Official merchandise for club members</p>
          </div>
          <div className="relative">
            <button onClick={() => setView('cart')} className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
              <ShoppingCart className="w-6 h-6 text-white" />
            </button>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 text-xs text-black flex items-center justify-center font-medium">
                {cartCount}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={() => setView('cart')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm transition-colors">
            <ShoppingCart className="w-4 h-4" />
            Cart ({cartCount})
          </button>
          <button onClick={() => setView('history')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm transition-colors">
            <Package className="w-4 h-4" />
            My Orders
          </button>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#999' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search merchandise..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Popular</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => { setActiveCategory('all'); setActiveSubcat('all'); }}
          className="px-4 py-2 rounded-xl text-sm shrink-0 transition-all"
          style={{
            backgroundColor: activeCategory === 'all' ? '#C12D32' : '#fff',
            color: activeCategory === 'all' ? '#fff' : '#666',
            border: '1px solid',
            borderColor: activeCategory === 'all' ? '#C12D32' : '#e5e7eb',
          }}
        >
          All
        </button>
        {categories.filter(c => c.active).map(cat => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setActiveSubcat('all'); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm shrink-0 transition-all"
            style={{
              backgroundColor: activeCategory === cat.id ? '#C12D32' : '#fff',
              color: activeCategory === cat.id ? '#fff' : '#666',
              border: '1px solid',
              borderColor: activeCategory === cat.id ? '#C12D32' : '#e5e7eb',
            }}
          >
            <span>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Subcategory tabs */}
      {activeCat && activeCat.subcategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubcat('all')}
            className="px-3 py-1.5 rounded-lg text-xs shrink-0 transition-all"
            style={{ backgroundColor: activeSubcat === 'all' ? '#ECC180' : '#F9FAFB', color: activeSubcat === 'all' ? '#333' : '#666' }}
          >
            All
          </button>
          {activeCat.subcategories.map(sub => (
            <button
              key={sub.id}
              onClick={() => setActiveSubcat(sub.id)}
              className="px-3 py-1.5 rounded-lg text-xs shrink-0 transition-all"
              style={{ backgroundColor: activeSubcat === sub.id ? '#ECC180' : '#F9FAFB', color: activeSubcat === sub.id ? '#333' : '#666' }}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Featured Banner */}
      {activeCategory === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {publishedProducts.filter(p => p.featured).slice(0, 3).map(p => (
            <button
              key={p.id}
              onClick={() => { setSelectedProduct(p); setSelectedVariantIdx(0); setSelectedImageIdx(0); setQuantity(1); setView('detail'); }}
              className="relative overflow-hidden rounded-2xl h-40 group"
            >
              <img src={p.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-left">
                <span className="inline-block px-2 py-0.5 rounded-full text-xs text-white mb-1" style={{ backgroundColor: '#ECC180', color: '#333' }}>⭐ Featured</span>
                <p className="text-white text-sm font-medium truncate">{p.name}</p>
                <p className="text-white/80 text-xs">AED {p.price}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map(product => {
          const isWishlisted = wishlist.includes(product.id);
          const hasDiscount = product.originalPrice && product.originalPrice > product.price;
          return (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all group">
              <div className="relative">
                <button
                  className="w-full"
                  onClick={() => { setSelectedProduct(product); setSelectedVariantIdx(0); setSelectedImageIdx(0); setQuantity(1); setView('detail'); }}
                >
                  <img
                    src={product.images[0] || 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400'}
                    alt={product.name}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </button>
                {hasDiscount && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: '#C12D32' }}>
                    -{Math.round((1 - product.price / product.originalPrice!) * 100)}%
                  </span>
                )}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} style={{ color: isWishlisted ? '#C12D32' : '#999' }} />
                </button>
                {product.totalStock < 5 && product.totalStock > 0 && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-xs bg-orange-500 text-white">
                    Only {product.totalStock} left
                  </span>
                )}
                {product.totalStock === 0 && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <span className="px-3 py-1 rounded-full text-xs bg-gray-800 text-white">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm mb-1 line-clamp-2" style={{ color: '#333' }}>{product.name}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium" style={{ color: '#C12D32' }}>AED {product.price}</span>
                    {hasDiscount && (
                      <span className="text-xs line-through ml-1" style={{ color: '#999' }}>AED {product.originalPrice}</span>
                    )}
                  </div>
                  <button
                    disabled={product.totalStock === 0}
                    onClick={() => {
                      setCart(c => {
                        const v = product.variants[0];
                        const existing = c.find(i => i.product.id === product.id && i.variantId === v.id);
                        if (existing) return c.map(i => i.product.id === product.id && i.variantId === v.id ? { ...i, quantity: i.quantity + 1 } : i);
                        return [...c, { product, variantId: v.id, size: v.size, color: v.color, colorHex: v.colorHex, quantity: 1 }];
                      });
                      toast.success('Added to cart');
                    }}
                    className="p-1.5 rounded-lg transition-all disabled:opacity-40"
                    style={{ backgroundColor: '#ECC180', color: '#333' }}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                  </button>
                </div>
                {product.sold > 50 && (
                  <p className="text-xs mt-1" style={{ color: '#F59E0B' }}>🔥 {product.sold}+ sold</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {filteredProducts.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl">
          <Package className="w-12 h-12 mx-auto mb-3" style={{ color: '#ECC180' }} />
          <p style={{ color: '#666' }}>No products found</p>
        </div>
      )}
    </div>
  );

  // ── Product Detail ───────────────────────────────────────
  if (view === 'detail' && selectedProduct) {
    const variant = selectedProduct.variants[selectedVariantIdx];
    const sizes = [...new Set(selectedProduct.variants.map(v => v.size).filter(Boolean))];
    const colors = [...new Set(selectedProduct.variants.map(v => v.color).filter(Boolean))];
    const isWishlisted = wishlist.includes(selectedProduct.id);

    return (
      <div className="space-y-4">
        <button onClick={() => setView('browse')} className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity" style={{ color: '#C12D32' }}>
          <ChevronLeft className="w-4 h-4" />
          Back to Store
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Images */}
          <div>
            <div className="relative rounded-2xl overflow-hidden mb-3" style={{ backgroundColor: '#F9FAFB' }}>
              <img
                src={selectedProduct.images[selectedImageIdx] || selectedProduct.images[0]}
                alt=""
                className="w-full h-80 object-cover"
              />
              {selectedProduct.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIdx(i => Math.max(0, i - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" style={{ color: '#333' }} />
                  </button>
                  <button
                    onClick={() => setSelectedImageIdx(i => Math.min(selectedProduct.images.length - 1, i + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" style={{ color: '#333' }} />
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-2">
              {selectedProduct.images.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImageIdx(idx)}>
                  <img
                    src={img}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover transition-all"
                    style={{ border: idx === selectedImageIdx ? '2px solid #C12D32' : '2px solid transparent' }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-2xl" style={{ color: '#333' }}>{selectedProduct.name}</h2>
                <button onClick={() => toggleWishlist(selectedProduct.id)} className="p-2 rounded-xl border border-gray-200 shrink-0">
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} style={{ color: isWishlisted ? '#C12D32' : '#999' }} />
                </button>
              </div>
              <p className="text-xs mt-1" style={{ color: '#999' }}>SKU: {selectedProduct.sku}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-3xl" style={{ color: '#C12D32' }}>AED {selectedProduct.price}</span>
                {selectedProduct.originalPrice && (
                  <span className="text-lg line-through" style={{ color: '#999' }}>AED {selectedProduct.originalPrice}</span>
                )}
              </div>
              {selectedProduct.sold > 0 && (
                <p className="text-sm mt-1" style={{ color: '#F59E0B' }}>🔥 {selectedProduct.sold}+ members own this</p>
              )}
            </div>

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div>
                <p className="text-sm mb-2" style={{ color: '#666' }}>Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => {
                    const matchingVariants = selectedProduct.variants.filter(v => v.size === size);
                    const hasSelectedColor = selectedProduct.variants[selectedVariantIdx]?.color;
                    const variantIdx = selectedProduct.variants.findIndex(v =>
                      v.size === size && (!hasSelectedColor || v.color === selectedProduct.variants[selectedVariantIdx]?.color)
                    );
                    const isSelected = selectedProduct.variants[selectedVariantIdx]?.size === size;
                    const inStock = matchingVariants.some(v => v.stock > 0);
                    return (
                      <button
                        key={size}
                        disabled={!inStock}
                        onClick={() => variantIdx >= 0 && setSelectedVariantIdx(variantIdx)}
                        className="px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-40"
                        style={{
                          backgroundColor: isSelected ? '#C12D32' : '#F9FAFB',
                          color: isSelected ? '#fff' : '#333',
                          border: isSelected ? '1.5px solid #C12D32' : '1.5px solid #e5e7eb',
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {colors.length > 0 && (
              <div>
                <p className="text-sm mb-2" style={{ color: '#666' }}>
                  Color: <span style={{ color: '#333' }}>{variant?.color || '—'}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.variants.filter((v, idx, arr) => arr.findIndex(a => a.color === v.color) === idx).map((v, i) => {
                    const variantIdx = selectedProduct.variants.findIndex(sv => sv.color === v.color && sv.size === selectedProduct.variants[selectedVariantIdx]?.size) ?? i;
                    const isSelected = selectedProduct.variants[selectedVariantIdx]?.color === v.color;
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          const idx = selectedProduct.variants.findIndex(sv => sv.color === v.color);
                          if (idx >= 0) setSelectedVariantIdx(idx);
                        }}
                        className="w-8 h-8 rounded-full transition-all"
                        style={{
                          backgroundColor: v.colorHex || '#ccc',
                          border: isSelected ? '3px solid #C12D32' : '3px solid transparent',
                          outline: isSelected ? '2px solid white' : 'none',
                          outlineOffset: '-4px',
                        }}
                        title={v.color}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm mb-2" style={{ color: '#666' }}>Quantity</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                  <Minus className="w-4 h-4" style={{ color: '#333' }} />
                </button>
                <span className="text-lg w-8 text-center" style={{ color: '#333' }}>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                  <Plus className="w-4 h-4" style={{ color: '#333' }} />
                </button>
                <span className="text-sm" style={{ color: '#999' }}>{variant?.stock || 0} available</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={addToCart}
                disabled={!variant || variant.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm transition-all hover:shadow-md disabled:opacity-40"
                style={{ backgroundColor: '#C12D32' }}
              >
                <ShoppingCart className="w-4 h-4" />
                {variant?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={() => { addToCart(); setView('cart'); }}
                disabled={!variant || variant.stock === 0}
                className="flex-1 py-3 rounded-xl text-sm border transition-all hover:bg-gray-50 disabled:opacity-40"
                style={{ borderColor: '#C12D32', color: '#C12D32' }}
              >
                Buy Now
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { icon: <Truck className="w-4 h-4" />, label: 'Free shipping over AED 400' },
                { icon: <Shield className="w-4 h-4" />, label: 'Secure payment' },
                { icon: <RotateCcw className="w-4 h-4" />, label: '30-day returns' },
              ].map(b => (
                <div key={b.label} className="flex flex-col items-center gap-1 p-2 rounded-xl text-center" style={{ backgroundColor: '#FFF9EF' }}>
                  <span style={{ color: '#C12D32' }}>{b.icon}</span>
                  <span className="text-xs" style={{ color: '#666' }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description & Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg mb-3" style={{ color: '#333' }}>Description</h3>
            <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{selectedProduct.description}</p>
            {selectedProduct.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {selectedProduct.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: '#FFF9EF', color: '#C12D32' }}>#{t}</span>
                ))}
              </div>
            )}
          </div>
          {selectedProduct.specifications.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-lg mb-3" style={{ color: '#333' }}>Specifications</h3>
              <div className="space-y-2">
                {selectedProduct.specifications.map((s, i) => (
                  <div key={i} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
                    <span className="text-sm" style={{ color: '#666' }}>{s.label}</span>
                    <span className="text-sm" style={{ color: '#333' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Cart ─────────────────────────────────────────────────
  if (view === 'cart') return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setView('browse')} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50">
          <ChevronLeft className="w-4 h-4" style={{ color: '#333' }} />
        </button>
        <h2 className="text-xl" style={{ color: '#333' }}>Shopping Cart ({cartCount})</h2>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4" style={{ color: '#ECC180' }} />
          <h3 className="text-lg mb-2" style={{ color: '#333' }}>Your cart is empty</h3>
          <p className="text-sm mb-6" style={{ color: '#666' }}>Browse our collection and add items you love</p>
          <button onClick={() => setView('browse')} className="px-6 py-3 rounded-xl text-white text-sm" style={{ backgroundColor: '#C12D32' }}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            {cart.map(item => (
              <div key={`${item.product.id}-${item.variantId}`} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4">
                <img src={item.product.images[0]} alt="" className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium" style={{ color: '#333' }}>{item.product.name}</p>
                    <button onClick={() => removeFromCart(item.product.id, item.variantId)}>
                      <X className="w-4 h-4" style={{ color: '#999' }} />
                    </button>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#999' }}>
                    {[item.size, item.color].filter(Boolean).join(' / ')}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateCartQty(item.product.id, item.variantId, -1)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm" style={{ color: '#333' }}>{item.quantity}</span>
                      <button onClick={() => updateCartQty(item.product.id, item.variantId, 1)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm" style={{ color: '#C12D32' }}>AED {(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-4">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>Order Summary</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#666' }}>Subtotal</span>
                  <span style={{ color: '#333' }}>AED {cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#666' }}>Shipping</span>
                  <span style={{ color: cartShipping === 0 ? '#10B981' : '#333' }}>
                    {cartShipping === 0 ? 'Free' : `AED ${cartShipping}`}
                  </span>
                </div>
                {cartShipping > 0 && (
                  <p className="text-xs" style={{ color: '#999' }}>
                    Add AED {(400 - cartSubtotal).toLocaleString()} more for free shipping
                  </p>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200 font-medium">
                  <span style={{ color: '#333' }}>Total</span>
                  <span style={{ color: '#C12D32' }}>AED {cartTotal.toLocaleString()}</span>
                </div>
              </div>
              <button onClick={() => setView('checkout')} className="w-full py-3 rounded-xl text-white text-sm transition-all hover:shadow-md" style={{ backgroundColor: '#C12D32' }}>
                Proceed to Checkout
              </button>
              <button onClick={() => setView('browse')} className="w-full py-2 mt-2 rounded-xl text-sm hover:bg-gray-50 transition-all" style={{ color: '#666' }}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Checkout ─────────────────────────────────────────────
  if (view === 'checkout') return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setView('cart')} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50">
          <ChevronLeft className="w-4 h-4" style={{ color: '#333' }} />
        </button>
        <h2 className="text-xl" style={{ color: '#333' }}>Checkout</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {/* Contact */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name', placeholder: 'Enter full name' },
                { label: 'Email', key: 'email', placeholder: 'Enter email address' },
                { label: 'Phone', key: 'phone', placeholder: 'Enter phone number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm mb-1" style={{ color: '#666' }}>{f.label}</label>
                  <input
                    value={(checkoutForm as any)[f.key]}
                    onChange={e => setCheckoutForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>Shipping Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: '#666' }}>Address</label>
                <input
                  value={checkoutForm.line1}
                  onChange={e => setCheckoutForm(prev => ({ ...prev, line1: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1" style={{ color: '#666' }}>City</label>
                  <input
                    value={checkoutForm.city}
                    onChange={e => setCheckoutForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: '#666' }}>Emirate</label>
                  <select
                    value={checkoutForm.emirate}
                    onChange={e => setCheckoutForm(prev => ({ ...prev, emirate: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    {['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'].map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>Payment Method</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { id: 'card', label: 'Credit/Debit Card', icon: '💳' },
                { id: 'apple', label: 'Apple Pay', icon: '🍎' },
                { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setCheckoutForm(prev => ({ ...prev, paymentMethod: m.id }))}
                  className="p-3 rounded-xl border-2 text-center transition-all"
                  style={{
                    borderColor: checkoutForm.paymentMethod === m.id ? '#C12D32' : '#e5e7eb',
                    backgroundColor: checkoutForm.paymentMethod === m.id ? '#FEF2F2' : '#fff',
                  }}
                >
                  <div className="text-2xl mb-1">{m.icon}</div>
                  <p className="text-xs" style={{ color: '#666' }}>{m.label}</p>
                </button>
              ))}
            </div>
            {checkoutForm.paymentMethod === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1" style={{ color: '#666' }}>Name on Card</label>
                  <input
                    value={checkoutForm.cardName}
                    onChange={e => setCheckoutForm(prev => ({ ...prev, cardName: e.target.value }))}
                    placeholder="Name on card"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: '#666' }}>Card Number</label>
                  <input
                    value={checkoutForm.cardNumber}
                    onChange={e => setCheckoutForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1" style={{ color: '#666' }}>Expiry</label>
                    <input
                      value={checkoutForm.cardExpiry}
                      onChange={e => setCheckoutForm(prev => ({ ...prev, cardExpiry: e.target.value }))}
                      placeholder="MM / YY"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1" style={{ color: '#666' }}>CVV</label>
                    <input
                      value={checkoutForm.cardCVV}
                      onChange={e => setCheckoutForm(prev => ({ ...prev, cardCVV: e.target.value }))}
                      placeholder="123"
                      maxLength={4}
                      type="password"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: '#F0FDF4' }}>
                  <Shield className="w-4 h-4" style={{ color: '#10B981' }} />
                  <p className="text-xs" style={{ color: '#10B981' }}>Your payment is secured with SSL encryption</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-4">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>Order Summary</h3>
            <div className="space-y-3 mb-4">
              {cart.map(item => (
                <div key={`${item.product.id}-${item.variantId}`} className="flex items-center gap-3">
                  <div className="relative">
                    <img src={item.product.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center">{item.quantity}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate" style={{ color: '#333' }}>{item.product.name}</p>
                    <p className="text-xs" style={{ color: '#999' }}>{[item.size, item.color].filter(Boolean).join(' / ')}</p>
                  </div>
                  <p className="text-xs shrink-0" style={{ color: '#C12D32' }}>AED {(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 mb-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span style={{ color: '#666' }}>Subtotal</span>
                <span style={{ color: '#333' }}>AED {cartSubtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#666' }}>Shipping</span>
                <span style={{ color: cartShipping === 0 ? '#10B981' : '#333' }}>{cartShipping === 0 ? 'Free' : `AED ${cartShipping}`}</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t border-gray-100">
                <span style={{ color: '#333' }}>Total</span>
                <span style={{ color: '#C12D32' }}>AED {cartTotal}</span>
              </div>
            </div>
            <button onClick={placeOrder} className="w-full py-3 rounded-xl text-white text-sm transition-all hover:shadow-md" style={{ backgroundColor: '#C12D32' }}>
              Place Order · AED {cartTotal}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Confirmation ─────────────────────────────────────────
  if (view === 'confirmation' && confirmedOrder) return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6 max-w-lg mx-auto text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ECFDF5' }}>
        <CheckCircle className="w-10 h-10" style={{ color: '#10B981' }} />
      </div>
      <div>
        <h2 className="text-2xl mb-2" style={{ color: '#333' }}>Order Confirmed!</h2>
        <p className="text-sm" style={{ color: '#666' }}>
          Thank you for your purchase. Your order has been placed successfully.
        </p>
      </div>
      <div className="w-full p-5 rounded-2xl bg-white shadow-sm text-left">
        <div className="flex justify-between mb-3">
          <p className="text-sm" style={{ color: '#666' }}>Order Number</p>
          <p className="text-sm font-medium font-mono" style={{ color: '#333' }}>{confirmedOrder.orderNumber}</p>
        </div>
        <div className="flex justify-between mb-3">
          <p className="text-sm" style={{ color: '#666' }}>Total</p>
          <p className="text-sm font-medium" style={{ color: '#C12D32' }}>AED {confirmedOrder.total}</p>
        </div>
        <div className="flex justify-between mb-3">
          <p className="text-sm" style={{ color: '#666' }}>Payment</p>
          <p className="text-sm" style={{ color: '#333' }}>{confirmedOrder.paymentMethod}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm" style={{ color: '#666' }}>Estimated Delivery</p>
          <p className="text-sm" style={{ color: '#333' }}>3–5 business days</p>
        </div>
      </div>
      <div className="w-full p-4 rounded-2xl flex items-center gap-3" style={{ backgroundColor: '#EFF6FF' }}>
        <Bell className="w-5 h-5 shrink-0" style={{ color: '#3B82F6' }} />
        <p className="text-sm text-left" style={{ color: '#1D4ED8' }}>
          You'll receive a push notification when your order ships with tracking details.
        </p>
      </div>
      <div className="flex gap-3 w-full">
        <button onClick={() => setView('history')} className="flex-1 py-3 rounded-xl text-sm border transition-all hover:bg-gray-50" style={{ borderColor: '#C12D32', color: '#C12D32' }}>
          Track Order
        </button>
        <button onClick={() => setView('browse')} className="flex-1 py-3 rounded-xl text-white text-sm transition-all hover:shadow-md" style={{ backgroundColor: '#C12D32' }}>
          Continue Shopping
        </button>
      </div>
    </div>
  );

  // ── Order History ─────────────────────────────────────────
  if (view === 'history') return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setView('browse')} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50">
          <ChevronLeft className="w-4 h-4" style={{ color: '#333' }} />
        </button>
        <h2 className="text-xl" style={{ color: '#333' }}>My Orders</h2>
      </div>
      {memberOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <Package className="w-12 h-12 mx-auto mb-3" style={{ color: '#ECC180' }} />
          <p className="text-lg mb-2" style={{ color: '#333' }}>No orders yet</p>
          <button onClick={() => setView('browse')} className="px-6 py-3 rounded-xl text-white text-sm mt-2" style={{ backgroundColor: '#C12D32' }}>
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {memberOrders.map(order => {
            const sc = statusColors[order.status] || { color: '#666', bg: '#F9FAFB' };
            return (
              <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium font-mono" style={{ color: '#333' }}>{order.orderNumber}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#999' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-AE', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs capitalize" style={{ color: sc.color, backgroundColor: sc.bg }}>
                    {order.status}
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-xl shrink-0" style={{ backgroundColor: '#F9FAFB' }}>
                      <img src={item.productImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="text-xs" style={{ color: '#333' }}>{item.productName}</p>
                        <p className="text-xs" style={{ color: '#999' }}>x{item.quantity} · AED {item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium" style={{ color: '#C12D32' }}>AED {order.total.toLocaleString()}</span>
                    {order.trackingNumber && (
                      <div className="flex items-center gap-1 mt-1">
                        <Truck className="w-3 h-3" style={{ color: '#0EA5E9' }} />
                        <span className="text-xs font-mono" style={{ color: '#0EA5E9' }}>{order.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                  {order.status === 'shipped' && (
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs" style={{ backgroundColor: '#EFF6FF', color: '#3B82F6' }}>
                      <Truck className="w-3.5 h-3.5" />
                      Track Shipment
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return null;
}
