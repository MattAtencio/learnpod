/**
 * generate-quiz-questions.ts
 *
 * Generates multiple-choice quiz questions from pod content.
 * Strategies: "What is X?", bold-term extraction, bullet fact recognition,
 * section-heading matching. Targets 3-5 questions per pod.
 *
 * Usage: npx tsx scripts/generate-quiz-questions.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_DIR = join(__dirname, "..", "data");

interface Section { heading: string; content: string; }
interface Pod { slug: string; title: string; domain: string; sections: Section[]; }
interface Question {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

function extractBoldTerms(content: string): string[] {
  return (content.match(/\*\*([^*]+)\*\*/g) || [])
    .map((m) => m.replace(/\*\*/g, "").trim())
    .filter((t) => t.length > 2 && t.length < 80);
}

function extractBullets(content: string): string[] {
  return content.split("\n")
    .filter((l) => l.match(/^\s*[-*]\s/))
    .map((l) => l.replace(/^\s*[-*]\s+/, "").replace(/\*\*/g, "").trim())
    .filter((l) => l.length > 10 && l.length < 200);
}

function deterministicShuffle(items: string[], seed: number): string[] {
  const arr = [...items];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function makeChoices(correct: string, wrongs: string[], seed: number): { items: string[]; correctIdx: number } {
  const unique = wrongs.filter((w) => w !== correct).slice(0, 3);
  if (unique.length < 3) return { items: [correct], correctIdx: 0 };
  const items = deterministicShuffle([correct, ...unique], seed);
  return { items, correctIdx: items.indexOf(correct) };
}

// Generic wrong answers for different domains
const DOMAIN_WRONGS: Record<string, string[]> = {
  "AI Engineering": [
    "A client-side JavaScript library for DOM rendering",
    "A database migration tool for PostgreSQL schemas",
    "A CI/CD pipeline orchestrator for container deployments",
    "A network monitoring agent for distributed systems",
    "A static site generator for documentation",
  ],
  "Quant & Trading": [
    "A fundamental accounting metric used in GAAP reporting",
    "A social media sentiment aggregation score",
    "A fixed interest rate instrument with no market risk",
    "A qualitative management assessment framework",
    "A regulatory compliance checklist for banking audits",
  ],
  "Financial Models": [
    "A technical charting pattern used in day trading",
    "A cryptocurrency mining difficulty algorithm",
    "A social lending platform reputation score",
    "A marketing attribution model for ad spend",
    "A supply chain logistics optimization formula",
  ],
  "Tools & Platforms": [
    "A hardware diagnostic tool for server maintenance",
    "A customer relationship management (CRM) platform",
    "A social media scheduling and analytics tool",
    "A physical network cable testing instrument",
    "A project management methodology framework",
  ],
  "ML Models": [
    "A relational database query optimizer",
    "A front-end CSS framework for responsive design",
    "A containerization platform for microservices",
    "A version control system for binary files",
    "A packet inspection tool for network security",
  ],
  "General": [
    "A hardware diagnostic utility",
    "A database management interface",
    "A network monitoring tool",
    "A customer support ticketing system",
    "A project management framework",
  ],
};

function getDomainWrongs(domain: string): string[] {
  return DOMAIN_WRONGS[domain] || DOMAIN_WRONGS["General"];
}

// Strategy 1: "What is X?" from first section
function qWhatIs(pod: Pod): Question | null {
  const section = pod.sections.find((s) => s.heading.toLowerCase().includes("what it is") || s.heading.toLowerCase().includes("what they are"));
  if (!section) return null;

  const firstSentence = section.content.split(/\.\s|\.\n/)[0]?.replace(/\*\*/g, "").trim();
  if (!firstSentence || firstSentence.length < 20 || firstSentence.length > 200) return null;

  const wrongs = getDomainWrongs(pod.domain);
  const result = makeChoices(firstSentence, wrongs, firstSentence.length);
  if (result.items.length < 4) return null;

  return {
    id: `${pod.slug}-what`,
    question: `What best describes ${pod.title}?`,
    choices: result.items,
    correctIndex: result.correctIdx,
    explanation: firstSentence,
  };
}

// Strategy 2: Bold term identification from any section
function qBoldTerm(pod: Pod, idx: number): Question | null {
  // Collect all bold terms with their section context
  const termContexts: Array<{ term: string; section: string; content: string }> = [];
  for (const s of pod.sections) {
    if (s.heading.toLowerCase().includes("research") || s.heading.toLowerCase().includes("apply it")) continue;
    for (const term of extractBoldTerms(s.content)) {
      termContexts.push({ term, section: s.heading, content: s.content });
    }
  }

  if (termContexts.length <= idx) return null;
  const { term, section } = termContexts[idx];

  // Find the sentence/bullet containing this term
  const lines = termContexts[idx].content.split("\n");
  const contextLine = lines.find((l) => l.includes(`**${term}**`));
  if (!contextLine) return null;

  const cleanLine = contextLine.replace(/^\s*[-*]\s+/, "").replace(/\*\*/g, "").trim();
  if (cleanLine.length < 15 || cleanLine.length > 200) return null;

  // Other bold terms as distractors
  const otherTerms = termContexts
    .filter((t) => t.term !== term)
    .map((t) => t.term)
    .slice(0, 5);

  if (otherTerms.length < 3) {
    const domainWrongs = getDomainWrongs(pod.domain).map((w) => w.slice(0, 60));
    otherTerms.push(...domainWrongs);
  }

  const result = makeChoices(term, otherTerms.slice(0, 5), term.length + idx);
  if (result.items.length < 4) return null;

  return {
    id: `${pod.slug}-bold-${idx}`,
    question: `In the context of ${pod.title}, which term matches: "${cleanLine.slice(0, 100)}${cleanLine.length > 100 ? "..." : ""}"?`,
    choices: result.items,
    correctIndex: result.correctIdx,
    explanation: `${term} — from the "${section}" section.`,
  };
}

// Strategy 3: Bullet point true/false
function qTrueFalse(pod: Pod, bulletIdx: number): Question | null {
  const allBullets: Array<{ text: string; section: string }> = [];
  for (const s of pod.sections) {
    if (s.heading.toLowerCase().includes("research") || s.heading.toLowerCase().includes("apply it")) continue;
    for (const b of extractBullets(s.content)) {
      allBullets.push({ text: b, section: s.heading });
    }
  }

  if (allBullets.length <= bulletIdx) return null;
  const { text: correct, section } = allBullets[bulletIdx];

  // Use bullets from other sections as wrong answers
  const wrongs = allBullets
    .filter((b) => b.text !== correct && b.section !== section)
    .map((b) => b.text)
    .slice(0, 5);

  if (wrongs.length < 3) {
    wrongs.push(
      ...getDomainWrongs(pod.domain).slice(0, 3 - wrongs.length)
    );
  }

  const result = makeChoices(correct, wrongs, correct.length + bulletIdx);
  if (result.items.length < 4) return null;

  return {
    id: `${pod.slug}-fact-${bulletIdx}`,
    question: `Which of these is true about ${pod.title} (${section})?`,
    choices: result.items,
    correctIndex: result.correctIdx,
    explanation: correct,
  };
}

// Strategy 4: Section heading identification
function qSectionMatch(pod: Pod): Question | null {
  // Find a distinctive section with enough content
  const candidates = pod.sections.filter(
    (s) =>
      !s.heading.toLowerCase().includes("what it is") &&
      !s.heading.toLowerCase().includes("research") &&
      !s.heading.toLowerCase().includes("apply it") &&
      s.content.length > 50
  );

  if (candidates.length < 2) return null;

  const section = candidates[0];
  const firstLine = section.content.split("\n").find((l) => l.trim().length > 15);
  if (!firstLine) return null;

  const cleanLine = firstLine.replace(/^\s*[-*]\s+/, "").replace(/\*\*/g, "").trim().slice(0, 120);
  const correct = section.heading;

  const otherHeadings = candidates
    .filter((s) => s.heading !== correct)
    .map((s) => s.heading);

  // Pad with generic section names if needed
  const genericHeadings = ["Implementation Guide", "Cost Analysis", "Prerequisites", "Limitations", "Advanced Usage"];
  otherHeadings.push(...genericHeadings);

  const result = makeChoices(correct, otherHeadings.slice(0, 5), cleanLine.length);
  if (result.items.length < 4) return null;

  return {
    id: `${pod.slug}-section`,
    question: `"${cleanLine}${cleanLine.length >= 120 ? "..." : ""}" — which section of ${pod.title} does this belong to?`,
    choices: result.items,
    correctIndex: result.correctIdx,
    explanation: `This is from the "${correct}" section.`,
  };
}

function generateQuestionsForPod(pod: Pod): Question[] {
  const questions: Question[] = [];

  // Try each strategy
  const q1 = qWhatIs(pod);
  if (q1) questions.push(q1);

  const q2 = qBoldTerm(pod, 0);
  if (q2) questions.push(q2);

  const q3 = qTrueFalse(pod, 0);
  if (q3) questions.push(q3);

  const q4 = qSectionMatch(pod);
  if (q4) questions.push(q4);

  const q5 = qBoldTerm(pod, 1);
  if (q5) questions.push(q5);

  // If we still have fewer than 3, try more bullets/bold terms
  if (questions.length < 3) {
    const q6 = qTrueFalse(pod, 1);
    if (q6) questions.push(q6);
  }
  if (questions.length < 3) {
    const q7 = qBoldTerm(pod, 2);
    if (q7) questions.push(q7);
  }

  return questions.slice(0, 5);
}

function main() {
  console.log("Generating quiz questions from pod content...\n");

  const podsPath = join(DATA_DIR, "pods.ts");
  const podsRaw = readFileSync(podsPath, "utf-8");
  const assignIdx = podsRaw.indexOf("= [");
  const jsonStart = assignIdx + 2;
  const jsonEnd = podsRaw.lastIndexOf("];") + 1;
  const pods: Pod[] = JSON.parse(podsRaw.slice(jsonStart, jsonEnd));

  const quizMap: Record<string, Question[]> = {};
  let totalQ = 0;
  let podsWithQ = 0;

  for (const pod of pods) {
    const questions = generateQuestionsForPod(pod);
    quizMap[pod.slug] = questions;
    totalQ += questions.length;
    if (questions.length > 0) podsWithQ++;
    console.log(`  ${pod.slug}: ${questions.length} questions`);
  }

  const output = `// AUTO-GENERATED by generate-quiz-questions.ts — do not edit
import type { Question } from "@/lib/types";

export const quizzes: Record<string, Question[]> = ${JSON.stringify(quizMap, null, 2)};
`;

  writeFileSync(join(DATA_DIR, "quizzes.ts"), output, "utf-8");
  console.log(`\nDone! ${totalQ} questions for ${podsWithQ}/${pods.length} pods.`);
}

main();
