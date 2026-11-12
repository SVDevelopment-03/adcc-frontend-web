import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getPageSections, normalizeSection } from '../../services/homeSections';
import { getPagesErrorMessage } from '../../services/pagesApi';
import { contentPageCacheKey, getContentPageDef } from '../../services/contentPages';
import { HomeSectionEditor } from './HomeSectionEditor';
import { PageUrlCard } from './PageUrlCard';
import { useSiteRouting } from '../../contexts/SiteRoutingContext';

/** Pages → <page>: every editable section of one public page (About Us, Events, ...). */
export function ContentPageEditor() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pageId = '' } = useParams();
  const page = getContentPageDef(pageId);
  const { routing } = useSiteRouting();
  const [sections, setSections] = useState<Partial<Record<string, unknown>> | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!page) return;
    let cancelled = false;
    setSections(null);
    setLoadError('');
    getPageSections(page.id)
      .then((loaded) => {
        if (!cancelled) setSections(loaded);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(getPagesErrorMessage(error, t('pages.sections.loadError')));
      });
    return () => {
      cancelled = true;
    };
  }, [page, t]);

  if (!page) return <Navigate to="/pages" replace />;

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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl mb-2" style={{ color: '#333' }}>
              {t(page.title)}
            </h1>
            <p style={{ color: '#666' }}>{t('pages.content.editorSubtitle')}</p>
          </div>
          <a
            href={routing.pages[page.id] ?? page.path}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm"
            style={{ borderColor: '#E5DDD4', color: '#333' }}
          >
            <ExternalLink className="w-4 h-4" />
            {t('pages.content.viewPage')}
          </a>
        </div>
      </div>

      <PageUrlCard key={page.id} pageId={page.id} />

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
          page.sections.map((def) => (
            <HomeSectionEditor
              key={`${page.id}.${def.key}`}
              def={def}
              page={page.id}
              cacheKey={contentPageCacheKey(page.id)}
              initial={normalizeSection(def, sections[def.key])}
              initiallySaved={Boolean(sections[def.key])}
            />
          ))
        )}
      </div>
    </div>
  );
}
