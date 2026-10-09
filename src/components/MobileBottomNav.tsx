import React from 'react';
import { Newspaper, Compass, Zap, BarChart3, Bookmark } from 'lucide-react';
import type { ActiveView } from '../types';

interface MobileBottomNavProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  showBookmarks: boolean;
  onToggleBookmarks: () => void;
  bookmarksCount: number;
  onOpenNotifications: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  onSelectView,
  showBookmarks,
  onToggleBookmarks,
  bookmarksCount,
}) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.5)] transition-all"
    >
      <div className="grid grid-cols-5 h-14 max-w-md mx-auto items-center px-1">
        {/* News Feed */}
        <button
          type="button"
          onClick={() => {
            if (showBookmarks) onToggleBookmarks();
            onSelectView('feed');
          }}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-all active:scale-95 ${
            activeView === 'feed' && !showBookmarks
              ? 'text-red-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Newspaper className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Feed</span>
        </button>

        {/* Traffic & Weather Radar */}
        <button
          type="button"
          onClick={() => {
            if (showBookmarks) onToggleBookmarks();
            onSelectView('radar');
          }}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-all relative active:scale-95 ${
            activeView === 'radar' && !showBookmarks
              ? 'text-red-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Compass className="w-5 h-5 text-amber-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Radar</span>
        </button>

        {/* Utilities: T&TEC, WASA, Cable TV */}
        <button
          type="button"
          onClick={() => {
            if (showBookmarks) onToggleBookmarks();
            onSelectView('utilities');
          }}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-all active:scale-95 ${
            activeView === 'utilities' && !showBookmarks
              ? 'text-red-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] mt-0.5 tracking-tight">Utilities</span>
        </button>

        {/* Trinbago Polls */}
        <button
          type="button"
          onClick={() => {
            if (showBookmarks) onToggleBookmarks();
            onSelectView('polls');
          }}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-all active:scale-95 ${
            activeView === 'polls' && !showBookmarks
              ? 'text-red-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <span className="text-[10px] mt-0.5 tracking-tight">Polls</span>
        </button>

        {/* Saved Bookmarks */}
        <button
          type="button"
          onClick={onToggleBookmarks}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-all relative active:scale-95 ${
            showBookmarks
              ? 'text-red-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Bookmark className={`w-5 h-5 ${showBookmarks ? 'fill-current' : ''}`} />
            {bookmarksCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center border border-slate-950">
                {bookmarksCount > 9 ? '9+' : bookmarksCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Saved</span>
        </button>
      </div>
    </nav>
  );
};
