import React, { useState } from 'react';
import type { Post } from '../types';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Smartphone 
} from 'lucide-react';

interface ShareModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ post, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !post) return null;

  const shareUrl = window.location.origin ? `${window.location.origin}/#post-${post.id}` : post.originalUrl;
  const shareText = `*${post.title}*\n\nRead on Trending TT (Trinidad & Tobago Live Dashboard):\n${shareUrl}\n\nSource: ${post.sourceName}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${post.title}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleFacebook = () => {
    const encoded = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`, '_blank');
  };

  const handleTwitter = () => {
    const encodedText = encodeURIComponent(`${post.title} via Trending TT`);
    const encodedUrl = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `Trending in Trinidad & Tobago: ${post.title}`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or not supported
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-lg">Share & Repost</h3>
            <p className="text-xs text-slate-400">Distribute across Caribbean socials</p>
          </div>
        </div>

        {/* Post Preview Card */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 mb-5">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-1">
            {post.sourceName}
          </span>
          <p className="text-xs text-slate-200 font-semibold line-clamp-2">
            {post.title}
          </p>
        </div>

        {/* Share Buttons Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {/* WhatsApp Primary */}
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <span>WhatsApp</span>
          </button>

          {/* Facebook */}
          <button
            onClick={handleFacebook}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <span>Facebook</span>
          </button>

          {/* X / Twitter */}
          <button
            onClick={handleTwitter}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm border border-slate-700 transition-all active:scale-95"
          >
            <span>X (Twitter)</span>
          </button>

          {/* Native System Share Sheet */}
          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm border border-slate-700 transition-all active:scale-95"
          >
            <Smartphone className="w-4 h-4 text-red-400" />
            <span>Device Share</span>
          </button>
        </div>

        {/* Copy Link Input */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded-xl">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 px-3 py-1 bg-transparent text-xs text-slate-300 focus:outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
