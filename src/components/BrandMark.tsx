// The Promised Road emblem — open book, a winding road, a rising sun.
// Single master, two tones: navy-on-light (favicon, light surfaces) and
// gold-on-dark (the navy sidebar). Redraw of Identity Concept 01; no shadows or
// added detail, so it holds from 64px down to the 16px micro mark.

const BOOK = 'M32 28 C23 24 14 25.5 8.5 30 C8 30.5 8 31 8 31.8 L8 45.5 C15 42 24 42.5 32 46.5 C40 42.5 49 42 56 45.5 L56 31.8 C56 31 56 30.5 55.5 30 C50 25.5 41 24 32 28 Z';
const ROAD = 'M28.5 46.5 C31 41 26.5 39 30 34 C32.5 30.5 35 29.5 31.5 25.5 L33 25.5 C36.5 29.5 33.5 31 35.5 35.5 C37.5 40 33 41.5 35.5 46.5 Z';
const RAYS: [number, number, number, number][] = [
  [32, 13.5, 32, 10.2],
  [34.96, 15.66, 36.65, 12.03],
  [29.04, 15.66, 27.35, 12.03],
  [37.36, 17.5, 40.43, 14.93],
  [26.64, 17.5, 23.57, 14.93],
];

export default function BrandMark({
  tone = 'onDark',
  size = 40,
  className,
  title = 'The Promised Road',
}: {
  tone?: 'onDark' | 'onLight';
  size?: number;
  className?: string;
  title?: string;
}) {
  const book = tone === 'onDark' ? '#E4C07C' : '#102F50';
  const road = tone === 'onDark' ? '#0B2240' : '#FFFCF3';
  const sun = tone === 'onDark' ? '#E4C07C' : '#B5893F';
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={title}>
      <path d={BOOK} fill={book} />
      <path d={ROAD} fill={road} />
      <path d="M25.5 22 A6.5 6.5 0 0 1 38.5 22 Z" fill={sun} />
      <g stroke={sun} strokeWidth="1.8" strokeLinecap="round">
        {RAYS.map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />)}
      </g>
    </svg>
  );
}
