#!/usr/bin/env node
/* Screenshot harness for visual QA: renders pages at the brief's verification
 * widths with system Chrome (headless). Usage:
 *   node scripts/shoot.mjs <baseUrl> <outDir> [route ...]
 * Produces <outDir>/<route>-<width>.png full-page shots.
 */
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WIDTHS = [320, 375, 768, 1100, 1440];

const [base = 'http://localhost:53711', outDir = 'shots', ...routes] = process.argv.slice(2);
const pages = routes.length ? routes : ['/'];

mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
});

for (const route of pages) {
  const slug = route === '/' ? 'home' : route.replace(/\//g, '');
  for (const width of WIDTHS) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    await page.goto(base + route, { waitUntil: 'networkidle0', timeout: 45000 });
    // let entrance transitions finish, then freeze further motion
    await new Promise((r) => setTimeout(r, 1800));
    await page.evaluate(() => {
      document.querySelectorAll('[data-reveal]').forEach((el) => el.style.setProperty('--p', '1'));
      document.getAnimations().forEach((a) => { try { a.finish(); } catch {} });
      // fixed overlays photobomb full-page captures at their viewport offset;
      // the sticky bar is verified separately in scrolled viewport shots
      document.querySelectorAll('.bar').forEach((el) => (el.style.display = 'none'));
    });
    await new Promise((r) => setTimeout(r, 200));
    await page.screenshot({ path: `${outDir}/${slug}-${width}.png`, fullPage: true });
    await page.close();
  }
  console.log(`${slug}: shot at ${WIDTHS.join(', ')}`);
}

await browser.close();
