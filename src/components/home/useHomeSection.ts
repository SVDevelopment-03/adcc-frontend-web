import { useEffect, useMemo, useState } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import {
  getHomeSections,
  normalizeHomeSection,
  type HomeSectionKey,
  type SectionValues,
} from '../../services/homeSections';
import { getCached, setCache } from '../../utils/apiCache';

export const HOME_SECTIONS_CACHE_KEY = 'pages:home:sections';
const STORAGE_KEY = 'adcc.homeSections';

type RawSections = Partial<Record<string, unknown>>;

const readStored = (): RawSections | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RawSections) : null;
  } catch {
    return null;
  }
};

const writeStored = (sections: RawSections) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
  } catch {
    // storage unavailable; the sections still render from the API response
  }
};

// One request shared by every section on the page.
let inflight: Promise<RawSections> | null = null;
const loadSections = () => {
  if (!inflight) {
    inflight = getHomeSections()
      .then((sections) => {
        setCache(HOME_SECTIONS_CACHE_KEY, sections);
        writeStored(sections);
        return sections;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
};

/**
 * Content of one homepage section, already resolved to the current locale:
 * `pick('title')` returns `titleAr` on the Arabic site (falling back to
 * `titleEn` when it is empty) and `titleEn` otherwise. Renders the last copy
 * this browser saw, or the built-in defaults, until the request completes.
 */
export function useHomeSection(key: HomeSectionKey) {
  const { locale } = useLocale();
  const [sections, setSections] = useState<RawSections | null>(
    () => getCached<RawSections>(HOME_SECTIONS_CACHE_KEY) ?? readStored(),
  );

  useEffect(() => {
    if (getCached<RawSections>(HOME_SECTIONS_CACHE_KEY)) return;
    let cancelled = false;
    loadSections()
      .then((loaded) => {
        if (!cancelled) setSections(loaded);
      })
      .catch(() => {
        // keep whatever we have; normalizeHomeSection falls back to defaults
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const raw = sections?.[key];
  const content: SectionValues = useMemo(() => normalizeHomeSection(key, raw), [key, raw]);
  const isAr = locale === 'ar';

  const pickFrom = (source: Record<string, unknown>, name: string): string => {
    const enValue = typeof source[`${name}En`] === 'string' ? (source[`${name}En`] as string) : '';
    const arValue = typeof source[`${name}Ar`] === 'string' ? (source[`${name}Ar`] as string) : '';
    return isAr ? arValue || enValue : enValue;
  };

  return {
    content,
    visible: content.visible,
    pick: (name: string) => pickFrom(content, name),
    pickItem: (item: Record<string, unknown>, name: string) => pickFrom(item, name),
    list: (name: string) => (content[name] as Record<string, string>[]) ?? [],
    value: (name: string) => (typeof content[name] === 'string' ? (content[name] as string) : ''),
  };
}

/** Navigates within the site for paths, opens absolute URLs in a new tab. */
export const openHomeLink = (navigate: (to: string) => void, link: string) => {
  if (!link) return;
  if (/^https?:\/\//i.test(link)) {
    window.open(link, '_blank', 'noopener,noreferrer');
    return;
  }
  navigate(link);
};
