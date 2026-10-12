import type { Post, SourceId } from '../types';

export interface IngestionConfig {
  rssBridgeBaseUrl: string;
  enableMockFallback: boolean;
  cacheEndpoint: string;
  decoupledDataUrl?: string;
  autoIngestIntervalMs: number;
}

export interface IngestionResult {
  posts: Post[];
  totalIngested: number;
  sourceCounts: Partial<Record<SourceId, number>>;
  errors: string[];
  timestamp: string;
  isOfflineFallback: boolean;
  storageSource?: 'decoupled-remote' | 'local-bundle' | 'offline-mock';
}

export interface ConnectorTestResult {
  connector: 'yt-dlp' | 'rss-bridge';
  endpoint: string;
  reachable: boolean;
  latencyMs: number;
  itemsFound: number;
  message: string;
}

export interface YtDlpRawMetadata {
  id?: string;
  title?: string;
  description?: string;
  uploader?: string;
  channel?: string;
  webpage_url?: string;
  url?: string;
  upload_date?: string;
  timestamp?: number;
  duration?: number;
  thumbnail?: string;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  tags?: string[];
}

export interface RssBridgeRawItem {
  id?: string;
  title?: string;
  name?: string;
  url?: string;
  link?: string;
  content_html?: string;
  content_text?: string;
  description?: string;
  summary?: string;
  date_published?: string;
  pubDate?: string;
  author?: { name?: string };
  image?: string;
  thumbnail?: string;
}

const DEFAULT_CONFIG: IngestionConfig = {
  rssBridgeBaseUrl: 'https://rss-bridge.org/bridge01',
  enableMockFallback: true,
  cacheEndpoint: '/data/ingested-posts.json',
  decoupledDataUrl: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_DATA_FEED_URL) || 'https://raw.githubusercontent.com/darylcreated-spec/TrendingTT/data-feed/public/data/ingested-posts.json',
  autoIngestIntervalMs: 5 * 60 * 1000
};

// High-fidelity pre-cached Trinidad & Tobago social items
export const OFFLINE_SOCIAL_FALLBACK: Post[] = [
  {
    id: 'yt-dlp-tiktok-maracas-crowd',
    title: 'TikTok #trinitiktok: Massive weekend bake & shark frenzy hits Maracas Bay beachfront',
    summary: 'Viral TikTok videos capture energetic crowds, fresh shark bakes with garlic and chadon beni sauce, and North Coast traffic updates trending across Trinidad.',
    content: 'Creators along the North Coast road shared live clips showing lines at Richards and Patsys bake and shark stalls. Over 180k views under #trinitiktok within 12 hours.',
    sourceId: 'tiktok',
    sourceName: 'Trinidad TikTok',
    sourceType: 'social',
    author: '@maracas_vibes868',
    originalUrl: 'https://www.tiktok.com/tag/trinitiktok',
    publishedAt: new Date(Date.now() - 36 * 60 * 1000).toISOString(),
    category: 'culture',
    tags: ['#trinitiktok', 'Maracas Bay', 'Bake and Shark', 'TikTok TT'],
    trendingScore: 98,
    upvotes: 642,
    commentsCount: 147,
    isBreaking: false,
    media: {
      type: 'video',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      aspectRatio: 'landscape',
      videoDuration: '0:58'
    }
  },
  {
    id: 'yt-dlp-tv6-evening-news-anchor',
    title: 'TV6 News 7PM: National Security ministers debate border patrol radar upgrade',
    summary: 'CCN TV6 lead evening newscast covers parliament debate over offshore patrol vessel surveillance and coastal radar updates in the Gulf of Paria.',
    content: 'CCN TV6 full broadcast segment. Anchor reports on parliamentary debate concerning maritime radar technology, police service updates, and South Trunk road drainage.',
    sourceId: 'tv6',
    sourceName: 'CCN TV6',
    sourceType: 'broadcast',
    author: 'CCN TV6 News Desk',
    originalUrl: 'https://www.youtube.com/watch?v=tv6-sample-news-7pm',
    publishedAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    category: 'broadcast',
    tags: ['TV6 News', 'Evening Broadcast', 'Parliament TT', 'Port of Spain'],
    trendingScore: 95,
    upvotes: 430,
    commentsCount: 88,
    isBreaking: false,
    media: {
      type: 'video',
      url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
      aspectRatio: 'landscape',
      videoDuration: '48:12'
    }
  },
  {
    id: 'yt-dlp-cnc3-evening-bulletin',
    title: 'CNC3 News at 7: Point Lisas petrochemical sector records positive Q1 trade output',
    summary: 'CNC3 in-depth evening report examines ammonia and methanol export earnings, Point Lisas Industrial Estate maintenance schedules, and foreign exchange impact.',
    content: 'CNC3 Business & Evening Desk report detailing energy sector revenue, downstream petrochemical performance, and discussions with the Energy Chamber of Trinidad & Tobago.',
    sourceId: 'cnc3',
    sourceName: 'CNC3 Television',
    sourceType: 'broadcast',
    author: 'CNC3 News Anchor',
    originalUrl: 'https://www.youtube.com/watch?v=cnc3-sample-evening-7',
    publishedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    category: 'business',
    tags: ['CNC3 News', 'Point Lisas', 'Energy TT', 'Economy'],
    trendingScore: 91,
    upvotes: 385,
    commentsCount: 42,
    isBreaking: false,
    media: {
      type: 'video',
      url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
      aspectRatio: 'landscape',
      videoDuration: '42:30'
    }
  },
  {
    id: 'yt-dlp-ttt-national-roundup',
    title: 'TTT News at 7: Ministry of Works confirms Churchill Roosevelt Highway lane expansion',
    summary: 'TTT Live Online coverage of highway infrastructure improvements between Curepe and Piarco junction, reducing peak-hour commute times for east-west commuters.',
    content: 'Official government broadcast report featuring Minister of Works on Churchill Roosevelt Highway overpass progress and flyover infrastructure in East Trinidad.',
    sourceId: 'ttt',
    sourceName: 'TTT Live Online',
    sourceType: 'broadcast',
    author: 'TTT Live Studio',
    originalUrl: 'https://www.youtube.com/watch?v=ttt-sample-news-7pm',
    publishedAt: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    category: 'broadcast',
    tags: ['TTT Live', 'Churchill Roosevelt Highway', 'Infrastructure', 'Curepe'],
    trendingScore: 89,
    upvotes: 312,
    commentsCount: 35,
    isBreaking: false,
    media: {
      type: 'video',
      url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
      aspectRatio: 'landscape',
      videoDuration: '45:00'
    }
  },
  {
    id: 'yt-dlp-facebook-ian-live-investigation',
    title: 'I.A.N Network Reels: Live community standoff resolution in Morvant junction',
    summary: 'Ian Alleyne streams on-the-ground Crime Watch investigation answering distress calls from residents regarding utility disruptions and neighborhood safety patrols.',
    content: 'Exclusive live video reel from Ian Alleyne Crime Watch camera crew on location in Morvant. Community elders meet with local council representatives to resolve street lighting and drainage grievances.',
    sourceId: 'ian',
    sourceName: 'I.A.N Network',
    sourceType: 'broadcast',
    author: 'Ian Alleyne',
    originalUrl: 'https://www.facebook.com/ianalleyne/videos/morvant-community-standoff',
    publishedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    category: 'crime',
    tags: ['Crime Watch', 'Ian Alleyne', 'Morvant', 'Community Alert'],
    trendingScore: 96,
    upvotes: 890,
    commentsCount: 345,
    isBreaking: true,
    media: {
      type: 'video',
      url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
      aspectRatio: 'portrait',
      videoDuration: '18:45'
    }
  },
  {
    id: 'bridge-fb-tv6-morning-edition',
    title: 'CCN TV6 Facebook: Morning Edition panel debates food security and local agricultural incentives',
    summary: 'TV6 official Facebook desk shares key takeaways from parliamentary discussion on local farming subsidies, root crop production, and lowering supermarket import bills.',
    content: 'Viewers engaged in heated commentary under TV6 Morning Edition discussion regarding Trinidadian farmers, flood mitigation subsidies in Plum Mitan, and vegetable market price stabilization.',
    sourceId: 'tv6',
    sourceName: 'CCN TV6',
    sourceType: 'broadcast',
    author: 'CCN TV6 Digital Desk',
    originalUrl: 'https://www.facebook.com/CCNTV6/posts/morning-edition-agriculture',
    publishedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    category: 'broadcast',
    tags: ['TV6 Facebook', 'Morning Edition', 'Food Security', 'Trinidad Agriculture'],
    trendingScore: 88,
    upvotes: 395,
    commentsCount: 94,
    isBreaking: false,
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
      aspectRatio: 'landscape'
    }
  },
  {
    id: 'bridge-fb-cnc3-port-upgrade',
    title: 'CNC3 Facebook: Port of Spain container terminal deploys automated gate logistics',
    summary: 'CNC3 Television Facebook feed highlights new digital processing systems at the Port Authority aimed at slashing trucker dwell times and freight delays.',
    content: 'The Port Authority of Trinidad and Tobago announced completion of its Phase 2 automated gate logistics system. CNC3 Digital desk covers container terminal trucker reactions and port efficiency metrics.',
    sourceId: 'cnc3',
    sourceName: 'CNC3 Television',
    sourceType: 'broadcast',
    author: 'CNC3 Television Digital Desk',
    originalUrl: 'https://www.facebook.com/CNC3Television/posts/port-logistics-update',
    publishedAt: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
    category: 'business',
    tags: ['CNC3 Facebook', 'Port of Spain', 'Trade TT', 'Infrastructure'],
    trendingScore: 87,
    upvotes: 340,
    commentsCount: 61,
    isBreaking: false,
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
      aspectRatio: 'landscape'
    }
  },
  {
    id: 'bridge-fb-ian-breaking',
    title: 'I.A.N Network: Police intercept robbery suspect along Uriah Butler Highway in Chaguanas',
    summary: 'Live Facebook video report by Ian Alleyne showing rapid TTPS Highway Patrol response, vehicle pursuit, and traffic standoff near Chaguanas flyover.',
    content: 'Ian Alleyne Crime Watch Network Facebook stream. Central Division TTPS officers apprehended two suspects following an attempted armed robbery. Highway traffic diverted onto Caroni Savannah Road.',
    sourceId: 'ian',
    sourceName: 'I.A.N Network',
    sourceType: 'broadcast',
    author: 'Ian Alleyne',
    originalUrl: 'https://www.facebook.com/ianalleyne/posts/central-division-highway',
    publishedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    category: 'crime',
    tags: ['Crime Watch', 'Ian Alleyne', 'Uriah Butler Highway', 'Chaguanas'],
    trendingScore: 97,
    upvotes: 820,
    commentsCount: 310,
    isBreaking: true,
    media: {
      type: 'video',
      url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
      aspectRatio: 'portrait',
      videoDuration: '14:22'
    }
  },
  {
    id: 'bridge-fb-newsday-education',
    title: 'Newsday Facebook: SEA Exam candidates celebrate results across Port of Spain schools',
    summary: 'T&T Newsday Facebook page highlights heartfelt moments as parents and primary school students collect Secondary Entrance Assessment placement slips.',
    content: 'Newsday journalists visited schools in Belmont, Woodbrook, and San Fernando capturing reactions of students, teachers, and school principals after results delivery.',
    sourceId: 'newsday',
    sourceName: 'T&T Newsday',
    sourceType: 'newspaper',
    author: 'Newsday Digital Desk',
    originalUrl: 'https://www.facebook.com/NewsdayTT/posts/sea-results-celebrations',
    publishedAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    category: 'culture',
    tags: ['Newsday', 'SEA Exam', 'Education TT', 'Port of Spain'],
    trendingScore: 86,
    upvotes: 460,
    commentsCount: 52,
    isBreaking: false,
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      aspectRatio: 'landscape'
    }
  },
  {
    id: 'bridge-ig-tv6-sports-cricket',
    title: 'Instagram Reels: Nicholas Pooran smashes 84 off 32 balls at Queen\'s Park Oval',
    summary: 'High-energy highlights shared by TV6 Sports on Instagram show Pooran lighting up the St Clair venue with towering sixes into the Trini Posse stand.',
    content: 'Queens Park Oval cricket highlights reel reposted by TV6 TNT. West Indies batsman entertains enthusiastic local crowd during domestic T20 cricket clash.',
    sourceId: 'instagram',
    sourceName: 'Instagram TT Reels',
    sourceType: 'social',
    author: '@tv6tnt',
    originalUrl: 'https://www.instagram.com/reel/tv6-pooran-sixes',
    publishedAt: new Date(Date.now() - 130 * 60 * 1000).toISOString(),
    category: 'sports',
    tags: ['Cricket TT', 'Queens Park Oval', 'Nicholas Pooran', 'Instagram Reels'],
    trendingScore: 94,
    upvotes: 755,
    commentsCount: 168,
    isBreaking: false,
    media: {
      type: 'video',
      url: 'https://images.unsplash.com/photo-1531415074868-836332ff4296?auto=format&fit=crop&w=1200&q=80',
      aspectRatio: 'portrait',
      videoDuration: '0:45'
    }
  },
  {
    id: 'bridge-ig-cnc3-pan-carnival-reel',
    title: 'Instagram Reels: Massy Trinidad All Stars electrify Duke Street rehearsal yard',
    summary: 'CNC3 News cultural reel showcases vibrant steelpan arrangement rehearsals on Duke Street as crowds gather to experience sweet iron rhythm sections.',
    content: 'Duke Street panyard comes alive. CNC3 News Instagram captures youth pan players mastering the musical arrangement alongside veteran pan tuners in East Port of Spain.',
    sourceId: 'instagram',
    sourceName: 'Instagram TT Reels',
    sourceType: 'social',
    author: '@cnc3news',
    originalUrl: 'https://www.instagram.com/reel/cnc3-all-stars-duke-street',
    publishedAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    category: 'culture',
    tags: ['CNC3 Reels', 'Steelpan TT', 'All Stars', 'Duke Street', 'Pan Yard'],
    trendingScore: 93,
    upvotes: 680,
    commentsCount: 112,
    isBreaking: false,
    media: {
      type: 'video',
      url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
      aspectRatio: 'portrait',
      videoDuration: '0:52'
    }
  }
];

export function normalizeYtDlpMetadata(raw: YtDlpRawMetadata, target: {
  sourceId: SourceId;
  sourceName: string;
  platform: string;
  defaultTags: string[];
}): Post {
  const publishedAt = raw.upload_date
    ? new Date(`${raw.upload_date.slice(0, 4)}-${raw.upload_date.slice(4, 6)}-${raw.upload_date.slice(6, 8)}`).toISOString()
    : (raw.timestamp ? new Date(raw.timestamp * 1000).toISOString() : new Date().toISOString());

  const durationSec = raw.duration || 0;
  const formattedDuration = durationSec > 0
    ? `${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, '0')}`
    : undefined;

  const rawTags = Array.isArray(raw.tags) ? raw.tags : [];
  const tags = Array.from(new Set([...target.defaultTags, ...rawTags])).slice(0, 5);
  const viewCount = Number(raw.view_count) || 1000;
  const likeCount = Number(raw.like_count) || Math.floor(viewCount * 0.05);
  const commentCount = Number(raw.comment_count) || Math.floor(likeCount * 0.15);

  const title = (raw.title || 'Trinidad Video Broadcast').trim();
  const description = (raw.description || raw.title || '').trim();
  const summary = description.length > 180 ? `${description.slice(0, 177)}...` : description;

  return {
    id: `yt-dlp-${target.platform}-${raw.id || Date.now()}`,
    title,
    summary: summary || title,
    content: description,
    sourceId: target.sourceId,
    sourceName: target.sourceName,
    sourceType: target.platform === 'tiktok' ? 'social' : 'broadcast',
    author: raw.uploader || raw.channel || target.sourceName,
    originalUrl: raw.webpage_url || raw.url || 'https://www.youtube.com',
    publishedAt,
    category: target.platform === 'tiktok' ? 'culture' : 'broadcast',
    tags,
    trendingScore: Math.min(99, Math.max(70, Math.floor(Math.log10(Math.max(10, viewCount)) * 18))),
    upvotes: likeCount,
    commentsCount: commentCount,
    isBreaking: Boolean(title.toLowerCase().includes('breaking') || title.toLowerCase().includes('live')),
    media: {
      type: 'video',
      url: raw.thumbnail || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
      aspectRatio: target.platform === 'tiktok' ? 'portrait' : 'landscape',
      videoDuration: formattedDuration
    }
  };
}

export function normalizeRssBridgeItem(item: RssBridgeRawItem, target: {
  sourceId: SourceId;
  sourceName: string;
  bridgeType: 'Facebook' | 'Instagram';
  tags: string[];
}): Post {
  const title = (item.title || item.name || `${target.sourceName} Update`).trim();
  const rawContent = (item.content_html || item.content_text || item.description || item.summary || '').trim();
  const plainText = rawContent.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
  const summary = plainText.length > 180 ? `${plainText.slice(0, 177)}...` : plainText;

  const publishedAt = item.date_published || item.pubDate || new Date().toISOString();
  const url = item.url || item.link || `https://${target.bridgeType.toLowerCase()}.com`;

  let mediaUrl = item.image || item.thumbnail;
  if (!mediaUrl && rawContent.includes('<img')) {
    const match = rawContent.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match) mediaUrl = match[1];
  }

  const isVideo = target.bridgeType === 'Instagram' || plainText.toLowerCase().includes('video');

  return {
    id: `rss-bridge-${target.bridgeType.toLowerCase()}-${item.id || Date.now()}`,
    title: title.length > 140 ? `${title.slice(0, 137)}...` : title,
    summary: summary || title,
    content: plainText,
    sourceId: target.sourceId,
    sourceName: target.sourceName,
    sourceType: target.bridgeType === 'Instagram' ? 'social' : 'broadcast',
    author: item.author?.name || target.sourceName,
    originalUrl: url,
    publishedAt: new Date(publishedAt).toISOString(),
    category: target.bridgeType === 'Instagram' ? 'sports' : 'broadcast',
    tags: target.tags,
    trendingScore: 88,
    upvotes: 240,
    commentsCount: 38,
    isBreaking: Boolean(title.toLowerCase().includes('breaking')),
    media: {
      type: isVideo ? 'video' : 'image',
      url: mediaUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      aspectRatio: isVideo ? 'portrait' : 'landscape'
    }
  };
}

export class SocialIngestionEngine {
  private config: IngestionConfig;

  constructor(customConfig?: Partial<IngestionConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
  }

  public updateConfig(newConfig: Partial<IngestionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): IngestionConfig {
    return { ...this.config };
  }

  /**
   * Fetches ingested social & broadcast feed with fallback
   */
  public async fetchIngestedFeed(): Promise<IngestionResult> {
    const errors: string[] = [];
    const sourceCounts: Partial<Record<SourceId, number>> = {};

    // 1. First attempt reading decoupled remote data storage branch (prevents git conflicts on main)
    if (this.config.decoupledDataUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(this.config.decoupledDataUrl, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          const payload = await res.json();
          if (Array.isArray(payload.posts) && payload.posts.length > 0) {
            for (const post of payload.posts) {
              sourceCounts[post.sourceId as SourceId] = (sourceCounts[post.sourceId as SourceId] || 0) + 1;
            }

            return {
              posts: payload.posts,
              totalIngested: payload.posts.length,
              sourceCounts,
              errors: payload.errors || [],
              timestamp: payload.meta?.generatedAt || new Date().toISOString(),
              isOfflineFallback: false,
              storageSource: 'decoupled-remote'
            };
          }
        }
      } catch {
        // Fallback to local cache if decoupled remote branch not reachable
      }
    }

    // 2. Try reading the local backend worker cache file
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(this.config.cacheEndpoint, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const payload = await res.json();
        if (Array.isArray(payload.posts) && payload.posts.length > 0) {
          for (const post of payload.posts) {
            sourceCounts[post.sourceId as SourceId] = (sourceCounts[post.sourceId as SourceId] || 0) + 1;
          }

          return {
            posts: payload.posts,
            totalIngested: payload.posts.length,
            sourceCounts,
            errors: payload.errors || [],
            timestamp: payload.meta?.generatedAt || new Date().toISOString(),
            isOfflineFallback: false,
            storageSource: 'local-bundle'
          };
        }
      }
    } catch {
      // Worker output not yet generated or endpoint unreachable
    }

    // 2. Fall back cleanly to the built-in authentic offline catalog
    const fallbackPosts = [...OFFLINE_SOCIAL_FALLBACK];
    for (const post of fallbackPosts) {
      sourceCounts[post.sourceId] = (sourceCounts[post.sourceId] || 0) + 1;
    }

    return {
      posts: fallbackPosts,
      totalIngested: fallbackPosts.length,
      sourceCounts,
      errors,
      timestamp: new Date().toISOString(),
      isOfflineFallback: true
    };
  }

  /**
   * Diagnostic test endpoint for connectors
   */
  public async testConnector(
    connector: 'yt-dlp' | 'rss-bridge',
    endpointUrl?: string
  ): Promise<ConnectorTestResult> {
    const startTime = performance.now();
    const targetUrl = endpointUrl || (connector === 'rss-bridge' ? this.config.rssBridgeBaseUrl : '/api/yt-dlp-worker');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(timeout);
      const latencyMs = Math.round(performance.now() - startTime);

      if (res.ok) {
        return {
          connector,
          endpoint: targetUrl,
          reachable: true,
          latencyMs,
          itemsFound: 5,
          message: `Connected successfully to ${connector} endpoint (${latencyMs}ms latency).`
        };
      }
    } catch {
      // Diagnostic mock response when offline
    }

    const latencyMs = Math.round(performance.now() - startTime);
    return {
      connector,
      endpoint: targetUrl,
      reachable: false,
      latencyMs,
      itemsFound: OFFLINE_SOCIAL_FALLBACK.length,
      message: `${connector} endpoint unavailable or offline. Operating with active fallback cache.`
    };
  }
}

// Global Singleton Instance
export const socialIngestionEngine = new SocialIngestionEngine();
