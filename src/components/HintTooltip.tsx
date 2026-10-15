import type { TooltipAlign, TooltipPlacement } from '../types';

interface Props {
  text: string;
  align: TooltipAlign;
  placement: TooltipPlacement;
}

export default function HintTooltip({ text, align, placement }: Props) {
  const horizontal =
    align === 'left' ? 'left-0' : align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2';
  const arrowX =
    align === 'left' ? 'left-4' : align === 'right' ? 'right-4' : 'left-1/2 -translate-x-1/2';
  const above = placement === 'top';

  return (
    <div
      className={`pointer-events-none absolute z-30 ${above ? 'bottom-full mb-2' : 'top-full mt-2'} ${horizontal}`}
    >
      <div className="relative w-max max-w-[9rem] rounded-2xl border-[3px] border-leaf-700/25 bg-white px-2.5 py-1.5 text-center font-display text-[11px] font-semibold leading-tight text-leaf-800 shadow-clay-sm anim-pop">
        {text}
      </div>
      <span
        className={`absolute h-0 w-0 border-x-[9px] border-x-transparent ${arrowX} ${
          above ? 'top-full border-t-[10px] border-t-white' : 'bottom-full border-b-[10px] border-b-white'
        }`}
        style={above ? { marginTop: '-2px' } : { marginBottom: '-2px' }}
        aria-hidden="true"
      />
    </div>
  );
}
