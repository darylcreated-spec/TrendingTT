import React from 'react';
import type { Post } from '../types';

interface BreakingTickerProps {
  breakingPosts: Post[];
  onSelectPost: (post: Post) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({ breakingPosts, onSelectPost }) => {
  if (breakingPosts.length === 0) return null;

  return (
    <div className="bg-red-950/80 border-y border-red-700/50 text-red-100 px-4 py-2 flex items-center overflow-hidden select-none">
      <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-red-300 bg-red-900/90 px-2.5 py-1 rounded shadow-sm shrink-0 mr-3 border border-red-500/40">
        <span className="w-2 h-2 rounded-full bg-red-400 animate-ping mr-0.5"></span>
        Breaking TT
      </div>

      <div className="overflow-hidden relative w-full">
        <div className="animate-ticker flex items-center gap-8 cursor-pointer">
          {breakingPosts.concat(breakingPosts).map((post, idx) => (
            <div
              key={`${post.id}-${idx}`}
              onClick={() => onSelectPost(post)}
              className="flex items-center gap-2 hover:underline shrink-0 text-sm font-medium text-slate-200"
            >
              <span className="text-red-400 font-bold">[{post.sourceName}]:</span>
              <span>{post.title}</span>
              <span className="text-slate-500 ml-4 font-serif">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
