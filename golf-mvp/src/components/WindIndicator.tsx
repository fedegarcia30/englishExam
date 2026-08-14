import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';

export function WindIndicator() {
  const wind = useGameStore((s) => s.wind);
  const groupRef = useRef<THREE.Group>(null);

  const arrow = useMemo(
    () =>
      new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, 0),
        1,
        0x1f8fff,
        0.5,
        0.35
      ),
    []
  );

  useEffect(() => {
    const dir = new THREE.Vector3(Math.sin(wind.direction), 0, Math.cos(wind.direction));
    const length = THREE.MathUtils.mapLinear(wind.speedMph, 0, 20, 1, 4);
    arrow.setDirection(dir);
    arrow.setLength(length, length * 0.35, length * 0.25);
  }, [wind, arrow]);

  return (
    <group ref={groupRef} position={[-6, 3, -3]}>
      <primitive object={arrow} />
    </group>
  );
}
