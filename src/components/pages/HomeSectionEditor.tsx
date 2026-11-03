import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, ChevronDown, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import {
  emptyListItem,
  fieldKeys,
  saveHomeSection,
  type HomeSectionDef,
  type ListField,
  type ListItem,
  type ScalarField,
  type SectionValues,
} from '../../services/homeSections';
import { getPagesErrorMessage } from '../../services/pagesApi';
import { invalidateCache } from '../../utils/apiCache';
import { HOME_SECTIONS_CACHE_KEY } from '../home/useHomeSection';
import { Field, ImageUploadField, inputClass, inputStyle } from './PageFields';

const isSafeLink = (value: string) => value === '' || value.startsWith('/') || /^https?:\/\//i.test(value);

/**
 * Pending uploads are keyed by content path (`phoneImage`, `cards.2.image`).
 * When list items move or are removed, their pending files move with them.
 */
const remapListFiles = (
  files: Record<string, File>,
  listKey: string,
  mapIndex: (index: number) => number | null,
) => {
  const out: Record<string, File> = {};
  for (const [path, file] of Object.entries(files)) {
    const match = path.match(/^([^.]+)\.(\d+)\.(.+)$/);
    if (!match || match[1] !== listKey) {
      out[path] = file;
      continue;
    }
    const next = mapIndex(Number(match[2]));
    if (next !== null) out[`${listKey}.${next}.${match[3]}`] = file;
  }
  return out;
};

interface ScalarFieldsProps {
  fields: ScalarField[];
  values: Record<string, unknown>;
  /** Content path prefix for uploads, e.g. `cards.2.` for a list item. */
  pathPrefix: string;
  files: Record<string, File>;
  onChange: (key: string, value: string) => void;
  onFile: (path: string, file: File | null) => void;
}

function ScalarFields({ fields, values, pathPrefix, files, onChange, onFile }: ScalarFieldsProps) {
  const { t } = useTranslation();
  const str = (key: string) => (typeof values[key] === 'string' ? (values[key] as string) : '');

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        if (field.kind === 'link') {
          const value = str(field.key);
          return (
            <Field
              key={field.key}
              label={t(field.label)}
              hint={isSafeLink(value) ? t('pages.sections.linkHint') : t('pages.sections.linkInvalid')}
            >
              <input
                className={inputClass}
                style={{ ...inputStyle, ...(isSafeLink(value) ? {} : { borderColor: '#C12D32' }) }}
                dir="ltr"
                value={value}
                maxLength={1000}
                placeholder="/events"
                onChange={(e) => onChange(field.key, e.target.value)}
              />
            </Field>
          );
        }

        if (field.kind === 'image') {
          const keys = fieldKeys(field);
          return (
            <div key={field.key} className={`grid gap-4 ${keys.length > 1 ? 'lg:grid-cols-2' : 'max-w-md'}`}>
              {keys.map((key, i) => (
                <ImageUploadField
                  key={key}
                  label={keys.length > 1 ? `${t(field.label)} (${t(i === 0 ? 'pages.sections.english' : 'pages.sections.arabic')})` : t(field.label)}
                  hint={keys.length > 1 && i === 1 ? t('pages.sections.arabicImageHint') : t('pages.sections.imageHint')}
                  size={field.size}
                  previewClassName="aspect-[16/9]"
                  fit="contain"
                  currentUrl={str(key)}
                  file={files[pathPrefix + key] ?? null}
                  onSelect={(file) => onFile(pathPrefix + key, file)}
                  onClearFile={() => onFile(pathPrefix + key, null)}
                  onRemove={() => onChange(key, '')}
                />
              ))}
            </div>
          );
        }

        const max = field.max ?? 200;
        const keys = fieldKeys(field);
        return (
          <div key={field.key} className={`grid gap-3 ${keys.length > 1 ? 'md:grid-cols-2' : ''}`}>
            {keys.map((key, i) => {
              const isAr = keys.length > 1 && i === 1;
              const label =
                keys.length > 1
                  ? `${t(field.label)} (${t(isAr ? 'pages.sections.arabic' : 'pages.sections.english')})`
                  : t(field.label);
              const common = {
                className: inputClass,
                style: inputStyle,
                dir: isAr ? 'rtl' : undefined,
                value: str(key),
                maxLength: max,
                onChange: (e: { target: { value: string } }) => onChange(key, e.target.value),
              };
              return (
                <Field key={key} label={label} hint={isAr ? t('pages.sections.arabicTextHint') : undefined}>
                  {field.kind === 'textarea' ? <textarea rows={3} {...common} /> : <input {...common} />}
                </Field>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function ListEditor({
  field,
  items,
  files,
  onItemsChange,
  onFilesChange,
}: {
  field: ListField;
  items: ListItem[];
  files: Record<string, File>;
  onItemsChange: (items: ListItem[]) => void;
  onFilesChange: (update: (files: Record<string, File>) => Record<string, File>) => void;
}) {
  const { t } = useTranslation();
  const fixed = field.min === field.max;

  const move = (from: number, to: number) => {
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    onItemsChange(next);
    onFilesChange((prev) => remapListFiles(prev, field.key, (i) => (i === from ? to : i === to ? from : i)));
  };

  const remove = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
    onFilesChange((prev) =>
      remapListFiles(prev, field.key, (i) => (i === index ? null : i > index ? i - 1 : i)),
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium" style={{ color: '#333' }}>
          {t(field.label)}
          <span className="ms-2 text-xs font-normal" style={{ color: '#999' }}>
            {fixed
              ? t('pages.sections.fixedCount', { count: field.max })
              : t('pages.sections.countRange', { min: field.min, max: field.max })}
          </span>
        </h3>
        {!fixed && (
          <button
            type="button"
            onClick={() => onItemsChange([...items, emptyListItem(field)])}
            disabled={items.length >= field.max}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
            style={inputStyle}
          >
            <Plus className="w-4 h-4" />
            {t('pages.sections.addItem', { item: t(field.itemLabel) })}
          </button>
        )}
      </div>

      {items.map((item, index) => (
        <div key={index} className="rounded-xl border p-4 space-y-3" style={{ borderColor: '#E5DDD4' }}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium" style={{ color: '#666' }}>
              {t(field.itemLabel)} {index + 1}
            </span>
            {!fixed && (
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  className="p-1.5 rounded-lg border disabled:opacity-30"
                  style={inputStyle}
                  aria-label={t('pages.sections.moveUp')}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={index === items.length - 1}
                  className="p-1.5 rounded-lg border disabled:opacity-30"
                  style={inputStyle}
                  aria-label={t('pages.sections.moveDown')}
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={items.length <= field.min}
                  className="p-1.5 rounded-lg border disabled:opacity-30"
                  style={{ ...inputStyle, color: '#C12D32' }}
                  aria-label={t('pages.sections.removeItem')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <ScalarFields
            fields={field.fields}
            values={item}
            pathPrefix={`${field.key}.${index}.`}
            files={files}
            onChange={(key, value) =>
              onItemsChange(items.map((it, i) => (i === index ? { ...it, [key]: value } : it)))
            }
            onFile={(path, file) =>
              onFilesChange((prev) => {
                const next = { ...prev };
                if (file) next[path] = file;
                else delete next[path];
                return next;
              })
            }
          />
        </div>
      ))}
    </div>
  );
}

/** Collapsible card editing one homepage section, built from its definition in homeSections.ts. */
export function HomeSectionEditor({
  def,
  initial,
  initiallySaved,
}: {
  def: HomeSectionDef;
  initial: SectionValues;
  initiallySaved: boolean;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SectionValues>(initial);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [isSaved, setIsSaved] = useState(initiallySaved);
  const [isSaving, setIsSaving] = useState(false);

  const update = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));
  const setFile = (path: string, file: File | null) =>
    setFiles((prev) => {
      const next = { ...prev };
      if (file) next[path] = file;
      else delete next[path];
      return next;
    });

  const validate = (): string | null => {
    const links: string[] = [];
    for (const field of def.fields) {
      if (field.kind === 'link') links.push(String(form[field.key] ?? ''));
      if (field.kind === 'list') {
        for (const item of (form[field.key] as ListItem[]) ?? []) {
          for (const sub of field.fields) if (sub.kind === 'link') links.push(item[sub.key] ?? '');
        }
      }
    }
    return links.every((link) => isSafeLink(link.trim())) ? null : t('pages.sections.linkInvalid');
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setIsSaving(true);
    try {
      const saved = await saveHomeSection(def.key, form, files);
      setForm(saved);
      setFiles({});
      setIsSaved(true);
      invalidateCache(HOME_SECTIONS_CACHE_KEY);
      toast.success(t('pages.sections.saveSuccess', { section: t(def.title) }));
    } catch (err) {
      toast.error(getPagesErrorMessage(err, t('pages.sections.saveError')));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreDefaults = () => {
    setForm(def.defaults());
    setFiles({});
    toast.info(t('pages.banner.defaultsRestored'));
  };

  const pendingChanges = Object.keys(files).length;

  return (
    <div className="rounded-2xl shadow-sm bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-6 text-left"
        aria-expanded={open}
      >
        <span>
          <span className="flex flex-wrap items-center gap-2 text-xl" style={{ color: '#333' }}>
            {t(def.title)}
            {!form.visible && (
              <span className="rounded-md px-2 py-0.5 text-xs" style={{ backgroundColor: '#FFF3E0', color: '#C12D32' }}>
                {t('pages.sections.hiddenBadge')}
              </span>
            )}
          </span>
          <span className="block text-sm" style={{ color: '#666' }}>
            {t(def.description)}
          </span>
        </span>
        <ChevronDown
          className={`w-5 h-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ color: '#999' }}
        />
      </button>

      {open && (
        <div className="space-y-6 border-t px-6 pb-6 pt-5" style={{ borderColor: '#F0EAE3' }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <p className="text-sm" style={{ color: '#666' }}>
              {isSaved ? t('pages.sections.savedNote') : t('pages.banner.notSavedYet')}
              {def.note && <span className="block mt-1">{t(def.note)}</span>}
            </p>
            <button
              type="button"
              onClick={handleRestoreDefaults}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm disabled:opacity-50"
              style={inputStyle}
            >
              <RotateCcw className="w-4 h-4" />
              {t('pages.banner.restoreDefaults')}
            </button>
          </div>

          <label
            className="flex items-start gap-3 rounded-xl border p-4"
            style={{
              borderColor: form.visible ? '#E5DDD4' : '#ECC180',
              backgroundColor: form.visible ? undefined : '#FFF9EF',
            }}
          >
            <input
              type="checkbox"
              className="mt-1"
              checked={form.visible}
              onChange={(e) => update('visible', e.target.checked)}
            />
            <span>
              <span className="block text-sm font-medium" style={{ color: '#333' }}>
                {t('pages.sections.visible')}
              </span>
              <span className="block text-xs" style={{ color: '#666' }}>
                {t('pages.sections.visibleHint')}
              </span>
            </span>
          </label>

          <div className={`space-y-6 ${form.visible ? '' : 'opacity-60'}`}>
            {def.fields.map((field) =>
              field.kind === 'list' ? (
                <ListEditor
                  key={field.key}
                  field={field}
                  items={(form[field.key] as ListItem[]) ?? []}
                  files={files}
                  onItemsChange={(items) => update(field.key, items)}
                  onFilesChange={setFiles}
                />
              ) : (
                <ScalarFields
                  key={field.key}
                  fields={[field]}
                  values={form}
                  pathPrefix=""
                  files={files}
                  onChange={update}
                  onFile={setFile}
                />
              ),
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            {pendingChanges > 0 && (
              <span className="text-xs" style={{ color: '#999' }}>
                {t('pages.sections.pendingImages', { count: pendingChanges })}
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 rounded-lg text-white text-sm disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: '#C12D32' }}
            >
              <Save className="w-4 h-4" />
              {isSaving ? t('pages.banner.saving') : t('pages.sections.save')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
