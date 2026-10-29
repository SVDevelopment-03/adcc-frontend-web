import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, GripVertical, Handshake, Trash2, Upload } from 'lucide-react';
import {
  createPartners,
  deletePartner,
  getPartners,
  getPartnersErrorMessage,
  reorderPartners,
  updatePartner,
  type Partner,
} from '../../services/partnersApi';
import {
  ALLOWED_IMAGE_ACCEPT,
  IMAGE_UPLOAD_HINT,
  filterValidImageFiles,
} from '../../utils/imageValidation';

const moveItem = <T,>(list: T[], from: number, to: number): T[] => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

export function PartnersManager() {
  const { t } = useTranslation();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});
  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({});
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadPartners = useCallback(async () => {
    try {
      setErrorMessage('');
      setPartners(await getPartners());
    } catch (error) {
      setErrorMessage(getPartnersErrorMessage(error, t('partners.loadError')));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  const setBusy = (id: string, busy: boolean) =>
    setBusyIds((prev) => ({ ...prev, [id]: busy }));

  const clearPendingFiles = () => {
    setPendingFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!pendingFiles.length) return;
    setIsUploading(true);
    try {
      await createPartners(pendingFiles);
      toast.success(t('partners.uploadSuccess', { count: pendingFiles.length }));
      clearPendingFiles();
      await loadPartners();
    } catch (error) {
      toast.error(getPartnersErrorMessage(error, t('partners.uploadError')));
    } finally {
      setIsUploading(false);
    }
  };

  // Optimistically shows the new order, then saves it; reverts on failure.
  const applyOrder = async (next: Partner[]) => {
    const previous = partners;
    setPartners(next);
    setIsReordering(true);
    try {
      setPartners(await reorderPartners(next.map((partner) => partner.id)));
      toast.success(t('partners.reorderSuccess'));
    } catch (error) {
      setPartners(previous);
      toast.error(getPartnersErrorMessage(error, t('partners.reorderError')));
    } finally {
      setIsReordering(false);
    }
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= partners.length) return;
    applyOrder(moveItem(partners, index, target));
  };

  const handleDrop = (index: number) => {
    if (dragIndex !== null && dragIndex !== index) {
      applyOrder(moveItem(partners, dragIndex, index));
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleSaveName = async (partner: Partner) => {
    const name = (nameDrafts[partner.id] ?? partner.name).trim();
    if (!name || name === partner.name) return;
    setBusy(partner.id, true);
    try {
      await updatePartner(partner.id, { name });
      setPartners((prev) => prev.map((p) => (p.id === partner.id ? { ...p, name } : p)));
      setNameDrafts((prev) => {
        const { [partner.id]: _removed, ...rest } = prev;
        return rest;
      });
      toast.success(t('partners.updateSuccess'));
    } catch (error) {
      toast.error(getPartnersErrorMessage(error, t('partners.updateError')));
    } finally {
      setBusy(partner.id, false);
    }
  };

  const handleToggleActive = async (partner: Partner) => {
    setBusy(partner.id, true);
    try {
      await updatePartner(partner.id, { active: !partner.active });
      setPartners((prev) =>
        prev.map((p) => (p.id === partner.id ? { ...p, active: !partner.active } : p)),
      );
    } catch (error) {
      toast.error(getPartnersErrorMessage(error, t('partners.updateError')));
    } finally {
      setBusy(partner.id, false);
    }
  };

  const handleReplaceLogo = async (partner: Partner, file: File | undefined) => {
    if (!file) return;
    setBusy(partner.id, true);
    try {
      await updatePartner(partner.id, { logoFile: file });
      toast.success(t('partners.updateSuccess'));
      await loadPartners();
    } catch (error) {
      toast.error(getPartnersErrorMessage(error, t('partners.updateError')));
    } finally {
      setBusy(partner.id, false);
    }
  };

  const handleDelete = async (partner: Partner) => {
    if (!window.confirm(t('partners.deleteConfirm', { name: partner.name }))) return;
    setBusy(partner.id, true);
    try {
      await deletePartner(partner.id);
      setPartners((prev) => prev.filter((p) => p.id !== partner.id));
      toast.success(t('partners.deleteSuccess'));
    } catch (error) {
      toast.error(getPartnersErrorMessage(error, t('partners.deleteError')));
      setBusy(partner.id, false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>
          {t('sidebar.partners')}
        </h1>
        <p style={{ color: '#666' }}>{t('partners.subtitle')}</p>
      </div>

      {/* Upload */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: '#E5DDD4' }}>
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5" style={{ color: '#C12D32' }} />
            <h3 className="text-sm font-medium" style={{ color: '#333' }}>
              {t('partners.addLogos')}
            </h3>
          </div>

          <div className="space-y-2">
            <input
              type="file"
              multiple
              accept={ALLOWED_IMAGE_ACCEPT}
              ref={fileInputRef}
              onChange={(e) => setPendingFiles(filterValidImageFiles(e.target.files))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              style={{ borderColor: '#E5DDD4' }}
            />
            <p className="text-xs" style={{ color: '#999' }}>
              {IMAGE_UPLOAD_HINT}. {t('partners.multipleHint')}
            </p>
          </div>

          {pendingFiles.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {pendingFiles.map((file) => (
                <PendingPreview key={`${file.name}-${file.lastModified}`} file={file} />
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!pendingFiles.length || isUploading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: '#C12D32' }}
            >
              <Upload className="w-4 h-4" />
              {isUploading
                ? t('partners.uploading')
                : t('partners.uploadButton', { count: pendingFiles.length })}
            </button>
            <button
              type="button"
              onClick={clearPendingFiles}
              disabled={!pendingFiles.length || isUploading}
              className="flex-1 px-4 py-2 rounded-lg text-sm border disabled:opacity-50"
              style={{ borderColor: '#E5DDD4', color: '#333' }}
            >
              {t('partners.clearSelection')}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="flex items-center justify-between gap-4 mb-1">
          <h2 className="text-xl" style={{ color: '#333' }}>
            {t('partners.listTitle', { count: partners.length })}
          </h2>
          {isReordering && (
            <span className="text-xs" style={{ color: '#999' }}>
              {t('partners.savingOrder')}
            </span>
          )}
        </div>
        <p className="text-sm mb-6" style={{ color: '#666' }}>
          {t('partners.reorderHint')}
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div
              className="animate-spin rounded-full h-10 w-10 border-b-2"
              style={{ borderColor: '#C12D32' }}
            />
          </div>
        ) : errorMessage ? (
          <div className="py-8 text-sm" style={{ color: '#C12D32' }}>
            {errorMessage}
          </div>
        ) : partners.length === 0 ? (
          <div
            className="rounded-xl border p-10 text-center flex flex-col items-center gap-2"
            style={{ borderColor: '#E5DDD4', color: '#999' }}
          >
            <Handshake className="w-10 h-10" style={{ color: '#CCC' }} />
            {t('partners.empty')}
          </div>
        ) : (
          <ul className="space-y-3">
            {partners.map((partner, index) => {
              const busy = busyIds[partner.id] ?? false;
              const nameDraft = nameDrafts[partner.id] ?? partner.name;
              const isDragOver = dragOverIndex === index && dragIndex !== index;

              return (
                <li
                  key={partner.id}
                  draggable={!isReordering}
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverIndex(index);
                  }}
                  onDragLeave={() => setDragOverIndex((current) => (current === index ? null : current))}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setDragOverIndex(null);
                  }}
                  className="flex flex-wrap items-center gap-4 rounded-xl border p-3 transition-colors"
                  style={{
                    borderColor: isDragOver ? '#C12D32' : '#E5DDD4',
                    backgroundColor: isDragOver ? '#FFF5F5' : '#fff',
                    opacity: dragIndex === index ? 0.5 : partner.active ? 1 : 0.6,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-5 h-5 cursor-grab" style={{ color: '#999' }} />
                    <span className="w-6 text-center text-sm" style={{ color: '#666' }}>
                      {index + 1}
                    </span>
                  </div>

                  <label
                    className="relative flex h-16 w-32 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg"
                    style={{ backgroundColor: '#F3EEE7' }}
                    title={t('partners.replaceLogo')}
                  >
                    <img src={partner.logo} alt={partner.name} className="max-h-14 max-w-28 object-contain" />
                    <input
                      type="file"
                      accept={ALLOWED_IMAGE_ACCEPT}
                      className="hidden"
                      disabled={busy}
                      onChange={(e) => {
                        handleReplaceLogo(partner, filterValidImageFiles(e.target.files)[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>

                  <div className="flex min-w-[180px] flex-1 items-center gap-2">
                    <input
                      value={nameDraft}
                      onChange={(e) =>
                        setNameDrafts((prev) => ({ ...prev, [partner.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName(partner);
                      }}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      style={{ borderColor: '#E5DDD4' }}
                      aria-label={t('partners.nameLabel')}
                    />
                    {nameDraft.trim() && nameDraft.trim() !== partner.name && (
                      <button
                        type="button"
                        onClick={() => handleSaveName(partner)}
                        disabled={busy}
                        className="px-3 py-2 rounded-lg text-white text-sm disabled:opacity-50"
                        style={{ backgroundColor: '#C12D32' }}
                      >
                        {t('partners.save')}
                      </button>
                    )}
                  </div>

                  <label className="flex items-center gap-2 text-sm" style={{ color: '#666' }}>
                    <input
                      type="checkbox"
                      checked={partner.active}
                      disabled={busy}
                      onChange={() => handleToggleActive(partner)}
                    />
                    {t('partners.visible')}
                  </label>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0 || isReordering}
                      className="p-2 rounded-lg border disabled:opacity-30"
                      style={{ borderColor: '#E5DDD4' }}
                      aria-label={t('partners.moveUp')}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, 1)}
                      disabled={index === partners.length - 1 || isReordering}
                      className="p-2 rounded-lg border disabled:opacity-30"
                      style={{ borderColor: '#E5DDD4' }}
                      aria-label={t('partners.moveDown')}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(partner)}
                      disabled={busy}
                      className="p-2 rounded-lg border border-red-200 text-red-600 disabled:opacity-50"
                      style={{ backgroundColor: '#FFF5F5' }}
                      aria-label={t('partners.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function PendingPreview({ file }: { file: File }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div
      className="flex h-16 w-32 items-center justify-center overflow-hidden rounded-lg border"
      style={{ borderColor: '#E5DDD4', backgroundColor: '#F3EEE7' }}
      title={file.name}
    >
      {url && <img src={url} alt={file.name} className="max-h-14 max-w-28 object-contain" />}
    </div>
  );
}
