import type { Comment, NotificationSettings, CommunityReport } from '../types';
import { INITIAL_COMMENTS } from '../data/mockPosts';
import { INITIAL_COMMUNITY_REPORTS } from '../data/radarAndPollData';

const STORAGE_KEYS = {
  UPVOTES: 'trending_tt_upvotes',
  BOOKMARKS: 'trending_tt_bookmarks',
  COMMENTS: 'trending_tt_comments',
  CUSTOM_POSTS: 'trending_tt_custom_posts',
  POLL_VOTES: 'trending_tt_user_poll_votes',
  POLL_DYNAMIC_COUNTS: 'trending_tt_poll_extra_counts',
  NOTIFICATIONS: 'trending_tt_notification_settings',
  COMMUNITY_REPORTS: 'trending_tt_community_reports',
  CONFIRMED_REPORTS: 'trending_tt_confirmed_reports'
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  enabled: false,
  permission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default',
  breakingNews: true,
  weatherAlerts: true,
  trafficAlerts: true,
  dailyPolls: false,
};

export const Storage = {
  getUpvotedPosts(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.UPVOTES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleUpvote(postId: string): { upvoted: boolean; allUpvotes: string[] } {
    const upvotes = this.getUpvotedPosts();
    const index = upvotes.indexOf(postId);
    let upvoted = false;
    if (index > -1) {
      upvotes.splice(index, 1);
      upvoted = false;
    } else {
      upvotes.push(postId);
      upvoted = true;
    }
    localStorage.setItem(STORAGE_KEYS.UPVOTES, JSON.stringify(upvotes));
    return { upvoted, allUpvotes: upvotes };
  },

  getBookmarks(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleBookmark(postId: string): { bookmarked: boolean; allBookmarks: string[] } {
    const bookmarks = this.getBookmarks();
    const index = bookmarks.indexOf(postId);
    let bookmarked = false;
    if (index > -1) {
      bookmarks.splice(index, 1);
      bookmarked = false;
    } else {
      bookmarks.push(postId);
      bookmarked = true;
    }
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    return { bookmarked, allBookmarks: bookmarks };
  },

  getComments(postId: string): Comment[] {
    try {
      const customComments = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      const parsedCustom: Record<string, Comment[]> = customComments ? JSON.parse(customComments) : {};
      const base = INITIAL_COMMENTS[postId] || [];
      const custom = parsedCustom[postId] || [];
      return [...base, ...custom];
    } catch {
      return INITIAL_COMMENTS[postId] || [];
    }
  },

  addComment(postId: string, text: string, authorName: string = 'Trini Citizen', authorLocation: string = 'Port of Spain'): Comment {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      postId,
      authorName,
      authorLocation,
      text,
      createdAt: new Date().toISOString(),
      upvotes: 1,
    };

    try {
      const customComments = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      const parsedCustom: Record<string, Comment[]> = customComments ? JSON.parse(customComments) : {};
      if (!parsedCustom[postId]) {
        parsedCustom[postId] = [];
      }
      parsedCustom[postId].unshift(newComment);
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(parsedCustom));
    } catch (e) {
      void e;
    }

    return newComment;
  },

  // Option C: Trinbago Sentiment Poll Storage
  getUserPollVotes(): Record<string, string> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.POLL_VOTES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  getPollExtraCounts(): Record<string, Record<string, number>> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.POLL_DYNAMIC_COUNTS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  castPollVote(pollId: string, optionId: string): { 
    userVotes: Record<string, string>; 
    extraCounts: Record<string, Record<string, number>> 
  } {
    const userVotes = this.getUserPollVotes();
    const extraCounts = this.getPollExtraCounts();

    const previousOptionId = userVotes[pollId];

    if (!extraCounts[pollId]) {
      extraCounts[pollId] = {};
    }

    // If changing vote from an earlier option, decrement previous
    if (previousOptionId && previousOptionId !== optionId) {
      extraCounts[pollId][previousOptionId] = Math.max(0, (extraCounts[pollId][previousOptionId] || 1) - 1);
    }

    // Increment newly voted option
    if (previousOptionId !== optionId) {
      extraCounts[pollId][optionId] = (extraCounts[pollId][optionId] || 0) + 1;
      userVotes[pollId] = optionId;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.POLL_VOTES, JSON.stringify(userVotes));
      localStorage.setItem(STORAGE_KEYS.POLL_DYNAMIC_COUNTS, JSON.stringify(extraCounts));
    } catch (e) {
      void e;
    }

    return { userVotes, extraCounts };
  },

  // Option D: Push Notification Storage
  getNotificationSettings(): NotificationSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_NOTIFICATIONS,
          ...parsed,
          permission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
        };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_NOTIFICATIONS;
  },

  saveNotificationSettings(settings: Partial<NotificationSettings>): NotificationSettings {
    const current = this.getNotificationSettings();
    const updated: NotificationSettings = {
      ...current,
      ...settings,
      permission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
    };
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    } catch (e) {
      void e;
    }
    return updated;
  },

  // Option B: Community Traffic & Flood Reports
  getCommunityReports(): CommunityReport[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMMUNITY_REPORTS);
      const customReports: CommunityReport[] = data ? JSON.parse(data) : [];
      return [...customReports, ...INITIAL_COMMUNITY_REPORTS];
    } catch {
      return INITIAL_COMMUNITY_REPORTS;
    }
  },

  addCommunityReport(report: Omit<CommunityReport, 'id' | 'reportedTime' | 'confirmations'>): CommunityReport {
    const newReport: CommunityReport = {
      ...report,
      id: `report-${Date.now()}`,
      reportedTime: 'Just now',
      confirmations: 1,
      isVerified: false
    };

    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMMUNITY_REPORTS);
      const existing: CommunityReport[] = data ? JSON.parse(data) : [];
      existing.unshift(newReport);
      localStorage.setItem(STORAGE_KEYS.COMMUNITY_REPORTS, JSON.stringify(existing));
    } catch (e) {
      void e;
    }

    return newReport;
  },

  getConfirmedReportIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIRMED_REPORTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleConfirmReport(reportId: string): { confirmed: boolean; allConfirmed: string[] } {
    const confirmed = this.getConfirmedReportIds();
    const index = confirmed.indexOf(reportId);
    let isNowConfirmed = false;
    if (index > -1) {
      confirmed.splice(index, 1);
      isNowConfirmed = false;
    } else {
      confirmed.push(reportId);
      isNowConfirmed = true;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIRMED_REPORTS, JSON.stringify(confirmed));
    } catch (e) {
      void e;
    }
    return { confirmed: isNowConfirmed, allConfirmed: confirmed };
  }
};
