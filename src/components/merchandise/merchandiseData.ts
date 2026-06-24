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
  icon?: string;
  image?: string;
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
