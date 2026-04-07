# LearnPod Home Redesign — Implementation Plan

**Created:** 2026-04-06 · **Execute:** 2026-04-07
**Source reviews:** vp-design, vp-education, vp-engagement, product, vp-marketing (all in `docs/reviews/`)

## North Star
Collapse the home into a **single state-aware Next Best Action hero**, demote everything else. One screen, one decision.

## Phase 1 — Ship Tomorrow (target: ~5 hrs, closes all P0s)

### 1. Hero Continue Card (`components/HeroNext.tsx`) — ~90 min
State-aware, picks ONE pod, ONE CTA, 4× visual weight of anything else.
- Priority: in-progress pod → overdue review → due review → next-in-module → new pick
- States: new user / mid-streak / goal-hit / lapsed (3+ days) / at-risk
- Copy table per state; "because…" reason subhead
- Replaces top half of `HomeClient.tsx`

### 2. Real Daily Queue (`lib/queue.ts`) — ~60 min
`getDailyQueue()` replacing `sortedPods.slice(0, 8)`:
```
overdue reviews → due reviews → continue-module → weak-spot (low domainAccuracy) → new
```
Stable per-day seed so it doesn't reshuffle on refresh. Limit surfaced to 3.

### 3. Collapsed Stats Strip — ~45 min
Merge `StreakBar` + `DailyGoal` into one "Today" row: streak flame · goal ring · review count badge. Saves ~80px above fold. Hide entirely when goal hit + no reviews.

### 4. State-aware Home Branching — ~45 min
`HomeClient.tsx` reads `getHomeState()` → `new | active | midstreak | goalHit | lapsed | atRisk` and conditionally renders sections. Drop hardcoded "Matt".

### 5. Streak Repair Bug Fix — ~15 min
`lib/store.ts:238` `repairStreak()` — gate behind `pendingStreakRepair` flag, only complete after 2 pods done today.

### 6. A11y batch — ~45 min
- `prefers-reduced-motion` guard on infinite keyframes
- Focus trap + Escape on PodCard redo modal + StreakBar milestone modal
- `aria-hidden` on decorative emoji
- `.pod-start-btn` 30→44px tap target
- `role="region"` + label on `pods-scroll`

## Phase 2 — This Week (after Phase 1 ships)

### 7. Streak Share Card — ~half day
Milestone modal gets "Share" button → html-to-image 1080×1350 PNG export. Closes Engagement viral gap + Marketing shareable gap in one stroke.

### 8. Brand Spec Reconciliation — ~2 hrs
Update `~/.claude/docs/learnpod-brand-system.md` to match shipped `globals.css` (warm amber/Fraunces wins).

### 9. Pod OG Images — ~2 hrs
`@vercel/og` route for `/pods/[slug]` — auto-generated share images using brand tokens.

### 10. `/today` Public Page — ~1 day
External landing target for marketing posts. Anonymous-safe (no PII), shows pod-of-the-day + positioning line.

## Phase 3 — Backlog (separate sessions)

- Author `objectives` for all 66 pods (Education P0)
- Rewrite quiz generator — kill regex garbage (Education P0)
- Prerequisite graph / skill tree (Education)
- Web push notifications (Engagement)
- XP levels + economy (Engagement)
- Whiteboard Wednesdays content series kickoff (Marketing)

## Files to Touch (Phase 1)
- `app/HomeClient.tsx` — main rewrite
- `components/HeroNext.tsx` — NEW
- `lib/queue.ts` — NEW
- `lib/store.ts` — repair bug + getHomeState helper
- `components/StreakBar.tsx` + `DailyGoal.tsx` — collapse into strip OR new `TodayStrip.tsx`
- `components/PodCard.tsx` — modal a11y, tap target
- `app/globals.css` — `--muted-strong` token, reduced-motion guards

## Success Criteria
- Above-fold has ONE primary CTA, 4× visual weight
- New / lapsed / mid-streak / goal-hit users see meaningfully different homes
- "Today's Pods" reflects real queue logic, max 3 cards
- All P0s from product review closed
- Lighthouse a11y ≥ 95
