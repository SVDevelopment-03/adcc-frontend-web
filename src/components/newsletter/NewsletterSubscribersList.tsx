import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, ChevronLeft, ChevronRight, Users, Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  getNewsletterSubscribers,
  exportNewsletterSubscribersCsv,
  type NewsletterSubscriber,
} from '../../services/newsletterSubscribersApi';

const PAGE_SIZE = 20;

export function NewsletterSubscribersList() {
  const { t } = useTranslation();

  const [items, setItems] = useState<NewsletterSubscriber[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const { items: fetched, activeCount: fetchedActive, pagination } =
          await getNewsletterSubscribers({ page, limit: PAGE_SIZE });
        setItems(fetched);
        setActiveCount(fetchedActive);
        setTotal(pagination.total);
        setTotalPages(pagination.pages);
      } catch (error: any) {
        toast.error(error?.message || t('newsletter.loadError', 'Failed to load subscribers'));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [page, t]);

  const handleExport = async () => {
    try {
      const blob = await exportNewsletterSubscribersCsv();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error(t('newsletter.exportError', 'Failed to export subscribers'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>
            {t('sidebar.newsletter', 'Newsletter Subscribers')}
          </h1>
          <p style={{ color: '#666' }}>
            {t('newsletter.subtitle', 'Everyone who signed up through the site’s newsletter form')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-sm">
            <Users className="w-4 h-4" style={{ color: '#10B981' }} />
            <span className="text-sm" style={{ color: '#666' }}>
              {t('newsletter.activeCount', '{{count}} active', { count: activeCount })}
            </span>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 transition-all hover:bg-gray-50"
            style={{ color: '#666' }}
          >
            <Download className="w-4 h-4" />
            {t('newsletter.exportButton', 'Export CSV')}
          </button>
        </div>
      </div>

      <div className="rounded-2xl shadow-sm bg-white overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center" style={{ color: '#999' }}>
            {t('common.loading', 'Loading...')}
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-16 h-16 mx-auto mb-4" style={{ color: '#CCC' }} />
            <p className="text-lg" style={{ color: '#666' }}>
              {t('newsletter.empty', 'No subscribers yet')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100" style={{ color: '#666' }}>
                  <th className="text-left px-6 py-3 font-medium">{t('newsletter.columns.email', 'Email')}</th>
                  <th className="text-left px-6 py-3 font-medium">{t('newsletter.columns.source', 'Source')}</th>
                  <th className="text-left px-6 py-3 font-medium">{t('newsletter.columns.status', 'Status')}</th>
                  <th className="text-left px-6 py-3 font-medium">{t('newsletter.columns.subscribedOn', 'Subscribed On')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((sub) => (
                  <tr key={sub._id} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-3">
                      <a href={`mailto:${sub.email}`} className="hover:underline" style={{ color: '#333' }}>
                        {sub.email}
                      </a>
                    </td>
                    <td className="px-6 py-3" style={{ color: '#666' }}>{sub.source}</td>
                    <td className="px-6 py-3">
                      <span
                        className="px-3 py-1 rounded-full text-xs"
                        style={sub.isActive
                          ? { backgroundColor: '#D1FAE5', color: '#059669' }
                          : { backgroundColor: '#FEE2E2', color: '#C12D32' }}
                      >
                        {sub.isActive
                          ? t('newsletter.status.active', 'Active')
                          : t('newsletter.status.unsubscribed', 'Unsubscribed')}
                      </span>
                    </td>
                    <td className="px-6 py-3" style={{ color: '#666' }}>
                      {new Date(sub.createdAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 rounded-2xl shadow-sm bg-white">
          <span className="text-sm" style={{ color: '#666' }}>
            {t('newsletter.pagination.showing', {
              from: (page - 1) * PAGE_SIZE + 1,
              to: Math.min(page * PAGE_SIZE, total),
              total,
              defaultValue: `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} of ${total}`,
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
    </div>
  );
}
