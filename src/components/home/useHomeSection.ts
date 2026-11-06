import { createPageSectionHook } from '../../hooks/createPageSectionHook';
import { normalizeHomeSection, type HomeSectionKey } from '../../services/homeSections';

export const HOME_SECTIONS_CACHE_KEY = 'pages:home:sections';

/** Content of one homepage section, resolved to the current locale (see createPageSectionHook). */
export const useHomeSection = createPageSectionHook<HomeSectionKey>({
  page: 'home',
  cacheKey: HOME_SECTIONS_CACHE_KEY,
  storageKey: 'adcc.homeSections',
  normalize: normalizeHomeSection,
});

/** Navigates within the site for paths, opens absolute URLs in a new tab. */
export const openHomeLink = (navigate: (to: string) => void, link: string) => {
  if (!link) return;
  if (/^https?:\/\//i.test(link)) {
    window.open(link, '_blank', 'noopener,noreferrer');
    return;
  }
  navigate(link);
};
