# Kwantum Tech

Home of **Kwantum Tech**, the flagship site for **Kwantum Consulting LLC** —
SvelteKit 5 on Netlify, with a serverless contact API. The site is the product
demo: every decision below is measured, not eyeballed. Read this before undoing
anything.

## Development

```bash
npm install
npm run dev        # vite dev (honours $PORT)
npm run build      # production build (adapter-netlify, Node 20 — see .nvmrc)
```

## Design system (locked)

The brand triad is **locked** — never add colors
(canonical spec: `Kwantum LinkedIn design system/CLAUDE.md`):

| Token | Value | Role |
|---|---|---|
| `--black` | `#000000` | canvas |
| `--green` | `#00ff41` | accent ONLY — logo, one highlighted word per page, primary CTA |
| `--mint`  | `#e0ffe0` | body text on dark (sanctioned opacity steps in `src/app.css`) |

Derived tones: `--tone-panel #050a06` (elevated dark), `--tone-paper #f2f8f1`
(light bands, ink text `#0b130d`). **Green never sits on white** — on paper,
green metrics live on black chips (`.grade--pass`, `.process__pay`).

**Type**: Space Grotesk (display, wght ≤700 — heavier synthesizes), Raleway
(body), Share Tech Mono (labels/eyebrows/metrics). All self-hosted via
Fontsource — no render-blocking third-party font CSS.

**The green glow is the only special effect**, rationed to three moments per
page: the logo, one highlighted headline word, the primary CTA.

### Tone maps (no two dark sections adjacent — keep these sequences)

- **Home**: hero (void+video) → proof report (paper) → services (panel) →
  process (paper) → AI-audit CTA (void) → footer (chrome)
- **/ai-audit**: hero (void, white report artifact) → trust strip → ladder
  (paper) → problem (panel) → how (paper) → final CTA (void)
- **/ai-agents**: hero (void) → timeline strip → problem (paper) →
  solution+showcase (panel) → industries (paper) → how (void) → scenarios
  (paper) → FAQ (void) → boundaries (paper) → final (void)
- **/contact**: dark ground + NeuralField, with the **form card as the paper
  counterweight** (also defuses Chrome's opaque autofill boxes)
- **/web-apps**: committed single-tone blueprint concept (mint-tinted grid) —
  the white browser-demo artifact and title-block form carry the light.

## Asset pipeline — two trees, split enforced

```
assets/          source art  — hand-managed, NEVER served
static/assets/   GENERATED   — never edited by hand (static/ ≡ public/)
```

`scripts/media.py` is the only writer of `static/assets/` and rebuilds
**byte-identically** — prove it any time:

```bash
scripts/.venv/bin/python scripts/media.py --verify   # → "byte-identical: 16 files match"
```

Every crop, grade, and encode setting lives in that script with a comment
explaining why. Highlights:

- Hero loop: forward-only, last second cross-dissolved into the first
  (palindromes read as a glitch). Grade baked into the encode
  (`eq=brightness=-0.05:contrast=1.04:saturation=1.15`), never CSS filters.
  H.264 high only — never HEVC. Tier ladder 1080/720/540 (4.3/2.6/1.4 MB,
  CRF 30/30/31 chosen by A/B frame inspection; hqdn3d + 24fps cut 12MB → 4.3MB).
- Posters are the encoded loop's own first frame (no jump/colour shift),
  AVIF/WebP/JPEG srcset ladders, explicit width/height.
- Unsharp after every resize: `radius=1.1, percent=58, threshold=3`.
- Runtime tier pick: `src/lib/videoTier.js` — panel width × dpr ÷ 1.3 (upscale
  limit), capped by `navigator.connection`; absent API ⇒ assume quality.
- Video costs nothing until visible: no `autoplay` attr, `preload="none"`,
  src attached by IntersectionObserver, paused off-screen
  (`src/lib/VideoPanel.svelte`).

## Motion system

Hand-rolled (`src/lib/motion.js`): reveal/revealChildren (IO → `--p` custom
property, CSS derives everything), tilt (rAF chase), magnetic CTAs (distance
falloff + spring release), rollNumber. `cubic-bezier(0.16,1,0.3,1)`, 18px
travel, opacity/transform only. Everything collapses under
`prefers-reduced-motion`. `--p` is registered via `@property` in CSS **and**
`CSS.registerProperty` in JS — some engines miss `@property` in injected
stylesheets and every reveal sticks at 0 without the JS mirror.

**GSAP survives on `/web-apps` only** — its ScrollTrigger choreography
(sticky-dock hand-off, scrubbed timeline) is the concrete reason; SvelteKit
code-splits it away from every other route. Don't add it elsewhere.

The one looping animation per page: the logo caret (plus ambient media).

## Measured results (2026-08-19)

Harnesses: `scripts/contrast.mjs` (canvas-samples the real composited ground
under each text element's own bbox — worst pixel unplated, mean behind
backdrop-blur plates, worst frame across the 9s video loop),
`scripts/sweep.mjs` (nowrap/overflow, 320→1600px in 20px steps),
`scripts/shoot.mjs` (full-page shots at 320/375/768/1100/1440).

- **Contrast: 15 targets, 0 failures.** Worst cases: contact `.lead` 5.86:1
  worst-pixel over NeuralField (needs 4.5 — the field runs at `opacity: 0.42`
  *because* 0.5 measured 4.42:1; don't raise it), ai-agents `h1` 5.61:1,
  everything else ≥7.6:1. CTA plate over video: ≥13.8:1 mean across all frames
  (plate: `rgb(0 0 0/0.62)` + `blur(26px) saturate(1.55)`, opaque
  `@supports` fallback).
- **Nowrap sweep: no horizontal overflow at any width on any route.**
  Tightest case sitewide: header wordmark 86.8% @320px (flag line is 92%).
- **Focus**: every interactive element keyboard-reachable; links/buttons show
  the global 2px green `:focus-visible` ring; form fields swap border to
  green/ink + 2px underline (intentional — no bare `outline: none`).
- **First-view payload (prod, 1440px)**: ~350 KB before media
  (JS 110 · poster 105 · fonts 82 · CSS 27 · HTML 25), hero video streams
  progressively on top (was 18 MB ×2 + 6.5 MB before).

## Known constraints — don't rediscover these

- Solid buttons on dark grounds hover **lighter** (`#66ff8f`), never darker —
  a darkening fill vanishes into the ground.
- Input styles are scoped to field-wrapper classes, and every form input
  carries `transition: background-color 9999s` for Chrome autofill.
- The hero copy column sits on solid void by design: this video cannot carry
  unplated type at worst-pixel standards without a full-frame wash that
  buries it (measured — that's why the old full-bleed layout died).
- `.hero__seam` is a seam blend (≤14% width, fully released), not a wash;
  never extend it under type.
- Poster `<img>` is positioned absolutely because a `<picture>` wrapper
  breaks a child's `height: 100%`.
- tilt() writes inline transforms — never give those elements a CSS
  transform; wrap instead (`.hero__panel-zone` holds the perspective).
- Testimonial-style content must stay **explicitly illustrative** (the
  `/ai-agents` scenario cards) until real, permissioned client proof exists.
  Never reintroduce invented names/roles/cities.
