"use client";

import Link from "next/link";
import type { Pod, Module } from "@/lib/types";
import { PodCard } from "@/components/PodCard";
import { ModuleCard } from "@/components/ModuleCard";
import { HeroNext } from "@/components/HeroNext";
import { TodayStrip } from "@/components/TodayStrip";
import { Onboarding } from "@/components/Onboarding";
import { useLearnStore, useStoreHydrated } from "@/lib/store";
import { useNavDirection } from "@/lib/nav-direction";
import { checkStreakReminder } from "@/lib/notifications";
import { getDailyQueue } from "@/lib/queue";
import { useEffect } from "react";

export function HomeClient({ pods, modules }: { pods: Pod[]; modules: Module[] }) {
  const hydrated = useStoreHydrated();
  const getDueReviews = useLearnStore((s) => s.getDueReviews);
  const getReviewStatus = useLearnStore((s) => s.getReviewStatus);
  const onboardingComplete = useLearnStore((s) => s.onboardingComplete);
  const preferredDomains = useLearnStore((s) => s.preferredDomains);
  const completedItems = useLearnStore((s) => s.completedItems);
  const lastStartedPodSlug = useLearnStore((s) => s.lastStartedPodSlug);
  const domainAccuracy = useLearnStore((s) => s.domainAccuracy);
  const getHomeState = useLearnStore((s) => s.getHomeState);
  const streak = useLearnStore((s) => s.streak);
  const checkFreezeReplenish = useLearnStore((s) => s.checkFreezeReplenish);
  const { setForward } = useNavDirection();

  useEffect(() => {
    if (hydrated && onboardingComplete) {
      checkStreakReminder(streak.count, streak.lastDate);
      checkFreezeReplenish();
    }
  }, [hydrated, onboardingComplete, streak.count, streak.lastDate, checkFreezeReplenish]);

  const dueReviewSlugs = hydrated ? getDueReviews() : [];
  const reviewPods = dueReviewSlugs
    .map((slug) => pods.find((p) => p.slug === slug))
    .filter((p): p is Pod => p !== undefined);

  if (hydrated && !onboardingComplete) {
    return <Onboarding pods={pods} />;
  }

  const homeState = hydrated ? getHomeState() : "active";

  const queue = hydrated
    ? getDailyQueue(
        {
          pods,
          modules,
          completedItems,
          preferredDomains,
          lastStartedPodSlug,
          getReviewStatus,
          domainAccuracy,
        },
        5
      )
    : [];

  const heroItem = queue[0] ?? null;
  const queueRest = queue.slice(1, 4); // Up to 3 cards under the hero

  // Active modules with progress > 0 and < 100%
  const activeModules = modules.filter((m) => {
    if (!hydrated) return false;
    const slugs = m.chapters.map((c) => c.slug);
    const done = slugs.filter((s) => completedItems.includes(s)).length;
    return done > 0 && done < slugs.length;
  });

  return (
    <div className="home">
      <div className="home-header fade-1">
        <div>
          <div className="greeting-sub">Today</div>
          <div className="brand-lockup">LearnPod · Bite-sized learning that compounds.</div>
        </div>
      </div>

      <div className="fade-2">
        <HeroNext state={homeState} item={heroItem} streakCount={streak.count || 0} />
      </div>

      <div className="fade-2">
        <TodayStrip reviewCount={reviewPods.length} />
      </div>

      {hydrated && reviewPods.length > 0 && (
        <div className="fade-3">
          <div className="section-header">
            <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              Review Queue
              <span
                aria-label={`${reviewPods.length} pods due for review`}
                style={{
                  fontSize: 11, fontWeight: 700, color: "var(--coral)",
                  background: "rgba(255,107,91,0.12)", border: "1px solid rgba(255,107,91,0.2)",
                  borderRadius: 8, padding: "2px 8px",
                }}
              >
                {reviewPods.length}
              </span>
            </div>
          </div>
          <div className="pods-scroll" role="region" aria-label="Review queue">
            {reviewPods.map((pod) => (
              <PodCard
                key={pod.slug}
                pod={pod}
                reviewStatus={getReviewStatus(pod.slug) === "overdue" ? "overdue" : "due"}
              />
            ))}
          </div>
        </div>
      )}

      {queueRest.length > 0 && (
        <>
          <div className="section-header fade-3">
            <div className="section-title">Up Next</div>
            <Link href="/pods" className="section-link" style={{ textDecoration: "none" }} onClick={setForward}>
              See all →
            </Link>
          </div>
          <div className="pods-scroll fade-3" role="region" aria-label="Up next">
            {queueRest.map((item) => {
              const status = getReviewStatus(item.pod.slug);
              const cardStatus = status === "mastered" || status === "learning" ? status : undefined;
              return <PodCard key={item.pod.slug} pod={item.pod} reviewStatus={cardStatus} />;
            })}
          </div>
        </>
      )}

      {activeModules.length > 0 && (
        <>
          <div className="section-header fade-4">
            <div className="section-title">Active Modules</div>
            <Link href="/modules" className="section-link" style={{ textDecoration: "none" }} onClick={setForward}>
              See all →
            </Link>
          </div>
          <div className="fade-4">
            {activeModules.map((mod) => (
              <ModuleCard key={mod.slug} module={mod} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
