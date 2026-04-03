"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { id: "home", href: "/", icon: "🏠", label: "Home" },
  { id: "pods", href: "/pods", icon: "⚡", label: "Pods" },
  { id: "modules", href: "/modules", icon: "🗂", label: "Modules" },
];

export function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <div className="bottom-nav">
      {items.map((it) => (
        <Link key={it.id} href={it.href} className={`nav-item ${isActive(it.href) ? "active" : ""}`}>
          <div className="nav-icon">{it.icon}</div>
          <div className="nav-label">{it.label}</div>
        </Link>
      ))}
    </div>
  );
}
