# Tweet thread — The AI Cost Diet
**Source:** `Module - Claude API Cost Optimization`
**Posts to:** X / Twitter
**Length:** 7 tweets

---

**1/**
$225/day → $33/day.

Same workload. Same model family. 4 changes.

Here's the Claude API cost diet that actually compounds. 🧵

**2/**
The default mistake: using Opus for everything.

Most "hard" tasks are actually Sonnet-tier. Most "easy" tasks are Haiku-tier (1/5th the price).

Your bill isn't a model problem. It's a routing problem.

**3/**
Lever 1 — Right-size the model.

```
classify → Haiku  ($1/$5 per Mtok)
generate → Sonnet ($3/$15)
plan     → Opus   ($5/$25)
```

Real workloads: ~60% Haiku, ~35% Sonnet, ~5% Opus.
That alone is a 62% cut.

**4/**
Lever 2 — Prompt caching.

System prompts and tool defs don't change. Cache them once.

Cache reads = 10% of base cost = **90% off** on every repeated prefix token.

Break-even after 1 read on the 5-minute TTL. After 2 on the 1-hour TTL.

**5/**
Lever 3 — Batch API.

Anything that doesn't need a real-time response goes here.

- Flat 50% off (input AND output)
- Up to 100k requests per batch
- Usually finishes in <1 hour
- Results held 29 days

Nightly evals, classification, content gen → batch.

**6/**
The stack, on real numbers:

10k requests/day, 2K input + 500 output each:

```
All Opus:           $225/day
+ Route by tier:    $85   (-62%)
+ Cache prefix:     $45   (-80%)
+ Batch the async:  $33   (-85%)
```

Same workload. Same quality. 85% off.

**7/**
I track 268 of these patterns in LearnPod — atomic 2-minute reads, connected by a knowledge graph.

Free. No signup wall.

→ learnpod.app/start

(More "Hidden Costs" threads dropping every 2 weeks. This is #01.)
