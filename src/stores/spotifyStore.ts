import { create } from 'zustand';
import {
  connectSpotify,
  disconnectSpotify,
  spotifyPlay,
  spotifyPause,
  spotifyResume,
  spotifyNext,
  onPlayerStateChanged,
  onConnectionStatusChanged,
} from '../services/spotify';

interface SpotifyTrack {
  name: string;
  artist: string;
  uri: string;
  durationMs: number;
  positionMs: number;
}

interface SpotifyState {
  isConnected: boolean;
  displayName: string | null;
  currentTrack: SpotifyTrack | null;
  isPaused: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  play: (uri: string) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  next: () => Promise<void>;
  initListeners: () => void;
}

export const useSpotifyStore = create<SpotifyState>((set) => ({
  isConnected: false,
  displayName: null,
  currentTrack: null,
  isPaused: true,
  error: null,

  connect: async () => {
    set({ error: null });
    try {
      const displayName = await connectSpotify();
      set({ isConnected: true, displayName });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to connect to Spotify';
      set({ error: msg });
    }
  },

  disconnect: async () => {
    try {
      await disconnectSpotify();
    } catch {
      // ignore
    }
    set({ isConnected: false, displayName: null, currentTrack: null });
  },

  play: async (uri: string) => {
    try {
      await spotifyPlay(uri);
    } catch {
      // silent fail during training
    }
  },

  pause: async () => {
    try {
      await spotifyPause();
    } catch {
      // silent fail
    }
  },

  resume: async () => {
    try {
      await spotifyResume();
    } catch {
      // silent fail
    }
  },

  next: async () => {
    try {
      await spotifyNext();
    } catch {
      // silent fail
    }
  },

  initListeners: () => {
    onPlayerStateChanged((state) => {
      set({
        currentTrack: state.trackName
          ? {
              name: state.trackName,
              artist: state.artistName,
              uri: state.uri,
              durationMs: state.durationMs,
              positionMs: state.positionMs,
            }
          : null,
        isPaused: state.isPaused,
      });
    });

    onConnectionStatusChanged((status) => {
      set({ isConnected: status.connected });
      if (!status.connected) {
        set({ currentTrack: null });
      }
    });
  },
}));
