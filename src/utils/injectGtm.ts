/**
 * Injects the Google Tag Manager snippets saved in the dashboard
 * (App Configuration → Google Tag Manager).
 *
 * `headCode` is placed in <head>; `bodyCode` (the <noscript> fallback) is
 * placed right after <body> opens. Script tags assigned through innerHTML
 * never execute, so <script> nodes are recreated explicitly here.
 */

export type GtmCode = { headCode?: string; bodyCode?: string } | null | undefined;

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
