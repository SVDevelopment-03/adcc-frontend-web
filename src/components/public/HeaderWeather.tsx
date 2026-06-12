import React, { useEffect, useState } from 'react';
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Loader2,
  Sun,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  fetchAbuDhabiWeather,
  getWeatherIconKind,
  type WeatherIconKind,
  type WeatherSnapshot,
} from '../../services/weatherApi';

const REFRESH_MS = 30 * 60 * 1000;

function WeatherIcon({
  kind,
  className,
}: {
  kind: WeatherIconKind;
  className?: string;
}) {
  switch (kind) {
    case 'clear':
      return <Sun className={className} />;
    case 'cloudy':
      return <Cloud className={className} />;
    case 'fog':
      return <CloudFog className={className} />;
    case 'rain':
      return <CloudRain className={className} />;
    case 'snow':
      return <CloudSnow className={className} />;
    case 'thunderstorm':
      return <CloudLightning className={className} />;
    default:
      return <CloudSun className={className} />;
  }
}

export function HeaderWeather() {
  const { t } = useTranslation();
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      try {
        setError(false);
        const snapshot = await fetchAbuDhabiWeather();
        if (!cancelled) {
          setWeather(snapshot);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setWeather(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadWeather();
    const intervalId = window.setInterval(loadWeather, REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const iconKind = weather
    ? getWeatherIconKind(weather.weatherCode, weather.isDay)
    : 'partly-cloudy';

  const tempLabel = weather
    ? t('public.weather.temp', { temp: weather.temperature })
    : null;

  const label = loading
    ? t('public.weather.loading')
    : error
      ? t('public.weather.unavailable')
      : t('public.weather.tooltip', {
          temp: weather?.temperature ?? '--',
          city: t('public.weather.city'),
        });

  return (
    <div
      className="flex shrink-0 items-center gap-1 text-[#F5A623] sm:gap-1.5"
      title={label}
      aria-label={label}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin sm:h-6 sm:w-6" aria-hidden />
      ) : (
        <WeatherIcon
          kind={error ? 'partly-cloudy' : iconKind}
          className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
        />
      )}
      {!loading && tempLabel && (
        <span className="shrink-0 text-[12px] font-semibold tabular-nums leading-none text-black/80 sm:text-[13px]">
          {tempLabel}
        </span>
      )}
    </div>
  );
}
