"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLearnStore, useStoreHydrated } from "@/lib/store";

const icons: Record<string, React.ReactNode> = {
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  pods: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  modules: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  explore: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
};

const items = [
  { id: "home", href: "/", label: "Home" },
  { id: "pods", href: "/pods", label: "Pods" },
  { id: "modules", href: "/modules", label: "Modules" },
  { id: "explore", href: "/explore", label: "Explore" },
];

export function BottomNav() {
  const pathname = usePathname();
  const hydrated = useStoreHydrated();
  const onboardingComplete = useLearnStore((s) => s.onboardingComplete);

  if (hydrated && !onboardingComplete) return null;

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {items.map((it) => {
        const active = isActive(it.href);
        return (
          <Link
            key={it.id}
            href={it.href}
            className={`nav-item ${active ? "active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <div className="nav-icon" style={{ color: active ? "var(--amber)" : "var(--muted)" }}>
              {icons[it.id]}
            </div>
            <div className="nav-label">{it.label}</div>
            {active && <div className="nav-dot" />}
          </Link>
        );
      })}
    </nav>
  );
}
