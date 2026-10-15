import { MAX_PICKS, TEXTS } from '../config/game';
import { useGameStore } from '../store/gameStore';

export default function Hud() {
  const phase = useGameStore((s) => s.phase);
  const picks = useGameStore((s) => s.picks);

  let message = TEXTS.picking;
  if (phase === 'peek') message = TEXTS.peek;
  else if (phase === 'shuffling') message = TEXTS.shuffling;
  else if (phase === 'autoRevealing') message = TEXTS.autoRevealing;
  else if (phase === 'done') message = TEXTS.done;
  else if (phase === 'picking') {
    if (picks === 0) message = TEXTS.picking;
    else if (picks === 1) message = TEXTS.pickAgain;
    else message = TEXTS.opening;
  }

  return (
    <header className="relative z-20 px-4 pt-[max(0.9rem,env(safe-area-inset-top))]">
      <div className="mx-auto w-full max-w-md rounded-3xl bg-white/75 px-4 py-2.5 shadow-clay-sm backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <span className="font-display text-sm font-bold text-leaf-900">{TEXTS.appTitle}</span>
          <div
            className="flex items-center gap-1.5"
            role="img"
            aria-label={`Đã dùng ${picks} trên ${MAX_PICKS} lượt`}
          >
            {Array.from({ length: MAX_PICKS }).map((_, i) => (
              <span
                key={i}
                className={`h-2.5 w-7 rounded-full transition-colors ${
                  i < picks ? 'bg-leaf-600' : 'bg-leaf-200'
                }`}
              />
            ))}
          </div>
        </div>
        <p className="mt-0.5 text-[13px] font-semibold text-leaf-800">{message}</p>
      </div>
    </header>
  );
}
