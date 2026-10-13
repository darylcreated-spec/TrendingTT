import { describe, it, expect } from 'vitest';
import { mergePosts } from '../services/feedMerge';
import type { Post } from '../types';

describe('mergePosts', () => {
  const basePost = (id: string, overrides: Partial<Post> = {}): Post => ({
    id,
    title: `Post ${id}`,
    summary: `Summary for ${id}`,
    content: `Content for ${id}`,
    sourceId: 'newsday',
    sourceName: 'Newsday',
    sourceType: 'broadcast',
    originalUrl: `https://newsday.co.tt/news/${id}`,
    publishedAt: '2026-10-10T12:00:00Z',
    category: 'broadcast',
    tags: ['News'],
    trendingScore: 80,
    upvotes: 10,
    commentsCount: 2,
    dataOrigin: 'live',
    ...overrides,
  });

  it('handles empty inputs cleanly', () => {
    expect(mergePosts([], [])).toEqual([]);
    expect(mergePosts(undefined as any, undefined as any)).toEqual([]);
  });

  it('deduplicates posts by identical ID', () => {
    const p1 = basePost('post-1', { upvotes: 5, commentsCount: 1 });
    const p2 = basePost('post-1', { upvotes: 12, commentsCount: 4, summary: 'Updated summary' });

    const result = mergePosts([p1], [p2]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('post-1');
    expect(result[0].upvotes).toBe(12);
    expect(result[0].commentsCount).toBe(4);
    expect(result[0].summary).toBe('Updated summary');
  });

  it('deduplicates posts by canonical URL stripping query params', () => {
    const p1 = basePost('p-1', { originalUrl: 'https://newsday.co.tt/article?ref=fb' });
    const p2 = basePost('p-2', { originalUrl: 'https://newsday.co.tt/article?ref=twitter&utm_source=x' });

    const result = mergePosts([p1], [p2]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p-1');
  });

  it('deduplicates posts by normalized title from the same source', () => {
    const p1 = basePost('p-a', {
      sourceId: 'cnc3',
      title: 'Massive Traffic on Uriah Butler Highway!',
    });
    const p2 = basePost('p-b', {
      sourceId: 'cnc3',
      title: 'Massive Traffic on Uriah Butler Highway',
    });

    const result = mergePosts([p1], [p2]);
    expect(result).toHaveLength(1);
  });

  it('normalizes sports posts to category sports and adds Trinbago Sports tag', () => {
    const cricketPost = basePost('p-cric', {
      title: 'Red Force defeat Barbados in Super50 thriller at Queen\'s Park Oval',
      category: 'broadcast',
      tags: ['Local News'],
    });

    const result = mergePosts([], [cricketPost]);
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('sports');
    expect(result[0].tags).toContain('Trinbago Sports');
  });

  it('prioritizes live dataOrigin over sample or cached', () => {
    const samplePost = basePost('p-orig', { dataOrigin: 'sample' });
    const livePost = basePost('p-orig', { dataOrigin: 'live' });

    const result = mergePosts([samplePost], [livePost]);
    expect(result[0].dataOrigin).toBe('live');
  });

  it('orders breaking live posts first, followed by newest publishedAt desc', () => {
    const olderBreaking = basePost('b-1', {
      isBreaking: true,
      dataOrigin: 'live',
      publishedAt: '2026-10-10T10:00:00Z',
    });
    const newerNormal = basePost('n-1', {
      isBreaking: false,
      dataOrigin: 'live',
      publishedAt: '2026-10-10T14:00:00Z',
    });
    const olderNormal = basePost('n-2', {
      isBreaking: false,
      dataOrigin: 'live',
      publishedAt: '2026-10-10T08:00:00Z',
    });

    const result = mergePosts([], [olderNormal, newerNormal, olderBreaking]);
    expect(result[0].id).toBe('b-1');
    expect(result[1].id).toBe('n-1');
    expect(result[2].id).toBe('n-2');
  });
});
