import { useEffect, useMemo, useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { getLookups, LookupItem } from '../services/lookupsApi';

export interface LookupOption {
  value: string;
  label: string;
}

/**
 * Fetches an active, admin-managed lookup list (e.g. event categories) and
 * resolves each entry's display label for the current locale. Pass
 * `parentValue` for hierarchical lists (e.g. cities scoped to a country).
 */
export function useLookupList(type: string, parentValue?: string) {
  const { locale } = useLocale();
  const [items, setItems] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getLookups(type, parentValue)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type, parentValue]);

  const options = useMemo<LookupOption[]>(
    () =>
      items.map((item) => ({
        value: item.value,
        label: locale === 'ar' && item.labelAr ? item.labelAr : item.label,
      })),
    [items, locale]
  );

  /** Resolve a stored value (e.g. event.category) to its localized label, falling back to the raw value. */
  const resolveLabel = useMemo(() => {
    const map = new Map(options.map((option) => [option.value, option.label]));
    return (value?: string | null) => (value ? map.get(value) ?? value : '');
  }, [options]);

  return { items, options, loading, resolveLabel };
}

/** Convenience wrapper for the event-category lookup type. */
export function useEventCategories() {
  return useLookupList('event_category');
}

/** Community category tags (multi-select "type"/"category" picklist). */
export function useCommunityCategories() {
  return useLookupList('community_category');
}

/** Community purpose (Awareness, Charity, Corporate, ...). */
export function useCommunityPurposeTypes() {
  return useLookupList('community_purpose');
}

/** Community/track terrain (Paved Road, Gravel, Mixed, Mountain). */
export function useCommunityTerrainTypes() {
  return useLookupList('community_terrain');
}

/** GCC countries. */
export function useCountries() {
  return useLookupList('country');
}

/**
 * Cities scoped to a country (pass the country's `value`, e.g. "UAE").
 * Returns an empty list until a country is selected.
 */
export function useCities(countryValue?: string) {
  return useLookupList('city', countryValue || undefined);
}

/** Track facilities (Lighting, Parking, Cafes, ...). */
export function useTrackFacilities() {
  return useLookupList('track_facility');
}

/** Event amenities (Water, Toilets, Parking, Medical Support, ...). */
export function useEventAmenities() {
  return useLookupList('event_amenity');
}

/** Challenge types (Distance, Frequency, Duration, Social, Event). */
export function useChallengeTypes() {
  return useLookupList('challenge_type');
}

/** Challenge target units (km, hours, rides, events). */
export function useChallengeUnits() {
  return useLookupList('challenge_unit');
}
