<script>
  import { onMount } from "svelte";
  import { env as publicEnv } from "$env/dynamic/public";
  import Turnstile from "$lib/Turnstile.svelte";
  import Seo from "$lib/Seo.svelte";
  import {
    aiAuditServiceSchema,
    breadcrumbSchema,
  } from "$lib/seo/schema.js";

  const calendly = "https://calendly.com/kwantumconsulting/30min";

  // Illustrative scorecard rows — mirrors the LinkedIn "Efficiency Scorecard"
  // report artifact. Grades are before → after (failing → green A+).
  const scorecard = [
    { label: "Lead response time", grade: "D", tone: "orange" },
    { label: "Follow-up consistency", grade: "C", tone: "yellow" },
    { label: "After-hours coverage", grade: "F", tone: "red" },
  ];

  let inquirySuccess = false;
  let inquiryError = "";
  let inquirySending = false;
  let inquiryStartedAt = 0;
  const turnstileSiteKey = publicEnv.PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAEDANq2D1RelwMWJ";
  let turnstileToken = "";

  onMount(() => {
    inquiryStartedAt = Date.now();
  });

  async function handleInquirySubmit(event) {
    const form = event.target;
    const data = new FormData(form);
    data.set("contactStartedAt", String(inquiryStartedAt));
    inquirySuccess = false;
    inquiryError = "";

    if (turnstileSiteKey && !turnstileToken) {
      inquiryError = "Please complete the verification below and try again.";
      return;
    }
    if (turnstileToken) data.set("cf-turnstile-response", turnstileToken);
    inquirySending = true;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || "Message failed to send.");
      }

      inquirySuccess = true;
      form.reset();
      setTimeout(() => {
        inquirySuccess = false;
      }, 6000);
    } catch (error) {
      inquiryError = error.message || "Message failed to send.";
    } finally {
      inquirySending = false;
      turnstileToken = "";
    }
  }

</script>

<Seo
  title="AI Audit | Automate Your To-Do List | Kwantum Tech"
  description="The AI Audit finds repetitive tasks worth automating so your business runs more efficiently. 45 minutes, one written plan, 5+ hours back a week."
  image="/og-ai-audit.png"
  imageAlt="Kwantum Tech AI Audit — the efficiency scorecard report showing hours handed back"
  keywords={[
    "AI audit",
    "AI efficiency assessment",
    "business automation audit",
    "AI consulting for small business",
    "workflow automation assessment",
    "AI opportunity assessment",
    "automate repetitive tasks",
    "AI for owner-run business",
    "save time with AI",
  ]}
  schema={[
    aiAuditServiceSchema(),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "AI Audit", path: "/ai-audit" },
    ]),
  ]}
/>

<main class="audit">
  <!-- ── 1. HERO ── -->
  <section class="ahero">
    <div class="ahero__glow" aria-hidden="true"></div>
    <div class="ahero__inner">
      <div class="ahero__copy">
        <p class="eyebrow">Kwantum Tech · AI Audit</p>
        <h1>Automate Your<br /><span class="glow">To-Do List.</span></h1>
        <p class="subhead">
          <strong>The AI Audit:</strong> find repetitive tasks worth automating to help
          your business become more efficient and effective.
        </p>
        <p class="lead">
          45 minutes and one written plan showing exactly where AI hands your business
          back <strong>5+ hours a week</strong>. No tools to learn, no tech skills needed
          — just a clear map of the busywork worth automating.
        </p>
        <div class="ahero__cta">
          <a class="btn btn--solid" href="#book">Book My AI Audit</a>
          <!-- Sample report not available yet — re-enable when ready
          <a class="btn btn--ghost" href="#report">See a Sample Report</a>
          -->
        </div>
        <p class="ahero__note">No tools to learn · No tech skills needed</p>
      </div>

      <!-- Report artifact — the hero IS the thing working -->
      <div class="ahero__report" id="report">
        <div class="report" aria-label="Sample AI efficiency scorecard">
          <div class="report__head">
            <span class="report__title">
              <span class="report__mark" aria-hidden="true"></span>
              THE EFFICIENCY SCORECARD
            </span>
            <span class="report__tag">ILLUSTRATIVE</span>
          </div>

          <div class="report__cols">
            <span></span>
            <span class="report__col report__col--muted">Before</span>
            <span></span>
            <span class="report__col report__col--dark">After</span>
          </div>

          {#each scorecard as row}
            <div class="report__row">
              <span class="report__label">{row.label}</span>
              <span class="grade grade--{row.tone}">{row.grade}</span>
              <span class="report__arrow" aria-hidden="true">→</span>
              <span class="grade grade--pass">A+</span>
            </div>
          {/each}

          <div class="report__result">
            <span class="report__result-label">Hours handed back</span>
            <span class="report__result-value">7 / week</span>
          </div>
          <p class="report__note">
            Est. recoverable: <strong>$2,300 / mo</strong> · Illustrative sample —
            your report reflects your business.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- ── 1b. TRUST STRIP ── -->
  <section class="trust" aria-label="Why the AI Audit is different">
    <ul class="trust__row">
      <li>5+ hours found or you don't pay</li>
      <li>Any owner-run business</li>
      <li>By an engineer, not a salesperson</li>
    </ul>
  </section>

  <!-- ── 1c. THE OFFER PATH (ladder) ── -->
  <section class="ladder section">
    <header class="section__head">
      <p class="eyebrow">One Audit. Three Doors.</p>
      <h2>Start small. Scale as it pays off.</h2>
      <p class="section__sub">
        The audit is the front door — it's a menu, not a staircase. Take only the
        next step that earns its place.
      </p>
    </header>
    <ol class="ladder__track">
      <li class="rung rung--active">
        <span class="rung__tag">You are here</span>
        <h3>AI Audit</h3>
        <p>A written plan of the busywork worth automating — 5+ hours or you don't pay.</p>
      </li>
      <li class="rung">
        <span class="rung__tag">Next</span>
        <h3>Automations</h3>
        <p>Fix the quick wins fast — the repetitive tasks eating your week.</p>
      </li>
      <li class="rung">
        <span class="rung__tag">When it's worth it</span>
        <h3>AI Employees</h3>
        <p>Staff a role around the clock so you never miss a lead again.</p>
      </li>
    </ol>
    <p class="ladder__link">
      Already know you want a role staffed 24/7?
      <a href="/ai-agents">Meet the AI Employees →</a>
    </p>
  </section>

  <!-- ── 2. THE PROBLEM ── -->
  <section class="problem section">
    <header class="section__head">
      <p class="eyebrow">Where the Time Goes</p>
      <h2>The busywork adding up in the background.</h2>
      <p class="section__sub">
        It rarely feels like much in the moment — a few minutes here and there.
        Across a whole week, it's the time your business never gets back.
      </p>
    </header>
    <div class="problem__grid">
      <article class="leak">
        <span class="leak__num">01</span>
        <h3>Follow-ups slip through the cracks</h3>
        <p>
          The inquiry you meant to answer, the quote that sat overnight, the
          reminder nobody sent. Repetitive touchpoints are exactly what
          automation never forgets.
        </p>
      </article>
      <article class="leak">
        <span class="leak__num">02</span>
        <h3>The same tasks, on repeat</h3>
        <p>
          Scheduling, intake, data entry, the same five questions answered again
          and again. Individually small — together, a full workday every week.
        </p>
      </article>
      <article class="leak">
        <span class="leak__num">03</span>
        <h3>Work a machine should handle</h3>
        <p>
          Your best hours go to tasks that don't need a human at all. The audit
          finds them, measures them, and shows what it takes to hand them off.
        </p>
      </article>
    </div>
  </section>

  <!-- ── 3. HOW IT WORKS ── -->
  <section id="how-it-works" class="how section">
    <header class="section__head">
      <p class="eyebrow">Simple From the First Message</p>
      <h2>How the audit works.</h2>
      <p class="section__sub">Three steps from first message to a written plan.</p>
    </header>
    <div class="how__grid">
      <article class="step">
        <span class="step__num">1</span>
        <h3>Talk</h3>
        <p>
          A relaxed 45-minute call. You walk me through how your business runs —
          the way you'd brief a new hire. No prep, no tech talk, no slides.
        </p>
      </article>
      <article class="step">
        <span class="step__num">2</span>
        <h3>Report</h3>
        <p>
          I write up the plan: your scorecard, the hours you'd get back, the
          money math, and the exact order I'd fix things in. One page.
        </p>
      </article>
      <article class="step">
        <span class="step__num">3</span>
        <h3>Build</h3>
        <p>
          If you want it built, I build it — starting with the quickest wins.
          You keep the plan either way, and only move as far as makes sense.
        </p>
      </article>
    </div>
  </section>

  <!-- ── 4. FINAL CTA ── -->
  <section id="book" class="final">
    <div class="final__glow" aria-hidden="true"></div>
    <div class="final__inner">
      <p class="eyebrow">Free to Look</p>
      <h2>See what your report would say.</h2>
      <p class="final__lead">
        Book your AI Audit and I'll show you, in writing, exactly which repetitive
        tasks are worth automating — and how much time you'd get back. If I can't find
        at least 5 hours a week, you don't pay. It's one page, and it's free to look.
      </p>

      <div class="final__divider"><span>or send me the details</span></div>

      <form class="lead-form" on:submit|preventDefault={handleInquirySubmit}>
        <div class="lead-form__trap" aria-hidden="true">
          <label for="lead-website">Website</label>
          <input
            id="lead-website"
            type="text"
            name="website"
            tabindex="-1"
            autocomplete="off"
          />
        </div>
        <input type="hidden" name="service" value="ai-audit" />
        <div class="lead-form__row">
          <div class="lead-form__field">
            <label for="lead-name">Name</label>
            <input id="lead-name" type="text" name="name" placeholder="Your name" required />
          </div>
          <div class="lead-form__field">
            <label for="lead-company">Business</label>
            <input id="lead-company" type="text" name="company" placeholder="Business name" />
          </div>
        </div>
        <div class="lead-form__field">
          <label for="lead-email">Email</label>
          <input id="lead-email" type="email" name="email" placeholder="you@business.com" required />
        </div>
        <div class="lead-form__field">
          <label for="lead-message">Where does your week disappear?</label>
          <textarea
            id="lead-message"
            name="message"
            rows="3"
            placeholder="Tell me the tasks that eat the most time — follow-ups, scheduling, intake, the usual..."
            required
          ></textarea>
        </div>
        <Turnstile siteKey={turnstileSiteKey} onToken={(token) => (turnstileToken = token)} />
        <button type="submit" class="btn btn--solid lead-form__submit" disabled={inquirySending}>
          {inquirySending ? "Sending..." : "Book My AI Audit"}
        </button>
        {#if inquirySuccess}
          <p class="lead-form__success">Got it — I'll be in touch within 24 hours.</p>
        {/if}
        {#if inquiryError}
          <p class="lead-form__error">{inquiryError}</p>
        {/if}
      </form>
    </div>
  </section>
</main>

<style>
  .audit {
    padding-bottom: 0;
    overflow: hidden;
  }

  .section {
    padding: 5.5rem 7vw;
    max-width: 1280px;
    margin: 0 auto;
  }

  .section__head {
    max-width: 720px;
    margin: 0 auto 3rem;
    text-align: center;
  }

  .section__sub {
    color: rgba(224, 255, 224, 0.75);
    line-height: 1.7;
    margin: 0.8rem 0 0;
  }

  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.28em;
    font-weight: 600;
    color: var(--primary);
    margin: 0 0 1rem;
    font-size: 0.72rem;
  }

  h1 {
    font-size: clamp(2.6rem, 4vw + 1rem, 4.4rem);
    line-height: 1.04;
    letter-spacing: -0.04em;
    margin: 0 0 1.4rem;
    color: #ffffff;
  }

  h2 {
    font-size: clamp(1.9rem, 1.8vw + 1rem, 2.8rem);
    line-height: 1.12;
    letter-spacing: -0.03em;
    margin: 0;
    color: #ffffff;
    text-shadow: 0 0 12px rgba(0, 255, 65, 0.35);
  }

  h3 {
    color: #ffffff;
    margin: 0 0 0.6rem;
  }

  .glow {
    color: var(--primary);
    text-shadow: 0 0 34px rgba(0, 255, 65, 0.45);
  }

  /* ── Buttons ── */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.85rem 1.8rem;
    border-radius: 999px;
    border: 1px solid transparent;
    text-decoration: none;
    font-weight: 600;
    letter-spacing: 0.02em;
    cursor: pointer;
    font-family: inherit;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease,
      border-color 0.2s ease, color 0.2s ease;
  }

  .btn--solid {
    background: var(--primary);
    color: #000000;
    border-color: var(--primary);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.92rem;
  }

  .btn--solid:hover {
    background: var(--secondary);
    border-color: var(--secondary);
    box-shadow: 0 0 22px rgba(0, 255, 65, 0.45);
    transform: translateY(-2px);
  }

  .btn--solid:disabled {
    cursor: wait;
    opacity: 0.65;
  }

  .btn--ghost {
    background: transparent;
    color: var(--primary);
    border-color: rgba(0, 255, 65, 0.4);
  }

  .btn--ghost:hover {
    border-color: var(--primary);
    box-shadow: 0 0 16px rgba(0, 255, 65, 0.3);
  }

  /* ── 1. Hero ── */
  .ahero {
    position: relative;
    padding: calc(6rem - 20px) 7vw 5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    overflow: hidden;
  }

  .ahero__glow {
    position: absolute;
    left: 50%;
    top: 55%;
    width: 1100px;
    height: 1100px;
    max-width: 130vw;
    transform: translate(-50%, -50%);
    background: radial-gradient(
      circle,
      rgba(0, 255, 65, 0.16) 0%,
      rgba(0, 255, 65, 0.05) 34%,
      rgba(0, 0, 0, 0) 66%
    );
    pointer-events: none;
    z-index: 0;
  }

  .ahero__inner {
    position: relative;
    z-index: 1;
    max-width: 1180px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    align-items: center;
    column-gap: clamp(2rem, 5vw, 4.5rem);
    row-gap: 2.5rem;
  }

  .subhead {
    font-size: clamp(1.15rem, 0.6vw + 0.95rem, 1.45rem);
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: -0.01em;
    color: var(--primary);
    max-width: 50ch;
    margin: 0 0 1.4rem;
    text-wrap: balance;
  }

  .subhead strong {
    color: #ffffff;
    font-weight: 800;
  }

  .lead {
    font-size: clamp(1.05rem, 0.6vw + 0.9rem, 1.3rem);
    line-height: 1.6;
    color: rgba(224, 255, 224, 0.88);
    max-width: 56ch;
    margin: 0 0 2.2rem;
  }

  .lead strong {
    color: #ffffff;
  }

  .ahero__cta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .ahero__note {
    margin: 1.6rem 0 0;
    font-size: 0.82rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(224, 255, 224, 0.5);
  }

  /* ── The report artifact ── */
  .ahero__report {
    justify-self: center;
    width: 100%;
    max-width: 440px;
  }

  .report {
    background: #ffffff;
    border-radius: 22px;
    padding: 30px 32px;
    color: #0a0a0c;
    box-shadow: 0 0 80px rgba(0, 255, 65, 0.16);
  }

  .report__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
  }

  .report__title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    color: #111;
  }

  .report__mark {
    width: 12px;
    height: 12px;
    flex: none;
    background: var(--primary);
    border-radius: 3px;
    display: block;
  }

  .report__tag {
    font-size: 0.58rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    color: #8a8a8a;
    border: 1px solid #dcdcdc;
    border-radius: 20px;
    padding: 4px 10px;
    white-space: nowrap;
  }

  .report__cols,
  .report__row {
    display: grid;
    grid-template-columns: 1fr 52px 26px 52px;
    align-items: center;
  }

  .report__cols {
    margin-top: 22px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ececec;
  }

  .report__col {
    text-align: center;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .report__col--muted {
    color: #9a9a9a;
  }

  .report__col--dark {
    color: #0a0a0c;
  }

  .report__row {
    padding: 13px 0;
    border-bottom: 1px solid #f4f4f4;
  }

  .report__label {
    font-size: 0.98rem;
    font-weight: 600;
    color: #1a1a1a;
  }

  .report__arrow {
    justify-self: center;
    font-size: 1.05rem;
    color: #cfcfcf;
    font-weight: 700;
  }

  .grade {
    justify-self: center;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 11px;
    font-size: 1.05rem;
    font-weight: 800;
  }

  .grade--orange {
    background: #fff1e6;
    color: #ff8c1a;
  }

  .grade--yellow {
    background: #fffae0;
    color: #c99a00;
  }

  .grade--red {
    background: #ffe9e7;
    color: #ff3b30;
  }

  .grade--pass {
    width: 54px;
    background: #000000;
    color: var(--primary);
    text-shadow: 0 0 16px rgba(0, 255, 65, 0.6);
  }

  .report__result {
    margin-top: 20px;
    background: #000000;
    border-radius: 14px;
    padding: 18px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .report__result-label {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: rgba(224, 255, 224, 0.7);
    text-transform: uppercase;
  }

  .report__result-value {
    font-size: 1.9rem;
    font-weight: 800;
    color: var(--primary);
    line-height: 1;
    text-shadow: 0 0 26px rgba(0, 255, 65, 0.4);
    white-space: nowrap;
  }

  .report__note {
    margin: 12px 2px 0;
    font-size: 0.76rem;
    font-weight: 500;
    color: #6a6a6a;
    line-height: 1.5;
  }

  .report__note strong {
    color: #111;
    font-weight: 700;
  }

  /* ── 1b. Trust strip ── */
  .trust {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 1.6rem 7vw;
  }

  .trust__row {
    list-style: none;
    margin: 0 auto;
    padding: 0;
    max-width: 1180px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 0.6rem 1.4rem;
    font-size: 0.98rem;
    font-weight: 500;
    color: rgba(224, 255, 224, 0.72);
  }

  .trust__row li {
    display: flex;
    align-items: center;
  }

  .trust__row li + li::before {
    content: "·";
    margin-right: 1.4rem;
    color: rgba(224, 255, 224, 0.32);
  }

  /* ── 2. Problem ── */
  .problem__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  .leak {
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 18px;
    padding: 2rem 1.8rem;
  }

  .leak__num {
    display: block;
    font-family: "Share Tech Mono", monospace;
    color: var(--primary);
    letter-spacing: 0.2em;
    margin-bottom: 1rem;
    font-size: 0.95rem;
  }

  .leak p {
    color: rgba(224, 255, 224, 0.78);
    line-height: 1.7;
    margin: 0;
  }

  /* ── How it works ── */
  .how__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  .step {
    position: relative;
    background: rgba(0, 0, 0, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 2.4rem 1.8rem 2rem;
  }

  .step__num {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--primary);
    color: #000000;
    font-weight: 700;
    font-size: 1.3rem;
    margin-bottom: 1.2rem;
    box-shadow: 0 0 18px rgba(0, 255, 65, 0.45);
  }

  .step p {
    color: rgba(224, 255, 224, 0.78);
    line-height: 1.7;
    margin: 0;
  }

  /* ── 6. The ladder ── */
  .ladder__track {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    position: relative;
  }

  .ladder__track::before {
    content: "";
    position: absolute;
    top: 34px;
    left: 16.66%;
    right: 16.66%;
    height: 2px;
    background: linear-gradient(
      90deg,
      rgba(0, 255, 65, 0.55),
      rgba(0, 255, 65, 0.25),
      rgba(0, 255, 65, 0.08)
    );
    z-index: 0;
  }

  .rung {
    position: relative;
    z-index: 1;
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 2rem 1.8rem;
  }

  .rung::before {
    content: "";
    position: absolute;
    top: -8px;
    left: 1.8rem;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #0a0a0c;
    border: 2px solid rgba(0, 255, 65, 0.4);
  }

  .rung--active {
    border-color: rgba(0, 255, 65, 0.45);
    box-shadow: 0 0 30px rgba(0, 255, 65, 0.14);
  }

  .rung--active::before {
    background: var(--primary);
    border-color: var(--primary);
    box-shadow: 0 0 14px rgba(0, 255, 65, 0.6);
  }

  .rung__tag {
    display: inline-block;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.64rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(224, 255, 224, 0.5);
    margin-bottom: 0.8rem;
  }

  .rung--active .rung__tag {
    color: var(--primary);
  }

  .rung p {
    color: rgba(224, 255, 224, 0.78);
    line-height: 1.65;
    margin: 0;
  }

  .ladder__link {
    text-align: center;
    margin: 2.6rem 0 0;
    color: rgba(224, 255, 224, 0.75);
    font-size: 1.02rem;
  }

  .ladder__link a {
    color: var(--primary);
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
  }

  .ladder__link a:hover {
    text-shadow: 0 0 12px rgba(0, 255, 65, 0.5);
  }

  /* ── Final CTA ── */
  .final {
    position: relative;
    margin-top: 2rem;
    padding: 6rem 7vw 5rem;
    text-align: center;
    border-top: 1px solid rgba(0, 255, 65, 0.2);
    overflow: hidden;
  }

  .final__glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at bottom,
      rgba(0, 255, 140, 0.18),
      rgba(0, 0, 0, 0.95) 60%
    );
    z-index: 0;
  }

  .final__inner {
    position: relative;
    z-index: 1;
    max-width: 680px;
    margin: 0 auto;
  }

  .final__lead {
    font-size: 1.15rem;
    line-height: 1.65;
    color: rgba(224, 255, 224, 0.85);
    margin: 1.2rem auto 2.2rem;
    max-width: 560px;
  }

  .final__divider {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 3rem 0 2rem;
    color: rgba(224, 255, 224, 0.45);
    font-size: 0.8rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .final__divider::before,
  .final__divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.12);
  }

  /* ── Lead form ── */
  .lead-form {
    display: grid;
    gap: 1rem;
    text-align: left;
    max-width: 560px;
    margin: 0 auto;
  }

  .lead-form__trap {
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  .lead-form__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .lead-form__field {
    display: grid;
    gap: 0.4rem;
  }

  .lead-form__field label {
    font-size: 0.76rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--primary);
    font-weight: 600;
  }

  .lead-form__field input,
  .lead-form__field textarea {
    background: rgba(0, 255, 65, 0.07);
    border: 1px solid rgba(0, 255, 65, 0.3);
    border-radius: 10px;
    padding: 0.75rem 1rem;
    color: var(--text);
    font-family: inherit;
    font-size: 0.95rem;
    outline: none;
    width: 100%;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .lead-form__field input::placeholder,
  .lead-form__field textarea::placeholder {
    color: rgba(224, 255, 224, 0.4);
  }

  .lead-form__field input:focus,
  .lead-form__field textarea:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(0, 255, 65, 0.15);
  }

  .lead-form__field textarea {
    resize: vertical;
    min-height: 90px;
  }

  .lead-form .btn--solid {
    width: 100%;
    margin-top: 0.4rem;
  }

  .lead-form .btn--solid.lead-form__submit {
    display: inline-flex;
    width: auto !important;
    max-width: max-content;
    justify-self: start;
    padding: 0.78rem 1.5rem;
  }

  .lead-form__success {
    color: var(--primary);
    font-weight: 600;
    margin: 0.2rem 0 0;
  }

  .lead-form__error {
    color: #ff7a7a;
    font-weight: 600;
    margin: 0.2rem 0 0;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .ahero__inner {
      grid-template-columns: 1fr;
      justify-items: center;
      text-align: center;
    }

    .ahero__copy {
      order: 1;
    }

    .ahero__report {
      order: 2;
    }

    .lead {
      margin-inline: auto;
    }

    .ahero__cta {
      justify-content: center;
    }

    .problem__grid,
    .how__grid,
    .ladder__track {
      grid-template-columns: 1fr;
    }

    .ladder__track::before {
      display: none;
    }
  }

  @media (max-width: 640px) {
    .section {
      padding: 4rem 6vw;
    }

    .ahero {
      padding: 4rem 6vw 3.5rem;
    }

    h1 {
      font-size: 2.15rem;
    }

    .report {
      padding: 24px 22px;
    }

    .report__label {
      font-size: 0.9rem;
    }

    .final {
      padding: 4.5rem 6vw 4rem;
    }

    .ahero__cta .btn {
      width: 100%;
    }

    .lead-form__row {
      grid-template-columns: 1fr;
    }
  }
</style>
