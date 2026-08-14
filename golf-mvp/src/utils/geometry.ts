import { hole1Surfaces } from '../constants';
import type { SurfaceType } from '../types';

// Most specific surfaces are checked first so a bunker/green "cut into" the
// broader fairway/rough polygons underneath it wins the lookup.
const PRIORITY: SurfaceType[] = ['bunker', 'green', 'fairway', 'rough_low', 'rough_high'];

function pointInPolygon(x: number, z: number, points: [number, number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i][0];
    const zi = points[i][2];
    const xj = points[j][0];
    const zj = points[j][2];
    const intersects = zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function surfaceAt(x: number, z: number): SurfaceType {
  for (const type of PRIORITY) {
    const surface = hole1Surfaces.find((s) => s.type === type && pointInPolygon(x, z, s.points));
    if (surface) return surface.type;
  }
  return 'rough_high';
}
