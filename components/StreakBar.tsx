"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useLearnStore, useStoreHydrated } from "@/lib/store";

const MILESTONE_META: Record<number, { label: string; color: string; bg: string; emoji: string }> = {
  7:   { label: "Bronze",  color: "#cd7f32", bg: "rgba(205,127,50,0.12)",  emoji: "🥉" },
  30:  { label: "Silver",  color: "#c0c0c0", bg: "rgba(192,192,192,0.12)", emoji: "🥈" },
  100: { label: "Gold",    color: "#ffd700", bg: "rgba(255,215,0,0.12)",   emoji: "🥇" },
  365: { label: "Diamond", color: "#b9f2ff", bg: "rgba(185,242,255,0.12)", emoji: "💎" },
};

function getFlameSize(count: number): string {
  if (count >= 100) return "36px";
  if (count >= 30) return "32px";
  if (count >= 7) return "30px";
  return "28px";
}

function getFlameEmoji(count: number): string {
  if (count >= 365) return "💎";
  if (count >= 100) return "🔥";
  if (count >= 30) return "🔥";
  if (count >= 7) return "🔥";
  return "🔥";
}

export function StreakBar() {
  const hydrated = useStoreHydrated();
  const streak = useLearnStore((s) => s.streak);
  const xp = useLearnStore((s) => s.xp);
  const streakFreezes = useLearnStore((s) => s.streakFreezes);
  const isStreakAtRisk = useLearnStore((s) => s.isStreakAtRisk);
  const getStreakMilestone = useLearnStore((s) => s.getStreakMilestone);
  const checkFreezeReplenish = useLearnStore((s) => s.checkFreezeReplenish);
  const canRepairStreak = useLearnStore((s) => s.canRepairStreak);
  const repairStreak = useLearnStore((s) => s.repairStreak);

  const [xpBump, setXpBump] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showRepair, setShowRepair] = useState(false);
  const prevXp = useRef(xp);
  const prevStreak = useRef(streak.count);

  useEffect(() => {
    if (hydrated) checkFreezeReplenish();
  }, [hydrated, checkFreezeReplenish]);

  useEffect(() => {
    if (hydrated && xp !== prevXp.current && prevXp.current !== undefined) {
      setXpBump(true);
      const t = setTimeout(() => setXpBump(false), 300);
      prevXp.current = xp;
      return () => clearTimeout(t);
    }
    prevXp.current = xp;
  }, [hydrated, xp]);

  // Show milestone celebration when streak hits a milestone
  useEffect(() => {
    if (!hydrated) return;
    const milestone = getStreakMilestone();
    if (milestone && streak.count !== prevStreak.current) {
      setShowMilestone(true);
      const t = setTimeout(() => setShowMilestone(false), 4000);
      prevStreak.current = streak.count;
      return () => clearTimeout(t);
    }
    prevStreak.current = streak.count;
  }, [hydrated, streak.count, getStreakMilestone]);

  // ESC key closes whichever modal is open
  const closeModals = useCallback(() => {
    setShowMilestone(false);
    setShowRepair(false);
  }, []);
  useEffect(() => {
    if (!showMilestone && !showRepair) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModals(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showMilestone, showRepair, closeModals]);

  const atRisk = hydrated && isStreakAtRisk();
  const milestone = hydrated ? getStreakMilestone() : null;
  const milestoneData = milestone ? MILESTONE_META[milestone] : null;
  const canRepair = hydrated && canRepairStreak();
  const count = hydrated ? (streak.count || 0) : 0;

  return (
    <>
      <div
        className="streak-bar"
        role="status"
        aria-label={`${count} day streak, ${hydrated ? xp.toLocaleString() : "0"} XP`}
        style={atRisk ? {
          border: "2px solid var(--amber)",
          animation: "streak-pulse 2s ease-in-out infinite",
        } : undefined}
      >
        <div
          className={`streak-flame${count > 0 ? " flame-pulse" : ""}`}
          aria-hidden="true"
          style={{ fontSize: getFlameSize(count) }}
        >
          {getFlameEmoji(count)}
        </div>
        <div className="streak-info">
          <div className="streak-count" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {count}
            {hydrated && streakFreezes > 0 && (
              <span title="Streak freeze available" style={{ fontSize: "0.7em", opacity: 0.8 }}>🛡️</span>
            )}
            {milestoneData && (
              <span
                title={`${milestone}-day milestone!`}
                style={{
                  fontSize: "0.65em",
                  background: milestoneData.bg,
                  color: milestoneData.color,
                  borderRadius: "6px",
                  padding: "1px 5px",
                  fontWeight: 700,
                  border: `1px solid ${milestoneData.color}33`,
                }}
              >
                {milestoneData.emoji} {milestoneData.label}
              </span>
            )}
          </div>
          <div className="streak-label">
            {atRisk && canRepair
              ? <span>
                  Streak broken —{" "}
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowRepair(true); }}
                    style={{
                      background: "none", border: "none", color: "var(--amber)",
                      fontWeight: 600, cursor: "pointer", fontSize: 11,
                      textDecoration: "underline", padding: 0,
                      fontFamily: "Outfit, sans-serif",
                    }}
                  >
                    Repair?
                  </button>
                </span>
              : atRisk
                ? "At risk — complete a pod today!"
                : `day streak${count > 0 ? " · keep it up" : ""}`}
          </div>
        </div>
        <div className={`xp-pill${xpBump ? " xp-bump" : ""}`}>{hydrated ? xp.toLocaleString() : "0"} XP</div>
      </div>

      {/* Milestone celebration overlay */}
      {showMilestone && milestoneData && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="milestone-title"
          style={{
            position: "fixed", inset: 0, zIndex: 250,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20, animation: "fadeUp 0.35s ease forwards",
          }}
          onClick={() => setShowMilestone(false)}
        >
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "var(--surface)", borderRadius: 28,
            border: `1px solid ${milestoneData.color}44`,
            padding: "36px 28px 28px", maxWidth: 320, width: "100%",
            boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 60px ${milestoneData.color}22`,
            textAlign: "center" as const,
          }}>
            <div aria-hidden="true" style={{ fontSize: 56, lineHeight: 1, marginBottom: 16 }}>
              {milestoneData.emoji}
            </div>
            <div id="milestone-title" style={{
              fontFamily: "var(--font-fraunces), Fraunces, serif",
              fontSize: 24, fontWeight: 600, color: milestoneData.color, marginBottom: 6,
            }}>
              {milestone}-Day {milestoneData.label}!
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20, lineHeight: 1.5 }}>
              Incredible commitment — you&apos;ve kept your streak alive for {milestone} days.
            </div>
            <button
              onClick={() => setShowMilestone(false)}
              style={{
                width: "100%", padding: "14px", borderRadius: 16,
                background: milestoneData.bg,
                border: `1px solid ${milestoneData.color}44`,
                color: milestoneData.color, fontFamily: "Outfit, sans-serif",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}
            >
              Keep Going!
            </button>
          </div>
        </div>
      )}

      {/* Streak repair modal */}
      {showRepair && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="repair-title"
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.6)", display: "flex",
            alignItems: "center", justifyContent: "center", padding: 20,
          }}
          onClick={() => setShowRepair(false)}
        >
          <div
            style={{
              background: "var(--surface)", borderRadius: 24,
              border: "1px solid var(--border)", padding: "28px 24px",
              maxWidth: 320, width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div aria-hidden="true" style={{ fontSize: 40, textAlign: "center", marginBottom: 12 }}>🔧</div>
            <div id="repair-title" style={{
              fontFamily: "var(--font-fraunces), Fraunces, serif",
              fontSize: 18, fontWeight: 600, color: "var(--text)",
              textAlign: "center", marginBottom: 6,
            }}>
              Repair Your Streak?
            </div>
            <div style={{
              fontSize: 12, color: "var(--muted)", textAlign: "center",
              marginBottom: 20, lineHeight: 1.5,
            }}>
              Complete 1 pod today to restore your {count}-day streak. This can only be used once per day.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowRepair(false)}
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: 14,
                  background: "var(--surface2)", border: "1px solid var(--border)",
                  color: "var(--muted)", fontFamily: "Outfit, sans-serif",
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => { repairStreak(); setShowRepair(false); }}
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: 14,
                  background: "linear-gradient(135deg, var(--amber), #e8950f)",
                  border: "none", color: "#13100d",
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(245,166,35,0.3)",
                }}
              >
                Repair Streak
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
