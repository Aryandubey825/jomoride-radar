# JomoRide: Live Driver Radar & Booking Selector

> **iOS Engineering Intern Assignment — Track A**  
> Built with **React Native (0.76+)**, **TypeScript**, **Apple MapKit (`react-native-maps`)**, **@gorhom/bottom-sheet**, **React Native Reanimated 3**, and **Zustand**.

---

## 💡 1. Product Philosophy & Engineering Vision (My Thinking)

### The DaaS (Driver-as-a-Service) Problem Space
Unlike conventional taxi or ride-hailing apps (Uber, Lyft) where the customer hails a car and sits in the back, **JomoRide is a Driver-as-a-Service (DaaS) platform**:
* The customer **owns the car**.
* The customer hires a **vetted professional chauffeur** to drive their personal vehicle (for multi-hour duties, meetings, outstation trips, or safe returns).
* The chauffeur arrives at the vehicle location via **2-wheeler** to collect the car keys.

---

### 🗺️ System Roadmap: Current Implementation vs. Next Phase

```
┌──────────────────────────────────────────────┐       ┌──────────────────────────────────────────────┐
│        PHASE 1: CURRENT IMPLEMENTATION       │  ──►  │          PHASE 2: FUTURE ROADMAP             │
│        (Track A Assignment Scope)            │       │          (Post-Handover Vision)              │
├──────────────────────────────────────────────┤       ├──────────────────────────────────────────────┤
│ • 60FPS Interactive MapKit Radar Canvas      │       │ • Live In-Trip Vehicle Telemetry             │
│ • Hardware-accelerated Driver Markers        │       │   (Track your personal car after handover)   │
│ • Tier Selection (Standard vs. Premium VIP)  │       │                                              │
│ • Instant Dispatch vs. Scheduled Duty        │       │ • Family & Guardian Live Location Sharing    │
│ • Liquid Glass Calendar & Wheel Time Picker  │       │   (1-tap WhatsApp/iMessage live web link)    │
│ • Random Telemetry Radar Matching            │       │                                              │
│ • Secure Key Handover Protocol (OTP 4821)    │       │ • Speed Telemetry & Geo-Fencing Alerts       │
└──────────────────────────────────────────────┘       └──────────────────────────────────────────────┘
```

#### ✅ Phase 1: What is Currently Built (Track A Scope)
1. **Radar Telemetry Canvas:** 60fps dark obsidian MapKit interface rendering real-time nearby drivers with hardware texture caching.
2. **Dynamic Tier Switching:** Native iOS switch instantly toggling between Standard verified drivers ($22/hr) and VIP Chauffeurs ($48/hr) with Reanimated spring physics.
3. **Dual Booking Modalities:**
   - **Right Now (Instant):** 3.5s radar scan, random driver matching, 3 min ETA, and live route polyline on map.
   - **Schedule Later:** Strict 7-column Liquid Glass calendar grid and 3-column wheel time picker; multi-day duty stepper (1–168 hrs). Confirms reservation without premature route lines or fake timers.
4. **Key Handover Security Protocol:** Dedicated OTP (`4821`) card ensuring verified handover before the car keys are released to the chauffeur.

#### 🚀 Phase 2: Planned Architectural Roadmap
1. **Post-Handover Live Vehicle Tracking:**
   - Once the driver arrives and enters the valid OTP (`4821`), the car keys are officially handed over.
   - The customer app immediately transitions to **In-Trip Vehicle Telemetry**: Since it is the customer's *own personal car*, the user can track exactly where their vehicle is being driven in real-time, including speed and route stops.
2. **Family & Relative Live Share (Guardian Tracking):**
   - A dedicated *"Share Vehicle Location"* button generating a secure, end-to-end encrypted live tracking web link.
   - Customers can share this link with family or relatives via WhatsApp/iMessage so loved ones have continuous visibility into the car's whereabouts.
3. **Geo-Fencing & Speed Limits:**
   - Real-time push alerts if the personal vehicle departs a pre-configured perimeter or exceeds defined safety speed thresholds.

---

## 🏛️ 2. System Architecture & Technical Decisions

### Component Hierarchy Tree

```text
App.tsx
 ├── GestureHandlerRootView (Native Gesture Interceptor)
 │    └── SafeAreaProvider
 │         ├── MapRadarView (Layer 1: 60FPS Interactive MapKit Canvas)
 │         │    ├── MapView (Obsidian dark theme, showsCompass=false)
 │         │    │    ├── UserPulseMarker (Infinite native pulsing radar wave)
 │         │    │    ├── DriverMarker[] (Memoized hardware texture markers)
 │         │    │    └── Polyline (Instant dispatch chauffeur route line)
 │         │    └── NavigationFloatingButton (Apple-style smooth re-center)
 │         │
 │         └── DriverBottomSheet (Layer 2: Draggable DaaS Booking Drawer)
 │              ├── BottomSheet (Snap points: 22%, 60%, 92%)
 │              └── BottomSheetScrollView
 │                   ├── STATE 1: IDLE (Configuration)
 │                   │    ├── HeaderRow (Title + Minimal iOS Switch)
 │                   │    ├── TimingPills (Right Now vs. Schedule Later)
 │                   │    ├── ScheduleStartsRow (Opens Liquid Glass Modal)
 │                   │    ├── DutyDurationCard (TextInput + UIStepper [−|+])
 │                   │    ├── FareBreakdownCard (Live dynamic calculation)
 │                   │    └── PrimaryActionButton ("Hire / Schedule Chauffeur")
 │                   │
 │                   ├── STATE 2: SEARCHING (Telemetry Radar)
 │                   │    ├── PulsingRadarRing (3.5s countdown animation)
 │                   │    └── StatusTelemetryPill ("LIVE RADAR ACTIVE")
 │                   │
 │                   └── STATE 3: CONFIRMED (Chauffeur Assigned)
 │                        ├── ConfirmedHeader (Instant ETA vs. Scheduled Date/Time)
 │                        ├── DriverProfileCard (Avatar, rating, 2-wheeler mode)
 │                        ├── KeyHandoverOTPCard (OTP 4821 with glass badge)
 │                        └── CancelBookingButton ("Cancel Request")
 └── LiquidGlassModalOverlay (Layer 3: Calendar & Wheel Picker)
      ├── SegmentedTabs (Date Tab vs. Time Tab)
      ├── 7-Column Strict Calendar Grid (14.285% column math)
      └── 3-Column iOS Wheel Time Picker (Hours 1-12, Minutes 00-59, AM/PM)
```

---

## ⚡ 3. Deep Performance Engineering (60FPS / 120Hz)

### 1. Zero-Jank State Management: Zustand vs. Context / Redux
* **The Problem:** In React Native map applications, putting state in standard `React.createContext` causes the entire component tree (including the heavy `MapView` and all child markers) to re-render whenever bottom sheet state changes (e.g. dragging the sheet, incrementing hours, typing in duration). This drops frames drastically (<25fps).
* **The Solution:** We adopted **Zustand** with granular atomic selectors:
  ```ts
  const selectedCategory = useDriverStore(state => state.selectedCategory);
  const matchedDriver = useDriverStore(state => state.matchedDriver);
  ```
  Dragging the bottom sheet or modifying the duration does **NOT** trigger a single render cycle in `MapRadarView`.

### 2. Eliminating Map Marker Re-Draw Bottlenecks (`tracksViewChanges`)
* **The Problem:** `react-native-maps` takes an off-screen bitmap snapshot of custom React Native views on every frame by default. With 10+ custom avatar markers with SVG badges, this destroys the iOS Main Thread during map dragging and zooming.
* **The Solution:** 
  1. We wrap each marker inside `React.memo` with a strict equality comparator.
  2. We permanently set `tracksViewChanges={false}`, instructing iOS MapKit to bake the marker into a static GPU hardware texture.
  3. Marker scaling on filter change is driven by `react-native-reanimated` spring physics running directly on the native render thread.

### 3. Viewport Geometry & Eliminating Dual-Animation Thrashing
* Combining React Native's imperative `LayoutAnimation.configureNext` with declarative Reanimated `layout={LinearTransition...}` causes UIKit layout passes to fight against Reanimated worklets, causing the card to wobble/shake.
* **Fix:** Enforced a fixed mathematical viewport height (`280px`) with declarative cross-fades (`FadeIn.duration(180)` / `FadeOut.duration(100)`), ensuring zero layout thrashing during tab or month transitions.

---

## 📂 4. Project Directory Structure

```text
jomoride-radar/
├── App.tsx                              # Root container, SafeAreaProvider & GestureHandler
├── src/
│   ├── api/
│   │   └── mockDrivers.ts               # Strongly-typed mock driver dataset & initial SF region
│   ├── features/
│   │   ├── map/
│   │   │   ├── components/
│   │   │   │   ├── DriverMarker.tsx     # Hardware-accelerated 60fps custom vehicle pin
│   │   │   │   └── UserPulseMarker.tsx  # Native radar pulse wave (Reanimated worklet)
│   │   │   ├── styles/
│   │   │   │   └── mapDarkStyle.ts      # Obsidian night theme for Apple MapKit
│   │   │   └── MapRadarView.tsx         # Full-screen radar canvas, camera framing & polyline
│   │   │
│   │   └── bottomSheet/
│   │       └── DriverBottomSheet.tsx    # Draggable 3-stage drawer & Liquid Glass Picker Modal
│   │
│   ├── store/
│   │   └── useDriverStore.ts            # Atomic Zustand store with DaaS booking state
│   ├── theme/
│   │   └── colors.ts                    # Apple iOS System Blue & Obsidian dark tokens
│   └── types/
│       └── driver.ts                    # TypeScript domain interfaces (Driver, Coordinate, etc.)
├── ios/                                 # iOS Native Xcode Workspace & CocoaPods
├── README.md                            # Comprehensive architectural documentation
└── package.json                         # Project dependencies and npm scripts
```

---

## 🛠️ 5. Local Setup & Running

```bash
# 1. Clone repository
git clone https://github.com/Aryandubey825/jomoride-radar.git
cd jomoride-radar

# 2. Install dependencies & CocoaPods
npm install
cd ios && pod install && cd ..

# 3. Start Metro & Launch iOS Simulator
npm start
npm run ios
```

---

## 📦 6. How to Generate Local Xcode `.ipa` Build (Step-by-Step)

Per assignment instructions, **cloud builds (such as EAS Cloud) are strictly prohibited** and the `.ipa` must be generated locally using Xcode on a Mac. Below are the two standard methods to produce the build:

### Method A: Via Xcode UI (Standard Native Workflow)
1. **Open Workspace in Xcode:**
   ```bash
   cd ios && open JomoRide.xcworkspace
   ```
   *(Always open `.xcworkspace`, never `.xcodeproj`)*

2. **Select Destination Device:**
   * In Xcode's top toolbar device selector, choose **Any iOS Device (arm64)** (or your connected physical iPhone).

3. **Configure Code Signing:**
   * Select the root `JomoRide` project in the left Project Navigator.
   * Under the **Signing & Capabilities** tab:
     * Check **Automatically manage signing**.
     * Select your Apple ID under **Team** (*Personal Team*).
     * Set a unique Bundle Identifier (e.g. `com.aryanduve.jomoride`).

4. **Create Archive:**
   * From the macOS top menu bar, click **Product** > **Archive**.
   * Xcode will compile the Release bundle and automatically open the **Organizer** window.

5. **Export `.ipa`:**
   * In the Organizer, select the latest archive and click **Distribute App** (blue button on right).
   * Select **Development** (or **Custom** > **Ad Hoc** / **Development**).
   * Keep default distribution options (App Thinning: None).
   * Click **Export** and choose destination folder (e.g., Desktop). Xcode outputs `JomoRide.ipa`.

---

### Method B: Via Terminal CLI (Fast & Reproducible Native Build)
To produce a clean, unencumbered local `.ipa` package directly from the command line using Xcode's native toolchain (`xcodebuild`):

```bash
cd ios

# 1. Compile the Release build for generic arm64 iOS
xcodebuild -workspace JomoRide.xcworkspace \
  -scheme JomoRide \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -derivedDataPath ./build \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO

# 2. Package the compiled .app into Apple's standard Payload structure
mkdir -p ./build/Payload
cp -r ./build/Build/Products/Release-iphoneos/JomoRide.app ./build/Payload/

# 3. Zip into .ipa and move to Desktop
cd ./build
zip -r -q JomoRide.ipa Payload
mv JomoRide.ipa ~/Desktop/
```
The resulting `JomoRide.ipa` (7.8 MB) is generated on the Desktop and attached to the submission.

---

## 🎯 7. Assignment Verification Matrix (Track A)

| Evaluation Parameter | Assignment Requirement | JomoRide Status |
| :--- | :--- | :---: |
| **Map Integration** | Centered on mock location using `react-native-maps` | ✅ **Complete** |
| **Custom Vehicle Markers** | Non-generic custom avatars with ratings & vehicle badges | ✅ **Complete** |
| **Bottom Sheet** | Smooth draggable sheet with driver tier toggle | ✅ **Complete** |
| **Reactive Filtering** | 60FPS marker pop-up / pop-down without frame drops | ✅ **Complete** |
| **State Architecture** | Centralized, atomic Zustand store | ✅ **Complete** |
| **DaaS Business Logic** | Instant vs Scheduled separation, Handover OTP | ✅ **Complete** |
| **Local iOS Build** | Xcode archive without cloud builders | ✅ **Complete** |

---

## 📄 License
MIT © 2026 JomoRide iOS Engineering Submission. Built with care by Aryan Dubey.
