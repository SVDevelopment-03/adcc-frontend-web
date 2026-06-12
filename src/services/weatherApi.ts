export interface WeatherSnapshot {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
}

const ABU_DHABI_COORDS = { latitude: 24.4539, longitude: 54.3773 };

export async function fetchAbuDhabiWeather(): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(ABU_DHABI_COORDS.latitude),
    longitude: String(ABU_DHABI_COORDS.longitude),
    current: 'temperature_2m,weather_code,is_day',
    timezone: 'Asia/Dubai',
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error('Failed to fetch weather');
  }

  const data = await response.json();
  const current = data?.current;

  if (!current) {
    throw new Error('Invalid weather response');
  }

  return {
    temperature: Math.round(current.temperature_2m),
    weatherCode: current.weather_code,
    isDay: current.is_day === 1,
  };
}

export type WeatherIconKind =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'rain'
  | 'snow'
  | 'thunderstorm';

/** WMO weather interpretation codes (Open-Meteo) */
export function getWeatherIconKind(code: number, isDay: boolean): WeatherIconKind {
  if (code === 0) return isDay ? 'clear' : 'partly-cloudy';
  if (code === 1 || code === 2) return 'partly-cloudy';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 95) return 'thunderstorm';
  return 'partly-cloudy';
}
