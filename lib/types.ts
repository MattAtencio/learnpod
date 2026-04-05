export type Domain = "AI Engineering" | "AI for Everyone" | "Business" | "DevOps" | "Product & Engineering" | "Quant & Trading" | "Financial Models" | "Tools & Platforms" | "ML Models" | "General";
export type ContentStatus = "queue" | "in-progress" | "done" | "dropped";
export type ContentType = "pod" | "lesson" | "module";
export type PodContentType = "concept" | "framework" | "case-study" | "metaphor" | "methodology";

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
  sourceRef?: string;
  contentType?: PodContentType;
  objectives?: string[];
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
  "AI for Everyone":   { tag: "ai",      color: "var(--blue)",   emoji: "🌐" },
  "Business":          { tag: "biz",     color: "var(--amber)",  emoji: "📖" },
  "DevOps":            { tag: "devops",  color: "var(--purple)", emoji: "🚀" },
  "Product & Engineering": { tag: "product", color: "var(--orange)", emoji: "🛠️" },
  "Quant & Trading":   { tag: "quant",   color: "var(--green)",  emoji: "📈" },
  "Financial Models":  { tag: "finance", color: "var(--teal)",   emoji: "💰" },
  "Tools & Platforms": { tag: "tools",   color: "var(--purple)", emoji: "🔧" },
  "ML Models":         { tag: "ai",      color: "var(--blue)",   emoji: "🤖" },
  "General":           { tag: "tools",   color: "var(--muted)",  emoji: "📚" },
};
