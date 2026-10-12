import api, { publicApi } from './api';

export const LAFFAH_RIDE_LOCATIONS = [
  'Al Dhafra',
  'Al Wathba',
  'Al Ain',
  'Yas Marina',
  'Al Hudariyat',
] as const;

export type LaffahRideLocation = (typeof LAFFAH_RIDE_LOCATIONS)[number];
export type LaffahRideGender = 'Male' | 'Female';

export interface LaffahRideRegistrationInput {
  firstName: string;
  lastName: string;
  /** YYYY-MM-DD */
  dateOfBirth: string;
  mobileNumber: string;
  email: string;
  gender: LaffahRideGender;
  nationality: string;
  city: string;
  raceLocations: LaffahRideLocation[];
}

export interface LaffahRideRegistration extends LaffahRideRegistrationInput {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface LaffahRideRegistrationsPage {
  items: LaffahRideRegistration[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function submitLaffahRideRegistration(input: LaffahRideRegistrationInput): Promise<void> {
  await publicApi.post('/v1/laffah-ride-registrations', input);
}

export async function getLaffahRideRegistrations(params?: {
  location?: LaffahRideLocation;
  page?: number;
  limit?: number;
}): Promise<LaffahRideRegistrationsPage> {
  const { data } = await api.get('/v1/laffah-ride-registrations', { params });
  return (data?.data ?? data) as LaffahRideRegistrationsPage;
}

export async function exportLaffahRideRegistrationsCsv(params?: {
  location?: LaffahRideLocation;
}): Promise<Blob> {
  const response = await api.get('/v1/laffah-ride-registrations/export', {
    params,
    responseType: 'blob',
  });
  return response.data as Blob;
}
