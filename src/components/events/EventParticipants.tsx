import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search, Download, UserX, Check, X } from 'lucide-react';
import {
  getEventResults,
  checkInParticipant,
  markParticipantNoShow,
  checkInAllParticipants,
  markAllParticipantsNoShow,
  removeEventParticipant,
  exportEventResultsCsv,
} from '../../services/eventsApi';
import { toast } from 'sonner';
import { UserRole } from '../../App';

interface EventParticipantsProps {
  navigate?: (page: string, params?: any) => void;
  role: UserRole;
}

export function EventParticipants({ role }: EventParticipantsProps) {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [participantsData, setParticipantsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState<'checkin' | 'noshow' | null>(null);

  const normalizeStatus = (s: string | undefined) => {
    if (!s) return 'registered';
    return String(s).toLowerCase().replace(/_/g, '-');
  };

  const mapResultsFromBackend = (resultsData: any[]) =>
    (Array.isArray(resultsData) ? resultsData : []).map((p: any) => ({
      id: p._id || p.id,
      userId: p.user?._id || p.userId,
      participantCode: p.participantCode || p.registrationCode || p._id || p.id,
      userName: p.user?.fullName || p.userName || '-',
      userCommunity: p.community?.title || p.user?.email || p.userCommunity || '-',
      status: normalizeStatus(p.status),
      registeredAt: p.createdAt || p.registeredAt || null,
      checkedInAt: p.checkedInAt || null,
    }));

  const fetchParticipants = useCallback(async (silent = false) => {
    if (!eventId || eventId === 'undefined') { setIsLoading(false); return; }
    try {
      if (!silent) setIsLoading(true);
      const resultsData = await getEventResults(eventId);
      setParticipantsData(mapResultsFromBackend(resultsData));
    } catch {
      toast.error('Failed to load event participants');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => { fetchParticipants(); }, [fetchParticipants]);

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-white">
        <p className="text-center py-8" style={{ color: '#666' }}>Loading participants...</p>
      </div>
    );
  }

  const filteredParticipants = participantsData.filter(p => {
    const matchesSearch =
      (p.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.userCommunity || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.participantCode || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Individual actions with optimistic updates
  const handleCheckIn = async (participantId: string) => {
    const target = participantsData.find(p => p.id === participantId);
    if (!target || !target.userId || !eventId || processingIds.has(participantId)) return;
    setProcessingIds(prev => new Set([...prev, participantId]));
    setParticipantsData(prev =>
      prev.map(p => p.id === participantId
        ? { ...p, status: 'checked-in', checkedInAt: new Date().toISOString() }
        : p)
    );
    try {
      await checkInParticipant(eventId, target.userId);
      toast.success('Participant checked in');
    } catch (error: any) {
      setParticipantsData(prev =>
        prev.map(p => p.id === participantId ? { ...p, status: target.status, checkedInAt: target.checkedInAt } : p)
      );
      toast.error(error?.response?.data?.message || 'Failed to check in participant');
    } finally {
      setProcessingIds(prev => { const s = new Set(prev); s.delete(participantId); return s; });
      fetchParticipants(true);
    }
  };

  const handleMarkNoShow = async (participantId: string) => {
    const target = participantsData.find(p => p.id === participantId);
    if (!target || !target.userId || !eventId || processingIds.has(participantId)) return;
    setProcessingIds(prev => new Set([...prev, participantId]));
    setParticipantsData(prev =>
      prev.map(p => p.id === participantId ? { ...p, status: 'no-show' } : p)
    );
    try {
      await markParticipantNoShow(eventId, target.userId);
      toast.success('Marked as no-show');
    } catch (error: any) {
      setParticipantsData(prev =>
        prev.map(p => p.id === participantId ? { ...p, status: target.status } : p)
      );
      toast.error(error?.response?.data?.message || 'Failed to mark no-show');
    } finally {
      setProcessingIds(prev => { const s = new Set(prev); s.delete(participantId); return s; });
      fetchParticipants(true);
    }
  };

  const handleRemoveParticipant = async (participantId: string, userName: string) => {
    if (!eventId) return;
    if (!confirm(`Remove ${userName} from this event?`)) return;
    const target = participantsData.find(p => p.id === participantId);
    if (!target?.userId) return;
    setParticipantsData(prev => prev.filter(p => p.id !== participantId));
    try {
      await removeEventParticipant(eventId, target.userId);
      toast.success('Participant removed');
    } catch (error: any) {
      setParticipantsData(prev => [...prev, target]);
      toast.error(error?.response?.data?.message || 'Failed to remove participant');
    } finally {
      fetchParticipants(true);
    }
  };

  const handleExportCSV = async () => {
    if (!eventId || eventId === 'undefined') { toast.error('Invalid event'); return; }
    try {
      const blob = await exportEventResultsCsv(eventId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `event-${eventId}-results.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Export started');
    } catch {
      toast.error('Failed to export results');
    }
  };

  // Bulk actions with optimistic updates — affect ALL participants
  const handleCheckInAll = async () => {
    if (!eventId || bulkLoading) return;
    setBulkLoading('checkin');
    const now = new Date().toISOString();
    setParticipantsData(prev =>
      prev.map(p =>
        p.status !== 'completed'
          ? { ...p, status: 'checked-in', checkedInAt: now }
          : p
      )
    );
    try {
      await checkInAllParticipants(eventId);
      toast.success('All participants checked in');
    } catch (error: any) {
      await fetchParticipants(true);
      toast.error(error?.response?.data?.message || 'Failed to check in all participants');
    } finally {
      setBulkLoading(null);
      fetchParticipants(true);
    }
  };

  const handleNoShowAll = async () => {
    if (!eventId || bulkLoading) return;
    setBulkLoading('noshow');
    setParticipantsData(prev =>
      prev.map(p =>
        p.status !== 'completed'
          ? { ...p, status: 'no-show' }
          : p
      )
    );
    try {
      await markAllParticipantsNoShow(eventId);
      toast.success('All participants marked as no-show');
    } catch (error: any) {
      await fetchParticipants(true);
      toast.error(error?.response?.data?.message || 'Failed to mark all no-show');
    } finally {
      setBulkLoading(null);
      fetchParticipants(true);
    }
  };

  const stats = {
    total: participantsData.length,
    registered: participantsData.filter(p => p.status === 'registered' || p.status === 'joined').length,
    checkedIn: participantsData.filter(p => p.status === 'checked-in').length,
    completed: participantsData.filter(p => p.status === 'completed').length,
    noShow: participantsData.filter(p => p.status === 'no-show').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/events/${eventId}`)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Participant Management</h1>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all hover:shadow-md"
          style={{ backgroundColor: '#ECC180', color: '#333' }}
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, color: '#333' },
          { label: 'Registered', value: stats.registered, color: '#3B82F6' },
          { label: 'Checked In', value: stats.checkedIn, color: '#10B981' },
          { label: 'Completed', value: stats.completed, color: '#F59E0B' },
          { label: 'No-Show', value: stats.noShow, color: '#EF4444' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl bg-white shadow-sm">
            <p className="text-sm mb-1" style={{ color: '#666' }}>{s.label}</p>
            <p className="text-2xl" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="p-6 rounded-2xl bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
            <input
              type="text"
              placeholder="Search by name or community..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
              style={{ color: '#333' }}
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
              style={{ color: '#333' }}
            >
              <option value="">All Status</option>
              <option value="registered">Registered</option>
              <option value="checked-in">Checked In</option>
              <option value="completed">Completed</option>
              <option value="no-show">No-Show</option>
            </select>
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
              className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              style={{ color: '#666' }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="rounded-2xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#666' }}>Participant ID</th>
              <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#666' }}>Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#666' }}>Community</th>
              <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#666' }}>Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#666' }}>Registered At</th>
              <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#666' }}>Checked In</th>
              <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: '#666' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredParticipants.map(participant => {
              const isCheckedIn = participant.status === 'checked-in';
              const isNoShow = participant.status === 'no-show';
              const isCompleted = participant.status === 'completed';
              const isProcessing = processingIds.has(participant.id);

              return (
                <tr key={participant.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-sm" style={{ color: '#333' }}>{participant.participantCode || participant.id || '-'}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#333' }}>{participant.userName}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#666' }}>{participant.userCommunity}</td>
                  <td className="py-3 px-2">
                    <span
                      className="px-2 py-1 rounded-full text-xs capitalize text-white"
                      style={{
                        backgroundColor:
                          isCheckedIn ? '#10B981' :
                          isNoShow ? '#EF4444' :
                          isCompleted ? '#F59E0B' : '#3B82F6',
                      }}
                    >
                      {participant.status || 'registered'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#666' }}>
                    {participant.registeredAt ? new Date(participant.registeredAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#666' }}>
                    {participant.checkedInAt ? new Date(participant.checkedInAt).toLocaleString() : '-'}
                  </td>

                  {/* Actions — always visible, disabled when already in that state */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* Check-in: disabled if already checked-in or completed */}
                      <button
                        onClick={() => handleCheckIn(participant.id)}
                        disabled={isProcessing || isCheckedIn || isCompleted}
                        className="p-2 rounded-lg transition-colors hover:bg-green-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        title={isCheckedIn ? 'Already checked in' : isCompleted ? 'Completed' : 'Check In'}
                      >
                        <Check className="w-4 h-4" style={{ color: '#10B981' }} />
                      </button>

                      {/* No-show: disabled if already no-show or completed */}
                      <button
                        onClick={() => handleMarkNoShow(participant.id)}
                        disabled={isProcessing || isNoShow || isCompleted}
                        className="p-2 rounded-lg transition-colors hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        title={isNoShow ? 'Already no-show' : isCompleted ? 'Completed' : 'Mark No-Show'}
                      >
                        <X className="w-4 h-4" style={{ color: '#EF4444' }} />
                      </button>

                      <button
                        onClick={() => handleRemoveParticipant(participant.id, participant.userName)}
                        className="p-2 rounded-lg transition-colors hover:bg-red-50"
                        title="Remove Participant"
                      >
                        <UserX className="w-4 h-4" style={{ color: '#EF4444' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredParticipants.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm" style={{ color: '#999' }}>
                  No participants found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Actions */}
      {participantsData.length > 0 && (
        <div className="p-6 rounded-2xl bg-white shadow-sm">
          <h3 className="text-lg mb-4" style={{ color: '#333' }}>Bulk Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCheckInAll}
              disabled={bulkLoading === 'checkin'}
              className="px-4 py-2 rounded-lg transition-all hover:shadow-md disabled:opacity-50"
              style={{ backgroundColor: '#10B981', color: '#fff' }}
            >
              {bulkLoading === 'checkin' ? 'Checking in…' : 'Check In All Registered'}
            </button>
            <button
              onClick={handleNoShowAll}
              disabled={bulkLoading === 'noshow'}
              className="px-4 py-2 rounded-lg transition-all hover:shadow-md disabled:opacity-50"
              style={{ backgroundColor: '#EF4444', color: '#fff' }}
            >
              {bulkLoading === 'noshow' ? 'Marking…' : 'Mark All No-Show'}
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-lg transition-all hover:shadow-md"
              style={{ backgroundColor: '#ECC180', color: '#333' }}
            >
              Export Filtered List
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
