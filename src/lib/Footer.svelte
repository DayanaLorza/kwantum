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
        <a href="/#services">Services</a>
        <a href="/ai-agents">AI Employees</a>
        <a href="/ai-audit">AI Audit</a>
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
  .site-footer { border-top: 1px solid rgba(224, 255, 224, .14); background: #050805; }
  .site-footer__inner { max-width: 1280px; margin: 0 auto; padding: 5rem 7vw 4rem; display: grid; grid-template-columns: 1.2fr 1fr; gap: 4rem; align-items: start; }
  .footer__logo { color: var(--text); text-decoration: none; font: 700 1.15rem/1 "Share Tech Mono", monospace; letter-spacing: .12em; }
  .footer__logo span { color: var(--primary); font-weight: 400; }
  .footer__brand p { max-width: 290px; margin: 1.25rem 0 1.5rem; color: rgba(224,255,224,.62); line-height: 1.7; font-size: .9rem; }
  .footer__email, .footer__nav a { color: rgba(224,255,224,.78); text-decoration: none; transition: color .2s ease; }
  .footer__email:hover, .footer__nav a:hover { color: var(--primary); }
  .footer__nav { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
  .footer__nav h3 { margin: 0 0 1rem; color: rgba(224,255,224,.4); text-transform: uppercase; letter-spacing: .14em; font: .68rem "Share Tech Mono", monospace; }
  .footer__nav a { display: block; margin: .7rem 0; font-size: .9rem; }
  .footer__base { max-width: 1280px; margin: 0 auto; padding: 1.25rem 7vw; display: flex; justify-content: space-between; gap: 1rem; border-top: 1px solid rgba(224,255,224,.1); color: rgba(224,255,224,.4); font: .72rem "Share Tech Mono", monospace; }
  .footer__base b { color: var(--primary); }
  @media (max-width: 800px) { .site-footer__inner { grid-template-columns: 1fr; gap: 3rem; } }
  @media (max-width: 520px) { .footer__base { flex-direction: column; } }
</style>
