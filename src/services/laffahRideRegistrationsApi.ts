import api, { publicApi } from './api';

// In ride-date order (see the schedule in locales → public.laffahRide.locations).
export const LAFFAH_RIDE_LOCATIONS = [
  'Al Dhafra',
  'Al Ain',
  'Al Wathba',
  'Yas Marina',
  'Al Hudariyat',
] as const;

export type LaffahRideLocation = (typeof LAFFAH_RIDE_LOCATIONS)[number];

// Keep in sync with LAFFAH_RIDE_CITIES in the backend model.
export const LAFFAH_RIDE_CITIES = [
  'Abu Dhabi',
  'Abu al Abyad',
  'Adhen',
  'Ajman',
  'Al Ain',
  'Al Ajban',
  'Al Aryam',
  'Al Awir',
  'Al Badiyah',
  'Al Bataeh',
  'Al Bithnah',
  'Al Faqa',
  'Al Halah',
  'Al Hamraniyah',
  'Al Hamriyah',
  'Al Jazirah Al Hamra',
  'Al Jeer',
  'Al Khawaneej',
  'Al Lisaili',
  'Al Madam',
  'Al Manama',
  'Al Mirfa',
  'Al Qor',
  'Al Qusaidat',
  'Al Rafaah',
  'Al Rashidya',
  'Al Shuwaib',
  'Al Yahar',
  'Ar-Rams',
  'Asimah',
  'Dadna',
  'Dalma',
  'Dhaid',
  'Dibba Al-Fujairah',
  'Dibba Al-Hisn',
  'Digdaga',
  'Dubai',
  'Falaj Al Mualla',
  'Fujairah',
  'Ghalilah',
  'Ghayathi',
  'Ghub',
  'Habshan',
  'Hatta',
  'Huwaylat',
  'Jebel Ali',
  'Kalba',
  'Khatt',
  'Khor Fakkan',
  'Khor Khwair',
  'Lahbab',
  'Liwa Oasis',
  'Madinat Zayed',
  'Marawah',
  'Masafi',
  'Masfut',
  'Mirbah',
  'Mleiha',
  'Nahil',
  'Ras Al Khaimah',
  'Ruwais',
  "Sha'am",
  'Sharjah',
  'Sila',
  'Sir Bani Yas',
  'Sweihan',
  'Umm Al Quwain',
  'Wadi Shah',
  'Zubarah',
] as const;
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
  emergencyContactName: string;
  emergencyContactNumber: string;
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
