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

  let open = false;
  const close = () => (open = false);

  // Close the mobile menu whenever the route changes
  $: currentPath = $page.url.pathname;
  $: if (currentPath) open = false;
</script>

<svelte:window on:keydown={(e) => e.key === "Escape" && close()} />

<header class="site-header">
  <div class="site-header__inner">
    <a class="logo" href="/" aria-label="Kwantum Tech home" on:click={close}>
      <img class="logo__mark" src={mark} alt="" width="36" height="36" />
      <Logo size={36} />
    </a>

    <nav class="site-nav" aria-label="Primary">
      {#each links as link}
        <a
          class="site-nav__link"
          class:site-nav__link--active={currentPath === link.href}
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
      on:click={() => (open = !open)}
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
          href={link.href}
          on:click={close}
        >
          {link.label}
        </a>
      {/each}
      <a
        class="mobile-nav__cta"
        href={calendly}
        target="_blank"
        rel="noopener"
        on:click={close}
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
    display: block;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }

  .site-nav {
    display: flex;
    align-items: center;
    gap: 1.6rem;
  }

  .site-nav__link {
    color: rgba(224, 255, 224, 0.8);
    text-decoration: none;
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    transition: color 0.2s ease, text-shadow 0.2s ease;
  }

  .site-nav__link:hover {
    color: var(--primary);
  }

  .site-nav__link--active {
    color: var(--primary);
    text-shadow: 0 0 8px rgba(0, 255, 65, 0.5);
  }

  .site-nav__cta {
    padding: 0.55rem 1.2rem;
    border-radius: 999px;
    border: 1px solid var(--primary);
    color: var(--primary);
    text-decoration: none;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    white-space: nowrap;
    transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  }

  .site-nav__cta:hover {
    background: var(--primary);
    color: #000000;
    box-shadow: 0 0 16px rgba(0, 255, 65, 0.4);
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
    border: 1px solid rgba(0, 255, 65, 0.35);
    border-radius: 10px;
    cursor: pointer;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .nav-toggle:hover {
    border-color: var(--primary);
    box-shadow: 0 0 12px rgba(0, 255, 65, 0.3);
  }

  .nav-toggle span {
    display: block;
    height: 2px;
    width: 100%;
    background: var(--primary);
    border-radius: 2px;
    transition: transform 0.25s ease, opacity 0.2s ease;
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
    padding: 0.6rem 6vw 1.4rem;
    background: rgba(0, 0, 0, 0.96);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(0, 255, 65, 0.25);
    animation: menu-in 0.22s ease;
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
    color: rgba(224, 255, 224, 0.85);
    text-decoration: none;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  }

  .mobile-nav__link--active {
    color: var(--primary);
    text-shadow: 0 0 8px rgba(0, 255, 65, 0.5);
  }

  .mobile-nav__cta {
    margin-top: 1.2rem;
    padding: 0.85rem 1.2rem;
    text-align: center;
    border-radius: 999px;
    border: 1px solid var(--primary);
    color: var(--primary);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.06em;
  }

  .mobile-nav__cta:active {
    background: var(--primary);
    color: #000000;
  }

  /* ── Breakpoint: swap inline nav for hamburger ── */
  @media (max-width: 768px) {
    .site-header__inner {
      padding: 0.9rem 5vw;
      gap: 0.75rem;
    }

    .logo {
      gap: 0.6rem;
    }

    .logo__mark {
      width: 30px;
      height: 30px;
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
