import { create } from 'zustand';
import type { Training } from '../types';

export type PlayerStatus = 'idle' | 'playing' | 'paused' | 'finished';

interface PlayerState {
  status: PlayerStatus;
  training: Training | null;
  currentSegmentIndex: number;
  elapsedMs: number;
  segmentElapsedMs: number;
  startTraining: (training: Training) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  tick: (deltaMs: number) => void;
  advanceSegment: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  status: 'idle',
  training: null,
  currentSegmentIndex: 0,
  elapsedMs: 0,
  segmentElapsedMs: 0,

  startTraining: (training: Training) =>
    set({
      status: 'playing',
      training,
      currentSegmentIndex: 0,
      elapsedMs: 0,
      segmentElapsedMs: 0,
    }),

  play: () => set({ status: 'playing' }),
  pause: () => set({ status: 'paused' }),

  stop: () =>
    set({
      status: 'idle',
      training: null,
      currentSegmentIndex: 0,
      elapsedMs: 0,
      segmentElapsedMs: 0,
    }),

  tick: (deltaMs: number) => {
    const { training, currentSegmentIndex, segmentElapsedMs, elapsedMs, status } = get();
    if (status !== 'playing' || !training) return;

    const segment = training.segments[currentSegmentIndex];
    if (!segment) {
      set({ status: 'finished' });
      return;
    }

    const newSegmentElapsed = segmentElapsedMs + deltaMs;
    const segmentDurationMs = segment.durationSeconds * 1000;

    if (newSegmentElapsed >= segmentDurationMs) {
      // Move to next segment
      const nextIndex = currentSegmentIndex + 1;
      if (nextIndex >= training.segments.length) {
        set({ status: 'finished', elapsedMs: elapsedMs + deltaMs, segmentElapsedMs: segmentDurationMs });
      } else {
        set({
          currentSegmentIndex: nextIndex,
          segmentElapsedMs: newSegmentElapsed - segmentDurationMs,
          elapsedMs: elapsedMs + deltaMs,
        });
      }
    } else {
      set({
        segmentElapsedMs: newSegmentElapsed,
        elapsedMs: elapsedMs + deltaMs,
      });
    }
  },

  advanceSegment: () => {
    const { training, currentSegmentIndex } = get();
    if (!training) return;
    const nextIndex = currentSegmentIndex + 1;
    if (nextIndex >= training.segments.length) {
      set({ status: 'finished' });
    } else {
      set({ currentSegmentIndex: nextIndex, segmentElapsedMs: 0 });
    }
  },
}));
