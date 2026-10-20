import { useStore } from '../lib/store';

/** Surfaces a storage save failure instead of silently losing progress. */
export default function SaveBanner() {
  const { storageOk } = useStore();
  if (storageOk) return null;
  return (
    <div className="save-warn" role="alert">
      ⚠ Progress couldn’t be saved on this device — it may be lost if you leave. Try finishing in one
      sitting, or open the site in a regular (non-private) browser window.
    </div>
  );
}
