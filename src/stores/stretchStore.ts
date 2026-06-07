import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { StretchRoutine, StretchSegment } from '../types';
import { getStretch } from '../data/stretchLibrary';

interface StretchState {
  routines: StretchRoutine[];
  addRoutine: (name: string) => string;
  deleteRoutine: (id: string) => void;
  updateRoutineName: (id: string, name: string) => void;
  addSegment: (routineId: string, exerciseId: string, reps?: number) => void;
  updateSegment: (routineId: string, segmentId: string, updates: Partial<Omit<StretchSegment, 'id'>>) => void;
  removeSegment: (routineId: string, segmentId: string) => void;
  reorderSegments: (routineId: string, segments: StretchSegment[]) => void;
  getRoutine: (id: string) => StretchRoutine | undefined;
}

function updateRoutine(
  routines: StretchRoutine[],
  id: string,
  updater: (r: StretchRoutine) => StretchRoutine
): StretchRoutine[] {
  return routines.map((r) => (r.id === id ? updater(r) : r));
}

export const useStretchStore = create<StretchState>()(
  persist(
    (set, get) => ({
      routines: [],

      addRoutine: (name: string) => {
        const id = uuid();
        const routine: StretchRoutine = { id, name, segments: [], createdAt: Date.now() };
        set((s) => ({ routines: [...s.routines, routine] }));
        return id;
      },

      deleteRoutine: (id: string) =>
        set((s) => ({ routines: s.routines.filter((r) => r.id !== id) })),

      updateRoutineName: (id: string, name: string) =>
        set((s) => ({ routines: updateRoutine(s.routines, id, (r) => ({ ...r, name })) })),

      addSegment: (routineId: string, exerciseId: string, reps?: number) => {
        const segment: StretchSegment = {
          id: uuid(),
          exerciseId,
          reps: reps ?? getStretch(exerciseId)?.defaultReps ?? 1,
        };
        set((s) => ({
          routines: updateRoutine(s.routines, routineId, (r) => ({
            ...r,
            segments: [...r.segments, segment],
          })),
        }));
      },

      updateSegment: (routineId, segmentId, updates) =>
        set((s) => ({
          routines: updateRoutine(s.routines, routineId, (r) => ({
            ...r,
            segments: r.segments.map((seg) => (seg.id === segmentId ? { ...seg, ...updates } : seg)),
          })),
        })),

      removeSegment: (routineId, segmentId) =>
        set((s) => ({
          routines: updateRoutine(s.routines, routineId, (r) => ({
            ...r,
            segments: r.segments.filter((seg) => seg.id !== segmentId),
          })),
        })),

      reorderSegments: (routineId, segments) =>
        set((s) => ({
          routines: updateRoutine(s.routines, routineId, (r) => ({ ...r, segments })),
        })),

      getRoutine: (id: string) => get().routines.find((r) => r.id === id),
    }),
    { name: 'cardio-stretch-routines' }
  )
);
