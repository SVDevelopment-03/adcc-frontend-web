import type { ScalarField, SectionField } from './homeSections';

/**
 * Content blocks for dashboard-built pages (Pages → New page). The editor
 * renders each block's form from `fields`; the site renders it in
 * components/public/CustomPage.tsx. Keep in sync with customPageBlockSchema in
 * the backend's site.validator.ts.
 */

export type CustomPageBlockType = 'hero' | 'text' | 'imageText' | 'image' | 'cards' | 'faq' | 'cta' | 'gallery';

export type CustomPageBlock = { id: string; type: CustomPageBlockType; visible: boolean } & Record<string, unknown>;

export interface CustomPageBlockDef {
  type: CustomPageBlockType;
  label: string;
  description: string;
  fields: SectionField[];
}

const L = 'pages.sections.fields.';
const B = 'pages.custom.blocks.';

const line = (key: string, label = key, max = 200): ScalarField => ({ kind: 'text', key, label: L + label, localized: true, max });
const para = (key: string, label = key, max = 2000): ScalarField => ({ kind: 'textarea', key, label: L + label, localized: true, max });
const image = (key = 'image', label = key, size?: string): ScalarField => ({ kind: 'image', key, label: L + label, size });
const link = (key: string, label = key): ScalarField => ({ kind: 'link', key, label: L + label });

export const CUSTOM_PAGE_BLOCKS: CustomPageBlockDef[] = [
  {
    type: 'hero',
    label: B + 'hero.label',
    description: B + 'hero.description',
    fields: [line('title'), line('subtitle', 'subtitle', 300), image('backgroundImage', 'backgroundImage', '1440 × 900 px')],
  },
  {
    type: 'text',
    label: B + 'text.label',
    description: B + 'text.description',
    fields: [line('heading', 'heading', 300), para('body', 'richBody', 20000)],
  },
  {
    type: 'imageText',
    label: B + 'imageText.label',
    description: B + 'imageText.description',
    // `imagePosition` (left/right) has its own control in the editor.
    fields: [
      line('heading', 'heading', 300),
      para('body', 'richBody', 5000),
      image('image', 'image', '600 × 440 px'),
      line('buttonLabel'),
      link('buttonLink'),
    ],
  },
  {
    type: 'image',
    label: B + 'image.label',
    description: B + 'image.description',
    fields: [image('image', 'image', '1200 × 600 px'), line('caption', 'caption', 300)],
  },
  {
    type: 'cards',
    label: B + 'cards.label',
    description: B + 'cards.description',
    fields: [
      line('heading', 'heading', 300),
      {
        kind: 'list',
        key: 'items',
        label: L + 'cards',
        itemLabel: L + 'card',
        min: 1,
        max: 12,
        fields: [line('title'), para('text', 'text', 1000), image('image', 'image', '400 × 260 px'), link('link')],
      },
    ],
  },
  {
    type: 'faq',
    label: B + 'faq.label',
    description: B + 'faq.description',
    fields: [
      line('heading', 'heading', 300),
      {
        kind: 'list',
        key: 'items',
        label: L + 'questions',
        itemLabel: L + 'question',
        min: 1,
        max: 30,
        fields: [line('question', 'question', 300), para('answer', 'answer', 3000)],
      },
    ],
  },
  {
    type: 'cta',
    label: B + 'cta.label',
    description: B + 'cta.description',
    fields: [
      line('title'),
      para('text', 'text', 1000),
      line('buttonLabel'),
      link('buttonLink'),
      image('backgroundImage', 'backgroundImage', '1440 × 500 px'),
    ],
  },
  {
    type: 'gallery',
    label: B + 'gallery.label',
    description: B + 'gallery.description',
    fields: [
      line('heading', 'heading', 300),
      {
        kind: 'list',
        key: 'items',
        label: L + 'images',
        itemLabel: L + 'image',
        min: 1,
        max: 30,
        fields: [image('image', 'image', '800 × 600 px')],
      },
    ],
  },
];

export const getBlockDef = (type: string) => CUSTOM_PAGE_BLOCKS.find((b) => b.type === type);

const keysOf = (field: ScalarField) =>
  field.kind !== 'link' && field.localized ? [`${field.key}En`, `${field.key}Ar`] : [field.key];

const emptyItem = (fields: ScalarField[]) => Object.fromEntries(fields.flatMap(keysOf).map((k) => [k, '']));

/** A new block of `type` with every field empty (lists start with one item). */
export const emptyBlock = (type: CustomPageBlockType): CustomPageBlock => {
  const def = getBlockDef(type)!;
  const block: CustomPageBlock = {
    id: `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    type,
    visible: true,
  };
  for (const field of def.fields) {
    if (field.kind === 'list') block[field.key] = [emptyItem(field.fields)];
    else Object.assign(block, emptyItem([field]));
  }
  if (type === 'imageText') block.imagePosition = 'right';
  return block;
};
