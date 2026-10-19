import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Checks a phone number typed next to a country-code picker against that
 * country's numbering rules (length and leading digits).
 *
 * The number may be typed nationally ("050 123 4567"), without the trunk "0"
 * ("50 123 4567"), or with the international prefix ("+971…" / "00971…"), as
 * long as that prefix matches the picked country code.
 *
 * Returns the number as "<dial code> <national number>" (e.g. "+971 501234567"),
 * or null when it isn't a valid number for the picked country.
 */
export function normalizePhoneForCountry(dialCode: string, input: string): string | null {
  const digits = input.trim().replace(/[\s\-().]/g, '');
  if (!digits) return null;

  let international: string;
  if (digits.startsWith('+')) international = digits;
  else if (digits.startsWith('00')) international = `+${digits.slice(2)}`;
  else international = `${dialCode}${digits.replace(/^0+/, '')}`;

  const parsed = parsePhoneNumberFromString(international);
  if (!parsed || !parsed.isValid() || `+${parsed.countryCallingCode}` !== dialCode) {
    return null;
  }
  return `+${parsed.countryCallingCode} ${parsed.nationalNumber}`;
}
