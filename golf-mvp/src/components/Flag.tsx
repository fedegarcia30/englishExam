import { HOLE_POSITION } from '../constants';

export function Flag() {
  const [x, , z] = HOLE_POSITION;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 2.2, 8]} />
        <meshStandardMaterial color="#e5e5e5" />
      </mesh>
      <mesh position={[0.35, 1.9, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.7, 0.5]} />
        <meshStandardMaterial color="#e85d3c" side={2} />
      </mesh>
    </group>
  );
}
