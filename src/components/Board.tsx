import { useEffect, useMemo, useRef } from 'react';
import { MAX_PICKS, TIMINGS, TOTAL_BAGS } from '../config/game';
import { fxBurst, fxConfetti, smokeColors } from '../lib/fx';
import { useReducedMotion } from '../lib/useReducedMotion';
import { useShuffle } from '../lib/useShuffle';
import { useGameStore } from '../store/gameStore';
import type { TooltipAlign } from '../types';
import GiftCard from './GiftCard';

const COLUMNS = 4;

export default function Board() {
  const cards = useGameStore((s) => s.cards);
  const phase = useGameStore((s) => s.phase);
  const picks = useGameStore((s) => s.picks);
  const beginPick = useGameStore((s) => s.beginPick);
  const completeOpen = useGameStore((s) => s.completeOpen);
  const beginShuffle = useGameStore((s) => s.beginShuffle);
  const commitOrder = useGameStore((s) => s.commitOrder);
  const finishShuffle = useGameStore((s) => s.finishShuffle);
  const revealRemaining = useGameStore((s) => s.revealRemaining);
  const finishAutoReveal = useGameStore((s) => s.finishAutoReveal);
  const switchDeadline = useGameStore((s) => s.switchDeadline);
  const reduced = useReducedMotion();

  const boardRef = useRef<HTMLDivElement | null>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const order = useMemo(() => cards.map((c) => c.slot), [cards]);

  // khói dày ở cả 7 túi rồi trộn lại ngầm — nhanh để khó theo dõi
  const handleMix = (points: { x: number; y: number }[]) => {
    const board = boardRef.current;
    if (!board) return;
    const b = board.getBoundingClientRect();
    points.forEach((p) => {
      const x = b.left + p.x;
      const y = b.top + p.y;
      fxBurst(x, y, {
        count: 120,
        colors: smokeColors,
        speed: 720,
        sizeFrom: 22,
        sizeTo: 104,
        life: 0.34,
        gravity: -10,
        rise: 150,
      });
      window.setTimeout(() => {
        fxBurst(x, y, {
          count: 90,
          colors: smokeColors,
          speed: 460,
          sizeFrom: 30,
          sizeTo: 140,
          life: 0.42,
          gravity: -6,
          rise: 85,
        });
      }, 40);
    });
  };

  const handleShuffleDone = (finalOrder: number[]) => {
    commitOrder(finalOrder);
    finishShuffle();
  };

  useShuffle({
    boardRef,
    slotRefs,
    cardRefs,
    order,
    enabled: phase === 'shuffling',
    reduced,
    gentleMs: TIMINGS.gentleMs,
    mixMs: TIMINGS.mixMs,
    onMix: handleMix,
    onDone: handleShuffleDone,
  });

  // phơi 2 món giá trị rồi che lại và bắt đầu trộn
  useEffect(() => {
    if (phase !== 'peek') return;
    const t = window.setTimeout(() => beginShuffle(), TIMINGS.peekMs);
    return () => window.clearTimeout(t);
  }, [phase, beginShuffle]);

  // hết 2 lượt -> chỉ chỗ 2 túi chứa món giá trị nhất
  useEffect(() => {
    if (phase !== 'picking' || picks < MAX_PICKS) return;
    const picked = cards.filter((c) => c.pickOrder !== null);
    if (picked.length < MAX_PICKS || !picked.every((c) => c.opened)) return;
    const t = window.setTimeout(() => revealRemaining(), 1500);
    return () => window.clearTimeout(t);
  }, [phase, picks, cards, revealRemaining]);

  useEffect(() => {
    if (phase !== 'autoRevealing') return;
    const t = window.setTimeout(() => finishAutoReveal(), 1700);
    return () => window.clearTimeout(t);
  }, [phase, finishAutoReveal]);

  // bắn confetti khi kết thúc
  useEffect(() => {
    if (phase !== 'done' || reduced) return;
    let shots = 0;
    fxConfetti();
    const id = window.setInterval(() => {
      shots += 1;
      fxConfetti();
      if (shots >= 4) window.clearInterval(id);
    }, 620);
    return () => window.clearInterval(id);
  }, [phase, reduced]);

  const showHints = phase === 'picking' && picks < MAX_PICKS;
  /** đang chờ chốt túi -> tạm khoá cạo trên cả bàn */
  const locked = switchDeadline !== null;
  const slotWidth = `calc((100% - ${(COLUMNS - 1) * 0.5}rem) / ${COLUMNS})`;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-3 pb-16 pt-24">
      <div
        ref={boardRef}
        className="relative flex w-full flex-wrap justify-center gap-2"
        style={{ maxWidth: 'min(95vw, 720px)' }}
      >
        {Array.from({ length: TOTAL_BAGS }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              slotRefs.current[i] = el;
            }}
            className="aspect-[3/4]"
            style={{ width: slotWidth }}
          />
        ))}

        {cards.map((card, i) => {
          const col = card.slot % COLUMNS;
          const hintAlign: TooltipAlign =
            col === 0 ? 'left' : col === COLUMNS - 1 ? 'right' : 'center';
          return (
            <GiftCard
              key={card.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              card={card}
              peek={phase === 'peek'}
              interactive={
                phase === 'picking' && !card.opened && (card.pickOrder !== null || picks < MAX_PICKS)
              }
              locked={locked}
              reduced={reduced}
              showHint={showHints && !card.opened && card.content === null}
              hintAlign={hintAlign}
              hintPlacement={card.slot < COLUMNS ? 'top' : 'bottom'}
              onFirstTouch={() => beginPick(card.id)}
              onComplete={() => completeOpen(card.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
