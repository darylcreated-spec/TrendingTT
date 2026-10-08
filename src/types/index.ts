export type SourceId = 
  | 'ttt' 
  | 'cnc3' 
  | 'tv6' 
  | 'newsday' 
  | 'express' 
  | 'guardian' 
  | 'tiktok' 
  | 'facebook' 
  | 'instagram';

export type SourceType = 'broadcast' | 'newspaper' | 'social';

export type Category = 
  | 'all' 
  | 'breaking' 
  | 'broadcast' 
  | 'social' 
  | 'crime' 
  | 'politics' 
  | 'culture' 
  | 'sports' 
  | 'business';

export interface SourceMeta {
  id: SourceId;
  name: string;
  type: SourceType;
  color: string;
  badgeBg: string;
  badgeText: string;
  website: string;
  verified: boolean;
}

export interface Post {
  id: string;
  title: string;
  summary: string;
  content?: string;
  sourceId: SourceId;
  sourceName: string;
  sourceType: SourceType;
  author?: string;
  originalUrl: string;
  publishedAt: string;
  category: Category;
  tags: string[];
  trendingScore: number;
  upvotes: number;
  commentsCount: number;
  isBreaking?: boolean;
  media?: {
    type: 'image' | 'video' | 'embed';
    url: string;
    aspectRatio?: 'landscape' | 'portrait' | 'square';
    videoDuration?: string;
  };
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorLocation?: string;
  text: string;
  createdAt: string;
  upvotes: number;
}

export type SortOption = 'trending' | 'latest' | 'discussed';
