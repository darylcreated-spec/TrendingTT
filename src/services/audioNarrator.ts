/**
 * Client-Side Text-To-Speech (TTS) Service using Web Speech API
 * 100% Free, zero latency, works on mobile & desktop browsers.
 * Features 60-Second Commuter Audio Byte for continuous headlines + CRH/UBH/PBR traffic alerts.
 */

import { getCurrentASTTime } from '../utils/dateUtils.ts';

type ListenerCallback = (state: AudioPlayerState) => void;

export interface AudioPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  currentPostId: string | null;
  currentTitle: string | null;
  playbackRate: number;
  isCommuterByte: boolean;
  summaryText?: string;
}

export interface CommuterSummaryContent {
  narrationScript: string;
  whatsAppText: string;
}

class AudioNarratorService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private cachedWhatsAppText: string = '';
  private state: AudioPlayerState = {
    isPlaying: false,
    isPaused: false,
    currentPostId: null,
    currentTitle: null,
    playbackRate: 1.0,
    isCommuterByte: false,
    summaryText: undefined,
  };
  private listeners: Set<ListenerCallback> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isSupported(): boolean {
    return Boolean(this.synth);
  }

  public getState(): AudioPlayerState {
    return { ...this.state };
  }

  public subscribe(listener: ListenerCallback): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const currentState = this.getState();
    this.listeners.forEach((listener) => listener(currentState));
  }

  /**
   * Constructs the 60-second commuter summary script & WhatsApp shareable text
   */
  public buildCommuterSummary(
    posts?: Array<{ title: string; summary?: string; sourceName?: string; isBreaking?: boolean }>,
    trafficSegments?: Array<{ highwayId: string; highwayName: string; segmentName: string; statusText: string; delayMinutes: number; severity: string }>
  ): CommuterSummaryContent {
    const safePosts = Array.isArray(posts) ? posts : [];
    const safeTraffic = Array.isArray(trafficSegments) ? trafficSegments : [];

    // 1. Filter top 2-3 headlines
    const topPosts = safePosts.slice(0, 3);
    const headlineItems = topPosts.length > 0
      ? topPosts.map((p, idx) => {
          const source = p.sourceName || 'Local Media';
          return `Story ${idx + 1}, from ${source}: ${p.title}.`;
        }).join(' ')
      : 'All quiet across Trinidad and Tobago today with no urgent disruptions reported.';

    // 2. Identify CRH, UBH, and PBR conditions
    const crh = safeTraffic.find((s) => s.highwayId === 'crh') || {
      segmentName: 'Curepe & Valsayn',
      statusText: 'Normal morning flow along the Churchill Roosevelt Highway',
      delayMinutes: 5,
      severity: 'moderate'
    };
    const ubh = safeTraffic.find((s) => s.highwayId === 'ubh') || {
      segmentName: 'Caroni & Chaguanas',
      statusText: 'Steady progress past Grand Bazaar on the Uriah Butler Highway',
      delayMinutes: 8,
      severity: 'moderate'
    };
    const pbr = safeTraffic.find((s) => s.highwayId === 'pbr') || {
      segmentName: 'Mount Hope to Port of Spain',
      statusText: 'Maxi taxis and authorized buses moving briskly along the Priority Bus Route',
      delayMinutes: 2,
      severity: 'smooth'
    };

    // Continuous narration script designed for ~60 seconds TTS delivery
    const narrationScript = `Good day Trinidad and Tobago. Here is your 60-second Commuter Audio Byte. ` +
      `First, top national headlines: ${headlineItems} ` +
      `Now, your major highway congestion report: ` +
      `On the Churchill Roosevelt Highway (CRH): ${crh.statusText}, with estimated delay of ${crh.delayMinutes} minutes. ` +
      `On the Uriah Butler Highway (UBH): ${ubh.statusText}, delay approximately ${ubh.delayMinutes} minutes. ` +
      `On the Priority Bus Route (PBR): ${pbr.statusText}. ` +
      `Drive safe, stay alert on the roads, and keep tuned to Trending TT for live traffic and weather radar updates.`;

    // WhatsApp friendly text format with markdown
    const timestampStr = getCurrentASTTime();
    const headlinesList = topPosts.length > 0
      ? topPosts.map((p, i) => `${i + 1}. *${p.title}* (${p.sourceName || 'T&T'})\n`).join('')
      : '• All clear across Trinidad & Tobago today.\n';

    const whatsAppText = 
      `📻 *TRENDING.TT - 60-SECOND COMMUTER AUDIO SUMMARY* (${timestampStr})\n\n` +
      `📰 *TOP HEADLINES:*\n` +
      headlinesList +
      `\n🚗 *HIGHWAY CONGESTION RADAR:*\n` +
      `• *CRH (Churchill Roosevelt):* ${crh.statusText} (~${crh.delayMinutes}m delay)\n` +
      `• *UBH (Uriah Butler):* ${ubh.statusText} (~${ubh.delayMinutes}m delay)\n` +
      `• *PBR (Priority Bus Route):* ${pbr.statusText}\n\n` +
      `🔊 Listen to live TTS commuter audio & check real-time radar:\n` +
      `${typeof window !== 'undefined' ? window.location.origin : 'https://trendingtt.com'} #TrendingTT #TriniCommute`;

    return { narrationScript, whatsAppText };
  }

  /**
   * Speak the 60-Second Commuter Audio Byte
   */
  public speakCommuterSummary(
    posts: Array<{ title: string; summary?: string; sourceName?: string; isBreaking?: boolean }>,
    trafficSegments: Array<{ highwayId: string; highwayName: string; segmentName: string; statusText: string; delayMinutes: number; severity: string }>
  ): void {
    if (!this.synth) return;

    // Toggle if already running
    if (this.state.isCommuterByte && this.state.isPlaying) {
      this.pause();
      return;
    }
    if (this.state.isCommuterByte && this.state.isPaused) {
      this.resume();
      return;
    }

    this.stop();

    const { narrationScript, whatsAppText } = this.buildCommuterSummary(posts, trafficSegments);
    this.cachedWhatsAppText = whatsAppText;

    const utterance = new SpeechSynthesisUtterance(narrationScript);
    utterance.rate = this.state.playbackRate;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.state.currentPostId = 'commuter-60s-byte';
      this.state.currentTitle = '60-Second Commuter Audio Byte (Headlines + CRH/UBH/PBR)';
      this.state.isCommuterByte = true;
      this.state.summaryText = whatsAppText;
      this.notify();
    };

    utterance.onend = () => {
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.state.currentPostId = null;
      this.state.currentTitle = null;
      this.state.isCommuterByte = false;
      this.currentUtterance = null;
      this.notify();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis notice:', e);
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.state.currentPostId = null;
      this.state.currentTitle = null;
      this.state.isCommuterByte = false;
      this.currentUtterance = null;
      this.notify();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * Open WhatsApp with the Commuter Audio Summary
   */
  public shareSummaryToWhatsApp(text?: string): void {
    let textToShare = text || this.cachedWhatsAppText || this.state.summaryText;
    if (!textToShare) {
      const fallback = this.buildCommuterSummary([], []);
      textToShare = fallback.whatsAppText;
    }

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Speak a specific story or summary
   */
  public speakStory(params: {
    id: string;
    title: string;
    summary: string;
    sourceName: string;
    author?: string;
  }): void {
    if (!this.synth) return;

    // If already playing this post, toggle pause
    if (this.state.currentPostId === params.id && this.state.isPlaying) {
      this.pause();
      return;
    }

    if (this.state.currentPostId === params.id && this.state.isPaused) {
      this.resume();
      return;
    }

    // Stop current speech
    this.stop();

    const narrationText = `From ${params.sourceName}. ${params.title}. ${params.summary}`;

    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.rate = this.state.playbackRate;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.state.currentPostId = params.id;
      this.state.currentTitle = params.title;
      this.state.isCommuterByte = false;
      this.state.summaryText = undefined;
      this.notify();
    };

    utterance.onend = () => {
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.state.currentPostId = null;
      this.state.currentTitle = null;
      this.state.isCommuterByte = false;
      this.currentUtterance = null;
      this.notify();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis notice:', e);
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.state.currentPostId = null;
      this.state.currentTitle = null;
      this.state.isCommuterByte = false;
      this.currentUtterance = null;
      this.notify();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause(): void {
    if (!this.synth) return;
    this.synth.pause();
    this.state.isPlaying = false;
    this.state.isPaused = true;
    this.notify();
  }

  public resume(): void {
    if (!this.synth) return;
    this.synth.resume();
    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.notify();
  }

  public stop(): void {
    if (!this.synth) return;
    this.synth.cancel();
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.currentPostId = null;
    this.state.currentTitle = null;
    this.state.isCommuterByte = false;
    this.currentUtterance = null;
    this.notify();
  }

  public setPlaybackRate(rate: number): void {
    this.state.playbackRate = rate;
    if (this.currentUtterance) {
      this.currentUtterance.rate = rate;
    }
    this.notify();
  }
}

export const AudioNarrator = new AudioNarratorService();
