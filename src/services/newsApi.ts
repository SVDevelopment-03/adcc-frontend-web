import axios, { AxiosError } from 'axios';
import api from './api';

export type NewsStatus = 'Draft' | 'Published' | 'Trash';

export interface NewsItem {
  id?: string;
  _id?: string;
  title: string;
  titleAr?: string;
  content: string;
  contentAr?: string;
  category?: string;
  coverImage?: string;
  author?: string;
  status: NewsStatus;
  publishedAt?: string;
  slug?: string;
  createdBy?: { _id: string; fullName: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface GetNewsResult {
  items: NewsItem[];
  pagination: NewsPagination;
}

export interface GetNewsParams {
  page?: number;
  limit?: number;
  status?: NewsStatus;
  category?: string;
  q?: string;
}

export interface SaveNewsPayload {
  title: string;
  titleAr?: string;
  content: string;
  contentAr?: string;
  category?: string;
  author?: string;
  status: NewsStatus;
  publishedAt?: string;
  coverImage?: File;
}

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

const mapNews = (raw: any): NewsItem => ({
  ...raw,
  id: raw.id || raw._id || String(raw._id),
});

interface NewsApiResponse {
  success: boolean;
  message?: string;
  data?: {
    items: any[];
    pagination?: NewsPagination;
  };
}

const emptyResult = (params?: GetNewsParams): GetNewsResult => ({
  items: [],
  pagination: { page: 1, limit: params?.limit ?? 6, total: 0, pages: 1 },
});

/** Published-only news list — used by the public News page. */
export async function getNews(params?: GetNewsParams): Promise<GetNewsResult> {
  try {
    const { data } = await api.get<NewsApiResponse>('/v1/news', { params });
    if (!data?.success || !Array.isArray(data?.data?.items)) return emptyResult(params);
    return {
      items: data.data!.items.map(mapNews),
      pagination:
        data.data!.pagination ??
        { page: 1, limit: params?.limit ?? 6, total: data.data!.items.length, pages: 1 },
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load news'));
  }
}

/** Fetch a single published article — used by the public News detail page. */
export async function getNewsById(id: string): Promise<NewsItem> {
  try {
    const { data } = await api.get<{ success?: boolean; data?: any; message?: string }>(`/v1/news/${id}`);
    const raw = data?.data;
    if (!raw) throw new Error('News article not found');
    return mapNews(raw);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load news article'));
  }
}

/** Any-status news list — used by the dashboard's News management screen. */
export async function getAdminNews(params?: GetNewsParams): Promise<GetNewsResult> {
  try {
    const { data } = await api.get<NewsApiResponse>('/v1/news/admin/all', { params });
    if (!data?.success || !Array.isArray(data?.data?.items)) return emptyResult(params);
    return {
      items: data.data!.items.map(mapNews),
      pagination:
        data.data!.pagination ??
        { page: 1, limit: params?.limit ?? 10, total: data.data!.items.length, pages: 1 },
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load news'));
  }
}

/** Fetch a single article of any status — used by the dashboard's edit screen. */
export async function getAdminNewsById(id: string): Promise<NewsItem> {
  try {
    const { data } = await api.get<{ success?: boolean; data?: any; message?: string }>(`/v1/news/admin/${id}`);
    const raw = data?.data;
    if (!raw) throw new Error('News article not found');
    return mapNews(raw);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load news article'));
  }
}

function buildNewsFormData(payload: SaveNewsPayload): FormData {
  const formData = new FormData();
  formData.append('title', payload.title);
  if (payload.titleAr) formData.append('titleAr', payload.titleAr);
  formData.append('content', payload.content);
  if (payload.contentAr) formData.append('contentAr', payload.contentAr);
  if (payload.category) formData.append('category', payload.category);
  if (payload.author) formData.append('author', payload.author);
  formData.append('status', payload.status);
  if (payload.publishedAt) formData.append('publishedAt', payload.publishedAt);
  if (payload.coverImage instanceof File) formData.append('image', payload.coverImage);
  return formData;
}

export async function createNews(payload: SaveNewsPayload): Promise<NewsItem> {
  try {
    const { data } = await api.post<{ success: boolean; message?: string; data?: any }>(
      '/v1/news',
      buildNewsFormData(payload)
    );
    if (!data?.success || !data.data) throw new Error(data?.message || 'Failed to create news article');
    return mapNews(data.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create news article'));
  }
}

export async function updateNews(id: string, payload: Partial<SaveNewsPayload>): Promise<NewsItem> {
  try {
    const formData = new FormData();
    if (payload.title !== undefined) formData.append('title', payload.title);
    if (payload.titleAr !== undefined) formData.append('titleAr', payload.titleAr);
    if (payload.content !== undefined) formData.append('content', payload.content);
    if (payload.contentAr !== undefined) formData.append('contentAr', payload.contentAr);
    if (payload.category !== undefined) formData.append('category', payload.category);
    if (payload.author !== undefined) formData.append('author', payload.author);
    if (payload.status !== undefined) formData.append('status', payload.status);
    if (payload.publishedAt !== undefined) formData.append('publishedAt', payload.publishedAt);
    if (payload.coverImage instanceof File) formData.append('image', payload.coverImage);

    const { data } = await api.patch<{ success: boolean; message?: string; data?: any }>(
      `/v1/news/${id}`,
      formData
    );
    if (!data?.success || !data.data) throw new Error(data?.message || 'Failed to update news article');
    return mapNews(data.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update news article'));
  }
}

export async function deleteNews(id: string): Promise<void> {
  try {
    await api.delete(`/v1/news/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete news article'));
  }
}
