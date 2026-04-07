# LearnPod Books — Design Spec

> Feature: Capture and organize business books as a learning source within the existing LearnPod system.
> Status: Approved
> Date: 2026-04-04

---

## Problem

Matt has a library of MBA and business books (his program, Harvard MBA, etc.) that he hasn't fully read. He wants to extract the valuable content — methodologies, case studies, stories, metaphors, analogies — and make it learnable through LearnPod. The challenge is organizing content both by **book structure** (chapters/sections) and by **topic** (cross-book synthesis).

## Design Principles

1. **Books are a source, not a new tier.** The Pod/Lesson/Module hierarchy stays unchanged.
2. **Multi-axis organization via existing mechanisms.** Tags, wikilinks, and the `related` array already support multi-parent discovery — no new relationship model needed.
3. **Book Maps are vault-only.** They organize content in Obsidian but don't sync to the app (for now).
4. **Modules cross books.** Book Maps are for sourcing; modules are for synthesis.
5. **Organic capture over rigid structure.** Users can capture pods from any chapter — the Book Map fills in over time.

---

## Architecture

### What Changes

| Component | Change | Phase |
|-----------|--------|-------|
| Pod frontmatter | Add `content-type` field | Now |
| Pod frontmatter | Add `source-ref` field | Now |
| Pod frontmatter | Add `Book` as source type | Now |
| Domain taxonomy | Add `Business` domain | Now |
| Vault structure | Add `Learning/Books/` folder | Now |
| Learning schema | Add Book Map schema section | Now |
| `/learnpod capture` | Support `--book "Title"` flag | Now |
| `/learnpod` router | Add `book-map` subcommand | Now |
| App `types.ts` | Add `Business` domain, `contentType`, `sourceRef` fields | Now |
| App `DOMAIN_CONFIG` | Add Business entry | Now |
| App explore page | Source filter chip + source badge on pod cards | **Future** |
| App data pipeline | Lightweight `books.ts` manifest from Book Map frontmatter | **Future** |
| App engagement | Book completion progress ring | **Future** |
| App engagement | "Book Club" streak variant | **Future** |
| App engagement | "Did You Know?" daily prompt from case-study pods | **Future** |

### What Doesn't Change

- Pod/Lesson/Module hierarchy and schemas (except new optional fields)
- Sync script core logic (Book Maps are not synced)
- App navigation structure (no "Books" tab)
- Existing pods, lessons, modules — fully backwards compatible

---

## New Schema Elements

### `content-type` Field (Pod Frontmatter)

Optional field classifying the *type of knowledge* in the pod:

| Value | Description | Cognitive Purpose |
|-------|-------------|-------------------|
| `concept` | Core idea or principle | Semantic memory — abstract, transferable |
| `framework` | Structured methodology or model | Semantic memory — procedural, actionable |
| `case-study` | Real-world example or company story | Episodic memory — vivid, contextual |
| `metaphor` | Analogy or mental model | Bridges episodic and semantic memory |
| `methodology` | Step-by-step process or approach | Procedural memory — actionable sequence |

**Why:** VP Education — separating stories from frameworks enables the spaced repetition system to interleave them, strengthening both episodic and semantic memory. VP Engagement — `case-study` pods surface as shareable "Did You Know?" prompts.

**Default:** Omit for existing pods. Not required. Primarily useful for book-sourced content where the distinction matters.

### `source-ref` Field (Pod Frontmatter)

Optional string referencing the specific location within a source:

```yaml
source: Book
source-ref: "Good to Great, Ch 5 — The Hedgehog Concept"
```

For non-book sources, this could also hold timestamps, page numbers, etc. Free-form text.

### Updated Pod Frontmatter

```yaml
---
tags: [pod, <domain-tag>, <topic-tags>]
status: 🔵 Queue
domain: <domain>
created: YYYY-MM-DD
source: <Instagram | YouTube | Blog | URL | Screenshot | Manual | Book>
source-url: "<URL if applicable>"
source-ref: "<Book title, chapter/section — optional>"
content-type: <concept | framework | case-study | metaphor | methodology — optional>
---
```

### Business Domain

| Domain | File Prefix | Tags | MOC |
|--------|------------|------|-----|
| Business | `Biz - ` | `#business` `#mba` | MOC - Business |

**Topic tags:** `#strategy`, `#leadership`, `#management`, `#operations`, `#marketing`, `#finance-biz`, `#organizational-behavior`, `#innovation`, `#case-study`

---

## Book Map Schema

Book Maps live in `Learning/Books/` and are **vault-only** organizational notes (not synced to the app).

### Frontmatter

```yaml
---
tags: [book-map, <domain-tag>, <topic-tags>]
title: "<Book Title>"
author: "<Author Name>"
status: 🔵 Queue | 🟡 In Progress | 🟢 Done
domain: "<primary domain>"
total-chapters: <number>
chapters-mapped: <number>
pods-extracted: <number>
created: YYYY-MM-DD
---
```

**Why `total-chapters` and `chapters-mapped`:** Designed to support a future lightweight `books.ts` manifest for app-side book completion tracking, without syncing full Book Map content.

### Sections

```markdown
# <Book Title> — <Author>

## Overview
1-2 paragraphs. What is this book about? Why read it? What's the core thesis?

## Key Themes
Bullet list of the book's major themes/arguments. These often become module topics.

## Chapter Map
Organize by chapter or section. Link to extracted pods under each.
Not every chapter needs mapping — extract what matters.

### Ch 1 — [Chapter Title]
- [[Biz - Pod Name]] — brief note on what this pod covers
- [[Biz - Pod Name]]

### Ch 3 — [Chapter Title]
- [[Biz - Pod Name]]

## Methodologies Extracted
Link to framework/methodology pods pulled from this book:
- [[Biz - Framework Name]] — brief description

## Case Studies & Stories
Link to case-study/metaphor pods:
- [[Biz - Case Study Name]] — brief description

## Cross-Book Connections
Link to modules that synthesize content from this book with other sources:
- [[Module - Topic Name]] — which pods from this book feed into it

## Notes
Any additional context, personal notes, or reading observations.
```

### Example: Good to Great

```markdown
---
tags: [book-map, business, strategy, leadership]
title: "Good to Great"
author: "Jim Collins"
status: 🟡 In Progress
domain: "Business"
total-chapters: 9
chapters-mapped: 3
pods-extracted: 6
created: 2026-04-04
---

# Good to Great — Jim Collins

## Overview
Research-based study of how companies transition from good performance to sustained
greatness. Collins' team analyzed 1,435 companies over 40 years, identifying 11 that
made the leap. Core thesis: greatness isn't about a single big move but disciplined
people, thought, and action.

## Key Themes
- Disciplined people (Level 5 Leadership, First Who Then What)
- Disciplined thought (Confront the Brutal Facts, Hedgehog Concept)
- Disciplined action (Culture of Discipline, Technology Accelerators)
- The Flywheel vs. the Doom Loop

## Chapter Map

### Ch 2 — Level 5 Leadership
- [[Biz - Level 5 Leadership]] — humility + will paradox in great leaders
- [[Biz - Darwin Smith Case Study]] — Kimberly-Clark transformation story

### Ch 3 — First Who, Then What
- [[Biz - First Who Then What]] — get the right people before setting direction
- [[Biz - Bus Seat Metaphor]] — "get the right people on the bus" analogy

### Ch 5 — The Hedgehog Concept
- [[Biz - Hedgehog Concept]] — intersection of passion, capability, and economic engine
- [[Biz - Walgreens vs Eckerd]] — case study of focused vs unfocused strategy

## Methodologies Extracted
- [[Biz - Hedgehog Concept]] — three-circle Venn framework for strategic focus
- [[Biz - Level 5 Leadership]] — leadership maturity model (Levels 1-5)

## Case Studies & Stories
- [[Biz - Darwin Smith Case Study]] — quiet CEO who transformed Kimberly-Clark
- [[Biz - Walgreens vs Eckerd]] — disciplined strategy vs scattered acquisitions
- [[Biz - Bus Seat Metaphor]] — Wells Fargo hiring philosophy

## Cross-Book Connections
- [[Module - Strategic Focus Frameworks]] — Hedgehog Concept + Porter's Five Forces + Blue Ocean
- [[Module - Leadership Models]] — Level 5 + Servant Leadership + Situational Leadership
```

---

## Capture Workflow

### `/learnpod capture --book "Good to Great" <concept description>`

1. **Parse `--book` flag** — extract book title from the flag value
2. **Find or create Book Map** — `Glob` for `Learning/Books/*.md`, match on title. If not found, create a new Book Map with the book title (prompt for author and chapter count).
3. **Standard pod capture** — same as existing flow, but:
   - Set `source: Book`
   - Set `source-ref: "<Book Title>, <chapter/section if provided>"`
   - Prompt for `content-type` if not obvious from context
   - Set `domain: "Business"` (or detect from content)
   - Use `Biz - ` prefix for Business domain pods
4. **Update Book Map** — add the new pod wikilink under the appropriate chapter section. Increment `pods-extracted`. Update `chapters-mapped` if a new chapter was added.
5. **Update MOC** — add to `MOC - Business.md` (create if first Business pod)
6. **Confirm** — standard confirmation plus Book Map reference:
   ```
   Pod captured: Learning/Pods/Biz - Hedgehog Concept.md
      Domain: Business | Source: Book | Type: framework
      Book: Good to Great (Ch 5)
      Book Map: Learning/Books/Good to Great.md (3/9 chapters, 6 pods)
      MOC updated: MOC - Business

      -> /learnpod capture --book "Good to Great" to add another
      -> /learnpod book-map "Good to Great" to view the book map
   ```

### `/learnpod book-map [title]`

View or create a Book Map:
- If title provided: show the Book Map contents, or create one if it doesn't exist
- If no title: list all Book Maps with progress stats

---

## VP Feedback Integration Checklist

### VP Education
- [x] Separate stories from frameworks — `content-type` field distinguishes cognitive purpose
- [x] Don't map every chapter — Book Map design says "not every chapter needs mapping"
- [x] Modules cross books — "Cross-Book Connections" section in Book Map, modules pull from multiple sources

### VP Engagement
- [x] Book completion progress — `total-chapters`, `chapters-mapped`, `pods-extracted` in frontmatter (vault-only now; **future:** app progress ring from books manifest)
- [x] "Book Club" streak variant — **Future:** reward 3+ book pods/week with special streak type
- [x] Story pods as shareable "Did You Know?" — **Future:** `content-type: case-study` enables filtering for daily prompts
- [x] Don't over-structure capture — individual pod capture with organic Book Map fill-in

### VP Design
- [x] Books are a filter, not a section — **Future:** source filter chip on explore page, not a new tab
- [x] Book Map is vault-only — explicitly scoped to Obsidian, not synced to app
- [x] Source badge on pod cards — **Future:** small book badge showing provenance
- [x] Don't build book browser yet — wait for 3+ books mapped

---

## Future State (Not Built Now)

These features are designed for but not implemented. Build when 3+ books are mapped and usage patterns are clear.

### 1. Books Manifest (`data/books.ts`)
Lightweight sync of Book Map frontmatter only (no content). Enables app-side features:
```typescript
interface BookSummary {
  slug: string;
  title: string;
  author: string;
  domain: Domain;
  totalChapters: number;
  chaptersMapped: number;
  podsExtracted: number;
  status: ContentStatus;
}
```
**Sync script change:** scan `Learning/Books/*.md`, parse frontmatter only, generate `data/books.ts`.

### 2. App Source Filter
Filter chip on explore page: "Source: Good to Great" filters pods by `sourceRef` containing the book title. No new page — just a filter on existing explore.

### 3. Source Badge on Pod Cards
Small `<BookTitle>` badge on PodCard component. Tapping filters to all pods from that book.

### 4. Book Completion Progress Ring
Ring component showing `chaptersMapped / totalChapters` for each book. Appears in a "Your Books" section (explore page, not a separate tab).

### 5. "Book Club" Streak Variant
Special streak badge when 3+ book pods captured in a week. Separate from daily learning streak.

### 6. "Did You Know?" Daily Prompt
Surface a random `content-type: case-study` pod as a daily prompt. Optionally push via notification.

### 7. Spaced Repetition Interleaving
SM-2 algorithm interleaves `case-study` pods before related `framework` pods, leveraging the episodic-then-semantic memory strengthening pattern identified by VP Education.

---

## Implementation Order

1. **Schema updates** — `learning-schema.md` (new fields, Business domain, Book Map section)
2. **Vault structure** — create `Learning/Books/`, Book Map template
3. **Skill updates** — `/learnpod capture` (--book flag), `/learnpod book-map` subcommand
4. **App types** — `types.ts` (Business domain, contentType, sourceRef fields)
5. **MOC** — create `MOC - Business.md` if it doesn't exist

Sync script and app UI changes are **future state** — not needed until books manifest is built.
