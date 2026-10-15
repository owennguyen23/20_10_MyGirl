import { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { COVER_HINT, TIMINGS } from '../../config/game';
import { clearedRatio } from '../../lib/canvasReveal';

interface Props {
  active: boolean;
  reduced: boolean;
  /** đang trong thời gian chờ chốt túi -> chưa cho cạo */
  locked: boolean;
  /** túi này đã được chọn chưa (lần chạm đầu chỉ để chọn, chưa cạo) */
  picked: boolean;
  onFirstTouch: () => void;
  onProgress: (ratio: number) => void;
  onComplete: () => void;
}

/** đường kính nét phủi (px, theo CSS) */
const BRUSH_CSS = 22;

/** bán kính bo góc của khung chứa lớp phủ (px, theo CSS) — vùng này không chạm tới được */
const COVER_RADIUS_CSS = 15;

/** Lớp phủ mềm: người chơi phủi (kéo tay) để xoá dần lớp phủ và mở túi. */
export default function BrushOverlay({
  active,
  reduced,
  locked,
  picked,
  onFirstTouch,
  onProgress,
  onComplete,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const brushRef = useRef<HTMLCanvasElement | null>(null);
  const dprRef = useRef(1);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const doneRef = useRef(false);
  const lastCheckRef = useRef(0);
  const tweensRef = useRef<gsap.core.Tween[]>([]);

  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  const buildBrush = useCallback((dpr: number) => {
    const r = (BRUSH_CSS * dpr) / 2;
    const c = document.createElement('canvas');
    c.width = r * 2;
    c.height = r * 2;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const g = ctx.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.85, 'rgba(0,0,0,0.99)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(r, r, r, 0, Math.PI * 2);
    ctx.fill();
    brushRef.current = c;
  }, []);

  const paintCover = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    const { width, height } = canvas;
    const dpr = dprRef.current;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);

    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, '#4ade80');
    g.addColorStop(0.45, '#22c55e');
    g.addColorStop(1, '#15803d');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    const dot = 6 * dpr;
    const gap = 18 * dpr;
    for (let y = gap / 2; y < height; y += gap) {
      for (let x = gap / 2; x < width; x += gap) {
        ctx.beginPath();
        ctx.arc(x, y, dot, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.strokeStyle = 'rgba(5,46,22,0.22)';
    ctx.lineWidth = 4 * dpr;
    ctx.strokeRect(4 * dpr, 4 * dpr, width - 8 * dpr, height - 8 * dpr);
  }, []);

  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext('2d', { willReadFrequently: true });
    }
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dprRef.current = dpr;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    buildBrush(dpr);
    paintCover();
  }, [buildBrush, paintCover]);

  const reveal = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onProgressRef.current(1);
    const canvas = canvasRef.current;
    if (!canvas || reduced) {
      onComplete();
      return;
    }
    tweensRef.current.push(
      gsap.to(canvas, {
        opacity: 0,
        scale: 1.05,
        duration: 0.35,
        ease: 'power2.out',
        onComplete: () => onComplete(),
      }),
    );
  }, [onComplete, reduced]);

  useEffect(() => {
    setup();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      if (doneRef.current) return;
      setup();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [setup]);

  useEffect(
    () => () => {
      tweensRef.current.forEach((t) => t.kill());
      tweensRef.current = [];
    },
    [],
  );

  const stamp = (x: number, y: number) => {
    const ctx = ctxRef.current;
    const brush = brushRef.current;
    if (!ctx || !brush) return;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(brush, x - brush.width / 2, y - brush.height / 2);
  };

  const checkProgress = (force = false) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx || doneRef.current) return;
    const now = performance.now();
    if (!force && now - lastCheckRef.current < 110) return;
    lastCheckRef.current = now;
    const step = Math.max(3, Math.round(5 * dprRef.current));
    const ratio = clearedRatio(
      ctx,
      canvas.width,
      canvas.height,
      step,
      COVER_RADIUS_CSS * dprRef.current,
    );
    onProgressRef.current(ratio);
    if (ratio >= TIMINGS.revealThreshold) reveal();
  };

  const toCanvasPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const beginStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    const p = toCanvasPoint(e.clientX, e.clientY);
    lastPoint.current = p;
    stamp(p.x, p.y);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!active || doneRef.current) return;

    // đang chờ chốt túi: chạm lần này là để xác nhận giữ túi cũ hoặc đổi túi mới
    if (locked) {
      onFirstTouch();
      beginStroke(e);
      return;
    }
    // chạm đầu tiên vào túi chưa chọn: chỉ chọn túi, chưa cho cạo
    if (!picked) {
      onFirstTouch();
      return;
    }
    beginStroke(e);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !active || doneRef.current) return;
    const brush = brushRef.current;
    const p = toCanvasPoint(e.clientX, e.clientY);
    const last = lastPoint.current ?? p;
    const stepLen = brush ? Math.max(3, brush.width * 0.25) : 6;
    const dx = p.x - last.x;
    const dy = p.y - last.y;
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.floor(dist / stepLen));

    for (let i = 1; i <= steps; i++) {
      stamp(last.x + (dx * i) / steps, last.y + (dy * i) / steps);
    }

    lastPoint.current = p;
    checkProgress();
  };

  const endStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    drawing.current = false;
    lastPoint.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    checkProgress(true);
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
        onPointerLeave={endStroke}
        className={`h-full w-full touch-none ${active ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        style={{ display: 'block' }}
      />
      <span className="sr-only">{COVER_HINT}</span>
    </div>
  );
}
