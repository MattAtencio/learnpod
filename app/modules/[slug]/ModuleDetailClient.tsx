"use client";

import Link from "next/link";
import type { Module } from "@/lib/types";
import { DOMAIN_CONFIG } from "@/lib/types";
import { RingWithLabel } from "@/components/Ring";
import { useLearnStore, useStoreHydrated } from "@/lib/store";

interface Props {
  module: Module;
}

export function ModuleDetailClient({ module: mod }: Props) {
  const hydrated = useStoreHydrated();
  const getModuleProgress = useLearnStore((s) => s.getModuleProgress);
  const isCompletedRaw = useLearnStore((s) => s.isCompleted);
  const isCompleted = (slug: string) => hydrated && isCompletedRaw(slug);
  const chapterSlugs = mod.chapters.map((ch) => ch.slug);
  const { done, total, pct } = hydrated
    ? getModuleProgress(chapterSlugs)
    : { done: 0, total: chapterSlugs.length, pct: 0 };
  const domain = DOMAIN_CONFIG[mod.domain] || DOMAIN_CONFIG["Tools & Platforms"];
  const remainingXp = mod.chapters
    .filter((ch) => !isCompleted(ch.slug))
    .reduce((sum, ch) => sum + ch.xpReward, 0);
  const earnedXp = mod.chapters
    .filter((ch) => isCompleted(ch.slug))
    .reduce((sum, ch) => sum + ch.xpReward, 0);

  return (
    <div className="module-detail">
      <div className="nav-back fade-1">
        <Link href="/" className="back-btn">←</Link>
        <div className="nav-back-title">Active Modules</div>
        <div className="nav-badge" style={{ background: "rgba(110,168,254,0.12)", borderColor: "rgba(110,168,254,0.25)", color: "var(--blue)" }}>
          Module
        </div>
      </div>

      <div className="module-hero fade-2">
        <div className="module-hero-top">
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: domain.color, marginBottom: 6 }}>
              {domain.emoji} {mod.domain}
            </div>
            <div className="module-hero-title">{mod.title}</div>
          </div>
          <RingWithLabel pct={pct} color={domain.color} size={72} stroke={6} />
        </div>
        <div className="module-stats">
          <div className="m-stat">
            <div className="m-stat-val">{done}</div>
            <div className="m-stat-label">Done</div>
          </div>
          <div className="m-stat">
            <div className="m-stat-val">{total - done}</div>
            <div className="m-stat-label">Left</div>
          </div>
          <div className="m-stat">
            <div className="m-stat-val">{earnedXp}</div>
            <div className="m-stat-label">XP Earned</div>
          </div>
          <div className="m-stat">
            <div className="m-stat-val" style={{ color: "var(--green)" }}>+{remainingXp}</div>
            <div className="m-stat-label">Remaining</div>
          </div>
        </div>
      </div>

      {pct > 0 && pct < 1 && (
        <div className="xp-banner fade-3">
          <div className="xp-icon">🏆</div>
          <div className="xp-text">
            <div className="xp-title">On a roll — {Math.round(pct * 100)}% complete</div>
            <div className="xp-sub">Finish {total - done} more to earn the module badge</div>
          </div>
          <div className="xp-amount">{remainingXp}</div>
        </div>
      )}

      <div className="chapters fade-4">
        <div className="section-header" style={{ padding: "16px 0 10px" }}>
          <div className="section-title" style={{ fontSize: 16 }}>Chapters</div>
          <div className="section-link">{total} total</div>
        </div>
        {mod.chapters.map((ch, i) => {
          const chCompleted = isCompleted(ch.slug);
          // First non-completed chapter is "active"
          const isActive = !chCompleted && mod.chapters.slice(0, i).every((prev) => isCompleted(prev.slug));
          const isLocked = !chCompleted && !isActive;
          const state = chCompleted ? "completed" : isActive ? "active" : "locked";
          const href = ch.type === "pod" ? `/pods/${ch.slug}` : "#";

          return (
            <Link
              key={ch.slug + i}
              href={href}
              className={`chapter-item ${state} ${isLocked ? "chapter-locked" : ""}`}
              style={isLocked ? { pointerEvents: "none" } : undefined}
            >
              <div className={`chapter-icon ${chCompleted ? "icon-done" : isActive ? "icon-active" : "icon-locked"}`}>
                {chCompleted ? "✓" : isActive ? "▶" : "🔒"}
              </div>
              <div className="chapter-info">
                <div className="chapter-title">{ch.title}</div>
                <div className="chapter-meta">
                  <span className={`chapter-type-badge badge-${ch.type}`}>
                    {ch.type === "pod" ? "⚡ Pod" : ch.type === "lesson" ? "📖 Lesson" : "🗂 Module"}
                  </span>
                  <span>{ch.estimatedMinutes} min</span>
                </div>
              </div>
              <div className="chapter-right">
                {!isLocked
                  ? <span className="chapter-xp">+{ch.xpReward} XP</span>
                  : <span className="chapter-locked-icon">›</span>
                }
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
