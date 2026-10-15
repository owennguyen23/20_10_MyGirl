function Cloud({
  className,
  delay = 0,
  duration = 48,
  scale = 1,
}: {
  className?: string;
  delay?: number;
  duration?: number;
  scale?: number;
}) {
  return (
    <div
      className={`absolute ${className ?? ''}`}
      style={{ animation: `drift ${duration}s linear ${delay}s infinite` }}
    >
      <div className="relative h-14 w-40" style={{ transform: `scale(${scale})`, transformOrigin: 'left center' }}>
        <div className="absolute left-0 top-4 h-10 w-24 rounded-full bg-white/90" />
        <div className="absolute left-8 top-0 h-14 w-20 rounded-full bg-white/90" />
        <div className="absolute right-0 top-5 h-9 w-20 rounded-full bg-white/90" />
        <div className="absolute bottom-0 left-0 h-8 w-40 rounded-full bg-white/95 blur-[1px]" />
      </div>
    </div>
  );
}

function Flower({
  className,
  color = '#ec4899',
  delay = 0,
}: {
  className?: string;
  color?: string;
  delay?: number;
}) {
  return (
    <svg
      viewBox="0 0 40 60"
      className={`absolute anim-sway ${className ?? ''}`}
      style={{ animationDelay: `${delay}s` }}
      aria-hidden="true"
    >
      <path d="M20 60 V28" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 44 C12 42 8 36 8 30 C15 30 19 35 20 42 Z" fill="#22c55e" />
      <path d="M20 40 C28 38 32 32 32 26 C25 26 21 31 20 38 Z" fill="#16a34a" />
      <g transform="translate(20 20)">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-8" rx="5.5" ry="9" fill={color} transform={`rotate(${a})`} />
        ))}
        <circle r="5" fill="#fcd34d" />
      </g>
    </svg>
  );
}

export default function FarmBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #bae6fd 0%, #d9f6e4 38%, #bbf7d0 62%, #86efac 100%)',
        }}
      />

      {/* mặt trời */}
      <div
        className="absolute right-[7%] top-[5%] h-24 w-24 rounded-full anim-bob"
        style={{
          background: 'radial-gradient(circle at 38% 36%, #fffbe6, #fcd34d 52%, #f59e0b 100%)',
          boxShadow: '0 0 70px 18px rgba(245, 158, 11, 0.45)',
        }}
      />

      {/* mây */}
      <Cloud className="top-[9%]" delay={0} duration={55} scale={1} />
      <Cloud className="top-[20%]" delay={9} duration={70} scale={0.7} />
      <Cloud className="top-[3%]" delay={22} duration={62} scale={0.5} />

      {/* đồi */}
      <svg
        viewBox="0 0 1440 640"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 h-[58%] w-full"
      >
        <path
          d="M0 300 C 220 210 420 300 700 268 C 980 236 1180 300 1440 246 V640 H0 Z"
          fill="#86efac"
        />
        <path
          d="M0 400 C 260 320 520 410 780 372 C 1040 334 1240 410 1440 356 V640 H0 Z"
          fill="#4ade80"
        />
        <path
          d="M0 496 C 300 442 560 512 860 486 C 1120 464 1300 512 1440 484 V640 H0 Z"
          fill="#22c55e"
        />
        <path
          d="M0 576 C 320 542 640 592 960 574 C 1200 560 1340 584 1440 572 V640 H0 Z"
          fill="#16a34a"
        />
      </svg>

      {/* hoa & bụi cỏ */}
      <Flower className="bottom-[9%] left-[6%] h-14 w-10" color="#ec4899" delay={0} />
      <Flower className="bottom-[6%] left-[16%] h-11 w-8" color="#f59e0b" delay={0.6} />
      <Flower className="bottom-[8%] right-[9%] h-14 w-10" color="#f472b6" delay={1.1} />
      <Flower className="bottom-[5%] right-[20%] h-10 w-7" color="#fb7185" delay={0.3} />
      <Flower className="bottom-[7%] left-[45%] h-12 w-9" color="#a78bfa" delay={0.9} />

      {/* bụi cỏ */}
      <svg viewBox="0 0 120 60" className="absolute bottom-[4%] left-[29%] h-12 w-24" aria-hidden="true">
        <path d="M10 60 C6 40 2 30 0 22 C10 30 14 44 16 60 Z" fill="#15803d" />
        <path d="M30 60 C30 38 34 26 40 18 C38 34 38 46 40 60 Z" fill="#16a34a" />
        <path d="M54 60 C58 40 64 30 72 24 C66 40 62 50 62 60 Z" fill="#15803d" />
      </svg>

      {/* hạt sáng bay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,.85) 0 2px, transparent 2px)',
          backgroundSize: '90px 90px',
          backgroundPosition: '20px 30px',
          opacity: 0.35,
        }}
      />
    </div>
  );
}
