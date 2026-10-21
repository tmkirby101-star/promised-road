# Review status ledger

Implementation-truth for the external review backlog, keyed by **stable item IDs**
(R1–R6, D1–D4, T1–T8). The prose review document is regenerated elsewhere and will
drift; this ledger is the source of truth for *what has actually been built and
verified*, mapped by ID so it stays valid across rewrites.

Per item: **status · commit · what changed · how it was checked.**
Status values: `FIXED` (implemented + verified), `PARTIAL`, `OPEN`, `WONTFIX`, `TEST`.

_Last updated: 2026-10-21._

## Reliability & honest entry (P1)

### R1 — Arcade could claim a failed save succeeded — `FIXED` (2026-10-21)
- **Commit:** _(this change)_
- **What changed:** Added an in-memory mirror in `arcadeStore.ts` so a blocked/full
  `localStorage` keeps results for the session instead of silently reverting to a
  stale on-disk copy. Every mutation now reports whether the durable write
  succeeded: `recordPersonal` and `addToBoard` return a `persisted` flag;
  `updateMisses` returns a boolean. `addToBoard` is idempotent per `runId` (a retry
  replaces that run's board entry rather than duplicating). The Finish screen shows
  "This device isn't saving right now…" when personal progress didn't persist, turns
  the board **Save** button into **Try again** on failure, and only prints "Saved to
  the Wall of Fame" after a successful durable write.
- **Verified:** Headless run with `Storage.prototype.setItem` throwing — finish screen
  shows the warning, Save shows "Not saved on this device", and no false "Saved"
  message appears. Idempotent retry confirmed by `runId` de-dupe in `addToBoard`.
- **Acceptance remaining:** independent quota-vs-blocked simulation for personal best
  and misses specifically (currently covered together via the shared storage path).

### R2 — Landing prioritized placeholder account forms — `FIXED` (2026-10-21)
- **Commit:** _(this change)_
- **What changed:** `EntryPanel.tsx` now leads with a primary **Try the demo →**
  action and a plain statement of the real save model ("this device and browser
  only — family accounts and syncing across devices come later"). The parent/explorer
  account forms are collapsed behind an explicit **Preview the account screens**
  toggle, labeled "Preview only — these screens don't work yet." No credential field
  is shown before that label. The masthead "Sign in" affordance opens the labeled
  preview rather than a dead form.
- **Verified:** Headless — demo CTA present, no `#email` field before preview, preview
  reveals the labeled forms, and the demo path reaches "Choose your explorer" with no
  personal details entered.
- **Follow-up (minor):** masthead button still reads "Sign in"; it now routes to the
  labeled preview, but could be relabeled "Early access" for extra clarity.

### R3 — In-progress arcade rounds easy to abandon — `OPEN` (P1, batch 2)
Rail navigation unmounts a live round with no confirm/resume; reload loses it. Decide
confirm-discard vs. checkpoint-resume (resume must not regain first-try status or reset
the clock). Pairs with R6.

## Navigation & accessibility (P2)

### R4 — Explorer-menu keyboard behavior (AppRail) — `OPEN` (P2)
No Escape handling / focus placement+restoration on the profile menu. Treat as a
disclosure: focus on open, Escape to close, return focus to trigger.

### R5 — Programmatic labels for writing & initials fields — `OPEN` (P2)
`Write.tsx` textarea and the Wall-of-Fame initials input rely on nearby text/placeholder
rather than an associated label. Keep the existing gratitude-field label pattern.

### R6 — URL/history routing & page-change focus — `OPEN` (P2, with R3)
Major destinations are component state with no history/URL mapping; no focus move to a
heading on view change. Largest architectural item — do not fold into the reliability
batch.

## Design suggestions

- **D1** (short welcome; teach nav in context) — `OPEN` P2. Keep the 3-screen welcome.
- **D2** (response pacing after a child test) — `OPEN` P2. Change one chapter pattern first.
- **D3** (surface personal bests more directly) — `OPEN` P2. Add "Your recent bests"; reuse existing store.
- **D4** (grow Books/Passport from real content) — `OPEN` P3. Keep chapter vs. book stamps distinct.

## Tests still needed (not claimed passed)

- **T1** full learner flow · **T2** Chromebook/tablet/small-viewport · **T3** cold-cache/slow-network/blocked-image ·
  **T4** persistence & recovery matrix · **T5** arcade end-to-end correctness · **T6** a11y & narration ·
  **T7** independent first-grade session · **T8** future accounts & security.
- Note: T5 partially exercised in headless smoke (play-through of all three games), but
  not the full matrix (every scope/length/timed path, exact canonical order, board rules).

## Preserve (do not regress)

Navy/gold/paper identity and painted art; the full illustrated book; slim persistent rail
with text labels; chapter stages inside the lesson; shortened first-grade welcome with large
portrait + read-aloud + skip; honest coming-soon labels and the explicit fresh-demo option;
one main writing response (picture choice, example, edit, optional gratitude); Scripture
visually distinct from retelling; **separation of lesson evidence from arcade records**;
supported completion counts; all arcade games/scopes open regardless of age; optional timing;
first-try-correct clean-run speed eligibility; child-controlled Next, misses review, practice
rounds, achievements, personal bests.
