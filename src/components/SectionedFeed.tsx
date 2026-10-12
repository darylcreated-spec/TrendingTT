import React, { useState } from 'react';
import type { Post } from '../types';
import { PostCard } from './PostCard';
import { 
  Zap, 
  Trophy, 
  Flame, 
  ChevronRight 
} from 'lucide-react';

interface SectionedFeedProps {
  posts: Post[];
  upvotedIds: string[];
  bookmarkedIds: string[];
  onToggleUpvote: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
  onOpenComments: (post: Post) => void;
  onShare: (post: Post) => void;
  onWhatsAppShare: (post: Post) => void;
  onMediaClick: (media: { url: string; title: string; type?: string }) => void;
  onOpenBriefingModal?: () => void;
  onSelectCategory: (category: Post['category']) => void;
}

export const SectionedFeed: React.FC<SectionedFeedProps> = ({
  posts,
  upvotedIds,
  bookmarkedIds,
  onToggleUpvote,
  onToggleBookmark,
  onOpenComments,
  onShare,
  onWhatsAppShare,
  onMediaClick,
  onSelectCategory
}) => {
  const [activeSectionTab] = useState<'all' | 'breaking' | 'sports' | 'social'>('all');

  // Segregate posts into distinct editorial buckets
  const breakingPosts = posts.filter(
    (p) => p.isBreaking || p.category === 'breaking' || p.trendingScore >= 95
  );

  const sportsPosts = posts.filter(
    (p) => p.category === 'sports' || p.tags.some((t) => /cricket|football|cpl|red force|soca warriors|track/i.test(t))
  );

  const socialPosts = posts.filter(
    (p) => p.category === 'social' || p.sourceType === 'social'
  );

  const generalPosts = posts.filter(
    (p) => !breakingPosts.includes(p) && !sportsPosts.includes(p) && !socialPosts.includes(p)
  );

  return (
    <div className="space-y-10">

      {/* SECTION 1: BREAKING NEWS CAROUSEL / SPOTLIGHT */}
      {(activeSectionTab === 'all' || activeSectionTab === 'breaking') && breakingPosts.length > 0 && (
        <section aria-labelledby="section-breaking">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <h2 id="section-breaking" className="text-base sm:text-lg font-black tracking-tight text-slate-100 uppercase flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-500" />
                Breaking News & Critical Bulletins
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800">
                {breakingPosts.length} Live
              </span>
            </div>

            <button
              onClick={() => onSelectCategory('breaking')}
              className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 group"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {breakingPosts.slice(0, 3).map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isUpvoted={upvotedIds.includes(post.id)}
                isBookmarked={bookmarkedIds.includes(post.id)}
                onToggleUpvote={onToggleUpvote}
                onToggleBookmark={onToggleBookmark}
                onOpenComments={onOpenComments}
                onShare={onShare}
                onWhatsAppShare={onWhatsAppShare}
                onMediaClick={onMediaClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: TRINBAGO SPORTS ARENA */}
      {(activeSectionTab === 'all' || activeSectionTab === 'sports') && (
        <section aria-labelledby="section-sports">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded bg-amber-500/20 text-amber-400">
                <Trophy className="w-4 h-4" />
              </div>
              <h2 id="section-sports" className="text-base sm:text-lg font-black tracking-tight text-slate-100 uppercase flex items-center gap-2">
                Trinbago Sports Arena
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60">
                Cricket • Football • Track
              </span>
            </div>

            <button
              onClick={() => onSelectCategory('sports')}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 group"
            >
              <span>All Sports</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {sportsPosts.length === 0 ? (
            <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
              No recent sports fixtures reported. Refresh feeds to check for new match recaps.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sportsPosts.slice(0, 3).map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isUpvoted={upvotedIds.includes(post.id)}
                  isBookmarked={bookmarkedIds.includes(post.id)}
                  onToggleUpvote={onToggleUpvote}
                  onToggleBookmark={onToggleBookmark}
                  onOpenComments={onOpenComments}
                  onShare={onShare}
                  onWhatsAppShare={onWhatsAppShare}
                  onMediaClick={onMediaClick}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* SECTION 3: TRENDING ON SOCIAL MEDIA */}
      {(activeSectionTab === 'all' || activeSectionTab === 'social') && (
        <section aria-labelledby="section-social">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded bg-pink-500/20 text-pink-400">
                <Flame className="w-4 h-4" />
              </div>
              <h2 id="section-social" className="text-base sm:text-lg font-black tracking-tight text-slate-100 uppercase flex items-center gap-2">
                Trending on Social Media
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-950/80 text-pink-300 border border-pink-800/60">
                #TriniTikTok • FB Reels • IG
              </span>
            </div>

            <button
              onClick={() => onSelectCategory('social')}
              className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 group"
            >
              <span>Social Feed</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {socialPosts.length === 0 ? (
            <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
              No viral social clips loaded. Ingest social feeds via yt-dlp to view trending videos.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {socialPosts.slice(0, 3).map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isUpvoted={upvotedIds.includes(post.id)}
                  isBookmarked={bookmarkedIds.includes(post.id)}
                  onToggleUpvote={onToggleUpvote}
                  onToggleBookmark={onToggleBookmark}
                  onOpenComments={onOpenComments}
                  onShare={onShare}
                  onWhatsAppShare={onWhatsAppShare}
                  onMediaClick={onMediaClick}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* SECTION 4: NATIONAL HEADLINES & REGULAR CHRONOLOGICAL STREAM */}
      {generalPosts.length > 0 && (
        <section aria-labelledby="section-general">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h2 id="section-general" className="text-base sm:text-lg font-black tracking-tight text-slate-100 uppercase">
              National Broadcast & Newspaper Desks
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              TV6, CNC3, TTT, Newsday, Guardian & I.A.N
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {generalPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isUpvoted={upvotedIds.includes(post.id)}
                isBookmarked={bookmarkedIds.includes(post.id)}
                onToggleUpvote={onToggleUpvote}
                onToggleBookmark={onToggleBookmark}
                onOpenComments={onOpenComments}
                onShare={onShare}
                onWhatsAppShare={onWhatsAppShare}
                onMediaClick={onMediaClick}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
