"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Pod, Lesson, Module, Domain } from "@/lib/types";
import { DOMAIN_CONFIG } from "@/lib/types";
import { useLearnStore, useStoreHydrated } from "@/lib/store";

type ContentItem = {
  slug: string;
  title: string;
  domain: Domain;
  type: "pod" | "lesson" | "module";
  estimatedMinutes: number;
  xpReward: number;
  searchText: string;
};

function buildItems(pods: Pod[], lessons: Lesson[], modules: Module[]): ContentItem[] {
  const items: ContentItem[] = [];
  for (const p of pods) {
    items.push({
      slug: p.slug, title: p.title, domain: p.domain, type: "pod",
      estimatedMinutes: p.estimatedMinutes, xpReward: p.xpReward,
      searchText: `${p.title} ${p.tags.join(" ")} ${p.sections.map(s => s.heading).join(" ")}`.toLowerCase(),
    });
  }
  for (const l of lessons) {
    items.push({
      slug: l.slug, title: l.title, domain: l.domain, type: "lesson",
      estimatedMinutes: l.estimatedMinutes, xpReward: l.xpReward,
      searchText: `${l.title} ${l.tags.join(" ")} ${l.sections.map(s => s.heading).join(" ")}`.toLowerCase(),
    });
  }
  for (const m of modules) {
    items.push({
      slug: m.slug, title: m.title, domain: m.domain, type: "module",
      estimatedMinutes: m.estimatedMinutes, xpReward: m.xpReward,
      searchText: `${m.title} ${m.tags.join(" ")} ${m.sections.map(s => s.heading).join(" ")}`.toLowerCase(),
    });
  }
  return items;
}

const TYPE_ICON = { pod: "⚡", lesson: "📖", module: "🗂" };

export function ExploreClient({ pods, lessons, modules }: { pods: Pod[]; lessons: Lesson[]; modules: Module[] }) {
  const [query, setQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState<Domain | "all">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "pod" | "lesson" | "module">("all");
  const hydrated = useStoreHydrated();
  const isCompletedRaw = useLearnStore((s) => s.isCompleted);
  const isCompleted = (slug: string) => hydrated && isCompletedRaw(slug);

  const allItems = useMemo(() => buildItems(pods, lessons, modules), [pods, lessons, modules]);
  const domains = [...new Set(allItems.map((i) => i.domain))] as Domain[];

  const filtered = useMemo(() => {
    let items = allItems;
    if (domainFilter !== "all") items = items.filter((i) => i.domain === domainFilter);
    if (typeFilter !== "all") items = items.filter((i) => i.type === typeFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter((i) => i.searchText.includes(q));
    }
    return items;
  }, [allItems, domainFilter, typeFilter, query]);

  const stats = {
    total: allItems.length,
    completed: hydrated ? allItems.filter((i) => isCompletedRaw(i.slug)).length : 0,
    totalXp: allItems.reduce((sum, i) => sum + i.xpReward, 0),
  };

  return (
    <div style={{ padding: "0 0 12px" }}>
      <div style={{ padding: "12px 24px 8px" }} className="fade-1">
        <div className="greeting-sub">Explore</div>
        <div className="greeting-main" style={{ fontSize: 22 }}>All Content</div>
      </div>

      {/* Stats strip */}
      <div className="fade-2" style={{
        display: "flex", gap: 8, margin: "8px 20px 16px",
      }}>
        <div style={{ flex: 1, background: "var(--surface)", borderRadius: 14, padding: "10px 14px", textAlign: "center", border: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 18, fontWeight: 600, color: "var(--amber)" }}>{stats.total}</div>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>Total</div>
        </div>
        <div style={{ flex: 1, background: "var(--surface)", borderRadius: 14, padding: "10px 14px", textAlign: "center", border: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 18, fontWeight: 600, color: "var(--green)" }}>{stats.completed}</div>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>Done</div>
        </div>
        <div style={{ flex: 1, background: "var(--surface)", borderRadius: 14, padding: "10px 14px", textAlign: "center", border: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 18, fontWeight: 600, color: "var(--blue)" }}>{stats.totalXp.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>Total XP</div>
        </div>
      </div>

      {/* Search */}
      <div className="fade-2" style={{ margin: "0 20px 12px" }}>
        <input
          type="text"
          placeholder="Search pods, lessons, modules..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%", padding: "12px 16px",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 14, color: "var(--text)", fontSize: 14,
            fontFamily: "Outfit, sans-serif", outline: "none",
          }}
        />
      </div>

      {/* Type filter */}
      <div className="fade-3" style={{ display: "flex", gap: 8, padding: "0 20px", marginBottom: 8 }}>
        {(["all", "pod", "lesson", "module"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            style={{
              padding: "5px 12px", borderRadius: 10, border: "none",
              background: typeFilter === t ? "var(--amber-dim)" : "var(--surface2)",
              color: typeFilter === t ? "var(--amber)" : "var(--muted)",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {t === "all" ? "All" : `${TYPE_ICON[t]} ${t}s`}
          </button>
        ))}
      </div>

      {/* Domain filter */}
      <div className="fade-3" style={{ display: "flex", gap: 8, padding: "0 20px 12px", overflowX: "auto", scrollbarWidth: "none" }}>
        <button
          onClick={() => setDomainFilter("all")}
          className="pod-tag"
          style={{
            cursor: "pointer", border: "none", flexShrink: 0,
            background: domainFilter === "all" ? "rgba(245,166,35,0.15)" : "var(--surface2)",
            color: domainFilter === "all" ? "var(--amber)" : "var(--muted)",
          }}
        >All Domains</button>
        {domains.map((d) => {
          const dc = DOMAIN_CONFIG[d];
          return (
            <button
              key={d}
              onClick={() => setDomainFilter(d)}
              className={`pod-tag tag-${dc.tag}`}
              style={{ cursor: "pointer", border: "none", flexShrink: 0, opacity: domainFilter === d ? 1 : 0.5 }}
            >
              {dc.emoji} {d}
            </button>
          );
        })}
      </div>

      {/* Results */}
      <div className="fade-4" style={{ padding: "0 20px" }}>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </div>
        {filtered.map((item) => {
          const domain = DOMAIN_CONFIG[item.domain] || DOMAIN_CONFIG["Tools & Platforms"];
          const done = isCompleted(item.slug);
          const href = item.type === "module" ? `/modules/${item.slug}` : `/pods/${item.slug}`;
          return (
            <Link key={item.slug} href={href} className={`chapter-item ${done ? "completed" : ""}`} style={{ marginBottom: 8 }}>
              <div className={`chapter-icon ${done ? "icon-done" : "icon-active"}`}>
                {done ? "✓" : TYPE_ICON[item.type]}
              </div>
              <div className="chapter-info">
                <div className="chapter-title">{item.title}</div>
                <div className="chapter-meta">
                  <span className={`chapter-type-badge badge-${item.type}`}>
                    {TYPE_ICON[item.type]} {item.type}
                  </span>
                  <span className={`pod-tag tag-${domain.tag}`} style={{ fontSize: 9, padding: "1px 6px" }}>
                    {item.domain}
                  </span>
                  <span>{item.estimatedMinutes} min</span>
                </div>
              </div>
              <div className="chapter-right">
                <span className="chapter-xp">+{item.xpReward} XP</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
