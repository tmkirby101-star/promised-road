import { useEffect, useRef, type ReactNode } from 'react';

export type InfoKind = 'about' | 'parents' | null;

const COPY: Record<'about' | 'parents', { title: string; body: ReactNode }> = {
  about: {
    title: 'One story. From creation to new creation.',
    body: (
      <>
        <p>
          A good creation. A broken world. A promised Redeemer. The Promised Road follows the
          Bible’s unfolding story from Genesis to Revelation, with Jesus at its heart.
        </p>
        <p>
          Guided discoveries, Scripture, writing, and story activities invite children to
          understand what they read and carry it into everyday life. Travel at your own pace, and
          mark each discovery in your Bible Passport.
        </p>
      </>
    ),
  },
  parents: {
    title: 'A journey made for your child.',
    body: (
      <>
        <p>
          The Promised Road is being built as a self-paced K–8 Bible adventure. Grade-level writing,
          reading support, and Bible familiarity are separate, so children can receive the help that
          fits them.
        </p>
        <p>
          Explore the parent area to see saved work, learning evidence, and adjustable supports.
          Real accounts, cross-device saving, and AI feedback are rolling out in stages.
        </p>
      </>
    ),
  },
};

export default function BrandDialog({
  kind,
  onClose,
  onStart,
}: {
  kind: InfoKind;
  onClose: () => void;
  onStart: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (kind && !d.open) d.showModal();
    if (!kind && d.open) d.close();
  }, [kind]);

  const copy = kind ? COPY[kind] : null;

  return (
    <dialog id="brandInfo" className="brand-dialog" aria-labelledby="infoTitle" ref={ref} onClose={onClose}>
      <button className="dialog-close" aria-label="Close" onClick={onClose}>
        ×
      </button>
      <span className="kicker">THE PROMISED ROAD</span>
      <h2 id="infoTitle">{copy?.title}</h2>
      <div id="infoBody">{copy?.body}</div>
      <button className="primary" onClick={onStart} data-dialog-entry="true">
        Start exploring
      </button>
    </dialog>
  );
}
