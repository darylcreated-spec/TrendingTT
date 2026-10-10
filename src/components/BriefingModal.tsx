import React, { useState, useEffect } from 'react';
import type { Post } from '../types';
import { 
  BriefingEngine, 
  type IntelligenceBriefing 
} from '../services/briefingEngine';
import { 
  X, 
  Layers, 
  Send, 
  Copy, 
  Check, 
  FileText, 
  Key, 
  Zap, 
  Globe
} from 'lucide-react';

interface BriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  onPublishPost: (post: Post) => void;
  onCrossPost: (post: Post) => void;
  onShowToast: (msg: string) => void;
}

export const BriefingModal: React.FC<BriefingModalProps> = ({
  isOpen,
  onClose,
  posts,
  onPublishPost,
  onCrossPost,
  onShowToast
}) => {
  const [briefings, setBriefings] = useState<IntelligenceBriefing[]>([]);
  const [activeTab, setActiveTab] = useState<'briefs' | 'importer' | 'settings'>('briefs');
  const [selectedBriefing, setSelectedBriefing] = useState<IntelligenceBriefing | null>(null);
  
  // Custom NotebookLM note paste
  const [pastedText, setPastedText] = useState('');
  const [authorName, setAuthorName] = useState('NotebookLM Editor');
  
  // Gemini API key state
  const [apiKey, setApiKey] = useState(BriefingEngine.getApiKey());
  const [copiedChannel, setCopiedChannel] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && posts.length > 0) {
      BriefingEngine.generateBriefings(posts).then((results) => {
        setBriefings(results);
        setSelectedBriefing((prev) => prev || (results.length > 0 ? results[0] : null));
      });
    }
  }, [isOpen, posts]);

  if (!isOpen) return null;

  const handleCopyText = (text: string, channel: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChannel(channel);
    onShowToast(`Copied ${channel} text to clipboard`);
    setTimeout(() => setCopiedChannel(null), 2000);
  };

  const handleSaveApiKey = () => {
    BriefingEngine.setApiKey(apiKey);
    onShowToast('Gemini API key saved in browser storage.');
  };

  const handlePublishBriefingToFeed = (brief: IntelligenceBriefing, crossPostNow = false) => {
    const newPost: Post = {
      id: `brief-pub-${Date.now()}`,
      title: brief.title,
      summary: brief.executiveSummary,
      content: `${brief.executiveSummary}\n\nKey Takeaways:\n${brief.keyTakeaways.map((t) => `• ${t}`).join('\n')}\n\nSources:\n${brief.primarySources.map((s) => s.name).join(', ')}`,
      sourceId: 'ttt',
      sourceName: 'Daily Intelligence Brief',
      sourceType: 'broadcast',
      author: 'Editorial Desk',
      originalUrl: 'https://trendingtt.com/#daily-brief',
      publishedAt: new Date().toISOString(),
      category: brief.category === 'national' ? 'broadcast' : brief.category,
      tags: ['Daily Briefing', 'Curated TT', brief.topic],
      trendingScore: 99,
      upvotes: 210,
      commentsCount: 18,
      isBreaking: brief.category === 'breaking',
      media: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
        aspectRatio: 'landscape'
      }
    };

    onPublishPost(newPost);
    if (crossPostNow) {
      onCrossPost(newPost);
      onClose();
    } else {
      onShowToast('Briefing published directly to feed!');
    }
  };

  const handleImportNotebookLmNote = () => {
    if (!pastedText.trim()) {
      onShowToast('Please paste your NotebookLM notes first.');
      return;
    }

    const createdPost = BriefingEngine.parseNotebookLmNotes(pastedText, authorName);
    onPublishPost(createdPost);
    setPastedText('');
    onShowToast('NotebookLM note parsed and published to live feed!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div 
        role="dialog"
        aria-labelledby="briefing-modal-title"
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/20 text-red-400 rounded-xl border border-red-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 id="briefing-modal-title" className="text-base font-bold text-slate-100 flex items-center gap-2">
                Intelligence Briefing & NotebookLM Synthesizer
              </h2>
              <p className="text-xs text-slate-400">
                Multi-source summarization, automated topic briefs, and 1-click social media dispatch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-5 gap-4">
          <button
            onClick={() => setActiveTab('briefs')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'briefs'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Curated Briefings ({briefings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('importer')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'importer'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>NotebookLM Note Importer</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Gemini API Settings</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          {/* TAB 1: CURATED BRIEFINGS */}
          {activeTab === 'briefs' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Left Column: Briefing List */}
              <div className="space-y-2 md:border-r md:border-slate-800 md:pr-4">
                <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                  Available Topics
                </span>

                {briefings.map((brief) => (
                  <button
                    key={brief.id}
                    onClick={() => setSelectedBriefing(brief)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                      selectedBriefing?.id === brief.id
                        ? 'bg-slate-800 border-red-500/50 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {brief.category}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {brief.primarySources.length} sources
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-200 line-clamp-2">
                      {brief.topic}
                    </span>
                  </button>
                ))}
              </div>

              {/* Right Column: Active Brief Details & Dispatch Drafts */}
              {selectedBriefing ? (
                <div className="md:col-span-2 space-y-5">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800">
                        {selectedBriefing.topic}
                      </span>
                      <span className="text-xs text-slate-500">
                        Synthesized at {new Date(selectedBriefing.generatedAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100">
                      {selectedBriefing.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedBriefing.executiveSummary}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                        Key Takeaways:
                      </span>
                      {selectedBriefing.keyTakeaways.map((takeaway, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className="text-red-400 font-bold">•</span>
                          <span>{takeaway}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Sources: {selectedBriefing.primarySources.map((s) => s.name).join(', ')}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePublishBriefingToFeed(selectedBriefing)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Publish to Feed</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ready-to-Post Social Media Drafts */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                      Ready-to-Post Social Media Drafts
                    </h4>

                    {/* WhatsApp */}
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400">
                          WhatsApp Broadcast / Status Draft
                        </span>
                        <button
                          onClick={() => handleCopyText(selectedBriefing.socialDrafts.whatsapp, 'WhatsApp')}
                          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                        >
                          {copiedChannel === 'WhatsApp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Copy</span>
                        </button>
                      </div>
                      <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                        {selectedBriefing.socialDrafts.whatsapp}
                      </pre>
                    </div>

                    {/* Facebook & X/Twitter */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-400">Facebook Page Draft</span>
                          <button
                            onClick={() => handleCopyText(selectedBriefing.socialDrafts.facebook, 'Facebook')}
                            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                          >
                            {copiedChannel === 'Facebook' ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>Copy</span>
                          </button>
                        </div>
                        <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 line-clamp-5">
                          {selectedBriefing.socialDrafts.facebook}
                        </pre>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">X / Twitter Post Draft</span>
                          <button
                            onClick={() => handleCopyText(selectedBriefing.socialDrafts.xTwitter, 'X')}
                            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                          >
                            {copiedChannel === 'X' ? <Check className="w-3.5 h-3.5 text-slate-200" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>Copy</span>
                          </button>
                        </div>
                        <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 line-clamp-5">
                          {selectedBriefing.socialDrafts.xTwitter}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="md:col-span-2 text-center py-12 text-slate-500 text-xs">
                  Select a topic on the left to review its multi-source brief.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NOTEBOOKLM NOTE IMPORTER */}
          {activeTab === 'importer' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-500" />
                  Import from Google NotebookLM
                </h3>
                <p className="text-xs text-slate-400">
                  Exported notes or summaries from your NotebookLM notebook can be pasted here. The engine will parse the title, bullet takeaways, and auto-publish a clean card into the Trending TT feed.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Author / Attribution</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. NotebookLM Research Desk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Paste NotebookLM Note or Synthesis</label>
                <textarea
                  rows={8}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your NotebookLM studio note, summary, or bullets here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <button
                onClick={handleImportNotebookLmNote}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Parse & Publish Directly to Feed</span>
              </button>
            </div>
          )}

          {/* TAB 3: GEMINI API SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Key className="w-4 h-4 text-red-500" />
                  Google Gemini API Configuration
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  To power dynamic live AI synthesis directly in your browser without any server, provide a Google Gemini API Key. Your key is stored securely in your browser&apos;s localStorage and never transmitted elsewhere.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Gemini API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-red-400 hover:text-red-300 underline"
                >
                  Get a free Gemini API key at Google AI Studio
                </a>

                <button
                  onClick={handleSaveApiKey}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Save API Key
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
