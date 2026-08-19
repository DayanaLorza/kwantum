import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
const p = await b.newPage();
await p.setViewport({ width: 375, height: 812 });
await p.goto('http://localhost:53711/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));
const out = await p.evaluate(() => {
  const panel = document.querySelector('.cta-panel');
  const info = (el) => el && { tag: el.tagName, cls: el.className, rect: JSON.parse(JSON.stringify(el.getBoundingClientRect())), text: (el.textContent||'').slice(0,40) };
  return {
    panel: info(panel),
    kids: [...panel.children].map(info),
    bar: info(document.querySelector('.bar')),
    barCS: (() => { const b2 = document.querySelector('.bar'); const cs = getComputedStyle(b2); return { pos: cs.position, transform: cs.transform, display: cs.display }; })(),
    panelTransform: getComputedStyle(panel).transform,
  };
});
console.log(JSON.stringify(out, null, 1));
await b.close();
