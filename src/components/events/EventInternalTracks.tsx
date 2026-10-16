import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flag, Plus, X } from 'lucide-react';
import type { EventRaceTrack } from '../../services/eventsApi';

export const EMPTY_RACE_TRACK: EventRaceTrack = { name: '', date: '', time: '16:30' };

/** Rows the admin started filling in; fully blank rows are dropped on save. */
export const getFilledRaceTracks = (tracks: EventRaceTrack[]) =>
  tracks.filter((track) => track.name.trim() || track.date || track.time !== EMPTY_RACE_TRACK.time);

/** Error message when an internal event's tracks are not ready to save, otherwise ''. */
export const validateRaceTracks = (
  isInternal: boolean,
  tracks: EventRaceTrack[],
  t: (key: string, fallback: string) => string
): string => {
  if (!isInternal) return '';
  const filled = getFilledRaceTracks(tracks);
  if (filled.length === 0) return t('events.internal.errors.trackRequired', 'Add at least one track.');
  if (filled.some((track) => !track.name.trim() || !track.date || !track.time)) {
    return t('events.internal.errors.trackIncomplete', 'Each track needs a name, date and time.');
  }
  return '';
};

/** Payload-ready tracks (trimmed, blanks dropped); existing rows keep their _id so leads stay linked. */
export const serializeRaceTracks = (tracks: EventRaceTrack[]): EventRaceTrack[] =>
  getFilledRaceTracks(tracks).map(({ _id, name, date, time }) => ({
    ...(_id ? { _id } : {}),
    name: name.trim(),
    date,
    time,
  }));

/**
 * Internal events hide the Date & Time section, so the event's own date/time
 * come from its latest track: registration then stays open until the last ride.
 */
export const getRaceTracksEventSchedule = (tracks: EventRaceTrack[]) => {
  const last = serializeRaceTracks(tracks)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .pop();
  return last ? { eventDate: last.date, eventTime: last.time, endTime: last.time } : {};
};

interface Props {
  isInternal: boolean;
  onInternalChange: (value: boolean) => void;
  tracks: EventRaceTrack[];
  onTracksChange: (tracks: EventRaceTrack[]) => void;
  error?: string;
}

export function EventInternalTracks({ isInternal, onInternalChange, tracks, onTracksChange, error }: Props) {
  const { t } = useTranslation();

  const updateTrack = (index: number, field: 'name' | 'date' | 'time', value: string) => {
    onTracksChange(tracks.map((track, i) => (i === index ? { ...track, [field]: value } : track)));
  };

  const handleInternalChange = (value: boolean) => {
    onInternalChange(value);
    if (value && tracks.length === 0) onTracksChange([{ ...EMPTY_RACE_TRACK }]);
  };

  const typeOption = (value: boolean, label: string) => (
    <label
      className="flex flex-1 items-center gap-2 cursor-pointer px-4 py-3 rounded-lg border transition-colors"
      style={{
        borderColor: isInternal === value ? '#C12D32' : '#E5E7EB',
        backgroundColor: isInternal === value ? '#FDF2F2' : 'transparent',
      }}
    >
      <input
        type="checkbox"
        checked={isInternal === value}
        onChange={() => handleInternalChange(value)}
        className="w-4 h-4"
        style={{ accentColor: '#C12D32' }}
      />
      <span className="text-sm" style={{ color: '#333' }}>{label}</span>
    </label>
  );

  return (
    <div className="p-6 rounded-2xl shadow-sm bg-white">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
          <Flag className="w-5 h-5" />
        </div>
        <h2 className="text-xl" style={{ color: '#333' }}>{t('events.internal.heading', 'Event Type')}</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {typeOption(true, t('events.internal.internal', 'Internal Event'))}
        {typeOption(false, t('events.internal.external', 'External Event'))}
      </div>
      <p className="text-xs mt-2" style={{ color: '#999' }}>
        {t(
          'events.internal.hint',
          'Internal events show a registration form on the public event page and collect leads here in the dashboard.'
        )}
      </p>

      {isInternal && (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-bold" style={{ color: '#333' }}>
            {t('events.internal.tracksHeading', 'Tracks')}
          </h3>
          {tracks.map((track, index) => (
            <div key={track._id || index} className="grid grid-cols-1 sm:grid-cols-[1fr_160px_120px_auto] gap-3 items-end">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#666' }}>
                  {t('events.internal.trackName', 'Track name')}
                </label>
                <input
                  type="text"
                  value={track.name}
                  onChange={(e) => updateTrack(index, 'name', e.target.value)}
                  placeholder={t('events.internal.trackNamePlaceholder', 'e.g. Al Dhafra Oasis Parking')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#666' }}>
                  {t('events.internal.trackDate', 'Date')}
                </label>
                <input
                  type="date"
                  value={track.date}
                  onChange={(e) => updateTrack(index, 'date', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#666' }}>
                  {t('events.internal.trackTime', 'Time')}
                </label>
                <input
                  type="time"
                  value={track.time}
                  onChange={(e) => updateTrack(index, 'time', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <button
                type="button"
                onClick={() => onTracksChange(tracks.filter((_, i) => i !== index))}
                disabled={tracks.length <= 1}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed justify-self-start"
                aria-label={t('events.internal.removeTrack', 'Remove track')}
              >
                <X className="w-5 h-5" style={{ color: '#999' }} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => onTracksChange([...tracks, { ...EMPTY_RACE_TRACK }])}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-md"
            style={{ backgroundColor: '#ECC180', color: '#333' }}
          >
            <Plus className="w-4 h-4" />
            {t('events.internal.addTrack', 'Add Track')}
          </button>
          {error && <div className="text-xs text-red-600">{error}</div>}
        </div>
      )}
    </div>
  );
}
