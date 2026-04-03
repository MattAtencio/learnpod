import { getAllModules, getModuleBySlug, getAllLessons } from "@/lib/content";
import { notFound } from "next/navigation";
import { ModuleDetailClient } from "./ModuleDetailClient";

export function generateStaticParams() {
  return getAllModules().map((m) => ({ slug: m.slug }));
}

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mod = getModuleBySlug(slug);
  if (!mod) notFound();

  // Build a map of lesson slug → source pod slug for chapter links
  const lessons = getAllLessons();
  const lessonToPod: Record<string, string> = {};
  for (const l of lessons) {
    lessonToPod[l.slug] = l.sourcePod;
  }

  return <ModuleDetailClient module={mod} lessonToPod={lessonToPod} />;
}
