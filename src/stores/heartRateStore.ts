import { create } from 'zustand';
import type { Zone } from '../types';
import { getZoneForHR } from '../utils/zones';
import { useProfileStore } from './profileStore';

export interface HRDataPoint {
  bpm: number;
  timeMs: number;
}

interface HeartRateState {
  bpm: number;
  zone: Zone;
  isConnected: boolean;
  deviceName: string | null;
  history: HRDataPoint[];
  minBpm: number;
  maxBpm: number;
  calories: number;
  setBpm: (bpm: number, elapsedMs: number) => void;
  setConnected: (connected: boolean, deviceName?: string) => void;
  resetHistory: () => void;
}

/**
 * Calorie burn rate (kcal/min) based on HR using the Keytel et al. formula.
 * Uses gender-neutral average of male/female equations.
 * Requires: age (years), weight (kg), HR (bpm)
 */
function caloriesPerMinute(hr: number, age: number, weight: number): number {
  // Male:   (-55.0969 + 0.6309*HR + 0.1988*W + 0.2017*A) / 4.184
  // Female: (-20.4022 + 0.4472*HR - 0.1263*W + 0.074*A) / 4.184
  // We use the average of both
  const male = (-55.0969 + 0.6309 * hr + 0.1988 * weight + 0.2017 * age) / 4.184;
  const female = (-20.4022 + 0.4472 * hr - 0.1263 * weight + 0.074 * age) / 4.184;
  return Math.max(0, (male + female) / 2);
}

export const useHeartRateStore = create<HeartRateState>((set, get) => ({
  bpm: 0,
  zone: 1,
  isConnected: false,
  deviceName: null,
  history: [],
  minBpm: 0,
  maxBpm: 0,
  calories: 0,
  setBpm: (bpm: number, elapsedMs: number) => {
    const profile = useProfileStore.getState();
    const maxHR = profile.getMaxHR();
    const zone = getZoneForHR(bpm, maxHR);
    const { history, minBpm, maxBpm, calories } = get();
    const point: HRDataPoint = { bpm, timeMs: elapsedMs };
    const newMin = minBpm === 0 ? bpm : Math.min(minBpm, bpm);
    const newMax = Math.max(maxBpm, bpm);

    // Calculate calories burned since last data point
    let newCalories = calories;
    if (bpm > 0 && profile.age && profile.weight && history.length > 0) {
      const lastPoint = history[history.length - 1];
      const deltaMinutes = (elapsedMs - lastPoint.timeMs) / 60000;
      if (deltaMinutes > 0 && deltaMinutes < 1) {
        newCalories += caloriesPerMinute(bpm, profile.age, profile.weight) * deltaMinutes;
      }
    }

    set({ bpm, zone, history: [...history, point], minBpm: newMin, maxBpm: newMax, calories: newCalories });
  },
  setConnected: (isConnected: boolean, deviceName?: string) =>
    set({ isConnected, deviceName: deviceName ?? null }),
  resetHistory: () => set({ history: [], minBpm: 0, maxBpm: 0, calories: 0 }),
}));
