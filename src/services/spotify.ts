import { Spotify } from '../../capacitor-plugins/capacitor-spotify/src';
import type { SpotifyPlayerState } from '../../capacitor-plugins/capacitor-spotify/src';
import { SPOTIFY_CONFIG } from '../config/spotify';

let initialized = false;

export async function initSpotify(): Promise<void> {
  if (initialized) return;
  await Spotify.initialize({
    clientId: SPOTIFY_CONFIG.clientId,
    redirectUri: SPOTIFY_CONFIG.redirectUri,
  });
  initialized = true;
}

export async function connectSpotify(): Promise<string> {
  await initSpotify();
  const result = await Spotify.connect();
  return result.displayName;
}

export async function disconnectSpotify(): Promise<void> {
  await Spotify.disconnect();
}

export async function isSpotifyConnected(): Promise<boolean> {
  const { connected } = await Spotify.isConnected();
  return connected;
}

export async function spotifyPlay(uri: string): Promise<void> {
  await Spotify.play({ uri });
}

export async function spotifyResume(): Promise<void> {
  await Spotify.resume();
}

export async function spotifyPause(): Promise<void> {
  await Spotify.pause();
}

export async function spotifyNext(): Promise<void> {
  await Spotify.next();
}

export async function spotifyPrevious(): Promise<void> {
  await Spotify.previous();
}

export async function getSpotifyPlayerState(): Promise<SpotifyPlayerState> {
  return await Spotify.getPlayerState();
}

export function onPlayerStateChanged(callback: (state: SpotifyPlayerState) => void) {
  return Spotify.addListener('playerStateChanged', callback);
}

export function onConnectionStatusChanged(callback: (status: { connected: boolean }) => void) {
  return Spotify.addListener('connectionStatusChanged', callback);
}
