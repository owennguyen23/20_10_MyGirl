import { useMemo } from 'react';
import { balloonImages } from '../lib/balloonImages';
import { useReducedMotion } from '../lib/useReducedMotion';

interface Spec {
  key: string;
  src: string;
  left: number;
  size: number;
  depth: number;
  duration: number;
  delay: number;
  swayDur: number;
  swayDelay: number;
  shape: 'balloon' | 'heart';
}

/** vị trí ngang (tâm bóng) của các "làn" bóng bay (%) */
const LANES = [9, 28, 48, 68, 88];
/** độ xa/gần xen kẽ để hai làn cạnh nhau không cùng to */
const LANE_DEPTHS = [0.45, 1, 0.32, 0.85, 0.58];
const PER_LANE = 3;

function buildSpecs(): Spec[] {
  const specs: Spec[] = [];

  LANES.forEach((laneX, li) => {
    const depth = LANE_DEPTHS[li % LANE_DEPTHS.length];
    const baseSize = 40 + depth * 58;
    // bóng xa bay chậm hơn (parallax), bóng gần bay nhanh hơn
    const duration = 16 + (1 - depth) * 12;
    const gap = duration / PER_LANE;

    for (let k = 0; k < PER_LANE; k++) {
      specs.push({
        key: `${li}-${k}`,
        src: balloonImages[(li * PER_LANE + k) % balloonImages.length],
        left: laneX + (Math.random() - 0.5) * 5,
        size: Math.round(baseSize * (0.9 + Math.random() * 0.2)),
        depth,
        duration,
        // delay âm để bầu trời đã có bóng ngay từ đầu; khoảng cách trong làn luôn đều
        delay: -((k + Math.random() * 0.35) * gap),
        swayDur: 3.4 + Math.random() * 2.6,
        swayDelay: -Math.random() * 5,
        shape: Math.random() < 0.45 ? 'heart' : 'balloon',
      });
    }
  });

  return specs;
}

export default function Balloons() {
  const reduced = useReducedMotion();
  const specs = useMemo(() => (balloonImages.length ? buildSpecs() : []), []);

  if (reduced || specs.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden" aria-hidden="true">
      {specs.map((s) => (
        <div
          key={s.key}
          className="balloon"
          style={{
            left: `calc(${s.left}% - ${s.size / 2}px)`,
            width: `${s.size}px`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            zIndex: Math.round(s.depth * 10),
            opacity: 0.5 + s.depth * 0.5,
            filter: `blur(${((1 - s.depth) * 2.6).toFixed(2)}px)`,
          }}
        >
          <div
            className="balloon__sway"
            style={{ animationDuration: `${s.swayDur}s`, animationDelay: `${s.swayDelay}s` }}
          >
            <div
              className={`balloon__body ${s.shape === 'heart' ? 'balloon__body--heart' : ''}`}
              style={{ backgroundImage: `url(${s.src})` }}
            />
            <span className="balloon__knot" />
            <svg
              className="balloon__string"
              style={{ height: `${Math.round(s.size * 0.95)}px` }}
              viewBox="0 0 24 90"
              preserveAspectRatio="none"
            >
              <path
                d="M12 0 C 5 12, 19 24, 12 38 C 5 52, 19 64, 12 78 C 9 84, 12 88, 12 90"
                stroke="rgba(21,128,61,0.5)"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
