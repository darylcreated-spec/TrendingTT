import type { 
  UtilityDisruption, 
  WaterSchedule, 
  TelecomStatus 
} from '../types';
import { 
  INITIAL_UTILITY_DISRUPTIONS, 
  INITIAL_WATER_SCHEDULES, 
  INITIAL_TELECOM_NOTICES 
} from '../data/utilitiesData';
import { formatPostTimeOnly, formatPostDateOnly } from '../utils/dateUtils';

export interface UtilityRefreshResult {
  disruptions: UtilityDisruption[];
  waterSchedules: WaterSchedule[];
  telecomNotices: TelecomStatus[];
  timestamp: string;
  activeOutagesCount: number;
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

/**
 * Service to manage utility disruptions and schedules across Trinidad & Tobago
 * with truthful AST timestamps and transparent data origins.
 */
export const UtilityService = {
  /**
   * Refreshes T&TEC and WASA utility disruptions with truthful sample labels.
   */
  refreshDisruptions(previous: UtilityDisruption[] = INITIAL_UTILITY_DISRUPTIONS): UtilityDisruption[] {
    const reviewDate = formatPostDateOnly(new Date().toISOString());
    const currentDay = DAYS_OF_WEEK[new Date().getDay()];

    return previous.map((item) => {
      // Ensure scheduled dates match current or upcoming day
      let dynamicScheduled = item.scheduledTime;
      if (dynamicScheduled.startsWith('Tomorrow') || dynamicScheduled.startsWith('Wednesday') || dynamicScheduled.startsWith('Thursday')) {
        dynamicScheduled = `${currentDay} Service Window: 8:30 AM - 4:00 PM AST`;
      }

      return {
        ...item,
        updatedAt: `Sample data — last reviewed ${reviewDate}`,
        scheduledTime: dynamicScheduled,
        dataOrigin: 'sample' as const
      };
    });
  },

  /**
   * Refreshes telecom and ISP notices (Amplia, Flow, Digicel, bmobile) with truthful sample labels.
   */
  refreshTelecomNotices(previous: TelecomStatus[] = INITIAL_TELECOM_NOTICES): TelecomStatus[] {
    const reviewDate = formatPostDateOnly(new Date().toISOString());

    return previous.map((notice) => {
      return {
        ...notice,
        updatedAt: `Sample data — last reviewed ${reviewDate}`,
        dataOrigin: 'sample' as const
      };
    });
  },

  /**
   * Enriches water schedules with today's supply status based on Port of Spain day-of-week rotations.
   */
  refreshWaterSchedules(previous: WaterSchedule[] = INITIAL_WATER_SCHEDULES): WaterSchedule[] {
    const currentDay = DAYS_OF_WEEK[new Date().getDay()];

    return previous.map((sched) => {
      const isScheduledToday = 
        sched.scheduleDays.toLowerCase().includes('daily') || 
        sched.scheduleDays.toLowerCase().includes(currentDay.toLowerCase());

      return {
        ...sched,
        notes: isScheduledToday
          ? `[TODAY'S ROTATION ACTIVE] ${sched.notes || ''}`.trim()
          : sched.notes
      };
    });
  },

  /**
   * Refreshes all utility dashboard feeds and aggregates active metrics.
   */
  refreshAllUtilityData(
    currentDisruptions?: UtilityDisruption[],
    currentSchedules?: WaterSchedule[],
    currentTelecom?: TelecomStatus[]
  ): UtilityRefreshResult {
    const refreshedDisruptions = this.refreshDisruptions(currentDisruptions);
    const refreshedSchedules = this.refreshWaterSchedules(currentSchedules);
    const refreshedTelecom = this.refreshTelecomNotices(currentTelecom);
    const timestamp = formatPostTimeOnly(new Date().toISOString());

    const activeOutagesCount = refreshedDisruptions.filter(
      (d) => d.status === 'active' || d.status === 'restoring'
    ).length;

    return {
      disruptions: refreshedDisruptions,
      waterSchedules: refreshedSchedules,
      telecomNotices: refreshedTelecom,
      timestamp,
      activeOutagesCount
    };
  }
};
