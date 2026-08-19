<footer class="site-footer">
  <div class="site-footer__inner">
    <div class="footer__brand">
      <a class="footer__logo" href="/" aria-label="Kwantum Tech home">KWANTUM <span>TECH</span></a>
      <p>Premium software engineering, AI employees, and secure digital systems for high-performance teams.</p>
    </div>

    <nav class="footer__nav" aria-label="Footer navigation">
      <div>
        <h3>Explore</h3>
        <a href="/">Home</a>
        <a href="/apps">Apps</a>
        <a href="/ai-agents">AI Employees</a>
        <a href="/audit">AI Audit</a>
      </div>
      <div>
        <h3>Connect</h3>
        <a href="/contact">Contact</a>
        <a href="https://calendly.com/kwantumconsulting/30min" target="_blank" rel="noopener">Book a strategy call</a>
      </div>
    </nav>
  </div>

  <div class="footer__base">
    <span>© 2026 Kwantum Consulting LLC. All rights reserved.</span>
    <span>Built for ambitious teams <b aria-hidden="true">✦</b></span>
  </div>
</footer>

<style>
  .site-footer {
    border-top: 1px solid var(--line);
    background: var(--tone-panel);
  }

  .site-footer__inner {
    max-width: 1360px;
    margin: 0 auto;
    padding: var(--sp-6) var(--gutter) var(--sp-5);
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: var(--sp-5);
    align-items: start;
  }

  .footer__logo {
    color: var(--text);
    text-decoration: none;
    font: 400 1.05rem/1 var(--font-mono);
    letter-spacing: 0.12em;
  }

  .footer__logo span {
    color: var(--green);
  }

  .footer__brand p {
    max-width: 300px;
    margin: 1.25rem 0 0;
    color: var(--text-dim);
    line-height: 1.7;
    font-size: var(--text-sm);
  }

  .footer__nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--sp-4);
  }

  .footer__nav h3 {
    margin: 0 0 1rem;
    color: var(--text-faint);
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font: 400 var(--text-xs) var(--font-mono);
  }

  .footer__nav a {
    display: block;
    width: fit-content;
    margin: 0.7rem 0;
    font-size: var(--text-sm);
    color: var(--text-dim);
    text-decoration: none;
    transition: color var(--dur-micro) var(--ease-out);
  }

  .footer__nav a:hover {
    color: var(--green);
  }

  .footer__base {
    max-width: 1360px;
    margin: 0 auto;
    padding: 1.25rem var(--gutter);
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    border-top: 1px solid var(--line);
    color: var(--text-faint);
    font: 400 var(--text-xs) var(--font-mono);
    letter-spacing: 0.04em;
  }

  .footer__base b {
    color: var(--green);
  }

  @media (max-width: 800px) {
    .site-footer__inner {
      grid-template-columns: 1fr;
      gap: var(--sp-4);
    }
  }

  @media (max-width: 520px) {
    .footer__base {
      flex-direction: column;
    }
  }
</style>
