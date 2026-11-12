import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Link2, RotateCcw, Save } from 'lucide-react';
import { BUILT_IN_PAGE_PATHS, updatePageRoute } from '../../services/siteRouting';
import type { ContentPageId } from '../../services/contentPages';
import { getPagesErrorMessage } from '../../services/pagesApi';
import { useSiteRouting } from '../../contexts/SiteRoutingContext';
import { Field, inputClass, inputStyle } from './PageFields';

/** The URL of a built-in page; the old URL keeps working through a redirect. */
export function PageUrlCard({ pageId }: { pageId: ContentPageId }) {
  const { t } = useTranslation();
  const { routing, refresh } = useSiteRouting();
  const current = routing.pages[pageId];
  const original = BUILT_IN_PAGE_PATHS[pageId];
  const [value, setValue] = useState(current);
  const [saving, setSaving] = useState(false);

  // Follow the saved URL (e.g. when the routing finishes loading).
  useEffect(() => setValue(current), [current]);

  const save = async (path: string) => {
    setSaving(true);
    try {
      const result = await updatePageRoute(pageId, path);
      await refresh();
      setValue(result.path);
      toast.success(
        result.path === current
          ? t('pages.url.unchanged')
          : t('pages.url.saved', { from: current, to: result.path }),
      );
    } catch (error) {
      toast.error(getPagesErrorMessage(error, t('pages.url.saveError')));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl shadow-sm bg-white p-6 space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-xl" style={{ color: '#333' }}>
          <Link2 className="w-5 h-5" />
          {t('pages.url.title')}
        </h2>
        <p className="text-sm" style={{ color: '#666' }}>
          {t('pages.url.description')}
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[260px] flex-1">
          <Field
            label={t('pages.url.label')}
            hint={
              current === original
                ? t('pages.url.hintOriginal')
                : t('pages.url.hintChanged', { original })
            }
          >
            <input
              className={inputClass}
              style={inputStyle}
              dir="ltr"
              value={value}
              maxLength={200}
              onChange={(e) => {
                const raw = e.target.value.toLowerCase().replace(/\s+/g, '-');
                setValue(raw && !raw.startsWith('/') ? `/${raw}` : raw);
              }}
            />
          </Field>
        </div>
        {current !== original && (
          <button
            type="button"
            onClick={() => save(original)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm disabled:opacity-50"
            style={inputStyle}
          >
            <RotateCcw className="w-4 h-4" />
            {t('pages.url.reset')}
          </button>
        )}
        <button
          type="button"
          onClick={() => save(value)}
          disabled={saving || !value || value === current}
          className="flex items-center gap-2 px-6 py-2 rounded-lg text-white text-sm disabled:opacity-50"
          style={{ backgroundColor: '#C12D32' }}
        >
          <Save className="w-4 h-4" />
          {saving ? t('pages.banner.saving') : t('pages.url.save')}
        </button>
      </div>
    </div>
  );
}
