export type Zone = 1 | 2 | 3 | 4 | 5;

export interface TrainingSegment {
  id: string;
  durationSeconds: number;
  targetZone: Zone;
}

export interface Training {
  id: string;
  name: string;
  segments: TrainingSegment[];
  createdAt: number;
}

export interface ZoneConfig {
  zone: Zone;
  label: string;
  minPct: number;
  maxPct: number;
  color: string;
}
