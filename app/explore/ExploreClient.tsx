"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Pod, Lesson, Module, Domain } from "@/lib/types";
import { DOMAIN_CONFIG } from "@/lib/types";
import { useLearnStore, useStoreHydrated } from "@/lib/store";
import { useNavDirection } from "@/lib/nav-direction";
import { NotificationSettings } from "@/components/NotificationSettings";

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
  const xpLog = useLearnStore((s) => s.xpLog);
  const domainAccuracy = useLearnStore((s) => s.domainAccuracy);
  const xp = useLearnStore((s) => s.xp);
  const streak = useLearnStore((s) => s.streak);
  const { setForward } = useNavDirection();
  const [showAnalytics, setShowAnalytics] = useState(true);

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

  // Build heatmap data for last 12 weeks (84 days)
  const heatmapData = useMemo(() => {
    const days: { date: string; xp: number }[] = [];
    const now = new Date();
    for (let i = 83; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const entry = xpLog.find((l) => l.date === dateStr);
      days.push({ date: dateStr, xp: entry?.earned || 0 });
    }
    return days;
  }, [xpLog]);

  const maxHeatXp = Math.max(...heatmapData.map((d) => d.xp), 1);

  // Domain stats
  const domainStats = useMemo(() => {
    const result: { domain: string; count: number; avgAccuracy: number; color: string; emoji: string }[] = [];
    const completedDomains: Record<string, number> = {};
    for (const item of allItems) {
      if (hydrated && isCompletedRaw(item.slug)) {
        completedDomains[item.domain] = (completedDomains[item.domain] || 0) + 1;
      }
    }
    for (const [domain, count] of Object.entries(completedDomains)) {
      const acc = domainAccuracy[domain];
      let avgAccuracy = 0;
      if (acc && acc.scores.length > 0) {
        const totalCorrect = acc.scores.reduce((a, b) => a + b, 0);
        const totalQ = acc.totals.reduce((a, b) => a + b, 0);
        avgAccuracy = totalQ > 0 ? totalCorrect / totalQ : 0;
      }
      const dc = DOMAIN_CONFIG[domain as Domain] || DOMAIN_CONFIG["General"];
      result.push({ domain, count, avgAccuracy, color: dc.color, emoji: dc.emoji });
    }
    return result.sort((a, b) => b.count - a.count);
  }, [allItems, hydrated, isCompletedRaw, domainAccuracy]);

  // Weekly XP summary
  const weeklyXp = useMemo(() => {
    const now = new Date();
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const entry = xpLog.find((l) => l.date === dateStr);
      if (entry) total += entry.earned;
    }
    return total;
  }, [xpLog]);

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

      {/* Analytics Toggle */}
      <div className="fade-2" style={{ margin: "0 20px 12px" }}>
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          style={{
            width: "100%", padding: "10px 16px", borderRadius: 14,
            background: "var(--surface)", border: "1px solid var(--border)",
            color: "var(--amber)", fontFamily: "Outfit, sans-serif",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}
        >
          <span>Insights & Analytics</span>
          <span style={{ fontSize: 12 }}>{showAnalytics ? "▲" : "▼"}</span>
        </button>
      </div>

      {showAnalytics && hydrated && (
        <div className="fade-2" style={{ margin: "0 20px 16px" }}>
          {/* Weekly summary strip */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <div style={{
              flex: 1, background: "var(--surface)", borderRadius: 14,
              padding: "10px 14px", textAlign: "center", border: "1px solid var(--border)",
            }}>
              <div style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 18, fontWeight: 600, color: "var(--amber)" }}>
                {weeklyXp}
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>
                This Week
              </div>
            </div>
            <div style={{
              flex: 1, background: "var(--surface)", borderRadius: 14,
              padding: "10px 14px", textAlign: "center", border: "1px solid var(--border)",
            }}>
              <div style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 18, fontWeight: 600, color: "var(--coral)" }}>
                {streak.count}
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>
                Day Streak
              </div>
            </div>
            <div style={{
              flex: 1, background: "var(--surface)", borderRadius: 14,
              padding: "10px 14px", textAlign: "center", border: "1px solid var(--border)",
            }}>
              <div style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 18, fontWeight: 600, color: "var(--teal)" }}>
                {xp.toLocaleString()}
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>
                All Time
              </div>
            </div>
          </div>

          {/* Learning Heatmap */}
          <div style={{
            background: "var(--surface)", borderRadius: 18,
            border: "1px solid var(--border)", padding: "16px",
            marginBottom: 12,
          }}>
            <div style={{
              fontFamily: "var(--font-fraunces), serif", fontSize: 14,
              fontWeight: 600, color: "var(--text)", marginBottom: 10,
            }}>
              Learning Activity
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              gridTemplateRows: "repeat(7, 1fr)",
              gap: 3,
              gridAutoFlow: "column",
            }}>
              {heatmapData.map((day, i) => {
                const intensity = day.xp > 0 ? Math.max(0.2, day.xp / maxHeatXp) : 0;
                return (
                  <div
                    key={i}
                    title={`${day.date}: ${day.xp} XP`}
                    style={{
                      width: "100%", aspectRatio: "1", borderRadius: 3,
                      background: day.xp > 0
                        ? `rgba(93,214,140,${intensity})`
                        : "var(--surface2)",
                    }}
                  />
                );
              })}
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between", marginTop: 6,
              fontSize: 9, color: "var(--muted)",
            }}>
              <span>12 weeks ago</span>
              <span>Today</span>
            </div>
          </div>

          {/* Domain Breakdown */}
          {domainStats.length > 0 && (
            <div style={{
              background: "var(--surface)", borderRadius: 18,
              border: "1px solid var(--border)", padding: "16px",
            }}>
              <div style={{
                fontFamily: "var(--font-fraunces), serif", fontSize: 14,
                fontWeight: 600, color: "var(--text)", marginBottom: 10,
              }}>
                Domain Breakdown
              </div>
              {domainStats.map((d) => {
                const maxCount = domainStats[0]?.count || 1;
                const barPct = d.count / maxCount;
                return (
                  <div key={d.domain} style={{ marginBottom: 10 }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      marginBottom: 4,
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>
                        {d.emoji} {d.domain}
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {d.avgAccuracy > 0 && (
                          <span style={{
                            fontSize: 10, color: "var(--muted)",
                          }}>
                            {Math.round(d.avgAccuracy * 100)}% acc
                          </span>
                        )}
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: d.color,
                        }}>
                          {d.count}
                        </span>
                      </div>
                    </div>
                    <div style={{
                      height: 6, background: "var(--surface2)", borderRadius: 3,
                      overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%", borderRadius: 3,
                        background: d.color, width: `${barPct * 100}%`,
                        transition: "width 0.6s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Notification Settings */}
      {hydrated && <NotificationSettings />}

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
            <Link key={item.slug} href={href} className={`chapter-item ${done ? "completed" : ""}`} style={{ marginBottom: 8 }} onClick={setForward}>
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
