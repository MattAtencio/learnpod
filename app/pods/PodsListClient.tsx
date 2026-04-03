"use client";

import Link from "next/link";
import type { Pod, Domain } from "@/lib/types";
import { DOMAIN_CONFIG } from "@/lib/types";
import { useLearnStore, useStoreHydrated } from "@/lib/store";
import { useState } from "react";

export function PodsListClient({ pods }: { pods: Pod[] }) {
  const hydrated = useStoreHydrated();
  const isCompletedRaw = useLearnStore((s) => s.isCompleted);
  const isCompleted = (slug: string) => hydrated && isCompletedRaw(slug);
  const [filter, setFilter] = useState<Domain | "all">("all");

  const filtered = filter === "all" ? pods : pods.filter((p) => p.domain === filter);
  const domains = [...new Set(pods.map((p) => p.domain))] as Domain[];

  return (
    <div style={{ padding: "0 0 12px" }}>
      <div className="nav-back fade-1">
        <Link href="/" className="back-btn">←</Link>
        <div className="nav-back-title">All Pods</div>
        <div className="nav-badge">{pods.length}</div>
      </div>

      <div style={{ display: "flex", gap: 8, padding: "12px 20px", overflowX: "auto", scrollbarWidth: "none" }}>
        <button
          onClick={() => setFilter("all")}
          className={`pod-tag ${filter === "all" ? "tag-ai" : ""}`}
          style={{ cursor: "pointer", border: "none", background: filter === "all" ? undefined : "var(--surface2)", color: filter === "all" ? undefined : "var(--muted)" }}
        >
          All
        </button>
        {domains.map((d) => {
          const dc = DOMAIN_CONFIG[d];
          return (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`pod-tag tag-${dc.tag}`}
              style={{ cursor: "pointer", border: "none", opacity: filter === d ? 1 : 0.5 }}
            >
              {dc.emoji} {d}
            </button>
          );
        })}
      </div>

      <div className="fade-2" style={{ padding: "0 20px" }}>
        {filtered.map((pod) => {
          const domain = DOMAIN_CONFIG[pod.domain] || DOMAIN_CONFIG["Tools & Platforms"];
          const done = isCompleted(pod.slug);
          return (
            <Link key={pod.slug} href={`/pods/${pod.slug}`} className={`chapter-item ${done ? "completed" : ""}`} style={{ marginBottom: 8 }}>
              <div className={`chapter-icon ${done ? "icon-done" : "icon-active"}`}>
                {done ? "✓" : "⚡"}
              </div>
              <div className="chapter-info">
                <div className="chapter-title">{pod.title}</div>
                <div className="chapter-meta">
                  <span className={`chapter-type-badge badge-pod`}>{domain.emoji} {pod.domain}</span>
                  <span>{pod.estimatedMinutes} min</span>
                </div>
              </div>
              <div className="chapter-right">
                <span className="chapter-xp">+{pod.xpReward} XP</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
