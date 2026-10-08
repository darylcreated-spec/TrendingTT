import React from 'react';
import type { SourceId } from '../types';
import { SOURCES } from '../data/sources';
import { X, Check, Globe, Tv, Newspaper, Smartphone, SlidersHorizontal } from 'lucide-react';

interface SourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSources: SourceId[];
  onToggleSource: (sourceId: SourceId) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const SourcesModal: React.FC<SourcesModalProps> = ({
  isOpen,
  onClose,
  selectedSources,
  onToggleSource,
  onSelectAll,
  onDeselectAll,
}) => {
  if (!isOpen) return null;

  const getSourceIcon = (type: string) => {
    if (type === 'broadcast') return <Tv className="w-4 h-4 text-emerald-400" />;
    if (type === 'newspaper') return <Newspaper className="w-4 h-4 text-blue-400" />;
    return <Smartphone className="w-4 h-4 text-fuchsia-400" />;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <SlidersHorizontal className="w-5 h-5 text-red-500" />
          <h3 className="font-bold text-slate-100 text-lg">Trinidad Media & Social Outlets</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Customize which newsrooms and social feeds appear on your Trending TT dashboard.
        </p>

        {/* Quick select buttons */}
        <div className="flex items-center gap-2 mb-4 text-xs font-semibold">
          <button
            onClick={onSelectAll}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Select All Outlets
          </button>
          <button
            onClick={onDeselectAll}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Sources List */}
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {Object.values(SOURCES).map((source) => {
            const isSelected = selectedSources.includes(source.id);
            return (
              <div
                key={source.id}
                onClick={() => onToggleSource(source.id)}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-950 border-red-500/50 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    {getSourceIcon(source.type)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{source.name}</h4>
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                      {source.type.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={source.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-500 hover:text-slate-300 p-1"
                    title="Visit official site"
                  >
                    <Globe className="w-4 h-4" />
                  </a>

                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-red-600 text-white' : 'border border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
