# VP Marketing Review — LearnPod Home Screen as Brand Front Door

**Reviewer:** Sana Okafor, VP Marketing, Digital Assets & Graphic Design (ex-ByteByteGo, ex-Duolingo Social)
**Date:** 2026-04-06
**Scope:** Home screen (`app/page.tsx`, `HomeClient.tsx`, `Onboarding.tsx`, `StreakBar`, `DailyGoal`, `PodCard`, `ModuleCard`) as the brand's top-of-funnel front door. Catalog: 66 pods / 8 modules / 3 lessons / 9 domains.
**Co-review:** Aligned with Marcus Chen's `vp-engagement-2026-04-06.md` — my job is to get them in the door, his job is to keep them coming back. This review focuses on acquisition + virality; Marcus handles retention + loops.

---

## Executive Summary

The product underneath this home screen is strong — genuine spaced-repetition, a legitimate streak system, a real content catalog. But the home screen is not doing marketing work. It's a **private dashboard**, not a **brand front door**. If I screenshot `HomeClient.tsx` and drop it into a feed with no context, a stranger cannot tell me what LearnPod is, who it's for, or why they'd come back. That is the definition of a front door that doesn't open outward.

Three specific things are happening. First, **the hero is "Your Queue, Matt." with a category scroll under it** — that is the layout of Netflix for a subscriber, not a product that needs to acquire and re-activate users. The positioning line ("Bite-sized learning from your knowledge vault") only shows during onboarding, which means after day one, nobody ever sees the product's answer to "what am I doing here." Second, **the home has zero shareable surface area.** There is no streak share card, no "pod of the day" with a saveable image, no milestone share, no diagram exporter, no badge the user could screenshot and tweet. The 7-day Bronze milestone — the single biggest earned-moment in the app — fires a modal that closes. That is content-engine gold being thrown in the trash. Third, **the brand identity in `globals.css` (warm amber on `#13100d`, Fraunces serif, Outfit sans) does not match the brand spec** in `~/.claude/docs/learnpod-brand-system.md` (cyan/yellow on `ink-900`, Inter Tight + JetBrains Mono, ByteByteGo-style). The app shipped one aesthetic; the brand canon describes another. We must reconcile these before a single post goes out, or the feed and the app will look like two different products.

The opportunity is enormous and cheap. The catalog is already diagram-shaped — 66 pods across AI Engineering, Quant, Business, DevOps is the exact mix that created ByteByteGo's feed. We don't need more content; we need to turn the existing content into the front door. Specifically: (1) replace the static "Your Queue, Matt." hero with a state-aware hero that also serves as a brand positioning line for first-time/anonymous visits; (2) add a "Pod of the Day" public-shareable card the user can export as a 1080×1350 carousel slide; (3) reconcile the amber/Fraunces app aesthetic with the brand spec and pick one; (4) wire the milestone overlays into a one-tap share card generator. Combined with Marcus's Next Best Action hero, the home becomes both the retention surface and the acquisition engine — and every user session starts producing marketing assets as a byproduct.

---

## Catalog Audit — what's in the library and what's diagram-shaped

From `lib/types.ts` the domain taxonomy is AI Engineering, AI for Everyone, Business, DevOps, Quant & Trading, Financial Models, Tools & Platforms, ML Models, General. The home surfaces the library as an 8-card horizontal scroll under "Today's Pods" sorted by preferred domains. There's no editorial framing. At 66 pods this is already "too many choices, not enough story."

**Diagram-shape density is very high.** From the domain mix and the pod/module architecture, I'd estimate 70-80% of the catalog is already shaped for one of the six ByteByteGo diagram primitives (flow, system, comparison, stack, quadrant, time-series). The Quant domain especially — Sharpe, drawdown, Kelly, mean reversion — is all time-series + comparison. AI Engineering — RAG, cost optimization, model tiers — is all stack + flow. Tools & Platforms is pure system. **This catalog was born to be a content engine; it's currently hidden inside an app.**

**What's NOT diagram-shaped:** the *catalog itself*. The home shows cards with emoji + title + minutes + XP. No diagrams leak into the shell. That means the brand of the app does not signal "this is the place where hard concepts become pictures you can save." It signals "this is a to-do list of learning tasks." Those are two completely different brand promises.

**What's missing from the catalog entirely:** a "Pod of the Day" / "Whiteboard Wednesday" editorial curation layer. There's a review queue (learner-driven) but no editor-picked, date-stamped "this is the one concept everyone should see today" surface. That single surface is the raw material for the daily content engine.

---

## The Home as a Brand Front Door — what works, what doesn't

### What's working (don't touch these)

1. **The serif-sans pairing** (Fraunces display + Outfit body) is a real, distinctive type voice. It's not the brand-spec Inter Tight but it's *better than* Inter Tight for a learning app because Fraunces has warmth and personality. Keep it — I'd rather update the brand spec than replace the fonts.
2. **The dark amber palette on `#13100d`** is a *cohesive, shippable* dark theme. Warm, library-coded, reading-room vibe. This is on-brand for "your knowledge vault" in a way the spec's cool cyan/ink was not. Keep it.
3. **The fade-up section animation** (`fade-1` through `fade-4` in globals.css, 70-350ms stagger) is polished and reads as intentional. Marketing screenshots will look alive.
4. **The greeting header component** (`Good Morning / Your Queue, Matt. / M avatar`) is a nice typography moment. The *content* is wrong (more on that below) but the *layout* should stay.
5. **The horizontal pod scroll with domain tag + duration + start button** is a clean Instagram Story-esque pattern. It already looks like content; it just needs to *be* content.

### What's broken from a brand standpoint

**BR1. The hero is private, not public.** "Your Queue, Matt." makes zero sense to a first-time visitor or screenshot viewer. The product never introduces itself after day 1. The brand line from `learnpod-brand-system.md` — *"LearnPod turns the videos you save and the books you start into a knowledge graph that compounds"* — appears nowhere in the app shell. It only lives in the onboarding welcome screen (`Onboarding.tsx:117`) and it's softer there: "Bite-sized learning from your knowledge vault. 2 minutes a day builds expertise." That's two different positioning statements, neither of them sticky, both of them hidden.

**BR2. Zero shareable surface area.** I searched the home, the PodCard, the StreakBar, the DailyGoal, the milestone overlay, and the celebration overlay. There is not one single "Share" or "Export" button anywhere. The 7-day Bronze milestone modal (`StreakBar.tsx:148-193`) — a legitimately beautiful earned-moment — has a "Keep Going!" button that just closes the modal. **That modal should be a one-tap share-card generator.** Duolingo's streak share is the single most reposted content from their app. We are literally deleting the best content the app produces.

**BR3. The app aesthetic and the brand spec disagree.** `globals.css:4-19` defines `--bg: #13100d`, `--amber: #f5a623`, `--coral`, `--teal`, `--blue`, `--purple`, `--green` — a warm, 7-color palette. `learnpod-brand-system.md §2.1` defines `ink-900 #0B0F19`, `signal-yellow #F5D547`, `signal-cyan #3DD5F3`, with a strict "two colors max per slide" rule. The app has 7 accent colors; the spec has 2. The spec was written after the app shipped. **We need to reconcile — and my vote is the app wins and the spec updates to match** because the warm palette is actually more on-brand for a reading-room learning product than the cool cyan/yellow. This is a 2-hour fix: rewrite brand-system.md §2.1-2.2 to match the shipped tokens, then freeze them.

**BR4. No "what is this" surface for anonymous / first-fold / screenshot contexts.** The home has no above-the-fold answer to "what is LearnPod." Compare Duolingo's home: the owl + "keep your streak alive" / "practice Spanish" is on every single screen, every single time. LearnPod's home says "Your Queue, Matt." which means nothing to anyone except Matt. This is a brand hygiene issue separate from the NBA debate — even Marcus's state-aware hero needs an *under*-hero tagline slot.

**BR5. The onboarding is the strongest marketing moment in the app, and it's one-shot.** `Onboarding.tsx:99-135` is genuinely good: 🧠 emoji, big Fraunces "Welcome to LearnPod," the positioning line, the gradient CTA. This screen is a carousel slide in waiting. Screenshot it, drop it in feed, it *works*. But users see it exactly once, and then the product never speaks that language again. **That onboarding screen is the template for a monthly "What is LearnPod" post** — and it's also the template for the missing home hero for lapsed / anonymous visits.

**BR6. Domain emojis are doing brand work they shouldn't be doing.** `DOMAIN_CONFIG` maps AI → ⚡, Quant → 📈, Business → 📖, etc. Emojis are fine for MVP but they are the #1 brand-scaling problem later: they don't export cleanly into carousel slides, they break cross-platform (emoji rendering differs iOS/Android/Web), they feel cheap in a product that otherwise looks premium (Fraunces + dark amber). **The brand spec calls for 24 custom Lucide-style icons** — that's still the right call. This is a known gap; I'm flagging it because the home is the most visible place the gap shows.

**BR7. The home has no "content engine tie-in" — no public pod feed, no RSS, no OG image.** Every pod detail page *should* auto-generate an OG share image (1200×630) with pod title + domain tag + LearnPod wordmark. Shared URLs get pretty cards. None of that exists yet. This is the cheapest marketing win in the whole review.

---

## Recommended Hero Messaging (the new top of the home)

Replace `HomeClient.tsx:58-65` with a **state-aware hero** that serves both retention AND positioning. Marcus wants a single Next-Best-Action CTA; I want a positioning line. They stack.

### Hero copy by state

| State | Headline (Fraunces 26pt) | Sub-line (Outfit 13pt muted) | CTA |
|-------|--------------------------|------------------------------|-----|
| **First session post-onboarding** | `Your first pod is ready.` | `Turn a 2-minute video into a lifelong habit.` | `Start pod ▶` (amber) |
| **Returning, goal not hit, no risk** | `Pick up where you left off.` | `{N} pods, {M} min to hit today's goal.` | `Continue ▶` (amber) |
| **Returning, goal hit** | `You hit today's goal.` | `Bonus round — keep the streak hot.` | `One more ▶` (green) |
| **Streak at risk, past noon** | `Save your {N}-day streak.` | `One pod. Two minutes. Done.` | `Save it now ▶` (coral) |
| **Lapsed 3+ days** | `Welcome back.` | `Your notes are waiting. Start small.` | `Ease back in ▶` (teal) |
| **Brand new / anonymous** | `Learn like a builder.` | `LearnPod turns the videos you save and books you start into a knowledge graph that compounds.` | `Get started ▶` (amber) |

The "brand new / anonymous" variant is **the screenshotable hero** — the one that becomes a carousel slide, a press image, an OG image, a landing page top. This is the brand line escaped from onboarding.

### The always-visible brand lockup

Under the greeting area, add a persistent 1-line brand-echo in `mute-grey`:

```
LearnPod · Bite-sized learning that compounds.
```

14pt, mute color, never clicks, always there. Duolingo does this with the owl. It costs us 20 vertical pixels and buys us a permanent brand signature in every screenshot.

---

## Surfaceable Shareables (the content engine tie-ins)

These are the new surfaces that turn the home from a dashboard into an asset factory. Every one is cheap, most are single-component additions.

### S1. "Share your streak" card on the milestone overlay — *the #1 priority*

**Where:** `StreakBar.tsx:148-193` (the milestone celebration modal)
**Change:** Add a `Share` button next to `Keep Going!` that generates a 1080×1350 PNG with the Bronze/Silver/Gold/Diamond badge, the day count in Fraunces 120pt, "Day {N} of learning with LearnPod," a QR code to learnpod.app/start, and the user's first name. One tap → downloads the image + copies "I just hit my 7-day streak on LearnPod 🥉" to clipboard. Use `html2canvas` or a Next.js `/api/og/streak/[count]` endpoint (the latter is cleaner).
**Why:** This is the single highest-virality moment in the app. A 30-day-streak share from a builder audience is worth 20 paid impressions. **It is already being thrown away** when the user taps "Keep Going!" and the modal closes.
**Cost:** Half a day. The design already exists — the modal itself is the share image. We literally just need to export it.

### S2. "Pod of the Day" card — editorial curation + auto-carousel export

**Where:** New home section above "Today's Pods," title: `Today's Whiteboard`
**What:** A single large card (full-width, not horizontal scroll) that features one editor-picked pod per day. The card has the pod title, its diagram primitive, a 4-line snippet, domain tag, and a `Share as image` button that exports the card as a 1080×1350 carousel slide.
**Editorial source:** A flat JSON file `content/daily.json` with `[{date, slug}, ...]`. 60 days of picks = 2 hours of editorial curation.
**Why:** This gives us (a) a date-stamped editorial voice, (b) a daily post we can schedule on IG/LinkedIn/X automatically, (c) the "Whiteboard Wednesdays" series from `learnpod-post-types.md §Playbook 04` made native, (d) an above-fold brand anchor that signals "this is curated, not just a library."
**Cost:** 1 day for the UI, 2 hours for seed editorial, ongoing 5 min/day to pick.

### S3. Auto-generated pod detail OG images

**Where:** `app/pods/[slug]/page.tsx` + new `app/api/og/pod/[slug]/route.tsx` using Next.js `ImageResponse`
**What:** Every pod detail URL gets a dynamic 1200×630 OG image with pod title (Fraunces 64pt), domain tag chip, estimated minutes + XP, LearnPod wordmark, dark amber aesthetic. Add `<meta property="og:image">` to the pod detail `<head>`.
**Why:** Every time a user shares a pod URL anywhere — Slack, Discord, Twitter DM, email — it becomes a branded preview. Right now it's a blank card. This is the lowest-effort highest-yield marketing addition in the app.
**Cost:** 2-3 hours. Next.js `@vercel/og` makes this trivial.

### S4. Home "brag strip" — the always-visible ambient stats

**Where:** New compact row between `DailyGoal` and "Today's Pods," before the review queue
**What:** Three tiny stat tiles — `{N} pods mastered · {W} week streak · {XP}k lifetime` — exportable as a single image with one tap (`Share my progress`).
**Why:** Marcus's review calls out that "investment without visible accumulation is wasted loss aversion" — he wants this for retention. I want it for acquisition: it's a second, lower-stakes share moment (not just milestones) that users can share any day, not just milestone days.
**Cost:** Half a day (most of it is the share-image export reused from S1).

### S5. `/today` public page — the web front door

**Where:** New route `app/today/page.tsx`
**What:** A public, unauthenticated, anonymous page that shows just the Pod of the Day, the brand lockup, and one CTA to `learnpod.app/start`. No login, no streak, no queue. Just: "Today's pod is {X}. Start in 2 minutes." Indexable, linkable, shareable.
**Why:** The current home screen cannot be linked from outside — there's nothing to send someone to. `learnpod.app/today` becomes the URL every post points at. Email subject line: "Today's pod: {X}". Tweet: "Today on LearnPod → learnpod.app/today". The entire content engine's CTA now has somewhere to land.
**Cost:** 1 day. Reuses the Pod of the Day component from S2.

### S6. Milestone share card series ("I'm building my brain")

**Where:** Followup to S1, same infra
**What:** 4 share card templates tied to 4 milestones — 7 Bronze (🥉 "Week 1"), 30 Silver (🥈 "Month 1"), 100 Gold (🥇 "Century"), 365 Diamond (💎 "Year of learning"). Each card is visually distinct so repeat-sharers don't spam identical images.
**Why:** Creates a *collection* the sharer is trying to complete publicly. Share moments become a meta-game.
**Cost:** Rolled into S1.

---

## Ready-to-Make Posts (Top 3, using the existing catalog)

These are three posts Sana would ship *this week*, using only what's already in the LearnPod catalog and the home screen as the reference environment.

### Post 1: "The LearnPod Home Screen, explained" — the product-as-content post

**Platform:** IG Carousel (1080×1350, 7 slides) + LinkedIn doc repurpose + X thread
**Series:** Field Notes (Playbook 07 — personal build-in-public)
**Why this post:** The home screen is visually strong (dark amber, Fraunces, fade animations). Screenshotting it is marketing. We turn the product tour into the content.

**Hook (slide 1):**
> `2 minutes of learning a day`
> `compounds into a knowledge graph.`
> `Here's what that looks like at day 66.` *(replace with real number)*

**Slide-by-slide:**
| # | Visual | Copy |
|---|--------|------|
| 1 | Dark amber bg, Fraunces 96pt hook | "2 minutes of learning a day compounds into a knowledge graph." |
| 2 | Screenshot of home with greeting + streak bar | "This is the home screen. One scroll, three decisions." |
| 3 | Screenshot of StreakBar with 12-day 🔥 + 420 XP pill | "Streaks, freezes, milestones at 7/30/100/365. Lose it and loss aversion does the rest." |
| 4 | Screenshot of DailyGoal ring | "Daily XP goal: Casual (45) / Regular (90) / Intense (135). Commitment tier in 1 tap." |
| 5 | Screenshot of pod horizontal scroll | "66 pods across 9 domains. Sorted by what you care about." |
| 6 | Screenshot of the milestone 🥉 modal | "Hit 7 days → Bronze. The brain doesn't forget a badge it earned." |
| 7 | Hook echo + CTA | "Build your knowledge graph. learnpod.app/today" |

**Visual treatment:** Flat + real screenshots. No Midjourney. Fraunces hook slide + alternating screenshot slides. This is a **Stack Tour** (Playbook 05) disguised as **Field Notes** (Playbook 07).

**CTA:** `learnpod.app/today` → lands on the public Pod of the Day → email capture → into onboarding. (Requires S5 to ship first.)

---

### Post 2: "The Whiteboard Wednesday #01 — RAG in one diagram" — the flagship series debut

**Platform:** IG Carousel (3 slides — minimal) + LinkedIn doc
**Series:** Whiteboard Wednesdays (Playbook 04), weekly Wed cadence, starts this week
**Why this post:** Highest save-rate format in the library. RAG is the most diagram-shaped concept in the AI Engineering domain. Single diagram = single saveable image.

**Hook (slide 1, diagram fills 70% of slide):**
> `RAG, explained in one diagram.`
>
> *(Mermaid diagram: query → embed → vector DB → top-k → LLM → answer, 6 numbered nodes, cyan arrows)*

**Slide 2 (the gotcha):**
> `The trick everyone gets wrong:`
> `Retrieval quality > model size.`
> `A 7B model with good RAG beats a 70B with bad RAG.`
> `(This is Pod #12 in LearnPod's AI Eng track.)`

**Slide 3 (CTA):**
> `Whiteboard Wednesdays.`
> `One diagram. Every week.`
> `learnpod.app/today`

**Visual treatment:** Fraunces hook, `--amber` accent, Mermaid-rendered diagram with dark amber theme (needs S7 below — theme JSON), black-on-warm composition. This is the **exact ByteByteGo recipe** retuned for our palette.

**Production path:** Run `/learnpod content rag` → get `carousel.md` + `diagrams/slide-1.mmd` → render Mermaid with the LearnPod theme → drop into Figma template → export. Should be 30 min assembly post-template.

**CTA:** Series + link to the RAG pod directly (OG image from S3 makes the link preview beautiful).

---

### Post 3: "Sharpe Ratio is lying to you" — the Quant contrarian reel

**Platform:** IG Reel / TikTok / YT Short (38 seconds, 1080×1920)
**Series:** The Backtest Lies (Playbook 03), bi-weekly cadence
**Why this post:** Quant has the highest save-rate niche audience and Sharpe Ratio has a well-known "naive view vs truth" structure. Reel-native. Loop-friendly.

**Hook (first 3 seconds, burned caption):**
> `This equity curve made 34% a year.`
> `It's also a lie.`

**Beat sheet:**
| Time | Beat | Visual | Caption |
|------|------|--------|---------|
| 0-3s | Hook | Zoom into a clean 45° equity curve | "This made 34%/yr. It's also a lie." |
| 3-8s | Promise | 4-pane split screen of the 4 lies | "Here are the 4 things it hides." |
| 8-14s | Lie 1 — Survivorship bias | Curve of dropped stocks appearing | "Dead tickers. Gone from your backtest." |
| 14-20s | Lie 2 — Transaction costs | Curve dropping 3% | "Commission + slippage eats 3%/yr." |
| 20-26s | Lie 3 — Drawdown hidden | Max-drawdown bar overlay | "Your -42% drawdown wasn't in the pitch deck." |
| 26-32s | Lie 4 — Sharpe is not enough | Sharpe number crossed out → Sortino | "Sharpe treats upside vol as risk. It isn't." |
| 32-38s | CTA + loop frame | Same 45° curve, now annotated with truth | "Full pod: learnpod.app/today" |

**Visual treatment:** Black + `--amber` on darkened background, JetBrains-Mono-heavy (numbers feel like Bloomberg terminal), no talking head. Sound: soft lo-fi beat, no lyrics. Captions burned in white + amber highlight. The opening curve matches the closing curve for a clean loop.

**CTA:** `learnpod.app/today` + the pod link pinned in the comments.

**Production path:** `/learnpod content sharpe-ratio-lies` → `reel.md` → CapCut template. Target: 45 min assembly.

---

## Content Pipeline (the pod → asset bundle workflow for this catalog)

The canon pipeline from `learnpod-content-production.md` is correct and this review does not propose changing it. What *this review* adds is a **home-screen-integrated pre-stage** — the product itself becomes the first production layer.

### The new pipeline (home-integrated)

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 0 — The app as content factory (new)                 │
├─────────────────────────────────────────────────────────────┤
│  1. Editor picks Pod of the Day → content/daily.json        │
│  2. Home renders "Today's Whiteboard" card with share btn   │
│  3. User OR editor taps Share → downloads 1080×1350 PNG     │
│     (this IS the first carousel slide, pre-made, on-brand)  │
│  4. Milestone modals → share cards → org pulls from CDN     │
│  5. /today public page → OG image → any link preview        │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1-4 — existing canon (Claude → Figma → MJ → CapCut)  │
│  (unchanged, see learnpod-content-production.md §1)         │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
        Series cadence ship
        (2 carousels/wk, 1 reel/wk, 1 LI doc/wk, 2 X threads/wk)
```

**The key insight:** the app already produces on-brand screenshots every time a user earns something. We are currently deleting that output. Layer 0 turns user sessions into asset generation events. Every milestone = a share card. Every daily open = a pod-of-the-day impression. Every pod completion = a potential reel clip.

### Per-post budget after home integration

| Post type | Old budget | New budget | Why |
|-----------|-----------|-----------|-----|
| Carousel (3/wk) | 1 hr | 40 min | Pod-of-the-Day card is slide 1 pre-made |
| Reel (1/wk) | 45 min | 45 min | No change — reels still need CapCut assembly |
| LI doc (1/wk) | 10 min | 5 min | Carousel auto-exports at LI ratio |
| X thread (2/wk) | 15 min | 10 min | `/learnpod content` already outputs thread |
| Newsletter (1/wk) | 30 min | 20 min | Aggregates share cards from the week |

**Weekly target:** ~4 hours of assembly (down from ~5). **Most of the time savings come from S1, S2, S3 shipping.**

---

## Brand System Gaps (what must be reconciled)

These are the blockers before a single post ships. Ordered by priority.

### G1. Reconcile `globals.css` tokens with `learnpod-brand-system.md` §2.1-2.2 — *blocker*

**Current state:** App ships warm amber (`#f5a623`) + coral + teal + blue + purple + green on `#13100d`, fonts Fraunces + Outfit. Spec describes cyan/yellow on ink-900, fonts Inter Tight + JetBrains Mono. Two different brands.
**Resolution:** The app wins. The spec updates. Specifically:
- Rewrite `learnpod-brand-system.md §2.1` to match `globals.css:4-19` tokens
- Update sub-brand palettes §2.2 to use amber as the General accent (not yellow)
- Update type system §2.3 to Fraunces display + Outfit body (not Inter Tight + Inter); keep JetBrains Mono as the data/code accent
- Add a rule: "JetBrains Mono is used sparingly for numbers, not liberally like the spec said — the Fraunces+Outfit pairing is the voice"
**Owner:** Sana (me). **Cost:** 2 hours. **Must happen before any post ships.**

### G2. 24 custom Lucide-style icons — still the right call

Emojis in `DOMAIN_CONFIG` (⚡🌐📖🚀📈💰🔧🤖📚) work in the app but break in carousel exports. Commission the custom set as originally planned. In the meantime, the app is fine with emojis, but all *posted* content must use Lucide SVGs, not emojis. **Enforce this rule in carousel.md templates.**

### G3. Logo lockup — still missing

No wordmark + glyph exists. The brand currently is just the word "LearnPod" in Fraunces. That's *almost* enough but needs to be formalized: Fraunces 800 "LearnPod" with a small glyph (a closed-loop / infinity / pod shape) locked to the baseline. Light + dark variants. **This is the single most-reused asset in the share cards — can't ship S1 without it.**

### G4. Mermaid theme JSON matching app palette

Mermaid renders to generic blue/white by default. We need a theme that outputs `#13100d` background, `#f5a623` arrows, `#f0ebe2` node fills, Fraunces labels. File lives at `content/brand/mermaid-theme.json` and gets loaded by mermaid.live via `%%{init: {"theme":"base", "themeVariables":{...}}}%%` header. **Blocks Playbook 04 (Whiteboard Wednesdays).**

### G5. `learnpod.app/start` + `learnpod.app/today` landing pages

Every CTA in every post points at these URLs. Neither exists in the repo yet (the home screen is the de facto "start" but it's not wired to a domain/email capture). `/start` is Marcus's blocker in his review; `/today` is mine. Both need to ship before Post 1 goes out. **Routes:**
- `app/start/page.tsx` — email-capture landing (Marcus)
- `app/today/page.tsx` — public Pod of the Day (S5)

### G6. QR code for print-style assets

Generate once, check in at `public/brand/qr-learnpod-today.png`. Used on carousel slide 7 CTAs, newsletter footer, and (later) printed stickers. 20 minutes, one-shot.

---

## Distribution Plan (how the home feeds the feed)

**Cadence, unchanged from brand spec §7:** IG (2 carousels + 1 reel / wk), LinkedIn (1 doc / wk), X (2 threads / wk), YouTube Shorts (1 / wk repurpose), Newsletter (1 / wk Sunday).

**What changes with home integration:**

| Platform | Old source | New source (home-integrated) |
|----------|-----------|------------------------------|
| IG Carousel | `/learnpod content {module}` from scratch | Pod of the Day share card = slide 1, bundle fills slides 2-7 |
| IG Reel | CapCut from `reel.md` | Same, plus user-generated streak share reels (UGC loop) |
| LinkedIn doc | IG carousel re-export | Same |
| X thread | `tweet-thread.md` | Thread's opening tweet = the Pod of the Day card (same image) |
| YT Short | Reel repurpose | Same |
| Newsletter | Manual aggregation | Auto-pull from `content/daily.json` last 7 days + share cards |

**Evergreen vs trend split:**
- **85% evergreen** — Whiteboard Wednesdays, Hidden Costs, Backtest Lies, Stack Tours. These are the catalog mined at scale. Nothing time-bound, everything reusable.
- **15% trend** — Field Notes posts ("the day I shipped /today," "66 pods in, here's what I've learned"). These ride the build-in-public wave.

**The owned list is the point.** Every post drives to `learnpod.app/today` (or `/start` for funnel-top) → email capture → onboarding → first pod. The email list is the one distribution channel we own. The social platforms are rented. Measure everything by email signups per post, not by likes.

---

## Collaboration with Marcus (vp-engagement)

Marcus and I are aligned on the single most important change: **the home hero must become a single, state-aware Next Best Action.** His angle: retention (one button, no decision fatigue, habit reinforcement). My angle: acquisition (the same component also serves as the brand positioning surface for anonymous/screenshot contexts).

**The handoff:** Marcus's state-aware hero calculates WHAT the button says and where it goes. My layer adds (a) the persistent brand lockup under it, (b) the share-capability on milestone moments, (c) the Pod of the Day card which is also the "brand new / anonymous" hero fallback.

**Shared CTA: `learnpod.app/today`** is the single URL every marketing post drives to. It feeds Marcus's onboarding flow (which feeds his streak loop). My job is to get them to click; his job is to keep them clicking.

**What Marcus should adopt from this review:**
- S1 (streak share card) — this is a retention signal AND a viral loop. He called out "no viral/referral loop" as a gap; this closes it.
- Brag strip (S4) — he called out "investment without visible accumulation" as a gap; S4 is the fix.

**What I should adopt from Marcus:**
- State-aware hero schema (his priority 1) — my hero copy table above is the copy for his component.
- The "lapsed 3+ days" win-back state — he's right, the marketing copy should be softer there ("Welcome back. Start small.") not a branded hook.

**Neither of us should own:** the `learnpod.app/start` landing page — that's a product decision and Matt owns it.

---

## Top 3 priorities (if we only ship 3 things this week)

1. **S1 — Streak share card on the milestone modal.** Half a day. Turns the highest-emotion moment in the app into the highest-virality content. Single biggest leverage fix in this entire review.
2. **G1 — Reconcile brand spec to match shipped app tokens.** 2 hours. Unblocks every downstream asset. Cannot ship a post without this.
3. **S5 + S3 — `/today` public page and pod detail OG images.** 1.5 days combined. Gives every post a home URL and gives every shared link a branded preview. Without these, the content engine has nowhere to land.

Ship those three this week, run Post 1 ("The LearnPod Home Screen, explained") next Tuesday, and the content engine is live.

---

## Closing note

I've been harsh on the home screen because the opportunity is enormous. The product underneath is strong — Marcus can attest. What's missing is that the home never introduces itself, never shares itself, and never becomes a screenshot. All three are cheap fixes. Do them and the app stops being a private dashboard and starts being the front door of a brand.

— Sana
