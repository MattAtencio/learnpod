# Carousel — The AI Cost Diet
**Series:** Hidden Costs #01
**Source:** `Module - Claude API Cost Optimization` (Obsidian vault)
**Domain:** AI Engineering
**Sub-brand palette:** ink-900 bg + signal-cyan accent + JetBrains Mono labels
**Format:** IG Carousel 1080×1350, 7 slides
**Template:** ByteByteGo flat-isometric, 7-slide canonical
**CTA destination:** learnpod.app/start (Marcus's funnel)

---

## Slide 1 — HOOK
**Layout:** Big type, single line, centered, signal-cyan underline
**Copy:**
> $225/day → $33/day.
> Same workload. Same model family. 4 changes.

**Footer:** `hidden costs · 01` (mute-grey, 18pt)

---

## Slide 2 — THE PROBLEM
**Layout:** Centered statement + warn-coral icon (alert-triangle, lucide)
**Copy:**
> Most teams pay the **Opus tax** on every request.
>
> They reach for the most expensive model by default — even for tasks Haiku could finish in milliseconds.

**Visual:** Three model boxes (Haiku $1, Sonnet $3, Opus $5) with all traffic flowing to Opus. Red strikethrough on Haiku/Sonnet paths.

---

## Slide 3 — LEVER 1: RIGHT-SIZE THE MODEL
**Layout:** Decision tree, isometric, numbered (1)
**Copy header:** `01 · pick the right tool`
**Body:**
- Mechanical task (classify, extract, format) → **Haiku** ($1/$5)
- Creative / analytical → **Sonnet** ($3/$15)
- Multi-step reasoning, high-stakes → **Opus** ($5/$25)

**Visual:** Decision tree with 3 leaves. Each leaf shows model name + price/MTok. Cyan arrows.
**Caption (bottom):** *"60% of your traffic is Haiku-tier. You're paying 5× for it."*
**Savings tag (yellow corner badge):** `−62%`

---

## Slide 4 — LEVER 2: CACHE THE STABLE STUFF
**Layout:** Before/after split, isometric, numbered (2)
**Copy header:** `02 · don't repeat yourself`
**Body:**
> System prompts and tool defs don't change between requests. Cache them.
>
> Cache reads cost **10% of base** — a 90% discount on every repeated token.

**Visual:** Two stacked diagrams.
- LEFT (warn-coral): "Every request" — full 5K system prompt processed each time
- RIGHT (signal-cyan): "With cache" — system prompt cached once, then 0.1× cost forever
**Caption:** *"5-min cache breaks even after 1 read. 1-hour cache after 2."*
**Savings tag:** `−80%` (cumulative)

---

## Slide 5 — LEVER 3: BATCH WHAT CAN WAIT
**Layout:** State machine, flat, numbered (3)
**Copy header:** `03 · wait for the discount`
**Body:**
> Anything that doesn't need a real-time response → Batch API.
>
> Flat **50% off** input AND output. Up to 100,000 requests per batch. Usually finishes in under an hour.

**Visual:** Pipeline: `submit → queue → process → results (29-day window)`. Each node a flat box, cyan arrows.
**Caption:** *"Nightly evals, classification jobs, content generation — all batchable."*
**Savings tag:** `−85%` (cumulative)

---

## Slide 6 — THE STACK
**Layout:** Isometric architecture diagram (the headline visual)
**Copy header:** `the full stack`
**Visual:** The architecture from the source module:
```
Incoming tasks
    ↓
[Haiku classifier]
    ↓
┌─────┬─────┬─────┐
│Haiku│Sonn.│Opus │   ← model routing
│ 60% │ 35% │ 5%  │
└──┬──┴──┬──┴──┬──┘
   └─────┼─────┘
         ↓
   [Prompt cache]   ← 90% off prefix
         ↓
   ┌─────┴─────┐
   ↓           ↓
[Realtime] [Batch ½×]
```
**Body (below diagram):**
> 10,000 requests/day. 2K input + 500 output each.
>
> **All Opus, no optimization:** $225/day
> **Stacked (route + cache + batch):** ~$33/day
>
> **= 85% reduction. Same workload. Same model family.**

---

## Slide 7 — CTA
**Layout:** Big type CTA, signal-yellow accent for the link (this is the only slide that breaks the cyan rule — yellow = action)
**Copy:**
> I track 268 of these in **LearnPod**.
>
> Free. Two-minute reads. Connected by a knowledge graph.

**Button mock:** `learnpod.app/start →`
**Footer:** `hidden costs · 01 of ∞` (mute-grey)
**Bottom-right badge:** small QR to learnpod.app/start

---

## Hook variants (A/B tests Sana suggests)
1. *"$225/day → $33/day. Same workload. Same model family. 4 changes."* (current — specific number, contrarian)
2. *"You're paying the Opus tax on requests Haiku could finish in 200ms."* (named enemy)
3. *"4 lines of code = 85% off your Claude bill. The math is in slide 6."* (curiosity gap + payoff promise)

## Sana's notes
- Slide 1 must hit *muted*. The number does that work — no read required.
- Slide 6 is the saveable slide. People will screenshot it. Make it the strongest visual.
- Slide 7 is the only place yellow appears. Yellow = action. Cyan = information. Hold the line.
- Alt text on every slide — accessibility AND search.
