import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionedFeed } from '../components/SectionedFeed';
import type { Post } from '../types';

describe('SectionedFeed Component', () => {
  const dummyProps = {
    upvotedIds: [],
    bookmarkedIds: [],
    onToggleUpvote: vi.fn(),
    onToggleBookmark: vi.fn(),
    onOpenComments: vi.fn(),
    onShare: vi.fn(),
    onWhatsAppShare: vi.fn(),
    onMediaClick: vi.fn(),
    onSelectCategory: vi.fn(),
  };

  const createPost = (id: string, overrides: Partial<Post> = {}): Post => ({
    id,
    title: `Title ${id}`,
    summary: `Summary ${id}`,
    content: `Content ${id}`,
    sourceId: 'cnc3',
    sourceName: 'CNC3',
    sourceType: 'broadcast',
    originalUrl: `https://cnc3.co.tt/${id}`,
    publishedAt: '2026-10-10T12:00:00Z',
    category: 'broadcast',
    tags: ['News'],
    trendingScore: 80,
    upvotes: 10,
    commentsCount: 2,
    dataOrigin: 'live',
    ...overrides,
  });

  it('renders sports posts under Trinbago Sports Arena, newest first', () => {
    const olderSportsPost = createPost('sports-older', {
      title: 'Older Cricket Match at Queen\'s Park Oval',
      category: 'sports',
      tags: ['Cricket', 'Trinbago Sports'],
      publishedAt: '2026-10-10T10:00:00Z',
    });

    const newerSportsPost = createPost('sports-newer', {
      title: 'Newer Soca Warriors Victory at Hasely Crawford',
      category: 'sports',
      tags: ['Football', 'Trinbago Sports'],
      publishedAt: '2026-10-10T16:00:00Z',
    });

    const generalPost = createPost('general-1', {
      title: 'Road Works on Solomon Hochoy Highway',
      category: 'broadcast',
      tags: ['Traffic'],
      publishedAt: '2026-10-10T14:00:00Z',
    });

    const breakingPost = createPost('breaking-1', {
      title: 'Breaking: Major Power Outage in Port of Spain',
      isBreaking: true,
      category: 'breaking',
      tags: ['T&TEC'],
      publishedAt: '2026-10-10T15:00:00Z',
    });

    const posts = [olderSportsPost, newerSportsPost, generalPost, breakingPost];

    render(<SectionedFeed {...dummyProps} posts={posts} />);

    // Assert the Trinbago Sports Arena section exists
    const sportsHeading = screen.getByRole('heading', { name: /Trinbago Sports Arena/i });
    expect(sportsHeading).toBeDefined();

    // Verify sports posts appear in the document
    expect(screen.getByText(/Older Cricket Match at Queen's Park Oval/i)).toBeDefined();
    expect(screen.getByText(/Newer Soca Warriors Victory at Hasely Crawford/i)).toBeDefined();

    // Check that the sports arena section container contains both sports posts
    const sportsSection = sportsHeading.closest('section');
    expect(sportsSection).not.toBeNull();
    if (sportsSection) {
      expect(sportsSection.textContent).toContain('Newer Soca Warriors Victory');
      expect(sportsSection.textContent).toContain('Older Cricket Match');
      // Ensure general and breaking posts are NOT in the sports section
      expect(sportsSection.textContent).not.toContain('Road Works on Solomon Hochoy');
      expect(sportsSection.textContent).not.toContain('Major Power Outage');

      // Verify newest first ordering: newer sports post appears before older sports post in DOM
      const newerIndex = sportsSection.innerHTML.indexOf('Newer Soca Warriors Victory');
      const olderIndex = sportsSection.innerHTML.indexOf('Older Cricket Match');
      expect(newerIndex).toBeLessThan(olderIndex);
    }
  });
});
