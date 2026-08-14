import { useMemo } from 'react';
import * as THREE from 'three';
import { usePlane } from '@react-three/cannon';
import { hole1Surfaces, SURFACE_MATERIALS } from '../constants';

function polygonGeometry(points: [number, number, number][]): THREE.ShapeGeometry {
  // Shape lives in local XY; after the mesh's -90deg X rotation, local Y maps
  // to world -Z, so we negate Z here to land the geometry at the intended
  // world-space XZ coordinates.
  const shape = new THREE.Shape(points.map(([x, , z]) => new THREE.Vector2(x, -z)));
  return new THREE.ShapeGeometry(shape);
}

export function Surfaces() {
  // Single static physics ground — per-surface friction/restitution are
  // approximated at runtime on the ball (see Ball.tsx) because
  // @react-three/cannon does not expose swapping a body's material live.
  const [groundRef] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    material: { friction: 0.4, restitution: 0.5 },
  }));

  const geometries = useMemo(() => hole1Surfaces.map((s) => polygonGeometry(s.points)), []);

  return (
    <group>
      <mesh ref={groundRef as any} receiveShadow={false} visible={false}>
        <planeGeometry args={[400, 400]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Large backdrop so the modeled surfaces don't end in a hard cliff against the sky */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow={false}>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color={SURFACE_MATERIALS.rough_high.color} />
      </mesh>

      {hole1Surfaces.map((surface, i) => (
        <mesh
          key={i}
          geometry={geometries[i]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.002 * (i + 1), 0]}
          receiveShadow={false}
        >
          <meshStandardMaterial color={SURFACE_MATERIALS[surface.type].color} />
        </mesh>
      ))}
    </group>
  );
}
