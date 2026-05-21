/* global React, lucide */

// ============================================================================
// Vital — shared utilities & mock data
// Designed to map cleanly to a React 19 + MUI 9 app:
//   - Each Page* function -> a route component
//   - hrZones(age) -> a util/HR.ts module
//   - sampleTrainings -> a fixture or API response shape
// ============================================================================

// ---------- Lucide icon helper -----------------------------------------------
function Icon({ name, size = 20, strokeWidth = 1.75, color, style }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current && window.lucide) {
      ref.current.innerHTML = "";
      const i = document.createElement("i");
      i.setAttribute("data-lucide", name);
      ref.current.appendChild(i);
      window.lucide.createIcons({
        attrs: { width: size, height: size, "stroke-width": strokeWidth, stroke: color || "currentColor" },
        root: ref.current,
      });
    }
  }, [name, size, strokeWidth, color]);
  return <span ref={ref} style={{ display: "inline-flex", width: size, height: size, color, ...(style || {}) }} />;
}

// ---------- HR zone math (220 - age, 5 zones) --------------------------------
const ZONE_RANGES = [
  { z: 1, lo: 0.50, hi: 0.60, name: "Recovery",   desc: "Very light",     hint: "Active recovery, warm-ups" },
  { z: 2, lo: 0.60, hi: 0.70, name: "Endurance",  desc: "Light",          hint: "Long base aerobic work" },
  { z: 3, lo: 0.70, hi: 0.80, name: "Tempo",      desc: "Moderate",       hint: "Steady, sustainable effort" },
  { z: 4, lo: 0.80, hi: 0.90, name: "Threshold",  desc: "Hard",           hint: "Lactate threshold work" },
  { z: 5, lo: 0.90, hi: 1.00, name: "VO\u2082 Max", desc: "Maximum",      hint: "All-out intervals" },
];

function hrZones(age) {
  const max = 220 - age;
  return ZONE_RANGES.map(r => ({
    ...r,
    bpmLo: Math.round(max * r.lo),
    bpmHi: Math.round(max * r.hi),
  }));
}

// ---------- Mock user profile ------------------------------------------------
const PROFILE = {
  name: "Daan",
  age: 34,
  weight: 78,        // kg
  height: 184,       // cm
  restingHr: 56,
  email: "daan@vital.app",
};

// ---------- Mock trainings ---------------------------------------------------
// Segments are { duration: seconds, zone: 1..5, label }
const sampleTrainings = [
  {
    id: "t1", name: "Threshold 4×4",  emoji: "🔥",
    description: "Classic VO\u2082 max intervals",
    duration: 36 * 60, segments: [
      { d: 600,  z: 1, l: "Warm-up" },
      { d: 240,  z: 4, l: "Hard 1" }, { d: 180, z: 2, l: "Easy" },
      { d: 240,  z: 4, l: "Hard 2" }, { d: 180, z: 2, l: "Easy" },
      { d: 240,  z: 4, l: "Hard 3" }, { d: 180, z: 2, l: "Easy" },
      { d: 240,  z: 4, l: "Hard 4" }, { d: 360, z: 1, l: "Cool-down" },
    ],
  },
  {
    id: "t2", name: "Z2 Base Build", emoji: "🌱",
    description: "Steady aerobic mileage",
    duration: 60 * 60, segments: [
      { d: 600,  z: 1, l: "Warm-up" },
      { d: 2400, z: 2, l: "Steady" },
      { d: 360,  z: 3, l: "Pickup" },
      { d: 240,  z: 1, l: "Cool-down" },
    ],
  },
  {
    id: "t3", name: "Pyramid", emoji: "🔺",
    description: "Build, peak, descend",
    duration: 42 * 60, segments: [
      { d: 480, z: 1, l: "Warm-up" },
      { d: 180, z: 2, l: "Up 1" },
      { d: 180, z: 3, l: "Up 2" },
      { d: 180, z: 4, l: "Up 3" },
      { d: 180, z: 5, l: "Peak" },
      { d: 180, z: 4, l: "Down 1" },
      { d: 180, z: 3, l: "Down 2" },
      { d: 180, z: 2, l: "Down 3" },
      { d: 540, z: 1, l: "Cool-down" },
    ],
  },
  {
    id: "t4", name: "Sprint 8s", emoji: "⚡",
    description: "8× 30s all-out",
    duration: 28 * 60, segments: [
      { d: 480, z: 1, l: "Warm-up" },
      { d: 30,  z: 5, l: "Sprint 1" }, { d: 90, z: 1, l: "Rest" },
      { d: 30,  z: 5, l: "Sprint 2" }, { d: 90, z: 1, l: "Rest" },
      { d: 30,  z: 5, l: "Sprint 3" }, { d: 90, z: 1, l: "Rest" },
      { d: 30,  z: 5, l: "Sprint 4" }, { d: 90, z: 1, l: "Rest" },
      { d: 30,  z: 5, l: "Sprint 5" }, { d: 90, z: 1, l: "Rest" },
      { d: 30,  z: 5, l: "Sprint 6" }, { d: 90, z: 1, l: "Rest" },
      { d: 30,  z: 5, l: "Sprint 7" }, { d: 90, z: 1, l: "Rest" },
      { d: 30,  z: 5, l: "Sprint 8" }, { d: 240, z: 1, l: "Cool-down" },
    ],
  },
];

// ---------- Helpers ----------------------------------------------------------
function fmtTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) return `${Math.floor(m/60)}h ${(m%60).toString().padStart(2,"0")}m`;
  return `${m}:${s.toString().padStart(2,"0")}`;
}
function fmtDur(seconds) {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m/60)}h ${m%60 ? (m%60)+"m" : ""}`.trim();
}

// kg <-> lb, cm <-> ft/in
function kgToLb(kg) { return Math.round(kg * 2.20462); }
function cmToFt(cm) {
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inch = Math.round(totalIn - ft * 12);
  return `${ft}'${inch}"`;
}
function fmtWeight(kg, unit) { return unit === "imperial" ? `${kgToLb(kg)} lb` : `${kg} kg`; }
function fmtHeight(cm, unit) { return unit === "imperial" ? cmToFt(cm) : `${cm} cm`; }

// ---------- Bluetooth mock devices ------------------------------------------
const sampleDevices = [
  { id: "d1", name: "Polar H10", mac: "A4:C1:38:7F:91:E2", rssi: -42, battery: 84, connected: true,  type: "Chest strap" },
  { id: "d2", name: "Garmin HRM-Pro", mac: "DE:24:01:5C:3B:88", rssi: -58, battery: null, connected: false, type: "Chest strap" },
  { id: "d3", name: "Wahoo TICKR X", mac: "F1:99:0A:11:62:CD", rssi: -65, battery: null, connected: false, type: "Chest strap" },
  { id: "d4", name: "CooSpo H6",       mac: "3D:11:CC:0E:7A:91", rssi: -71, battery: null, connected: false, type: "Armband" },
];

// ---------- Zone color (raw hex; for SVGs etc.) -----------------------------
const ZONE_COLOR = {
  1: { fg: "#027DEB", solid: "#027DEB", bg: "#E6F3FF", border: "#98CCFF" },
  2: { fg: "#208A20", solid: "#39C239", bg: "#F4FCF3", border: "#92D790" },
  3: { fg: "#A37A0A", solid: "#F2B40D", bg: "#FFF7E0", border: "#FBDB8E" },
  4: { fg: "#9B2608", solid: "#FF551F", bg: "#FFEFEB", border: "#FFB9A3" },
  5: { fg: "#8A0807", solid: "#DF2020", bg: "#F7E0E1", border: "#D9AAA9" },
};

// ---------- Tweaks context --------------------------------------------------
// Read by every page so dark mode / units are global. The host (index.html)
// will pass the current value via React.createContext.
const TweakCtx = React.createContext({ dark: false, units: "metric" });
const useTweakCtx = () => React.useContext(TweakCtx);

// ---------- Export ----------------------------------------------------------
Object.assign(window, {
  Icon, hrZones, ZONE_RANGES, ZONE_COLOR,
  PROFILE, sampleTrainings, sampleDevices,
  fmtTime, fmtDur, fmtWeight, fmtHeight, kgToLb, cmToFt,
  TweakCtx, useTweakCtx,
});
