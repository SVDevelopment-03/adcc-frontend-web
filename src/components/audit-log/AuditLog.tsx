import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, History, Search } from 'lucide-react';
import { toast } from 'sonner';
import { getAuditLogActions, getAuditLogs, type AuditLogEntry } from '../../services/auditLogApi';

const PAGE_SIZE = 25;

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
  'event.delete': 'Deleted event',
  'event.status.update': 'Changed event status',
  'event.participant.no_show': 'Marked participant no-show',
  'event.participant.remove': 'Removed event participant',
};

function actionLabel(action: string): string {
  return ACTION_LABELS[action] || action;
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

export function AuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAuditLogs({
        page,
        limit: PAGE_SIZE,
        action: actionFilter || undefined,
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
  }, [page, actionFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    getAuditLogActions()
      .then(setActions)
      .catch(() => setActions([]));
  }, []);

  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((entry) => {
      const actor = actorLabel(entry).toLowerCase();
      const target = (entry.targetLabel || '').toLowerCase();
      return actor.includes(q) || target.includes(q);
    });
  }, [logs, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-1" style={{ color: '#333' }}>Audit Log</h1>
        <p style={{ color: '#666' }}>History of admin actions — roles, permissions, users, and events</p>
      </div>

      <div className="p-4 rounded-2xl shadow-sm bg-white flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#999' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor or target..."
            className="w-full pl-10 h-11 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
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

      <div className="rounded-2xl shadow-sm bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#C12D32' }} />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-10 h-10 mx-auto mb-3" style={{ color: '#CCC' }} />
            <p style={{ color: '#666' }}>No audit log entries found.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {['When', 'Actor', 'Action', 'Target'].map((h) => (
                  <th key={h} className="py-3 px-4 text-left text-sm font-medium" style={{ color: '#666' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((entry) => (
                <tr key={entry._id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm whitespace-nowrap" style={{ color: '#666' }}>
                    {formatDateTime(entry.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#333' }}>{actorLabel(entry)}</td>
                  <td className="py-3 px-4">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium inline-block"
                      style={{ backgroundColor: '#F3F0FF', color: '#7C3AED' }}
                    >
                      {actionLabel(entry.action)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#333' }}>
                    {entry.targetLabel || '—'}
                    {entry.targetType ? (
                      <span className="ml-1 text-xs" style={{ color: '#999' }}>({entry.targetType})</span>
                    ) : null}
                  </td>
                </tr>
              ))}
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
