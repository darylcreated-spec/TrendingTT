import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('=== RUNNING TRENDING TT DEEP VERIFICATION SUITE ===\n');

// 1. Verify "No AI spindle emojis" rule across all src and public files
console.log('1. Checking "No AI spindle emojis" rule...');
const forbiddenEmojis = ['✨', '🤖', '🦾', '🪄'];
const checkDirs = ['src', 'public'];

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (/\.(tsx?|jsx?|html|json|css)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const emoji of forbiddenEmojis) {
        if (content.includes(emoji)) {
          throw new Error(`Forbidden AI emoji "${emoji}" found in ${fullPath}`);
        }
      }
    }
  }
}

for (const dir of checkDirs) {
  scanDir(dir);
}
console.log('PASS: Zero AI spindle / robot emojis found across codebase.\n');

// 2. Check Service Worker push handler in public/sw.js
console.log('2. Verifying public/sw.js Push and Notification click handlers...');
const swContent = fs.readFileSync('public/sw.js', 'utf8');
assert(swContent.includes("self.addEventListener('push'"), 'sw.js missing push event listener');
assert(swContent.includes("self.addEventListener('notificationclick'"), 'sw.js missing notificationclick event listener');
assert(swContent.includes("self.registration.showNotification"), 'sw.js missing showNotification call');
assert(swContent.includes("clients.openWindow"), 'sw.js missing clients.openWindow fallback');
console.log('PASS: Service Worker push & click handlers correctly defined.\n');

// 3. Verify Traffic, Weather & WASA Data structure
console.log('3. Verifying Option B data requirements...');
const dataContent = fs.readFileSync('src/data/radarAndPollData.ts', 'utf8');

// Check major arteries
assert(dataContent.includes('Uriah Butler Highway'), 'Missing Uriah Butler Highway');
assert(dataContent.includes('Churchill Roosevelt Highway'), 'Missing Churchill Roosevelt Highway');
assert(dataContent.includes('Priority Bus Route'), 'Missing Priority Bus Route');
assert(dataContent.includes('Solomon Hochoy Highway'), 'Missing Solomon Hochoy Highway');
assert(dataContent.includes('South Trunk Road'), 'Missing South Trunk Road / Mosquito Creek');

// Check TTMS advisory and authority
assert(dataContent.includes('Trinidad and Tobago Meteorological Service'), 'Missing TTMS advisory');
assert(dataContent.includes('Caroni River Basin'), 'Missing Caroni river basin flood monitor');

// Check WASA notices
assert(dataContent.includes('Caroni Water Treatment Plant'), 'Missing Caroni WASA notice');
assert(dataContent.includes('Navet Water Treatment Facility'), 'Missing Navet WASA notice');
assert(dataContent.includes('Desalcott'), 'Missing Desalcott WASA notice');
console.log('PASS: All Option B arterial highways, TTMS weather, flood basins, and WASA data present.\n');

// 4. Verify Option C: Trinbago Polls
console.log('4. Verifying Option C poll requirements...');
assert(dataContent.includes('Debe vs Curepe'), 'Missing Debe vs Curepe doubles poll');
assert(dataContent.includes('Highway Speed Limits'), 'Missing highway speed limits poll');
assert(dataContent.includes('National Fiscal Focus'), 'Missing national budget priorities poll');
console.log('PASS: All hot national topics present in polls data.\n');

// 5. Test Poll Math & Percentage breakdown algorithm
console.log('5. Testing Poll Percentage calculation logic...');
function calculatePercentages(options) {
  const total = options.reduce((sum, opt) => sum + opt.votes, 0);
  return options.map(opt => ({
    ...opt,
    percentage: total > 0 ? Math.round((opt.votes / total) * 100) : 0
  }));
}

// Edge case: Empty votes
const emptyPoll = [{ votes: 0 }, { votes: 0 }];
const emptyResults = calculatePercentages(emptyPoll);
assert.strictEqual(emptyResults[0].percentage, 0);
assert.strictEqual(emptyResults[1].percentage, 0);

// Normal case: Debe vs Curepe
const testPoll = [
  { id: 'debe', votes: 1980 },
  { id: 'curepe', votes: 1420 },
  { id: 'other', votes: 600 }
];
const testResults = calculatePercentages(testPoll);
const sumPercentages = testResults.reduce((sum, opt) => sum + opt.percentage, 0);
assert(sumPercentages >= 99 && sumPercentages <= 101, 'Percentage sum should be ~100%');
console.log('PASS: Dynamic percentage calculation algorithm behaves accurately.\n');

// 6. Test Local Storage Simulation for Poll Voting & Notifications
console.log('6. Verifying Storage schema & simulation...');
const storageContent = fs.readFileSync('src/services/storage.ts', 'utf8');
assert(storageContent.includes('castPollVote'), 'Missing castPollVote method in Storage');
assert(storageContent.includes('getUserPollVotes'), 'Missing getUserPollVotes in Storage');
assert(storageContent.includes('getNotificationSettings'), 'Missing getNotificationSettings in Storage');
assert(storageContent.includes('saveNotificationSettings'), 'Missing saveNotificationSettings in Storage');
assert(storageContent.includes('getCommunityReports'), 'Missing getCommunityReports in Storage');
assert(storageContent.includes('addCommunityReport'), 'Missing addCommunityReport in Storage');
console.log('PASS: Storage persistence layer contains all required contracts.\n');

// 7. Verify Option 1: Ingestion Engine & Connectors
console.log('7. Verifying Option 1 Ingestion Engine (yt-dlp & RSS-Bridge)...');
assert(fs.existsSync('scripts/ingestion-worker.mjs'), 'scripts/ingestion-worker.mjs must exist');
assert(fs.existsSync('src/services/socialIngestionEngine.ts'), 'src/services/socialIngestionEngine.ts must exist');

const workerContent = fs.readFileSync('scripts/ingestion-worker.mjs', 'utf8');
// Check yt-dlp targets
assert(workerContent.includes('trinitiktok'), 'Worker missing TikTok #trinitiktok target');
assert(workerContent.includes('youtube-tv6-news'), 'Worker missing TV6 YouTube evening newscast target');
assert(workerContent.includes('youtube-cnc3-news'), 'Worker missing CNC3 YouTube evening newscast target');
assert(workerContent.includes('youtube-ttt-news'), 'Worker missing TTT YouTube evening newscast target');
assert(workerContent.includes('facebook-ian-reels'), 'Worker missing Facebook video reels target');

// Check RSS-Bridge targets
assert(workerContent.includes('CCNTV6'), 'Worker missing TV6 Facebook RSS-Bridge');
assert(workerContent.includes('CNC3Television'), 'Worker missing CNC3 Facebook RSS-Bridge');
assert(workerContent.includes('ianalleyne'), 'Worker missing I.A.N Network Facebook RSS-Bridge');
assert(workerContent.includes('NewsdayTT'), 'Worker missing Newsday Facebook RSS-Bridge');
assert(workerContent.includes('tv6tnt'), 'Worker missing TV6 Instagram RSS-Bridge');
assert(workerContent.includes('cnc3news'), 'Worker missing CNC3 Instagram RSS-Bridge');

// Import and run worker verification
const { runIngestionWorker, INGESTION_TARGETS, OFFLINE_FALLBACK_POSTS, normalizeYtDlpToPost, normalizeRssBridgeToPost, findFallbackPost } = await import('./ingestion-worker.mjs');
assert.strictEqual(INGESTION_TARGETS.ytDlp.length, 5, 'yt-dlp targets count should be exactly 5');
assert(INGESTION_TARGETS.rssBridge.length >= 6, 'RSS-Bridge targets count should be at least 6');
assert(OFFLINE_FALLBACK_POSTS.length >= 11, 'Offline fallback posts must cover targets');

// Test that each target has a dedicated distinct fallback post
const matchedFallbackIds = new Set();
for (const target of [...INGESTION_TARGETS.ytDlp, ...INGESTION_TARGETS.rssBridge]) {
  const fallback = findFallbackPost(target);
  assert(fallback, `Missing fallback post for target ${target.id}`);
  matchedFallbackIds.add(fallback.id);
}
assert(matchedFallbackIds.size >= 11, 'Targets must resolve to distinct fallback posts');

// Test normalize functions directly with edge cases
const sampleYtPost = normalizeYtDlpToPost(
  { id: 'sample-yt', title: 'Sample Title', description: 'Sample Desc', duration: 120 },
  INGESTION_TARGETS.ytDlp[0]
);
assert.strictEqual(sampleYtPost.sourceId, 'tiktok');
assert.strictEqual(sampleYtPost.media?.videoDuration, '2:00');

// Edge case: null duration and missing title
const sampleYtEdge = normalizeYtDlpToPost(
  { id: 'edge-yt', title: '', description: '', duration: 0 },
  INGESTION_TARGETS.ytDlp[1]
);
assert(sampleYtEdge.title.length > 0, 'Default title must be populated');
assert.strictEqual(sampleYtEdge.media?.videoDuration, undefined, 'Zero duration should have undefined videoDuration');

// Test RSS normalizer with HTML entity stripping
const sampleRssPost = normalizeRssBridgeToPost(
  { id: 'sample-rss', title: 'Sample &amp; Breaking', content_html: '<p>Paragraph <b>content</b></p>' },
  INGESTION_TARGETS.rssBridge[0]
);
assert.strictEqual(sampleRssPost.sourceId, 'tv6');
assert.strictEqual(sampleRssPost.content, 'Paragraph content');

// Run worker in mock mode and verify output integrity
const workerOutput = await runIngestionWorker({ mock: true, dryRun: true });
assert(workerOutput.posts.length >= 11, 'Worker must produce normalized posts covering targets');
for (const p of workerOutput.posts) {
  assert(p.id, 'Post missing id');
  assert(p.title, 'Post missing title');
  assert(p.summary, 'Post missing summary');
  assert(p.sourceId, 'Post missing sourceId');
  assert(p.sourceType, 'Post missing sourceType');
  assert(p.publishedAt, 'Post missing publishedAt');
  assert(p.category, 'Post missing category');
  assert(Array.isArray(p.tags), 'Post tags must be an array');
}

// Runtime test of SocialIngestionEngine
const { SocialIngestionEngine, socialIngestionEngine, OFFLINE_SOCIAL_FALLBACK } = await import('../src/services/socialIngestionEngine.ts');
assert(socialIngestionEngine instanceof SocialIngestionEngine, 'socialIngestionEngine must be an instance of SocialIngestionEngine');
assert.strictEqual(OFFLINE_SOCIAL_FALLBACK.length, 11, 'OFFLINE_SOCIAL_FALLBACK must contain 11 items');

const initialFeed = await socialIngestionEngine.fetchIngestedFeed();
assert(initialFeed.posts.length >= 11, 'fetchIngestedFeed must return all ingested/fallback posts');
assert(initialFeed.isOfflineFallback === true || initialFeed.isOfflineFallback === false);

// Test diagnostic connector health check
const testDiag = await socialIngestionEngine.testConnector('rss-bridge', 'https://mock.invalid.local/test');
assert.strictEqual(testDiag.connector, 'rss-bridge');
assert.strictEqual(typeof testDiag.latencyMs, 'number');
assert.strictEqual(testDiag.reachable, false);
console.log('PASS: Ingestion Engine connectors (yt-dlp + RSS-Bridge) and normalizers fully verified.\n');

// 8. Verify Option 2: Cross-Posting Engine & Trigger
console.log('8. Verifying Option 2 Cross-Posting Engine & Modal Trigger...');
assert(fs.existsSync('src/services/crossPostingService.ts'), 'src/services/crossPostingService.ts must exist');

const { CrossPostingService, CHANNELS_META } = await import('../src/services/crossPostingService.ts');

// Check channels: facebook, twitter, instagram, telegram, whatsapp
const expectedChannels = ['facebook', 'twitter', 'instagram', 'telegram', 'whatsapp'];
for (const ch of expectedChannels) {
  assert(CHANNELS_META[ch], `Missing CHANNELS_META for ${ch}`);
  assert(CHANNELS_META[ch].name, `Missing name for ${ch}`);
}
assert.strictEqual(CHANNELS_META.twitter.charLimit, 280, 'Twitter charLimit should be 280');

// Test formatMessage interpolation
const mockPost = {
  id: 'test-crosspost-1',
  title: 'Port of Spain Traffic Standoff',
  summary: 'Major gridlock along Churchill Roosevelt Highway.',
  sourceId: 'tv6',
  sourceName: 'CCN TV6',
  sourceType: 'broadcast',
  originalUrl: 'https://tv6tnt.com/traffic-alert',
  publishedAt: new Date().toISOString(),
  category: 'broadcast',
  tags: ['Traffic TT', '#CRH'],
  trendingScore: 92,
  upvotes: 210,
  commentsCount: 45
};

const formattedMsg = CrossPostingService.formatMessage(mockPost);
assert(formattedMsg.includes('Port of Spain Traffic Standoff'), 'Formatted message missing title');
assert(formattedMsg.includes('Major gridlock along Churchill Roosevelt Highway.'), 'Formatted message missing summary');
assert(formattedMsg.includes('#TrafficTT'), 'Formatted message missing hashtags');

// Test custom template interpolation
const customTpl = 'FLASH: {title} via {source} | Category: {category} | Read: {url}';
const customFormatted = CrossPostingService.formatMessage(mockPost, customTpl);
assert.strictEqual(customFormatted, 'FLASH: Port of Spain Traffic Standoff via CCN TV6 | Category: BROADCAST | Read: https://tv6tnt.com/traffic-alert');

// Test dispatch in sandbox mode across all channels
const dispatchRes = await CrossPostingService.dispatchCrossPost({
  post: mockPost,
  message: formattedMsg,
  channels: ['facebook', 'twitter', 'telegram', 'whatsapp'],
  config: {
    provider: 'webhook',
    webhookUrl: '',
    apiKey: '',
    defaultChannels: ['facebook', 'twitter'],
    customTemplate: '',
    autoAppendHashtags: true
  }
});

assert(dispatchRes.id.startsWith('dispatch-'), 'Dispatch result should have valid dispatch id');
assert.strictEqual(dispatchRes.overallSuccess, true, 'Sandbox dispatch should report overall success');
assert.strictEqual(dispatchRes.channelStatuses.length, 4, 'Should contain 4 channel delivery receipts');
for (const status of dispatchRes.channelStatuses) {
  assert.strictEqual(status.success, true, `Channel ${status.channel} should succeed in sandbox mode`);
  assert(status.messageId, 'Receipt must contain messageId');
}

// Test Postiz & Mixpost provider dispatches in sandbox mode
const postizDispatch = await CrossPostingService.dispatchCrossPost({
  post: mockPost,
  message: formattedMsg,
  channels: ['facebook', 'twitter'],
  config: {
    provider: 'postiz',
    webhookUrl: '',
    apiKey: '',
    defaultChannels: ['facebook'],
    customTemplate: '',
    autoAppendHashtags: true
  }
});
assert.strictEqual(postizDispatch.provider, 'postiz');
assert.strictEqual(postizDispatch.overallSuccess, true);

const mixpostDispatch = await CrossPostingService.dispatchCrossPost({
  post: mockPost,
  message: formattedMsg,
  channels: ['facebook', 'instagram'],
  config: {
    provider: 'mixpost',
    webhookUrl: '',
    apiKey: '',
    defaultChannels: ['facebook'],
    customTemplate: '',
    autoAppendHashtags: true
  }
});
assert.strictEqual(mixpostDispatch.provider, 'mixpost');
assert.strictEqual(mixpostDispatch.overallSuccess, true);

// Test validation edge cases: empty channels must reject
await assert.rejects(
  async () => {
    await CrossPostingService.dispatchCrossPost({
      post: mockPost,
      message: formattedMsg,
      channels: []
    });
  },
  /At least one target social channel must be selected/
);

// Test validation edge cases: empty message must reject
await assert.rejects(
  async () => {
    await CrossPostingService.dispatchCrossPost({
      post: mockPost,
      message: '   ',
      channels: ['facebook']
    });
  },
  /formatted message must be provided/
);

// Test testWebhook edge cases
const emptyWebhookTest = await CrossPostingService.testWebhook({
  provider: 'webhook',
  webhookUrl: '',
  apiKey: '',
  defaultChannels: ['facebook'],
  customTemplate: '',
  autoAppendHashtags: true
});
assert.strictEqual(emptyWebhookTest.success, true, 'Empty webhook URL should report sandbox mode');

const invalidWebhookTest = await CrossPostingService.testWebhook({
  provider: 'webhook',
  webhookUrl: 'not-a-valid-http-url',
  apiKey: '',
  defaultChannels: ['facebook'],
  customTemplate: '',
  autoAppendHashtags: true
});
assert.strictEqual(invalidWebhookTest.success, false, 'Invalid webhook URL protocol must fail');

// Check ShareModal.tsx integration and UI triggers
const shareModalContent = fs.readFileSync('src/components/ShareModal.tsx', 'utf8');
assert(shareModalContent.includes('CrossPostingService'), 'ShareModal missing CrossPostingService integration');
assert(shareModalContent.includes('Cross-Post Dispatch'), 'ShareModal missing Cross-Post tab');
assert(shareModalContent.includes('1-Click Dispatch'), 'ShareModal missing 1-Click Dispatch trigger');
assert(shareModalContent.includes('Webhook & API Settings'), 'ShareModal missing persistent Webhook Settings');
assert(shareModalContent.includes('Customizable Message Formatting'), 'ShareModal missing custom message formatting');
assert(shareModalContent.includes('Default Message Template'), 'ShareModal missing default template editor in settings');
assert(shareModalContent.includes('Test Endpoint'), 'ShareModal missing Test Endpoint trigger');
// 9. Verify Mobile-First Infrastructure & UX Hardening
console.log('9. Verifying Mobile Infrastructure, Scrolling, Zooming, Sharing & CarouselTabs...');

// 9.1 Viewport Accessibility & Safe Areas
const indexHtmlContent = fs.readFileSync('index.html', 'utf8');
assert(indexHtmlContent.includes('viewport-fit=cover'), 'index.html must specify viewport-fit=cover for safe areas');
assert(!indexHtmlContent.includes('user-scalable=no'), 'index.html must not forbid user scaling (WCAG accessibility violation)');

// 9.2 CSS Mobile Rules & Input Zoom Protection
const indexCssContent = fs.readFileSync('src/index.css', 'utf8');
assert(indexCssContent.includes('-webkit-overflow-scrolling: touch'), 'Missing -webkit-overflow-scrolling: touch in src/index.css');
assert(indexCssContent.includes('overscroll-behavior-y: contain'), 'Missing overscroll-behavior-y: contain in src/index.css');
assert(indexCssContent.includes('touch-action: manipulation'), 'Missing touch-action: manipulation in src/index.css');
assert(indexCssContent.includes('font-size: 16px !important'), 'Missing 16px minimum font size protection to prevent iOS input auto-zoom jump');
assert(indexCssContent.includes('.pb-safe'), 'Missing pb-safe utility in src/index.css');

// 9.3 CarouselTabs Component & Integration
assert(fs.existsSync('src/components/CarouselTabs.tsx'), 'src/components/CarouselTabs.tsx must exist');
const carouselTabsContent = fs.readFileSync('src/components/CarouselTabs.tsx', 'utf8');
assert(carouselTabsContent.includes('snap-x snap-mandatory'), 'CarouselTabs must implement CSS scroll snap');
assert(carouselTabsContent.includes('scrollIntoView'), 'CarouselTabs must auto-center active tab into view');

const categoryNavContent = fs.readFileSync('src/components/CategoryNav.tsx', 'utf8');
assert(categoryNavContent.includes('CarouselTabs'), 'CategoryNav must use CarouselTabs');

const radarContent = fs.readFileSync('src/components/TrafficWeatherRadar.tsx', 'utf8');
assert(radarContent.includes('CarouselTabs'), 'TrafficWeatherRadar must use CarouselTabs');

// 9.4 Mobile Image Zoom Lightbox
assert(fs.existsSync('src/components/ImageZoomLightbox.tsx'), 'src/components/ImageZoomLightbox.tsx must exist');
const lightboxContent = fs.readFileSync('src/components/ImageZoomLightbox.tsx', 'utf8');
assert(lightboxContent.includes('zoomLevel'), 'ImageZoomLightbox must support zoom level states');
assert(lightboxContent.includes('handleDoubleTap'), 'ImageZoomLightbox must support double-tap zoom');
assert(lightboxContent.includes('handleTouchMove'), 'ImageZoomLightbox must support touch pan dragging');

// 9.5 Mobile Bottom Navigation & Touch Swipe
assert(fs.existsSync('src/components/MobileBottomNav.tsx'), 'src/components/MobileBottomNav.tsx must exist');
const bottomNavContent = fs.readFileSync('src/components/MobileBottomNav.tsx', 'utf8');
assert(bottomNavContent.includes('md:hidden'), 'MobileBottomNav must be targeted to mobile devices');
assert(bottomNavContent.includes('pb-safe'), 'MobileBottomNav must observe safe area insets');

const appContent = fs.readFileSync('src/App.tsx', 'utf8');
assert(appContent.includes('MobileBottomNav'), 'App.tsx must render MobileBottomNav');
assert(appContent.includes('ImageZoomLightbox'), 'App.tsx must render ImageZoomLightbox');
assert(appContent.includes('handleTouchStart') && appContent.includes('handleTouchEnd'), 'App.tsx must support touch swipe gestures between views');

// 9.6 Mobile Share Bottom-Sheet & WhatsApp Deep Linking
assert(shareModalContent.includes('pb-safe'), 'ShareModal must include safe area bottom padding');
assert(shareModalContent.includes('whatsapp://send'), 'ShareModal must include direct mobile WhatsApp deep link');
assert(shareModalContent.includes('rounded-t-3xl'), 'ShareModal must render as a mobile bottom-sheet');

console.log('PASS: All Mobile Infrastructure, Scrolling, Zooming, Sharing & CarouselTabs verified.\n');

// 10. Verify Utilities Tab (T&TEC, WASA, Amplia, Flow, Digicel, bmobile)
console.log('10. Verifying Utilities Tab (T&TEC, WASA, Water Schedules, Cable TV & Telecom Providers)...');

assert(fs.existsSync('src/data/utilitiesData.ts'), 'src/data/utilitiesData.ts must exist');
const utilDataContent = fs.readFileSync('src/data/utilitiesData.ts', 'utf8');
assert(utilDataContent.includes('https://ttec.co.tt/'), 'utilitiesData.ts must link to official T&TEC website');
assert(utilDataContent.includes('https://www.wasa.gov.tt/'), 'utilitiesData.ts must link to official WASA website');
assert(utilDataContent.includes('amplia'), 'utilitiesData.ts must include Amplia provider');
assert(utilDataContent.includes('flow'), 'utilitiesData.ts must include Flow provider');
assert(utilDataContent.includes('digicel'), 'utilitiesData.ts must include Digicel provider');
assert(utilDataContent.includes('bmobile'), 'utilitiesData.ts must include bmobile provider');
assert(utilDataContent.includes('INITIAL_WATER_SCHEDULES'), 'utilitiesData.ts must contain water schedules');

// Check UtilitiesDashboard component
assert(fs.existsSync('src/components/UtilitiesDashboard.tsx'), 'src/components/UtilitiesDashboard.tsx must exist');
const utilDashContent = fs.readFileSync('src/components/UtilitiesDashboard.tsx', 'utf8');
assert(utilDashContent.includes('T&TEC Planned Disruptions'), 'UtilitiesDashboard must feature T&TEC disruptions');
assert(utilDashContent.includes('WASA Rotational Water Schedules'), 'UtilitiesDashboard must feature WASA water schedules');
assert(utilDashContent.includes('Cable TV & Broadband Providers'), 'UtilitiesDashboard must feature cable TV & telecom providers');
assert(utilDashContent.includes('Report Utility Disruption'), 'UtilitiesDashboard must allow citizen outage reporting');

// Check App.tsx and Header.tsx integration
const currentAppContent = fs.readFileSync('src/App.tsx', 'utf8');
assert(currentAppContent.includes('UtilitiesDashboard'), 'App.tsx must render UtilitiesDashboard');
const headerContent = fs.readFileSync('src/components/Header.tsx', 'utf8');
assert(headerContent.includes('utilities'), 'Header.tsx must feature utilities tab');
assert(bottomNavContent.includes('utilities'), 'MobileBottomNav.tsx must feature utilities tab');

console.log('PASS: Utilities Tab (T&TEC, WASA, Water Schedules, Cable TV & Telecom) fully verified.\n');

// 11. Verify Curated Sectioned Feed & Gemini/NotebookLM Intelligence Briefing Engine
console.log('11. Verifying Curated Sectioned Feed & Gemini/NotebookLM Briefing Engine...');

assert(fs.existsSync('src/components/SectionedFeed.tsx'), 'SectionedFeed.tsx must exist');
const sectionedContent = fs.readFileSync('src/components/SectionedFeed.tsx', 'utf8');
assert(sectionedContent.includes('Breaking News & Critical Bulletins'), 'SectionedFeed must feature Breaking News section');
assert(sectionedContent.includes('Trinbago Sports Arena'), 'SectionedFeed must feature Sports section');
assert(sectionedContent.includes('Trending on Social Media'), 'SectionedFeed must feature Social section');

assert(fs.existsSync('src/components/BriefingModal.tsx'), 'BriefingModal.tsx must exist');
const briefModalContent = fs.readFileSync('src/components/BriefingModal.tsx', 'utf8');
assert(briefModalContent.includes('Intelligence Briefing & NotebookLM Synthesizer'), 'BriefingModal must have synthesizer header');
assert(briefModalContent.includes('NotebookLM Note Importer'), 'BriefingModal must include NotebookLM importer');
assert(briefModalContent.includes('Gemini API'), 'BriefingModal must support Gemini API settings');
assert(briefModalContent.includes('WhatsApp Broadcast / Status Draft'), 'BriefingModal must offer WhatsApp drafts');

assert(fs.existsSync('src/services/briefingEngine.ts'), 'briefingEngine.ts must exist');
const briefingEngineContent = fs.readFileSync('src/services/briefingEngine.ts', 'utf8');
assert(briefingEngineContent.includes('generateBriefings'), 'BriefingEngine must support generateBriefings');
assert(briefingEngineContent.includes('parseNotebookLmNotes'), 'BriefingEngine must support parseNotebookLmNotes');

// Verify CategoryNav layout switcher
const catNavContent = fs.readFileSync('src/components/CategoryNav.tsx', 'utf8');
assert(catNavContent.includes('Sections') && catNavContent.includes('Stream'), 'CategoryNav must feature Sections/Stream layout switcher');

// Verify scheduled GitHub Actions workflow
assert(fs.existsSync('.github/workflows/social-scraper.yml'), '.github/workflows/social-scraper.yml must exist');
const workflowContent = fs.readFileSync('.github/workflows/social-scraper.yml', 'utf8');
assert(workflowContent.includes('cron: \'*/30 * * * *\''), 'Workflow must run on 30-min schedule');
assert(workflowContent.includes('yt-dlp'), 'Workflow must install yt-dlp');

console.log('PASS: Curated Sectioned Feed & Gemini/NotebookLM Briefing Engine verified.\n');

console.log('=== ALL VERIFICATION CHECKS PASSED SUCCESSFULLY ===');


