import axios, { AxiosError } from 'axios';
import api from './api';
import type { Category, Order, OrderItem, Product, ProductStatus, OrderStatus } from '../components/merchandise/merchandiseData';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const msg =
      axiosError.response?.data?.message ??
      axiosError.response?.data?.error ??
      (axiosError.response?.status === 401 && 'Unauthorized') ??
      (axiosError.response?.status === 403 && 'Forbidden') ??
      (axiosError.response?.status === 404 && 'Not found') ??
      (axiosError.response?.status && `Request failed (${axiosError.response.status})`) ??
      axiosError.message;
    return typeof msg === 'string' ? msg : fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

const mapProduct = (product: any): Product => ({
  ...product,
  id: product.id || product._id || String(product._id),
});

const mapCategory = (category: any): Category => ({
  ...category,
  id: category.id || category._id || String(category._id),
  productCount: category.productCount ?? 0,
  active: category.active ?? true,
});

const mapOrder = (order: any): Order => ({
  ...order,
  id: order.id || order._id || String(order._id),
});

export interface GetProductsParams {
  source?: 'adcc' | 'vendor';
  status?: ProductStatus;
  categoryId?: string;
  subcategoryId?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export const getMerchandiseProducts = async (params?: GetProductsParams): Promise<Product[]> => {
  try {
    const { data } = await api.get<{
      success: boolean;
      message?: string;
      data?: {
        items: any[];
        pagination?: Record<string, any>;
      };
    }>('/v1/merchandise/products', { params });

    if (!data?.success || !data.data?.items) {
      return [];
    }

    return data.data.items.map(mapProduct);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load merchandise products'));
  }
};

export const getMerchandiseProductById = async (id: string): Promise<Product> => {
  try {
    const { data } = await api.get<{ success: boolean; message?: string; data?: any }>(`/v1/merchandise/products/${id}`);
    if (!data?.success || !data.data) {
      throw new Error('Product not found');
    }
    return mapProduct(data.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load product details'));
  }
};

export const createMerchandiseProduct = async (payload: Omit<Product, 'id' | 'sold' | 'createdAt'>): Promise<Product> => {
  try {
    const { data } = await api.post<{ success: boolean; message?: string; data?: any }>('/v1/merchandise/products', payload);
    if (!data?.success || !data.data) {
      throw new Error('Failed to create product');
    }
    return mapProduct(data.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create product'));
  }
};

export const updateMerchandiseProduct = async (id: string, payload: Partial<Omit<Product, 'id' | 'sold' | 'createdAt'>>): Promise<Product> => {
  try {
    const { data } = await api.patch<{ success: boolean; message?: string; data?: any }>(`/v1/merchandise/products/${id}`, payload);
    if (!data?.success || !data.data) {
      throw new Error('Failed to update product');
    }
    return mapProduct(data.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update product'));
  }
};

export const deleteMerchandiseProduct = async (id: string): Promise<void> => {
  try {
    await api.delete(`/v1/merchandise/products/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete product'));
  }
};

export const updateMerchandiseProductStatus = async (id: string, status: ProductStatus): Promise<Product> => {
  try {
    const { data } = await api.patch<{ success: boolean; message?: string; data?: any }>(`/v1/merchandise/products/${id}/status`, { status });
    if (!data?.success || !data.data) {
      throw new Error('Failed to update product status');
    }
    return mapProduct(data.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update product status'));
  }
};

export const updateMerchandiseProductFeatured = async (id: string, featured: boolean): Promise<Product> => {
  try {
    const { data } = await api.patch<{ success: boolean; message?: string; data?: any }>(`/v1/merchandise/products/${id}/featured`, { featured });
    if (!data?.success || !data.data) {
      throw new Error('Failed to update product featured state');
    }
    return mapProduct(data.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update product featured state'));
  }
};

export const getMerchandiseCategories = async (): Promise<Category[]> => {
  try {
    const { data } = await api.get<{ success: boolean; message?: string; data?: any }>('/v1/merchandise/categories');
    if (!data?.success || !Array.isArray(data.data)) {
      return [];
    }
    return data.data.map(mapCategory);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load merchandise categories'));
  }
};

export const createMerchandiseCategory = async (payload: Omit<Category, 'id' | 'productCount'>): Promise<Category> => {
  try {
    const { data } = await api.post<{ success: boolean; message?: string; data?: any }>('/v1/merchandise/categories', payload);
    if (!data?.success || !data.data) {
      throw new Error('Failed to create category');
    }
    return mapCategory(data.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create category'));
  }
};

export const updateMerchandiseCategory = async (id: string, payload: Partial<Omit<Category, 'id' | 'productCount'>>): Promise<Category> => {
  try {
    const { data } = await api.patch<{ success: boolean; message?: string; data?: any }>(`/v1/merchandise/categories/${id}`, payload);
    if (!data?.success || !data.data) {
      throw new Error('Failed to update category');
    }
    return mapCategory(data.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update category'));
  }
};

export const deleteMerchandiseCategory = async (id: string): Promise<void> => {
  try {
    await api.delete(`/v1/merchandise/categories/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete category'));
  }
};

export interface GetMerchandiseOrdersParams {
  status?: OrderStatus;
  q?: string;
  page?: number;
  limit?: number;
  userId?: string;
}

export const getMerchandiseOrders = async (params?: GetMerchandiseOrdersParams): Promise<Order[]> => {
  try {
    const { data } = await api.get<{ success: boolean; message?: string; data?: { items: any[]; pagination?: Record<string, any> } }>('/v1/merchandise/orders', { params });
    if (!data?.success || !data.data?.items) {
      return [];
    }
    return data.data.items.map(mapOrder);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load merchandise orders'));
  }
};

export const updateMerchandiseOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  try {
    const { data } = await api.patch<{ success: boolean; message?: string; data?: any }>(`/v1/merchandise/orders/${id}/status`, { status });
    if (!data?.success || !data.data) {
      throw new Error('Failed to update order status');
    }
    return mapOrder(data.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update order status'));
  }
};

export const updateMerchandiseOrderTracking = async (id: string, trackingNumber: string): Promise<Order> => {
  try {
    const { data } = await api.patch<{ success: boolean; message?: string; data?: any }>(`/v1/merchandise/orders/${id}/tracking`, { trackingNumber });
    if (!data?.success || !data.data) {
      throw new Error('Failed to update tracking number');
    }
    return mapOrder(data.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update tracking number'));
  }
};
