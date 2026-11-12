import { useId } from 'react';
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

const fanArcs = [-1, 0, 1].flatMap((column) =>
  Array.from({ length: 11 }, (_, ring) => {
    const centerX = 60 + column * 120;
    const radius = 10 + ring * 9;
    return `M ${centerX - radius} 78 A ${radius} ${radius} 0 0 1 ${centerX + radius} 78`;
  }),
);

const fanRays = [-1, 0, 1].flatMap((column) =>
  Array.from({ length: 13 }, (_, ray) => {
    const angle = Math.PI + (ray / 12) * Math.PI;
    const endX = 60 + column * 120 + Math.cos(angle) * 100;
    const endY = 78 + Math.sin(angle) * 100;
    return `M ${60 + column * 120} 78 L ${endX.toFixed(2)} ${endY.toFixed(2)}`;
  }),
);

export function GuillocheField() {
  const id = useId().replace(/:/g, '');
  const foil = `bard-foil-${id}`;
  const bloom = `bard-bloom-${id}`;
  const pearl = `bard-pearl-${id}`;
  const fan = `bard-fan-${id}`;
  const fineFan = `bard-fine-fan-${id}`;
  const sheen = `bard-sheen-${id}`;

  return (
    <svg className="bard-guilloche" viewBox="0 0 960 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={foil} x1="0" y1="0.18" x2="1" y2="0.82">
          <stop offset="0" stopColor="#cce8cd" />
          <stop offset="0.16" stopColor="#b8e8d9" />
          <stop offset="0.34" stopColor="#b8dfed" />
          <stop offset="0.51" stopColor="#d3cfed" />
          <stop offset="0.68" stopColor="#e5cfeb" />
          <stop offset="0.83" stopColor="#b6e4e2" />
          <stop offset="1" stopColor="#dcefcf" />
        </linearGradient>
        <radialGradient id={bloom} cx="0.12" cy="0.8" r="0.82">
          <stop offset="0" stopColor="#a7e7d0" stopOpacity="0.88" />
          <stop offset="0.34" stopColor="#d8f1ea" stopOpacity="0.34" />
          <stop offset="0.62" stopColor="#cbc1ea" stopOpacity="0.5" />
          <stop offset="1" stopColor="#cbc1ea" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={pearl} cx="0.78" cy="0.16" r="0.75">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.94" />
          <stop offset="0.3" stopColor="#f8fbf1" stopOpacity="0.5" />
          <stop offset="0.58" stopColor="#b9eaf2" stopOpacity="0.12" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={fan} x1="0" y1="0" x2="1" y2="0.32">
          <stop offset="0" stopColor="#247b70" />
          <stop offset="0.27" stopColor="#36889b" />
          <stop offset="0.52" stopColor="#696a9e" />
          <stop offset="0.73" stopColor="#866696" />
          <stop offset="1" stopColor="#267b77" />
        </linearGradient>
        <linearGradient id={fineFan} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#3b9486" />
          <stop offset="0.48" stopColor="#7a72a3" />
          <stop offset="1" stopColor="#268ca0" />
        </linearGradient>
        <linearGradient id={sheen} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.38" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.49" stopColor="#ffffff" stopOpacity="0.62" />
          <stop offset="0.54" stopColor="#eefcff" stopOpacity="0.22" />
          <stop offset="0.68" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <pattern id={`${fan}-pattern`} width="120" height="78" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={`url(#${fan})`} strokeWidth="0.85" strokeOpacity="0.58">
            {fanArcs.map((path) => <path d={path} key={path} />)}
          </g>
          <g fill="none" stroke={`url(#${fineFan})`} strokeWidth="0.4" strokeOpacity="0.2">
            {fanRays.map((path) => <path d={path} key={path} />)}
          </g>
        </pattern>
        <pattern id={`${fineFan}-pattern`} href={`#${fan}-pattern`} width="120" height="78" patternUnits="userSpaceOnUse" patternTransform="translate(60 39) scale(0.72)" />
      </defs>
      <rect width="960" height="640" fill={`url(#${foil})`} />
      <rect width="960" height="640" fill={`url(#${bloom})`} />
      <rect width="960" height="640" fill={`url(#${pearl})`} />
      <rect className="bard-guilloche__fans" x="-20" y="-20" width="1000" height="680" fill={`url(#${fan}-pattern)`} />
      <rect className="bard-guilloche__fine-fans" x="-20" y="-20" width="1000" height="680" fill={`url(#${fineFan}-pattern)`} opacity="0.2" />
      <g className="bard-guilloche__sheen">
        <rect x="-420" y="-260" width="1500" height="1160" fill={`url(#${sheen})`} transform="rotate(-18 330 320)" />
      </g>
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
