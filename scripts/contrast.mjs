#!/usr/bin/env node
/* Canvas contrast measurement (the "measure, don't eyeball" contract).
 *
 * For every text element that sits over imagery, frost, or a generated
 * backdrop, this samples the REAL composited ground under the element's own
 * bounding box — not the frame average:
 *   - text is hidden (visibility) so it can't pollute its own sample
 *   - the region is screenshotted from the live compositor (video frame,
 *     backdrop blur, plate fill, SVG field — everything included)
 *   - video-backed regions are re-sampled at 1s steps across the whole loop
 *     and the WORST frame is reported
 *   - unplated text is judged by the worst pixel; text on a backdrop-blur
 *     plate is judged by the mean (the blur is what makes the mean valid)
 *
 * Usage: node scripts/contrast.mjs <baseUrl>
 */
import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const base = process.argv[2] ?? 'http://localhost:53711';

/* judge: 'worst' (unplated) | 'mean' (behind a backdrop-blur plate) */
const PAGES = [
  {
    route: '/',
    viewport: { width: 1440, height: 900 },
    video: true,
    targets: [
      { sel: '.cta-panel__eyebrow', judge: 'mean' },
      { sel: '.cta-panel__title', judge: 'mean' },
      { sel: '.cta-panel__copy', judge: 'mean' },
      /* .cta-panel .btn carries its own opaque fill: black on #00ff41 is
         15.3:1 analytically — canvas-sampling its backdrop would be wrong */
      { sel: '.hero__ticker span:nth-child(1)', judge: 'mean' },
      { sel: '.hero__ticker span:nth-child(9)', judge: 'mean' },
    ],
  },
  {
    route: '/',
    viewport: { width: 375, height: 812 },
    video: true,
    targets: [
      { sel: '.cta-panel__title', judge: 'mean' },
      { sel: '.cta-panel__copy', judge: 'mean' },
    ],
  },
  {
    route: '/contact',
    viewport: { width: 1440, height: 900 },
    video: false,
    targets: [
      { sel: '.contact__head .eyebrow', judge: 'worst' },
      { sel: '.contact__head h1', judge: 'worst' },
      { sel: '.contact__head .lead', judge: 'worst' },
      { sel: '.info h2', judge: 'mean' },
      { sel: '.info p', judge: 'mean' },
    ],
  },
  {
    route: '/ai-agents',
    viewport: { width: 1440, height: 900 },
    video: false,
    targets: [
      { sel: '.ahero__copy .eyebrow', judge: 'worst' },
      { sel: '.ahero__copy h1', judge: 'worst' },
      { sel: '.ahero__copy .lead', judge: 'worst' },
    ],
  },
];

const srgb = (c) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const relLum = (r, g, b) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const results = [];

for (const cfg of PAGES) {
  const page = await browser.newPage();
  await page.setViewport(cfg.viewport);
  await page.goto(base + cfg.route, { waitUntil: 'networkidle0', timeout: 45000 });
  await new Promise((r) => setTimeout(r, 1600));
  await page.evaluate(() => {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.style.setProperty('--p', '1'));
    document.getAnimations().forEach((a) => { try { a.finish(); } catch {} });
    document.querySelectorAll('.bar').forEach((el) => (el.style.display = 'none'));
  });

  // make sure hero videos are loaded & controllable
  if (cfg.video) {
    await page.evaluate(async () => {
      const vids = [...document.querySelectorAll('video')];
      await Promise.all(vids.map(async (v) => {
        if (!v.src) return;
        v.muted = true;
        try { await v.play(); } catch {}
        v.pause();
        if (v.readyState < 2) {
          await new Promise((res) => v.addEventListener('loadeddata', res, { once: true }));
        }
      }));
    });
  }

  const frames = cfg.video ? [0, 1, 2, 3, 4, 5, 6, 7, 8] : [0];

  // collect target geometry + colors, then hide the text
  const meta = await page.evaluate((targets) => {
    return targets.map(({ sel }) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const m = cs.color.match(/\d+(\.\d+)?/g).map(Number);
      el.style.visibility = 'hidden';
      return {
        sel,
        rect: { x: r.x, y: r.y, w: r.width, h: r.height },
        color: m.slice(0, 3),
        font: `${cs.fontWeight} ${parseFloat(cs.fontSize)}px`,
        large: parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && Number(cs.fontWeight) >= 700),
      };
    }).filter(Boolean);
  }, cfg.targets);

  const stats = new Map(); // sel -> {worstRatio, frame, ...}

  for (const t of frames) {
    if (cfg.video) {
      await page.evaluate(async (time) => {
        const vids = [...document.querySelectorAll('video')].filter((v) => v.src);
        await Promise.all(vids.map((v) => new Promise((res) => {
          v.addEventListener('seeked', res, { once: true });
          v.currentTime = time;
          setTimeout(res, 800); // safety
        })));
      }, t);
      await new Promise((r) => setTimeout(r, 150));
    }

    for (let i = 0; i < meta.length; i++) {
      const m = meta[i];
      const judge = cfg.targets.find((x) => x.sel === m.sel).judge;
      const clip = {
        x: Math.max(0, Math.round(m.rect.x)),
        y: Math.max(0, Math.round(m.rect.y)),
        width: Math.max(1, Math.round(m.rect.w)),
        height: Math.max(1, Math.round(m.rect.h)),
      };
      const b64 = await page.screenshot({ clip, encoding: 'base64' });
      const ground = await page.evaluate(async (b) => {
        const img = new Image();
        img.src = 'data:image/png;base64,' + b;
        await img.decode();
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        let min = 1, max = 0, sum = 0, n = 0;
        const lum = (r, g, bb) => {
          const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bb);
        };
        for (let p = 0; p < d.length; p += 4) {
          const L = lum(d[p], d[p + 1], d[p + 2]);
          if (L < min) min = L;
          if (L > max) max = L;
          sum += L; n++;
        }
        return { min, max, mean: sum / n };
      }, b64);

      const Ltext = relLum(...m.color);
      // worst pixel = the ground extreme closest to the text's own luminance
      const groundL = judge === 'mean'
        ? ground.mean
        : (Ltext > 0.5 ? ground.max : ground.min);
      const r = ratio(Ltext, groundL);
      const prev = stats.get(m.sel);
      if (!prev || r < prev.ratio) {
        stats.set(m.sel, { ratio: r, frame: t, judge, groundL, ...m });
      }
    }
  }

  // restore text
  await page.evaluate((sels) => {
    sels.forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) el.style.visibility = '';
    });
  }, meta.map((m) => m.sel));

  for (const [sel, st] of stats) {
    const need = st.large ? 3.0 : 4.5;
    results.push({
      page: `${cfg.route} @${cfg.viewport.width}`,
      sel,
      font: st.font,
      judge: st.judge,
      worstFrame: cfg.video ? `t=${st.frame}s` : '-',
      ratio: +st.ratio.toFixed(2),
      need,
      pass: st.ratio >= need,
    });
  }
  await page.close();
}

await browser.close();

for (const r of results) {
  console.log(
    `${r.pass ? 'PASS' : 'FAIL'}  ${r.ratio.toString().padEnd(5)} (need ${r.need})  ` +
    `${r.page}  ${r.sel}  [${r.judge}, ${r.worstFrame}, ${r.font}]`
  );
}
const fails = results.filter((r) => !r.pass).length;
console.log(`\n${results.length} targets, ${fails} failures`);
process.exit(fails ? 1 : 0);
