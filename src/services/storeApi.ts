import axios, { AxiosError } from 'axios';
import api from './api';

/**
 * Extracts a user-friendly error message from an API error (Axios or backend payload).
 */
function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
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
}

/**
 * Store/Marketplace item as returned by the backend (/v1/{lang}/store/items).
 * Backend uses _id; we expose id (mapped from _id) for app use.
 */
export interface StoreItem {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  currency: string;
  price: number;
  contactMethod: string;
  phoneNumber: string;
  city: string;
  status: string;
  coverImage?: string;
  photos?: string[];
  isFeatured?: boolean;
  createdBy?: { _id: string; fullName: string; profileImage?: string };
  /** Derived server-side from createdBy.fullName (falls back to "Unknown Seller"). */
  sellerName?: string;
  postedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateStoreItemPayload {
  title?: string;
  description?: string;
  category?: string;
  condition?: string;
  currency?: string;
  price?: number;
  contactMethod?: 'Call' | 'WhatsApp' | 'InApp';
  phoneNumber?: string;
  city?: string;
}

/** Raw item from API (uses _id) */
interface StoreItemRaw extends Omit<StoreItem, 'id'> {
  _id: string;
}

export interface StoreItemsResponse {
  success: boolean;
  message: string;
  data: {
    items: StoreItemRaw[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface GetStoreItemsParams {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  condition?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sellerId?: string;
}

/**
 * Fetches the list of store/marketplace items from the backend.
 * The language (en/ar) is injected automatically by the API interceptor
 * based on the current locale, so we call the generic /v1/store/... path here.
 * Response shape: { success, message, data: { items, pagination } }.
 * @throws Error with a clear message when the API request fails.
 */
export async function getStoreItems(params?: GetStoreItemsParams): Promise<StoreItem[]> {
  try {
    const { data } = await api.get<StoreItemsResponse>('/v1/store/items', { params });
    if (!data?.success || !Array.isArray(data?.data?.items)) {
      return [];
    }
    return data.data.items.map((item) => ({
      ...item,
      id: item._id,
    }));
  } catch (error) {
    const message = getApiErrorMessage(error, 'Failed to load store items');
    throw new Error(message);
  }
}

/**
 * Fetch a single store item by id.
 * @throws Error with a clear message when the API request fails.
 */
export async function getStoreItemById(itemId: string): Promise<StoreItem> {
  try {
    const { data } = await api.get<{
      success?: boolean;
      data?: StoreItemRaw | StoreItem;
      message?: string;
    }>(`/v1/store/items/${itemId}`);

    const raw = (data as any)?.data ?? data;
    if (!raw || typeof raw !== 'object') {
      throw new Error('Store item not found');
    }

    const item = raw as StoreItemRaw | StoreItem;
    return {
      ...item,
      id: (item as StoreItemRaw)._id ?? (item as StoreItem).id,
    };
  } catch (error) {
    const message = getApiErrorMessage(error, 'Failed to load store item');
    throw new Error(message);
  }
}

export interface StoreItemsPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface GetStoreItemsPageResult {
  items: StoreItem[];
  pagination: StoreItemsPagination;
}

/**
 * Fetches a page of store/marketplace items along with pagination metadata,
 * for listing pages that need real (not client-side) pagination.
 * @throws Error with a clear message when the API request fails.
 */
export async function getStoreItemsPage(
  params?: GetStoreItemsParams
): Promise<GetStoreItemsPageResult> {
  try {
    const { data } = await api.get<StoreItemsResponse>('/v1/store/items', { params });
    if (!data?.success || !Array.isArray(data?.data?.items)) {
      return { items: [], pagination: { page: 1, limit: params?.limit ?? 6, total: 0, pages: 1 } };
    }
    return {
      items: data.data.items.map((item) => ({ ...item, id: item._id })),
      pagination:
        data.data.pagination ??
        { page: 1, limit: params?.limit ?? 6, total: data.data.items.length, pages: 1 },
    };
  } catch (error) {
    const message = getApiErrorMessage(error, 'Failed to load store items');
    throw new Error(message);
  }
}

function extractPaginationTotal(payload: any): number | null {
  const candidate = payload?.pagination?.total ?? payload?.total ?? payload?.meta?.total;
  const n =
    typeof candidate === 'string'
      ? Number.parseInt(candidate, 10)
      : typeof candidate === 'number'
        ? candidate
        : NaN;
  return Number.isFinite(n) ? n : null;
}

export async function getAdminStoreItems(params?: GetStoreItemsParams): Promise<StoreItem[]> {
  try {
    const { data } = await api.get<StoreItemsResponse>('/v1/store/admin/items', { params });
    if (!data?.success || !Array.isArray(data?.data?.items)) {
      return [];
    }
    return data.data.items.map((item) => ({
      ...item,
      id: item._id,
    }));
  } catch (error) {
    const message = getApiErrorMessage(error, 'Failed to load store items');
    throw new Error(message);
  }
}

export async function getAdminStoreItemsCount(params?: GetStoreItemsParams): Promise<number> {
  try {
    const { data } = await api.get<StoreItemsResponse>('/v1/store/admin/items', {
      params: { ...params, page: 1, limit: 1 },
    });
    if (!data?.success) return 0;
    const payload = data?.data ?? data;
    const total = extractPaginationTotal(payload);
    return total ?? 0;
  } catch (error) {
    const message = getApiErrorMessage(error, 'Failed to load store item counts');
    throw new Error(message);
  }
}

/** Generic success response from store actions */
interface StoreActionResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

/**
 * Approve a store item. Endpoint: Store/ Approve item.
 * @throws Error with a clear message when the API request fails.
 */
export async function approveStoreItem(itemId: string): Promise<StoreActionResponse> {
  try {
    const { data } = await api.post<StoreActionResponse>(
      `/v1/store/items/${itemId}/approve`
    );
    return data;
  } catch (error) {
    const message = getApiErrorMessage(error, 'Failed to approve store item');
    throw new Error(message);
  }
}

/**
 * Reject a store item. Endpoint: Store/ Reject item.
 * @throws Error with a clear message when the API request fails.
 */
export async function rejectStoreItem(itemId: string): Promise<StoreActionResponse> {
  try {
    const { data } = await api.post<StoreActionResponse>(
      `/v1/store/items/${itemId}/reject`
    );
    return data;
  } catch (error) {
    const message = getApiErrorMessage(error, 'Failed to reject store item');
    throw new Error(message);
  }
}

/**
 * Feature a store item. Endpoint: Store/ Feature item.
 * @throws Error with a clear message when the API request fails.
 */
export async function featureStoreItem(itemId: string): Promise<StoreActionResponse> {
  try {
    const { data } = await api.post<StoreActionResponse>(`/v1/store/items/${itemId}/feature`, {
      isFeatured: true,
    });
    return data;
  } catch (error) {
    const message = getApiErrorMessage(error, 'Failed to feature store item');
    throw new Error(message);
  }
}

export async function setStoreItemFeatured(
  itemId: string,
  isFeatured: boolean
): Promise<StoreActionResponse> {
  try {
    const { data } = await api.post<StoreActionResponse>(`/v1/store/items/${itemId}/feature`, {
      isFeatured,
    });
    return data;
  } catch (error) {
    const message = getApiErrorMessage(error, 'Failed to feature store item');
    throw new Error(message);
  }
}

export async function markStoreItemSold(itemId: string): Promise<StoreActionResponse> {
  try {
    const { data } = await api.post<StoreActionResponse>(`/v1/store/items/${itemId}/sold`);
    return data;
  } catch (error) {
    const message = getApiErrorMessage(error, 'Failed to mark store item as sold');
    throw new Error(message);
  }
}

/**
 * Update a store item.
 * @throws Error with a clear message when the API request fails.
 */
export async function deleteStoreItem(itemId: string): Promise<StoreActionResponse> {
  try {
    const { data } = await api.delete<StoreActionResponse>(`/v1/store/items/${itemId}`);
    return data;
  } catch (error) {
    const message = getApiErrorMessage(error, 'Failed to delete store item');
    throw new Error(message);
  }
}

export async function updateStoreItem(
  itemId: string,
  payload: UpdateStoreItemPayload
): Promise<StoreActionResponse> {
  try {
    const { data } = await api.patch<StoreActionResponse>(
      `/v1/store/items/${itemId}`,
      payload
    );
    return data;
  } catch (error) {
    const message = getApiErrorMessage(error, 'Failed to update store item');
    throw new Error(message);
  }
}
