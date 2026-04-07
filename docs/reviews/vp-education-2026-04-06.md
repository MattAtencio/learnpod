# VP Education Review — LearnPod Home Screen
**Reviewer:** Dr. Elena Vasquez, VP Education (ex-Duolingo)
**Date:** 2026-04-06
**Scope:** `app/page.tsx`, `app/HomeClient.tsx`, and home-adjacent components (`PodCard`, `ModuleCard`, `StreakBar`, `DailyGoal`, `Onboarding`) plus the data shape that feeds them (`lib/types.ts`, `data/pods.ts`, `data/modules.ts`, `data/quizzes.ts`, `lib/store.ts`).
**Overall Grade:** **C+**

> Framing: this is a *home-screen-focused* review at the user's request. I evaluate the home through a learning-science lens — orientation, decision-making, choice architecture, and the pedagogical signals the home surfaces (or fails to surface). I also call out upstream data/content issues that the home inherits and cannot fix on its own.

---

## Executive Summary

LearnPod's home screen already does something **95% of "learning content apps" get wrong**: it leads with retrieval practice. `reviewPods` (spaced-repetition due items) render *above* new content, which is exactly how Duolingo's home works and is a genuinely sophisticated pedagogical choice. The SM-2 scheduler in `store.ts`, the interleaved 70/30 question sets in `PodDetailClient.tsx`, the streak + freeze + repair mechanics, and the domain-accuracy tracking are all Duolingo-grade foundations. If I squint, the bones of a real learning product are here.

But the home screen is **not yet doing its job as a learning decision surface**. It's a content shelf dressed up with gamification. A new learner opening the app at pod count 66 faces: a "Your Queue" label that isn't a queue (it's just the first 8 pods after a weak sort), a "Today's Pods" section that shows the same thing daily, no signal of *why* a specific pod is surfaced, no prerequisite awareness, no difficulty calibration, no "pick up where you left off," and — critically — no learning objectives on any pod despite the schema supporting them. The library is also drifting toward choice paralysis: 8 domains, uneven coverage, no curation. A returning learner cannot answer the three questions a learning home MUST answer in under 3 seconds:

1. **What should I do right now?** (currently: unclear — 10+ options compete for attention)
2. **Why this, not that?** (currently: no rationale surfaced — sort is opaque)
3. **Am I making progress toward something?** (currently: streak + XP only — no skill-tree, no mastery map, no "you're 40% through AI Engineering")

The gap between "solid backend learning machinery" and "front-end that exploits it" is the single biggest opportunity in this product. Fix the home, and LearnPod jumps from C+ to B+ without touching the content pipeline.

---

## What Duolingo Would Keep

These are the things I, as a Duolingo alum, would fight to preserve in any redesign:

1. **Review queue above new content.** `reviewPods.length > 0` gets surfaced *before* `Today's Pods`. This is the correct pedagogical priority — retrieval beats exposure. Most competitors get this wrong.
2. **SM-2 spaced repetition on quiz performance.** `scheduleReview(slug, quality)` with `quality = Math.round(pct * 5)` is a legitimate implementation. Not cargo-culted. Ease factor, interval, repetitions — all there.
3. **Interleaved review questions inside new pods** (70% current / 30% from completed same-pool). This is the "interleaving" desirable difficulty — Duolingo only added this in ~2021 after a lot of research debate. Impressive that it's here.
4. **Streak mechanics with freezes and repair.** Mercy mechanics matter for long-term retention. The 1 freeze/week and the one-time repair are well-calibrated — not too generous, not punitive.
5. **Daily XP goal with "Casual/Regular/Intense" framing.** Self-determination theory says let the learner own their commitment level. 45/90/135 is the right granularity.
6. **Domain accuracy tracking** (`domainAccuracy` in store). This is the substrate for real personalization — you just aren't reading from it yet on the home.
7. **Onboarding captures `preferredDomains`.** Good. This is how any recommender system bootstraps.

Keep all of this. The critique below is about *what's missing*, not what's broken.

---

## Critical Gaps (Priority Order)

### 1. **SEVERE — "Your Queue" is not actually a queue. It's a content shelf.**
**Where:** `HomeClient.tsx` lines 44–50, 111–124.
**Problem:** The home greeting says "Your Queue, Matt." but the list rendered under "Today's Pods" is `sortedPods.slice(0, 8)` — a naive "preferred domains first, then original order" sort. It's stable, context-free, and identical every time the user opens the app until they complete one. A queue implies:
- It's personalized ("for you, today")
- It's ordered by *learning priority*, not alphabetic/domain grouping
- It has a finish-line ("3 of 5 done")
- It reshuffles based on yesterday's performance

**Fix:** Introduce a real `getDailyQueue()` selector in `store.ts` that returns 3–5 pods using this decision tree:
```
1. Overdue reviews (from SM-2)                    — always first
2. Due reviews today                              — second
3. "Continue Module" — next incomplete pod in an active module
4. "New concept" — one pod from a weak domain (low domainAccuracy)
5. "Variety pod" — one pod from an untouched but preferred domain
```
Cap at 5. Show a queue-progress bar ("2 of 5 done today") below the greeting. This single change transforms the home from a shelf into a learning plan.

### 2. **SEVERE — Zero pods have learning objectives populated.**
**Where:** `lib/types.ts` line 30 (`objectives?: string[]`), `PodDetailClient.tsx` lines 499–521 + 263–285 (renders objectives beautifully when they exist), `data/pods.ts` (0 matches for `"objectives":`).
**Problem:** The *most important* learning science primitive — a measurable learning objective — is defined in the schema, has UI support on both the pod hero and celebration overlay, and is never used. Every pod currently says "What It Is" at the top with a marketing-style hook ("Anthropic's Message Batches API lets you send up to 100,000 requests..."). A learner cannot answer "what will I be able to do after this?" which is the only question Bloom's taxonomy cares about.
**Fix:**
- Author 2–4 objectives per pod using measurable verbs (per Bloom): "Classify a task as Haiku/Sonnet/Opus tier in under 30 seconds," "Estimate the 5-minute cache break-even point for a 50K-token prompt."
- Add a quality gate to the sync script (`sync-learning-content.ts`) that **fails the sync** if a pod has no objectives.
- On the home, show the *top* objective under each PodCard title ("You'll be able to: route tasks to the cheapest viable model"). This answers "why should I tap this?" in one line.

### 3. **SEVERE — Quizzes are auto-generated from text regex, not from objectives.**
**Where:** `data/quizzes.ts` (header says "AUTO-GENERATED by generate-quiz-questions.ts"), sample questions like:
> "'POST /v1/messages/batches' — which section of Claude Batch API does this belong to?"
> Distractors: "A client-side JavaScript library for DOM rendering" | "A database migration tool for PostgreSQL schemas"

**Problem:** These aren't assessments. They're recognition tasks with comically-wrong distractors. A learner can score 100% without learning anything — the signal-to-noise of `scheduleReview(slug, quality)` is garbage-in-garbage-out because `quality` comes from quizzes that test "did you read the words" not "did you build the concept." This corrupts the spaced-repetition engine you already built — the best schedule in the world is worthless if the grading is random.

Also — only **32 of 66 pods have quizzes (48%)**. That means SR is silently disabled for half the library.

**Fix (phased):**
- **Phase 1, immediate:** delete "which section" and "which bold phrase" question types. They teach nothing. Keep only the "what is" + scenario questions.
- **Phase 2:** rewrite the generator as a Claude prompt that takes *objectives + sections* as input and produces: 1 application question (apply concept to a novel scenario), 1 discrimination question (pick the right tool for a task), 1 diagnosis question (what's wrong with this code/choice), 1 recall as last resort. Plausible distractors only — same domain, same category.
- **Phase 3:** 100% quiz coverage is non-negotiable. Add a sync gate.

### 4. **SEVERE — No prerequisite graph / skill tree. Modules are flat lists.**
**Where:** `data/modules.ts`, `lib/types.ts` (`Module.chapters` is a flat array).
**Problem:** A module is currently just "here are some pods in an order." There's no `requires: []` on pods, no concept of "you can't start Prompt Caching until you've done Model Right-Sizing," no visual skill-tree on the home. Compare to Duolingo's CEFR-aligned unit/section/skill hierarchy where every node has explicit prerequisites and the tree visualizes a learner's position in the broader competence map.

The practical home-screen consequence: the "Active Modules" section shows a progress ring (0/3 chapters done) but can't tell the learner *which* chapter is unlockable next, can't warn them they're skipping a prerequisite, can't show "you're 30% through the Claude API Cost Optimization skill tree."

**Fix:**
- Add `prerequisites: string[]` to `Pod` and `Module`.
- Build a `lib/skill-tree.ts` that computes unlock state, mastery rollup (average quiz score across module pods), and "next unlockable" pod per module.
- On the home, replace or augment "Active Modules" with a **mini skill-tree widget** — a small horizontal path of 5 nodes, the next one pulsing. This is Duolingo's *signature* home affordance and it's worth borrowing wholesale.

### 5. **HIGH — Choice overload. The home shows too many things competing for attention.**
**Where:** `HomeClient.tsx` overall.
**Problem:** Above the fold on a phone, a learner currently sees: (a) greeting, (b) streak bar with XP and milestone, (c) daily goal ring, (d) review queue (if present), (e) "Today's Pods" scroll with 8 cards, (f) "Active Modules" list, (g) bottom nav with 4 destinations. That's **7–9 distinct decision points**. Research on choice architecture (Iyengar & Lepper, the "jam study") says 3–5 options max before decision quality degrades. A learner with only 2 minutes needs *one* obvious next action, not a content menu.

Symptom: the user described the home as "feels overwhelming." That's not UX polish — that's cognitive load hitting the 4-chunk working-memory ceiling.

**Fix — the "One Big Button" doctrine:**
- **Above the fold = one hero decision.** A single big card that says "Continue: [Pod Title]" with a play button. That pod is chosen by `getDailyQueue()` (gap #1). Everything else is secondary.
- **Below the hero:** collapse streak + daily goal into a *single* "Today" strip — flame + ring + XP, one row.
- **Sections collapse by default** when the library > 30 items. "Today's Queue (5)," "Review (3)," "Continue Module (2)" each with an accordion. Default-open only the one with the next action.
- **Move "Active Modules" to its own tab.** The module list is a *browsing* affordance, not a home affordance — it belongs in `/modules`, not under a 2-minute-attention-span home surface.

### 6. **HIGH — No "why this pod?" rationale surfaced on cards.**
**Where:** `PodCard.tsx`.
**Problem:** Every PodCard shows: domain tag, title, minutes, review-status badge, XP. Missing: *why the app chose to show me this right now*. Duolingo's home cards have a one-word tag: "Overdue," "New," "Recommended," "Review." LearnPod has "Overdue/Review/Learning/Mastered" but only on reviewed pods — new pods show no reason.

**Fix:** Every card on the home must have a "because" tag:
- "Overdue" (SM-2 past due)
- "Due Today" (SM-2 due)
- "Next in Module: Claude API Cost Optimization"
- "Weak Spot — 62% accuracy in ML Models"
- "New in your interests"
- "Try something new" (only if no higher-priority reason exists)

Render this as a 10pt label above the title. Decision friction drops by ~half when the user isn't auditing "wait, why did I tap this?"

### 7. **HIGH — The library has outgrown its front-door discovery.**
**Where:** Content scale — `data/pods.ts` is 3,787 lines / 66 pods and growing. Explore/search exists (`ExploreClient.tsx`) but home has no curation signal.
**Problem:** 66 pods across 8 domains is past the point where "show all and let them filter" works. No editorial curation, no "Path of the Week," no themed bundles, no beginner/intermediate/advanced. A new learner with "AI for Everyone" interest has to scroll past 30 AI-Engineering pods they can't use.
**Fix:**
- Add a `difficulty: "foundation" | "applied" | "advanced"` field to `Pod`. Use it to gate new-learner surfacing.
- Add a `featured: boolean` or `collection: string` field for editorial curation. On the home, show a "Collection of the Week" — 3 pods hand-picked around a theme.
- **Critical:** the sort in `HomeClient.tsx` must stop returning the same 8 cards every day. Rotate in a seeded-by-date order, or use a last-shown timestamp.

### 8. **MEDIUM — "Today's Pods" isn't actually "today's."**
**Where:** `HomeClient.tsx` line 112.
**Problem:** The label makes a promise (personalized-for-today) the code doesn't keep — it's just `sortedPods.slice(0, 8)`. If I open the app Monday and don't finish, Tuesday's list looks identical. This erodes trust ("the app doesn't remember me") and kills the daily-opening ritual.
**Fix:** Either make the selection actually daily-stable (seed by date, swap what I've seen) or rename to "Continue Learning." Never promise personalization you don't deliver.

### 9. **MEDIUM — No mastery surface.**
**Where:** `store.ts` tracks `domainAccuracy` but the home never reads it.
**Problem:** The app has the data to say "You're 78% in Quant & Trading — 2 weak areas" but never does. Mastery visualization is the #1 retention lever for adult learners (self-efficacy, per Bandura). Currently, the learner gets XP (extrinsic) and streak (extrinsic) but no *competence signal* (intrinsic motivation per self-determination theory).
**Fix:** Add a compact "Mastery" strip on the home — 4 domain chips with radial fill showing accuracy. Tapping one drills into weak-spot review. This taps the intrinsic motivation lever hard.

### 10. **MEDIUM — Onboarding ends but learner never gets a "map."**
**Where:** `Onboarding.tsx` → goes straight to a pod.
**Problem:** The user picks 1–7 domains, sees their first pod title, then lands in a pod. There's no "here's the path I built for you" moment. Duolingo shows the CEFR tree after onboarding for exactly this reason — anchor the learner's mental model of the journey.
**Fix:** Insert a 4th onboarding screen: "Your learning path" — show 4–6 pod tiles in a horizontal trail, with the first one glowing. Creates a commitment device (Cialdini's consistency principle).

### 11. **LOW — ContentType field exists but is unused.**
**Where:** `lib/types.ts` line 4 (`PodContentType`). 0 matches in data.
**Problem:** The schema distinguishes `concept | framework | case-study | metaphor | methodology` but no pod declares a type, so the front-end can't visually differentiate them. Research shows learners benefit from schema previews ("this is a framework, expect 3 parts" vs. "this is a case study, expect a narrative").
**Fix:** Populate on sync, add a subtle type icon on PodCard.

### 12. **LOW — No session-end recap.**
**Problem:** Completing a pod celebrates with confetti + XP + streak, but there's no end-of-session "here's what you learned today" summary tying the day's 2–3 pods together. Self-explanation effect says learners retain more when prompted to summarize.
**Fix:** After the 2nd or 3rd daily completion, show a "Today's Learning" card with objectives checked off.

---

## Learning Model Analysis

### Content Structure
**Grade: B-.** Pods have a consistent shape (What It Is → Key Mechanics → When to Use → When NOT → Cost/Try It → Apply It → Research Next). This is *structurally* sound — it echoes the "What / How / When / Try" scaffold from worked-example research. But:
- The lead section is "What It Is" (a definition dump), not "Why This Matters" (an emotional hook). Behavioral evidence: retention is 40%+ higher when learners see a relevance cue before the definition.
- No "Prior Knowledge Check" section — learners can enter a pod whether or not they have the prerequisites.
- Sections are all same-weight; no "core concept" vs. "go deeper" distinction. A 2-minute-attention-span learner wades through the whole thing.

### Retrieval Practice & Assessment
**Grade: C.** The architecture is A-tier — quizzes, scoring, SM-2, interleaving. The *content* is D-tier — auto-generated regex questions with absurd distractors. This is the single biggest quality delta in the product. The retrieval engine is a Ferrari; it's running on regular-grade content.

- Only 48% of pods have quizzes. Unacceptable for a learning product.
- No free-recall prompts ("Before you read, what do you know about batching?"). Pre-tests boost retention 10–25%.
- No "generate your own example" prompt. Generation effect is one of the most robust findings in learning science.
- First-attempt bonus (+10 XP at 80%+) is well-designed — rewards genuine learning, not grinding.

### Spaced Repetition & Retention
**Grade: B+.** The SM-2 implementation is faithful (ease factor, interval, repetitions, quality 0–5 from quiz %). The interleaved review inside new pods is a sophisticated move. Review queue surfaces on home. This is genuinely well-done *for pods that have quizzes*.

Gaps:
- No notification integration tied to SR ("3 reviews due — 2 minutes"). `notifications.ts` exists but only does streak reminders.
- No "mastered" ceiling reward. After a pod hits mastered status it just disappears. Should get a badge + "visit the next concept" nudge.
- Review quality is capped at quiz accuracy. Needs to also consider "how long since last review" — currently a 2-week-old pod at 80% scores identically to a 1-day-old pod at 80%.

### Curriculum Architecture & Skill Trees
**Grade: D.** This is the weakest area. Modules are flat pod lists. No prerequisites. No skill tree. No difficulty tiers. No placement test (despite preferred-domain onboarding). The domain taxonomy itself is inconsistent — "AI Engineering," "AI for Everyone," and "ML Models" overlap conceptually. "General" is an abandoned bucket (1 pod). "DevOps" has 3 pods — not a domain yet, just a tag.

Without a prerequisite graph, you cannot:
- Prevent a learner from hitting "Prompt Caching" before understanding what Claude is.
- Compute meaningful mastery (you don't know which concepts subsume others).
- Build an adaptive next-pod algorithm.
- Do proper difficulty ramping.

This is the #1 architectural investment.

### Personalization & Adaptive Learning
**Grade: D+.** The *only* personalization surface is: `preferredDomains` moves matching pods to the top of the home sort. That's it. The store has `domainAccuracy` data that's never used for surfacing. There's no "you're strong in X, let's shore up Y" logic. No difficulty adaptation. No pace adjustment.

Good news: the data is being collected. The home just isn't reading from it.

---

## Content Quality Audit

Sampled pods: `ai-batch-api`, `ai-claude-code-patterns`, `ai-model-right-sizing`, `module-ai-for-everyone`, `module-claude-api-cost-optimization`.

**Writing quality:** A-. These are genuinely well-written. Dense, current, correctly-opinionated, with concrete numbers and code samples. This is "technical essay" tier. A working engineer would learn from these.

**Pedagogical quality:** C-. The same content does not work as a *learning artifact* because:
1. **No prior-knowledge assumption.** "Claude Batch API" assumes the reader knows what Claude is, what a request body looks like, what 1M/MTok pricing means. A true beginner bounces.
2. **Dense without scaffolding.** The "Key Mechanics" section of Batch API is 200+ words of concurrent JSON + prices + limits + polling — that's a reference card, not a learning sequence. Chunk it.
3. **Zero formative assessment inside the pod.** Learner reads 6 sections, then hits a quiz. No "pause and think" breakpoints. No "Before the next section, predict what happens when…"
4. **"Research Next Steps" is a TODO list, not a learning asset.** It's the author's notebook leaking into the learner's experience. Either remove or reframe as "Your challenge this week."
5. **Module sections are meta-navigation, not instruction.** `module-claude-api-cost-optimization` has sections like "Pods & Lessons" (a table of links) and "Content Creation Angles" (notes to the author about Instagram reels). A learner doesn't need either — those are meta-artifacts leaking into the learner view.

**Domain balance:** Skewed. Quant & Trading (16) + AI Engineering (14) = 45% of the library. DevOps (3), Tools & Platforms (6), and "General" (1) are thin. AI for Everyone (8) is a single well-curated module — nice. Financial Models (9) and ML Models (9) are medium. Recommendation: freeze new Quant/AI-Eng pods, backfill DevOps and AI for Everyone until every domain has >=8 pods or archive thin domains.

**"AI for Everyone" module is the standout.** It has a real learning path section ("Read these in order"), scaffolded difficulty, Big Ideas framing, honest FAQs. This is what every module should look like. It's the reference pattern.

---

## Roadmap: From Content App to Learning Product

### Phase 1: Foundation (4–6 weeks) — "Make the home earn its place"

Goal: the home becomes a *learning decision surface*, not a content shelf. The learner can answer "what should I do right now?" in under 3 seconds.

1. **Build `getDailyQueue()`** (gap #1). New selector in `store.ts`, 3–5 pods, priority: overdue > due > continue-module > weak-spot > new-in-interest. Seeded by date so it's stable within a day, rotates tomorrow.
2. **One Big Button redesign of `HomeClient.tsx`** (gap #5). Hero card = next action from queue. Collapse streak + XP + goal into single "Today" strip. Move active-modules to its own tab or collapse by default.
3. **Author learning objectives for all 66 pods** (gap #2). 2–4 per pod, Bloom verbs. Add sync-gate that fails sync if missing. Render top objective on PodCard under title.
4. **Rewrite quiz generator** (gap #3, phase 1). Strip garbage distractors. Use Claude to generate application + discrimination questions from objectives + sections. Reach 100% coverage. This single change elevates the spaced-repetition engine from "random" to "actually measuring learning."
5. **Add "because" reason tags to all home cards** (gap #6). Every card answers "why this."
6. **Rename "Today's Pods" or make it actually daily** (gap #8). Trust-critical micro-fix.

**Exit criteria:** A new learner opening the home at 7 AM Monday sees a single next pod, knows why, and can complete it in 2 minutes. A returning learner with 3 overdue reviews sees them dominate the hero slot.

### Phase 2: Intelligence (8–12 weeks) — "Teach the app to teach"

Goal: personalization based on actual data, prerequisite-aware navigation, proper assessment.

1. **Build the prerequisite graph** (gap #4). Add `prerequisites: string[]` to Pod/Module. Author dependencies across existing 66 pods. Compute unlock state. Render a mini skill-tree widget on home replacing "Active Modules."
2. **Adaptive queue.** `getDailyQueue()` reads `domainAccuracy` to inject weak-spot reviews. Learners with <70% in a domain get 2x review weight there. Learners above 90% unlock the next difficulty tier.
3. **Mastery surface on home** (gap #9). Compact 4-domain chip strip — tap to drill into weakest.
4. **Post-onboarding learning-path screen** (gap #10). 4–6 pod trail anchored by user's preferred domains.
5. **Real assessments, not recognition.** Phase 2 of quiz rewrite — add application scenarios, "find the bug," "pick the right tool." Stop testing vocabulary; start testing transfer.
6. **Difficulty tiers.** Add `difficulty` to Pod. Gate surfacing by learner tier. First-30-days learners never see "advanced."
7. **Notifications wired to SR.** If 3+ reviews due, push "3 reviews, 2 minutes."

**Exit criteria:** Two learners with different `domainAccuracy` profiles see visibly different home screens and review queues. A beginner cannot skip into an advanced pod without a "this is a stretch" warning.

### Phase 3: Scale (12–20 weeks) — "1000 pods without chaos"

Goal: content pipeline that produces quality at volume; home that scales to a library 15x larger.

1. **Content quality gates in the sync script.** Reject pods missing objectives, missing quiz, missing contentType, missing difficulty, or with <3 sections. Reject modules with <3 pods or no prerequisites defined.
2. **Editorial curation layer.** Featured collections ("This Week: LLM Ops"), Collection of the Week card on home. Manual override beats pure algorithm for adult learners.
3. **Placement test.** A 5-minute diagnostic at onboarding that sets initial difficulty and seeds the first week of queue. This is Duolingo's "placement" feature — adds massive 7-day retention.
4. **Session-end recap** (gap #12). End of day 2+ sessions, summarize what was learned, tie to objectives.
5. **Pod review from learners.** After a pod, "Was this clear? Too easy? Too hard?" Feeds back into difficulty tuning.
6. **Consolidate the taxonomy.** Merge "ML Models" + "AI Engineering" or split them with a clear rubric. Archive "General." Decide if "DevOps" stays or becomes a tag. A learner should be able to explain the domain taxonomy in one sentence.
7. **Collection/Path authoring flow.** Make it easy to publish a new themed path without writing code. This is the unlock for scaling past 200 pods.

**Exit criteria:** A new pod added to the library automatically gets surfaced to the right learners, in the right sequence, with the right assessment, without anyone touching the home-screen code.

---

## Duolingo Playbook: What We'd Port Over

Specific mechanics I'd steal, with the exact LearnPod mapping:

1. **The "One Path, One Next Step" home.** Duolingo's home isn't a content shelf — it's a single scrollable path where only the next node is interactive. Port this as the mini-skill-tree widget (Phase 2, gap #4).

2. **"Why this?" microcopy on every affordance.** Duolingo never shows a lesson without a reason tag: "Level Up," "Refresh," "Legendary Challenge." Copy this format for LearnPod pod cards (Phase 1, gap #6).

3. **Placement test at onboarding.** 5–8 questions. Sets initial difficulty and skips known material. Biggest single-lever improvement to D7 retention Duolingo ever shipped. Phase 3.

4. **Streak Freeze as a *currency*, not just a passive buff.** LearnPod has 1 freeze/week — that's fine. Add: freezes can be *earned* (finish a week with 5+ days) and *spent* on "double XP day" for a learner-controlled feel. Tiny tweak, big agency boost.

5. **Mastery decay visual.** Duolingo's crown icons dim when you haven't practiced a skill. LearnPod has SM-2 "mastered" status but nothing visually decays. Add a subtle opacity fade on mastered pods past their next-review date. It nudges learners back without pushy notifications.

6. **Mistakes practice mode.** Duolingo's "Review Mistakes" aggregates incorrect answers into a dedicated practice set. LearnPod tracks `quizResults` per pod but doesn't compile a cross-pod mistakes deck. Building this from existing data is ~2 days of work and would become a learner's favorite surface.

7. **Quest system with short time horizons.** Daily quests (finish 3 pods), weekly quests (hit 5 days, review 10 pods). These are intrinsic-motivation-compatible if framed as *goals you set*, not *grinds you endure*. The infrastructure is already half-built (`dailyXpGoal`).

8. **Legendary/Gold/Silver tier for "mastered."** LearnPod has streak milestones (Bronze/Silver/Gold/Diamond) but no concept-mastery milestones. Port the same metal tiers to pods: a pod reviewed 3x with 90%+ earns Gold, 5x with 100% earns Legendary. Visible on the home mastery strip.

9. **Committed daily goal with optional "rest day."** LearnPod has streak freezes but not rest days. A learner-declared rest day (max 1/week, no streak penalty) preserves agency without breaking the habit loop.

10. **"Spaced repetition, but surfacing *concepts* not pods."** This is the deepest move. Duolingo eventually moved from "practice this *lesson*" to "practice this *concept across all lessons*." LearnPod should eventually schedule *concepts* (tagged within sections) and pull relevant questions from across the pod library. Phase 3 aspiration — requires a concept ontology.

---

## Closing

LearnPod is at a fork. One path leads to "a nice content reader with gamification" — it's what most indie learning apps become, and it peaks at C+ forever. The other path leads to a real learning product — one where the home screen is pedagogically intentional, content has objectives, assessments measure transfer, the curriculum has structure, and the spaced-repetition engine isn't operating on garbage quiz data.

The good news is that the expensive foundations (SM-2, interleaving, streaks, freezes, accuracy tracking) are already built and working. The gap is in the layer that exposes them to the learner — the home. Fix the home, author real objectives, rewrite the quiz generator, and this jumps to B+ in one quarter. Add a prerequisite graph and adaptive queue in the second quarter and you're at A-.

Don't build more content until the home can surface what exists. A 1000-pod library on today's home is a graveyard of good writing no one will ever find.

— Dr. Elena Vasquez, VP Education
