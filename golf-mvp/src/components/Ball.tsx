import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import * as THREE from 'three';
import {
  BALL_RADIUS,
  BALL_SEGMENTS,
  HOLE_CUP_RADIUS,
  STOP_VELOCITY_THRESHOLD,
  SURFACE_MATERIALS,
  TEE_POSITION,
} from '../constants';
import { useGameStore, distanceToHole } from '../store/useGameStore';
import { surfaceAt } from '../utils/geometry';

const WIND_FORCE_PER_MPH = 0.5; // spec 7.3: 1 mph ~= 0.5 N of lateral push while airborne
const BASELINE_RESTITUTION = 0.5; // matches the ground plane's static contact material

const RESTING_TEE_POSITION: [number, number, number] = [TEE_POSITION[0], BALL_RADIUS, TEE_POSITION[2]];

export function Ball() {
  const [ref, api] = useSphere(() => ({
    mass: 1,
    args: [BALL_RADIUS],
    position: RESTING_TEE_POSITION,
    linearDamping: 0.3,
    angularDamping: 0.3,
    // A sleeping body doesn't get its position integrated even after
    // api.velocity.set() — it needs an explicit wake. Simplest robust fix
    // for a single ball: never let it sleep in the first place.
    allowSleep: false,
  }));

  const position = useRef<[number, number, number]>(RESTING_TEE_POSITION);
  const velocity = useRef<[number, number, number]>([0, 0, 0]);
  const lastVy = useRef(0);
  const movingFrames = useRef(0);

  useEffect(() => api.position.subscribe((p) => (position.current = p as [number, number, number])), [api]);
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v as [number, number, number])), [api]);

  const phase = useGameStore((s) => s.phase);
  const pendingShot = useGameStore((s) => s.pendingShot);
  const wind = useGameStore((s) => s.wind);
  const resetToken = useGameStore((s) => s.resetToken);
  const clearPendingShot = useGameStore((s) => s.clearPendingShot);
  const setBallTransform = useGameStore((s) => s.setBallTransform);
  const registerStroke = useGameStore((s) => s.registerStroke);
  const holeOut = useGameStore((s) => s.holeOut);
  const setPhase = useGameStore((s) => s.setPhase);

  // Fire the requested shot as an impulse once per stroke.
  useEffect(() => {
    if (!pendingShot) return;
    api.wakeUp();
    api.velocity.set(...pendingShot.velocity);
    api.angularVelocity.set(pendingShot.spin * 4, 0, 0);
    clearPendingShot();
  }, [pendingShot, api, clearPendingShot]);

  // Snap the physics body back to the tee whenever the hole is (re)started.
  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    api.position.set(...RESTING_TEE_POSITION);
    api.velocity.set(0, 0, 0);
    api.angularVelocity.set(0, 0, 0);
  }, [resetToken, api]);

  // Approximate variable ground restitution: cannon-es only exposes one
  // static contact material for the ground, so we rescale the bounce
  // ourselves once we know which surface the ball is over.
  useFrame((_, delta) => {
    const [x, y, z] = position.current;
    const [vx, vy, vz] = velocity.current;
    const surface = surfaceAt(x, z);
    const props = SURFACE_MATERIALS[surface];

    // Friction while rolling/skidding on the ground: higher-friction
    // surfaces get more damping so the ball loses speed faster. The vy
    // check keeps a just-launched shot (still within BALL_RADIUS of the
    // ground for a frame, but moving upward) from being crushed by bunker-
    // level damping before it ever gets airborne.
    const grounded = y <= BALL_RADIUS + 0.05 && vy <= 0.5;
    if (grounded) {
      api.linearDamping.set(THREE.MathUtils.clamp(props.friction * 0.6, 0.05, 0.98));
      api.angularDamping.set(THREE.MathUtils.clamp(props.friction * 0.6, 0.05, 0.98));
    } else {
      api.linearDamping.set(0.02);
      api.angularDamping.set(0.02);
    }

    // Bounce rescale: when vertical velocity flips from falling to rising
    // near the ground, that's the physics engine's default bounce — scale
    // it by this surface's restitution relative to the plane's baseline.
    if (y <= BALL_RADIUS + 0.15 && lastVy.current < -0.5 && vy > 0) {
      const factor = props.restitution / BASELINE_RESTITUTION;
      api.velocity.set(vx, vy * factor, vz);
    }
    lastVy.current = vy;

    // Wind pushes the ball while airborne.
    if (y > BALL_RADIUS + 0.1) {
      const windForce = wind.speedMph * WIND_FORCE_PER_MPH;
      api.applyForce(
        [Math.sin(wind.direction) * windForce, 0, Math.cos(wind.direction) * windForce],
        [0, 0, 0]
      );
    }

    setBallTransform(position.current, velocity.current);

    if (phase !== 'moving') {
      movingFrames.current = 0;
      return;
    }
    movingFrames.current += 1;

    // Skip the stop check for the first few frames of a shot: the cannon-es
    // velocity subscription lags one physics step behind api.velocity.set,
    // so right after firing a shot this would otherwise read the pre-impulse
    // (zero) velocity, conclude the ball "already stopped", and cancel the
    // shot outright.
    if (movingFrames.current <= 3) return;

    const speed = Math.hypot(vx, vy, vz);
    if (grounded && speed < STOP_VELOCITY_THRESHOLD) {
      api.velocity.set(0, 0, 0);
      api.angularVelocity.set(0, 0, 0);
      registerStroke();
      const dist = distanceToHole(position.current);
      if (dist < HOLE_CUP_RADIUS && surface === 'green') {
        holeOut();
      } else {
        setPhase('aiming');
      }
    }
  });

  return (
    <mesh ref={ref as any} castShadow={false} receiveShadow={false}>
      <sphereGeometry args={[BALL_RADIUS, BALL_SEGMENTS, BALL_SEGMENTS]} />
      <meshStandardMaterial color="#ffffff" roughness={0.4} />
    </mesh>
  );
}
