"use client";

import { useEffect } from "react";
import { useLearnStore, useStoreHydrated } from "@/lib/store";

export function StreakBar() {
  const hydrated = useStoreHydrated();
  const streak = useLearnStore((s) => s.streak);
  const xp = useLearnStore((s) => s.xp);
  const streakFreezes = useLearnStore((s) => s.streakFreezes);
  const isStreakAtRisk = useLearnStore((s) => s.isStreakAtRisk);
  const getStreakMilestone = useLearnStore((s) => s.getStreakMilestone);
  const checkFreezeReplenish = useLearnStore((s) => s.checkFreezeReplenish);

  useEffect(() => {
    if (hydrated) checkFreezeReplenish();
  }, [hydrated, checkFreezeReplenish]);

  const atRisk = hydrated && isStreakAtRisk();
  const milestone = hydrated ? getStreakMilestone() : null;

  return (
    <div
      className="streak-bar"
      role="status"
      aria-label={`${hydrated ? (streak.count || 0) : 0} day streak, ${hydrated ? xp.toLocaleString() : "0"} XP`}
      style={atRisk ? {
        border: "2px solid var(--amber)",
        animation: "streak-pulse 2s ease-in-out infinite",
      } : undefined}
    >
      <style>{`
        @keyframes streak-pulse {
          0%, 100% { border-color: var(--amber); }
          50% { border-color: transparent; }
        }
      `}</style>
      <div className="streak-flame">🔥</div>
      <div className="streak-info">
        <div className="streak-count" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {hydrated ? (streak.count || 0) : 0}
          {hydrated && streakFreezes > 0 && (
            <span title="Streak freeze available" style={{ fontSize: "0.7em", opacity: 0.8 }}>🛡️</span>
          )}
          {milestone && (
            <span
              title={`${milestone}-day milestone!`}
              style={{
                fontSize: "0.65em",
                background: "var(--amber)",
                color: "var(--surface)",
                borderRadius: "6px",
                padding: "1px 5px",
                fontWeight: 700,
              }}
            >
              {milestone}d
            </span>
          )}
        </div>
        <div className="streak-label">
          {atRisk
            ? "At risk — complete a pod today!"
            : `day streak${streak.count > 0 ? " · keep it up" : ""}`}
        </div>
      </div>
      <div className="xp-pill">{hydrated ? xp.toLocaleString() : "0"} XP</div>
    </div>
  );
}
