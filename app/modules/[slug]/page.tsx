import { getAllModules, getModuleBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import { ModuleDetailClient } from "./ModuleDetailClient";

export function generateStaticParams() {
  return getAllModules().map((m) => ({ slug: m.slug }));
}

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mod = getModuleBySlug(slug);
  if (!mod) notFound();

  return <ModuleDetailClient module={mod} />;
}
