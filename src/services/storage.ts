import type { Comment, NotificationSettings, CommunityReport, UtilityReport, Post, UserProfile } from '../types';
import { INITIAL_COMMENTS } from '../data/mockPosts';
import { INITIAL_COMMUNITY_REPORTS } from '../data/radarAndPollData';
import { INITIAL_UTILITY_REPORTS } from '../data/utilitiesData';
import { formatPostTimeOnly } from '../utils/dateUtils';

const STORAGE_KEYS = {
  UPVOTES: 'trending_tt_upvotes',
  BOOKMARKS: 'trending_tt_bookmarks',
  COMMENTS: 'trending_tt_comments',
  CUSTOM_POSTS: 'trending_tt_custom_posts',
  POLL_VOTES: 'trending_tt_user_poll_votes',
  POLL_DYNAMIC_COUNTS: 'trending_tt_poll_extra_counts',
  NOTIFICATIONS: 'trending_tt_notification_settings',
  COMMUNITY_REPORTS: 'trending_tt_community_reports',
  CONFIRMED_REPORTS: 'trending_tt_confirmed_reports',
  UTILITY_REPORTS: 'trending_tt_utility_reports',
  CONFIRMED_UTILITY_REPORTS: 'trending_tt_confirmed_utility_reports',
  USER_PROFILE: 'trending_tt_user_profile',
  MACKO_VOTES: 'trending_tt_macko_votes',
  TRINI_REACTIONS: 'trending_tt_reactions'
};


const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  enabled: false,
  permission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default',
  breakingNews: true,
  weatherAlerts: true,
  trafficAlerts: true,
  dailyPolls: false,
  fullMackoMode: true,
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

  getCustomPosts(): Post[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_POSTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCustomPost(post: Post): Post {
    try {
      const existing = this.getCustomPosts();
      existing.unshift(post);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_POSTS, JSON.stringify(existing));
    } catch (e) {
      void e;
    }
    return post;
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

  // D Macko Meter Votes Storage
  getMackoVotedPosts(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MACKO_VOTES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleMackoVote(postId: string): { voted: boolean; allVoted: string[] } {
    const votedList = this.getMackoVotedPosts();
    const index = votedList.indexOf(postId);
    let voted = false;
    if (index > -1) {
      votedList.splice(index, 1);
      voted = false;
    } else {
      votedList.push(postId);
      voted = true;
    }
    localStorage.setItem(STORAGE_KEYS.MACKO_VOTES, JSON.stringify(votedList));
    return { voted, allVoted: votedList };
  },

  // Trini Custom Reactions Storage per post
  getUserReactions(): Record<string, string> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRINI_REACTIONS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  setUserReaction(postId: string, reaction: string | null): Record<string, string> {
    const all = this.getUserReactions();
    if (reaction) {
      all[postId] = reaction;
    } else {
      delete all[postId];
    }
    localStorage.setItem(STORAGE_KEYS.TRINI_REACTIONS, JSON.stringify(all));
    return all;
  },

  // User Profile Storage (Local Fallback & Sync)
  getUserProfile(): UserProfile {

    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    const defaultProfile: UserProfile = {
      uid: 'guest-' + Math.random().toString(36).substring(2, 9),
      displayName: 'Trinbago Citizen',
      handle: 'trini_patriot',
      location: 'Port of Spain',
      role: 'citizen',
      joinedAt: new Date().toISOString()
    };
    return defaultProfile;
  },

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Could not save user profile to localStorage', e);
    }
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
    const currentPerm = typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_NOTIFICATIONS,
          ...parsed,
          enabled: parsed?.enabled ?? (currentPerm === 'granted'),
          permission: currentPerm
        };
      }
    } catch {
      // Fallback
    }
    return {
      ...DEFAULT_NOTIFICATIONS,
      enabled: currentPerm === 'granted',
      permission: currentPerm
    };
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
    const timeStr = formatPostTimeOnly(new Date().toISOString());
    const newReport: CommunityReport = {
      ...report,
      id: `report-${Date.now()}`,
      reportedTime: `Just now (${timeStr})`,
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
  },

  getUtilityReports(): UtilityReport[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.UTILITY_REPORTS);
      const customReports: UtilityReport[] = data ? JSON.parse(data) : [];
      return [...customReports, ...INITIAL_UTILITY_REPORTS];
    } catch {
      return INITIAL_UTILITY_REPORTS;
    }
  },

  addUtilityReport(report: Omit<UtilityReport, 'id' | 'reportedTime' | 'confirmations'>): UtilityReport {
    const newReport: UtilityReport = {
      ...report,
      id: `util-report-${Date.now()}`,
      reportedTime: 'Just now',
      confirmations: 1,
      status: 'unverified'
    };

    try {
      const data = localStorage.getItem(STORAGE_KEYS.UTILITY_REPORTS);
      const existing: UtilityReport[] = data ? JSON.parse(data) : [];
      existing.unshift(newReport);
      localStorage.setItem(STORAGE_KEYS.UTILITY_REPORTS, JSON.stringify(existing));
    } catch (e) {
      void e;
    }

    return newReport;
  },

  getConfirmedUtilityReportIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIRMED_UTILITY_REPORTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleConfirmUtilityReport(reportId: string): { confirmed: boolean; allConfirmed: string[] } {
    const confirmed = this.getConfirmedUtilityReportIds();
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
      localStorage.setItem(STORAGE_KEYS.CONFIRMED_UTILITY_REPORTS, JSON.stringify(confirmed));
    } catch (e) {
      void e;
    }
    return { confirmed: isNowConfirmed, allConfirmed: confirmed };
  }
};

