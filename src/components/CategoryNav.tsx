import React from 'react';
import type { Category, SortOption } from '../types';
import { Flame, Clock, MessageSquare } from 'lucide-react';

interface CategoryNavProps {
  activeCategory: Category;
  onSelectCategory: (category: Category) => void;
  activeSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
}

const CATEGORIES: { id: Category; label: string; icon?: React.ReactNode }[] = [
  { id: 'all', label: 'All Feed' },
  { id: 'breaking', label: 'Breaking News' },
  { id: 'broadcast', label: 'Broadcast (TV6/CNC3/TTT/I.A.N)' },
  { id: 'social', label: 'Social (TikTok/FB/IG)' },
  { id: 'crime', label: 'Crime & Security' },
  { id: 'politics', label: 'Politics & THA' },
  { id: 'culture', label: 'Culture & Carnival' },
  { id: 'sports', label: 'Sports & Cricket' },
  { id: 'business', label: 'Business & Energy' },
];

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  activeSort,
  onSelectSort,
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Category Pills scrollable horizontally */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-red-600 text-white border-red-500 shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/60 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto bg-slate-950 p-1 rounded-lg border border-slate-800">
        <button
          onClick={() => onSelectSort('trending')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
            activeSort === 'trending'
              ? 'bg-slate-800 text-red-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Trending Velocity"
        >
          <Flame className="w-3.5 h-3.5 text-red-500" />
          <span>Trending</span>
        </button>

        <button
          onClick={() => onSelectSort('latest')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
            activeSort === 'latest'
              ? 'bg-slate-800 text-slate-100 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Latest Bulletins"
        >
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Latest</span>
        </button>

        <button
          onClick={() => onSelectSort('discussed')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
            activeSort === 'discussed'
              ? 'bg-slate-800 text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Most Discussed"
        >
          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
          <span>Discussed</span>
        </button>
      </div>
    </div>
  );
};
