import { useEffect, useState } from 'react';
import { DEFAULT_HOME_BANNER, getHomeBanner, type HomeBannerContent } from '../../services/pagesApi';
import { getCached, setCache } from '../../utils/apiCache';

export const HOME_BANNER_CACHE_KEY = 'pages:home:banner';
const STORAGE_KEY = 'adcc.homeBanner';

const readStored = (): HomeBannerContent | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HomeBannerContent) : null;
  } catch {
    return null;
  }
};

const writeStored = (content: HomeBannerContent) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  } catch {
    // storage unavailable; the banner still renders from the API response
  }
};

/**
 * Homepage banner content. Starts from the last copy this browser saw so the
 * hero paints immediately on repeat visits, and is `null` only on a first
 * visit while the request is in flight (the hero renders without an image or
 * text in that moment rather than flashing the old defaults).
 */
export function useHomeBanner(): HomeBannerContent | null {
  const [banner, setBanner] = useState<HomeBannerContent | null>(
    () => getCached<HomeBannerContent>(HOME_BANNER_CACHE_KEY) ?? readStored(),
  );

  useEffect(() => {
    if (getCached<HomeBannerContent>(HOME_BANNER_CACHE_KEY)) return;
    let cancelled = false;
    getHomeBanner()
      .then(({ content }) => {
        setCache(HOME_BANNER_CACHE_KEY, content);
        writeStored(content);
        if (!cancelled) setBanner(content);
      })
      .catch(() => {
        if (!cancelled) setBanner((prev) => prev ?? DEFAULT_HOME_BANNER);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return banner;
}
