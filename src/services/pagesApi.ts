import axios, { AxiosError } from 'axios';
import api from './api';

export type HomeBannerMode = 'static' | 'carousel' | 'video';

export interface HomeBannerSlide {
  imageEn: string;
  /** Optional; falls back to the slide's `imageEn`. */
  imageAr: string;
}

/** Mirrors homeBannerContentSchema in the backend's page-section.validator.ts. */
export const HOME_BANNER_MAX_SLIDES = 8;
export const HOME_BANNER_MIN_SLIDES = 2;

export interface HomeBannerContent {
  /** What fills the hero: one image, a cross-fading carousel, or a looping video. */
  mode: HomeBannerMode;
  /** When true the banner title and buttons are never rendered on the site, even if filled in. */
  hideText: boolean;
  /** Static mode image. */
  imageEn: string;
  /** Optional; the site falls back to `imageEn` when empty. */
  imageAr: string;
  /** Carousel mode slides. */
  slides: HomeBannerSlide[];
  /** Carousel: seconds each slide stays on screen (3–15). */
  intervalSeconds: number;
  /** Video mode: MP4/WebM, played muted and looping. */
  videoUrl: string;
  /** Video mode: shown while the video loads (and instead of it for reduced-motion users). Falls back to `imageEn`. */
  videoPoster: string;
  titleLine1En: string;
  titleLine2En: string;
  titleLine1Ar: string;
  titleLine2Ar: string;
}

/** What the homepage banner showed before it became editable; used until it is first saved. */
export const DEFAULT_HOME_BANNER: HomeBannerContent = {
  mode: 'static',
  hideText: false,
  imageEn: '/img/DSC04620.jpg 1.png',
  imageAr: '/img/ar-home.png',
  slides: [],
  intervalSeconds: 5,
  videoUrl: '',
  videoPoster: '',
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

export const normalizeHomeBanner = (raw: any): HomeBannerContent => {
  const d = DEFAULT_HOME_BANNER;
  const mode: HomeBannerMode =
    raw?.mode === 'carousel' || raw?.mode === 'video' ? raw.mode : 'static';
  const interval = Number(raw?.intervalSeconds);
  return {
    mode,
    hideText: raw?.hideText === true,
    imageEn: str(raw?.imageEn, d.imageEn) || d.imageEn,
    imageAr: str(raw?.imageAr, ''),
    slides: Array.isArray(raw?.slides)
      ? raw.slides
          .slice(0, HOME_BANNER_MAX_SLIDES)
          .map((s: any) => ({ imageEn: str(s?.imageEn, ''), imageAr: str(s?.imageAr, '') }))
      : [],
    intervalSeconds: Number.isFinite(interval) ? Math.min(15, Math.max(3, Math.round(interval))) : d.intervalSeconds,
    videoUrl: str(raw?.videoUrl, ''),
    videoPoster: str(raw?.videoPoster, ''),
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

/**
 * New files to upload with the banner, keyed by the content path they replace:
 * `imageEn`, `imageAr`, `videoUrl`, `videoPoster`, `slides.<i>.imageEn`,
 * `slides.<i>.imageAr`. The backend stores each in S3 and writes its URL there.
 */
export type HomeBannerFiles = Record<string, File | null | undefined>;

export const saveHomeBanner = async (
  content: HomeBannerContent,
  files: HomeBannerFiles = {},
): Promise<HomeBannerContent> => {
  const formData = new FormData();
  formData.append('content', JSON.stringify(content));
  for (const [path, file] of Object.entries(files)) {
    if (file) formData.append(path, file);
  }
  // A banner video can be tens of MB: no request timeout.
  const response = await api.put('/v1/pages/home/sections/banner', formData, { timeout: 0 });
  return normalizeHomeBanner(response.data?.data?.content);
};
