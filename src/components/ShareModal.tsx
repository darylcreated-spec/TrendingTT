import React, { useState } from 'react';
import type { Post } from '../types';
import { 
  CrossPostingService, 
  CHANNELS_META, 
  type CrossPostChannel, 
  type CrossPostConfig, 
  type CrossPostDispatchResult,
  type CrossPostProvider
} from '../services/crossPostingService';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Smartphone,
  Send,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Radio,
  Globe
} from 'lucide-react';

interface ShareModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ post, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'crosspost'>('quick');
  const [copied, setCopied] = useState(false);

  // Cross-posting states
  const [selectedChannels, setSelectedChannels] = useState<CrossPostChannel[]>(['facebook', 'twitter', 'telegram', 'whatsapp']);
  const [prevPostId, setPrevPostId] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<CrossPostDispatchResult | null>(null);

  // Settings configuration states
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<CrossPostConfig>(() => CrossPostingService.getConfig());
  const [configSaved, setConfigSaved] = useState(false);
  const [testingEndpoint, setTestingEndpoint] = useState(false);
  const [testStatus, setTestStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Synchronize initial message template when post changes (React recommended render-time update)
  if (post && post.id !== prevPostId) {
    setPrevPostId(post.id);
    setCustomMessage(CrossPostingService.formatMessage(post));
    setDispatchResult(null);
    setTestStatus(null);
  }

  if (!isOpen || !post) return null;

  const shareUrl = typeof window !== 'undefined' && window.location.origin 
    ? `${window.location.origin}/#post-${post.id}` 
    : post.originalUrl;
  const shareText = `*${post.title}*\n\nRead on Trending TT (Trinidad & Tobago Live Dashboard):\n${shareUrl}\n\nSource: ${post.sourceName}`;

  // Quick Share handlers
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
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  // Cross-Post toggle channel
  const toggleChannel = (channel: CrossPostChannel) => {
    if (selectedChannels.includes(channel)) {
      setSelectedChannels(selectedChannels.filter(c => c !== channel));
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const handleSelectAllChannels = () => {
    setSelectedChannels(['facebook', 'twitter', 'instagram', 'telegram', 'whatsapp']);
  };

  const handleClearChannels = () => {
    setSelectedChannels([]);
  };

  // Reset custom message
  const handleResetMessage = () => {
    if (post) {
      setCustomMessage(CrossPostingService.formatMessage(post, config.customTemplate));
    }
  };

  // Insert tag helper
  const handleInsertTag = (tag: string) => {
    setCustomMessage(prev => `${prev} ${tag}`);
  };

  // Save persistent webhook configuration
  const handleSaveConfig = () => {
    const updated = CrossPostingService.saveConfig(config);
    setConfig(updated);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  // Test webhook endpoint
  const handleTestEndpoint = async () => {
    setTestingEndpoint(true);
    setTestStatus(null);
    try {
      const res = await CrossPostingService.testWebhook(config);
      setTestStatus({ success: res.success, message: res.message });
    } catch (err: any) {
      setTestStatus({ success: false, message: err.message || 'Connection test failed' });
    } finally {
      setTestingEndpoint(false);
    }
  };

  // 1-Click Multi-Platform Dispatch
  const handleDispatch = async () => {
    if (selectedChannels.length === 0) return;
    setIsDispatching(true);
    setDispatchResult(null);

    try {
      const result = await CrossPostingService.dispatchCrossPost({
        post,
        message: customMessage,
        channels: selectedChannels,
        config
      });
      setDispatchResult(result);
    } catch (err: any) {
      setDispatchResult({
        id: `err-${Date.now()}`,
        provider: config.provider,
        overallSuccess: false,
        channelStatuses: selectedChannels.map(c => ({
          channel: c,
          channelName: CHANNELS_META[c].name,
          success: false,
          statusText: 'Failed',
          dispatchedAt: new Date().toISOString(),
          error: err.message || 'Dispatch error'
        })),
        dispatchedCount: 0,
        dispatchedAt: new Date().toISOString(),
        summaryText: err.message || 'Failed to dispatch cross-post'
      });
    } finally {
      setIsDispatching(false);
    }
  };

  const charCount = customMessage.length;
  const isTwitterSelected = selectedChannels.includes('twitter');
  const isOverTwitterLimit = isTwitterSelected && charCount > 280;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative my-auto animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pr-8">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-lg leading-tight">Publish & Distribute</h3>
            <p className="text-xs text-slate-400">Trinidad & Tobago multi-channel distribution</p>
          </div>
        </div>

        {/* Top Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('quick')}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'quick'
                ? 'bg-red-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Direct Share</span>
          </button>
          <button
            onClick={() => setActiveTab('crosspost')}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'crosspost'
                ? 'bg-red-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Cross-Post Dispatch</span>
          </button>
        </div>

        {/* Post Preview Summary */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 mb-4 shrink-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
              {post.sourceName}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
              {post.category}
            </span>
          </div>
          <p className="text-xs text-slate-200 font-semibold line-clamp-2 leading-relaxed">
            {post.title}
          </p>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {activeTab === 'quick' ? (
            /* TAB 1: QUICK SHARE */
            <div>
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                {/* WhatsApp */}
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

                {/* Native Device Share Sheet */}
                <button
                  onClick={handleNativeShare}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm border border-slate-700 transition-all active:scale-95"
                >
                  <Smartphone className="w-4 h-4 text-red-400" />
                  <span>Device Share</span>
                </button>
              </div>

              {/* Copy Link Field */}
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
          ) : (
            /* TAB 2: CROSS-POST ENGINE */
            <div className="space-y-4">
              {/* Channel Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <span>Target Channels</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {selectedChannels.length} active
                    </span>
                  </label>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <button 
                      onClick={handleSelectAllChannels} 
                      className="hover:text-red-400 transition-colors"
                    >
                      All
                    </button>
                    <span>•</span>
                    <button 
                      onClick={handleClearChannels} 
                      className="hover:text-red-400 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(CHANNELS_META) as CrossPostChannel[]).map((channelKey) => {
                    const meta = CHANNELS_META[channelKey];
                    const isSelected = selectedChannels.includes(channelKey);

                    return (
                      <button
                        key={channelKey}
                        onClick={() => toggleChannel(channelKey)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-slate-800/90 border-red-500/60 text-slate-100 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="truncate pr-1">
                          <p className="text-xs font-bold truncate leading-tight">{meta.name}</p>
                          <span className="text-[10px] text-slate-400 block truncate">{meta.badge}</span>
                        </div>
                        <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 text-white ${
                          isSelected ? 'bg-red-600' : 'bg-slate-800'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Customization Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Customizable Message Formatting
                  </label>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isOverTwitterLimit
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {charCount} chars {isTwitterSelected && '/ 280'}
                    </span>
                    <button
                      onClick={handleResetMessage}
                      className="text-[11px] text-red-400 hover:text-red-300 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-red-500/60 leading-relaxed font-sans resize-none"
                  placeholder="Enter formatted social broadcast message..."
                />

                {/* Variable Tags Quick Insertion */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400">Append:</span>
                  <button
                    onClick={() => handleInsertTag('#TrinidadAndTobago')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono transition-colors"
                  >
                    #TrinidadAndTobago
                  </button>
                  <button
                    onClick={() => handleInsertTag('#BreakingTT')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono transition-colors"
                  >
                    #BreakingTT
                  </button>
                  <button
                    onClick={() => handleInsertTag('#TrendingTT')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono transition-colors"
                  >
                    #TrendingTT
                  </button>
                </div>
              </div>

              {/* Webhook Configuration Accordion */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-900/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-xs font-bold text-slate-200">
                      Webhook & API Settings
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                      {config.provider}
                    </span>
                  </div>
                  {showConfig ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {showConfig && (
                  <div className="p-3 border-t border-slate-800 space-y-3 bg-slate-900/40">
                    {/* Provider Select */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Dispatch Provider
                      </label>
                      <select
                        value={config.provider}
                        onChange={(e) => setConfig({ ...config, provider: e.target.value as CrossPostProvider })}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-red-500/60"
                      >
                        <option value="webhook">Custom Webhook (n8n / Zapier / Make / Internal)</option>
                        <option value="postiz">Postiz Social API</option>
                        <option value="mixpost">Mixpost Multi-Account API</option>
                      </select>
                    </div>

                    {/* Endpoint URL */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Endpoint URL
                      </label>
                      <input
                        type="url"
                        value={config.webhookUrl}
                        onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                        placeholder="https://webhook.yourdomain.com/v1/crosspost"
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-red-500/60"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Leave blank to run in sandbox simulation mode.
                      </span>
                    </div>

                    {/* API Key */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        API Key / Bearer Token
                      </label>
                      <input
                        type="password"
                        value={config.apiKey}
                        onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                        placeholder="Optional bearer token or secret"
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-red-500/60"
                      />
                    </div>

                    {/* Default Template Configuration */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-300">
                          Default Message Template
                        </label>
                        <button
                          type="button"
                          onClick={() => setConfig({ ...config, customTemplate: '{title}\n\n{summary}\n\nRead full story on Trending TT:\n{url}\n\n{tags}' })}
                          className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
                        >
                          Reset Template
                        </button>
                      </div>
                      <textarea
                        value={config.customTemplate}
                        onChange={(e) => setConfig({ ...config, customTemplate: e.target.value })}
                        rows={3}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-200 focus:outline-none focus:border-red-500/60 font-mono resize-none leading-relaxed"
                        placeholder="{title} ... {url}"
                      />
                      <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-slate-400">
                        <span>Placeholders:</span>
                        <code className="text-slate-300 font-mono">{'{title}'}</code>
                        <code className="text-slate-300 font-mono">{'{summary}'}</code>
                        <code className="text-slate-300 font-mono">{'{url}'}</code>
                        <code className="text-slate-300 font-mono">{'{source}'}</code>
                        <code className="text-slate-300 font-mono">{'{tags}'}</code>
                      </div>
                    </div>

                    {/* Actions: Test & Save */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleTestEndpoint}
                        disabled={testingEndpoint}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        {testingEndpoint ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-400" />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>Test Endpoint</span>
                      </button>

                      <button
                        onClick={handleSaveConfig}
                        className="py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {configSaved ? <Check className="w-3.5 h-3.5" /> : null}
                        <span>{configSaved ? 'Saved' : 'Save Config'}</span>
                      </button>
                    </div>

                    {/* Test result status banner */}
                    {testStatus && (
                      <div className={`p-2 rounded-lg text-[11px] flex items-center gap-2 border ${
                        testStatus.success 
                          ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300' 
                          : 'bg-rose-950/60 border-rose-800/80 text-rose-300'
                      }`}>
                        {testStatus.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                        <span>{testStatus.message}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Twitter Overlimit Warning Banner */}
              {isOverTwitterLimit && (
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>X (Twitter) limit of 280 chars exceeded by {charCount - 280}. Content may be truncated upon dispatch.</span>
                </div>
              )}

              {/* 1-Click Multi-Platform Dispatch Action */}
              <div>
                <button
                  onClick={handleDispatch}
                  disabled={isDispatching || selectedChannels.length === 0 || !customMessage.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isDispatching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Dispatching to {selectedChannels.length} Channels...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>1-Click Dispatch to {selectedChannels.length} Channels</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status Indicators & Receipts */}
              {dispatchResult && (
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {dispatchResult.overallSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                      )}
                      <span className="text-xs font-bold text-slate-100">
                        {dispatchResult.summaryText}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(dispatchResult.dispatchedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })} AST
                    </span>
                  </div>

                  {/* Channel by channel breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                    {dispatchResult.channelStatuses.map((cs) => (
                      <div 
                        key={cs.channel}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]"
                      >
                        <span className="font-semibold text-slate-300">{cs.channelName}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          cs.success 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {cs.statusText}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
