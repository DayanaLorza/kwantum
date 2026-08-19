<script>
  import Seo from "$lib/Seo.svelte";
  import VideoPanel from "$lib/VideoPanel.svelte";
  import MobileActionBar from "$lib/MobileActionBar.svelte";
  import { reveal, revealChildren, tilt, magnetic, rollNumber } from "$lib/motion.js";
  import { posterSrcset } from "$lib/videoTier.js";
  import {
    organizationSchema,
    websiteSchema,
    professionalServiceSchema,
  } from "$lib/seo/schema.js";

  const calendly = "https://calendly.com/kwantumconsulting/30min";

  const capabilities = [
    "AI Audit & Efficiency Assessment",
    "AI Employees & Agents",
    "Workflow Automation",
    "Mobile & Web Engineering",
    "Security & Privacy",
  ];

  const industries = [
    "Real Estate & Brokerages",
    "Med Spas & Clinics",
    "Home Services",
    "Professional Practices",
    "Web3 & DeFi",
  ];

  /* Illustrative engagement report — same artifact language as the brand's
     LinkedIn report concept. Numbers are deliberately generic. */
  const scorecard = [
    { area: "Lead follow-up", before: "F", tone: "f", after: "A+" },
    { area: "Invoicing & chasing", before: "D", tone: "d", after: "A+" },
    { area: "Scheduling", before: "C", tone: "c", after: "A" },
    { area: "Reporting", before: "D", tone: "d", after: "A" },
  ];

  const process = [
    {
      day: "Day 0",
      title: "Scoping call",
      copy: "30 minutes. You describe how the business runs; we ask the engineering questions. Free either way.",
      pay: "$0",
    },
    {
      day: "Day 1",
      title: "Scope signed, build starts",
      copy: "Written scope: included, excluded, timeline, fixed price. If it doesn't make sense, walk away having paid nothing.",
      pay: "40%",
    },
    {
      day: "Day ~15",
      title: "Mid-build demo",
      copy: "Demos every few days along the way. The second payment lands only after you've seen it working — not before.",
      pay: "30%",
    },
    {
      day: "Day 30",
      title: "Release 1 ships",
      copy: "Deployed, documented, handed off. Production-ready core — Releases 2 and 3 add depth once it's earning.",
      pay: "30%",
    },
  ];
</script>

<Seo
  title="Kwantum Tech | Software Engineering & AI Employees"
  description="Custom web & mobile apps, AI agents, and secure infrastructure for elite fintech, crypto, and luxury teams."
  image="/assets/og/og-home.png"
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

<svelte:head>
  <link
    rel="preload"
    as="image"
    imagesrcset={posterSrcset("avif")}
    imagesizes="(max-width: 640px) 100vw, 50vw"
    type="image/avif"
  />
</svelte:head>

<main class="page">
  <!-- ══ 1 · HERO — tone: void ══ -->
  <section class="hero" id="hero" aria-labelledby="hero-title">
    <!-- The portrait master at its native aspect: a full-height window on the
         right. Type lives on solid black — it never negotiates with the
         picture; only the frosted CTA plate crosses the seam (measured). -->
    <div class="hero__media" aria-hidden="true">
      <VideoPanel sizes="(max-width: 640px) 100vw, 44vw" position="50% 42%" />
      <div class="hero__seam"></div>
    </div>

    <div class="hero__inner">
      <div class="hero__copy" use:revealChildren={{ step: 110 }}>
        <p class="eyebrow hero__eyebrow">
          Kwantum Tech <span class="hero__sep">·</span> Premium Software Engineering
        </p>
        <h1 id="hero-title">
          Elevating ambition through
          <em class="hero__key">flawless</em> digital execution.
        </h1>
        <p class="hero__lead">
          Custom-built mobile and web applications engineered for visionary
          leaders and high-impact enterprises where performance, security, and
          discretion are non-negotiable.
        </p>
      </div>

      <div class="hero__panel-zone">
        <div class="cta-panel" use:tilt={{ zone: ".hero", max: 8 }} use:reveal={{ delay: 300 }}>
          <span class="cta-panel__eyebrow">Ready to start?</span>
          <h2 class="cta-panel__title">Make your idea a reality.</h2>
          <p class="cta-panel__copy">
            A 30-minute walkthrough tailored to your business — no pressure,
            just possibilities.
          </p>
          <a class="btn btn--solid" href={calendly} use:magnetic>
            Book a Strategy Call
          </a>
        </div>
      </div>
    </div>

    <div class="hero__ticker" aria-label="Capabilities">
      {#each capabilities as cap, i}
        {#if i > 0}<span class="hero__tick-sep" aria-hidden="true">/</span>{/if}
        <span>{cap}</span>
      {/each}
    </div>
  </section>

  <!-- ══ 2 · PROOF — tone: paper ══ -->
  <section class="proof" aria-labelledby="proof-title">
    <div class="proof__inner">
      <header class="proof__head" use:reveal>
        <p class="eyebrow proof__eyebrow">The work</p>
        <h2 id="proof-title">Every engagement ends in a report like this.</h2>
        <p class="proof__lead">
          A written scope going in, a working release and a scorecard coming
          out. No adjectives — the numbers carry the argument.
        </p>
      </header>

      <div class="report" use:reveal={{ delay: 120 }}>
        <div class="report__bar">
          <span>ENGAGEMENT REPORT</span>
          <span class="report__tag">ILLUSTRATIVE</span>
        </div>
        <ul class="report__rows">
          {#each scorecard as row}
            <li class="report__row">
              <span class="report__area">{row.area}</span>
              <span class="report__grades">
                <b class="grade grade--{row.tone}">{row.before}</b>
                <svg class="grade__arrow" viewBox="0 0 24 8" aria-hidden="true"><path d="M0 4h20m0 0-4-3.2M20 4l-4 3.2" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>
                <b class="grade grade--a">{row.after}</b>
              </span>
            </li>
          {/each}
        </ul>
        <div class="report__strip">
          <span class="report__strip-label">Hours handed back</span>
          <span class="report__strip-value">
            <b use:rollNumber={{ to: 7 }}>7</b>&nbsp;/ week
          </span>
        </div>
        <p class="report__note">
          Illustrative — your report reflects your business.
        </p>
      </div>

      <ul class="proof__facts" use:revealChildren={{ step: 90 }}>
        <li>Scope in writing</li>
        <li>Fixed price</li>
        <li>Release 1 in 30 days</li>
        <li>Code 100% yours</li>
      </ul>
    </div>
  </section>

  <!-- ══ 3 · SERVICES — tone: dark panel ══ -->
  <section class="services" id="services" aria-labelledby="services-title">
    <div class="services__inner">
      <header use:reveal>
        <p class="eyebrow">What We Solve</p>
        <h2 id="services-title">Elite challenges require elite execution.</h2>
        <p class="services__lead">
          Targeted builds and optimizations that deliver breakthrough
          performance, flawless design, and absolute discretion.
        </p>
      </header>

      <div class="services__grid" use:revealChildren={{ step: 100 }}>
        <article>
          <span class="services__no">01</span>
          <h3>Custom Mobile &amp; Web Apps</h3>
          <p>
            Custom-built applications that load instantly, look impeccable, and
            keep your operations private.
          </p>
          <a class="services__link" href="/web-apps">
            Scoped in writing · Release 1 in 30 days
            <span class="services__arrows" aria-hidden="true"><i>→</i><i>→</i></span>
          </a>
        </article>
        <article>
          <span class="services__no">02</span>
          <h3>AI Customization</h3>
          <p>
            Custom AI assistants trained on your documents and workflows to cut
            busywork and help your team focus on higher-value work.
          </p>
          <a class="services__link" href="/ai-agents">
            Meet the AI employees
            <span class="services__arrows" aria-hidden="true"><i>→</i><i>→</i></span>
          </a>
        </article>
        <article>
          <span class="services__no">03</span>
          <h3>Private &amp; Secure Tools</h3>
          <p>
            Discreet, fortified solutions for sensitive operations — from
            finance and crypto to scheduling and proprietary workflows.
          </p>
        </article>
        <article>
          <span class="services__no">04</span>
          <h3>Performance Overhauls</h3>
          <p>
            Transforming slow or legacy systems into high-speed, modern
            infrastructure that meets the highest standards.
          </p>
        </article>
      </div>

      <p class="services__industries" use:reveal>
        <span class="services__industries-label">Industries</span>
        {#each industries as ind, i}
          {#if i > 0}<span class="hero__tick-sep" aria-hidden="true">/</span>{/if}
          <span>{ind}</span>
        {/each}
      </p>
    </div>
  </section>

  <!-- ══ 4 · PROCESS — tone: paper ══ -->
  <section class="process" aria-labelledby="process-title">
    <div class="process__inner">
      <header use:reveal>
        <p class="eyebrow proof__eyebrow">How it runs</p>
        <h2 id="process-title">Thirty days, four milestones, zero mystery.</h2>
      </header>

      <ol class="process__steps" use:revealChildren={{ step: 120 }}>
        {#each process as step}
          <li class="process__step">
            <span class="process__day">{step.day}</span>
            <h3>{step.title}</h3>
            <p>{step.copy}</p>
            <span class="process__pay" class:process__pay--zero={step.pay === "$0"}>{step.pay}</span>
          </li>
        {/each}
      </ol>

      <p class="process__more" use:reveal>
        The full walkthrough — drawings, guarantee, and the working demo — is on
        <a href="/web-apps">the Web Apps page</a>.
      </p>
    </div>
  </section>

  <!-- ══ 5 · AI AUDIT CTA — tone: void ══ -->
  <section class="audit" aria-labelledby="audit-title">
    <div class="audit__inner">
      <div class="audit__copy" use:revealChildren={{ step: 100 }}>
        <p class="eyebrow">New · AI Audit</p>
        <h2 id="audit-title">Automate your <em class="audit__key">to-do list.</em></h2>
        <p>
          The AI Audit finds repetitive tasks worth automating to make your
          business more efficient — 45 minutes, one written plan, 5+ hours back
          a week.
        </p>
        <a class="btn btn--solid" href="/ai-audit" use:magnetic>Get your AI Audit</a>
      </div>
      <div class="audit__stat" use:reveal={{ delay: 150 }}>
        <span class="audit__stat-label">Hours handed back</span>
        <span class="audit__stat-value"><b use:rollNumber={{ to: 7 }}>7</b> / week</span>
        <span class="audit__stat-note">Illustrative — your report reflects your business.</span>
      </div>
    </div>
  </section>
</main>

<MobileActionBar href={calendly} label="Book a Strategy Call" />

<style>
  .page {
    background: var(--tone-void);
  }

  /* ═══ HERO ═══ */
  .hero {
    position: relative;
    min-height: min(88vh, 980px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    border-bottom: 1px solid var(--line);
  }

  .hero__media {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: min(44vw, 760px);
    background: var(--black);
  }

  /* seam blend only — 14% wide, fully released; it never carries type */
  .hero__seam {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgb(0 0 0 / 0.9) 0%, transparent 14%);
  }

  .hero__inner {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(300px, 400px);
    align-items: center;
    column-gap: var(--sp-5);
    width: 100%;
    max-width: 1360px;
    margin: 0 auto;
    padding: var(--sp-section) var(--gutter);
    flex: 1;
  }

  /* keep the copy column clear of the media seam on mid-width screens */
  .hero__copy {
    max-width: calc(56vw - var(--gutter));
  }

  .hero__eyebrow {
    margin-bottom: var(--sp-3);
  }

  .hero__sep {
    color: var(--text-faint);
    margin: 0 0.4rem;
  }

  .hero h1 {
    font-size: var(--text-display);
    font-weight: 600;
    max-width: 14ch;
    margin: 0 0 var(--sp-3);
  }

  /* the page's one highlighted word */
  .hero__key {
    font-style: normal;
    color: var(--green);
    text-shadow: var(--glow);
  }

  .hero__lead {
    font-size: var(--text-lg);
    line-height: 1.65;
    max-width: 46ch;
    color: var(--text);
    margin: 0;
  }

  .hero__panel-zone {
    justify-self: end;
    width: 100%;
    max-width: 400px;
    /* tilt writes an inline transform on .cta-panel; the perspective lives here */
    perspective: 900px;
  }

  /* Frosted plate, not a wash: dense enough for small type because the
     backdrop blur makes the ground statistically flat (measured in README). */
  .cta-panel {
    display: grid;
    gap: var(--sp-2);
    justify-items: start;
    padding: var(--sp-4) var(--sp-4) var(--sp-4);
    border-radius: 20px;
    border: 1px solid var(--line-strong);
    background: rgb(0 0 0 / 0.62);
    backdrop-filter: blur(26px) saturate(1.55);
    -webkit-backdrop-filter: blur(26px) saturate(1.55);
    will-change: transform;
  }

  @supports not (backdrop-filter: blur(1px)) {
    .cta-panel {
      background: rgb(2 6 3 / 0.96);
    }
  }

  .cta-panel__eyebrow {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--green);
  }

  .cta-panel__title {
    font-size: var(--text-xl);
    letter-spacing: -0.02em;
  }

  .cta-panel__copy {
    color: var(--text-dim);
    font-size: var(--text-sm);
    line-height: 1.6;
    margin: 0;
  }

  .hero__ticker {
    position: relative;
    z-index: 2;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 0.9rem;
    padding: 1.1rem var(--gutter);
    border-top: 1px solid var(--line);
    background: rgb(0 0 0 / 0.55);
    backdrop-filter: blur(20px) saturate(1.4);
    -webkit-backdrop-filter: blur(20px) saturate(1.4);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-dim);
  }

  @supports not (backdrop-filter: blur(1px)) {
    .hero__ticker {
      background: rgb(0 0 0 / 0.94);
    }
  }

  .hero__tick-sep {
    color: rgb(0 255 65 / 0.55);
  }

  /* ═══ PROOF (paper) ═══ */
  .proof {
    background: var(--tone-paper);
    color: var(--ink);
  }

  .proof__inner {
    max-width: 1360px;
    margin: 0 auto;
    padding: var(--sp-section) var(--gutter);
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
    gap: var(--sp-5);
    align-items: center;
  }

  .proof__head h2 {
    color: var(--ink);
    font-size: var(--text-3xl);
    font-weight: 600;
    letter-spacing: -0.025em;
    max-width: 18ch;
    margin: var(--sp-2) 0 var(--sp-3);
  }

  .proof__eyebrow {
    /* green on white fails contrast — ink eyebrow with a green tick instead */
    color: var(--ink-dim);
  }

  .proof__eyebrow::before {
    content: "▸ ";
    color: #00a32b;
  }

  .proof__lead {
    color: var(--ink-dim);
    max-width: 44ch;
    line-height: 1.7;
    margin: 0;
  }

  .proof__facts {
    grid-column: 1 / -1;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem 2.4rem;
    margin: 0;
    padding: var(--sp-3) 0 0;
    border-top: 1px solid var(--line-ink);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink-dim);
  }

  .proof__facts li::before {
    content: "✓ ";
    color: #00a32b;
  }

  /* the report artifact — white card, grades on black chips */
  .report {
    background: #ffffff;
    border: 1px solid var(--line-ink);
    border-radius: 14px;
    box-shadow: 0 24px 60px -30px rgb(11 19 13 / 0.25);
    overflow: hidden;
  }

  .report__bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.9rem 1.4rem;
    background: var(--black);
    color: var(--mint);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: 0.2em;
  }

  .report__tag {
    color: rgb(224 255 224 / 0.55);
    font-size: 0.62rem;
    border: 1px solid rgb(224 255 224 / 0.3);
    padding: 0.15rem 0.5rem;
    border-radius: 3px;
  }

  .report__rows {
    list-style: none;
    margin: 0;
    padding: 0.4rem 1.4rem;
  }

  .report__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.85rem 0;
    border-bottom: 1px solid rgb(11 19 13 / 0.08);
    font-size: var(--text-sm);
    font-weight: 600;
  }

  .report__row:last-child {
    border-bottom: 0;
  }

  .report__grades {
    display: inline-flex;
    align-items: center;
    gap: 0.7rem;
  }

  .grade {
    display: inline-grid;
    place-items: center;
    min-width: 2rem;
    height: 2rem;
    padding: 0 0.4rem;
    border-radius: 6px;
    font-family: var(--font-mono);
    font-size: 0.85rem;
  }

  .grade--f { background: #fdecea; color: #b3261e; }
  .grade--d { background: #fdf3e0; color: #9a6a00; }
  .grade--c { background: #fbf7dc; color: #7d7000; }

  /* green metric on a black chip — never green on white */
  .grade--a { background: var(--black); color: var(--green); }

  .grade__arrow {
    width: 22px;
    color: rgb(11 19 13 / 0.35);
  }

  .report__strip {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin: 0.6rem 1.4rem 0;
    padding: 1rem 1.2rem;
    border-radius: 10px;
    background: var(--black);
    color: var(--mint);
  }

  .report__strip-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgb(224 255 224 / 0.6);
  }

  .report__strip-value {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--mint);
  }

  .report__strip-value b {
    color: var(--green);
    font-size: 1.25em;
  }

  .report__note {
    margin: 0;
    padding: 0.8rem 1.4rem 1.2rem;
    font-size: 0.72rem;
    color: var(--ink-faint);
  }

  /* ═══ SERVICES (dark) ═══ */
  .services {
    background: var(--tone-panel);
    border-block: 1px solid var(--line);
  }

  .services__inner {
    max-width: 1360px;
    margin: 0 auto;
    padding: var(--sp-section) var(--gutter);
  }

  .services h2 {
    font-size: var(--text-3xl);
    font-weight: 600;
    margin: var(--sp-2) 0 var(--sp-2);
    max-width: 20ch;
  }

  .services__lead {
    max-width: var(--measure);
    color: var(--text-dim);
    line-height: 1.7;
    margin: 0 0 var(--sp-5);
  }

  .services__grid {
    display: grid;
    gap: 1px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    background: var(--line);
    border: 1px solid var(--line);
    border-radius: 16px;
    overflow: hidden;
  }

  .services__grid article {
    position: relative;
    background: var(--tone-panel);
    padding: var(--sp-4);
    display: grid;
    gap: var(--sp-2);
    align-content: start;
  }

  /* row-hover rule drawing over the static hairline */
  .services__grid article::after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    height: 2px;
    width: 100%;
    background: var(--green);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.45s var(--ease-out);
  }

  .services__grid article:hover::after {
    transform: scaleX(1);
  }

  .services__no {
    font-family: var(--font-mono);
    color: rgb(0 255 65 / 0.7);
    letter-spacing: 0.2em;
    font-size: var(--text-sm);
  }

  .services__grid h3 {
    font-size: var(--text-xl);
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .services__grid p {
    margin: 0;
    color: var(--text-dim);
    line-height: 1.65;
  }

  .services__link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.4rem;
    color: var(--green);
    font-weight: 600;
    font-size: var(--text-sm);
    text-decoration: none;
    width: fit-content;
  }

  /* two-arrow exchange: one exits right as the next enters from the left */
  .services__arrows {
    position: relative;
    display: inline-block;
    width: 1.1em;
    height: 1em;
    overflow: hidden;
  }

  .services__arrows i {
    position: absolute;
    inset: 0;
    font-style: normal;
    transition: transform 0.3s var(--ease-out), opacity 0.3s var(--ease-out);
  }

  .services__arrows i:last-child {
    transform: translateX(-130%);
    opacity: 0;
  }

  .services__link:hover .services__arrows i:first-child {
    transform: translateX(130%);
    opacity: 0;
  }

  .services__link:hover .services__arrows i:last-child {
    transform: translateX(0);
    opacity: 1;
  }

  .services__industries {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 0.9rem;
    margin: var(--sp-5) 0 0;
    padding-top: var(--sp-3);
    border-top: 1px solid var(--line);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-dim);
  }

  .services__industries-label {
    color: var(--green);
  }

  /* ═══ PROCESS (paper) ═══ */
  .process {
    background: var(--tone-paper);
    color: var(--ink);
  }

  .process__inner {
    max-width: 1360px;
    margin: 0 auto;
    padding: var(--sp-section) var(--gutter);
  }

  .process h2 {
    color: var(--ink);
    font-size: var(--text-3xl);
    font-weight: 600;
    letter-spacing: -0.025em;
    margin: var(--sp-2) 0 var(--sp-5);
    max-width: 22ch;
  }

  .process__steps {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--sp-4);
  }

  .process__step {
    position: relative;
    padding-top: var(--sp-3);
    border-top: 2px solid var(--line-ink);
  }

  .process__day {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-dim);
  }

  .process__step h3 {
    color: var(--ink);
    font-size: var(--text-lg);
    font-weight: 600;
    letter-spacing: -0.015em;
    margin: 0.6rem 0;
  }

  .process__step p {
    color: var(--ink-dim);
    font-size: var(--text-sm);
    line-height: 1.65;
    margin: 0 0 1rem;
  }

  .process__pay {
    display: inline-grid;
    place-items: center;
    padding: 0.3rem 0.8rem;
    border-radius: 999px;
    background: var(--black);
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }

  .process__pay--zero {
    background: transparent;
    border: 1px solid var(--line-ink);
    color: var(--ink-dim);
  }

  .process__more {
    margin: var(--sp-5) 0 0;
    color: var(--ink-dim);
    font-size: var(--text-sm);
  }

  .process__more a {
    color: var(--ink);
    font-weight: 600;
    text-decoration-color: #00a32b;
    text-underline-offset: 3px;
  }

  /* ═══ AI AUDIT (void) ═══ */
  .audit {
    background:
      radial-gradient(ellipse 60% 80% at 85% 50%, rgb(0 255 65 / 0.09), transparent 70%),
      var(--tone-void);
  }

  .audit__inner {
    max-width: 1360px;
    margin: 0 auto;
    padding: var(--sp-section) var(--gutter);
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    align-items: center;
    gap: var(--sp-5);
  }

  .audit h2 {
    font-size: var(--text-3xl);
    font-weight: 600;
    margin: var(--sp-2) 0;
  }

  .audit__key {
    font-style: normal;
    color: var(--green);
  }

  .audit__copy p:not(.eyebrow) {
    max-width: 46ch;
    color: var(--text-dim);
    line-height: 1.7;
    margin: 0 0 var(--sp-4);
  }

  .audit__stat {
    justify-self: end;
    display: grid;
    gap: 0.6rem;
    text-align: center;
    padding: var(--sp-4) var(--sp-4);
    border-radius: 16px;
    background: var(--black);
    border: 1px solid var(--line-green);
  }

  .audit__stat-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-dim);
  }

  .audit__stat-value {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--text-hi);
  }

  .audit__stat-value b {
    color: var(--green);
    font-size: 1.3em;
  }

  .audit__stat-note {
    font-size: 0.72rem;
    color: var(--text-faint);
    max-width: 24ch;
    margin: 0 auto;
    line-height: 1.45;
  }

  /* ═══ RESPONSIVE — recomposed, not shrunk ═══ */

  @media (max-width: 1024px) {
    .process__steps {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 900px) {
    .hero {
      display: block;
    }

    /* tablets down: media leaves the side and becomes a portrait band */
    .hero__media {
      position: relative;
      width: 100%;
      height: 46vh;
      border-bottom: 1px solid var(--line);
    }

    .hero__seam {
      background: linear-gradient(180deg, transparent 82%, rgb(0 0 0 / 0.85) 100%);
    }

    .hero__inner {
      grid-template-columns: 1fr;
      row-gap: var(--sp-4);
    }

    .hero__copy {
      max-width: none;
    }

    .hero__panel-zone {
      justify-self: start;
    }

    .proof__inner {
      grid-template-columns: 1fr;
      gap: var(--sp-4);
    }

    .audit__inner {
      grid-template-columns: 1fr;
      gap: var(--sp-4);
    }

    .audit__stat {
      justify-self: stretch;
    }
  }

  @media (max-width: 720px) {
    .services__grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    /* phone: recomposed, not shrunk — the portrait master becomes a native
       portrait band up top, copy sits on solid void below it, and the sticky
       action bar carries the CTA */
    .hero {
      min-height: 0;
    }

    .hero__media {
      height: 42vh;
    }

    .hero__inner {
      padding-block: clamp(2.2rem, 6vh, 4rem);
    }

    .hero h1 {
      font-size: clamp(2.1rem, 8.6vw, 2.7rem);
    }

    .hero__lead {
      font-size: var(--text-base);
    }

    .hero__ticker {
      display: none;
    }

    .cta-panel {
      max-width: none;
      padding: var(--sp-3);
    }

    .process__steps {
      grid-template-columns: 1fr;
      gap: var(--sp-3);
    }

    .process__step {
      display: grid;
      grid-template-columns: auto 1fr;
      grid-template-areas: "day pay" "title title" "copy copy";
      align-items: center;
      column-gap: 1rem;
    }

    .process__day { grid-area: day; }
    .process__pay { grid-area: pay; justify-self: end; }
    .process__step h3 { grid-area: title; }
    .process__step p { grid-area: copy; margin: 0; }
  }
</style>
