import axios, { AxiosError } from 'axios';
import api, { publicApi } from './api';

export type FeedPostStatus = 'pending' | 'rejected' | 'approved';

export interface FeedPost {
  _id?: string;
  id?: string;
  userId?: string;
  title: string;
  description: string;
  status?: FeedPostStatus;
  reported?: boolean;
  banFeedPost?: boolean;
  rejectedReason?: string;
  image?: string;
  createdBy?: string | { _id?: string; fullName?: string; profileImage?: string; banFeedPost?: boolean };
  createdAt?: string;
  updatedAt?: string;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const msg =
      axiosError.response?.data?.message ??
      axiosError.response?.data?.error ??
      (axiosError.response?.status === 401 && 'Unauthorized') ??
      (axiosError.response?.status === 403 && 'Forbidden') ??
      (axiosError.response?.status === 404 && 'Not found') ??
      (axiosError.response?.status && `Request failed (${axiosError.response.status})`) ??
      axiosError.message;

    return typeof msg === 'string' ? msg : fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

function normalizeBoolean(value: unknown): boolean | undefined {
  if (value === true || value === 'true' || value === 'True' || value === 1 || value === '1') return true;
  if (value === false || value === 'false' || value === 'False' || value === 0 || value === '0') return false;
  return undefined;
}

export interface GetFeedPostsParams {
  status?: FeedPostStatus;
  reported?: boolean;
  q?: string;
  page?: number;
  limit?: number;
}

function extractPaginationTotal(payload: any): number | null {
  const candidate =
    payload?.pagination?.total ??
    payload?.meta?.total ??
    payload?.total;
  const n =
    typeof candidate === 'string'
      ? Number.parseInt(candidate, 10)
      : typeof candidate === 'number'
        ? candidate
        : NaN;
  return Number.isFinite(n) ? n : null;
}

export const getFeedPostsCount = async (params?: GetFeedPostsParams): Promise<number> => {
  try {
    const { data } = await api.get<any>('/v1/feed-posts', {
      params: {
        status: params?.status,
        reported: params?.reported === undefined ? undefined : String(params.reported),
        q: params?.q,
        page: 1,
        limit: 1,
      },
    });

    const payload = data?.data ?? data;
    const total = extractPaginationTotal(payload);
    return total ?? 0;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load feed post counts'));
  }
};

const mapFeedPostsPayload = (data: any): FeedPost[] => {
  const payload = data?.data ?? data;
  const postsCandidate =
    payload?.posts ??
    payload?.feedPosts ??
    data?.posts ??
    data?.feedPosts ??
    [];

  if (!Array.isArray(postsCandidate)) return [];

    const locale = (typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('locale') : 'en') || 'en';

    return postsCandidate.map((p: any) => ({
      ...p,
      _id: p?._id ?? p?.id,
      id: p?.id ?? p?._id,
      // Prefer Arabic fields when client locale is Arabic or server provided `*Ar` values.
      title: locale === 'ar' ? (p?.titleAr ?? p?.title) : (p?.title ?? p?.titleAr),
      description:
        locale === 'ar'
          ? (p?.descriptionAr ?? p?.description)
          : (p?.description ?? p?.descriptionAr),
      userId:
        (typeof p?.userId === 'string' ? p.userId : p?.userId?._id) ??
        (typeof p?.createdBy === 'string' ? undefined : p?.createdBy?._id),
      
      image: p?.image ?? p?.imageUrl ?? p?.coverImage,
      banFeedPost: normalizeBoolean(
        p?.banFeedPost ??
        p?.user?.banFeedPost ??
        p?.createdBy?.banFeedPost ??
        p?.userId?.banFeedPost
      ),
      // Normalize reported/status coming from backend (it may be "true"/"false" or "Pending"/"Approved").
      reported: (() => {
        const raw =
          p?.reported ?? p?.isReported ?? p?.report ?? p?.moderation?.reported ?? p?.moderation?.isReported;
        return normalizeBoolean(raw);
      })(),
      status: (() => {
        const raw =
          p?.status ?? p?.moderationStatus ?? p?.postStatus ?? p?.state ?? p?.moderation?.status;

        if (typeof raw === 'string') {
          const v = raw.toLowerCase();
          if (v === 'pending') return 'pending';
          if (v === 'approved') return 'approved';
          if (v === 'rejected') return 'rejected';
          return undefined;
        }

        if (raw === 'pending' || raw === 'approved' || raw === 'rejected') return raw;
        return undefined;
      })(),
      rejectedReason:
        p?.rejectedReason ?? p?.rejectionReason ?? p?.moderation?.reason ?? p?.moderation?.rejectionReason,
      createdBy: p?.createdBy ?? p?.userId ?? p?.user,
    }));
};

const buildFeedPostsQuery = (params?: GetFeedPostsParams) => ({
  status: params?.status,
  // Backend expects "true"/"false" strings (per spec).
  reported: params?.reported === undefined ? undefined : String(params.reported),
  q: params?.q,
  page: params?.page,
  limit: params?.limit,
});

export const getFeedPosts = async (params?: GetFeedPostsParams): Promise<FeedPost[]> => {
  try {
    const { data } = await api.get<any>('/v1/feed-posts', {
      params: buildFeedPostsQuery(params),
    });
    return mapFeedPostsPayload(data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load feed posts'));
  }
};

/**
 * Same as getFeedPosts but via the auth-less publicApi instance, so a failure
 * on a public page (e.g. the home feed) never triggers the token-refresh /
 * redirect-to-login flow in the authenticated interceptor.
 */
export const getPublicFeedPosts = async (
  params?: GetFeedPostsParams,
): Promise<FeedPost[]> => {
  try {
    const { data } = await publicApi.get<any>('/v1/feed-posts', {
      params: buildFeedPostsQuery(params),
    });
    return mapFeedPostsPayload(data);
  } catch {
    return [];
  }
};

export interface CreateFeedPostData {
  title: string;
  description: string;
  imageFile: File;
  status?: FeedPostStatus;
}

export const createFeedPost = async (data: CreateFeedPostData): Promise<FeedPost> => {
  if (!data.imageFile) throw new Error('Image file is required');

  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  if (data.status) formData.append('status', data.status);
  // Backend key must be `image`
  formData.append('image', data.imageFile);

  try {
    const response = await api.post<any>('/v1/feed-posts', formData);
    const payload = response.data?.data ?? response.data;
    return (payload?.post ?? payload) as FeedPost;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create feed post'));
  }
};

export interface ModerateFeedPostData {
  status?: FeedPostStatus;
  // If provided, backend will update DB `reported` field.
  reported?: boolean;
  // Optional moderation reason/note (for rejections)
  reason?: string;
}

export const moderateFeedPost = async (postId: string, data: ModerateFeedPostData) => {
  if (!postId) throw new Error('Post id is required');
  if (data.status === undefined && data.reported === undefined) {
    throw new Error('Moderation requires at least one field');
  }

  const formData = new FormData();
  if (data.status) formData.append('status', data.status);
  if (data.reported !== undefined) formData.append('reported', String(data.reported));
  if (data.reason) formData.append('reason', data.reason);

  try {
    const response = await api.patch<any>(`/v1/feed-posts/${postId}/moderation`, formData);
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to moderate feed post'));
  }
};

export const deleteFeedPost = async (postId: string): Promise<void> => {
  if (!postId) throw new Error('Post id is required');
  try {
    await api.delete(`/v1/feed-posts/${postId}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete feed post'));
  }
};

export const moderateFeedUserBan = async (userId: string, banFeedPost: boolean) => {
  if (!userId) throw new Error('User id is required');

  const formData = new FormData();
  formData.append('banFeedPost', String(banFeedPost));

  try {
    const response = await api.patch<any>(
      `/v1/feed-posts/moderation/users/${userId}/ban-feed-post`,
      formData
    );
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update user feed ban status'));
  }
};
