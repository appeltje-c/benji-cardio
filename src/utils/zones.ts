import type { Zone, ZoneConfig } from '../types';

export const ZONE_CONFIGS: ZoneConfig[] = [
  { zone: 1, label: 'Recovery',  minPct: 50, maxPct: 60,  color: '#027DEB', hint: 'Active recovery, warm-ups' },
  { zone: 2, label: 'Endurance', minPct: 60, maxPct: 70,  color: '#39C239', hint: 'Long base aerobic work' },
  { zone: 3, label: 'Tempo',     minPct: 70, maxPct: 80,  color: '#F2B40D', hint: 'Steady, sustainable effort' },
  { zone: 4, label: 'Threshold', minPct: 80, maxPct: 90,  color: '#FF551F', hint: 'Lactate threshold work' },
  { zone: 5, label: 'VO₂ Max',   minPct: 90, maxPct: 100, color: '#DF2020', hint: 'All-out intervals' },
];

export function getZoneConfig(zone: Zone): ZoneConfig {
  return ZONE_CONFIGS[zone - 1];
}

export function getZoneForHR(hr: number, maxHR: number): Zone {
  const pct = (hr / maxHR) * 100;
  if (pct >= 90) return 5;
  if (pct >= 80) return 4;
  if (pct >= 70) return 3;
  if (pct >= 60) return 2;
  return 1;
}

export function getZoneColor(zone: Zone): string {
  return getZoneConfig(zone).color;
}

export type EffortGuidance = 'push' | 'ease' | 'in_zone' | 'no_signal';

export function getEffortGuidance(bpm: number, targetZone: Zone, maxHR: number): EffortGuidance {
  if (bpm <= 0) return 'no_signal';
  const config = getZoneConfig(targetZone);
  const minBpm = Math.round((config.minPct / 100) * maxHR);
  const maxBpm = Math.round((config.maxPct / 100) * maxHR);
  if (bpm < minBpm) return 'push';
  if (bpm > maxBpm) return 'ease';
  return 'in_zone';
}

export function getTargetBpmRange(targetZone: Zone, maxHR: number): [number, number] {
  const config = getZoneConfig(targetZone);
  return [
    Math.round((config.minPct / 100) * maxHR),
    Math.round((config.maxPct / 100) * maxHR),
  ];
}

export function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimeMs(ms: number): string {
  return formatTime(Math.floor(ms / 1000));
}
