import { TEXTS } from '../config/game';
import { useGameStore } from '../store/gameStore';

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="8" y="26" width="48" height="30" rx="7" fill="#15803d" />
      <rect x="8" y="26" width="48" height="10" rx="5" fill="#166534" />
      <rect x="6" y="18" width="52" height="14" rx="7" fill="#22c55e" />
      <rect x="27" y="16" width="10" height="40" rx="5" fill="#fcd34d" />
      <path
        d="M32 18c-6-10-18-8-18-2 0 4 6 6 18 4 12 2 18 0 18-4 0-6-12-8-18 2Z"
        fill="#f59e0b"
      />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 21s-8-5.1-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.9-8 11-8 11Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function StartScreen() {
  const start = useGameStore((s) => s.start);

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center px-5 py-10">
      <div className="clay relative w-full max-w-sm px-7 py-11 text-center">
        <div className="absolute -left-4 -top-5 rotate-[-14deg] text-berry-500">
          <HeartIcon className="h-9 w-9" />
        </div>
        <div className="absolute -right-3 -top-4 rotate-[16deg] text-berry-500/80">
          <HeartIcon className="h-7 w-7" />
        </div>

        <div className="mx-auto mb-4 w-fit anim-bob">
          <GiftIcon className="h-20 w-20 drop-shadow-[0_8px_10px_rgba(21,128,61,0.3)]" />
        </div>

        <span className="inline-block rounded-full bg-harvest-300/70 px-4 py-1 font-display text-sm font-semibold text-harvest-700">
          20 · 10
        </span>

        <h1 className="mt-3 font-display text-3xl font-bold text-leaf-900 sm:text-4xl">
          {TEXTS.appTitle}
        </h1>

        <button type="button" className="clay-btn mt-8 w-full" onClick={start}>
          {TEXTS.startCta}
        </button>
      </div>
    </div>
  );
}
