import { useEffect, useRef } from 'react';
import { TOAST_MS } from '../config/game';
import { pointer } from '../lib/pointer';
import { useGameStore } from '../store/gameStore';

const MARGIN = 8;
/** khoảng cách thực từ đáy bong bóng tới đỉnh mũi nhọn (đã bù sai số bo góc) */
const ARROW = 6;
/** chừa chỗ để mũi nhọn không chạm mép bong bóng */
const ARROW_INSET = 16;

const ARROW_DOWN =
  'absolute h-0 w-0 border-x-[9px] border-x-transparent border-t-[10px] border-t-white';
const ARROW_UP =
  'absolute h-0 w-0 border-x-[9px] border-x-transparent border-b-[10px] border-b-white';

/**
 * Popup trêu bám theo con trỏ; đỉnh mũi nhọn luôn nằm đúng tâm con trỏ.
 * Phần định vị (translateX -50%) và phần animation tách ra hai thẻ, vì
 * animation `scale` sẽ ghi đè transform căn giữa nếu nằm cùng một thẻ.
 */
export default function Toast() {
  const toast = useGameStore((s) => s.toast);
  const hideToast = useGameStore((s) => s.hideToast);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const arrowRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => hideToast(toast.id), TOAST_MS);
    return () => window.clearTimeout(t);
  }, [toast, hideToast]);

  useEffect(() => {
    if (!toast) return;
    const anchor = anchorRef.current;
    const bubble = bubbleRef.current;
    const arrow = arrowRef.current;
    if (!anchor || !bubble || !arrow) return;

    const measure = () => ({ w: anchor.offsetWidth, h: bubble.offsetHeight });
    let { w, h } = measure();

    const place = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const px = pointer.known ? pointer.x : vw / 2;
      const py = pointer.known ? pointer.y : vh / 2;
      const half = w / 2;

      // giữ bong bóng trong màn hình; mũi nhọn bù lại phần bị lệch
      const x = Math.min(Math.max(px, MARGIN + half), Math.max(MARGIN + half, vw - MARGIN - half));
      const arrowDx = Math.min(
        Math.max(px - x, -(half - ARROW_INSET)),
        Math.max(0, half - ARROW_INSET),
      );

      // không đủ chỗ phía trên thì lật xuống dưới
      const above = py - h - ARROW > MARGIN;
      const y = above ? py - h - ARROW : py + ARROW;

      anchor.style.left = `${x}px`;
      anchor.style.top = `${y}px`;
      arrow.style.left = `calc(50% + ${arrowDx}px)`;
      arrow.className = `${above ? ARROW_DOWN : ARROW_UP} -translate-x-1/2 ${
        above ? '-bottom-[9px]' : '-top-[9px]'
      }`;
    };

    place();
    // đo lại sau khi layout/font ổn định
    const raf = requestAnimationFrame(() => {
      ({ w, h } = measure());
      place();
    });

    window.addEventListener('pointermove', place, { passive: true });
    window.addEventListener('resize', place);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', place);
      window.removeEventListener('resize', place);
    };
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50" role="status" aria-live="polite">
      <div ref={anchorRef} className="absolute w-[15rem] -translate-x-1/2">
        <div
          key={toast.id}
          ref={bubbleRef}
          className="anim-pop relative w-full rounded-3xl border-[3px] border-leaf-700/25 bg-white px-4 py-3 text-center font-display text-[13px] font-semibold leading-snug text-leaf-900 shadow-clay"
        >
          {toast.text}
          <span ref={arrowRef} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
