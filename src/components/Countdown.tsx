import { useEffect, useState } from 'react';
import { SWITCH_WINDOW_MS } from '../config/game';
import { useGameStore } from '../store/gameStore';

const R = 15;
const CIRC = 2 * Math.PI * R;

/** Đồng hồ đếm ngược thời gian còn được đổi túi ở lượt 1. */
export default function Countdown() {
  const deadline = useGameStore((s) => s.switchDeadline);
  const expireSwitchWindow = useGameStore((s) => s.expireSwitchWindow);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (deadline === null) {
      setLeft(0);
      return;
    }
    const tick = () => {
      const remaining = Math.max(0, deadline - Date.now());
      setLeft(remaining);
      // hết giờ -> chốt túi đang chọn
      if (remaining <= 0) expireSwitchWindow();
    };
    tick();
    const id = window.setInterval(tick, 100);
    return () => window.clearInterval(id);
  }, [deadline, expireSwitchWindow]);

  if (deadline === null || left <= 0) return null;

  const secs = Math.ceil(left / 1000);
  const p = Math.min(1, Math.max(0, left / SWITCH_WINDOW_MS));

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4"
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 6rem)' }}
      role="timer"
      aria-live="off"
    >
      <div className="flex items-center gap-2 rounded-full border-[3px] border-leaf-700/20 bg-white/85 px-3 py-1.5 shadow-clay-sm backdrop-blur-md">
        <svg viewBox="0 0 36 36" className="h-8 w-8 -rotate-90" aria-hidden="true">
          <circle cx="18" cy="18" r={R} fill="none" stroke="rgba(21,128,61,0.15)" strokeWidth="4" />
          <circle
            cx="18"
            cy="18"
            r={R}
            fill="none"
            stroke="#ec4899"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - p)}
          />
        </svg>
        <div className="text-left leading-tight">
          <div className="font-display text-[15px] font-bold text-berry-500">{secs}s</div>
          <div className="text-[10px] font-semibold text-leaf-800">để đổi túi khác</div>
        </div>
      </div>
    </div>
  );
}
