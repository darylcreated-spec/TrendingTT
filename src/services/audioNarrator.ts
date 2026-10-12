/**
 * Client-Side Text-To-Speech (TTS) Service using Web Speech API
 * 100% Free, zero latency, works on mobile & desktop browsers.
 */

type ListenerCallback = (state: AudioPlayerState) => void;

export interface AudioPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  currentPostId: string | null;
  currentTitle: string | null;
  playbackRate: number;
}

class AudioNarratorService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private state: AudioPlayerState = {
    isPlaying: false,
    isPaused: false,
    currentPostId: null,
    currentTitle: null,
    playbackRate: 1.0,
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
      this.notify();
    };

    utterance.onend = () => {
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.state.currentPostId = null;
      this.state.currentTitle = null;
      this.currentUtterance = null;
      this.notify();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis notice:', e);
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.state.currentPostId = null;
      this.state.currentTitle = null;
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
