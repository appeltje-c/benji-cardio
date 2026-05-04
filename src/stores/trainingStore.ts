import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Training, TrainingSegment, Zone } from '../types';

interface TrainingState {
  trainings: Training[];
  addTraining: (name: string) => string;
  deleteTraining: (id: string) => void;
  updateTrainingName: (id: string, name: string) => void;
  addSegment: (trainingId: string, durationSeconds: number, targetZone: Zone) => void;
  updateSegment: (trainingId: string, segmentId: string, updates: Partial<Omit<TrainingSegment, 'id'>>) => void;
  removeSegment: (trainingId: string, segmentId: string) => void;
  reorderSegments: (trainingId: string, segments: TrainingSegment[]) => void;
  getTraining: (id: string) => Training | undefined;
}

function updateTraining(trainings: Training[], id: string, updater: (t: Training) => Training): Training[] {
  return trainings.map((t) => (t.id === id ? updater(t) : t));
}

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set, get) => ({
      trainings: [],

      addTraining: (name: string) => {
        const id = uuid();
        const training: Training = {
          id,
          name,
          segments: [],
          createdAt: Date.now(),
        };
        set((s) => ({ trainings: [...s.trainings, training] }));
        return id;
      },

      deleteTraining: (id: string) =>
        set((s) => ({ trainings: s.trainings.filter((t) => t.id !== id) })),

      updateTrainingName: (id: string, name: string) =>
        set((s) => ({ trainings: updateTraining(s.trainings, id, (t) => ({ ...t, name })) })),

      addSegment: (trainingId: string, durationSeconds: number, targetZone: Zone) => {
        const segment: TrainingSegment = { id: uuid(), durationSeconds, targetZone };
        set((s) => ({
          trainings: updateTraining(s.trainings, trainingId, (t) => ({
            ...t,
            segments: [...t.segments, segment],
          })),
        }));
      },

      updateSegment: (trainingId: string, segmentId: string, updates: Partial<Omit<TrainingSegment, 'id'>>) =>
        set((s) => ({
          trainings: updateTraining(s.trainings, trainingId, (t) => ({
            ...t,
            segments: t.segments.map((seg) =>
              seg.id === segmentId ? { ...seg, ...updates } : seg
            ),
          })),
        })),

      removeSegment: (trainingId: string, segmentId: string) =>
        set((s) => ({
          trainings: updateTraining(s.trainings, trainingId, (t) => ({
            ...t,
            segments: t.segments.filter((seg) => seg.id !== segmentId),
          })),
        })),

      reorderSegments: (trainingId: string, segments: TrainingSegment[]) =>
        set((s) => ({
          trainings: updateTraining(s.trainings, trainingId, (t) => ({ ...t, segments })),
        })),

      getTraining: (id: string) => get().trainings.find((t) => t.id === id),
    }),
    { name: 'cardio-trainings' }
  )
);
