import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, ChevronLeft, ChevronRight, CheckCircle2, MailOpen, Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  getContactMessages,
  exportContactMessagesCsv,
  updateContactMessageStatus,
  type ContactMessage,
  type ContactMessageStatus,
} from '../../services/contactMessagesApi';

const TABS: Array<{ key: '' | ContactMessageStatus; labelKey: string; fallback: string }> = [
  { key: '', labelKey: 'contactMessages.tabs.all', fallback: 'All' },
  { key: 'New', labelKey: 'contactMessages.tabs.new', fallback: 'New' },
  { key: 'Read', labelKey: 'contactMessages.tabs.read', fallback: 'Read' },
  { key: 'Resolved', labelKey: 'contactMessages.tabs.resolved', fallback: 'Resolved' },
];

const PAGE_SIZE = 10;

const statusColor = (status: ContactMessageStatus) =>
  status === 'New' ? '#C12D32' : status === 'Read' ? '#1A73E8' : '#10B981';

export function ContactMessagesList() {
  const { t } = useTranslation();

  const [items, setItems] = useState<ContactMessage[]>([]);
  const [newCount, setNewCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'' | ContactMessageStatus>('');
  const [page, setPage] = useState(1);

  const load = async () => {
    try {
      setIsLoading(true);
      const { items: fetched, newCount: fetchedNewCount, pagination } = await getContactMessages({
        status: statusFilter || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setItems(fetched);
      setNewCount(fetchedNewCount);
      setTotal(pagination.total);
      setTotalPages(pagination.pages);
    } catch (error: any) {
      toast.error(error?.message || t('contactMessages.loadError', 'Failed to load contact messages'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  const handleExport = async () => {
    try {
      const blob = await exportContactMessagesCsv({ status: statusFilter || undefined });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contact_messages_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error(t('contactMessages.exportError', 'Failed to export contact messages'));
    }
  };

  const handleStatusChange = async (id: string, status: ContactMessageStatus) => {
    try {
      await updateContactMessageStatus(id, status);
      setItems((prev) => prev.map((m) => (m._id === id ? { ...m, status } : m)));
      if (status !== 'New') setNewCount((c) => Math.max(0, c - 1));
    } catch (error: any) {
      toast.error(error?.message || t('contactMessages.statusError', 'Failed to update status'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>
            {t('sidebar.contactMessages', 'Contact Messages')}
          </h1>
          <p style={{ color: '#666' }}>
            {t('contactMessages.subtitle', 'Enquiries submitted through the public Contact Us form')}
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 transition-all hover:bg-gray-50"
          style={{ color: '#666' }}
        >
          <Download className="w-4 h-4" />
          {t('contactMessages.exportButton', 'Export CSV')}
        </button>
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
            style={{
              backgroundColor: statusFilter === tab.key ? '#C12D32' : 'transparent',
              color: statusFilter === tab.key ? '#fff' : '#666',
            }}
          >
            {t(tab.labelKey, tab.fallback)}
            {tab.key === 'New' && newCount > 0 && (
              <span
                className="px-1.5 py-0.5 rounded-full text-xs"
                style={{
                  backgroundColor: statusFilter === tab.key ? 'rgba(255,255,255,0.25)' : '#FEE2E2',
                  color: statusFilter === tab.key ? '#fff' : '#C12D32',
                }}
              >
                {newCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="p-12 rounded-2xl bg-white text-center" style={{ color: '#999' }}>
          {t('common.loading', 'Loading...')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <div key={item._id} className="p-6 rounded-2xl shadow-sm bg-white">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className="text-lg" style={{ color: '#333' }}>{item.firstName}</h3>
                    <span
                      className="px-3 py-1 rounded-full text-xs text-white shrink-0"
                      style={{ backgroundColor: statusColor(item.status) }}
                    >
                      {t(`contactMessages.tabs.${item.status.toLowerCase()}`, item.status)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" style={{ color: '#666' }}>
                    <a href={`mailto:${item.email}`} className="flex items-center gap-1.5 hover:underline">
                      <Mail className="w-3.5 h-3.5" /> {item.email}
                    </a>
                    {item.phone && (
                      <a href={`tel:${item.phone.replace(/\s+/g, '')}`} className="flex items-center gap-1.5 hover:underline">
                        <Phone className="w-3.5 h-3.5" /> {item.phone}
                      </a>
                    )}
                  </div>
                </div>
                <span className="text-xs shrink-0" style={{ color: '#999' }}>
                  {new Date(item.createdAt).toLocaleString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <p className="mt-4 text-sm whitespace-pre-wrap" style={{ color: '#333' }}>
                {item.message}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {item.status !== 'Read' && (
                  <button
                    onClick={() => handleStatusChange(item._id, 'Read')}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:shadow-md"
                    style={{ backgroundColor: '#E8F0FE', color: '#1A73E8' }}
                  >
                    <MailOpen className="w-4 h-4" />
                    {t('contactMessages.actions.markRead', 'Mark as Read')}
                  </button>
                )}
                {item.status !== 'Resolved' && (
                  <button
                    onClick={() => handleStatusChange(item._id, 'Resolved')}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:shadow-md"
                    style={{ backgroundColor: '#D1FAE5', color: '#059669' }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {t('contactMessages.actions.markResolved', 'Mark as Resolved')}
                  </button>
                )}
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="p-12 rounded-2xl bg-white text-center">
              <Mail className="w-16 h-16 mx-auto mb-4" style={{ color: '#CCC' }} />
              <p className="text-lg" style={{ color: '#666' }}>
                {t('contactMessages.empty', 'No contact messages yet')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 rounded-2xl shadow-sm bg-white">
          <span className="text-sm" style={{ color: '#666' }}>
            {t('contactMessages.pagination.showing', {
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
