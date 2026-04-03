/**
 * sync-learning-content.ts
 *
 * Reads Learning Pod/Lesson/Module markdown files from the Obsidian vault,
 * parses frontmatter + sections, and generates typed TypeScript data files.
 *
 * Usage: npx tsx scripts/sync-learning-content.ts
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from "fs";
import { join, basename } from "path";
import matter from "gray-matter";

// ─── Config ───
const VAULT_ROOT = "C:/Users/Matt/OneDrive/Documents/Obsidian Vault/Learning";
const OUTPUT_DIR = join(__dirname, "..", "data");

const STATUS_MAP: Record<string, string> = {
  "🔵 Queue": "queue",
  "🟡 In Progress": "in-progress",
  "🟢 Done": "done",
  "🟢 Active": "done",
  "⚫ Dropped": "dropped",
};

const XP_REWARDS = {
  pod: 45,
  lesson: 120,
  module: 300,
};

const ESTIMATED_MINUTES = {
  pod: 2,
  lesson: 12,
  module: 35,
};

// ─── Helpers ───

function slugify(filename: string): string {
  return basename(filename, ".md")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripWikilinks(text: string): string {
  return text.replace(/\[\[([^\]]+)\]\]/g, "$1");
}

function parseStatus(raw: string | undefined): string {
  if (!raw) return "queue";
  for (const [emoji, status] of Object.entries(STATUS_MAP)) {
    if (raw.startsWith(emoji.charAt(0)) || raw === emoji) return status;
  }
  return "queue";
}

function parseSections(content: string): Array<{ heading: string; content: string }> {
  const lines = content.split("\n");
  const sections: Array<{ heading: string; content: string }> = [];
  let currentHeading = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    // Match ## headings (skip the # title)
    const h2Match = line.match(/^##\s+(.+)/);
    if (h2Match) {
      if (currentHeading) {
        sections.push({
          heading: stripWikilinks(currentHeading),
          content: stripWikilinks(currentContent.join("\n").trim()),
        });
      }
      currentHeading = h2Match[1].trim();
      currentContent = [];
    } else if (currentHeading) {
      currentContent.push(line);
    }
  }

  // Push last section
  if (currentHeading) {
    sections.push({
      heading: stripWikilinks(currentHeading),
      content: stripWikilinks(currentContent.join("\n").trim()),
    });
  }

  return sections;
}

function extractRelated(sections: Array<{ heading: string; content: string }>): string[] {
  const relatedSection = sections.find((s) => s.heading === "Related");
  if (!relatedSection) return [];
  return relatedSection.content
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractTitle(content: string, filename: string): string {
  const titleMatch = content.match(/^#\s+(?:🫛|📖|🧠)\s*(?:Module\s*—?\s*)?(.+)/m);
  if (titleMatch) return titleMatch[1].trim();
  return basename(filename, ".md");
}

// ─── Readers ───

function readDir(subdir: string): string[] {
  const dir = join(VAULT_ROOT, subdir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((f) => join(dir, f));
}

function readPods() {
  const files = readDir("Pods");
  return files.map((filepath) => {
    const raw = readFileSync(filepath, "utf-8");
    const { data: fm, content } = matter(raw);
    const sections = parseSections(content);
    const related = extractRelated(sections);
    const contentSections = sections.filter((s) => s.heading !== "Related");

    return {
      slug: slugify(filepath),
      title: extractTitle(content, filepath),
      domain: fm.domain || "Tools & Platforms",
      tags: fm.tags || [],
      status: parseStatus(fm.status),
      created: fm.created instanceof Date ? fm.created.toISOString().slice(0, 10) : String(fm.created || ""),
      source: fm.source || undefined,
      sourceUrl: fm["source-url"] || undefined,
      sections: contentSections,
      related,
      estimatedMinutes: ESTIMATED_MINUTES.pod,
      xpReward: XP_REWARDS.pod,
    };
  });
}

function readLessons() {
  const files = readDir("Lessons");
  return files.map((filepath) => {
    const raw = readFileSync(filepath, "utf-8");
    const { data: fm, content } = matter(raw);
    const sections = parseSections(content);
    const related = extractRelated(sections);
    const contentSections = sections.filter((s) => s.heading !== "Related");

    const sourcePodRaw = fm["source-pod"] || "";
    const sourcePod = slugify(sourcePodRaw.replace(/\[\[|\]\]/g, ""));

    return {
      slug: slugify(filepath),
      title: extractTitle(content, filepath),
      domain: fm.domain || "Tools & Platforms",
      tags: fm.tags || [],
      status: parseStatus(fm.status),
      created: fm.created instanceof Date ? fm.created.toISOString().slice(0, 10) : String(fm.created || ""),
      sourcePod,
      sections: contentSections,
      related,
      estimatedMinutes: ESTIMATED_MINUTES.lesson,
      xpReward: XP_REWARDS.lesson,
    };
  });
}

function readModules() {
  const files = readDir("Modules");
  return files.map((filepath) => {
    const raw = readFileSync(filepath, "utf-8");
    const { data: fm, content } = matter(raw);
    const sections = parseSections(content);
    const related = extractRelated(sections);
    const contentSections = sections.filter((s) => s.heading !== "Related");

    const podRefs: string[] = (fm.pods || []).map((p: string) =>
      slugify(p.replace(/\[\[|\]\]/g, ""))
    );

    // Build chapters from referenced pods and their lessons
    const chapters: Array<{
      slug: string;
      title: string;
      type: string;
      estimatedMinutes: number;
      xpReward: number;
    }> = [];

    for (const podSlug of podRefs) {
      chapters.push({
        slug: podSlug,
        title: podSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        type: "pod",
        estimatedMinutes: ESTIMATED_MINUTES.pod,
        xpReward: XP_REWARDS.pod,
      });
    }

    return {
      slug: slugify(filepath),
      title: extractTitle(content, filepath),
      domain: fm.domain || "Tools & Platforms",
      tags: fm.tags || [],
      status: parseStatus(fm.status),
      created: fm.created instanceof Date ? fm.created.toISOString().slice(0, 10) : String(fm.created || ""),
      pods: podRefs,
      sections: contentSections,
      related,
      estimatedMinutes: ESTIMATED_MINUTES.module,
      xpReward: XP_REWARDS.module,
      chapters,
    };
  });
}

// ─── Generator ───

function generateFile(name: string, typeName: string, data: unknown[]) {
  const json = JSON.stringify(data, null, 2);
  const content = `// AUTO-GENERATED by sync-learning-content.ts — do not edit
import type { ${typeName} } from "@/lib/types";

export const ${name}: ${typeName}[] = ${json};
`;
  const outPath = join(OUTPUT_DIR, `${name}.ts`);
  writeFileSync(outPath, content, "utf-8");
  console.log(`  ✓ ${name}.ts — ${data.length} items`);
}

function generateManifest(podCount: number, lessonCount: number, moduleCount: number) {
  const content = `// AUTO-GENERATED by sync-learning-content.ts — do not edit
import type { ContentManifest } from "@/lib/types";

export const manifest: ContentManifest = {
  podCount: ${podCount},
  lessonCount: ${lessonCount},
  moduleCount: ${moduleCount},
  domains: ["AI Engineering", "Quant & Trading", "Financial Models", "Tools & Platforms", "ML Models", "General"],
  lastSynced: "${new Date().toISOString()}",
};
`;
  writeFileSync(join(OUTPUT_DIR, "manifest.ts"), content, "utf-8");
  console.log(`  ✓ manifest.ts`);
}

// ─── Main ───

function main() {
  console.log("Syncing learning content from vault...\n");

  if (!existsSync(VAULT_ROOT)) {
    console.error(`Vault not found at: ${VAULT_ROOT}`);
    process.exit(1);
  }

  const pods = readPods();
  const lessons = readLessons();
  const modules = readModules();

  // Enrich module chapters with real pod titles
  for (const mod of modules) {
    mod.chapters = mod.chapters.map((ch) => {
      const pod = pods.find((p) => p.slug === ch.slug);
      if (pod) return { ...ch, title: pod.title };

      // Check if there's a matching lesson for this pod
      const lesson = lessons.find((l) => l.sourcePod === ch.slug);
      if (lesson) {
        // Add the lesson as an additional chapter after the pod
        return { ...ch, title: pod?.title || ch.title };
      }
      return ch;
    });

    // Add lessons as chapters after their source pods
    const enrichedChapters: typeof mod.chapters = [];
    for (const ch of mod.chapters) {
      enrichedChapters.push(ch);
      const lesson = lessons.find((l) => l.sourcePod === ch.slug);
      if (lesson) {
        enrichedChapters.push({
          slug: lesson.slug,
          title: lesson.title,
          type: "lesson",
          estimatedMinutes: ESTIMATED_MINUTES.lesson,
          xpReward: XP_REWARDS.lesson,
        });
      }
    }
    mod.chapters = enrichedChapters;
  }

  console.log("Generating data files:");
  generateFile("pods", "Pod", pods);
  generateFile("lessons", "Lesson", lessons);
  generateFile("modules", "Module", modules);
  generateManifest(pods.length, lessons.length, modules.length);

  console.log(
    `\nDone! ${pods.length} pods, ${lessons.length} lessons, ${modules.length} modules synced.`
  );
}

main();
