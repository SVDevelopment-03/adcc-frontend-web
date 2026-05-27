import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, ChevronLeft, ChevronRight, Eye, UserX, MapPin, Calendar,
  X, Activity, Users, Trophy, Award, CircleX,
} from 'lucide-react';
import { getAllUsers, updateUserVerified, User } from '../../services/usersApi';

const PAGE_SIZE = 10;
const FETCH_LIMIT = 100; // backend caps at 100

function formatDate(iso: string | null | undefined) {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatShortDate(iso: string | null | undefined) {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className="px-3 py-1 rounded-lg text-xs font-medium"
      style={active
        ? { backgroundColor: '#D1FAE5', color: '#10B981' }
        : { backgroundColor: '#FEE2E2', color: '#EF4444' }}
    >
      {active ? 'Active' : 'Suspended'}
    </span>
  );
}

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onSuspend: (user: User) => void;
}

function ProfileModal({ user, onClose, onSuspend }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'communities' | 'challenges' | 'activity'>('overview');
  const tabs = ['overview', 'events', 'communities', 'challenges', 'activity'] as const;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <img
                src={user.profileImage || `https://i.pravatar.cc/150?u=${user.id}`}
                alt={user.fullName}
                className="w-20 h-20 rounded-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?u=${user.id}`; }}
              />
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl" style={{ color: '#333' }}>{user.fullName}</h2>
                  <StatusBadge active={user.isVerified} />
                </div>
                {user.email && <p className="text-sm mb-1" style={{ color: '#666' }}>{user.email}</p>}
                {user.phone && <p className="text-sm mb-2" style={{ color: '#666' }}>{user.phone}</p>}
                {user.country && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: '#999' }}>
                    <MapPin className="w-3 h-3" />
                    {user.country}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" style={{ color: '#666' }} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: <Calendar className="w-4 h-4" style={{ color: '#C12D32' }} />, label: 'Events', value: user.stats.totalEventsParticipated },
              { icon: <Users className="w-4 h-4" style={{ color: '#3B82F6' }} />, label: 'Communities', value: 0 },
              { icon: <Trophy className="w-4 h-4" style={{ color: '#F59E0B' }} />, label: 'Challenges', value: 0 },
              { icon: <Activity className="w-4 h-4" style={{ color: '#10B981' }} />, label: 'Tracks', value: user.stats.completedCount },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                <div className="flex items-center gap-2 mb-1">
                  {s.icon}
                  <p className="text-xs" style={{ color: '#666' }}>{s.label}</p>
                </div>
                <p className="text-xl font-medium" style={{ color: '#333' }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="py-3 text-sm font-medium border-b-2 transition-colors capitalize"
                style={activeTab === tab
                  ? { borderColor: '#C12D32', color: '#C12D32' }
                  : { borderColor: 'transparent', color: '#666' }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3" style={{ color: '#333' }}>Account Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#666' }}>Joined Date</p>
                    <p className="font-medium" style={{ color: '#333' }}>{formatDate(user.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#666' }}>Gender</p>
                    <p className="font-medium" style={{ color: '#333' }}>{user.gender || 'N/A'}</p>
                  </div>
                  {user.country && (
                    <div>
                      <p className="text-sm mb-1" style={{ color: '#666' }}>Country</p>
                      <p className="font-medium" style={{ color: '#333' }}>{user.country}</p>
                    </div>
                  )}
                  {user.age !== null && (
                    <div>
                      <p className="text-sm mb-1" style={{ color: '#666' }}>Age</p>
                      <p className="font-medium" style={{ color: '#333' }}>{user.age}</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3" style={{ color: '#333' }}>Activity Summary</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Total Events Participated', value: `${user.stats.totalEventsParticipated} events` },
                    { label: 'Tracks Completed', value: `${user.stats.completedCount} tracks` },
                    { label: 'Total Points', value: `${user.stats.totalPoints} pts` },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: '#F9FAFB' }}>
                      <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4" style={{ color: '#666' }} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#333' }}>{item.label}</p>
                          <p className="text-xs" style={{ color: '#999' }}>{item.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab !== 'overview' && (
            <div className="flex items-center justify-center h-32" style={{ color: '#999' }}>
              No data available yet.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex gap-3">
            <button
              className="flex-1 inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
              style={{ color: '#333' }}
            >
              <Award className="w-4 h-4" />
              Assign Role
            </button>
            <button
              onClick={() => onSuspend(user)}
              className="flex-1 inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium transition-colors"
              style={{ backgroundColor: '#EF4444', color: 'white' }}
            >
              <CircleX className="w-4 h-4" />
              {user.isVerified ? 'Suspend User' : 'Activate User'}
            </button>
          </div>
        </div>
      </div>
    </div>
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

export function UsersList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const genderFromUrl = searchParams.get('gender') as 'Male' | 'Female' | null;

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Male' | 'Female'>(
    genderFromUrl === 'Male' ? 'Male' : genderFromUrl === 'Female' ? 'Female' : 'all'
  );
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Sync gender filter from URL on mount
  useEffect(() => {
    const g = searchParams.get('gender');
    if (g === 'Male' || g === 'Female') setGenderFilter(g);
    else setGenderFilter('all');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = useCallback(async (gender: 'all' | 'Male' | 'Female') => {
    try {
      setLoading(true);
      setError(null);
      const genderParam = gender === 'all' ? undefined : gender;
      const { users } = await getAllUsers(1, FETCH_LIMIT, undefined, genderParam);
      setAllUsers(users);
    } catch (err: any) {
      setError(err?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers(genderFilter);
  }, [genderFilter, fetchUsers]);

  const handleGenderTab = (g: 'all' | 'Male' | 'Female') => {
    setGenderFilter(g);
    setPage(1);
    setStatusFilter('all');
    setSearch('');
    if (g === 'all') searchParams.delete('gender');
    else searchParams.set('gender', g);
    setSearchParams(searchParams);
  };

  const handleSuspendToggle = async (user: User) => {
    const newStatus = !user.isVerified;
    // Optimistic update
    setAllUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isVerified: newStatus } : u)));
    if (selectedUser?.id === user.id) {
      setSelectedUser((s) => s ? { ...s, isVerified: newStatus } : s);
    }
    try {
      await updateUserVerified(user.id, newStatus);
    } catch (err) {
      // Revert on error
      setAllUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isVerified: user.isVerified } : u)));
      if (selectedUser?.id === user.id) {
        setSelectedUser((s) => s ? { ...s, isVerified: user.isVerified } : s);
      }
      console.error('Failed to update user status:', err);
    }
  };

  // Client-side filtering
  const filteredUsers = allUsers.filter((u) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' ? u.isVerified : !u.isVerified);
    return matchesSearch && matchesStatus;
  });

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats from all fetched users
  const stats = {
    total: allUsers.length,
    active: allUsers.filter((u) => u.isVerified).length,
    suspended: allUsers.filter((u) => !u.isVerified).length,
  };

  const genderLabel = genderFilter === 'Male' ? 'Male ' : genderFilter === 'Female' ? 'Female ' : '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-1" style={{ color: '#333' }}>Users</h1>
        <p style={{ color: '#666' }}>
          {genderFilter === 'all' ? 'All registered members' : `${genderFilter} members`}
        </p>
      </div>

      {/* Gender Tabs */}
      <div className="flex gap-2">
        {(['all', 'Male', 'Female'] as const).map((g) => (
          <button
            key={g}
            onClick={() => handleGenderTab(g)}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={genderFilter === g
              ? { backgroundColor: '#C12D32', color: 'white' }
              : { backgroundColor: 'white', color: '#666', border: '1px solid #E5E7EB' }}
          >
            {g === 'all' ? 'All Users' : `${g} Users`}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <StatWidget label={`Total ${genderLabel}Users`} value={loading ? '—' : stats.total} color="#333" />
        <StatWidget label="Active Users" value={loading ? '—' : stats.active} color="#10B981" />
        <StatWidget label="Suspended Users" value={loading ? '—' : stats.suspended} color="#EF4444" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#999' }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-300"
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
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* User Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#C12D32' }} />
        </div>
      ) : error ? (
        <div className="text-center py-8" style={{ color: '#C12D32' }}>{error}</div>
      ) : (
        <div className="space-y-4">
          {pagedUsers.map((user) => (
            <div key={user.id} className="p-6 rounded-2xl shadow-sm bg-white hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <img
                    src={user.profileImage || `https://i.pravatar.cc/150?u=${user.id}`}
                    alt={user.fullName}
                    className="w-16 h-16 rounded-full object-cover shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?u=${user.id}`; }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-lg" style={{ color: '#333' }}>{user.fullName}</h3>
                      <StatusBadge active={user.isVerified} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 text-sm" style={{ color: '#666' }}>
                      {user.email && <div>{user.email}</div>}
                      {user.phone && <div>{user.phone}</div>}
                      {user.country && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {user.country}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      {[
                        { label: 'Events Joined', value: user.stats.totalEventsParticipated },
                        { label: 'Communities', value: 0 },
                        { label: 'Tracks Completed', value: user.stats.completedCount },
                        { label: 'Challenges Won', value: 0 },
                      ].map((s) => (
                        <div key={s.label}>
                          <p className="text-xs mb-1" style={{ color: '#999' }}>{s.label}</p>
                          <p className="font-medium" style={{ color: '#333' }}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs" style={{ color: '#999' }}>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Joined {formatShortDate(user.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="inline-flex items-center gap-2 h-8 px-3 rounded-md text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                    style={{ color: '#333' }}
                  >
                    <Eye className="w-4 h-4" />
                    View Profile
                  </button>
                  <button
                    onClick={() => handleSuspendToggle(user)}
                    className="inline-flex items-center gap-2 h-8 px-3 rounded-md text-sm font-medium border transition-colors"
                    style={user.isVerified
                      ? { color: '#EF4444', borderColor: '#FEE2E2' }
                      : { color: '#10B981', borderColor: '#D1FAE5' }}
                  >
                    <UserX className="w-4 h-4" />
                    {user.isVerified ? 'Suspend' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {pagedUsers.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm" style={{ color: '#999' }}>
              No users found.
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm" style={{ color: '#666' }}>
            Page {page} of {totalPages}
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

      {/* Profile Modal */}
      {selectedUser && (
        <ProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuspend={(u) => { void handleSuspendToggle(u); setSelectedUser(null); }}
        />
      )}
    </div>
  );
}
