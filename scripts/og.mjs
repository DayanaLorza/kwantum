#!/usr/bin/env node
/* OG card authoring tool: renders 1200x630 share cards from the live design
 * system (triad, Space Grotesk + mono, one green word, sharp-hairline terrain
 * strip mirroring the hero) and writes them into assets/og/ — the SOURCE
 * tree. scripts/media.py then re-emits them into static/assets/og/.
 *
 * Order matters: the terrain strip is the pipeline's own poster frame, so run
 * `scripts/.venv/bin/python scripts/media.py` at least once before this tool,
 * and again after it to publish the regenerated cards.
 *
 * Usage: node scripts/og.mjs
 */
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ROOT = resolve(import.meta.dirname, '..');

const font = (p) => readFileSync(resolve(ROOT, 'node_modules', p)).toString('base64');
const GROTESK = font('@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2');
const MONO = font('@fontsource/share-tech-mono/files/share-tech-mono-latin-400-normal.woff2');
const POSTER = readFileSync(resolve(ROOT, 'static/assets/images/wave-terrain-poster-1080.jpg')).toString('base64');
const MARK = readFileSync(resolve(ROOT, 'src/lib/assets/logo/kwantum-mark.svg')).toString('base64');

const CARDS = [
  {
    name: 'og-home',
    eyebrow: 'KWANTUM TECH · PREMIUM ENGINEERING',
    headline: 'Elevating ambition through <em>flawless</em> digital execution.',
    trust: 'Custom apps · AI employees · Automation',
  },
  {
    name: 'og-ai-employees',
    eyebrow: 'KWANTUM TECH · AI EMPLOYEES',
    headline: 'Hire AI employees that <em>never&nbsp;clock&nbsp;out.</em>',
    size: 64,
    trust: 'Lead response · Client support · 24/7',
  },
  {
    name: 'og-ai-audit',
    eyebrow: 'KWANTUM TECH · AI AUDIT',
    headline: 'Automate your <em>to&#8209;do&nbsp;list.</em>',
    trust: '45 minutes · One written plan · 5+ hours back a week',
  },
];

const html = (c) => `<!doctype html><html><head><style>
  @font-face { font-family: G; src: url(data:font/woff2;base64,${GROTESK}) format('woff2'); }
  @font-face { font-family: M; src: url(data:font/woff2;base64,${MONO}) format('woff2'); }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #000; color: #fff; overflow: hidden; }
  .card { position: relative; width: 100%; height: 100%; display: flex; }
  /* terrain strip: native portrait crop, sharp hairline — mirrors the hero */
  .strip { position: absolute; top: 0; right: 0; bottom: 0; width: 360px;
           border-left: 1px solid rgb(224 255 224 / 0.28); }
  .strip img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 58%; }
  .copy { position: relative; z-index: 1; width: 840px; height: 100%;
          /* --h: per-card headline size */
          padding: 72px 64px; display: flex; flex-direction: column; }
  .eyebrow { font: 21px M; letter-spacing: 0.22em; color: #00ff41; white-space: nowrap; }
  h1 { font-family: G; font-weight: 600; font-size: var(--h, 76px); line-height: 1.06;
       letter-spacing: -0.03em; margin-top: 44px; max-width: 11.5em; }
  h1 em { font-style: normal; color: #00ff41; text-shadow: 0 0 28px rgb(0 255 65 / 0.4); }
  .trust { font: 19px M; letter-spacing: 0.1em; color: rgb(224 255 224 / 0.55);
           text-transform: uppercase; margin-top: 34px; white-space: nowrap; }
  .base { margin-top: auto; display: flex; align-items: center; gap: 20px; }
  .base img { width: 44px; height: 44px; }
  .domain { font: 24px M; letter-spacing: 0.1em; color: #e0ffe0; }
</style></head><body>
  <div class="card">
    <div class="copy" style="--h: ${c.size ?? 76}px">
      <div class="eyebrow">${c.eyebrow}</div>
      <h1>${c.headline}</h1>
      <div class="trust">${c.trust}</div>
      <div class="base">
        <img src="data:image/svg+xml;base64,${MARK}" />
        <span class="domain">kwantumtech.com</span>
      </div>
    </div>
    <div class="strip"><img src="data:image/jpeg;base64,${POSTER}" /></div>
  </div>
</body></html>`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

for (const c of CARDS) {
  // 'load', not 'networkidle0' — multi-MB data: URLs stall idle detection
  await page.setContent(html(c), { waitUntil: 'load', timeout: 60000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
  });
  const out = resolve(ROOT, 'assets/og', `${c.name}.png`);
  await page.screenshot({ path: out });
  console.log('wrote', out);
}

await browser.close();
