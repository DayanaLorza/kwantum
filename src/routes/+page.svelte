<script>
  import { onMount } from "svelte";
  import gsap from "gsap";
  import Seo from "$lib/Seo.svelte";
  import {
    organizationSchema,
    websiteSchema,
    professionalServiceSchema,
  } from "$lib/seo/schema.js";

  let showMobileVideo = false;
  let fadeStaticBg = false;

  onMount(() => {
    const isMobile = window.innerWidth <= 640;

    // Load mobile video after a delay to prioritize static image
    if (isMobile) {
      setTimeout(() => {
        showMobileVideo = true;

        // Wait for video to start playing, then fade out static image
        setTimeout(() => {
          const video = document.querySelector('.hero__video-el--mobile');
          if (video) {
            video.addEventListener('canplay', () => {
              fadeStaticBg = true;
            }, { once: true });
          }
        }, 100);
      }, 1000);
    }

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

<Seo
  title="Kwantum Tech | Software Engineering & AI Employees"
  description="Custom web & mobile apps, AI agents, and secure infrastructure for elite fintech, crypto, and luxury teams."
  keywords={[
    "software engineering firm",
    "IT consulting",
    "AI employees",
    "AI agents",
    "custom web development",
    "custom mobile app development",
    "infrastructure architecture",
    "performance optimization",
    "cybersecurity consulting",
    "fintech software development",
  ]}
  schema={[organizationSchema, websiteSchema, professionalServiceSchema]}
/>

<main class="page">
  <section class="hero hero--video" id="hero">
    <div class="hero__video" aria-hidden="true">
      <!-- Static image for mobile - shows immediately -->
      <img
        class="hero__static-bg hero__static-bg--mobile"
        class:hero__static-bg--fade={fadeStaticBg}
        src="/static-bg.png"
        alt=""
      />

      <!-- Videos -->
      <video
        class="hero__video-el hero__video-el--desktop"
        src="/waves.mp4"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
      ></video>
      {#if showMobileVideo}
        <video
          class="hero__video-el hero__video-el--mobile"
          src="/waves-compressed.mp4"
          autoplay
          muted
          loop
          playsinline
          preload="auto"
        ></video>
      {/if}
      <video
        class="hero__video-el hero__video-el--mirror"
        src="/waves.mp4"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
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
	                <li>AI Audit & Efficiency Assessment</li>
	                <li>AI Employees & Agents</li>
	                <li>Workflow Automation</li>
	                <li>Mobile & Web Engineering</li>
	                <li>Security & Privacy</li>
	              </ul>
	            </div>
            <div>
              <span>Industries</span>
              <ul class="hero__list">
                <li>Real Estate & Brokerages</li>
                <li>Med Spas & Clinics</li>
                <li>Home Services</li>
                <li>Professional Practices</li>
                <li>Web3 &amp; DeFi</li>
              </ul>
            </div>
          </div>
          <div class="hero__cta-panel cta-panel">
            <span class="hero__cta-eyebrow">Ready to start?</span>
            <h3 class="hero__cta-title">Make your idea a reality.</h3>
            <p class="hero__cta-copy">
              A 30-minute walkthrough tailored to your business — no pressure, just possibilities.
            </p>
            <a
              class="button button--ghost"
              href="https://calendly.com/kwantumconsulting/30min"
            >
              Book a Strategy Call
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
	        <span>01</span>
	        <h3>Custom Mobile & Web Apps</h3>
	        <p>
	          Custom-built applications that load instantly, look impeccable, and keep your
	          operations private.
	        </p>
	        <a class="services__link" href="/web-apps">Scoped in writing · Release 1 in 30 days →</a>
	      </article>
	      <article>
	        <span>02</span>
	        <h3>AI Customization</h3>
	        <p>
	          Custom AI assistants trained on your documents and workflows to cut busywork and
	          help your team focus on higher-value work.
	        </p>
	      </article>
	      <article>
	        <span>03</span>
	        <h3>Private & Secure Tools</h3>
	        <p>
	          Discreet, fortified solutions for sensitive operations — from finance and crypto to
	          scheduling and proprietary workflows.
	        </p>
	      </article>
	      <article>
	        <span>04</span>
	        <h3>Performance Overhauls</h3>
	        <p>
	          Transforming slow or legacy systems into high-speed, modern infrastructure that meets
	          the highest standards.
	        </p>
	      </article>
	    </div>
	  </section>

  <section class="audit-banner">
    <div class="audit-banner__glow" aria-hidden="true"></div>
    <div class="audit-banner__inner">
      <div class="audit-banner__copy">
        <span class="eyebrow">New · AI Audit</span>
        <h2>Automate your <span class="audit-banner__glow-word">to-do list.</span></h2>
        <p>
          The AI Audit finds repetitive tasks worth automating to make your business
          more efficient — 45 minutes, one written plan, 5+ hours back a week.
        </p>
        <a class="button button--solid button--narrow" href="/ai-audit">Get your AI Audit</a>
      </div>
      <div class="audit-banner__stat">
        <span class="audit-banner__stat-label">Hours handed back</span>
        <span class="audit-banner__stat-value">7 / week</span>
        <span class="audit-banner__stat-note">Illustrative — your report reflects your business.</span>
      </div>
    </div>
  </section>

</main>

<style>
  .page {
    min-height: 100vh;
    padding: 0 0 7rem;
    background: radial-gradient(circle at top, rgba(0, 255, 65, 0.2) 0%, transparent 55%);
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
    background: #000000;
  }

  .hero__video-el {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: #000000;
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

  .hero__static-bg {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
    display: none;
    transition: opacity 3s ease-in-out;
  }

  .hero__static-bg--mobile {
    display: none;
  }

  .hero__static-bg--fade {
    opacity: 0;
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
    border: 1px solid rgba(0, 255, 65, 0.6);
    box-shadow:
      0 0 6px rgba(0, 255, 65, 0.35),
      inset 0 0 6px rgba(0, 255, 65, 0.15);
	text-shadow:
      0 0 2px #00ff41,
      0 0 5px #00ff41,
      0 0 10px #00ff41;
  }

  .button--ghost:hover {
    border-color: var(--primary);
    box-shadow:
      0 0 12px rgba(0, 255, 65, 0.5),
      inset 0 0 10px rgba(0, 255, 65, 0.2);
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
    gap: 1rem;
    justify-items: start;
    max-width: 380px;
    padding: 2rem 2rem 2.2rem;
    border-radius: 20px;
    border: 1px solid rgba(0, 255, 65, 0.25);
    background:
      radial-gradient(circle at top right, rgba(0, 255, 140, 0.14), transparent 60%),
      rgba(0, 0, 0, 0.7);
    box-shadow: 0 20px 60px -30px rgba(0, 255, 65, 0.5);
  }

  .hero__cta-eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.25em;
    font-size: 0.7rem;
    color: var(--primary);
  }

  .hero__cta-title {
    font-size: 1.6rem;
    line-height: 1.2;
    color: #ffffff;
    margin: 0;
  }

  .hero__cta-copy {
    color: rgba(224, 255, 224, 0.75);
    line-height: 1.6;
    font-size: 0.95rem;
    margin: 0;
  }

  .hero__cta-panel .button {
    margin-top: 0.4rem;
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
	    grid-template-columns: repeat(2, minmax(220px, 1fr));
	  }

	  @media (max-width: 720px) {
	    .services__grid {
	      grid-template-columns: 1fr;
	    }
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

  .services__link {
    align-self: end;
    margin-top: 0.9rem;
    color: var(--primary);
    font-weight: 600;
    font-size: 0.92rem;
    text-decoration: none;
  }

  .services__link:hover {
    text-shadow: 0 0 12px rgba(0, 255, 65, 0.5);
  }

  /* ── AI Audit funnel banner ── */
  .audit-banner {
    position: relative;
    margin: 6rem 7vw 0;
    padding: 3.2rem clamp(1.8rem, 4vw, 3.5rem);
    border-radius: 24px;
    border: 1px solid rgba(0, 255, 65, 0.28);
    background: rgba(0, 0, 0, 0.72);
    overflow: hidden;
  }

  .audit-banner__glow {
    position: absolute;
    right: -10%;
    top: 50%;
    width: 620px;
    height: 620px;
    transform: translateY(-50%);
    background: radial-gradient(
      circle,
      rgba(0, 255, 65, 0.18) 0%,
      rgba(0, 255, 65, 0.05) 38%,
      transparent 68%
    );
    pointer-events: none;
  }

  .audit-banner__inner {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1.6fr 1fr;
    align-items: center;
    gap: clamp(1.8rem, 4vw, 3.5rem);
  }

  .audit-banner__copy h2 {
    margin: 0.6rem 0 0.8rem;
    font-size: clamp(1.8rem, 1.6vw + 1rem, 2.6rem);
    line-height: 1.1;
    letter-spacing: -0.03em;
    color: #ffffff;
    text-shadow: none;
  }

  .audit-banner__glow-word {
    color: var(--primary);
    text-shadow: 0 0 30px rgba(0, 255, 65, 0.45);
  }

  .audit-banner__copy p {
    max-width: 46ch;
    margin: 0 0 1.6rem;
    color: rgba(224, 255, 224, 0.85);
    line-height: 1.65;
  }

  .audit-banner__stat {
    justify-self: end;
    display: grid;
    gap: 0.5rem;
    text-align: center;
    padding: 1.8rem 2rem;
    border-radius: 18px;
    background: #000000;
    border: 1px solid rgba(0, 255, 65, 0.28);
    box-shadow: 0 0 40px rgba(0, 255, 65, 0.12);
  }

  .audit-banner__stat-label {
    font-size: 0.66rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(224, 255, 224, 0.6);
  }

  .audit-banner__stat-value {
    font-size: 2.4rem;
    font-weight: 800;
    line-height: 1;
    color: var(--primary);
    text-shadow: 0 0 26px rgba(0, 255, 65, 0.4);
  }

  .audit-banner__stat-note {
    font-size: 0.72rem;
    color: rgba(224, 255, 224, 0.5);
    max-width: 22ch;
    margin: 0 auto;
    line-height: 1.45;
  }

  @media (max-width: 720px) {
    .audit-banner__glow-word {
      display: block;
    }

    .audit-banner__inner {
      grid-template-columns: 1fr;
    }

    .audit-banner__stat {
      justify-self: stretch;
    }
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
      z-index: 1;
      opacity: 0;
      animation: fadeInVideo 3s ease-in-out forwards;
    }

    @keyframes fadeInVideo {
      to {
        opacity: 1;
      }
    }

    .hero__static-bg--mobile {
      display: block;
      z-index: 0;
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

  .button--solid {
    background: var(--primary);
    color: #000000;
    border-color: var(--primary);
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 0.9rem 2rem;
    width: fit-content;
    cursor: pointer;
    border-radius: 999px;
  }

  .button--solid:hover {
    background: var(--secondary);
    border-color: var(--secondary);
    transform: none;
    box-shadow: 0 0 18px rgba(0, 255, 65, 0.4);
  }
</style>
