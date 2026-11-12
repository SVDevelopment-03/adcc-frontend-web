import i18n from '../i18n';
import api from './api';

/**
 * Editable homepage sections (everything below the banner, which has its own
 * editor in pagesApi.ts). Each section is described once here; the dashboard
 * editor renders its form from `fields`, and the homepage reads the saved
 * content through `normalizeHomeSection`, falling back to `defaults` — the
 * text from the translation files the site showed before it became editable.
 *
 * Keep the field keys in sync with PAGE_SECTION_SCHEMAS in the backend's
 * page-section.validator.ts.
 */

export type HomeSectionKey =
  | 'stats'
  | 'app'
  | 'journey'
  | 'community'
  | 'platform'
  | 'feed'
  | 'partners'
  | 'about'
  | 'venue';

export type SectionValues = Record<string, unknown> & { visible: boolean };
export type ListItem = Record<string, string>;

/** `localized` text and image fields are stored as `<key>En` and `<key>Ar`. */
export type ScalarField =
  | { kind: 'text' | 'textarea'; key: string; label: string; localized?: boolean; max?: number }
  | {
      kind: 'image';
      key: string;
      label: string;
      /** Adds an optional Arabic image that falls back to the English one. */
      localized?: boolean;
      size?: string;
    }
  | { kind: 'link'; key: string; label: string };

export interface ListField {
  kind: 'list';
  key: string;
  label: string;
  itemLabel: string;
  min: number;
  max: number;
  fields: ScalarField[];
}

export type SectionField = ScalarField | ListField;

export interface SectionDef<K extends string = string> {
  key: K;
  title: string;
  description: string;
  /** Explains what this section does not control (e.g. content from other dashboard pages). */
  note?: string;
  /** False for sections the site always shows (no "visible" switch in the editor). */
  hideable?: boolean;
  fields: SectionField[];
  defaults: () => SectionValues;
}

export type HomeSectionDef = SectionDef<HomeSectionKey>;

const p = 'public.home.';
const en = (key: string) => i18n.getFixedT('en')(p + key);
const ar = (key: string) => i18n.getFixedT('ar')(p + key);
const both = (name: string, key: string) => ({ [`${name}En`]: en(key), [`${name}Ar`]: ar(key) });
const words = (lng: 'en' | 'ar', key: string) => {
  const value = i18n.getFixedT(lng)(p + key, { returnObjects: true });
  return Array.isArray(value) ? value.join(' ') : '';
};

const L = 'pages.sections.fields.';

export const HOME_SECTIONS: HomeSectionDef[] = [
  {
    key: 'stats',
    title: 'pages.sections.stats.title',
    description: 'pages.sections.stats.description',
    fields: [
      {
        kind: 'list',
        key: 'items',
        label: L + 'tickerItems',
        itemLabel: L + 'tickerItem',
        min: 1,
        max: 8,
        fields: [{ kind: 'text', key: 'text', label: L + 'text', localized: true }],
      },
    ],
    defaults: () => ({
      visible: true,
      items: ['members', 'loop', 'events', 'distance'].map((k) => both('text', `stats.${k}`)),
    }),
  },
  {
    key: 'app',
    title: 'pages.sections.app.title',
    description: 'pages.sections.app.description',
    note: 'pages.sections.app.note',
    fields: [
      { kind: 'image', key: 'logoImage', label: L + 'logoImage' },
      { kind: 'textarea', key: 'headline', label: L + 'headline', localized: true, max: 300 },
      { kind: 'textarea', key: 'tagline', label: L + 'tagline', localized: true, max: 300 },
      { kind: 'text', key: 'downloadLabel', label: L + 'downloadLabel', localized: true },
      { kind: 'image', key: 'phoneImage', label: L + 'phoneImage' },
      {
        kind: 'list',
        key: 'features',
        label: L + 'features',
        itemLabel: L + 'feature',
        min: 1,
        max: 6,
        fields: [
          { kind: 'textarea', key: 'label', label: L + 'label', localized: true },
          { kind: 'image', key: 'icon', label: L + 'icon', size: '44 × 44 px' },
        ],
      },
    ],
    defaults: () => ({
      visible: true,
      logoImage: '/images/darraja.png',
      ...both('headline', 'darrajaApp.headline'),
      ...both('tagline', 'darrajaApp.tagline'),
      ...both('downloadLabel', 'darrajaApp.downloadLabel'),
      phoneImage: '/images/image%203066.png',
      features: ['track', 'challenges', 'connect', 'routes'].map((k, i) => ({
        ...both('label', `app.features.${k}`),
        icon: `/images/icon-${i + 1}.png`,
      })),
    }),
  },
  {
    key: 'journey',
    title: 'pages.sections.journey.title',
    description: 'pages.sections.journey.description',
    fields: [
      { kind: 'text', key: 'titleLine1', label: L + 'titleLine1', localized: true },
      { kind: 'text', key: 'titleLine2', label: L + 'titleLine2', localized: true },
      { kind: 'image', key: 'riderImage', label: L + 'riderImage', localized: true },
      {
        kind: 'list',
        key: 'cards',
        label: L + 'cards',
        itemLabel: L + 'card',
        min: 1,
        max: 8,
        fields: [
          { kind: 'textarea', key: 'label', label: L + 'label', localized: true },
          { kind: 'image', key: 'image', label: L + 'image' },
          { kind: 'link', key: 'link', label: L + 'link' },
        ],
      },
      { kind: 'textarea', key: 'text', label: L + 'text', localized: true, max: 1000 },
      { kind: 'text', key: 'buttonLabel', label: L + 'buttonLabel', localized: true },
      { kind: 'link', key: 'buttonLink', label: L + 'buttonLink' },
    ],
    defaults: () => ({
      visible: true,
      ...both('titleLine1', 'journey.titleLine1'),
      ...both('titleLine2', 'journey.titleLine2'),
      riderImageEn: '/images/journey.png',
      riderImageAr: '/images/journey-ar.png',
      cards: [
        { k: 'tracks', image: '/images/journey-1.png', link: '/tracks' },
        { k: 'events', image: '/images/journey-2.png', link: '/events' },
        { k: 'challenges', image: '/images/journey-3.png', link: '/challenges' },
        {
          k: 'community',
          image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&q=80',
          link: '/communities',
        },
      ].map(({ k, image, link }) => ({ ...both('label', `journey.cards.${k}`), image, link })),
      ...both('text', 'journey.text'),
      buttonLabelEn: i18n.getFixedT('en')('public.common.getInTouch'),
      buttonLabelAr: i18n.getFixedT('ar')('public.common.getInTouch'),
      buttonLink: '/contact-us',
    }),
  },
  {
    key: 'community',
    title: 'pages.sections.community.title',
    description: 'pages.sections.community.description',
    fields: [
      { kind: 'text', key: 'eyebrow', label: L + 'eyebrow', localized: true },
      { kind: 'text', key: 'title', label: L + 'title', localized: true },
      { kind: 'textarea', key: 'subtitle', label: L + 'subtitle', localized: true, max: 500 },
      { kind: 'text', key: 'buttonLabel', label: L + 'buttonLabel', localized: true },
      { kind: 'link', key: 'buttonLink', label: L + 'buttonLink' },
    ],
    defaults: () => ({
      visible: true,
      ...both('eyebrow', 'community.eyebrow'),
      ...both('title', 'community.title'),
      ...both('subtitle', 'community.subtitle'),
      ...both('buttonLabel', 'community.startRiding'),
      buttonLink: '/events',
    }),
  },
  {
    key: 'platform',
    title: 'pages.sections.platform.title',
    description: 'pages.sections.platform.description',
    fields: [
      { kind: 'text', key: 'title', label: L + 'title', localized: true },
      {
        kind: 'list',
        key: 'cards',
        label: L + 'cards',
        itemLabel: L + 'card',
        min: 1,
        max: 6,
        fields: [
          { kind: 'text', key: 'tag', label: L + 'tag', localized: true },
          { kind: 'textarea', key: 'title', label: L + 'title', localized: true, max: 300 },
          { kind: 'text', key: 'action', label: L + 'action', localized: true },
          { kind: 'image', key: 'image', label: L + 'image' },
          { kind: 'link', key: 'link', label: L + 'link' },
        ],
      },
    ],
    defaults: () => ({
      visible: true,
      ...both('title', 'platform.title'),
      cards: [
        { k: 'events', image: '/images/explore-1.png', link: '/events' },
        { k: 'tracks', image: '/images/explore-2.png', link: '/tracks' },
        { k: 'challenges', image: '/images/explore-3.png', link: '/challenges' },
      ].map(({ k, image, link }) => ({
        ...both('tag', `platform.cards.${k}.tag`),
        ...both('title', `platform.cards.${k}.title`),
        ...both('action', `platform.cards.${k}.action`),
        image,
        link,
      })),
    }),
  },
  {
    key: 'feed',
    title: 'pages.sections.feed.title',
    description: 'pages.sections.feed.description',
    note: 'pages.sections.feed.note',
    fields: [
      { kind: 'text', key: 'title', label: L + 'title', localized: true },
      { kind: 'textarea', key: 'subtitle', label: L + 'subtitle', localized: true, max: 1000 },
    ],
    defaults: () => ({ visible: true, ...both('title', 'feed.title'), ...both('subtitle', 'feed.subtitle') }),
  },
  {
    key: 'partners',
    title: 'pages.sections.partners.title',
    description: 'pages.sections.partners.description',
    note: 'pages.sections.partners.note',
    fields: [
      { kind: 'text', key: 'title', label: L + 'title', localized: true },
      { kind: 'textarea', key: 'subtitle', label: L + 'subtitle', localized: true, max: 1000 },
    ],
    defaults: () => ({ visible: true, ...both('title', 'partners.title'), ...both('subtitle', 'partners.subtitle') }),
  },
  {
    key: 'about',
    title: 'pages.sections.about.title',
    description: 'pages.sections.about.description',
    fields: [
      { kind: 'text', key: 'title', label: L + 'aboutTitle', localized: true },
      { kind: 'textarea', key: 'text', label: L + 'text', localized: true, max: 1500 },
      {
        kind: 'list',
        key: 'stats',
        label: L + 'stats',
        itemLabel: L + 'stat',
        min: 1,
        max: 4,
        fields: [
          { kind: 'text', key: 'value', label: L + 'value', localized: true, max: 20 },
          { kind: 'text', key: 'label', label: L + 'label', localized: true, max: 100 },
        ],
      },
      { kind: 'text', key: 'buttonLabel', label: L + 'buttonLabel', localized: true },
      { kind: 'link', key: 'buttonLink', label: L + 'buttonLink' },
      { kind: 'image', key: 'riderImage', label: L + 'riderImage', localized: true },
    ],
    defaults: () => ({
      visible: true,
      titleEn: words('en', 'about.titleWords'),
      titleAr: words('ar', 'about.titleWords'),
      ...both('text', 'about.text'),
      stats: ['riders', 'events', 'years'].map((k) => ({
        ...both('value', `about.stats.${k}Value`),
        ...both('label', `about.stats.${k}`),
      })),
      ...both('buttonLabel', 'about.readMore'),
      buttonLink: '/aboutus',
      riderImageEn: '/images/right-cycle.png',
      riderImageAr: '/images/right-cycle-ar.png',
    }),
  },
  {
    key: 'venue',
    title: 'pages.sections.venue.title',
    description: 'pages.sections.venue.description',
    fields: [
      { kind: 'text', key: 'title1', label: L + 'titleLine1', localized: true },
      { kind: 'text', key: 'title2', label: L + 'titleLine2', localized: true },
      { kind: 'image', key: 'image', label: L + 'image' },
      { kind: 'text', key: 'imageTitle', label: L + 'imageTitle', localized: true },
      { kind: 'textarea', key: 'imageSubtitle', label: L + 'imageSubtitle', localized: true, max: 500 },
      {
        kind: 'list',
        key: 'cards',
        label: L + 'cards',
        itemLabel: L + 'card',
        min: 2,
        max: 2,
        fields: [
          { kind: 'text', key: 'title', label: L + 'title', localized: true },
          { kind: 'textarea', key: 'text', label: L + 'text', localized: true, max: 500 },
        ],
      },
      { kind: 'textarea', key: 'text', label: L + 'text', localized: true, max: 1500 },
      { kind: 'text', key: 'buttonLabel', label: L + 'buttonLabel', localized: true },
      { kind: 'link', key: 'buttonLink', label: L + 'buttonLink' },
    ],
    defaults: () => ({
      visible: true,
      ...both('title1', 'venue.title1'),
      ...both('title2', 'venue.title2'),
      image: '/images/book-venue.png',
      ...both('imageTitle', 'venue.imageTitle'),
      ...both('imageSubtitle', 'venue.imageSubtitle'),
      cards: [
        { ...both('title', 'venue.eventsTitle'), ...both('text', 'venue.eventsText') },
        { ...both('title', 'venue.spacesTitle'), ...both('text', 'venue.spacesText') },
      ],
      ...both('text', 'venue.text'),
      ...both('buttonLabel', 'venue.bookNow'),
      buttonLink: 'https://erp.adcyclingclub.ae/contracts/venue/public/book/',
    }),
  },
];

export const getHomeSectionDef = (key: HomeSectionKey) => HOME_SECTIONS.find((s) => s.key === key)!;

/** The stored keys of a scalar field. */
export const fieldKeys = (field: ScalarField): string[] =>
  field.kind !== 'link' && field.localized ? [`${field.key}En`, `${field.key}Ar`] : [field.key];

/** A blank list item (used when an admin adds one). */
export const emptyListItem = (list: ListField): ListItem =>
  Object.fromEntries(list.fields.flatMap(fieldKeys).map((key) => [key, '']));

const str = (value: unknown, fallback: string) => (typeof value === 'string' ? value : fallback);

const normalizeScalars = (
  fields: ScalarField[],
  raw: Record<string, unknown> | undefined,
  defaults: Record<string, unknown>,
) => {
  const out: Record<string, string> = {};
  for (const field of fields) {
    for (const key of fieldKeys(field)) {
      const fallback = str(defaults[key], '');
      const value = str(raw?.[key], fallback);
      // A cleared image falls back to the default one: an image slot is never
      // meant to be blank (text, on the other hand, may be emptied on purpose).
      out[key] = field.kind === 'image' && !value.trim() ? fallback : value;
    }
  }
  return out;
};

/** Saved content merged over the defaults, so missing or malformed keys never break the site. */
export const normalizeSection = (def: SectionDef, raw: unknown): SectionValues => {
  const defaults = def.defaults();
  if (!raw || typeof raw !== 'object') return defaults;
  const source = raw as Record<string, unknown>;

  const out: SectionValues = { visible: source.visible !== false };
  for (const field of def.fields) {
    if (field.kind !== 'list') {
      Object.assign(out, normalizeScalars([field], source, defaults));
      continue;
    }
    const defaultItems = (defaults[field.key] as ListItem[]) ?? [];
    const items = Array.isArray(source[field.key]) ? (source[field.key] as unknown[]) : null;
    out[field.key] = items
      ? items.map((item) =>
          normalizeScalars(field.fields, item && typeof item === 'object' ? (item as any) : {}, {}),
        )
      : defaultItems;
  }
  return out;
};

export const normalizeHomeSection = (key: HomeSectionKey, raw: unknown): SectionValues =>
  normalizeSection(getHomeSectionDef(key), raw);

/** Every saved section of a page (raw), keyed by section; unsaved sections are absent. */
export const getPageSections = async (page: string): Promise<Partial<Record<string, unknown>>> => {
  const response = await api.get(`/v1/pages/${page}/sections`);
  return response.data?.data?.sections ?? {};
};

export const getHomeSections = () => getPageSections('home');

/** `files` maps a content path (e.g. `phoneImage`, `cards.2.image`) to the new image for it. */
export const savePageSection = async (
  page: string,
  def: SectionDef,
  content: SectionValues,
  files: Record<string, File>,
): Promise<SectionValues> => {
  const formData = new FormData();
  formData.append('content', JSON.stringify(content));
  for (const [path, file] of Object.entries(files)) formData.append(path, file);
  const response = await api.put(`/v1/pages/${page}/sections/${def.key}`, formData);
  return normalizeSection(def, response.data?.data?.content);
};

export const getHomeSection = async (
  key: HomeSectionKey,
): Promise<{ content: SectionValues; saved: boolean }> => {
  const response = await api.get(`/v1/pages/home/sections/${key}`);
  const raw = response.data?.data?.content;
  return { content: normalizeHomeSection(key, raw), saved: Boolean(raw) };
};

export const saveHomeSection = (key: HomeSectionKey, content: SectionValues, files: Record<string, File>) =>
  savePageSection('home', getHomeSectionDef(key), content, files);
