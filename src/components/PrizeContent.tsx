import { useState } from 'react';
import { ITEMS, TIMINGS } from '../config/game';
import type { CardContent, Item } from '../types';

function PrizeImage({ item, heightClass }: { item: Item; heightClass: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`${heightClass} flex w-[84%] flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border-2 border-dashed border-leaf-300 bg-white/75 px-1`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-leaf-400" aria-hidden="true">
          <path
            d="M4 5h16v14H4z M4 15l4-4 4 4 3-3 5 5"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="line-clamp-3 break-words text-center font-display text-[9px] font-semibold leading-[1.15] text-leaf-800">
          {item.name}
        </span>
      </div>
    );
  }

  return (
    <img
      src={item.img}
      alt={item.name}
      draggable={false}
      onError={() => setFailed(true)}
      className={`${heightClass} w-[84%] select-none object-contain drop-shadow-[0_6px_8px_rgba(21,128,61,0.28)]`}
    />
  );
}

function ItemView({
  item,
  sparkle,
  extra,
  extraOpacity = 0,
  compact,
}: {
  item: Item;
  sparkle?: boolean;
  extra?: string;
  extraOpacity?: number;
  compact?: boolean;
}) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-1 px-1">
      {sparkle && (
        <>
          <span
            className="absolute left-[12%] top-[14%] text-[10px] text-harvest-400 anim-sparkle"
            aria-hidden="true"
          >
            ✦
          </span>
          <span
            className="absolute right-[14%] top-[22%] text-[10px] text-harvest-500 anim-sparkle"
            style={{ animationDelay: '0.4s' }}
            aria-hidden="true"
          >
            ✦
          </span>
        </>
      )}
      <PrizeImage item={item} heightClass={compact ? 'h-[46%]' : 'h-[62%]'} />
      <span className="line-clamp-2 max-w-full break-words rounded-full bg-leaf-700/10 px-2 py-0.5 text-center font-display text-[9px] font-semibold leading-[1.15] text-leaf-900">
        {item.name}
      </span>
      {extra && (
        <p
          className="text-[10px] font-bold leading-[1.2] text-berry-500"
          style={{ opacity: extraOpacity }}
        >
          {extra}
        </p>
      )}
    </div>
  );
}

function SecretView({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-1.5 text-center">
      <svg viewBox="0 0 64 64" className="h-9 w-9 anim-bob" aria-hidden="true">
        <rect x="8" y="26" width="48" height="30" rx="7" fill="#f59e0b" />
        <rect x="6" y="18" width="52" height="14" rx="7" fill="#fcd34d" />
        <rect x="27" y="16" width="10" height="40" rx="5" fill="#ec4899" />
        <path d="M32 18c-6-10-18-8-18-2 0 4 6 6 18 4 12 2 18 0 18-4 0-6-12-8-18 2Z" fill="#f472b6" />
      </svg>
      <h3 className="font-display text-[13px] font-bold leading-[1.15] text-leaf-900">{title}</h3>
      {lines.map((l) => (
        <p key={l} className="text-[10px] font-semibold leading-[1.2] text-leaf-800">
          {l}
        </p>
      ))}
    </div>
  );
}

/**
 * Giữ nguyên ảnh + tên món; từ `showAt` hiện thêm dòng trêu ngay dưới tên,
 * rõ dần và rõ hẳn cùng lúc túi mở (revealThreshold).
 */
function TeaseView({
  item,
  extraText,
  showAt,
  progress,
}: {
  item: Item;
  extraText: string;
  showAt: number;
  progress: number;
}) {
  const span = Math.max(0.0001, TIMINGS.revealThreshold - showAt);
  const opacity = Math.min(1, Math.max(0, (progress - showAt) / span));

  return (
    <ItemView item={item} sparkle compact extra={extraText} extraOpacity={opacity} />
  );
}

export default function PrizeContent({
  content,
  active,
  progress = 1,
}: {
  content: CardContent;
  active: boolean;
  progress?: number;
}) {
  if (content.kind === 'item') return <ItemView item={ITEMS[content.item]} />;

  if (content.kind === 'secret') return <SecretView title={content.title} lines={content.lines} />;

  return (
    <TeaseView
      item={ITEMS[content.item]}
      extraText={content.extraText}
      showAt={content.showAt}
      progress={active ? 1 : progress}
    />
  );
}
