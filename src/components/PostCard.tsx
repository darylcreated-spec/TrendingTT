import React from 'react';
import type { Post } from '../types';
import { SOURCES } from '../data/sources';
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  ExternalLink, 
  TrendingUp, 
  Clock,
  Radio,
  Tv,
  Smartphone,
  CheckCircle2
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  isUpvoted: boolean;
  isBookmarked: boolean;
  onToggleUpvote: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
  onOpenComments: (post: Post) => void;
  onShare: (post: Post) => void;
  onWhatsAppShare: (post: Post) => void;
  onMediaClick?: (media: { url: string; title: string; sourceName: string }) => void;
}

const formatRelativeTime = (isoString: string) => {
  const diff = Math.max(0, Date.now() - new Date(isoString).getTime());
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const PostCard: React.FC<PostCardProps> = ({
  post,
  isUpvoted,
  isBookmarked,
  onToggleUpvote,
  onToggleBookmark,
  onOpenComments,
  onShare,
  onWhatsAppShare,
  onMediaClick,
}) => {
  const source = SOURCES[post.sourceId] || {
    name: post.sourceName,
    badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
    badgeText: post.sourceName,
    verified: false,
  };

  const getSourceIcon = () => {
    if (post.sourceType === 'broadcast') return <Tv className="w-3 h-3 mr-1" />;
    if (post.sourceType === 'social') return <Smartphone className="w-3 h-3 mr-1" />;
    return <Radio className="w-3 h-3 mr-1" />;
  };

  return (
    <article className="bg-slate-900/90 rounded-xl border border-slate-800 hover:border-slate-700/80 transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-md hover:shadow-xl group">
      {/* Top Media / Thumbnail with Tap-to-Zoom */}
      {post.media?.url && (
        <div 
          onClick={() => {
            if (onMediaClick && post.media?.url) {
              onMediaClick({
                url: post.media.url,
                title: post.title,
                sourceName: post.sourceName,
              });
            }
          }}
          className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-zoom-in"
          title="Tap to zoom image"
        >
          <img
            src={post.media.url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

          {/* Trending Score Badge in Corner */}
          <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/80 text-xs font-bold flex items-center gap-1 text-red-400 shadow-md">
            <TrendingUp className="w-3 h-3" />
            <span>{post.trendingScore}° Hot</span>
          </div>

          {/* Breaking Banner on Image */}
          {post.isBreaking && (
            <div className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded shadow-lg border border-red-400">
              Breaking Alert
            </div>
          )}
        </div>
      )}

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Source and Timestamp Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${source.badgeBg}`}
            >
              {getSourceIcon()}
              {source.badgeText}
              {source.verified && (
                <CheckCircle2 className="w-3 h-3 ml-1 fill-current opacity-80" />
              )}
            </span>

            {post.author && (
              <span className="text-slate-400 text-xs truncate max-w-[140px]">
                by {post.author}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-500 font-medium shrink-0">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(post.publishedAt)}</span>
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
          <div className="flex flex-wrap gap-1.5 mb-4">
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

        {/* Action Toolbar */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          {/* Left: Upvotes & Comments */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onToggleUpvote(post.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
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
