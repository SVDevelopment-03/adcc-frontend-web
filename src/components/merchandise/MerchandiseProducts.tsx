import React, { useRef, useState } from 'react';
import {
  Plus, Search, Filter, Edit2, Trash2, Eye, Star, Package,
  Upload, X, ChevronDown, Tag, CheckCircle, AlertTriangle, Archive
} from 'lucide-react';
import { toast } from 'sonner';
import { Product, ProductVariant, ProductStatus, Category } from './merchandiseData';
import {
  createMerchandiseProduct,
  updateMerchandiseProduct,
  deleteMerchandiseProduct,
  updateMerchandiseProductStatus,
  updateMerchandiseProductFeatured,
  uploadMerchandiseProductImages,
} from '../../services/merchandiseApi';

interface MerchandiseProductsProps {
  products: Product[];
  categories: Category[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  defaultSource?: 'adcc' | 'vendor';
}

const emptyVariant = (): ProductVariant => ({
  id: `v-${Date.now()}-${Math.random()}`,
  size: '',
  color: '',
  colorHex: '#C12D32',
  stock: 0,
  sku: '',
});

const emptyProduct = (source: 'adcc' | 'vendor' = 'adcc'): Omit<Product, 'id' | 'sold' | 'createdAt'> => ({
  name: '',
  nameAr: '',
  categoryId: '',
  subcategoryId: '',
  price: 0,
  originalPrice: undefined,
  images: [],
  description: '',
  descriptionAr: '',
  specifications: [{ label: '', value: '' }],
  variants: [emptyVariant()],
  status: 'draft',
  featured: false,
  tags: [],
  totalStock: 0,
  sku: '',
  source,
});

const statusConfig: Record<ProductStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  published: { label: 'Published', color: '#10B981', bg: '#ECFDF5', icon: <CheckCircle className="w-3 h-3" /> },
  draft: { label: 'Draft', color: '#F59E0B', bg: '#FFFBEB', icon: <AlertTriangle className="w-3 h-3" /> },
  archived: { label: 'Archived', color: '#6B7280', bg: '#F9FAFB', icon: <Archive className="w-3 h-3" /> },
};

export function MerchandiseProducts({ products, categories, setProducts, defaultSource }: MerchandiseProductsProps) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | ProductStatus>('all');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct(defaultSource ?? 'adcc'));
  const [tagInput, setTagInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const imageFilesInputRef = useRef<HTMLInputElement | null>(null);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'all' || p.categoryId === filterCategory;
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const openCreate = () => {
    setForm({
      ...emptyProduct(defaultSource ?? 'adcc'),
      categoryId: categories[0]?.id ?? '',
    });
    setTagInput('');
    setImageUrlInput('');
    setEditProduct(null);
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setForm({
      name: product.name,
      nameAr: product.nameAr || '',
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId || '',
      price: product.price,
      originalPrice: product.originalPrice,
      images: [...product.images],
      description: product.description,
      descriptionAr: product.descriptionAr || '',
      specifications: product.specifications.map(s => ({ ...s })),
      variants: product.variants.map(v => ({ ...v })),
      status: product.status,
      featured: product.featured,
      tags: [...product.tags],
      totalStock: product.totalStock,
      sku: product.sku,
      source: product.source ?? (defaultSource ?? 'adcc'),
    });
    setTagInput('');
    setImageUrlInput('');
    setEditProduct(product);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.sku.trim() || form.price <= 0 || !form.categoryId) {
      toast.error('Name, SKU, category and price are required');
      return;
    }
    const totalStock = form.variants.reduce((s, v) => s + (v.stock || 0), 0);
    try {
      const payload = {
        ...form,
        source: form.source ?? editProduct?.source ?? defaultSource ?? 'adcc',
      };
      if (editProduct) {
        const updated = await updateMerchandiseProduct(editProduct.id, payload);
        setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...updated, totalStock, source: updated.source ?? editProduct.source ?? defaultSource ?? 'adcc' } : p));
        toast.success('Product updated successfully');
      } else {
        const created = await createMerchandiseProduct(payload);
        setProducts(prev => [created, ...prev]);
        toast.success('Product created successfully');
      }
      setShowForm(false);
    } catch (error) {
      toast.error((error as Error)?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMerchandiseProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error((error as Error)?.message || 'Failed to delete product');
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      const next: ProductStatus = product.status === 'published' ? 'draft' : 'published';
      const updated = await updateMerchandiseProductStatus(product.id, next);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: updated.status } : p));
      toast.success(`Product ${updated.status}`);
    } catch (error) {
      toast.error((error as Error)?.message || 'Failed to update product status');
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const updated = await updateMerchandiseProductFeatured(product.id, !product.featured);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, featured: updated.featured } : p));
      toast.success(updated.featured ? 'Marked as featured' : 'Removed from featured');
    } catch (error) {
      toast.error((error as Error)?.message || 'Failed to update featured state');
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm(f => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput('');
  };

  const addImage = () => {
    const url = imageUrlInput.trim();
    if (url) {
      setForm(f => ({ ...f, images: [...f.images, url] }));
    }
    setImageUrlInput('');
  };

  const handleImageFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    try {
      const uploaded = await uploadMerchandiseProductImages(Array.from(files));
      setForm(f => ({ ...f, images: [...f.images, ...uploaded.map(u => u.url)] }));
    } catch (error) {
      toast.error((error as Error)?.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
      if (imageFilesInputRef.current) imageFilesInputRef.current.value = '';
    }
  };

  const addVariant = () => setForm(f => ({ ...f, variants: [...f.variants, emptyVariant()] }));
  const removeVariant = (idx: number) => setForm(f => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) }));
  const updateVariant = (idx: number, key: keyof ProductVariant, value: string | number) => {
    setForm(f => ({
      ...f,
      variants: f.variants.map((v, i) => i === idx ? { ...v, [key]: value } : v),
    }));
  };

  const addSpec = () => setForm(f => ({ ...f, specifications: [...f.specifications, { label: '', value: '' }] }));
  const removeSpec = (idx: number) => setForm(f => ({ ...f, specifications: f.specifications.filter((_, i) => i !== idx) }));
  const updateSpec = (idx: number, key: 'label' | 'value', value: string) => {
    setForm(f => ({
      ...f,
      specifications: f.specifications.map((s, i) => i === idx ? { ...s, [key]: value } : s),
    }));
  };

  const selectedCategory = categories.find(c => c.id === form.categoryId);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#999' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products or SKU..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as 'all' | ProductStatus)}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm transition-all hover:shadow-md"
          style={{ backgroundColor: '#C12D32' }}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#FFF9EF' }}>
              <th className="text-left px-6 py-4 text-sm" style={{ color: '#666' }}>Product</th>
              <th className="text-left px-4 py-4 text-sm" style={{ color: '#666' }}>Category</th>
              <th className="text-left px-4 py-4 text-sm" style={{ color: '#666' }}>Price</th>
              <th className="text-left px-4 py-4 text-sm" style={{ color: '#666' }}>Stock</th>
              <th className="text-left px-4 py-4 text-sm" style={{ color: '#666' }}>Sold</th>
              <th className="text-left px-4 py-4 text-sm" style={{ color: '#666' }}>Status</th>
              <th className="text-right px-6 py-4 text-sm" style={{ color: '#666' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product, idx) => {
              const cat = categories.find(c => c.id === product.categoryId);
              const st = statusConfig[product.status];
              return (
                <tr key={product.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0] || 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=100'}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm" style={{ color: '#333' }}>{product.name}</span>
                          {product.featured && (
                            <Star className="w-3 h-3 fill-current" style={{ color: '#F59E0B' }} />
                          )}
                        </div>
                        <span className="text-xs" style={{ color: '#999' }}>SKU: {product.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm" style={{ color: '#666' }}>{cat?.name || '-'}</td>
                  <td className="px-4 py-4">
                    <div className="text-sm" style={{ color: '#333' }}>AED {product.price}</div>
                    {product.originalPrice && (
                      <div className="text-xs line-through" style={{ color: '#999' }}>AED {product.originalPrice}</div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className="text-sm"
                      style={{ color: product.totalStock < 10 ? '#C12D32' : '#333' }}
                    >
                      {product.totalStock}
                      {product.totalStock < 10 && <span className="ml-1 text-xs">(low)</span>}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm" style={{ color: '#666' }}>{product.sold}</td>
                  <td className="px-4 py-4">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                      style={{ color: st.color, backgroundColor: st.bg }}
                    >
                      {st.icon}
                      {st.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setViewProduct(product)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="View">
                        <Eye className="w-4 h-4" style={{ color: '#666' }} />
                      </button>
                      <button onClick={() => openEdit(product)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" style={{ color: '#3B82F6' }} />
                      </button>
                      <button onClick={() => handleToggleFeatured(product)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Toggle featured">
                        <Star className={`w-4 h-4 ${product.featured ? 'fill-current' : ''}`} style={{ color: '#F59E0B' }} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className="px-2 py-1 rounded-lg text-xs transition-all hover:shadow-sm"
                        style={{ backgroundColor: product.status === 'published' ? '#FEF3C7' : '#ECFDF5', color: product.status === 'published' ? '#92400E' : '#065F46' }}
                      >
                        {product.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => setDeleteConfirm(product.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" style={{ color: '#C12D32' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-12 h-12 mx-auto mb-3" style={{ color: '#ECC180' }} />
            <p style={{ color: '#666' }}>No products found</p>
          </div>
        )}
      </div>

      {/* Create / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl my-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl" style={{ color: '#333' }}>
                {editProduct ? 'Edit Product' : 'Create New Product'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" style={{ color: '#666' }} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1" style={{ color: '#666' }}>Product Name <span style={{ color: '#C12D32' }}>*</span></label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="e.g. ADCC Race Jersey 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: '#666' }}>Product Name (Arabic)</label>
                  <input
                    value={form.nameAr}
                    onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))}
                    dir="rtl"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="مثال: قميص سباق ADCC 2024"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1" style={{ color: '#666' }}>SKU <span style={{ color: '#C12D32' }}>*</span></label>
                    <input
                      value={form.sku}
                      onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                      placeholder="ADC-RJ24"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1" style={{ color: '#666' }}>Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value as ProductStatus }))}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1" style={{ color: '#666' }}>Price (AED) <span style={{ color: '#C12D32' }}>*</span></label>
                    <input
                      type="number"
                      value={form.price || ''}
                      onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                      placeholder="320"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1" style={{ color: '#666' }}>Original Price (AED)</label>
                    <input
                      type="number"
                      value={form.originalPrice || ''}
                      onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value ? Number(e.target.value) : undefined }))}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                      placeholder="400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: '#666' }}>Category</label>
                  <select
                    value={form.categoryId}
                    onChange={e => setForm(f => ({ ...f, categoryId: e.target.value, subcategoryId: '' }))}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {selectedCategory && selectedCategory.subcategories.length > 0 && (
                  <div>
                    <label className="block text-sm mb-1" style={{ color: '#666' }}>Subcategory</label>
                    <select
                      value={form.subcategoryId}
                      onChange={e => setForm(f => ({ ...f, subcategoryId: e.target.value }))}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      <option value="">None</option>
                      {selectedCategory.subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm mb-1" style={{ color: '#666' }}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
                    placeholder="Product description..."
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: '#666' }}>Description (Arabic)</label>
                  <textarea
                    value={form.descriptionAr}
                    onChange={e => setForm(f => ({ ...f, descriptionAr: e.target.value }))}
                    rows={4}
                    dir="rtl"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
                    placeholder="وصف المنتج..."
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={form.featured}
                      onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                      className="w-4 h-4 accent-red-600"
                    />
                    <label htmlFor="featured" className="text-sm" style={{ color: '#666' }}>Featured product</label>
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="space-y-4">
                {/* Images */}
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>Product Images (Gallery)</label>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => imageFilesInputRef.current?.click()}
                      disabled={uploadingImages}
                      className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                      {uploadingImages ? 'Uploading...' : 'Upload Images'}
                    </button>
                    <input
                      ref={imageFilesInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={e => handleImageFilesSelected(e.target.files)}
                    />
                  </div>
                  <div className="flex gap-2 mb-2">
                    <input
                      value={imageUrlInput}
                      onChange={e => setImageUrlInput(e.target.value)}
                      placeholder="...or paste image URL"
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                    <button onClick={addImage} className="px-3 py-2 rounded-xl text-sm text-white" style={{ backgroundColor: '#C12D32' }}>Add</button>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">First image is used as the main thumbnail; add more to build the product's photo gallery.</p>
                  <div className="flex flex-wrap gap-2">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16">
                        <img src={img} alt="" className="w-16 h-16 rounded-lg object-cover" />
                        <button
                          onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm" style={{ color: '#666' }}>Specifications</label>
                    <button onClick={addSpec} className="text-xs px-2 py-1 rounded-lg" style={{ color: '#C12D32', backgroundColor: '#FEF2F2' }}>+ Add</button>
                  </div>
                  <div className="space-y-2">
                    {form.specifications.map((spec, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          value={spec.label}
                          onChange={e => updateSpec(idx, 'label', e.target.value)}
                          placeholder="Label"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-red-600"
                        />
                        <input
                          value={spec.value}
                          onChange={e => updateSpec(idx, 'value', e.target.value)}
                          placeholder="Value"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-red-600"
                        />
                        <button onClick={() => removeSpec(idx)} className="p-1 text-gray-400 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Variants */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm" style={{ color: '#666' }}>Variants (Size / Color / Stock)</label>
                    <button onClick={addVariant} className="text-xs px-2 py-1 rounded-lg" style={{ color: '#C12D32', backgroundColor: '#FEF2F2' }}>+ Add</button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {form.variants.map((v, idx) => (
                      <div key={v.id} className="flex gap-1.5 items-center">
                        <input
                          value={v.size || ''}
                          onChange={e => updateVariant(idx, 'size', e.target.value)}
                          placeholder="Size"
                          className="w-14 px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                        <input
                          value={v.color || ''}
                          onChange={e => updateVariant(idx, 'color', e.target.value)}
                          placeholder="Color"
                          className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                        <input
                          type="color"
                          value={v.colorHex || '#C12D32'}
                          onChange={e => updateVariant(idx, 'colorHex', e.target.value)}
                          className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0.5"
                        />
                        <input
                          type="number"
                          value={v.stock}
                          onChange={e => updateVariant(idx, 'stock', Number(e.target.value))}
                          placeholder="Stock"
                          className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                        <input
                          value={v.sku}
                          onChange={e => updateVariant(idx, 'sku', e.target.value)}
                          placeholder="SKU"
                          className="w-20 px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                        <button onClick={() => removeVariant(idx)} className="p-1 text-gray-400 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addTag()}
                      placeholder="Add tag..."
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                    <button onClick={addTag} className="px-3 py-2 rounded-xl text-sm text-white" style={{ backgroundColor: '#ECC180', color: '#333' }}>Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {form.tags.map(t => (
                      <span key={t} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ backgroundColor: '#FFF9EF', color: '#C12D32' }}>
                        {t}
                        <button onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(tag => tag !== t) }))}>
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl text-white text-sm transition-all hover:shadow-md" style={{ backgroundColor: '#C12D32' }}>
                {editProduct ? 'Save Changes' : 'Create Product'}
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm hover:bg-gray-50 transition-all" style={{ color: '#666' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewProduct(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl" style={{ color: '#333' }}>{viewProduct.name}</h3>
              <button onClick={() => setViewProduct(null)}><X className="w-5 h-5" style={{ color: '#666' }} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img src={viewProduct.images[0]} alt="" className="w-full rounded-xl object-cover mb-2" />
                <div className="flex gap-2">
                  {viewProduct.images.slice(1).map((img, i) => (
                    <img key={i} src={img} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-2xl" style={{ color: '#C12D32' }}>AED {viewProduct.price}</p>
                  {viewProduct.originalPrice && <p className="text-sm line-through" style={{ color: '#999' }}>AED {viewProduct.originalPrice}</p>}
                </div>
                <p className="text-sm" style={{ color: '#666' }}>{viewProduct.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {viewProduct.specifications.map((s, i) => (
                    <div key={i} className="p-2 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                      <p className="text-xs" style={{ color: '#999' }}>{s.label}</p>
                      <p className="text-sm" style={{ color: '#333' }}>{s.value}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#666' }}>Variants</p>
                  <div className="flex flex-wrap gap-1">
                    {viewProduct.variants.map(v => (
                      <span key={v.id} className="px-2 py-1 rounded-lg text-xs border border-gray-200" style={{ color: '#333' }}>
                        {[v.size, v.color].filter(Boolean).join(' / ')} — {v.stock} in stock
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { openEdit(viewProduct); setViewProduct(null); }} className="flex-1 py-2 rounded-xl text-white text-sm" style={{ backgroundColor: '#C12D32' }}>Edit Product</button>
              <button onClick={() => setViewProduct(null)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm hover:bg-gray-50" style={{ color: '#666' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg mb-2" style={{ color: '#333' }}>Delete Product?</h3>
            <p className="text-sm mb-6" style={{ color: '#666' }}>This action cannot be undone.</p>
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
