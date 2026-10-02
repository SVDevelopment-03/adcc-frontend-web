import React from 'react';
import { ArrowLeft, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LookupTypeManager } from '../lookups/LookupTypeManager';

/**
 * Manage the "Organised by" list offered on the event create/edit forms.
 * Each organiser has an English and an Arabic name; the public event page
 * shows the one matching the visitor's language.
 */
export function EventOrganizers() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/events')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFF9EF' }}>
              <Building2 className="w-5 h-5" style={{ color: '#C12D32' }} />
            </div>
            <h1 className="text-3xl" style={{ color: '#333' }}>{t('events.organizers.title')}</h1>
          </div>
          <p style={{ color: '#666' }}>{t('events.organizers.subtitle')}</p>
        </div>
      </div>

      <LookupTypeManager
        type="event_organizer"
        itemLabel="Organiser"
        emptyState={t('events.organizers.empty')}
      />
    </div>
  );
}
