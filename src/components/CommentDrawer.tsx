import React, { useState } from 'react';
import type { Post, Comment } from '../types';
import { Storage } from '../services/storage';
import { X, Send, ThumbsUp, MessageSquare, MapPin, User } from 'lucide-react';

interface CommentDrawerProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded: (postId: string) => void;
}

const TT_LOCATIONS = [
  'Port of Spain',
  'San Fernando',
  'Chaguanas',
  'Arima',
  'Point Fortin',
  'Couva',
  'Scarborough, Tobago',
  'Tunapuna',
  'Diego Martin',
  'Sangre Grande',
  'Cedros / Icacos',
  'Trinidad Diaspora (Abroad)',
];

import { formatPostDateTime, formatRelativeTime } from '../utils/dateUtils';

import { FirebaseSocialService, isFirebaseConfigured } from '../services/firebase';

interface CommentDrawerContentProps {
  post: Post;
  onClose: () => void;
  onCommentAdded: (postId: string) => void;
}

const CommentDrawerContent: React.FC<CommentDrawerContentProps> = ({
  post,
  onClose,
  onCommentAdded,
}) => {
  const [userProfile] = useState(() => Storage.getUserProfile());
  const [comments, setComments] = useState<Comment[]>(() => Storage.getComments(post.id));
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState(() => userProfile.displayName || '');
  const [authorLocation, setAuthorLocation] = useState(() => userProfile.location || TT_LOCATIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Subscribe to live Firestore comments if Firebase is configured
  React.useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = FirebaseSocialService.subscribeToComments(post.id, (liveComments) => {
      if (liveComments && liveComments.length > 0) {
        setComments(liveComments);
        setIsLiveConnected(true);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [post.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    const name = authorName.trim() || userProfile.displayName || 'Trinbago Citizen';
    const loc = authorLocation || userProfile.location || 'Port of Spain';

    // 1. Try Live Firebase Firestore (Free Tier Cloud Sync)
    if (isFirebaseConfigured) {
      const liveAdded = await FirebaseSocialService.addComment({
        postId: post.id,
        text: commentText.trim(),
        authorName: name,
        authorLocation: loc,
        authorId: userProfile.uid,
        authorPhotoURL: userProfile.photoURL,
        authorVerified: userProfile.isVerified
      });

      if (liveAdded) {
        setComments((prev) => [liveAdded, ...prev]);
      }
    }

    // 2. Always persist locally for offline resilience
    const newComment = Storage.addComment(post.id, commentText.trim(), name, loc);
    if (!isFirebaseConfigured) {
      setComments((prev) => [newComment, ...prev]);
    }

    setCommentText('');
    setIsSubmitting(false);
    onCommentAdded(post.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end transition-opacity">
      <div 
        className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-slate-100 text-base">
              Community Discussion ({comments.length})
            </h3>
            {isFirebaseConfigured ? (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                isLiveConnected 
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
                  : 'bg-amber-950 text-amber-400 border-amber-800'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isLiveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                <span>{isLiveConnected ? 'Live Cloud Sync' : 'Connecting Cloud...'}</span>
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Local + P2P
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Context Bar */}
        <div className="p-4 bg-slate-900 border-b border-slate-800/80">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block">
              {post.sourceName}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              📅 {formatPostDateTime(post.publishedAt)}
            </span>
          </div>
          <p className="text-xs text-slate-300 font-semibold line-clamp-2">
            {post.title}
          </p>
        </div>

        {/* Comments Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {comments.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-600 opacity-60" />
              <p className="text-sm font-medium">No comments yet.</p>
              <p className="text-xs text-slate-600 mt-1">Be the first in Trinidad & Tobago to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-200">
                    <User className="w-3.5 h-3.5 text-red-500" />
                    <span>{comment.authorName}</span>
                    {comment.authorLocation && (
                      <span className="text-[11px] text-slate-400 font-normal flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {comment.authorLocation}
                      </span>
                    )}
                  </div>
                  <span 
                    className="text-[11px] text-slate-400 font-medium" 
                    title={`Posted on ${formatPostDateTime(comment.createdAt)}`}
                  >
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {comment.text}
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                  <button className="flex items-center gap-1 hover:text-red-400 transition-colors">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{comment.upvotes || 1}</span>
                  </button>
                  <button className="hover:text-slate-200 transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Input Form */}
        <form onSubmit={handleSubmit} className="p-4 pb-safe bg-slate-950 border-t border-slate-800 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <input
              type="text"
              placeholder="Your Name (e.g. Kern, Asha)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
            <select
              value={authorLocation}
              onChange={(e) => setAuthorLocation(e.target.value)}
              className="px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-red-500"
            >
              {TT_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Trini Slang Reaction Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              '🔥 Real talk!',
              '👀 Hear dat nah!',
              '🤣 Dead wid laugh!',
              '🤦‍♂️ Ent boy?!',
              '🚨 Watch yuh back!'
            ].map((slang) => (
              <button
                key={slang}
                type="button"
                onClick={() => setCommentText((prev) => (prev ? `${prev} ${slang}` : slang))}
                className="px-2 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 border border-slate-800 hover:border-slate-700 shrink-0 transition-all active:scale-95"
              >
                {slang}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <textarea
              rows={2}
              placeholder="Join the TT conversation..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-red-500 font-sans"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export const CommentDrawer: React.FC<CommentDrawerProps> = ({
  post,
  isOpen,
  onClose,
  onCommentAdded,
}) => {
  if (!isOpen || !post) return null;
  return (
    <CommentDrawerContent
      key={post.id}
      post={post}
      onClose={onClose}
      onCommentAdded={onCommentAdded}
    />
  );
};

