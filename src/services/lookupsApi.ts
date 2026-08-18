import axios, { AxiosError } from 'axios';
import api, { publicApi } from './api';

/**
 * Dashboard-managed lookup list entry (event categories, and future dynamic
 * dropdown/filter data). See backend/src/models/lookup.model.ts.
 */
export interface LookupItem {
  id: string;
  type: string;
  value: string;
  label: string;
  labelAr: string;
  parentValue?: string;
  icon?: string;
  order: number;
  active: boolean;
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    const raw =
      axiosError.response?.data?.message ??
      axiosError.response?.data?.error ??
      axiosError.message;
    if (typeof raw === 'string') return raw;
    return fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

function mapLookup(raw: any): LookupItem {
  return {
    id: raw._id || raw.id,
    type: raw.type,
    value: raw.value,
    label: raw.label,
    labelAr: raw.labelAr,
    parentValue: raw.parentValue || undefined,
    icon: raw.icon || undefined,
    order: raw.order ?? 0,
    active: raw.active !== false,
  };
}

/** Public read — used by dropdowns/filters/badges. Returns active entries only. */
export const getLookups = async (type: string, parentValue?: string): Promise<LookupItem[]> => {
  try {
    const { data } = await publicApi.get<{ success: boolean; data?: any[] }>('/v1/lookups', {
      params: parentValue ? { type, parentValue } : { type },
    });
    if (!data?.success || !Array.isArray(data.data)) return [];
    return data.data.map(mapLookup);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load lookup data'));
  }
};

/** Admin read — includes inactive entries, for the management screen. */
export const getLookupsForAdmin = async (type: string, parentValue?: string): Promise<LookupItem[]> => {
  try {
    const { data } = await api.get<{ success: boolean; data?: any[] }>('/v1/lookups', {
      params: parentValue ? { type, parentValue, includeInactive: true } : { type, includeInactive: true },
    });
    if (!data?.success || !Array.isArray(data.data)) return [];
    return data.data.map(mapLookup);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load lookup data'));
  }
};

export const createLookup = async (payload: {
  type: string;
  label: string;
  labelAr: string;
  value?: string;
  parentValue?: string;
  order?: number;
  active?: boolean;
  iconFile?: File;
}): Promise<LookupItem> => {
  try {
    const { iconFile, ...rest } = payload;
    const body: FormData | typeof rest = iconFile ? new FormData() : rest;
    if (iconFile && body instanceof FormData) {
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined) body.append(key, String(value));
      });
      body.append('icon', iconFile);
    }
    const { data } = await api.post<{ success: boolean; data?: any }>('/v1/lookups', body);
    if (!data?.success || !data.data) throw new Error('Failed to create entry');
    return mapLookup(data.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create entry'));
  }
};

export const updateLookup = async (
  id: string,
  payload: Partial<{
    label: string;
    labelAr: string;
    parentValue: string;
    order: number;
    active: boolean;
    iconFile: File;
    removeIcon: boolean;
  }>
): Promise<LookupItem> => {
  try {
    const { iconFile, removeIcon, ...rest } = payload;
    const useFormData = Boolean(iconFile) || removeIcon === true;
    const body: FormData | typeof rest = useFormData ? new FormData() : rest;
    if (useFormData && body instanceof FormData) {
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined) body.append(key, String(value));
      });
      if (iconFile) {
        body.append('icon', iconFile);
      } else if (removeIcon) {
        body.append('removeIcon', 'true');
      }
    }
    const { data } = await api.patch<{ success: boolean; data?: any }>(`/v1/lookups/${id}`, body);
    if (!data?.success || !data.data) throw new Error('Failed to update entry');
    return mapLookup(data.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update entry'));
  }
};

export const deleteLookup = async (id: string): Promise<void> => {
  try {
    await api.delete(`/v1/lookups/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete entry'));
  }
};
