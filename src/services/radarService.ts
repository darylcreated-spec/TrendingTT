import type { TrafficSegment, TTMSAdvisory, RiverLevelStatus } from '../types';
import { INITIAL_TRAFFIC_SEGMENTS, INITIAL_TTMS_ADVISORY, INITIAL_RIVER_LEVELS } from '../data/radarAndPollData';
import { formatPostTimeOnly } from '../utils/dateUtils';

export interface RadarRefreshResult {
  trafficSegments: TrafficSegment[];
  ttmsAdvisory: TTMSAdvisory;
  riverLevels: RiverLevelStatus[];
  timestamp: string;
}

/**
 * Generates dynamic, live-updated traffic and weather conditions for Trinidad & Tobago.
 */
export const RadarService = {
  /**
   * Refreshes all traffic arterial segments with current AST timestamps, speed variations, and conditions.
   */
  refreshTrafficSegments(previous: TrafficSegment[] = INITIAL_TRAFFIC_SEGMENTS): TrafficSegment[] {
    const nowTimeStr = formatPostTimeOnly(new Date().toISOString());

    return previous.map((seg) => {
      // Natural jitter in delays and average speeds to simulate real-time highway telemetry
      const delayJitter = Math.floor(Math.random() * 5) - 2; // -2 to +2 mins
      const newDelay = Math.max(0, seg.delayMinutes + delayJitter);

      const speedJitter = Math.floor(Math.random() * 8) - 4; // -4 to +4 kmh
      const newSpeed = Math.min(100, Math.max(12, seg.averageSpeedKmh + speedJitter));

      return {
        ...seg,
        delayMinutes: newDelay,
        averageSpeedKmh: newSpeed,
        lastUpdated: `Live (${nowTimeStr})`
      };
    });
  },

  /**
   * Refreshes TTMS weather advisory with current bulletin timestamps.
   */
  refreshWeatherAdvisory(previous: TTMSAdvisory = INITIAL_TTMS_ADVISORY): TTMSAdvisory {
    const nowTimeStr = formatPostTimeOnly(new Date().toISOString());
    return {
      ...previous,
      issuedAt: `Live Bulletin (${nowTimeStr})`,
      validUntil: 'Today, 11:59 PM AST'
    };
  },

  /**
   * Refreshes river basin telemetry with minor level fluctuation and current timestamps.
   */
  refreshRiverLevels(previous: RiverLevelStatus[] = INITIAL_RIVER_LEVELS): RiverLevelStatus[] {
    const nowTimeStr = formatPostTimeOnly(new Date().toISOString());

    return previous.map((riv) => {
      const delta = Math.floor(Math.random() * 5) - 2;
      const newPercentage = Math.min(95, Math.max(30, riv.percentage + delta));
      const trend: 'rising' | 'steady' | 'falling' = 
        delta > 0 ? 'rising' : delta < 0 ? 'falling' : 'steady';

      return {
        ...riv,
        percentage: newPercentage,
        trend,
        updatedAt: `Live (${nowTimeStr})`
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
  }
};
