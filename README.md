# JomoRide: Live Driver Radar & Booking Selector

> **iOS Engineering Intern Assignment — Track A**  
> Built with **React Native**, **TypeScript**, **react-native-maps**, **@gorhom/bottom-sheet**, **react-native-reanimated**, and **Zustand**.

---

## 📱 Project Overview

JomoRide is a high-performance **Driver-as-a-Service (DaaS)** mobile interface that renders nearby available chauffeurs on an interactive 60fps radar map with a draggable booking drawer for tier selection (`Standard` vs. `★ Premium VIP`).

### ✨ Core Features
1. **Interactive Radar Map:** Custom dark obsidian MapKit canvas centered on real-time driver coordinates.
2. **60FPS Custom Vehicle Markers:** Custom driver avatars with rating badges and vehicle icons. Optimized with `React.memo` and `tracksViewChanges={false}` hardware texture acceleration.
3. **Draggable Drawer (Bottom Sheet):** Silky-smooth bottom sheet built on `@gorhom/bottom-sheet` and `react-native-reanimated` with 3 snap points (`16%`, `45%`, `85%`).
4. **Lag-Free Reactive Filtering:** Instant filtering between `All Fleet`, `Standard`, and `★ Premium` categories with automatic camera reframing (`fitToCoordinates`).
5. **Radar Pulse Ring:** UI-thread native pulse animation indicating live telemetry around the user location.
6. **Centralized State Management:** Zero-boilerplate, atomic selector Zustand store preventing unnecessary screen re-renders.

---

## 🏛️ Architecture & Technical Decisions

### 1. State Management: Zustand vs. Redux / Context
* **Choice:** `Zustand`
* **Why:** Redux introduces heavy boilerplate (reducers, actions, dispatchers). React Context triggers full subtree re-renders whenever state changes, which causes dropped frames on maps. Zustand provides **atomic selector subscriptions** (`useDriverStore(state => state.selectedCategory)`), ensuring that changing a filter only updates the components that care, keeping the JS thread completely free for 60fps interactions.

### 2. 60FPS Map Marker Optimization (`tracksViewChanges`)
* **Problem:** `react-native-maps` by default takes snapshot textures of custom view markers on every frame. When rendering 10-20 custom image markers, this causes severe stuttering (<30fps) on iOS.
* **Solution:** We dynamically toggle `tracksViewChanges` to `true` for 300ms on mount/selection, then permanently lock it to `false`. This converts markers into static hardware textures on iOS MapKit, completely eliminating re-draw overhead.

### 3. Native Gesture & Animation Architecture
* **Choice:** `@gorhom/bottom-sheet` + `react-native-reanimated` worklets.
* **Why:** Gestures run directly on the iOS native UI thread without traversing the asynchronous React Native bridge. Even if the JavaScript thread is busy, the bottom sheet drags at full device refresh rate (120Hz ProMotion on iPhone Pro models).

---

## 📂 Project Structure

```text
jomoride-radar/
├── App.tsx                              # Root application & provider container
├── src/
│   ├── api/
│   │   └── mockDrivers.ts               # Strongly-typed mock driver dataset
│   ├── features/
│   │   ├── map/
│   │   │   ├── components/
│   │   │   │   ├── DriverMarker.tsx     # Hardware-accelerated 60fps custom vehicle pin
│   │   │   │   └── UserPulseMarker.tsx  # Native radar pulse wave (Reanimated worklet)
│   │   │   ├── styles/
│   │   │   │   └── mapDarkStyle.ts      # Obsidian night theme for MapKit
│   │   │   └── MapRadarView.tsx         # Full-screen radar canvas & controls
│   │   │
│   │   └── bottomSheet/
│   │       ├── components/
│   │       │   ├── CategoryPills.tsx    # Filter toggle chips (All / Standard / Premium)
│   │       │   └── DriverListItem.tsx   # Detailed driver card with fare & ETA
│   │       └── DriverBottomSheet.tsx    # Draggable 3-stage drawer
│   │
│   ├── store/
│   │   └── useDriverStore.ts            # Atomic Zustand store
│   ├── theme/
│   │   └── colors.ts                    # Obsidian dark mode color palette
│   └── types/
│       └── driver.ts                    # Domain interfaces (Driver, Category, Coordinate)
└── ios/                                 # iOS Native Xcode Project & Pods
```

---

## 🛠️ Local Development & Running

### Prerequisites
* macOS with **Xcode** (15+ recommended)
* **Node.js** (>= 20)
* **CocoaPods**

### Installation
```bash
# 1. Clone repository
git clone https://github.com/Aryandubey825/jomoride-radar.git
cd jomoride-radar

# 2. Install dependencies
npm install

# 3. Install iOS CocoaPods
cd ios && pod install && cd ..

# 4. Start Metro bundler
npm start

# 5. Run on iOS Simulator (in a new terminal tab)
npm run ios
```

---

## 📦 How to Generate Local Xcode `.ipa` Build (Step-by-Step)

Per assignment instructions, **cloud builds are strictly prohibited** and the `.ipa` must be generated locally using Xcode on a Mac.

Follow these exact steps:

1. **Open Workspace in Xcode:**
   ```bash
   cd ios && open JomoRide.xcworkspace
   ```
   *(Always open `.xcworkspace`, never `.xcodeproj`)*

2. **Select Build Device:**
   * In Xcode top toolbar, click on the device selector and choose **Any iOS Device (arm64)**.

3. **Configure Signing:**
   * Select the root `JomoRide` project in the Project Navigator.
   * Under the **Signing & Capabilities** tab:
     * Check **Automatically manage signing**.
     * Select your Apple Developer Team / Personal Team.
     * Ensure Bundle Identifier is valid (e.g. `org.reactjs.native.example.JomoRide`).

4. **Create Archive:**
   * From the top menu bar, navigate to **Product** > **Archive**.
   * Xcode will compile the Release bundle and open the **Organizer** window once finished.

5. **Export `.ipa`:**
   * In the Organizer, select your latest archive and click **Distribute App** (blue button on right).
   * Select **Development** (or **Ad Hoc** / **TestFlight**).
   * Keep default distribution options (App Thinning: None, Re-sign).
   * Click **Export** and choose a destination folder on your Mac (e.g., Desktop).
   * Xcode will generate the final `JomoRide.ipa` file.

---

## 📄 License
MIT © JomoRide Engineering Assignment
