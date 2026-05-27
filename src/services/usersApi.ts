import api from './api';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage: string;
  gender: string;
  age: number | null;
  dob: string | null;
  country: string;
  role: 'Admin' | 'Vendor' | 'Member';
  roleId: string | null;
  isVerified: boolean;
  stats: {
    totalDistanceKm: number;
    totalRides: number;
    totalEventsParticipated: number;
    totalPoints: number;
    completedCount: number;
  };
  createdAt: string;
}

interface UserApiRaw {
  _id?: string | { toString(): string };
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  gender?: string;
  age?: number;
  dob?: string;
  country?: string;
  role?: string;
  roleId?: string | null;
  isVerified?: boolean;
  stats?: {
    totalDistanceKm?: number;
    totalRides?: number;
    totalEventsParticipated?: number;
    totalPoints?: number;
    completedCount?: number;
  };
  createdAt?: string;
}

function normalizeUser(raw: UserApiRaw): User {
  const id = raw.id || (typeof raw._id === 'string' ? raw._id : raw._id?.toString() || '');

  return {
    id,
    fullName: raw.fullName || '',
    email: raw.email || '',
    phone: raw.phone || '',
    profileImage: raw.profileImage || '',
    gender: raw.gender || '',
    age: raw.age ?? null,
    dob: raw.dob || null,
    country: raw.country || '',
    role: (raw.role as User['role']) || 'Member',
    roleId: raw.roleId ?? null,
    isVerified: raw.isVerified ?? false,
    stats: {
      totalDistanceKm: raw.stats?.totalDistanceKm ?? 0,
      totalRides: raw.stats?.totalRides ?? 0,
      totalEventsParticipated: raw.stats?.totalEventsParticipated ?? 0,
      totalPoints: raw.stats?.totalPoints ?? 0,
      completedCount: raw.stats?.completedCount ?? 0,
    },
    createdAt: raw.createdAt || '',
  };
}

export async function getAllUsers(
  page = 1,
  limit = 10,
  role?: string,
  gender?: string,
  isVerified?: boolean
): Promise<{ users: User[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const params: Record<string, string | number | boolean> = { page, limit };
  if (role) params.role = role;
  if (gender) params.gender = gender;
  if (isVerified !== undefined) params.isVerified = isVerified;

  const response = await api.get('/v1/user', { params });
  const data = response.data;

  const rawUsers: UserApiRaw[] = data?.data?.users || [];
  const pagination = data?.data?.pagination || { page, limit, total: 0, totalPages: 0 };

  return { users: rawUsers.map(normalizeUser), pagination };
}


export async function updateUserVerified(userId: string, isVerified: boolean): Promise<User> {
  const response = await api.patch(`/v1/user/${userId}/verified`, { isVerified });
  const raw: UserApiRaw = response.data?.data || response.data;
  return normalizeUser(raw);
}

export type CreateUserInput = {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  profileImage?: string;
  gender: 'Male' | 'Female';
  role?: User['role'];
  isVerified?: boolean;
};

export async function createUser(input: CreateUserInput): Promise<User> {
  const response = await api.post('/v1/user', input);
  const raw: UserApiRaw = response.data?.data || response.data;
  return normalizeUser(raw);
}

export type UpdateUserInput = {
  fullName?: string;
  phone?: string;
  gender?: 'Male' | 'Female';
  profileImage?: string;
  role?: User['role'];
};

export async function updateUser(userId: string, input: UpdateUserInput): Promise<User> {
  const response = await api.patch(`/v1/user/${userId}`, input);
  const raw: UserApiRaw = response.data?.data || response.data;
  return normalizeUser(raw);
}

export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/v1/user/${userId}`);
}
