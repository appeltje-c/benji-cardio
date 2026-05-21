import { WebPlugin } from '@capacitor/core';
import type { SpotifyPlugin, SpotifyPlayerState } from './definitions';

export class SpotifyWeb extends WebPlugin implements SpotifyPlugin {
  async initialize(): Promise<void> {
    console.warn('Spotify App Remote is not available on web');
  }

  async connect(): Promise<{ displayName: string }> {
    throw new Error('Spotify App Remote is not available on web');
  }

  async disconnect(): Promise<void> {}

  async isConnected(): Promise<{ connected: boolean }> {
    return { connected: false };
  }

  async play(): Promise<void> {
    throw new Error('Spotify App Remote is not available on web');
  }

  async resume(): Promise<void> {}
  async pause(): Promise<void> {}
  async next(): Promise<void> {}
  async previous(): Promise<void> {}
  async seek(): Promise<void> {}

  async getPlayerState(): Promise<SpotifyPlayerState> {
    return {
      trackName: '',
      artistName: '',
      albumName: '',
      albumArtUrl: '',
      durationMs: 0,
      positionMs: 0,
      isPaused: true,
      uri: '',
    };
  }
}
