#!/usr/bin/env node
/* Nowrap / overflow sweep (the brief's 320→1600px, 20px-step contract).
 *
 * At every width it measures, for each visible element with
 * white-space:nowrap or an authored <br>, rendered text width against the
 * nearest block container's content width, and reports the tightest case
 * per element across the sweep. Anything above 92% is flagged — font
 * metrics vary. Also flags any horizontal page overflow at any width.
 *
 * Usage: node scripts/sweep.mjs <baseUrl> [route ...]
 */
import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [base = 'http://localhost:53711', ...routeArgs] = process.argv.slice(2);
const routes = routeArgs.length ? routeArgs : ['/', '/audit', '/ai-agents', '/apps', '/apps-v2', '/contact'];

const widths = [];
for (let w = 320; w <= 1600; w += 20) widths.push(w);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
let anyFail = false;

for (const route of routes) {
  const page = await browser.newPage();
  const worst = new Map(); // key -> {pct, width, text}
  const overflows = [];

  for (const width of widths) {
    await page.setViewport({ width, height: 900 });
    if (page.url() === 'about:blank') {
      await page.goto(base + route, { waitUntil: 'networkidle0', timeout: 45000 });
    } else {
      await new Promise((r) => setTimeout(r, 60)); // reflow after resize
    }
    const res = await page.evaluate(() => {
      document.querySelectorAll('[data-reveal]').forEach((el) => el.style.setProperty('--p', '1'));
      const out = [];
      const seen = new Set();
      const cands = new Set();
      for (const el of document.querySelectorAll('body *')) {
        if (!el.textContent?.trim()) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        if (cs.whiteSpace === 'nowrap' || el.querySelector(':scope > br')) cands.add(el);
      }
      for (const el of cands) {
        // nearest block ancestor = the real container the text must fit
        let box = el.parentElement;
        while (box && getComputedStyle(box).display.includes('inline')) box = box.parentElement;
        if (!box) continue;
        const bcs = getComputedStyle(box);
        const avail = box.clientWidth - parseFloat(bcs.paddingLeft) - parseFloat(bcs.paddingRight);
        if (avail <= 0) continue;
        // widest LINE box, not the element box — a block with an authored
        // <br> fills its container by definition and would always read 100%
        const range = document.createRange();
        range.selectNodeContents(el);
        let w = 0;
        for (const r of range.getClientRects()) w = Math.max(w, r.width);
        if (!w) continue;
        // truncation-by-design (ellipsis) is exempt from the sweep
        if (getComputedStyle(el).textOverflow === 'ellipsis') continue;
        const key = (el.className || el.tagName) + '::' + el.textContent.trim().slice(0, 30);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ key, pct: (w / avail) * 100 });
      }
      return {
        items: out,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    if (res.overflow > 1) overflows.push({ width, by: res.overflow });
    for (const it of res.items) {
      const prev = worst.get(it.key);
      if (!prev || it.pct > prev.pct) worst.set(it.key, { pct: it.pct, width });
    }
  }

  const flagged = [...worst.entries()]
    .filter(([, v]) => v.pct > 92)
    .sort((a, b) => b[1].pct - a[1].pct);
  const tight = [...worst.entries()].sort((a, b) => b[1].pct - a[1].pct).slice(0, 3);

  console.log(`\n── ${route} ──`);
  if (overflows.length) {
    anyFail = true;
    console.log(`  HORIZONTAL OVERFLOW at ${overflows.length} widths, e.g. ${overflows.slice(0, 4).map((o) => `${o.width}px(+${o.by})`).join(', ')}`);
  } else {
    console.log('  no horizontal overflow at any width');
  }
  if (flagged.length) {
    anyFail = true;
    for (const [k, v] of flagged) console.log(`  FLAG ${v.pct.toFixed(1)}% @${v.width}px  ${k}`);
  } else {
    console.log(`  tightest nowrap cases: ${tight.map(([k, v]) => `${v.pct.toFixed(1)}% @${v.width}px (${k.split('::')[1].slice(0, 20)}…)`).join(' · ')}`);
  }
  await page.close();
}

await browser.close();
process.exit(anyFail ? 1 : 0);
