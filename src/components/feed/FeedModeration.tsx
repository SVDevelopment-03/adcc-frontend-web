import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Ban,
  AlertTriangle,
  Calendar,
  Eye,
  Heart,
  MessageSquare,
  UserRound,
  Users,
  MapPin,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  FeedPost,
  getFeedPosts,
  getFeedPostsCount,
  moderateFeedPost,
  moderateFeedUserBan,
  FeedPostStatus,
} from '../../services/feedPostsApi';

type TabType = 'pending' | 'approved' | 'reported' | 'banned';
type FeedCounts = Record<TabType, number>;

function timeAgo(input?: string): string {
  if (!input) return '';
  const t = new Date(input).getTime();
  if (!Number.isFinite(t)) return '';
  const diff = Date.now() - t;
  const seconds = Math.max(0, Math.floor(diff / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

type OriginType = 'Event' | 'Community' | 'User Post';

function getOriginIcon(origin: OriginType) {
  switch (origin) {
    case 'Event':
      return <Calendar className="w-4 h-4" style={{ color: '#C12D32' }} />;
    case 'Community':
      return <Users className="w-4 h-4" style={{ color: '#C12D32' }} />;
    default:
      return <MapPin className="w-4 h-4" style={{ color: '#C12D32' }} />;
  }
}

export function FeedModeration() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [counts, setCounts] = useState<FeedCounts>({ pending: 0, approved: 0, reported: 0, banned: 0 });
  const [isCountsLoading, setIsCountsLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const refreshCounts = async () => {
    setIsCountsLoading(true);
    try {
      const [pending, approved, reported] = await Promise.all([
        getFeedPostsCount({ status: 'pending', reported: false }),
        getFeedPostsCount({ status: 'approved', reported: false }),
        getFeedPostsCount({ reported: true }),
      ]);
      // Backend doesn't currently provide a dedicated "banned" filter for feed posts.
      // We keep the tab for UI parity and populate it from the latest loaded list.
      setCounts((prev) => ({ ...prev, pending, approved, reported }));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load feed counts');
      setCounts({ pending: 0, approved: 0, reported: 0, banned: 0 });
    } finally {
      setIsCountsLoading(false);
    }
  };

  const fetchPostsForTab = async (tab: TabType) => {
    setIsLoading(true);
    // Clear while loading so the spinner displays during tab switches.
    setPosts([]);
    try {
      const query =
        tab === 'reported'
          ? { reported: true as boolean, limit: 50 }
          : tab === 'banned'
            ? { limit: 50 }
            : { status: tab as FeedPostStatus, reported: false, limit: 50 };

      const data = await getFeedPosts(query);

      // In case backend returns mixed results for a query, enforce UI categorization here.
      const filtered = data.filter((p) => {
        const status = (p.status ?? '') as FeedPostStatus | '';
        const isReported = p.reported === true;

        // Reported tab represents all reported posts.
        if (tab === 'reported') return isReported;
        if (tab === 'banned') return p.banFeedPost === true;
        // If backend doesn't return status, default to the tab expectation.
        if (tab === 'pending') return !isReported && (status === 'pending' || status === '');
        // Approved tab should always show approved posts, even if reported flag is true.
        if (tab === 'approved') return status === 'approved';
        return false;
      });

      setPosts(filtered);
      setCounts((prev) => ({ ...prev, banned: data.filter((p) => p.banFeedPost === true).length }));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to load feed posts');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshCounts();
  }, []);

  useEffect(() => {
    void fetchPostsForTab(activeTab);
  }, [activeTab]);

  const getPostId = (post: FeedPost): string | null => post._id ?? post.id ?? null;
  const getUserId = (post: FeedPost): string | null => {
    if (post.userId) return post.userId;
    if (typeof post.createdBy !== 'string') return post.createdBy?._id ?? null;
    return null;
  };

  const handleApprove = async (postId: string) => {
    const nextStatus: FeedPostStatus = 'approved';
    try {
      await moderateFeedPost(postId, { status: nextStatus, reported: false });
      toast.success('Post approved');
      await fetchPostsForTab(activeTab);
      await refreshCounts();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to approve post');
    }
  };

  const handleReject = async (postId: string) => {
    const nextStatus: FeedPostStatus = 'rejected';
    try {
      await moderateFeedPost(postId, { status: nextStatus, reported: false });
      toast.success('Post rejected');
      await fetchPostsForTab(activeTab);
      await refreshCounts();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to reject post');
    }
  };

  const handleBanUser = async (userId: string, banFeedPost: boolean) => {
    try {
      await moderateFeedUserBan(userId, banFeedPost);
      toast.success(banFeedPost ? 'User banned from feed' : 'User unbanned from feed');
      await fetchPostsForTab(activeTab);
      await refreshCounts();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update user ban status');
    }
  };

  const tabs = useMemo(
    () => (['pending', 'approved', 'reported', 'banned'] as TabType[]),
    [],
  );

  const bannedUsers = useMemo(() => {
    const usersMap = new Map<
      string,
      { userId: string; name: string; avatarUrl: string | null; isBanned: boolean }
    >();
    for (const p of posts) {
      const uid = getUserId(p);
      if (!uid) continue;
      const name = typeof p.createdBy === 'string' ? p.createdBy : p.createdBy?.fullName ?? '—';
      const avatar = typeof p.createdBy === 'string' ? null : p.createdBy?.profileImage ?? null;
      const existing = usersMap.get(uid);
      const isBanned = p.banFeedPost === true;
      if (!existing) {
        usersMap.set(uid, { userId: uid, name, avatarUrl: avatar, isBanned });
      } else if (!existing.isBanned && isBanned) {
        usersMap.set(uid, { ...existing, isBanned: true });
      }
    }
    return Array.from(usersMap.values()).filter((u) => u.isBanned);
  }, [posts]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Feed Moderation</h1>
        <p style={{ color: '#666' }}>Review and moderate community posts and content</p>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: '#ECC180' }}>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>Pending Review</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>
            {isCountsLoading ? '—' : counts.pending.toLocaleString()}
          </p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5" style={{ color: '#10B981' }} />
            <span className="text-sm" style={{ color: '#666' }}>Approved</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>
            {isCountsLoading ? '—' : counts.approved.toLocaleString()}
          </p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-2">
            <Ban className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>Reported</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>
            {isCountsLoading ? '—' : counts.reported.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-3 px-2 text-sm capitalize"
              style={{
                color: activeTab === tab ? '#C12D32' : '#666',
                borderBottom: activeTab === tab ? '2px solid #C12D32' : '2px solid transparent',
              }}
            >
              {tab} ({isCountsLoading ? '—' : counts[tab].toLocaleString()})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading && posts.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#C12D32' }} />
          </div>
        ) : null}

        {!isLoading && activeTab === 'banned' ? (
          <div className="space-y-4">
            {bannedUsers.length === 0 ? (
              <div className="text-center py-12 p-6 rounded-2xl bg-white">
                <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#ECC180' }} />
                <h3 className="text-xl mb-2" style={{ color: '#333' }}>No banned users</h3>
                <p style={{ color: '#666' }}>No users are currently banned from posting to the feed.</p>
              </div>
            ) : (
              bannedUsers.map((u) => (
                <div key={u.userId} className="p-6 rounded-2xl shadow-sm bg-white hover:shadow-md transition-all">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <UserRound className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium" style={{ color: '#333' }}>{u.name}</div>
                        <div className="text-sm" style={{ color: '#666' }}>Banned from posting to feed</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleBanUser(u.userId, false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                      style={{ backgroundColor: '#ECC180', color: '#333' }}
                    >
                      <Ban className="w-4 h-4" />
                      <span>Unban User</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}

        {!isLoading && activeTab !== 'banned' && posts.length === 0 ? (
          <div className="text-center py-12 p-6 rounded-2xl bg-white">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#ECC180' }} />
            <h3 className="text-xl mb-2" style={{ color: '#333' }}>No {activeTab} posts</h3>
            <p style={{ color: '#666' }}>
              {activeTab === 'pending' && 'All posts have been reviewed'}
              {activeTab === 'approved' && 'No approved posts yet'}
              {activeTab === 'reported' && 'No reported posts at the moment'}
            </p>
          </div>
        ) : null}

        {posts.map((post) => {
          const postId = getPostId(post);
          const userId = getUserId(post);
          if (!postId) return null;

          const userName =
            typeof post.createdBy === 'string'
              ? post.createdBy
              : post.createdBy?.fullName ?? '—';

          const avatarUrl =
            typeof post.createdBy === 'string'
              ? null
              : post.createdBy?.profileImage ?? null;

          const likeCount = (post as any).likesCount ?? (post as any).likes ?? null;
          const commentCount = (post as any).commentsCount ?? (post as any).comments ?? null;

          const imageUrl = post.image ?? (post as any).imageUrl ?? null;
          const content = post.description || post.title || '';
          const createdLabel = timeAgo(post.createdAt);

          const reportedReason =
            (post as any).reportReason ??
            (post as any).reportedReason ??
            (post as any).moderation?.reason ??
            null;

          const origin: OriginType = (() => {
            if ((post as any).event || (post as any).eventTitle) return 'Event';
            if ((post as any).community || (post as any).communityTitle) return 'Community';
            return 'User Post';
          })();

          const originName =
            (post as any).event?.title ??
            (post as any).eventTitle ??
            (post as any).community?.title ??
            (post as any).communityTitle ??
            null;

          const isReported = post.reported === `true` || activeTab === 'reported';
          const canModerate = activeTab === 'pending' || activeTab === 'reported' || isReported;
          const isApproved = activeTab === 'approved' || post.status === 'approved';

          return (
            <div key={postId} className="p-6 rounded-2xl shadow-sm bg-white hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserRound className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3 gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium" style={{ color: '#333' }}>{userName}</span>
                        {createdLabel ? (
                          <span className="text-xs" style={{ color: '#999' }}>{createdLabel}</span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        {getOriginIcon(origin)}
                        <span className="text-xs" style={{ color: '#666' }}>
                          {origin}
                          {originName ? ` • ${originName}` : ''}
                        </span>
                      </div>
                    </div>

                    {activeTab === 'reported' && reportedReason ? (
                      <div className="px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: '#EF4444' }}>
                        Reported: {reportedReason}
                      </div>
                    ) : null}
                  </div>

                  {content ? (
                    <p className="text-sm mb-3" style={{ color: '#666' }}>{content}</p>
                  ) : null}

                  {imageUrl ? (
                    <div className="mb-3">
                      <img
                        src={imageUrl}
                        alt=""
                        className="w-full max-w-md h-48 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          setSelectedPost(post);
                          setShowDetailModal(true);
                        }}
                      />
                    </div>
                  ) : null}

                  <div className="flex items-center gap-4 mb-4 text-sm" style={{ color: '#999' }}>
                    <span>❤️ {likeCount == null ? '—' : String(likeCount)} likes</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {commentCount == null ? '—' : String(commentCount)} comments
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPost(post);
                        setShowDetailModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                      style={{ backgroundColor: '#ECC180', color: '#333' }}
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>

                    {canModerate ? (
                      <>
                        <button
                          onClick={() => void handleApprove(postId)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
                          style={{ backgroundColor: '#10B981' }}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>

                        <button
                          onClick={() => void handleReject(postId)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
                          style={{ backgroundColor: '#C12D32' }}
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>

                        <button
                          onClick={() => userId && void handleBanUser(userId, true)}
                          disabled={!userId}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
                          style={{
                            backgroundColor: '#EF4444',
                            opacity: userId ? 1 : 0.6,
                            cursor: userId ? 'pointer' : 'not-allowed',
                          }}
                        >
                          <Ban className="w-4 h-4" />
                          <span>Ban User</span>
                        </button>
                      </>
                    ) : null}

                    {isApproved ? (
                      <button
                        onClick={() => void handleReject(postId)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
                        style={{ backgroundColor: '#6B7280' }}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showDetailModal && selectedPost ? (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl mb-4" style={{ color: '#333' }}>Post Details</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {typeof selectedPost.createdBy !== 'string' && selectedPost.createdBy?.profileImage ? (
                    <img src={selectedPost.createdBy.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserRound className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium" style={{ color: '#333' }}>
                    {typeof selectedPost.createdBy === 'string'
                      ? selectedPost.createdBy
                      : selectedPost.createdBy?.fullName ?? '—'}
                  </p>
                  <p className="text-sm" style={{ color: '#666' }}>{timeAgo(selectedPost.createdAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm mb-1" style={{ color: '#666' }}>Content</p>
                <p style={{ color: '#333' }}>{selectedPost.description || selectedPost.title || '—'}</p>
              </div>

              {(selectedPost.image ?? (selectedPost as any).imageUrl) ? (
                <div>
                  <p className="text-sm mb-2" style={{ color: '#666' }}>Image</p>
                  <img
                    src={(selectedPost.image ?? (selectedPost as any).imageUrl) as string}
                    alt=""
                    className="w-full rounded-lg"
                  />
                </div>
              ) : null}

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200"
                  style={{ color: '#666' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
