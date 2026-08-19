# Kwantum Tech — Design System (MASTER)

Global source of truth for kwantumtech.com. Page-specific overrides live in
`pages/<page>.md` and win over this file for that page only. The live
implementation of every token here is `src/app.css`; if the two ever disagree,
fix the drift — don't fork a third value.

Canonical brand authority: `Kwantum LinkedIn design system/CLAUDE.md`
(the locked triad). This MASTER extends it for the website only.

---

## 1. Brand foundation (LOCKED — never add colors)

| Token | Value | Role |
|---|---|---|
| `--black` | `#000000` | canvas |
| `--green` | `#00ff41` | accent ONLY |
| `--mint` | `#e0ffe0` | body text on dark |

Green is rationed to three moments per page: **the logo, one highlighted
headline word, the primary CTA**. The green glow
(`--glow: 0 0 22px rgb(0 255 65 / 0.35)`) is the site's only special effect
and follows the same ration. **Green never sits on white** — on light grounds,
green metrics live on black chips.

### Derived tones

| Token | Value | Role |
|---|---|---|
| `--tone-void` | `#000000` | primary dark ground |
| `--tone-panel` | `#050a06` | elevated dark (green-cast) |
| `--tone-paper` | `#f2f8f1` | light band ground (mint-cast paper) |
| `--ink` | `#0b130d` | text on paper |

### Text opacity steps (the only sanctioned ones)

Dark grounds: `--text-hi #fff` (H1/key strokes) · `--text` mint 0.86 ·
`--text-dim` mint 0.62 (smallest body allowed — 4.5:1+ on black) ·
`--text-faint` mint 0.45 (large/decorative only, never body).
Paper grounds: `--ink` · `--ink-dim` 0.68 · `--ink-faint` 0.45 (same rules).

Hairlines: `--line` mint 0.13 · `--line-strong` mint 0.26 ·
`--line-ink` ink 0.16 · `--line-green` green 0.35.

## 2. Typography

| Face | Role | Notes |
|---|---|---|
| **Space Grotesk** (variable) | Display — h1/h2/h3 | weight ≤700 (heavier synthesizes); tracking −0.03em; site-only addition, the LinkedIn kit stays Raleway-only |
| **Raleway** (variable) | Body | 1.6 line-height |
| **Share Tech Mono** | Labels, eyebrows, metrics, nav | uppercase, letterspaced 0.14–0.26em |

All self-hosted via Fontsource (no third-party font CSS). Fluid scale in
`src/app.css`: `--text-xs 0.72rem` → `--text-display clamp(2.7rem, …, 4.8rem)`.
Hierarchy is carried by scale, weight, and space — never by glow.

## 3. Space & layout

`--sp-1..6` (0.5 → 5rem) · section rhythm `--sp-section: clamp(4rem, 12vh, 8rem)`
(vh-keyed so tall phones breathe, short ones stay in the fold) ·
`--gutter: clamp(1.25rem, 5vw, 6rem)` · content column max 1280–1360px ·
`--measure: 62ch`.

**Tone bands**: pages are built from full-bleed `.band` sections
(`--panel` / `--paper` variants, `.band__inner` constrained column).
**No two dark bands adjacent** — every page's tone map is written out in
`README.md` and must stay alternating.

## 4. Motion

Hand-rolled (`src/lib/motion.js`) — GSAP is permitted **only on /web-apps**
(ScrollTrigger choreography), code-split away from every other route.

- Ease: `cubic-bezier(0.16, 1, 0.3, 1)` · reveals 1.2s · micro 0.25s ·
  travel 18px · `opacity`/`transform` only
- Reveal system: IO flips a registered `--p` custom property; CSS derives
  everything (register via `@property` AND `CSS.registerProperty` — some
  engines miss the former in injected stylesheets)
- One looping animation per page (the logo caret) plus ambient media
- Micro-interactions in use: panel tilt (pointer-fine, max 8°), nav underline
  drawn from the left, services hover-rule over the static hairline,
  two-arrow link exchange, rolling numbers
- **Retired by decision (2026-08): magnetic/springy CTA pull — too playful
  for the brand. Buttons move only via hover fill/glow. Don't reintroduce.**
- Everything collapses to final state under `prefers-reduced-motion`

## 5. Components

- `.btn--solid` green fill, black text; hover goes **lighter** (`#66ff8f`) +
  glow — never darker on a dark ground
- `.btn--ghost` green hairline; `.btn--ink` black chip for paper grounds
- **Report artifact**: white card, mono black header bar, failing grades
  (D `#b35800` on `#fff1e6` · C `#8a6d00` on `#fffae0` · F `#c22e24` on
  `#ffe9e7`) → green **A+ on a black chip**; black result strip; everything
  hypothetical is tagged `ILLUSTRATIVE`
- **Frosted plate** (type over imagery): `rgb(0 0 0 / 0.62)` +
  `backdrop-filter: blur(26px) saturate(1.55)` + opaque `@supports` fallback.
  Washes are banned for carrying type
- **Media windows are cut, not faded**: sharp 1px `--line-strong` hairline
  edge (hero video panel, OG terrain strips) — no gradient seams
- Forms: labels always visible (mono, dim), inputs scoped to field-wrapper
  classes, `transition: background-color 9999s` against Chrome autofill,
  focus = border swap + 2px underline
- Sticky mobile action bar: rises after the hero, retracts at forms/footer,
  48px min target, safe-area padded

## 6. Imagery

One commissioned family: the wave-terrain render (portrait 1080×1920 master).
Two trees, split enforced: `assets/` (source, never served) →
`scripts/media.py` (byte-identical, every setting commented) →
`static/assets/` (generated, never hand-edited). Tier ladder + posters +
OG cards; upscale never above 1.3×; unsharp `1.1/58/3` after every resize.
OG cards are generated from this system by `scripts/og.mjs` (run media.py
before and after).

## 7. Verification contracts (run after any visual change)

- `node scripts/contrast.mjs` — canvas-sampled contrast under each text
  element's own bbox; worst pixel unplated, mean behind blur plates, worst
  frame across the video loop. **Zero failures is the bar.**
- `node scripts/sweep.mjs` — 320→1600px in 20px steps; no horizontal
  overflow; nowrap lines flagged above 92% of their container
- `node scripts/shoot.mjs` — full-page shots at 320/375/768/1100/1440
- `scripts/.venv/bin/python scripts/media.py --verify` — byte-identical tree

Current measured numbers live in `README.md` ("Measured results").
