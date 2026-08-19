<script>
  import Logo from "$lib/Logo.svelte";
  import mark from "$lib/assets/logo/kwantum-mark.svg";
  import { page } from "$app/stores";

  const calendly = "https://calendly.com/kwantumconsulting/30min";

  const links = [
    { href: "/", label: "Home" },
    { href: "/ai-audit", label: "AI Audit" },
    { href: "/web-apps", label: "Web Apps" },
    { href: "/ai-agents", label: "AI Employees" },
    { href: "/contact", label: "Contact" },
  ];

  let open = $state(false);
  const close = () => (open = false);

  // Close the mobile menu whenever the route changes
  let currentPath = $derived($page.url.pathname);
  $effect(() => {
    if (currentPath) open = false;
  });
</script>

<svelte:window onkeydown={(e) => e.key === "Escape" && close()} />

<header class="site-header">
  <div class="site-header__inner">
    <a class="logo" href="/" aria-label="Kwantum Tech home" onclick={close}>
      <img class="logo__mark" src={mark} alt="" width="32" height="32" />
      <Logo size={20} />
    </a>

    <nav class="site-nav" aria-label="Primary">
      {#each links as link}
        <a
          class="site-nav__link"
          class:site-nav__link--active={currentPath === link.href}
          aria-current={currentPath === link.href ? "page" : undefined}
          href={link.href}
        >
          {link.label}
        </a>
      {/each}
      <a class="site-nav__cta" href={calendly} target="_blank" rel="noopener">
        Book a Call
      </a>
    </nav>

    <button
      class="nav-toggle"
      class:nav-toggle--open={open}
      aria-expanded={open}
      aria-controls="mobile-nav"
      aria-label={open ? "Close menu" : "Open menu"}
      onclick={() => (open = !open)}
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  </div>

  {#if open}
    <nav id="mobile-nav" class="mobile-nav" aria-label="Mobile">
      {#each links as link}
        <a
          class="mobile-nav__link"
          class:mobile-nav__link--active={currentPath === link.href}
          aria-current={currentPath === link.href ? "page" : undefined}
          href={link.href}
          onclick={close}
        >
          {link.label}
        </a>
      {/each}
      <a
        class="mobile-nav__cta"
        href={calendly}
        target="_blank"
        rel="noopener"
        onclick={close}
      >
        Book a Call
      </a>
    </nav>
  {/if}
</header>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 20;
    background: rgb(0 0 0 / 0.78);
    backdrop-filter: blur(18px) saturate(1.4);
    -webkit-backdrop-filter: blur(18px) saturate(1.4);
    border-bottom: 1px solid var(--line);
  }

  @supports not (backdrop-filter: blur(1px)) {
    .site-header {
      background: rgb(0 0 0 / 0.96);
    }
  }

  .site-header__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1360px;
    margin: 0 auto;
    padding: 1.1rem var(--gutter);
    gap: 2rem;
  }

  .logo {
    display: inline-flex;
    align-items: center;
    gap: 0.7rem;
    text-decoration: none;
  }

  .logo__mark {
    display: block;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .site-nav {
    display: flex;
    align-items: center;
    gap: 1.9rem;
  }

  .site-nav__link {
    position: relative;
    color: var(--text-dim);
    text-decoration: none;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    padding: 0.35rem 0;
    transition: color var(--dur-micro) var(--ease-out);
  }

  /* hover rule draws in from the left over the static baseline */
  .site-nav__link::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    height: 1px;
    width: 100%;
    background: var(--green);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform var(--dur-micro) var(--ease-out);
  }

  .site-nav__link:hover {
    color: var(--text);
  }

  .site-nav__link:hover::after,
  .site-nav__link--active::after {
    transform: scaleX(1);
  }

  .site-nav__link--active {
    color: var(--green);
  }

  .site-nav__cta {
    padding: 0.55rem 1.25rem;
    border-radius: 999px;
    border: 1px solid var(--line-green);
    color: var(--green);
    text-decoration: none;
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    white-space: nowrap;
    transition: background var(--dur-micro) var(--ease-out),
                color var(--dur-micro) var(--ease-out),
                border-color var(--dur-micro) var(--ease-out);
  }

  .site-nav__cta:hover {
    background: var(--green);
    border-color: var(--green);
    color: var(--black);
  }

  /* ── Hamburger toggle (mobile only) ── */
  .nav-toggle {
    display: none;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    width: 44px;
    height: 44px;
    padding: 10px;
    background: transparent;
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    cursor: pointer;
    transition: border-color var(--dur-micro) var(--ease-out);
  }

  .nav-toggle:hover {
    border-color: var(--green);
  }

  .nav-toggle span {
    display: block;
    height: 2px;
    width: 100%;
    background: var(--green);
    border-radius: 2px;
    transition: transform 0.25s var(--ease-out), opacity 0.2s var(--ease-out);
    transform-origin: center;
  }

  .nav-toggle--open span:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
  }

  .nav-toggle--open span:nth-child(2) {
    opacity: 0;
  }

  .nav-toggle--open span:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
  }

  /* ── Mobile dropdown panel ── */
  .mobile-nav {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    padding: 0.6rem var(--gutter) 1.4rem;
    background: rgb(0 0 0 / 0.97);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border-bottom: 1px solid var(--line-green);
    animation: menu-in 0.22s var(--ease-out);
  }

  @keyframes menu-in {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .mobile-nav__link {
    padding: 1rem 0.2rem;
    color: var(--text);
    text-decoration: none;
    font-family: var(--font-mono);
    font-size: 0.92rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    border-bottom: 1px solid var(--line);
  }

  .mobile-nav__link--active {
    color: var(--green);
  }

  .mobile-nav__cta {
    margin-top: 1.2rem;
    padding: 0.9rem 1.2rem;
    text-align: center;
    border-radius: 999px;
    background: var(--green);
    color: var(--black);
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  /* ── Breakpoint: swap inline nav for hamburger ── */
  @media (max-width: 820px) {
    .site-header__inner {
      padding-top: 0.8rem;
      padding-bottom: 0.8rem;
      gap: 0.75rem;
    }

    .logo__mark {
      width: 28px;
      height: 28px;
    }

    .site-nav {
      display: none;
    }

    .nav-toggle {
      display: inline-flex;
    }

    .mobile-nav {
      display: flex;
    }
  }
</style>
