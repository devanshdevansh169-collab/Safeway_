# SafeWay: Women Safety Route Planner & Emergency Navigation System

**SafeWay** is a complete, production-ready React web application engineered for transit safety and rapid emergency response. The system computes multi-criteria safe routing (evaluating street lighting index, CCTV camera density, and active safe shelters) versus direct routes, while integrating fail-safe emergency protocols (5-second grace SOS countdown, Web Audio API distress siren synthesizer, automated journey check-ins, real-time Leaflet radar map, and verified 24/7 helplines).

---

## 🌟 Key Features & Implementation Architecture

### 1. 🗺️ Dedicated Live Location & Nearby Radar (`Tab: Live Location & Nearby`)
- **Official Google Maps JavaScript API Integration**:
  - **Live GPS Tracking**: Continuous physical device tracking (`watchPosition`) with real-time camera auto-pan and animated pulsing marker with accuracy radius.
  - **Real-World Google Geocoding API**: Reverse-geocodes exact physical GPS coordinates to genuine street names, building names, and city areas via Google's database.
  - **Custom Dark Slate Mode Styling**: Night mode custom JSON styling matching SafeWay's dark UI.
  - **Google Maps Satellite & Hybrid Layers**: Switch between dark roadmap, satellite imagery, and terrain.
  - **Live Google Traffic Layer**: 1-click toggle to monitor real-time traffic congestion during night commutes.
  - **Map Engine Switcher**: Seamlessly toggle between **Google Maps API** and **Leaflet Dark (OpenStreetMap)**.
  - **API Key Configuration**: Enter your Google Cloud API Key in the UI or set `VITE_GOOGLE_MAPS_API_KEY` in `.env`. Works in free development mode as well!
- **Dynamic Facilities Radar**: Computes distance (in meters) and walking time using the Haversine formula for:
  - **Police Stations & Pink Safe Outposts**
  - **24/7 Multi-Specialty Trauma Hospitals**
  - **SafeHub Verified Transit Shelters & Cafes**
  - **All-Night Chemist & First-Aid Pharmacies**
- **Distance Radius & Category Filters**: Filter by facility type or distance (<500m, <1km, <2.5km, All).
- **1-Tap Actions**: Direct phone dialing and official Google Maps turn-by-turn walking navigation links.

### 2. 🛣️ Safe Route Planner (`Tab: Safe Route Planner`)
- **Custom Dark-Mode SVG Vector Canvas**: Vector grid, commercial corridors, municipal parks, residential sectors, and road network without third-party map API keys.
- **Multi-Criteria Routing Comparison**:
  - **Safest / Well-Lit Route (Emerald `#10B981`)**: 96% street lighting index, 14 active CCTV poles, police patrol frequency every 10–15 min, 4 safe hubs along the path.
  - **Fastest Direct Route (Crimson `#EF4444`)**: 42% lighting index, 3 CCTVs, cuts through unlit alleys and secluded park borders.
- **Interactive Layer Controls**: Toggle streetlight glow heatmap, toggle CCTV camera grid, and smooth zoom in/out/reset controls.

### 3. 🚨 One-Tap Floating SOS Emergency System
- High-visibility radial pulsing SOS trigger button.
- **5-Second Grace Countdown Modal**: Visual SVG progress ring and cancellation button to prevent accidental false alarms.
- **Native Web Audio API Siren Synthesizer**: Dual-oscillator frequency modulating warble siren (sweeping between 650 Hz and 1350 Hz) with mute/unmute control.
- **Active Emergency Overlay**:
  - Displays GPS coordinates (`12.9716° N, 77.5946° E`), location accuracy, and timestamp.
  - Simulates instant SMS dispatch with live tracking link to primary contacts.
  - Direct 1-tap emergency dial buttons for **112 (National Emergency)**, **100 (Police)**, and **1091 (Women Dedicated Helpline)**.
  - Visual high-contrast screen strobe for night visibility.

### 4. ⏰ Journey Safety Timer & Automated Check-In
- Configurable countdown timer (5m, 15m, 25m, 40m presets or custom minutes).
- Active countdown pill in header and dedicated journey tab.
- **"I Have Arrived Safely [Check In]"** confirmation with visual feedback.
- **Automated Fail-Safe Protocol**: If the timer reaches `00:00` without a user check-in, an acoustic distress alarm is triggered and an emergency warning banner is broadcast to contacts.

### 5. 🧑‍🤝‍🧑 Emergency Contacts & Live GPS Sharing
- Dynamic contact management (up to 5 verified guardians).
- Relationship tags (Parent, Sibling, Spouse, Friend, Guardian) and Primary Contact badge.
- **"Share Live GPS"**: Formats telemetry and copies tracking link to clipboard.

### 6. 📞 24/7 Verified Emergency Helplines
- Speed-dial directory for **112**, **100**, **1091**, **102**, **181**, and **1090** with average response time estimates.

### 7. 📱 Progressive Web App (PWA) Support
- Fully installable on iOS, Android, and Desktop as a standalone native-feeling application.
- Web App Manifest (`manifest.json`) and Service Worker (`sw.js`) for offline caching.

---

## 🚀 How to Run the Application

### Option A: Local Development Server (Vite + React)
```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Start local Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

### Option B: Production Preview
```bash
# Build the production bundle
npm run build

# Preview the production build locally
npm run preview
```

### Option C: Instant Zero-Install Browser Preview
You can also directly open `standalone-demo.html` in any modern web browser:
```bash
# File location:
safeway-app/standalone-demo.html
```

---

## 🛠️ Technology Stack
- **Framework**: React 18 (Functional Components, Hooks: `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`)
- **Styling**: Tailwind CSS, Lucide React Icons
- **Mapping**: Leaflet.js with CartoDB Dark Matter tiles & Custom SVG Vector Map Engine
- **Audio**: HTML5 Web Audio API (`AudioContext`, `OscillatorNode`)
- **PWA**: Service Worker API, Web App Manifest
