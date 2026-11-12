import { useId } from 'react';

export function ArcLeaf({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      className={className}
      viewBox="0 0 440 520"
      role="img"
      aria-labelledby={`${id}-title ${id}-desc`}
    >
      <title id={`${id}-title`}>The Arc leaf</title>
      <desc id={`${id}-desc`}>
        An asymmetric botanical leaf printed in marigold, coral, and magenta with fine aubergine veins.
      </desc>
      <defs>
        <linearGradient id={`${id}-gradient`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#edae2b" />
          <stop offset="0.36" stopColor="#e87832" />
          <stop offset="0.67" stopColor="#df5d58" />
          <stop offset="1" stopColor="#a92367" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d="M232 478C117 402 50 283 72 173C91 78 188 27 373 22C355 177 386 310 305 405C279 435 253 458 232 478Z" />
        </clipPath>
      </defs>
      <path
        d="M232 478C117 402 50 283 72 173C91 78 188 27 373 22C355 177 386 310 305 405C279 435 253 458 232 478Z"
        fill={`url(#${id}-gradient)`}
      />
      <g clipPath={`url(#${id}-clip)`} fill="none" stroke="#3c1949" strokeWidth="1.4" opacity="0.72">
        <path d="M213 510C225 370 256 230 357 65" strokeWidth="2.3" />
        <path d="M230 413L116 312M247 351L108 226M273 282L135 145M303 211L207 74M320 173L366 316M287 248L373 367M258 327L327 430" />
        <path d="M231 413L119 372M249 349L91 291M275 280L86 195M304 211L120 99" opacity="0.5" />
      </g>
      <path
        d="M232 478C117 402 50 283 72 173C91 78 188 27 373 22C355 177 386 310 305 405C279 435 253 458 232 478Z"
        fill="none"
        stroke="#3c1949"
        strokeWidth="2"
      />
      <path d="M210 517C219 492 226 474 234 453" fill="none" stroke="#3c1949" strokeWidth="4" />
    </svg>
  );
}

export function ArcStamp({ compact = false }: { compact?: boolean }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      className={compact ? 'arc-stamp arc-stamp--compact' : 'arc-stamp'}
      viewBox="0 0 140 140"
      role="img"
      aria-label="Arc design system, edition one"
    >
      <defs>
        <path id={`${id}-path`} d="M70,70 m-51,0 a51,51 0 1,1 102,0 a51,51 0 1,1 -102,0" />
      </defs>
      <circle cx="70" cy="70" r="64" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="70" cy="70" r="44" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
      <text fill="currentColor" fontFamily="IBM Plex Mono, monospace" fontSize="10" letterSpacing="2.1">
        <textPath href={`#${id}-path`}>ARC · DESIGN SYSTEM · EDITION 01 · </textPath>
      </text>
      <path d="M70 91C48 75 45 54 87 43C82 69 85 82 70 91Z" fill="currentColor" />
      <path d="M59 98L80 53" stroke="var(--arc-paper)" strokeWidth="1.5" />
    </svg>
  );
}

export function RegistrationMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="8" fill="none" stroke="currentColor" />
      <path d="M16 0V32M0 16H32" stroke="currentColor" />
    </svg>
  );
}
