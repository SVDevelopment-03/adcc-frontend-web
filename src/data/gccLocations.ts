// GCC Countries and Cities Mapping
export const gccCountries = [
  'UAE',
  'Saudi Arabia',
  'Qatar',
  'Oman',
  'Kuwait',
  'Bahrain'
] as const;

export type GCCCountry = typeof gccCountries[number];

export const gccCities: Record<GCCCountry, string[]> = {
  'UAE': [
    'Abu Dhabi',
    'Dubai',
    'Sharjah',
    'Ajman',
    'Ras Al Khaimah',
    'Fujairah',
    'Umm Al Quwain',
    'Al Ain'
  ],
  'Saudi Arabia': [
    'Riyadh',
    'Jeddah',
    'Mecca',
    'Medina',
    'Dammam',
    'Khobar',
    'Dhahran',
    'Taif',
    'Tabuk',
    'Abha',
    'Jubail',
    'Yanbu'
  ],
  'Qatar': [
    'Doha',
    'Al Wakrah',
    'Al Khor',
    'Al Rayyan',
    'Mesaieed',
    'Dukhan'
  ],
  'Oman': [
    'Muscat',
    'Salalah',
    'Sohar',
    'Nizwa',
    'Sur',
    'Ibri',
    'Barka',
    'Rustaq'
  ],
  'Kuwait': [
    'Kuwait City',
    'Hawalli',
    'Salmiya',
    'Farwaniya',
    'Jahra',
    'Ahmadi',
    'Mangaf',
    'Fahaheel'
  ],
  'Bahrain': [
    'Manama',
    'Muharraq',
    'Riffa',
    'Hamad Town',
    'Isa Town',
    'Sitra',
    'Budaiya',
    'Jidhafs'
  ]
};

// Helper function to get cities by country
export function getCitiesByCountry(country: GCCCountry | ''): string[] {
  if (!country) return [];
  return gccCities[country] || [];
}

// Helper function to validate country-city combination
export function isValidCountryCity(country: GCCCountry | '', city: string): boolean {
  if (!country || !city) return false;
  return gccCities[country]?.includes(city) || false;
}

// Some records (e.g. tracks saved before this code-based select existed)
// store a country's full display label (e.g. "United Arab Emirates")
// instead of its short code (e.g. "UAE"). Of this list, only UAE's code
// diverges from its label, so map that one case back to the code when
// comparing a stored value against the country selects above — otherwise
// an exact string match silently drops matching tracks/records.
const COUNTRY_LABEL_TO_CODE: Record<string, GCCCountry> = {
  'united arab emirates': 'UAE',
};

export function normalizeCountryValue(value?: string | null): string {
  const trimmed = (value || '').trim();
  if (!trimmed) return 'UAE';
  return COUNTRY_LABEL_TO_CODE[trimmed.toLowerCase()] || trimmed;
}