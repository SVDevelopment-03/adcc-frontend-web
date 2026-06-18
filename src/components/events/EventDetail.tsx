import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Edit, Bell, ImageIcon, Trophy, UserCheck, Users, Star, Calendar, MapPin, Clock, Award, Upload, Trash2, Plus, Send } from 'lucide-react';
import { toast } from 'sonner';
import { addEventGalleryImages, deleteEventGalleryImage, getEventById, updateEvent as updateEventApi, EventApiResponse, getEventResults, adminUpdateParticipantResult } from '../../services/eventsApi';
import { getAllCommunities } from '../../services/communitiesApi';
import { sendTestBroadcastPush } from '../../services/authApi';
import { DetailPageSkeleton } from '../ui/skeleton';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export function EventDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const eventId = id ?? '';
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventApiResponse | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingField, setUpdatingField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'results' | 'gallery' | 'notifications'>('overview');
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [deleteImageUrl, setDeleteImageUrl] = useState<string | null>(null);

  // Notifications tab state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifDeliveryType, setNotifDeliveryType] = useState<'app' | 'email' | 'both'>('app');
  const [notifAudience, setNotifAudience] = useState<'all' | 'registered' | 'checked-in'>('all');
  const [isSendingNotif, setIsSendingNotif] = useState(false);
  const [notifResult, setNotifResult] = useState<{ ok: boolean; message: string; count: number } | null>(null);

  // Results tab state
  const [communities, setCommunities] = useState<any[]>([]);
  const [resultEdits, setResultEdits] = useState<Record<string, { rank: string; time: string; points: string; saving: boolean }>>({});
  const [showAddResult, setShowAddResult] = useState(false);
  const [addForm, setAddForm] = useState({ participantId: '', communityId: '', time: '', rank: '', points: '' });
  const [addingSaving, setAddingSaving] = useState(false);

  useEffect(() => {
    loadEvent();
    getAllCommunities().then(data => setCommunities(Array.isArray(data) ? data : [])).catch(() => {});
  }, [id]);

  // Re-fetch when language changes so backend returns translated values
  useEffect(() => {
    const onLanguageChanged = () => { loadEvent(); };
    i18n.on('languageChanged', onLanguageChanged);
    return () => { i18n.off('languageChanged', onLanguageChanged); };
  }, [i18n]);

  const loadEvent = async () => {
    if (!eventId || eventId === 'undefined') {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [fetchedEvent, fetchedParticipants] = await Promise.all([
        getEventById(eventId),
        getEventResults(eventId),
        // getparticipants(eventId),
      ]);
      setEvent(fetchedEvent);
      setParticipants(fetchedParticipants);
    } catch (error: any) {
      console.error('Error loading event:', error);
      toast.error(t('events.detail.toasts.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeStatus = (s: string | undefined) =>
    s ? String(s).toLowerCase().replace(/_/g, '-') : 'registered';

const formatTimeInput = (raw: string): string => {
    const digits = raw.replace(/\D/g, '').slice(0, 6);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4)}`;
  };

  const normalizedParticipants = participants.map((p: any) => ({
    id: p._id || p.id,
    userId: p.user?._id || p.userId,
    userName: p.user?.fullName || p.userName || '-',
    userCommunity: p.community?.title || p.userCommunity || '-',
    communityId: p.community?._id || p.community?.id || '',
    status: normalizeStatus(p.status),
    rank: p.rank ?? null,
    time: p.time || '',
    points: p.pointsEarned ?? null,
  }));

  const checkedInParticipants = normalizedParticipants.filter(
    p => p.status === 'checked-in' || p.status === 'completed'
  );

  const handleSaveResult = async (participant: any) => {
    const edit = resultEdits[participant.id];
    if (!edit || !eventId) return;
    const rankNum = edit.rank ? parseInt(edit.rank) : null;
    const pointsNum = edit.points ? parseInt(edit.points) : null;
    setResultEdits(prev => ({ ...prev, [participant.id]: { ...prev[participant.id], saving: true } }));
    try {
      await adminUpdateParticipantResult(eventId, participant.userId, { rank: rankNum, time: edit.time || undefined, points: pointsNum });
      await loadEvent();
      setResultEdits(prev => { const next = { ...prev }; delete next[participant.id]; return next; });
      toast.success('Result saved');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save result');
      setResultEdits(prev => ({ ...prev, [participant.id]: { ...prev[participant.id], saving: false } }));
    }
  };

  const handleAddResult = async () => {
    if (!addForm.participantId || !eventId) { toast.error('Select a participant'); return; }
    const target = normalizedParticipants.find(p => p.id === addForm.participantId);
    if (!target?.userId) return;
    const rankNum = addForm.rank ? parseInt(addForm.rank) : null;
    const pointsNum = addForm.points ? parseInt(addForm.points) : null;
    setAddingSaving(true);
    try {
      await adminUpdateParticipantResult(eventId, target.userId, { rank: rankNum, time: addForm.time || undefined, points: pointsNum });
      await loadEvent();
      setAddForm({ participantId: '', communityId: '', time: '', rank: '', points: '' });
      setShowAddResult(false);
      toast.success('Result added');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add result');
    } finally {
      setAddingSaving(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !eventId || eventId === 'undefined' || files.length === 0) return;

    setIsUploadingGallery(true);
    try {
      const result = await addEventGalleryImages(eventId, Array.from(files));

      const nextGallery =
        (result?.galleryImages && Array.isArray(result.galleryImages) && result.galleryImages) ||
        (result?.data?.galleryImages && Array.isArray(result.data.galleryImages) && result.data.galleryImages) ||
        null;

      if (nextGallery) {
        setEvent((prev) => (prev ? { ...prev, galleryImages: nextGallery } : prev));
      } else if (result?.addedImages && Array.isArray(result.addedImages)) {
        setEvent((prev) =>
          prev ? { ...prev, galleryImages: [...(prev.galleryImages || []), ...result.addedImages] } : prev
        );
      } else {
        const refreshed = await getEventById(eventId);
        setEvent(refreshed);
      }

      toast.success(t('events.detail.toasts.galleryUploadSuccess'));
    } catch (error: any) {
      console.error('Error uploading event gallery images:', error);
      toast.error(error?.response?.data?.message || t('events.detail.toasts.galleryUploadError'));
    } finally {
      setIsUploadingGallery(false);
      e.target.value = '';
    }
  };

  const handleGalleryDelete = async () => {
    if (!eventId || !deleteImageUrl) return;
    try {
      await deleteEventGalleryImage(eventId, deleteImageUrl);
      setEvent((prev) =>
        prev ? { ...prev, galleryImages: prev.galleryImages.filter((img) => img !== deleteImageUrl) } : prev
      );
      toast.success(t('events.detail.toasts.imageRemoved') || 'Image removed successfully');
    } catch (error: any) {
      console.error('Error deleting gallery image:', error);
      toast.error(error?.response?.data?.message || t('events.detail.toasts.deleteImageError') || 'Failed to delete image');
    } finally {
      setDeleteImageUrl(null);
    }
  };

  // console.log('participants',participants);

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (!event) {
    return <div className="text-center py-8" style={{ color: '#666' }}>{t('events.detail.notFound')}</div>;
  }

  // Page access is gated by manage_events in Layout; actions follow that permission.
  const canEdit = true;


  // const event = getEvent(eventId);
  // const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'results' | 'gallery' | 'notifications'>('overview');


   const handleCancel = async () => {
    if (confirm(t('events.detail.confirmCancel'))) {
      setIsSaving(true);
      try {
        await updateEventApi(eventId, { status: 'cancelled' });
        toast.success(t('events.detail.toasts.cancelSuccess'));
        loadEvent(); // Reload event to reflect changes
      } catch (error: any) {
        console.error('Error cancelling event:', error);
        toast.error(error.response?.data?.message || t('events.detail.toasts.failedToCancelEvent'));
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDuplicate = () => {
    // toast.success('Event duplicated successfully');
    // navigate('/sevents');
  };

  const handleSendEventNotif = async () => {
    if (!notifTitle.trim() || !notifMessage.trim()) {
      toast.error('Title and message are required');
      return;
    }

    // Filter participants by audience selection
    let targetParticipants = normalizedParticipants;
    if (notifAudience === 'registered') {
      targetParticipants = normalizedParticipants.filter(
        p => p.status !== 'cancelled' && p.status !== 'no-show'
      );
    } else if (notifAudience === 'checked-in') {
      targetParticipants = normalizedParticipants.filter(
        p => p.status === 'checked-in' || p.status === 'completed'
      );
    }

    const selectedUserIds = targetParticipants
      .map(p => p.userId)
      .filter(Boolean) as string[];

    if (selectedUserIds.length === 0) {
      toast.error('No eligible participants found for the selected audience');
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
      const label = notifDeliveryType === 'app'
        ? 'push notification'
        : notifDeliveryType === 'email'
          ? 'email'
          : 'notification';
      setNotifResult({ ok: true, message: `${label} sent to ${selectedUserIds.length} participant(s)`, count: selectedUserIds.length });
      toast.success(`Notification sent to ${selectedUserIds.length} participant(s)`);
      setNotifTitle('');
      setNotifMessage('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send notification';
      setNotifResult({ ok: false, message: msg, count: 0 });
      toast.error(msg);
    } finally {
      setIsSendingNotif(false);
    }
  };

  const handleFeaturedToggle = async () => {
    const next = !(event!.featured ?? true);
    setUpdatingField('featured');
    try {
      await updateEventApi(eventId, { featured: next });
      setEvent((prev) => (prev ? { ...prev, featured: next } : null));
      toast.success(next ? t('events.detail.toasts.eventFeatured') : t('events.detail.toasts.eventUnfeatured'));
    } catch (e: any) {
      toast.error(e.response?.data?.message || t('events.detail.toasts.failedToUpdate'));
    } finally {
      setUpdatingField(null);
    }
  };

  const handleRegistrationToggle = async () => {
    const next = !(event!.registrationOpen ?? true);
    setUpdatingField('registration');
    try {
      await updateEventApi(eventId, { registrationOpen: next });
      setEvent((prev) => (prev ? { ...prev, registrationOpen: next } : null));
      toast.success(next ? t('events.detail.toasts.registrationOpened') : t('events.detail.toasts.registrationClosed'));
    } catch (e: any) {
      toast.error(e.response?.data?.message || t('events.detail.toasts.failedToUpdate'));
    } finally {
      setUpdatingField(null);
    }
  };

    console.log('event.mainImage',event?.mainImage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/events')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
          >
            <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl" style={{ color: '#333' }}>{event.title}</h1>
              {event.isFeatured && (
                <Star className="w-6 h-6 fill-current" style={{ color: '#F59E0B' }} />
              )}
            </div>
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1 rounded-full text-xs text-white"
                style={{
                  backgroundColor:
                    event.category === 'Race' ? '#C12D32' :
                    event.category === 'Community Ride' ? '#10B981' :
                    event.category === 'Training & Clinics' ? '#3B82F6' :
                    event.category === 'Awareness Rides' ? '#EC4899' :
                    event.category === 'Family & Kids' ? '#F59E0B' : '#8B5CF6'
                }}
              >
                {t(`data.eventCategories.${event.category}`, event.category)}
              </span>
              <span
                className="px-3 py-1 rounded-full text-xs capitalize text-white"
                style={{
                  backgroundColor:
                    event.status === 'Open' ? '#10B981' :
                    event.status === 'Full' ? '#F59E0B' :
                    event.status === 'Completed' ? '#3B82F6' :
                    event.status === 'Draft' ? '#6B7280' : '#EF4444'
                }}
              >
                {t(`data.statuses.${event.status}`, event.status)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(`/events/${id}/edit`)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all hover:shadow-lg"
          style={{ backgroundColor: '#C12D32' }}
        >
          <Edit className="w-5 h-5" />
          {t('events.detail.editButton')}
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4" style={{ color: '#999' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('events.detail.registered')}</span>
          </div>
          <p className="text-2xl" style={{ color: '#333' }}>
            {event.currentParticipants} / {event.maxParticipants}
          </p>
          <div className="mt-2 h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(event.currentParticipants / event.maxParticipants) * 100}%`,
                backgroundColor: '#C12D32'
              }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-4 h-4" style={{ color: '#999' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('events.detail.checkedIn')}</span>
          </div>
          <p className="text-2xl" style={{ color: '#333' }}>
            {event.stats?.checkedIn || 0}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4" style={{ color: '#999' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('events.detail.completed')}</span>
          </div>
          <p className="text-2xl" style={{ color: '#333' }}>
            {event.stats?.completed || 0}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4" style={{ color: '#999' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('events.detail.rewardPoints')}</span>
          </div>
          <p className="text-2xl" style={{ color: '#333' }}>
            {/* {event.rewards.points} */}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className="px-6 py-3 transition-colors"
          style={{
            color: activeTab === 'overview' ? '#C12D32' : '#666',
            borderBottom: activeTab === 'overview' ? '2px solid #C12D32' : 'none',
          }}
        >
          {t('events.detail.tabs.overview')}
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className="px-6 py-3 transition-colors"
          style={{
            color: activeTab === 'participants' ? '#C12D32' : '#666',
            borderBottom: activeTab === 'participants' ? '2px solid #C12D32' : 'none',
          }}
        >
          {t('events.detail.tabs.participants')}
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className="px-6 py-3 transition-colors"
          style={{
            color: activeTab === 'results' ? '#C12D32' : '#666',
            borderBottom: activeTab === 'results' ? '2px solid #C12D32' : 'none',
          }}
        >
          {t('events.detail.tabs.results')}
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className="px-6 py-3 transition-colors"
          style={{
            color: activeTab === 'gallery' ? '#C12D32' : '#666',
            borderBottom: activeTab === 'gallery' ? '2px solid #C12D32' : 'none',
          }}
        >
          {t('events.detail.tabs.gallery')}
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className="px-6 py-3 transition-colors"
          style={{
            color: activeTab === 'notifications' ? '#C12D32' : '#666',
            borderBottom: activeTab === 'notifications' ? '2px solid #C12D32' : 'none',
          }}
        >
          {t('events.detail.tabs.notifications')}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Image */}
            <div className="rounded-2xl overflow-hidden shadow-sm">
              <img src={event.mainImage} alt={event.title} className="w-full h-64 object-cover" />
            </div>

            {/* Description */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-3" style={{ color: '#333' }}>{t('events.detail.aboutEvent')}</h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>{event.description}</p>
            </div>

            {/* Event Details */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('events.detail.eventDetails')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 mt-1" style={{ color: '#999' }} />
                  
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.date')}</p>
                    <p style={{ color: '#333' }}>
                      {new Date(event.eventDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 mt-1" style={{ color: '#999' }} />
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.time')}</p>
                    <p style={{ color: '#333' }}>{event.eventTime} - {event.endTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-1" style={{ color: '#999' }} />
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.location')}</p>
                    <p style={{ color: '#333' }}>{event.trackName}</p>
                    <p className="text-sm" style={{ color: '#999' }}>{event.city}, {event.country}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 mt-1" style={{ color: '#999' }} />
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.community')}</p>
                    <p style={{ color: '#333' }}>
                      {typeof event.communityId === 'object' && event.communityId
                        ? (event.communityId as any).title || (event.communityId as any).name || ''
                        : (event as any).communityName || ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Schedule */}
            {event.schedule.length > 0 && (
              <div className="p-6 rounded-2xl bg-white shadow-sm">
                <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('events.detail.eventSchedule')}</h3>
                <div className="space-y-3">
                  {event.schedule.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                      <span className="text-sm font-medium" style={{ color: '#C12D32', minWidth: '60px' }}>
                        {item.time}
                      </span>
                      <span style={{ color: '#666' }}>{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('events.detail.amenitiesHeading')}</h3>
              <div className="flex flex-wrap gap-2">
                {event.amenities.map(amenity => (
                  <span
                    key={amenity}
                    className="px-3 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: '#ECC180', color: '#333' }}
                  >
                    {t(`events.create.amenityOptions.${({'medical support': 'medicalSupport', 'bike service': 'bikeService'} as Record<string, string>)[amenity] || amenity}`, amenity)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ride Info */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('events.detail.rideInfo')}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.distance')}</p>
                  <p className="text-xl" style={{ color: '#333' }}>{event.distance} {t('common.km')}</p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.difficulty')}</p>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-sm text-white"
                    style={{
                      backgroundColor: 
                        event.difficulty === 'Easy' ? '#10B981' :
                        event.difficulty === 'Medium' ? '#F59E0B' : '#EF4444'
                    }}
                  >
                    {event.difficulty}
                  </span>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.registrationFee')}</p>
                  {(() => {
                    const isPaid = event.registrationFeeType === 'paid';
                    const amount = Math.max(0, Number(event.registrationFeeAmount) || 0);
                    const formattedAmount = new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-AE' : 'en-AE', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    }).format(amount);

                    return (
                      <p className="text-xl" style={{ color: isPaid ? '#C12D32' : '#10B981' }}>
                        {isPaid
                          ? `${t('events.create.registrationFeeOptions.paid')} • AED ${formattedAmount}`
                          : t('common.free')}
                      </p>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Eligibility */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('events.detail.eligibility')}</h3>
              {(() => {
                const elig = Array.isArray((event as any).eligibility)
                  ? (event as any).eligibility[0]
                  : (event as any).eligibility;
                return (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.ageRequirement')}</p>
                      <p style={{ color: '#333' }}>{event.minAge ? `${event.minAge}+` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.bikeType')}</p>
                      <p style={{ color: '#333' }}>{elig?.roadBikeOnly ? t('events.detail.roadBikeOnly', 'Road Bike Only') : t('events.detail.anyBike', 'Any')}</p>
                    </div>
                    <div>
                      <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.experienceLevel')}</p>
                      <p style={{ color: '#333' }} className="capitalize">{elig?.experienceLevel || '-'}</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Rewards */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('events.detail.rewardsHeading')}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.points')}</p>
                  {/* <p className="text-xl" style={{ color: '#C12D32' }}>{event.rewards.points} pts</p> */}
                </div>
                {/* {event.rewards.badgeName && (
                  <div> */}
                    <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.badge')}</p>
                    {/* <p style={{ color: '#333' }}>{event.rewards.badgeName}</p>
                  </div>
                )} */}
              </div>
            </div>

            {/* Settings */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('events.detail.settings')}</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>{t('events.detail.labels.featured')}</span>
                  <span className="text-sm" style={{ color: '#333' }}>{event.isFeatured ? t('common.yes') : t('common.no')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>{t('events.detail.labels.cancellation')}</span>
                  <span className="text-sm" style={{ color: '#333' }}>{event.allowCancellation ? t('events.detail.allowed') : t('events.detail.notAllowed')}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 rounded-2xl bg-white shadow-sm space-y-3">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('events.detail.quickActions')}</h3>
              
              <button
                onClick={() => navigate('event-participants', { selectedEventId: eventId })}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:shadow-md"
                style={{ backgroundColor: '#3B82F6' }}
              >
                <UserCheck className="w-5 h-5" />
                {t('events.detail.manageParticipants')}
              </button>

              <button
                onClick={() => navigate(`/events/${eventId}/results`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:shadow-md"
                style={{ backgroundColor: '#F59E0B' }}
              >
                <Trophy className="w-5 h-5" />
                {t('events.detail.enterResults', 'Enter Results')}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'participants' && (
        <div className="p-6 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg" style={{ color: '#333' }}>{t('events.detail.participantsTab.heading')}</h3>
            <button
              onClick={() => navigate('event-participants', { selectedEventId: id })}
              className="px-4 py-2 rounded-lg text-white transition-all hover:shadow-md"
              style={{ backgroundColor: '#C12D32' }}
            >
              {t('events.detail.fullManagementView')}
            </button>
          </div>
          <div className="space-y-4">
            {participants.length === 0 ? (
              <p style={{ color: '#666' }}>{t('events.detail.participantsTab.noParticipants')}</p>
            ) : (
              <div className="grid gap-3">
                {participants.slice(0, 10).map((participant, index) => (
                  <div key={participant._id || participant.id || index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5" style={{ color: '#666' }} />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: '#333' }}>{participant.user?.fullName || participant.userName || t('events.detail.participantsTab.unknown')}</p>
                        <p className="text-sm" style={{ color: '#666' }}>{participant.user?.email || participant.userCommunity || t('events.detail.participantsTab.noCommunity')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        participant.status === 'checked-in' ? 'bg-green-100 text-green-800' :
                        participant.rank ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {participant.rank ? t('events.detail.participantsTab.rankLabel', { rank: participant.rank }) : (participant.status || t('events.detail.participantsTab.registered'))}
                      </span>
                    </div>
                  </div>
                ))}
                {participants.length > 10 && (
                  <p className="text-sm text-center" style={{ color: '#666' }}>
                    {t('events.detail.participantsTab.moreParticipants', { count: participants.length - 10 })}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5" style={{ color: '#C12D32' }} />
              <h3 className="text-lg" style={{ color: '#333' }}>Add Result Entry</h3>
            </div>
            <button
              onClick={() => setShowAddResult(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all hover:shadow-md"
              style={{ backgroundColor: showAddResult ? '#F3F4F6' : '#C12D32', color: showAddResult ? '#666' : '#fff' }}
            >
              <Plus className="w-4 h-4" />
              {showAddResult ? 'Cancel' : 'Add Result'}
            </button>
          </div>

          {/* Add Result Form */}
          {showAddResult && (
            <div className="p-6 border-b border-gray-100" style={{ backgroundColor: '#FAFAFA' }}>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-xs mb-1 font-medium" style={{ color: '#666' }}>Rank</label>
                  <input
                    type="number"
                    min={1}
                    value={addForm.rank}
                    onChange={e => setAddForm(f => ({ ...f, rank: e.target.value }))}
                    placeholder="e.g. 1"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-medium" style={{ color: '#666' }}>Rider Name</label>
                  <select
                    value={addForm.participantId}
                    onChange={e => {
                      const p = normalizedParticipants.find(p => p.id === e.target.value);
                      setAddForm(f => ({ ...f, participantId: e.target.value, communityId: p?.communityId || '' }));
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
                    style={{ color: addForm.participantId ? '#333' : '#999' }}
                  >
                    <option value="">Select rider...</option>
                    {normalizedParticipants.map(p => (
                      <option key={p.id} value={p.id}>{p.userName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1 font-medium" style={{ color: '#666' }}>Community</label>
                  <select
                    value={addForm.communityId}
                    onChange={e => setAddForm(f => ({ ...f, communityId: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
                    style={{ color: addForm.communityId ? '#333' : '#999' }}
                  >
                    <option value="">Select community...</option>
                    {communities.map(c => (
                      <option key={c._id || c.id} value={c._id || c.id}>{c.title || c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1 font-medium" style={{ color: '#666' }}>Time (HH:MM:SS)</label>
                  <input
                    type="text"
                    value={addForm.time}
                    onChange={e => setAddForm(f => ({ ...f, time: formatTimeInput(e.target.value) }))}
                    placeholder="00:00:00"
                    maxLength={8}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-medium" style={{ color: '#666' }}>Points</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={addForm.points}
                      onChange={e => setAddForm(f => ({ ...f, points: e.target.value }))}
                      placeholder="e.g. 300"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                    <button
                      onClick={handleAddResult}
                      disabled={addingSaving || !addForm.participantId}
                      className="px-4 py-2 rounded-lg text-sm text-white transition-all hover:shadow-md disabled:opacity-50"
                      style={{ backgroundColor: '#C12D32' }}
                    >
                      {addingSaving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary Table */}
          {checkedInParticipants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#FFF9EF' }}>
                    <th className="text-left px-5 py-3 text-sm font-medium" style={{ color: '#666' }}>Rank</th>
                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: '#666' }}>Rider Name</th>
                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: '#666' }}>Community</th>
                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: '#666' }}>Time</th>
                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: '#666' }}>Points</th>
                    <th className="text-right px-4 py-3 text-sm font-medium" style={{ color: '#666' }}>Save</th>
                  </tr>
                </thead>
                <tbody>
                  {checkedInParticipants
                    .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999))
                    .map(p => {
                      const edit = resultEdits[p.id];
                      const currentRank = edit ? edit.rank : (p.rank ? String(p.rank) : '');
                      const currentTime = edit ? edit.time : (p.time || '');
                      const currentPoints = edit ? edit.points : (p.points ? String(p.points) : '');
                      return (
                        <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-5 py-3">
                            <input
                              type="number"
                              min={1}
                              value={currentRank}
                              placeholder="—"
                              onChange={e => setResultEdits(prev => ({
                                ...prev,
                                [p.id]: { rank: e.target.value, time: prev[p.id]?.time ?? currentTime, points: prev[p.id]?.points ?? currentPoints, saving: false },
                              }))}
                              className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: '#333' }}>{p.userName}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: '#666' }}>{p.userCommunity}</td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={currentTime}
                              placeholder="HH:MM:SS"
                              maxLength={8}
                              onChange={e => setResultEdits(prev => ({
                                ...prev,
                                [p.id]: { rank: prev[p.id]?.rank ?? currentRank, time: formatTimeInput(e.target.value), points: prev[p.id]?.points ?? currentPoints, saving: false },
                              }))}
                              className="w-24 px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={0}
                              value={currentPoints}
                              placeholder="0"
                              onChange={e => setResultEdits(prev => ({
                                ...prev,
                                [p.id]: { rank: prev[p.id]?.rank ?? currentRank, time: prev[p.id]?.time ?? currentTime, points: e.target.value, saving: false },
                              }))}
                              className="w-20 px-2 py-1 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            {edit && (
                              <button
                                onClick={() => handleSaveResult(p)}
                                disabled={edit.saving}
                                className="px-3 py-1 rounded-lg text-xs text-white transition-all hover:shadow-md disabled:opacity-50"
                                style={{ backgroundColor: '#C12D32' }}
                              >
                                {edit.saving ? '…' : 'Save'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center" style={{ color: '#999' }}>
              <Trophy className="w-10 h-10 mx-auto mb-3" style={{ color: '#E5E7EB' }} />
              <p className="text-sm">No checked-in participants yet.</p>
              <p className="text-xs mt-1">Check in participants first, then add their results here.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="p-6 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg" style={{ color: '#333' }}>{t('events.detail.galleryTab.heading')}</h3>
            <label
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all hover:shadow-md cursor-pointer"
              style={{ backgroundColor: isUploadingGallery ? '#9CA3AF' : '#C12D32' }}
            >
              <Upload className="w-4 h-4" />
              <span>{isUploadingGallery ? t('common.loading') : t('events.detail.galleryTab.upload')}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                disabled={isUploadingGallery}
                onChange={handleGalleryUpload}
              />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {event.galleryImages.length > 0 ? (
              event.galleryImages.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={img} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setDeleteImageUrl(img)}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title={t('events.detail.galleryTab.deleteImage') || 'Delete image'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-3 p-12 text-center border-2 border-dashed rounded-lg" style={{ borderColor: '#E5E7EB' }}>
                <ImageIcon className="w-12 h-12 mx-auto mb-3" style={{ color: '#CCC' }} />
                <p style={{ color: '#999' }}>{t('events.detail.galleryTab.noImages')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Participant count banner */}
          <div className="flex items-center gap-3 p-4 rounded-xl border border-blue-100" style={{ backgroundColor: '#EFF6FF' }}>
            <Users className="w-5 h-5 flex-shrink-0" style={{ color: '#3B82F6' }} />
            <p className="text-sm" style={{ color: '#1D4ED8' }}>
              <span className="font-medium">{normalizedParticipants.length} enrolled participant(s)</span> for this event.
              Notifications will only be sent to the audience you select below.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white shadow-sm space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-5 h-5" style={{ color: '#C12D32' }} />
              <h3 className="text-lg" style={{ color: '#333' }}>Send Notification to Participants</h3>
            </div>

            {/* Audience selector */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#555' }}>Send To</label>
              <select
                value={notifAudience}
                onChange={e => setNotifAudience(e.target.value as typeof notifAudience)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
              >
                <option value="all">All Enrolled Participants ({normalizedParticipants.length})</option>
                <option value="registered">
                  Registered Only ({normalizedParticipants.filter(p => p.status !== 'cancelled' && p.status !== 'no-show').length})
                </option>
                <option value="checked-in">
                  Checked-in / Completed ({normalizedParticipants.filter(p => p.status === 'checked-in' || p.status === 'completed').length})
                </option>
              </select>
            </div>

            {/* Delivery type */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#555' }}>Delivery Method</label>
              <div className="flex gap-3">
                {(['app', 'email', 'both'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setNotifDeliveryType(type)}
                    className="flex-1 py-2 rounded-lg border text-sm transition-all capitalize"
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

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#555' }}>Notification Title</label>
              <input
                type="text"
                value={notifTitle}
                onChange={e => setNotifTitle(e.target.value)}
                placeholder="e.g. Event Reminder"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#555' }}>Message</label>
              <textarea
                value={notifMessage}
                onChange={e => setNotifMessage(e.target.value)}
                placeholder="Write your message to participants..."
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
              />
            </div>

            {/* Result box */}
            {notifResult && (
              <div
                className="flex items-start gap-3 p-4 rounded-lg border text-sm"
                style={{
                  backgroundColor: notifResult.ok ? '#F0FDF4' : '#FEF2F2',
                  borderColor: notifResult.ok ? '#86EFAC' : '#FECACA',
                  color: notifResult.ok ? '#15803D' : '#991B1B',
                }}
              >
                <Bell className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{notifResult.message}</span>
              </div>
            )}

            {/* Send button */}
            <button
              onClick={handleSendEventNotif}
              disabled={isSendingNotif || !notifTitle.trim() || !notifMessage.trim()}
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

      <ConfirmDialog
        open={!!deleteImageUrl}
        onClose={() => setDeleteImageUrl(null)}
        onConfirm={handleGalleryDelete}
        title={t('events.detail.galleryTab.confirmDeleteTitle')}
        message={t('events.detail.galleryTab.confirmDeleteMessage')}
        confirmLabel={t('events.detail.galleryTab.deleteImage')}
        cancelLabel={t('common.cancel')}
        icon={Trash2}
        iconBgColor="#FEE2E2"
        iconColor="#EF4444"
        confirmBgColor="#EF4444"
      />
    </div>
  );
}
