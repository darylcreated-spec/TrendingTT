import type { Post } from '../types';
import { fetchServerBriefing } from './geminiService';
import { getCurrentASTTime } from '../utils/dateUtils';

export interface IntelligenceBriefing {
  id: string;
  generatedAt: string;
  topic: string;
  category: 'breaking' | 'sports' | 'social' | 'national';
  title: string;
  executiveSummary: string;
  keyTakeaways: string[];
  primarySources: Array<{
    name: string;
    url: string;
  }>;
  socialDrafts: {
    whatsapp: string;
    facebook: string;
    xTwitter: string;
    telegram: string;
  };
  sourcePostIds: string[];
}

export interface BriefingEngineConfig {
  geminiApiKey?: string;
  modelName?: string;
}

const STORAGE_KEY_GEMINI_KEY = 'trending_tt_gemini_api_key';

export class BriefingEngine {
  private static apiKey = localStorage.getItem(STORAGE_KEY_GEMINI_KEY) || '';

  public static setApiKey(key: string): void {
    this.apiKey = key.trim();
    if (this.apiKey) {
      localStorage.setItem(STORAGE_KEY_GEMINI_KEY, this.apiKey);
    } else {
      localStorage.removeItem(STORAGE_KEY_GEMINI_KEY);
    }
  }

  public static getApiKey(): string {
    return this.apiKey;
  }

  /**
   * Synthesize incoming posts into curated briefings for Breaking News, Sports, and Social Trending.
   * If Gemini API key is provided, calls Gemini directly; otherwise uses deterministic editorial synthesis.
   */
  public static async generateBriefings(posts: Post[]): Promise<IntelligenceBriefing[]> {
    if (posts.length === 0) return [];

    // Attempt serverless Gemini briefing first (secure, server-side GEMINI_API_KEY)
    try {
      const serverBriefings = await fetchServerBriefing(posts);
      if (serverBriefings && serverBriefings.length > 0) {
        return serverBriefings;
      }
    } catch {
      // Fallback silently to editorial cluster synthesis
    }

    // Fallback: Group posts into clusters and synthesize deterministically
    const breakingCluster = posts.filter((p) => p.isBreaking || p.category === 'breaking' || p.trendingScore >= 95);
    const sportsCluster = posts.filter((p) => p.category === 'sports' || p.tags.some((t) => /cricket|football|cpl|red force|soca warriors/i.test(t)));
    const socialCluster = posts.filter((p) => p.category === 'social' || p.sourceType === 'social');
    const nationalCluster = posts.filter((p) => !breakingCluster.includes(p) && !sportsCluster.includes(p) && !socialCluster.includes(p));

    const briefings: IntelligenceBriefing[] = [];

    // 1. Breaking News Intelligence Brief
    if (breakingCluster.length > 0) {
      briefings.push(this.synthesizeCluster(
        'Breaking News & Security Alerts',
        'breaking',
        breakingCluster.slice(0, 4)
      ));
    }

    // 2. Trinbago Sports Arena Wrap-Up
    if (sportsCluster.length > 0) {
      briefings.push(this.synthesizeCluster(
        'Trinbago Sports Arena Round-Up',
        'sports',
        sportsCluster.slice(0, 4)
      ));
    }

    // 3. Trini Social Buzz & Viral Trends
    if (socialCluster.length > 0) {
      briefings.push(this.synthesizeCluster(
        'Trinbago Social Media Pulse',
        'social',
        socialCluster.slice(0, 4)
      ));
    }

    // 4. National Development & Utilities Brief
    if (nationalCluster.length > 0) {
      briefings.push(this.synthesizeCluster(
        'National Affairs & Utilities Intelligence',
        'national',
        nationalCluster.slice(0, 4)
      ));
    }

    return briefings;
  }

  private static synthesizeCluster(
    topic: string,
    category: IntelligenceBriefing['category'],
    clusterPosts: Post[]
  ): IntelligenceBriefing {
    const mainPost = clusterPosts[0];
    const sources = clusterPosts.map((p) => ({
      name: p.sourceName,
      url: p.originalUrl
    }));

    const keyTakeaways = clusterPosts.map((p) => {
      return `${p.sourceName}: ${p.title.replace(/^(BREAKING|CNC3|TV6|TTT|Newsday|Express):?\s*/i, '').trim()}`;
    });

    const timestamp = getCurrentASTTime();

    let title = `${topic}: Lead story from ${mainPost.sourceName}`;
    let summary = mainPost.summary;

    if (category === 'sports') {
      title = `Sports Wrap: ${mainPost.title}`;
      summary = `Key athletic fixtures and team announcements reported by ${sources.map((s) => s.name).join(', ')}. ${mainPost.summary}`;
    } else if (category === 'breaking') {
      title = `Urgent Bulletin: ${mainPost.title}`;
      summary = `National security, traffic and utility emergency notices compiled from Trinidad newsrooms at ${timestamp}. ${mainPost.summary}`;
    } else if (category === 'social') {
      title = `Viral TT Round-Up: ${mainPost.title}`;
      summary = `Top community reactions and trending clips dominating #TriniTikTok, Facebook, and Instagram. ${mainPost.summary}`;
    }

    // Craft ready-to-share social copy
    const bulletList = keyTakeaways.map((t) => `• ${t}`).join('\n');
    const whatsappDraft = `*TRENDING TT INTELLIGENCE BRIEF: ${topic.toUpperCase()}*\n\n${summary}\n\n*Key Highlights:*\n${bulletList}\n\nRead live updates on Trending TT:\nhttps://trendingtt.com`;
    const facebookDraft = `TRENDING TT DAILY BRIEF: ${topic}\n\n${summary}\n\nMain Takeaways:\n${bulletList}\n\nSources: ${sources.map((s) => s.name).join(' | ')}\n#TrendingTT #TrinidadAndTobago #NewsTT`;
    const xTwitterDraft = `[Trending TT] ${title.slice(0, 160)}\n\n${mainPost.summary.slice(0, 80)}...\n\nDetails: https://trendingtt.com\n#Trinidad #Newsday #TV6 #CNC3`;
    const telegramDraft = `*${topic}*\n\n${summary}\n\n${bulletList}\n\nSource: Trending TT Dispatch`;

    return {
      id: `brief-${category}-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      topic,
      category,
      title,
      executiveSummary: summary,
      keyTakeaways,
      primarySources: sources,
      socialDrafts: {
        whatsapp: whatsappDraft,
        facebook: facebookDraft,
        xTwitter: xTwitterDraft,
        telegram: telegramDraft
      },
      sourcePostIds: clusterPosts.map((p) => p.id)
    };
  }

  /**
   * Convert NotebookLM notes or raw text paste into a published Post object
   */
  public static parseNotebookLmNotes(rawText: string, author = 'Editorial Desk'): Post {
    const lines = rawText.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    const title = lines[0]?.replace(/^[#*-]+\s*/, '') || 'NotebookLM Curated Trinbago Intelligence Brief';
    
    // Look for bullet points or paragraphs
    const bullets = lines.filter((l) => /^[-*•\d.]+\s+/.test(l));
    const summary = bullets.slice(0, 3).map((b) => b.replace(/^[-*•\d.]+\s+/, '')).join('. ') || lines[1] || 'Curated synthesis of recent events.';
    const content = lines.slice(1).join('\n\n');

    // Classify category based on text
    const lower = rawText.toLowerCase();
    let category: Post['category'] = 'broadcast';
    if (/cricket|football|cpl|red force|soca warriors/i.test(lower)) {
      category = 'sports';
    } else if (/breaking|emergency|curfew|alert/i.test(lower)) {
      category = 'breaking';
    } else if (/tiktok|viral|instagram|facebook/i.test(lower)) {
      category = 'social';
    }

    return {
      id: `brief-published-${Date.now()}`,
      title: title.slice(0, 140),
      summary: summary.slice(0, 260),
      content,
      sourceId: 'ttt',
      sourceName: 'NotebookLM Curated Brief',
      sourceType: 'broadcast',
      author,
      originalUrl: 'https://trendingtt.com/#notebooklm-brief',
      publishedAt: new Date().toISOString(),
      category,
      tags: ['NotebookLM Brief', 'Intelligence Synthesis', 'Trinidad & Tobago'],
      trendingScore: 98,
      upvotes: 180,
      commentsCount: 14,
      isBreaking: category === 'breaking',
      media: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
        aspectRatio: 'landscape'
      }
    };
  }
}
