import { getAllPods, getPodBySlug, getLessonForPod } from "@/lib/content";
import { getAllModules } from "@/lib/content";
import { notFound } from "next/navigation";
import { PodDetailClient } from "./PodDetailClient";

export function generateStaticParams() {
  return getAllPods().map((p) => ({ slug: p.slug }));
}

export default async function PodPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pod = getPodBySlug(slug);
  if (!pod) notFound();

  const lesson = getLessonForPod(slug);
  const parentModule = getAllModules().find((m) =>
    m.chapters.some((ch) => ch.slug === slug)
  );

  return <PodDetailClient pod={pod} lesson={lesson} parentModule={parentModule} />;
}
