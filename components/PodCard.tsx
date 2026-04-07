"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Pod } from "@/lib/types";
import { DOMAIN_CONFIG } from "@/lib/types";
import { useLearnStore, useStoreHydrated } from "@/lib/store";
import { useNavDirection } from "@/lib/nav-direction";

interface PodCardProps {
  pod: Pod;
  featured?: boolean;
  reviewStatus?: "due" | "overdue" | "mastered" | "learning";
}

export function PodCard({ pod, featured, reviewStatus }: PodCardProps) {
  const domain = DOMAIN_CONFIG[pod.domain] || DOMAIN_CONFIG["Tools & Platforms"];
  const hydrated = useStoreHydrated();
  const isCompleted = useLearnStore((s) => s.isCompleted);
  const completed = hydrated && isCompleted(pod.slug);
  const [showRedoPopup, setShowRedoPopup] = useState(false);
  const router = useRouter();
  const { setForward } = useNavDirection();

  useEffect(() => {
    if (!showRedoPopup) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShowRedoPopup(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showRedoPopup]);

  function handleClick(e: React.MouseEvent) {
    if (completed) {
      e.preventDefault();
      setShowRedoPopup(true);
    } else {
      setForward();
    }
  }

  return (
    <>
      <Link
        href={`/pods/${pod.slug}`}
        className={`pod-card ${featured ? "featured" : ""}`}
        onClick={handleClick}
        style={completed ? { opacity: 0.75 } : undefined}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span className={`pod-tag tag-${domain.tag}`}>{domain.emoji} {pod.domain}</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {reviewStatus && (
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
                color: reviewStatus === "overdue" ? "var(--coral)"
                  : reviewStatus === "mastered" ? "var(--green)"
                  : reviewStatus === "learning" ? "var(--blue)"
                  : "var(--amber)",
                background: reviewStatus === "overdue" ? "rgba(255,107,91,0.12)"
                  : reviewStatus === "mastered" ? "rgba(93,214,140,0.12)"
                  : reviewStatus === "learning" ? "rgba(110,168,254,0.12)"
                  : "rgba(245,166,35,0.12)",
                border: `1px solid ${
                  reviewStatus === "overdue" ? "rgba(255,107,91,0.25)"
                  : reviewStatus === "mastered" ? "rgba(93,214,140,0.25)"
                  : reviewStatus === "learning" ? "rgba(110,168,254,0.25)"
                  : "rgba(245,166,35,0.25)"}`,
                borderRadius: 6, padding: "2px 7px",
              }}>
                {reviewStatus === "overdue" ? "Overdue"
                  : reviewStatus === "mastered" ? "Mastered"
                  : reviewStatus === "learning" ? "Learning"
                  : "Review"}
              </div>
            )}
            {completed && (
              <div style={{
                width: 22, height: 22,
                borderRadius: 7,
                background: "rgba(93,214,140,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, color: "var(--green)",
              }}>✓</div>
            )}
          </div>
        </div>
        <div className="pod-title">{pod.title}</div>
        <div className="pod-meta">
          <div className="pod-duration">⏱ {pod.estimatedMinutes} min</div>
          <div className="pod-start-btn" style={completed ? { background: "var(--surface3)", boxShadow: "none" } : undefined}>
            {completed ? "↻" : "▶"}
          </div>
        </div>
      </Link>

      {/* Redo popup */}
      {showRedoPopup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="redo-title"
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setShowRedoPopup(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: 24,
              border: "1px solid var(--border)",
              padding: "28px 24px",
              maxWidth: 320,
              width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div aria-hidden="true" style={{
              fontSize: 28, textAlign: "center", marginBottom: 12,
            }}>✓</div>
            <div id="redo-title" style={{
              fontFamily: "var(--font-fraunces), Fraunces, serif",
              fontSize: 18, fontWeight: 600, color: "var(--text)",
              textAlign: "center", marginBottom: 6,
            }}>Already Completed</div>
            <div style={{
              fontSize: 13, color: "var(--muted)", textAlign: "center",
              marginBottom: 20, lineHeight: 1.5,
            }}>
              You&apos;ve earned +{pod.xpReward} XP for this pod. Want to review it again?
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowRedoPopup(false)}
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: 14,
                  background: "var(--surface2)", border: "1px solid var(--border)",
                  color: "var(--muted)", fontFamily: "Outfit, sans-serif",
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
              >
                Close
              </button>
              <button
                onClick={() => router.push(`/pods/${pod.slug}`)}
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: 14,
                  background: "linear-gradient(135deg, var(--amber), #e8950f)",
                  border: "none", color: "#13100d",
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(245,166,35,0.3)",
                }}
              >
                Redo Pod
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
