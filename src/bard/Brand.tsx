import { motion, useReducedMotion } from 'motion/react';

function makeSpiral() {
  const points: string[] = [];
  for (let step = 0; step <= 520; step += 1) {
    const angle = step * 0.045;
    const radius = 1.8 + step * 0.245;
    const x = 120 + Math.cos(angle) * radius;
    const y = 120 + Math.sin(angle) * radius;
    points.push(`${step === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(' ');
}

const spiralPath = makeSpiral();

export function SpiralSigil({ className = '', animated = false }: { className?: string; animated?: boolean }) {
  const reduceMotion = useReducedMotion();
  const shouldAnimate = animated && !reduceMotion;

  return (
    <svg className={className} viewBox="0 0 240 240" fill="none" aria-hidden="true">
      <circle cx="120" cy="120" r="113" stroke="currentColor" strokeOpacity="0.2" />
      <circle cx="120" cy="120" r="102" stroke="currentColor" strokeOpacity="0.12" />
      <motion.path
        d={spiralPath}
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      />
      <circle cx="120" cy="120" r="3" fill="currentColor" />
    </svg>
  );
}

function guillochePath(row: number) {
  const points: string[] = [];
  for (let x = -40; x <= 1000; x += 8) {
    const envelope = Math.sin((x / 1000) * Math.PI);
    const y = row * 9 + Math.sin(x * 0.021 + row * 0.55) * (7 + envelope * 8) + Math.sin(x * 0.007 - row) * 5;
    points.push(`${x === -40 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(' ');
}

export function GuillocheField() {
  return (
    <svg className="bard-guilloche" viewBox="0 0 960 510" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="bard-pearl-field" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dcecdf" />
          <stop offset="0.45" stopColor="#d6ebe6" />
          <stop offset="0.76" stopColor="#e7e1ed" />
          <stop offset="1" stopColor="#edf3e8" />
        </linearGradient>
        <radialGradient id="bard-pearl-light" cx="0.72" cy="0.18" r="0.8">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.72" />
          <stop offset="0.52" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="960" height="510" fill="url(#bard-pearl-field)" />
      <g className="bard-guilloche__lines" stroke="#255f57" strokeWidth="0.65" strokeOpacity="0.22" fill="none">
        {Array.from({ length: 59 }, (_, row) => (
          <path key={row} d={guillochePath(row)} />
        ))}
      </g>
      <g stroke="#806e91" strokeWidth="0.5" strokeOpacity="0.16" fill="none" transform="translate(0 4)">
        {Array.from({ length: 28 }, (_, row) => (
          <path key={row} d={guillochePath(row * 2 + 1)} />
        ))}
      </g>
      <rect width="960" height="510" fill="url(#bard-pearl-light)" />
    </svg>
  );
}

export function BardWordmark({ small = false }: { small?: boolean }) {
  return (
    <span className={`bard-wordmark${small ? ' bard-wordmark--small' : ''}`}>
      <SpiralSigil className="bard-wordmark__sigil" />
      <span>Bard</span>
    </span>
  );
}
