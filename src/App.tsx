import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Post, Category, SortOption, TimeFilterOption, SourceId, ActiveView, UserProfile, TriniReactionType } from './types';
import { INITIAL_POSTS } from './data/mockPosts';
import { SOURCES } from './data/sources';
import { Storage } from './services/storage';
import { fetchLiveTTFeeds, calculateTrendingVelocity } from './services/scraperEngine';




import { socialIngestionEngine } from './services/socialIngestionEngine';
import { Header } from './components/Header';
import { BreakingTicker } from './components/BreakingTicker';
import { CategoryNav } from './components/CategoryNav';
import { PostCard } from './components/PostCard';
import { SourcesModal } from './components/SourcesModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { TrinbagoPoll } from './components/TrinbagoPoll';
import { NotificationModal } from './components/NotificationModal';
import { RadarAlertBanner } from './components/RadarAlertBanner';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ImageZoomLightbox, type ZoomMedia } from './components/ImageZoomLightbox';
import { SectionedFeed } from './components/SectionedFeed';
import { AuthModal } from './components/AuthModal';
import { StickyAudioPlayer } from './components/StickyAudioPlayer';
import { MackoLeaderboard } from './components/MackoLeaderboard';
import { AudioNarrator } from './services/audioNarrator';
import { NotificationService } from './services/notificationService';
import { INITIAL_TRAFFIC_SEGMENTS } from './data/radarAndPollData';

// Code-split heavy modal/dashboard components with React.lazy to reduce initial bundle
const TrafficWeatherRadar = React.lazy(() =>
  import('./components/TrafficWeatherRadar').then((m) => ({ default: m.TrafficWeatherRadar }))
);
const UtilitiesDashboard = React.lazy(() =>
  import('./components/UtilitiesDashboard').then((m) => ({ default: m.UtilitiesDashboard }))
);
const ShareModal = React.lazy(() =>
  import('./components/ShareModal').then((m) => ({ default: m.ShareModal }))
);
const CommentDrawer = React.lazy(() =>
  import('./components/CommentDrawer').then((m) => ({ default: m.CommentDrawer }))
);
const BriefingModal = React.lazy(() =>
  import('./components/BriefingModal').then((m) => ({ default: m.BriefingModal }))
);
const CreatePostModal = React.lazy(() =>
  import('./components/CreatePostModal').then((m) => ({ default: m.CreatePostModal }))
);

const ViewLoadingFallback = () => (
  <div className="flex items-center justify-center py-20 min-h-[300px]">
    <div className="flex flex-col items-center gap-3 text-slate-400">
      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-300">Loading module...</span>
    </div>
  </div>
);
import { 
  Inbox, 
  CheckCircle,
} from 'lucide-react';

export const App: React.FC = () => {
  // Navigation & View mode: Feed, Radar, Utilities, or Polls
  const [activeView, setActiveView] = useState<ActiveView>('feed');

  // Core Feed States: Default to newest posts first (latest)
  const [posts, setPosts] = useState<Post[]>(() => {
    const combined = [...Storage.getCustomPosts(), ...INITIAL_POSTS];
    return combined.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  });
  const [category, setCategory] = useState<Category>('all');
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('24h');
  const [selectedSources, setSelectedSources] = useState<SourceId[]>(() =>

    Object.keys(SOURCES) as SourceId[]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Persistence States (lazy initialized)
  const [upvotedIds, setUpvotedIds] = useState<string[]>(() => Storage.getUpvotedPosts());
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => Storage.getBookmarks());
  const [mackoVotedIds, setMackoVotedIds] = useState<string[]>(() => Storage.getMackoVotedPosts());
  const [userReactions, setUserReactions] = useState<Record<string, string>>(() => Storage.getUserReactions());

  // User Social Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => Storage.getUserProfile());


  // Modals & Drawers
  const [commentPost, setCommentPost] = useState<Post | null>(null);
  const [sharePost, setSharePost] = useState<Post | null>(null);
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [feedLayout, setFeedLayout] = useState<'sections' | 'stream'>('sections');
  const [zoomMedia, setZoomMedia] = useState<ZoomMedia | null>(null);

  // Touch swipe navigation between views (Feed <-> Radar <-> Polls)
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Minimum swipe threshold and enforce horizontal bias (to not trigger during vertical scrolling)
    if (Math.abs(deltaX) > 75 && Math.abs(deltaX) > Math.abs(deltaY) * 1.75) {
      if (deltaX < 0) {
        // Swipe left -> advance view: feed -> radar -> utilities -> polls
        setActiveView((curr) => {
          if (curr === 'feed') return 'radar';
          if (curr === 'radar') return 'utilities';
          if (curr === 'utilities') return 'polls';
          return curr;
        });
      } else {
        // Swipe right -> previous view: polls -> utilities -> radar -> feed
        setActiveView((curr) => {
          if (curr === 'polls') return 'utilities';
          if (curr === 'utilities') return 'radar';
          if (curr === 'radar') return 'feed';
          return curr;
        });
      }
    }
  };

  // Scraper & PWA status
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastScrapedTime, setLastScrapedTime] = useState<string>('Live (AST)');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Live Scrape Trigger (Manual or Auto-Background)
  const handleTriggerScrape = useCallback(async (silent = false) => {
    if (!silent) {
      setIsRefreshing(true);
    }
    try {
      const [liveRes, socialRes] = await Promise.allSettled([
        fetchLiveTTFeeds(),
        socialIngestionEngine.fetchIngestedFeed()
      ]);

      const freshPosts: Post[] = [];
      let liveCount = 0;
      let socialCount = 0;

      if (liveRes.status === 'fulfilled' && liveRes.value.newPosts.length > 0) {
        freshPosts.push(...liveRes.value.newPosts);
        liveCount = liveRes.value.newPosts.length;
        setLastScrapedTime(liveRes.value.timestamp);
      }

      if (socialRes.status === 'fulfilled' && socialRes.value.posts.length > 0) {
        freshPosts.push(...socialRes.value.posts);
        socialCount = socialRes.value.posts.length;
      }

      if (freshPosts.length > 0) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const existingTitles = new Set(prev.map((p) => p.title.toLowerCase().trim()));
          const uniqueNew = freshPosts.filter((p) => !existingIds.has(p.id) && !existingTitles.has(p.title.toLowerCase().trim()));
          const combined = [...uniqueNew, ...prev];
          return combined.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        });

        if (!silent) {
          showToast(`Ingested ${liveCount + socialCount} updates from broadcast, yt-dlp & social feeds`);
        }
      } else {
        if (!silent) {
          showToast('Feeds up to date. No new bulletins at this moment.');
        }
      }
    } catch {
      if (!silent) {
        showToast('Ingestion refresh completed.');
      }
    } finally {
      if (!silent) {
        setIsRefreshing(false);
      }
    }
  }, [showToast]);

  // Initialize PWA install events and auto-refresh timers
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Initial background ingestion and feed refresh on startup
    const initialTimeout = setTimeout(() => {
      handleTriggerScrape(true);
    }, 200);

    // Auto-refresh feeds every 5 minutes in the background
    const autoRefreshTimer = setInterval(() => {
      handleTriggerScrape(true);
    }, 5 * 60 * 1000);

    // Auto-refresh when user returns to the app / unlocks phone
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleTriggerScrape(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearTimeout(initialTimeout);
      clearInterval(autoRefreshTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleTriggerScrape]);

  // Upvote Handler
  const handleToggleUpvote = (postId: string) => {
    const { upvoted, allUpvotes } = Storage.toggleUpvote(postId);
    setUpvotedIds(allUpvotes);
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newUpvotes = p.upvotes + (upvoted ? 1 : -1);
          const updated = { ...p, upvotes: newUpvotes };
          return { ...updated, trendingScore: calculateTrendingVelocity(updated) };
        }
        return p;
      })
    );
  };

  // Bookmark Handler
  const handleToggleBookmark = (postId: string) => {
    const { bookmarked, allBookmarks } = Storage.toggleBookmark(postId);
    setBookmarkedIds(allBookmarks);
    showToast(bookmarked ? 'Saved to Bookmarks' : 'Removed from Bookmarks');
  };

  // Comments Count Refresh
  const handleCommentAdded = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const updated = { ...p, commentsCount: p.commentsCount + 1 };
          return { ...updated, trendingScore: calculateTrendingVelocity(updated) };
        }
        return p;
      })
    );
    showToast('Comment published to community feed');
  };

  // D Macko Meter Boost Handler
  const handleBoostMacko = (postId: string) => {
    const { voted, allVoted } = Storage.toggleMackoVote(postId);
    setMackoVotedIds(allVoted);
    const targetPost = posts.find((p) => p.id === postId);
    let level4PostToNotify: Post | null = null;
    if (targetPost) {
      const currentVotes = targetPost.mackoVotes ?? 0;
      const newVotes = Math.max(0, currentVotes + (voted ? 1 : -1));
      const currentScore = targetPost.mackoScore ?? targetPost.trendingScore;
      const newScore = Math.min(100, Math.max(20, currentScore + (voted ? 6 : -6)));
      const updated = {
        ...targetPost,
        mackoVotes: newVotes,
        mackoScore: newScore,
        trendingScore: Math.min(99, Math.max(25, targetPost.trendingScore + (voted ? 3 : -3)))
      };
      if (voted && newScore >= 85) {
        level4PostToNotify = updated;
      }
    }

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const currentVotes = p.mackoVotes ?? 0;
          const newVotes = Math.max(0, currentVotes + (voted ? 1 : -1));
          const currentScore = p.mackoScore ?? p.trendingScore;
          const newScore = Math.min(100, Math.max(20, currentScore + (voted ? 6 : -6)));
          return {
            ...p,
            mackoVotes: newVotes,
            mackoScore: newScore,
            trendingScore: Math.min(99, Math.max(25, p.trendingScore + (voted ? 3 : -3)))
          };
        }
        return p;
      })
    );

    if (level4PostToNotify) {
      NotificationService.triggerLevel4MackoPush(level4PostToNotify);
    }
    showToast(voted ? '🔥 You boosted D Macko Meter!' : 'Macko vote removed');
  };

  // Commuter 60-Second Audio Byte Narration Trigger
  const handlePlayCommuterAudioByte = useCallback(() => {
    AudioNarrator.speakCommuterSummary(posts, INITIAL_TRAFFIC_SEGMENTS);
    showToast('📻 Playing 60-Second Commuter Audio Byte (Headlines + Highway Radar)');
  }, [posts, showToast]);

  // Commuter Audio Summary Direct WhatsApp Share Trigger
  const handleShareCommuterWhatsApp = useCallback(() => {
    const { whatsAppText } = AudioNarrator.buildCommuterSummary(posts, INITIAL_TRAFFIC_SEGMENTS);
    AudioNarrator.shareSummaryToWhatsApp(whatsAppText);
    showToast('Opening WhatsApp with Commuter Audio Summary');
  }, [posts, showToast]);

  // Trini Custom Reaction Handler
  const handleSelectReaction = (postId: string, reactionType: TriniReactionType) => {
    const prevReaction = userReactions[postId];
    const newReaction = prevReaction === reactionType ? null : reactionType;
    const updatedMap = Storage.setUserReaction(postId, newReaction);
    setUserReactions(updatedMap);

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const reactions = { ...(p.triniReactions || { macko: 0, realtalk: 0, deadwidlaugh: 0, lordwhy: 0, watchyuhback: 0 }) };
          if (prevReaction) {
            reactions[prevReaction as TriniReactionType] = Math.max(0, (reactions[prevReaction as TriniReactionType] || 0) - 1);
          }
          if (newReaction) {
            reactions[newReaction] = (reactions[newReaction] || 0) + 1;
          }
          return {
            ...p,
            triniReactions: reactions,
            trendingScore: calculateTrendingVelocity(p)
          };
        }
        return p;
      })
    );
    showToast(newReaction ? `Trini Reaction added: ${reactionType.toUpperCase()}` : 'Reaction removed');
  };

  // WhatsApp Quick Share
  const handleWhatsAppShare = (post: Post) => {
    const url = window.location.origin ? `${window.location.origin}/#post-${post.id}` : post.originalUrl;
    const mackoScore = post.mackoScore ?? post.trendingScore;
    const mackoLabel = mackoScore >= 85 ? '🔥🚨 FULL MACKO MODE!' : mackoScore >= 65 ? '👀 Windows Opening' : mackoScore >= 40 ? '🔍 People Peeping' : '🍃 Quiet';
    const text = `*${post.title}*\n\n👁️ *D Macko Meter:* ${mackoLabel} (${mackoScore}% Hot)\n\nRead & Discuss on Trending.TT (Trinidad & Tobago Live):\n${url}\n\nSource: ${post.sourceName} #TrendingTT`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };


  // PWA Install Prompt
  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        showToast('Trending TT installed successfully!');
      }
    } else {
      alert('To install: click your browser menu (top-right or bottom) and choose "Add to Home Screen" or "Install App".');
    }
  };

  // Filter & Sort Logic
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Bookmarks filter
      if (showBookmarksOnly && !bookmarkedIds.includes(post.id)) {
        return false;
      }

      // Source filter
      if (!selectedSources.includes(post.sourceId)) {
        return false;
      }

      // Category filter
      if (category !== 'all') {
        if (category === 'breaking' && !post.isBreaking) return false;
        if (category === 'broadcast' && post.sourceType !== 'broadcast') return false;
        if (category === 'social' && post.sourceType !== 'social') return false;
        if (!['breaking', 'broadcast', 'social'].includes(category) && post.category !== category) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(query);
        const matchesSummary = post.summary.toLowerCase().includes(query);
        const matchesSource = post.sourceName.toLowerCase().includes(query);
        const matchesTags = post.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesSummary && !matchesSource && !matchesTags) {
          return false;
        }
      }

      // Time Window Freshness Filter
      if (timeFilter !== 'all-time') {
        const hoursAgo = (Date.now() - new Date(post.publishedAt).getTime()) / (1000 * 60 * 60);
        if (timeFilter === '24h' && hoursAgo > 24) return false;
        if (timeFilter === '48h' && hoursAgo > 48) return false;
        if (timeFilter === '7d' && hoursAgo > 24 * 7) return false;
      }

      return true;
    });
  }, [posts, category, selectedSources, searchQuery, showBookmarksOnly, bookmarkedIds, timeFilter]);


  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      if (sortOption === 'trending') {
        return b.trendingScore - a.trendingScore;
      }
      if (sortOption === 'latest') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      if (sortOption === 'discussed') {
        return b.commentsCount - a.commentsCount;
      }
      return 0;
    });
  }, [filteredPosts, sortOption]);

  const breakingPosts = useMemo(() => {
    return posts.filter((p) => p.isBreaking || p.trendingScore >= 95);
  }, [posts]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* PWA Install Banner */}
      <PWAInstallBanner
        onInstall={handleInstallPWA}
        canInstall={Boolean(deferredPrompt)}
      />

      {/* Main Masthead Header */}
      <Header
        onRefresh={() => handleTriggerScrape(false)}
        isRefreshing={isRefreshing}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showBookmarks={showBookmarksOnly}
        onToggleBookmarks={() => setShowBookmarksOnly(!showBookmarksOnly)}
        bookmarksCount={bookmarkedIds.length}
        onOpenSourcesFilter={() => setIsSourcesModalOpen(true)}
        onInstallPWA={handleInstallPWA}
        canInstallPWA={Boolean(deferredPrompt)}
        lastScrapedTime={lastScrapedTime}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenCreatePost={() => setIsCreatePostModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
      />

      {/* Breaking News & Automated Alerts Ticker Bar (Traffic, Weather & Breaking News) */}
      <BreakingTicker
        breakingPosts={breakingPosts}
        onSelectPost={(post) => setCommentPost(post)}
        onOpenRadar={() => setActiveView('radar')}
      />


      {/* Category Navigation & Sorting Tabs (Only shown on news feed) */}
      {activeView === 'feed' && (
        <CategoryNav
          activeCategory={category}
          onSelectCategory={setCategory}
          activeSort={sortOption}
          onSelectSort={setSortOption}
          activeTimeFilter={timeFilter}
          onSelectTimeFilter={setTimeFilter}
          feedLayout={feedLayout}
          onToggleFeedLayout={setFeedLayout}
        />
      )}


      {/* Main Content Area with Touch Swipe Between Views */}
      <main 
        onTouchStart={handleTouchStart} 
        onTouchEnd={handleTouchEnd} 
        className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full pb-24 md:pb-6"
      >
        {/* OPTION B VIEW: TRAFFIC & WEATHER RADAR */}
        {activeView === 'radar' && (
          <React.Suspense fallback={<ViewLoadingFallback />}>
            <TrafficWeatherRadar
              onShowToast={showToast}
              onOpenNotifications={() => setIsNotificationModalOpen(true)}
            />
          </React.Suspense>
        )}

        {/* UTILITIES RADAR VIEW: T&TEC, WASA, AMPLIA, FLOW, DIGICEL, BMOBILE */}
        {activeView === 'utilities' && (
          <React.Suspense fallback={<ViewLoadingFallback />}>
            <UtilitiesDashboard
              onShowToast={showToast}
              onOpenNotifications={() => setIsNotificationModalOpen(true)}
            />
          </React.Suspense>
        )}

        {/* OPTION C VIEW: TRINBAGO SENTIMENT POLLS */}
        {activeView === 'polls' && (
          <div className="space-y-6">
            <TrinbagoPoll 
              onShowToast={showToast} 
              featuredOnly={false} 
            />
          </div>
        )}

        {/* DEFAULT VIEW: NATIONAL NEWS FEED */}
        {activeView === 'feed' && (
          <>
            {/* Live Traffic & Weather Radar Teaser Banner with 60-Second Commuter Audio Byte & Direct WhatsApp Share */}
            <RadarAlertBanner 
              onOpenRadar={() => setActiveView('radar')} 
              onPlayCommuterAudio={handlePlayCommuterAudioByte}
              onShareCommuterWhatsApp={handleShareCommuterWhatsApp}
            />

            {/* D Macko Leaderboard: Top 5 Buzzing Topics Carousel or Spotlight Card */}
            {!showBookmarksOnly && !searchQuery && category === 'all' && (
              <MackoLeaderboard
                posts={posts}
                mackoVotedIds={mackoVotedIds}
                onBoostMacko={handleBoostMacko}
                onOpenComments={setCommentPost}
                onWhatsAppShare={handleWhatsAppShare}
                onSelectPost={setCommentPost}
              />
            )}

            {/* Featured Trinbago Poll of the Day Card */}
            <div className="mb-6">
              <TrinbagoPoll 
                onShowToast={showToast} 
                featuredOnly={true} 
              />
            </div>

            {/* Active Filter Indicator */}
            {(showBookmarksOnly || searchQuery || timeFilter !== '24h' || selectedSources.length < Object.keys(SOURCES).length) && (
              <div className="mb-4 p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  {showBookmarksOnly && <strong className="text-red-400">Showing Saved Articles • </strong>}
                  {timeFilter !== '24h' && (
                    <strong className="text-amber-300">
                      Window: {timeFilter === 'all-time' ? 'All Archive' : timeFilter} •{' '}
                    </strong>
                  )}
                  {searchQuery && <>Filtering by: &quot;{searchQuery}&quot; • </>}
                  <span>{selectedSources.length} of {Object.keys(SOURCES).length} outlets active</span>
                </span>
                <button
                  onClick={() => {
                    setShowBookmarksOnly(false);
                    setSearchQuery('');
                    setTimeFilter('24h');
                    setSelectedSources(Object.keys(SOURCES) as SourceId[]);
                    setCategory('all');
                  }}
                  className="text-red-400 hover:text-red-300 font-bold underline ml-2"
                >
                  Reset Filters
                </button>
              </div>
            )}


            {/* Posts Content: Curated Editorial Sections vs Stream Grid */}
            {sortedPosts.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800 p-8 my-8">
                <Inbox className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <h3 className="text-lg font-bold text-slate-200">No stories match your filter</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
                  Try adjusting your category selection, search terms, or enable more media outlets.
                </p>
                <button
                  onClick={() => {
                    setCategory('all');
                    setSearchQuery('');
                    setShowBookmarksOnly(false);
                    setSelectedSources(Object.keys(SOURCES) as SourceId[]);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold"
                >
                  Show All Feeds
                </button>
              </div>
            ) : feedLayout === 'sections' && !showBookmarksOnly && !searchQuery && category === 'all' ? (
              <SectionedFeed
                posts={sortedPosts}
                upvotedIds={upvotedIds}
                bookmarkedIds={bookmarkedIds}
                mackoVotedIds={mackoVotedIds}
                userReactions={userReactions}
                onToggleUpvote={handleToggleUpvote}
                onToggleBookmark={handleToggleBookmark}
                onBoostMacko={handleBoostMacko}
                onSelectReaction={handleSelectReaction}
                onOpenComments={setCommentPost}
                onShare={setSharePost}
                onWhatsAppShare={handleWhatsAppShare}
                onMediaClick={setZoomMedia}
                onOpenBriefingModal={() => setIsBriefingModalOpen(true)}
                onSelectCategory={setCategory}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sortedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isUpvoted={upvotedIds.includes(post.id)}
                    isBookmarked={bookmarkedIds.includes(post.id)}
                    hasMackoVoted={mackoVotedIds.includes(post.id)}
                    userReaction={userReactions[post.id] as any}
                    onToggleUpvote={handleToggleUpvote}
                    onToggleBookmark={handleToggleBookmark}
                    onBoostMacko={handleBoostMacko}
                    onSelectReaction={handleSelectReaction}
                    onOpenComments={setCommentPost}
                    onShare={setSharePost}
                    onWhatsAppShare={handleWhatsAppShare}
                    onMediaClick={setZoomMedia}
                  />
                ))}
              </div>
            )}

          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 py-8 px-4 text-center text-xs text-slate-500 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <span className="font-bold text-slate-300 text-sm">TRENDING.TT</span>
            <span className="text-slate-600">|</span>
            <span>Trinidad & Tobago News & Trends PWA</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Aggregating TTT Live Online • CNC3 Television • CCN TV6 • I.A.N Network • T&T Newsday • Trinidad Express • Trinidad Guardian • TikTok TT • Facebook TT
          </div>
          <div className="text-slate-500 text-[11px]">
            No AI Gimmick Emojis • Fast Offline PWA • Built for Trinbagonians
          </div>
        </div>
      </footer>

      {/* Slide-over Comments Drawer (Lazy Loaded) */}
      <React.Suspense fallback={null}>
        {commentPost && (
          <CommentDrawer
            post={commentPost}
            isOpen={Boolean(commentPost)}
            onClose={() => setCommentPost(null)}
            onCommentAdded={handleCommentAdded}
          />
        )}
      </React.Suspense>

      {/* Share / Repost Modal (Lazy Loaded) */}
      <React.Suspense fallback={null}>
        {sharePost && (
          <ShareModal
            post={sharePost}
            isOpen={Boolean(sharePost)}
            onClose={() => setSharePost(null)}
          />
        )}
      </React.Suspense>

      {/* Sources Customization Modal */}
      <SourcesModal
        isOpen={isSourcesModalOpen}
        onClose={() => setIsSourcesModalOpen(false)}
        selectedSources={selectedSources}
        onToggleSource={(sourceId) => {
          setSelectedSources((prev) =>
            prev.includes(sourceId)
              ? prev.filter((id) => id !== sourceId)
              : [...prev, sourceId]
          );
        }}
        onSelectAll={() => setSelectedSources(Object.keys(SOURCES) as SourceId[])}
        onDeselectAll={() => setSelectedSources([])}
      />

      {/* Push Notification Settings Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Image / Media Zoom Lightbox Modal */}
      <ImageZoomLightbox
        media={zoomMedia}
        isOpen={Boolean(zoomMedia)}
        onClose={() => setZoomMedia(null)}
      />

      {/* Intelligence Briefing & NotebookLM Synthesizer Modal (Lazy Loaded) */}
      <React.Suspense fallback={null}>
        {isBriefingModalOpen && (
          <BriefingModal
            isOpen={isBriefingModalOpen}
            onClose={() => setIsBriefingModalOpen(false)}
            posts={posts}
            onPublishPost={(newPost) => {
              setPosts((prev) => [newPost, ...prev]);
            }}
            onCrossPost={(post) => setSharePost(post)}
            onShowToast={showToast}
          />
        )}
      </React.Suspense>

      {/* User Post Creation Modal (Lazy Loaded) */}
      <React.Suspense fallback={null}>
        {isCreatePostModalOpen && (
          <CreatePostModal
            isOpen={isCreatePostModalOpen}
            onClose={() => setIsCreatePostModalOpen(false)}
            onPostCreated={(newPost) => {
              setPosts((prev) => [newPost, ...prev]);
            }}
            onShowToast={showToast}
          />
        )}
      </React.Suspense>

      {/* Trinbago User Identity & Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserUpdated={setCurrentUser}
        onShowToast={showToast}
      />

      {/* Sticky Audio Narrator Player for Commuters */}
      <StickyAudioPlayer />

      {/* Mobile Bottom Navigation Bar (1-Thumb Ergonomics) */}
      <MobileBottomNav
        activeView={activeView}
        onSelectView={setActiveView}
        showBookmarks={showBookmarksOnly}
        onToggleBookmarks={() => setShowBookmarksOnly(!showBookmarksOnly)}
        bookmarksCount={bookmarkedIds.length}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenCreatePost={() => setIsCreatePostModalOpen(true)}
      />
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-5 right-5 z-50 bg-slate-900 border border-red-500/50 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
