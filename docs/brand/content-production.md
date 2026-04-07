# LearnPod Content Production PRD
**Owner:** Sana Okafor (VP Marketing) · co-signed by Marcus Chen (VP Engagement)
**Version:** 1.0
**Created:** 2026-04-06
**Status:** Active — supersedes any prior content workflow

## Purpose
Define the **tool stack, file flow, and execution playbook** for producing every public-facing LearnPod asset. The goal is **30-45 minutes of assembly per finished post**, not 3 hours of from-scratch design. Templates compound; one-offs don't.

**Companion docs:**
- `learnpod-brand-system.md` — visual standards (palettes, type, templates, series)
- `learnpod-post-types.md` — playbooks per post format
- `~/.claude/skills/learnpod/SKILL.md` — `/learnpod content` automation

---

## 1. The Four-Layer Stack

| Layer | Tool | Cost | Why this tool | Skill output feeds it |
|-------|------|------|---------------|----------------------|
| **1. Copy & structure** | Claude (`/learnpod content`) | $0 | Reads the source pod/module, outputs slide-by-slide copy + Mermaid diagrams + reel beats | `carousel.md`, `reel.md`, `tweet-thread.md`, `diagrams/*.mmd` |
| **2. Visual layout** | **Figma** (free tier) | $0 | Master template per sub-brand, named layers consume the copy. Exports clean PNG/PDF. Repeatable. | Designer pastes copy into named layers, drops Mermaid renders into diagram slots |
| **3. Hero images / covers** | **Midjourney v7** (style) + **Ideogram 2.0** (when text matters) | ~$10/mo MJ | Only for cover/hero images, NOT diagrams. MJ can't render text reliably; Ideogram can. | `assets-needed.md` lists prompts |
| **4. Short-form video** | **CapCut** (saved project template) | $0 | Free, fast captions, project templates are reusable. The reel beats from `reel.md` map directly onto template scenes. | `reel.md` beat sheet → CapCut scenes |

**Supporting tools:**
- **Mermaid Live Editor** (mermaid.live) — preview/export the `.mmd` files Claude generates as PNG/SVG to drop into Figma
- **Excalidraw** — fallback for "hand-drawn" feel posts (Books sub-brand especially)
- **Lucide icons** — already in brand spec, free, paste SVGs into Figma
- **Removebg / Photoroom** — quick background cuts for hero images

---

## 2. The File Flow (the whole pipeline in one diagram)

```
Obsidian Vault                     Claude (skill)                Figma                    Published
─────────────                      ──────────────                ─────                    ─────────

Pod / Module / Book Map            /learnpod content {name}      Master template          IG / LinkedIn /
       │                                  │                       per sub-brand            X / TikTok / YT
       │                                  ▼                            │
       └──────read by──────►   content/drafts/{date}-{slug}/            │
                               ├── carousel.md   ────────────►  paste copy   ────►  export PNG
                               ├── diagrams/*.mmd ───►  mermaid.live  ──►  drop SVG
                               ├── reel.md       ────────────►  CapCut template ──►  export MP4
                               ├── tweet-thread.md ──────────────────────────────►  X scheduler
                               └── assets-needed.md ──►  Midjourney/Ideogram ──►  hero PNG
                                                                         │
                                                                         ▼
                                                            Sana review (/vp-marketing-review)
                                                            Marcus review (/vp-engagement-review)
                                                                         │
                                                                         ▼
                                                                    SHIP
```

---

## 3. Per-Layer Execution Plans

### Layer 1 — Copy & Structure (Claude, ~5 min)

**Command:** `/learnpod content {pod or module name}`

**What Claude does:**
1. Locates source in vault (Module > Pod > Lesson priority)
2. Reads brand spec to pick sub-brand palette + template
3. Identifies the diagram primitive (flow, system, comparison, stack, quadrant, time-series)
4. Generates the asset bundle into `C:/dev/learnpod/content/drafts/{date}-{slug}/`:
   - `carousel.md` — slide-by-slide with copy, layout ref, palette ref
   - `diagrams/slide-N.mmd` — one Mermaid file per slide that needs a diagram
   - `reel.md` — beat sheet with VO, captions, music notes
   - `tweet-thread.md` — repurposed thread
   - `assets-needed.md` — designer checklist + Midjourney prompts + production estimates

**Hard rules:**
- Never fabricate stats — only use numbers in the source
- Always include a CTA pointing to `learnpod.app/start`
- One idea per slide
- Diagrams are text-based (Mermaid), never raw SVG (the SVG approach was killed in v1)

**Output contract:** Every file is plain Markdown or `.mmd`. Designer/Sana can read everything in 60 seconds.

---

### Layer 2 — Visual Layout (Figma, ~20 min per carousel)

**The master template structure** (one Figma file: `LearnPod — Master Templates.fig`):

```
PAGE: AI Engineering (cyan)
  ├── Component: HookSlide / 1080×1350
  │     - Layer "hook-line-1" (text)
  │     - Layer "hook-line-2" (text)
  │     - Layer "footer-series" (text)
  ├── Component: ProblemSlide / 1080×1350
  │     - Layer "problem-headline" (text)
  │     - Layer "problem-body" (text)
  │     - Layer "diagram-slot" (empty frame, fits 960×500)
  ├── Component: StepSlide / 1080×1350  ← used for slides 3, 4, 5
  │     - Layer "step-num" (text, "01"/"02"/"03")
  │     - Layer "step-headline" (text)
  │     - Layer "step-body" (text)
  │     - Layer "diagram-slot" (empty frame)
  │     - Layer "savings-badge" (text, "−62%")
  ├── Component: HeroSlide / 1080×1350  ← slide 6, the saveable one
  │     - Layer "hero-diagram-slot" (empty frame, fits 960×700)
  │     - Layer "payoff-headline" (text)
  │     - Layer "payoff-body" (text)
  └── Component: CTASlide / 1080×1350
        - Layer "cta-line-1" (text)
        - Layer "cta-line-2" (text)
        - Layer "cta-button" (text + bg)
        - Layer "qr-slot" (empty frame for QR PNG)
        - Layer "next-in-series" (text)

PAGE: Quant (amber on black)
  └── (same component structure, different palette)

PAGE: Books (paper-50, hand-drawn)
PAGE: Biz (yellow on ink-700)
PAGE: General (yellow on ink-900)
```

**The 20-minute workflow:**
1. Open `LearnPod — Master Templates.fig`, duplicate the right sub-brand page
2. Open `carousel.md`, paste copy into matching named layers (Cmd-A on the layer, paste)
3. Open each `.mmd` in mermaid.live → "Actions → Download SVG" → drag into the diagram-slot frame
4. Drop hero image into hero slot (if applicable)
5. Eyeball-check kerning + alignment
6. Frame select all → Export → PNG @ 2x → done

**One-time setup tasks** (must happen before first ship):
- [ ] Build master Figma file with 5 sub-brand pages × 5 component types
- [ ] License/install Inter Tight, Inter, JetBrains Mono in Figma
- [ ] Build a Mermaid theme JSON that matches each sub-brand palette
- [ ] Save QR code PNG for `learnpod.app/start`

---

### Layer 3 — Hero Images & Covers (Midjourney / Ideogram, ~15 min)

**When to use:**
- Series cover image (one per series, reused)
- Slide 1 hero background (when the post needs an attention-grabbing visual beyond pure type)
- Reel thumbnail
- LinkedIn doc cover page

**When NOT to use:**
- Diagrams (Mermaid only)
- Anything with precise text (use Ideogram if you must, never MJ)
- Slide-internal imagery (keep slides type-driven for brand consistency)

**Prompt formulas** (`assets-needed.md` should include 1-2 of these per post):

| Use case | Tool | Prompt skeleton |
|----------|------|-----------------|
| Tech/AI hero | Midjourney | `isometric illustration of {concept}, dark navy background, cyan accent lighting, flat geometric, technical schematic style, --ar 4:5 --style raw --v 7` |
| Quant/finance hero | Midjourney | `Bloomberg terminal aesthetic, glowing amber data on black, monospace type fragments, abstract market visualization, --ar 4:5 --style raw --v 7` |
| Books hero | Midjourney | `vintage book illustration, warm paper texture, ink and watercolor, margin annotations style, --ar 4:5 --style raw --v 7` |
| Hook slide w/ text overlay | Ideogram | `bold typographic poster, "{hook text}" in massive Inter Tight 800, cyan on ink-900, JetBrains Mono caption beneath, ByteByteGo style` |

**Workflow:**
1. Paste prompt from `assets-needed.md` into MJ Discord or Ideogram web
2. Generate 4 variants, pick best, upscale
3. (Optional) Photoroom to remove background
4. Drop into Figma hero slot

**Cost discipline:** Max 2 generated images per post. Reuse series covers. Don't burn $10/mo on 50 throwaway generations.

---

### Layer 4 — Short-Form Video (CapCut, ~30-45 min)

**One-time setup** (the saved project template):
1. Create `LearnPod Reel Template.capcut` with placeholder scenes:
   - Scene 1: Hook (3s) — title card slot + lower-third caption track
   - Scene 2: Promise (5s) — same template
   - Scenes 3-5: Lever beats (5-7s each) — diagram slot + caption + VO marker
   - Scene 6: Payoff (5s) — animated number/chart slot
   - Scene 7: CTA + loop (5s) — closing frame matching opening frame
2. Save brand-consistent caption preset (JetBrains Mono, cyan/white, position locked)
3. Save the lo-fi instrumental music bed
4. Export preset: 1080×1920, MP4, 30fps

**Per-reel workflow:**
1. Open template, "Save As" to new project
2. Open `reel.md`, paste each beat's caption into matching scene
3. Record VO in CapCut (or Descript → import), drag to VO track
4. For each diagram beat: render the Mermaid → screen-record a build animation OR use Figma export with motion via CapCut keyframes
5. Final beat: ensure visual rhyme with opening frame for clean loop
6. Export → MP4 → done

**Optional power-up:** **Descript** ($15/mo) for script-first editing if you start doing talking-head reels. Skip until you're shipping 2+ reels/week.

---

## 4. Ship-Day Checklist (the final 10 minutes before posting)

- [ ] Sana review (`/vp-marketing-review {slug}`) — visual + hook + brand consistency
- [ ] Marcus review (`/vp-engagement-review {slug}`) — CTA destination, retention hook
- [ ] Alt text on every slide (accessibility + search)
- [ ] CTA link tested — `learnpod.app/start` loads, email capture works
- [ ] Filename sanity check: `{date}-{series}-{N}-{slug}.png`
- [ ] Cross-platform export sizes: IG 1080×1350, LinkedIn 1200×1500, X 1200×675 cover
- [ ] Schedule in Buffer/Hypefury (or just calendar reminder if manual)
- [ ] Update series tracker spreadsheet with post # + scheduled date

---

## 5. Production Cadence (target)

| Cadence | Cost | Source needed |
|---------|------|---------------|
| 2 carousels/wk | ~1 hour each (after templates exist) | 1 module/wk from vault |
| 1 reel/wk | ~45 min | Same source as one of the carousels (repurpose) |
| 2 X threads/wk | ~15 min each | Already in carousel.md |
| 1 LinkedIn doc/wk | ~10 min (carousel re-export) | Same as IG carousel |
| 1 newsletter/wk | ~30 min | Aggregate the week's posts |

**Total weekly budget:** ~5 hours of assembly. **Inventory needed:** 1 module/week. Vault has 30 modules already → ~6 months of runway before you have to write new content.

---

## 6. What "Done" Looks Like

A post is **shippable** when:
1. ✅ Source pod/module exists in vault and is fact-checked
2. ✅ `/learnpod content` bundle generated and reviewed
3. ✅ Figma carousel exported as PNGs
4. ✅ Hero image generated (if needed)
5. ✅ CTA link works and lands in a Marcus-approved retention loop
6. ✅ Sana approves visual treatment
7. ✅ Scheduled with platform-correct dimensions

**Anything missing → it's a draft, not a post.**

---

## 7. Anti-Patterns (Sana's "never ship this" list)

- ❌ SVG hand-coded slides (we tried, it doesn't scale — that's why the skill was rewritten)
- ❌ Canva templates that look like everyone else's Canva
- ❌ Stock photos
- ❌ AI-generated diagrams from Midjourney (text rendering is unreliable)
- ❌ Reels with platform auto-captions (always burn in)
- ❌ Posts without a CTA
- ❌ Posts without a series
- ❌ Posts using stats not in the source pod

---

## 8. Future v2 Considerations

- **Headless Figma render via Plugin API** — auto-fill named layers from `carousel.md` programmatically. Cuts Layer 2 from 20 min to 2 min. Build after we've shipped 10+ posts manually.
- **Mermaid → branded SVG via custom theme** — automate the brand-correct rendering instead of mermaid.live default
- **Buffer/Hypefury MCP integration** — schedule from CLI
- **Per-series analytics dashboard** — track which series saves/shares are working

These are deferred. Ship Manual v1 first; automate what hurts.
