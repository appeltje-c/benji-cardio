import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Training, TrainingSegment, Zone } from '../types';
import type { HRDataPoint } from './heartRateStore';
import { getZoneForHR } from '../utils/zones';

export interface CompletedSession {
  id: string;
  trainingId: string;
  trainingName: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  avgHr: number;
  maxHr: number;
  minHr: number;
  peakZone: Zone;
  calories: number;
  timeInZonesSec: Record<Zone, number>;
  segments: TrainingSegment[];
}

interface SessionState {
  sessions: CompletedSession[];
  addSession: (s: Omit<CompletedSession, 'id'>) => string;
  deleteSession: (id: string) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessions: [],
      addSession: (s) => {
        const id = uuid();
        set((state) => ({
          sessions: [{ ...s, id }, ...state.sessions].sort(
            (a, b) => b.endedAt - a.endedAt
          ),
        }));
        return id;
      },
      deleteSession: (id) =>
        set((state) => ({ sessions: state.sessions.filter((x) => x.id !== id) })),
      clear: () => set({ sessions: [] }),
    }),
    { name: 'cardio-sessions' }
  )
);

/**
 * Build a CompletedSession from the current run state. Caller passes the
 * Training that was running, the HR history, maxHR, elapsed duration, and
 * accumulated calories — all of which exist on the live stores at finish time.
 */
export function aggregateSession(
  training: Training,
  history: HRDataPoint[],
  maxHR: number,
  durationMs: number,
  calories: number
): Omit<CompletedSession, 'id'> {
  const buckets: Record<Zone, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let weightedSum = 0;
  let weightedCount = 0;
  let max = 0;
  let min = Infinity;
  let peak: Zone = 1;
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1];
    const curr = history[i];
    const dt = (curr.timeMs - prev.timeMs) / 1000;
    if (dt <= 0 || dt > 30) continue; // skip pauses / gaps
    const z = getZoneForHR(curr.bpm, maxHR);
    buckets[z] += dt;
    if (z > peak) peak = z;
    weightedSum += curr.bpm * dt;
    weightedCount += dt;
    if (curr.bpm > max) max = curr.bpm;
    if (curr.bpm > 0 && curr.bpm < min) min = curr.bpm;
  }
  const endedAt = Date.now();
  return {
    trainingId: training.id,
    trainingName: training.name,
    startedAt: endedAt - durationMs,
    endedAt,
    durationMs,
    avgHr: weightedCount > 0 ? Math.round(weightedSum / weightedCount) : 0,
    maxHr: max,
    minHr: min === Infinity ? 0 : min,
    peakZone: peak,
    calories,
    timeInZonesSec: buckets,
    segments: training.segments.map((s) => ({ ...s })),
  };
}
