import type { Post } from '../types';
import { isSportsPost } from './scraperEngine';

/**
 * Normalizes title text for fuzzy collision detection.
 */
function normalizeTitle(title: string): string {
  return (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 45);
}

/**
 * Normalizes URL for collision detection.
 */
function normalizeUrl(url: string): string {
  if (!url) return '';
  return url.toLowerCase().split('?')[0].replace(/\/$/, '');
}

/**
 * Compares two ISO date strings safely, returning timestamp number or 0 if invalid.
 */
function safeTimestamp(dateStr?: string): number {
  if (!dateStr) return 0;
  const time = new Date(dateStr).getTime();
  return isNaN(time) ? 0 : time;
}

/**
 * Merges two post arrays with strict deduplication, user state preservation,
 * and deterministic chronological / breaking ordering.
 */
export function mergePosts(existing: Post[] = [], incoming: Post[] = []): Post[] {
  if (!Array.isArray(existing)) existing = [];
  if (!Array.isArray(incoming)) incoming = [];

  const mergedMap = new Map<string, Post>();
  const seenUrls = new Map<string, string>(); // url -> id
  const seenTitles = new Map<string, string>(); // sourceId:title -> id

  // Helper to index and add or merge a post
  const addOrMerge = (rawPost: Post, _isIncoming: boolean) => {
    if (!rawPost || !rawPost.id) return;

    const isSports = isSportsPost(rawPost);
    const post: Post = isSports
      ? {
          ...rawPost,
          category: 'sports',
          tags: rawPost.tags?.includes('Trinbago Sports') ? rawPost.tags : [...(rawPost.tags || []), 'Trinbago Sports']
        }
      : rawPost;

    const normUrl = normalizeUrl(post.originalUrl);
    const normTitle = post.sourceId ? `${post.sourceId}:${normalizeTitle(post.title)}` : '';

    // Check if duplicate exists via id, normalized URL, or title key
    let existingId: string | undefined = undefined;
    if (mergedMap.has(post.id)) {
      existingId = post.id;
    } else if (normUrl && seenUrls.has(normUrl)) {
      existingId = seenUrls.get(normUrl);
    } else if (normTitle && seenTitles.has(normTitle)) {
      existingId = seenTitles.get(normTitle);
    }

    if (existingId && mergedMap.has(existingId)) {
      const prior = mergedMap.get(existingId)!;

      // Conflict resolution:
      // 1. Upgrade dataOrigin if newer is 'live' and prior was 'sample' or 'cached'
      const originWeight = (origin?: string) => (origin === 'live' ? 3 : origin === 'cached' ? 2 : 1);
      const chosenOrigin = originWeight(post.dataOrigin) >= originWeight(prior.dataOrigin)
        ? (post.dataOrigin || prior.dataOrigin)
        : (prior.dataOrigin || post.dataOrigin);

      // 2. Preserve user upvotes and comments
      const higherUpvotes = Math.max(prior.upvotes || 0, post.upvotes || 0);
      const higherComments = Math.max(prior.commentsCount || 0, post.commentsCount || 0);

      // 3. Newer publishedAt wins content/summary/title updates
      const priorTime = safeTimestamp(prior.publishedAt);
      const postTime = safeTimestamp(post.publishedAt);
      const isPostNewer = postTime >= priorTime;

      const title = isPostNewer ? (post.title || prior.title) : (prior.title || post.title);
      const summary = isPostNewer ? (post.summary || prior.summary) : (prior.summary || post.summary);
      const content = isPostNewer ? (post.content || prior.content) : (prior.content || post.content);
      const publishedAt = isPostNewer ? (post.publishedAt || prior.publishedAt) : prior.publishedAt;

      // 4. Media preservation
      const media = (isPostNewer && post.media) ? post.media : (prior.media || post.media);

      const mergedPost: Post = {
        ...prior,
        ...post,
        id: prior.id, // preserve stable identity
        title,
        summary,
        content,
        publishedAt,
        upvotes: higherUpvotes,
        commentsCount: higherComments,
        dataOrigin: chosenOrigin,
        media,
        tags: Array.from(new Set([...(prior.tags || []), ...(post.tags || [])])),
        isBreaking: Boolean(prior.isBreaking || post.isBreaking)
      };

      mergedMap.set(existingId, mergedPost);
    } else {
      // New post entry
      mergedMap.set(post.id, { ...post });
      if (normUrl) seenUrls.set(normUrl, post.id);
      if (normTitle) seenTitles.set(normTitle, post.id);
    }
  };

  // Process existing posts first to establish stable identities and user states
  for (const post of existing) {
    addOrMerge(post, false);
  }

  // Process incoming posts to enrich or prepend new content
  for (const post of incoming) {
    addOrMerge(post, true);
  }

  // Sort deterministically:
  // 1. Breaking news items first (only if non-sample)
  // 2. Then by publishedAt descending
  const result = Array.from(mergedMap.values());
  result.sort((a, b) => {
    const aBreaking = a.isBreaking && a.dataOrigin !== 'sample';
    const bBreaking = b.isBreaking && b.dataOrigin !== 'sample';

    if (aBreaking && !bBreaking) return -1;
    if (!aBreaking && bBreaking) return 1;

    const aTime = safeTimestamp(a.publishedAt);
    const bTime = safeTimestamp(b.publishedAt);
    return bTime - aTime;
  });

  return result;
}
