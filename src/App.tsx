import { useEffect } from 'react';
import Balloons from './components/Balloons';
import Board from './components/Board';
import Countdown from './components/Countdown';
import FarmBackground from './components/FarmBackground';
import FxCanvas from './components/FxCanvas';
import Hud from './components/Hud';
import StartScreen from './components/StartScreen';
import Toast from './components/Toast';
import { trackPointer } from './lib/pointer';
import { useGameStore } from './store/gameStore';

export default function App() {
  const phase = useGameStore((s) => s.phase);

  useEffect(() => trackPointer(), []);

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden">
      <FarmBackground />
      <Balloons />
      <FxCanvas />

      <div className="relative z-20 flex min-h-[100dvh] flex-col">
        {phase === 'intro' ? <StartScreen /> : <><Hud /><Board /></>}
      </div>

      <Countdown />
      <Toast />
    </div>
  );
}
