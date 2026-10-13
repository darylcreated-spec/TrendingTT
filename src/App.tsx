import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Post, Category, SortOption, TimeFilterOption, SourceId, ActiveView, UserProfile, TriniReactionType } from './types';
import { INITIAL_POSTS } from './data/mockPosts';
import { SOURCES } from './data/sources';
import { Storage } from './services/storage';
import { fetchLiveTTFeeds, calculateTrendingVelocity, isSportsPost } from './services/scraperEngine';




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
const AuthModal = React.lazy(() =>
  import('./components/AuthModal').then((m) => ({ default: m.AuthModal }))
);

import { FeedSkeletonLoader } from './components/FeedSkeletonLoader';
import { formatPostTimeOnly, formatRelativeTime } from './utils/dateUtils';
import type { Region } from './types';
import clsx from 'clsx';

const ViewLoadingFallback = () => (
  <div className="py-6 max-w-7xl mx-auto px-4">
    <FeedSkeletonLoader count={3} />
  </div>
);
import { 
  Inbox, 
  CheckCircle,
  ArrowUp,
  WifiOff,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { mergePosts } from './services/feedMerge';

const REGIONS: Region[] = ['all', 'North', 'Central', 'South', 'East', 'Tobago'];
const REGION_KEYWORDS: Record<Region, string[]> = {
  all: [],
  North: ['port of spain', 'diego martin', 'maraval', 'st. james', 'woodbrook', 'cascade', 'belmont', 'maracas', 'santa cruz'],
  Central: ['chaguanas', 'couva', 'montrose', 'chase village', 'cunupia', 'freeport', 'preysal', 'california', 'caroni'],
  South: ['san fernando', 'point fortin', 'penal', 'debe', 'princes town', 'siparia', 'fyzabad', 'la brea', 'marabella'],
  East: ['arima', 'sangre grande', 'trincity', 'tunapuna', 'curepe', 'st. augustine', 'arouca', 'valencia', 'toco', 'manzanilla'],
  Tobago: ['tobago', 'scarborough', 'crown point', 'plymouth', 'roxborough', 'canaan', 'lowlands', 'castara'],
};

export const App: React.FC = () => {
  // Navigation & View mode: Feed, Radar, Utilities, or Polls
  const [activeView, setActiveView] = useState<ActiveView>('feed');

  // Core Feed States: Deduplicated and merged with mergePosts
  const [posts, setPosts] = useState<Post[]>(() => {
    const custom = Storage.getCustomPosts();
    const cached = Storage.getCachedFeed();
    const initialCandidates = [...custom, ...cached];
    const initialList = mergePosts(
      [],
      initialCandidates.length > 0 ? initialCandidates : INITIAL_POSTS
    );
    Storage.saveCachedFeed(initialList);
    return initialList;
  });
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const isInitialMountRef = useRef<boolean>(true);
  const [feedMeta, setFeedMeta] = useState<{
    generatedAt?: string;
    sourceHealth?: Record<string, { ok: boolean; count: number; error?: string }>;
  } | null>(null);
  const [streamVisibleCount, setStreamVisibleCount] = useState<number>(40);
  const [pullProgress, setPullProgress] = useState<number>(0);
  const [swUpdateAvailable, setSwUpdateAvailable] = useState<boolean>(false);
  const [category, setCategory] = useState<Category>(() => {
    try {
      const saved = localStorage.getItem('trending_tt_selected_category');
      return (saved as Category) || 'all';
    } catch {
      return 'all';
    }
  });
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('24h');
  const [selectedSources, setSelectedSources] = useState<SourceId[]>(() => {
    try {
      const saved = localStorage.getItem('trending_tt_selected_sources');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return Object.keys(SOURCES) as SourceId[];
  });
  const [selectedRegion, setSelectedRegion] = useState<Region>(() => {
    try {
      const saved = localStorage.getItem('trending_tt_selected_region');
      return (saved as Region) || 'all';
    } catch {
      return 'all';
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toISOString());
  const [filterClock] = useState<number>(() => Date.now());

  // Reset stream window when filters change
  const filterKey = `${category}|${searchQuery}|${timeFilter}|${selectedSources.join(',')}|${selectedRegion}|${showBookmarksOnly}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setStreamVisibleCount(40);
  }

  // Feed status text with AST freshness and sources OK ratio
  const feedStatusText = useMemo(() => {
    if (feedMeta?.sourceHealth) {
      const okCount = Object.values(feedMeta.sourceHealth).filter((s) => s.ok).length;
      const totalCount = Object.keys(feedMeta.sourceHealth).length;
      const updatedAgo = feedMeta.generatedAt ? formatRelativeTime(feedMeta.generatedAt) : '';
      return updatedAgo ? `Feed updated ${updatedAgo} · Sources: ${okCount}/${totalCount} OK` : `Sources: ${okCount}/${totalCount} OK`;
    }
    return '';
  }, [feedMeta]);

  // Save filter preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('trending_tt_selected_category', category);
    } catch {}
  }, [category]);

  useEffect(() => {
    try {
      localStorage.setItem('trending_tt_selected_sources', JSON.stringify(selectedSources));
    } catch {}
  }, [selectedSources]);

  useEffect(() => {
    try {
      localStorage.setItem('trending_tt_selected_region', selectedRegion);
    } catch {}
  }, [selectedRegion]);

  // Online / Offline connectivity listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastSyncTime(new Date().toISOString());
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  // Touch swipe navigation between views (Feed <-> Radar <-> Polls) & Pull-to-refresh
  const touchStartRef = useRef<{ x: number; y: number; scrollY: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      scrollY: typeof window !== 'undefined' ? (window.scrollY || document.documentElement.scrollTop || 0) : 0,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaY = e.touches[0].clientY - touchStartRef.current.y;
    const deltaX = e.touches[0].clientX - touchStartRef.current.x;

    // Pull-to-refresh visual progress when user drags down at top of page
    if (activeView === 'feed' && touchStartRef.current.scrollY === 0 && deltaY > 0 && Math.abs(deltaY) > Math.abs(deltaX)) {
      setPullProgress(Math.min(deltaY * 0.4, 75));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    const startScrollY = touchStartRef.current.scrollY;
    touchStartRef.current = null;
    setPullProgress(0);

    // Pull-to-refresh: triggered when pulling down >= 65px at top of feed
    if (activeView === 'feed' && startScrollY === 0 && deltaY >= 65 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
      handleTriggerScrape(false);
      return;
    }

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
  const [lastScrapedTime, setLastScrapedTime] = useState<string>('AST');
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

      if (socialRes.status === 'fulfilled') {
        if (socialRes.value.posts.length > 0) {
          freshPosts.push(...socialRes.value.posts);
          socialCount = socialRes.value.posts.length;
        }
        if (socialRes.value.meta) {
          setFeedMeta(socialRes.value.meta);
        }
      }

      if (freshPosts.length > 0) {
        if (silent && !isInitialMountRef.current && posts.length > 0) {
          const currentIds = new Set(posts.map((p) => p.id));
          const brandNew = freshPosts.filter((p) => !currentIds.has(p.id));
          if (brandNew.length > 0) {
            setPendingPosts(brandNew);
          }
        } else {
          isInitialMountRef.current = false;
          setPosts((prev) => {
            const merged = mergePosts(prev, freshPosts);
            Storage.saveCachedFeed(merged);
            return merged;
          });
          setPendingPosts([]);
          if (!silent) {
            showToast(`Ingested ${liveCount + socialCount} updates from broadcast, yt-dlp & social feeds`);
          }
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
  }, [posts, showToast]);

  // Initialize PWA install events and auto-refresh timers
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Initial background ingestion and feed refresh on startup (deferred to prevent synchronous setState)
    const initialTimer = setTimeout(() => {
      handleTriggerScrape(true);
    }, 100);

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
      clearTimeout(initialTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearInterval(autoRefreshTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleTriggerScrape]);

  // Listen for Service Worker updates to notify installed PWAs
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setSwUpdateAvailable(true);
              }
            });
          }
        });
      });
    }
  }, []);

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

      // Region filter
      if (selectedRegion !== 'all') {
        const keywords = REGION_KEYWORDS[selectedRegion];
        const text = `${post.title} ${post.summary} ${post.content || ''} ${(post.tags || []).join(' ')}`.toLowerCase();
        const matchesRegion = keywords.some((kw) => text.includes(kw));
        if (!matchesRegion) {
          return false;
        }
      }

      // Category filter
      if (category !== 'all') {
        if (category === 'breaking' && !post.isBreaking) return false;
        if (category === 'broadcast' && post.sourceType !== 'broadcast') return false;
        if (category === 'social' && post.sourceType !== 'social') return false;
        if (category === 'sports') {
          return isSportsPost(post);
        }
        if (!['breaking', 'broadcast', 'social', 'sports'].includes(category) && post.category !== category) {
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
        const hoursAgo = (filterClock - new Date(post.publishedAt).getTime()) / (1000 * 60 * 60);
        if (timeFilter === '24h' && hoursAgo > 24) return false;
        if (timeFilter === '48h' && hoursAgo > 48) return false;
        if (timeFilter === '7d' && hoursAgo > 24 * 7) return false;
      }

      return true;
    });
  }, [posts, category, selectedSources, searchQuery, showBookmarksOnly, bookmarkedIds, timeFilter, selectedRegion, filterClock]);


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
    return posts.filter((p) => (p.isBreaking || p.category === 'breaking') && !isSportsPost(p) && p.dataOrigin !== 'sample');
  }, [posts]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans w-full">
      {/* Offline Status Banner */}
      {!isOnline && (
        <div 
          role="status" 
          aria-live="polite" 
          className="bg-amber-600/95 text-white px-4 py-2.5 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-md shrink-0"
        >
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>You are currently offline. Showing cached feed (last synced {formatPostTimeOnly(lastSyncTime)}).</span>
        </div>
      )}

      {/* PWA Install Banner */}
      <PWAInstallBanner
        onInstall={handleInstallPWA}
        canInstall={Boolean(deferredPrompt)}
      />

      {/* Pull-to-refresh visual indicator */}
      {pullProgress > 0 && (
        <div 
          className="fixed top-12 left-0 right-0 z-50 flex items-center justify-center transition-opacity pointer-events-none"
          style={{ transform: `translateY(${pullProgress}px)` }}
        >
          <div className="bg-slate-900 border border-slate-700 text-slate-200 px-4 py-1.5 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2">
            <RefreshCw className={clsx("w-3.5 h-3.5 text-red-500", pullProgress >= 65 && "animate-spin")} />
            <span>{pullProgress >= 65 ? 'Release to refresh feed' : 'Pull down to refresh'}</span>
          </div>
        </div>
      )}

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
        feedStatusText={feedStatusText}
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

      {/* Regional Trinidad & Tobago Alert Filter */}
      {activeView === 'feed' && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-2.5 pb-1 w-full" aria-label="Filter by region">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>Area:</span>
            </span>
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRegion(r)}
                aria-pressed={selectedRegion === r}
                className={clsx(
                  'px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-red-500',
                  selectedRegion === r
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                )}
              >
                {r === 'all' ? 'All T&T' : r}
              </button>
            ))}
          </div>
        </div>
      )}


      {/* Main Content Area with Touch Swipe Between Views & Pull-to-refresh */}
      <main 
        onTouchStart={handleTouchStart} 
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd} 
        className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex-1 w-full min-w-0 pb-24 md:pb-6"
      >
        {/* OPTION B VIEW: TRAFFIC & WEATHER RADAR */}
        {activeView === 'radar' && (
          <React.Suspense fallback={<ViewLoadingFallback />}>
            <TrafficWeatherRadar
              onShowToast={showToast}
              onOpenNotifications={() => setIsNotificationModalOpen(true)}
              initialRegion={selectedRegion}
            />
          </React.Suspense>
        )}

        {/* UTILITIES RADAR VIEW: T&TEC, WASA, AMPLIA, FLOW, DIGICEL, BMOBILE */}
        {activeView === 'utilities' && (
          <React.Suspense fallback={<ViewLoadingFallback />}>
            <UtilitiesDashboard
              onShowToast={showToast}
              onOpenNotifications={() => setIsNotificationModalOpen(true)}
              initialRegion={selectedRegion}
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
            {/* New Posts Floating Pill (Freshness indicator that doesn't jump the feed) */}
            {pendingPosts.length > 0 && (
              <div className="sticky top-20 z-40 flex justify-center mb-4">
                <button
                  onClick={() => {
                    setPosts((prev) => {
                      const merged = mergePosts(prev, pendingPosts);
                      Storage.saveCachedFeed(merged);
                      return merged;
                    });
                    setPendingPosts([]);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    showToast(`Loaded ${pendingPosts.length} new bulletins`);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs rounded-full shadow-2xl border border-red-400/40 transition-all transform hover:scale-105 active:scale-95 animate-pulse"
                >
                  <ArrowUp className="w-4 h-4" />
                  <span>New bulletins available ({pendingPosts.length}) — tap to load</span>
                </button>
              </div>
            )}

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
            {isRefreshing && posts.length === 0 ? (
              <FeedSkeletonLoader count={4} />
            ) : sortedPosts.length === 0 ? (
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sortedPosts.slice(0, streamVisibleCount).map((post) => (
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

                {sortedPosts.length > streamVisibleCount && (
                  <div className="text-center py-6">
                    <button
                      onClick={() => setStreamVisibleCount((prev) => prev + 20)}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      Load More Bulletins ({sortedPosts.length - streamVisibleCount} remaining)
                    </button>
                  </div>
                )}
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

      {/* Trinbago User Identity & Auth Modal (Lazy Loaded) */}
      <React.Suspense fallback={null}>
        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            currentUser={currentUser}
            onUserUpdated={setCurrentUser}
            onShowToast={showToast}
          />
        )}
      </React.Suspense>

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
      {/* PWA Update Available Toast */}
      {swUpdateAvailable && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-slate-900/95 border border-red-500/70 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-bounce">
          <div className="text-xs min-w-0">
            <p className="font-bold text-slate-100">Update available — reload</p>
            <p className="text-slate-400 text-[11px] truncate">New bulletins & features ready to install.</p>
          </div>
          <button
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.serviceWorker?.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
              }
              window.location.reload();
            }}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold shadow-md shrink-0 transition-transform active:scale-95"
          >
            Reload
          </button>
        </div>
      )}

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
