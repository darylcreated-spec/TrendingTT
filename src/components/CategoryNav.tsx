import React from 'react';
import type { Category, SortOption } from '../types';
import { Flame, Clock, MessageSquare } from 'lucide-react';
import { CarouselTabs, type CarouselTabItem } from './CarouselTabs';

interface CategoryNavProps {
  activeCategory: Category;
  onSelectCategory: (category: Category) => void;
  activeSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
  feedLayout?: 'sections' | 'stream';
  onToggleFeedLayout?: (layout: 'sections' | 'stream') => void;
}

const CATEGORY_ITEMS: CarouselTabItem<Category>[] = [
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
  feedLayout = 'sections',
  onToggleFeedLayout,
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Category Carousel Slider */}
      <div className="flex-1 min-w-0">
        <CarouselTabs<Category>
          items={CATEGORY_ITEMS}
          activeId={activeCategory}
          onSelect={onSelectCategory}
          ariaLabel="News Categories"
          showArrows
        />
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        {/* Layout Toggle (Sections vs Stream) */}
        {onToggleFeedLayout && (
          <div className="flex items-center gap-0.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => onToggleFeedLayout('sections')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                feedLayout === 'sections'
                  ? 'bg-slate-800 text-red-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Curated Editorial Sections"
            >
              Sections
            </button>
            <button
              onClick={() => onToggleFeedLayout('stream')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                feedLayout === 'stream'
                  ? 'bg-slate-800 text-slate-100 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Chronological Feed Stream"
            >
              Stream
            </button>
          </div>
        )}

        {/* Sort Options */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
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
    </div>
  );
};
