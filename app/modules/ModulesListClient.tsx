"use client";

import Link from "next/link";
import type { Module } from "@/lib/types";
import { ModuleCard } from "@/components/ModuleCard";

export function ModulesListClient({ modules }: { modules: Module[] }) {
  return (
    <div style={{ padding: "0 0 12px" }}>
      <div className="nav-back fade-1">
        <Link href="/" className="back-btn">←</Link>
        <div className="nav-back-title">All Modules</div>
        <div className="nav-badge">{modules.length}</div>
      </div>

      <div className="fade-2" style={{ paddingTop: 12 }}>
        {modules.map((mod) => (
          <ModuleCard key={mod.slug} module={mod} />
        ))}
      </div>
    </div>
  );
}
