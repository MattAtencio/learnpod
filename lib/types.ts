export type Domain = "AI Engineering" | "Quant & Trading" | "Financial Models" | "Tools & Platforms" | "ML Models" | "General";
export type ContentStatus = "queue" | "in-progress" | "done" | "dropped";
export type ContentType = "pod" | "lesson" | "module";

export interface Section {
  heading: string;
  content: string;
}

export interface Question {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

export interface Pod {
  slug: string;
  title: string;
  domain: Domain;
  tags: string[];
  status: ContentStatus;
  created: string;
  source?: string;
  sourceUrl?: string;
  sections: Section[];
  questions?: Question[];
  related: string[];
  estimatedMinutes: number;
  xpReward: number;
}

export interface Lesson {
  slug: string;
  title: string;
  domain: Domain;
  tags: string[];
  status: ContentStatus;
  created: string;
  sourcePod: string;
  sections: Section[];
  related: string[];
  estimatedMinutes: number;
  xpReward: number;
}

export interface Module {
  slug: string;
  title: string;
  domain: Domain;
  tags: string[];
  status: ContentStatus;
  created: string;
  pods: string[];
  sections: Section[];
  related: string[];
  estimatedMinutes: number;
  xpReward: number;
  chapters: Chapter[];
}

export interface Chapter {
  slug: string;
  title: string;
  type: ContentType;
  estimatedMinutes: number;
  xpReward: number;
}

export interface ContentManifest {
  podCount: number;
  lessonCount: number;
  moduleCount: number;
  domains: Domain[];
  lastSynced: string;
}

export const DOMAIN_CONFIG: Record<Domain, { tag: string; color: string; emoji: string }> = {
  "AI Engineering":    { tag: "ai",      color: "var(--blue)",   emoji: "⚡" },
  "Quant & Trading":   { tag: "quant",   color: "var(--green)",  emoji: "📈" },
  "Financial Models":  { tag: "finance", color: "var(--teal)",   emoji: "💰" },
  "Tools & Platforms": { tag: "tools",   color: "var(--purple)", emoji: "🔧" },
  "ML Models":         { tag: "ai",      color: "var(--blue)",   emoji: "🤖" },
  "General":           { tag: "tools",   color: "var(--muted)",  emoji: "📚" },
};
