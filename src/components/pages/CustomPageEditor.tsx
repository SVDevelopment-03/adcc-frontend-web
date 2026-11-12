import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  Eye,
  EyeOff,
  ExternalLink,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import {
  createCustomPage,
  deleteCustomPage,
  getCustomPage,
  updateCustomPage,
  type CustomPageInput,
} from '../../services/siteRouting';
import {
  CUSTOM_PAGE_BLOCKS,
  emptyBlock,
  getBlockDef,
  type CustomPageBlock,
  type CustomPageBlockType,
} from '../../services/customPageBlocks';
import type { ListItem } from '../../services/homeSections';
import { getPagesErrorMessage } from '../../services/pagesApi';
import { uploadToMediaLibrary } from '../../services/mediaApi';
import { useSiteRouting } from '../../contexts/SiteRoutingContext';
import { invalidateCache } from '../../utils/apiCache';
import { Field, inputClass, inputStyle } from './PageFields';
import { ListEditor, ScalarFields } from './HomeSectionEditor';

const IMAGE_FOLDER = 'page-banners';

const EMPTY_PAGE: CustomPageInput = {
  slug: '',
  titleEn: '',
  titleAr: '',
  status: 'draft',
  seoTitleEn: '',
  seoTitleAr: '',
  seoDescriptionEn: '',
  seoDescriptionAr: '',
  blocks: [],
};

/** "About ADCC!" → "/about-adcc" */
export const slugify = (value: string) =>
  `/${value
    .toLowerCase()
    .replace(/[^a-z0-9/\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-/]+|[-/]+$/g, '')}`;

/** Sets `value` at a dot path such as `image` or `items.2.image`. */
const setAtPath = (target: Record<string, unknown>, path: string, value: string) => {
  const segments = path.split('.');
  let parent: any = target;
  for (const segment of segments.slice(0, -1)) parent = parent?.[segment];
  if (parent && typeof parent === 'object') parent[segments[segments.length - 1]] = value;
};

/** Pages → New page / <custom page>: a page built from content blocks, with its own URL. */
export function CustomPageEditor() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = 'new' } = useParams();
  const isNew = id === 'new';
  const { refresh: refreshRouting } = useSiteRouting();

  const [page, setPage] = useState<CustomPageInput>(EMPTY_PAGE);
  const [savedSlug, setSavedSlug] = useState('');
  const [savedStatus, setSavedStatus] = useState<'draft' | 'published'>('draft');
  const [slugTouched, setSlugTouched] = useState(!isNew);
  // Pending image uploads per block, keyed by content path within the block.
  const [files, setFiles] = useState<Record<string, Record<string, File>>>({});
  const [openBlock, setOpenBlock] = useState<string | null>(null);
  const [showSeo, setShowSeo] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) {
      setPage(EMPTY_PAGE);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getCustomPage(id)
      .then((loaded) => {
        if (cancelled) return;
        const { slug, titleEn, titleAr, status, seoTitleEn, seoTitleAr, seoDescriptionEn, seoDescriptionAr, blocks } =
          loaded;
        setPage({ slug, titleEn, titleAr, status, seoTitleEn, seoTitleAr, seoDescriptionEn, seoDescriptionAr, blocks });
        setSavedSlug(slug);
        setSavedStatus(status);
      })
      .catch((error) => {
        toast.error(getPagesErrorMessage(error, t('pages.custom.loadError')));
        navigate('/pages', { replace: true });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isNew, navigate, t]);

  const update = (patch: Partial<CustomPageInput>) => setPage((prev) => ({ ...prev, ...patch }));
  const setBlocks = (updater: (blocks: CustomPageBlock[]) => CustomPageBlock[]) =>
    setPage((prev) => ({ ...prev, blocks: updater(prev.blocks) }));
  const updateBlock = (blockId: string, patch: Record<string, unknown>) =>
    setBlocks((blocks) => blocks.map((b) => (b.id === blockId ? { ...b, ...patch } : b)));

  const addBlock = (type: CustomPageBlockType) => {
    const block = emptyBlock(type);
    setBlocks((blocks) => [...blocks, block]);
    setOpenBlock(block.id);
  };
  const moveBlock = (index: number, to: number) =>
    setBlocks((blocks) => {
      const next = [...blocks];
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
  const removeBlock = (blockId: string) => {
    if (!window.confirm(t('pages.custom.confirmRemoveBlock'))) return;
    setBlocks((blocks) => blocks.filter((b) => b.id !== blockId));
    setFiles((prev) => {
      const next = { ...prev };
      delete next[blockId];
      return next;
    });
  };

  const pendingUploads = useMemo(
    () => Object.values(files).reduce((sum, blockFiles) => sum + Object.keys(blockFiles).length, 0),
    [files],
  );

  const handleSave = async () => {
    if (!page.titleEn.trim()) {
      toast.error(t('pages.custom.titleRequired'));
      return;
    }
    const slug = page.slug.trim() || slugify(page.titleEn);
    setSaving(true);
    try {
      // Upload new images first, then save the page with their URLs.
      const blocks = structuredClone(page.blocks) as CustomPageBlock[];
      for (const block of blocks) {
        for (const [path, file] of Object.entries(files[block.id] ?? {})) {
          const uploaded = await uploadToMediaLibrary(file, IMAGE_FOLDER);
          setAtPath(block, path, uploaded.url);
        }
      }
      const input = { ...page, slug, blocks };

      if (isNew) {
        const created = await createCustomPage(input);
        setFiles({});
        toast.success(t('pages.custom.created'));
        await refreshRouting();
        navigate(`/pages/custom/${created._id}`, { replace: true });
        return;
      }

      const { page: saved, redirectAdded } = await updateCustomPage(id, input);
      setPage((prev) => ({ ...prev, slug: saved.slug, blocks: saved.blocks }));
      setSavedSlug(saved.slug);
      setSavedStatus(saved.status);
      setFiles({});
      invalidateCache(`site:page:${saved.slug}`);
      await refreshRouting();
      toast.success(
        redirectAdded ? t('pages.custom.savedWithRedirect', { from: savedSlug, to: saved.slug }) : t('pages.custom.saved'),
      );
    } catch (error) {
      toast.error(getPagesErrorMessage(error, t('pages.custom.saveError')));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('pages.custom.confirmDelete', { title: page.titleEn }))) return;
    try {
      await deleteCustomPage(id);
      await refreshRouting();
      toast.success(t('pages.custom.deleted'));
      navigate('/pages');
    } catch (error) {
      toast.error(getPagesErrorMessage(error, t('pages.custom.deleteError')));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#C12D32' }} />
      </div>
    );
  }

  const urlPreview = page.slug.trim() || (page.titleEn ? slugify(page.titleEn) : '/');

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
              {isNew ? t('pages.custom.newTitle') : page.titleEn || t('pages.custom.untitled')}
            </h1>
            <p style={{ color: '#666' }}>{t('pages.custom.subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isNew && savedStatus === 'published' && (
              <a
                href={savedSlug}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm"
                style={{ borderColor: '#E5DDD4', color: '#333' }}
              >
                <ExternalLink className="w-4 h-4" />
                {t('pages.content.viewPage')}
              </a>
            )}
            {!isNew && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm"
                style={{ borderColor: '#E5DDD4', color: '#C12D32' }}
              >
                <Trash2 className="w-4 h-4" />
                {t('pages.custom.delete')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Page settings */}
      <div className="rounded-2xl shadow-sm bg-white p-6 space-y-5">
        <h2 className="text-xl" style={{ color: '#333' }}>
          {t('pages.custom.settings')}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={`${t('pages.custom.pageTitle')} (${t('pages.sections.english')})`}>
            <input
              className={inputClass}
              style={inputStyle}
              value={page.titleEn}
              maxLength={200}
              onChange={(e) => {
                const titleEn = e.target.value;
                update(slugTouched ? { titleEn } : { titleEn, slug: titleEn ? slugify(titleEn) : '' });
              }}
            />
          </Field>
          <Field
            label={`${t('pages.custom.pageTitle')} (${t('pages.sections.arabic')})`}
            hint={t('pages.sections.arabicTextHint')}
          >
            <input
              className={inputClass}
              style={inputStyle}
              dir="rtl"
              value={page.titleAr}
              maxLength={200}
              onChange={(e) => update({ titleAr: e.target.value })}
            />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t('pages.custom.url')} hint={t('pages.custom.urlHint', { url: `${window.location.origin}${urlPreview}` })}>
            <input
              className={inputClass}
              style={inputStyle}
              dir="ltr"
              value={page.slug}
              placeholder="/about-adcc"
              maxLength={200}
              onChange={(e) => {
                setSlugTouched(true);
                const raw = e.target.value.toLowerCase().replace(/\s+/g, '-');
                update({ slug: raw && !raw.startsWith('/') ? `/${raw}` : raw });
              }}
            />
          </Field>
          <Field label={t('pages.custom.status')} hint={t('pages.custom.statusHint')}>
            <select
              className={inputClass}
              style={inputStyle}
              value={page.status}
              onChange={(e) => update({ status: e.target.value as 'draft' | 'published' })}
            >
              <option value="draft">{t('pages.custom.draft')}</option>
              <option value="published">{t('pages.custom.published')}</option>
            </select>
          </Field>
        </div>

        <div className="rounded-xl border" style={{ borderColor: '#E5DDD4' }}>
          <button
            type="button"
            onClick={() => setShowSeo((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm text-left"
            style={{ color: '#333' }}
            aria-expanded={showSeo}
          >
            <span>
              {t('pages.custom.seo')}
              <span className="block text-xs" style={{ color: '#999' }}>
                {t('pages.custom.seoHint')}
              </span>
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showSeo ? 'rotate-180' : ''}`} />
          </button>
          {showSeo && (
            <div className="space-y-4 border-t px-4 py-4" style={{ borderColor: '#F0EAE3' }}>
              <div className="grid gap-4 md:grid-cols-2">
                {(['En', 'Ar'] as const).map((lng) => (
                  <Field
                    key={lng}
                    label={`${t('pages.custom.seoTitle')} (${t(lng === 'En' ? 'pages.sections.english' : 'pages.sections.arabic')})`}
                  >
                    <input
                      className={inputClass}
                      style={inputStyle}
                      dir={lng === 'Ar' ? 'rtl' : undefined}
                      value={page[`seoTitle${lng}`]}
                      maxLength={200}
                      onChange={(e) => update({ [`seoTitle${lng}`]: e.target.value })}
                    />
                  </Field>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {(['En', 'Ar'] as const).map((lng) => (
                  <Field
                    key={lng}
                    label={`${t('pages.custom.seoDescription')} (${t(lng === 'En' ? 'pages.sections.english' : 'pages.sections.arabic')})`}
                  >
                    <textarea
                      rows={3}
                      className={inputClass}
                      style={inputStyle}
                      dir={lng === 'Ar' ? 'rtl' : undefined}
                      value={page[`seoDescription${lng}`]}
                      maxLength={500}
                      onChange={(e) => update({ [`seoDescription${lng}`]: e.target.value })}
                    />
                  </Field>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Blocks */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl" style={{ color: '#333' }}>
            {t('pages.custom.blocksTitle')}
          </h2>
          <p className="text-sm" style={{ color: '#666' }}>
            {t('pages.custom.blocksHint')}
          </p>
        </div>

        {page.blocks.length === 0 && (
          <div className="rounded-2xl border border-dashed bg-white p-8 text-center text-sm" style={{ borderColor: '#E5DDD4', color: '#999' }}>
            {t('pages.custom.noBlocks')}
          </div>
        )}

        {page.blocks.map((block, index) => {
          const def = getBlockDef(block.type);
          if (!def) return null;
          const isOpen = openBlock === block.id;
          const blockFiles = files[block.id] ?? {};
          const setBlockFiles = (updater: (prev: Record<string, File>) => Record<string, File>) =>
            setFiles((prev) => ({ ...prev, [block.id]: updater(prev[block.id] ?? {}) }));
          return (
            <div key={block.id} className="rounded-2xl shadow-sm bg-white">
              <div className="flex items-center gap-2 p-4">
                <button
                  type="button"
                  onClick={() => setOpenBlock(isOpen ? null : block.id)}
                  className="flex flex-1 items-center gap-3 text-left"
                  aria-expanded={isOpen}
                >
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: '#999' }}
                  />
                  <span>
                    <span className="flex flex-wrap items-center gap-2" style={{ color: '#333' }}>
                      {index + 1}. {t(def.label)}
                      {!block.visible && (
                        <span className="rounded-md px-2 py-0.5 text-xs" style={{ backgroundColor: '#FFF3E0', color: '#C12D32' }}>
                          {t('pages.sections.hiddenBadge')}
                        </span>
                      )}
                    </span>
                    <span className="block text-xs" style={{ color: '#999' }}>
                      {t(def.description)}
                    </span>
                  </span>
                </button>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => updateBlock(block.id, { visible: !block.visible })}
                    className="p-1.5 rounded-lg border"
                    style={inputStyle}
                    aria-label={block.visible ? t('pages.custom.hideBlock') : t('pages.custom.showBlock')}
                    title={block.visible ? t('pages.custom.hideBlock') : t('pages.custom.showBlock')}
                  >
                    {block.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBlock(index, index - 1)}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg border disabled:opacity-30"
                    style={inputStyle}
                    aria-label={t('pages.sections.moveUp')}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBlock(index, index + 1)}
                    disabled={index === page.blocks.length - 1}
                    className="p-1.5 rounded-lg border disabled:opacity-30"
                    style={inputStyle}
                    aria-label={t('pages.sections.moveDown')}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    className="p-1.5 rounded-lg border"
                    style={{ ...inputStyle, color: '#C12D32' }}
                    aria-label={t('pages.custom.removeBlock')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="space-y-6 border-t px-6 pb-6 pt-5" style={{ borderColor: '#F0EAE3' }}>
                  {block.type === 'imageText' && (
                    <Field label={t('pages.custom.imagePosition')}>
                      <select
                        className={`${inputClass} max-w-xs`}
                        style={inputStyle}
                        value={String(block.imagePosition ?? 'right')}
                        onChange={(e) => updateBlock(block.id, { imagePosition: e.target.value })}
                      >
                        <option value="right">{t('pages.custom.imageRight')}</option>
                        <option value="left">{t('pages.custom.imageLeft')}</option>
                      </select>
                    </Field>
                  )}
                  {def.fields.map((field) =>
                    field.kind === 'list' ? (
                      <ListEditor
                        key={field.key}
                        field={field}
                        items={(block[field.key] as ListItem[]) ?? []}
                        files={blockFiles}
                        onItemsChange={(items) => updateBlock(block.id, { [field.key]: items })}
                        onFilesChange={setBlockFiles}
                      />
                    ) : (
                      <ScalarFields
                        key={field.key}
                        fields={[field]}
                        values={block}
                        pathPrefix=""
                        files={blockFiles}
                        onChange={(key, value) => updateBlock(block.id, { [key]: value })}
                        onFile={(path, file) =>
                          setBlockFiles((prev) => {
                            const next = { ...prev };
                            if (file) next[path] = file;
                            else delete next[path];
                            return next;
                          })
                        }
                      />
                    ),
                  )}
                  {block.type === 'text' || block.type === 'imageText' ? (
                    <p className="text-xs" style={{ color: '#999' }}>
                      {t('pages.custom.richTextHint')}
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}

        {/* Add a block */}
        <div className="rounded-2xl shadow-sm bg-white p-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium" style={{ color: '#333' }}>
            <Plus className="w-4 h-4" />
            {t('pages.custom.addBlock')}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {CUSTOM_PAGE_BLOCKS.map((def) => (
              <button
                key={def.type}
                type="button"
                onClick={() => addBlock(def.type)}
                disabled={page.blocks.length >= 50}
                className="rounded-xl border p-3 text-left transition-colors hover:border-[#ECC180] disabled:opacity-40"
                style={{ borderColor: '#E5DDD4' }}
              >
                <span className="block text-sm" style={{ color: '#333' }}>
                  {t(def.label)}
                </span>
                <span className="block text-xs" style={{ color: '#999' }}>
                  {t(def.description)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-2xl bg-white/90 p-4 shadow-sm backdrop-blur">
        {pendingUploads > 0 && (
          <span className="text-xs" style={{ color: '#999' }}>
            {t('pages.sections.pendingImages', { count: pendingUploads })}
          </span>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 rounded-lg text-white text-sm disabled:opacity-50"
          style={{ backgroundColor: '#C12D32' }}
        >
          <Save className="w-4 h-4" />
          {saving ? t('pages.banner.saving') : isNew ? t('pages.custom.create') : t('pages.sections.save')}
        </button>
      </div>
    </div>
  );
}
