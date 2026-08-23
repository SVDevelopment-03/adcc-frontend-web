import axios, { AxiosError } from 'axios';
import api from './api';
import type { Category, Order, OrderItem, Product, ProductStatus, OrderStatus } from '../components/merchandise/merchandiseData';

export interface ProductBanner {
  id: string;
  key: string;
  group?: string;
  label?: string;
  title?: string;
  targetScreen?: string;
  description?: string;
  image?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

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
  icon: category.icon,
  image: category.image,
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

export interface ProductsPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface GetProductsPageResult {
  items: Product[];
  pagination: ProductsPagination;
}

export const getMerchandiseProductsPage = async (
  params?: GetProductsParams,
): Promise<GetProductsPageResult> => {
  try {
    const { data } = await api.get<{
      success: boolean;
      message?: string;
      data?: {
        items: any[];
        pagination?: ProductsPagination;
      };
    }>('/v1/merchandise/products', { params });

    if (!data?.success || !data.data?.items) {
      return { items: [], pagination: { page: 1, limit: params?.limit ?? 20, total: 0, pages: 1 } };
    }

    return {
      items: data.data.items.map(mapProduct),
      pagination:
        data.data.pagination ?? { page: 1, limit: params?.limit ?? 20, total: data.data.items.length, pages: 1 },
    };
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

export const uploadMerchandiseBanner = async (file: File): Promise<{ url: string; key: string }> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const { data } = await api.post<{ success: boolean; message?: string; data?: { url: string; key: string } }>(
      '/v1/uploads/image/merchandise-banners',
      formData
    );

    if (!data?.success || !data?.data) {
      throw new Error(data?.message || 'Failed to upload merchandise banner');
    }
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to upload merchandise banner'));
  }
};

export const uploadMerchandiseProductImages = async (files: File[]): Promise<{ url: string; key: string }[]> => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const { data } = await api.post<{ success: boolean; message?: string; data?: { url: string; key: string }[] }>(
      '/v1/uploads/images/merchandise-products',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    if (!data?.success || !data?.data) {
      throw new Error(data?.message || 'Failed to upload product images');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to upload product images'));
  }
};

export const uploadMerchandiseCategoryImage = async (file: File): Promise<{ url: string; key: string }> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const { data } = await api.post<{ success: boolean; message?: string; data?: { url: string; key: string } }>(
      '/v1/uploads/image/product-categories',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    if (!data?.success || !data?.data) {
      throw new Error(data?.message || 'Failed to upload category image');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to upload category image'));
  }
};

export const getProductBanners = async (): Promise<ProductBanner[]> => {
  try {
    const { data } = await api.get<{ success: boolean; message?: string; data?: { banners: any[] } }>('/v1/product-banners');
    if (!data?.success || !data.data?.banners) {
      return [];
    }
    return data.data.banners.map((banner) => ({
      id: banner.id || banner._id || String(banner._id),
      key: banner.key,
      group: banner.group,
      label: banner.label,
      title: banner.title,
      description: banner.description,
      targetScreen: banner.targetScreen,
      image: banner.image,
      active: banner.active,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
    }));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load product banners'));
  }
};

export const uploadProductBanners = async (files: File[]): Promise<ProductBanner[]> => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const { data } = await api.post<{ success: boolean; message?: string; data?: { banners: any[] } }>(
      '/v1/product-banners',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    if (!data?.success || !data.data?.banners) {
      throw new Error(data?.message || 'Failed to upload product banners');
    }

    return data.data.banners.map((banner) => ({
      id: banner.id || banner._id || String(banner._id),
      key: banner.key,
      group: banner.group,
      label: banner.label,
      title: banner.title,
      description: banner.description,
      targetScreen: banner.targetScreen,
      image: banner.image,
      active: banner.active,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
    }));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to upload product banners'));
  }
};

export const deleteProductBanner = async (key: string): Promise<void> => {
  try {
    await api.delete(`/v1/product-banners/${encodeURIComponent(key)}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete product banner'));
  }
};

export const updateProductBanner = async (key: string, payload: { label?: string; title?: string; description?: string; targetScreen?: string; active?: boolean; image?: string }): Promise<ProductBanner> => {
  try {
    const { data } = await api.patch<{ success: boolean; message?: string; data?: any }>(`/v1/product-banners/${encodeURIComponent(key)}`, payload);
    if (!data?.success || !data?.data) {
      throw new Error('Failed to update product banner');
    }
    const banner = data.data;
    return {
      id: banner.id || banner._id || String(banner._id),
      key: banner.key,
      group: banner.group,
      label: banner.label,
      title: banner.title,
      description: banner.description,
      targetScreen: banner.targetScreen,
      image: banner.image,
      active: banner.active,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update product banner'));
  }
};

export const getProductBannersAr = async (): Promise<ProductBanner[]> => {
  try {
    const { data } = await api.get<{ success: boolean; message?: string; data?: { banners: any[] } }>('/v1/product-banners-ar');
    if (!data?.success || !data.data?.banners) {
      return [];
    }
    return data.data.banners.map((banner) => ({
      id: banner.id || banner._id || String(banner._id),
      key: banner.key,
      group: banner.group,
      label: banner.label,
      title: banner.title,
      description: banner.description,
      targetScreen: banner.targetScreen,
      image: banner.image,
      active: banner.active,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
    }));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load Arabic product banners'));
  }
};

export const uploadProductBannersAr = async (files: File[]): Promise<ProductBanner[]> => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const { data } = await api.post<{ success: boolean; message?: string; data?: { banners: any[] } }>(
      '/v1/product-banners-ar',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    if (!data?.success || !data.data?.banners) {
      throw new Error(data?.message || 'Failed to upload Arabic product banners');
    }

    return data.data.banners.map((banner) => ({
      id: banner.id || banner._id || String(banner._id),
      key: banner.key,
      group: banner.group,
      label: banner.label,
      title: banner.title,
      description: banner.description,
      image: banner.image,
      active: banner.active,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
    }));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to upload Arabic product banners'));
  }
};

export const deleteProductBannerAr = async (key: string): Promise<void> => {
  try {
    await api.delete(`/v1/product-banners-ar/${encodeURIComponent(key)}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete Arabic product banner'));
  }
};

export const updateProductBannerAr = async (key: string, payload: { label?: string; title?: string; description?: string; targetScreen?: string; active?: boolean; image?: string }): Promise<ProductBanner> => {
  try {
    const { data } = await api.patch<{ success: boolean; message?: string; data?: any }>(`/v1/product-banners-ar/${encodeURIComponent(key)}`, payload);
    if (!data?.success || !data?.data) {
      throw new Error('Failed to update Arabic product banner');
    }
    const banner = data.data;
    return {
      id: banner.id || banner._id || String(banner._id),
      key: banner.key,
      group: banner.group,
      label: banner.label,
      title: banner.title,
      description: banner.description,
      targetScreen: banner.targetScreen,
      image: banner.image,
      active: banner.active,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update Arabic product banner'));
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
