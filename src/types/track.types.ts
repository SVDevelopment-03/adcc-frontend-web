// Dashboard-managed via the `lookups` collection (type "track_facility") —
// the value is the API text (e.g. "water stations") returned by the backend.
export type FacilityType = string;

export interface ITrackFacility {
  facilities?: FacilityType[];
}
