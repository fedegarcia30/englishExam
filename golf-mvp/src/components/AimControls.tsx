import { useRef, useState } from 'react';
import { useGameStore } from '../store/useGameStore';

const MAX_DRAG_X = 160; // px, full horizontal drag -> MAX_AIM_ANGLE
const MAX_DRAG_Y = 220; // px, full vertical drag -> full power
const MAX_AIM_ANGLE = Math.PI / 4; // 45 degrees either side of straight
const MAX_SPEED = 55; // yards/s, ~ a full driver swing
const LAUNCH_ANGLE = 0.28; // radians, fixed launch loft for the MVP

export function AimControls() {
  // `dragging` (state) only drives the power-meter UI; the pointer handlers
  // gate on `draggingRef` instead, since state updates are batched/async and
  // a fast flick can fire pointermove before a re-render picks up the new
  // closure — dropping the whole drag.
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const [power, setPower] = useState(0);
  const start = useRef({ x: 0, y: 0 });
  const phase = useGameStore((s) => s.phase);
  const setAim = useGameStore((s) => s.setAim);
  const requestShot = useGameStore((s) => s.requestShot);

  const canSwing = phase === 'aiming' || phase === 'charging';

  function onPointerDown(e: React.PointerEvent) {
    if (!canSwing) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    draggingRef.current = true;
    setDragging(true);
    useGameStore.setState({ phase: 'charging' });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y; // dragging up (negative dy) charges power
    const angle = Math.max(-1, Math.min(1, dx / MAX_DRAG_X)) * MAX_AIM_ANGLE;
    const pow = Math.max(0, Math.min(1, -dy / MAX_DRAG_Y));
    setAim(angle, pow);
    setPower(pow);
  }

  function onPointerUp() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    const state = useGameStore.getState();
    if (state.power <= 0.03) {
      useGameStore.setState({ phase: 'aiming' });
      return;
    }
    const speed = state.power * MAX_SPEED;
    const horizontal = speed * Math.cos(LAUNCH_ANGLE);
    const vy = speed * Math.sin(LAUNCH_ANGLE);
    const vx = horizontal * Math.sin(state.aimAngle);
    const vz = horizontal * Math.cos(state.aimAngle);
    const spin = Math.max(-1, Math.min(1, state.aimAngle / MAX_AIM_ANGLE)) * 0.6;
    requestShot({ velocity: [vx, vy, vz], spin });
    setPower(0);
  }

  return (
    <div
      className="aim-overlay"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {dragging && (
        <div className="power-meter">
          <div className="power-meter-fill" style={{ height: `${power * 100}%` }} />
        </div>
      )}
    </div>
  );
}
