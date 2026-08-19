<script>
  import { onMount } from 'svelte';

  /** Thumb-reachable sticky CTA for phones: rises once the hero has scrolled
   * away, retracts when the retract target (a form or the footer) is in view
   * so it never covers the thing it points to. */
  let { href, label = 'Book a Call', retract = '.site-footer, form' } = $props();

  let pastHero = $state(false);
  let nearEnd = $state(false);

  onMount(() => {
    if (!window.matchMedia('(max-width: 640px)').matches) return;

    const hero = document.querySelector('main section');
    const ios = [];

    if (hero) {
      const heroIo = new IntersectionObserver(
        ([e]) => (pastHero = !e.isIntersecting),
        { rootMargin: '-15% 0px 0px 0px' }
      );
      heroIo.observe(hero);
      ios.push(heroIo);
    }

    const ends = document.querySelectorAll(retract);
    if (ends.length) {
      const endIo = new IntersectionObserver((entries) => {
        nearEnd = entries.some((e) => e.isIntersecting);
      });
      ends.forEach((el) => endIo.observe(el));
      ios.push(endIo);
    }

    return () => ios.forEach((io) => io.disconnect());
  });
</script>

<div class="bar" class:bar--on={pastHero && !nearEnd} aria-hidden={!(pastHero && !nearEnd)}>
  <a class="bar__cta" {href} tabindex={pastHero && !nearEnd ? 0 : -1}>{label}</a>
</div>

<style>
  .bar {
    display: none;
  }

  @media (max-width: 640px) {
    .bar {
      display: block;
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 30;
      padding: 0.75rem var(--gutter) calc(0.75rem + env(safe-area-inset-bottom));
      background: rgb(0 0 0 / 0.82);
      backdrop-filter: blur(18px) saturate(1.4);
      -webkit-backdrop-filter: blur(18px) saturate(1.4);
      border-top: 1px solid var(--line);
      transform: translateY(110%);
      transition: transform 0.45s var(--ease-out);
    }

    @supports not (backdrop-filter: blur(1px)) {
      .bar {
        background: rgb(0 0 0 / 0.97);
      }
    }

    .bar--on {
      transform: translateY(0);
    }

    .bar__cta {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      border-radius: 999px;
      background: var(--green);
      color: var(--black);
      font-weight: 700;
      font-size: 1rem;
      letter-spacing: 0.02em;
      text-decoration: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .bar {
        transition: none;
      }
    }
  }
</style>
