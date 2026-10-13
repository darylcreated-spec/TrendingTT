import { describe, it, expect } from 'vitest';
import { isSportsPost, classifyTrinbagoContent } from '../services/scraperEngine';
import type { Post } from '../types';

describe('isSportsPost & classifyTrinbagoContent', () => {
  it('identifies sports posts by CPL and cricket keywords', () => {
    const post: Partial<Post> = {
      title: 'Pooran blasts 80 off 32 balls for Trinbago Knight Riders in CPL',
      summary: 'Thrilling T20 action at the Brian Lara Cricket Academy in Tarouba.',
      tags: [],
    };
    expect(isSportsPost(post)).toBe(true);
  });

  it('identifies football and Soca Warriors posts', () => {
    const post: Partial<Post> = {
      title: 'Soca Warriors begin Concacaf Nations League campaign at Hasely Crawford Stadium',
      summary: 'TTFA names 23-man squad for international friendly.',
      tags: [],
    };
    expect(isSportsPost(post)).toBe(true);
  });

  it('identifies athletics and Olympic athletes', () => {
    const post: Partial<Post> = {
      title: 'Jereem Richards clinches 400m gold in Diamond League',
      summary: 'National sprinter shines on world athletics stage.',
      tags: [],
    };
    expect(isSportsPost(post)).toBe(true);
  });

  it('does not classify non-sports political or crime news as sports', () => {
    const post: Partial<Post> = {
      title: 'Parliament debates national budget allocation for public utilities',
      summary: 'Minister outlines infrastructure investments for Port of Spain.',
      category: 'politics',
      tags: ['Parliament', 'Finance'],
    };
    expect(isSportsPost(post)).toBe(false);
  });

  it('classifyTrinbagoContent prioritizes sports over breaking news', () => {
    const result = classifyTrinbagoContent(
      'Breaking News: Red Force win regional Super50 final',
      'Dramatic last-wicket victory at Queen\'s Park Oval'
    );
    expect(result.category).toBe('sports');
    expect(result.tags).toContain('Trinbago Sports');
    expect(result.tags).toContain('Breaking Sports');
    expect(result.isBreaking).toBe(true);
  });

  it('classifyTrinbagoContent detects crime reports', () => {
    const result = classifyTrinbagoContent(
      'TTPS officers investigate armed robbery in Chaguanas',
      'Police recover stolen vehicle after highway pursuit'
    );
    expect(result.category).toBe('crime');
    expect(result.tags).toContain('Crime & Justice');
  });

  it('classifyTrinbagoContent detects politics and THA', () => {
    const result = classifyTrinbagoContent(
      'THA Chief Secretary addresses Tobago Assembly on tourism',
      'Debate held in Scarborough on local infrastructure'
    );
    expect(result.category).toBe('politics');
    expect(result.tags).toContain('Parliament & THA');
  });
});
