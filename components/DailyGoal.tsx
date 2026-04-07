"use client";

import { useState, useEffect } from "react";
import { useLearnStore, useStoreHydrated } from "@/lib/store";
import { Ring } from "@/components/Ring";

const GOALS = [45, 90, 135] as const;
const GOAL_LABELS: Record<number, string> = { 45: "Casual", 90: "Regular", 135: "Intense" };

export function DailyGoal() {
  const hydrated = useStoreHydrated();
  const dailyXpGoal = useLearnStore((s) => s.dailyXpGoal);
  const getTodayXp = useLearnStore((s) => s.getTodayXp);
  const setDailyXpGoal = useLearnStore((s) => s.setDailyXpGoal);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (!showPicker) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShowPicker(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPicker]);

  const todayXp = hydrated ? getTodayXp() : 0;
  const pct = Math.min(todayXp / dailyXpGoal, 1);
  const goalHit = todayXp >= dailyXpGoal;
  const exceeded = todayXp > dailyXpGoal;

  return (
    <>
      <div
        style={{
          margin: "0 20px 16px", padding: "14px 16px",
          background: goalHit ? "rgba(93,214,140,0.08)" : "var(--surface)",
          border: `1px solid ${goalHit ? "rgba(93,214,140,0.2)" : "var(--border)"}`,
          borderRadius: 18, display: "flex", alignItems: "center", gap: 14,
          cursor: "pointer", transition: "all 0.2s",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
        onClick={() => setShowPicker(true)}
      >
        <Ring
          pct={pct}
          color={goalHit ? "var(--green)" : "var(--amber)"}
          size={48}
          stroke={4}
        />
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 13, fontWeight: 600,
            color: goalHit ? "var(--green)" : "var(--text)",
          }}>
            {goalHit
              ? (exceeded ? "Bonus Round!" : "Daily Goal Hit!")
              : "Daily Goal"}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>
            {hydrated ? todayXp : 0} / {dailyXpGoal} XP today
          </div>
        </div>
        <div style={{
          fontSize: 12, fontWeight: 600,
          color: goalHit ? "var(--green)" : "var(--amber)",
          background: goalHit ? "rgba(93,214,140,0.12)" : "var(--amber-dim)",
          borderRadius: 10, padding: "4px 10px",
        }}>
          {GOAL_LABELS[dailyXpGoal]}
        </div>
      </div>

      {showPicker && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="goal-title"
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.6)", display: "flex",
            alignItems: "center", justifyContent: "center", padding: 20,
          }}
          onClick={() => setShowPicker(false)}
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
            <div id="goal-title" style={{
              fontFamily: "var(--font-fraunces), Fraunces, serif",
              fontSize: 18, fontWeight: 600, color: "var(--text)",
              textAlign: "center", marginBottom: 6,
            }}>
              Daily XP Goal
            </div>
            <div style={{
              fontSize: 12, color: "var(--muted)", textAlign: "center",
              marginBottom: 20, lineHeight: 1.5,
            }}>
              How much do you want to learn today?
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
              {GOALS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => { setDailyXpGoal(goal); setShowPicker(false); }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 16px", borderRadius: 14,
                    background: dailyXpGoal === goal ? "var(--amber-dim)" : "var(--surface2)",
                    border: dailyXpGoal === goal
                      ? "1px solid rgba(245,166,35,0.3)"
                      : "1px solid transparent",
                    cursor: "pointer", fontFamily: "Outfit, sans-serif",
                    transition: "all 0.2s",
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: 14, fontWeight: 600,
                      color: dailyXpGoal === goal ? "var(--amber)" : "var(--text)",
                    }}>
                      {goal} XP
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      {GOAL_LABELS[goal]} · ~{Math.ceil(goal / 45)} pod{goal > 45 ? "s" : ""}
                    </div>
                  </div>
                  {dailyXpGoal === goal && (
                    <div style={{ color: "var(--amber)", fontSize: 16 }}>&#x2713;</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
