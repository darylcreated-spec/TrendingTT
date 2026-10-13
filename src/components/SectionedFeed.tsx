import React, { useState } from 'react';
import type { Post } from '../types';
import { isSportsPost } from '../services/scraperEngine';
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
  mackoVotedIds?: string[];
  userReactions?: Record<string, string>;
  onToggleUpvote: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
  onBoostMacko?: (postId: string) => void;
  onSelectReaction?: (postId: string, reaction: any) => void;
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
  mackoVotedIds = [],
  userReactions = {},
  onToggleUpvote,
  onToggleBookmark,
  onBoostMacko,
  onSelectReaction,
  onOpenComments,
  onShare,
  onWhatsAppShare,
  onMediaClick,
  onSelectCategory
}) => {

  const [activeSectionTab] = useState<'all' | 'breaking' | 'sports' | 'social'>('all');

  // Segregate posts into distinct editorial buckets, ensuring newest posts appear first
  const sortByNewest = (a: Post, b: Post) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

  const isSports = (p: Post) => isSportsPost(p);

  const sportsPosts = posts
    .filter((p) => isSports(p))
    .sort(sortByNewest);

  const breakingPosts = posts
    .filter((p) => !isSports(p) && (p.isBreaking || p.category === 'breaking'))
    .sort(sortByNewest);

  const socialPosts = posts
    .filter((p) => !isSports(p) && !breakingPosts.includes(p) && (p.category === 'social' || p.sourceType === 'social'))
    .sort(sortByNewest);

  const generalPosts = posts
    .filter((p) => !isSports(p) && !breakingPosts.slice(0, 3).includes(p) && !socialPosts.slice(0, 3).includes(p))
    .sort(sortByNewest);

  return (
    <div className="space-y-10">

      {/* SECTION 1: BREAKING NEWS CAROUSEL / SPOTLIGHT */}
      {(activeSectionTab === 'all' || activeSectionTab === 'breaking') && breakingPosts.length > 0 && (
        <section aria-labelledby="section-breaking">
          <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-800 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
              <h2 id="section-breaking" className="text-sm sm:text-base md:text-lg font-black tracking-tight text-slate-100 uppercase flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-red-500 shrink-0" />
                <span>Breaking News & Critical Bulletins</span>
              </h2>
              <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 shrink-0">
                {breakingPosts.length} Live
              </span>
            </div>

            <button
              onClick={() => onSelectCategory('breaking')}
              className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 group shrink-0 ml-auto sm:ml-0"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full min-w-0">
            {breakingPosts.slice(0, 3).map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isUpvoted={upvotedIds.includes(post.id)}
                isBookmarked={bookmarkedIds.includes(post.id)}
                hasMackoVoted={mackoVotedIds.includes(post.id)}
                userReaction={userReactions[post.id] as any}
                onToggleUpvote={onToggleUpvote}
                onToggleBookmark={onToggleBookmark}
                onBoostMacko={onBoostMacko}
                onSelectReaction={onSelectReaction}
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
          <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-800 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <div className="p-1 rounded bg-amber-500/20 text-amber-400 shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <h2 id="section-sports" className="text-sm sm:text-base md:text-lg font-black tracking-tight text-slate-100 uppercase flex items-center gap-2">
                Trinbago Sports Arena
              </h2>
              <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60 shrink-0">
                Cricket • Football • Track
              </span>
            </div>

            <button
              onClick={() => onSelectCategory('sports')}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 group shrink-0 ml-auto sm:ml-0"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full min-w-0">
              {sportsPosts.slice(0, 6).map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isUpvoted={upvotedIds.includes(post.id)}
                  isBookmarked={bookmarkedIds.includes(post.id)}
                  hasMackoVoted={mackoVotedIds.includes(post.id)}
                  userReaction={userReactions[post.id] as any}
                  onToggleUpvote={onToggleUpvote}
                  onToggleBookmark={onToggleBookmark}
                  onBoostMacko={onBoostMacko}
                  onSelectReaction={onSelectReaction}
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
          <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-800 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <div className="p-1 rounded bg-pink-500/20 text-pink-400 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <h2 id="section-social" className="text-sm sm:text-base md:text-lg font-black tracking-tight text-slate-100 uppercase flex items-center gap-2">
                Trending on Social Media
              </h2>
              <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-950/80 text-pink-300 border border-pink-800/60 shrink-0">
                #TriniTikTok • FB Reels • IG
              </span>
            </div>

            <button
              onClick={() => onSelectCategory('social')}
              className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 group shrink-0 ml-auto sm:ml-0"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full min-w-0">
              {socialPosts.slice(0, 3).map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isUpvoted={upvotedIds.includes(post.id)}
                  isBookmarked={bookmarkedIds.includes(post.id)}
                  hasMackoVoted={mackoVotedIds.includes(post.id)}
                  userReaction={userReactions[post.id] as any}
                  onToggleUpvote={onToggleUpvote}
                  onToggleBookmark={onToggleBookmark}
                  onBoostMacko={onBoostMacko}
                  onSelectReaction={onSelectReaction}
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
          <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-800 flex-wrap sm:flex-nowrap">
            <h2 id="section-general" className="text-sm sm:text-base md:text-lg font-black tracking-tight text-slate-100 uppercase">
              National Broadcast & Newspaper Desks
            </h2>
            <span className="hidden sm:inline text-xs text-slate-400 font-medium">
              TV6, CNC3, TTT, Newsday, Guardian & I.A.N
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full min-w-0">
            {generalPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isUpvoted={upvotedIds.includes(post.id)}
                isBookmarked={bookmarkedIds.includes(post.id)}
                hasMackoVoted={mackoVotedIds.includes(post.id)}
                userReaction={userReactions[post.id] as any}
                onToggleUpvote={onToggleUpvote}
                onToggleBookmark={onToggleBookmark}
                onBoostMacko={onBoostMacko}
                onSelectReaction={onSelectReaction}
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
