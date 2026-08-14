export type SurfaceType = 'fairway' | 'rough_low' | 'rough_high' | 'bunker' | 'green';

export interface SurfaceMaterial {
  friction: number;
  restitution: number;
  color: string;
}

export interface SurfaceDef {
  type: SurfaceType;
  points: [number, number, number][];
}

export interface Wind {
  direction: number; // radians, 0 = +Z (toward the hole)
  speedMph: number; // 0-20
}

export interface RoundResult {
  date: string; // ISO string
  strokes: number;
  par: number;
  differential: number;
}

export type GamePhase = 'aiming' | 'charging' | 'moving' | 'holed';
