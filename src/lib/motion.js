/* Hand-rolled motion system — no animation library on this path.
 *
 * Contract (see src/app.css):
 *  - JS writes CSS custom properties / classes; CSS derives all visuals.
 *  - Only `opacity` and `transform` ever animate.
 *  - Everything collapses to final state under prefers-reduced-motion.
 *  - tilt() writes an inline transform: never ALSO give that element a CSS
 *    transform (the inline one wins silently) — wrap it instead.
 */

/* Mirror of the @property --p rule in app.css: some engines miss @property
 * in dynamically injected stylesheets, and an unregistered --p leaves every
 * reveal stuck at 0. The duplicate registration throws and is swallowed. */
if (typeof window !== 'undefined' && window.CSS?.registerProperty) {
  try {
    CSS.registerProperty({ name: '--p', syntax: '<number>', inherits: true, initialValue: '0' });
  } catch { /* already registered — fine */ }
}

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const finePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: fine)').matches;

/** One-shot entrance reveal. `use:reveal` or `use:reveal={{ delay: 120 }}`.
 * Flips --p 0→1 when the element enters the viewport; CSS does the rest. */
export function reveal(node, { delay = 0 } = {}) {
  node.dataset.reveal = '';
  node.style.setProperty('--p', '0');
  if (reduced()) {
    node.style.setProperty('--p', '1');
    return {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        io.disconnect();
        setTimeout(() => node.style.setProperty('--p', '1'), delay);
      }
    },
    { rootMargin: '0px 0px -12% 0px' }
  );
  io.observe(node);
  return { destroy: () => io.disconnect() };
}

/** Staggered reveal for a container's direct children. */
export function revealChildren(node, { step = 90, delay = 0 } = {}) {
  const kids = [...node.children];
  const teardowns = kids.map((kid, i) =>
    reveal(kid, { delay: delay + i * step })
  );
  return { destroy: () => teardowns.forEach((t) => t.destroy?.()) };
}

/** Pointer-tracked tilt for a panel. `use:tilt={{ zone, max: 10 }}` where
 * `zone` (selector or element) is the hover area driving the tilt. */
export function tilt(node, { zone, max = 10 } = {}) {
  if (reduced() || !finePointer()) return {};
  const area =
    typeof zone === 'string' ? node.closest(zone) ?? node : zone ?? node;
  let raf = 0;
  let targetX = 0, targetY = 0, curX = 0, curY = 0;

  const step = () => {
    // critically-damped-ish chase: 12% per frame reads as weight, not lag
    curX += (targetX - curX) * 0.12;
    curY += (targetY - curY) * 0.12;
    node.style.transform = `perspective(900px) rotateX(${curX.toFixed(2)}deg) rotateY(${curY.toFixed(2)}deg)`;
    if (Math.abs(targetX - curX) + Math.abs(targetY - curY) > 0.01) {
      raf = requestAnimationFrame(step);
    } else {
      raf = 0;
    }
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(step); };

  const onMove = (e) => {
    const b = area.getBoundingClientRect();
    targetY = ((e.clientX - b.left) / b.width - 0.5) * 2 * max;
    targetX = ((e.clientY - b.top) / b.height - 0.5) * -2 * max;
    kick();
  };
  const onLeave = () => { targetX = 0; targetY = 0; kick(); };

  area.addEventListener('mousemove', onMove);
  area.addEventListener('mouseleave', onLeave);
  return {
    destroy() {
      area.removeEventListener('mousemove', onMove);
      area.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    },
  };
}

/** Magnetic pull for CTAs: the element leans toward a nearby cursor with
 * distance falloff and springs home on exit. Pointer-fine only. */
export function magnetic(node, { radius = 90, pull = 0.32 } = {}) {
  if (reduced() || !finePointer()) return {};
  let raf = 0;

  const onMove = (e) => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const b = node.getBoundingClientRect();
      const dx = e.clientX - (b.left + b.width / 2);
      const dy = e.clientY - (b.top + b.height / 2);
      const dist = Math.hypot(dx, dy);
      const reach = radius + Math.max(b.width, b.height) / 2;
      if (dist > reach) return release();
      const fall = 1 - dist / reach; // linear falloff → strongest dead-centre
      node.style.transition = 'none';
      node.style.transform = `translate(${dx * pull * fall}px, ${dy * pull * fall}px)`;
    });
  };

  const release = () => {
    // spring home: slight overshoot sells the magnet without a physics lib
    node.style.transition = 'transform 0.55s cubic-bezier(0.22, 1.6, 0.36, 1)';
    node.style.transform = 'translate(0, 0)';
  };

  window.addEventListener('mousemove', onMove, { passive: true });
  return {
    destroy() {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    },
  };
}

/** Rolling number: counts a numeric text node up when it enters the
 * viewport. `use:rollNumber={{ to: 7, duration: 900 }}` */
export function rollNumber(node, { to, duration = 900, format = (n) => String(n) } = {}) {
  if (reduced()) {
    node.textContent = format(to);
    return {};
  }
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4); // expo-out
      node.textContent = format(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  io.observe(node);
  return { destroy: () => io.disconnect() };
}
