import React from 'react';
import type { Category, SortOption, TimeFilterOption } from '../types';
import { Flame, Clock, MessageSquare, History } from 'lucide-react';
import { CarouselTabs, type CarouselTabItem } from './CarouselTabs';

interface CategoryNavProps {
  activeCategory: Category;
  onSelectCategory: (category: Category) => void;
  activeSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
  activeTimeFilter?: TimeFilterOption;
  onSelectTimeFilter?: (filter: TimeFilterOption) => void;
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
  activeTimeFilter = '24h',
  onSelectTimeFilter,
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

        {/* Time Window Filter (Today 24h, 48h, 7d, All) */}
        {onSelectTimeFilter && (
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="hidden lg:inline-flex items-center text-[10px] text-slate-500 font-semibold px-1">
              <History className="w-3 h-3 mr-0.5 text-slate-400" />
              Window:
            </span>
            <button
              onClick={() => onSelectTimeFilter('24h')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                activeTimeFilter === '24h'
                  ? 'bg-red-950/80 text-red-400 border border-red-800/60 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Posts from the last 24 hours (Today's trending topics)"
            >
              24h
            </button>
            <button
              onClick={() => onSelectTimeFilter('48h')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                activeTimeFilter === '48h'
                  ? 'bg-slate-800 text-amber-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Posts from the last 48 hours"
            >
              48h
            </button>
            <button
              onClick={() => onSelectTimeFilter('7d')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                activeTimeFilter === '7d'
                  ? 'bg-slate-800 text-slate-100 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Posts from the last 7 days (This Week)"
            >
              7d
            </button>
            <button
              onClick={() => onSelectTimeFilter('all-time')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                activeTimeFilter === 'all-time'
                  ? 'bg-slate-800 text-slate-100 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="All posts archive"
            >
              All
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
