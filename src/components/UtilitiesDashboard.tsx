import React, { useState, useMemo, useEffect } from 'react';
import { 
  Zap, 
  Droplet, 
  Tv, 
  PhoneCall, 
  ExternalLink, 
  Clock, 
  MapPin, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Plus, 
  ThumbsUp, 
  X, 
  Send,
  MessageCircle,
  Radio,
  RefreshCw
} from 'lucide-react';
import type { 
  UtilityProviderId, 
  TrinidadRegion, 
  DisruptionStatus,
  UtilityReport,
  UtilityCategory,
  WaterSchedule,
  UtilityDisruption,
  TelecomStatus
} from '../types';
import { 
  UTILITY_PROVIDERS_META, 
  INITIAL_UTILITY_DISRUPTIONS, 
  INITIAL_WATER_SCHEDULES, 
  INITIAL_TELECOM_NOTICES 
} from '../data/utilitiesData';
import { Storage } from '../services/storage';
import { UtilityService } from '../services/utilityService';
import { formatPostTimeOnly } from '../utils/dateUtils';
import { DataOriginBadge } from './DataOriginBadge';
import { CarouselTabs, type CarouselTabItem } from './CarouselTabs';

interface UtilitiesDashboardProps {
  onShowToast: (msg: string) => void;
  onOpenNotifications: () => void;
  initialRegion?: 'all' | TrinidadRegion;
}

type UtilitySubTab = 'all' | 'ttec' | 'wasa' | 'schedules' | 'telecom' | 'community';

const SUB_TAB_ITEMS: CarouselTabItem<UtilitySubTab>[] = [
  { id: 'all', label: 'All Utility Alerts', icon: <Radio className="w-3.5 h-3.5" /> },
  { id: 'ttec', label: 'T&TEC Electricity', icon: <Zap className="w-3.5 h-3.5 text-amber-400" /> },
  { id: 'wasa', label: 'WASA Disruptions', icon: <Droplet className="w-3.5 h-3.5 text-cyan-400" /> },
  { id: 'schedules', label: 'Water Supply Schedules', icon: <Calendar className="w-3.5 h-3.5 text-blue-400" /> },
  { id: 'telecom', label: 'Cable TV & Internet', icon: <Tv className="w-3.5 h-3.5 text-purple-400" /> },
  { id: 'community', label: 'Citizen Outage Reports', icon: <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" /> },
];

const REGION_FILTER_ITEMS: CarouselTabItem<'all' | TrinidadRegion>[] = [
  { id: 'all', label: 'All Regions' },
  { id: 'North', label: 'North Trinidad' },
  { id: 'Central', label: 'Central Trinidad' },
  { id: 'South', label: 'South Trinidad' },
  { id: 'East', label: 'East Trinidad' },
  { id: 'Tobago', label: 'Tobago' },
];

export const UtilitiesDashboard: React.FC<UtilitiesDashboardProps> = ({
  onShowToast,
  onOpenNotifications,
  initialRegion
}) => {
  const [activeTab, setActiveTab] = useState<UtilitySubTab>('all');
  const [selectedRegion, setSelectedRegion] = useState<'all' | TrinidadRegion>(() => initialRegion || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [prevInitialRegion, setPrevInitialRegion] = useState(initialRegion);
  if (initialRegion !== prevInitialRegion) {
    setPrevInitialRegion(initialRegion);
    if (initialRegion) {
      setSelectedRegion(initialRegion);
    }
  }

  // Dynamic Live Utilities State (T&TEC, WASA, Telecom)
  const [disruptions, setDisruptions] = useState<UtilityDisruption[]>(() => UtilityService.refreshDisruptions(INITIAL_UTILITY_DISRUPTIONS));
  const [waterSchedules, setWaterSchedules] = useState<WaterSchedule[]>(() => UtilityService.refreshWaterSchedules(INITIAL_WATER_SCHEDULES));
  const [telecomNotices, setTelecomNotices] = useState<TelecomStatus[]>(() => UtilityService.refreshTelecomNotices(INITIAL_TELECOM_NOTICES));
  const [lastSyncTime, setLastSyncTime] = useState(() => formatPostTimeOnly(new Date().toISOString()));
  const [isRefreshingUtilities, setIsRefreshingUtilities] = useState(false);

  // Manual & automatic live refresh
  const handleRefreshUtilities = () => {
    setIsRefreshingUtilities(true);
    setTimeout(() => {
      const refreshed = UtilityService.refreshAllUtilityData(disruptions, waterSchedules, telecomNotices);
      setDisruptions(refreshed.disruptions);
      setWaterSchedules(refreshed.waterSchedules);
      setTelecomNotices(refreshed.telecomNotices);
      setLastSyncTime(refreshed.timestamp);
      setIsRefreshingUtilities(false);
      onShowToast(`Utilities radar updated with live AST telemetry (${refreshed.timestamp})`);
    }, 400);
  };

  // Auto-refresh telemetry on mount and periodically every 60s
  useEffect(() => {
    let isMounted = true;

    UtilityService.fetchLiveUtilities().then((liveData) => {
      if (!isMounted) return;
      if (liveData) {
        setDisruptions(liveData.disruptions);
        setWaterSchedules(liveData.waterSchedules);
        setTelecomNotices(liveData.telecomNotices);
        setLastSyncTime(liveData.timestamp);
      }
    });

    const intervalId = setInterval(() => {
      setDisruptions(prev => UtilityService.refreshDisruptions(prev));
      setTelecomNotices(prev => UtilityService.refreshTelecomNotices(prev));
      setLastSyncTime(formatPostTimeOnly(new Date().toISOString()));
    }, 60000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Community reports state
  const [communityReports, setCommunityReports] = useState<UtilityReport[]>(() => Storage.getUtilityReports());
  const [confirmedIds, setConfirmedIds] = useState<string[]>(() => Storage.getConfirmedUtilityReportIds());
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Form state for reporting an outage
  const [reportProvider, setReportProvider] = useState<UtilityProviderId>('ttec');
  const [reportCategory, setReportCategory] = useState<UtilityCategory>('electricity');
  const [reportLocation, setReportLocation] = useState('');
  const [reportSummary, setReportSummary] = useState('');

  // Filtered Disruptions (T&TEC & WASA)
  const filteredDisruptions = useMemo(() => {
    return disruptions.filter((item) => {
      // Tab filter
      if (activeTab === 'ttec' && item.providerId !== 'ttec') return false;
      if (activeTab === 'wasa' && item.providerId !== 'wasa') return false;
      if (activeTab === 'schedules' || activeTab === 'telecom') return false;

      // Region filter
      if (selectedRegion !== 'all' && item.region !== selectedRegion) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesReason = item.reason.toLowerCase().includes(q);
        const matchesArea = item.affectedAreas.some((a: string) => a.toLowerCase().includes(q));
        if (!matchesTitle && !matchesReason && !matchesArea) return false;
      }

      return true;
    });
  }, [disruptions, activeTab, selectedRegion, searchQuery]);

  // Filtered Water Schedules
  const filteredSchedules = useMemo(() => {
    return waterSchedules.filter((sched) => {
      if (selectedRegion !== 'all' && sched.region !== selectedRegion) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesArea = sched.area.toLowerCase().includes(q);
        const matchesBorough = sched.boroughOrTown.toLowerCase().includes(q);
        const matchesPlant = sched.treatmentPlant.toLowerCase().includes(q);
        if (!matchesArea && !matchesBorough && !matchesPlant) return false;
      }

      return true;
    });
  }, [waterSchedules, selectedRegion, searchQuery]);

  // Filtered Telecom & Cable TV Notices
  const filteredTelecom = useMemo(() => {
    return telecomNotices.filter((item) => {
      if (selectedRegion !== 'all' && item.region !== selectedRegion && item.region !== 'Nationwide') {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesHeadline = item.headline.toLowerCase().includes(q);
        const matchesProvider = item.providerName.toLowerCase().includes(q);
        const matchesArea = item.affectedAreas.some((a: string) => a.toLowerCase().includes(q));
        if (!matchesHeadline && !matchesProvider && !matchesArea) return false;
      }

      return true;
    });
  }, [telecomNotices, selectedRegion, searchQuery]);

  // Filtered Community Reports
  const filteredReports = useMemo(() => {
    return communityReports.filter((rep) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return rep.location.toLowerCase().includes(q) || rep.summary.toLowerCase().includes(q);
      }
      return true;
    });
  }, [communityReports, searchQuery]);

  // Handlers
  const handleToggleConfirm = (reportId: string) => {
    const { confirmed, allConfirmed } = Storage.toggleConfirmUtilityReport(reportId);
    setConfirmedIds([...allConfirmed]);
    setCommunityReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          return {
            ...r,
            confirmations: r.confirmations + (confirmed ? 1 : -1),
          };
        }
        return r;
      })
    );
    onShowToast(confirmed ? 'Outage confirmation recorded' : 'Confirmation withdrawn');
  };

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportLocation.trim() || !reportSummary.trim()) {
      onShowToast('Please specify a location and brief description of the outage');
      return;
    }

    const created = Storage.addUtilityReport({
      providerId: reportProvider,
      category: reportCategory,
      location: reportLocation.trim(),
      summary: reportSummary.trim(),
    });

    setCommunityReports((prev) => [created, ...prev]);
    setIsReportModalOpen(false);
    setReportLocation('');
    setReportSummary('');
    onShowToast('Outage report published to community utility radar');
  };

  const getStatusBadge = (status: DisruptionStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-400 border border-red-800">
            Active Outage
          </span>
        );
      case 'scheduled':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-400 border border-amber-800">
            Scheduled Maintenance
          </span>
        );
      case 'restoring':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-400 border border-blue-800">
            Pressurizing / Restoring
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800">
            Service Restored
          </span>
        );
    }
  };

  const getPressureBadge = (status: WaterSchedule['pressureStatus']) => {
    switch (status) {
      case 'Normal Pressure':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">Normal Pressure</span>;
      case 'Low Pressure':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">Low Pressure</span>;
      case 'Off-Supply / Rotational':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800">Rotational Schedule</span>;
      case 'Truck-Borne Priority':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">Truck-Borne Priority</span>;
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Top Utility Mission Control Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden w-full max-w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-lg border border-amber-500 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Trinidad & Tobago Utilities Radar
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                  Live Service Grid
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Planned disruptions, water schedules & cable/internet status for T&TEC, WASA, Amplia, Flow, Digicel+, and bmobile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefreshUtilities}
              disabled={isRefreshingUtilities}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors active:scale-95"
              title="Refresh live telemetry for T&TEC, WASA, and telecom grids"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshingUtilities ? 'animate-spin' : ''}`} />
              <span>{isRefreshingUtilities ? 'Syncing...' : lastSyncTime}</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-950 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Report Outage</span>
            </button>

            <button
              onClick={onOpenNotifications}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-400 border border-slate-700 text-xs font-semibold active:scale-95 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Utility Alerts</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          {/* T&TEC KPI */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>T&TEC Electricity Grid</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-base font-black text-amber-400 mt-1">
              {disruptions.filter((d) => d.providerId === 'ttec').length} Maintenance Bulletins
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              Hotline: 800-TTEC (8832)
            </div>
          </div>

          {/* WASA KPI */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>WASA Water Grid</span>
              <Droplet className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-base font-black text-cyan-400 mt-1">
              Caroni Main Repair
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              Truck-Borne: 800-4420
            </div>
          </div>

          {/* Telecom & Cable TV KPI */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Cable TV & Broadband</span>
              <Tv className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-base font-black text-white mt-1">
              4 Providers Tracked
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              Amplia • Flow • Digicel • bmobile
            </div>
          </div>

          {/* Citizen Reports KPI */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Community Outages</span>
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-base font-black text-white mt-1">
              {communityReports.length} Reports Logged
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              Crowdsourced Trinbago Radar
            </div>
          </div>
        </div>
      </div>

      {/* Official Provider Quick Access Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {Object.values(UTILITY_PROVIDERS_META).map((prov) => (
          <a
            key={prov.id}
            href={prov.website}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col justify-between group transition-all shadow-sm"
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className={`text-xs font-black px-1.5 py-0.5 rounded border ${prov.badgeBg} ${prov.badgeBorder} ${prov.badgeText}`}>
                {prov.name}
              </span>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors" />
            </div>
            <span className="text-[11px] font-semibold text-slate-200 line-clamp-1">
              {prov.fullName.split(' ')[0]} {prov.name === 'T&TEC' ? 'Power' : prov.name === 'WASA' ? 'Water' : 'Telecom'}
            </span>
            <span className="text-[10px] text-slate-400 truncate mt-1">
              {prov.hotline.split('/')[0]}
            </span>
          </a>
        ))}
      </div>

      {/* Navigation Sub-Tabs using CarouselTabs */}
      <div className="border-b border-slate-800 pb-2">
        <CarouselTabs<UtilitySubTab>
          items={SUB_TAB_ITEMS}
          activeId={activeTab}
          onSelect={setActiveTab}
          ariaLabel="Utility Sections"
          showArrows
        />
      </div>

      {/* Controls: Region Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Region Carousel Filter */}
        <div className="flex-1 sm:max-w-md min-w-0">
          <CarouselTabs<'all' | TrinidadRegion>
            items={REGION_FILTER_ITEMS}
            activeId={selectedRegion}
            onSelect={setSelectedRegion}
            ariaLabel="Region Filter"
          />
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search town, plant, or outage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-900 text-slate-100 placeholder-slate-500 text-sm rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: T&TEC & WASA PLANNED DISRUPTIONS & OUTAGES */}
      {(activeTab === 'all' || activeTab === 'ttec' || activeTab === 'wasa') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>
                  {activeTab === 'ttec'
                    ? 'T&TEC Planned Disruptions & Load Schedules'
                    : activeTab === 'wasa'
                    ? 'WASA Plant Disruptions & Pipeline Repairs'
                    : 'Active & Scheduled Utility Disruptions'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Official notices sourced from T&TEC and WASA engineering divisions
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              {filteredDisruptions.length} Notices
            </span>
          </div>

          {filteredDisruptions.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-200">No active disruptions matching your search</h4>
              <p className="text-xs text-slate-400 mt-1">
                Normal electricity and water distribution active for the selected area.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDisruptions.map((item) => {
                const isTtec = item.providerId === 'ttec';
                return (
                  <div
                    key={item.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            isTtec 
                              ? 'bg-amber-950 text-amber-400 border-amber-800' 
                              : 'bg-cyan-950 text-cyan-400 border-cyan-800'
                          }`}>
                            {item.providerName}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {item.region} Region
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          <DataOriginBadge origin={item.dataOrigin} />
                          {getStatusBadge(item.status)}
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm sm:text-base font-bold text-slate-100 mb-2 leading-snug">
                        {item.title}
                      </h4>

                      {/* Reason Description */}
                      <p className="text-xs text-slate-300 leading-relaxed mb-3 font-serif">
                        {item.reason}
                      </p>

                      {/* Scheduled Time Banner */}
                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-850 mb-3 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Schedule: {item.scheduledTime}</span>
                        </div>
                        {item.estimatedRestoration && (
                          <div className="text-[11px] text-slate-400">
                            Est. Restoration: {item.estimatedRestoration}
                          </div>
                        )}
                      </div>

                      {/* Affected Communities */}
                      <div className="mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Affected Areas & Streets:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {item.affectedAreas.map((area: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[11px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Strip */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${item.hotline.replace(/[^0-9]/g, '')}`}
                          className="flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors font-medium"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                          <span>{item.hotline}</span>
                        </a>
                      </div>

                      <a
                        href={item.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                      >
                        <span>Official Bulletin</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: WASA WATER SUPPLY SCHEDULES */}
      {(activeTab === 'all' || activeTab === 'schedules') && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>WASA Rotational Water Schedules</span>
              </h3>
              <p className="text-xs text-slate-400">
                Official distribution schedules, supply hours, and truck-borne priority hotlines
              </p>
            </div>
            <a
              href="https://www.wasa.gov.tt/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>WASA Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSchedules.map((sched) => (
              <div
                key={sched.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {sched.boroughOrTown} • {sched.region}
                    </span>
                    {getPressureBadge(sched.pressureStatus)}
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 mb-2">
                    {sched.area}
                  </h4>

                  <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/80 p-2.5 rounded-lg border border-slate-850 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Days:</span>
                      <span className="font-semibold text-white">{sched.scheduleDays}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Hours:</span>
                      <span className="font-semibold text-white">{sched.supplyHours}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Plant Source:</span>
                      <span className="text-cyan-400 truncate max-w-[150px]">{sched.treatmentPlant}</span>
                    </div>
                  </div>

                  {sched.notes && (
                    <p className="text-[11px] text-slate-400 mb-3 italic">
                      {sched.notes}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Truck Water Dispatch:</span>
                  <a
                    href="tel:8004420"
                    className="font-bold text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>800-4420</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: CABLE TV & INTERNET PROVIDERS (AMPLIA, FLOW, DIGICEL, BMOBILE) */}
      {(activeTab === 'all' || activeTab === 'telecom') && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tv className="w-4 h-4 text-purple-400" />
                <span>Cable TV & Broadband Providers (Amplia, Flow, Digicel+, bmobile)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Fiber internet uptime, digital cable TV advisories, and carrier customer care contacts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTelecom.map((item) => {
              const meta = UTILITY_PROVIDERS_META[item.providerId as UtilityProviderId];
              return (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}`}>
                          {item.providerName}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {item.serviceType}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <DataOriginBadge origin={item.dataOrigin} />
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'operational'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : item.status === 'maintenance'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}>
                          {item.status === 'operational' ? 'Operational' : item.status === 'maintenance' ? 'Scheduled Upgrade' : 'Degraded Signal'}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-100 mb-2 leading-snug">
                      {item.headline}
                    </h4>

                    <div className="mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Affected Environs:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.affectedAreas.map((area: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[11px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Hotlines */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <a
                        href={`tel:${item.supportHotline.split('/')[0].replace(/[^0-9]/g, '')}`}
                        className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors font-medium"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-purple-400" />
                        <span>{item.supportHotline}</span>
                      </a>
                      {item.whatsappSupport && (
                        <a
                          href={`https://api.whatsapp.com/send?phone=${item.whatsappSupport.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-emerald-400 hover:underline"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>

                    <a
                      href={item.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: CITIZEN OUTAGE REPORTS */}
      {(activeTab === 'all' || activeTab === 'community') && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-emerald-400" />
                <span>Crowdsourced Citizen Outage Radar</span>
              </h3>
              <p className="text-xs text-slate-400">
                Live field reports logged by Trinbagonians experiencing localized disruptions
              </p>
            </div>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow active:scale-95 transition-all"
            >
              Report New Issue
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredReports.map((rep) => {
              const meta = UTILITY_PROVIDERS_META[rep.providerId];
              const isConfirmed = confirmedIds.includes(rep.id);
              return (
                <div
                  key={rep.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}`}>
                          {meta.name}
                        </span>
                        <span className="text-[11px] font-bold text-slate-200">
                          {rep.location}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">{rep.reportedTime}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {rep.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      {rep.confirmations} community members affected
                    </span>
                    <button
                      onClick={() => handleToggleConfirm(rep.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        isConfirmed
                          ? 'bg-red-600 text-white border-red-500 shadow-sm'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isConfirmed ? 'fill-current' : ''}`} />
                      <span>{isConfirmed ? 'Confirmed' : 'Confirm Same Here'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: REPORT UTILITY OUTAGE */}
      {isReportModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
          onClick={() => setIsReportModalOpen(false)}
        >
          <div
            className="w-full sm:max-w-lg bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl relative my-0 sm:my-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 flex flex-col pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle Bar */}
            <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto mb-3 sm:hidden shrink-0" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Report Utility Disruption</h3>
                  <p className="text-xs text-slate-400">Log electricity, water, or cable/internet outages</p>
                </div>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReport} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Select Utility Provider:
                </label>
                <select
                  value={reportProvider}
                  onChange={(e) => {
                    const p = e.target.value as UtilityProviderId;
                    setReportProvider(p);
                    if (p === 'ttec') setReportCategory('electricity');
                    else if (p === 'wasa') setReportCategory('water');
                    else setReportCategory('telecom');
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-red-500"
                >
                  <option value="ttec">T&TEC (Electricity)</option>
                  <option value="wasa">WASA (Water & Sewerage)</option>
                  <option value="amplia">Amplia (Fiber Internet / Cable TV)</option>
                  <option value="flow">Flow (Broadband / Cable TV)</option>
                  <option value="digicel">Digicel+ (Home Fiber / TV / Mobile)</option>
                  <option value="bmobile">bmobile / TSTT (Broadband / TV / Mobile)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Location (Borough, Town, or Street):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chaguanas, Endeavour Road / San Fernando, Vistabella"
                  value={reportLocation}
                  onChange={(e) => setReportLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Description of Issue:
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Power went out 20 mins ago; transformer flashed on corner pole..."
                  value={reportSummary}
                  onChange={(e) => setReportSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-red-500 font-sans"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Outage Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
