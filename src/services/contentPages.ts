import i18n from '../i18n';
import {
  PRIVACY_POLICY_AR,
  PRIVACY_POLICY_EN,
  type PrivacyBlock,
  type PrivacyPolicyContent,
} from '../data/privacyPolicyContent';
import { normalizeSection, type ScalarField, type SectionDef, type SectionValues } from './homeSections';

/**
 * Dashboard-editable content for every public page other than Home (which has
 * its own editor) — Pages → <page> in the dashboard. Each page is a list of
 * sections; the editor renders its form from `fields` and the site reads the
 * saved content through `normalizeContentSection`, falling back to `defaults`:
 * the text and images the site showed before it became editable, so nothing
 * changes until an admin saves.
 *
 * Keep the page ids, section keys and field keys in sync with
 * PAGE_SECTION_SCHEMAS in the backend's page-section.validator.ts. Page ids
 * and section keys must be lowercase: the backend lowercases them when it
 * stores and returns sections, so a camelCase key would never be found.
 */

export type ContentPageId =
  | 'about'
  | 'events'
  | 'tracks'
  | 'challenges'
  | 'communities'
  | 'contact'
  | 'store'
  | 'marketplace'
  | 'news'
  | 'laffah'
  | 'privacy';

export interface ContentPageDef {
  id: ContentPageId;
  /** Public URL, linked from the editor ("View page"). */
  path: string;
  title: string;
  description: string;
  sections: SectionDef[];
}

/* ─── Defaults from the translation files ────────────────────────────────── */

/** A translation value as plain text; word lists (titles split for animation) are joined. */
const text = (lng: 'en' | 'ar', key: string): string => {
  const value = i18n.getFixedT(lng)(key, { returnObjects: true }) as unknown;
  if (Array.isArray(value)) return value.join(' ');
  return typeof value === 'string' && value !== key ? value : '';
};
const both = (name: string, key: string) => ({ [`${name}En`]: text('en', key), [`${name}Ar`]: text('ar', key) });
const fixed = (name: string, en: string, ar: string) => ({ [`${name}En`]: en, [`${name}Ar`]: ar });

/* ─── Field shorthands ───────────────────────────────────────────────────── */

const L = 'pages.sections.fields.';
const S = 'pages.content.sections.';

const line = (key: string, label = key, max = 200): ScalarField => ({
  kind: 'text',
  key,
  label: L + label,
  localized: true,
  max,
});
const para = (key: string, label = key, max = 2000): ScalarField => ({
  kind: 'textarea',
  key,
  label: L + label,
  localized: true,
  max,
});
const image = (key: string, label = key, size?: string): ScalarField => ({ kind: 'image', key, label: L + label, size });
const link = (key: string, label = key): ScalarField => ({ kind: 'link', key, label: L + label });

/** The full-width banner at the top of most public pages. */
const heroSection = (translationKey: string, backgroundImage: string): SectionDef => ({
  key: 'hero',
  title: S + 'hero.title',
  description: S + 'hero.description',
  hideable: false,
  fields: [line('title'), line('breadcrumb'), image('backgroundImage', 'backgroundImage', '1440 × 900 px')],
  defaults: () => ({
    visible: true,
    ...both('title', `${translationKey}.titleWords`),
    ...both('breadcrumb', `${translationKey}.breadcrumb`),
    backgroundImage,
  }),
});

/** A centred or two-column title + paragraph block, optionally with an image. */
const introSection = (
  translationKey: string,
  opts: {
    image?: string;
    imageSize?: string;
    titleKey?: string;
    bodyKey?: string;
    key?: string;
    title?: string;
    description?: string;
  } = {},
): SectionDef => ({
  key: opts.key ?? 'intro',
  title: opts.title ?? S + 'intro.title',
  description: opts.description ?? S + 'intro.description',
  fields: [
    para('title', 'title', 300),
    para('body'),
    ...(opts.image !== undefined ? [image('image', 'image', opts.imageSize)] : []),
  ],
  defaults: () => ({
    visible: true,
    ...both('title', opts.titleKey ?? `${translationKey}.titleWords`),
    ...both('body', opts.bodyKey ?? `${translationKey}.body`),
    ...(opts.image !== undefined ? { image: opts.image } : {}),
  }),
});

/** A heading above a dynamic list (events, tracks, listings...). */
const headingSection = (key: string, translationKey: string, title: string, description: string): SectionDef => ({
  key,
  title,
  description,
  hideable: false,
  fields: [line('title', 'heading', 300)],
  defaults: () => ({ visible: true, ...both('title', translationKey) }),
});

/* ─── Privacy policy: structured document ↔ editable text ────────────────── */

/**
 * The policy body is edited as plain text: paragraphs separated by a blank
 * line, `- ` starts a bullet, `## ` a sub-heading.
 */
const blocksToText = (blocks: PrivacyBlock[]): string =>
  blocks
    .map((block) => {
      if (Array.isArray(block)) return block.map((item) => `- ${item}`).join('\n');
      if (typeof block === 'object') return `## ${block.sub}`;
      return block;
    })
    .join('\n\n');

export const textToPolicyBlocks = (value: string): PrivacyBlock[] => {
  const blocks: PrivacyBlock[] = [];
  for (const chunk of value.split(/\n\s*\n/)) {
    const lines = chunk
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;
    let paragraph: string[] = [];
    let bullets: string[] = [];
    const flush = () => {
      if (paragraph.length) blocks.push(paragraph.join(' '));
      if (bullets.length) blocks.push(bullets);
      paragraph = [];
      bullets = [];
    };
    for (const l of lines) {
      if (l.startsWith('## ')) {
        flush();
        blocks.push({ sub: l.slice(3).trim() });
      } else if (/^[-•]\s+/.test(l)) {
        if (paragraph.length) {
          blocks.push(paragraph.join(' '));
          paragraph = [];
        }
        bullets.push(l.replace(/^[-•]\s+/, ''));
      } else {
        if (bullets.length) {
          blocks.push(bullets);
          bullets = [];
        }
        paragraph.push(l);
      }
    }
    flush();
  }
  return blocks;
};

const policySections = (en: PrivacyPolicyContent, ar: PrivacyPolicyContent) =>
  en.sections.map((section, i) => ({
    ...fixed('heading', section.heading, ar.sections[i]?.heading ?? ''),
    ...fixed('body', blocksToText(section.blocks), blocksToText(ar.sections[i]?.blocks ?? [])),
  }));

/* ─── Pages ──────────────────────────────────────────────────────────────── */

const P = 'pages.content.pages.';

export const CONTENT_PAGES: ContentPageDef[] = [
  {
    id: 'about',
    path: '/aboutus',
    title: P + 'about.title',
    description: P + 'about.description',
    sections: [
      heroSection('public.about.hero', '/img/Frame 2147226602.png'),
      {
        key: 'intro',
        title: S + 'aboutIntro.title',
        description: S + 'aboutIntro.description',
        note: S + 'aboutIntro.note',
        fields: [
          para('title', 'title', 300),
          image('image', 'image', '760 × 320 px'),
          {
            kind: 'list',
            key: 'stats',
            label: L + 'stats',
            itemLabel: L + 'stat',
            min: 1,
            max: 4,
            fields: [line('value', 'value', 20), line('label', 'label', 100)],
          },
          para('body'),
          line('buttonLabel'),
          link('buttonLink'),
        ],
        defaults: () => ({
          visible: true,
          ...both('title', 'public.about.stats.titleWords'),
          image: '/img/DSC04620.jpg 1.png',
          stats: [
            { ...fixed('value', '', ''), ...both('label', 'public.about.stats.activeMembers') },
            { ...fixed('value', '', ''), ...both('label', 'public.about.stats.eventsOrganized') },
            { ...fixed('value', '20+', '20+'), ...both('label', 'public.about.stats.communityRides') },
            { ...fixed('value', '2017', '2017'), ...both('label', 'public.about.stats.established') },
          ],
          ...both('body', 'public.about.stats.body'),
          ...both('buttonLabel', 'public.common.getInTouch'),
          buttonLink: '/contact-us',
        }),
      },
      {
        key: 'mission',
        title: S + 'mission.title',
        description: S + 'mission.description',
        note: S + 'mission.note',
        fields: [
          para('title', 'title', 300),
          para('intro'),
          image('backgroundImage', 'backgroundImage', '1440 × 700 px'),
          line('missionHeading'),
          para('missionText'),
          line('visionHeading'),
          para('visionText'),
        ],
        defaults: () => ({
          visible: true,
          ...both('title', 'public.about.mission.titleWords'),
          ...both('intro', 'public.about.mission.intro'),
          backgroundImage: '/img/image 3517.png',
          ...both('missionHeading', 'public.about.mission.heading'),
          ...both('missionText', 'public.about.mission.body'),
          ...both('visionHeading', 'public.about.mission.visionHeading'),
          ...both('visionText', 'public.about.mission.visionBody'),
        }),
      },
      {
        key: 'values',
        title: S + 'values.title',
        description: S + 'values.description',
        fields: [
          line('eyebrow'),
          para('title', 'title', 300),
          line('buttonLabel'),
          link('buttonLink'),
          {
            kind: 'list',
            key: 'items',
            label: L + 'values',
            itemLabel: L + 'valueItem',
            min: 1,
            max: 6,
            fields: [line('title'), para('text', 'text', 500)],
          },
        ],
        defaults: () => ({
          visible: true,
          ...both('eyebrow', 'public.about.values.eyebrow'),
          ...both('title', 'public.about.values.titleWords'),
          ...both('buttonLabel', 'public.about.values.discoverCommunity'),
          buttonLink: '/communities',
          items: ['community', 'excellence', 'inclusivity', 'achievement'].map((k) => ({
            ...both('title', `public.about.values.items.${k}.title`),
            ...both('text', `public.about.values.items.${k}.text`),
          })),
        }),
      },
      {
        key: 'coaches',
        title: S + 'coaches.title',
        description: S + 'coaches.description',
        fields: [
          para('title', 'title', 300),
          {
            kind: 'list',
            key: 'cards',
            label: L + 'cards',
            itemLabel: L + 'card',
            min: 1,
            max: 4,
            fields: [line('label'), image('image', 'image', '400 × 488 px')],
          },
        ],
        defaults: () => ({
          visible: true,
          ...both('title', 'public.about.coaches.titleWords'),
          cards: [
            { ...both('label', 'public.about.coaches.players'), image: '/img/image 2998.png' },
            { ...both('label', 'public.about.coaches.coaches'), image: '/img/image 2999.png' },
            { ...both('label', 'public.about.coaches.mechanics'), image: '/img/image 2997.png' },
          ],
        }),
      },
    ],
  },
  {
    id: 'events',
    path: '/events',
    title: P + 'events.title',
    description: P + 'events.description',
    sections: [
      heroSection('public.events.hero', '/img/pexels-jonathanborba-19431221 1.png'),
      introSection('public.events.intro'),
    ],
  },
  {
    id: 'tracks',
    path: '/tracks',
    title: P + 'tracks.title',
    description: P + 'tracks.description',
    sections: [
      heroSection('public.tracks.hero', '/img/pexels-krizz59-12838 1.png'),
      introSection('public.tracks.intro', {
        image: '/img/SSYouTube.online_Falcon_daman.png',
        imageSize: '620 × 340 px',
        description: S + 'tracksIntro.description',
      }),
      {
        key: 'why',
        title: S + 'why.title',
        description: S + 'why.description',
        fields: [
          para('title', 'title', 300),
          line('buttonLabel'),
          image('image', 'image', '550 × 420 px'),
          image('backgroundImage', 'backgroundImage', '1440 × 700 px'),
          {
            kind: 'list',
            key: 'features',
            label: L + 'features',
            itemLabel: L + 'feature',
            min: 1,
            max: 6,
            fields: [line('title'), para('text', 'text', 500)],
          },
        ],
        defaults: () => ({
          visible: true,
          ...both('title', 'public.tracks.why.title'),
          ...both('buttonLabel', 'public.common.exploreTracks'),
          image: '/img/paolo-candelo-8tXukRrs7yk-unsplash 1.png',
          backgroundImage: '/img/image 3517.png',
          features: ['infrastructure', 'routes', 'community', 'performance'].map((k) => ({
            ...both('title', `public.tracks.why.features.${k}.title`),
            ...both('text', `public.tracks.why.features.${k}.desc`),
          })),
        }),
      },
      headingSection('list', 'public.tracks.grid.titleWords', S + 'tracksList.title', S + 'tracksList.description'),
    ],
  },
  {
    id: 'challenges',
    path: '/challenges',
    title: P + 'challenges.title',
    description: P + 'challenges.description',
    sections: [
      heroSection('public.challenges.hero', '/img/paolo-candelo-8tXukRrs7yk-unsplash 1.png'),
      introSection('public.challenges.intro', { description: S + 'challengesIntro.description' }),
      {
        key: 'video',
        title: S + 'video.title',
        description: S + 'video.description',
        fields: [link('videoUrl'), image('posterImage', 'posterImage', '1440 × 550 px')],
        defaults: () => ({
          visible: true,
          videoUrl: '/img/videos/video.mp4',
          posterImage: '/img/paolo-candelo-8tXukRrs7yk-unsplash 1.png',
        }),
      },
      headingSection(
        'list',
        'public.challenges.listTitleWords',
        S + 'challengesList.title',
        S + 'challengesList.description',
      ),
    ],
  },
  {
    id: 'communities',
    path: '/communities',
    title: P + 'communities.title',
    description: P + 'communities.description',
    sections: [
      heroSection('public.communities.hero', '/img/pexels-jonathanborba-19431223 1.png'),
      introSection('public.communities.intro', { image: '/img/Frame 2147226625.png', imageSize: '592 × 440 px' }),
      headingSection(
        'list',
        'public.communities.explore.titleWords',
        S + 'communitiesList.title',
        S + 'communitiesList.description',
      ),
    ],
  },
  {
    id: 'contact',
    path: '/contact-us',
    title: P + 'contact.title',
    description: P + 'contact.description',
    sections: [
      heroSection('public.contact.hero', '/img/paolo-candelo-8tXukRrs7yk-unsplash 1.png'),
      {
        ...introSection('public.contact.intro', {
          titleKey: 'public.contact.intro.title',
          image: '/img/490796704_1417267435941639_5633845168834004037_n. 1 (1).png',
          imageSize: '580 × 400 px',
        }),
      },
      {
        key: 'details',
        title: S + 'contactDetails.title',
        description: S + 'contactDetails.description',
        hideable: false,
        fields: [
          { kind: 'text', key: 'email', label: L + 'email' },
          { kind: 'text', key: 'phone', label: L + 'phone', max: 50 },
          para('address', 'address', 500),
          link('addressLink'),
        ],
        defaults: () => ({
          visible: true,
          email: 'info@adcyclingclub.ae',
          phone: '+971 2 622 8894',
          ...both('address', 'public.footer.address'),
          addressLink: 'https://maps.app.goo.gl/5dx641z5VDFrqrhH7',
        }),
      },
    ],
  },
  {
    id: 'store',
    path: '/user-adcc-store',
    title: P + 'store.title',
    description: P + 'store.description',
    sections: [
      {
        key: 'launching',
        title: S + 'launching.title',
        description: S + 'launching.description',
        hideable: false,
        fields: [para('title', 'message', 300)],
        defaults: () => ({ visible: true, ...both('title', 'public.store.listing.launchingSoon') }),
      },
    ],
  },
  {
    id: 'marketplace',
    path: '/user-marketplace',
    title: P + 'marketplace.title',
    description: P + 'marketplace.description',
    sections: [
      heroSection('public.marketplace.listing.hero', '/img/pexels-zakhar-36955801 1.png'),
      {
        key: 'list',
        title: S + 'marketplaceList.title',
        description: S + 'marketplaceList.description',
        hideable: false,
        fields: [line('title', 'heading', 300), line('listingsTitle', 'listingsTitle', 300)],
        defaults: () => ({
          visible: true,
          ...both('title', 'public.marketplace.listing.browseTitleWords'),
          ...both('listingsTitle', 'public.marketplace.listing.listingsHeading'),
        }),
      },
      {
        key: 'promo',
        title: S + 'gearUp.title',
        description: S + 'gearUp.description',
        fields: [
          para('title', 'title', 300),
          para('body'),
          line('buttonLabel'),
          link('buttonLink'),
          image('image', 'image', '500 × 500 px'),
        ],
        defaults: () => ({
          visible: true,
          ...both('title', 'public.marketplace.listing.gearUp.titleWords'),
          ...both('body', 'public.marketplace.listing.gearUp.body'),
          ...both('buttonLabel', 'public.common.getInTouch'),
          buttonLink: '/contact-us',
          image: '/img/image 30691.png',
        }),
      },
    ],
  },
  {
    id: 'news',
    path: '/user-news',
    title: P + 'news.title',
    description: P + 'news.description',
    sections: [
      heroSection('public.news.listing.hero', '/img/pexels-zakhar-36955801 1.png'),
      introSection('public.news.listing', {
        titleKey: 'public.news.listing.heading',
        bodyKey: 'public.news.listing.subheading',
        description: S + 'newsIntro.description',
      }),
    ],
  },
  {
    id: 'laffah',
    path: '/laffah-ride-registration',
    title: P + 'laffah.title',
    description: P + 'laffah.description',
    sections: [
      heroSection('public.laffahRide.hero', '/img/laffah.png'),
      introSection('public.laffahRide.intro', {
        titleKey: 'public.laffahRide.intro.title',
        description: S + 'laffahIntro.description',
      }),
    ],
  },
  {
    id: 'privacy',
    path: '/privacy-policy',
    title: P + 'privacy.title',
    description: P + 'privacy.description',
    sections: [
      {
        key: 'policy',
        title: S + 'policy.title',
        description: S + 'policy.description',
        note: S + 'policy.note',
        hideable: false,
        fields: [
          line('title'),
          line('breadcrumb'),
          para('intro', 'intro', 20000),
          {
            kind: 'list',
            key: 'sections',
            label: L + 'policySections',
            itemLabel: L + 'policySection',
            min: 1,
            max: 40,
            fields: [line('heading', 'heading', 300), para('body', 'body', 20000)],
          },
        ],
        defaults: () => ({
          visible: true,
          ...both('title', 'public.privacyPolicy.hero.titleWords'),
          ...both('breadcrumb', 'public.privacyPolicy.hero.breadcrumb'),
          ...fixed('intro', blocksToText(PRIVACY_POLICY_EN.intro), blocksToText(PRIVACY_POLICY_AR.intro)),
          sections: policySections(PRIVACY_POLICY_EN, PRIVACY_POLICY_AR),
        }),
      },
    ],
  },
];

export const getContentPageDef = (id: string): ContentPageDef | undefined => CONTENT_PAGES.find((p) => p.id === id);

export const getContentSectionDef = (page: ContentPageId, key: string): SectionDef => {
  const def = getContentPageDef(page)?.sections.find((s) => s.key === key);
  if (!def) throw new Error(`Unknown content section ${page}.${key}`);
  return def;
};

export const normalizeContentSection = (page: ContentPageId, key: string, raw: unknown): SectionValues =>
  normalizeSection(getContentSectionDef(page, key), raw);

export const contentPageCacheKey = (page: string) => `pages:${page}:sections`;

/** Splits a saved title into words for the animated headings. */
export const toWords = (value: string): string[] => value.split(/\s+/).filter(Boolean);
