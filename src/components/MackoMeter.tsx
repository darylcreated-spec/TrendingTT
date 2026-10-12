import React from 'react';
import { Eye, Flame } from 'lucide-react';


interface MackoMeterProps {
  score: number; // 0-100 virality score
  votesCount?: number;
  hasVoted?: boolean;
  onBoostMacko?: () => void;
  compact?: boolean;
}

export interface MackoStage {
  level: 1 | 2 | 3 | 4;
  label: string;
  subtext: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeEmoji: string;
}

export function getMackoStage(score: number): MackoStage {
  if (score >= 85) {
    return {
      level: 4,
      label: 'Full Macko Mode!',
      subtext: 'Breaking & viral all over T&T! Whole village talking.',
      color: 'text-red-400',
      bgColor: 'bg-red-950/80',
      borderColor: 'border-red-600',
      badgeEmoji: '🔥🚨'
    };
  }
  if (score >= 65) {
    return {
      level: 3,
      label: 'Windows Opening!',
      subtext: 'Neighbours looking outside; discussions heating up.',
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/80',
      borderColor: 'border-amber-600',
      badgeEmoji: '👀'
    };
  }
  if (score >= 40) {
    return {
      level: 2,
      label: 'People Peeping',
      subtext: 'Curiosity rising across social media.',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-950/60',
      borderColor: 'border-yellow-600/70',
      badgeEmoji: '🔍'
    };
  }
  return {
    level: 1,
    label: 'Quiet in de Village',
    subtext: 'Standard news update; gentle buzz.',
    color: 'text-slate-400',
    bgColor: 'bg-slate-900',
    borderColor: 'border-slate-800',
    badgeEmoji: '🍃'
  };
}

export const MackoMeter: React.FC<MackoMeterProps> = ({
  score,
  votesCount = 0,
  hasVoted = false,
  onBoostMacko,
  compact = false
}) => {
  const stage = getMackoStage(score);
  const percentage = Math.min(100, Math.max(5, score));

  if (compact) {
    return (
      <div 
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-bold ${stage.bgColor} ${stage.borderColor} ${stage.color} shadow-sm`}
        title={`D Macko Meter: ${stage.label} (${score}%) - ${stage.subtext}`}
      >
        <span className="text-xs">{stage.badgeEmoji}</span>
        <span>Macko: {stage.level}/4</span>
      </div>
    );
  }

  return (
    <div className={`p-2.5 sm:p-3 rounded-xl border ${stage.bgColor} ${stage.borderColor} transition-all duration-300 relative overflow-hidden group`}>
      {/* Background ambient glow for high macko */}
      {stage.level >= 3 && (
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-red-500/10 rounded-full blur-xl pointer-events-none" />
      )}

      {/* Header Row: Label and Boost Button */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="p-1 rounded-md bg-slate-950 border border-slate-800 text-xs shadow-inner">
            <Eye className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                D Macko Meter
              </span>
              <span className={`text-xs font-black ${stage.color}`}>
                {stage.badgeEmoji} {stage.label}
              </span>
            </div>
          </div>
        </div>

        {/* Boost Button */}
        {onBoostMacko && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBoostMacko();
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all active:scale-95 ${
              hasVoted
                ? 'bg-red-600 text-white border-red-500 shadow-md ring-1 ring-red-400'
                : 'bg-slate-950/90 hover:bg-slate-900 text-amber-300 border-amber-600/50 hover:border-amber-500 shadow-sm'
            }`}
            title="Vote this story on D Macko Meter! Show how curious or viral it is."
          >
            <Flame className={`w-3.5 h-3.5 ${hasVoted ? 'text-white' : 'text-amber-400'}`} />
            <span>{hasVoted ? 'Macko Boosted!' : 'Boost Macko'}</span>
            {votesCount > 0 && (
              <span className="ml-0.5 px-1 rounded bg-black/40 text-[10px]">
                {votesCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Meter Bar */}
      <div className="space-y-1">
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800/80 p-0.5 flex items-center">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              stage.level === 4
                ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-red-600 animate-pulse'
                : stage.level === 3
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                : stage.level === 2
                ? 'bg-gradient-to-r from-emerald-400 to-yellow-400'
                : 'bg-slate-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Meter Level Indicators */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold px-0.5 pt-0.5">
          <span className={stage.level === 1 ? 'text-slate-200 font-bold' : ''}>1. Quiet</span>
          <span className={stage.level === 2 ? 'text-yellow-300 font-bold' : ''}>2. Peeping</span>
          <span className={stage.level === 3 ? 'text-amber-300 font-bold' : ''}>3. Windows</span>
          <span className={stage.level === 4 ? 'text-red-400 font-bold' : ''}>4. Full Macko!</span>
        </div>
      </div>
    </div>
  );
};
