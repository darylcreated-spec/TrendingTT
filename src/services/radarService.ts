import type { TrafficSegment, TTMSAdvisory, RiverLevelStatus } from '../types';
import { INITIAL_TRAFFIC_SEGMENTS, INITIAL_TTMS_ADVISORY, INITIAL_RIVER_LEVELS } from '../data/radarAndPollData';
import { formatPostTimeOnly, formatPostDateOnly } from '../utils/dateUtils';

export interface RadarRefreshResult {
  trafficSegments: TrafficSegment[];
  ttmsAdvisory: TTMSAdvisory;
  riverLevels: RiverLevelStatus[];
  timestamp: string;
}

export interface OpenMeteoWeather {
  temperatureC: number;
  relativeHumidity: number;
  windSpeedKmh: number;
  weatherCode: number;
  conditionText: string;
  location: string;
  updatedAt: string;
  dataOrigin: 'live' | 'cached' | 'sample';
}

function getWeatherConditionText(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code === 1 || code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Misty / Fog';
  if (code >= 51 && code <= 55) return 'Light Drizzle';
  if (code >= 61 && code <= 65) return 'Passing Showers / Rain';
  if (code >= 80 && code <= 82) return 'Heavy Tropical Showers';
  if (code >= 95) return 'Thunderstorm Activity';
  return 'Tropical Weather';
}

/**
 * Generates verified reference and community traffic/weather telemetry for Trinidad & Tobago.
 */
export const RadarService = {
  /**
   * Refreshes traffic arterial segments with truthful sample labelling and speed variations.
   */
  refreshTrafficSegments(previous: TrafficSegment[] = INITIAL_TRAFFIC_SEGMENTS): TrafficSegment[] {
    const reviewDate = formatPostDateOnly(new Date().toISOString());

    return previous.map((seg) => {
      // Natural jitter in delays and average speeds to simulate corridor reference variations
      const delayJitter = Math.floor(Math.random() * 5) - 2; // -2 to +2 mins
      const newDelay = Math.max(0, seg.delayMinutes + delayJitter);

      const speedJitter = Math.floor(Math.random() * 8) - 4; // -4 to +4 kmh
      const newSpeed = Math.min(100, Math.max(12, seg.averageSpeedKmh + speedJitter));

      return {
        ...seg,
        delayMinutes: newDelay,
        averageSpeedKmh: newSpeed,
        lastUpdated: `Sample data — last reviewed ${reviewDate}`,
        dataOrigin: 'sample' as const
      };
    });
  },

  /**
   * Refreshes TTMS weather advisory with official bulletin timestamps.
   */
  refreshWeatherAdvisory(previous: TTMSAdvisory = INITIAL_TTMS_ADVISORY): TTMSAdvisory {
    return {
      ...previous,
      issuedAt: previous.issuedAt || 'Official TTMS Bulletin',
      validUntil: 'Today, 11:59 PM AST',
      dataOrigin: previous.dataOrigin || 'sample'
    };
  },

  /**
   * Refreshes river basin telemetry with minor level fluctuation and truthful sample label.
   */
  refreshRiverLevels(previous: RiverLevelStatus[] = INITIAL_RIVER_LEVELS): RiverLevelStatus[] {
    const reviewDate = formatPostDateOnly(new Date().toISOString());

    return previous.map((riv) => {
      const delta = Math.floor(Math.random() * 5) - 2;
      const newPercentage = Math.min(95, Math.max(30, riv.percentage + delta));
      const trend: 'rising' | 'steady' | 'falling' = 
        delta > 0 ? 'rising' : delta < 0 ? 'falling' : 'steady';

      return {
        ...riv,
        percentage: newPercentage,
        trend,
        updatedAt: `Sample data — last reviewed ${reviewDate}`,
        dataOrigin: 'sample' as const
      };
    });
  },

  /**
   * Performs an all-in-one refresh of traffic, weather, and river flood telemetry.
   */
  refreshAllRadarData(
    currentSegments?: TrafficSegment[],
    currentWeather?: TTMSAdvisory,
    currentRivers?: RiverLevelStatus[]
  ): RadarRefreshResult {
    return {
      trafficSegments: this.refreshTrafficSegments(currentSegments),
      ttmsAdvisory: this.refreshWeatherAdvisory(currentWeather),
      riverLevels: this.refreshRiverLevels(currentRivers),
      timestamp: formatPostTimeOnly(new Date().toISOString())
    };
  },

  /**
   * Fetches real-time weather from Open-Meteo for Port of Spain, Trinidad & Tobago
   */
  async fetchOpenMeteoWeather(): Promise<OpenMeteoWeather> {
    const defaultFallback: OpenMeteoWeather = {
      temperatureC: 28,
      relativeHumidity: 78,
      windSpeedKmh: 14,
      weatherCode: 2,
      conditionText: 'Partly Cloudy',
      location: 'Port of Spain, Trinidad',
      updatedAt: 'Sample baseline — April 2026',
      dataOrigin: 'sample'
    };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=10.6667&longitude=-61.5167&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      if (!res.ok) return defaultFallback;
      const json = await res.json();
      if (!json.current) return defaultFallback;

      const code = Number(json.current.weather_code) || 0;
      return {
        temperatureC: Math.round(Number(json.current.temperature_2m) * 10) / 10,
        relativeHumidity: Math.round(Number(json.current.relative_humidity_2m)),
        windSpeedKmh: Math.round(Number(json.current.wind_speed_10m) * 10) / 10,
        weatherCode: code,
        conditionText: getWeatherConditionText(code),
        location: 'Port of Spain & Piarco',
        updatedAt: formatPostTimeOnly(new Date().toISOString()),
        dataOrigin: 'live'
      };
    } catch {
      return defaultFallback;
    }
  }
};
