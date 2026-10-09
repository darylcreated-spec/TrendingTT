import React from 'react';
import { 
  ChevronRight,
  Compass
} from 'lucide-react';
import { INITIAL_TTMS_ADVISORY, INITIAL_TRAFFIC_SEGMENTS } from '../data/radarAndPollData';

interface RadarAlertBannerProps {
  onOpenRadar: () => void;
}

export const RadarAlertBanner: React.FC<RadarAlertBannerProps> = ({ onOpenRadar }) => {
  const severeDelays = INITIAL_TRAFFIC_SEGMENTS.filter(s => s.severity === 'gridlock' || s.severity === 'flood');
  const delayHighlights = severeDelays.map(s => `${s.highwayName}: ${s.statusText}`).join(' • ');

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-red-950/30 border border-amber-800/50 p-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                TTMS {INITIAL_TTMS_ADVISORY.level.toUpperCase()} ALERT
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                HIGHWAY DELAYS ACTIVE
              </span>
              <span className="text-xs text-slate-300 font-semibold">
                Caroni Plains & Northern Foothills
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 line-clamp-1">
              <span className="text-amber-300 font-medium">{INITIAL_TTMS_ADVISORY.headline}</span>
              {delayHighlights && <span className="text-slate-400"> — {delayHighlights}</span>}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenRadar}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all active:scale-95 shrink-0"
        >
          <span>Open Live Radar</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
