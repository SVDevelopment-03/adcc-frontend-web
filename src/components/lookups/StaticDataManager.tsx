import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Database } from 'lucide-react';
import { LookupTypeManager } from './LookupTypeManager';
import { useCountries } from '../../hooks/useLookups';

interface SectionDef {
  key: string;
  type: string;
  label: string;
  itemLabel: string;
  description: string;
  supportsIcon?: boolean;
}

const SECTIONS: SectionDef[] = [
  {
    key: 'event_category',
    type: 'event_category',
    label: 'Event Categories',
    itemLabel: 'Category',
    description: 'Categories riders see when browsing and filtering events.',
    supportsIcon: true,
  },
  {
    key: 'community_category',
    type: 'community_category',
    label: 'Community Categories',
    itemLabel: 'Category',
    description: 'Tags used when creating or filtering communities (multi-select).',
    supportsIcon: true,
  },
  {
    key: 'community_purpose',
    type: 'community_purpose',
    label: 'Community Purpose Types',
    itemLabel: 'Purpose',
    description: 'Special-purpose community classifications (Awareness, Charity, ...).',
  },
  {
    key: 'community_terrain',
    type: 'community_terrain',
    label: 'Terrain Types',
    itemLabel: 'Terrain',
    description: 'Terrain options used on community and track forms.',
  },
  {
    key: 'country',
    type: 'country',
    label: 'Countries',
    itemLabel: 'Country',
    description: 'Countries offered across event, community and track location fields.',
  },
  {
    key: 'city',
    type: 'city',
    label: 'Cities',
    itemLabel: 'City',
    description: 'Cities offered across location fields, grouped by country.',
  },
  {
    key: 'track_facility',
    type: 'track_facility',
    label: 'Track Facilities',
    itemLabel: 'Facility',
    description: 'Amenities available for selection when creating or editing tracks.',
    supportsIcon: true,
  },
  {
    key: 'event_amenity',
    type: 'event_amenity',
    label: 'Event Amenities',
    itemLabel: 'Amenity',
    description: 'Amenities available for selection when creating or editing events.',
    supportsIcon: true,
  },
  {
    key: 'challenge_type',
    type: 'challenge_type',
    label: 'Challenge Types',
    itemLabel: 'Type',
    description: 'Types offered when creating or filtering challenges (Distance, Frequency, ...).',
    supportsIcon: true,
  },
  {
    key: 'challenge_unit',
    type: 'challenge_unit',
    label: 'Challenge Units',
    itemLabel: 'Unit',
    description: 'Target units offered when creating challenges (km, hours, rides, events).',
  },
  {
    key: 'news_category',
    type: 'news_category',
    label: 'News Categories',
    itemLabel: 'Category',
    description: 'Categories used when creating or filtering news articles.',
  },
];

export function StaticDataManager() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSection = SECTIONS.find((s) => s.key === searchParams.get('type'))?.key || SECTIONS[0].key;
  const [activeKey, setActiveKey] = useState(initialSection);
  const { options: countryOptions, loading: countriesLoading } = useCountries();
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  const active = SECTIONS.find((s) => s.key === activeKey) || SECTIONS[0];

  const handleSelect = (key: string) => {
    setActiveKey(key);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('type', key);
      return next;
    });
  };

  const effectiveCountry = selectedCountry || countryOptions[0]?.value || '';

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFF9EF' }}>
            <Database className="w-5 h-5" style={{ color: '#C12D32' }} />
          </div>
          <h1 className="text-3xl" style={{ color: '#333' }}>Static Data</h1>
        </div>
        <p style={{ color: '#666' }}>
          Manage the dropdown, filter and category values used across the app — with English and Arabic
          names — so they can be changed anytime without a code deploy.
        </p>
      </div>

      <div className="flex gap-6 items-start">
        <nav className="w-64 shrink-0 bg-white rounded-2xl shadow-sm p-2 space-y-1">
          {SECTIONS.map((section) => (
            <button
              key={section.key}
              onClick={() => handleSelect(section.key)}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors"
              style={{
                backgroundColor: activeKey === section.key ? '#FFF3E0' : 'transparent',
                color: activeKey === section.key ? '#C12D32' : '#666',
                fontWeight: activeKey === section.key ? 600 : 400,
              }}
            >
              {section.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0 space-y-4">
          <p className="text-sm" style={{ color: '#666' }}>{active.description}</p>

          {active.type === 'city' ? (
            <>
              <div className="flex items-center gap-3">
                <label className="text-sm" style={{ color: '#666' }}>Country:</label>
                <select
                  value={effectiveCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  disabled={countriesLoading || countryOptions.length === 0}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  {countryOptions.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              {effectiveCountry ? (
                <LookupTypeManager
                  key={effectiveCountry}
                  type="city"
                  itemLabel="City"
                  parentValue={effectiveCountry}
                  emptyState="No cities yet for this country."
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-sm p-10 text-center" style={{ color: '#666' }}>
                  Add a country first, then come back to add its cities.
                </div>
              )}
            </>
          ) : (
            <LookupTypeManager
              key={active.type}
              type={active.type}
              itemLabel={active.itemLabel}
              supportsIcon={active.supportsIcon}
            />
          )}
        </div>
      </div>
    </div>
  );
}
