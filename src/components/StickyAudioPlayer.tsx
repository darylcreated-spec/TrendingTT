import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, Square } from 'lucide-react';
import { AudioNarrator, type AudioPlayerState } from '../services/audioNarrator';

export const StickyAudioPlayer: React.FC = () => {
  const [state, setState] = useState<AudioPlayerState>(() => AudioNarrator.getState());

  useEffect(() => {
    return AudioNarrator.subscribe((newState) => {
      setState(newState);
    });
  }, []);

  if (!state.isPlaying && !state.isPaused) {
    return null;
  }

  const toggleRate = () => {
    const nextRate = state.playbackRate === 1.0 ? 1.25 : state.playbackRate === 1.25 ? 1.5 : 1.0;
    AudioNarrator.setPlaybackRate(nextRate);
  };

  return (
    <aside 
      aria-label="Commuter Audio News Player"
      className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-slate-900/95 backdrop-blur-xl border border-red-500/60 rounded-2xl p-3 shadow-2xl animate-in slide-in-from-bottom-3 duration-200"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-md">
            {state.isPlaying ? (
              <Volume2 className="w-5 h-5 animate-pulse" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
              Commuter Audio Radio (AST)
            </span>
            <p className="text-xs font-semibold text-slate-100 truncate">
              {state.currentTitle || 'Narrating story...'}
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={toggleRate}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-amber-300 border border-slate-700"
            title="Toggle playback speed"
          >
            {state.playbackRate}x
          </button>

          {state.isPlaying ? (
            <button
              onClick={() => AudioNarrator.pause()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 active:scale-95"
              title="Pause narration"
            >
              <Pause className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => AudioNarrator.resume()}
              className="p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white border border-red-500 active:scale-95 shadow-md shadow-red-950/40"
              title="Resume narration"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          )}

          <button
            onClick={() => AudioNarrator.stop()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 active:scale-95"
            title="Stop narration"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
