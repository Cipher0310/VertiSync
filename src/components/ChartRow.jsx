/**
 * Minimal glowing line chart for bento cards (SVG).
 * @param {{ points?: number[]; className?: string }} props
 */
export default function ChartRow({ points = [72, 68, 65, 62, 58, 55, 52, 48], className = '' }) {
  const w = 320;
  const h = 72;
  const pad = 4;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const norm = (v) => (max === min ? 0.5 : (v - min) / (max - min));
  const step = (w - pad * 2) / Math.max(1, points.length - 1);

  const d = points
    .map((p, i) => {
      const x = pad + i * step;
      const y = pad + (1 - norm(p)) * (h - pad * 2);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className={`relative w-full ${className}`}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-16 md:h-[4.5rem]"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="chartStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={d}
          fill="none"
          stroke="url(#chartStroke)"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#chartGlow)"
          className="drop-shadow-[0_0_8px_rgba(34,211,238,0.45)]"
        />
      </svg>
    </div>
  );
}
