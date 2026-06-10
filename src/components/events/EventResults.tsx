import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trophy, Save, Send, RefreshCw, AlertCircle, CheckCircle, Clock, Users, BarChart3, Download, XCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { getEventResults, adminUpdateParticipantResult, exportEventResultsCsv, getEventById } from '../../services/eventsApi';
import { toast } from 'sonner';

type RiderStatus = 'finished' | 'dnf' | 'dns';

interface ResultEntry {
  participantId: string;
  userId: string;
  userName: string;
  userCommunity: string;
  bibNumber: string;
  rank: number | null;
  time: string;
  riderStatus: RiderStatus;
  points: number;
  isDirty: boolean;
}

function parseTime(t: string): number {
  const parts = t.trim().split(':').map(Number);
  if (parts.some(isNaN)) return Infinity;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return Infinity;
}

function formatTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 6);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4)}`;
}

const BASE_POINTS = 300;

function calculatePoints(rank: number | null, status: RiderStatus): number {
  if (status !== 'finished' || rank === null) return 0;
  if (rank === 1) return BASE_POINTS;
  if (rank === 2) return Math.floor(BASE_POINTS * 0.6);
  if (rank === 3) return Math.floor(BASE_POINTS * 0.4);
  if (rank <= 10) return Math.floor(BASE_POINTS * 0.2);
  return Math.floor(BASE_POINTS * 0.1);
}

export function EventResults() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [eventTitle, setEventTitle] = useState('');
  const [results, setResults] = useState<ResultEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [sortCol, setSortCol] = useState<'rank' | 'name' | 'time'>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const timeInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!eventId || eventId === 'undefined') return;
    (async () => {
      setIsLoading(true);
      try {
        const [rawParticipants, event] = await Promise.all([
          getEventResults(eventId),
          getEventById(eventId),
        ]);
        setEventTitle(event?.title || '');
        setIsPublished(event?.status === 'Completed');

        const checkedIn = (Array.isArray(rawParticipants) ? rawParticipants : []).filter((p: any) => {
          const s = String(p.status || '').toLowerCase().replace(/_/g, '-');
          return s === 'checked-in' || s === 'checked_in' || s === 'completed';
        });

        setResults(checkedIn.map((p: any, idx: number) => ({
          participantId: p._id || p.id,
          userId: p.user?._id || p.userId || p._id || p.id,
          userName: p.user?.fullName || p.userName || '-',
          userCommunity: p.user?.email || p.userCommunity || '-',
          bibNumber: p.rank ? String(p.rank) : String(idx + 1),
          rank: p.rank ?? null,
          time: p.time || '',
          riderStatus: p.status === 'completed' ? 'finished' : 'finished',
          points: 0,
          isDirty: false,
        })));
      } catch (err) {
        toast.error('Failed to load participants');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [eventId]);

  const finishers = results.filter(r => r.riderStatus === 'finished');
  const dnfCount = results.filter(r => r.riderStatus === 'dnf').length;
  const dnsCount = results.filter(r => r.riderStatus === 'dns').length;
  const completionRate = results.length > 0 ? Math.round((finishers.length / results.length) * 100) : 0;

  const sortedResults = [...results].sort((a, b) => {
    const mult = sortDir === 'asc' ? 1 : -1;
    if (sortCol === 'name') return mult * a.userName.localeCompare(b.userName);
    if (sortCol === 'time') {
      const ta = a.riderStatus === 'finished' ? parseTime(a.time) : Infinity;
      const tb = b.riderStatus === 'finished' ? parseTime(b.time) : Infinity;
      return mult * (ta - tb);
    }
    const ra = a.rank ?? Infinity;
    const rb = b.rank ?? Infinity;
    return mult * (ra - rb);
  });

  const updateField = (id: string, patch: Partial<ResultEntry>) => {
    setResults(prev => prev.map(r => r.participantId === id ? { ...r, ...patch, isDirty: true } : r));
    setHasUnsaved(true);
  };

  const handleTimeChange = (id: string, raw: string) => {
    updateField(id, { time: formatTimeInput(raw) });
  };

  const handleStatusChange = (id: string, status: RiderStatus) => {
    setResults(prev => prev.map(r => {
      if (r.participantId !== id) return r;
      const newRank = status !== 'finished' ? null : r.rank;
      return { ...r, riderStatus: status, rank: newRank, time: status !== 'finished' ? '' : r.time, points: calculatePoints(newRank, status), isDirty: true };
    }));
    setHasUnsaved(true);
  };

  const handleManualRank = (id: string, value: string) => {
    const rank = value === '' ? null : Math.max(1, parseInt(value) || 1);
    setResults(prev => prev.map(r =>
      r.participantId === id ? { ...r, rank, points: calculatePoints(rank, r.riderStatus), isDirty: true } : r
    ));
    setHasUnsaved(true);
  };

  const handleAutoRankFromTime = () => {
    const withTime = results
      .filter(r => r.riderStatus === 'finished' && r.time.trim())
      .sort((a, b) => parseTime(a.time) - parseTime(b.time));

    if (withTime.length === 0) {
      toast.error('Enter finish times first, then auto-rank will sort by fastest time.');
      return;
    }

    setResults(prev => {
      const ranked = new Map<string, number>();
      withTime.forEach((r, i) => ranked.set(r.participantId, i + 1));
      return prev.map(r => {
        const rank = ranked.get(r.participantId) ?? null;
        return { ...r, rank, points: calculatePoints(rank, r.riderStatus), isDirty: true };
      });
    });
    setSortCol('rank');
    setSortDir('asc');
    setHasUnsaved(true);
    toast.success(`Auto-ranked ${withTime.length} finishers by time`);
  };

  const handleSave = async () => {
    if (!eventId) return;
    const dirty = results.filter(r => r.isDirty);
    if (dirty.length === 0) { toast.info('No changes to save'); return; }
    setIsSaving(true);
    try {
      await Promise.all(
        dirty.map(r => adminUpdateParticipantResult(eventId, r.userId, { rank: r.rank, time: r.time || undefined }))
      );
      setResults(prev => prev.map(r => ({ ...r, isDirty: false })));
      setHasUnsaved(false);
      toast.success('Progress saved');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save results');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    const missingTime = finishers.filter(r => !r.time.trim());
    const missingRank = finishers.filter(r => r.rank === null);
    if (missingTime.length > 0 || missingRank.length > 0) {
      toast.error('All finishers need a rank and finish time before publishing.');
      return;
    }
    await handleSave();
    setIsPublished(true);
    toast.success('Results published! Leaderboard is now live.');
  };

  const handleExportCSV = async () => {
    if (!eventId) return;
    try {
      const blob = await exportEventResultsCsv(eventId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `results-event-${eventId}.csv`;
      a.click();
      toast.success('Results exported as CSV');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  const toggleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: typeof sortCol }) =>
    sortCol === col
      ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />)
      : <span className="w-3 h-3 inline-block ml-1 opacity-30">↕</span>;

  const topThree = [...results]
    .filter(r => r.riderStatus === 'finished' && r.rank !== null)
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <button onClick={() => navigate(`/events/${eventId}`)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl mb-1" style={{ color: '#333' }}>Race Results & Leaderboard</h1>
          <p style={{ color: '#666' }}>{eventTitle}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isPublished && hasUnsaved && (
            <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
              <AlertCircle className="w-3.5 h-3.5" />
              Unsaved changes
            </span>
          )}
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm hover:bg-gray-50 transition-all" style={{ color: '#666' }}>
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          {isPublished ? (
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white" style={{ backgroundColor: '#10B981' }}>
              <CheckCircle className="w-4 h-4" />
              Published
            </div>
          ) : (
            <>
              <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all hover:shadow-md disabled:opacity-50" style={{ backgroundColor: '#ECC180', color: '#333' }}>
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving…' : 'Save Progress'}
              </button>
              <button onClick={handlePublish} disabled={isSaving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm transition-all hover:shadow-lg disabled:opacity-50" style={{ backgroundColor: '#C12D32' }}>
                <Send className="w-4 h-4" />
                Publish Results
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: isPublished ? '#ECFDF5' : '#FFF9EF', border: `1px solid ${isPublished ? '#A7F3D0' : '#ECC180'}` }}>
        {isPublished
          ? <CheckCircle className="w-5 h-5 shrink-0" style={{ color: '#10B981' }} />
          : <AlertCircle className="w-5 h-5 shrink-0" style={{ color: '#F59E0B' }} />}
        <p className="text-sm" style={{ color: '#555' }}>
          {isPublished
            ? 'Results are published. The leaderboard is live and participants can view their standings in the app.'
            : 'Enter finish times for each rider, then use Auto-Rank to assign positions. Save progress at any time before publishing.'}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Checked In', value: results.length, icon: <Users className="w-4 h-4" />, color: '#3B82F6', bg: '#EFF6FF' },
          { label: 'Finishers', value: finishers.length, icon: <CheckCircle className="w-4 h-4" />, color: '#10B981', bg: '#ECFDF5' },
          { label: 'DNF', value: dnfCount, icon: <XCircle className="w-4 h-4" />, color: '#F59E0B', bg: '#FFFBEB' },
          { label: 'DNS', value: dnsCount, icon: <AlertCircle className="w-4 h-4" />, color: '#6B7280', bg: '#F9FAFB' },
          { label: 'Completion', value: `${completionRate}%`, icon: <BarChart3 className="w-4 h-4" />, color: '#C12D32', bg: '#FEF2F2' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl shadow-sm flex items-center gap-3" style={{ backgroundColor: s.bg }}>
            <span style={{ color: s.color }}>{s.icon}</span>
            <div>
              <p className="text-xs" style={{ color: '#666' }}>{s.label}</p>
              <p className="text-xl" style={{ color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Points Distribution */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-base mb-3" style={{ color: '#333' }}>Points Distribution</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: '🥇 1st', pts: BASE_POINTS },
            { label: '🥈 2nd', pts: Math.floor(BASE_POINTS * 0.6) },
            { label: '🥉 3rd', pts: Math.floor(BASE_POINTS * 0.4) },
            { label: 'Top 10', pts: Math.floor(BASE_POINTS * 0.2) },
            { label: 'Others', pts: Math.floor(BASE_POINTS * 0.1) },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: '#FFF9EF' }}>
              <span className="text-sm" style={{ color: '#555' }}>{item.label}</span>
              <span className="text-sm font-medium" style={{ color: '#C12D32' }}>{item.pts} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Result Entry Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base" style={{ color: '#333' }}>
            Result Entry Table
            <span className="ml-2 text-sm" style={{ color: '#999' }}>({results.length} checked-in riders)</span>
          </h3>
          {!isPublished && (
            <button
              onClick={handleAutoRankFromTime}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all hover:shadow-md"
              style={{ backgroundColor: '#C12D32', color: '#fff' }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Auto-Rank from Times
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <div className="py-16 text-center px-6">
            <Clock className="w-12 h-12 mx-auto mb-4" style={{ color: '#ECC180' }} />
            <p className="text-base mb-1" style={{ color: '#555' }}>No checked-in participants found</p>
            <p className="text-sm" style={{ color: '#999' }}>
              Participants must be checked in from the{' '}
              <button className="underline" style={{ color: '#C12D32' }} onClick={() => navigate(`/events/${eventId}/event-participants`)}>
                Participants page
              </button>{' '}
              before entering results.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#FFF9EF' }}>
                  <th className="text-left px-5 py-3 text-sm cursor-pointer select-none" style={{ color: '#666' }} onClick={() => toggleSort('rank')}>Rank <SortIcon col="rank" /></th>
                  <th className="text-left px-4 py-3 text-sm" style={{ color: '#666' }}>Bib</th>
                  <th className="text-left px-4 py-3 text-sm cursor-pointer select-none" style={{ color: '#666' }} onClick={() => toggleSort('name')}>Rider Name <SortIcon col="name" /></th>
                  <th className="text-left px-4 py-3 text-sm" style={{ color: '#666' }}>Community</th>
                  <th className="text-left px-4 py-3 text-sm cursor-pointer select-none" style={{ color: '#666' }} onClick={() => toggleSort('time')}>Time <SortIcon col="time" /></th>
                  <th className="text-left px-4 py-3 text-sm" style={{ color: '#666' }}>Status</th>
                  <th className="text-left px-4 py-3 text-sm" style={{ color: '#666' }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map(result => {
                  const rowBg =
                    result.riderStatus !== 'finished' ? '#FAFAFA' :
                    result.rank === 1 ? '#FFFBEB' :
                    result.rank === 2 ? '#F8FAFC' :
                    result.rank === 3 ? '#FFF7ED' : '#fff';

                  return (
                    <tr key={result.participantId} className="border-t border-gray-100" style={{ backgroundColor: result.isDirty ? '#FFFFF0' : rowBg }}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {result.rank === 1 && <Trophy className="w-4 h-4 shrink-0" style={{ color: '#F59E0B' }} />}
                          {result.rank === 2 && <Trophy className="w-4 h-4 shrink-0" style={{ color: '#9CA3AF' }} />}
                          {result.rank === 3 && <Trophy className="w-4 h-4 shrink-0" style={{ color: '#CD7F32' }} />}
                          {result.riderStatus === 'finished' ? (
                            <input
                              type="number"
                              value={result.rank ?? ''}
                              onChange={e => handleManualRank(result.participantId, e.target.value)}
                              disabled={isPublished}
                              min={1}
                              className="w-14 px-2 py-1 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                              style={{ borderColor: result.rank === null ? '#FCA5A5' : '#e5e7eb' }}
                              placeholder="—"
                            />
                          ) : (
                            <span className="text-sm" style={{ color: '#999' }}>—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={result.bibNumber}
                          onChange={e => updateField(result.participantId, { bibNumber: e.target.value })}
                          disabled={isPublished}
                          className="w-14 px-2 py-1 rounded-lg border border-gray-200 text-sm text-center focus:outline-none disabled:bg-gray-100"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium" style={{ color: result.riderStatus !== 'finished' ? '#9CA3AF' : '#333' }}>{result.userName}</p>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#666' }}>{result.userCommunity}</td>
                      <td className="px-4 py-3">
                        {result.riderStatus === 'finished' ? (
                          <input
                            ref={el => { timeInputRefs.current[result.participantId] = el; }}
                            type="text"
                            value={result.time}
                            onChange={e => handleTimeChange(result.participantId, e.target.value)}
                            disabled={isPublished}
                            placeholder="HH:MM:SS"
                            maxLength={8}
                            className="w-28 px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            style={{ borderColor: !result.time && !isPublished ? '#FCA5A5' : '#e5e7eb' }}
                          />
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full uppercase font-medium" style={{ backgroundColor: result.riderStatus === 'dnf' ? '#FFFBEB' : '#F9FAFB', color: result.riderStatus === 'dnf' ? '#92400E' : '#6B7280' }}>
                            {result.riderStatus}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!isPublished ? (
                          <div className="flex gap-1">
                            {(['finished', 'dnf', 'dns'] as RiderStatus[]).map(s => (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(result.participantId, s)}
                                className="px-2 py-1 rounded-lg text-xs transition-all"
                                style={{
                                  backgroundColor: result.riderStatus === s ? (s === 'finished' ? '#ECFDF5' : s === 'dnf' ? '#FFFBEB' : '#F9FAFB') : '#F5F5F5',
                                  color: result.riderStatus === s ? (s === 'finished' ? '#065F46' : s === 'dnf' ? '#92400E' : '#374151') : '#9CA3AF',
                                  fontWeight: result.riderStatus === s ? 600 : 400,
                                  border: result.riderStatus === s ? '1.5px solid currentColor' : '1.5px solid transparent',
                                }}
                              >
                                {s === 'finished' ? 'Fin' : s.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs capitalize" style={{ color: result.riderStatus === 'finished' ? '#10B981' : '#9CA3AF' }}>{result.riderStatus}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {result.riderStatus === 'finished' && result.rank !== null ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#ECC180', color: '#333' }}>
                            {result.points} pts
                          </span>
                        ) : (
                          <span className="text-sm" style={{ color: '#ccc' }}>0 pts</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {results.length > 0 && !isPublished && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between" style={{ backgroundColor: '#FAFAFA' }}>
            <p className="text-xs" style={{ color: '#999' }}>
              Tip: Enter all finish times, then press <strong>Auto-Rank from Times</strong> to automatically assign positions.
            </p>
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all hover:shadow-md disabled:opacity-50" style={{ backgroundColor: '#ECC180', color: '#333' }}>
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving…' : 'Save Progress'}
            </button>
          </div>
        )}
      </div>

      {/* Podium Preview */}
      {topThree.length >= 2 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg mb-6 text-center" style={{ color: '#333' }}>🏆 Podium</h3>
          <div className="flex items-end justify-center gap-4">
            {topThree[1] && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2" style={{ backgroundColor: '#F3F4F6' }}>🥈</div>
                <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: '#F8FAFC', width: 150, minHeight: 110 }}>
                  <p className="text-xs mb-1" style={{ color: '#999' }}>2nd Place</p>
                  <p className="text-sm mb-1 font-medium" style={{ color: '#333' }}>{topThree[1].userName}</p>
                  <p className="text-xs font-mono mb-1" style={{ color: '#666' }}>{topThree[1].time}</p>
                  <p className="text-sm" style={{ color: '#C12D32' }}>{topThree[1].points} pts</p>
                </div>
              </div>
            )}
            {topThree[0] && (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-2" style={{ backgroundColor: '#FFF9EF' }}>🥇</div>
                <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: '#FFF9EF', width: 170, minHeight: 130, border: '2px solid #C12D32' }}>
                  <p className="text-xs mb-1" style={{ color: '#C12D32' }}>Champion</p>
                  <p className="mb-1 font-medium" style={{ color: '#333' }}>{topThree[0].userName}</p>
                  <p className="text-sm font-mono mb-2" style={{ color: '#666' }}>{topThree[0].time}</p>
                  <p className="text-lg" style={{ color: '#C12D32' }}>{topThree[0].points} pts</p>
                </div>
              </div>
            )}
            {topThree[2] && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2" style={{ backgroundColor: '#FFF7ED' }}>🥉</div>
                <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: '#FFF7ED', width: 150, minHeight: 110 }}>
                  <p className="text-xs mb-1" style={{ color: '#999' }}>3rd Place</p>
                  <p className="text-sm mb-1 font-medium" style={{ color: '#333' }}>{topThree[2].userName}</p>
                  <p className="text-xs font-mono mb-1" style={{ color: '#666' }}>{topThree[2].time}</p>
                  <p className="text-sm" style={{ color: '#C12D32' }}>{topThree[2].points} pts</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isPublished && finishers.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg mb-4" style={{ color: '#333' }}>Final Leaderboard</h3>
          <div className="space-y-2">
            {finishers
              .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
              .map(r => (
                <div key={r.participantId} className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: r.rank === 1 ? '#FFF9EF' : '#FAFAFA' }}>
                  <span className="w-8 text-center text-sm font-medium" style={{ color: r.rank === 1 ? '#F59E0B' : '#666' }}>#{r.rank}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#333' }}>{r.userName}</p>
                    <p className="text-xs" style={{ color: '#999' }}>{r.userCommunity}</p>
                  </div>
                  <span className="text-sm font-mono" style={{ color: '#555' }}>{r.time}</span>
                  <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#ECC180', color: '#333' }}>{r.points} pts</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {isPublished && (
        <div className="p-5 rounded-2xl" style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#10B981' }} />
            <div>
              <p className="font-medium mb-2" style={{ color: '#065F46' }}>Results published successfully</p>
              <ul className="space-y-1 text-sm" style={{ color: '#047857' }}>
                <li>✓ Event marked as Completed</li>
                <li>✓ Results visible to all members in the app</li>
                <li>✓ Leaderboard activated</li>
                <li>✓ Points credited to rider profiles</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
