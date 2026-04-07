# LearnPod Post Type Playbooks
**Owner:** Sana Okafor
**Companion to:** `learnpod-brand-system.md`, `learnpod-content-production.md`
**Purpose:** A menu of repeatable post formats. Pick one, fill in the blanks, ship. Each playbook tells you the source shape it needs, the diagram primitive, the hook formula, and the slide structure.

When `/learnpod content` runs, it picks the best-fit playbook from this file based on the source pod/module's shape.

---

## How to use this guide

1. Look at your source pod/module
2. Find the playbook whose **"Use when"** matches
3. Use the **slide structure** as your skeleton
4. Use the **hook formulas** as A/B variants

---

## Playbook 01 — "Hidden Costs" (Comparison + Stacking)

**Use when:** The source has a baseline cost/state and 2-4 stacking optimizations that compound to a dramatic improvement.

**Examples from vault:** AI Cost Optimization · Backtesting Pitfalls · Token Tracking · Transaction Costs

**Diagram primitive:** Comparison (split-screen before/after) + Stack (architecture in slide 6)

**Hook formulas:**
- `{baseline} → {optimized}. Same {thing}. {N} changes.` ← *the strongest, uses real numbers*
- `You're paying the {expensive default} tax on {tasks the cheap option handles}.`
- `{N} lines of code = {%} off your {bill/loss}. The math is in slide 6.`

**Slide structure (7 slides):**
| # | Purpose | Content |
|---|---------|---------|
| 1 | HOOK | The number transformation |
| 2 | PROBLEM | Name the enemy / default |
| 3 | LEVER 1 | First optimization + savings badge |
| 4 | LEVER 2 | Second optimization + cumulative badge |
| 5 | LEVER 3 | Third optimization + cumulative badge |
| 6 | THE STACK (HERO) | Architecture diagram + payoff math |
| 7 | CTA | LearnPod link + next in series |

**Series:** Hidden Costs (bi-weekly)

---

## Playbook 02 — "One Book, Five Habits" (Book → Concepts)

**Use when:** Source is a Book Map with 5+ pods extracted, ideally cross-referenced to engineering/product concepts.

**Examples from vault:** Atomic Habits · Accelerate · Team Topologies · Continuous Delivery · Good to Great · The Mom Test

**Diagram primitive:** Stack (5 layers) + System (book-to-pod knowledge graph in slide 7)

**Hook formulas:**
- `I read {book} {N} times before I realized it was an {audience} book.`
- `{Author} never wrote a line of code. So why is {book} the best engineering book of the decade?`
- `{N} habits from {book}, mapped to your daily {practice}.`

**Slide structure (9 slides):**
| # | Purpose | Content |
|---|---------|---------|
| 1 | HOOK | Reframe the book for a builder audience |
| 2-6 | HABITS | One habit per slide, mapped to a concrete practice (link to a vault pod) |
| 7 | THE MAP (HERO) | Knowledge graph showing book → 5 connected pods. *This is the LearnPod product demo.* |
| 8 | SERIES PROMISE | "One book, five habits. Every Sunday. {N} books left." |
| 9 | CTA | LearnPod link + this book's full Book Map |

**Series:** One Book, Five Habits (weekly Sunday)

**Sub-brand:** Books (paper-50 + warm brown, hand-drawn arrows, Caveat font for annotations)

---

## Playbook 03 — "The {Thing} Lies" (Reel-First, Contrarian)

**Use when:** The source pod debunks a common assumption — especially in Quant, where every concept has a "naive view → hidden gotcha" structure.

**Examples from vault:** Backtesting Pitfalls · Sharpe Ratio · Maximum Drawdown · Kelly Criterion · Mean Reversion Strategies

**Diagram primitive:** Time-series (annotated chart) + Comparison

**Hook formulas (must work in first 1.5s of reel):**
- `This {chart} made {impressive number}. It's also a lie.`
- `Your {metric} is lying to you. Here's why in 30 seconds.`
- `Every {practitioner} learns this the hard way. You can learn it in 38 seconds.`

**Beat structure (38s reel):**
| Time | Beat |
|------|------|
| 0-3s | HOOK — show the impressive thing |
| 3-10s | PROBLEM — 4-pane diagram of the lies (1.5s each) |
| 10-25s | PAYOFF — animate the chart being corrected lie-by-lie |
| 25-35s | LESSON — the boring truth |
| 35-38s | CTA + loop frame |

**Carousel companion (5 slides):** Same beats, expanded to 5 static slides

**Series:** The {X} Lies (bi-weekly reel)

**Sub-brand:** Quant (black + amber, JetBrains Mono heavy, Bloomberg-terminal feel)

---

## Playbook 04 — "Whiteboard Wednesdays" (Single Diagram, High-Save)

**Use when:** The source has ONE concept that fits in ONE great diagram. The whole post is "here is the diagram, plus 3 sentences."

**Examples from vault:** RAG · Conway's Law · Team Topologies · BATNA & ZOPA · Eisenhower Matrix · Composition Root Pattern

**Diagram primitive:** Whatever fits the concept best — usually System or Quadrant

**Hook formulas:**
- `The {concept} explained in one diagram.`
- `If you only learn one thing about {topic}, learn this.`
- `{Famous person} spent {time} on this idea. Here's the 60-second version.`

**Slide structure (3 slides — minimal by design):**
| # | Purpose | Content |
|---|---------|---------|
| 1 | HOOK + DIAGRAM | The diagram IS the slide. Hook above, diagram fills 70% |
| 2 | THE GOTCHA | One sentence: the thing most people miss |
| 3 | CTA | LearnPod link |

**Series:** Whiteboard Wednesdays (weekly Wed)

**Why so short:** Saveability > shareability. People save the diagram for reference. 3 slides means low friction to swipe through.

---

## Playbook 05 — "Stack Tour" (System Architecture)

**Use when:** Source explains how a real system works under the hood — APIs, infra, AI pipelines.

**Examples from vault:** Claude API Cost Optimization · RAG Engineering · Continuous Delivery · Platform Strategy · Deposit Infrastructure

**Diagram primitive:** System (isometric) + Stack (vertical layers)

**Hook formulas:**
- `How {famous company / known system} actually {does the thing}.`
- `The {tech stack} that powers {known product}. In 7 slides.`
- `What's actually happening when you {trigger action}.`

**Slide structure (7 slides):**
| # | Purpose | Content |
|---|---------|---------|
| 1 | HOOK | The "you've used this 1000 times, here's how it works" angle |
| 2 | THE BLACK BOX | What you see as a user |
| 3-5 | THE LAYERS | One layer per slide, isometric |
| 6 | THE FULL STACK (HERO) | All layers assembled |
| 7 | CTA | LearnPod link |

**Series:** Stack Tours (bi-weekly)

---

## Playbook 06 — "Pattern of the Week" (Code/Practice Pattern)

**Use when:** Source is a single named pattern with a clear before/after — design patterns, refactoring patterns, leadership patterns.

**Examples from vault:** Boy Scout Rule · Clean Functions · Composition Root · Difficult Conversations · Founder-Led Sales · Strategic Thinking patterns

**Diagram primitive:** Comparison (before/after) + optional code block

**Hook formulas:**
- `One pattern. {time saved / problem solved}. Steal it.`
- `The {N}-line refactor that changed how I {practice}.`
- `Most {practitioners} get this wrong. Here's the fix.`

**Slide structure (5 slides):**
| # | Purpose | Content |
|---|---------|---------|
| 1 | HOOK | The pattern's name + the payoff |
| 2 | THE PROBLEM | What the wrong way looks like (code or scenario) |
| 3 | THE PATTERN | The right way, side-by-side |
| 4 | WHEN TO USE IT | 3 bullet conditions |
| 5 | CTA | LearnPod link |

**Series:** Pattern of the Week (weekly)

**Sub-brand:** General (ink-900 + signal-yellow) or Biz (ink-700 + signal-yellow) depending on domain

---

## Playbook 07 — "Field Notes" (Personal Story / Build-in-Public)

**Use when:** You have a real story from your own work — a thing you built, a mistake you made, a number you hit.

**Examples for LearnPod:** "How I built LearnPod in {N} days" · "Why I deleted half my queue" · "The $50/mo homelab stack"

**Diagram primitive:** Time-series (timeline) or Comparison

**Hook formulas:**
- `I {did thing}. Here's what worked, what didn't, and what I'd do differently.`
- `{N} {time units} ago I {started thing}. Today {result}. The exact playbook:`
- `I made {mistake}. Don't.`

**Slide structure (6 slides):**
| # | Purpose | Content |
|---|---------|---------|
| 1 | HOOK | The personal hook |
| 2 | THE GOAL | What you set out to do |
| 3 | THE APPROACH | What you actually did |
| 4 | THE NUMBERS | Real metrics — *only if you have them and they're shareable* |
| 5 | THE LESSON | What you'd tell past-you |
| 6 | CTA | LearnPod link |

**Series:** Field Notes (irregular, when stories are fresh)

**Caution:** These have the highest reach potential AND the highest risk of overclaiming. **Never invent numbers** — Sana's #1 rule.

---

## Playbook selection cheat sheet

```
Source has compounding optimizations?         → Playbook 01 (Hidden Costs)
Source is a book?                             → Playbook 02 (One Book, Five Habits)
Source debunks a common assumption?           → Playbook 03 (The X Lies, reel)
Source = one great diagram?                   → Playbook 04 (Whiteboard Wednesdays)
Source explains how a system works?           → Playbook 05 (Stack Tour)
Source is a named code/practice pattern?      → Playbook 06 (Pattern of the Week)
You have a personal story to tell?            → Playbook 07 (Field Notes)
```

If a source fits multiple playbooks, default order: **01 > 03 > 05 > 02 > 06 > 04 > 07**. Bigger number-payoff posts win.

---

## Adding new playbooks

When Sana invents a new format:
1. Test it manually for 2 posts first
2. If it works, add a numbered playbook here
3. Update the cheat sheet
4. Update the `/learnpod content` skill to recognize the source shape that triggers it
