import React, { useEffect, useRef, useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, ChevronRight, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { Category } from './merchandiseData';
import {
  createMerchandiseCategory,
  updateMerchandiseCategory,
  deleteMerchandiseCategory,
  uploadMerchandiseCategoryImage,
} from '../../services/merchandiseApi';

interface MerchandiseCategoriesProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

export function MerchandiseCategories({ categories, setCategories }: MerchandiseCategoriesProps) {
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [subcatInput, setSubcatInput] = useState('');

  const [form, setForm] = useState({
    name: '',
    icon: '🏷️',
    image: '',
    active: true,
    subcategories: [] as { id: string; name: string }[],
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [newSubcatName, setNewSubcatName] = useState('');
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const openCreate = () => {
    setForm({ name: '', icon: '🏷️', image: '', active: true, subcategories: [] });
    setSelectedImageFile(null);
    setImagePreviewUrl('');
    setNewSubcatName('');
    setEditCat(null);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setForm({ name: cat.name, icon: cat.icon ?? '🏷️', image: cat.image ?? '', active: cat.active, subcategories: cat.subcategories.map(s => ({ ...s })) });
    setSelectedImageFile(null);
    setImagePreviewUrl(cat.image ?? '');
    setNewSubcatName('');
    setEditCat(cat);
    setShowForm(true);
  };

  useEffect(() => {
    if (!selectedImageFile) return;
    const url = URL.createObjectURL(selectedImageFile);
    setImagePreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedImageFile]);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    try {
      const payload: any = {
        name: form.name,
        active: form.active,
        subcategories: form.subcategories,
      };

      if (selectedImageFile) {
        const uploadResult = await uploadMerchandiseCategoryImage(selectedImageFile);
        payload.image = uploadResult.url;
      } else if (form.image) {
        payload.image = form.image;
      }

      if (!payload.image) {
        payload.icon = form.icon;
      }

      if (editCat) {
        const updated = await updateMerchandiseCategory(editCat.id, payload);
        setCategories(prev => prev.map(c => c.id === editCat.id ? { ...c, ...updated } : c));
        toast.success('Category updated');
      } else {
        const created = await createMerchandiseCategory(payload);
        setCategories(prev => [...prev, { ...created, productCount: 0 }]);
        toast.success('Category created');
      }
      setShowForm(false);
    } catch (error) {
      toast.error((error as Error)?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMerchandiseCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Category deleted');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error((error as Error)?.message || 'Failed to delete category');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const category = categories.find(c => c.id === id);
      if (!category) return;
      const updated = await updateMerchandiseCategory(id, { active: !category.active });
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    } catch (error) {
      toast.error((error as Error)?.message || 'Failed to update category');
    }
  };

  const addSubcat = () => {
    const name = newSubcatName.trim();
    if (!name) return;
    setForm(f => ({
      ...f,
      subcategories: [...f.subcategories, { id: name.toLowerCase().replace(/\s+/g, '-'), name }],
    }));
    setNewSubcatName('');
  };

  const removeSubcat = (id: string) => setForm(f => ({ ...f, subcategories: f.subcategories.filter(s => s.id !== id) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg" style={{ color: '#333' }}>Product Categories</h2>
          <p className="text-sm" style={{ color: '#666' }}>{categories.length} categories · {categories.filter(c => c.active).length} active</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm transition-all hover:shadow-md"
          style={{ backgroundColor: '#C12D32' }}
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
            style={{ opacity: cat.active ? 1 : 0.6 }}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden bg-[#FFF9EF]">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">{cat.icon}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#333' }}>{cat.name}</p>
                    <p className="text-xs" style={{ color: '#999' }}>{cat.productCount} products · {cat.subcategories.length} subcategories</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: cat.active ? '#ECFDF5' : '#F9FAFB', color: cat.active ? '#10B981' : '#6B7280' }}>
                    {cat.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Subcategories Preview */}
              {cat.subcategories.length > 0 && (
                <button
                  onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-50 mb-3"
                  style={{ color: '#666' }}
                >
                  <span>Subcategories ({cat.subcategories.length})</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${expandedCat === cat.id ? 'rotate-90' : ''}`} />
                </button>
              )}
              {expandedCat === cat.id && (
                <div className="pl-3 mb-3 space-y-1">
                  {cat.subcategories.map(sub => (
                    <div key={sub.id} className="flex items-center gap-2 py-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#ECC180' }} />
                      <span className="text-sm" style={{ color: '#555' }}>{sub.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(cat)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-all hover:shadow-sm"
                  style={{ backgroundColor: '#EFF6FF', color: '#3B82F6' }}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(cat.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-all hover:shadow-sm"
                  style={{ backgroundColor: cat.active ? '#FEF3C7' : '#ECFDF5', color: cat.active ? '#92400E' : '#065F46' }}
                >
                  {cat.active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                  {cat.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(cat.id)}
                  className="p-2 rounded-xl transition-all hover:bg-red-50"
                  style={{ color: '#C12D32' }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl" style={{ color: '#333' }}>{editCat ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" style={{ color: '#666' }} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: '#666' }}>Category Name <span style={{ color: '#C12D32' }}>*</span></label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="e.g. Jerseys & Kits"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Category Image</label>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Choose Image
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setSelectedImageFile(file);
                      if (!file) {
                        setForm(f => ({ ...f, image: '' }));
                        setImagePreviewUrl('');
                      }
                    }}
                  />
                  {imagePreviewUrl && (
                    <img
                      src={imagePreviewUrl}
                      alt="Category preview"
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">Upload a category image instead of using an icon.</p>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Subcategories</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={newSubcatName}
                    onChange={e => setNewSubcatName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSubcat()}
                    placeholder="Subcategory name..."
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <button onClick={addSubcat} className="px-3 py-2 rounded-xl text-sm" style={{ backgroundColor: '#ECC180', color: '#333' }}>Add</button>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {form.subcategories.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                      <span className="text-sm" style={{ color: '#333' }}>{sub.name}</span>
                      <button onClick={() => removeSubcat(sub.id)}><X className="w-3.5 h-3.5" style={{ color: '#999' }} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="cat-active"
                  checked={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                  className="w-4 h-4 accent-red-600"
                />
                <label htmlFor="cat-active" className="text-sm" style={{ color: '#666' }}>Active (visible in app)</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl text-white text-sm" style={{ backgroundColor: '#C12D32' }}>
                {editCat ? 'Save Changes' : 'Create Category'}
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm hover:bg-gray-50" style={{ color: '#666' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg mb-2" style={{ color: '#333' }}>Delete Category?</h3>
            <p className="text-sm mb-6" style={{ color: '#666' }}>Products in this category won't be deleted but will become uncategorised.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2 rounded-xl text-white text-sm" style={{ backgroundColor: '#C12D32' }}>Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm hover:bg-gray-50" style={{ color: '#666' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
