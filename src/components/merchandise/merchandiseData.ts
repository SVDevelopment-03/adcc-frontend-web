export type ProductStatus = 'published' | 'draft' | 'archived';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  colorHex?: string;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  subcategoryId?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  specifications: { label: string; value: string }[];
  variants: ProductVariant[];
  status: ProductStatus;
  featured: boolean;
  tags: string[];
  totalStock: number;
  sold: number;
  createdAt: string;
  sku: string;
  source?: 'adcc' | 'vendor';
  vendorName?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: { id: string; name: string }[];
  productCount: number;
  active: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  size?: string;
  color?: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userEmail: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    emirate: string;
    phone: string;
  };
  paymentMethod: string;
  paymentLast4?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const mockCategories: Category[] = [
  {
    id: 'jerseys',
    name: 'Jerseys & Kits',
    icon: '🚴',
    subcategories: [
      { id: 'race-jerseys', name: 'Race Jerseys' },
      { id: 'training-jerseys', name: 'Training Jerseys' },
      { id: 'full-kits', name: 'Full Kits' },
    ],
    productCount: 8,
    active: true,
  },
  {
    id: 'accessories',
    name: 'Accessories',
    icon: '🧢',
    subcategories: [
      { id: 'caps', name: 'Caps & Helmets' },
      { id: 'gloves', name: 'Gloves' },
      { id: 'socks', name: 'Socks' },
    ],
    productCount: 12,
    active: true,
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    icon: '👕',
    subcategories: [
      { id: 'tshirts', name: 'T-Shirts' },
      { id: 'hoodies', name: 'Hoodies & Sweatshirts' },
      { id: 'caps-lifestyle', name: 'Caps' },
    ],
    productCount: 15,
    active: true,
  },
  {
    id: 'equipment',
    name: 'Equipment',
    icon: '🔧',
    subcategories: [
      { id: 'bottles', name: 'Water Bottles' },
      { id: 'bags', name: 'Bags & Backpacks' },
      { id: 'accessories-eq', name: 'Other Equipment' },
    ],
    productCount: 9,
    active: true,
  },
  {
    id: 'collectibles',
    name: 'Collectibles',
    icon: '🏆',
    subcategories: [
      { id: 'medals', name: 'Medals & Awards' },
      { id: 'posters', name: 'Posters & Art' },
    ],
    productCount: 4,
    active: false,
  },
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'ADCC Race Jersey 2024',
    categoryId: 'jerseys',
    subcategoryId: 'race-jerseys',
    price: 320,
    originalPrice: 400,
    images: [
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    ],
    description: 'The official ADCC 2024 Race Jersey engineered for peak performance. Crafted from ultra-lightweight, moisture-wicking fabric that keeps you cool and comfortable during the most demanding rides. Features the iconic ADCC red and gold colour scheme.',
    specifications: [
      { label: 'Material', value: '88% Polyester, 12% Elastane' },
      { label: 'Fit', value: 'Race / Aero Cut' },
      { label: 'Pockets', value: '3 rear pockets' },
      { label: 'Zipper', value: 'Full-length YKK' },
      { label: 'Weight', value: '135g (M)' },
      { label: 'Care', value: 'Machine wash 30°C' },
    ],
    variants: [
      { id: 'v1-s', size: 'S', color: 'Red/Gold', colorHex: '#C12D32', stock: 10, sku: 'ADC-RJ24-S' },
      { id: 'v1-m', size: 'M', color: 'Red/Gold', colorHex: '#C12D32', stock: 15, sku: 'ADC-RJ24-M' },
      { id: 'v1-l', size: 'L', color: 'Red/Gold', colorHex: '#C12D32', stock: 8, sku: 'ADC-RJ24-L' },
      { id: 'v1-xl', size: 'XL', color: 'Red/Gold', colorHex: '#C12D32', stock: 5, sku: 'ADC-RJ24-XL' },
    ],
    status: 'published',
    featured: true,
    tags: ['race', 'jersey', '2024', 'official'],
    totalStock: 38,
    sold: 62,
    createdAt: '2024-01-15',
    sku: 'ADC-RJ24',
  },
  {
    id: 'p2',
    name: 'ADCC Training Jersey',
    categoryId: 'jerseys',
    subcategoryId: 'training-jerseys',
    price: 220,
    images: [
      'https://images.unsplash.com/photo-1547496502-affa22d38842?w=600',
    ],
    description: 'Comfortable training jersey for daily rides and training sessions. Made with breathable fabric and the ADCC branding.',
    specifications: [
      { label: 'Material', value: '100% Polyester' },
      { label: 'Fit', value: 'Regular / Relaxed' },
      { label: 'Pockets', value: '2 rear pockets' },
      { label: 'Zipper', value: 'Half-zip' },
    ],
    variants: [
      { id: 'v2-s', size: 'S', color: 'Black/Red', colorHex: '#1a1a1a', stock: 20, sku: 'ADC-TJ-S' },
      { id: 'v2-m', size: 'M', color: 'Black/Red', colorHex: '#1a1a1a', stock: 25, sku: 'ADC-TJ-M' },
      { id: 'v2-l', size: 'L', color: 'Black/Red', colorHex: '#1a1a1a', stock: 18, sku: 'ADC-TJ-L' },
    ],
    status: 'published',
    featured: false,
    tags: ['training', 'jersey', 'everyday'],
    totalStock: 63,
    sold: 37,
    createdAt: '2024-01-20',
    sku: 'ADC-TJ',
  },
  {
    id: 'p3',
    name: 'ADCC Club Cap',
    categoryId: 'accessories',
    subcategoryId: 'caps',
    price: 85,
    images: [
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600',
    ],
    description: 'Classic ADCC cycling cap made from lightweight cotton blend. Perfect for everyday wear and light rides.',
    specifications: [
      { label: 'Material', value: '60% Cotton, 40% Polyester' },
      { label: 'Size', value: 'One size fits most' },
      { label: 'Closure', value: 'Velcro strap' },
    ],
    variants: [
      { id: 'v3-r', color: 'Red', colorHex: '#C12D32', stock: 30, sku: 'ADC-CAP-R' },
      { id: 'v3-b', color: 'Black', colorHex: '#1a1a1a', stock: 25, sku: 'ADC-CAP-B' },
      { id: 'v3-w', color: 'White', colorHex: '#ffffff', stock: 20, sku: 'ADC-CAP-W' },
    ],
    status: 'published',
    featured: true,
    tags: ['cap', 'accessories', 'everyday'],
    totalStock: 75,
    sold: 105,
    createdAt: '2024-02-01',
    sku: 'ADC-CAP',
  },
  {
    id: 'p4',
    name: 'ADCC Cycling Gloves',
    categoryId: 'accessories',
    subcategoryId: 'gloves',
    price: 120,
    images: [
      'https://images.unsplash.com/photo-1582247139558-c4eb3cb7a64a?w=600',
    ],
    description: 'Padded cycling gloves with gel insert for long-distance comfort. Touchscreen-compatible fingertips.',
    specifications: [
      { label: 'Material', value: 'Synthetic leather, Lycra' },
      { label: 'Padding', value: 'Gel foam insert' },
      { label: 'Touch', value: 'Touchscreen compatible' },
    ],
    variants: [
      { id: 'v4-s', size: 'S', stock: 12, sku: 'ADC-GLV-S' },
      { id: 'v4-m', size: 'M', stock: 18, sku: 'ADC-GLV-M' },
      { id: 'v4-l', size: 'L', stock: 14, sku: 'ADC-GLV-L' },
    ],
    status: 'published',
    featured: false,
    tags: ['gloves', 'accessories', 'comfort'],
    totalStock: 44,
    sold: 56,
    createdAt: '2024-02-10',
    sku: 'ADC-GLV',
  },
  {
    id: 'p5',
    name: 'ADCC Lifestyle Hoodie',
    categoryId: 'lifestyle',
    subcategoryId: 'hoodies',
    price: 280,
    originalPrice: 320,
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600',
    ],
    description: 'Premium heavyweight hoodie with ADCC logo. Perfect for post-ride warmth and casual wear.',
    specifications: [
      { label: 'Material', value: '80% Cotton, 20% Polyester' },
      { label: 'Weight', value: '400gsm' },
      { label: 'Hood', value: 'Adjustable drawstring' },
      { label: 'Pocket', value: 'Front kangaroo pocket' },
    ],
    variants: [
      { id: 'v5-s-b', size: 'S', color: 'Black', colorHex: '#1a1a1a', stock: 8, sku: 'ADC-HD-S-B' },
      { id: 'v5-m-b', size: 'M', color: 'Black', colorHex: '#1a1a1a', stock: 12, sku: 'ADC-HD-M-B' },
      { id: 'v5-l-b', size: 'L', color: 'Black', colorHex: '#1a1a1a', stock: 10, sku: 'ADC-HD-L-B' },
      { id: 'v5-m-g', size: 'M', color: 'Grey', colorHex: '#6B7280', stock: 15, sku: 'ADC-HD-M-G' },
      { id: 'v5-l-g', size: 'L', color: 'Grey', colorHex: '#6B7280', stock: 12, sku: 'ADC-HD-L-G' },
    ],
    status: 'published',
    featured: true,
    tags: ['hoodie', 'lifestyle', 'casual'],
    totalStock: 57,
    sold: 43,
    createdAt: '2024-02-15',
    sku: 'ADC-HD',
  },
  {
    id: 'p6',
    name: 'ADCC Water Bottle 750ml',
    categoryId: 'equipment',
    subcategoryId: 'bottles',
    price: 65,
    images: [
      'https://images.unsplash.com/photo-1610824352934-c10d87b700cc?w=600',
    ],
    description: 'BPA-free 750ml cycling water bottle. Easy squeeze, lockable lid, dishwasher safe.',
    specifications: [
      { label: 'Capacity', value: '750ml' },
      { label: 'Material', value: 'BPA-free plastic' },
      { label: 'Lid', value: 'Lockable push-pull' },
      { label: 'Dishwasher', value: 'Safe' },
    ],
    variants: [
      { id: 'v6-r', color: 'Red', colorHex: '#C12D32', stock: 40, sku: 'ADC-BTL-R' },
      { id: 'v6-b', color: 'Black', colorHex: '#1a1a1a', stock: 35, sku: 'ADC-BTL-B' },
      { id: 'v6-w', color: 'White', colorHex: '#f8f8f8', stock: 28, sku: 'ADC-BTL-W' },
    ],
    status: 'published',
    featured: false,
    tags: ['bottle', 'equipment', 'hydration'],
    totalStock: 103,
    sold: 147,
    createdAt: '2024-03-01',
    sku: 'ADC-BTL',
  },
  {
    id: 'p7',
    name: 'ADCC Cycling Socks (3-pack)',
    categoryId: 'accessories',
    subcategoryId: 'socks',
    price: 75,
    images: [
      'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600',
    ],
    description: 'High-performance cycling socks with cushioned sole and arch support. Moisture-wicking and antibacterial.',
    specifications: [
      { label: 'Material', value: '80% Nylon, 20% Elastane' },
      { label: 'Pack', value: '3 pairs' },
      { label: 'Height', value: 'Mid-calf' },
    ],
    variants: [
      { id: 'v7-sm', size: 'S/M (36-40)', stock: 25, sku: 'ADC-SCK-SM' },
      { id: 'v7-ml', size: 'M/L (41-46)', stock: 30, sku: 'ADC-SCK-ML' },
    ],
    status: 'draft',
    featured: false,
    tags: ['socks', 'accessories', 'performance'],
    totalStock: 55,
    sold: 0,
    createdAt: '2024-03-10',
    sku: 'ADC-SCK',
  },
  {
    id: 'p8',
    name: 'ADCC Premium T-Shirt',
    categoryId: 'lifestyle',
    subcategoryId: 'tshirts',
    price: 120,
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
    ],
    description: 'Soft premium cotton T-shirt with embroidered ADCC logo. Relaxed fit for everyday comfort.',
    specifications: [
      { label: 'Material', value: '100% Organic Cotton' },
      { label: 'Fit', value: 'Regular / Relaxed' },
      { label: 'Logo', value: 'Embroidered chest logo' },
    ],
    variants: [
      { id: 'v8-xs-w', size: 'XS', color: 'White', colorHex: '#f8f8f8', stock: 10, sku: 'ADC-TS-XS-W' },
      { id: 'v8-s-w', size: 'S', color: 'White', colorHex: '#f8f8f8', stock: 15, sku: 'ADC-TS-S-W' },
      { id: 'v8-m-w', size: 'M', color: 'White', colorHex: '#f8f8f8', stock: 20, sku: 'ADC-TS-M-W' },
      { id: 'v8-s-b', size: 'S', color: 'Black', colorHex: '#1a1a1a', stock: 18, sku: 'ADC-TS-S-B' },
      { id: 'v8-m-b', size: 'M', color: 'Black', colorHex: '#1a1a1a', stock: 22, sku: 'ADC-TS-M-B' },
      { id: 'v8-l-b', size: 'L', color: 'Black', colorHex: '#1a1a1a', stock: 16, sku: 'ADC-TS-L-B' },
    ],
    status: 'published',
    featured: false,
    tags: ['tshirt', 'lifestyle', 'casual'],
    totalStock: 101,
    sold: 89,
    createdAt: '2024-03-05',
    sku: 'ADC-TS',
  },
  {
    id: 'p9',
    name: 'ProVelo Carbon Helmet',
    categoryId: 'accessories',
    subcategoryId: 'caps',
    price: 890,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    ],
    description: 'Premium carbon road helmet by ProVelo. Aerodynamic design with MIPS protection system.',
    specifications: [
      { label: 'Material', value: 'Carbon composite' },
      { label: 'Safety', value: 'MIPS rotational protection' },
      { label: 'Weight', value: '240g' },
    ],
    variants: [
      { id: 'v9-s', size: 'S (52-56cm)', stock: 8, sku: 'PV-HLM-S' },
      { id: 'v9-m', size: 'M (56-60cm)', stock: 10, sku: 'PV-HLM-M' },
      { id: 'v9-l', size: 'L (60-64cm)', stock: 6, sku: 'PV-HLM-L' },
    ],
    status: 'published',
    featured: true,
    tags: ['helmet', 'safety', 'carbon'],
    totalStock: 24,
    sold: 31,
    createdAt: '2024-04-01',
    sku: 'PV-HLM',
    source: 'vendor',
    vendorName: 'ProVelo Sports',
  },
  {
    id: 'p10',
    name: 'SpeedGrip Cycling Shoes',
    categoryId: 'accessories',
    subcategoryId: 'gloves',
    price: 650,
    originalPrice: 750,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    ],
    description: 'High-performance road cycling shoes with BOA fit system and carbon sole.',
    specifications: [
      { label: 'Sole', value: 'Full carbon' },
      { label: 'Closure', value: 'BOA L6 dial' },
      { label: 'Cleat', value: '3-bolt compatible' },
    ],
    variants: [
      { id: 'v10-41', size: 'EU 41', stock: 5, sku: 'SG-SH-41' },
      { id: 'v10-42', size: 'EU 42', stock: 8, sku: 'SG-SH-42' },
      { id: 'v10-43', size: 'EU 43', stock: 7, sku: 'SG-SH-43' },
      { id: 'v10-44', size: 'EU 44', stock: 6, sku: 'SG-SH-44' },
    ],
    status: 'published',
    featured: false,
    tags: ['shoes', 'carbon', 'performance'],
    totalStock: 26,
    sold: 14,
    createdAt: '2024-04-05',
    sku: 'SG-SH',
    source: 'vendor',
    vendorName: 'SpeedGrip',
  },
  {
    id: 'p11',
    name: 'AeroLink Smart Bike Computer',
    categoryId: 'equipment',
    subcategoryId: 'accessories-eq',
    price: 1200,
    images: [
      'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?w=600',
    ],
    description: 'GPS-enabled bike computer with live Strava segments, heart rate and power meter support.',
    specifications: [
      { label: 'Display', value: '3.5" colour touchscreen' },
      { label: 'Battery', value: '20 hours' },
      { label: 'Connectivity', value: 'Bluetooth, ANT+, Wi-Fi' },
    ],
    variants: [
      { id: 'v11-std', color: 'Black', colorHex: '#1a1a1a', stock: 15, sku: 'AL-BC-STD' },
    ],
    status: 'published',
    featured: false,
    tags: ['gps', 'computer', 'tech'],
    totalStock: 15,
    sold: 22,
    createdAt: '2024-04-10',
    sku: 'AL-BC',
    source: 'vendor',
    vendorName: 'AeroLink Tech',
  },
];

export const mockOrders: Order[] = [
  {
    id: 'o1',
    orderNumber: 'ADCC-2024-001247',
    userId: 'u1',
    userName: 'Ahmed Al Mansoori',
    userAvatar: 'https://i.pravatar.cc/150?img=12',
    userEmail: 'ahmed@example.com',
    items: [
      { productId: 'p1', productName: 'ADCC Race Jersey 2024', productImage: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200', size: 'L', color: 'Red/Gold', price: 320, quantity: 1 },
      { productId: 'p3', productName: 'ADCC Club Cap', productImage: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=200', color: 'Red', price: 85, quantity: 2 },
    ],
    subtotal: 490,
    shipping: 0,
    total: 490,
    status: 'delivered',
    shippingAddress: { name: 'Ahmed Al Mansoori', line1: 'Villa 23, Al Reem Island', city: 'Abu Dhabi', emirate: 'Abu Dhabi', phone: '+971501234567' },
    paymentMethod: 'Credit Card',
    paymentLast4: '4242',
    trackingNumber: 'AE123456789',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-05T14:00:00Z',
  },
  {
    id: 'o2',
    orderNumber: 'ADCC-2024-001248',
    userId: 'u2',
    userName: 'Sara Al Hashmi',
    userAvatar: 'https://i.pravatar.cc/150?img=5',
    userEmail: 'sara@example.com',
    items: [
      { productId: 'p5', productName: 'ADCC Lifestyle Hoodie', productImage: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=200', size: 'S', color: 'Black', price: 280, quantity: 1 },
    ],
    subtotal: 280,
    shipping: 25,
    total: 305,
    status: 'shipped',
    shippingAddress: { name: 'Sara Al Hashmi', line1: 'Apt 501, Corniche Road', city: 'Abu Dhabi', emirate: 'Abu Dhabi', phone: '+971502345678' },
    paymentMethod: 'Apple Pay',
    trackingNumber: 'AE987654321',
    createdAt: '2024-03-10T09:30:00Z',
    updatedAt: '2024-03-12T11:00:00Z',
  },
  {
    id: 'o3',
    orderNumber: 'ADCC-2024-001249',
    userId: 'u3',
    userName: 'Mohammed Rashid',
    userAvatar: 'https://i.pravatar.cc/150?img=8',
    userEmail: 'mohammed@example.com',
    items: [
      { productId: 'p2', productName: 'ADCC Training Jersey', productImage: 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=200', size: 'M', color: 'Black/Red', price: 220, quantity: 1 },
      { productId: 'p4', productName: 'ADCC Cycling Gloves', productImage: 'https://images.unsplash.com/photo-1582247139558-c4eb3cb7a64a?w=200', size: 'M', price: 120, quantity: 1 },
      { productId: 'p6', productName: 'ADCC Water Bottle 750ml', productImage: 'https://images.unsplash.com/photo-1610824352934-c10d87b700cc?w=200', color: 'Red', price: 65, quantity: 2 },
    ],
    subtotal: 470,
    shipping: 0,
    total: 470,
    status: 'processing',
    shippingAddress: { name: 'Mohammed Rashid', line1: 'Tower 7, Khalidiyah', city: 'Abu Dhabi', emirate: 'Abu Dhabi', phone: '+971503456789' },
    paymentMethod: 'Credit Card',
    paymentLast4: '1234',
    createdAt: '2024-03-14T15:00:00Z',
    updatedAt: '2024-03-14T15:00:00Z',
  },
  {
    id: 'o4',
    orderNumber: 'ADCC-2024-001250',
    userId: 'u4',
    userName: 'Fatima Al Zaabi',
    userAvatar: 'https://i.pravatar.cc/150?img=9',
    userEmail: 'fatima@example.com',
    items: [
      { productId: 'p8', productName: 'ADCC Premium T-Shirt', productImage: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200', size: 'XS', color: 'White', price: 120, quantity: 1 },
      { productId: 'p3', productName: 'ADCC Club Cap', productImage: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=200', color: 'Black', price: 85, quantity: 1 },
    ],
    subtotal: 205,
    shipping: 25,
    total: 230,
    status: 'pending',
    shippingAddress: { name: 'Fatima Al Zaabi', line1: 'Villa 44, Khalifa City', city: 'Abu Dhabi', emirate: 'Abu Dhabi', phone: '+971504567890' },
    paymentMethod: 'Cash on Delivery',
    createdAt: '2024-03-15T08:00:00Z',
    updatedAt: '2024-03-15T08:00:00Z',
  },
  {
    id: 'o5',
    orderNumber: 'ADCC-2024-001246',
    userId: 'u5',
    userName: 'Khalid Al Ameri',
    userAvatar: 'https://i.pravatar.cc/150?img=13',
    userEmail: 'khalid@example.com',
    items: [
      { productId: 'p1', productName: 'ADCC Race Jersey 2024', productImage: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200', size: 'M', color: 'Red/Gold', price: 320, quantity: 2 },
    ],
    subtotal: 640,
    shipping: 0,
    total: 640,
    status: 'cancelled',
    shippingAddress: { name: 'Khalid Al Ameri', line1: 'Flat 12, Madinat Zayed', city: 'Abu Dhabi', emirate: 'Abu Dhabi', phone: '+971505678901' },
    paymentMethod: 'Credit Card',
    paymentLast4: '5678',
    notes: 'Customer requested cancellation',
    createdAt: '2024-02-28T12:00:00Z',
    updatedAt: '2024-02-28T14:00:00Z',
  },
];
