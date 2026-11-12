import { createPageSectionHook } from './createPageSectionHook';
import {
  contentPageCacheKey,
  normalizeContentSection,
  type ContentPageId,
} from '../services/contentPages';

type SectionHook = ReturnType<typeof createPageSectionHook<string>>;

// One hook (and one shared request) per page, created on first use.
const hooks = new Map<ContentPageId, SectionHook>();

const hookFor = (page: ContentPageId): SectionHook => {
  let hook = hooks.get(page);
  if (!hook) {
    hook = createPageSectionHook<string>({
      page,
      cacheKey: contentPageCacheKey(page),
      storageKey: `adcc.pageSections.${page}`,
      normalize: (key, raw) => normalizeContentSection(page, key, raw),
    });
    hooks.set(page, hook);
  }
  return hook;
};

/**
 * One dashboard-editable section of a public page, resolved to the current
 * locale (see createPageSectionHook). `page` must be constant for a given
 * component so the hook order never changes between renders.
 */
export const useContentSection = (page: ContentPageId, key: string) => hookFor(page)(key);
