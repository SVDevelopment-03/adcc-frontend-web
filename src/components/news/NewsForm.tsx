import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { RichTextEditor } from '../ui/RichTextEditor';
import { useNewsCategories } from '../../hooks/useLookups';
import { createNews, updateNews, type NewsItem, type NewsStatus } from '../../services/newsApi';

interface NewsFormProps {
  mode: 'create' | 'edit';
  newsId?: string;
  initialData?: NewsItem | null;
}

interface FormState {
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  category: string;
  author: string;
  publishedAt: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  titleAr: '',
  content: '',
  contentAr: '',
  category: '',
  author: '',
  publishedAt: '',
};

function toDateInputValue(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function NewsForm({ mode, newsId, initialData }: NewsFormProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { options: categoryOptions } = useNewsCategories();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!initialData) return;
    setForm({
      title: initialData.title || '',
      titleAr: initialData.titleAr || '',
      content: initialData.content || '',
      contentAr: initialData.contentAr || '',
      category: initialData.category || '',
      author: initialData.author || '',
      publishedAt: toDateInputValue(initialData.publishedAt),
    });
    setCoverImagePreview(initialData.coverImage || '');
  }, [initialData]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!form.title.trim() && !form.titleAr.trim()) {
      nextErrors.title = t('news.form.errors.titleRequired', 'Title (English or Arabic) is required');
    }
    if (!form.content.trim() && !form.contentAr.trim()) {
      nextErrors.content = t('news.form.errors.contentRequired', 'Content (English or Arabic) is required');
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (status: NewsStatus) => {
    if (!validate()) {
      toast.error(t('news.form.errors.fixFields', 'Please fix the highlighted fields'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title.trim() || form.titleAr.trim(),
        titleAr: form.titleAr.trim() || undefined,
        content: form.content.trim() || form.contentAr.trim(),
        contentAr: form.contentAr.trim() || undefined,
        category: form.category || undefined,
        author: form.author.trim() || undefined,
        status,
        publishedAt: form.publishedAt || undefined,
        coverImage: coverImageFile || undefined,
      };

      if (mode === 'create') {
        await createNews(payload);
        toast.success(t('news.form.toasts.createSuccess', 'News article created'));
      } else if (newsId) {
        await updateNews(newsId, payload);
        toast.success(t('news.form.toasts.updateSuccess', 'News article updated'));
      }
      navigate('/news');
    } catch (error: any) {
      toast.error(error?.message || t('news.form.toasts.saveError', 'Failed to save news article'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/news')}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#666' }} />
        </button>
        <div>
          <h1 className="text-3xl" style={{ color: '#333' }}>
            {mode === 'create' ? t('news.form.createTitle', 'New Article') : t('news.form.editTitle', 'Edit Article')}
          </h1>
          <p style={{ color: '#666' }}>{t('news.form.subtitle', 'Write bilingual news content for the public News page')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* English */}
          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-4">
            <h3 className="text-lg" style={{ color: '#333' }}>{t('news.form.englishSection', 'English')}</h3>
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>
                {t('news.form.titleLabel', 'Title')} <span style={{ color: '#C12D32' }}>*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder={t('news.form.titlePlaceholder', 'Article title')}
              />
              {errors.title && <p className="text-xs mt-1" style={{ color: '#C12D32' }}>{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>
                {t('news.form.contentLabel', 'Content')} <span style={{ color: '#C12D32' }}>*</span>
              </label>
              <RichTextEditor
                value={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
                placeholder={t('news.form.contentPlaceholder', 'Write the article content...')}
                dir="ltr"
              />
              {errors.content && <p className="text-xs mt-1" style={{ color: '#C12D32' }}>{errors.content}</p>}
            </div>
          </div>

          {/* Arabic */}
          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-4">
            <h3 className="text-lg" style={{ color: '#333' }}>{t('news.form.arabicSection', 'Arabic')}</h3>
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>
                {t('news.form.titleArLabel', 'Title (Arabic)')}
              </label>
              <input
                type="text"
                dir="rtl"
                value={form.titleAr}
                onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 text-end"
                placeholder={t('news.form.titleArPlaceholder', 'عنوان المقال')}
              />
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>
                {t('news.form.contentArLabel', 'Content (Arabic)')}
              </label>
              <RichTextEditor
                value={form.contentAr}
                onChange={(html) => setForm({ ...form, contentAr: html })}
                placeholder={t('news.form.contentArPlaceholder', 'اكتب محتوى المقال...')}
                dir="rtl"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Publish settings */}
          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-4">
            <h3 className="text-lg" style={{ color: '#333' }}>{t('news.form.publishSection', 'Publish Settings')}</h3>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('news.form.categoryLabel', 'Category')}</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="">{t('news.form.selectCategory', 'Select a category')}</option>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('news.form.authorLabel', 'Author / Byline')}</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder={t('news.form.authorPlaceholder', 'e.g. Adcc Club')}
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('news.form.publishDateLabel', 'Publish Date')}</label>
              <input
                type="date"
                value={form.publishedAt}
                onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <p className="text-xs mt-1" style={{ color: '#999' }}>
                {t('news.form.publishDateHint', "Leave blank to use today's date when publishing.")}
              </p>
            </div>
          </div>

          {/* Featured image */}
          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-4">
            <h3 className="text-lg" style={{ color: '#333' }}>{t('news.form.imageSection', 'Featured Image')}</h3>
            {coverImagePreview ? (
              <div className="relative">
                <img src={coverImagePreview} alt="" className="w-full h-40 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImageFile(null);
                    setCoverImagePreview('');
                  }}
                  className="absolute top-2 end-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300">
                <ImageIcon className="w-8 h-8" />
                <span className="text-sm">{t('news.form.uploadImage', 'Upload featured image')}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-3">
            <button
              disabled={isSubmitting}
              onClick={() => submit('Published')}
              className="w-full px-6 py-3 rounded-xl text-white transition-all hover:shadow-lg disabled:opacity-60"
              style={{ backgroundColor: '#C12D32' }}
            >
              {t('news.form.publishButton', 'Publish')}
            </button>
            <button
              disabled={isSubmitting}
              onClick={() => submit('Draft')}
              className="w-full px-6 py-3 rounded-xl border border-gray-200 transition-all hover:bg-gray-50 disabled:opacity-60"
              style={{ color: '#333' }}
            >
              {t('news.form.saveDraftButton', 'Save as Draft')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
