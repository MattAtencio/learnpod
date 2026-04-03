"use client";

import Link from "next/link";
import type { Module } from "@/lib/types";
import { DOMAIN_CONFIG } from "@/lib/types";
import { RingWithLabel } from "./Ring";
import { useLearnStore, useStoreHydrated } from "@/lib/store";

interface ModuleCardProps {
  module: Module;
}

const MODULE_EMOJIS: Record<string, string> = {
  "AI Engineering": "🧠",
  "Quant & Trading": "📊",
  "Financial Models": "💰",
  "Tools & Platforms": "🔧",
};

export function ModuleCard({ module: mod }: ModuleCardProps) {
  const hydrated = useStoreHydrated();
  const getModuleProgress = useLearnStore((s) => s.getModuleProgress);
  const chapterSlugs = mod.chapters.map((ch) => ch.slug);
  const { done, total, pct } = hydrated
    ? getModuleProgress(chapterSlugs)
    : { done: 0, total: chapterSlugs.length, pct: 0 };
  const domain = DOMAIN_CONFIG[mod.domain] || DOMAIN_CONFIG["Tools & Platforms"];
  const emoji = MODULE_EMOJIS[mod.domain] || "📚";

  return (
    <Link href={`/modules/${mod.slug}`} className="module-card">
      <RingWithLabel pct={pct} color={domain.color} size={52} />
      <div className="module-info">
        <div className="module-name">{mod.title}</div>
        <div className="module-sub">
          {done} of {total} chapters complete
        </div>
        <div className="module-progress-bar">
          <div className="module-progress-fill" style={{ width: `${pct * 100}%` }} />
        </div>
      </div>
      <div className="module-badge">{emoji}</div>
    </Link>
  );
}
