import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bike, ChevronLeft, ChevronRight, Download, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  LAFFAH_RIDE_LOCATIONS,
  getLaffahRideRegistrations,
  exportLaffahRideRegistrationsCsv,
  type LaffahRideLocation,
  type LaffahRideRegistration,
} from '../../services/laffahRideRegistrationsApi';

const PAGE_SIZE = 20;

const formatDate = (value: string, withTime = false) =>
  new Date(value).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : { timeZone: 'UTC' }),
  });

export function LaffahRideRegistrationsList() {
  const { t } = useTranslation();

  const [items, setItems] = useState<LaffahRideRegistration[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState<'' | LaffahRideLocation>('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const { items: fetched, pagination } = await getLaffahRideRegistrations({
          location: locationFilter || undefined,
          page,
          limit: PAGE_SIZE,
        });
        setItems(fetched);
        setTotal(pagination.total);
        setTotalPages(pagination.pages);
      } catch (error: any) {
        toast.error(error?.message || t('laffahRide.loadError', 'Failed to load registrations'));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [locationFilter, page, t]);

  const handleExport = async () => {
    try {
      const blob = await exportLaffahRideRegistrationsCsv({ location: locationFilter || undefined });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `laffah_ride_registrations_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error(t('laffahRide.exportError', 'Failed to export registrations'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>
            {t('sidebar.laffahRideRegistrations', 'Laffah Ride Registration')}
          </h1>
          <p style={{ color: '#666' }}>
            {t('laffahRide.subtitle', 'Leads submitted through the public Laffah Ride registration page')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-sm">
            <Users className="w-4 h-4" style={{ color: '#10B981' }} />
            <span className="text-sm" style={{ color: '#666' }}>
              {t('laffahRide.totalCount', '{{count}} registrations', { count: total })}
            </span>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 transition-all hover:bg-gray-50"
            style={{ color: '#666' }}
          >
            <Download className="w-4 h-4" />
            {t('laffahRide.exportButton', 'Export CSV')}
          </button>
        </div>
      </div>

      {/* Race location tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white shadow-sm w-fit">
        {(['', ...LAFFAH_RIDE_LOCATIONS] as Array<'' | LaffahRideLocation>).map((location) => (
          <button
            key={location || 'all'}
            onClick={() => {
              setLocationFilter(location);
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl text-sm transition-all"
            style={{
              backgroundColor: locationFilter === location ? '#C12D32' : 'transparent',
              color: locationFilter === location ? '#fff' : '#666',
            }}
          >
            {location || t('laffahRide.allLocations', 'All Locations')}
          </button>
        ))}
      </div>

      <div className="rounded-2xl shadow-sm bg-white overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center" style={{ color: '#999' }}>
            {t('common.loading', 'Loading...')}
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Bike className="w-16 h-16 mx-auto mb-4" style={{ color: '#CCC' }} />
            <p className="text-lg" style={{ color: '#666' }}>
              {t('laffahRide.empty', 'No registrations yet')}
            </p>
          </div>
        ) : (
          // w-0 + min-w-full: the wide table scrolls inside the card instead of
          // stretching the page (which pushed the header buttons off-screen).
          <div className="w-0 min-w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100" style={{ color: '#666' }}>
                  <th className="text-left px-6 py-3 font-medium">{t('laffahRide.columns.name', 'Name')}</th>
                  <th className="text-left px-6 py-3 font-medium">{t('laffahRide.columns.dateOfBirth', 'Date of Birth')}</th>
                  <th className="text-left px-6 py-3 font-medium">{t('laffahRide.columns.mobile', 'Mobile Number')}</th>
                  <th className="text-left px-6 py-3 font-medium">{t('laffahRide.columns.email', 'Email')}</th>
                  <th className="text-left px-6 py-3 font-medium">{t('laffahRide.columns.gender', 'Gender')}</th>
                  <th className="text-left px-6 py-3 font-medium">{t('laffahRide.columns.nationality', 'Nationality')}</th>
                  <th className="text-left px-6 py-3 font-medium">{t('laffahRide.columns.city', 'City')}</th>
                  <th className="text-left px-6 py-3 font-medium">{t('laffahRide.columns.emergencyContact', 'Emergency Contact')}</th>
                  <th className="text-left px-6 py-3 font-medium">{t('laffahRide.columns.raceLocations', 'Race Locations')}</th>
                  <th className="text-left px-6 py-3 font-medium">{t('laffahRide.columns.submittedOn', 'Submitted On')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-b border-gray-50 last:border-0 align-top">
                    <td className="px-6 py-3 whitespace-nowrap" style={{ color: '#333' }}>
                      {item.firstName} {item.lastName}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap" style={{ color: '#666' }}>
                      {formatDate(item.dateOfBirth)}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <a
                        href={`tel:${item.mobileNumber.replace(/\s+/g, '')}`}
                        className="hover:underline"
                        style={{ color: '#666' }}
                      >
                        {item.mobileNumber}
                      </a>
                    </td>
                    <td className="px-6 py-3">
                      <a href={`mailto:${item.email}`} className="hover:underline" style={{ color: '#333' }}>
                        {item.email}
                      </a>
                    </td>
                    <td className="px-6 py-3" style={{ color: '#666' }}>{item.gender}</td>
                    <td className="px-6 py-3" style={{ color: '#666' }}>{item.nationality}</td>
                    <td className="px-6 py-3" style={{ color: '#666' }}>{item.city}</td>
                    <td className="px-6 py-3 whitespace-nowrap" style={{ color: '#666' }}>
                      {/* Leads submitted before this field existed have none */}
                      {item.emergencyContactName || item.emergencyContactNumber ? (
                        <>
                          <div style={{ color: '#333' }}>{item.emergencyContactName}</div>
                          <div>{item.emergencyContactNumber}</div>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {item.raceLocations.map((location) => (
                          <span
                            key={location}
                            className="px-2.5 py-1 rounded-full text-xs whitespace-nowrap"
                            style={{ backgroundColor: '#D1FAE5', color: '#059669' }}
                          >
                            {location}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap" style={{ color: '#666' }}>
                      {formatDate(item.createdAt, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 rounded-2xl shadow-sm bg-white">
          <span className="text-sm" style={{ color: '#666' }}>
            {t('laffahRide.pagination.showing', {
              from: (page - 1) * PAGE_SIZE + 1,
              to: Math.min(page * PAGE_SIZE, total),
              total,
              defaultValue: `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} of ${total}`,
            })}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 transition-colors disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" style={{ color: '#666' }} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 transition-colors disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" style={{ color: '#666' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
