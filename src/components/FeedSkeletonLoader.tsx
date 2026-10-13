import React from 'react';

export const FeedSkeletonCard: React.FC = () => {
  return (
    <div 
      role="status" 
      aria-label="Loading post..." 
      className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 animate-pulse"
    >
      {/* Header: Source & Timestamp */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 shrink-0" />
          <div className="space-y-1.5">
            <div className="w-24 h-3 bg-slate-800 rounded" />
            <div className="w-16 h-2 bg-slate-800/80 rounded" />
          </div>
        </div>
        <div className="w-12 h-5 bg-slate-800 rounded-full" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <div className="w-full h-4 bg-slate-800 rounded" />
        <div className="w-3/4 h-4 bg-slate-800 rounded" />
      </div>

      {/* Summary lines */}
      <div className="space-y-1.5">
        <div className="w-full h-3 bg-slate-800/60 rounded" />
        <div className="w-5/6 h-3 bg-slate-800/60 rounded" />
      </div>

      {/* Media placeholder */}
      <div className="w-full h-48 bg-slate-800/50 rounded-xl" />

      {/* Actions / reaction bar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-4">
          <div className="w-14 h-6 bg-slate-800 rounded" />
          <div className="w-14 h-6 bg-slate-800 rounded" />
        </div>
        <div className="w-8 h-8 bg-slate-800 rounded" />
      </div>
    </div>
  );
};

export const FeedSkeletonLoader: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4 w-full" aria-busy="true" aria-label="Loading bulletins">
      {Array.from({ length: count }).map((_, i) => (
        <FeedSkeletonCard key={i} />
      ))}
    </div>
  );
};
