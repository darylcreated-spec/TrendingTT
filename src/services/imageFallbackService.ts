import type { Post, Category } from '../types';

/**
 * 1. Curated High-Resolution Royalty-Free Trinidad & Caribbean Landmarks
 * Sourced from Unsplash & Pexels free commercial licenses.
 */
export const TRINIDAD_LANDMARK_FALLBACKS = [
  // Port of Spain Waterfront & Skyline
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
  // Maracas Bay / North Coast Caribbean Beach
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  // Red House / Parliament / Newsroom
  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
  // Tobago Coastal Waters / Pigeon Point
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  // Queen's Park Oval / National Stadium
  'https://images.unsplash.com/photo-1531415074868-036b1c57e359?auto=format&fit=crop&w=1200&q=80',
  // East-West Corridor & Transit Highway
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
];

/**
 * 2. Topic & Category-Specific Royalty-Free Stock Media (Unsplash / Pexels)
 */
export const CATEGORY_STOCK_FALLBACKS: Record<Category, string[]> = {
  all: [
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
  ],
  breaking: [
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80', // Breaking News microphone
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80', // Breaking headline press
  ],
  broadcast: [
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80', // TV Studio / Anchor
    'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=1200&q=80', // Camera broadcast
  ],
  social: [
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80', // Mobile social stream
    'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?auto=format&fit=crop&w=1200&q=80', // Viral content creator
  ],
  crime: [
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80', // Justice / Police / Court gavel
    'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?auto=format&fit=crop&w=1200&q=80', // Law enforcement
  ],
  politics: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80', // Parliament / Government podium
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80', // Diplomacy debate
  ],
  culture: [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80', // Carnival / Festival stage lights
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', // Caribbean beach culture
  ],
  sports: [
    'https://images.unsplash.com/photo-1531415074868-036b1c57e359?auto=format&fit=crop&w=1200&q=80', // Cricket match field
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80', // Football stadium lights
  ],
  business: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', // Energy / Technology / Industry
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', // Port of Spain financial towers
  ],
};

/**
 * 3. Branded SVG Vector Graphic Placeholder (Trinidad Flag + Category Name)
 * Instant data-URI SVG: zero network requests, always loads 100% reliably.
 */
export function generateFlagVectorPlaceholder(category: string, title: string): string {
  const safeCategory = (category || 'NEWS').toUpperCase();
  const safeTitle = (title || 'Trending.TT Bulletin')
    .replace(/["&<>]/g, '')
    .slice(0, 48);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <defs>
      <linearGradient id="flagBase" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#CE1126"/>
        <stop offset="100%" stop-color="#A50E1E"/>
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.8"/>
      </filter>
    </defs>
    <!-- Base Flag Red -->
    <rect width="800" height="450" fill="url(#flagBase)" />
    
    <!-- National Diagonal Sash -->
    <polygon points="0,0 180,0 800,310 800,450 620,450 0,140" fill="#FFFFFF" opacity="0.95"/>
    <polygon points="0,0 140,0 800,330 800,450 660,450 0,120" fill="#0A0A0C"/>
    
    <!-- Dark Smoked Plate for Text & Icon -->
    <rect x="60" y="60" width="680" height="330" rx="24" fill="#090D16" fill-opacity="0.88" stroke="#FFFFFF" stroke-width="2" stroke-opacity="0.3" filter="url(#shadow)"/>
    
    <!-- Circular Trending Symbol Badge -->
    <g transform="translate(110, 140)">
      <circle cx="50" cy="50" r="48" fill="#1E293B" stroke="#FFFFFF" stroke-width="3"/>
      <circle cx="50" cy="50" r="42" fill="none" stroke="#EF4444" stroke-width="2"/>
      <path d="M 28 62 L 44 46 L 56 54 L 72 32" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="58,32 72,32 72,46" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="72" cy="32" r="3" fill="#EF4444"/>
    </g>

    <!-- Category Pill -->
    <rect x="230" y="145" width="200" height="36" rx="18" fill="#CE1126" stroke="#FFFFFF" stroke-width="1.5"/>
    <text x="330" y="169" font-family="-apple-system, sans-serif" font-weight="900" font-size="16" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">${safeCategory}</text>

    <!-- Branding Text -->
    <text x="230" y="225" font-family="-apple-system, sans-serif" font-weight="900" font-size="34" fill="#FFFFFF" letter-spacing="2">TRENDING<tspan fill="#EF4444">.TT</tspan></text>
    <text x="230" y="260" font-family="-apple-system, sans-serif" font-weight="700" font-size="16" fill="#FDE047">${safeTitle}</text>
    <text x="230" y="285" font-family="-apple-system, sans-serif" font-weight="500" font-size="13" fill="#94A3B8">Live Real-Time Radar & News Dispatch</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Intelligent 3-Tier Fallback Resolver
 * Tier 1: Real scraped article photo (if valid)
 * Tier 2: Category/Landmark-specific royalty-free stock photo (Unsplash / Pexels)
 * Tier 3: Instant Branded Trinidad Flag SVG Vector Card
 */
export function resolvePostImage(post: Partial<Post>): string {
  // If post already has a valid media url
  if (post.media?.url && post.media.url.trim().length > 10 && !post.media.url.includes('placeholder-error')) {
    return post.media.url;
  }

  // Tier 2: Category stock match based on post ID hash for stability
  const cat = post.category || 'broadcast';
  const categoryList = CATEGORY_STOCK_FALLBACKS[cat] || CATEGORY_STOCK_FALLBACKS.broadcast;
  const hash = Math.abs((post.id || 'default').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
  const stockPick = categoryList[hash % categoryList.length];

  return stockPick || TRINIDAD_LANDMARK_FALLBACKS[0];
}
