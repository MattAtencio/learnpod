# LearnPod Brand & Content System v2.0
**Owner:** Sana Okafor (VP Marketing, Digital Assets & Graphic Design)
**Created:** 2026-04-06 · **Updated:** 2026-04-07 (v2.0 — reconciled to shipped app: warm amber + Fraunces wins, supersedes cool cyan/Inter Tight v1.x)
**Purpose:** The single source of truth for every public-facing LearnPod asset. If it's not in here, it's off-brand. If it's in here, it ships without a meeting.

> **v2.0 reconciliation note:** v1.x described a cool cyan/yellow palette on `#0B0F19` with Inter Tight + Inter typography. The shipped app at `app/globals.css` uses warm amber on `#13100d` with Fraunces serif + Outfit sans, and the VP Marketing review (2026-04-06) ruled "the app wins" because the warm reading-room aesthetic is more on-brand for "your knowledge vault" than the original cool tech palette. **The app is canonical; this doc mirrors it.** Future drift gets resolved the same way — change `app/globals.css` first, then update this doc to match. Never edit this doc to drift away from the running app.

**Companion docs (read together):**
- `learnpod-content-production.md` — the 4-layer tool stack (Claude → Figma → MJ/Ideogram → CapCut), file flow, execution plans per layer
- `learnpod-post-types.md` — 7 numbered playbooks (Hidden Costs, One Book Five Habits, The X Lies, Whiteboard Wednesdays, Stack Tour, Pattern of the Week, Field Notes)
- `~/.claude/skills/learnpod/SKILL.md` — `/learnpod content` automation that picks a playbook and outputs Figma-ready copy + Mermaid diagrams

---

## 1. Brand Position

**One-liner:** *LearnPod turns the videos you save and the books you start into a knowledge graph that compounds.*

**Audience (in priority order):**
1. **Builder-operators** — engineers, founders, PMs who already save Instagram reels but never revisit them
2. **Self-directed learners** — people reading 5+ books/year who want their notes to connect
3. **Quant-curious traders** — niche but extremely high-save-rate audience for the Quant track

**Voice:** Direct, opinionated, builder-to-builder. Never aspirational mush. Never "thought leadership." Show, don't tell. The voice of a senior engineer who teaches at the whiteboard, not on a stage.

**Anti-patterns (never do):**
- Stock photos of people pointing at laptops
- "Game-changing," "revolutionary," "unlock your potential"
- Hashtag soup
- Inspirational quotes over gradients
- AI-generated cover art that looks like every other AI cover

---

## 2. Visual Foundations

### 2.1 Master palette (the LearnPod core)

Tokens are mirrored from `app/globals.css:3-19`. **Do not edit these without first editing globals.css.**

| Token | Hex | Use |
|-------|-----|-----|
| `--bg` | `#13100d` | Primary background — warm near-black, "study lounge at night" |
| `--surface` | `#1e1a15` | Card background |
| `--surface2` | `#2b2520` | Elevated surface (modals, popovers) |
| `--surface3` | `#342e27` | Disabled / inactive surface |
| `--border` | `rgba(255,220,140,0.09)` | Hairline divider, warm-tinted |
| `--text` | `#f0ebe2` | Primary text — warm cream |
| `--muted` | `#a89a8c` | Secondary text (≥14px) |
| `--muted-strong` | `#c4b6a4` | Small text (≤12px) — higher contrast |
| `--amber` | `#f5a623` | **Primary brand accent** — CTAs, highlights, "study lamp" warmth |
| `--coral` | `#ff6b5b` | Warnings, "overdue," before-state, urgency |
| `--teal` | `#3ecfb2` | Calm signal, "welcome back," success-secondary |
| `--blue` | `#6ea8fe` | AI Engineering accent, "learning" review status |
| `--purple` | `#b08ef5` | DevOps / Tools accent |
| `--green` | `#5dd68c` | Success, "mastered," goal-hit, completed |

**Background gradient overlay** (`globals.css:62-72`) — fixed atmospheric radial: warm amber top-right (`rgba(245,166,35,0.07)`) + cool teal bottom-left (`rgba(62,207,178,0.05)`). This is the "lit room" effect; preserve it on every shipped surface.

**Rule:** Two-color max per slide. Background + one accent. Amber is the brand color and should appear in 60%+ of posts. The other accents (coral/teal/blue/purple/green) should be **rare and meaningful** — used to encode state (coral = overdue/warning, green = done, blue = learning, etc.), not decoration.

### 2.2 Sub-brand palettes (per domain)

Each domain inherits the warm `#13100d` background and swaps the *accent* so the feed is recognizable but varied. Accent colors come from the same shipped palette — no new hex values.

| Sub-brand | Background | Accent | Vibe |
|-----------|------------|--------|------|
| **AI Engineering** | `#13100d` | `--blue` `#6ea8fe` | Terminal, technical, "what's running" |
| **AI for Everyone** | `#13100d` | `--blue` `#6ea8fe` | Friendly entry point to AI |
| **Quant & Trading** | `#000000` (true black) | `--amber` `#f5a623` | Bloomberg terminal, monospace-heavy, equity-curve land |
| **Financial Models** | `#13100d` | `--teal` `#3ecfb2` | Calm, analytical, money flows |
| **Business / Product** | `#13100d` | `--amber` `#f5a623` | Reading-room, builder-to-builder |
| **DevOps / Tools** | `#13100d` | `--purple` `#b08ef5` | Pipelines, infra, "the wires behind the wall" |
| **ML Models** | `#13100d` | `--blue` `#6ea8fe` | Model internals, math-light |
| **Books (long-form deep dive)** | `#13100d` | `--amber` `#f5a623` | Margin-note serif treatment, Fraunces leaning extra hard |
| **General / Default** | `#13100d` | `--amber` `#f5a623` | The fallback — warm, neutral, brand-anchor |

### 2.3 Type system

The shipped app uses **Fraunces** (serif display) + **Outfit** (sans body). This is the editorial moat — no other learning app has a literary serif. Lean into it.

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Display (slide hooks, reel titles, hero headlines) | **Fraunces** | 600 | The voice of the brand. Use generously. |
| Body (slide copy, captions, button text) | **Outfit** | 500 / 600 / 700 | 1.35–1.5 line-height |
| Mono (code, numbers, data labels) | **JetBrains Mono** | 500 | Used **sparingly** — for numbers and code only. Not liberally. The Fraunces+Outfit pairing is the voice; Mono is an accent. |
| Hand (Books deep-dive only, optional) | **Caveat** or **Kalam** | 400 | Margin annotations, arrows — sparing |

**Type scale (carousel, 1080×1350):**
- Hook: 96–120pt Fraunces
- Section title: 56–64pt Fraunces
- Body: 36–42pt Outfit
- Caption/label: 22–26pt Outfit
- Source/footer: 18pt Outfit
- Numbers/data: JetBrains Mono at the same size as the surrounding Outfit body

**Type scale (in-app, mirrored from `globals.css`):**
- Hero headline: 30px Fraunces 600
- Section title: 18px Fraunces 600 (`.section-heading` is 14px — that's a smaller secondary style)
- Body: 14px Outfit 500
- Meta: 11–12px Outfit (use `--muted-strong` at this size)

**Type scale (carousel, 1080×1350):**
- Hook: 96-120pt
- Section title: 56-64pt
- Body: 36-42pt
- Caption/label: 22-26pt
- Source/footer: 18pt

### 2.4 Icon grammar

- **Library:** Lucide (open source, consistent stroke). Stroke width fixed at 2px.
- **Custom set (commission):** 24 LearnPod-specific icons (pod, module, streak, graph, book-open, etc.)
- **Rule:** Icons are *labels*, not decoration. If an icon doesn't carry meaning, remove it.

### 2.5 Diagram language (the ByteByteGo discipline)

Every diagram must pick exactly ONE of these primitives:

1. **Flow** — left-to-right arrows, numbered steps, "request travels through system" stories
2. **System (isometric)** — boxes-with-arrows, the "here's what's actually running" diagram
3. **Comparison (split-screen)** — left = wrong way, right = right way (or before/after)
4. **Stack** — vertical layers, "what's underneath what"
5. **Quadrant** — 2×2 matrix for tradeoffs and frameworks (BATNA/ZOPA, Eisenhower, etc.)
6. **Time-series** — annotated chart (Quant only — equity curves, drawdowns)

**Constraints:**
- Max 7 nodes per diagram. If you need 8, split into two diagrams.
- Numbered steps if order matters. Numbers go in filled circles, top-left of each node.
- Arrows are 2px, **amber** for primary flow (or coral for "wrong path", green for "right path"). Never grey.
- Labels in JetBrains Mono **only when they're code or numbers** — otherwise Outfit. 22pt, all-lowercase except acronyms.
- White space is a feature. 15% margin minimum.

---

## 3. Content Templates

### 3.1 Carousel template (IG / LinkedIn) — 1080×1350

**7-slide canonical structure:**

| # | Slide | Purpose | Template |
|---|-------|---------|----------|
| 1 | **HOOK** | Stop the scroll | Big type, single line, ink-900 bg, accent-color underline |
| 2 | **THE PROBLEM** | Name the enemy | One sentence + warn-coral icon or before-diagram |
| 3-5 | **THE STEPS** | Payoff (3 steps) | Numbered diagram per slide, one idea each |
| 6 | **THE PAYOFF** | Show the result | After-diagram or summary table |
| 7 | **CTA** | Drive to app | "I track 268 of these in LearnPod →" + URL + QR optional |

**Variations:**
- **List carousel** (9 slides): hook + 7 items + CTA. Use sparingly — lists feel cheap; only if the list IS the hook ("7 hidden costs of...").
- **Story carousel** (8 slides): hook + setup + conflict + 4 beats + CTA. Use for case studies.

### 3.2 Reel / Short template — 30-45s, 1080×1920

**Beat structure:**
- **0-3s HOOK** — visual pattern interrupt + spoken claim. Must work *muted* (caption burned in).
- **3-8s PROMISE** — "here's what I'll show you in 30 seconds"
- **8s to 80% — PAYOFF** — 3-5 numbered beats, ≤2s each
- **Last 5s CTA + LOOP** — closing frame visually rhymes with opening frame so re-watch is invisible

**Production rules:**
- Captions burned in, not relying on platform auto-caption
- One screen, one idea — no split-screens unless it's a comparison
- Music: low-key, lyric-free, no trending audio chasing (Sana's call: trends age fast, brand consistency compounds)
- B-roll: only if it's a real screen recording. Never stock.

### 3.3 Tweet thread template — 5-8 tweets

- T1: Hook (same as carousel slide 1, rewritten for X)
- T2: Why this matters (1 sentence)
- T3-T7: One step per tweet, each with a code block, screenshot, or mini-diagram
- Last tweet: CTA to LearnPod + link

### 3.4 LinkedIn doc

Same as IG carousel, exported as 1200×1500 PDF, 6-9 pages. CTA page links to learnpod.app/start.

---

## 4. Series System

Series create *anticipation*. One-off posts don't compound. Every published asset must belong to a series.

**Launch series (in priority order):**

| # | Series | Cadence | Format | Source |
|---|--------|---------|--------|--------|
| 1 | **Hidden Costs** | Bi-weekly | IG carousel | AI Eng, Tools modules (cost/perf concepts) |
| 2 | **One Book, Five Habits** | Weekly Sunday | LinkedIn doc + IG carousel | Books library (33 books = 8 months) |
| 3 | **The Backtest Lies** | Bi-weekly | Reel | Quant pods (14 = ~7 months) |
| 4 | **Whiteboard Wednesdays** | Weekly Wed | IG carousel, single diagram | Any module — pick the most diagram-shaped concept |

**Series rules:**
- Same opening visual treatment every time (recognizable in feed)
- Same closing CTA frame
- Numbered ("Hidden Costs #03 — Wrong model tier") so completionists feel the pull

---

## 5. Repurposing Pipeline (the 1→6 rule)

Every Pod or Module produces:

```
Source (Pod/Module/Book Map)
        │
        ▼
[/learnpod content {name}]
        │
        ├──> carousel.md   ──> IG carousel + LinkedIn doc
        ├──> reel.md       ──> IG Reel + TikTok + YT Short
        ├──> tweet-thread  ──> X thread
        └──> assets-needed ──> design queue
```

**Yield target:** 1 Module → 6 distinct assets across 3 platforms over 2 weeks. No asset is "the same post reposted" — each is the same idea in the right shape for the platform.

---

## 6. Production Workflow

1. **Tuesday:** Run `/learnpod content {next-in-series}` to draft the bundle
2. **Tuesday PM:** Sana review (`/vp-marketing-review {slug}`) — kill or refine
3. **Wednesday:** Designer (or Claude with templates) produces visuals
4. **Thursday:** Marcus review (`/vp-engagement-review {slug}`) — confirm CTA lands in a habit loop
5. **Friday:** Schedule for following week
6. **Following Mon-Sun:** Ship per series cadence

**Production budget per asset (target):** 2 hours after templates exist. If it takes more, the template needs work.

---

## 7. Distribution

| Platform | Cadence | Primary format | Purpose |
|----------|---------|----------------|---------|
| Instagram | 2 carousels/wk + 1 reel/wk | Carousel | Discovery, saves |
| LinkedIn | 1 doc/wk | LinkedIn doc | B2B credibility, builder audience |
| X / Twitter | 2 threads/wk | Thread | Distribution amplifier, dev audience |
| YouTube Shorts | 1/wk | Reel repurpose | Long-tail SEO, free hosting |
| Email (LearnPod newsletter) | 1/wk Sunday | Markdown digest | Owned audience, retention |

**Owned > rented.** Every post drives to `learnpod.app/start` → email capture → first pod → streak begins. The platform algorithms are rented; the email list is owned.

---

## 8. Brand System Gaps (TODOs before first ship)

These must be resolved before Post 1 (AI Cost Diet) ships:

- [ ] **Logo lockup** — wordmark + glyph, light + dark variants
- [ ] **Carousel template files** — Figma file with 7 master slides per sub-brand (5 sub-brands × 7 slides = 35 master frames)
- [ ] **Reel template** — CapCut or Premiere project with title cards, lower-thirds, end frame
- [ ] **24 custom Lucide-style icons** — pod, module, streak, graph, book-open, before, after, cost, savings, etc.
- [ ] **Fonts licensed / loaded** — Fraunces, Outfit, JetBrains Mono (Caveat optional, Books only). All available via Google Fonts; the app already loads Fraunces + Outfit via `next/font`
- [ ] **learnpod.app/start landing page** — single email field, single value prop, one CTA (Marcus's blocker for Post 1)
- [ ] **QR code** — points to learnpod.app/start, used in print-style assets

---

## 9. Approval Authority

- **Sana** approves: visual treatment, hook copy, slide structure, brand consistency, format choice
- **Marcus** approves: CTA destination, where the asset lands the user in the funnel, retention hook
- **Matt** approves: anything claiming a personal stat, project name, or revenue number
- **Auto-ship** if: it's a series entry, uses a template unchanged, and CTA matches the series default

---

## 10. Living Document

This spec is v2.0 — reconciled to the shipped app on 2026-04-07. **Protocol for visual changes going forward: edit `app/globals.css` first, then update this doc to match.** Never edit this doc to drift away from the running app. Bump the version on every reconciliation. Never delete — strike-through outdated sections so we keep the history of why things changed.

**Version history:**
- **v2.0** (2026-04-07) — Reconciled to shipped app. Warm amber `#f5a623` + Fraunces wins. Supersedes v1.x cool cyan/Inter Tight palette. Sub-brand palettes rebuilt around the shipped 7-color system.
- **v1.1** (2026-04-06) — Added companion docs (content-production, post-types). Visual tokens unchanged from v1.0 but already drifting from the app.
- **v1.0** (2026-04-06) — Initial spec. Cool cyan/yellow on `#0B0F19`, Inter Tight + Inter. Never matched the shipped app.
