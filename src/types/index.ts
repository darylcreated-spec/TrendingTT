export type SourceId = 
  | 'ttt' 
  | 'cnc3' 
  | 'tv6' 
  | 'newsday' 
  | 'express' 
  | 'guardian' 
  | 'ian'
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

// Option B: Traffic, Weather & Radar Types
export type TrafficSeverity = 'smooth' | 'moderate' | 'heavy' | 'gridlock' | 'flood' | 'roadwork';

export type HighwayId = 
  | 'ubh' 
  | 'crh' 
  | 'pbr' 
  | 'shh' 
  | 'lady-young' 
  | 'south-trunk';

export interface TrafficSegment {
  id: string;
  highwayId: HighwayId;
  highwayName: string;
  segmentName: string;
  direction: 'Northbound' | 'Southbound' | 'Eastbound' | 'Westbound' | 'Both Directions';
  severity: TrafficSeverity;
  statusText: string;
  delayMinutes: number;
  averageSpeedKmh: number;
  lastUpdated: string;
  advisoryNote?: string;
}

export type TTMSAlertLevel = 'green' | 'yellow' | 'orange' | 'red';

export interface TTMSAdvisory {
  level: TTMSAlertLevel;
  type: string;
  headline: string;
  description: string;
  issuedAt: string;
  validUntil: string;
  authority: string;
  affectedAreas: string[];
}

export interface RiverLevelStatus {
  id: string;
  basin: string;
  station: string;
  percentage: number;
  status: 'Normal' | 'Alert' | 'Bankfull' | 'Overflowing';
  trend: 'rising' | 'steady' | 'falling';
  updatedAt: string;
}

export interface TideEvent {
  time: string;
  type: 'High Tide' | 'Low Tide';
  heightMeters: string;
}

export interface TideData {
  location: string;
  tides: TideEvent[];
  coastalRisk: 'Normal' | 'Moderate' | 'Moderate (Spring Tide)' | 'High Coastal Overwash';
}

export interface WASANotice {
  id: string;
  facility: string;
  title: string;
  reason: string;
  affectedAreas: string[];
  schedule: string;
  status: 'Active Outage' | 'Scheduled Maintenance' | 'Restoration in Progress';
  updatedAt: string;
}

export interface CommunityReport {
  id: string;
  highwayId: HighwayId;
  location: string;
  category: 'traffic' | 'flood' | 'hazard' | 'police' | 'water';
  summary: string;
  reportedTime: string;
  confirmations: number;
  isVerified?: boolean;
}

// Option C: Trinbago Sentiment Poll Types
export interface PollOption {
  id: string;
  label: string;
  description?: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  category: 'culture' | 'infrastructure' | 'national' | 'culinary' | 'economy';
  tagline: string;
  totalVotes: number;
  options: PollOption[];
  featured?: boolean;
  closesAt?: string;
  authoritativeSource?: string;
}

// Option D: Push Notification Types
export interface NotificationSettings {
  enabled: boolean;
  permission: NotificationPermission;
  breakingNews: boolean;
  weatherAlerts: boolean;
  trafficAlerts: boolean;
  dailyPolls: boolean;
}
