import { useEffect, useState } from 'react';
import { COVER_HINT, TIMINGS } from '../config/game';
import type { Card, TooltipAlign, TooltipPlacement } from '../types';
import HintTooltip from './HintTooltip';
import BrushOverlay from './overlays/BrushOverlay';
import PrizeContent from './PrizeContent';

interface Props {
  card: Card;
  peek: boolean;
  interactive: boolean;
  /** đang chờ chốt túi -> chưa cho cạo */
  locked: boolean;
  reduced: boolean;
  showHint: boolean;
  hintAlign: TooltipAlign;
  hintPlacement: TooltipPlacement;
  onFirstTouch: () => void;
  onComplete: () => void;
  ref?: React.Ref<HTMLDivElement>;
}

function SealedFace() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white to-leaf-100">
      <span className="font-display text-3xl font-bold text-leaf-300">?</span>
    </div>
  );
}

export default function GiftCard({
  ref,
  card,
  peek,
  interactive,
  locked,
  reduced,
  showHint,
  hintAlign,
  hintPlacement,
  onFirstTouch,
  onComplete,
}: Props) {
  const [brushed, setBrushed] = useState(0);

  // reset khi lớp phủ xuất hiện (hết giai đoạn phơi quà)
  useEffect(() => {
    if (!peek) setBrushed(0);
  }, [peek]);

  // túi bị trả về trạng thái chưa chọn (đổi túi) -> tiến độ phủi về 0
  useEffect(() => {
    if (card.pickOrder === null) setBrushed(0);
  }, [card.pickOrder]);

  const covered = !peek && !card.opened;
  const ratio = card.opened ? 1 : Math.min(1, brushed / TIMINGS.revealThreshold);
  const blurred = covered && card.content !== null;
  const blurPx = blurred ? (1 - ratio) * 9 : 0;
  const contentOpacity = blurred ? 0.35 + ratio * 0.65 : 1;

  return (
    <div ref={ref} className="absolute left-0 top-0 will-change-transform">
      {showHint && (
        <HintTooltip text={COVER_HINT} align={hintAlign} placement={hintPlacement} />
      )}

      <div className="relative h-full w-full rounded-[20px] clay-green">
        <div className="absolute inset-[7px] overflow-hidden rounded-[15px] bg-white">
          <div
            className="h-full w-full"
            style={{
              filter: blurPx > 0.05 ? `blur(${blurPx.toFixed(2)}px)` : 'none',
              opacity: contentOpacity,
              transition: 'filter 160ms linear, opacity 160ms linear',
            }}
          >
            {peek ? (
              card.preview ? (
                <PrizeContent content={{ kind: 'item', item: card.preview }} active={false} />
              ) : (
                <SealedFace />
              )
            ) : card.content ? (
              <PrizeContent content={card.content} active={card.opened} progress={brushed} />
            ) : (
              <SealedFace />
            )}
          </div>
        </div>

        {!peek && !card.opened && (
          <div className="anim-fadein absolute inset-[7px] overflow-hidden rounded-[15px]">
            <BrushOverlay
              key={card.resetCount}
              active={interactive}
              locked={locked}
              picked={card.content !== null}
              reduced={reduced}
              onFirstTouch={onFirstTouch}
              onProgress={setBrushed}
              onComplete={onComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
}
