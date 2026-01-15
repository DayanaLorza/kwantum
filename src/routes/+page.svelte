<script>
  import { onMount } from "svelte";
  import gsap from "gsap";

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
        scale: 1.03,
        y: -10,
        boxShadow: "0 0 40px rgba(0, 255, 65, 0.6)",
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto"
      });
    };

    const onLeave = () => {
      gsap.to(panel, {
        scale: 1,
        y: 0,
        boxShadow: "0 0 0 rgba(0, 255, 65, 0)",
        duration: 0.25,
        ease: "power2.out",
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
        <span class="logo__mark">K</span>
        <span class="logo__text">Kwantum Tech</span>
      </a>
      <nav class="menu">
        <a href="#services">Services</a>
        <a href="mailto:hello@kwantum.tech">Say hello</a>
        <button class="menu__button" type="button" aria-label="Open menu">Menu</button>
      </nav>
    </div>
  </header>
  <section class="hero hero--video" id="hero">
    <div class="hero__video" aria-hidden="true">
      <video
        class="hero__video-el"
        src="/waves.mp4"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
      ></video>
      <video
        class="hero__video-el hero__video-el--mirror"
        src="/waves.mp4"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
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
          <h1>Building software worthy of your net worth.</h1>
          <p class="lead">
            Custom mobile + web applications that match your standards — and your bank account.
          </p>
		  <p class="sub-tagline">Keeping rich people apps as sharp as their lifestyle.</p>
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
              class="button button--ghost button--narrow"
              href="https://calendly.com/your-handle/15min"
            >
              Book a call
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
      <p class="eyebrow">What I Fix</p>
      <h2>Elite problems deserve elite solutions.</h2>
      <p>
        One-off builds and optimizations that make your tech feel as expensive as everything else
        you own.
      </p>
    </header>
    <div class="services__grid">
      <article>
        <h3>Custom Mobile & Web Apps</h3>
        <p>Bespoke applications that load fast, look flawless, and stay private.</p>
        <span>01</span>
      </article>
      <article>
        <h3>Performance Overhauls</h3>
        <p>Turn slow, dated systems into something that matches your standards.</p>
        <span>02</span>
      </article>
      <article>
        <h3>Private & Secure Tools</h3>
        <p>Discreet solutions for finance, crypto, scheduling, or whatever keeps you ahead.</p>
        <span>03</span>
      </article>
    </div>
  </section>

  <footer class="site-footer">
    <div class="site-footer__inner">
      <div class="footer__brand">
        <div class="footer__logo">
          <span class="footer__mark">K</span>
          <span>Kwantum Tech</span>
        </div>
        <p>
          Futuristic consulting for founders who demand performance, privacy, and premium software
          experiences.
        </p>
        <div class="footer__cta">
          <span>Start a private conversation</span>
          <a href="mailto:hello@kwantumtech.com">hello@kwantumtech.com</a>
        </div>
      </div>

    </div>

    <div class="footer__base">
      <span>© 2026 Kwantum Tech. All rights reserved.</span>
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
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 12px;
    background: var(--primary);
    color: var(--bg);
    font-weight: 700;
  }

  .logo__text {
    letter-spacing: 0.04em;
  }

  .menu {
    display: inline-flex;
    align-items: center;
    gap: 1.5rem;
    font-size: 0.95rem;
  }

  .menu a {
    color: var(--text);
    text-decoration: none;
  }

  .menu__button {
    border: 1px solid var(--primary);
    background: transparent;
    color: var(--text);
    padding: 0.45rem 1rem;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-size: 0.7rem;
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
    letter-spacing: -0.02em;
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
  }

  .hero__tag {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.24em;
    color: #FFF;
  }

  .lead {
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 2.1rem;
    max-width: 520px;
    color: var(--text);
  }

  .sub-tagline {
    font-size: 1.2rem;
    margin: 0;
    opacity: 0.85;
    max-width: 520px;
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
    gap: 0.8rem;
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
  }

  .footer__brand {
    display: grid;
    gap: 1.6rem;
  }

  .footer__logo {
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  .footer__mark {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 14px;
    background: var(--primary);
    color: var(--bg);
    font-weight: 700;
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

    .menu a {
      display: none;
    }

  }

  @media (max-width: 640px) {
    .hero__video {
      grid-template-columns: 1fr;
    }

    .hero__video-el--mirror {
      display: none;
    }
  }
</style>
