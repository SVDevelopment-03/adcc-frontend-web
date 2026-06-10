import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Users, CheckCircle, Calendar, TrendingUp, Award, Trophy, Bell, Send } from 'lucide-react';
import { getChallengeById, getChallengeParticipants, ChallengeParticipant } from '../../services/challengesApi';
import { sendTestBroadcastPush } from '../../services/authApi';
import { toast } from 'sonner';
import { UserRole } from '../../App';
import { useTranslation } from 'react-i18next';

interface ChallengeDetailProps {
  role: UserRole;
}

export function ChallengeDetail({ role }: ChallengeDetailProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: challengeId } = useParams<{ id: string }>();
  const [challenge, setChallenge] = useState<Awaited<ReturnType<typeof getChallengeById>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'leaderboard' | 'notifications'>('overview');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifDeliveryType, setNotifDeliveryType] = useState<'app' | 'email' | 'both'>('app');
  const [isSendingNotif, setIsSendingNotif] = useState(false);
  const [notifResult, setNotifResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [challengeParticipants, setChallengeParticipants] = useState<ChallengeParticipant[]>([]);
  const [participantsLoaded, setParticipantsLoaded] = useState(false);

  const canEdit = true;

  useEffect(() => {
    if ((activeTab === 'participants' || activeTab === 'notifications') && challengeId && !participantsLoaded) {
      getChallengeParticipants(challengeId)
        .then(data => { setChallengeParticipants(data); setParticipantsLoaded(true); })
        .catch(() => setParticipantsLoaded(true));
    }
  }, [activeTab, challengeId, participantsLoaded]);

  const handleSendChallengeNotif = async () => {
    if (!notifTitle.trim() || !notifMessage.trim()) {
      toast.error('Title and message are required');
      return;
    }
    const selectedUserIds = challengeParticipants.map(p => p.userId).filter(Boolean);
    if (selectedUserIds.length === 0) {
      toast.error('No participants found for this challenge');
      return;
    }
    setIsSendingNotif(true);
    setNotifResult(null);
    try {
      await sendTestBroadcastPush({
        title: notifTitle.trim(),
        body: notifMessage.trim(),
        audienceType: 'selected_users',
        selectedUserIds,
        deliveryType: notifDeliveryType,
      });
      const label = notifDeliveryType === 'app' ? 'push notification' : notifDeliveryType === 'email' ? 'email' : 'notification';
      setNotifResult({ ok: true, message: `${label} sent to ${selectedUserIds.length} participant(s)` });
      toast.success(`Notification sent to ${selectedUserIds.length} participant(s)`);
      setNotifTitle('');
      setNotifMessage('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send notification';
      setNotifResult({ ok: false, message: msg });
      toast.error(msg);
    } finally {
      setIsSendingNotif(false);
    }
  };

  const fetchChallenge = useCallback(async () => {
    if (!challengeId) {
      setChallenge(null);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await getChallengeById(challengeId);
      setChallenge(data);
    } catch {
      setError(t('challenges.challengeNotFound'));
      setChallenge(null);
    } finally {
      setLoading(false);
    }
  }, [challengeId, t]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#C12D32' }} />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate('/challenges')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <p style={{ color: '#666' }}>{error ?? t('challenges.challengeNotFound')}</p>
      </div>
    );
  }

  const completionRate = challenge.participants > 0
    ? Math.round((challenge.completions / challenge.participants) * 100)
    : 0;

  const daysRemaining = Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const tabLabels: Record<string, string> = {
    overview: t('challenges.overview'),
    participants: `${t('challenges.participants')} (${challenge.participants})`,
    leaderboard: t('challenges.leaderboard'),
    notifications: t('challenges.notifications'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <button
            onClick={() => navigate('/challenges')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 mt-1"
          >
            <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
          </button>
          <div className="min-w-0">
            <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{challenge.title}</h1>
            <p className="line-clamp-2" style={{ color: '#666' }}>{challenge.description}</p>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={() => navigate(`/challenges/${challenge.id}/edit`)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all hover:shadow-lg flex-shrink-0"
            style={{ backgroundColor: '#C12D32' }}
          >
            <Edit className="w-5 h-5" />
            {t('challenges.editChallenge')}
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: '#ECC180' }}>
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('challenges.participants')}</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>{challenge.participants}</p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('challenges.completions')}</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>{challenge.completions}</p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('challenges.completionRate')}</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>{completionRate}%</p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('challenges.daysRemaining')}</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>{daysRemaining > 0 ? daysRemaining : t('challenges.ended')}</p>
        </div>
      </div>

      {/* Challenge Info Card */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('challenges.challengeDetails')}</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm" style={{ color: '#999' }}>{t('challenges.type')}</p>
                <p style={{ color: '#333' }}>{t(`challenges.typeLabels.${challenge.type}`)}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#999' }}>{t('challenges.target')}</p>
                <p style={{ color: '#333' }}>{challenge.target} {challenge.unit}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#999' }}>{t('challenges.duration')}</p>
                <p style={{ color: '#333' }}>
                  {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#999' }}>{t('challenges.status')}</p>
                <span className="inline-block px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: '#10B981' }}>
                  {t(`challenges.statusLabels.${challenge.status}`)}
                </span>
              </div>
            </div>
          </div>
         
          <div>
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('challenges.reward')}</h3>
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
              <div className="flex items-center gap-3">
                <Award className="w-12 h-12" style={{ color: '#C12D32' }} />
                <div>
                  <p className="font-medium" style={{ color: '#333' }}>{challenge.rewardBadgeName || challenge.rewardBadge || t('challenges.noBadgeAssigned')}</p>
                  <p className="text-sm" style={{ color: '#666' }}>{t('challenges.awardedUponCompletion')}</p>
                </div>
              </div>
            </div>

            {challenge.communityNames && challenge.communityNames.length > 0 && (
              <div className="mt-4">
                <p className="text-sm mb-2" style={{ color: '#999' }}>{t('challenges.availableInCommunities')}</p>
                <div className="flex flex-wrap gap-2">
                  {challenge.communityNames.map((name, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#ECC180', color: '#333' }}>
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {(['overview', 'participants', 'leaderboard', 'notifications'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 transition-colors ${activeTab === tab ? 'border-b-2' : ''}`}
              style={{
                borderColor: activeTab === tab ? '#C12D32' : 'transparent',
                color: activeTab === tab ? '#C12D32' : '#666'
              }}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('challenges.progressOverview')}</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm" style={{ color: '#666' }}>{t('challenges.overallProgress')}</span>
                <span className="text-sm font-medium" style={{ color: '#C12D32' }}>{completionRate}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${completionRate}%`, backgroundColor: '#C12D32' }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                <p className="text-2xl font-bold" style={{ color: '#C12D32' }}>{challenge.participants}</p>
                <p className="text-sm" style={{ color: '#666' }}>{t('challenges.totalJoined')}</p>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                <p className="text-2xl font-bold" style={{ color: '#C12D32' }}>{challenge.completions}</p>
                <p className="text-sm" style={{ color: '#666' }}>{t('challenges.completed')}</p>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                <p className="text-2xl font-bold" style={{ color: '#C12D32' }}>{challenge.participants - challenge.completions}</p>
                <p className="text-sm" style={{ color: '#666' }}>{t('challenges.inProgress')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'participants' && (
        <div className="rounded-2xl shadow-sm bg-white overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" style={{ color: '#C12D32' }} />
              <h3 className="text-lg" style={{ color: '#333' }}>
                Participants
                {participantsLoaded && (
                  <span className="ml-2 text-sm font-normal" style={{ color: '#999' }}>
                    ({challengeParticipants.length})
                  </span>
                )}
              </h3>
            </div>
          </div>

          {!participantsLoaded ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#C12D32' }} />
            </div>
          ) : challengeParticipants.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 mx-auto mb-3" style={{ color: '#E5E7EB' }} />
              <h3 className="text-lg mb-1" style={{ color: '#333' }}>{t('challenges.noParticipants')}</h3>
              <p className="text-sm" style={{ color: '#999' }}>{t('challenges.participantsHint')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#FFF9EF' }}>
                    <th className="text-left px-6 py-3 text-sm font-medium" style={{ color: '#666' }}>#</th>
                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: '#666' }}>Name</th>
                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: '#666' }}>Email</th>
                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: '#666' }}>Progress</th>
                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: '#666' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {challengeParticipants.map((p, idx) => (
                    <tr key={p.userId} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm" style={{ color: '#999' }}>{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-white font-medium" style={{ backgroundColor: '#C12D32' }}>
                            {p.fullName ? p.fullName[0].toUpperCase() : '?'}
                          </div>
                          <span className="text-sm font-medium" style={{ color: '#333' }}>{p.fullName || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#666' }}>{p.email || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden" style={{ minWidth: 80 }}>
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${p.progressPercent}%`, backgroundColor: p.progressPercent >= 100 ? '#10B981' : '#C12D32' }}
                            />
                          </div>
                          <span className="text-xs font-medium w-10 text-right" style={{ color: p.progressPercent >= 100 ? '#10B981' : '#C12D32' }}>
                            {p.progressPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#999' }}>
                        {p.joinedAt ? new Date(p.joinedAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 mx-auto mb-3" style={{ color: '#ECC180' }} />
            <h3 className="text-lg mb-1" style={{ color: '#333' }}>{t('challenges.noLeaderboard')}</h3>
            <p className="text-sm" style={{ color: '#999' }}>{t('challenges.leaderboardHint')}</p>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 rounded-xl border border-blue-100" style={{ backgroundColor: '#EFF6FF' }}>
            <Users className="w-5 h-5 shrink-0" style={{ color: '#3B82F6' }} />
            <p className="text-sm" style={{ color: '#1D4ED8' }}>
              {participantsLoaded
                ? <><span className="font-medium">{challengeParticipants.length} participant(s)</span> currently joined this challenge.</>
                : 'Loading participants…'}
              {' '}Notifications will be sent only to joined participants.
            </p>
          </div>

          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-5 h-5" style={{ color: '#C12D32' }} />
              <h3 className="text-lg" style={{ color: '#333' }}>Send Notification to Participants</h3>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#555' }}>Delivery Method</label>
              <div className="flex gap-3">
                {(['app', 'email', 'both'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setNotifDeliveryType(type)}
                    className="flex-1 py-2 rounded-lg border text-sm transition-all"
                    style={{
                      backgroundColor: notifDeliveryType === type ? '#C12D32' : '#fff',
                      color: notifDeliveryType === type ? '#fff' : '#555',
                      borderColor: notifDeliveryType === type ? '#C12D32' : '#D1D5DB',
                    }}
                  >
                    {type === 'app' ? 'In-App' : type === 'email' ? 'Email' : 'Both'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#555' }}>Notification Title</label>
              <input
                type="text"
                value={notifTitle}
                onChange={e => setNotifTitle(e.target.value)}
                placeholder="e.g. Challenge Update"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#555' }}>Message</label>
              <textarea
                value={notifMessage}
                onChange={e => setNotifMessage(e.target.value)}
                placeholder="Write your message to challenge participants..."
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
              />
            </div>

            {notifResult && (
              <div
                className="flex items-start gap-3 p-4 rounded-lg border text-sm"
                style={{
                  backgroundColor: notifResult.ok ? '#F0FDF4' : '#FEF2F2',
                  borderColor: notifResult.ok ? '#86EFAC' : '#FECACA',
                  color: notifResult.ok ? '#15803D' : '#991B1B',
                }}
              >
                <Bell className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{notifResult.message}</span>
              </div>
            )}

            <button
              onClick={handleSendChallengeNotif}
              disabled={isSendingNotif || !notifTitle.trim() || !notifMessage.trim() || !participantsLoaded}
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#C12D32' }}
            >
              {isSendingNotif ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Notification
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
