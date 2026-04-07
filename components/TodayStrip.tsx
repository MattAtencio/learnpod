"use client";

import { useLearnStore, useStoreHydrated } from "@/lib/store";
import { Ring } from "@/components/Ring";
import { StreakBar } from "@/components/StreakBar";
import { DailyGoal } from "@/components/DailyGoal";

/**
 * Compact "Today" row — flame · ring · review badge.
 *
 * The full StreakBar + DailyGoal are mounted inside a collapsed <details>
 * so their useEffects (freeze replenish, milestone celebration overlay,
 * goal picker, streak repair modal) remain accessible without dominating
 * the home above-the-fold.
 *
 * Hidden entirely when goal hit AND no reviews due (per design plan #3).
 */
export function TodayStrip({ reviewCount }: { reviewCount: number }) {
  const hydrated = useStoreHydrated();
  const streak = useLearnStore((s) => s.streak);
  const dailyXpGoal = useLearnStore((s) => s.dailyXpGoal);
  const getTodayXp = useLearnStore((s) => s.getTodayXp);
  const isStreakAtRisk = useLearnStore((s) => s.isStreakAtRisk);

  const todayXp = hydrated ? getTodayXp() : 0;
  const pct = Math.min(todayXp / dailyXpGoal, 1);
  const goalHit = todayXp >= dailyXpGoal;
  const atRisk = hydrated && isStreakAtRisk();
  const count = hydrated ? streak.count || 0 : 0;

  // Hide when goal hit + no reviews due (and not at risk)
  const hideStrip = goalHit && reviewCount === 0 && !atRisk;

  return (
    <details className="today-details">
      {!hideStrip && (
        <summary className="today-strip" aria-label={`Today: ${count} day streak, ${todayXp} of ${dailyXpGoal} XP, ${reviewCount} reviews`}>
          <span className="today-stat">
            <span className="today-flame" aria-hidden="true">🔥</span>
            <span className="today-num">{count}</span>
            <span className="today-lbl">day{count === 1 ? "" : "s"}</span>
          </span>
          <span className="today-divider" aria-hidden="true" />
          <span className="today-stat">
            <Ring pct={pct} color={goalHit ? "var(--green)" : "var(--amber)"} size={28} stroke={3} />
            <span className="today-num" style={{ color: goalHit ? "var(--green)" : undefined }}>
              {todayXp}
            </span>
            <span className="today-lbl">/ {dailyXpGoal} XP</span>
          </span>
          {reviewCount > 0 && (
            <>
              <span className="today-divider" aria-hidden="true" />
              <span className="today-stat">
                <span className="today-num" style={{ color: "var(--coral)" }}>{reviewCount}</span>
                <span className="today-lbl">{reviewCount === 1 ? "review" : "reviews"}</span>
              </span>
            </>
          )}
          {atRisk && (
            <>
              <span className="today-divider" aria-hidden="true" />
              <span className="today-stat" style={{ color: "var(--amber)" }}>
                <span className="today-lbl" style={{ color: "var(--amber)", textTransform: "none" }}>
                  At risk
                </span>
              </span>
            </>
          )}
          <span className="today-expand" aria-hidden="true">▾</span>
        </summary>
      )}
      <div className="today-expanded">
        <StreakBar />
        <DailyGoal />
      </div>
    </details>
  );
}
