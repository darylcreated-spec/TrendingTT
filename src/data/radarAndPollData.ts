import type { 
  TrafficSegment, 
  TTMSAdvisory, 
  RiverLevelStatus, 
  TideData, 
  WASANotice, 
  CommunityReport, 
  Poll,
  MaritimeSailing 
} from '../types';

export const INITIAL_TRAFFIC_SEGMENTS: TrafficSegment[] = [
  {
    id: 'crh-valsayn',
    highwayId: 'crh',
    highwayName: 'Churchill Roosevelt Highway',
    segmentName: 'Valsayn to Curepe Interchange',
    direction: 'Eastbound',
    severity: 'heavy',
    statusText: 'Heavy backup from Kay Donna to Curepe lights',
    delayMinutes: 24,
    averageSpeedKmh: 22,
    lastUpdated: '12 mins ago',
    advisoryNote: 'Disabled flatbed truck removed near Spring Village; tailback clearing slowly.'
  },
  {
    id: 'crh-barataria',
    highwayId: 'crh',
    highwayName: 'Churchill Roosevelt Highway',
    segmentName: 'Barataria to Don Miguel flyover',
    direction: 'Westbound',
    severity: 'moderate',
    statusText: 'Moderate morning crawl towards Port of Spain',
    delayMinutes: 10,
    averageSpeedKmh: 45,
    lastUpdated: '8 mins ago'
  },
  {
    id: 'ubh-caroni',
    highwayId: 'ubh',
    highwayName: 'Uriah Butler Highway',
    segmentName: 'Grand Bazaar interchange to Caroni Flyover',
    direction: 'Southbound',
    severity: 'gridlock',
    statusText: 'Standstill traffic past Grand Bazaar merge',
    delayMinutes: 38,
    averageSpeedKmh: 14,
    lastUpdated: '5 mins ago',
    advisoryNote: 'MOWT drainage cleaning equipment occupying left lane near Caroni bridge.'
  },
  {
    id: 'ubh-chaguanas',
    highwayId: 'ubh',
    highwayName: 'Uriah Butler Highway',
    segmentName: 'Munroe Road to Chaguanas Flyover',
    direction: 'Northbound',
    severity: 'smooth',
    statusText: 'Clear running, normal highway velocity',
    delayMinutes: 0,
    averageSpeedKmh: 88,
    lastUpdated: '15 mins ago'
  },
  {
    id: 'pbr-mthope',
    highwayId: 'pbr',
    highwayName: 'Priority Bus Route',
    segmentName: 'Mount Hope to San Juan Promenade',
    direction: 'Both Directions',
    severity: 'smooth',
    statusText: 'Maxi taxis moving briskly; authorized vehicles only',
    delayMinutes: 2,
    averageSpeedKmh: 58,
    lastUpdated: '6 mins ago',
    advisoryNote: 'PTSD and TTPS transit officers active at Mount Hope intersection.'
  },
  {
    id: 'shh-claxton',
    highwayId: 'shh',
    highwayName: 'Solomon Hochoy Highway',
    segmentName: 'Chase Village to Claxton Bay Overpass',
    direction: 'Southbound',
    severity: 'moderate',
    statusText: 'Sluggish crawl heading towards San Fernando',
    delayMinutes: 14,
    averageSpeedKmh: 42,
    lastUpdated: '10 mins ago'
  },
  {
    id: 'shh-tarouba',
    highwayId: 'shh',
    highwayName: 'Solomon Hochoy Highway',
    segmentName: 'Tarouba Link to Golconda Interchange',
    direction: 'Both Directions',
    severity: 'smooth',
    statusText: 'Open highway conditions south of San Fernando',
    delayMinutes: 0,
    averageSpeedKmh: 95,
    lastUpdated: '20 mins ago'
  },
  {
    id: 'lady-young',
    highwayId: 'lady-young',
    highwayName: 'Lady Young Road',
    segmentName: 'Morvant Junction to Port of Spain Lookout',
    direction: 'Westbound',
    severity: 'heavy',
    statusText: 'Severe bottle-necking into Belmont & Savannah',
    delayMinutes: 18,
    averageSpeedKmh: 20,
    lastUpdated: '14 mins ago',
    advisoryNote: 'Slow down on corners; damp asphalt reported near Hilton ascent.'
  },
  {
    id: 'south-trunk',
    highwayId: 'south-trunk',
    highwayName: 'South Trunk Road',
    segmentName: 'Mosquito Creek stretch',
    direction: 'Both Directions',
    severity: 'flood',
    statusText: 'High tide seawater splashover; caution advised',
    delayMinutes: 28,
    averageSpeedKmh: 18,
    lastUpdated: '4 mins ago',
    advisoryNote: 'High tide peak coincides with coastal swell. Low clearance vehicles advised to take alternate routes.'
  }
];

export const INITIAL_TTMS_ADVISORY: TTMSAdvisory = {
  level: 'yellow',
  type: 'Adverse Weather Alert (Yellow Level)',
  headline: 'Isolated heavy thundershowers and localized street flooding alert for Trinidad',
  description: 'The Trinidad and Tobago Meteorological Service (TTMS) advises that an active Tropical Wave is traversing the Windward Islands. Heavy showers and isolated thunderstorms with gusty winds exceeding 45 km/h are expected, particularly over northern and central Trinidad. Street and flash flooding may cause temporary traffic disruptions.',
  issuedAt: 'Today, 05:30 AM AST',
  validUntil: 'Today, 06:00 PM AST',
  authority: 'Trinidad and Tobago Meteorological Service (TTMS) - Piarco',
  affectedAreas: [
    'Northern Range Foothills (Maraval, Santa Cruz, St. Joseph)',
    'Caroni River Basin & Plains',
    'Port of Spain & Environs',
    'South Trinidad (Penal, Debe, Barrackpore)',
    'Tobago (Crown Point, Scarborough)'
  ]
};

export const INITIAL_RIVER_LEVELS: RiverLevelStatus[] = [
  {
    id: 'caroni-elcarmen',
    basin: 'Caroni River Basin',
    station: 'El Carmen Gauge (Bamboo / Caroni)',
    percentage: 68,
    status: 'Alert',
    trend: 'rising',
    updatedAt: '25 mins ago'
  },
  {
    id: 'south-oropouche',
    basin: 'South Oropouche Basin',
    station: 'Woodland / Pluck Road River Gauge',
    percentage: 54,
    status: 'Normal',
    trend: 'steady',
    updatedAt: '30 mins ago'
  },
  {
    id: 'caparo-river',
    basin: 'Caparo River Basin',
    station: 'Mamoral / Todd\'s Road Gauge',
    percentage: 42,
    status: 'Normal',
    trend: 'steady',
    updatedAt: '18 mins ago'
  },
  {
    id: 'diego-martin',
    basin: 'Diego Martin River',
    station: 'Four Roads / St. Lucien Gauge',
    percentage: 31,
    status: 'Normal',
    trend: 'falling',
    updatedAt: '12 mins ago'
  }
];

export const INITIAL_TIDES: TideData[] = [
  {
    location: 'Port of Spain (Gulf of Paria)',
    tides: [
      { time: '04:18 AM AST', type: 'High Tide', heightMeters: '1.24m' },
      { time: '10:45 AM AST', type: 'Low Tide', heightMeters: '0.38m' },
      { time: '04:52 PM AST', type: 'High Tide', heightMeters: '1.31m' },
      { time: '11:10 PM AST', type: 'Low Tide', heightMeters: '0.41m' }
    ],
    coastalRisk: 'Normal'
  },
  {
    location: 'San Fernando / Mosquito Creek',
    tides: [
      { time: '04:40 AM AST', type: 'High Tide', heightMeters: '1.35m' },
      { time: '11:05 AM AST', type: 'Low Tide', heightMeters: '0.32m' },
      { time: '05:14 PM AST', type: 'High Tide', heightMeters: '1.42m' },
      { time: '11:32 PM AST', type: 'Low Tide', heightMeters: '0.36m' }
    ],
    coastalRisk: 'Moderate (Spring Tide)'
  }
];

export const INITIAL_WASA_NOTICES: WASANotice[] = [
  {
    id: 'wasa-caroni-01',
    facility: 'Caroni Water Treatment Plant',
    title: 'Emergency repair on 48-inch transmission main in Valsayn',
    reason: 'Transmission main leak detected adjacent to the Uriah Butler Highway. Crews currently isolating line for repairs.',
    affectedAreas: [
      'North Trinidad: Champ Fleurs, Mt. Hope, San Juan, Barataria, Port of Spain',
      'Central Trinidad: Caroni, Cunupia, Chaguanas, Felicity, Endeavour',
      'South-West: Couva, Point Lisas, Claxton Bay'
    ],
    schedule: 'Work underway; full line pressurization expected within 24 to 36 hours.',
    status: 'Restoration in Progress',
    updatedAt: '45 mins ago'
  },
  {
    id: 'wasa-navet-02',
    facility: 'Navet Water Treatment Facility',
    title: 'Scheduled electrical infrastructure upgrade',
    reason: 'Planned maintenance by T&TEC and WASA technical engineering teams to install automated surge arrestors.',
    affectedAreas: [
      'Princes Town',
      'Tableland',
      'New Grant',
      'Williamsville',
      'Rio Claro'
    ],
    schedule: 'Scheduled shutdown: Thursday 8:00 AM - 6:00 PM AST.',
    status: 'Scheduled Maintenance',
    updatedAt: '2 hours ago'
  },
  {
    id: 'wasa-desalcott-03',
    facility: 'Desalcott Desalination Plant (Point Lisas)',
    title: 'Operating at full rated 40 MGD production capacity',
    reason: 'Normal supply maintained to Point Lisas Industrial Estate and South Trinidad municipal distribution networks.',
    affectedAreas: [
      'Couva',
      'California',
      'Marabella',
      'San Fernando',
      'Penal'
    ],
    schedule: 'Normal service schedule in effect.',
    status: 'Scheduled Maintenance',
    updatedAt: '4 hours ago'
  }
];

export const INITIAL_COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: 'rep-1',
    highwayId: 'ubh',
    location: 'Grand Bazaar flyover southbound merge',
    category: 'traffic',
    summary: 'Container truck having tire trouble on left shoulder. Causing heavy rubbernecking delay.',
    reportedTime: '14 mins ago',
    confirmations: 19,
    isVerified: true
  },
  {
    id: 'rep-2',
    highwayId: 'south-trunk',
    location: 'Mosquito Creek by the shoreline revetment',
    category: 'flood',
    summary: 'Sea spray and high tide water pooling on north-bound lane. Drive cautiously.',
    reportedTime: '22 mins ago',
    confirmations: 34,
    isVerified: true
  },
  {
    id: 'rep-3',
    highwayId: 'crh',
    location: 'Piarco traffic lights (intersection with Golden Grove Road)',
    category: 'traffic',
    summary: 'Traffic lights flickering amber. Police officer directing traffic manually.',
    reportedTime: '35 mins ago',
    confirmations: 12,
    isVerified: false
  }
];

export const INITIAL_POLLS: Poll[] = [
  {
    id: 'poll-doubles',
    question: 'The Great Doubles Debate: Debe vs Curepe — which location serves the undisputed champion doubles?',
    category: 'culinary',
    tagline: 'Trinidad\'s ultimate street food rivalry',
    totalVotes: 3842,
    featured: true,
    authoritativeSource: 'Trending TT Community Poll',
    closesAt: 'In 3 days',
    options: [
      {
        id: 'debe',
        label: 'Debe (Southern Kingdom)',
        description: 'Roasted geera bara, signature chutneys, pepper balance & doubles alley vibe',
        votes: 1980
      },
      {
        id: 'curepe',
        label: 'Curepe Junction (Eastern Core)',
        description: 'Soft melt-in-your-mouth bara, sweet & roast pepper punch, legendary late-night runs',
        votes: 1420
      },
      {
        id: 'arimaprincestown',
        label: 'Arima / Princes Town (Quiet Contenders)',
        description: 'Old-school channa recipe, deep spice harmony, zero shortcuts',
        votes: 312
      },
      {
        id: 'anydoubles',
        label: 'Any hot doubles with slight pepper & kuchela!',
        description: 'Why fight when you can eat two with slight?',
        votes: 130
      }
    ]
  },
  {
    id: 'poll-speed-limits',
    question: 'Highway Speed Limits: Should the 100 km/h speed limit on Uriah Butler & Churchill Roosevelt highways be increased?',
    category: 'infrastructure',
    tagline: 'National Road Safety & Traffic Flow Review',
    totalVotes: 2470,
    featured: false,
    authoritativeSource: 'MOWT Highway Safety Discussion',
    closesAt: 'In 5 days',
    options: [
      {
        id: 'keep100',
        label: 'Keep at 100 km/h',
        description: 'Maintains road safety and limits high-speed fatal accidents on busy corridors',
        votes: 890
      },
      {
        id: 'increase110',
        label: 'Increase to 110 or 120 km/h',
        description: 'Modern cars and divided multi-lane highways can safely handle higher cruising speed',
        votes: 1145
      },
      {
        id: 'variable',
        label: 'Dynamic / Variable Speed Limits',
        description: '110 km/h off-peak; 80 km/h during heavy rain or peak hour congestion',
        votes: 435
      }
    ]
  },
  {
    id: 'poll-budget-priorities',
    question: 'National Fiscal Focus: Which sector should receive the highest emergency development funding in the next fiscal year?',
    category: 'national',
    tagline: 'Trinbago Public Sentiment & Economic Priorities',
    totalVotes: 1890,
    featured: false,
    authoritativeSource: 'Trending TT Citizen Pulse',
    closesAt: 'In 6 days',
    options: [
      {
        id: 'crime',
        label: 'Crime Prevention, TTPS Technology & Border Radar',
        description: 'CCTV surveillance, rapid response patrol vehicles, and modern detection tech',
        votes: 980
      },
      {
        id: 'drainage',
        label: 'Major Highway Drainage & Flood Infrastructure',
        description: 'Comprehensive dredging of Caroni and Caparo rivers and seawall reinforcement',
        votes: 460
      },
      {
        id: 'healthcare',
        label: 'Hospital Infrastructure & Chronic Disease Medication',
        description: 'Regional hospital bed capacity, equipment maintenance, and oncology resources',
        votes: 310
      },
      {
        id: 'food',
        label: 'Agricultural Self-Reliance & Local Food Production',
        description: 'Farmer subsidies, greenhouse technology, and curbing soaring food import bills',
        votes: 140
      }
    ]
  },
  {
    id: 'poll-pbr-access',
    question: 'Priority Bus Route: Should clean electric vehicles (EVs) or high-occupancy carpools receive PBR access passes?',
    category: 'infrastructure',
    tagline: 'Decarbonization & East-West Corridor Mobility',
    totalVotes: 1340,
    featured: false,
    authoritativeSource: 'East-West Corridor Transit Review',
    closesAt: 'In 8 days',
    options: [
      {
        id: 'strictly-transit',
        label: 'Strictly Maxis & Buses only',
        description: 'Preserve rapid public transit speeds; private cars will cause gridlock',
        votes: 790
      },
      {
        id: 'allow-evs',
        label: 'Allow verified Electric Vehicles (EVs)',
        description: 'Incentivize eco-friendly transport and national green transition',
        votes: 320
      },
      {
        id: 'carpools',
        label: 'Allow Carpools with 3+ passengers during off-peak',
        description: 'Maximizes corridor throughput without delaying PTSC buses',
        votes: 230
      }
    ]
  }
];

export const INITIAL_MARITIME_SAILINGS: MaritimeSailing[] = [
  {
    id: 'ferry-apt-james-morning',
    serviceType: 'tobago-ferry',
    vesselName: 'A.P.T. James (Fast Ferry)',
    route: 'Port of Spain ➔ Scarborough',
    origin: 'Port of Spain Ferry Terminal',
    destination: 'Scarborough Port, Tobago',
    departureTime: '6:30 AM AST',
    estimatedArrival: '9:30 AM AST (3h sailing)',
    status: 'On Schedule',
    passengerCapacityPercent: 88,
    vehicleCapacityPercent: 95,
    terminalNotice: 'Vehicle check-in closes 2 hours before departure (4:30 AM). Valid national ID required.',
    ticketBookingUrl: 'https://ttitferry.com/',
    hotline: '625-3055 / 639-2417',
    lastUpdated: '10 mins ago'
  },
  {
    id: 'ferry-buccoo-reef-afternoon',
    serviceType: 'tobago-ferry',
    vesselName: 'Buccoo Reef (Fast Ferry)',
    route: 'Scarborough ➔ Port of Spain',
    origin: 'Scarborough Port, Tobago',
    destination: 'Port of Spain Ferry Terminal',
    departureTime: '4:00 PM AST',
    estimatedArrival: '7:00 PM AST (3h sailing)',
    status: 'On Schedule',
    passengerCapacityPercent: 72,
    vehicleCapacityPercent: 80,
    terminalNotice: 'Boarding commences 1 hour prior. Rough swell advisories monitored by TTMS.',
    ticketBookingUrl: 'https://ttitferry.com/',
    hotline: '625-3055 / 639-2417',
    lastUpdated: '15 mins ago'
  },
  {
    id: 'ferry-cabo-star-cargo',
    serviceType: 'tobago-ferry',
    vesselName: 'M.V. Cabo Star (Dedicated Cargo)',
    route: 'Port of Spain ➔ Scarborough',
    origin: 'Port of Spain Cargo Terminal',
    destination: 'Scarborough Port, Tobago',
    departureTime: '2:00 PM AST',
    estimatedArrival: '8:00 PM AST (6h commercial sailing)',
    status: 'On Schedule',
    passengerCapacityPercent: 40,
    vehicleCapacityPercent: 100,
    terminalNotice: 'Commercial cargo & container flatbeds priority. Manifest validation at Gate 2.',
    ticketBookingUrl: 'https://ttitferry.com/',
    hotline: '625-3055',
    lastUpdated: '25 mins ago'
  },
  {
    id: 'wt-carnival-runner-morning',
    serviceType: 'water-taxi',
    vesselName: 'Paria Bullet (Water Taxi)',
    route: 'San Fernando ➔ Port of Spain',
    origin: 'Flat Rock Terminal, San Fernando',
    destination: 'Cruise Ship Complex, Port of Spain',
    departureTime: '6:00 AM AST',
    estimatedArrival: '6:50 AM AST (50 mins sailing)',
    status: 'On Schedule',
    passengerCapacityPercent: 92,
    terminalNotice: 'Bypasses Uriah Butler Highway gridlock. Free parking available at Lady Hailes Avenue.',
    ticketBookingUrl: 'https://nidco.co.tt/watertaxiservice/',
    hotline: '624-3281 / 652-3281',
    lastUpdated: '5 mins ago'
  },
  {
    id: 'wt-trini-flash-morning',
    serviceType: 'water-taxi',
    vesselName: 'Calypso Sprinter (Water Taxi)',
    route: 'San Fernando ➔ Port of Spain',
    origin: 'Flat Rock Terminal, San Fernando',
    destination: 'Cruise Ship Complex, Port of Spain',
    departureTime: '7:15 AM AST',
    estimatedArrival: '8:05 AM AST (50 mins sailing)',
    status: 'Boarding',
    passengerCapacityPercent: 98,
    terminalNotice: 'Peak commute run. Electronic transit cards & prepaid tickets given priority lane.',
    ticketBookingUrl: 'https://nidco.co.tt/watertaxiservice/',
    hotline: '624-3281 / 652-3281',
    lastUpdated: 'Just now'
  },
  {
    id: 'wt-pos-evening-return',
    serviceType: 'water-taxi',
    vesselName: 'Paria Bullet (Water Taxi)',
    route: 'Port of Spain ➔ San Fernando',
    origin: 'Cruise Ship Complex, Port of Spain',
    destination: 'Flat Rock Terminal, San Fernando',
    departureTime: '4:30 PM AST',
    estimatedArrival: '5:20 PM AST (50 mins sailing)',
    status: 'On Schedule',
    passengerCapacityPercent: 85,
    terminalNotice: 'Evening rush hour shuttle back to South Trinidad.',
    ticketBookingUrl: 'https://nidco.co.tt/watertaxiservice/',
    hotline: '624-3281 / 652-3281',
    lastUpdated: '20 mins ago'
  }
];

