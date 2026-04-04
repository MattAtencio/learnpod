import { getAllPods, getPodBySlug, getLessonForPod, getQuizForPod } from "@/lib/content";
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

  const allPods = getAllPods().filter((p) => p.status !== "dropped");
  const currentIndex = allPods.findIndex((p) => p.slug === slug);
  const nextPods = [
    ...allPods.slice(currentIndex + 1),
    ...allPods.slice(0, currentIndex),
  ];

  const questions = getQuizForPod(slug);

  // Gather review questions from other pods in the same domain for interleaving
  const sameDomainPods = allPods.filter((p) => p.domain === pod.domain && p.slug !== slug);
  const reviewPool: { slug: string; question: import("@/lib/types").Question }[] = [];
  for (const p of sameDomainPods) {
    const pQuestions = getQuizForPod(p.slug);
    for (const q of pQuestions) {
      reviewPool.push({ slug: p.slug, question: q });
    }
  }

  return (
    <PodDetailClient
      pod={pod}
      lesson={lesson}
      parentModule={parentModule}
      nextPodSlugs={nextPods.map((p) => p.slug)}
      questions={questions}
      reviewPool={reviewPool.map((r) => r.question)}
      reviewPoolSlugs={reviewPool.map((r) => r.slug)}
    />
  );
}
