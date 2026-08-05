<script>
  import { onMount } from "svelte";
  import { env as publicEnv } from "$env/dynamic/public";
  import Turnstile from "$lib/Turnstile.svelte";
  import NeuralField from "$lib/NeuralField.svelte";
  import AgentEmblem from "$lib/AgentEmblem.svelte";
  import AgentDemo from "$lib/AgentDemo.svelte";
  import Seo from "$lib/Seo.svelte";
  import {
    aiEmployeesServiceSchema,
    breadcrumbSchema,
    faqSchema,
  } from "$lib/seo/schema.js";

  const aiEmployeeOfferings = [
    {
      name: "Lead Response Employee",
      description:
        "Qualifies and follows up with every inbound lead, books consultations, and keeps opportunities warm 24/7.",
    },
    {
      name: "Client Support Employee",
      description:
        "Trained on your knowledge with an on-brand personality to answer questions and engage clients around the clock.",
    },
  ];

  const calendly = "https://calendly.com/kwantumconsulting/30min";

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
        body: data
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || "Message failed to send.");
      }

      inquirySuccess = true;
      form.reset();
      setTimeout(() => { inquirySuccess = false; }, 6000);
    } catch (error) {
      inquiryError = error.message || "Message failed to send.";
    } finally {
      inquirySending = false;
      turnstileToken = "";
    }
  }

  const faqs = [
    {
      q: "How much does a custom AI employee cost?",
      a: "Less than hiring. Every build is scoped to the role your AI employee needs to perform, so pricing depends on the work. Most real estate teams find a single AI employee costs a fraction of an experienced hire — and it works around the clock, never takes a holiday, and never asks for a raise. You'll get a clear, scoped quote on your strategy call."
    },
    {
      q: "Is this complicated to set up?",
      a: "Not for you. We handle the build, the training, and the deployment end to end. You tell us how your business works in plain language — we do the technical heavy lifting and hand you something that simply works. No engineering team required on your side."
    },
    {
      q: "Will this replace my team?",
      a: "No — it frees them. Your AI employees take the repetitive, after-hours, and high-volume work off your team's plate so your best people can focus on relationships, strategy, and growth. Think of it as leverage, not layoffs: the same team, doing far more."
    },
    {
      q: "What industries is this best for?",
      a: "We build for real estate teams with valuable leads, fast-moving inquiries, and client communication that needs a quick response. If your team spends hours on intake, follow-up, showing requests, listing questions, or buyer and seller updates, there's a strong fit."
    },
    {
      q: "How long until it's live?",
      a: "Most AI employees go from strategy to deployment in a matter of weeks, not months. We start with your highest-impact workflow, get it working, and expand from there. You'll have a clear timeline before we begin."
    },
    {
      q: "What makes this different from a generic chatbot or automation tool?",
      a: "Generic bots read from a script. Your AI employees are designed around your business — your offers, your voice, your process — and they take real action: booking meetings, following up, answering accurately, and handing off to a human when it matters. It's built for you, not bolted on."
    }
  ];
</script>

<Seo
  title="AI Employees for Real Estate | Kwantum Tech"
  description="Hire AI employees that never clock out. They qualify leads, follow up, and book calls 24/7 — built for you."
  image="/og-ai-employees.png"
  imageAlt="Kwantum Tech AI Employees — Lead Response, Client Support, and 24/7 Automation"
  keywords={[
    "AI employees",
    "AI agents for real estate",
    "AI lead response",
    "real estate AI assistant",
    "24/7 customer support automation",
    "AI for real estate teams",
    "lead qualification automation",
    "AI client support",
    "conversational AI for business",
  ]}
  schema={[
    aiEmployeesServiceSchema(aiEmployeeOfferings),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "AI Employees", path: "/ai-agents" },
    ]),
    faqSchema(faqs.map((f) => ({ question: f.q, answer: f.a }))),
  ]}
/>

<main class="agents">
  <!-- ── 1. HERO ── -->
  <section class="ahero">
    <div class="ahero__glow" aria-hidden="true"></div>
    <div class="ahero__backdrop" aria-hidden="true">
      <NeuralField />
    </div>
    <div class="ahero__inner">
      <div class="ahero__copy">
        <p class="eyebrow">Kwantum Tech · AI Employees</p>
        <h1>Hire AI employees that never clock out.</h1>
        <p class="lead">
          Premium AI employees, built for luxury real-estate teams. Yours answers every lead in
          minutes — at 11:47 PM too — books showings into your open slots, and briefs you each
          morning on what it handled. You run the business. Your employee runs the busywork.
        </p>
      </div>
      <div class="ahero__demo">
        <AgentDemo />
      </div>
      <div class="ahero__actions">
        <div class="ahero__cta">
          <a class="btn btn--solid" href="#book">Book a Strategy Call</a>
          <a class="btn btn--ghost" href="#how-it-works">See How It Works</a>
        </div>
        <p class="ahero__note">No tech knowledge required · Built and managed for you</p>
      </div>
    </div>
  </section>

  <!-- ── 1b. "WHILE YOU SLEPT" TIMELINE STRIP (§5b item 1) ── -->
  <section class="timeline section" aria-label="What your employee handled overnight">
    <p class="timeline__head">While you slept</p>
    <ol class="timeline__track">
      <li class="timeline__step">
        <span class="timeline__time">11:47 PM</span>
        <span class="timeline__label">new lead, Zillow</span>
      </li>
      <li class="timeline__step">
        <span class="timeline__time">11:49 PM</span>
        <span class="timeline__label">answered</span>
      </li>
      <li class="timeline__step">
        <span class="timeline__time">11:52 PM</span>
        <span class="timeline__label">pre-approval confirmed</span>
      </li>
      <li class="timeline__step">
        <span class="timeline__time">7:02 AM</span>
        <span class="timeline__label">your morning brief</span>
      </li>
    </ol>

    <!-- Speed stat (§5b item 8) — PLACEHOLDER pending sourced citation (kanban card t_3c327483).
         Replace the first clause with the verified industry number once it lands. -->
    <p class="timeline__stat">
      Leads answered in minutes convert — most agents take hours. Yours answers in
      <strong>two minutes</strong>, every time, including 11:47 PM.
    </p>
  </section>

  <!-- ── 2. PROBLEM / AGITATION ── -->
  <section class="problem section">
    <header class="section__head">
      <p class="eyebrow">The Reality of Running Lean</p>
      <h2>Growth shouldn't depend on you being everywhere at once.</h2>
    </header>
    <div class="problem__grid">
      <article class="pain">
        <span class="pain__num">01</span>
        <h3>You can't be everywhere at once</h3>
        <p>
          Leads come in at midnight, on weekends, and right in the middle of your
          busiest hour. Every message that sits unanswered is a customer quietly
          moving on to a competitor who replied first.
        </p>
      </article>
      <article class="pain">
        <span class="pain__num">02</span>
        <h3>Scaling used to mean hiring</h3>
        <p>
          More volume meant more salaries, more onboarding, more overhead. For a
          lean team, the math doesn't always work — and good people are hard to
          find and harder to keep.
        </p>
      </article>
      <article class="pain">
        <span class="pain__num">03</span>
        <h3>Your best people are buried in low-leverage work</h3>
        <p>
          Follow-ups, reminders, data entry, the same questions answered a hundred
          times. Talented people stuck doing tasks a machine should handle — while
          the high-value work waits.
        </p>
      </article>
    </div>
  </section>

  <!-- ── 3. SOLUTION INTRODUCTION ── -->
  <section class="solution section">
    <div class="solution__inner">
      <p class="eyebrow">A Better Way to Scale</p>
      <h2>Meet your new AI employees.</h2>
      <p class="solution__lead">
        Kwantum Tech builds custom <strong>AI employees</strong> — not generic
        chatbots or off-the-shelf software, but agents trained on your business,
        your voice, and your goals. They work every hour of every day, never call
        in sick, and get sharper the longer they're with you.
      </p>
      <p class="solution__lead">
        One build. A lifetime of work. It's the leverage growing businesses have
        been waiting for — and the businesses adopting it now are the ones pulling
        ahead.
      </p>
    </div>
  </section>

  <!-- ── 4. AGENT SHOWCASE ── -->
  <section id="agents" class="showcase section">
    <header class="section__head">
      <p class="eyebrow">The Team You Can Hire Today</p>
      <h2>AI employees for the work real estate teams repeat every day.</h2>
    </header>

    <!-- Client acquisition -->
    <article class="agent agent--acquisition">
      <div class="agent__visual">
        <AgentEmblem variant="acquisition" />
        <span class="agent__badge">AI Employee</span>
      </div>
      <div class="agent__body">
        <h3 class="agent__name">Lead Response Employee</h3>
        <p class="agent__tagline">
          A premium AI employee for lead response, qualification, follow-up, and
          consultation booking.
        </p>
        <ul class="agent__benefits">
          <li>
            <strong>Never sleeps.</strong> Follows up with every lead, books
            meetings, and keeps conversations moving — at 2pm or 2am.
          </li>
          <li>
            <strong>Handles the repetitive ops.</strong> Outreach, reminders,
            scheduling, data entry, and handoffs, done automatically and on time.
          </li>
          <li>
            <strong>Scales without hiring.</strong> Take on more clients and more
            volume without adding headcount or overhead.
          </li>
        </ul>
        <div class="agent__tags">
          <span>Real Estate</span>
          <span>Brokerages</span>
          <span>Sales Teams</span>
        </div>
        <a class="btn btn--accent" href="#book">
          Build my AI employee
        </a>
      </div>
    </article>

    <!-- Client operations -->
    <article class="agent agent--operations">
      <div class="agent__visual">
        <AgentEmblem variant="operations" />
        <span class="agent__badge">AI Employee</span>
      </div>
      <div class="agent__body">
        <h3 class="agent__name">Client Support Employee</h3>
        <p class="agent__tagline">
          A custom AI employee for your brand — ready to answer questions, route requests,
          and keep every client conversation moving.
        </p>
        <ul class="agent__benefits">
          <li>
            <strong>Trained on your knowledge.</strong> Answers questions about
            your products, services, and policies with accuracy, every time.
          </li>
          <li>
            <strong>On-brand personality.</strong> Speaks in your voice, looks
            like your brand, and feels like a natural part of your business.
          </li>
          <li>
            <strong>24/7 customer engagement.</strong> Greets, guides, and
            converts visitors on your site or app — day, night, and weekends.
          </li>
        </ul>
        <div class="agent__tags">
          <span>Listings</span>
          <span>Client Care</span>
          <span>Operations</span>
        </div>
        <a class="btn btn--accent" href="#book">
          Build your assistant
        </a>
      </div>
    </article>
  </section>

  <!-- ── 5. INDUSTRIES WE POWER ── -->
  <section class="industries section">
    <header class="section__head">
      <p class="eyebrow">Built for Your World</p>
      <h2>Industries we power.</h2>
      <p class="section__sub">
        Wherever there are clients to engage and repetitive work to automate,
        an AI employee earns its keep.
      </p>
    </header>
    <div class="industries__grid">
      <article class="industry">
        <h3>Real Estate</h3>
        <p>Qualify and follow up with every property inquiry, book consultations, and keep buyer and seller opportunities warm while you're closing deals.</p>
      </article>
      <article class="industry">
        <h3>Brokerages</h3>
        <p>Handle inbound leads, automate listing updates, and deliver responsive client communication at scale.</p>
      </article>
      <article class="industry">
        <h3>Property Teams</h3>
        <p>Qualify serious buyers and sellers, answer listing questions, and move the right clients toward a booked consultation.</p>
      </article>
      <article class="industry">
        <h3>Client Support Employee</h3>
        <p>Answer client questions, route requests, and protect the experience from first inquiry through closing.</p>
      </article>
      <article class="industry">
        <h3>Real Estate Offices</h3>
        <p>Greet new inquiries, schedule consultations, and keep buyers and sellers informed without tying up your team.</p>
      </article>
    </div>
  </section>

  <!-- ── 6. HOW IT WORKS ── -->
  <section id="how-it-works" class="how section">
    <header class="section__head">
      <p class="eyebrow">Simple From Day One</p>
      <h2>How it works.</h2>
      <p class="section__sub">Three steps from first call to a working AI employee.</p>
    </header>
    <div class="how__grid">
      <article class="step">
        <span class="step__num">1</span>
        <h3>Consult</h3>
        <p>
          We start with a strategy call to learn your business — your
          workflows, your bottlenecks, and where an AI employee delivers the
          biggest win.
        </p>
      </article>
      <article class="step">
        <span class="step__num">2</span>
        <h3>Build</h3>
        <p>
          We design, train, and customize your AI employee on your data, your voice,
          and your brand. You review, we refine — until it feels like one of your
          own.
        </p>
      </article>
      <article class="step">
        <span class="step__num">3</span>
        <h3>Deploy &amp; Grow</h3>
        <p>
          We launch your AI employee and keep it sharp. It starts working on day
          one, learns as it goes, and only gets better from there.
        </p>
      </article>
    </div>
  </section>

  <!-- ── 7. SOCIAL PROOF ── -->
  <section class="proof section">
    <header class="section__head">
      <p class="eyebrow">Don't Just Take Our Word</p>
      <h2>Businesses already pulling ahead.</h2>
    </header>
    <div class="proof__grid">
      <figure class="quote">
        <span class="quote__agent quote__agent--acquisition">Lead Response Employee</span>
        <blockquote>
          “Lead Response Employee changed the game for our team. We were losing leads every
          weekend and after hours — now every inquiry gets an instant, intelligent
          response no matter when it comes in. We've booked more buyer and seller consultations this
          quarter than any quarter before, and I haven't had to hire a single
          additional person to make it happen.”
        </blockquote>
        <figcaption>
          <span class="quote__name">Jordan M.</span>
          <span class="quote__role">Broker / Owner · Real Estate Agency, Miami FL</span>
        </figcaption>
      </figure>
      <figure class="quote">
        <span class="quote__agent quote__agent--acquisition">Lead Response Employee</span>
        <blockquote>
          “We were drowning in repetitive client communications — status updates,
          follow-ups, intake forms. Our AI employee handles all of it now. Our team is
          focused on actual strategy and creative work, and we've taken on 40% more
          accounts without adding headcount. It's like having a senior ops person
          who never needs a day off.”
        </blockquote>
        <figcaption>
          <span class="quote__name">Taylor R.</span>
          <span class="quote__role">Founder · Marketing Agency, Austin TX</span>
        </figcaption>
      </figure>
      <figure class="quote">
        <span class="quote__agent quote__agent--operations">Client Support Employee</span>
        <blockquote>
          “Our team could not be available around the clock, and we were
          losing high-intent property inquiries because of it. Our AI employee answers client questions
          instantly — availability, next steps, documents, and handoffs — at 2am
          just as well as 2pm. Within the first month we recovered conversations we
          would have simply lost overnight.”
        </blockquote>
        <figcaption>
          <span class="quote__name">Alex D.</span>
          <span class="quote__role">Operations Director · Boutique Hotel Group</span>
        </figcaption>
      </figure>
    </div>
  </section>

  <!-- ── 8. FAQ ── -->
  <section class="faq section">
    <header class="section__head">
      <p class="eyebrow">Questions, Answered</p>
      <h2>Frequently asked.</h2>
    </header>
    <div class="faq__list">
      {#each faqs as faq}
        <details class="faq__item">
          <summary>
            <span>{faq.q}</span>
            <span class="faq__plus" aria-hidden="true"></span>
          </summary>
          <p>{faq.a}</p>
        </details>
      {/each}
    </div>
  </section>

  <!-- ── 8b. BOUNDARIES: "WHAT IT NEVER DOES" (§5b item 3) ── -->
  <section class="boundaries section" aria-label="What your AI employee never does">
    <h2 class="boundaries__head">What it never does</h2>
    <ul class="boundaries__list">
      <li>It never sends anything as you without your OK.</li>
      <li>It never touches a negotiation — those come to you.</li>
      <li>Every action is logged, so you can read the receipts any time.</li>
    </ul>
  </section>

  <!-- ── 9. FINAL CTA ── -->
  <section id="book" class="final">
    <div class="final__glow" aria-hidden="true"></div>
    <div class="final__inner">
      <p class="eyebrow">The Window Is Now</p>
      <h2>Your competitors are still doing it by hand.</h2>
      <p class="final__lead">
        Give your real estate team an AI employee that protects high-value opportunities
        while you sleep. Book a strategy call and we'll show you where automation
        can create the most leverage.
      </p>
      <!-- Inline Calendly embed — commented out for now, will re-enable later.
      <div class="calendly-embed">
        <iframe
          title="Book a strategy call with Kwantum Tech"
          src="{calendly}?hide_gdpr_banner=1&background_color=000000&text_color=e0ffe0&primary_color=00e5ff"
          loading="lazy"
        ></iframe>
      </div>
      -->

      <div class="final__divider"><span>or send us the details</span></div>

      <form class="lead-form" on:submit|preventDefault={handleInquirySubmit}>
        <div class="lead-form__trap" aria-hidden="true">
          <label for="lead-website">Website</label>
          <input id="lead-website" type="text" name="website" tabindex="-1" autocomplete="off" />
        </div>
        <input type="hidden" name="service" value="ai-customization" />
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
          <label for="lead-message">What would you love to automate?</label>
          <textarea id="lead-message" name="message" rows="3" placeholder="Tell us where your team loses the most time..." required></textarea>
        </div>
        <Turnstile siteKey={turnstileSiteKey} onToken={(token) => (turnstileToken = token)} />
        <button type="submit" class="btn btn--solid lead-form__submit" disabled={inquirySending}>
          {inquirySending ? "Sending..." : "Request My Strategy Call"}
        </button>
        {#if inquirySuccess}
          <p class="lead-form__success">Got it — we'll be in touch within 24 hours.</p>
        {/if}
        {#if inquiryError}
          <p class="lead-form__error">{inquiryError}</p>
        {/if}
      </form>
    </div>
  </section>
</main>

<style>
  .agents {
    --acquisition: #00e5ff;
    --operations: #b66bff;
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
    text-shadow: 0 0 14px rgba(0, 255, 65, 0.45);
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

  .btn--accent {
    background: transparent;
    color: var(--accent-color, var(--primary));
    border-color: var(--accent-color, var(--primary));
    text-transform: uppercase;
    font-size: 0.88rem;
  }

  .btn--accent:hover {
    background: var(--accent-color, var(--primary));
    color: #000000;
    box-shadow: 0 0 20px var(--accent-glow, rgba(0, 255, 65, 0.4));
    transform: translateY(-2px);
  }

  .btn--lg {
    padding: 1.05rem 2.4rem;
    font-size: 1rem;
  }

  /* ── 1. Hero ── */
  .ahero {
    position: relative;
    padding: calc(6rem - 20px) 7vw 5rem;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    overflow: hidden;
  }

  .ahero__glow {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 30% 0%, rgba(0, 229, 255, 0.12), transparent 50%),
      radial-gradient(ellipse at 75% 20%, rgba(182, 107, 255, 0.12), transparent 50%);
    z-index: 0;
  }

  .ahero__backdrop {
    position: absolute;
    inset: 0;
    opacity: 0.6;
    z-index: 0;
  }

  .ahero__inner {
    position: relative;
    z-index: 1;
    max-width: 1180px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    grid-template-areas:
      "copy demo"
      "actions demo";
    align-items: center;
    column-gap: clamp(2rem, 5vw, 4.5rem);
    row-gap: 0;
    text-align: left;
  }

  .ahero__copy { grid-area: copy; }
  .ahero__actions { grid-area: actions; align-self: start; }
  .ahero__demo { grid-area: demo; justify-self: center; margin-top: -20px; }

  .lead {
    font-size: clamp(1.05rem, 0.6vw + 0.9rem, 1.3rem);
    line-height: 1.6;
    color: rgba(224, 255, 224, 0.88);
    max-width: 56ch;
    margin: 0 0 2.4rem;
  }

  .ahero__cta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: flex-start;
  }

  .ahero__note {
    margin: 1.6rem 0 0;
    font-size: 0.82rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(224, 255, 224, 0.5);
  }

  /* ── 2. Problem ── */
  .problem__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  .pain {
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 18px;
    padding: 2rem 1.8rem;
  }

  .pain__num {
    display: block;
    font-family: "Share Tech Mono", monospace;
    color: var(--accent);
    letter-spacing: 0.2em;
    margin-bottom: 1rem;
    font-size: 0.95rem;
  }

  .pain p {
    color: rgba(224, 255, 224, 0.78);
    line-height: 1.7;
    margin: 0;
  }

  /* ── 3. Solution ── */
  .solution {
    text-align: center;
  }

  .solution__inner {
    max-width: 760px;
    margin: 0 auto;
  }

  .solution__lead {
    font-size: 1.18rem;
    line-height: 1.7;
    color: rgba(224, 255, 224, 0.85);
    margin: 1.6rem 0 0;
  }

  .solution__lead strong {
    color: var(--primary);
  }

  /* ── 4. Agent Showcase ── */
  .agent {
    display: grid;
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
    gap: 2.5rem;
    align-items: center;
    padding: 2.5rem;
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background:
      linear-gradient(rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.72)),
      radial-gradient(circle at top left, var(--accent-glow), transparent 60%);
    margin-bottom: 2rem;
  }

  .agent--acquisition {
    --accent-color: var(--acquisition);
    --accent-glow: rgba(0, 229, 255, 0.35);
  }

  .agent--operations {
    --accent-color: var(--operations);
    --accent-glow: rgba(182, 107, 255, 0.35);
  }

  .agent__visual {
    display: grid;
    place-items: center;
    gap: 1.2rem;
    padding: 2rem;
    border-radius: 18px;
    background: radial-gradient(circle, var(--accent-glow), transparent 70%);
  }

  .agent__badge {
    font-family: "Share Tech Mono", monospace;
    font-size: 0.72rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--accent-color);
  }

  .agent__name {
    font-size: clamp(1.8rem, 1.4vw + 1rem, 2.4rem);
    margin: 0 0 0.5rem;
    color: #ffffff;
    text-shadow: 0 0 14px var(--accent-glow);
  }

  .agent__tagline {
    font-size: 1.1rem;
    color: rgba(224, 255, 224, 0.85);
    line-height: 1.55;
    margin: 0 0 1.5rem;
  }

  .agent__benefits {
    list-style: none;
    padding: 0;
    margin: 0 0 1.6rem;
    display: grid;
    gap: 0.9rem;
  }

  .agent__benefits li {
    position: relative;
    padding-left: 1.6rem;
    color: rgba(224, 255, 224, 0.8);
    line-height: 1.6;
  }

  .agent__benefits li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.55em;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent-color);
    box-shadow: 0 0 8px var(--accent-color);
  }

  .agent__benefits strong {
    color: #ffffff;
  }

  .agent__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-bottom: 1.8rem;
  }

  .agent__tags span {
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.4rem 0.9rem;
    border-radius: 999px;
    border: 1px solid var(--accent-color);
    color: var(--accent-color);
    background: var(--accent-glow);
  }

  /* ── 5. Industries ── */
  .industries__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  .industry {
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(0, 255, 65, 0.14);
    border-radius: 18px;
    padding: 1.8rem;
    transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
  }

  .industry:hover {
    border-color: rgba(0, 255, 65, 0.5);
    transform: translateY(-4px);
    box-shadow: 0 0 24px rgba(0, 255, 65, 0.15);
  }

  .industry p {
    color: rgba(224, 255, 224, 0.78);
    line-height: 1.65;
    margin: 0;
    font-size: 0.95rem;
  }

  /* ── 6. How It Works ── */
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

  /* ── 7. Social Proof ── */
  .proof__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  .quote {
    margin: 0;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-left: 3px solid var(--primary);
    border-radius: 16px;
    padding: 2rem 1.8rem;
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
  }

  .quote__agent {
    align-self: flex-start;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.68rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
    border: 1px solid currentColor;
  }

  .quote__agent--acquisition {
    color: var(--acquisition);
    background: rgba(0, 229, 255, 0.12);
  }

  .quote__agent--operations {
    color: var(--operations);
    background: rgba(182, 107, 255, 0.12);
  }

  .quote blockquote {
    margin: 0;
    color: rgba(224, 255, 224, 0.85);
    line-height: 1.7;
    font-size: 1.02rem;
  }

  .quote figcaption {
    display: grid;
    gap: 0.25rem;
  }

  .quote__name {
    color: #ffffff;
    font-weight: 600;
  }

  .quote__role {
    color: var(--primary);
    font-size: 0.82rem;
    letter-spacing: 0.04em;
  }

  /* ── 8. FAQ ── */
  .faq__list {
    max-width: 820px;
    margin: 0 auto;
    display: grid;
    gap: 1rem;
  }

  .faq__item {
    background: rgba(0, 0, 0, 0.55);
    border: 1px solid rgba(0, 255, 65, 0.16);
    border-radius: 14px;
    padding: 0 1.5rem;
    transition: border-color 0.2s ease;
  }

  .faq__item[open] {
    border-color: rgba(0, 255, 65, 0.45);
  }

  .faq__item summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.3rem 0;
    cursor: pointer;
    list-style: none;
    color: #ffffff;
    font-weight: 600;
    font-size: 1.05rem;
  }

  .faq__item summary::-webkit-details-marker {
    display: none;
  }

  .faq__plus {
    position: relative;
    flex-shrink: 0;
    width: 18px;
    height: 18px;
  }

  .faq__plus::before,
  .faq__plus::after {
    content: "";
    position: absolute;
    background: var(--primary);
    border-radius: 2px;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  .faq__plus::before {
    top: 8px;
    left: 0;
    width: 18px;
    height: 2px;
  }

  .faq__plus::after {
    top: 0;
    left: 8px;
    width: 2px;
    height: 18px;
  }

  .faq__item[open] .faq__plus::after {
    opacity: 0;
    transform: rotate(90deg);
  }

  .faq__item p {
    margin: 0;
    padding: 0 0 1.4rem;
    color: rgba(224, 255, 224, 0.8);
    line-height: 1.75;
  }

  /* ── 9. Final CTA ── */
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
    background: radial-gradient(circle at bottom, rgba(0, 255, 140, 0.18), rgba(0, 0, 0, 0.95) 60%);
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

  .calendly-embed {
    max-width: 680px;
    margin: 0 auto 2.4rem;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(0, 229, 255, 0.18);
    box-shadow: 0 0 40px rgba(0, 229, 255, 0.1);
  }

  .calendly-embed iframe {
    display: block;
    width: 100%;
    height: 680px;
    border: 0;
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

  /* ── "While you slept" timeline strip (§5b item 1) ── */
  .timeline {
    text-align: center;
    padding-top: 3.5rem;
    padding-bottom: 3.5rem;
  }

  .timeline__head {
    font-family: "Share Tech Mono", ui-monospace, monospace;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    font-size: 0.8rem;
    color: #00e5ff;
    margin: 0 0 2rem;
  }

  .timeline__track {
    list-style: none;
    margin: 0 auto;
    padding: 0;
    max-width: 960px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    position: relative;
  }

  /* Connecting line behind the nodes */
  .timeline__track::before {
    content: "";
    position: absolute;
    top: 7px;
    left: 12.5%;
    right: 12.5%;
    height: 1px;
    background: linear-gradient(90deg, rgba(0, 229, 255, 0.15), rgba(0, 229, 255, 0.5), rgba(0, 229, 255, 0.15));
  }

  .timeline__step {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding-top: 1.4rem;
  }

  .timeline__step::before {
    content: "";
    position: absolute;
    top: 0;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #00e5ff;
    box-shadow: 0 0 12px rgba(0, 229, 255, 0.6);
  }

  .timeline__time {
    font-family: "Share Tech Mono", ui-monospace, monospace;
    font-size: 0.95rem;
    color: #ffffff;
  }

  .timeline__label {
    font-size: 0.85rem;
    color: rgba(224, 255, 224, 0.7);
    line-height: 1.3;
    max-width: 14ch;
  }

  .timeline__stat {
    margin: 2.6rem auto 0;
    max-width: 620px;
    font-size: 1.05rem;
    line-height: 1.6;
    color: rgba(224, 255, 224, 0.82);
  }

  .timeline__stat strong {
    color: #ffffff;
    text-shadow: 0 0 12px rgba(0, 229, 255, 0.4);
  }

  /* ── "What it never does" boundaries (§5b item 3) ── */
  .boundaries {
    text-align: center;
  }

  .boundaries__head {
    margin: 0 0 2rem;
  }

  .boundaries__list {
    list-style: none;
    margin: 0 auto;
    padding: 0;
    max-width: 900px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.4rem;
  }

  .boundaries__list li {
    padding: 1.6rem 1.4rem;
    border: 1px solid rgba(0, 229, 255, 0.16);
    border-radius: 14px;
    background: rgba(0, 229, 255, 0.04);
    font-size: 1rem;
    line-height: 1.5;
    color: rgba(224, 255, 224, 0.9);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .timeline__track {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.6rem 1rem;
    }
    .timeline__track::before { display: none; }

    .boundaries__list {
      grid-template-columns: 1fr;
      max-width: 460px;
    }

    .ahero__inner {
      grid-template-columns: 1fr;
      grid-template-areas:
        "copy"
        "demo"
        "actions";
      row-gap: 2rem;
      justify-items: center;
      text-align: center;
    }

    .lead { margin-inline: auto; }

    .ahero__cta { justify-content: center; }

    .problem__grid,
    .industries__grid,
    .how__grid,
    .proof__grid {
      grid-template-columns: 1fr;
    }

    .agent {
      grid-template-columns: 1fr;
      gap: 1.8rem;
      padding: 2rem 1.6rem;
    }

    .agent__visual {
      padding: 1.5rem;
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
