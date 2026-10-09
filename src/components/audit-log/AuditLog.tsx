import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, History, Search } from 'lucide-react';
import { toast } from 'sonner';
import { getAuditLogFilters, getAuditLogs, type AuditLogEntry } from '../../services/auditLogApi';

const PAGE_SIZE = 25;
const MAX_CHANGES_SHOWN = 4;
const MAX_VALUE_LENGTH = 120;

const ACTION_LABELS: Record<string, string> = {
  'role.create': 'Created role',
  'role.update': 'Updated role',
  'role.delete': 'Deleted role',
  'role.permissions.set': 'Set role permissions',
  'role.permissions.add': 'Added permission to role',
  'role.permissions.remove': 'Removed permission from role',
  'permission.create': 'Created permission',
  'permission.update': 'Updated permission',
  'permission.delete': 'Deleted permission',
  'user.role.assign': 'Assigned role to user',
  'user.create': 'Created user',
  'user.update': 'Updated user',
  'user.delete': 'Deleted user',
  'user.verified.update': 'Changed user status',
  'user.password.update': 'Updated user password',
  'event.create': 'Created event',
  'event.update': 'Updated event',
  'event.delete': 'Moved event to Trash',
  'event.restore': 'Restored event',
  'event.delete.permanent': 'Permanently deleted event',
  'event.status.update': 'Changed event status',
  'event.close': 'Closed event',
  'event.reopen': 'Reopened event',
  'event.gallery.add': 'Added event gallery images',
  'event.gallery.remove': 'Removed event gallery images',
  'event.participant.check_in': 'Checked in participant',
  'event.participant.no_show': 'Marked participant no-show',
  'event.participant.remove': 'Removed event participant',
  'event.participant.result.update': 'Updated participant result',
  'event.participants.check_in_all': 'Checked in all participants',
  'event.participants.no_show_all': 'Marked all participants no-show',
  'community.create': 'Created community',
  'community.update': 'Updated community',
  'community.status.update': 'Changed community status',
  'community.feature.update': 'Changed community featured flag',
  'community.delete': 'Moved community to Trash',
  'community.restore': 'Restored community',
  'community.delete.permanent': 'Permanently deleted community',
  'community.gallery.add': 'Added community gallery images',
  'community.gallery.remove': 'Removed community gallery images',
  'track.create': 'Created track',
  'track.update': 'Updated track',
  'track.status.update': 'Changed track status',
  'track.delete': 'Moved track to Trash',
  'track.restore': 'Restored track',
  'track.delete.permanent': 'Permanently deleted track',
  'track.gallery.add': 'Added track gallery images',
  'track.gallery.remove': 'Removed track gallery images',
};

/** 'registrationFeeAmount' / 'check_in' / 'community-posts' -> 'Registration fee amount' etc. */
function humanize(value: string): string {
  const text = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[._-]+/g, ' ')
    .trim()
    .toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Plain names for the modules that are logged automatically as `<module>.<create|update|delete>`. */
const MODULE_NAMES: Record<string, string> = {
  'app-config': 'app settings',
  'push-notifications': 'push notification',
  'admin-notifications': 'dashboard notification',
  challenges: 'challenge',
  badges: 'badge',
  news: 'news article',
  lookups: 'dropdown option',
  media: 'media file',
  merchandise: 'merchandise item',
  store: 'marketplace listing',
  items: 'marketplace listing',
  'feed-posts': 'feed post',
  'community-posts': 'community post',
  'community-rides': 'community ride',
  settings: 'website content',
  'app-banners': 'app banner',
  'app-banners-ar': 'app banner (Arabic)',
  'product-banners': 'store banner',
  'product-banners-ar': 'store banner (Arabic)',
  contact: 'contact message',
  'newsletter-subscriptions': 'newsletter subscriber',
  splash: 'splash screen',
  rbac: 'role or permission',
  user: 'user',
};

const VERB_LABELS: Record<string, string> = { create: 'Created', update: 'Updated', delete: 'Deleted' };

function actionLabel(action: string): string {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  if (action === 'push-notifications.create') return 'Sent push notification';
  if (action === 'admin-notifications.update') return 'Marked notification as read';

  // '<module>.<verb>' entries written by the automatic audit hook
  const [moduleKey, verb] = action.split('.');
  if (VERB_LABELS[verb] && action.split('.').length === 2) {
    return `${VERB_LABELS[verb]} ${MODULE_NAMES[moduleKey] || humanize(moduleKey).toLowerCase()}`;
  }
  return humanize(action);
}

/** Database ids mean nothing to the reader; show the record's name or nothing. */
function targetLabel(entry: AuditLogEntry): string {
  if (entry.targetLabel) return entry.targetLabel;
  const id = entry.targetId ? String(entry.targetId) : '';
  return id && !/^[a-f0-9]{24}$/i.test(id) ? id : '—';
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function actorLabel(entry: AuditLogEntry): string {
  if (entry.actorId && typeof entry.actorId === 'object') {
    return entry.actorId.fullName || entry.actorId.email || entry.actorEmail || 'Unknown';
  }
  return entry.actorEmail || 'Unknown';
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  // Older entries may hold a whole uploaded image (base64) — never print that
  if (text.startsWith('data:')) return '(uploaded image)';
  return text.length > MAX_VALUE_LENGTH ? `${text.slice(0, MAX_VALUE_LENGTH)}…` : text;
}

/** One line per thing that changed, built from the entry's metadata. */
function detailLines(entry: AuditLogEntry): string[] {
  const metadata = entry.metadata || {};
  const lines: string[] = [];

  const changes = (metadata as any).changes;
  if (Array.isArray(changes)) {
    for (const change of changes) {
      if (!change || typeof change.field !== 'string') continue;
      lines.push(`${humanize(change.field)}: ${formatValue(change.from)} → ${formatValue(change.to)}`);
    }
  }

  if ('from' in metadata || 'to' in metadata) {
    lines.push(`Status: ${formatValue((metadata as any).from)} → ${formatValue((metadata as any).to)}`);
  }

  for (const [key, value] of Object.entries(metadata)) {
    // `path` is the technical API route — not useful to the reader
    if (['changes', 'from', 'to', 'method', 'path'].includes(key)) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    lines.push(`${humanize(key)}: ${formatValue(value)}`);
  }

  return lines;
}

export function AuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // Search runs on the server (across all pages), so wait for the user to stop typing.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAuditLogs({
        page,
        limit: PAGE_SIZE,
        action: actionFilter || undefined,
        targetType: moduleFilter || undefined,
        search: search || undefined,
      });
      setLogs(result.logs);
      setTotal(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load audit log');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, moduleFilter, search]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    getAuditLogFilters()
      .then((filters) => {
        setActions(filters.actions);
        setModules(filters.modules);
      })
      .catch(() => {
        setActions([]);
        setModules([]);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-1" style={{ color: '#333' }}>Audit Log</h1>
        <p style={{ color: '#666' }}>
          History of every admin action across the dashboard — what changed, in which module, by whom, and when
        </p>
      </div>

      <div className="p-4 rounded-2xl shadow-sm bg-white flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#999' }} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by user, target or action..."
            className="w-full pl-10 h-11 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: '#666' }}>Module</span>
          <select
            value={moduleFilter}
            onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
          >
            <option value="">All modules</option>
            {modules.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: '#666' }}>Action</span>
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
          >
            <option value="">All actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>{actionLabel(a)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl shadow-sm bg-white overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#C12D32' }} />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-10 h-10 mx-auto mb-3" style={{ color: '#CCC' }} />
            <p style={{ color: '#666' }}>No audit log entries found.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {['When', 'User', 'Module', 'Action', 'Target', 'Details'].map((h) => (
                  <th key={h} className="py-3 px-4 text-left text-sm font-medium" style={{ color: '#666' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((entry) => {
                const details = detailLines(entry);
                const hidden = details.length - MAX_CHANGES_SHOWN;
                return (
                  <tr key={entry._id} className="border-b border-gray-100 align-top">
                    <td className="py-3 px-4 text-sm whitespace-nowrap" style={{ color: '#666' }}>
                      {formatDateTime(entry.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: '#333' }}>{actorLabel(entry)}</td>
                    <td className="py-3 px-4 text-sm" style={{ color: '#333' }}>{entry.targetType || '—'}</td>
                    <td className="py-3 px-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium inline-block"
                        style={{ backgroundColor: '#F3F0FF', color: '#7C3AED' }}
                      >
                        {actionLabel(entry.action)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: '#333' }}>
                      {targetLabel(entry)}
                    </td>
                    <td className="py-3 px-4 text-xs" style={{ color: '#666', maxWidth: 360 }}>
                      {details.length === 0 ? (
                        '—'
                      ) : (
                        <ul className="space-y-1">
                          {details.slice(0, MAX_CHANGES_SHOWN).map((line, index) => (
                            <li key={index} className="break-words">{line}</li>
                          ))}
                          {hidden > 0 && (
                            <li title={details.slice(MAX_CHANGES_SHOWN).join('\n')} style={{ color: '#999' }}>
                              +{hidden} more
                            </li>
                          )}
                        </ul>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm" style={{ color: '#666' }}>
              Page {page} of {totalPages} ({total} entries)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" style={{ color: '#333' }} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" style={{ color: '#333' }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
