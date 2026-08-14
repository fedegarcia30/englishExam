import { Scene } from './components/Scene';
import { HUD } from './components/HUD';
import { AimControls } from './components/AimControls';
import './styles.css';

export default function App() {
  return (
    <div id="game-root">
      <Scene />
      <AimControls />
      <HUD />
    </div>
  );
}
