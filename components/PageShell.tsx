"use client";

import { useNavDirection } from "@/lib/nav-direction";

const dirClass: Record<string, string> = {
  forward: "page-slide-forward",
  back: "page-slide-back",
  fade: "page-fade",
};

export function PageShell({ children }: { children: React.ReactNode }) {
  const { direction } = useNavDirection();
  return <div className={dirClass[direction] || "page-fade"}>{children}</div>;
}
