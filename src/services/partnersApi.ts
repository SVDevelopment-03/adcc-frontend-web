import axios, { AxiosError } from 'axios';
import api from './api';

export interface Partner {
  id: string;
  name: string;
  logo: string;
  order: number;
  active: boolean;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const getPartnersErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const msg =
      axiosError.response?.data?.message ?? axiosError.response?.data?.error ?? axiosError.message;
    return typeof msg === 'string' ? msg : fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

const mapPartner = (raw: Record<string, unknown>): Partner => ({
  id: String(raw._id ?? raw.id ?? ''),
  name: typeof raw.name === 'string' ? raw.name : '',
  logo: typeof raw.logo === 'string' ? raw.logo : '',
  order: typeof raw.order === 'number' ? raw.order : 0,
  active: raw.active !== false,
});

const extractPartners = (responseData: unknown): Partner[] => {
  const payload = (responseData as any)?.data ?? responseData;
  const list = Array.isArray(payload?.partners) ? payload.partners : [];
  return list
    .filter((item: unknown): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map(mapPartner)
    .filter((partner: Partner) => partner.id && partner.logo);
};

/** Partners in display order. Pass `active: true` for the public homepage. */
export const getPartners = async (active?: boolean): Promise<Partner[]> => {
  const response = await api.get('/v1/partners', {
    params: active === undefined ? {} : { active: String(active) },
  });
  return extractPartners(response.data);
};

/** Uploads one or more logos; each becomes a partner appended to the end. */
export const createPartners = async (files: File[]): Promise<void> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('logos', file));
  await api.post('/v1/partners', formData);
};

export const updatePartner = async (
  id: string,
  payload: { name?: string; active?: boolean; logoFile?: File },
): Promise<void> => {
  const formData = new FormData();
  if (payload.name !== undefined) formData.append('name', payload.name);
  if (payload.active !== undefined) formData.append('active', String(payload.active));
  if (payload.logoFile) formData.append('logo', payload.logoFile);
  await api.patch(`/v1/partners/${encodeURIComponent(id)}`, formData);
};

export const reorderPartners = async (ids: string[]): Promise<Partner[]> => {
  const response = await api.put('/v1/partners/reorder', { ids });
  return extractPartners(response.data);
};

export const deletePartner = async (id: string): Promise<void> => {
  await api.delete(`/v1/partners/${encodeURIComponent(id)}`);
};
