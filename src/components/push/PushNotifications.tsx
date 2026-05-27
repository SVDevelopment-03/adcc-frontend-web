import React, { useEffect, useMemo, useState } from 'react';
import { Send, Users, Clock, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { sendStaffWebPush, sendTestBroadcastPush } from '../../services/authApi';
import { getAllUsers, type User } from '../../services/usersApi';
import { getAllEvents } from '../../services/eventsApi';
//import { getAllCommunities } from '../../services/communitiesApi';

interface SentNotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  audience: string;
  deliveryType: 'app' | 'email' | 'both';
  status: 'success' | 'failed';
  createdAt: string;
}

const PUSH_HISTORY_STORAGE_KEY = 'push_notification_history';

interface AudienceCounts {
  all: number;
  active: number;
  eventParticipants: number;
  chapterMembers: number;
}

export function PushNotifications() {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [audience, setAudience] = useState('all');
  const [deliveryType, setDeliveryType] = useState<'app' | 'email' | 'both'>('app');
  const [externalEmails, setExternalEmails] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>('');
  const [lastError, setLastError] = useState<string>('');
  const [permission, setPermission] = useState<string>('unknown');
  const [swStatus, setSwStatus] = useState<string>('unknown');
  const [fcmToken, setFcmToken] = useState<string>('');
  const [touched, setTouched] = useState<{
    title?: boolean;
    message?: boolean;
    scheduleDate?: boolean;
    scheduleTime?: boolean;
  }>({});
  const [errors, setErrors] = useState<{
    title?: string;
    message?: string;
    schedule?: string;
  }>({});
  const [audienceCounts, setAudienceCounts] = useState<AudienceCounts>({
    all: 0,
    active: 0,
    eventParticipants: 0,
    chapterMembers: 0,
  });
  const [history, setHistory] = useState<SentNotificationHistoryItem[]>([]);

  const validateForm = useMemo(() => {
    return (values: { title: string; message: string; scheduleDate: string; scheduleTime: string }) => {
      const nextErrors: { title?: string; message?: string; schedule?: string } = {};

      if (!values.title.trim()) {
        nextErrors.title = t('push.validation.titleRequired');
      }
      if (!values.message.trim()) {
        nextErrors.message = t('push.validation.messageRequired');
      }

      const hasDate = Boolean(values.scheduleDate);
      const hasTime = Boolean(values.scheduleTime);
      if ((hasDate && !hasTime) || (!hasDate && hasTime)) {
        nextErrors.schedule = t('push.validation.scheduleIncomplete');
      }

      return nextErrors;
    };
  }, [t]);

  const currentValues = useMemo(
    () => ({ title, message, scheduleDate, scheduleTime }),
    [title, message, scheduleDate, scheduleTime]
  );

  const payload = useMemo(
    () => ({
      title: title.trim() || undefined,
      body: message.trim(),
      audienceType: audience,
      deliveryType,
      selectedUserIds,
      scheduleDate: scheduleDate || undefined,
      scheduleTime: scheduleTime || undefined,
    }),
    [title, message, audience, deliveryType, selectedUserIds, scheduleDate, scheduleTime]
  );

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => {
      return (
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.toLowerCase().includes(query)
      );
    });
  }, [users, userSearch]);

  const handleSend = async () => {
    
    if (isSending) return;

    const values = { title, message, scheduleDate, scheduleTime };
    const nextErrors = validateForm(values);
    setErrors(nextErrors);
    setTouched((prev) => ({
      ...prev,
      title: true,
      message: true,
      scheduleDate: true,
      scheduleTime: true,
    }));
    if (Object.keys(nextErrors).length > 0) {
      toast.error(t('push.validation.fixErrors'));
      return;
    }

    const nextPayload = {
      title: values.title.trim() || undefined,
      body: values.message.trim(),
      audienceType: audience,
      deliveryType,
      selectedUserIds: selectedUserIds.length > 0 ? selectedUserIds : undefined,
      externalEmails: externalEmails || undefined,
      scheduleDate: values.scheduleDate || undefined,
      scheduleTime: values.scheduleTime || undefined,
    };

    if (audience === 'selected_users' && selectedUserIds.length === 0) {
      toast.error('Please select at least one user');
      setIsSending(false);
      return;
    }

    // console.log('📤 Push payload:', nextPayload);

    setIsSending(true);
    setLastResponse('');
    setLastError('');
    try {
      const shouldBroadcastAllDevices = audience === 'all_devices';
      const response = shouldBroadcastAllDevices
        ? await sendTestBroadcastPush({ ...nextPayload, audienceType: 'all' })
        : audience === 'selected_users'
          ? await sendTestBroadcastPush(nextPayload)
          : await sendStaffWebPush(nextPayload);

      setHistory((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: nextPayload.title || 'Notification',
          body: nextPayload.body,
          audience: shouldBroadcastAllDevices ? 'all_devices' : audience,
          deliveryType,
          status: 'success',
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 50));

      setLastResponse(JSON.stringify(response, null, 2));
      toast.success(t('push.toasts.sent'));
    } catch (error: any) {
      const errorPayload = error?.response?.data || { message: error?.message || 'Unknown error' };

      setHistory((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: nextPayload.title || 'Notification',
          body: nextPayload.body,
          audience,
          deliveryType,
          status: 'failed',
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 50));

      setLastError(JSON.stringify(errorPayload, null, 2));
      toast.error(errorPayload?.message || 'Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const handleBlur = (field: 'title' | 'message' | 'scheduleDate' | 'scheduleTime') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validateForm(currentValues));
  };

  const refreshDebugInfo = async () => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    } else {
      setPermission('unsupported');
    }

    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        const hasFcmSw = registrations.some((reg) =>
          reg.active?.scriptURL?.includes('firebase-messaging-sw.js')
        );
        setSwStatus(hasFcmSw ? 'active' : registrations.length > 0 ? 'registered' : 'none');
      } catch {
        setSwStatus('error');
      }
    } else {
      setSwStatus('unsupported');
    }

    const token = localStorage.getItem('fcmToken') || '';
    setFcmToken(token);
  };

  const fetchAudienceCounts = async () => {
    try {
      const [allUsersRes, events] = await Promise.all([
        getAllUsers(1, 1),
        getAllEvents({ page: 1, limit: 100 }),
        // getAllCommunities(),
      ]);

      const totalUsers = allUsersRes.pagination.total;

      // Active users: users with isVerified = true
      const verifiedRes = await getAllUsers(1, 100);
      const activeCount = verifiedRes.users.filter((u) => u.isVerified).length;
      // If total users > 100, scale proportionally
      const estimatedActive =
        totalUsers > 100
          ? Math.round((activeCount / verifiedRes.users.length) * totalUsers)
          : activeCount;

      // Event participants: sum of registrations across all events
      const eventParticipants = events.reduce((sum, e) => sum + (e.registrations ?? 0), 0);

      // Chapter members: sum of memberCount across all communities
      // const chapterMembers = communities.reduce(
      //   (sum, c) => sum + (Number(c.memberCount) || c.stats?.members || 0),
      //   0
      // );

      setAudienceCounts({
        all: totalUsers,
        active: estimatedActive,
        eventParticipants,
        //chapterMembers,
      });
    } catch (err) {
      console.error('Failed to fetch audience counts:', err);
    }
  };

  const fetchSelectableUsers = async () => {
    try {
      const response = await getAllUsers(1, 500);
      setUsers(response.users);
    } catch (err) {
      console.error('Failed to fetch selectable users:', err);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PUSH_HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SentNotificationHistoryItem[];
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, 50));
        }
      }
    } catch {
      setHistory([]);
    }

    void refreshDebugInfo();
    void fetchAudienceCounts();
    void fetchSelectableUsers();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PUSH_HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore localStorage failures.
    }
  }, [history]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('push.title')}</h1>
        <p style={{ color: '#666' }}>{t('push.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('push.createCampaign')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('push.campaignTitle')}</label>
              <input
                type="text"
                placeholder={t('push.titlePlaceholder')}
                className={`w-full px-4 py-2 rounded-lg border ${touched.title && errors.title ? 'border-red-500' : 'border-gray-200'}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleBlur('title')}
              />
              {touched.title && errors.title ? (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              ) : null}
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('push.message')}</label>
              <textarea
                placeholder={t('push.messagePlaceholder')}
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border ${touched.message && errors.message ? 'border-red-500' : 'border-gray-200'}`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onBlur={() => handleBlur('message')}
              />
              {touched.message && errors.message ? (
                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
              ) : null}
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('push.audience')}</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-200"
                value={audience}
                onChange={(e) => {
                  const nextAudience = e.target.value;
                  setAudience(nextAudience);
                  if (nextAudience !== 'selected_users') {
                    setSelectedUserIds([]);
                  }
                }}
              >
                <option value="all_devices">Broadcast to All Devices</option>
                <option value="all">{t('push.audienceOptions.allUsers', { count: audienceCounts.all.toLocaleString() })}</option>
                <option value="selected_users">Selected Users</option>
                <option value="active">{t('push.audienceOptions.activeUsers', { count: audienceCounts.active.toLocaleString() })}</option>
                <option value="event">{t('push.audienceOptions.eventParticipants', { count: audienceCounts.eventParticipants.toLocaleString() })}</option>
                {/* <option value="chapter">{t('push.audienceOptions.chapterMembers', { count: audienceCounts.chapterMembers.toLocaleString() })}</option> */}
                <option value="chapter">Chapter Members</option>
              </select>
            </div>
            {audience === 'selected_users' ? (
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <label className="block text-sm" style={{ color: '#666' }}>Select Users</label>
                  <span className="text-xs" style={{ color: '#888' }}>{selectedUserIds.length} selected</span>
                </div>
                <input
                  type="text"
                  placeholder="Search users by name, email, or phone"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 mb-3"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                <div className="max-h-60 overflow-auto space-y-2 pr-1">
                  {filteredUsers.length === 0 ? (
                    <p className="text-sm" style={{ color: '#888' }}>No users found.</p>
                  ) : (
                    filteredUsers.map((user) => {
                      const checked = selectedUserIds.includes(user.id);
                      return (
                        <label
                          key={user.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setSelectedUserIds((prev) =>
                                e.target.checked
                                  ? Array.from(new Set([...prev, user.id]))
                                  : prev.filter((id) => id !== user.id)
                              );
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate" style={{ color: '#333' }}>
                              {user.fullName || 'Unnamed User'}
                            </div>
                            <div className="text-xs truncate" style={{ color: '#666' }}>
                              {user.email || 'No email'}
                            </div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            ) : null}
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Notification Type</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-200"
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value as 'app' | 'email' | 'both')}
              >
                <option value="app">App notification</option>
                <option value="email">Email notification</option>
                <option value="both">Both</option>
              </select>
            </div>
            {deliveryType !== 'app' ? (
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>External Emails (comma separated)</label>
                <input
                  type="text"
                  placeholder="alice@example.com, bob@example.com"
                  className={`w-full px-4 py-2 rounded-lg border border-gray-200`}
                  value={externalEmails}
                  onChange={(e) => setExternalEmails(e.target.value)}
                />
              </div>
            ) : null}
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('push.schedule')}</label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  className={`px-4 py-2 rounded-lg border ${touched.scheduleDate && errors.schedule ? 'border-red-500' : 'border-gray-200'}`}
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  onBlur={() => handleBlur('scheduleDate')}
                />
                <input
                  type="time"
                  className={`px-4 py-2 rounded-lg border ${touched.scheduleTime && errors.schedule ? 'border-red-500' : 'border-gray-200'}`}
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  onBlur={() => handleBlur('scheduleTime')}
                />
              </div>
              {(touched.scheduleDate || touched.scheduleTime) && errors.schedule ? (
                <p className="mt-1 text-sm text-red-600">{errors.schedule}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => {
                void handleSend();
              }}
              disabled={isSending}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white"
              style={{ backgroundColor: '#C12D32', opacity: isSending ? 0.7 : 1 }}
            >
              <Send className="w-5 h-5" />
              <span>{isSending ? t('push.sending') : t('push.sendNotification')}</span>
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl" style={{ color: '#333' }}>{t('push.preview')}</h2>
            {history.length > 0 ? (
              <button
                type="button"
                onClick={clearHistory}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-gray-200"
                style={{ color: '#666' }}
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            ) : null}
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFF9EF' }}>
            <div className="text-sm mb-2" style={{ color: '#333' }}>
              {title.trim() || t('push.previewTitle')}
            </div>
            <p className="text-xs" style={{ color: '#666' }}>
              {message.trim() || t('push.previewBody')}
            </p>
          </div>

          <div className="mt-4 space-y-2 max-h-80 overflow-auto">
            {history.length === 0 ? (
              <p className="text-xs" style={{ color: '#999' }}>
                No notification history yet.
              </p>
            ) : (
              history.map((item) => (
                <div key={item.id} className="p-3 rounded-lg border border-gray-100" style={{ backgroundColor: '#FAFAFA' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate" style={{ color: '#333' }}>
                        {item.title}
                      </div>
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: '#666' }}>
                        {item.body}
                      </p>
                      <div className="text-[11px] mt-1" style={{ color: '#888' }}>
                        {new Date(item.createdAt).toLocaleString()} • {item.audience} • {item.status}
                      </div>
                      <div className="text-[11px]" style={{ color: '#888' }}>
                        {item.deliveryType === 'app' ? 'App notification' : item.deliveryType === 'email' ? 'Email notification' : 'Both'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteHistoryItem(item.id)}
                      className="p-1 rounded hover:bg-gray-200"
                      aria-label="Delete history item"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" style={{ color: '#777' }} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
