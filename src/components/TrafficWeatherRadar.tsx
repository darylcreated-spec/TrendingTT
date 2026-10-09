import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  CloudRain, 
  Car, 
  Droplet, 
  Waves, 
  Clock, 
  Gauge, 
  Plus, 
  ShieldAlert, 
  ThumbsUp, 
  Compass, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import type { 
  HighwayId, 
  TrafficSeverity, 
  CommunityReport 
} from '../types';
import { 
  INITIAL_TRAFFIC_SEGMENTS, 
  INITIAL_TTMS_ADVISORY, 
  INITIAL_RIVER_LEVELS, 
  INITIAL_TIDES, 
  INITIAL_WASA_NOTICES 
} from '../data/radarAndPollData';
import { Storage } from '../services/storage';
import { CarouselTabs, type CarouselTabItem } from './CarouselTabs';

interface TrafficWeatherRadarProps {
  onShowToast: (msg: string) => void;
  onOpenNotifications: () => void;
}

type RadarTab = 'all' | 'traffic' | 'weather' | 'wasa' | 'community';

const RADAR_TAB_ITEMS: CarouselTabItem<RadarTab>[] = [
  { id: 'all', label: 'All Radar Feeds' },
  { id: 'traffic', label: `Highways & Traffic (${INITIAL_TRAFFIC_SEGMENTS.length})`, icon: <Car className="w-3.5 h-3.5" /> },
  { id: 'weather', label: 'TTMS & River Flooding', icon: <CloudRain className="w-3.5 h-3.5" /> },
  { id: 'wasa', label: `WASA Water Notices (${INITIAL_WASA_NOTICES.length})`, icon: <Droplet className="w-3.5 h-3.5" /> },
  { id: 'community', label: 'Driver Reports', icon: <ThumbsUp className="w-3.5 h-3.5" /> },
];

const HIGHWAY_FILTER_ITEMS: CarouselTabItem<'all' | HighwayId>[] = [
  { id: 'all', label: 'All Corridors' },
  { id: 'crh', label: 'Churchill Roosevelt (CRH)' },
  { id: 'ubh', label: 'Uriah Butler (UBH)' },
  { id: 'pbr', label: 'Priority Bus Route (PBR)' },
  { id: 'shh', label: 'Solomon Hochoy (SHH)' },
  { id: 'lady-young', label: 'Lady Young' },
  { id: 'south-trunk', label: 'South Trunk / Mosquito Creek' }
];


export const TrafficWeatherRadar: React.FC<TrafficWeatherRadarProps> = ({
  onShowToast,
  onOpenNotifications
}) => {
  const [activeTab, setActiveTab] = useState<RadarTab>('all');
  const [selectedHighway, setSelectedHighway] = useState<'all' | HighwayId>('all');

  // Community reports state & persistence
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>(() => Storage.getCommunityReports());
  const [confirmedIds, setConfirmedIds] = useState<string[]>(() => Storage.getConfirmedReportIds());
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // New report form state
  const [newLocation, setNewLocation] = useState('');
  const [newHighway, setNewHighway] = useState<HighwayId>('crh');
  const [newCategory, setNewCategory] = useState<'traffic' | 'flood' | 'hazard' | 'police' | 'water'>('traffic');
  const [newSummary, setNewSummary] = useState('');

  // Traffic segments filtering
  const filteredTraffic = useMemo(() => {
    if (selectedHighway === 'all') return INITIAL_TRAFFIC_SEGMENTS;
    return INITIAL_TRAFFIC_SEGMENTS.filter(t => t.highwayId === selectedHighway);
  }, [selectedHighway]);

  // Aggregate stats
  const trafficIssuesCount = useMemo(() => {
    return INITIAL_TRAFFIC_SEGMENTS.filter(s => ['heavy', 'gridlock', 'flood'].includes(s.severity)).length;
  }, []);

  const handleToggleConfirmReport = (reportId: string) => {
    const { confirmed, allConfirmed } = Storage.toggleConfirmReport(reportId);
    setConfirmedIds([...allConfirmed]);
    setCommunityReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          confirmations: r.confirmations + (confirmed ? 1 : -1)
        };
      }
      return r;
    }));
    onShowToast(confirmed ? 'Confirmation recorded' : 'Confirmation withdrawn');
  };

  const handleAddCommunityReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.trim() || !newSummary.trim()) {
      onShowToast('Please provide a location and brief description');
      return;
    }

    const created = Storage.addCommunityReport({
      highwayId: newHighway,
      location: newLocation.trim(),
      category: newCategory,
      summary: newSummary.trim()
    });

    setCommunityReports(prev => [created, ...prev]);
    setIsReportModalOpen(false);
    setNewLocation('');
    setNewSummary('');
    onShowToast('Road/Flood report published to community radar');
  };

  const getSeverityBadge = (severity: TrafficSeverity) => {
    switch (severity) {
      case 'gridlock':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-400 border border-red-800">Gridlock</span>;
      case 'heavy':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-400 border border-amber-800">Heavy Delay</span>;
      case 'moderate':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-yellow-950 text-yellow-300 border border-yellow-800">Slow Crawl</span>;
      case 'flood':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800">Water Across Road</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">Smooth Velocity</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Radar Mission Control Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg border border-red-500">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                  Real-Time Radar
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Trinidad & Tobago Critical Infrastructure
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
                Live Traffic, Flood & TTMS Weather Radar
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Report Condition</span>
            </button>
            <button
              onClick={onOpenNotifications}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Alert Settings</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>TTMS Alert Level</span>
              <CloudRain className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-base font-black text-amber-400 mt-1 uppercase">
              {INITIAL_TTMS_ADVISORY.level} Level
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              Adverse Weather Warning
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Highway Delays</span>
              <Car className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="text-base font-black text-white mt-1">
              {trafficIssuesCount} Bottlenecks
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              UBH Caroni & CRH Valsayn
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Caroni Basin Gauge</span>
              <Waves className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-base font-black text-blue-400 mt-1">
              68% (Alert)
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              El Carmen station rising
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>WASA Advisories</span>
              <Droplet className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-base font-black text-white mt-1">
              {INITIAL_WASA_NOTICES.length} Active Notices
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              Caroni main repairs ongoing
            </div>
          </div>
        </div>
      </div>

      {/* Radar Category Navigation Bar with CarouselTabs */}
      <div className="border-b border-slate-800 pb-2">
        <CarouselTabs<RadarTab>
          items={RADAR_TAB_ITEMS}
          activeId={activeTab}
          onSelect={setActiveTab}
          ariaLabel="Radar Categories"
          showArrows
        />
      </div>

      {/* SECTION 1: TTMS OFFICIAL WEATHER ADVISORY */}
      {(activeTab === 'all' || activeTab === 'weather') && (
        <div className="bg-amber-950/20 border border-amber-800/60 rounded-2xl p-5 shadow-lg relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-amber-800/40">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  Official Advisory • {INITIAL_TTMS_ADVISORY.authority}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {INITIAL_TTMS_ADVISORY.type}
                </h3>
              </div>
            </div>
            <div className="text-xs text-amber-200/80 font-mono flex items-center gap-2">
              <span>Valid: {INITIAL_TTMS_ADVISORY.validUntil}</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 mt-3 leading-relaxed">
            {INITIAL_TTMS_ADVISORY.description}
          </p>

          <div className="mt-4 pt-3 border-t border-amber-800/30">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">
              Key Areas on Alert
            </div>
            <div className="flex flex-wrap gap-1.5">
              {INITIAL_TTMS_ADVISORY.affectedAreas.map((area, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[11px] bg-slate-900/80 text-slate-200 border border-amber-900/50"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* River Basin Flood Gauges */}
          <div className="mt-5 pt-4 border-t border-amber-850">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-blue-400" />
              <span>National Riverine Basin Water Levels</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {INITIAL_RIVER_LEVELS.map((basin) => (
                <div key={basin.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span className="truncate">{basin.basin}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      basin.percentage > 65 
                        ? 'bg-red-950 text-red-400 border border-red-800' 
                        : 'bg-slate-900 text-slate-300'
                    }`}>
                      {basin.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {basin.station}
                  </div>
                  
                  {/* Gauge Bar */}
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-white font-bold">{basin.percentage}% Capacity</span>
                      <span className="text-slate-400 flex items-center gap-0.5 text-[10px]">
                        {basin.trend === 'rising' ? (
                          <span className="text-red-400 flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" /> Rising
                          </span>
                        ) : basin.trend === 'falling' ? (
                          <span className="text-emerald-400 flex items-center gap-0.5">
                            <TrendingDown className="w-3 h-3" /> Falling
                          </span>
                        ) : (
                          <span className="text-slate-400 flex items-center gap-0.5">
                            <Minus className="w-3 h-3" /> Steady
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          basin.percentage > 70 
                            ? 'bg-red-500' 
                            : basin.percentage > 50 
                            ? 'bg-amber-500' 
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${basin.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500">
                    Updated {basin.updatedAt}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coastal High / Low Tides Table */}
          <div className="mt-4 pt-4 border-t border-amber-850">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-cyan-400" />
              <span>Coastal Tides & Overwash Vulnerability (Port of Spain & South Trunk)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {INITIAL_TIDES.map((tide, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-200">{tide.location}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      tide.coastalRisk.includes('Moderate') 
                        ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                        : 'bg-slate-900 text-slate-400'
                    }`}>
                      Risk: {tide.coastalRisk}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                    {tide.tides.map((t, idx) => (
                      <div key={idx} className="p-1.5 rounded-lg bg-slate-900 border border-slate-850">
                        <div className="text-[10px] text-slate-400">{t.type}</div>
                        <div className="text-xs font-bold text-slate-200 mt-0.5">{t.time}</div>
                        <div className="text-[10px] text-cyan-400">{t.heightMeters}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: HIGHWAYS & TRAFFIC RADAR */}
      {(activeTab === 'all' || activeTab === 'traffic') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-red-500" />
                <span>Major Trinidad Highway Arteries</span>
              </h3>
              <p className="text-xs text-slate-400">
                Live velocity, bottlenecks and lane advisories for UBH, CRH, PBR, and SHH
              </p>
            </div>

            {/* Highway Filter Selector with CarouselTabs */}
            <div className="flex-1 sm:max-w-lg min-w-0">
              <CarouselTabs<'all' | HighwayId>
                items={HIGHWAY_FILTER_ITEMS}
                activeId={selectedHighway}
                onSelect={setSelectedHighway}
                ariaLabel="Highway Corridors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTraffic.map(item => (
              <div 
                key={item.id} 
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {item.highwayName}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        {item.segmentName}
                      </h4>
                    </div>
                    {getSeverityBadge(item.severity)}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 font-mono">
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                      {item.direction}
                    </span>
                    <span>•</span>
                    <span className="text-slate-300 font-semibold">{item.statusText}</span>
                  </div>

                  {item.advisoryNote && (
                    <div className="mt-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                      <span className="font-semibold text-amber-400">Notice: </span>
                      {item.advisoryNote}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className={item.delayMinutes > 15 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                        {item.delayMinutes > 0 ? `+${item.delayMinutes}m delay` : 'No delay'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-slate-400">
                      <Gauge className="w-3.5 h-3.5" />
                      <span>{item.averageSpeedKmh} km/h</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {item.lastUpdated}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: WASA WATER ADVISORIES */}
      {(activeTab === 'all' || activeTab === 'wasa') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white">
                WASA (Water & Sewerage Authority) Advisories
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              National Supply Network
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {INITIAL_WASA_NOTICES.map(notice => (
              <div 
                key={notice.id} 
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-300">
                    <span className="truncate">{notice.facility}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      notice.status.includes('Outage') 
                        ? 'bg-red-950 text-red-400 border border-red-800' 
                        : notice.status.includes('Progress')
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-slate-900 text-slate-300'
                    }`}>
                      {notice.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 mt-2">
                    {notice.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {notice.reason}
                  </p>

                  <div className="mt-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Affected Areas:
                    </span>
                    <ul className="text-[11px] text-slate-300 mt-1 space-y-0.5 list-disc list-inside">
                      {notice.affectedAreas.map((area, idx) => (
                        <li key={idx} className="truncate">{area}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                  <div className="font-semibold text-cyan-300">{notice.schedule}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Updated {notice.updatedAt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: COMMUNITY DRIVER REPORTS */}
      {(activeTab === 'all' || activeTab === 'community') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                Driver & Community Crowd-Sourced Radar
              </h3>
            </div>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {communityReports.map(rep => {
              const isConfirmed = confirmedIds.includes(rep.id);
              return (
                <div 
                  key={rep.id} 
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold uppercase text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-900/60">
                        {rep.category.toUpperCase()}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {rep.reportedTime}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white mt-2">
                      {rep.location}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      {rep.summary}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-850 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      {rep.isVerified && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                      <span>{rep.confirmations} confirmations</span>
                    </span>
                    <button
                      onClick={() => handleToggleConfirmReport(rep.id)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                        isConfirmed 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{isConfirmed ? 'Confirmed' : 'Confirm'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Submit Community Road/Flood Report
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Help fellow Trinbagonian drivers avoid gridlock and rising waters.
            </p>

            <form onSubmit={handleAddCommunityReport} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Highway / Artery</label>
                <select
                  value={newHighway}
                  onChange={(e) => setNewHighway(e.target.value as HighwayId)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="crh">Churchill Roosevelt Highway (CRH)</option>
                  <option value="ubh">Uriah Butler Highway (UBH)</option>
                  <option value="pbr">Priority Bus Route (PBR)</option>
                  <option value="shh">Solomon Hochoy Highway (SHH)</option>
                  <option value="lady-young">Lady Young Road</option>
                  <option value="south-trunk">South Trunk Road / Mosquito Creek</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="traffic">Traffic Bottleneck / Gridlock</option>
                  <option value="flood">Street / Riverine Flooding</option>
                  <option value="hazard">Road Hazard / Pothole / Debris</option>
                  <option value="police">Police Speed Trap / Roadblock</option>
                  <option value="water">WASA Main Leak / Line Rupture</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Exact Location / Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. Near Grand Bazaar flyover heading South"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Observation Details</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Left lane blocked by stalled flatbed, traffic backed up 2km."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Broadcast Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
