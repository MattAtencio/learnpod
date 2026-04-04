"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Pod, Domain } from "@/lib/types";
import { DOMAIN_CONFIG } from "@/lib/types";
import { useLearnStore } from "@/lib/store";
import { requestNotificationPermission } from "@/lib/notifications";

const ONBOARDING_DOMAINS: Domain[] = [
  "AI Engineering",
  "AI for Everyone",
  "Quant & Trading",
  "Financial Models",
  "Tools & Platforms",
  "ML Models",
  "DevOps",
];

interface Props {
  pods: Pod[];
}

export function Onboarding({ pods }: Props) {
  const [screen, setScreen] = useState(0);
  const [selectedDomains, setSelectedDomains] = useState<Domain[]>([]);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const completeOnboarding = useLearnStore((s) => s.completeOnboarding);
  const router = useRouter();

  function goForward() {
    setDirection("forward");
    setScreen((s) => s + 1);
  }

  function toggleDomain(domain: Domain) {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  }

  const previewPod = pods.find((p) => selectedDomains.includes(p.domain)) || pods[0];

  function handleStart() {
    completeOnboarding(selectedDomains);
    // Request notification permission (non-blocking)
    requestNotificationPermission();
    if (previewPod) {
      router.push(`/pods/${previewPod.slug}`);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "#13100d",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Progress dots */}
      <div style={{
        display: "flex", gap: 8, justifyContent: "center",
        padding: "60px 20px 20px",
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: i === screen ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === screen ? "var(--amber)" : i < screen ? "rgba(245,166,35,0.4)" : "var(--surface2)",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>

      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 28px 40px",
        animation: `onboardSlideIn 300ms ease`,
      }}>
        <style>{`
          @keyframes onboardSlideIn {
            from { opacity: 0; transform: translateX(${direction === "forward" ? "30px" : "-30px"}); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>

        {screen === 0 && (
          <div key="welcome" style={{ textAlign: "center" }}>
            <div style={{
              fontSize: 64, lineHeight: 1, marginBottom: 24,
            }}>
              🧠
            </div>
            <div style={{
              fontFamily: "var(--font-fraunces), Fraunces, serif",
              fontSize: 32, fontWeight: 600, color: "var(--text)",
              lineHeight: 1.2, marginBottom: 12,
            }}>
              Welcome to<br />LearnPod
            </div>
            <div style={{
              fontSize: 15, color: "var(--muted)", lineHeight: 1.6,
              maxWidth: 300, margin: "0 auto 40px",
            }}>
              Bite-sized learning from your knowledge vault. 2 minutes a day builds expertise.
            </div>
            <button
              onClick={goForward}
              style={{
                width: "100%", maxWidth: 320, padding: "16px",
                borderRadius: 16,
                background: "linear-gradient(135deg, var(--amber), #e8950f)",
                border: "none", color: "#13100d",
                fontFamily: "Outfit, sans-serif",
                fontSize: 16, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 8px 24px rgba(245,166,35,0.35)",
                letterSpacing: "0.02em",
              }}
            >
              Get Started →
            </button>
          </div>
        )}

        {screen === 1 && (
          <div key="domains">
            <div style={{
              fontFamily: "var(--font-fraunces), Fraunces, serif",
              fontSize: 26, fontWeight: 600, color: "var(--text)",
              textAlign: "center", marginBottom: 6,
            }}>
              What interests you?
            </div>
            <div style={{
              fontSize: 14, color: "var(--muted)", textAlign: "center",
              marginBottom: 28,
            }}>
              Pick the topics you want to explore
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 12, marginBottom: 32,
            }}>
              {ONBOARDING_DOMAINS.map((domain) => {
                const config = DOMAIN_CONFIG[domain];
                const selected = selectedDomains.includes(domain);
                return (
                  <button
                    key={domain}
                    onClick={() => toggleDomain(domain)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "14px 16px", borderRadius: 14,
                      background: selected ? "rgba(245,166,35,0.1)" : "var(--surface)",
                      border: selected
                        ? "2px solid var(--amber)"
                        : "2px solid var(--border)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{config.emoji}</span>
                    <span style={{
                      fontSize: 13, fontWeight: 600,
                      color: selected ? "var(--amber)" : "var(--text)",
                      fontFamily: "Outfit, sans-serif",
                    }}>
                      {domain}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={goForward}
              disabled={selectedDomains.length === 0}
              style={{
                width: "100%", padding: "16px", borderRadius: 16,
                background: selectedDomains.length > 0
                  ? "linear-gradient(135deg, var(--amber), #e8950f)"
                  : "var(--surface2)",
                border: "none",
                color: selectedDomains.length > 0 ? "#13100d" : "var(--muted)",
                fontFamily: "Outfit, sans-serif",
                fontSize: 16, fontWeight: 700,
                cursor: selectedDomains.length > 0 ? "pointer" : "default",
                boxShadow: selectedDomains.length > 0 ? "0 8px 24px rgba(245,166,35,0.35)" : "none",
                transition: "all 0.2s",
                letterSpacing: "0.02em",
              }}
            >
              Continue →
            </button>
          </div>
        )}

        {screen === 2 && (
          <div key="ready" style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "var(--font-fraunces), Fraunces, serif",
              fontSize: 26, fontWeight: 600, color: "var(--text)",
              marginBottom: 6,
            }}>
              Your first pod is ready
            </div>
            <div style={{
              fontSize: 14, color: "var(--muted)", marginBottom: 28,
            }}>
              Complete your first pod to start your streak!
            </div>

            {previewPod && (
              <div style={{
                background: "var(--surface)",
                borderRadius: 20,
                border: "1px solid rgba(245,166,35,0.2)",
                padding: "24px 20px",
                marginBottom: 32,
                textAlign: "left",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}>
                <span
                  style={{
                    fontSize: 11, fontWeight: 700,
                    color: DOMAIN_CONFIG[previewPod.domain]?.color || "var(--amber)",
                    background: "rgba(245,166,35,0.1)",
                    borderRadius: 6, padding: "3px 8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {DOMAIN_CONFIG[previewPod.domain]?.emoji} {previewPod.domain}
                </span>
                <div style={{
                  fontFamily: "var(--font-fraunces), Fraunces, serif",
                  fontSize: 20, fontWeight: 600, color: "var(--text)",
                  marginTop: 12, lineHeight: 1.3,
                }}>
                  {previewPod.title}
                </div>
                <div style={{
                  fontSize: 13, color: "var(--muted)", marginTop: 8,
                  display: "flex", gap: 12,
                }}>
                  <span>{previewPod.estimatedMinutes} min</span>
                  <span>+{previewPod.xpReward} XP</span>
                </div>
              </div>
            )}

            <button
              onClick={handleStart}
              style={{
                width: "100%", padding: "16px", borderRadius: 16,
                background: "linear-gradient(135deg, var(--amber), #e8950f)",
                border: "none", color: "#13100d",
                fontFamily: "Outfit, sans-serif",
                fontSize: 16, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 8px 24px rgba(245,166,35,0.35)",
                letterSpacing: "0.02em",
              }}
            >
              Start Learning →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
