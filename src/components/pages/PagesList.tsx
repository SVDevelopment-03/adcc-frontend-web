import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, FileText, FilePlus2, Home, PanelsTopLeft, Shuffle } from 'lucide-react';
import { CONTENT_PAGES } from '../../services/contentPages';
import { listCustomPages, type CustomPageSummary } from '../../services/siteRouting';
import { useSiteRouting } from '../../contexts/SiteRoutingContext';

const iconStyle = { color: '#C12D32' };

function PageCard({
  icon,
  title,
  description,
  meta,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  meta?: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-4 p-6 rounded-2xl shadow-sm bg-white text-left border transition-colors hover:border-[#ECC180]"
      style={{ borderColor: 'transparent' }}
    >
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: '#FFF3E0' }}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg" style={{ color: '#333' }}>
          {title}
        </span>
        <span className="block text-sm" style={{ color: '#666' }}>
          {description}
        </span>
        {meta}
      </span>
      <ChevronRight className="w-5 h-5 shrink-0" style={{ color: '#999' }} />
    </button>
  );
}

function UrlMeta({ path }: { path: string }) {
  return (
    <span className="mt-1 block truncate font-mono text-xs" style={{ color: '#999' }} dir="ltr">
      {path}
    </span>
  );
}

export function PagesList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { routing } = useSiteRouting();
  const [customPages, setCustomPages] = useState<CustomPageSummary[] | null>(null);

  useEffect(() => {
    listCustomPages()
      .then(setCustomPages)
      .catch(() => setCustomPages([]));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>
          {t('sidebar.pages')}
        </h1>
        <p style={{ color: '#666' }}>{t('pages.subtitle')}</p>
      </div>

      {/* Pages built in the dashboard */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl" style={{ color: '#333' }}>
              {t('pages.custom.listTitle')}
            </h2>
            <p className="text-sm" style={{ color: '#666' }}>
              {t('pages.custom.listSubtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/pages/custom/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
            style={{ backgroundColor: '#C12D32' }}
          >
            <FilePlus2 className="w-4 h-4" />
            {t('pages.custom.newPage')}
          </button>
        </div>
        {!customPages ? (
          <div className="h-20 animate-pulse rounded-2xl bg-white" />
        ) : customPages.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-sm shadow-sm" style={{ color: '#999' }}>
            {t('pages.custom.noPages')}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {customPages.map((page) => (
              <PageCard
                key={page._id}
                icon={<FileText className="w-6 h-6" style={iconStyle} />}
                title={page.titleEn}
                description={page.status === 'published' ? t('pages.custom.published') : t('pages.custom.draft')}
                meta={<UrlMeta path={page.slug} />}
                onClick={() => navigate(`/pages/custom/${page._id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Redirects */}
      <section className="space-y-3">
        <h2 className="text-xl" style={{ color: '#333' }}>
          {t('pages.redirects.title')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <PageCard
            icon={<Shuffle className="w-6 h-6" style={iconStyle} />}
            title={t('pages.redirects.title')}
            description={t('pages.redirects.cardDescription')}
            meta={
              <span className="mt-1 block text-xs" style={{ color: '#999' }}>
                {t('pages.redirects.activeCount', { count: routing.redirects.length })}
              </span>
            }
            onClick={() => navigate('/pages/redirects')}
          />
        </div>
      </section>

      {/* The site's own pages */}
      <section className="space-y-3">
        <div>
          <h2 className="text-xl" style={{ color: '#333' }}>
            {t('pages.sitePagesTitle')}
          </h2>
          <p className="text-sm" style={{ color: '#666' }}>
            {t('pages.sitePagesSubtitle')}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <PageCard
            icon={<Home className="w-6 h-6" style={iconStyle} />}
            title={t('pages.home.title')}
            description={t('pages.home.description')}
            meta={<UrlMeta path="/" />}
            onClick={() => navigate('/pages/home')}
          />
          <PageCard
            icon={<PanelsTopLeft className="w-6 h-6" style={iconStyle} />}
            title={t('pages.layout.title')}
            description={t('pages.layout.description')}
            onClick={() => navigate('/pages/layout')}
          />
          {CONTENT_PAGES.map((page) => (
            <PageCard
              key={page.id}
              icon={<FileText className="w-6 h-6" style={iconStyle} />}
              title={t(page.title)}
              description={t(page.description)}
              meta={<UrlMeta path={routing.pages[page.id] ?? page.path} />}
              onClick={() => navigate(`/pages/${page.id}`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
