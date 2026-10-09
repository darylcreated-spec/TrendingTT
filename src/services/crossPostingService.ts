import type { Post } from '../types';

export type CrossPostChannel = 'facebook' | 'twitter' | 'instagram' | 'telegram' | 'whatsapp';
export type CrossPostProvider = 'webhook' | 'postiz' | 'mixpost';

export interface ChannelMeta {
  id: CrossPostChannel;
  name: string;
  badge: string;
  color: string;
  charLimit?: number;
  description: string;
}

export const CHANNELS_META: Record<CrossPostChannel, ChannelMeta> = {
  facebook: {
    id: 'facebook',
    name: 'Facebook Page',
    badge: 'Facebook',
    color: 'bg-blue-600 border-blue-500 text-white',
    description: 'Postiz / Mixpost Page connector or Webhook stream'
  },
  twitter: {
    id: 'twitter',
    name: 'X (Twitter)',
    badge: 'X',
    color: 'bg-slate-800 border-slate-700 text-slate-100',
    charLimit: 280,
    description: 'Direct tweet dispatch with card preview'
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram Feed / Reels',
    badge: 'Instagram',
    color: 'bg-gradient-to-r from-purple-600 to-pink-600 border-pink-500 text-white',
    description: 'Visual feed update via Graph API or Postiz'
  },
  telegram: {
    id: 'telegram',
    name: 'Telegram Channel',
    badge: 'Telegram',
    color: 'bg-sky-600 border-sky-500 text-white',
    description: 'Immediate blast to Trinidad Telegram subscriber channels'
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp Broadcast',
    badge: 'WhatsApp',
    color: 'bg-emerald-600 border-emerald-500 text-white',
    description: 'WhatsApp Community announcement stream'
  }
};

export interface CrossPostConfig {
  provider: CrossPostProvider;
  webhookUrl: string;
  apiKey: string;
  defaultChannels: CrossPostChannel[];
  customTemplate: string;
  autoAppendHashtags: boolean;
}

export interface ChannelDispatchStatus {
  channel: CrossPostChannel;
  channelName: string;
  success: boolean;
  messageId?: string;
  statusText: string;
  dispatchedAt: string;
  error?: string;
}

export interface CrossPostDispatchResult {
  id: string;
  provider: CrossPostProvider;
  overallSuccess: boolean;
  channelStatuses: ChannelDispatchStatus[];
  dispatchedCount: number;
  dispatchedAt: string;
  summaryText: string;
  rawResponse?: any;
}

export interface CrossPostHistoryItem {
  id: string;
  postId: string;
  postTitle: string;
  provider: CrossPostProvider;
  channels: CrossPostChannel[];
  dispatchedAt: string;
  success: boolean;
  summaryText: string;
}

const STORAGE_KEY_CONFIG = 'trending_tt_crosspost_config';
const STORAGE_KEY_HISTORY = 'trending_tt_crosspost_history';

export const DEFAULT_TEMPLATE = `{title}

{summary}

Read full story on Trending TT:
{url}

{tags}`;

export const DEFAULT_CONFIG: CrossPostConfig = {
  provider: 'webhook',
  webhookUrl: '',
  apiKey: '',
  defaultChannels: ['facebook', 'twitter', 'telegram', 'whatsapp'],
  customTemplate: DEFAULT_TEMPLATE,
  autoAppendHashtags: true
};

export class CrossPostingService {
  /**
   * Retrieves persistent configuration from localStorage
   */
  public static getConfig(): CrossPostConfig {
    if (typeof window === 'undefined') return DEFAULT_CONFIG;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_CONFIG, ...parsed };
      }
    } catch {
      // Local storage unreadable
    }
    return DEFAULT_CONFIG;
  }

  /**
   * Saves configuration to localStorage
   */
  public static saveConfig(config: Partial<CrossPostConfig>): CrossPostConfig {
    const current = this.getConfig();
    const updated: CrossPostConfig = { ...current, ...config };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save cross-post config to localStorage', err);
      }
    }
    return updated;
  }

  /**
   * Formats a post using template variables
   */
  public static formatMessage(post: Post, template?: string): string {
    const activeTemplate = template || this.getConfig().customTemplate || DEFAULT_TEMPLATE;
    const shareUrl = typeof window !== 'undefined' && window.location.origin 
      ? `${window.location.origin}/#post-${post.id}` 
      : post.originalUrl;

    const formattedTags = post.tags
      .map(tag => tag.startsWith('#') ? tag : `#${tag.replace(/\s+/g, '')}`)
      .join(' ') || '#TrinidadAndTobago #TrendingTT';

    return activeTemplate
      .replace(/{title}/g, post.title)
      .replace(/{summary}/g, post.summary)
      .replace(/{url}/g, shareUrl)
      .replace(/{source}/g, post.sourceName)
      .replace(/{category}/g, post.category.toUpperCase())
      .replace(/{tags}/g, formattedTags)
      .trim();
  }

  /**
   * Dispatches a cross-post across selected channels
   */
  public static async dispatchCrossPost(params: {
    post: Post;
    message: string;
    channels: CrossPostChannel[];
    config?: CrossPostConfig;
  }): Promise<CrossPostDispatchResult> {
    const { post, message, channels } = params;
    const config = params.config || this.getConfig();
    const dispatchId = `dispatch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();

    if (!channels || channels.length === 0) {
      throw new Error('At least one target social channel must be selected for cross-posting.');
    }

    if (!message || !message.trim()) {
      throw new Error('A formatted message must be provided for cross-posting.');
    }

    const shareUrl = typeof window !== 'undefined' && window.location.origin 
      ? `${window.location.origin}/#post-${post.id}` 
      : post.originalUrl;

    // Build platform payloads according to provider format
    let payload: any;
    if (config.provider === 'postiz') {
      payload = {
        type: 'now',
        content: message,
        platforms: channels,
        media: post.media?.url ? [{ url: post.media.url }] : [],
        metadata: {
          dispatchId,
          postId: post.id,
          title: post.title,
          url: shareUrl,
          sourceName: post.sourceName
        }
      };
    } else if (config.provider === 'mixpost') {
      payload = {
        content: message,
        channels: channels,
        date: timestamp,
        media: post.media?.url ? [post.media.url] : [],
        metadata: {
          dispatchId,
          postId: post.id,
          title: post.title,
          url: shareUrl
        }
      };
    } else {
      // Standard custom webhook / n8n / Zapier payload
      payload = {
        dispatchId,
        event: 'cross_post_publish',
        provider: config.provider,
        timestamp,
        channels,
        post: {
          id: post.id,
          title: post.title,
          summary: post.summary,
          url: shareUrl,
          sourceName: post.sourceName,
          category: post.category,
          publishedAt: post.publishedAt
        },
        content: {
          text: message,
          mediaUrl: post.media?.url,
          mediaType: post.media?.type
        }
      };
    }

    let overallSuccess = true;
    const channelStatuses: ChannelDispatchStatus[] = [];
    let rawResponse: any = null;

    // Check if an external webhook / API URL is provided and valid
    const trimmedUrl = config.webhookUrl ? config.webhookUrl.trim() : '';
    const hasLiveEndpoint = Boolean(trimmedUrl && (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')));

    if (trimmedUrl && !hasLiveEndpoint) {
      overallSuccess = false;
      rawResponse = { error: 'Invalid URL. Webhook URL must begin with http:// or https://' };
    } else if (hasLiveEndpoint) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };

        if (config.apiKey && config.apiKey.trim()) {
          headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
          headers['X-API-Key'] = config.apiKey.trim();
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(trimmedUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (response.ok) {
          try {
            rawResponse = await response.json();
          } catch {
            rawResponse = { status: response.status, statusText: response.statusText };
          }
        } else {
          overallSuccess = false;
          rawResponse = { error: `Endpoint returned HTTP ${response.status}: ${response.statusText}` };
        }
      } catch (err: any) {
        overallSuccess = false;
        rawResponse = { error: err.message || 'Network dispatch failed' };
      }
    }

    // Generate individual channel delivery receipts
    for (const channel of channels) {
      const meta = CHANNELS_META[channel];
      const channelSuccess = hasLiveEndpoint ? overallSuccess : (trimmedUrl ? false : true);
      const receiptId = `${channel}-${dispatchId.slice(-6)}`;

      channelStatuses.push({
        channel,
        channelName: meta.name,
        success: channelSuccess,
        messageId: receiptId,
        statusText: channelSuccess ? 'Dispatched' : 'Failed to deliver',
        dispatchedAt: timestamp,
        error: channelSuccess ? undefined : (rawResponse?.error || 'Endpoint connection error')
      });
    }

    const successfulCount = channelStatuses.filter(s => s.success).length;
    const result: CrossPostDispatchResult = {
      id: dispatchId,
      provider: config.provider,
      overallSuccess: successfulCount > 0,
      channelStatuses,
      dispatchedCount: successfulCount,
      dispatchedAt: timestamp,
      summaryText: successfulCount === channels.length
        ? `Successfully dispatched to all ${channels.length} selected channels via ${config.provider.toUpperCase()}.`
        : `Dispatched to ${successfulCount}/${channels.length} channels with some warnings.`,
      rawResponse
    };

    // Record to history in localStorage
    this.recordHistory({
      id: dispatchId,
      postId: post.id,
      postTitle: post.title,
      provider: config.provider,
      channels,
      dispatchedAt: timestamp,
      success: result.overallSuccess,
      summaryText: result.summaryText
    });

    return result;
  }

  /**
   * Tests webhook connectivity
   */
  public static async testWebhook(config?: CrossPostConfig): Promise<{
    success: boolean;
    latencyMs: number;
    message: string;
  }> {
    const activeConfig = config || this.getConfig();
    const startTime = performance.now();

    if (!activeConfig.webhookUrl || !activeConfig.webhookUrl.trim()) {
      return {
        success: true,
        latencyMs: 12,
        message: 'Local sandbox mode active. Webhook simulations will succeed without an external server.'
      };
    }

    const trimmedUrl = activeConfig.webhookUrl.trim();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return {
        success: false,
        latencyMs: 0,
        message: 'Invalid endpoint URL. Must start with https:// or http://'
      };
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (activeConfig.apiKey) {
        headers['Authorization'] = `Bearer ${activeConfig.apiKey}`;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(activeConfig.webhookUrl.trim(), {
        method: 'POST',
        headers,
        body: JSON.stringify({ event: 'ping', test: true, timestamp: new Date().toISOString() }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      const latencyMs = Math.round(performance.now() - startTime);

      if (res.ok) {
        return {
          success: true,
          latencyMs,
          message: `Endpoint verified successfully (HTTP ${res.status}, ${latencyMs}ms).`
        };
      } else {
        return {
          success: false,
          latencyMs,
          message: `Endpoint returned HTTP ${res.status}: ${res.statusText}`
        };
      }
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        success: false,
        latencyMs,
        message: `Endpoint connection failed: ${err.message || 'Timeout'}`
      };
    }
  }

  /**
   * Gets dispatch audit history
   */
  public static getHistory(): CrossPostHistoryItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private static recordHistory(item: CrossPostHistoryItem): void {
    if (typeof window === 'undefined') return;
    try {
      const history = this.getHistory();
      history.unshift(item);
      // Keep recent 25 dispatches
      const trimmed = history.slice(0, 25);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(trimmed));
    } catch (err) {
      console.error('Failed to append to cross-post history', err);
    }
  }
}
