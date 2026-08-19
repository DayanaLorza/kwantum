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
  image="/assets/og/og-ai-audit.png"
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
      { name: "AI Audit", path: "/audit" },
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
  <section class="ladder band band--paper">
    <div class="band__inner">
    <header class="band__head">
      <p class="eyebrow">One Audit. Three Doors.</p>
      <h2>Start small. Scale as it pays off.</h2>
      <p class="band__sub">
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
    </div>
  </section>

  <!-- ── 2. THE PROBLEM ── -->
  <section class="problem band band--panel">
    <div class="band__inner">
    <header class="band__head">
      <p class="eyebrow">Where the Time Goes</p>
      <h2>The busywork adding up in the background.</h2>
      <p class="band__sub">
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
    </div>
  </section>

  <!-- ── 3. HOW IT WORKS ── -->
  <section id="how-it-works" class="how band band--paper">
    <div class="band__inner">
    <header class="band__head">
      <p class="eyebrow">Simple From the First Message</p>
      <h2>How the audit works.</h2>
      <p class="band__sub">Three steps from first message to a written plan.</p>
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

  h1 {
    font-size: clamp(2.6rem, 4vw + 1rem, 4.4rem);
    font-weight: 600;
    margin: 0 0 1.4rem;
  }

  h3 {
    font-size: var(--text-xl);
    font-weight: 600;
    margin: 0 0 0.6rem;
  }

  /* the page's one highlighted word — and its one glow */
  .glow {
    color: var(--green);
    text-shadow: var(--glow);
  }

  /* ── 1. Hero — tone: void ── */
  .ahero {
    position: relative;
    padding: var(--sp-section) var(--gutter) var(--sp-6);
    border-bottom: 1px solid var(--line);
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
      rgb(0 255 65 / 0.13) 0%,
      rgb(0 255 65 / 0.04) 34%,
      transparent 66%
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

  .ahero__copy .eyebrow {
    margin-bottom: var(--sp-2);
  }

  .subhead {
    font-size: clamp(1.15rem, 0.6vw + 0.95rem, 1.45rem);
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: -0.01em;
    color: var(--green);
    max-width: 50ch;
    margin: 0 0 1.4rem;
    text-wrap: balance;
  }

  .subhead strong {
    color: var(--text-hi);
    font-weight: 700;
  }

  .lead {
    font-size: var(--text-lg);
    line-height: 1.6;
    color: var(--text);
    max-width: 56ch;
    margin: 0 0 2.2rem;
  }

  .lead strong {
    color: var(--text-hi);
  }

  .ahero__cta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .ahero__note {
    margin: 1.6rem 0 0;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-dim);
  }

  /* ── The report artifact (white card in the dark hero) ── */
  .ahero__report {
    justify-self: center;
    width: 100%;
    max-width: 440px;
  }

  .report {
    background: #ffffff;
    border-radius: 22px;
    padding: 30px 32px;
    color: var(--ink);
    box-shadow: 0 30px 80px -30px rgb(0 0 0 / 0.9);
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
    font-family: var(--font-mono);
    font-size: 0.74rem;
    letter-spacing: 0.16em;
    color: var(--ink);
  }

  .report__mark {
    width: 12px;
    height: 12px;
    flex: none;
    background: var(--green);
    border-radius: 3px;
    display: block;
  }

  .report__tag {
    font-family: var(--font-mono);
    font-size: 0.58rem;
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
    font-family: var(--font-mono);
    font-size: 0.62rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .report__col--muted {
    color: #9a9a9a;
  }

  .report__col--dark {
    color: var(--ink);
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
    font-family: var(--font-mono);
    font-size: 1.05rem;
  }

  /* brand-kit failing-grade tones: D orange, C yellow, F red */
  .grade--orange {
    background: #fff1e6;
    color: #b35800;
  }

  .grade--yellow {
    background: #fffae0;
    color: #8a6d00;
  }

  .grade--red {
    background: #ffe9e7;
    color: #c22e24;
  }

  /* green metric on a black chip — never green on white */
  .grade--pass {
    width: 54px;
    background: var(--black);
    color: var(--green);
  }

  .report__result {
    margin-top: 20px;
    background: var(--black);
    border-radius: 14px;
    padding: 18px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .report__result-label {
    font-family: var(--font-mono);
    font-size: 0.66rem;
    letter-spacing: 0.18em;
    color: rgb(224 255 224 / 0.7);
    text-transform: uppercase;
  }

  .report__result-value {
    font-family: var(--font-display);
    font-size: 1.9rem;
    font-weight: 700;
    color: var(--green);
    line-height: 1;
    white-space: nowrap;
  }

  .report__note {
    margin: 12px 2px 0;
    font-size: 0.76rem;
    color: #6a6a6a;
    line-height: 1.5;
  }

  .report__note strong {
    color: var(--ink);
    font-weight: 700;
  }

  /* ── 1b. Trust strip ── */
  .trust {
    border-bottom: 1px solid var(--line);
    padding: 1.6rem var(--gutter);
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
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-dim);
  }

  .trust__row li {
    display: flex;
    align-items: center;
  }

  .trust__row li + li::before {
    content: "·";
    margin-right: 1.4rem;
    color: rgb(0 255 65 / 0.55);
  }

  /* ── Ladder — tone: paper ── */
  .ladder__track {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--sp-3);
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
      rgb(11 19 13 / 0.5),
      rgb(11 19 13 / 0.2),
      rgb(11 19 13 / 0.08)
    );
    z-index: 0;
  }

  .rung {
    position: relative;
    z-index: 1;
    background: #ffffff;
    border: 1px solid var(--line-ink);
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
    background: var(--tone-paper);
    border: 2px solid rgb(11 19 13 / 0.3);
  }

  .rung--active {
    border-color: var(--ink);
    box-shadow: 0 18px 40px -24px rgb(11 19 13 / 0.5);
  }

  .rung--active::before {
    background: var(--green);
    border-color: var(--ink);
  }

  .rung__tag {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: 0.64rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink-faint);
    margin-bottom: 0.8rem;
  }

  .rung--active .rung__tag {
    color: var(--ink);
  }

  .rung p {
    color: var(--ink-dim);
    line-height: 1.65;
    margin: 0;
  }

  .ladder__link {
    text-align: center;
    margin: 2.6rem 0 0;
    color: var(--ink-dim);
    font-size: 1.02rem;
  }

  .ladder__link a {
    color: var(--ink);
    font-weight: 600;
    text-decoration-color: #00a32b;
    text-underline-offset: 3px;
    white-space: nowrap;
  }

  /* ── Problem — tone: dark panel ── */
  .problem__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--sp-3);
  }

  .leak {
    background: rgb(0 0 0 / 0.45);
    border: 1px solid var(--line);
    border-radius: 18px;
    padding: 2rem 1.8rem;
  }

  .leak__num {
    display: block;
    font-family: var(--font-mono);
    color: rgb(0 255 65 / 0.7);
    letter-spacing: 0.2em;
    margin-bottom: 1rem;
    font-size: var(--text-sm);
  }

  .leak p {
    color: var(--text-dim);
    line-height: 1.7;
    margin: 0;
  }

  /* ── How it works — tone: paper ── */
  .how__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--sp-3);
  }

  .step {
    position: relative;
    background: #ffffff;
    border: 1px solid var(--line-ink);
    border-radius: 20px;
    padding: 2.4rem 1.8rem 2rem;
  }

  .step__num {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--black);
    color: var(--green);
    font-family: var(--font-mono);
    font-size: 1.2rem;
    margin-bottom: 1.2rem;
  }

  .step p {
    color: var(--ink-dim);
    line-height: 1.7;
    margin: 0;
  }

  /* ── Final CTA — tone: void ── */
  .final {
    position: relative;
    padding: var(--sp-section) var(--gutter) var(--sp-6);
    text-align: center;
    border-top: 1px solid var(--line);
    overflow: hidden;
  }

  .final__glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at bottom,
      rgb(0 255 65 / 0.1),
      transparent 60%
    );
    z-index: 0;
  }

  .final__inner {
    position: relative;
    z-index: 1;
    max-width: 680px;
    margin: 0 auto;
  }

  .final__inner h2 {
    font-size: var(--text-3xl);
    font-weight: 600;
    margin: var(--sp-2) 0 0;
  }

  .final__lead {
    font-size: var(--text-lg);
    line-height: 1.65;
    color: var(--text);
    margin: 1.2rem auto 2.2rem;
    max-width: 560px;
  }

  .final__divider {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 3rem 0 2rem;
    color: var(--text-faint);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .final__divider::before,
  .final__divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--line);
  }

  /* ── Lead form (dark ground) ── */
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
    gap: 0.45rem;
  }

  .lead-form__field label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--text-dim);
  }

  .lead-form__field input,
  .lead-form__field textarea {
    background: rgb(224 255 224 / 0.05);
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    padding: 0.75rem 1rem;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.95rem;
    width: 100%;
    transition: border-color var(--dur-micro) var(--ease-out),
                box-shadow var(--dur-micro) var(--ease-out),
                background-color 9999s;  /* defuses Chrome's opaque autofill paint */
  }

  .lead-form__field input::placeholder,
  .lead-form__field textarea::placeholder {
    color: var(--text-faint);
  }

  .lead-form__field input:focus-visible,
  .lead-form__field textarea:focus-visible {
    outline: none;
    border-color: var(--green);
    box-shadow: 0 2px 0 0 var(--green);
  }

  .lead-form__field textarea {
    resize: vertical;
    min-height: 90px;
  }

  .lead-form__submit {
    justify-self: start;
    margin-top: 0.4rem;
  }

  .lead-form__success {
    color: var(--green);
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
    .ahero {
      padding: var(--sp-5) var(--gutter) var(--sp-4);
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

    .ahero__cta .btn {
      width: 100%;
    }

    .lead-form__row {
      grid-template-columns: 1fr;
    }
  }
</style>
