import React, { useRef, useState, useMemo } from 'react';
import { 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  MessageSquare, 
  Share2, 
  Trophy, 
  Clock
} from 'lucide-react';
import type { Post } from '../types';
import { getMackoStage } from './MackoMeter';
import { formatPostDateTime } from '../utils/dateUtils';

interface MackoLeaderboardProps {
  posts: Post[];
  mackoVotedIds?: string[];
  onBoostMacko?: (postId: string) => void;
  onOpenComments?: (post: Post) => void;
  onWhatsAppShare?: (post: Post) => void;
  onSelectPost?: (post: Post) => void;
  className?: string;
}

export interface MackoRankedPost {
  post: Post;
  mackoScore: number;
  voteVelocity: number;
  compositeScore: number;
  rank: number;
  hoursAgo: number;
}

export function computeMackoLeaderboard(posts: Post[], maxItems = 5): MackoRankedPost[] {
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  // Filter posts within the last 24 hours, fallback to all if too few
  let eligible = (posts || []).filter((p) => {
    if (!p?.publishedAt) return false;
    const postTime = new Date(p.publishedAt).getTime();
    return !Number.isNaN(postTime) && (now - postTime <= ONE_DAY_MS);
  });

  if (eligible.length < maxItems) {
    eligible = posts || [];
  }

  const scored = eligible.map((post) => {
    const postTime = post.publishedAt ? new Date(post.publishedAt).getTime() : NaN;
    const safeTime = Number.isNaN(postTime) ? now - (1000 * 60 * 60 * 2) : postTime;
    const hoursAgo = Math.max(0.1, (now - safeTime) / (1000 * 60 * 60));
    const mackoScore = post.mackoScore ?? post.trendingScore ?? 50;
    const mackoVotes = post.mackoVotes ?? 0;
    
    // Vote velocity weighted by time decay
    const engagementWeight = (mackoVotes * 12) + (post.upvotes * 2) + (post.commentsCount * 3.5);
    const voteVelocity = Math.round(engagementWeight / Math.pow(hoursAgo + 1.2, 1.35));
    
    // Composite ranking formula combining Macko virality score + vote velocity
    const compositeScore = (mackoScore * 0.55) + (Math.min(100, voteVelocity) * 0.45) + (post.isBreaking ? 15 : 0);

    return {
      post,
      mackoScore,
      voteVelocity,
      compositeScore,
      rank: 0,
      hoursAgo: Math.round(hoursAgo * 10) / 10
    };
  });

  // Sort descending by compositeScore
  scored.sort((a, b) => b.compositeScore - a.compositeScore);

  // Assign ranks 1 to maxItems
  const topSlice = scored.slice(0, maxItems);
  return topSlice.map((item, idx) => ({
    ...item,
    rank: idx + 1
  }));
}

export const MackoLeaderboard: React.FC<MackoLeaderboardProps> = ({
  posts,
  mackoVotedIds = [],
  onBoostMacko,
  onOpenComments,
  onWhatsAppShare,
  onSelectPost,
  className = ''
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeSpotlightIdx, setActiveSpotlightIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'carousel' | 'spotlight'>('carousel');

  const leaderboard = useMemo(() => computeMackoLeaderboard(posts, 5), [posts]);

  if (leaderboard.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 320;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const safeSpotlightIdx = Math.min(activeSpotlightIdx, Math.max(0, leaderboard.length - 1));
  const currentSpotlight = leaderboard[safeSpotlightIdx] || leaderboard[0];
  const spotlightStage = getMackoStage(currentSpotlight.mackoScore);
  const isSpotlightVoted = mackoVotedIds.includes(currentSpotlight.post.id);

  return (
    <section 
      aria-label="D Macko Leaderboard: Top 5 Trending Topics"
      className={`relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/40 border border-red-500/30 p-4 sm:p-5 shadow-xl mb-6 overflow-hidden ${className}`}
    >
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 text-white shadow-lg shadow-red-900/30">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                D Macko Leaderboard
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40">
                Top 5 Buzzing
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Highest citizen buzz & vote velocity across Trinidad & Tobago in the last 12–24h
            </p>
          </div>
        </div>

        {/* View Switcher & Carousel Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('carousel')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                viewMode === 'carousel'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Carousel
            </button>
            <button
              onClick={() => setViewMode('spotlight')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                viewMode === 'spotlight'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Spotlight Card
            </button>
          </div>

          {viewMode === 'carousel' && (
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => scroll('left')}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Previous topic"
                aria-label="Previous trending topic"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Next topic"
                aria-label="Next trending topic"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VIEW 1: HORIZONTAL SWIPEABLE CAROUSEL */}
      {viewMode === 'carousel' && (
        <div
          ref={scrollContainerRef}
          className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory focus:outline-none"
          tabIndex={0}
          aria-label="Top 5 Trending Carousel"
        >
          {leaderboard.map(({ post, rank, mackoScore, voteVelocity }) => {
            const stage = getMackoStage(mackoScore);
            const hasVoted = mackoVotedIds.includes(post.id);

            return (
              <article
                key={post.id}
                className={`w-[290px] sm:w-[320px] shrink-0 snap-start rounded-xl p-3.5 flex flex-col justify-between transition-all border ${
                  rank === 1
                    ? 'bg-gradient-to-b from-red-950/60 to-slate-900 border-red-500/60 shadow-lg shadow-red-950/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Rank Header + Macko Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                          rank === 1
                            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/40'
                            : rank === 2
                            ? 'bg-slate-300 text-slate-950'
                            : rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        #{rank}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${stage.bgColor} ${stage.color} ${stage.borderColor}`}>
                        {stage.badgeEmoji} {stage.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400" title="Macko Virality Score">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>{mackoScore}%</span>
                    </div>
                  </div>

                  {/* Headline */}
                  <h3 
                    onClick={() => onSelectPost?.(post)}
                    className="text-xs sm:text-sm font-bold text-slate-100 hover:text-red-400 line-clamp-2 cursor-pointer transition-colors leading-snug mb-1.5"
                  >
                    {post.title}
                  </h3>

                  {/* Summary preview */}
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {post.summary}
                  </p>
                </div>

                {/* Footer Metrics & Actions */}
                <div className="pt-2.5 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2.5">
                    <span className="font-semibold text-slate-300 truncate max-w-[120px]">
                      {post.sourceName}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <TrendingUp className="w-3 h-3" />
                      +{voteVelocity} velocity
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => onBoostMacko?.(post.id)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                        hasVoted
                          ? 'bg-red-600/30 text-red-300 border border-red-500/50'
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-sm'
                      }`}
                      title="Boost this story on D Macko Meter"
                    >
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>{hasVoted ? 'Boosted' : 'Boost'}</span>
                    </button>

                    <button
                      onClick={() => onOpenComments?.(post)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white"
                      title="View comments & Trini chatter"
                      aria-label="View comments"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onWhatsAppShare?.(post)}
                      className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60"
                      title="Share to WhatsApp"
                      aria-label="Share story to WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* VIEW 2: SPOTLIGHT CARD MODE */}
      {viewMode === 'spotlight' && (
        <div className="space-y-3">
          {/* Main spotlight hero card */}
          <div className="rounded-xl bg-slate-950/90 border border-red-500/40 p-4 sm:p-5 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md">
                  <Trophy className="w-3.5 h-3.5" />
                  #{currentSpotlight.rank} IN THE NATION
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${spotlightStage.bgColor} ${spotlightStage.color} ${spotlightStage.borderColor}`}>
                  {spotlightStage.badgeEmoji} {spotlightStage.label}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Flame className="w-4 h-4 fill-current" />
                  {currentSpotlight.mackoScore}% Macko
                </span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +{currentSpotlight.voteVelocity} velocity
                </span>
              </div>
            </div>

            <h3 
              onClick={() => onSelectPost?.(currentSpotlight.post)}
              className="text-base sm:text-lg font-black text-white hover:text-red-400 cursor-pointer transition-colors leading-snug mb-2"
            >
              {currentSpotlight.post.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              {currentSpotlight.post.summary}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-3 text-slate-400">
                <span className="font-semibold text-slate-200">
                  {currentSpotlight.post.sourceName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {formatPostDateTime(currentSpotlight.post.publishedAt)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onBoostMacko?.(currentSpotlight.post.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-md text-xs transition-all ${
                    isSpotlightVoted
                      ? 'bg-red-600/30 text-red-300 border border-red-500/50'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/40'
                  }`}
                  title="Boost this story on D Macko Meter"
                >
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{isSpotlightVoted ? 'Boosted' : 'Boost Macko'}</span>
                </button>
                <button
                  onClick={() => onOpenComments?.(currentSpotlight.post)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 border border-slate-700 text-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discussion ({currentSpotlight.post.commentsCount})</span>
                </button>
                <button
                  onClick={() => onWhatsAppShare?.(currentSpotlight.post)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/90 hover:bg-emerald-900 text-emerald-400 font-semibold flex items-center gap-1.5 border border-emerald-800/60 text-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Selector Pills for #1 to #5 */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {leaderboard.map((item, idx) => (
              <button
                key={item.post.id}
                onClick={() => setActiveSpotlightIdx(idx)}
                className={`p-2 rounded-lg text-left transition-all border text-xs flex items-center gap-2 ${
                  activeSpotlightIdx === idx
                    ? 'bg-red-950/70 border-red-500 text-white'
                    : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="font-black text-amber-400 shrink-0">#{item.rank}</span>
                <span className="truncate font-semibold text-[11px]">{item.post.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
