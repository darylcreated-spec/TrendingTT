import type { Comment } from '../types';
import { INITIAL_COMMENTS } from '../data/mockPosts';

const STORAGE_KEYS = {
  UPVOTES: 'trending_tt_upvotes',
  BOOKMARKS: 'trending_tt_bookmarks',
  COMMENTS: 'trending_tt_comments',
  CUSTOM_POSTS: 'trending_tt_custom_posts',
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
    } catch (err) {
      console.error('Failed to store comment:', err);
    }

    return newComment;
  }
};
