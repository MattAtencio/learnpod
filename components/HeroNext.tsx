"use client";

import Link from "next/link";
import { useNavDirection } from "@/lib/nav-direction";
import type { QueueItem } from "@/lib/queue";
import type { HomeState } from "@/lib/store";

interface HeroCopy {
  headline: string;
  sub: string;
  ctaLabel: string;
  ctaTone: "amber" | "coral" | "green" | "teal";
}

function copyForState(state: HomeState, item: QueueItem | null, streakCount: number): HeroCopy {
  const podTitle = item?.pod.title ?? "";

  switch (state) {
    case "atRisk":
      return {
        headline: `Save your ${streakCount}-day streak.`,
        sub: "One pod. Two minutes. Done.",
        ctaLabel: "Save it now",
        ctaTone: "coral",
      };
    case "lapsed":
      return {
        headline: "Welcome back.",
        sub: podTitle ? `Ease back in with ${podTitle}.` : "Your notes are waiting.",
        ctaLabel: "Ease back in",
        ctaTone: "teal",
      };
    case "goalHit":
      return {
        headline: "You hit today's goal.",
        sub: "Bonus round — keep the streak hot.",
        ctaLabel: "One more",
        ctaTone: "green",
      };
    case "firstSession":
      return {
        headline: "Your first pod is ready.",
        sub: "Turn 2 minutes into a lifelong habit.",
        ctaLabel: "Start pod",
        ctaTone: "amber",
      };
    case "midstreak":
      return {
        headline: `Day ${streakCount} — keep going.`,
        sub: item ? reasonToSub(item) : "Pick up where you left off.",
        ctaLabel: "Continue",
        ctaTone: "amber",
      };
    case "active":
    default:
      return {
        headline: "Pick up where you left off.",
        sub: item ? reasonToSub(item) : "Today's pod is ready.",
        ctaLabel: "Continue",
        ctaTone: "amber",
      };
  }
}

function reasonToSub(item: QueueItem): string {
  switch (item.reason) {
    case "resume":
      return `Resume: ${item.pod.title}`;
    case "overdue":
      return `Overdue review: ${item.pod.title}`;
    case "due":
      return `Due for review: ${item.pod.title}`;
    case "continue-module":
      return item.reasonDetail ?? item.pod.title;
    case "weak-spot":
      return item.reasonDetail ?? `Shore up a weak spot: ${item.pod.title}`;
    case "new":
      return `New for you: ${item.pod.title}`;
    case "variety":
      return `Try something new: ${item.pod.title}`;
  }
}

const TONE_STYLES: Record<HeroCopy["ctaTone"], { bg: string; color: string; shadow: string }> = {
  amber: {
    bg: "linear-gradient(135deg, var(--amber), #e8950f)",
    color: "#13100d",
    shadow: "0 8px 24px rgba(245,166,35,0.4)",
  },
  coral: {
    bg: "linear-gradient(135deg, var(--coral), #e8533f)",
    color: "#fff",
    shadow: "0 8px 24px rgba(255,107,91,0.4)",
  },
  green: {
    bg: "linear-gradient(135deg, var(--green), #4ec77a)",
    color: "#13100d",
    shadow: "0 8px 24px rgba(93,214,140,0.35)",
  },
  teal: {
    bg: "linear-gradient(135deg, var(--teal), #2eb89a)",
    color: "#fff",
    shadow: "0 8px 24px rgba(62,207,178,0.35)",
  },
};

export function HeroNext({
  state,
  item,
  streakCount,
}: {
  state: HomeState;
  item: QueueItem | null;
  streakCount: number;
}) {
  const copy = copyForState(state, item, streakCount);
  const tone = TONE_STYLES[copy.ctaTone];
  const { setForward } = useNavDirection();

  return (
    <div className="hero-next" aria-labelledby="hero-headline">
      {item && (
        <div className="hero-reason" aria-hidden="true">
          {item.reasonLabel}
        </div>
      )}
      <h1 id="hero-headline" className="hero-headline">
        {copy.headline}
      </h1>
      <p className="hero-sub">{copy.sub}</p>
      {item ? (
        <Link
          href={`/pods/${item.pod.slug}`}
          onClick={setForward}
          className="hero-cta"
          style={{
            background: tone.bg,
            color: tone.color,
            boxShadow: tone.shadow,
          }}
        >
          {copy.ctaLabel} <span aria-hidden="true">▶</span>
        </Link>
      ) : (
        <Link href="/pods" onClick={setForward} className="hero-cta" style={{
          background: tone.bg, color: tone.color, boxShadow: tone.shadow,
        }}>
          Browse library <span aria-hidden="true">▶</span>
        </Link>
      )}
    </div>
  );
}
