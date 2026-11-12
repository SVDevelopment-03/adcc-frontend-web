import i18n from '../i18n';
import { normalizeSection, type ScalarField, type SectionDef, type SectionValues } from './homeSections';

/**
 * Site-wide header and footer, edited under Pages → Header & Footer and stored
 * as page "layout". Defaults are what the site showed before this became
 * editable, so nothing changes until an admin saves.
 *
 * Keep the field keys in sync with PAGE_SECTION_SCHEMAS.layout in the
 * backend's page-section.validator.ts.
 */

export type LayoutSectionKey = 'header' | 'cta' | 'footer' | 'journey';

const en = (key: string) => i18n.getFixedT('en')(key);
const ar = (key: string) => i18n.getFixedT('ar')(key);
const both = (name: string, key: string) => ({ [`${name}En`]: en(key), [`${name}Ar`]: ar(key) });
const navLink = (key: string, link: string) => ({ ...both('label', key), link });

const L = 'pages.sections.fields.';

const linkFields: ScalarField[] = [
  { kind: 'text', key: 'label', label: L + 'label', localized: true },
  { kind: 'link', key: 'link', label: L + 'link' },
];

export const LAYOUT_SECTIONS: SectionDef<LayoutSectionKey>[] = [
  {
    key: 'header',
    title: 'pages.sections.header.title',
    description: 'pages.sections.header.description',
    note: 'pages.sections.header.note',
    hideable: false,
    fields: [
      { kind: 'image', key: 'logoImage', label: L + 'logoImage' },
      {
        kind: 'list',
        key: 'navItems',
        label: L + 'navItems',
        itemLabel: L + 'navItem',
        min: 1,
        max: 10,
        fields: linkFields,
      },
    ],
    defaults: () => ({
      visible: true,
      logoImage: '/images/adcc-logo-header.png',
      navItems: [
        navLink('public.nav.home', '/'),
        navLink('public.nav.aboutUs', '/aboutus'),
        navLink('public.nav.events', '/events'),
        navLink('public.nav.community', '/communities'),
        navLink('public.nav.challenges', '/challenges'),
        navLink('public.nav.tracks', '/tracks'),
        navLink('public.footer.contactUs', '/contact-us'),
      ],
    }),
  },
  {
    key: 'cta',
    title: 'pages.sections.cta.title',
    description: 'pages.sections.cta.description',
    note: 'pages.sections.cta.note',
    fields: [
      { kind: 'text', key: 'title', label: L + 'title', localized: true },
      { kind: 'textarea', key: 'subtitle', label: L + 'subtitle', localized: true, max: 500 },
      { kind: 'image', key: 'backgroundImage', label: L + 'backgroundImage', size: '1440 × 502 px' },
    ],
    defaults: () => ({
      visible: true,
      ...both('title', 'public.footer.ctaTitle'),
      ...both('subtitle', 'public.footer.ctaSubtitle'),
      backgroundImage: '/images/footer-image.png',
    }),
  },
  {
    key: 'footer',
    title: 'pages.sections.footer.title',
    description: 'pages.sections.footer.description',
    note: 'pages.sections.footer.note',
    hideable: false,
    fields: [
      { kind: 'image', key: 'logoImage', label: L + 'logoImage' },
      { kind: 'textarea', key: 'brandText', label: L + 'brandText', localized: true, max: 1000 },
      {
        kind: 'list',
        key: 'socialLinks',
        label: L + 'socialLinks',
        itemLabel: L + 'socialLink',
        min: 0,
        max: 8,
        fields: linkFields,
      },
      { kind: 'text', key: 'quickLinksTitle', label: L + 'quickLinksTitle', localized: true },
      {
        kind: 'list',
        key: 'quickLinks',
        label: L + 'quickLinks',
        itemLabel: L + 'quickLink',
        min: 0,
        max: 12,
        fields: linkFields,
      },
      { kind: 'text', key: 'contactTitle', label: L + 'contactTitle', localized: true },
      { kind: 'text', key: 'phone', label: L + 'phone', max: 50 },
      { kind: 'text', key: 'email', label: L + 'email' },
      { kind: 'textarea', key: 'address', label: L + 'address', localized: true, max: 500 },
      { kind: 'link', key: 'addressLink', label: L + 'addressLink' },
      { kind: 'text', key: 'copyright', label: L + 'copyright', localized: true },
    ],
    defaults: () => ({
      visible: true,
      logoImage: '/images/adcc-logo.png',
      ...both('brandText', 'public.footer.brandText'),
      socialLinks: [
        navLink('public.footer.social.twitter', 'https://twitter.com/adcyclingclub'),
        navLink('public.footer.social.facebook', 'https://www.facebook.com/adcyclingclub/'),
        navLink('public.footer.social.instagram', 'https://www.instagram.com/adcyclingclub/'),
        navLink('public.footer.social.youtube', 'https://www.youtube.com/channel/UCmAQA4sNHPvpae86czU-U4g'),
      ],
      ...both('quickLinksTitle', 'public.footer.quickLinks'),
      quickLinks: [
        navLink('public.nav.aboutUs', '/aboutus'),
        navLink('public.footer.communities', '/communities'),
        navLink('public.nav.events', '/events'),
        navLink('public.footer.cyclistsCorner', '/challenges'),
        navLink('public.footer.rides', '/tracks'),
        navLink('public.footer.venueBooking', 'https://erp.adcyclingclub.ae/contracts/venue/public/book/'),
        navLink('public.footer.contactUs', '/contact-us'),
        navLink('public.footer.privacyPolicy', '/privacy-policy'),
      ],
      ...both('contactTitle', 'public.footer.contactUs'),
      phone: '+971 2 622 8894',
      email: 'info@adcyclingclub.ae',
      ...both('address', 'public.footer.address'),
      addressLink: 'https://maps.app.goo.gl/5dx641z5VDFrqrhH7',
      ...both('copyright', 'public.footer.copyright'),
    }),
  },
  {
    key: 'journey',
    title: 'pages.sections.journeyCard.title',
    description: 'pages.sections.journeyCard.description',
    fields: [
      { kind: 'image', key: 'riderImage', label: L + 'riderImage', size: '300 × 380 px' },
      { kind: 'text', key: 'eyebrow', label: L + 'eyebrow', localized: true },
      { kind: 'text', key: 'title', label: L + 'title', localized: true },
      { kind: 'text', key: 'communityText', label: L + 'communityText', localized: true },
      { kind: 'text', key: 'buttonLabel', label: L + 'buttonLabel', localized: true },
      { kind: 'link', key: 'buttonLink', label: L + 'buttonLink' },
    ],
    defaults: () => {
      const words = (lng: 'en' | 'ar') => {
        const value = i18n.getFixedT(lng)('public.common.journeyCard.title', { returnObjects: true });
        if (Array.isArray(value)) return value.join(' ');
        return typeof value === 'string' ? value : '';
      };
      return {
        visible: true,
        riderImage: '/img/image 2991.png',
        ...both('eyebrow', 'public.common.journeyCard.eyebrow'),
        titleEn: words('en'),
        titleAr: words('ar'),
        ...both('communityText', 'public.common.journeyCard.community'),
        ...both('buttonLabel', 'public.common.journeyCard.cta'),
        buttonLink: '/contact-us',
      };
    },
  },
];

export const getLayoutSectionDef = (key: LayoutSectionKey) => LAYOUT_SECTIONS.find((s) => s.key === key)!;

export const normalizeLayoutSection = (key: LayoutSectionKey, raw: unknown): SectionValues =>
  normalizeSection(getLayoutSectionDef(key), raw);
