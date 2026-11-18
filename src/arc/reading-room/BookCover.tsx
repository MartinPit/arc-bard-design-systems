import { useId } from 'react';
import type { Book } from './data';

interface BookCoverProps {
  book: Book;
  compact?: boolean;
}

export function BookCover({ book, compact = false }: BookCoverProps) {
  const id = `arc-cover-${useId().replace(/:/g, '')}`;
  const gradientId = `${id}-gradient`;
  const washId = `${id}-wash`;
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  return (
    <div className={`arc-reading-room-book-cover arc-reading-room-book-cover--${book.cover}${compact ? ' arc-reading-room-book-cover--compact' : ''}`}>
      <svg viewBox="0 0 240 340" role="img" aria-labelledby={`${titleId} ${descriptionId}`}>
        <title id={titleId}>{book.title} cover</title>
        <desc id={descriptionId}>{book.coverDescription}</desc>
        <defs>
          <linearGradient id={gradientId} x1="25" y1="20" x2="210" y2="290" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--arc-marigold)" />
            <stop offset="0.48" stopColor="var(--arc-coral)" />
            <stop offset="1" stopColor="var(--arc-magenta)" />
          </linearGradient>
          <radialGradient id={washId} cx="0" cy="0" r="1" gradientTransform="translate(177 137) rotate(118) scale(128)">
            <stop stopColor="var(--arc-marigold)" />
            <stop offset="1" stopColor="var(--arc-magenta)" />
          </radialGradient>
        </defs>

        <rect className="arc-reading-room-book-cover__paper" x="0.5" y="0.5" width="239" height="339" />
        <path className="arc-reading-room-book-cover__spine" d="M14 0v340" />
        <text className="arc-reading-room-book-cover__imprint" x="28" y="28"><tspan className="notranslate">ARC EDITIONS</tspan> · {book.category.toUpperCase()}</text>
        <text className="arc-reading-room-book-cover__title" x="28" y="66">
          {book.titleLines.map((line, index) => <tspan x="28" dy={index === 0 ? 0 : 26} key={line}>{line}</tspan>)}
        </text>

        {book.cover === 'botanical' && (
          <g transform="translate(119 206)">
            <path className="arc-reading-room-book-cover__grid" d="M-77-76H77V76H-77ZM-77-26H77M-77 26H77M-26-76V76M26-76V76" />
            <path d="M-7 61C-63 28-75-22-40-65C2-29 8 14-7 61Z" fill={`url(#${gradientId})`} stroke="var(--arc-art-ink)" />
            <path d="M7 60C50 44 73 9 61-40C18-28-4 6 7 60Z" fill={`url(#${washId})`} stroke="var(--arc-art-ink)" />
            <path className="arc-reading-room-book-cover__stem" d="M-7 61 3 87M-32-34-7 61M48-15 7 60" />
          </g>
        )}
        {book.cover === 'light' && (
          <g>
            <circle cx="120" cy="191" r="65" fill={`url(#${washId})`} stroke="var(--arc-art-ink)" />
            <path className="arc-reading-room-book-cover__lines" d="M36 242h168M36 250h168M44 258h152M58 266h124" />
            <path className="arc-reading-room-book-cover__arch" d="M60 287V190a60 60 0 0 1 120 0v97M78 287V190a42 42 0 0 1 84 0v97" />
          </g>
        )}
        {book.cover === 'orchard' && (
          <g>
            <circle cx="154" cy="168" r="51" fill={`url(#${washId})`} />
            <circle className="arc-reading-room-book-cover__cutout" cx="177" cy="151" r="48" />
            <path className="arc-reading-room-book-cover__stem" d="M55 278c35-51 58-91 71-140M109 190l-35-28M101 210l43-30M86 240l-36-18M120 157l30-25" />
            {[['73','160'],['140','178'],['60','221'],['148','130'],['119','143']].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="8" fill={`url(#${gradientId})`} stroke="var(--arc-art-ink)" />)}
            <path className="arc-reading-room-book-cover__lines" d="M35 282h170" />
          </g>
        )}
        {book.cover === 'weather' && (
          <g>
            <path className="arc-reading-room-book-cover__grid" d="M40 137h160v133H40ZM40 170h160M40 204h160M40 237h160M80 137v133M120 137v133M160 137v133" />
            <path d="M31 247C79 180 114 258 164 181s58-34 58-34" fill="none" stroke={`url(#${gradientId})`} strokeWidth="18" />
            <path className="arc-reading-room-book-cover__lines" d="M67 130v19m26-28v19m27-7v19m26-39v19m27-12v19" />
          </g>
        )}
        {book.cover === 'cinder' && (
          <g>
            <rect className="arc-reading-room-book-cover__night" x="35" y="124" width="170" height="161" />
            <path d="M70 284c9-58 89-51 71-128 53 48 14 90 45 127" fill="none" stroke={`url(#${gradientId})`} strokeWidth="19" />
            <path className="arc-reading-room-book-cover__stem" d="M46 266c35-8 53-30 62-59m34 67c13-41 43-49 50-78" />
            <circle cx="86" cy="155" r="5" fill="var(--arc-marigold)" /><circle cx="180" cy="142" r="3" fill="var(--arc-coral)" />
          </g>
        )}
        {book.cover === 'arch' && (
          <g>
            <path className="arc-reading-room-book-cover__arch" d="M55 285V203a65 65 0 0 1 130 0v82M76 285V203a44 44 0 0 1 88 0v82" />
            <path d="M120 239c-42-19-42-54-21-66 17 1 23 15 21 30-2-15 4-29 21-30 21 12 21 47-21 66Z" fill={`url(#${washId})`} stroke="var(--arc-art-ink)" />
            <path className="arc-reading-room-book-cover__stem" d="M120 204v67m-24-25 24 11 25-16" />
            <path className="arc-reading-room-book-cover__lines" d="M40 286h160" />
          </g>
        )}
        <text className="arc-reading-room-book-cover__author" x="28" y="318">{book.author.toUpperCase()}</text>
      </svg>
    </div>
  );
}
