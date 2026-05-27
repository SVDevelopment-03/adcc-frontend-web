import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ChevronLeft, ChevronRight, Mail, Phone, Calendar,
  MoreVertical, Plus, Pencil, Trash2, UserX, UserCheck,
} from 'lucide-react';
import { getAllUsers, updateUserVerified, deleteUser, User } from '../../services/usersApi';

const PAGE_SIZE = 15;
const FETCH_LIMIT = 100;

function formatDate(iso: string | null | undefined) {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  Admin: { bg: '#FFF9EF', color: '#C12D32' },
  Vendor: { bg: '#EFF6FF', color: '#3B82F6' },
  Member: { bg: '#F9FAFB', color: '#6B7280' },
};

function RoleBadge({ role }: { role: string }) {
  const style = ROLE_STYLE[role] || ROLE_STYLE.Member;
  return (
    <span className="px-3 py-1.5 rounded-lg text-xs font-medium inline-block" style={{ backgroundColor: style.bg, color: style.color }}>
      {role}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className="px-3 py-1.5 rounded-lg text-xs font-medium inline-block capitalize"
      style={active ? { backgroundColor: '#D1FAE5', color: '#10B981' } : { backgroundColor: '#FEE2E2', color: '#EF4444' }}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function StatWidget({ label, value, color = '#C12D32' }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="p-5 rounded-2xl shadow-sm bg-white">
      <p className="text-sm mb-1" style={{ color: '#999' }}>{label}</p>
      <p className="text-3xl font-medium" style={{ color }}>{value}</p>
    </div>
  );
}

// ─── Confirm Dialog ──────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  message: string;
  confirmLabel: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ message, confirmLabel, confirmColor = '#EF4444', onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <p className="text-sm mb-6" style={{ color: '#333' }}>{message}</p>
        <div className="flex gap-3">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 transition-colors"
            style={{ color: '#666' }}
          >
            Cancel
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg text-sm text-white transition-colors"
            style={{ backgroundColor: confirmColor }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Action Menu ─────────────────────────────────────────────────────────────
interface ActionMenuProps {
  user: User;
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onDelete: (user: User) => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

function ActionMenu({ user, onEdit, onToggleStatus, onDelete, isOpen, onOpen, onClose }: ActionMenuProps) {
  const menuItems = [
    {
      label: 'Edit',
      icon: <Pencil className="w-3.5 h-3.5" />,
      color: '#333',
      action: () => { onEdit(user); onClose(); },
    },
    {
      label: user.isVerified ? 'Deactivate & Logout' : 'Activate',
      icon: user.isVerified ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />,
      color: user.isVerified ? '#EF4444' : '#10B981',
      action: () => { onToggleStatus(user); onClose(); },
    },
    {
      label: 'Delete',
      icon: <Trash2 className="w-3.5 h-3.5" />,
      color: '#EF4444',
      action: () => { onDelete(user); onClose(); },
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => (isOpen ? onClose() : onOpen())}
        className="inline-flex items-center justify-center h-8 rounded-md px-3 hover:bg-gray-100 transition-colors"
        type="button"
      >
        <MoreVertical className="w-4 h-4" style={{ color: '#666' }} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={item.action}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
              style={{ color: item.color }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminsList() {
  const navigate = useNavigate();
  const [allAdmins, setAllAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Confirm dialog state
  const [confirmAction, setConfirmAction] = useState<null | {
    message: string;
    confirmLabel: string;
    confirmColor?: string;
    onConfirm: () => void;
  }>(null);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { users } = await getAllUsers(1, FETCH_LIMIT, 'Admin');
      setAllAdmins(users);
    } catch (err: any) {
      setError(err?.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchAdmins(); }, [fetchAdmins]);

  useEffect(() => {
    const handleMouseDown = () => setOpenMenuId(null);
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  // Deactivate: clears tokens on backend → forces logout
  const handleToggleStatus = (user: User) => {
    if (user.isVerified) {
      setConfirmAction({
        message: `Deactivate "${user.fullName}"? Their active sessions will be terminated and they will be logged out immediately.`,
        confirmLabel: 'Deactivate & Logout',
        confirmColor: '#EF4444',
        onConfirm: async () => {
          setConfirmAction(null);
          const newStatus = false;
          setAllAdmins((prev) => prev.map((u) => (u.id === user.id ? { ...u, isVerified: newStatus } : u)));
          try {
            await updateUserVerified(user.id, newStatus);
          } catch {
            setAllAdmins((prev) => prev.map((u) => (u.id === user.id ? { ...u, isVerified: user.isVerified } : u)));
          }
        },
      });
    } else {
      // Activate: no confirmation needed
      const newStatus = true;
      setAllAdmins((prev) => prev.map((u) => (u.id === user.id ? { ...u, isVerified: newStatus } : u)));
      updateUserVerified(user.id, newStatus).catch(() => {
        setAllAdmins((prev) => prev.map((u) => (u.id === user.id ? { ...u, isVerified: user.isVerified } : u)));
      });
    }
  };

  const handleDelete = (user: User) => {
    setConfirmAction({
      message: `Permanently delete "${user.fullName}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      confirmColor: '#EF4444',
      onConfirm: async () => {
        setConfirmAction(null);
        setAllAdmins((prev) => prev.filter((u) => u.id !== user.id));
        try {
          await deleteUser(user.id);
        } catch {
          void fetchAdmins(); // re-fetch if delete failed
        }
      },
    });
  };

  // Client-side filtering
  const filteredAdmins = allAdmins.filter((u) => {
    const s = search.toLowerCase();
    const matchesSearch = u.fullName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
    const matchesStatus =
      statusFilter === 'all' || (statusFilter === 'active' ? u.isVerified : !u.isVerified);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredAdmins.length / PAGE_SIZE));
  const pagedAdmins = filteredAdmins.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total: allAdmins.length,
    active: allAdmins.filter((u) => u.isVerified).length,
    inactive: allAdmins.filter((u) => !u.isVerified).length,
    roles: [...new Set(allAdmins.map((u) => u.role))].length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-1" style={{ color: '#333' }}>Admin Users</h1>
          <p style={{ color: '#666' }}>Manage administrators and staff accounts</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admins/create')}
          className="px-4 py-2 rounded-lg text-white flex items-center gap-2 shadow-sm"
          style={{ backgroundColor: '#C12D32' }}
        >
          <Plus className="w-4 h-4" />
          Add Admin User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatWidget label="Total Admins" value={loading ? '—' : stats.total} color="#333" />
        <StatWidget label="Active" value={loading ? '—' : stats.active} color="#10B981" />
        <StatWidget label="Inactive" value={loading ? '—' : stats.inactive} color="#EF4444" />
        <StatWidget label="Roles" value={loading ? '—' : stats.roles} color="#3B82F6" />
      </div>

      {/* Table */}
      <div className="rounded-2xl shadow-sm bg-white overflow-hidden">
        <div className="flex items-center gap-4 p-4 border-b border-gray-100">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#999' }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: '#666' }}>Status</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#C12D32' }} />
          </div>
        ) : error ? (
          <div className="text-center py-8" style={{ color: '#C12D32' }}>{error}</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {['User', 'Role', 'Contact', 'Status', 'Joined', 'Last Active', 'Actions'].map((h, i) => (
                  <th key={h} className={`py-4 px-4 text-sm font-medium ${i === 6 ? 'text-right' : 'text-left'}`} style={{ color: '#666' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedAdmins.map((admin) => (
                <tr key={admin.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={admin.profileImage || `https://i.pravatar.cc/150?u=${admin.id}`}
                        alt={admin.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?u=${admin.id}`; }}
                      />
                      <div>
                        <p className="font-medium" style={{ color: '#333' }}>{admin.fullName}</p>
                        <p className="text-sm" style={{ color: '#666' }}>{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4"><RoleBadge role={admin.role} /></td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      {admin.email && (
                        <div className="flex items-center gap-2 text-sm" style={{ color: '#666' }}>
                          <Mail className="w-3 h-3" />{admin.email}
                        </div>
                      )}
                      {admin.phone && (
                        <div className="flex items-center gap-2 text-sm" style={{ color: '#666' }}>
                          <Phone className="w-3 h-3" />{admin.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4"><StatusBadge active={admin.isVerified} /></td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#666' }}>
                      <Calendar className="w-3 h-3" />{formatDate(admin.createdAt)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm" style={{ color: '#666' }}>{formatDate(admin.createdAt)}</p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <ActionMenu
                      user={admin}
                      onEdit={(u) => navigate(`/admins/${u.id}/edit`)}
                      onToggleStatus={handleToggleStatus}
                      onDelete={handleDelete}
                      isOpen={openMenuId === admin.id}
                      onOpen={() => setOpenMenuId(admin.id)}
                      onClose={() => setOpenMenuId(null)}
                    />
                  </td>
                </tr>
              ))}
              {pagedAdmins.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm" style={{ color: '#999' }}>
                    No admin users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm" style={{ color: '#666' }}>Page {page} of {totalPages}</span>
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

      {/* Confirm Dialog */}
      {confirmAction && (
        <ConfirmDialog
          message={confirmAction.message}
          confirmLabel={confirmAction.confirmLabel}
          confirmColor={confirmAction.confirmColor}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
