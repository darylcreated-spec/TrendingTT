import type { 
  UtilityDisruption, 
  WaterSchedule, 
  TelecomStatus, 
  UtilityReport, 
  UtilityProviderId 
} from '../types';

export interface ProviderMeta {
  id: UtilityProviderId;
  name: string;
  fullName: string;
  category: 'electricity' | 'water' | 'telecom';
  website: string;
  hotline: string;
  whatsapp?: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  tagline: string;
}

export const UTILITY_PROVIDERS_META: Record<UtilityProviderId, ProviderMeta> = {
  ttec: {
    id: 'ttec',
    name: 'T&TEC',
    fullName: 'Trinidad and Tobago Electricity Commission',
    category: 'electricity',
    website: 'https://ttec.co.tt/',
    hotline: '800-TTEC (8832) / 800-BULB (2852)',
    whatsapp: '800-8832',
    badgeBg: 'bg-amber-950/80',
    badgeBorder: 'border-amber-700/80',
    badgeText: 'text-amber-400',
    tagline: 'National Electricity Grid & Power Transmission'
  },
  wasa: {
    id: 'wasa',
    name: 'WASA',
    fullName: 'Water and Sewerage Authority of Trinidad & Tobago',
    category: 'water',
    website: 'https://www.wasa.gov.tt/',
    hotline: '800-4420 / 800-4426',
    whatsapp: '709-7793 (Customer Care)',
    badgeBg: 'bg-cyan-950/80',
    badgeBorder: 'border-cyan-700/80',
    badgeText: 'text-cyan-400',
    tagline: 'Municipal Water Production, Reservoirs & Rotations'
  },
  amplia: {
    id: 'amplia',
    name: 'Amplia',
    fullName: 'Amplia Communications Limited',
    category: 'telecom',
    website: 'https://amplia.co.tt/',
    hotline: '800-2675 / 800-AMPLIA',
    whatsapp: '790-2675',
    badgeBg: 'bg-purple-950/80',
    badgeBorder: 'border-purple-700/80',
    badgeText: 'text-purple-400',
    tagline: 'Fiber Broadband, Voice & Amplia Cable TV'
  },
  flow: {
    id: 'flow',
    name: 'Flow',
    fullName: 'Flow Trinidad (Cable & Wireless)',
    category: 'telecom',
    website: 'https://discoverflow.co/trinidad/',
    hotline: '223-FLOW (3569)',
    whatsapp: '497-3569',
    badgeBg: 'bg-blue-950/80',
    badgeBorder: 'border-blue-700/80',
    badgeText: 'text-blue-400',
    tagline: 'Broadband Internet, Landline & Digital Cable TV'
  },
  digicel: {
    id: 'digicel',
    name: 'Digicel+',
    fullName: 'Digicel Trinidad & Tobago (Digicel+)',
    category: 'telecom',
    website: 'https://www.digicelgroup.com/tt/en.html',
    hotline: '100 (Mobile) / 399-5353',
    whatsapp: '399-CARE',
    badgeBg: 'bg-red-950/80',
    badgeBorder: 'border-red-700/80',
    badgeText: 'text-red-400',
    tagline: 'Home Fiber, Digicel TV & 4G/LTE Mobile Network'
  },
  bmobile: {
    id: 'bmobile',
    name: 'bmobile',
    fullName: 'bmobile / Telecommunications Services of Trinidad & Tobago (TSTT)',
    category: 'telecom',
    website: 'https://bmobile.co.tt/',
    hotline: '824-TSTT (8788) / *100',
    whatsapp: '789-TSTT',
    badgeBg: 'bg-emerald-950/80',
    badgeBorder: 'border-emerald-700/80',
    badgeText: 'text-emerald-400',
    tagline: 'National Fixed Broadband, Mobile 4G/5G & Cable TV'
  }
};

export const INITIAL_UTILITY_DISRUPTIONS: UtilityDisruption[] = [
  // T&TEC Disruptions & Planned Maintenance
  {
    id: 'ttec-diegomartin-01',
    providerId: 'ttec',
    providerName: 'T&TEC',
    category: 'electricity',
    title: 'Planned High-Voltage Reconductoring & Pole Upgrades',
    reason: 'Upgrading primary 12kV feeder lines to reinforce grid resilience and replace aging wooden distribution poles.',
    affectedAreas: [
      'Diego Martin Main Road (from St. Lucien Road to Diamond Vale)',
      'Richplain Road',
      'Covigne Road',
      'Victoria Gardens (partial)'
    ],
    region: 'North',
    scheduledTime: 'Tomorrow: 8:30 AM - 4:00 PM AST',
    estimatedRestoration: 'Tomorrow at 4:00 PM AST',
    status: 'scheduled',
    updatedAt: '1 hour ago',
    hotline: '800-TTEC (8832)',
    officialUrl: 'https://ttec.co.tt/default/outages',
    bulletinNumber: 'TTEC-NOR-2026-084'
  },
  {
    id: 'ttec-arima-02',
    providerId: 'ttec',
    providerName: 'T&TEC',
    category: 'electricity',
    title: 'Emergency Underground Cable Fault Isolation',
    reason: 'Tripped circuit breaker on Sub-Station B feeder due to heavy moisture infiltration. Emergency crews dispatched to test and splice damaged cable section.',
    affectedAreas: [
      'Malabar Phases 1 & 2',
      'Subero Street',
      'Pro Queen Street',
      'Eastern Main Road, Arima'
    ],
    region: 'East',
    scheduledTime: 'Immediate Response',
    estimatedRestoration: 'Within 2 to 3 hours',
    status: 'active',
    updatedAt: '25 mins ago',
    hotline: '800-TTEC (8832)',
    officialUrl: 'https://ttec.co.tt/',
    bulletinNumber: 'TTEC-EST-2026-EM09'
  },
  {
    id: 'ttec-chaguanas-03',
    providerId: 'ttec',
    providerName: 'T&TEC',
    category: 'electricity',
    title: 'Routine Transformer Maintenance & Overhead Vegetation Trimming',
    reason: 'Clearing overgrown bamboo and tree branches near 66kV transmission towers along the Uriah Butler corridor to prevent localized trip-outs.',
    affectedAreas: [
      'Montrose Main Road',
      'Longdenville Old Road',
      'Caparo Valley Brasso Road (Parts)',
      'Edinburgh 500'
    ],
    region: 'Central',
    scheduledTime: 'Wednesday: 9:00 AM - 3:00 PM AST',
    estimatedRestoration: 'Wednesday at 3:00 PM AST',
    status: 'scheduled',
    updatedAt: '3 hours ago',
    hotline: '800-TTEC (8832)',
    officialUrl: 'https://ttec.co.tt/',
    bulletinNumber: 'TTEC-CEN-2026-042'
  },
  {
    id: 'ttec-sanfernando-04',
    providerId: 'ttec',
    providerName: 'T&TEC',
    category: 'electricity',
    title: 'Distribution Line Re-routing for Highway Expansion',
    reason: 'Planned relocation of transmission towers adjacent to the Tarouba Link Road intersection in coordination with the Ministry of Works.',
    affectedAreas: [
      'Tarouba Housing Scheme',
      'Marabella (East of Southern Main Road)',
      'Union Park East',
      'Palmyra Village'
    ],
    region: 'South',
    scheduledTime: 'Friday: 8:00 AM - 2:00 PM AST',
    estimatedRestoration: 'Friday at 2:00 PM AST',
    status: 'scheduled',
    updatedAt: '4 hours ago',
    hotline: '800-TTEC (8832)',
    officialUrl: 'https://ttec.co.tt/',
    bulletinNumber: 'TTEC-SOU-2026-061'
  },
  {
    id: 'ttec-tobago-05',
    providerId: 'ttec',
    providerName: 'T&TEC',
    category: 'electricity',
    title: 'Signal Hill Sub-Station Switchgear Servicing',
    reason: 'Preventative diagnostic testing on 33kV switchgear units supplying Southwest Tobago.',
    affectedAreas: [
      'Signal Hill',
      'Patience Hill',
      'Lambeau',
      'Lowlands (partial)'
    ],
    region: 'Tobago',
    scheduledTime: 'Saturday: 7:00 AM - 1:00 PM AST',
    estimatedRestoration: 'Saturday at 1:00 PM AST',
    status: 'scheduled',
    updatedAt: '5 hours ago',
    hotline: '800-TTEC (8832)',
    officialUrl: 'https://ttec.co.tt/',
    bulletinNumber: 'TTEC-TOB-2026-018'
  },

  // WASA Disruptions & Main Repairs
  {
    id: 'wasa-caroni-leak-01',
    providerId: 'wasa',
    providerName: 'WASA',
    category: 'water',
    title: 'Emergency Repairs on 48-inch Caroni Transmission Main',
    reason: 'Major rupture on the southern transmission line located in Valsayn near the Churchill Roosevelt Highway intersection. Crews excavating and installing heavy-duty sleeve clamps.',
    affectedAreas: [
      'Port of Spain: Downtown, St. James, Woodbrook, Belmont',
      'San Juan, Barataria, Champs Fleurs, Mt. Hope',
      'Caroni, Kelly Village, Cunupia, Chaguanas, Endeavour',
      'Couva, Point Lisas Industrial Estate, California'
    ],
    region: 'Central',
    scheduledTime: 'Emergency Isolation Underway',
    estimatedRestoration: 'Restoration within 24 to 36 hours; line pressurization underway',
    status: 'restoring',
    updatedAt: '35 mins ago',
    hotline: '800-4420 / 800-4426',
    officialUrl: 'https://www.wasa.gov.tt/',
    bulletinNumber: 'WASA-PR-2026-092'
  },
  {
    id: 'wasa-navet-02',
    providerId: 'wasa',
    providerName: 'WASA',
    category: 'water',
    title: 'Scheduled Electrical & Mechanical Overhaul at Navet WTP',
    reason: 'Comprehensive servicing of high-lift transmission pumps and intake bar screens in joint coordination with T&TEC engineers.',
    affectedAreas: [
      'Princes Town (all environs)',
      'Tableland, New Grant, Craignish',
      'Williamsville, Borde Narve',
      'Rio Claro, Mayaro (rotational areas)',
      'St. Julien Village'
    ],
    region: 'South',
    scheduledTime: 'Thursday: 8:00 AM - 8:00 PM AST',
    estimatedRestoration: 'Normal pressures returning 12-24 hours post-recommissioning',
    status: 'scheduled',
    updatedAt: '2 hours ago',
    hotline: '800-4420 / 800-4426',
    officialUrl: 'https://www.wasa.gov.tt/',
    bulletinNumber: 'WASA-PR-2026-088'
  },
  {
    id: 'wasa-oropouche-03',
    providerId: 'wasa',
    providerName: 'WASA',
    category: 'water',
    title: 'Low Raw Water Inflow & Desilting at North Oropouche Plant',
    reason: 'Accumulated silt at river intake impoundment reducing processing throughput to 70% capacity.',
    affectedAreas: [
      'Sangre Grande Town',
      'Vega de Oropouche',
      'Valencia',
      'Manzanilla',
      'Guaico / Tamana'
    ],
    region: 'East',
    scheduledTime: 'Desilting in Progress',
    estimatedRestoration: 'Full 100% capacity expected by tomorrow evening',
    status: 'active',
    updatedAt: '3 hours ago',
    hotline: '800-4420',
    officialUrl: 'https://www.wasa.gov.tt/',
    bulletinNumber: 'WASA-PR-2026-079'
  },
  {
    id: 'wasa-hillsborough-04',
    providerId: 'wasa',
    providerName: 'WASA',
    category: 'water',
    title: 'Hillsborough Dam Raw Water Filter Bed Rehabilitation',
    reason: 'Replacement of silica sand and activated carbon media to maintain regulatory potable water purity standards.',
    affectedAreas: [
      'Hope Village',
      'John Dial',
      'Bacolet',
      'Mount St. George'
    ],
    region: 'Tobago',
    scheduledTime: 'Wednesday: 9:00 AM - 5:00 PM AST',
    estimatedRestoration: 'Wednesday at 7:00 PM AST',
    status: 'scheduled',
    updatedAt: '5 hours ago',
    hotline: '800-4420 (Tobago Desk)',
    officialUrl: 'https://www.wasa.gov.tt/',
    bulletinNumber: 'WASA-TOB-2026-014'
  }
];

export const INITIAL_WATER_SCHEDULES: WaterSchedule[] = [
  {
    id: 'sched-pos-01',
    area: 'Woodbrook, Newtown & St. Clair',
    boroughOrTown: 'Port of Spain',
    region: 'North',
    treatmentPlant: 'Caroni WTP / Maraval Reservoir',
    scheduleDays: 'Daily Service',
    supplyHours: '5:00 AM - 10:00 PM AST',
    pressureStatus: 'Normal Pressure',
    truckBorneContact: '800-4420 / 624-5511',
    notes: 'Direct feed from St. Clair booster station; high pressure zone.'
  },
  {
    id: 'sched-diegomartin-02',
    area: 'Diamond Vale, Blue Range & St. Lucien Road',
    boroughOrTown: 'Diego Martin',
    region: 'North',
    treatmentPlant: 'River Estate Pumping Station / Caroni WTP',
    scheduleDays: 'Mondays, Wednesdays & Saturdays',
    supplyHours: '6:00 AM - 6:00 PM AST',
    pressureStatus: 'Normal Pressure',
    truckBorneContact: '800-4420',
    notes: 'Residents on upper elevation (Richplain) receive water 2 hours later due to line pressurization.'
  },
  {
    id: 'sched-sanjuan-03',
    area: 'San Juan, Barataria & Febeau Village',
    boroughOrTown: 'San Juan / Laventille',
    region: 'North',
    treatmentPlant: 'Caroni WTP',
    scheduleDays: 'Tuesdays, Thursdays & Sundays',
    supplyHours: '5:00 AM - 7:00 PM AST',
    pressureStatus: 'Normal Pressure',
    truckBorneContact: '800-4420',
    notes: 'Rotational valving scheme in effect for upper Febeau.'
  },
  {
    id: 'sched-chaguanas-04',
    area: 'Chaguanas Central, Enterprise & Montrose',
    boroughOrTown: 'Chaguanas',
    region: 'Central',
    treatmentPlant: 'Caroni WTP / Freeport Wells',
    scheduleDays: 'Mondays, Thursdays & Saturdays',
    supplyHours: '6:00 AM - 4:00 PM AST',
    pressureStatus: 'Low Pressure',
    truckBorneContact: '800-4420 / WhatsApp: 709-7793',
    notes: 'Pressures reduced along Southern Main Road due to ongoing transmission adjustments.'
  },
  {
    id: 'sched-cunupia-05',
    area: 'Cunupia, Warrenville & Munroe Road',
    boroughOrTown: 'Caroni East',
    region: 'Central',
    treatmentPlant: 'Caroni WTP',
    scheduleDays: 'Wednesdays, Fridays & Sundays',
    supplyHours: '6:00 AM - 8:00 PM AST',
    pressureStatus: 'Normal Pressure',
    truckBorneContact: '800-4420',
    notes: 'Consistent scheduled feed maintained.'
  },
  {
    id: 'sched-couva-06',
    area: 'Couva Town, California & Point Lisas',
    boroughOrTown: 'Couva / Tabaquite / Talparo',
    region: 'Central',
    treatmentPlant: 'Desalcott Desalination Plant / Caroni WTP',
    scheduleDays: 'Mondays, Wednesdays & Fridays',
    supplyHours: '5:00 AM - 5:00 PM AST',
    pressureStatus: 'Normal Pressure',
    truckBorneContact: '800-4420',
    notes: 'Point Lisas Industrial priority line isolated from residential grid.'
  },
  {
    id: 'sched-sanfernando-07',
    area: 'San Fernando City, Vistabella & Marabella',
    boroughOrTown: 'San Fernando',
    region: 'South',
    treatmentPlant: 'Navet WTP / Desalcott',
    scheduleDays: 'Tuesdays, Thursdays, Saturdays & Sundays',
    supplyHours: '6:00 AM - 9:00 PM AST',
    pressureStatus: 'Normal Pressure',
    truckBorneContact: '800-4420 / 652-3211',
    notes: 'San Fernando Hill booster operational.'
  },
  {
    id: 'sched-penal-08',
    area: 'Penal, Debe, Barrackpore & Clarke Road',
    boroughOrTown: 'Penal / Debe',
    region: 'South',
    treatmentPlant: 'Navet WTP / Penal Booster',
    scheduleDays: 'Mondays & Thursdays Only',
    supplyHours: '4:00 AM - 2:00 PM AST',
    pressureStatus: 'Off-Supply / Rotational',
    truckBorneContact: '800-4420 / 800-4426 (Direct Truck Line)',
    notes: 'High priority truck-borne distribution zone. Residents with empty tanks can request emergency water tender.'
  },
  {
    id: 'sched-pointfortin-09',
    area: 'Point Fortin Town, Clifton Hill & Guapo',
    boroughOrTown: 'Point Fortin',
    region: 'South',
    treatmentPlant: 'Point Fortin Desalination Facility',
    scheduleDays: 'Tuesdays, Fridays & Sundays',
    supplyHours: '6:00 AM - 6:00 PM AST',
    pressureStatus: 'Low Pressure',
    truckBorneContact: '800-4420',
    notes: 'Distribution augmented via Cap-de-Ville booster.'
  },
  {
    id: 'sched-arima-10',
    area: 'Arima Borough, Malabar & D\'Abadie',
    boroughOrTown: 'Arima',
    region: 'East',
    treatmentPlant: 'Guanapo WTP / Hollis WTP',
    scheduleDays: 'Daily Scheduled',
    supplyHours: '5:00 AM - 8:00 PM AST',
    pressureStatus: 'Normal Pressure',
    truckBorneContact: '800-4420',
    notes: 'Hollis reservoir capacity steady at 74%.'
  },
  {
    id: 'sched-sangregrande-11',
    area: 'Sangre Grande, Coalmine & Ojoe Road',
    boroughOrTown: 'Sangre Grande',
    region: 'East',
    treatmentPlant: 'North Oropouche WTP',
    scheduleDays: 'Mondays, Wednesdays, Fridays & Saturdays',
    supplyHours: '6:00 AM - 6:00 PM AST',
    pressureStatus: 'Low Pressure',
    truckBorneContact: '800-4420',
    notes: 'Desilting operations causing slight flow reduction.'
  },
  {
    id: 'sched-scarborough-12',
    area: 'Scarborough, Bacolet & Signal Hill',
    boroughOrTown: 'Tobago',
    region: 'Tobago',
    treatmentPlant: 'Hillsborough WTP / Courland WTP',
    scheduleDays: 'Mondays, Wednesdays, Fridays & Sundays',
    supplyHours: '6:00 AM - 8:00 PM AST',
    pressureStatus: 'Normal Pressure',
    truckBorneContact: '800-4420 (Tobago Regional Office)',
    notes: 'Normal schedule in effect across central ridge.'
  }
];

export const INITIAL_TELECOM_NOTICES: TelecomStatus[] = [
  // Amplia Communications
  {
    id: 'telecom-amplia-01',
    providerId: 'amplia',
    providerName: 'Amplia',
    serviceType: 'Fiber Internet',
    headline: 'Planned Core Backbone Maintenance (South & Central Trinidad)',
    affectedAreas: [
      'Chaguanas (Montrose, Brentwood, Edinburgh 500)',
      'Couva (Point Lisas, Roystonia)',
      'San Fernando (South Park, Tarouba, Marabella)'
    ],
    region: 'Central',
    status: 'maintenance',
    supportHotline: '800-2675 / 800-AMPLIA',
    whatsappSupport: '790-2675',
    officialUrl: 'https://amplia.co.tt/',
    updatedAt: '1 hour ago'
  },
  {
    id: 'telecom-amplia-02',
    providerId: 'amplia',
    providerName: 'Amplia',
    serviceType: 'Cable TV',
    headline: 'High-Definition Channel Transponder Migration Complete',
    affectedAreas: ['Nationwide (All Amplia TV subscribers)'],
    region: 'Nationwide',
    status: 'operational',
    supportHotline: '800-2675',
    officialUrl: 'https://amplia.co.tt/',
    updatedAt: '4 hours ago'
  },

  // Flow Trinidad
  {
    id: 'telecom-flow-01',
    providerId: 'flow',
    providerName: 'Flow',
    serviceType: 'Cable TV',
    headline: 'Scheduled Digital Head-End Frequency Optimization',
    affectedAreas: [
      'Diego Martin (Diamond Vale, Victoria Gardens)',
      'Port of Spain (Woodbrook, Newtown, St. James)',
      'Maraval (Saddle Road)'
    ],
    region: 'North',
    status: 'maintenance',
    supportHotline: '223-FLOW (3569)',
    whatsappSupport: '497-3569',
    officialUrl: 'https://discoverflow.co/trinidad/',
    updatedAt: '2 hours ago'
  },
  {
    id: 'telecom-flow-02',
    providerId: 'flow',
    providerName: 'Flow',
    serviceType: 'Fiber Internet',
    headline: 'Broadband DOCSIS 3.1 & Pure Fiber Network Operating Normally',
    affectedAreas: ['Nationwide'],
    region: 'Nationwide',
    status: 'operational',
    supportHotline: '223-FLOW (3569)',
    officialUrl: 'https://discoverflow.co/trinidad/',
    updatedAt: '5 hours ago'
  },

  // Digicel+
  {
    id: 'telecom-digicel-01',
    providerId: 'digicel',
    providerName: 'Digicel+',
    serviceType: 'Fiber Internet',
    headline: 'Emergency Fiber Cut Repair on Churchill Roosevelt Highway',
    affectedAreas: [
      'Trincity (Trincity Mall, Millennium Lakes)',
      'Tacarigua',
      'Arouca (Golden Grove Road)'
    ],
    region: 'East',
    status: 'degraded',
    supportHotline: '100 (Mobile) / 399-5353',
    whatsappSupport: '399-CARE',
    officialUrl: 'https://www.digicelgroup.com/tt/en.html',
    updatedAt: '40 mins ago'
  },
  {
    id: 'telecom-digicel-02',
    providerId: 'digicel',
    providerName: 'Digicel+',
    serviceType: 'Cable TV',
    headline: 'Digicel TV Caribbean Sports & News Channels Fully Operational',
    affectedAreas: ['Nationwide'],
    region: 'Nationwide',
    status: 'operational',
    supportHotline: '399-5353',
    officialUrl: 'https://www.digicelgroup.com/tt/en.html',
    updatedAt: '6 hours ago'
  },

  // bmobile / TSTT
  {
    id: 'telecom-bmobile-01',
    providerId: 'bmobile',
    providerName: 'bmobile',
    serviceType: 'Unified Network',
    headline: 'National 4G/5G Cellular Base Station Software Upgrade',
    affectedAreas: [
      'Couva & Point Lisas',
      'Arima & D\'Abadie',
      'Princes Town'
    ],
    region: 'Central',
    status: 'maintenance',
    supportHotline: '824-TSTT (8788) / *100',
    whatsappSupport: '789-TSTT',
    officialUrl: 'https://bmobile.co.tt/',
    updatedAt: '2 hours ago'
  },
  {
    id: 'telecom-bmobile-02',
    providerId: 'bmobile',
    providerName: 'bmobile',
    serviceType: 'Fiber Internet',
    headline: 'TSTT Ultra-Fast Residential Fiber Services Operating at 99.98% Uptime',
    affectedAreas: ['Nationwide (Port of Spain, San Fernando, Tobago)'],
    region: 'Nationwide',
    status: 'operational',
    supportHotline: '824-TSTT (8788)',
    officialUrl: 'https://bmobile.co.tt/',
    updatedAt: '4 hours ago'
  }
];

export const INITIAL_UTILITY_REPORTS: UtilityReport[] = [
  {
    id: 'rep-util-01',
    providerId: 'ttec',
    category: 'electricity',
    location: 'Diego Martin, Richplain Road',
    summary: 'Power fluctuating on phase 2; transformer on pole #38 making buzzing sounds.',
    reportedTime: '15 mins ago',
    confirmations: 6,
    status: 'investigating'
  },
  {
    id: 'rep-util-02',
    providerId: 'wasa',
    category: 'water',
    location: 'Penal, Clarke Road junction',
    summary: 'Dry taps since yesterday 6 PM; scheduled supply was due this morning but lines are dry.',
    reportedTime: '28 mins ago',
    confirmations: 14,
    status: 'confirmed'
  },
  {
    id: 'rep-util-03',
    providerId: 'flow',
    category: 'cable_tv',
    location: 'Port of Spain, Woodbrook (Alberto Street)',
    summary: 'Cable TV box showing error 201; broadband connection is online but television stream is frozen.',
    reportedTime: '45 mins ago',
    confirmations: 4,
    status: 'unverified'
  },
  {
    id: 'rep-util-04',
    providerId: 'digicel',
    category: 'telecom',
    location: 'Trincity, Millennium Lakes area',
    summary: 'Red LOS light flashing on fiber optical terminal router after the cable cut on the highway.',
    reportedTime: '55 mins ago',
    confirmations: 9,
    status: 'investigating'
  }
];
