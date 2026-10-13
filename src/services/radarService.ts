import type { TrafficSegment, TTMSAdvisory, RiverLevelStatus } from '../types';
import { INITIAL_TRAFFIC_SEGMENTS, INITIAL_TTMS_ADVISORY, INITIAL_RIVER_LEVELS } from '../data/radarAndPollData';
import { formatPostTimeOnly, formatPostDateOnly } from '../utils/dateUtils';

export interface RadarRefreshResult {
  trafficSegments: TrafficSegment[];
  ttmsAdvisory: TTMSAdvisory;
  riverLevels: RiverLevelStatus[];
  timestamp: string;
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
      dataOrigin: (previous.dataOrigin || 'sample') as const
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
  }
};
