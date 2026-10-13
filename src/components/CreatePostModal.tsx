import React, { useState, useEffect } from 'react';
import type { Post, Category, SourceId } from '../types';
import { Storage } from '../services/storage';
import { formatPostDateTime } from '../utils/dateUtils';
import { 
  X, 
  Send, 
  PlusCircle, 
  Clock, 
  Tag, 
  AlertTriangle,
  Trophy,
  Car,
  CloudRain,
  Radio,
  Camera
} from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
  onShowToast: (msg: string) => void;
}

const CATEGORY_OPTIONS: { id: Category; label: string; icon: React.ReactNode; defaultTags: string[] }[] = [
  { id: 'breaking', label: 'Breaking News', icon: <AlertTriangle className="w-4 h-4 text-red-500" />, defaultTags: ['Breaking TT', 'National Alert'] },
  { id: 'sports', label: 'Sports & Cricket', icon: <Trophy className="w-4 h-4 text-amber-400" />, defaultTags: ['Trinbago Sports', 'Cricket', 'Football'] },
  { id: 'broadcast', label: 'Traffic & Highway Update', icon: <Car className="w-4 h-4 text-blue-400" />, defaultTags: ['Traffic Alert', 'Highway Dispatch', 'Commute TT'] },
  { id: 'crime', label: 'Weather & Flood Advisory', icon: <CloudRain className="w-4 h-4 text-cyan-400" />, defaultTags: ['Weather Alert', 'TTMS Advisory', 'Flood Watch'] },
  { id: 'politics', label: 'Parliament & THA Politics', icon: <Radio className="w-4 h-4 text-purple-400" />, defaultTags: ['Parliament TT', 'THA', 'National Policy'] },
  { id: 'culture', label: 'Culture & Entertainment', icon: <Tag className="w-4 h-4 text-emerald-400" />, defaultTags: ['Trini Culture', 'Carnival', 'Entertainment'] },
  { id: 'social', label: 'Social Buzz & Viral', icon: <Tag className="w-4 h-4 text-pink-400" />, defaultTags: ['Trini Social', '#TriniTikTok', 'Viral TT'] },
];

const DEFAULT_IMAGE_MAP: Record<Category, string> = {
  all: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
  breaking: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
  sports: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
  broadcast: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
  social: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  crime: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1200&q=80',
  politics: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
  culture: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80',
  business: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
};

const TT_LOCATIONS = [
  'Port of Spain',
  'San Fernando',
  'Chaguanas',
  'Arima',
  'Point Fortin',
  'Couva',
  'Valsayn / Curepe',
  'Diego Martin',
  'Tunapuna',
  'Sangre Grande',
  'Scarborough, Tobago',
  'Crown Point, Tobago',
  'Mayaro / Guayaguayare',
  'Cedros'
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
  onShowToast
}) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('breaking');
  const [sourceName, setSourceName] = useState('Citizen Dispatch TT');
  const [author, setAuthor] = useState('');
  const [location, setLocation] = useState(TT_LOCATIONS[0]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(() => formatPostDateTime(new Date().toISOString()));

  // Update live preview timestamp
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCurrentDateTime(formatPostDateTime(new Date().toISOString()));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      onShowToast('Please provide a title for the post');
      return;
    }
    if (!summary.trim()) {
      onShowToast('Please provide a summary or description');
      return;
    }

    setIsSubmitting(true);

    const nowIso = new Date().toISOString();
    const categoryConfig = CATEGORY_OPTIONS.find(c => c.id === selectedCategory);
    const tags = [
      ...(categoryConfig?.defaultTags || ['Trending TT']),
      location,
      'Community Dispatch'
    ];

    const sourceId: SourceId = selectedCategory === 'social' ? 'tiktok' : 'tv6';
    const finalImageUrl = customImageUrl.trim() || DEFAULT_IMAGE_MAP[selectedCategory];

    const newPost: Post = {
      id: `post-user-${Date.now()}`,
      title: title.trim(),
      summary: summary.trim(),
      content: `${summary.trim()}\n\nReported from ${location} by ${author.trim() || 'Trinbago Citizen'}.`,
      sourceId,
      sourceName: sourceName.trim() || 'Citizen Dispatch TT',
      sourceType: selectedCategory === 'social' ? 'social' : 'broadcast',
      author: author.trim() ? `${author.trim()} (${location})` : `Trinbago Citizen (${location})`,
      originalUrl: typeof window !== 'undefined' ? window.location.href : 'https://trendingtt.com',
      publishedAt: nowIso,
      category: selectedCategory,
      tags,
      trendingScore: selectedCategory === 'breaking' ? 99 : 91,
      upvotes: 1,
      commentsCount: 0,
      isBreaking: selectedCategory === 'breaking',
      media: {
        type: 'image',
        url: finalImageUrl,
        aspectRatio: 'landscape'
      }
    };

    // Save to persistent localStorage
    Storage.saveCustomPost(newPost);

    // If Traffic or Weather advisory, also add a corresponding Community Report
    if (selectedCategory === 'broadcast' || selectedCategory === 'crime' || selectedCategory === 'breaking') {
      const highwayMatch = location.toLowerCase().includes('curepe') || location.toLowerCase().includes('valsayn')
        ? 'crh'
        : location.toLowerCase().includes('chaguanas') || location.toLowerCase().includes('couva')
        ? 'ubh'
        : 'crh';

      Storage.addCommunityReport({
        highwayId: highwayMatch,
        location,
        category: selectedCategory === 'crime' ? 'flood' : 'traffic',
        summary: `${title.trim()}: ${summary.trim().slice(0, 100)}`
      });
    }

    onPostCreated(newPost);
    setIsSubmitting(false);
    onShowToast(`Update posted with exact timestamp: ${formatPostDateTime(nowIso)}`);
    onClose();

    // Reset form
    setTitle('');
    setSummary('');
    setAuthor('');
    setCustomImageUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div 
        role="dialog"
        aria-labelledby="create-post-title"
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/20 text-red-500 rounded-xl border border-red-500/30">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="create-post-title" className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Post Live Update</span>
                <span className="text-[10px] bg-red-950 text-red-400 font-extrabold uppercase px-2 py-0.5 rounded border border-red-800">
                  Instant Dispatch
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Publish breaking news, sports fixtures, weather alerts, or highway traffic conditions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Timestamp Banner */}
        <div className="bg-slate-950 px-5 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Post Date & Time when made:</span>
          </div>
          <span className="text-emerald-400 font-mono font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800/80">
            📅 {currentDateTime}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Select Update Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-slate-800 border-red-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {cat.icon}
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Headline / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Soca Warriors score decisive opening goal in second half"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Summary / Body */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Bulletin Details & Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Provide key information, match stats, highway delay minutes, or weather advisories..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500 resize-none leading-relaxed"
            />
          </div>

          {/* Location and Source Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Location in Trinidad & Tobago
              </label>
              <div className="relative">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                >
                  {TT_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Source / Media Outlet Tag
              </label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="e.g. Citizen Dispatch TT, TV6 Sports, Express"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Author Name & Optional Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Reporter / Your Name (Optional)
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. D. Mohammed"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Attach Photo (Upload or URL)</span>
                <span className="text-[10px] text-emerald-400 font-normal">100% Free</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
                <label className="cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 active:scale-95 transition-all">
                  <Camera className="w-3.5 h-3.5 text-red-400" />
                  <span>Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setCustomImageUrl(event.target.result as string);
                            onShowToast('Photo attached from device camera/gallery!');
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Saves to local device storage and live feed
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Publishing...' : 'Publish to Live Feed'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
