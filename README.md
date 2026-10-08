# Trending TT 🇹🇹 | Real-Time News & Social Media Aggregator PWA

**Trending TT** is a Progressive Web App (PWA) designed for Trinidad & Tobago that aggregates local broadcast television, national newspapers, and trending social media into a single, high-performance dashboard.

The application follows an **editorial, human-first design policy** strictly devoid of artificial AI emojis, sparkles (`✨`), or robotic gimmicks.

---

## 📺 Aggregated Outlets & Platforms

### Broadcast News
- **CCN TV6** (`tv6tnt.com`): 7PM Evening news bulletins and investigative reporting.
- **CNC3 Television** (`cnc3.co.tt`): Breaking news updates and live broadcast coverage.
- **TTT Live Online** (`ttt.live`): State broadcasts and national proceedings.

### National Newspapers
- **T&T Newsday** (`newsday.co.tt`): Real-time RSS feeds and regional analysis.
- **Trinidad Express** (`trinidadexpress.com`): Sports, crime, and national affairs.
- **Trinidad Guardian** (`guardian.co.tt`): Business and economic stability bulletins.

### Trending Caribbean Socials
- **Trinidad TikTok** (`#trinitiktok`, `#trinidad`): Viral food showdowns, cultural events, and community topics.
- **Facebook TT Community**: Public alerts, civic drives, and grassroots updates.
- **Instagram TT Reels**: Carnival costume launches, entertainment, and tourism highlights.

---

## ⚡ Key Features

1. **Progressive Web App (PWA)**:
   - Installable on mobile home screens (Android & iOS).
   - Offline reading via Service Worker caching (`/sw.js`).
   - Web App Manifest configured with Trinidad & Tobago national theme (`#CE1126`).

2. **Viral Velocity Algorithm**:
   - Real-time trending score calculation based on engagement velocity and breaking alert weights.

3. **Community Discussion & Comments**:
   - In-app comment drawer with Trinidad & Tobago borough/town selector (Port of Spain, San Fernando, Chaguanas, Arima, Scarborough Tobago, Couva, etc.).
   - Persistent comment storage.

4. **1-Tap WhatsApp Sharing & Social Reposting**:
   - Formatted WhatsApp group chat sharing with headline, source, and direct link.
   - Direct sharing to Facebook, X (Twitter), and the native mobile device Share Sheet (`navigator.share`).

5. **Live Editorial Masthead**:
   - Live Trinidad & Tobago AST clock (`America/Port_of_Spain`).
   - Animated Breaking News marquee ticker.
   - Outlets filter modal allowing users to customize their personal newsfeed.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 10+

### Installation
```bash
git clone https://github.com/darylcreated-spec/TrendingTT.git
cd TrendingTT
npm install
```

### Development
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 📱 PWA Installation
- **Android**: Tap the in-app **"Install App"** button or Chrome's install banner.
- **iOS**: Tap the Safari Share button <kbd>⎋</kbd> and select **"Add to Home Screen"**.
