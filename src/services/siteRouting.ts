import api from './api';
import type { ContentPageId } from './contentPages';
import type { CustomPageBlock } from './customPageBlocks';

/**
 * Dashboard-managed URLs: custom pages, changed URLs of built-in pages and
 * redirects. The rules mirror utils/site-paths.ts and site.controller.ts in
 * the backend, which validates everything on save.
 */

/** Original paths of the built-in pages; an old path keeps redirecting after a change. */
export const BUILT_IN_PAGE_PATHS: Record<ContentPageId, string> = {
  about: '/aboutus',
  events: '/events',
  tracks: '/tracks',
  challenges: '/challenges',
  communities: '/communities',
  contact: '/contact-us',
  store: '/user-adcc-store',
  marketplace: '/user-marketplace',
  news: '/user-news',
  laffah: '/laffah-ride-registration',
  privacy: '/privacy-policy',
};

/**
 * Dashboard sections that share a URL with a public page: signed-in staff get
 * the dashboard there, so redirects never apply to them on these paths.
 */
const ADMIN_SEGMENTS = new Set([
  'admin', 'admins', 'audit-log', 'badges', 'cms', 'config', 'contact-messages', 'dashboard', 'feed',
  'laffah-ride-leads', 'languages', 'media', 'merchandise', 'newsletter', 'notifications', 'pages',
  'partners', 'push', 'reports', 'roles', 'static-data', 'users',
  'events', 'tracks', 'challenges', 'communities', 'news', 'marketplace',
]);

/** True for paths the dashboard also uses (signed-in staff get the dashboard there). */
export const isAdminPath = (pathname: string) => ADMIN_SEGMENTS.has(normalizePath(pathname).split('/')[1] ?? '');

export interface RedirectRule {
  from: string;
  to: string;
}

export interface SiteRouting {
  /** Current path of each built-in page. */
  pages: Record<ContentPageId, string>;
  /** Paths of published custom pages. */
  customPages: string[];
  /** Enabled redirects. */
  redirects: RedirectRule[];
}

export const DEFAULT_ROUTING: SiteRouting = {
  pages: { ...BUILT_IN_PAGE_PATHS },
  customPages: [],
  redirects: [],
};

export const isExternalUrl = (value: string) => /^https?:\/\//i.test(value.trim());

export const normalizePath = (pathname: string) => {
  const path = pathname.toLowerCase().replace(/\/+$/, '');
  return path === '' ? '/' : path;
};

/** Where `path` goes under one rule (`/*` = this path and everything below it), or null. */
export const applyRedirect = (rule: RedirectRule, path: string): string | null => {
  const toBase = rule.to.endsWith('/*') ? rule.to.slice(0, -2) : rule.to;
  if (rule.from.endsWith('/*')) {
    const base = rule.from.slice(0, -2);
    if (path !== base && !path.startsWith(`${base}/`)) return null;
    const rest = path.slice(base.length);
    return rule.to.endsWith('/*') ? `${toBase}${rest}` || '/' : toBase || '/';
  }
  return path === rule.from ? toBase || '/' : null;
};

/** Redirects plus the automatic ones from the original paths of moved built-in pages. */
const allRules = (routing: SiteRouting): RedirectRule[] => [
  ...routing.redirects,
  ...(Object.keys(BUILT_IN_PAGE_PATHS) as ContentPageId[])
    .filter((id) => routing.pages[id] && routing.pages[id] !== BUILT_IN_PAGE_PATHS[id])
    .map((id) => ({ from: `${BUILT_IN_PAGE_PATHS[id]}/*`, to: `${routing.pages[id]}/*` })),
];

/**
 * Final destination for a visit to `pathname` (a site path or a full URL), or
 * null when no redirect applies. Follows chains; a loop means no redirect.
 */
export const resolveRedirect = (
  pathname: string,
  routing: SiteRouting,
  signedIn: boolean,
): string | null => {
  const start = normalizePath(pathname);
  if (signedIn && isAdminPath(start)) return null;

  const rules = allRules(routing);
  let path = start;
  const seen = new Set([path]);
  for (let hop = 0; hop < 10; hop += 1) {
    const rule = rules.find((r) => applyRedirect(r, path) !== null);
    if (!rule) break;
    const next = applyRedirect(rule, path)!;
    if (isExternalUrl(next)) return next;
    // A loop (the dashboard refuses to save one): don't redirect at all,
    // otherwise the browser would bounce between the pages forever.
    if (seen.has(next)) return null;
    seen.add(next);
    path = next;
  }
  return path === start ? null : path;
};

/** The paths (without `/*`) the site must treat as public pages. */
export const publicPathsOf = (routing: SiteRouting): string[] => [
  ...Object.values(routing.pages),
  ...Object.values(BUILT_IN_PAGE_PATHS),
  ...routing.customPages,
  ...routing.redirects.map((r) => (r.from.endsWith('/*') ? r.from.slice(0, -2) : r.from)),
];

/* ─── API ────────────────────────────────────────────────────────────────── */

const data = <T>(response: { data?: { data?: T } }) => response.data?.data as T;

export const fetchSiteRouting = async (): Promise<SiteRouting> => {
  const loaded = data<Partial<SiteRouting>>(await api.get('/v1/site/routing'));
  return {
    pages: { ...BUILT_IN_PAGE_PATHS, ...(loaded?.pages ?? {}) },
    customPages: loaded?.customPages ?? [],
    redirects: loaded?.redirects ?? [],
  };
};

export interface CustomPageInput {
  slug: string;
  titleEn: string;
  titleAr: string;
  status: 'draft' | 'published';
  seoTitleEn: string;
  seoTitleAr: string;
  seoDescriptionEn: string;
  seoDescriptionAr: string;
  blocks: CustomPageBlock[];
}

export interface CustomPage extends CustomPageInput {
  _id: string;
  updatedAt: string;
  createdAt: string;
}

export type CustomPageSummary = Pick<CustomPage, '_id' | 'slug' | 'titleEn' | 'titleAr' | 'status' | 'updatedAt'>;

export const getPublishedCustomPage = async (slug: string): Promise<CustomPage> =>
  data(await api.get('/v1/site/pages/by-slug', { params: { slug } }));

export const listCustomPages = async (): Promise<CustomPageSummary[]> => data(await api.get('/v1/site/pages')) ?? [];

export const getCustomPage = async (id: string): Promise<CustomPage> => data(await api.get(`/v1/site/pages/${id}`));

export const createCustomPage = async (input: CustomPageInput): Promise<CustomPage> =>
  data(await api.post('/v1/site/pages', input));

export const updateCustomPage = async (
  id: string,
  input: CustomPageInput,
): Promise<{ page: CustomPage; redirectAdded: boolean }> => data(await api.put(`/v1/site/pages/${id}`, input));

export const deleteCustomPage = async (id: string) => {
  await api.delete(`/v1/site/pages/${id}`);
};

export interface PageRouteInfo {
  pageId: ContentPageId;
  path: string;
  defaultPath: string;
}

export const listPageRoutes = async (): Promise<PageRouteInfo[]> => data(await api.get('/v1/site/page-routes')) ?? [];

export const updatePageRoute = async (
  pageId: ContentPageId,
  path: string,
): Promise<PageRouteInfo & { redirectAdded: boolean }> =>
  data(await api.put(`/v1/site/page-routes/${pageId}`, { path }));

export interface RedirectInput {
  from: string;
  to: string;
  enabled: boolean;
  note: string;
}

export interface Redirect extends RedirectInput {
  _id: string;
  updatedAt: string;
}

export const listRedirects = async (): Promise<Redirect[]> => data(await api.get('/v1/site/redirects')) ?? [];

export const createRedirect = async (input: RedirectInput): Promise<Redirect> =>
  data(await api.post('/v1/site/redirects', input));

export const updateRedirect = async (id: string, input: RedirectInput): Promise<Redirect> =>
  data(await api.put(`/v1/site/redirects/${id}`, input));

export const deleteRedirect = async (id: string) => {
  await api.delete(`/v1/site/redirects/${id}`);
};
