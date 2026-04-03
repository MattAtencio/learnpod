"use client";

import Link from "next/link";
import type { Pod, Module } from "@/lib/types";
import { PodCard } from "@/components/PodCard";
import { ModuleCard } from "@/components/ModuleCard";
import { StreakBar } from "@/components/StreakBar";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function HomeClient({ pods, modules }: { pods: Pod[]; modules: Module[] }) {
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

      <div className="section-header fade-3">
        <div className="section-title">Today&apos;s Pods</div>
        <Link href="/pods" className="section-link" style={{ textDecoration: "none" }}>See all →</Link>
      </div>

      <div className="pods-scroll fade-3">
        {pods.slice(0, 8).map((pod, i) => (
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
