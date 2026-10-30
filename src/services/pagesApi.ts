import axios, { AxiosError } from 'axios';
import api from './api';

export interface HomeBannerContent {
  /** When true the banner title and buttons are never rendered on the site, even if filled in. */
  hideText: boolean;
  imageEn: string;
  /** Optional; the site falls back to `imageEn` when empty. */
  imageAr: string;
  titleLine1En: string;
  titleLine2En: string;
  titleLine1Ar: string;
  titleLine2Ar: string;
}

/** What the homepage banner showed before it became editable; used until it is first saved. */
export const DEFAULT_HOME_BANNER: HomeBannerContent = {
  hideText: false,
  imageEn: '/img/DSC04620.jpg 1.png',
  imageAr: '/img/ar-home.png',
  titleLine1En: 'RIDE Your Future TODAY!',
  titleLine2En: 'Experience Abu Dhabi.',
  titleLine1Ar: 'انطلق نحو مستقبلك اليوم!',
  titleLine2Ar: 'عِش تجربة أبوظبي.',
};

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const getPagesErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const msg =
      axiosError.response?.data?.message ?? axiosError.response?.data?.error ?? axiosError.message;
    if (typeof msg !== 'string') return fallback;
    // Validation errors arrive as a JSON array of { field, message }.
    try {
      const parsed = JSON.parse(msg);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.map((issue) => issue?.message).filter(Boolean).join(', ') || fallback;
      }
    } catch {
      // plain-text message
    }
    return msg;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

const str = (value: unknown, fallback: string) => (typeof value === 'string' ? value : fallback);

const normalizeHomeBanner = (raw: any): HomeBannerContent => {
  const d = DEFAULT_HOME_BANNER;
  return {
    hideText: raw?.hideText === true,
    imageEn: str(raw?.imageEn, d.imageEn) || d.imageEn,
    imageAr: str(raw?.imageAr, ''),
    titleLine1En: str(raw?.titleLine1En, d.titleLine1En),
    titleLine2En: str(raw?.titleLine2En, d.titleLine2En),
    titleLine1Ar: str(raw?.titleLine1Ar, d.titleLine1Ar),
    titleLine2Ar: str(raw?.titleLine2Ar, d.titleLine2Ar),
  };
};

/** The saved homepage banner, or the built-in defaults when it has never been saved. */
export const getHomeBanner = async (): Promise<{ content: HomeBannerContent; saved: boolean }> => {
  const response = await api.get('/v1/pages/home/sections/banner');
  const raw = response.data?.data?.content;
  return raw ? { content: normalizeHomeBanner(raw), saved: true } : { content: DEFAULT_HOME_BANNER, saved: false };
};

export const saveHomeBanner = async (
  content: HomeBannerContent,
  files: { imageEn?: File | null; imageAr?: File | null } = {},
): Promise<HomeBannerContent> => {
  const formData = new FormData();
  formData.append('content', JSON.stringify(content));
  if (files.imageEn) formData.append('imageEn', files.imageEn);
  if (files.imageAr) formData.append('imageAr', files.imageAr);
  const response = await api.put('/v1/pages/home/sections/banner', formData);
  return normalizeHomeBanner(response.data?.data?.content);
};
