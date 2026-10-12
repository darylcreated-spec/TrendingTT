import React, { useState, useEffect } from 'react';
import type { Post, TrafficSegment } from '../types';
import { INITIAL_TRAFFIC_SEGMENTS, INITIAL_TTMS_ADVISORY } from '../data/radarAndPollData';
import { Car, CloudRain, ChevronRight } from 'lucide-react';


interface BreakingTickerProps {
  breakingPosts: Post[];
  onSelectPost: (post: Post) => void;
  onOpenRadar?: () => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({ 
  breakingPosts, 
  onSelectPost,
  onOpenRadar
}) => {
  const [activeMode, setActiveMode] = useState<'news' | 'traffic' | 'weather'>('news');

  // Rotate between Breaking News, Highway Traffic delays, and Weather alerts every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMode((prev) => {
        if (prev === 'news') return 'traffic';
        if (prev === 'traffic') return 'weather';
        return 'news';
      });
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  // Filter significant highway traffic segments
  const heavyTraffic = INITIAL_TRAFFIC_SEGMENTS.filter(
    (s: TrafficSegment) => s.severity === 'heavy' || s.severity === 'gridlock' || s.severity === 'flood'
  );


  return (
    <div className="bg-slate-950 border-y border-slate-800 text-slate-100 px-3 sm:px-4 py-2 flex items-center justify-between overflow-hidden select-none relative z-20 w-full max-w-full min-w-0">
      {/* Dynamic Alert Mode Pill */}
      <div className="flex items-center gap-2 shrink-0 mr-3">
        {activeMode === 'news' && (
          <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-red-100 bg-red-600 px-2.5 py-1 rounded-md shadow-sm border border-red-400 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            Breaking TT
          </div>
        )}

        {activeMode === 'traffic' && (
          <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-amber-950 bg-amber-400 px-2.5 py-1 rounded-md shadow-sm border border-amber-300">
            <Car className="w-3.5 h-3.5 text-amber-950" />
            Traffic Alert
          </div>
        )}

        {activeMode === 'weather' && (
          <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-cyan-950 bg-cyan-400 px-2.5 py-1 rounded-md shadow-sm border border-cyan-300">
            <CloudRain className="w-3.5 h-3.5 text-cyan-950" />
            Weather Radar
          </div>
        )}
      </div>

      {/* Main Alert Message Ticker */}
      <div className="overflow-hidden relative flex-1 min-w-0">
        {activeMode === 'news' && breakingPosts.length > 0 && (
          <div className="animate-ticker flex items-center gap-8 cursor-pointer">
            {breakingPosts.concat(breakingPosts).map((post, idx) => (
              <div
                key={`${post.id}-${idx}`}
                onClick={() => onSelectPost(post)}
                className="flex items-center gap-2 hover:underline shrink-0 text-xs sm:text-sm font-medium text-slate-200"
              >
                <span className="text-red-400 font-bold">[{post.sourceName}]:</span>
                <span className="truncate max-w-md sm:max-w-xl">{post.title}</span>
                <span className="text-slate-600 ml-4">•</span>
              </div>
            ))}
          </div>
        )}

        {activeMode === 'traffic' && (
          <div 
            onClick={onOpenRadar}
            className="flex items-center gap-4 cursor-pointer overflow-x-auto no-scrollbar py-0.5 text-xs sm:text-sm"
          >
            {heavyTraffic.length > 0 ? (
              heavyTraffic.map((seg) => (
                <div key={seg.id} className="flex items-center gap-1.5 shrink-0 hover:underline">
                  <span className="font-bold text-amber-400">[{seg.highwayName}]:</span>
                  <span className="text-slate-200">{seg.segmentName} ({seg.direction})</span>
                  <span className="text-red-400 font-bold">+{seg.delayMinutes}m delay</span>
                  <span className="text-slate-600 ml-2">•</span>
                </div>
              ))
            ) : (
              <div className="text-emerald-400 font-semibold flex items-center gap-1">
                <span>UBH, CRH & PBR: Smooth flowing transit across major corridors.</span>
              </div>
            )}
          </div>
        )}

        {activeMode === 'weather' && (
          <div 
            onClick={onOpenRadar}
            className="flex items-center gap-3 cursor-pointer text-xs sm:text-sm hover:underline"
          >
            <span className="text-cyan-300 font-bold">TTMS Alert:</span>
            <span className="text-slate-200 truncate">
              {INITIAL_TTMS_ADVISORY.type} • {INITIAL_TTMS_ADVISORY.headline}
            </span>
          </div>
        )}

      </div>

      {/* Quick Radar Navigation Shortcut */}
      {onOpenRadar && (
        <button
          onClick={onOpenRadar}
          className="hidden md:flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white shrink-0 ml-3 bg-slate-900 px-2 py-1 rounded border border-slate-800 transition-colors"
          title="Open Traffic & Weather Radar"
        >
          <span>Radar View</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
