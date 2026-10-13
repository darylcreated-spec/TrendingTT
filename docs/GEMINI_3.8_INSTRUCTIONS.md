# Trending.TT — Improvement Brief for Gemini 3.8

> Paste this whole file into Gemini 3.8 (or point the agent at `docs/GEMINI_3.8_INSTRUCTIONS.md`) as its working instructions.
> Work through the phases **in order**. Do not start a phase until the previous phase's verification checklist passes.

---

## 0. Your Role & Ground Rules

You are a senior full-stack engineer working on **Trending.TT**, a mobile-first PWA that aggregates news, social trends, traffic, weather and utility outages for **Trinidad & Tobago**.

**Non-negotiable rules**

1. **Honesty over polish.** Never label simulated or template data as "Live". If data isn't from a real source, it must be marked as `Sample`, `Estimated`, or `Archive` in the UI.
2. **AST everywhere.** All user-facing times use `America/Port_of_Spain` (UTC-4) via `src/utils/dateUtils.ts`. Never hand-format dates elsewhere.
3. **Newest first.** Every list of posts sorts by `publishedAt` descending unless the user explicitly picks another sort.
4. **Sports go in Sports.** Any post where `isSportsPost()` (in `src/services/scraperEngine.ts`) is true must appear in the *Trinbago Sports Arena* section and nowhere else in the sectioned feed.
5. **No AI-flavoured copy or emojis.** Forbidden in code and content: `✨ 🤖 🦾 🪄`. No phrases like "AI-powered", "Unleash", "Seamlessly". Write like a Trini newsroom editor.
6. **Preserve branding.** Keep the "Concept 2" flag icon, the `Trending.TT` wordmark under the flag, red/black/white palette, and the dark slate UI.
7. **Windows + PowerShell.** The dev machine is Windows. Use `;` not `&&` to chain shell commands.
8. **Small, verified steps.** After every phase run:
   ```powershell
   npm run build; npm test; npm run lint
   ```
   All three must pass before you commit. Commit per phase with a conventional message (`feat:`, `fix:`, `perf:`, `refactor:`).
9. **Don't delete user data.** Never wipe `localStorage` keys wholesale; migrate or prune by rule.

---

## 1. Project Map (read before editing)

| Area | Files |
|---|---|
| App shell, feed state, refresh loop | `src/App.tsx` |
| Feed layout & sections | `src/components/SectionedFeed.tsx`, `PostCard.tsx`, `CategoryNav.tsx`, `BreakingTicker.tsx` |
| Engagement | `MackoMeter.tsx`, `MackoLeaderboard.tsx`, `TriniReactionBar.tsx`, `CommentDrawer.tsx`, `TrinbagoPoll.tsx` |
| Traffic / weather | `TrafficWeatherRadar.tsx`, `src/services/radarService.ts`, `src/data/radarAndPollData.ts` |
| Utilities | `UtilitiesDashboard.tsx`, `src/services/utilityService.ts`, `src/data/utilitiesData.ts` |
| Ingestion (browser) | `src/services/scraperEngine.ts`, `src/services/socialIngestionEngine.ts` |
| Ingestion (CI) | `scripts/news_scraper.py`, `scripts/ingestion-worker.mjs`, `.github/workflows/social-scraper.yml` |
| Bundled data | `public/data/ingested-posts.json`, `src/data/ingestedPosts.ts`, `src/data/mockPosts.ts` |
| Persistence | `src/services/storage.ts` (localStorage), `src/services/firebase.ts` |
| AI briefing | `src/services/briefingEngine.ts`, `BriefingModal.tsx` |
| Audio / push | `audioNarrator.ts`, `StickyAudioPlayer.tsx`, `notificationService.ts`, `public/sw.js` |
| Images | `src/services/imageFallbackService.ts` |
| Tests | `scripts/test-verification.mjs` (string-assertion suite — keep it passing) |

Stack: React 19, TypeScript 6, Vite 8, Tailwind 3, lucide-react, Firebase 13. Deployed on Vercel from `main`.

---

## 2. Known Problems (the "why" behind this brief)

Fix these — they are the root of the user's repeated "I'm still seeing old posts / it's not live" complaints.

1. **Traffic and utilities are simulated, not live.** `RadarService` adds random jitter to static seed data; `UtilityService` re-stamps static bulletins with the current time and calls them "Live". This is misleading.
2. **Browser scraper fabricates fresh news.** `fetchLiveTTFeeds()` in `scraperEngine.ts` injects 3 template "bulletins" with `Date.now() - 1..9 min` on every refresh. These masquerade as breaking news.
3. **Ingestion worker emits sample items** (e.g. `youtube.com/watch?v=tv6-sample-news-7pm`, Unsplash thumbnails) rather than real yt-dlp / RSS-Bridge output when the network calls fail.
4. **Scraper gaps.** In the last run Newsday failed DNS and CNC3 returned 0 articles; fallback content was injected instead.
5. **Data pipeline is fragile.** The client prefers `raw.githubusercontent.com/.../data-feed/...`, but nobody verifies the `data-feed` branch is actually being updated by the Action every 30 min.
6. **Main JS bundle is ~1.05 MB** (309 KB gzip). Mobile first-load is slow.
7. **Gemini API key is stored in `localStorage`** and called directly from the browser — the key is exposed to anyone with devtools / XSS.
8. **Tests are string-matching only** (`content.includes(...)`). They don't exercise behaviour.

---

## 3. Phase 1 — Make "Live" Truthful (highest priority)

**Goal:** every item the user sees is either real and timestamped from its source, or clearly labelled as not live.

Tasks
1. Add a `dataOrigin: 'live' | 'cached' | 'sample'` field to `Post`, `TrafficSegment`, `UtilityDisruption`, `TelecomStatus`, `RiverLevelStatus` in `src/types/index.ts`.
2. In `scraperEngine.ts`, **remove** the template-bulletin injection from `fetchLiveTTFeeds()`. If no real items are fetched, return an empty array — the UI already has posts.
3. In `ingestion-worker.mjs` and `news_scraper.py`, mark any fallback/mock item `dataOrigin: 'sample'` and **never** give it a `publishedAt` newer than its real source time. Prefer skipping a source over faking it.
4. In `radarService.ts` and `utilityService.ts`, stop writing `"Live (…)"` into `lastUpdated` / `updatedAt` for simulated data. Use `"Sample data — last reviewed <date>"` and set `dataOrigin: 'sample'`.
5. Add a small reusable `<DataOriginBadge origin=… />` component (green "Live", amber "Cached", slate "Sample") and render it on `PostCard`, traffic segment cards, utility cards.
6. In `SectionedFeed.tsx` and the Breaking ticker, exclude `dataOrigin === 'sample'` posts from *Breaking News & Critical Bulletins*.

Verify
- [ ] Refresh the feed 5 times: no new posts appear unless a real source returned them.
- [ ] No string `"Live ("` is generated from simulated data (`Select-String -Path src -Pattern 'Live \(' -Recurse`).
- [ ] Badges visible on mobile (375 px) without overflowing.

---

## 4. Phase 2 — Real Data Sources

**Goal:** replace simulation with genuine T&T sources where feasible, server-side.

Tasks
1. **News scraper reliability** (`scripts/news_scraper.py`)
   - Add retries with backoff, per-source timeouts, and alternate URLs (e.g. `https://newsday.co.tt/feed/` *and* `https://newsday.co.tt/category/news/feed/`).
   - Fix CNC3 parsing (inspect current HTML; selectors are stale).
   - Use each article's real `og:image` as `media.url`; only fall back to `imageFallbackService` on the client.
   - Write a `meta.sourceHealth` map: `{ newsday: { ok, count, error } , … }`.
2. **Utilities** — add a scheduled scraper (Python) for:
   - T&TEC outages page `https://ttec.co.tt/` (planned interruptions)
   - WASA notices `https://www.wasa.gov.tt/` (press releases / supply schedules)
   - Output `public/data/utilities.json` with `dataOrigin: 'live'`, `sourceUrl`, `scrapedAt`.
   - `UtilitiesDashboard.tsx` fetches that file (cache-busted, `cache: 'no-store'`) and falls back to `utilitiesData.ts` with `dataOrigin: 'sample'`.
3. **Weather** — fetch TTMS bulletins (`https://www.metoffice.gov.tt/`) in CI, or use Open-Meteo (`https://api.open-meteo.com/v1/forecast?latitude=10.65&longitude=-61.5&...`, free, no key, CORS-enabled) directly from the browser for current conditions and rain probability.
4. **Traffic** — there is no free official T&T traffic API. Do **not** fake it. Options, in order:
   a. Crowd reports already in the app (community reports) become the primary "live" source.
   b. Google Maps Routes API for a handful of fixed corridors (CRH, UBH, SHH, PBR) via a serverless function with the key kept server-side. Ask the user before adding a paid API.
   c. Otherwise show static corridor info labelled `Sample`.
5. **GitHub Action** (`.github/workflows/social-scraper.yml`)
   - Add the utilities scraper step.
   - Fail loudly (non-zero exit) if *every* source fails, so the user gets a GitHub notification.
   - After pushing to `data-feed`, curl the raw URL and assert `meta.generatedAt` changed.

Verify
- [ ] `python scripts/news_scraper.py --dry-run` shows ≥ 5 sources with real articles.
- [ ] `public/data/utilities.json` contains items whose `sourceUrl` resolves.
- [ ] Action run on GitHub succeeds and the `data-feed` branch timestamp updates.

---

## 5. Phase 3 — Feed Freshness & Ordering Hardening

Tasks
1. Centralise merging in a pure function `mergePosts(existing, incoming): Post[]` in `src/services/feedMerge.ts`:
   - Key by canonical `originalUrl` (strip query/hash), then `id`, then normalised title.
   - Newer `publishedAt` wins; keep the max of `upvotes` / `commentsCount`.
   - Normalise sports via `isSportsPost()`.
   - Sort by `publishedAt` desc.
   - Use it in both the initial `useState` and `handleTriggerScrape` in `App.tsx`.
2. Show a "New posts (N) — tap to load" pill at the top of the feed instead of silently reordering while the user is reading.
3. Show "Feed updated 4m ago · Sources: 6/7 OK" in the header using `meta.generatedAt` and `meta.sourceHealth`.
4. Pull-to-refresh on mobile (touch handlers on the feed container) that calls `handleTriggerScrape(false)`.
5. Service worker (`public/sw.js`): bump `CACHE_NAME`, and ensure `/data/*.json` uses **network-first** with a 3 s timeout, never cache-first. Add a `skipWaiting` + "Update available — reload" toast so installed PWAs pick up new builds.

Verify
- [ ] Unit tests (see Phase 6) for `mergePosts` covering: duplicate URL, older incoming, sports normalisation, ordering.
- [ ] Installed PWA receives a new build after one reload.

---

## 6. Phase 4 — Performance

Target: main chunk < 400 KB minified, Lighthouse mobile Performance ≥ 85.

Tasks
1. Move `src/data/ingestedPosts.ts` (large static data) out of the bundle — load it via `fetch('/data/ingested-posts.json')` only.
2. Lazy-load Firebase (`import('firebase/...')` only when the user opens Auth or posts).
3. Configure `build.rolldownOptions.output` manual chunks: `react`, `firebase`, `lucide-react`.
4. Import lucide icons individually (already named imports — confirm tree-shaking works in the build report).
5. Add `loading="lazy"`, `decoding="async"`, explicit `width`/`height` to `PostCard` images; request Unsplash at `w=600` on mobile.
6. Virtualise the stream layout when > 40 posts (simple windowing; no heavy dependency).

Verify
- [ ] `npm run build` output shows no chunk > 500 KB warning.
- [ ] Lighthouse mobile run recorded in the commit message.

---

## 7. Phase 5 — Security & Gemini Integration

Tasks
1. Create a Vercel serverless function `api/briefing.ts` that calls the Gemini API with a server-side env var `GEMINI_API_KEY`. The browser sends only post IDs/titles.
2. Use the current Google Gen AI SDK (`@google/genai`) on the server; model id should be configurable via env (`GEMINI_MODEL`, default to the current Gemini Flash model). Check the official docs for the current model name rather than hard-coding one from memory.
3. Keep the "bring your own key" option in `BriefingModal.tsx` only as an advanced setting, with a warning that the key is stored on this device.
4. Rate-limit the function (simple in-memory per-IP limit is fine) and cap input to the 25 newest posts.
5. Prompt for briefings must instruct the model: Trinidadian English, no emojis, cite the source name for every claim, never invent facts not present in the supplied posts.
6. Add a Content-Security-Policy meta/header limiting `connect-src` to self, Firebase, Open-Meteo, and the data-feed raw URL.

Verify
- [ ] No API key strings in `dist/` (`Select-String -Path dist -Pattern 'AIza' -Recurse` returns nothing).
- [ ] Briefing works with `GEMINI_API_KEY` set in Vercel and fails gracefully (deterministic fallback) without it.

---

## 8. Phase 6 — Real Tests

Tasks
1. Add Vitest (`npm i -D vitest jsdom @testing-library/react`) and `"test:unit": "vitest run"`.
2. Unit tests for: `mergePosts`, `isSportsPost`, `classifyTrinbagoContent`, `formatRelativeTime` (AST), `Storage.getCustomPosts` TTL pruning.
3. Component test: `SectionedFeed` renders sports posts only under *Trinbago Sports Arena*, newest first.
4. Keep `scripts/test-verification.mjs` passing; update its string assertions only when you intentionally change the referenced text.
5. Make `npm test` run both suites.

Verify
- [ ] `npm test` runs Vitest + verification suite, all green.

---

## 9. Phase 7 — UX Polish (do last)

Pick these only after Phases 1–6 are done:

1. **Skeleton loaders** for feed, radar and utilities during first fetch.
2. **Source filter memory** — persist selected sources and category in `localStorage`.
3. **Offline banner** when `navigator.onLine` is false, showing the time of the last good sync.
4. **Accessibility** — every icon-only button has `aria-label`; colour contrast ≥ 4.5:1; focus rings visible; respects `prefers-reduced-motion` (disable spin/pulse animations).
5. **Emoji + Macko Meter drawer** — keep them in the collapsible drawer under each story (already implemented); make the drawer remember open/closed per session.
6. **Share cards** — generate a branded image (flag + headline + source) for WhatsApp shares.
7. **Area alerts** — let users pick their region (North / Central / South / East / Tobago) and filter utilities, traffic and push notifications to it.

---

## 10. Definition of Done (whole brief)

- [ ] No simulated data is labelled Live anywhere.
- [ ] Newest posts always render first; sports always render under Sports.
- [ ] Real news from ≥ 5 T&T sources, real utility notices from T&TEC/WASA, real weather.
- [ ] Main bundle < 400 KB; Lighthouse mobile Performance ≥ 85, Accessibility ≥ 95.
- [ ] Gemini key never shipped to the browser by default.
- [ ] `npm run build; npm test; npm run lint` all pass.
- [ ] Each phase committed separately and pushed to `main`.

When you finish each phase, report back with: what changed (files), what you verified and how, and anything you could not do (with the reason). Do not claim something works unless you ran it.
