import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';

export interface ZoomMedia {
  url: string;
  title: string;
  sourceName?: string;
}

interface ImageZoomLightboxProps {
  media: ZoomMedia | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageZoomLightbox: React.FC<ImageZoomLightboxProps> = ({
  media,
  isOpen,
  onClose,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTapRef = useRef<number>(0);

  const [prevMediaUrl, setPrevMediaUrl] = useState<string | null>(null);

  // Synchronize zoom and pan during render when a new media image is loaded
  if (media?.url && media.url !== prevMediaUrl) {
    setPrevMediaUrl(media.url);
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  }

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  // Double tap to toggle zoom between 1x and 2x
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setZoomLevel((prev) => {
        if (prev > 1) {
          setPan({ x: 0, y: 0 });
          return 1;
        }
        return 2;
      });
    }
    lastTapRef.current = now;
  }, []);

  // Touch Drag / Panning
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDoubleTap();
    if (e.touches.length === 1 && zoomLevel > 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...pan };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoomLevel <= 1 || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (!isOpen || !media) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Top Controls Bar */}
      <div 
        className="pt-safe px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 min-w-0 pr-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block truncate">
            {media.sourceName || 'Trinidad Media Graphic'}
          </span>
          <h4 className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
            {media.title}
          </h4>
        </div>

        {/* Zoom Controls & Close */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="hidden sm:flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
            <span>{Math.round(zoomLevel * 100)}%</span>
          </div>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
            aria-label="Zoom in"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 active:scale-95 disabled:opacity-40 transition-all"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            aria-label="Zoom out"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 active:scale-95 disabled:opacity-40 transition-all"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {zoomLevel > 1 && (
            <button
              type="button"
              onClick={handleResetZoom}
              aria-label="Reset zoom"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <a
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 active:scale-95 transition-all"
            title="Download or view full image"
          >
            <Download className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close image viewer"
            className="p-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold active:scale-95 transition-all ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div 
        className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden relative"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={media.url}
          alt={media.title}
          draggable={false}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
            transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.2, 0, 0.2, 1)',
            cursor: zoomLevel > 1 ? 'grab' : 'zoom-in',
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleDoubleTap();
          }}
          className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl transition-all"
        />
      </div>

      {/* Bottom Hint Bar */}
      <div 
        className="pb-safe px-4 py-2 bg-slate-900/80 border-t border-slate-800 text-center text-[11px] text-slate-400 font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        <span>Double-tap to zoom • Pinch / drag to pan • Tap backdrop to dismiss</span>
      </div>
    </div>
  );
};
