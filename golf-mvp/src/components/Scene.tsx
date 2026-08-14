import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Sky } from '@react-three/drei';
import { FIXED_TIME_STEP, GRAVITY } from '../constants';
import { Surfaces } from './Surfaces';
import { Ball } from './Ball';
import { Flag } from './Flag';
import { WindIndicator } from './WindIndicator';
import { CameraRig } from './CameraRig';

export function Scene() {
  return (
    <Canvas
      shadows={false}
      dpr={[1, 1.5]}
      camera={{ fov: 60, near: 0.1, far: 600, position: [0, 5, -8] }}
    >
      <Sky sunPosition={[100, 60, 50]} turbidity={4} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[50, 80, 20]} intensity={1.1} />

      <Physics gravity={[0, GRAVITY, 0]} stepSize={FIXED_TIME_STEP} broadphase="SAP" allowSleep>
        <Surfaces />
        <Ball />
      </Physics>

      <Flag />
      <WindIndicator />
      <CameraRig />
    </Canvas>
  );
}
