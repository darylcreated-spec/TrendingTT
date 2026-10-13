import React from 'react';
import type { DataOrigin } from '../types';

interface DataOriginBadgeProps {
  origin?: DataOrigin;
  className?: string;
}

export const DataOriginBadge: React.FC<DataOriginBadgeProps> = ({ origin = 'sample', className = '' }) => {
  if (origin === 'live') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 shrink-0 ${className}`}
        title="Live verified real-time source"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Live
      </span>
    );
  }

  if (origin === 'cached') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-950/70 text-amber-300 border border-amber-800/60 shrink-0 ${className}`}
        title="Cached feed data"
      >
        Cached
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-800/80 text-slate-400 border border-slate-700/60 shrink-0 ${className}`}
      title="Sample or simulated reference data"
    >
      Sample
    </span>
  );
};
