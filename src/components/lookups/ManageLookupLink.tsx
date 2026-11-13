import { ExternalLink } from 'lucide-react';

interface ManageLookupLinkProps {
  /** Lookup type to open on the Data & Categories page, e.g. "event_amenity". */
  type: string;
  /** Link text, e.g. "Add or edit amenities". */
  label: string;
}

/**
 * Sends admins to the Data & Categories page for a lookup list instead of
 * letting forms store free-text values. Opens in a new tab so the form being
 * filled in isn't lost; lookup lists refetch when the tab regains focus, so
 * a newly added entry shows up as a checkbox on return.
 */
export function ManageLookupLink({ type, label }: ManageLookupLinkProps) {
  return (
    <a
      href={`/static-data?type=${encodeURIComponent(type)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm hover:underline"
      style={{ color: '#C12D32' }}
    >
      {label}
      <ExternalLink className="w-3.5 h-3.5" />
    </a>
  );
}
