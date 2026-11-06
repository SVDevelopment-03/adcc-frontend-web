import { useEffect, useMemo, useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { getPageSections, type SectionValues } from '../services/homeSections';
import { getCached, setCache } from '../utils/apiCache';

type RawSections = Partial<Record<string, unknown>>;

/**
 * Builds a hook returning one section of a dashboard-editable page, already
 * resolved to the current locale: `pick('title')` returns `titleAr` on the
 * Arabic site (falling back to `titleEn` when it is empty) and `titleEn`
 * otherwise. Renders the last copy this browser saw, or the built-in
 * defaults, until the request completes.
 */
export function createPageSectionHook<K extends string>({
  page,
  cacheKey,
  storageKey,
  normalize,
}: {
  page: string;
  /** apiCache key; the dashboard invalidates it after a save. */
  cacheKey: string;
  storageKey: string;
  normalize: (key: K, raw: unknown) => SectionValues;
}) {
  const readStored = (): RawSections | null => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as RawSections) : null;
    } catch {
      return null;
    }
  };

  const writeStored = (sections: RawSections) => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(sections));
    } catch {
      // storage unavailable; the sections still render from the API response
    }
  };

  // One request shared by every section of the page.
  let inflight: Promise<RawSections> | null = null;
  const loadSections = () => {
    if (!inflight) {
      inflight = getPageSections(page)
        .then((sections) => {
          setCache(cacheKey, sections);
          writeStored(sections);
          return sections;
        })
        .finally(() => {
          inflight = null;
        });
    }
    return inflight;
  };

  return function usePageSection(key: K) {
    const { locale } = useLocale();
    const [sections, setSections] = useState<RawSections | null>(
      () => getCached<RawSections>(cacheKey) ?? readStored(),
    );

    useEffect(() => {
      if (getCached<RawSections>(cacheKey)) return;
      let cancelled = false;
      loadSections()
        .then((loaded) => {
          if (!cancelled) setSections(loaded);
        })
        .catch(() => {
          // keep whatever we have; normalize falls back to defaults
        });
      return () => {
        cancelled = true;
      };
    }, []);

    const raw = sections?.[key];
    const content: SectionValues = useMemo(() => normalize(key, raw), [key, raw]);
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
  };
}
