import React, { useState, useEffect, useMemo } from 'react';
import type { Post, Category, SortOption, SourceId } from './types';
import { INITIAL_POSTS } from './data/mockPosts';
import { SOURCES } from './data/sources';
import { Storage } from './services/storage';
import { fetchLiveTTFeeds, calculateTrendingVelocity } from './services/scraperEngine';
import { Header } from './components/Header';
import { BreakingTicker } from './components/BreakingTicker';
import { CategoryNav } from './components/CategoryNav';
import { PostCard } from './components/PostCard';
import { CommentDrawer } from './components/CommentDrawer';
import { ShareModal } from './components/ShareModal';
import { SourcesModal } from './components/SourcesModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { 
  Inbox, 
  CheckCircle,
} from 'lucide-react';

export const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [category, setCategory] = useState<Category>('all');
  const [sortOption, setSortOption] = useState<SortOption>('trending');
  const [selectedSources, setSelectedSources] = useState<SourceId[]>(
    Object.keys(SOURCES) as SourceId[]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Persistence States
  const [upvotedIds, setUpvotedIds] = useState<string[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Modals & Drawers
  const [commentPost, setCommentPost] = useState<Post | null>(null);
  const [sharePost, setSharePost] = useState<Post | null>(null);
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);

  // Scraper & PWA status
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastScrapedTime, setLastScrapedTime] = useState<string>('Live (AST)');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize stored upvotes, bookmarks, and PWA install events
  useEffect(() => {
    setUpvotedIds(Storage.getUpvotedPosts());
    setBookmarkedIds(Storage.getBookmarks());

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  // WhatsApp Quick Share
  const handleWhatsAppShare = (post: Post) => {
    const url = window.location.origin ? `${window.location.origin}/#post-${post.id}` : post.originalUrl;
    const text = `*${post.title}*\n\nRead on Trending TT (Trinidad & Tobago Live Dashboard):\n${url}\n\nSource: ${post.sourceName}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Live Scrape Trigger
  const handleTriggerScrape = async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchLiveTTFeeds();
      if (result.newPosts.length > 0) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.title));
          const uniqueNew = result.newPosts.filter((p) => !existingIds.has(p.title));
          return [...uniqueNew, ...prev];
        });
        showToast(`Scraped ${result.newPosts.length} fresh updates from TT media`);
      } else {
        showToast('Feeds up to date. No new bulletins at this moment.');
      }
      setLastScrapedTime(result.timestamp);
    } catch {
      showToast('Scraper refresh finished.');
    } finally {
      setIsRefreshing(false);
    }
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

      return true;
    });
  }, [posts, category, selectedSources, searchQuery, showBookmarksOnly, bookmarkedIds]);

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
        onRefresh={handleTriggerScrape}
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
      />

      {/* Breaking News Ticker Bar */}
      <BreakingTicker
        breakingPosts={breakingPosts}
        onSelectPost={(post) => setCommentPost(post)}
      />

      {/* Category Navigation & Sorting Tabs */}
      <CategoryNav
        activeCategory={category}
        onSelectCategory={setCategory}
        activeSort={sortOption}
        onSelectSort={setSortOption}
      />

      {/* Main Feed Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        {/* Active Filter Indicator */}
        {(showBookmarksOnly || searchQuery || selectedSources.length < Object.keys(SOURCES).length) && (
          <div className="mb-4 p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300">
              {showBookmarksOnly && <strong className="text-red-400">Showing Saved Articles • </strong>}
              {searchQuery && <>Filtering by: &quot;{searchQuery}&quot; • </>}
              <span>{selectedSources.length} of {Object.keys(SOURCES).length} outlets active</span>
            </span>
            <button
              onClick={() => {
                setShowBookmarksOnly(false);
                setSearchQuery('');
                setSelectedSources(Object.keys(SOURCES) as SourceId[]);
                setCategory('all');
              }}
              className="text-red-400 hover:text-red-300 font-bold underline ml-2"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Posts Grid */}
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isUpvoted={upvotedIds.includes(post.id)}
                isBookmarked={bookmarkedIds.includes(post.id)}
                onToggleUpvote={handleToggleUpvote}
                onToggleBookmark={handleToggleBookmark}
                onOpenComments={setCommentPost}
                onShare={setSharePost}
                onWhatsAppShare={handleWhatsAppShare}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-850 py-8 px-4 text-center text-xs text-slate-500 border-t border-slate-800">
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

      {/* Slide-over Comments Drawer */}
      <CommentDrawer
        post={commentPost}
        isOpen={Boolean(commentPost)}
        onClose={() => setCommentPost(null)}
        onCommentAdded={handleCommentAdded}
      />

      {/* Share / Repost Modal */}
      <ShareModal
        post={sharePost}
        isOpen={Boolean(sharePost)}
        onClose={() => setSharePost(null)}
      />

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

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-red-500/50 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
