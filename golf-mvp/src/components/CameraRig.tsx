import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';

const desired = new THREE.Vector3();
const lookAt = new THREE.Vector3();

export function CameraRig() {
  const { camera } = useThree();

  useFrame((_, delta) => {
    const { ballPosition, phase, aimAngle } = useGameStore.getState();
    const [bx, by, bz] = ballPosition;

    if (phase === 'moving') {
      // Chase cam: stay behind and above the ball while it's in flight.
      desired.set(bx - Math.sin(aimAngle) * 8, by + 4, bz - Math.cos(aimAngle) * 8 - 6);
    } else {
      // Reposition behind the ball, facing the current aim direction.
      desired.set(bx - Math.sin(aimAngle) * 10, by + 5, bz - Math.cos(aimAngle) * 10 - 8);
    }

    const lerp = 1 - Math.pow(0.001, delta);
    camera.position.lerp(desired, lerp);
    lookAt.set(bx + Math.sin(aimAngle) * 15, by + 1, bz + Math.cos(aimAngle) * 15);
    camera.lookAt(lookAt);
  });

  return null;
}
