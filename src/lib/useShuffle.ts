import { useEffect, useRef } from 'react';
import gsap from 'gsap';

type Ref<T> = React.RefObject<T>;

interface UseShuffleOptions {
  boardRef: Ref<HTMLDivElement | null>;
  slotRefs: Ref<(HTMLDivElement | null)[]>;
  cardRefs: Ref<(HTMLDivElement | null)[]>;
  /** order[slotIndex] = cardIndex */
  order: number[];
  enabled: boolean;
  reduced: boolean;
  /** thời gian trộn qua lại giữa các vị trí */
  gentleMs: number;
  /** khung thời gian toả khói dày + trộn lại ngầm */
  mixMs: number;
  onMix: (points: { x: number; y: number }[]) => void;
  onDone: (order: number[]) => void;
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** mọi cặp ô có thể đổi chỗ cho nhau */
function allPairs(n: number): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) out.push([i, j]);
  }
  return out;
}

/** ghép cặp rời nhau ngẫu nhiên; nếu số ô lẻ thì dư 1 ô đứng yên */
function randomMatching(n: number): [number, number][] {
  const s = shuffled(Array.from({ length: n }, (_, i) => i));
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < s.length; i += 2) out.push([s[i], s[i + 1]]);
  return out;
}

export function useShuffle({
  boardRef,
  slotRefs,
  cardRefs,
  order,
  enabled,
  reduced,
  gentleMs,
  mixMs,
  onMix,
  onDone,
}: UseShuffleOptions) {
  const orderRef = useRef<number[]>([...order]);
  const onMixRef = useRef(onMix);
  const onDoneRef = useRef(onDone);

  onMixRef.current = onMix;
  onDoneRef.current = onDone;

  const cellXY = (slotIndex: number) => {
    const board = boardRef.current;
    const slot = slotRefs.current[slotIndex];
    if (!board || !slot) return { x: 0, y: 0, w: 0, h: 0 };
    const b = board.getBoundingClientRect();
    const s = slot.getBoundingClientRect();
    return { x: s.left - b.left, y: s.top - b.top, w: s.width, h: s.height };
  };

  const placeAll = (positions: number[], animate = false) => {
    for (let slot = 0; slot < positions.length; slot++) {
      const el = cardRefs.current[positions[slot]];
      if (!el) continue;
      const { x, y, w, h } = cellXY(slot);
      if (w && h) {
        el.style.width = `${w}px`;
        el.style.height = `${h}px`;
      }
      const vars = { x, y, rotation: 0, scale: 1, zIndex: 1 };
      if (animate) {
        gsap.to(el, { ...vars, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
      } else {
        gsap.set(el, { ...vars, overwrite: 'auto' });
      }
    }
  };

  // Đặt card vào đúng ô khi chưa xáo trộn (mount / sau khi xáo trộn xong)
  useEffect(() => {
    if (enabled) return;
    const id = requestAnimationFrame(() => placeAll(orderRef.current));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Reposition khi resize màn hình
  useEffect(() => {
    const onResize = () => {
      if (enabled) return;
      placeAll(orderRef.current);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const positions = [...orderRef.current];
    placeAll(positions);
    const tl = gsap.timeline();

    if (reduced) {
      tl.to({}, { duration: 0.6 });
      tl.call(() => {
        placeAll(positions);
        onDoneRef.current(positions);
      });
      return () => tl.kill();
    }

    const gentleSec = gentleMs / 1000;
    const mixSec = mixMs / 1000;
    const lift = (cellXY(0).h || 140) * 0.4;

    /**
     * Rút 1 card ra khỏi ô, nhấc lên, chuyển sang ô kia rồi thả xuống,
     * trong khi card ở ô kia trượt về chỗ trống.
     */
    const addCardSwap = (
      cardA: number,
      cardB: number,
      pa: { x: number; y: number },
      pb: { x: number; y: number },
      at: number,
      dur: number,
    ) => {
      const elA = cardRefs.current[cardA];
      const elB = cardRefs.current[cardB];

      const tLift = at + dur * 0.26;
      const tTravelEnd = tLift + dur * 0.42;
      const tDropEnd = tTravelEnd + dur * 0.32;

      if (elB) {
        tl.set(elB, { zIndex: 6 }, at);
        tl.to(
          elB,
          { y: pb.y - lift, scale: 1.08, rotation: 9, duration: dur * 0.26, ease: 'power2.out' },
          at,
        );
        tl.to(elB, { x: pa.x, y: pa.y - lift, duration: dur * 0.42, ease: 'sine.inOut' }, tLift);
        tl.to(elB, { y: pa.y, scale: 1, rotation: 0, duration: dur * 0.32, ease: 'power2.in' }, tTravelEnd);
        tl.set(elB, { zIndex: 1 }, tDropEnd);
      }

      if (elA) {
        tl.to(elA, { x: pb.x, y: pb.y, rotation: -7, duration: dur * 0.42, ease: 'sine.inOut' }, tLift);
        tl.to(elA, { rotation: 0, duration: dur * 0.32, ease: 'power2.out' }, tTravelEnd);
      }
    };

    // Giai đoạn 1: trộn qua lại giữa TẤT CẢ các túi
    const n = positions.length;
    const pairs = allPairs(n);
    const swapCount = Math.max(n, Math.round(gentleSec * 1.3));
    const slotTime = gentleSec / swapCount;
    const swapDur = slotTime * 0.9;
    let lastPairIdx = -1;

    for (let s = 0; s < swapCount; s++) {
      let pi = Math.floor(Math.random() * pairs.length);
      if (pi === lastPairIdx && pairs.length > 1) pi = (pi + 1) % pairs.length;
      lastPairIdx = pi;
      const [a, b] = pairs[pi];

      addCardSwap(positions[a], positions[b], cellXY(a), cellXY(b), s * slotTime, swapDur);

      const tmp = positions[a];
      positions[a] = positions[b];
      positions[b] = tmp;
    }

    // Giai đoạn 2: khói dày ở tất cả các túi + trộn lại ngầm (rất nhanh, khó theo dõi)
    const mixAt = gentleSec;
    const mixPairs = randomMatching(positions.length);
    const mixSwapDur = Math.max(0.1, mixSec / mixPairs.length);

    tl.call(
      () => {
        const centers: { x: number; y: number }[] = [];
        for (let slot = 0; slot < positions.length; slot++) {
          const c = cellXY(slot);
          centers.push({ x: c.x + c.w / 2, y: c.y + c.h / 2 });
        }
        onMixRef.current(centers);
      },
      undefined,
      mixAt,
    );

    let t = mixAt + 0.04;
    for (const [a, b] of mixPairs) {
      const elA = cardRefs.current[positions[a]];
      const elB = cardRefs.current[positions[b]];
      const pa = cellXY(a);
      const pb = cellXY(b);

      if (elA) {
        tl.to(
          elA,
          { x: pb.x, y: pb.y, scale: 1.06, rotation: gsap.utils.random(-18, 18), duration: mixSwapDur, ease: 'power3.inOut', overwrite: 'auto' },
          t,
        );
      }
      if (elB) {
        tl.to(
          elB,
          { x: pa.x, y: pa.y, scale: 1.06, rotation: gsap.utils.random(-18, 18), duration: mixSwapDur, ease: 'power3.inOut', overwrite: 'auto' },
          t,
        );
      }
      const tmp = positions[a];
      positions[a] = positions[b];
      positions[b] = tmp;
      t += mixSwapDur;
    }

    // Ổn định lại vị trí
    const settleAt = t;
    for (let slot = 0; slot < positions.length; slot++) {
      const el = cardRefs.current[positions[slot]];
      if (!el) continue;
      const { x, y } = cellXY(slot);
      tl.to(el, { x, y, scale: 1, rotation: 0, zIndex: 1, duration: 0.28, ease: 'power2.out', overwrite: 'auto' }, settleAt);
    }

    tl.call(
      () => {
        orderRef.current = positions;
        onDoneRef.current(positions);
      },
      undefined,
      settleAt + 0.28,
    );

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}
