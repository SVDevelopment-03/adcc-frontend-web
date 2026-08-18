import React, { useEffect, useRef, useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  createLookup,
  deleteLookup,
  getLookupsForAdmin,
  LookupItem,
  updateLookup,
} from '../../services/lookupsApi';

interface LookupTypeManagerProps {
  /** Lookup `type`, e.g. "event_category". */
  type: string;
  /** Singular noun used in copy, e.g. "Category", "City", "Country". */
  itemLabel: string;
  /** Restricts the list to entries under this parent (e.g. a country's `value`, for cities). */
  parentValue?: string;
  /** New entries are created with this parentValue (required alongside `parentValue` for hierarchical types). */
  emptyState?: string;
  /** Shows an icon/image upload field on the form and a thumbnail on each card. */
  supportsIcon?: boolean;
}

export function LookupTypeManager({ type, itemLabel, parentValue, emptyState, supportsIcon }: LookupTypeManagerProps) {
  const [items, setItems] = useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<LookupItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<LookupItem | null>(null);
  const [form, setForm] = useState({ label: '', labelAr: '', active: true });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [removeIcon, setRemoveIcon] = useState(false);
  const iconInputRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);

  const handleIconChange = (file: File | null) => {
    if (iconPreview) URL.revokeObjectURL(iconPreview);
    setIconFile(file);
    setIconPreview(file ? URL.createObjectURL(file) : null);
    if (file) setRemoveIcon(false);
  };

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getLookupsForAdmin(type, parentValue);
      setItems(data);
    } catch (error) {
      toast.error((error as Error)?.message || `Failed to load ${itemLabel.toLowerCase()} list`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, parentValue]);

  const openCreate = () => {
    setForm({ label: '', labelAr: '', active: true });
    handleIconChange(null);
    setRemoveIcon(false);
    setEditItem(null);
    setShowForm(true);
  };

  const openEdit = (item: LookupItem) => {
    setForm({ label: item.label, labelAr: item.labelAr, active: item.active });
    handleIconChange(null);
    setRemoveIcon(false);
    setEditItem(item);
    setShowForm(true);
  };

  const handleRemoveIcon = () => {
    handleIconChange(null);
    if (iconInputRef.current) iconInputRef.current.value = '';
    setRemoveIcon(true);
  };

  const handleSave = async () => {
    if (!form.label.trim()) { toast.error('English name is required'); return; }
    if (!form.labelAr.trim()) { toast.error('Arabic name is required'); return; }

    setSaving(true);
    try {
      if (editItem) {
        const updated = await updateLookup(editItem.id, {
          label: form.label.trim(),
          labelAr: form.labelAr.trim(),
          active: form.active,
          ...(iconFile ? { iconFile } : {}),
          ...(removeIcon ? { removeIcon: true } : {}),
        });
        setItems((prev) => prev.map((i) => (i.id === editItem.id ? updated : i)));
        toast.success(`${itemLabel} updated`);
      } else {
        const created = await createLookup({
          type,
          label: form.label.trim(),
          labelAr: form.labelAr.trim(),
          active: form.active,
          parentValue,
          order: items.length,
          ...(iconFile ? { iconFile } : {}),
        });
        setItems((prev) => [...prev, created]);
        toast.success(`${itemLabel} created`);
      }
      handleIconChange(null);
      setRemoveIcon(false);
      if (iconInputRef.current) iconInputRef.current.value = '';
      setShowForm(false);
    } catch (error) {
      toast.error((error as Error)?.message || `Failed to save ${itemLabel.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: LookupItem) => {
    try {
      await deleteLookup(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success(`${itemLabel} deleted`);
      setDeleteConfirm(null);
    } catch (error) {
      toast.error((error as Error)?.message || `Failed to delete ${itemLabel.toLowerCase()}`);
    }
  };

  const handleToggleActive = async (item: LookupItem) => {
    try {
      const updated = await updateLookup(item.id, { active: !item.active });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch (error) {
      toast.error((error as Error)?.message || `Failed to update ${itemLabel.toLowerCase()}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: '#666' }}>
          {items.length} {items.length === 1 ? itemLabel.toLowerCase() : `${itemLabel.toLowerCase()}s`} ·{' '}
          {items.filter((i) => i.active).length} active
        </p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm transition-all hover:shadow-md"
          style={{ backgroundColor: '#C12D32' }}
        >
          <Plus className="w-4 h-4" />
          Add {itemLabel}
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center" style={{ color: '#666' }}>
          {emptyState || `No ${itemLabel.toLowerCase()}s yet. Add the first one to get started.`}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm p-5"
              style={{ opacity: item.active ? 1 : 0.6 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 min-w-0">
                  {supportsIcon ? (
                    <div
                      className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: '#F3EEE7' }}
                    >
                      {item.icon ? (
                        <img src={item.icon} alt={item.label} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-4 h-4" style={{ color: '#CCC' }} />
                      )}
                    </div>
                  ) : null}
                  <div className="min-w-0">
                    <p className="text-sm font-medium" style={{ color: '#333' }}>{item.label}</p>
                    <p className="text-sm mt-0.5" dir="rtl" style={{ color: '#666' }}>{item.labelAr}</p>
                  </div>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-xs whitespace-nowrap"
                  style={{ backgroundColor: item.active ? '#ECFDF5' : '#F9FAFB', color: item.active ? '#10B981' : '#6B7280' }}
                >
                  {item.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-all hover:shadow-sm"
                  style={{ backgroundColor: '#EFF6FF', color: '#3B82F6' }}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-all hover:shadow-sm"
                  style={{ backgroundColor: item.active ? '#FEF3C7' : '#ECFDF5', color: item.active ? '#92400E' : '#065F46' }}
                >
                  {item.active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                  {item.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(item)}
                  className="p-2 rounded-xl transition-all hover:bg-red-50"
                  style={{ color: '#C12D32' }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl" style={{ color: '#333' }}>{editItem ? `Edit ${itemLabel}` : `Add ${itemLabel}`}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" style={{ color: '#666' }} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: '#666' }}>
                  Name (English) <span style={{ color: '#C12D32' }}>*</span>
                </label>
                <input
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder={`e.g. ${itemLabel}`}
                />
              </div>

              <div>
                <label className="block text-sm mb-1" style={{ color: '#666' }}>
                  Name (Arabic) <span style={{ color: '#C12D32' }}>*</span>
                </label>
                <input
                  dir="rtl"
                  value={form.labelAr}
                  onChange={(e) => setForm((f) => ({ ...f, labelAr: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              {supportsIcon ? (
                <div>
                  <label className="block text-sm mb-1" style={{ color: '#666' }}>
                    Icon / Image
                  </label>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border border-gray-200"
                      style={{ backgroundColor: '#F3EEE7' }}
                    >
                      {!removeIcon && (iconPreview || editItem?.icon) ? (
                        <img
                          src={iconPreview || editItem?.icon}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5" style={{ color: '#CCC' }} />
                      )}
                    </div>
                    <input
                      ref={iconInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleIconChange(e.target.files?.[0] ?? null)}
                      className="flex-1 text-sm"
                    />
                    {!removeIcon && (iconPreview || editItem?.icon) ? (
                      <button
                        type="button"
                        onClick={handleRemoveIcon}
                        className="shrink-0 text-xs px-2 py-1 rounded-lg hover:bg-red-50"
                        style={{ color: '#C12D32' }}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`lookup-active-${type}`}
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="w-4 h-4 accent-red-600"
                />
                <label htmlFor={`lookup-active-${type}`} className="text-sm" style={{ color: '#666' }}>
                  Active (selectable across the app)
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl text-white text-sm disabled:opacity-60"
                style={{ backgroundColor: '#C12D32' }}
              >
                {editItem ? 'Save Changes' : `Create ${itemLabel}`}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm hover:bg-gray-50"
                style={{ color: '#666' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg mb-2" style={{ color: '#333' }}>Delete "{deleteConfirm.label}"?</h3>
            <p className="text-sm mb-6" style={{ color: '#666' }}>
              Records already using this value will keep showing it as plain text, but it won't be
              offered for new or edited records.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 rounded-xl text-white text-sm"
                style={{ backgroundColor: '#C12D32' }}
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm hover:bg-gray-50"
                style={{ color: '#666' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
