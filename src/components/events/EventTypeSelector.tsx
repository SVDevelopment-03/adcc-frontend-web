import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flag } from 'lucide-react';

interface Props {
  isInternal: boolean;
  onInternalChange: (value: boolean) => void;
}

/**
 * Internal vs external event. Both have the same fields; internal events
 * register through the website form and collect leads in the dashboard.
 */
export function EventTypeSelector({ isInternal, onInternalChange }: Props) {
  const { t } = useTranslation();

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
        onChange={() => onInternalChange(value)}
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
        {t('events.internal.hint')}
      </p>
    </div>
  );
}
