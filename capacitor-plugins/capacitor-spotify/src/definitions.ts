import type { PluginListenerHandle } from '@capacitor/core';

export interface SpotifyPlugin {
  initialize(options: { clientId: string; redirectUri: string }): Promise<void>;
  connect(): Promise<{ displayName: string }>;
  disconnect(): Promise<void>;
  isConnected(): Promise<{ connected: boolean }>;
  play(options: { uri: string; positionMs?: number }): Promise<void>;
  resume(): Promise<void>;
  pause(): Promise<void>;
  next(): Promise<void>;
  previous(): Promise<void>;
  seek(options: { positionMs: number }): Promise<void>;
  getPlayerState(): Promise<SpotifyPlayerState>;
  addListener(
    event: 'playerStateChanged',
    callback: (state: SpotifyPlayerState) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    event: 'connectionStatusChanged',
    callback: (status: { connected: boolean }) => void
  ): Promise<PluginListenerHandle>;
}

export interface SpotifyPlayerState {
  trackName: string;
  artistName: string;
  albumName: string;
  albumArtUrl: string;
  durationMs: number;
  positionMs: number;
  isPaused: boolean;
  uri: string;
}
