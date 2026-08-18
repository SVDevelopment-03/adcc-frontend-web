import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Search,
  Newspaper,
  Edit,
  Eye,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Send,
  FileEdit,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getAdminNews,
  deleteNews as deleteNewsApi,
  updateNews as updateNewsApi,
  type NewsItem,
  type NewsStatus,
} from '../../services/newsApi';
import { useNewsCategories } from '../../hooks/useLookups';
import { CardSkeleton } from '../ui/skeleton';
import { ConfirmDialog } from '../ui/ConfirmDialog';

const TABS: Array<{ key: '' | NewsStatus; labelKey: string; fallback: string }> = [
  { key: '', labelKey: 'news.list.tabs.all', fallback: 'All' },
  { key: 'Draft', labelKey: 'news.list.tabs.draft', fallback: 'Draft' },
  { key: 'Published', labelKey: 'news.list.tabs.published', fallback: 'Published' },
  { key: 'Trash', labelKey: 'news.list.tabs.trash', fallback: 'Trash' },
];

const NEWS_PAGE_SIZE = 10;

export function NewsList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { options: categoryOptions } = useNewsCategories();

  const [items, setItems] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<'' | NewsStatus>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const load = async () => {
    try {
      setIsLoading(true);
      const { items: fetched, pagination } = await getAdminNews({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        q: searchTerm || undefined,
        page,
        limit: NEWS_PAGE_SIZE,
      });
      setItems(fetched);
      setTotal(pagination.total);
      setTotalPages(pagination.pages);
    } catch (error: any) {
      toast.error(error?.message || t('news.list.toasts.loadError', 'Failed to load news'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter, page]);

  const runSearch = () => {
    setPage(1);
    load();
  };

  const handleStatusChange = async (id: string, status: NewsStatus) => {
    try {
      await updateNewsApi(id, { status });
      toast.success(t('news.list.toasts.statusUpdated', 'News status updated'));
      load();
    } catch (error: any) {
      toast.error(error?.message || t('news.list.toasts.statusError', 'Failed to update status'));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteNewsApi(deleteTarget);
      toast.success(t('news.list.toasts.deleteSuccess', 'News article deleted'));
      setItems((prev) => prev.filter((item) => (item.id || item._id) !== deleteTarget));
    } catch (error: any) {
      toast.error(error?.message || t('news.list.toasts.deleteError', 'Failed to delete'));
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const statusColor = (status: NewsStatus) =>
    status === 'Published' ? '#10B981' : status === 'Draft' ? '#6B7280' : '#EF4444';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('news.list.title', 'News')}</h1>
          <p style={{ color: '#666' }}>{t('news.list.subtitle', 'Manage club news articles and blog posts')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/static-data?type=news_category')}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 transition-all hover:bg-gray-50"
            style={{ color: '#666' }}
          >
            {t('news.list.manageCategories', 'Manage Categories')}
          </button>
          <button
            onClick={() => navigate('/news/create')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all hover:shadow-lg"
            style={{ backgroundColor: '#C12D32' }}
          >
            <Plus className="w-5 h-5" />
            {t('news.list.createButton', 'New Article')}
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white shadow-sm w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatusFilter(tab.key);
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl text-sm transition-all"
            style={{
              backgroundColor: statusFilter === tab.key ? '#C12D32' : 'transparent',
              color: statusFilter === tab.key ? '#fff' : '#666',
            }}
          >
            {t(tab.labelKey, tab.fallback)}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="p-6 rounded-2xl shadow-sm bg-white space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
            <input
              type="text"
              placeholder={t('news.list.searchPlaceholder', 'Search articles')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="">{t('news.list.allCategories', 'All Categories')}</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button
            onClick={runSearch}
            className="px-6 py-2 rounded-lg text-white transition-all hover:shadow-md"
            style={{ backgroundColor: '#C12D32' }}
          >
            {t('news.list.search', 'Search')}
          </button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => {
            const id = item.id || item._id || '';
            return (
              <div key={id} className="p-6 rounded-2xl shadow-sm bg-white hover:shadow-md transition-all">
                <div className="flex items-start gap-6">
                  <img
                    src={item.coverImage || '/img/image 306912.png'}
                    alt={item.title}
                    className="w-32 h-32 rounded-lg object-cover shrink-0"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = '/img/image 306912.png';
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-xl truncate" style={{ color: '#333' }}>{item.title}</h3>
                      <span
                        className="px-3 py-1 rounded-full text-xs text-white shrink-0"
                        style={{ backgroundColor: statusColor(item.status) }}
                      >
                        {t(`news.list.tabs.${item.status.toLowerCase()}`, item.status)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      {item.category && (
                        <span
                          className="px-3 py-1 rounded-full text-xs text-white"
                          style={{ backgroundColor: '#435974' }}
                        >
                          {item.category}
                        </span>
                      )}
                      <span className="text-sm" style={{ color: '#666' }}>
                        {t('news.list.by', 'By')} {item.author || item.createdBy?.fullName || t('news.list.unknownAuthor', 'ADCC Club')}
                      </span>
                      <span className="text-sm" style={{ color: '#666' }}>|</span>
                      <span className="text-sm" style={{ color: '#666' }}>
                        {item.publishedAt
                          ? new Date(item.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                          : t('news.list.notPublished', 'Not published yet')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => navigate(`/news/${id}/edit`)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:shadow-md"
                        style={{ backgroundColor: '#E5E7EB', color: '#333' }}
                      >
                        <Edit className="w-4 h-4" />
                        {t('news.list.actions.edit', 'Edit')}
                      </button>

                      {item.status === 'Published' && (
                        <a
                          href={`/news/${id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:shadow-md"
                          style={{ backgroundColor: '#ECC180', color: '#333' }}
                        >
                          <Eye className="w-4 h-4" />
                          {t('news.list.actions.view', 'View')}
                        </a>
                      )}

                      {item.status !== 'Published' && item.status !== 'Trash' && (
                        <button
                          onClick={() => handleStatusChange(id, 'Published')}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:shadow-md"
                          style={{ backgroundColor: '#D1FAE5', color: '#059669' }}
                        >
                          <Send className="w-4 h-4" />
                          {t('news.list.actions.publish', 'Publish')}
                        </button>
                      )}

                      {item.status === 'Published' && (
                        <button
                          onClick={() => handleStatusChange(id, 'Draft')}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:shadow-md"
                          style={{ backgroundColor: '#E5E7EB', color: '#333' }}
                        >
                          <FileEdit className="w-4 h-4" />
                          {t('news.list.actions.unpublish', 'Unpublish')}
                        </button>
                      )}

                      {item.status !== 'Trash' ? (
                        <button
                          onClick={() => handleStatusChange(id, 'Trash')}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:shadow-md"
                          style={{ backgroundColor: '#FEE2E2', color: '#C12D32' }}
                        >
                          <Trash2 className="w-4 h-4" />
                          {t('news.list.actions.trash', 'Move to Trash')}
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStatusChange(id, 'Draft')}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:shadow-md"
                            style={{ backgroundColor: '#E5E7EB', color: '#333' }}
                          >
                            <RotateCcw className="w-4 h-4" />
                            {t('news.list.actions.restore', 'Restore')}
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTarget(id);
                              setShowDeleteModal(true);
                            }}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:shadow-md"
                            style={{ backgroundColor: '#FEE2E2', color: '#C12D32' }}
                          >
                            <Trash2 className="w-4 h-4" />
                            {t('news.list.actions.deleteForever', 'Delete Permanently')}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="p-12 rounded-2xl bg-white text-center">
              <Newspaper className="w-16 h-16 mx-auto mb-4" style={{ color: '#CCC' }} />
              <p className="text-lg mb-2" style={{ color: '#666' }}>{t('news.list.empty', 'No news articles yet')}</p>
              <p className="text-sm" style={{ color: '#999' }}>{t('news.list.emptyHint', 'Create your first article to get started.')}</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 rounded-2xl shadow-sm bg-white">
          <span className="text-sm" style={{ color: '#666' }}>
            {t('news.list.pagination.showing', {
              from: (page - 1) * NEWS_PAGE_SIZE + 1,
              to: Math.min(page * NEWS_PAGE_SIZE, total),
              total,
              defaultValue: `Showing ${(page - 1) * NEWS_PAGE_SIZE + 1}-${Math.min(page * NEWS_PAGE_SIZE, total)} of ${total}`,
            })}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 transition-colors disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" style={{ color: '#666' }} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | string)[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                typeof p === 'string' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-sm" style={{ color: '#999' }}>...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-9 h-9 rounded-lg text-sm transition-colors"
                    style={{
                      backgroundColor: page === p ? '#C12D32' : 'transparent',
                      color: page === p ? '#fff' : '#666',
                    }}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 transition-colors disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" style={{ color: '#666' }} />
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
        onConfirm={confirmDelete}
        title={t('news.list.deleteModal.title', 'Delete News Article') + '?'}
        message={t('news.list.deleteModal.message', 'This will permanently delete the article. This action cannot be undone.')}
        confirmLabel={t('news.list.deleteModal.confirm', 'Delete')}
        cancelLabel={t('common.cancel', 'Cancel')}
        icon={Trash2}
        iconBgColor="#FEE2E2"
        iconColor="#EF4444"
        confirmBgColor="#EF4444"
      />
    </div>
  );
}
