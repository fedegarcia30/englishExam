import type { SurfaceDef, SurfaceMaterial, SurfaceType } from './types';

// All lengths are in yards. 1 unit = 1 yard. Y is up.
export const YARD_TO_METER = 0.9144;
export const GRAVITY = -9.8 / YARD_TO_METER; // ~ -10.72 yd/s^2

export const TEE_POSITION: [number, number, number] = [0, 0, 0];
export const HOLE_POSITION: [number, number, number] = [0, 0, 225];
export const BUNKERS: { center: [number, number, number]; radius: number }[] = [
  { center: [-15, 0, 160], radius: 10 },
  { center: [15, 0, 160], radius: 10 },
];
export const GREEN_RADIUS = 15; // yards
export const HOLE_CUP_RADIUS = 2; // yards, "embocada" threshold
export const PAR = 4;

export const BALL_RADIUS = 0.6; // yards (scaled up from real life for visibility/playability)
export const BALL_SEGMENTS = 16;

export const FIXED_TIME_STEP = 1 / 60;
export const STOP_VELOCITY_THRESHOLD = 0.03; // yards/s, below this the ball is considered stopped

// Section 2.4 — surface physical + visual properties
export const SURFACE_MATERIALS: Record<SurfaceType, SurfaceMaterial> = {
  fairway: { friction: 0.1, restitution: 0.8, color: '#7CB342' },
  rough_low: { friction: 0.4, restitution: 0.5, color: '#558B2F' },
  rough_high: { friction: 0.8, restitution: 0.3, color: '#33691E' },
  bunker: { friction: 1.5, restitution: 0.1, color: '#F9E79F' },
  green: { friction: 0.05, restitution: 0.2, color: '#AED581' },
};

// Section 2.6 — Hole 1 geometry (points in the XZ plane, Y = 0)
export const hole1Surfaces: SurfaceDef[] = [
  {
    type: 'rough_high',
    points: [
      [-40, 0, 0],
      [40, 0, 0],
      [40, 0, 240],
      [-40, 0, 240],
    ],
  },
  {
    type: 'rough_low',
    points: [
      [-22, 0, 20],
      [22, 0, 20],
      [20, 0, 200],
      [-20, 0, 200],
    ],
  },
  {
    type: 'fairway',
    points: [
      [-12, 0, 20],
      [12, 0, 20],
      [10, 0, 200],
      [-10, 0, 200],
    ],
  },
  {
    type: 'green',
    points: circlePoints(HOLE_POSITION, GREEN_RADIUS, 32),
  },
  {
    type: 'bunker',
    points: circlePoints(BUNKERS[0].center, BUNKERS[0].radius, 24),
  },
  {
    type: 'bunker',
    points: circlePoints(BUNKERS[1].center, BUNKERS[1].radius, 24),
  },
];

function circlePoints(
  center: [number, number, number],
  radius: number,
  segments: number
): [number, number, number][] {
  const pts: [number, number, number][] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push([center[0] + Math.cos(a) * radius, 0, center[2] + Math.sin(a) * radius]);
  }
  return pts;
}
