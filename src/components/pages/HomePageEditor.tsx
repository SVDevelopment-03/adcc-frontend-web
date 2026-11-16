import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  Film,
  GalleryHorizontal,
  Image as ImageIcon,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import {
  DEFAULT_HOME_BANNER,
  HOME_BANNER_MAX_SLIDES,
  HOME_BANNER_MIN_SLIDES,
  getHomeBanner,
  getPagesErrorMessage,
  saveHomeBanner,
  type HomeBannerContent,
  type HomeBannerFiles,
  type HomeBannerMode,
} from '../../services/pagesApi';
import { invalidateCache } from '../../utils/apiCache';
import { HOME_BANNER_CACHE_KEY } from '../home/useHomeBanner';
import { Field, ImageUploadField, VideoUploadField, inputClass, inputStyle } from './PageFields';
import { HomeSectionEditor } from './HomeSectionEditor';
import { HOME_SECTIONS, getHomeSections, normalizeHomeSection } from '../../services/homeSections';

// Size the homepage hero is designed for.
const BANNER_IMAGE_SIZE = '1440 × 806 px';
const INTERVAL_OPTIONS = [3, 4, 5, 6, 8, 10, 12, 15];

/** Files picked but not saved yet. Slide files live in an array parallel to `form.slides`. */
interface PendingFiles {
  imageEn: File | null;
  imageAr: File | null;
  videoUrl: File | null;
  videoPoster: File | null;
  slides: { imageEn: File | null; imageAr: File | null }[];
}

const NO_FILES: PendingFiles = { imageEn: null, imageAr: null, videoUrl: null, videoPoster: null, slides: [] };
const EMPTY_SLIDE = { imageEn: '', imageAr: '' };
const NO_SLIDE_FILES = { imageEn: null, imageAr: null };

const MODES: { mode: HomeBannerMode; icon: LucideIcon }[] = [
  { mode: 'static', icon: ImageIcon },
  { mode: 'carousel', icon: GalleryHorizontal },
  { mode: 'video', icon: Film },
];

/** Keeps the slide-file array the same length as the slides. */
const alignSlideFiles = (files: PendingFiles['slides'], count: number) =>
  Array.from({ length: count }, (_, i) => files[i] ?? NO_SLIDE_FILES);

export function HomePageEditor() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState<HomeBannerContent>(DEFAULT_HOME_BANNER);
  const [files, setFiles] = useState<PendingFiles>(NO_FILES);
  const [savedMode, setSavedMode] = useState<HomeBannerMode>('static');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [sections, setSections] = useState<Partial<Record<string, unknown>> | null>(null);
  const [sectionsError, setSectionsError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getHomeSections()
      .then((loaded) => {
        if (!cancelled) setSections(loaded);
      })
      .catch((error) => {
        if (!cancelled) setSectionsError(getPagesErrorMessage(error, t('pages.sections.loadError')));
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    getHomeBanner()
      .then(({ content, saved }) => {
        if (cancelled) return;
        setForm(content);
        setSavedMode(content.mode);
        setFiles({ ...NO_FILES, slides: alignSlideFiles([], content.slides.length) });
        setIsSaved(saved);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(getPagesErrorMessage(error, t('pages.banner.loadError')));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  const update = <K extends keyof HomeBannerContent>(key: K, value: HomeBannerContent[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setFile = (key: 'imageEn' | 'imageAr' | 'videoUrl' | 'videoPoster', file: File | null) =>
    setFiles((prev) => ({ ...prev, [key]: file }));

  /* ── Mode ─────────────────────────────────────────────────────────────── */

  const selectMode = (mode: HomeBannerMode) => {
    // First time in carousel mode: start with two slides, the first one
    // pre-filled with the current static image so it isn't a blank slate.
    if (mode === 'carousel' && form.slides.length === 0) {
      const slides = [{ imageEn: form.imageEn, imageAr: form.imageAr }, { ...EMPTY_SLIDE }];
      setForm({ ...form, mode, slides });
      setFiles((prev) => ({ ...prev, slides: alignSlideFiles([], slides.length) }));
      return;
    }
    update('mode', mode);
  };

  /* ── Carousel slides ─────────────────────────────────────────────────── */

  const addSlide = () => {
    if (form.slides.length >= HOME_BANNER_MAX_SLIDES) return;
    setForm((prev) => ({ ...prev, slides: [...prev.slides, { ...EMPTY_SLIDE }] }));
    setFiles((prev) => ({ ...prev, slides: [...prev.slides, NO_SLIDE_FILES] }));
  };

  const removeSlide = (index: number) => {
    setForm((prev) => ({ ...prev, slides: prev.slides.filter((_, i) => i !== index) }));
    setFiles((prev) => ({ ...prev, slides: prev.slides.filter((_, i) => i !== index) }));
  };

  const moveSlide = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= form.slides.length) return;
    const swap = <T,>(list: T[]) => {
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    };
    setForm((prev) => ({ ...prev, slides: swap(prev.slides) }));
    setFiles((prev) => ({ ...prev, slides: swap(alignSlideFiles(prev.slides, form.slides.length)) }));
  };

  const updateSlide = (index: number, key: 'imageEn' | 'imageAr', value: string) =>
    setForm((prev) => ({
      ...prev,
      slides: prev.slides.map((s, i) => (i === index ? { ...s, [key]: value } : s)),
    }));

  const setSlideFile = (index: number, key: 'imageEn' | 'imageAr', file: File | null) =>
    setFiles((prev) => ({
      ...prev,
      slides: alignSlideFiles(prev.slides, form.slides.length).map((s, i) =>
        i === index ? { ...s, [key]: file } : s,
      ),
    }));

  /* ── Save ─────────────────────────────────────────────────────────────── */

  const validate = (): string | null => {
    if (form.mode === 'static' && !form.imageEn && !files.imageEn) return t('pages.banner.imageRequired');
    if (form.mode === 'carousel') {
      if (form.slides.length < HOME_BANNER_MIN_SLIDES) {
        return t('pages.banner.slidesMin', { min: HOME_BANNER_MIN_SLIDES });
      }
      const missing = form.slides.findIndex((s, i) => !s.imageEn && !files.slides[i]?.imageEn);
      if (missing !== -1) return t('pages.banner.slideImageRequired', { n: missing + 1 });
    }
    if (form.mode === 'video' && !form.videoUrl && !files.videoUrl) return t('pages.banner.videoRequired');
    return null;
  };

  /** Flattens pending files into the content-path keys the backend expects. */
  const buildUploadFiles = (): HomeBannerFiles => {
    const out: HomeBannerFiles = {
      imageEn: files.imageEn,
      imageAr: files.imageAr,
      videoUrl: files.videoUrl,
      videoPoster: files.videoPoster,
    };
    files.slides.slice(0, form.slides.length).forEach((slide, i) => {
      out[`slides.${i}.imageEn`] = slide.imageEn;
      out[`slides.${i}.imageAr`] = slide.imageAr;
    });
    return out;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setIsSaving(true);
    try {
      const saved = await saveHomeBanner(form, buildUploadFiles());
      setForm(saved);
      setSavedMode(saved.mode);
      setFiles({ ...NO_FILES, slides: alignSlideFiles([], saved.slides.length) });
      setIsSaved(true);
      invalidateCache(HOME_BANNER_CACHE_KEY);
      toast.success(t('pages.banner.saveSuccess'));
    } catch (err) {
      toast.error(getPagesErrorMessage(err, t('pages.banner.saveError')));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreDefaults = () => {
    setForm(DEFAULT_HOME_BANNER);
    setFiles(NO_FILES);
    toast.info(t('pages.banner.defaultsRestored'));
  };

  const hasVideoFile = Boolean(files.videoUrl);

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
          {t('pages.home.title')}
        </h1>
        <p style={{ color: '#666' }}>{t('pages.home.editorSubtitle')}</p>
      </div>

      <div className="p-6 rounded-2xl shadow-sm bg-white space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl" style={{ color: '#333' }}>
              {t('pages.banner.title')}
            </h2>
            <p className="text-sm" style={{ color: '#666' }}>
              {isSaved ? t('pages.banner.subtitle') : t('pages.banner.notSavedYet')}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRestoreDefaults}
            disabled={isLoading || isSaving}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm disabled:opacity-50"
            style={inputStyle}
          >
            <RotateCcw className="w-4 h-4" />
            {t('pages.banner.restoreDefaults')}
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#C12D32' }} />
          </div>
        ) : loadError ? (
          <div className="py-8 text-sm" style={{ color: '#C12D32' }}>
            {loadError}
          </div>
        ) : (
          <>
            {/* ── Banner type ─────────────────────────────────────────── */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium" style={{ color: '#333' }}>
                {t('pages.banner.modeTitle')}
              </legend>
              <p className="text-xs" style={{ color: '#666' }}>
                {t('pages.banner.modeHint')}
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                {MODES.map(({ mode, icon: Icon }) => {
                  const selected = form.mode === mode;
                  return (
                    <label
                      key={mode}
                      className="relative flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors"
                      style={{
                        borderColor: selected ? '#C12D32' : '#E5DDD4',
                        backgroundColor: selected ? '#FFF6F6' : undefined,
                      }}
                    >
                      <input
                        type="radio"
                        name="home-banner-mode"
                        className="sr-only"
                        checked={selected}
                        onChange={() => selectMode(mode)}
                      />
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: selected ? '#C12D32' : '#F7F3EE', color: selected ? '#fff' : '#666' }}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium" style={{ color: '#333' }}>
                          {t(`pages.banner.mode_${mode}`)}
                        </span>
                        <span className="block text-xs" style={{ color: '#666' }}>
                          {t(`pages.banner.mode_${mode}Hint`)}
                        </span>
                        {isSaved && savedMode === mode && (
                          <span className="mt-1 inline-block text-xs font-medium" style={{ color: '#10B981' }}>
                            {t('pages.banner.liveOnSite')}
                          </span>
                        )}
                      </span>
                      {selected && (
                        <CheckCircle2 className="absolute right-3 top-3 h-5 w-5" style={{ color: '#C12D32' }} />
                      )}
                    </label>
                  );
                })}
              </div>
              {isSaved && form.mode !== savedMode && (
                <p className="text-xs" style={{ color: '#B45309' }}>
                  {t('pages.banner.modeChangedUnsaved')}
                </p>
              )}
            </fieldset>

            {/* ── Media for the selected type ─────────────────────────── */}
            {form.mode === 'static' && (
              <div className="grid gap-6 lg:grid-cols-2">
                <ImageUploadField
                  label={t('pages.banner.imageEn')}
                  hint={t('pages.banner.imageEnHint')}
                  size={BANNER_IMAGE_SIZE}
                  currentUrl={form.imageEn}
                  file={files.imageEn}
                  onSelect={(file) => setFile('imageEn', file)}
                  onClearFile={() => setFile('imageEn', null)}
                />
                <ImageUploadField
                  label={t('pages.banner.imageAr')}
                  hint={t('pages.banner.imageArHint')}
                  size={BANNER_IMAGE_SIZE}
                  currentUrl={form.imageAr}
                  file={files.imageAr}
                  onSelect={(file) => setFile('imageAr', file)}
                  onClearFile={() => setFile('imageAr', null)}
                  onRemove={() => update('imageAr', '')}
                />
              </div>
            )}

            {form.mode === 'carousel' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-medium" style={{ color: '#333' }}>
                      {t('pages.banner.slidesTitle', { count: form.slides.length, max: HOME_BANNER_MAX_SLIDES })}
                    </h3>
                    <p className="text-xs" style={{ color: '#666' }}>
                      {t('pages.banner.slidesHint', { min: HOME_BANNER_MIN_SLIDES, max: HOME_BANNER_MAX_SLIDES })}
                    </p>
                  </div>
                  <Field label={t('pages.banner.interval')}>
                    <select
                      className={inputClass}
                      style={inputStyle}
                      value={form.intervalSeconds}
                      onChange={(e) => update('intervalSeconds', Number(e.target.value))}
                    >
                      {INTERVAL_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {t('pages.banner.intervalValue', { s })}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {form.slides.map((slide, index) => {
                  const slideFiles = files.slides[index] ?? NO_SLIDE_FILES;
                  return (
                    <div key={index} className="rounded-xl border p-4 space-y-3" style={{ borderColor: '#E5DDD4' }}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium" style={{ color: '#333' }}>
                          {t('pages.banner.slideLabel', { n: index + 1 })}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => moveSlide(index, -1)}
                            disabled={index === 0}
                            aria-label={t('pages.banner.moveUp')}
                            className="p-2 rounded-lg border disabled:opacity-40"
                            style={inputStyle}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSlide(index, 1)}
                            disabled={index === form.slides.length - 1}
                            aria-label={t('pages.banner.moveDown')}
                            className="p-2 rounded-lg border disabled:opacity-40"
                            style={inputStyle}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSlide(index)}
                            aria-label={t('pages.banner.removeSlide')}
                            className="p-2 rounded-lg border"
                            style={{ ...inputStyle, color: '#C12D32' }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid gap-4 lg:grid-cols-2">
                        <ImageUploadField
                          label={t('pages.banner.slideImageEn')}
                          hint={t('pages.banner.imageEnHint')}
                          size={BANNER_IMAGE_SIZE}
                          currentUrl={slide.imageEn}
                          file={slideFiles.imageEn}
                          onSelect={(file) => setSlideFile(index, 'imageEn', file)}
                          onClearFile={() => setSlideFile(index, 'imageEn', null)}
                        />
                        <ImageUploadField
                          label={t('pages.banner.slideImageAr')}
                          hint={t('pages.banner.imageArHint')}
                          size={BANNER_IMAGE_SIZE}
                          currentUrl={slide.imageAr}
                          file={slideFiles.imageAr}
                          onSelect={(file) => setSlideFile(index, 'imageAr', file)}
                          onClearFile={() => setSlideFile(index, 'imageAr', null)}
                          onRemove={() => updateSlide(index, 'imageAr', '')}
                        />
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={addSlide}
                  disabled={form.slides.length >= HOME_BANNER_MAX_SLIDES}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3 text-sm disabled:opacity-50"
                  style={{ borderColor: '#E5DDD4', color: '#666' }}
                >
                  <Plus className="w-4 h-4" />
                  {form.slides.length >= HOME_BANNER_MAX_SLIDES
                    ? t('pages.banner.slidesMaxReached', { max: HOME_BANNER_MAX_SLIDES })
                    : t('pages.banner.addSlide')}
                </button>
              </div>
            )}

            {form.mode === 'video' && (
              <div className="grid gap-6 lg:grid-cols-2">
                <VideoUploadField
                  label={t('pages.banner.video')}
                  hint={t('pages.banner.videoHint')}
                  currentUrl={form.videoUrl}
                  posterUrl={form.videoPoster || form.imageEn}
                  file={files.videoUrl}
                  onSelect={(file) => setFile('videoUrl', file)}
                  onClearFile={() => setFile('videoUrl', null)}
                />
                <ImageUploadField
                  label={t('pages.banner.videoPoster')}
                  hint={t('pages.banner.videoPosterHint')}
                  size={BANNER_IMAGE_SIZE}
                  currentUrl={form.videoPoster}
                  file={files.videoPoster}
                  onSelect={(file) => setFile('videoPoster', file)}
                  onClearFile={() => setFile('videoPoster', null)}
                  onRemove={() => update('videoPoster', '')}
                />
              </div>
            )}

            {/* ── Text overlay (all types) ────────────────────────────── */}
            <label
              className="flex items-start gap-3 rounded-xl border p-4"
              style={{ borderColor: form.hideText ? '#ECC180' : '#E5DDD4', backgroundColor: form.hideText ? '#FFF9EF' : undefined }}
            >
              <input
                type="checkbox"
                className="mt-1"
                checked={form.hideText}
                onChange={(e) => update('hideText', e.target.checked)}
              />
              <span>
                <span className="block text-sm font-medium" style={{ color: '#333' }}>
                  {t('pages.banner.hideText')}
                </span>
                <span className="block text-xs" style={{ color: '#666' }}>
                  {t('pages.banner.hideTextHint')}
                </span>
              </span>
            </label>

            <div className={`space-y-3 ${form.hideText ? 'opacity-60' : ''}`}>
              <h3 className="text-sm font-medium" style={{ color: '#333' }}>
                {t('pages.banner.titleText')}
                {form.hideText && (
                  <span className="ms-2 text-xs font-normal" style={{ color: '#C12D32' }}>
                    {t('pages.banner.hiddenOnSite')}
                  </span>
                )}
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label={t('pages.banner.line1En')}>
                  <input
                    className={inputClass}
                    style={inputStyle}
                    value={form.titleLine1En}
                    maxLength={200}
                    onChange={(e) => update('titleLine1En', e.target.value)}
                  />
                </Field>
                <Field label={t('pages.banner.line1Ar')}>
                  <input
                    className={inputClass}
                    style={inputStyle}
                    dir="rtl"
                    value={form.titleLine1Ar}
                    maxLength={200}
                    onChange={(e) => update('titleLine1Ar', e.target.value)}
                  />
                </Field>
                <Field label={t('pages.banner.line2En')}>
                  <input
                    className={inputClass}
                    style={inputStyle}
                    value={form.titleLine2En}
                    maxLength={200}
                    onChange={(e) => update('titleLine2En', e.target.value)}
                  />
                </Field>
                <Field label={t('pages.banner.line2Ar')}>
                  <input
                    className={inputClass}
                    style={inputStyle}
                    dir="rtl"
                    value={form.titleLine2Ar}
                    maxLength={200}
                    onChange={(e) => update('titleLine2Ar', e.target.value)}
                  />
                </Field>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 rounded-lg text-white text-sm disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: '#C12D32' }}
              >
                <Save className="w-4 h-4" />
                {isSaving
                  ? hasVideoFile
                    ? t('pages.banner.uploadingVideo')
                    : t('pages.banner.saving')
                  : t('pages.banner.save')}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        {sectionsError ? (
          <div className="p-6 rounded-2xl shadow-sm bg-white text-sm" style={{ color: '#C12D32' }}>
            {sectionsError}
          </div>
        ) : !sections ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#C12D32' }} />
          </div>
        ) : (
          HOME_SECTIONS.map((def) => (
            <HomeSectionEditor
              key={def.key}
              def={def}
              initial={normalizeHomeSection(def.key, sections[def.key])}
              initiallySaved={Boolean(sections[def.key])}
            />
          ))
        )}
      </div>
    </div>
  );
}
