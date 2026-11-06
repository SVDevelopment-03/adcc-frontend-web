import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { getPageSections } from '../../services/homeSections';
import { getPagesErrorMessage } from '../../services/pagesApi';
import { LAYOUT_SECTIONS, normalizeLayoutSection } from '../../services/layoutSections';
import { LAYOUT_SECTIONS_CACHE_KEY } from '../public/useLayoutSection';
import { HomeSectionEditor } from './HomeSectionEditor';

/** Pages → Header & Footer: the site-wide header, "Start your ride" banner and footer. */
export function LayoutPageEditor() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sections, setSections] = useState<Partial<Record<string, unknown>> | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getPageSections('layout')
      .then((loaded) => {
        if (!cancelled) setSections(loaded);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(getPagesErrorMessage(error, t('pages.sections.loadError')));
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate('/pages')}
          className="mb-3 flex items-center gap-2 text-sm"
          style={{ color: '#666' }}
        >
          <ArrowLeft className="w-4 h-4" />
          {t('pages.backToPages')}
        </button>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>
          {t('pages.layout.title')}
        </h1>
        <p style={{ color: '#666' }}>{t('pages.layout.editorSubtitle')}</p>
      </div>

      <div className="space-y-4">
        {loadError ? (
          <div className="p-6 rounded-2xl shadow-sm bg-white text-sm" style={{ color: '#C12D32' }}>
            {loadError}
          </div>
        ) : !sections ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#C12D32' }} />
          </div>
        ) : (
          LAYOUT_SECTIONS.map((def) => (
            <HomeSectionEditor
              key={def.key}
              def={def}
              page="layout"
              cacheKey={LAYOUT_SECTIONS_CACHE_KEY}
              initial={normalizeLayoutSection(def.key, sections[def.key])}
              initiallySaved={Boolean(sections[def.key])}
            />
          ))
        )}
      </div>
    </div>
  );
}
