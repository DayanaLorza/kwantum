<script>
  import { onMount } from "svelte";
  import { env as publicEnv } from "$env/dynamic/public";
  import NeuralField from "$lib/NeuralField.svelte";
  import Seo from "$lib/Seo.svelte";
  import { breadcrumbSchema } from "$lib/seo/schema.js";

  const calendly = "https://calendly.com/kwantumconsulting/30min";
  const turnstileSiteKey = publicEnv.PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAEDANq2D1RelwMWJ";

  let inquirySuccess = false;
  let inquiryError = "";
  let inquirySending = false;
  let inquiryStartedAt = 0;

  let turnstileEl;
  let turnstileWidgetId;
  let turnstileToken = "";

  onMount(() => {
    inquiryStartedAt = Date.now();
    if (!turnstileSiteKey) return;

    const renderWidget = () => {
      if (!window.turnstile || !turnstileEl || turnstileWidgetId !== undefined) return;
      turnstileWidgetId = window.turnstile.render(turnstileEl, {
        sitekey: turnstileSiteKey,
        theme: "dark",
        callback: (token) => { turnstileToken = token; },
        "expired-callback": () => { turnstileToken = ""; },
        "error-callback": () => { turnstileToken = ""; }
      });
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }

    let script = document.querySelector("script[data-turnstile]");
    if (!script) {
      script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.dataset.turnstile = "true";
      document.head.appendChild(script);
    }
    script.addEventListener("load", renderWidget);
  });

  async function handleInquirySubmit(event) {
    const form = event.target;
    const data = new FormData(form);
    data.set("contactStartedAt", String(inquiryStartedAt));
    inquirySuccess = false;
    inquiryError = "";

    if (turnstileSiteKey) {
      if (!turnstileToken) {
        inquiryError = "Please complete the verification below and try again.";
        return;
      }
      data.set("cf-turnstile-response", turnstileToken);
    }

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
      setTimeout(() => { inquirySuccess = false; }, 8000);
    } catch (error) {
      inquiryError = error.message || "Message failed to send.";
    } finally {
      inquirySending = false;
      turnstileToken = "";
      if (turnstileSiteKey && window.turnstile && turnstileWidgetId !== undefined) {
        window.turnstile.reset(turnstileWidgetId);
      }
    }
  }
</script>

<Seo
  title="Contact Kwantum Tech | Custom Software & AI"
  description="Get in touch to build custom software, AI employees, or automation. Tell us what to automate."
  keywords={[
    "contact Kwantum Tech",
    "hire AI employees",
    "custom software quote",
    "AI automation consultation",
    "software development inquiry",
  ]}
  schema={breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ])}
/>

<main class="contact">
  <div class="contact__backdrop" aria-hidden="true">
    <NeuralField />
  </div>

  <section class="contact__inner">
    <header class="contact__head reveal">
      <p class="eyebrow">Kwantum Tech · Contact</p>
      <h1>Let's build something exceptional.</h1>
      <p class="lead">
        Custom web and mobile apps, AI that works like an employee, performance
        overhauls, and private, secure tools — built around your business. Tell us
        what you're trying to achieve, and we'll show you what's possible. No
        pressure, no jargon.
      </p>
    </header>

    <div class="contact__grid">
      <!-- Info column -->
      <aside class="info reveal reveal--1">
        <div class="info__block">
          <h2>Prefer to talk it through?</h2>
          <p>
            Book a free 30-minute strategy call. We'll map your workflows and pinpoint
            the highest-impact place to put an AI employee to work.
          </p>
          <a class="btn btn--solid" href={calendly} target="_blank" rel="noopener">
            Book a Free Strategy Call
          </a>
        </div>

        <ul class="info__points">
          <li>
            <span class="info__check" aria-hidden="true"></span>
            We reply within 24 hours, every time.
          </li>
          <li>
            <span class="info__check" aria-hidden="true"></span>
            No obligation, no hard sell — just a clear plan.
          </li>
          <li>
            <span class="info__check" aria-hidden="true"></span>
            Built for SMBs and startups, not enterprise red tape.
          </li>
        </ul>
      </aside>

      <!-- Form column -->
      <div class="form-card reveal reveal--2">
          <form class="inquiry-form" method="POST" action="/api/contact" on:submit|preventDefault={handleInquirySubmit}>
            <div class="inquiry-form__trap" aria-hidden="true">
              <label for="contact-website">Website</label>
              <input id="contact-website" type="text" name="website" tabindex="-1" autocomplete="off" />
            </div>

          <div class="inquiry-form__row">
            <div class="inquiry-form__field">
              <label for="contact-name">Name</label>
              <input id="contact-name" type="text" name="name" placeholder="Your name" required />
            </div>
            <div class="inquiry-form__field">
              <label for="contact-company">Business</label>
              <input id="contact-company" type="text" name="company" placeholder="Business name" />
            </div>
          </div>

          <div class="inquiry-form__field">
            <label for="contact-email">Email</label>
            <input id="contact-email" type="email" name="email" placeholder="you@business.com" required />
          </div>

          <div class="inquiry-form__row">
            <div class="inquiry-form__field">
              <label for="contact-service">What do you need?</label>
              <select id="contact-service" name="service">
                <option value="" disabled selected>Select an option</option>
                <option value="web-mobile">Custom web & mobile app</option>
                <option value="ai-customization">AI customization / AI employee</option>
                <option value="ai-audit">AI audit</option>
                <option value="secure-tools">Private & secure tools</option>
                <option value="performance">Performance overhaul</option>
                <option value="not-sure">Not sure yet</option>
              </select>
            </div>
            <div class="inquiry-form__field">
              <label for="contact-budget">Estimated budget</label>
              <select id="contact-budget" name="budget">
                <option value="" disabled selected>Select a range</option>
                <option value="under-5k">Under $5,000</option>
                <option value="5k-15k">$5,000 – $15,000</option>
                <option value="15k-50k">$15,000 – $50,000</option>
                <option value="50k+">$50,000+</option>
                <option value="not-sure">Not sure yet</option>
              </select>
            </div>
          </div>

          <div class="inquiry-form__field">
            <label for="contact-message">What would you love to automate?</label>
            <textarea id="contact-message" name="message" rows="4" placeholder="Tell us about your business, where your team loses time, and what a win looks like..." required></textarea>
          </div>

          {#if turnstileSiteKey}
            <div class="cf-turnstile inquiry-form__turnstile" data-action="turnstile-spin-v2" bind:this={turnstileEl}></div>
          {/if}

          <button type="submit" class="btn btn--solid inquiry-form__submit" disabled={inquirySending}>
            {inquirySending ? "Sending..." : "Send Message"}
          </button>

          {#if inquirySuccess}
            <p class="inquiry-form__success">Got it — we'll be in touch within 24 hours.</p>
          {/if}
          {#if inquiryError}
            <p class="inquiry-form__error">{inquiryError}</p>
          {/if}
        </form>
      </div>
    </div>
  </section>
</main>

<style>
  .contact {
    position: relative;
    min-height: calc(100vh - 70px);
    padding: 5rem 7vw 6rem;
    overflow: hidden;
    background: radial-gradient(circle at top, rgba(0, 255, 65, 0.16) 0%, transparent 55%);
  }

  .contact__backdrop {
    position: absolute;
    inset: 0;
    opacity: 0.6;
    z-index: 0;
  }

  .contact__inner {
    position: relative;
    z-index: 1;
    max-width: 1100px;
    margin: 0 auto;
  }

  .contact__head {
    max-width: 680px;
    margin: 0 auto 3.5rem;
    text-align: center;
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
    font-size: clamp(2.2rem, 3vw + 1rem, 3.4rem);
    line-height: 1.08;
    letter-spacing: -0.03em;
    margin: 0 0 1.2rem;
    color: #ffffff;
    text-shadow: 0 0 14px rgba(0, 255, 65, 0.45);
  }

  .lead {
    font-size: clamp(1.02rem, 0.5vw + 0.9rem, 1.2rem);
    line-height: 1.65;
    color: rgba(224, 255, 224, 0.85);
    margin: 0;
  }

  .contact__grid {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: 2rem;
    align-items: start;
  }

  /* Info column */
  .info {
    display: grid;
    gap: 2rem;
    padding: 2.2rem;
    border-radius: 22px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(6px);
  }

  .info h2 {
    font-size: 1.4rem;
    margin: 0 0 0.7rem;
    color: #ffffff;
  }

  .info h3 {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--primary);
    margin: 0 0 0.5rem;
  }

  .info p {
    color: rgba(224, 255, 224, 0.78);
    line-height: 1.65;
    margin: 0 0 1.3rem;
  }

  .info__points {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.9rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 1.6rem;
  }

  .info__points li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    color: rgba(224, 255, 224, 0.82);
    line-height: 1.5;
    font-size: 0.95rem;
  }

  .info__check {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    margin-top: 0.15rem;
    border-radius: 50%;
    border: 1px solid var(--primary);
    background: rgba(0, 255, 65, 0.12);
    position: relative;
  }

  .info__check::after {
    content: "";
    position: absolute;
    left: 5px;
    top: 2px;
    width: 5px;
    height: 9px;
    border: solid var(--primary);
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  /* Form card */
  .form-card {
    padding: 2.2rem;
    border-radius: 22px;
    border: 1px solid rgba(0, 255, 65, 0.22);
    background: rgba(0, 0, 0, 0.62);
    backdrop-filter: blur(6px);
    box-shadow: 0 0 40px rgba(0, 255, 65, 0.08);
  }

  .inquiry-form {
    display: grid;
    gap: 1.1rem;
  }

  .inquiry-form__trap {
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  .inquiry-form__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.1rem;
  }

  .inquiry-form__field {
    display: grid;
    gap: 0.4rem;
  }

  .inquiry-form__field label {
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--primary);
    font-weight: 600;
  }

  .inquiry-form__field input,
  .inquiry-form__field select,
  .inquiry-form__field textarea {
    background: rgba(0, 255, 65, 0.06);
    border: 1px solid rgba(0, 255, 65, 0.3);
    border-radius: 10px;
    padding: 0.78rem 1rem;
    color: var(--text);
    font-family: inherit;
    font-size: 0.95rem;
    outline: none;
    width: 100%;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .inquiry-form__field select {
    appearance: none;
    cursor: pointer;
    background-image: linear-gradient(45deg, transparent 50%, var(--primary) 50%),
      linear-gradient(135deg, var(--primary) 50%, transparent 50%);
    background-position: calc(100% - 18px) center, calc(100% - 13px) center;
    background-size: 5px 5px, 5px 5px;
    background-repeat: no-repeat;
    padding-right: 2.4rem;
  }

  .inquiry-form__field option {
    background: #000000;
    color: var(--text);
  }

  .inquiry-form__field input::placeholder,
  .inquiry-form__field textarea::placeholder {
    color: rgba(224, 255, 224, 0.4);
  }

  .inquiry-form__field input:focus,
  .inquiry-form__field select:focus,
  .inquiry-form__field textarea:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(0, 255, 65, 0.15);
  }

  .inquiry-form__field textarea {
    resize: vertical;
    min-height: 110px;
  }

  .inquiry-form__turnstile {
    min-height: 65px;
    padding: 10px 0;
  }

  .inquiry-form__success {
    color: var(--primary);
    font-weight: 600;
    margin: 0;
  }

  .inquiry-form__error {
    color: #ff7a7a;
    font-weight: 600;
    margin: 0;
  }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.85rem 1.8rem;
    border-radius: 999px;
    border: 1px solid transparent;
    text-decoration: none;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    font-size: 0.9rem;
    cursor: pointer;
    font-family: inherit;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }

  .btn--solid {
    background: var(--primary);
    color: #000000;
    border-color: var(--primary);
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
    transform: none;
  }

  .inquiry-form__submit {
    width: fit-content;
    justify-self: start;
    align-self: start;
    padding: 0.78rem 1.5rem;
    margin-top: 0.3rem;
    background: var(--primary);
    color: #000000;
    border: 1px solid var(--primary);
    border-radius: 999px;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    box-shadow: 0 0 0 3px rgba(0, 255, 65, 0.08);
  }

  .inquiry-form__submit:hover {
    background: var(--secondary);
    border-color: var(--secondary);
    box-shadow: 0 0 22px rgba(0, 255, 65, 0.45);
    transform: translateY(-2px);
  }

  /* Subtle entrance animations */
  .reveal {
    animation: reveal-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .reveal--1 {
    animation-delay: 0.12s;
  }

  .reveal--2 {
    animation-delay: 0.22s;
  }

  @keyframes reveal-up {
    from {
      opacity: 0;
      transform: translateY(24px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 860px) {
    .contact__grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .contact {
      padding: 3.5rem 6vw 4.5rem;
    }

    .inquiry-form__row {
      grid-template-columns: 1fr;
    }

    .info,
    .form-card {
      padding: 1.7rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .reveal {
      animation: none;
    }
  }
</style>
