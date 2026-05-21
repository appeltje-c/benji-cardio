# Spotify Integration Specification

## Overview

Integrate Spotify App Remote SDK to control Spotify playback from within the Benji Cardio app. The app will remote-control the Spotify app on the user's device (not stream audio directly). Works on both iOS and Android.

---

## Prerequisites

### Spotify Developer Setup

1. Create an app at https://developer.spotify.com/dashboard
2. Note the **Client ID**
3. Configure redirect URI: `benji-cardio://spotify-callback`
4. Register platforms:
   - **iOS**: Add bundle ID `com.cardio.app`
   - **Android**: Add package name `com.cardio.app` + SHA-256 fingerprint

### User Requirements

- Spotify app installed on device
- Spotify Premium account (required for App Remote playback control)

---

## Architecture

```
src/
  services/
    spotify.ts                  # TypeScript API (calls Capacitor plugin)
  stores/
    spotifyStore.ts             # Zustand store for Spotify state

capacitor-plugins/
  capacitor-spotify/
    package.json
    src/
      index.ts                  # Plugin registration
      definitions.ts            # TypeScript interface
      web.ts                    # Web fallback (no-op / mock)
    ios/
      Plugin/
        SpotifyPlugin.swift     # iOS native implementation
        SpotifyPlugin.m         # ObjC bridge
    android/
      src/main/java/com/cardio/spotify/
        SpotifyPlugin.java      # Android native implementation
```

---

## Capacitor Plugin API

### TypeScript Interface (`definitions.ts`)

```typescript
export interface SpotifyPlugin {
  /**
   * Initialize the SDK with client ID and redirect URI.
   * Must be called once before any other method.
   */
  initialize(options: { clientId: string; redirectUri: string }): Promise<void>;

  /**
   * Start OAuth flow and connect to Spotify app.
   * Opens Spotify app for authorization, then connects App Remote.
   * Resolves with user display name on success.
   */
  connect(): Promise<{ displayName: string; isPremium: boolean }>;

  /**
   * Disconnect from Spotify App Remote.
   */
  disconnect(): Promise<void>;

  /**
   * Check if currently connected to Spotify.
   */
  isConnected(): Promise<{ connected: boolean }>;

  /**
   * Play a Spotify URI (track, album, playlist).
   * Examples:
   *   - spotify:track:6rqhFgbbKwnb9MLmUQDhG6
   *   - spotify:playlist:37i9dQZF1DXdPec7aLTmlC
   *   - spotify:album:4aawyAB9vmqN3uQ7FjRGTy
   */
  play(options: { uri: string; positionMs?: number }): Promise<void>;

  /**
   * Resume playback (if paused).
   */
  resume(): Promise<void>;

  /**
   * Pause playback.
   */
  pause(): Promise<void>;

  /**
   * Skip to next track.
   */
  next(): Promise<void>;

  /**
   * Skip to previous track.
   */
  previous(): Promise<void>;

  /**
   * Seek to position in current track.
   */
  seek(options: { positionMs: number }): Promise<void>;

  /**
   * Get current playback state.
   */
  getPlayerState(): Promise<SpotifyPlayerState>;

  /**
   * Register listener for player state changes.
   * Fires when track changes, play/pause state changes, or position updates.
   */
  addListener(
    event: 'playerStateChanged',
    callback: (state: SpotifyPlayerState) => void
  ): Promise<{ remove: () => void }>;

  /**
   * Register listener for connection status changes.
   */
  addListener(
    event: 'connectionStatusChanged',
    callback: (status: { connected: boolean }) => void
  ): Promise<{ remove: () => void }>;
}

export interface SpotifyPlayerState {
  trackName: string;
  artistName: string;
  albumName: string;
  albumArtUrl: string;       // 640x640 image URL
  durationMs: number;
  positionMs: number;
  isPaused: boolean;
  uri: string;               // spotify:track:xxx
}
```

---

## iOS Implementation

### Dependencies

Add SpotifyiOS SDK via Swift Package Manager in the Capacitor plugin's iOS target:
- Package URL: `https://github.com/nicscott2/SpotifyiOS`
- Or use the official binary framework from https://github.com/nicscott2/SpotifyiOS/releases

### Info.plist Additions

```xml
<!-- Allow opening Spotify app -->
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>spotify</string>
</array>

<!-- Redirect URI scheme -->
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>benji-cardio</string>
    </array>
    <key>CFBundleURLName</key>
    <string>com.cardio.app</string>
  </dict>
</array>
```

### Key Implementation Notes (iOS)

1. **Authorization**: Use `SPTSessionManager` for OAuth flow
2. **App Remote**: Use `SPTAppRemote` for playback control
3. **Handle URL callback**: In `AppDelegate.swift`, forward the callback URL to `SPTSessionManager`
4. **Background**: App Remote stays connected when app is backgrounded
5. **Reconnection**: Auto-reconnect on `applicationDidBecomeActive`

### AppDelegate Changes

```swift
// In AppDelegate.swift - add URL handling
func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    // Forward to Spotify plugin for OAuth callback
    NotificationCenter.default.post(name: .spotifyCallback, object: url)
    return true
}
```

---

## Android Implementation

### Dependencies

Add to plugin's `build.gradle`:

```groovy
dependencies {
    implementation 'com.spotify.android:auth:2.1.0'
    implementation files('libs/spotify-app-remote-release-0.8.0.aar')
}
```

Download the App Remote SDK AAR from: https://github.com/nicscott2/android-sdk/releases

### AndroidManifest.xml Additions

```xml
<!-- Redirect activity for OAuth -->
<activity
    android:name="com.spotify.sdk.android.auth.LoginActivity"
    android:theme="@android:style/Theme.Translucent.NoTitleBar" />

<!-- Intent filter for redirect URI -->
<activity android:name=".SpotifyCallbackActivity" android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="benji-cardio" android:host="spotify-callback" />
    </intent-filter>
</activity>
```

### Key Implementation Notes (Android)

1. **Authorization**: Use `AuthorizationClient.openLoginActivity()` for OAuth
2. **App Remote**: Use `SpotifyAppRemote.connect()` with `ConnectionParams`
3. **Player API**: `spotifyAppRemote.playerApi` for play/pause/skip/seek
4. **Image API**: `spotifyAppRemote.imagesApi` for album art
5. **Subscription**: Use `playerApi.subscribeToPlayerState()` for real-time updates

---

## Zustand Store (`spotifyStore.ts`)

```typescript
interface SpotifyState {
  isConnected: boolean;
  displayName: string | null;
  currentTrack: {
    name: string;
    artist: string;
    albumArt: string;
    durationMs: number;
    positionMs: number;
  } | null;
  isPaused: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  play: (uri: string) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  next: () => Promise<void>;
}
```

---

## UI Integration

### Connect Page

Add a "Connect Spotify" section below the HRM connection:

- **Disconnected**: Show "Connect Spotify" button with Spotify green branding
- **Connected**: Show user display name, current track (if playing), disconnect button
- **Error states**: "Spotify not installed", "Premium required"

### Training Player

When Spotify is connected, show in the player:

- Current track name + artist (compact, below the HR display)
- Play/pause inherits from training play/pause (auto-sync)
- When training pauses → Spotify pauses
- When training resumes → Spotify resumes
- When training stops → Spotify pauses

### Training Editor (optional future enhancement)

- Allow assigning a Spotify playlist URI to a training
- When training starts, begin playing that playlist
- Shuffle or sequential mode toggle

---

## Sync Behavior

| Training Event | Spotify Action |
|---|---|
| Start training | Resume / play assigned playlist |
| Pause training | Pause Spotify |
| Resume training | Resume Spotify |
| Stop training | Pause Spotify |
| Training finished | Pause Spotify |

---

## Configuration

Create a config file for the Spotify client ID:

```typescript
// src/config/spotify.ts
export const SPOTIFY_CONFIG = {
  clientId: 'YOUR_SPOTIFY_CLIENT_ID',
  redirectUri: 'benji-cardio://spotify-callback',
  scopes: [
    'app-remote-control',     // Required for App Remote
    'user-modify-playback-state', // Play/pause/skip
    'user-read-playback-state',   // Get current state
    'user-read-currently-playing', // Current track
  ],
};
```

---

## Error Handling

| Error | User Message | Action |
|---|---|---|
| Spotify app not installed | "Install Spotify to use this feature" | Link to App Store / Play Store |
| Not Premium | "Spotify Premium required for playback control" | Show info |
| Connection lost | "Spotify disconnected" | Auto-reconnect on next app foreground |
| Auth denied | "Spotify authorization cancelled" | Allow retry |
| Playback failed | "Could not play track" | Silent fail, continue training |

---

## Testing

### Without Spotify Premium

- Auth flow can still be tested (connects and gets user info)
- Playback commands will fail gracefully

### Simulator / Emulator

- Spotify App Remote does NOT work in simulators/emulators
- Must test on real devices with Spotify installed

### Manual Test Cases

1. Connect → verify user name shown
2. Play a playlist URI → verify music starts in Spotify
3. Pause training → verify Spotify pauses
4. Resume training → verify Spotify resumes
5. Kill Spotify app → verify graceful disconnect handling
6. Reopen app after background → verify auto-reconnect
7. No Spotify installed → verify friendly error message

---

## Implementation Order

1. Register Spotify Developer app, get client ID
2. Create Capacitor plugin skeleton with TypeScript definitions
3. Implement iOS native layer (SpotifyiOS SDK)
4. Implement Android native layer (App Remote SDK)
5. Create `spotifyStore.ts` and `spotify.ts` service
6. Add Spotify connect UI to Connect page
7. Integrate play/pause sync in TrainingPlayer
8. Add current track display in player
9. (Optional) Add playlist assignment to trainings
