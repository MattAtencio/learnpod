/**
 * Daily queue selector — picks an ordered set of pods using a real learning
 * priority chain instead of "first 8 sorted by domain preference."
 *
 * Priority (descending):
 *   1. Resume — pod the user started but didn't complete (lastStartedPodSlug)
 *   2. Overdue reviews (SM-2)
 *   3. Due reviews (SM-2)
 *   4. Continue Module — next incomplete pod in an active module
 *   5. Weak spot — pod from a domain with low domainAccuracy (<70%)
 *   6. New in interest — pod from preferred domains
 *   7. Variety — anything else
 *
 * Stable within a day via a date seed; rotates tomorrow.
 */

import type { Pod, Module, Domain } from "./types";

export type QueueReason =
  | "resume"
  | "overdue"
  | "due"
  | "continue-module"
  | "weak-spot"
  | "new"
  | "variety";

export interface QueueItem {
  pod: Pod;
  reason: QueueReason;
  reasonLabel: string;
  reasonDetail?: string;
}

export interface QueueInputs {
  pods: Pod[];
  modules: Module[];
  completedItems: string[];
  preferredDomains: Domain[];
  lastStartedPodSlug: string | null;
  getReviewStatus: (slug: string) => "due" | "overdue" | "mastered" | "learning" | null;
  domainAccuracy: Record<string, { scores: number[]; totals: number[] }>;
}

/** Deterministic shuffle seeded by today's date */
function dateSeed(): number {
  const t = new Date().toISOString().slice(0, 10);
  let h = 0;
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) | 0;
    const j = Math.abs(s) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function domainAccuracyPct(
  domain: Domain,
  acc: Record<string, { scores: number[]; totals: number[] }>
): number | null {
  const d = acc[domain];
  if (!d || d.scores.length === 0) return null;
  const score = d.scores.reduce((a, b) => a + b, 0);
  const total = d.totals.reduce((a, b) => a + b, 0);
  return total > 0 ? score / total : null;
}

export function getDailyQueue(
  inputs: QueueInputs,
  limit = 5
): QueueItem[] {
  const {
    pods,
    modules,
    completedItems,
    preferredDomains,
    lastStartedPodSlug,
    getReviewStatus,
    domainAccuracy,
  } = inputs;

  const completedSet = new Set(completedItems);
  const usedSlugs = new Set<string>();
  const out: QueueItem[] = [];
  const podBySlug = new Map(pods.map((p) => [p.slug, p]));

  const push = (pod: Pod, reason: QueueReason, label: string, detail?: string) => {
    if (usedSlugs.has(pod.slug)) return;
    if (out.length >= limit) return;
    usedSlugs.add(pod.slug);
    out.push({ pod, reason, reasonLabel: label, reasonDetail: detail });
  };

  // 1. Resume
  if (lastStartedPodSlug && !completedSet.has(lastStartedPodSlug)) {
    const p = podBySlug.get(lastStartedPodSlug);
    if (p) push(p, "resume", "Pick up where you left off");
  }

  // 2/3. Reviews — overdue then due
  const reviewables = pods.filter((p) => {
    const s = getReviewStatus(p.slug);
    return s === "overdue" || s === "due";
  });
  for (const p of reviewables.filter((p) => getReviewStatus(p.slug) === "overdue")) {
    push(p, "overdue", "Overdue review");
  }
  for (const p of reviewables.filter((p) => getReviewStatus(p.slug) === "due")) {
    push(p, "due", "Due for review");
  }

  // 4. Continue active module — next incomplete pod in a module that's started but not done
  const activeModules = modules.filter((m) => {
    const slugs = m.chapters.map((c) => c.slug);
    const done = slugs.filter((s) => completedSet.has(s)).length;
    return done > 0 && done < slugs.length;
  });
  for (const m of activeModules) {
    const next = m.chapters.find((c) => !completedSet.has(c.slug));
    if (!next) continue;
    const p = podBySlug.get(next.slug);
    if (p) push(p, "continue-module", `Next in ${m.title}`);
  }

  // 5. Weak spot — pods in a preferred domain where domainAccuracy < 0.7
  const weakDomains = (preferredDomains.length > 0 ? preferredDomains : (Object.keys(domainAccuracy) as Domain[]))
    .map((d) => ({ d, pct: domainAccuracyPct(d, domainAccuracy) }))
    .filter((x): x is { d: Domain; pct: number } => x.pct !== null && x.pct < 0.7)
    .sort((a, b) => a.pct - b.pct);

  for (const { d, pct } of weakDomains) {
    const candidate = pods.find(
      (p) => p.domain === d && !completedSet.has(p.slug) && !usedSlugs.has(p.slug)
    );
    if (candidate) {
      push(candidate, "weak-spot", `Weak spot — ${Math.round(pct * 100)}% in ${d}`);
    }
  }

  // 6. New in interest — preferred domain, not completed, seeded shuffle
  if (out.length < limit && preferredDomains.length > 0) {
    const newInInterest = seededShuffle(
      pods.filter(
        (p) =>
          preferredDomains.includes(p.domain) &&
          !completedSet.has(p.slug) &&
          !usedSlugs.has(p.slug)
      ),
      dateSeed()
    );
    for (const p of newInInterest) {
      push(p, "new", "New in your interests");
    }
  }

  // 7. Variety — anything else
  if (out.length < limit) {
    const variety = seededShuffle(
      pods.filter((p) => !completedSet.has(p.slug) && !usedSlugs.has(p.slug)),
      dateSeed() + 1
    );
    for (const p of variety) {
      push(p, "variety", "Try something new");
    }
  }

  return out;
}
