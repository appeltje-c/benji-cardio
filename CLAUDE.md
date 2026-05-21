# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager: **pnpm** (`pnpm-lock.yaml` is the source of truth; `package-lock.json` was removed).

- `pnpm dev` — Vite dev server (web)
- `pnpm build` — Type-check (`tsc -b`) then Vite build to `dist/`
- `pnpm lint` — ESLint over the repo
- `pnpm cap:sync` — Build web bundle and sync to the iOS Capacitor project
- `pnpm ios:open` — Open the iOS project in Xcode
- `pnpm ios:run` — Build, sync, and run on the default iOS target
- `pnpm ios:device` — Same as `ios:run` but prompts for a target device

There is no test runner configured.

## Architecture

This is a **Capacitor + React + TypeScript + Vite** mobile app ("Benji Cardio") that pairs with a BLE heart-rate monitor and runs zone-based interval trainings, optionally syncing playback with Spotify. iOS is the only native platform currently wired up; the web build runs in `pnpm dev` but BLE/Spotify will only work on device.

### App shell
- `src/main.tsx` → `src/App.tsx`: MUI `ThemeProvider` (dark theme in `src/theme.ts`) wraps a `BrowserRouter` with five routes: `/`, `/connect`, `/profile`, `/training/:id/edit`, `/player/:id`. The first three render inside `components/Layout`; the editor and player are full-screen.
- `capacitor.config.ts`: `appId` is `com.cardio.app`, web assets are loaded from `dist/`.

### State (Zustand stores in `src/stores/`)
Each concern is a separate store; some are persisted to `localStorage` via `zustand/middleware`:

- `profileStore` (persisted, key `cardio-profile`) — age/weight/height + `getMaxHR()` (220 − age, default 190).
- `trainingStore` (persisted, key `cardio-trainings`) — CRUD for `Training` objects, each a list of `TrainingSegment { durationSeconds, targetZone }`. UUIDs via `uuid`.
- `heartRateStore` — current bpm/zone, connection status, full history (`HRDataPoint[]`), min/max, and accumulated `calories`. `setBpm(bpm, elapsedMs)` derives zone via `utils/zones.getZoneForHR` using `profileStore.getMaxHR()` and integrates calories using the Keytel et al. formula (gender-neutral average; requires age + weight).
- `playerStore` — training playback state machine (`idle | playing | paused | finished`), segment index, `elapsedMs`, `segmentElapsedMs`. `tick(deltaMs)` is driven by `TrainingPlayer` and auto-advances segments / transitions to `finished`.
- `spotifyStore` — wraps the Spotify plugin. `connect`/`disconnect`/`play`/`pause`/`resume`/`next` are best-effort and swallow errors during training (silent fail). `initListeners()` subscribes to `playerStateChanged` / `connectionStatusChanged` from the native plugin.

Cross-store dependency: `heartRateStore.setBpm` reads `profileStore` synchronously via `useProfileStore.getState()`. Keep this pattern when adding similar cross-store reads — don't create circular subscriptions.

### Zones
`src/utils/zones.ts` is the single source of truth for the 5-zone model:
- `ZONE_CONFIGS` defines % of max-HR boundaries (50–60, 60–70, 70–80, 80–90, 90–100) and colors.
- `getZoneForHR`, `getTargetBpmRange`, `getEffortGuidance` (returns `push | ease | in_zone | no_signal`) — use these rather than re-deriving zone math anywhere else.

### Bluetooth / heart-rate monitor
`src/services/bluetooth.ts` uses `@capacitor-community/bluetooth-le`. Standard BLE Heart Rate Service (`0x180D`) + Measurement characteristic (`0x2A37`). `scanAndConnectHRM(onHR)` initializes BLE, requests a device filtered to the HR service, connects, and starts notifications. Parses 8-bit vs 16-bit bpm based on flag byte bit 0. A single module-level `connectedDeviceId` tracks the active device — only one HRM at a time.

iOS requires `NSBluetoothAlwaysUsageDescription` in `ios/App/App/Info.plist` (already set in repo).

### Spotify integration
This is **remote control**, not playback streaming — the app sends commands to the Spotify app on the user's device (requires Spotify Premium and the Spotify app installed). It does not work in iOS Simulator.

- **Custom Capacitor plugin** lives at `capacitor-plugins/capacitor-spotify/` (TS + iOS Swift + Android Java skeleton).
- **TS service** `src/services/spotify.ts` is the type-safe wrapper called by `spotifyStore`.
- **Config** `src/config/spotify.ts` holds the client ID; redirect URI is `benji-cardio://spotify-callback`.
- **Sync rules** (implemented in `pages/TrainingPlayer.tsx` via `spotifyStore`): training play → Spotify resume/play; training pause/stop/finish → Spotify pause.

The complete spec — native dependencies (`SpotifyiOS` SPM package, Android App Remote AAR), Info.plist / AndroidManifest entries, OAuth callback handling in `AppDelegate.swift`, error/UI states, and an implementation order — is in `SPOTIFY_INTEGRATION.md`. Read it before touching the plugin or the native iOS Spotify wiring.

### iOS native project
`ios/App/` is a standard Capacitor iOS app. Swift Package dependencies are managed via `ios/App/CapApp-SPM/Package.swift` and `ios/App/App.xcodeproj/.../Package.resolved`. After changes to web code, run `pnpm cap:sync` so `dist/` is copied into the iOS bundle; after adding native deps, open Xcode (`pnpm ios:open`) to resolve packages.
