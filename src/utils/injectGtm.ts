/**
 * Injects the Google Tag Manager snippets saved in the dashboard
 * (App Configuration → Google Tag Manager).
 *
 * `headCode` is placed in <head>; `bodyCode` (the <noscript> fallback) is
 * placed right after <body> opens. Script tags assigned through innerHTML
 * never execute, so <script> nodes are recreated explicitly here.
 */

import { useEffect } from 'react';

export type GtmCode ={ headCode?: string; bodyCode?: string } | null | undefined;

const HEAD_FLAG = 'data-gtm-head-injected';
const BODY_FLAG = 'data-gtm-body-injected';

function materialize(html: string): Node[] {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();

  const out: Node[] = [];
  tpl.content.childNodes.forEach((node) => {
    if (node.nodeName === 'SCRIPT') {
      const source = node as HTMLScriptElement;
      const script = document.createElement('script');
      Array.from(source.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value));
      script.text = source.text;
      out.push(script);
    } else {
      out.push(node.cloneNode(true));
    }
  });
  return out;
}

const CACHE_KEY = 'adcc.appConfig.v1';
let siteTrackingRequested = false;

/** True once the dashboard's tracking / chat code has been added to this tab. */
export function hasSiteTracking(): boolean {
  return typeof document !== 'undefined' &&
    (document.head.hasAttribute(HEAD_FLAG) || !!document.body?.hasAttribute(BODY_FLAG));
}

/**
 * Loads the tracking and chat code for the public website only.
 * Called from PublicLayout, so admin dashboard pages never load it.
 */
export function loadSiteTracking(): void {
  if (siteTrackingRequested || typeof window === 'undefined') return;
  siteTrackingRequested = true;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) injectGtm(JSON.parse(cached)?.gtm);
  } catch {
    // ignore cache/parse errors
  }
  import('../services/appConfigApi')
    .then(({ getAppConfig }) => getAppConfig())
    .then((config) => injectGtm(config.gtm))
    .catch(() => {
      // analytics is non-critical — ignore load failures
    });
}

/**
 * For staff pages (sign-in and dashboard): if the visitor came from the public
 * site in this tab, the tracking / chat scripts are already running and can't
 * be unloaded, so reload once to open the page without them.
 */
export function useNoSiteTracking(): void {
  useEffect(() => {
    if (hasSiteTracking()) window.location.reload();
  }, []);
}

export function injectGtm(gtm: GtmCode): void {
  if (!gtm || typeof document === 'undefined') return;

  const headCode = (gtm.headCode || '').trim();
  if (headCode && !document.head.hasAttribute(HEAD_FLAG)) {
    document.head.setAttribute(HEAD_FLAG, 'true');
    materialize(headCode).forEach((node) => document.head.appendChild(node));
  }

  const bodyCode = (gtm.bodyCode || '').trim();
  if (bodyCode && document.body && !document.body.hasAttribute(BODY_FLAG)) {
    document.body.setAttribute(BODY_FLAG, 'true');
    const nodes = materialize(bodyCode);
    for (let i = nodes.length - 1; i >= 0; i -= 1) {
      document.body.insertBefore(nodes[i], document.body.firstChild);
    }
  }
}
