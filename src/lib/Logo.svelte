<script>
  import { onMount } from 'svelte';

  let { size = 24 } = $props();

  const TEXT = 'KWANTUM';
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

  // SSR renders the settled wordmark, so crawlers and reduced-motion users
  // never see scramble; the decode plays once on mount and stops.
  let display = $state(TEXT);
  let settled = $state(false);

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      settled = true;
      return;
    }
    const DUR = 700;   // per-letter decode time
    const STAG = 70;   // per-letter stagger
    const t0 = performance.now();
    let raf;
    const tick = (t) => {
      let out = '';
      let done = 0;
      for (let i = 0; i < TEXT.length; i++) {
        if ((t - t0 - i * STAG) / DUR >= 1) {
          out += TEXT[i];
          done += 1;
        } else {
          out += CHARS[(Math.random() * CHARS.length) | 0];
        }
      }
      display = out;
      if (done === TEXT.length) {
        settled = true;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });
</script>

<span class="wordmark" style="font-size: {size}px" aria-label="Kwantum">
  <span aria-hidden="true">{display}</span><span
    class="cursor"
    class:cursor--on={settled}
    aria-hidden="true">|</span>
</span>

<style>
  .wordmark {
    font-family: var(--font-mono);
    font-weight: 400;
    letter-spacing: 0.08em;
    color: var(--green);
    /* the logo is one of the page's three sanctioned glow moments */
    text-shadow: 0 0 8px rgb(0 255 65 / 0.55);
    user-select: none;
    white-space: nowrap;
  }

  .cursor {
    opacity: 0;
    margin-left: 0.06em;
  }

  /* the blinking caret is the page's single looping animation */
  .cursor--on {
    animation: blink 1.1s step-end infinite;
  }

  @keyframes blink {
    0%, 50% { opacity: 1; }
    50.01%, 100% { opacity: 0; }
  }
</style>
