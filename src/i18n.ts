import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ar from './locales/ar.json';
import publicRoutesEn from './locales/publicRoutes.en.json';
import publicRoutesAr from './locales/publicRoutes.ar.json';

function mergePublicRoutes(base: Record<string, unknown>, routes: Record<string, unknown>) {
  const basePublic = (base.public ?? {}) as Record<string, unknown>;
  const baseTracks = (basePublic.tracks ?? {}) as Record<string, unknown>;
  const routeTracks = (routes.tracks ?? {}) as Record<string, unknown>;

  return {
    ...base,
    public: {
      ...basePublic,
      ...routes,
      tracks: {
        ...baseTracks,
        ...routeTracks,
      },
    },
  };
}

const enResources = mergePublicRoutes(en as Record<string, unknown>, publicRoutesEn as Record<string, unknown>);
const arResources = mergePublicRoutes(ar as Record<string, unknown>, publicRoutesAr as Record<string, unknown>);

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enResources },
    ar: { translation: arResources },
  },
  lng: localStorage.getItem('locale') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
