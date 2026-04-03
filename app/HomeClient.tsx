"use client";

import Link from "next/link";
import type { Pod, Module } from "@/lib/types";
import { PodCard } from "@/components/PodCard";
import { ModuleCard } from "@/components/ModuleCard";
import { StreakBar } from "@/components/StreakBar";
import { Onboarding } from "@/components/Onboarding";
import { useLearnStore, useStoreHydrated } from "@/lib/store";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function HomeClient({ pods, modules }: { pods: Pod[]; modules: Module[] }) {
  const hydrated = useStoreHydrated();
  const getDueReviews = useLearnStore((s) => s.getDueReviews);
  const getReviewStatus = useLearnStore((s) => s.getReviewStatus);
  const onboardingComplete = useLearnStore((s) => s.onboardingComplete);
  const preferredDomains = useLearnStore((s) => s.preferredDomains);

  const dueReviewSlugs = hydrated ? getDueReviews() : [];
  const reviewPods = dueReviewSlugs
    .map((slug) => pods.find((p) => p.slug === slug))
    .filter((p): p is Pod => p !== undefined);

  // Sort pods: preferred domains first
  const sortedPods = hydrated && preferredDomains.length > 0
    ? [...pods].sort((a, b) => {
        const aPreferred = preferredDomains.includes(a.domain) ? 0 : 1;
        const bPreferred = preferredDomains.includes(b.domain) ? 0 : 1;
        return aPreferred - bPreferred;
      })
    : pods;

  if (hydrated && !onboardingComplete) {
    return <Onboarding pods={pods} />;
  }

  return (
    <div className="home">
      <div className="home-header fade-1">
        <div>
          <div className="greeting-sub">{getGreeting()}</div>
          <div className="greeting-main">Your Queue,<br />Matt.</div>
        </div>
        <div className="avatar">M</div>
      </div>

      <div className="fade-2">
        <StreakBar />
      </div>

      {hydrated && (
        <div className="fade-2" style={{ marginBottom: reviewPods.length > 0 ? 0 : undefined }}>
          {reviewPods.length > 0 ? (
            <>
              <div className="section-header">
                <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  Review Queue
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: "var(--coral)",
                    background: "rgba(255,107,91,0.12)", border: "1px solid rgba(255,107,91,0.2)",
                    borderRadius: 8, padding: "2px 8px",
                  }}>
                    {reviewPods.length}
                  </span>
                </div>
              </div>
              <div className="pods-scroll">
                {reviewPods.map((pod) => (
                  <PodCard
                    key={pod.slug}
                    pod={pod}
                    reviewStatus={getReviewStatus(pod.slug) === "overdue" ? "overdue" : "due"}
                  />
                ))}
              </div>
            </>
          ) : (
            <div style={{
              textAlign: "center", padding: "12px 20px", fontSize: 13,
              color: "var(--muted)", fontStyle: "italic",
            }}>
              All caught up! No reviews due.
            </div>
          )}
        </div>
      )}

      <div className="section-header fade-3">
        <div className="section-title">Today&apos;s Pods</div>
        <Link href="/pods" className="section-link" style={{ textDecoration: "none" }}>See all →</Link>
      </div>

      <div className="pods-scroll fade-3">
        {sortedPods.slice(0, 8).map((pod, i) => (
          <PodCard key={pod.slug} pod={pod} featured={i === 0} />
        ))}
      </div>

      {modules.length > 0 && (
        <>
          <div className="section-header fade-4">
            <div className="section-title">Active Modules</div>
            <Link href="/modules" className="section-link" style={{ textDecoration: "none" }}>See all →</Link>
          </div>
          <div className="fade-4">
            {modules.map((mod) => (
              <ModuleCard key={mod.slug} module={mod} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
