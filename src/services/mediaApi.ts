import axios, { AxiosError } from 'axios';
import api from './api';

/** One entry in the shared, backend-tracked media catalog. See backend/src/models/media.model.ts. */
export interface MediaItem {
  id: string;
  url: string;
  key: string;
  folder: string;
  name: string;
  mimeType?: string;
  size?: number;
  createdAt: string;
}

export interface MediaPage {
  items: MediaItem[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    const raw = axiosError.response?.data?.message ?? axiosError.response?.data?.error ?? axiosError.message;
    return typeof raw === 'string' ? raw : fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

const mapMedia = (raw: any): MediaItem => ({
  id: raw.id || raw._id || String(raw._id),
  url: raw.url,
  key: raw.key,
  folder: raw.folder,
  name: raw.name,
  mimeType: raw.mimeType,
  size: raw.size,
  createdAt: raw.createdAt,
});

export const getMediaPage = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<MediaPage> => {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 60;
  try {
    const { data } = await api.get<{
      success: boolean;
      data?: { items: any[]; pagination: MediaPage['pagination'] };
    }>('/v1/media', { params: { page, limit, search: params?.search || undefined } });

    if (!data?.success || !data.data) {
      return { items: [], pagination: { page, limit, total: 0, pages: 1 } };
    }

    return {
      items: data.data.items.map(mapMedia),
      pagination: data.data.pagination,
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load media library'));
  }
};

/** Upload a new file straight into the shared library (used by the "Upload new" tab of the picker). */
export const uploadToMediaLibrary = async (file: File, folder: string): Promise<MediaItem> => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post<{
      success: boolean;
      message?: string;
      data?: { url: string; key: string };
    }>(`/v1/uploads/image/${folder}`, formData);

    if (!data?.success || !data?.data) {
      throw new Error(data?.message || 'Failed to upload image');
    }

    return {
      id: data.data.key,
      url: data.data.url,
      key: data.data.key,
      folder,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to upload image'));
  }
};

/** Removes the catalog entry only — the S3 object stays in place. */
export const deleteMediaItem = async (id: string): Promise<void> => {
  try {
    await api.delete(`/v1/media/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to remove media item'));
  }
};
