import type { RoundResult } from '../types';

export const COURSE_RATING = 70.0;
export const SLOPE_RATING = 113;
export const MAX_ROUNDS_STORED = 20;

export function computeDifferential(strokes: number): number {
  return (113 / SLOPE_RATING) * (strokes - COURSE_RATING);
}

// Number of best differentials to average, per USGA-style tables scaled to a 20-round window.
function bestCountFor(roundCount: number): number {
  if (roundCount < 3) return 1;
  if (roundCount < 5) return 1;
  if (roundCount < 7) return 2;
  if (roundCount < 9) return 2;
  if (roundCount < 11) return 3;
  if (roundCount < 13) return 3;
  if (roundCount < 15) return 4;
  if (roundCount < 17) return 5;
  if (roundCount < 19) return 6;
  return 8; // 19-20 rounds -> spec uses 10 best at 20, we approximate the ramp
}

export function computeHandicapIndex(rounds: RoundResult[]): number | null {
  if (rounds.length === 0) return null;
  const recent = rounds.slice(-MAX_ROUNDS_STORED);
  const sorted = [...recent].sort((a, b) => a.differential - b.differential);
  const bestCount = recent.length >= 20 ? 10 : bestCountFor(recent.length);
  const best = sorted.slice(0, Math.min(bestCount, sorted.length));
  const avg = best.reduce((sum, r) => sum + r.differential, 0) / best.length;
  return Math.round(avg * 0.96 * 10) / 10;
}

export function scoreLabel(strokes: number, par: number): string {
  const diff = strokes - par;
  if (diff <= -3) return 'Albatross';
  if (diff === -2) return 'Eagle';
  if (diff === -1) return 'Birdie';
  if (diff === 0) return 'Par';
  if (diff === 1) return 'Bogey';
  if (diff === 2) return 'Doble Bogey';
  return `+${diff}`;
}
