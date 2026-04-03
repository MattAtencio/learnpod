import type { Pod, Lesson, Module, Domain } from "./types";

// These imports point to auto-generated files from the sync script.
// If they don't exist yet, run `npm run sync` first.
import { pods } from "@/data/pods";
import { lessons } from "@/data/lessons";
import { modules } from "@/data/modules";

export function getAllPods(): Pod[] {
  return pods;
}

export function getPodBySlug(slug: string): Pod | undefined {
  return pods.find((p) => p.slug === slug);
}

export function getPodsByDomain(domain: Domain): Pod[] {
  return pods.filter((p) => p.domain === domain);
}

export function getActivePods(): Pod[] {
  return pods.filter((p) => p.status !== "dropped");
}

export function getAllLessons(): Lesson[] {
  return lessons;
}

export function getLessonBySlug(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}

export function getLessonForPod(podSlug: string): Lesson | undefined {
  return lessons.find((l) => l.sourcePod === podSlug);
}

export function getAllModules(): Module[] {
  return modules;
}

export function getModuleBySlug(slug: string): Module | undefined {
  return modules.find((m) => m.slug === slug);
}
