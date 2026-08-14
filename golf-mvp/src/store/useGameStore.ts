import { create } from 'zustand';
import { HOLE_POSITION, PAR, TEE_POSITION } from '../constants';
import { computeDifferential, computeHandicapIndex } from '../utils/handicap';
import type { GamePhase, RoundResult, Wind } from '../types';

const ROUNDS_KEY = 'golf-mvp:rounds';

function loadRounds(): RoundResult[] {
  try {
    const raw = localStorage.getItem(ROUNDS_KEY);
    return raw ? (JSON.parse(raw) as RoundResult[]) : [];
  } catch {
    return [];
  }
}

function saveRounds(rounds: RoundResult[]) {
  try {
    localStorage.setItem(ROUNDS_KEY, JSON.stringify(rounds));
  } catch {
    // storage unavailable (private mode, quota) — silently skip persistence
  }
}

function randomWind(): Wind {
  return {
    direction: Math.random() * Math.PI * 2,
    speedMph: Math.random() * 20,
  };
}

export interface Shot {
  velocity: [number, number, number];
  spin: number;
}

interface GameState {
  phase: GamePhase;
  strokes: number;
  ballPosition: [number, number, number];
  ballVelocity: [number, number, number];
  wind: Wind;
  rounds: RoundResult[];
  handicapIndex: number | null;
  lastResult: { strokes: number; par: number; differential: number } | null;
  pendingShot: Shot | null;
  aimAngle: number; // radians, 0 = +Z (toward the hole)
  power: number; // 0-1, live while charging
  resetToken: number; // bumped whenever the physics body must be snapped back to the tee

  setBallTransform: (position: [number, number, number], velocity: [number, number, number]) => void;
  setPhase: (phase: GamePhase) => void;
  setAim: (angle: number, power: number) => void;
  requestShot: (shot: Shot) => void;
  clearPendingShot: () => void;
  registerStroke: () => void;
  holeOut: () => void;
  resetHole: () => void;
  rerollWind: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'aiming',
  strokes: 0,
  ballPosition: TEE_POSITION,
  ballVelocity: [0, 0, 0],
  wind: randomWind(),
  rounds: loadRounds(),
  handicapIndex: computeHandicapIndex(loadRounds()),
  lastResult: null,
  pendingShot: null,
  aimAngle: 0,
  power: 0,
  resetToken: 0,

  setBallTransform: (position, velocity) => set({ ballPosition: position, ballVelocity: velocity }),
  setPhase: (phase) => set({ phase }),
  setAim: (angle, power) => set({ aimAngle: angle, power }),

  requestShot: (shot) => {
    const phase = get().phase;
    if (phase !== 'aiming' && phase !== 'charging') return;
    set({ pendingShot: shot, phase: 'moving' });
  },
  clearPendingShot: () => set({ pendingShot: null }),

  registerStroke: () => set((s) => ({ strokes: s.strokes + 1 })),

  holeOut: () => {
    const strokes = get().strokes;
    const differential = computeDifferential(strokes);
    const rounds = [...get().rounds, { date: new Date().toISOString(), strokes, par: PAR, differential }].slice(-20);
    saveRounds(rounds);
    set({
      phase: 'holed',
      rounds,
      handicapIndex: computeHandicapIndex(rounds),
      lastResult: { strokes, par: PAR, differential },
    });
  },

  resetHole: () =>
    set((s) => ({
      phase: 'aiming',
      strokes: 0,
      ballPosition: TEE_POSITION,
      ballVelocity: [0, 0, 0],
      wind: randomWind(),
      lastResult: null,
      pendingShot: null,
      aimAngle: 0,
      power: 0,
      resetToken: s.resetToken + 1,
    })),

  rerollWind: () => set({ wind: randomWind() }),
}));

export function distanceToHole(position: [number, number, number]): number {
  const dx = position[0] - HOLE_POSITION[0];
  const dz = position[2] - HOLE_POSITION[2];
  return Math.sqrt(dx * dx + dz * dz);
}
