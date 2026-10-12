import React from 'react';
import type { Post } from '../types';
import { SOURCES } from '../data/sources';
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  ExternalLink, 
  Clock,
  Radio,
  Tv,
  Smartphone,
  CheckCircle2,
  User,
  Volume2
} from 'lucide-react';

import { AudioNarrator, type AudioPlayerState } from '../services/audioNarrator';
import { MackoMeter } from './MackoMeter';
import { TriniReactionBar } from './TriniReactionBar';
import { resolvePostImage, generateFlagVectorPlaceholder } from '../services/imageFallbackService';
import type { TriniReactionType } from '../types';

interface PostCardProps {
  post: Post;
  isUpvoted: boolean;
  isBookmarked: boolean;
  hasMackoVoted?: boolean;
  userReaction?: TriniReactionType | null;
  onToggleUpvote: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
  onBoostMacko?: (postId: string) => void;
  onSelectReaction?: (postId: string, reaction: TriniReactionType) => void;
  onOpenComments: (post: Post) => void;
  onShare: (post: Post) => void;
  onWhatsAppShare: (post: Post) => void;
  onMediaClick?: (media: { url: string; title: string; sourceName: string }) => void;
}


import { formatPostDateTime, formatRelativeTime } from '../utils/dateUtils';

export const PostCard: React.FC<PostCardProps> = ({
  post,
  isUpvoted,
  isBookmarked,
  hasMackoVoted = false,
  userReaction = null,
  onToggleUpvote,
  onToggleBookmark,
  onBoostMacko,
  onSelectReaction,
  onOpenComments,
  onShare,
  onWhatsAppShare,
  onMediaClick,
}) => {
  const [showHeartBurst, setShowHeartBurst] = React.useState(false);
  const lastTapRef = React.useRef<number>(0);

  const source = SOURCES[post.sourceId] || {
    name: post.sourceName,
    badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
    badgeText: post.sourceName,
    verified: false,
  };

  const [audioState, setAudioState] = React.useState<AudioPlayerState>(() => AudioNarrator.getState());

  React.useEffect(() => {
    return AudioNarrator.subscribe((state) => {
      setAudioState(state);
    });
  }, []);

  const isCurrentPlaying = audioState.currentPostId === post.id && audioState.isPlaying;

  const handleListen = () => {
    AudioNarrator.speakStory({
      id: post.id,
      title: post.title,
      summary: post.summary,
      sourceName: post.sourceName,
      author: post.author
    });
  };

  const getSourceIcon = () => {
    if (post.sourceType === 'broadcast') return <Tv className="w-3 h-3 mr-1" />;
    if (post.sourceType === 'social') return <Smartphone className="w-3 h-3 mr-1" />;
    return <Radio className="w-3 h-3 mr-1" />;
  };

  return (
    <article className="bg-slate-900/90 rounded-xl border border-slate-800 hover:border-slate-700/80 transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-md hover:shadow-xl group">
      {/* Top Media / Thumbnail with Instagram-style Double-Tap Like & Tap-to-Zoom */}
      {post.media?.url && (
        <div 
          onClick={() => {
            const now = Date.now();
            const DOUBLE_TAP_DELAY = 300;
            if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
              // Double tap registered (Instagram style)
              if (!isUpvoted) {
                onToggleUpvote(post.id);
              }
              setShowHeartBurst(true);
              if ('vibrate' in navigator) {
                try { navigator.vibrate(35); } catch { /* ignore */ }
              }
              setTimeout(() => setShowHeartBurst(false), 900);
            } else {
              if (onMediaClick && post.media?.url) {
                onMediaClick({
                  url: post.media.url,
                  title: post.title,
                  sourceName: post.sourceName,
                });
              }
            }
            lastTapRef.current = now;
          }}
          className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer select-none"
          title="Double tap to like / Tap to zoom"
        >
          <img
            src={resolvePostImage(post)}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              // 3-Tier fallback on broken image link
              const target = e.currentTarget;
              const vectorSvg = generateFlagVectorPlaceholder(post.category, post.title);
              if (target.src !== vectorSvg) {
                target.src = vectorSvg;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

          {/* Bursting Trini Heart Animation on Double-Tap */}
          {showHeartBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-in zoom-in-50 fade-in duration-200">
              <span className="text-6xl sm:text-7xl filter drop-shadow-[0_0_20px_rgba(239,68,68,0.9)] animate-bounce">
                🔥
              </span>
            </div>
          )}

          {/* D Macko Meter Badge in Top-Right Corner */}
          <div className="absolute top-3 right-3 z-10">
            <MackoMeter 
              score={post.mackoScore ?? post.trendingScore} 
              compact 
            />
          </div>

          {/* Breaking Banner on Image */}
          {post.isBreaking && (
            <div className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded shadow-lg border border-red-400 z-10">
              Breaking Alert
            </div>
          )}
        </div>
      )}


      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Row 1: Dedicated Originator Credit & Outlet Badge */}
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/60 text-xs">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border shrink-0 ${source.badgeBg}`}
            >
              {getSourceIcon()}
              {source.badgeText}
              {source.verified && (
                <CheckCircle2 className="w-3 h-3 ml-1 fill-current opacity-80" />
              )}
            </span>

            <div className="flex items-center gap-1 text-slate-300 font-semibold text-xs truncate">
              <User className="w-3 h-3 text-red-400 shrink-0" />
              <span className="text-slate-400 font-normal">Credit:</span>
              <span className="text-slate-200 truncate">{post.author || post.sourceName}</span>
            </div>
          </div>

          <a
            href={post.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 shrink-0 bg-red-950/40 px-2 py-0.5 rounded border border-red-900/50"
            title={`View original post on ${post.sourceName}`}
          >
            <span>Original Story</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Row 2: High-Visibility Dedicated Date & Time Badge */}
        <div className="flex items-center justify-between gap-2 mb-3 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
          <div 
            className="flex items-center gap-2 text-xs font-semibold text-slate-200"
            title={`Exact post date & time when made: ${formatPostDateTime(post.publishedAt)}`}
          >
            <Clock className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="text-slate-400 font-normal text-[11px]">Published:</span>
            <span className="text-amber-300 font-bold">{formatPostDateTime(post.publishedAt)}</span>
          </div>

          {/* Freshness Status Pill */}
          <div className="flex items-center gap-1.5 shrink-0">
            {(() => {
              const diffHours = (Date.now() - new Date(post.publishedAt).getTime()) / (1000 * 60 * 60);
              if (diffHours <= 12) {
                return (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live
                  </span>
                );
              }
              if (diffHours <= 48) {
                return (
                  <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">
                    Recent
                  </span>
                );
              }
              return (
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                  Archive
                </span>
              );
            })()}
            <span className="text-[11px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800/80">
              {formatRelativeTime(post.publishedAt)}
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-red-400 transition-colors leading-snug mb-2 font-sans">
          <a
            href={post.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline focus:outline-none focus:underline"
          >
            {post.title}
          </a>
        </h2>

        {/* Summary */}
        <p className="text-slate-300 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4 flex-1 font-serif">
          {post.summary}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Feature: The Signature "D Macko Meter" Card */}
        <div className="mb-3">
          <MackoMeter
            score={post.mackoScore ?? post.trendingScore}
            votesCount={post.mackoVotes ?? 0}
            hasVoted={hasMackoVoted}
            onBoostMacko={onBoostMacko ? () => onBoostMacko(post.id) : undefined}
          />
        </div>

        {/* Feature: Trini Reaction Bar Strip */}
        {onSelectReaction && (
          <div className="mb-3 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Trini Reactions
              </span>
            </div>
            <TriniReactionBar
              currentReaction={userReaction}
              onSelectReaction={(type) => onSelectReaction(post.id, type)}
              reactionsCounts={post.triniReactions}
            />
          </div>
        )}

        {/* Action Toolbar */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          {/* Left: Upvotes & Comments */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onToggleUpvote(post.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
                isUpvoted
                  ? 'bg-red-600 text-white border-red-500 shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/70 hover:text-white'
              }`}
              title="Upvote story"
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-current' : ''}`} />
              <span>{post.upvotes + (isUpvoted ? 1 : 0)}</span>
            </button>

            <button
              onClick={() => onOpenComments(post)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/70 hover:text-white transition-colors"
              title="View and post comments"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span>{post.commentsCount}</span>
            </button>

            {/* Commuter Listen Mode TTS */}
            <button
              onClick={handleListen}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isCurrentPlaying
                  ? 'bg-red-600 text-white border-red-500 animate-pulse'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/70 hover:text-white'
              }`}
              title={isCurrentPlaying ? 'Pause narration' : 'Listen to story summary (Commuter Mode)'}
            >
              {isCurrentPlaying ? (
                <Volume2 className="w-3.5 h-3.5 text-white" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="hidden sm:inline">{isCurrentPlaying ? 'Playing' : 'Listen'}</span>
            </button>
          </div>


          {/* Right: WhatsApp Share, Share Drawer, Bookmark, Source Link */}
          <div className="flex items-center gap-1">
            {/* Quick WhatsApp Share Button */}
            <button
              onClick={() => onWhatsAppShare(post)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500 shadow-sm active:scale-95 transition-all"
              title="Share instantly to WhatsApp"
            >
              <span>WhatsApp</span>
            </button>

            {/* General Share */}
            <button
              onClick={() => onShare(post)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/70 hover:text-white transition-colors"
              title="Share across social media"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Bookmark */}
            <button
              onClick={() => onToggleBookmark(post.id)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isBookmarked
                  ? 'bg-amber-600 text-white border-amber-500'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 border-slate-700/70 hover:text-white'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Direct Link to Outlet */}
            <a
              href={post.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 border border-slate-700/70 hover:text-white transition-colors"
              title={`Read full coverage on ${post.sourceName}`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};
