import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home } from 'lucide-react';

const PAGES = [
  {
    id: 'home',
    path: '/pages/home',
    icon: <Home className="w-6 h-6" style={{ color: '#C12D32' }} />,
    titleKey: 'pages.home.title',
    descriptionKey: 'pages.home.description',
  },
];

export function PagesList() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>
          {t('sidebar.pages')}
        </h1>
        <p style={{ color: '#666' }}>{t('pages.subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PAGES.map((page) => (
          <button
            key={page.id}
            type="button"
            onClick={() => navigate(page.path)}
            className="flex items-center gap-4 p-6 rounded-2xl shadow-sm bg-white text-left border transition-colors hover:border-[#ECC180]"
            style={{ borderColor: 'transparent' }}
          >
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: '#FFF3E0' }}
            >
              {page.icon}
            </span>
            <span className="flex-1">
              <span className="block text-lg" style={{ color: '#333' }}>
                {t(page.titleKey)}
              </span>
              <span className="block text-sm" style={{ color: '#666' }}>
                {t(page.descriptionKey)}
              </span>
            </span>
            <ChevronRight className="w-5 h-5" style={{ color: '#999' }} />
          </button>
        ))}
      </div>
    </div>
  );
}
