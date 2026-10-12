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
  mackoScore?: number; // 0-100 calculated virality score
  mackoVotes?: number; // Citizen community Macko votes
  triniReactions?: Record<TriniReactionType, number>;
}

export type TriniReactionType = 'macko' | 'realtalk' | 'deadwidlaugh' | 'lordwhy' | 'watchyuhback';

export interface UserProfile {

  uid: string;
  displayName: string;
  handle?: string;
  email?: string;
  photoURL?: string;
  location: string;
  isVerified?: boolean;
  role?: 'citizen' | 'journalist' | 'official';
  bio?: string;
  joinedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId?: string;
  authorName: string;
  authorPhotoURL?: string;
  authorLocation?: string;
  authorVerified?: boolean;
  text: string;
  createdAt: string;
  upvotes: number;
  reactions?: Record<string, number>;
  parentId?: string; // For nested replies
}

export type ReactionType = 'like' | 'hot' | 'alert' | 'laugh' | 'flag';

export type SortOption = 'trending' | 'latest' | 'discussed';

export type TimeFilterOption = 'all-time' | '24h' | '48h' | '7d';

export type PostFreshness = 'live' | 'recent' | 'archived';

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

// Maritime Transit: Tobago Sea Bridge Ferries & POS-San Fernando Water Taxi
export type MaritimeServiceType = 'tobago-ferry' | 'water-taxi';

export interface MaritimeSailing {
  id: string;
  serviceType: MaritimeServiceType;
  vesselName: string;
  route: string; // e.g. "Port of Spain ➔ Scarborough"
  origin: string;
  destination: string;
  departureTime: string;
  estimatedArrival: string;
  status: 'On Schedule' | 'Boarding' | 'Sailing' | 'Delayed' | 'Cancelled (Rough Seas)' | 'Arrived';
  delayReason?: string;
  passengerCapacityPercent: number;
  vehicleCapacityPercent?: number;
  terminalNotice?: string;
  ticketBookingUrl: string;
  hotline: string;
  lastUpdated: string;
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

// Utility Provider Types (T&TEC, WASA, Amplia, Flow, Digicel, bmobile)
export type ActiveView = 'feed' | 'radar' | 'utilities' | 'polls';

export type UtilityProviderId = 'ttec' | 'wasa' | 'amplia' | 'flow' | 'digicel' | 'bmobile';
export type UtilityCategory = 'electricity' | 'water' | 'telecom' | 'cable_tv';
export type DisruptionStatus = 'active' | 'scheduled' | 'restoring' | 'resolved';
export type TrinidadRegion = 'North' | 'Central' | 'South' | 'East' | 'Tobago';

export interface UtilityDisruption {
  id: string;
  providerId: UtilityProviderId;
  providerName: string;
  category: UtilityCategory;
  title: string;
  reason: string;
  affectedAreas: string[];
  region: TrinidadRegion;
  scheduledTime: string;
  estimatedRestoration?: string;
  status: DisruptionStatus;
  updatedAt: string;
  hotline: string;
  officialUrl: string;
  bulletinNumber?: string;
}

export interface WaterSchedule {
  id: string;
  area: string;
  boroughOrTown: string;
  region: TrinidadRegion;
  treatmentPlant: string;
  scheduleDays: string;
  supplyHours: string;
  pressureStatus: 'Normal Pressure' | 'Low Pressure' | 'Off-Supply / Rotational' | 'Truck-Borne Priority';
  truckBorneContact: string;
  notes?: string;
}

export interface TelecomStatus {
  id: string;
  providerId: 'amplia' | 'flow' | 'digicel' | 'bmobile';
  providerName: string;
  serviceType: 'Fiber Internet' | 'Cable TV' | 'Mobile LTE/5G' | 'Unified Network';
  headline: string;
  affectedAreas: string[];
  region: TrinidadRegion | 'Nationwide';
  status: 'operational' | 'maintenance' | 'degraded';
  supportHotline: string;
  whatsappSupport?: string;
  officialUrl: string;
  updatedAt: string;
}

export interface UtilityReport {
  id: string;
  providerId: UtilityProviderId;
  category: UtilityCategory;
  location: string;
  summary: string;
  reportedTime: string;
  confirmations: number;
  status?: 'unverified' | 'investigating' | 'confirmed';
}

