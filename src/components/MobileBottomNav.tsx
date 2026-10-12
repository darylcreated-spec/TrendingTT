import React from 'react';
import { Newspaper, Compass, Zap, BarChart3, Bookmark, PlusCircle } from 'lucide-react';
import type { ActiveView } from '../types';

interface MobileBottomNavProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  showBookmarks: boolean;
  onToggleBookmarks: () => void;
  bookmarksCount: number;
  onOpenNotifications: () => void;
  onOpenCreatePost?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  onSelectView,
  showBookmarks,
  onToggleBookmarks,
  bookmarksCount,
  onOpenCreatePost,
}) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 w-full max-w-full z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 pb-[max(env(safe-area-inset-bottom),8px)] shadow-[0_-4px_24px_rgba(0,0,0,0.6)] transition-all"
    >
      <div className={`grid ${onOpenCreatePost ? 'grid-cols-6' : 'grid-cols-5'} h-16 w-full max-w-md mx-auto items-center px-1`}>
        {/* News Feed */}
        <button
          type="button"
          aria-label="Home News Feed"
          onClick={() => {
            if (showBookmarks) onToggleBookmarks();
            onSelectView('feed');
          }}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] min-w-[48px] transition-all active:scale-95 ${
            activeView === 'feed' && !showBookmarks
              ? 'text-red-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Newspaper className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Feed</span>
        </button>

        {/* Traffic & Weather Radar */}
        <button
          type="button"
          aria-label="Traffic and Weather Radar"
          onClick={() => {
            if (showBookmarks) onToggleBookmarks();
            onSelectView('radar');
          }}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] min-w-[48px] transition-all relative active:scale-95 ${
            activeView === 'radar' && !showBookmarks
              ? 'text-red-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Compass className="w-5 h-5 text-amber-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Radar</span>
        </button>

        {/* Post Update (Dispatch) */}
        {onOpenCreatePost && (
          <button
            type="button"
            aria-label="Create Community Dispatch or Alert"
            onClick={onOpenCreatePost}
            className="flex flex-col items-center justify-center h-full min-h-[48px] min-w-[48px] transition-all active:scale-90 text-red-500 hover:text-red-400 group"
            title="Post a live news, sports, weather or traffic update"
          >
            <div className="p-1.5 rounded-full bg-red-600 text-white shadow-md shadow-red-950 group-hover:bg-red-500 transition-colors">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-[9px] mt-0.5 font-bold tracking-tight text-red-400">Post</span>
          </button>
        )}

        {/* Utilities: T&TEC, WASA, Cable TV */}
        <button
          type="button"
          aria-label="T&TEC and WASA Utilities Dashboard"
          onClick={() => {
            if (showBookmarks) onToggleBookmarks();
            onSelectView('utilities');
          }}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] min-w-[48px] transition-all active:scale-95 ${
            activeView === 'utilities' && !showBookmarks
              ? 'text-red-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Utilities</span>
        </button>

        {/* Trinbago Polls */}
        <button
          type="button"
          aria-label="Trinbago Community Polls"
          onClick={() => {
            if (showBookmarks) onToggleBookmarks();
            onSelectView('polls');
          }}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] min-w-[48px] transition-all active:scale-95 ${
            activeView === 'polls' && !showBookmarks
              ? 'text-red-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Polls</span>
        </button>

        {/* Saved Bookmarks */}
        <button
          type="button"
          aria-label={`Saved Bookmarks (${bookmarksCount} items)`}
          onClick={onToggleBookmarks}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] min-w-[48px] transition-all relative active:scale-95 ${
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
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Saved</span>
        </button>
      </div>
    </nav>
  );
};
