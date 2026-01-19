<script>
  import { onMount } from "svelte";
  import gsap from "gsap";
  import Logo from "$lib/Logo.svelte";

  onMount(() => {
    const panel = document.querySelector(".cta-panel");
    const hero = document.querySelector(".hero");
    if (!panel || !hero) return;

    gsap.set(panel, {
      transformPerspective: 800,
      transformOrigin: "center"
    });

    const onEnter = () => {
      gsap.to(panel, {
        scale: 1.015,
        y: -6,
        boxShadow: "0 0 22px rgba(0, 255, 65, 0.35)",
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto"
      });
    };

    const onLeave = () => {
      gsap.to(panel, {
        scale: 1,
        y: 0,
        boxShadow: "0 0 0 rgba(0, 255, 65, 0)",
        duration: 0.35,
        ease: "power3.out",
        overwrite: "auto"
      });
    };

    const rotXTo = gsap.quickTo(panel, "rotationX", {
      duration: 0.6,
      ease: "power3.out"
    });
    const rotYTo = gsap.quickTo(panel, "rotationY", {
      duration: 0.6,
      ease: "power3.out"
    });

    const onMove = (event) => {
      const bounds = hero.getBoundingClientRect();
      const relX = (event.clientX - bounds.left) / bounds.width;
      const relY = (event.clientY - bounds.top) / bounds.height;
      const rotateY = gsap.utils.interpolate(-14, 14, relX);
      const rotateX = gsap.utils.interpolate(12, -12, relY);
      rotXTo(rotateX);
      rotYTo(rotateY);
    };

    const onTiltLeave = () => {
      rotXTo(0);
      rotYTo(0);
    };

    panel.addEventListener("mouseenter", onEnter);
    panel.addEventListener("mouseleave", onLeave);
    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onTiltLeave);

    return () => {
      panel.removeEventListener("mouseenter", onEnter);
      panel.removeEventListener("mouseleave", onLeave);
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseleave", onTiltLeave);
    };
  });
</script>

<svelte:head>
  <title>Kwantum Tech | IT Consulting</title>
  <meta
    name="description"
    content="Kwantum Tech delivers modern IT consulting, cloud architecture, cybersecurity, and data solutions."
  />
</svelte:head>

<main class="page">
  <header class="site-header">
    <div class="site-header__inner">
      <a class="logo" href="#hero" aria-label="Kwantum Tech home">
        <Logo size={36} />
      </a>

    </div>
  </header>
  <section class="hero hero--video" id="hero">
    <div class="hero__video" aria-hidden="true">
      <video
        class="hero__video-el hero__video-el--desktop"
        src="/waves.mp4"
        autoplay
        muted
        loop
        playsinline
        preload="none"
      ></video>
      <video
        class="hero__video-el hero__video-el--mobile"
        src="/waves-compressed.mp4"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
      ></video>
      <video
        class="hero__video-el hero__video-el--mirror"
        src="/waves.mp4"
        autoplay
        muted
        loop
        playsinline
        preload="none"
      ></video>
      <div class="hero__video-overlay"></div>
    </div>
    <div class="hero__inner">
      <div class="hero__content">
        <div class="hero__content-left">
        <div class="hero__topline">
          <p class="eyebrow">Kwantum Tech</p>
          <span class="hero__tag">Premium Software Engineering</span>
        </div>
        <!-- <h1>Quantum-grade engineering for elite ambitions.</h1> -->
        <h1>Elevating ambition through flawless digital execution.</h1>
        <p class="lead">
          Custom-built mobile and web applications engineered for visionary leaders and high-impact enterprises where performance, security, and discretion are non-negotiable.
        </p>
        </div>
        <div class="hero__content-right">
          <div class="hero__meta">
            <div>
              <span>Capabilities</span>
              <ul class="hero__list">
                <li>Mobile & Web Engineering</li>
                <li>Infrastructure Architecture</li>
                <li>Performance Optimization</li>
                <li>Security & Privacy</li>
              </ul>
            </div>
            <div>
              <span>Industries</span>
              <ul class="hero__list">
                <li>Finance & Fintech</li>
                <li>Crypto & Digital Assets</li>
                <li>Luxury & Lifestyle</li>
                <li>Healthcare Leaders</li>
              </ul>
            </div>
          </div>
          <div class="hero__cta-panel cta-panel">
            <a
              class="button button--ghost"
              href="https://calendly.com/kwantumconsulting/30min"
            >
              Schedule a Strategy Review
            </a>
          </div>
        </div>
      </div>

      <!-- <div class="hero__media" data-gsap-hero>
        <div class="media__frame">
          <div class="media__caption">GSAP-ready hero • waves.mp4</div>
        </div>
      </div> -->
    </div>
  </section>

  <section id="services" class="services">
    <header>
      <p class="eyebrow">What We Solve</p>
      <h2>Elite challenges require elite execution.</h2>
      <p>
        Targeted builds and optimizations that deliver breakthrough performance, flawless design,
        and absolute discretion.
      </p>
    </header>
    <div class="services__grid">
      <article>
        <h3>Custom Mobile & Web Applications</h3>
        <p>
          Custom-built solutions that load instantly, look impeccable, and remain completely
          private.
        </p>
        <span>01</span>
      </article>
      <article>
        <h3>Performance Overhauls</h3>
        <p>
          Transforming slow or legacy systems into high-speed, modern infrastructure that meets
          the highest standards.
        </p>
        <span>02</span>
      </article>
      <article>
        <h3>Private & Secure Tools</h3>
        <p>
          Discreet, fortified solutions for sensitive operations — from finance and crypto to
          scheduling and proprietary workflows.
        </p>
        <span>03</span>
      </article>
    </div>
  </section>

  <footer class="site-footer">
    <div class="site-footer__inner">
      <div class="footer__brand">
        <p>
          Uncompromising digital execution delivered with precision and discretion for visionary founders who demand flawless performance, ironclad privacy, and software that elevates their most ambitious ventures to new heights.
        </p>
      </div>
      <div class="footer__aside">
        <div class="footer__cta">
          <span>Start a private conversation</span>
          <a href="mailto:hello@kwantumtech.com">hello@kwantumtech.com</a>
        </div>
      </div>

    </div>

    <div class="footer__base">
      <span>© 2026 Kwantum Consulting LLC. All rights reserved.</span>
      <span>Crafted for high-performance teams.</span>
    </div>
  </footer>
</main>

<style>
  :global(:root) {
    --primary: #00ff41;
    --accent: #ffff00;
    --bg: #000000;
    --text: #e0ffe0;
    --secondary: #39ff14;
  }

  :global(body) {
    margin: 0;
    font-family: "Raleway", "Inter", "Segoe UI", system-ui, sans-serif;
    color: var(--text);
    background: var(--bg);
  }

  :global(*) {
    box-sizing: border-box;
  }

  .page {
    min-height: 100vh;
    padding: 0 0 7rem;
    background: radial-gradient(circle at top, rgba(0, 255, 65, 0.2) 0%, transparent 55%);
  }

  .site-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .site-header__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.4rem 7vw;
    gap: 2rem;
  }

  .logo {
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    color: var(--text);
    text-decoration: none;
    font-weight: 600;
  }

  .logo__mark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
  }

  .logo__text {
    letter-spacing: 0.04em;
  }


  .hero {
    width: 100%;
    padding: 6rem 0;
    position: relative;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    overflow: hidden;
    min-height: 70vh;
  }

  .hero--video {
    background: #000000;
  }

  .hero__video {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    z-index: 0;
  }

  .hero__video-el {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .hero__video-el--mirror {
    transform: scaleX(-1);
  }

  .hero__video-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.2) 0%,
      rgba(0, 0, 0, 0.55) 55%,
      rgba(0, 0, 0, 0.75) 100%
    );
    z-index: 1;
  }

  .hero__video-el--mobile {
    display: none;
  }

  .hero__video-el--desktop {
    display: block;
  }

  .hero__inner {
    display: grid;
    gap: 3rem;
    align-items: start;
    grid-template-columns: 1fr;
    padding: 0 7vw;
    position: relative;
    z-index: 2;
  }

  .hero__content {
    align-self: start;
    display: grid;
    column-gap: 4.5rem;
    row-gap: 2.5rem;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    align-items: start;
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
  }

  .cta-panel {
    transform-style: preserve-3d;
    will-change: transform;
    transform-origin: center;
  }

  .hero__content-right {
    display: grid;
    gap: 1.8rem;
    align-content: start;
    min-height: 100%;
  }

  .hero__content h1 {
    font-size: clamp(2.6rem, 3vw + 1.2rem, 4rem);
    margin: 0 0 1.3rem;
    line-height: 1.06;
    letter-spacing: -0.05em;
    color: #ffffff;
    text-shadow: 0 0 6px rgba(0, 255, 65, 0.5);
  }

  .hero__topline {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.1rem;
  }

  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.28em;
    font-weight: 600;
    color: var(--primary);
    margin: 0;
    font-size: 0.72rem;
    white-space: nowrap;
  }

  .hero__tag {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.24em;
    color: #FFF;
  }

  .lead {
    font-size: 1.2rem;
    line-height: 1.6;
    margin-bottom: 2.1rem;
    max-width: 520px;
    color: var(--text);
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.85rem 1.7rem;
    border-radius: 999px;
    border: 1px solid transparent;
    text-decoration: none;
    font-weight: 600;
    letter-spacing: 0.02em;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }

  .button--ghost {
    background: transparent;
    color: var(--primary);
	font-size: x-large;
	font-weight: 300;
	text-shadow:
      0 0 2px #00ff41,
      0 0 5px #00ff41,
      0 0 10px #00ff41;
  }

  .button--narrow {
    padding: 0.6rem 1.3rem;
	width: 300px;
	justify-self: start;
  }

  .button:hover {
    transform: none;
  }

  .hero__meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.6rem;
    color: var(--text);
  }

  .hero__meta span {
    display: block;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    margin-bottom: 0.35rem;
    color: var(--primary);
  }

  .hero__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.55rem;
    color: rgba(224, 255, 224, 0.85);
    font-size: 0.95rem;
    line-height: 2;
  }

  .hero__cta-panel {
    display: grid;
    gap: 0.4rem;
    padding: 1.2rem 1.4rem;
    border-radius: 16px;
    border: 1px solid rgba(0, 255, 65, 0.2);
    background: rgba(0, 0, 0, 0.6);
    width: fit-content;
  }


  .services {
    margin-top: 5rem;
    display: grid;
    gap: 2.5rem;
    padding: 0 7vw;
  }

  .services h2 {
    margin: 0 0 1rem;
    font-size: clamp(1.9rem, 1.4vw + 1rem, 2.6rem);
    color: #ffffff;
    text-shadow: 0 0 10px var(--primary);
  }

  .services p {
    max-width: 620px;
    color: var(--text);
    line-height: 1.7;
  }

  .services__grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .services__grid article {
    background: rgba(0, 0, 0, 0.7);
    padding: 1.7rem;
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    min-height: 180px;
    display: grid;
    gap: 0;
  }

  .services__grid span {
    color: var(--accent);
    font-weight: 600;
    letter-spacing: 0.2em;
  }

  .site-footer {
    margin-top: 6rem;
    padding: 4rem 7vw 2.5rem;
    border-top: 1px solid rgba(0, 255, 65, 0.2);
    background: radial-gradient(
      circle at top right,
      rgba(0, 255, 140, 0.12),
      rgba(0, 0, 0, 0.95) 55%
    );
  }

  .site-footer__inner {
    display: grid;
    gap: 2rem;
    grid-template-columns: minmax(240px, 1fr) auto;
    align-items: start;
  }

  .footer__brand {
    display: grid;
    gap: 1.6rem;
  }

  .footer__aside {
    display: grid;
    justify-items: end;
    align-content: start;
  }

  .footer__brand p {
    color: rgba(224, 255, 224, 0.8);
    max-width: 420px;
    line-height: 1.7;
  }

  .footer__cta {
    display: grid;
    gap: 0.4rem;
    padding: 1.2rem 1.4rem;
    border-radius: 16px;
    border: 1px solid rgba(0, 255, 65, 0.2);
    background: rgba(0, 0, 0, 0.6);
    margin: 4rem 4rem 2rem 0;
  }

  .footer__cta span {
    text-transform: uppercase;
    letter-spacing: 0.25em;
    font-size: 0.7rem;
    color: var(--primary);
  }

  .footer__cta a {
    color: #ffffff;
    text-decoration: none;
    font-weight: 600;
  }


  .footer__base {
    margin-top: 3rem;
    padding-top: 1.6rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-between;
    font-size: 0.85rem;
    color: rgba(224, 255, 224, 0.65);
  }

  @media (max-width: 900px) {
    .hero {
      padding: 3.5rem 0;
    }

    .hero__inner {
      grid-template-columns: 1fr;
      padding: 0 6vw;
    }

    .hero__content {
      grid-template-columns: 1fr;
      row-gap: 2rem;
    }

    .site-header__inner {
      padding: 1.1rem 6vw;
    }

    .site-footer__inner {
      grid-template-columns: 1fr;
    }

    .footer__aside {
      justify-items: start;
    }

  }

  @media (max-width: 640px) {
    .hero {
      padding: 2rem 0;
    }

    .hero__video {
      grid-template-columns: 1fr;
    }

    .hero__video-el--mirror {
      display: none;
    }

    .hero__video-el--desktop {
      display: none;
    }

    .hero__video-el--mobile {
      display: block;
    }

    .hero__video-overlay {
      background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.5) 0%,
        rgba(0, 0, 0, 0.75) 55%,
        rgba(0, 0, 0, 0.85) 100%
      );
    }

    .hero__content {
      row-gap: 1.5rem;
    }

    .hero__topline {
      display: none;
    }

    h1 {
      font-size: 1.75rem;
      line-height: 1.2;
      margin-bottom: 1rem;
      text-shadow: 0 0 3px rgba(0, 255, 65, 0.3);
    }

    .lead {
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }

    .hero__meta {
      grid-template-columns: 1fr 1fr;
      gap: 1.2rem;
      font-size: 0.85rem;
    }

    .hero__meta span {
      font-size: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .hero__list {
      gap: 0.4rem;
      font-size: 0.85rem;
      line-height: 1.6;
    }

    .button--ghost {
      font-size: 1.1rem;
      width: auto;
      height: auto;
      padding: 0.7rem 1.2rem;
      text-align: center;
      line-height: 1.4;
    }

    .button--narrow {
      padding: 0.5rem 1rem;
      width: 210px;
      font-size: 0.95rem;
      text-align: center;
    }

    .hero__cta-panel {
      justify-self: center;
      margin-top: 0.5rem;
      width: 100%;
      max-width: 100%;
    }
  }
</style>
