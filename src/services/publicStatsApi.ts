import api from './api';

export interface PublicStatsData {
  members: {
    total: number;
    active: number;
  };
  events: {
    upcoming: number;
    completed: number;
  };
  tracks: {
    active: number;
  };
  communities: {
    active: number;
  };
  challenges: {
    active: number;
  };
  storeItems: {
    approved: number;
  };
  rides: {
    total: number;
    totalDistanceKm: number;
  };
}

interface PublicStatsResponse {
  success: boolean;
  message: string;
  data: PublicStatsData;
}

export async function getPublicStats(): Promise<PublicStatsData> {
  const { data } = await api.get<PublicStatsResponse>('/v1/public/stats');
  if (!data?.data) {
    throw new Error(data?.message || 'Failed to load public stats');
  }
  return data.data;
}
