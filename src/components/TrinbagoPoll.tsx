import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Users, 
  Share2, 
  Vote, 
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { INITIAL_POLLS } from '../data/radarAndPollData';
import { Storage } from '../services/storage';

interface TrinbagoPollProps {
  onShowToast: (msg: string) => void;
  featuredOnly?: boolean;
}

export const TrinbagoPoll: React.FC<TrinbagoPollProps> = ({ 
  onShowToast,
  featuredOnly = false 
}) => {
  const [selectedPollId, setSelectedPollId] = useState<string>(INITIAL_POLLS[0].id);
  const [userVotes, setUserVotes] = useState<Record<string, string>>(() => Storage.getUserPollVotes());
  const [extraCounts, setExtraCounts] = useState<Record<string, Record<string, number>>>(() => Storage.getPollExtraCounts());

  const activePoll = useMemo(() => {
    return INITIAL_POLLS.find((p) => p.id === selectedPollId) || INITIAL_POLLS[0];
  }, [selectedPollId]);

  // Calculate dynamic tallies combining mock baseline + user votes
  const pollStats = useMemo(() => {
    const pollId = activePoll.id;
    const extras = extraCounts[pollId] || {};

    const computedOptions = activePoll.options.map((opt) => {
      const optionExtra = extras[opt.id] || 0;
      const count = opt.votes + optionExtra;
      return {
        ...opt,
        currentVotes: count
      };
    });

    const total = computedOptions.reduce((acc, curr) => acc + curr.currentVotes, 0);

    const withPercentages = computedOptions.map((opt) => ({
      ...opt,
      percentage: total > 0 ? Math.round((opt.currentVotes / total) * 100) : 0
    }));

    return {
      totalVotes: total,
      options: withPercentages,
      userVotedOptionId: userVotes[pollId] || null
    };
  }, [activePoll, extraCounts, userVotes]);

  const handleVote = (optionId: string) => {
    const res = Storage.castPollVote(activePoll.id, optionId);
    setUserVotes({ ...res.userVotes });
    setExtraCounts({ ...res.extraCounts });
    onShowToast(`Vote recorded for "${activePoll.options.find(o => o.id === optionId)?.label}"`);
  };

  const handleSharePoll = () => {
    const text = `Trinbago Sentiment Poll: ${activePoll.question} — Cast your vote on Trending TT!`;
    const shareUrl = `${window.location.origin}/#poll-${activePoll.id}`;
    if (navigator.share) {
      navigator.share({
        title: 'Trending TT Poll of the Day',
        text,
        url: shareUrl
      }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${shareUrl}`)}`, '_blank');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl text-slate-100 w-full max-w-full overflow-hidden">
      {/* Poll Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 w-full min-w-0">
        <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm shrink-0 mt-0.5 sm:mt-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-950/60 px-2 py-0.5 rounded border border-red-900/60 shrink-0">
                Trinbago Sentiment
              </span>
              <span className="text-xs text-slate-400 font-medium truncate">
                {activePoll.tagline}
              </span>
            </div>
            <h3 className="text-sm sm:text-base md:text-lg font-black text-white mt-0.5 tracking-tight">
              {activePoll.question}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSharePoll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
            title="Share Poll"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Poll Selector Pills (if not featured only) */}
      {!featuredOnly && INITIAL_POLLS.length > 1 && (
        <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar scrollbar-none border-b border-slate-850">
          {INITIAL_POLLS.map((p) => {
            const isSelected = p.id === selectedPollId;
            const hasVoted = Boolean(userVotes[p.id]);
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPollId(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-red-600 text-white border-red-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{p.category.toUpperCase()}</span>
                {hasVoted && (
                  <CheckCircle2 className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-emerald-400'}`} />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Options & Results Area */}
      <div className="py-4 space-y-3">
        {pollStats.options.map((opt) => {
          const isUserChoice = pollStats.userVotedOptionId === opt.id;

          return (
            <div
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              className={`group relative overflow-hidden rounded-xl border transition-all cursor-pointer select-none p-3.5 ${
                isUserChoice 
                  ? 'border-red-500 bg-red-950/20' 
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950'
              }`}
            >
              {/* Background percentage fill bar */}
              <div 
                className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out ${
                  isUserChoice 
                    ? 'bg-red-600/20 border-r-2 border-red-500' 
                    : 'bg-slate-800/40'
                }`}
                style={{ width: `${opt.percentage}%` }}
              />

              {/* Foreground content */}
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${isUserChoice ? 'text-red-400' : 'text-slate-200'}`}>
                      {opt.label}
                    </span>
                    {isUserChoice && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        Your Vote
                      </span>
                    )}
                  </div>
                  {opt.description && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 group-hover:line-clamp-none transition-all">
                      {opt.description}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-white font-mono">
                    {opt.percentage}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {opt.currentVotes.toLocaleString()} votes
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Meta Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>{pollStats.totalVotes.toLocaleString()} Total Trinbago Votes</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>1-Device Verification</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {pollStats.userVotedOptionId ? (
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <RotateCcw className="w-3 h-3" />
              <span>Tap another option anytime to change vote</span>
            </span>
          ) : (
            <span className="text-amber-400/90 text-[11px] font-semibold flex items-center gap-1">
              <Vote className="w-3 h-3" />
              <span>Click any option above to cast your vote</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
