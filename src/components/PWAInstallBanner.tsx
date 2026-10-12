import React, { useState } from 'react';
import { Download, X, Smartphone, PlusSquare, Share } from 'lucide-react';

interface PWAInstallBannerProps {
  onInstall: () => void;
  canInstall: boolean;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onInstall, canInstall }) => {
  const [dismissed, setDismissed] = useState(false);
  const [isIOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    return isIosDevice && !isStandalone;
  });
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 border-b border-red-900/60 text-slate-100 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden text-white flex items-center justify-center shrink-0 shadow-md border border-red-500/80 bg-[#CE1126]">
            {/* National Flag Diagonal Band */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.95) 40%, rgba(255,255,255,0.95) 46%, #000000 46%, #000000 56%, rgba(255,255,255,0.95) 56%, rgba(255,255,255,0.95) 62%, transparent 62%)'
              }}
            />
            {/* Floating Smoked Lens with Trending Arrow */}
            <div className="relative z-10 w-7 h-7 rounded-full bg-slate-900/90 border border-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.8)] flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M4 17l6-6 4 4 7-9" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 6h7v7" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="21" cy="6" r="1.5" fill="#EF4444" />
              </svg>
            </div>
          </div>
          <div>
            <p className="font-bold text-slate-100">
              Install Trending.TT on your phone for instant breaking alerts
            </p>
            <p className="text-slate-400 text-[11px]">
              Works offline, fast mobile experience, zero app store download needed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canInstall ? (
            <button
              onClick={onInstall}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-md active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          ) : isIOS ? (
            <button
              onClick={() => setShowIOSInstructions(!showIOSInstructions)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition-all"
            >
              <Smartphone className="w-3.5 h-3.5 text-red-400" />
              <span>How to Install on iPhone</span>
            </button>
          ) : (
            <button
              onClick={() => alert('To install: open browser settings (three dots menu) and tap "Install app" or "Add to Home screen".')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition-all"
            >
              <Smartphone className="w-3.5 h-3.5 text-red-400" />
              <span>Install to Home Screen</span>
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIOSInstructions && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-center gap-4 flex-wrap">
          <span className="flex items-center gap-1">
            1. Tap the Safari Share button <Share className="w-3.5 h-3.5 text-blue-400 inline" /> at the bottom
          </span>
          <span className="flex items-center gap-1">
            2. Scroll down & select <PlusSquare className="w-3.5 h-3.5 text-red-400 inline" /> <strong>"Add to Home Screen"</strong>
          </span>
          <span>3. Enjoy fullscreen Trending TT on iOS!</span>
        </div>
      )}
    </div>
  );
};
