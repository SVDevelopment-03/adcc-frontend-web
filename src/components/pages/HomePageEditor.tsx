import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, Image as ImageIcon, RotateCcw, Save, Upload, X } from 'lucide-react';
import {
  DEFAULT_HOME_BANNER,
  getHomeBanner,
  getPagesErrorMessage,
  saveHomeBanner,
  type HomeBannerContent,
} from '../../services/pagesApi';
import { invalidateCache } from '../../utils/apiCache';
import { ALLOWED_IMAGE_ACCEPT, IMAGE_UPLOAD_HINT, validateImageFile } from '../../utils/imageValidation';
import { HOME_BANNER_CACHE_KEY } from '../home/useHomeBanner';

type ImageField = 'imageEn' | 'imageAr';

const inputClass = 'w-full border rounded-lg px-3 py-2 text-sm';
const inputStyle = { borderColor: '#E5DDD4' };

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm" style={{ color: '#333' }}>
        {label}
      </span>
      {children}
      {hint && (
        <span className="block text-xs" style={{ color: '#999' }}>
          {hint}
        </span>
      )}
    </label>
  );
}

function ImageUploadField({
  label,
  hint,
  currentUrl,
  file,
  onSelect,
  onClearFile,
  onRemove,
}: {
  label: string;
  hint: string;
  currentUrl: string;
  file: File | null;
  onSelect: (file: File) => void;
  onClearFile: () => void;
  onRemove?: () => void;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const shownUrl = previewUrl || currentUrl;

  return (
    <div className="space-y-2">
      <span className="text-sm" style={{ color: '#333' }}>
        {label}
      </span>
      <div
        className="relative flex aspect-[16/7] w-full items-center justify-center overflow-hidden rounded-xl border"
        style={{ borderColor: '#E5DDD4', backgroundColor: '#F7F3EE' }}
      >
        {shownUrl ? (
          <img src={shownUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-sm" style={{ color: '#999' }}>
            <ImageIcon className="w-8 h-8" />
            {t('pages.banner.noImage')}
          </div>
        )}
        {file && (
          <span
            className="absolute left-2 top-2 rounded-md px-2 py-1 text-xs text-white"
            style={{ backgroundColor: '#C12D32' }}
          >
            {t('pages.banner.newImagePending')}
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (validateImageFile(selected)) onSelect(selected);
          e.target.value = '';
        }}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
          style={inputStyle}
        >
          <Upload className="w-4 h-4" />
          {shownUrl ? t('pages.banner.replaceImage') : t('pages.banner.uploadImage')}
        </button>
        {file && (
          <button
            type="button"
            onClick={onClearFile}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
            style={inputStyle}
          >
            <X className="w-4 h-4" />
            {t('pages.banner.discardNewImage')}
          </button>
        )}
        {!file && currentUrl && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
            style={inputStyle}
          >
            <X className="w-4 h-4" />
            {t('pages.banner.removeImage')}
          </button>
        )}
      </div>
      <p className="text-xs" style={{ color: '#999' }}>
        {IMAGE_UPLOAD_HINT}. {hint}
      </p>
    </div>
  );
}

export function HomePageEditor() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState<HomeBannerContent>(DEFAULT_HOME_BANNER);
  const [files, setFiles] = useState<Record<ImageField, File | null>>({ imageEn: null, imageAr: null });
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getHomeBanner()
      .then(({ content, saved }) => {
        if (cancelled) return;
        setForm(content);
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

  const setFile = (key: ImageField, file: File | null) => setFiles((prev) => ({ ...prev, [key]: file }));

  const validate = (): string | null => {
    if (!form.imageEn && !files.imageEn) return t('pages.banner.imageRequired');
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setIsSaving(true);
    try {
      const saved = await saveHomeBanner(form, files);
      setForm(saved);
      setFiles({ imageEn: null, imageAr: null });
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
    setFiles({ imageEn: null, imageAr: null });
    toast.info(t('pages.banner.defaultsRestored'));
  };

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

            <div className="grid gap-6 lg:grid-cols-2">
              <ImageUploadField
                label={t('pages.banner.imageEn')}
                hint={t('pages.banner.imageEnHint')}
                currentUrl={form.imageEn}
                file={files.imageEn}
                onSelect={(file) => setFile('imageEn', file)}
                onClearFile={() => setFile('imageEn', null)}
              />
              <ImageUploadField
                label={t('pages.banner.imageAr')}
                hint={t('pages.banner.imageArHint')}
                currentUrl={form.imageAr}
                file={files.imageAr}
                onSelect={(file) => setFile('imageAr', file)}
                onClearFile={() => setFile('imageAr', null)}
                onRemove={() => update('imageAr', '')}
              />
            </div>

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
                {isSaving ? t('pages.banner.saving') : t('pages.banner.save')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
