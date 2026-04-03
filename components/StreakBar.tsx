"use client";

import { useLearnStore, useStoreHydrated } from "@/lib/store";

export function StreakBar() {
  const hydrated = useStoreHydrated();
  const streak = useLearnStore((s) => s.streak);
  const xp = useLearnStore((s) => s.xp);

  return (
    <div className="streak-bar">
      <div className="streak-flame">🔥</div>
      <div className="streak-info">
        <div className="streak-count">{hydrated ? (streak.count || 0) : 0}</div>
        <div className="streak-label">day streak{streak.count > 0 ? " · keep it up" : ""}</div>
      </div>
      <div className="xp-pill">{hydrated ? xp.toLocaleString() : "0"} XP</div>
    </div>
  );
}
