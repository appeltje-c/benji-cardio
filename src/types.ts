export type Zone = 1 | 2 | 3 | 4 | 5;

export interface TrainingSegment {
  id: string;
  durationSeconds: number;
  targetZone: Zone;
  label?: string;
}

export interface Training {
  id: string;
  name: string;
  description?: string;
  segments: TrainingSegment[];
  createdAt: number;
}

export interface ZoneConfig {
  zone: Zone;
  label: string;
  minPct: number;
  maxPct: number;
  color: string;
  hint: string;
}

// ---------- Stretching ----------

export type BodyRegion =
  | 'Neck'
  | 'Shoulders'
  | 'Arms'
  | 'Chest'
  | 'Back'
  | 'Core'
  | 'Hips & Glutes'
  | 'Legs'
  | 'Calves';

/**
 * A read-only entry in the built-in stretch library. Users select these into
 * routines but never edit them. Images are bundled under `public/stretches/`.
 */
export interface StretchExercise {
  id: string;
  name: string;
  region: BodyRegion;
  /** [start position, end position] — paths relative to the web root. */
  images: [string, string];
  /** How to perform the stretch well, step by step. */
  howTo: string[];
  /** What this stretch is particularly good for. */
  benefits: string;
  /** Suggested number of times to perform (reps or holds). */
  defaultReps: number;
  /** Whether the stretch is performed on both sides. */
  perSide: boolean;
}

/** One step of a stretch routine: an exercise repeated a number of times. */
export interface StretchSegment {
  id: string;
  exerciseId: string;
  reps: number;
}

/** A user-built routine of stretch segments (counterpart to a cardio Training). */
export interface StretchRoutine {
  id: string;
  name: string;
  segments: StretchSegment[];
  createdAt: number;
}
