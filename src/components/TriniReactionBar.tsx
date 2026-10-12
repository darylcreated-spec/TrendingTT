import React, { useState } from 'react';
import type { TriniReactionType } from '../types';

interface TriniReactionBarProps {
  currentReaction?: TriniReactionType | null;
  onSelectReaction: (type: TriniReactionType) => void;
  reactionsCounts?: Partial<Record<TriniReactionType, number>>;
  compact?: boolean;
}

export interface TriniReactionMeta {
  type: TriniReactionType;
  emoji: string;
  label: string;
  description: string;
  color: string;
  bgActive: string;
}

export const TRINI_REACTIONS: TriniReactionMeta[] = [
  {
    type: 'macko',
    emoji: '👁️',
    label: 'Macko',
    description: 'Watching de scene!',
    color: 'text-amber-400',
    bgActive: 'bg-amber-950/80 border-amber-500 text-amber-300'
  },
  {
    type: 'realtalk',
    emoji: '🔥',
    label: 'Real Talk',
    description: 'Trini gospel truth!',
    color: 'text-red-400',
    bgActive: 'bg-red-950/80 border-red-500 text-red-300'
  },
  {
    type: 'deadwidlaugh',
    emoji: '🤣',
    label: 'Dead Wid Laugh',
    description: 'Too much jokes in T&T!',
    color: 'text-yellow-400',
    bgActive: 'bg-yellow-950/80 border-yellow-500 text-yellow-300'
  },
  {
    type: 'lordwhy',
    emoji: '🤦‍♂️',
    label: 'Lord Why',
    description: 'Tabanca / shaking my head!',
    color: 'text-indigo-400',
    bgActive: 'bg-indigo-950/80 border-indigo-500 text-indigo-300'
  },
  {
    type: 'watchyuhback',
    emoji: '🚨',
    label: 'Watch Yuh Back',
    description: 'Alert / cautionary notice!',
    color: 'text-rose-400',
    bgActive: 'bg-rose-950/80 border-rose-500 text-rose-300'
  }
];

export const TriniReactionBar: React.FC<TriniReactionBarProps> = ({
  currentReaction,
  onSelectReaction,
  reactionsCounts = {},
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Quick Trigger button when collapsed
  if (compact) {
    const activeMeta = TRINI_REACTIONS.find((r) => r.type === currentReaction);

    return (
      <div className="relative inline-block">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            activeMeta
              ? activeMeta.bgActive
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/70 hover:text-white'
          }`}
          title="React Trini style: Macko, Real Talk, Dead Wid Laugh & more"
        >
          <span>{activeMeta ? activeMeta.emoji : '👁️'}</span>
          <span className="hidden sm:inline">{activeMeta ? activeMeta.label : 'React'}</span>
        </button>

        {/* Floating popover menu like Facebook/Instagram */}
        {isOpen && (
          <div 
            className="absolute bottom-full left-0 mb-2 z-30 flex items-center gap-1.5 p-1.5 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {TRINI_REACTIONS.map((item) => {
              const isSelected = currentReaction === item.type;
              return (
                <button
                  key={item.type}
                  onClick={() => {
                    onSelectReaction(item.type);
                    setIsOpen(false);
                  }}
                  className={`flex flex-col items-center p-1.5 rounded-xl hover:scale-125 transition-all text-sm group ${
                    isSelected ? 'bg-slate-800 ring-2 ring-red-500' : 'hover:bg-slate-800/70'
                  }`}
                  title={`${item.label}: ${item.description}`}
                >
                  <span className="text-xl sm:text-2xl">{item.emoji}</span>
                  <span className="text-[9px] font-bold text-slate-300 mt-0.5 group-hover:text-white">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Expanded In-Line reaction strip
  return (
    <div className="flex items-center gap-1 sm:gap-2 flex-wrap py-1">
      {TRINI_REACTIONS.map((item) => {
        const isSelected = currentReaction === item.type;
        const count = reactionsCounts[item.type] || 0;

        return (
          <button
            key={item.type}
            onClick={(e) => {
              e.stopPropagation();
              onSelectReaction(item.type);
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
              isSelected
                ? item.bgActive
                : 'bg-slate-950/70 hover:bg-slate-900 text-slate-400 border-slate-800/80 hover:text-slate-200'
            }`}
            title={`${item.label}: ${item.description}`}
          >
            <span>{item.emoji}</span>
            <span className="text-[11px] font-medium">{item.label}</span>
            {count > 0 && (
              <span className="text-[10px] font-bold ml-0.5 text-slate-300">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
