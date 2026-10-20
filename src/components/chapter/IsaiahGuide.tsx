import type { ReactNode } from 'react';

// Isaiah appears only at meaningful transitions — beside his words, not over the
// story. He reads and points to Scripture; he is never an eyewitness to Creation.
const POSES = {
  welcoming: '/assets/guides/isaiah/isaiah-welcoming.webp',
  reading: '/assets/guides/isaiah/isaiah-reading.webp',
  encouraging: '/assets/guides/isaiah/isaiah-encouraging.webp',
} as const;

export default function IsaiahGuide({
  pose,
  line,
  children,
}: {
  pose: keyof typeof POSES;
  line: string;
  children?: ReactNode;
}) {
  return (
    <div className="guide-panel bk-reveal">
      <img className="guide-portrait" src={POSES[pose]} alt="Isaiah" />
      <div className="guide-body">
        <div className="guide-who">ISAIAH</div>
        <p className="guide-say">{line}</p>
        {children}
      </div>
    </div>
  );
}
