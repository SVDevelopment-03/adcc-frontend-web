/** ISO 3166-1 alpha-2 code -> flag emoji (regional indicator symbols). */
const isoToFlag = (iso2: string) =>
  iso2
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

export interface CountryCode {
  iso2: string;
  name: string;
  dialCode: string;
  flag: string;
}

const RAW_COUNTRIES: Array<[iso2: string, name: string, dialCode: string]> = [
  ["AE", "United Arab Emirates", "+971"],
  ["SA", "Saudi Arabia", "+966"],
  ["QA", "Qatar", "+974"],
  ["KW", "Kuwait", "+965"],
  ["BH", "Bahrain", "+973"],
  ["OM", "Oman", "+968"],
  ["EG", "Egypt", "+20"],
  ["JO", "Jordan", "+962"],
  ["LB", "Lebanon", "+961"],
  ["IQ", "Iraq", "+964"],
  ["SY", "Syria", "+963"],
  ["YE", "Yemen", "+967"],
  ["PS", "Palestine", "+970"],
  ["MA", "Morocco", "+212"],
  ["DZ", "Algeria", "+213"],
  ["TN", "Tunisia", "+216"],
  ["LY", "Libya", "+218"],
  ["SD", "Sudan", "+249"],
  ["TR", "Turkey", "+90"],
  ["IN", "India", "+91"],
  ["PK", "Pakistan", "+92"],
  ["BD", "Bangladesh", "+880"],
  ["LK", "Sri Lanka", "+94"],
  ["NP", "Nepal", "+977"],
  ["PH", "Philippines", "+63"],
  ["ID", "Indonesia", "+62"],
  ["MY", "Malaysia", "+60"],
  ["SG", "Singapore", "+65"],
  ["CN", "China", "+86"],
  ["JP", "Japan", "+81"],
  ["KR", "South Korea", "+82"],
  ["GB", "United Kingdom", "+44"],
  ["IE", "Ireland", "+353"],
  ["FR", "France", "+33"],
  ["DE", "Germany", "+49"],
  ["ES", "Spain", "+34"],
  ["IT", "Italy", "+39"],
  ["PT", "Portugal", "+351"],
  ["NL", "Netherlands", "+31"],
  ["BE", "Belgium", "+32"],
  ["CH", "Switzerland", "+41"],
  ["SE", "Sweden", "+46"],
  ["NO", "Norway", "+47"],
  ["DK", "Denmark", "+45"],
  ["FI", "Finland", "+358"],
  ["PL", "Poland", "+48"],
  ["RU", "Russia", "+7"],
  ["US", "United States", "+1"],
  ["CA", "Canada", "+1"],
  ["MX", "Mexico", "+52"],
  ["BR", "Brazil", "+55"],
  ["AR", "Argentina", "+54"],
  ["ZA", "South Africa", "+27"],
  ["NG", "Nigeria", "+234"],
  ["KE", "Kenya", "+254"],
  ["ET", "Ethiopia", "+251"],
  ["AU", "Australia", "+61"],
  ["NZ", "New Zealand", "+64"],
];

export const COUNTRY_CODES: CountryCode[] = RAW_COUNTRIES.map(([iso2, name, dialCode]) => ({
  iso2,
  name,
  dialCode,
  flag: isoToFlag(iso2),
}));

export const DEFAULT_COUNTRY_CODE: CountryCode =
  COUNTRY_CODES.find((c) => c.iso2 === "AE") ?? COUNTRY_CODES[0];
