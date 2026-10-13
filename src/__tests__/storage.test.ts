import { describe, it, expect, beforeEach } from 'vitest';
import { Storage } from '../services/storage';
import type { Post } from '../types';

describe('Storage Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('prunes custom posts older than 48 hours (TTL pruning)', () => {
    const now = Date.now();
    const freshPost: Post = {
      id: 'fresh-1',
      title: 'Fresh Post',
      summary: 'Summary',
      content: 'Content',
      sourceId: 'cnc3',
      sourceName: 'User Report',
      sourceType: 'social',
      originalUrl: 'https://cnc3.co.tt/fresh-1',
      publishedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      category: 'broadcast',
      tags: [],
      trendingScore: 50,
      upvotes: 0,
      commentsCount: 0,
      dataOrigin: 'live',
    };

    const stalePost: Post = {
      id: 'stale-1',
      title: 'Stale Post',
      summary: 'Summary',
      content: 'Content',
      sourceId: 'cnc3',
      sourceName: 'User Report',
      sourceType: 'social',
      originalUrl: 'https://cnc3.co.tt/stale-1',
      publishedAt: new Date(now - 55 * 60 * 60 * 1000).toISOString(), // 55 hours ago (exceeds 48h TTL)
      category: 'broadcast',
      tags: [],
      trendingScore: 50,
      upvotes: 0,
      commentsCount: 0,
      dataOrigin: 'live',
    };

    localStorage.setItem('trending_tt_custom_posts', JSON.stringify([freshPost, stalePost]));

    const posts = Storage.getCustomPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0].id).toBe('fresh-1');

    // Verify localStorage was updated to remove stale post
    const updatedStorage = JSON.parse(localStorage.getItem('trending_tt_custom_posts') || '[]');
    expect(updatedStorage).toHaveLength(1);
    expect(updatedStorage[0].id).toBe('fresh-1');
  });

  it('toggles upvotes and preserves upvote list', () => {
    const res1 = Storage.toggleUpvote('post-100');
    expect(res1.upvoted).toBe(true);
    expect(res1.allUpvotes).toContain('post-100');

    const res2 = Storage.toggleUpvote('post-100');
    expect(res2.upvoted).toBe(false);
    expect(res2.allUpvotes).not.toContain('post-100');
  });

  it('toggles bookmarks and preserves bookmark list', () => {
    const res1 = Storage.toggleBookmark('post-200');
    expect(res1.bookmarked).toBe(true);
    expect(res1.allBookmarks).toContain('post-200');

    const res2 = Storage.toggleBookmark('post-200');
    expect(res2.bookmarked).toBe(false);
    expect(res2.allBookmarks).not.toContain('post-200');
  });
});
