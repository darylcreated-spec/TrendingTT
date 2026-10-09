import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CarouselTabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

interface CarouselTabsProps<T extends string = string> {
  items: CarouselTabItem<T>[];
  activeId: T;
  onSelect: (id: T) => void;
  ariaLabel?: string;
  className?: string;
  showArrows?: boolean;
}

export function CarouselTabs<T extends string = string>({
  items,
  activeId,
  onSelect,
  ariaLabel = 'Navigation Tabs',
  className = '',
  showArrows = false,
}: CarouselTabsProps<T>): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll boundary to render visual ambient fade indicators
  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, items]);

  // Smoothly center the active tab into the mobile viewport
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeId]);

  const handleScrollBy = (offset: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className={`relative flex items-center group/carousel ${className}`}>
      {/* Left scroll button (optional desktop convenience) */}
      {showArrows && canScrollLeft && (
        <button
          type="button"
          onClick={() => handleScrollBy(-180)}
          aria-label="Scroll left"
          className="hidden sm:flex absolute left-0 z-10 p-1 rounded-full bg-slate-900/95 border border-slate-700 text-slate-300 hover:text-white shadow-lg active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Left Ambient Fade Mask */}
      {canScrollLeft && (
        <div 
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10 transition-opacity"
        />
      )}

      {/* Scrollable Carousel Track */}
      <div
        ref={containerRef}
        role="tablist"
        aria-label={ariaLabel}
        className="flex items-center gap-1.5 overflow-x-auto momentum-scroll no-scrollbar scroll-smooth snap-x snap-mandatory py-1 px-1 w-full"
      >
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={isActive ? activeTabRef : null}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`snap-start shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 border active:scale-95 select-none ${
                isActive
                  ? 'bg-red-600 text-white border-red-500 shadow-sm shadow-red-950/50 font-bold'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/60 hover:text-white'
              }`}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
              {item.badge && <span className="shrink-0">{item.badge}</span>}
            </button>
          );
        })}
      </div>

      {/* Right Ambient Fade Mask */}
      {canScrollRight && (
        <div 
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent z-10 transition-opacity"
        />
      )}

      {/* Right scroll button (optional desktop convenience) */}
      {showArrows && canScrollRight && (
        <button
          type="button"
          onClick={() => handleScrollBy(180)}
          aria-label="Scroll right"
          className="hidden sm:flex absolute right-0 z-10 p-1 rounded-full bg-slate-900/95 border border-slate-700 text-slate-300 hover:text-white shadow-lg active:scale-95 transition-transform"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
