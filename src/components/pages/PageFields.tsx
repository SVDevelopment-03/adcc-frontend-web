import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Film, Image as ImageIcon, Upload, X } from 'lucide-react';
import { ALLOWED_IMAGE_ACCEPT, IMAGE_UPLOAD_HINT, validateImageFile } from '../../utils/imageValidation';
import { BANNER_VIDEO_ACCEPT, BANNER_VIDEO_HINT, getBannerVideoError } from '../../utils/bannerVideoValidation';

export const inputClass = 'w-full border rounded-lg px-3 py-2 text-sm';
export const inputStyle = { borderColor: '#E5DDD4' };

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
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

export function ImageUploadField({
  label,
  hint,
  size,
  previewClassName = 'aspect-[16/7]',
  fit = 'cover',
  currentUrl,
  file,
  onSelect,
  onClearFile,
  onRemove,
}: {
  label: string;
  hint?: string;
  /** Recommended pixel size shown under the preview, e.g. "1440 × 806 px". */
  size?: string;
  /** Shape of the preview box. */
  previewClassName?: string;
  /** `contain` for logos, icons and cut-outs that must not be cropped. */
  fit?: 'cover' | 'contain';
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
        className={`relative flex w-full items-center justify-center overflow-hidden rounded-xl border ${previewClassName}`}
        style={{ borderColor: '#E5DDD4', backgroundColor: '#F7F3EE' }}
      >
        {shownUrl ? (
          <img src={shownUrl} alt="" className={`h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'}`} />
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
        {IMAGE_UPLOAD_HINT}. {size && t('pages.banner.imageSize', { size })} {hint}
      </p>
    </div>
  );
}

/** Video counterpart of ImageUploadField (homepage banner video mode). */
export function VideoUploadField({
  label,
  hint,
  previewClassName = 'aspect-[16/7]',
  currentUrl,
  posterUrl,
  file,
  onSelect,
  onClearFile,
  onRemove,
}: {
  label: string;
  hint?: string;
  previewClassName?: string;
  currentUrl: string;
  /** Shown in the preview before the video plays. */
  posterUrl?: string;
  file: File | null;
  onSelect: (file: File) => void;
  onClearFile: () => void;
  onRemove?: () => void;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [checking, setChecking] = useState(false);
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
        className={`relative flex w-full items-center justify-center overflow-hidden rounded-xl border ${previewClassName}`}
        style={{ borderColor: '#E5DDD4', backgroundColor: '#F7F3EE' }}
      >
        {shownUrl ? (
          <video
            key={shownUrl}
            src={shownUrl}
            poster={posterUrl || undefined}
            className="h-full w-full object-cover"
            muted
            loop
            autoPlay
            playsInline
            controls
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-sm" style={{ color: '#999' }}>
            <Film className="w-8 h-8" />
            {checking ? t('pages.banner.checkingVideo') : t('pages.banner.noVideo')}
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
        accept={BANNER_VIDEO_ACCEPT}
        className="hidden"
        onChange={async (e) => {
          const selected = e.target.files?.[0];
          e.target.value = '';
          if (!selected) return;
          setChecking(true);
          try {
            const error = await getBannerVideoError(selected);
            if (error) toast.error(error);
            else onSelect(selected);
          } finally {
            setChecking(false);
          }
        }}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={checking}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm disabled:opacity-50"
          style={inputStyle}
        >
          <Upload className="w-4 h-4" />
          {checking
            ? t('pages.banner.checkingVideo')
            : shownUrl
              ? t('pages.banner.replaceVideo')
              : t('pages.banner.uploadVideo')}
        </button>
        {file && (
          <button
            type="button"
            onClick={onClearFile}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
            style={inputStyle}
          >
            <X className="w-4 h-4" />
            {t('pages.banner.discardNewVideo')}
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
            {t('pages.banner.removeVideo')}
          </button>
        )}
      </div>
      <p className="text-xs" style={{ color: '#999' }}>
        {BANNER_VIDEO_HINT} {hint}
      </p>
    </div>
  );
}
