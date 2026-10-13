import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Download, 
  Bookmark, 
  Search, 
  SlidersHorizontal,
  X,
  Bell,
  Compass,
  BarChart3,
  Newspaper,
  Zap,
  PlusCircle,
  User
} from 'lucide-react';
import { CarouselTabs } from './CarouselTabs';
import type { ActiveView, UserProfile } from '../types';
import { formatCurrentASTDateTime } from '../utils/dateUtils';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showBookmarks: boolean;
  onToggleBookmarks: () => void;
  bookmarksCount: number;
  onOpenSourcesFilter: () => void;
  onInstallPWA: () => void;
  canInstallPWA: boolean;
  lastScrapedTime?: string;
  feedStatusText?: string;
  onOpenNotifications: () => void;
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  onOpenCreatePost?: () => void;
  onOpenAuthModal?: () => void;
  currentUser?: UserProfile;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isRefreshing,
  searchQuery,
  onSearchChange,
  showBookmarks,
  onToggleBookmarks,
  bookmarksCount,
  onOpenSourcesFilter,
  onInstallPWA,
  canInstallPWA,
  lastScrapedTime,
  feedStatusText,
  onOpenNotifications,
  activeView,
  onSelectView,
  onOpenCreatePost,
  onOpenAuthModal,
  currentUser
}) => {
  const [currentDateTime, setCurrentDateTime] = useState<{
    dateStr: string;
    timeStr: string;
  }>({
    dateStr: '',
    timeStr: ''
  });

  useEffect(() => {
    const updateTime = () => {
      setCurrentDateTime(formatCurrentASTDateTime());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-lg w-full">
      {/* Top micro-bar: TT Live Clock & Status */}
      <div className="bg-slate-950 px-3 sm:px-4 py-1 text-xs text-slate-400 flex items-center justify-between border-b border-slate-800/80 w-full overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE INGESTION ACTIVE
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400 truncate">
            {currentDateTime.dateStr && `${currentDateTime.dateStr} • ${currentDateTime.timeStr} (Port of Spain)`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs shrink-0">
          <span className="text-emerald-400/90 font-medium hidden sm:inline bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            Auto-refresh: Every 5m
          </span>
          {feedStatusText ? (
            <span className="text-slate-300 font-medium hidden md:inline bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
              {feedStatusText}
            </span>
          ) : lastScrapedTime ? (
            <span className="text-slate-400 hidden md:inline">
              Updated: {lastScrapedTime}
            </span>
          ) : null}
          <span className="text-red-500 font-bold tracking-wider text-[11px] sm:text-xs">TRINIDAD & TOBAGO</span>
        </div>
      </div>

      {/* Main Masthead */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 w-full overflow-hidden">
        {/* Logo and Tagline */}
        <div className="flex items-center justify-between gap-2 min-w-0 w-full md:w-auto">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button 
              onClick={() => onSelectView('feed')}
              className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden flex items-center justify-center text-white shadow-md shadow-red-950/60 border border-red-500/80 transition-all active:scale-95 group focus:outline-none focus:ring-2 focus:ring-red-400 bg-[#CE1126] shrink-0"
              title="Return to Home Feed"
              aria-label="Trending.TT Home Feed"
            >
              {/* National Flag Diagonal Band in Background */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.95) 40%, rgba(255,255,255,0.95) 46%, #000000 46%, #000000 56%, rgba(255,255,255,0.95) 56%, rgba(255,255,255,0.95) 62%, transparent 62%)'
                }}
              />
              {/* Concept 2: Floating Frosted Smoked Lens */}
              <div className="relative z-10 w-8 h-8 rounded-full bg-slate-900/90 border border-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.8)] flex items-center justify-center transition-transform group-hover:scale-105">
                {/* Clean Ascending Arrow */}
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none">
                  <path d="M4 17l6-6 4 4 7-9" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 6h7v7" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="21" cy="6" r="1.5" fill="#EF4444" />
                </svg>
              </div>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => onSelectView('feed')}
                  className="text-left group shrink-0 focus:outline-none"
                  aria-label="Trending.TT Brand Home"
                >
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white m-0 p-0 font-sans group-hover:text-red-400 transition-colors flex items-center gap-1.5">
                    <span>TRENDING</span><span className="text-red-500">.TT</span>
                  </h1>
                </button>
                {currentDateTime.dateStr && (
                  <span className="hidden sm:inline-flex text-[11px] font-bold tracking-normal px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-300 border border-slate-700/80 shadow-inner items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>{currentDateTime.dateStr} • {currentDateTime.timeStr}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium tracking-wide truncate">
                Unified News & Social Media Radar • TV6, CNC3, TTT, I.A.N, TikTok & Newsday
              </p>
            </div>
          </div>

          {/* Mobile buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:hidden shrink-0">
            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="p-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 active:scale-95 transition-transform"
                title="Trinbago Social Profile"
                aria-label="Open Trinbago Social Profile"
              >
                <User className="w-4 h-4 text-red-400" />
              </button>
            )}
            <button
              onClick={onOpenNotifications}
              className="p-2 rounded-lg bg-slate-800 text-amber-400 border border-slate-700 active:scale-95 transition-transform"
              title="Push Notifications"
              aria-label="Open Push Notification Settings"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 active:scale-95 transition-transform"
              title="Refresh / Scrape Feeds"
              aria-label="Refresh latest feeds"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-red-400' : ''}`} />
            </button>
            <button
              onClick={onOpenSourcesFilter}
              className="p-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700"
              title="Filter Media Outlets"
              aria-label="Filter media outlets"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 md:max-w-md md:justify-end">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Trinidad news, TikToks, WASA, highways..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-950 text-slate-100 placeholder-slate-500 text-sm rounded-lg border border-slate-800 focus:outline-none focus:border-red-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 active:scale-95 transition-all"
                title="Trinbago Social Profile & Login"
                aria-label="Open Trinbago user profile and login"
              >
                <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-red-400">
                  <User className="w-3 h-3" />
                </div>
                <span className="max-w-[100px] truncate">{currentUser?.displayName || 'Citizen'}</span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors relative"
              title="Push Notification Settings"
              aria-label="Push Notification Settings"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5 animate-pulse" />
            </button>

            {onOpenCreatePost && (
              <button
                onClick={onOpenCreatePost}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold border border-red-500 active:scale-95 transition-all shadow-md shadow-red-950/40"
                title="Post a live news, sports, weather or traffic update"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Post Update</span>
              </button>
            )}

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 active:scale-95 transition-all shadow-sm"
              title="Trigger live scraper refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-400' : ''}`} />
              <span>{isRefreshing ? 'Scraping...' : 'Live Refresh'}</span>
            </button>

            <button
              onClick={onOpenSourcesFilter}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              title="Filter outlets"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Outlets</span>
            </button>

            <button
              onClick={onToggleBookmarks}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                showBookmarks 
                  ? 'bg-red-600 text-white border-red-500' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Saved Articles"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved ({bookmarksCount})</span>
            </button>

            {canInstallPWA && (
              <button
                onClick={onInstallPWA}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-950 active:scale-95 transition-all border border-red-500"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install PWA</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Section Navigation Bar: News Feed, Traffic Radar, Trinbago Polls */}
      <div className="bg-slate-950 border-t border-slate-800/80 px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex-1 max-w-xl min-w-0">
            <CarouselTabs<ActiveView>
              items={[
                { id: 'feed', label: 'National News Feed', icon: <Newspaper className="w-3.5 h-3.5" /> },
                { 
                  id: 'radar', 
                  label: 'Traffic & Weather Radar', 
                  icon: <Compass className="w-3.5 h-3.5 text-amber-400" />,
                  badge: <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                },
                {
                  id: 'utilities',
                  label: 'Utilities (T&TEC / WASA / Cable)',
                  icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
                  badge: <span className="text-[10px] bg-amber-950/80 text-amber-300 px-1 py-0.2 rounded border border-amber-800">Grid</span>
                },
                { 
                  id: 'polls', 
                  label: 'Trinbago Polls', 
                  icon: <BarChart3 className="w-3.5 h-3.5 text-purple-400" />,
                  badge: <span className="text-[10px] bg-purple-950/80 text-purple-300 px-1 py-0.2 rounded border border-purple-800">Vote</span>
                },
              ]}
              activeId={activeView}
              onSelect={onSelectView}
              ariaLabel="Main View Modes"
            />
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span>Port of Spain • San Fernando • Chaguanas • Arima • Scarborough</span>
          </div>
        </div>
      </div>
    </header>
  );
};
