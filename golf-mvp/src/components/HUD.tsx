import { PAR } from '../constants';
import { useGameStore, distanceToHole } from '../store/useGameStore';
import { scoreLabel } from '../utils/handicap';

function windCompass(direction: number) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const idx = Math.round(((direction % (Math.PI * 2)) / (Math.PI * 2)) * 8) % 8;
  return dirs[idx];
}

export function HUD() {
  const strokes = useGameStore((s) => s.strokes);
  const wind = useGameStore((s) => s.wind);
  const ballPosition = useGameStore((s) => s.ballPosition);
  const handicapIndex = useGameStore((s) => s.handicapIndex);
  const phase = useGameStore((s) => s.phase);
  const lastResult = useGameStore((s) => s.lastResult);
  const resetHole = useGameStore((s) => s.resetHole);

  const distance = Math.max(0, Math.round(distanceToHole(ballPosition)));

  return (
    <>
      <div className="hud-top">
        <div className="hud-badge">
          <span className="hud-label">Golpe</span>
          <span className="hud-value">{phase === 'moving' ? strokes + 1 : strokes}</span>
        </div>
        <div className="hud-badge">
          <span className="hud-label">Distancia</span>
          <span className="hud-value">{distance} yd</span>
        </div>
        <div className="hud-badge">
          <span className="hud-label">Viento</span>
          <span className="hud-value">
            {Math.round(wind.speedMph)} mph {windCompass(wind.direction)}
          </span>
        </div>
        <div className="hud-badge">
          <span className="hud-label">Hándicap</span>
          <span className="hud-value">{handicapIndex === null ? '—' : handicapIndex.toFixed(1)}</span>
        </div>
      </div>

      <div className="hud-hint">
        {phase === 'aiming' && 'Arrastra hacia arriba para cargar potencia · lateral para apuntar'}
        {phase === 'charging' && 'Suelta para golpear'}
        {phase === 'moving' && 'La bola está en movimiento…'}
      </div>

      {phase === 'holed' && lastResult && (
        <div className="hud-modal">
          <div className="hud-modal-card">
            <h2>¡Hoyo completado!</h2>
            <p className="hud-modal-score">{scoreLabel(lastResult.strokes, lastResult.par)}</p>
            <p>
              {lastResult.strokes} golpes (par {PAR})
            </p>
            <p className="hud-modal-diff">Diferencial: {lastResult.differential.toFixed(1)}</p>
            <button onClick={resetHole}>Reiniciar hoyo</button>
          </div>
        </div>
      )}
    </>
  );
}
