import { createPageSectionHook } from '../../hooks/createPageSectionHook';
import { normalizeLayoutSection, type LayoutSectionKey } from '../../services/layoutSections';

export const LAYOUT_SECTIONS_CACHE_KEY = 'pages:layout:sections';

/** Header / footer content edited in the dashboard, resolved to the current locale. */
export const useLayoutSection = createPageSectionHook<LayoutSectionKey>({
  page: 'layout',
  cacheKey: LAYOUT_SECTIONS_CACHE_KEY,
  storageKey: 'adcc.layoutSections',
  normalize: normalizeLayoutSection,
});
