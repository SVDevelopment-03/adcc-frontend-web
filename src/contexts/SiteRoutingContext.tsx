import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { DEFAULT_ROUTING, fetchSiteRouting, type SiteRouting } from '../services/siteRouting';

const STORAGE_KEY = 'adcc.siteRouting';
/** How long a first-time visitor waits for the routing before the site falls back to the default URLs. */
const FIRST_LOAD_TIMEOUT_MS = 2500;

interface SiteRoutingValue {
  routing: SiteRouting;
  /** False only on a first visit while the routing is still loading. */
  ready: boolean;
  /** Reloads after a change in the dashboard so it applies without a page refresh. */
  refresh: () => Promise<void>;
}

const SiteRoutingContext = createContext<SiteRoutingValue>({
  routing: DEFAULT_ROUTING,
  ready: true,
  refresh: async () => {},
});

const readStored = (): SiteRouting | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SiteRouting;
    return { ...DEFAULT_ROUTING, ...parsed, pages: { ...DEFAULT_ROUTING.pages, ...parsed.pages } };
  } catch {
    return null;
  }
};

/**
 * Page URLs, custom pages and redirects managed under Pages in the dashboard.
 * Returning visitors route instantly from the last copy this browser saw and
 * pick up changes when the request completes.
 */
export function SiteRoutingProvider({ children }: { children: ReactNode }) {
  const [routing, setRouting] = useState<SiteRouting>(() => readStored() ?? DEFAULT_ROUTING);
  const [ready, setReady] = useState(() => readStored() !== null);

  const refresh = useCallback(async () => {
    try {
      const loaded = await fetchSiteRouting();
      setRouting(loaded);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
      } catch {
        // storage unavailable; the routing still applies for this visit
      }
    } catch (error) {
      console.error('Failed to load site routing:', error);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), FIRST_LOAD_TIMEOUT_MS);
    refresh().finally(() => window.clearTimeout(timer));
    return () => window.clearTimeout(timer);
  }, [refresh]);

  return <SiteRoutingContext.Provider value={{ routing, ready, refresh }}>{children}</SiteRoutingContext.Provider>;
}

export const useSiteRouting = () => useContext(SiteRoutingContext);
