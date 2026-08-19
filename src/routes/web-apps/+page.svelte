<script>
  import { onMount } from "svelte";
  import { env as publicEnv } from "$env/dynamic/public";
  import gsap from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  import Turnstile from "$lib/Turnstile.svelte";
  import Seo from "$lib/Seo.svelte";
  import {
    webAppsServiceSchema,
    breadcrumbSchema,
    faqSchema,
  } from "$lib/seo/schema.js";

  const faqs = [
    {
      question: "What does a build cost?",
      answer:
        "Every build is fixed-priced from the written scope. Most Release 1 builds start around $7,500. If the problem doesn't justify that yet, an Automation Sprint (about half) or the AI Audit is the right first step — either credits toward a future build.",
    },
    {
      question: "How is 30 days possible?",
      answer:
        "Release 1 is deliberately scoped: the production-ready core, not every feature you'll ever want. A senior engineering team on a modern component stack, with AI-assisted development — no handoffs, no bloated agency process.",
    },
    {
      question: "Do I really own the code?",
      answer:
        "Yes — the repository, the documentation, and every credential are yours at Release 1. Host it anywhere and extend it with any engineer you choose: no lock-in, no dependency on us. That said, most clients bring us back for Release 2.",
    },
    {
      question: "What's the tech stack?",
      answer:
        "Modern, and boring where it counts: proven JavaScript frameworks (React, Svelte, Vue), Node on the back, deployed on infrastructure you control. Chosen for how easily the next engineer can work on it.",
    },
    {
      question: "What happens on the scoping call?",
      answer:
        "Thirty minutes. You describe how the business runs; we ask enough engineering questions to write the scope. You get the written scope and fixed price either way.",
    },
  ];

  const calendly = "https://calendly.com/kwantumconsulting/30min";

  /* ── Demo app state ─────────────────────────────────────────── */
  let activeTab = "dash";
  let showHandoff = false;
  let toastOn = false;
  let toastText = "Reminder sent to Hendricks Plumbing";
  let feedItems = [];
  let feedSeq = 0;
  let userDrove = false;
  let userTimer;

  const FEED = [
    { kind: "AUTO", text: "Invoice #1042 chased — 2nd reminder to Bayline", t: "now" },
    { kind: "AUTO", text: "New lead from web form → replied in 40s", t: "2m" },
    { kind: "HUMAN", text: "Dana approved quote #Q-118", t: "9m" },
    { kind: "AUTO", text: "Job #2214 scheduled → Team B notified", t: "14m" },
    { kind: "AUTO", text: "Review request sent — job #2212 complete", t: "22m" },
    { kind: "AUTO", text: "Payment received $1,850 — receipt emailed", t: "31m" },
    { kind: "HUMAN", text: "Note added to Kessler & Co file", t: "44m" },
    { kind: "AUTO", text: "Tomorrow's route sent to all crews", t: "1h" },
  ];
  const TOASTS = [
    "Reminder sent to Hendricks Plumbing",
    "Invoice #1042 — payment link re-sent",
    "New lead qualified → call booked",
    "Crew B confirmed for 8:00 AM",
  ];

  function pushFeed() {
    const src = FEED[feedSeq % FEED.length];
    feedItems = [{ ...src, id: feedSeq }, ...feedItems].slice(0, 6);
    feedSeq += 1;
  }

  function setTab(name, fromUser = false) {
    if (fromUser) {
      userDrove = true;
      clearTimeout(userTimer);
      userTimer = setTimeout(() => (userDrove = false), 6000);
    }
    activeTab = name;
  }

  function setDemoState(state) {
    if (userDrove) return;
    showHandoff = state === "handoff";
    if (state === "dash" || state === "auto") activeTab = "dash";
    else if (state === "inv") activeTab = "inv";
    else if (state === "jobs") activeTab = "jobs";
  }

  /* ── Contact form (same engine as /ai-audit) ────────────────── */
  let inquirySuccess = false;
  let inquiryError = "";
  let inquirySending = false;
  let inquiryStartedAt = 0;
  const turnstileSiteKey = publicEnv.PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAEDANq2D1RelwMWJ";
  let turnstileToken = "";

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
      const response = await fetch("/api/contact", { method: "POST", body: data });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || "Message failed to send.");
      }
      inquirySuccess = true;
      form.reset();
      setTimeout(() => (inquirySuccess = false), 6000);
    } catch (error) {
      inquiryError = error.message || "Message failed to send.";
    } finally {
      inquirySending = false;
      turnstileToken = "";
    }
  }

  /* ── Refs for scroll choreography ───────────────────────────── */
  let heroDock;   // .appwrap in the hero
  let walkDock;   // .walk__sticky in the walkthrough
  let browserEl;  // the browser-framed app
  let walkEl;

  onMount(() => {
    inquiryStartedAt = Date.now();

    /* Demo engine */
    for (let i = 0; i < 5; i++) pushFeed();
    const feedInt = setInterval(pushFeed, 3400);
    let toastIdx = 0;
    const fireToast = () => {
      toastText = TOASTS[toastIdx++ % TOASTS.length];
      toastOn = true;
      setTimeout(() => (toastOn = false), 2600);
    };
    const toastInt = setInterval(fireToast, 7000);
    const toastKick = setTimeout(fireToast, 1600);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 980px)").matches;
    const specEls = [...document.querySelectorAll("[data-spec]")];
    let cleanupMotion = () => {};

    /* Mobile: simple static page — no scroll choreography, app stays in the
       hero, everything visible via CSS. The demo app itself keeps running. */
    if (isMobile) {
      return () => {
        clearInterval(feedInt); clearInterval(toastInt); clearTimeout(toastKick);
        clearTimeout(userTimer);
      };
    }

    if (!reduce) {
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        gsap.from(browserEl, { y: 60, opacity: 0, rotateX: 8, duration: 1.1, ease: "power3.out", delay: 0.15 });
        gsap.from(".hero__copy > *", { y: 26, opacity: 0, stagger: 0.09, duration: 0.8, ease: "power3.out" });

        if (!isMobile) {
          const hero = document.querySelector(".v2hero");
          gsap.set(browserEl, { transformPerspective: 1000, transformOrigin: "center" });
          const rx = gsap.quickTo(browserEl, "rotationX", { duration: 0.7, ease: "power3.out" });
          const ry = gsap.quickTo(browserEl, "rotationY", { duration: 0.7, ease: "power3.out" });
          const onMove = (e) => {
            const b = hero.getBoundingClientRect();
            ry(gsap.utils.interpolate(-7, 7, (e.clientX - b.left) / b.width));
            rx(gsap.utils.interpolate(5, -5, (e.clientY - b.top) / b.height));
          };
          const onLeave = () => { rx(0); ry(0); };
          hero.addEventListener("mousemove", onMove);
          hero.addEventListener("mouseleave", onLeave);
          cleanupMotion = () => {
            hero.removeEventListener("mousemove", onMove);
            hero.removeEventListener("mouseleave", onLeave);
          };
        }

        specEls.forEach((spec) => {
          ScrollTrigger.create({
            trigger: spec, start: "top 78%", end: "bottom 8%",
            onEnter: () => { spec.classList.add("on"); setDemoState(spec.dataset.spec); },
            onEnterBack: () => { spec.classList.add("on"); setDemoState(spec.dataset.spec); },
            onLeave: () => spec.classList.remove("on"),
            onLeaveBack: () => spec.classList.remove("on"),
          });
          gsap.from(spec.querySelector(".spec__rule"), {
            scaleX: 0, duration: 0.8, ease: "power2.out",
            scrollTrigger: { trigger: spec, start: "top 70%" },
          });
        });

        /* Hand the app from the hero to the walkthrough's sticky column with a
           crossfade: fade out in place, re-parent while invisible, fade up in
           the new position. No mid-flight repositioning — no jump. */
        const moveApp = (target) => {
          if (browserEl.parentElement === target) {
            gsap.to(browserEl, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", overwrite: "auto" });
            return;
          }
          gsap.killTweensOf(browserEl);
          gsap.to(browserEl, {
            opacity: 0, y: 12, duration: 0.25, ease: "power2.in", overwrite: "auto",
            onComplete: () => {
              target.appendChild(browserEl);
              gsap.fromTo(
                browserEl,
                { opacity: 0, y: 22 },
                { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }
              );
            },
          });
        };
        ScrollTrigger.create({
          trigger: walkEl, start: "top 72%",
          onEnter: () => moveApp(walkDock),
          onLeaveBack: () => moveApp(heroDock),
        });

        gsap.fromTo("#tlFill", { strokeDasharray: 1000, strokeDashoffset: 1000 },
          { strokeDashoffset: 0, ease: "none",
            scrollTrigger: { trigger: ".tl__track", start: "top 75%", end: "top 25%", scrub: true } });
        gsap.to(".node", { opacity: 1, y: 0, stagger: 0.18, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: ".tl__nodes", start: "top 78%" } });

        gsap.to("#stamp", { opacity: 1, scale: 1, rotate: -8, duration: 0.45, ease: "power4.in",
          scrollTrigger: { trigger: ".stampzone", start: "top 55%" } });

        gsap.utils.toArray(".sheet-head, .door, .note").forEach((el) => {
          gsap.from(el, { opacity: 0, y: 22, duration: 0.6, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" } });
        });
      });

      /* Layout shifts after mount (fonts, Preloader) invalidate ScrollTrigger's
         measured positions — refresh once settled. */
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      const refreshT1 = setTimeout(refresh, 700);
      const refreshT2 = setTimeout(refresh, 2600);

      return () => {
        clearInterval(feedInt); clearInterval(toastInt); clearTimeout(toastKick);
        clearTimeout(userTimer); cleanupMotion();
        window.removeEventListener("load", refresh);
        clearTimeout(refreshT1); clearTimeout(refreshT2);
        ctx.revert();
      };
    }

    /* Reduced motion: all visible, plain scroll listener drives dock + specs */
    document.querySelectorAll(".node").forEach((n) => { n.style.opacity = 1; n.style.transform = "none"; });
    const stampEl = document.getElementById("stamp");
    if (stampEl) { stampEl.style.opacity = 1; stampEl.style.transform = "rotate(-8deg) scale(1)"; }
    const onScroll = () => {
      const walkTop = walkEl.getBoundingClientRect().top;
      if (walkTop < innerHeight * 0.8 && browserEl.parentElement !== walkDock) walkDock.appendChild(browserEl);
      else if (walkTop >= innerHeight * 0.8 && browserEl.parentElement === walkDock) heroDock.appendChild(browserEl);
      let active = null;
      for (const s of specEls) {
        const r = s.getBoundingClientRect();
        const on = r.top < innerHeight * 0.62 && r.bottom > innerHeight * 0.18;
        s.classList.toggle("on", on);
        if (on) active = s.dataset.spec;
      }
      if (active) setDemoState(active);
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      clearInterval(feedInt); clearInterval(toastInt); clearTimeout(toastKick);
      clearTimeout(userTimer); removeEventListener("scroll", onScroll);
    };
  });
</script>

<Seo
  title="Custom Web Apps in 30 Days | Kwantum Tech"
  description="Custom web apps by Kwantum Tech: a written scope, a fixed price, and a working Release 1 in 30 days — automation and AI built in. You own 100% of the code."
  keywords={[
    "custom web app development",
    "custom web application development",
    "custom software for small business",
    "fixed price web app development",
    "custom business application",
    "replace spreadsheets with an app",
    "custom logistics software",
    "web app developer",
    "small business custom software",
    "Kwantum Tech",
  ]}
  schema={[
    webAppsServiceSchema(),
    faqSchema(faqs),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Web Apps", path: "/web-apps" },
    ]),
  ]}
/>

<main class="v2">
  <div class="bp" aria-hidden="true"></div>

  <!-- ══════════ HERO ══════════ -->
  <section class="v2hero">
    <div class="v2hero__inner">
      <div class="hero__copy">
        <p class="hero__eyebrow">Kwantum Tech <span class="sep">·</span> DWG NO. KT-26 <span class="sep">·</span> Web Apps</p>
        <h1>Built to <span class="draw">your spec.</span></h1>
        <p class="hero__lead">
          A custom web app engineered around how your business actually
          runs — <strong>automation inside, live in 30 days</strong>. That's it
          on the right, working. Click around.
        </p>
        <div class="hero__ctas">
          <a class="btn btn--solid" href="#titleblock">Book a Scoping Call</a>
          <a class="btn btn--ghost" href="#walk">View the drawings ↓</a>
        </div>
        <div class="hero__spec">
          <span>Scope in writing</span>
          <span>Fixed price</span>
          <span>Code 100% yours</span>
        </div>
      </div>

      <div class="appwrap" bind:this={heroDock}>
        <div class="browser" bind:this={browserEl}>
          <div class="browser__bar">
            <div class="browser__dots"><i></i><i></i><i></i></div>
            <div class="browser__url">https://<b>ops.atlasfield.com</b>/dashboard</div>
          </div>
          <div class="app">
            <!-- Icon sidebar -->
            <aside class="side">
              <span class="side__avatar">DR<i></i></span>
              <nav class="side__nav" aria-label="Demo app sections">
                <button class="side__item" class:on={activeTab === "dash"} on:click={() => setTab("dash", true)} aria-label="Dashboard">
                  <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1" y="8" width="3.2" height="7" rx="1"/><rect x="6.4" y="4" width="3.2" height="11" rx="1"/><rect x="11.8" y="1" width="3.2" height="14" rx="1"/></svg>
                </button>
                <button class="side__item" class:on={activeTab === "jobs"} on:click={() => setTab("jobs", true)} aria-label="Jobs">
                  <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="4.5" width="13" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5.5 4.5V3.2A1.7 1.7 0 0 1 7.2 1.5h1.6a1.7 1.7 0 0 1 1.7 1.7v1.3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
                </button>
                <button class="side__item" class:on={activeTab === "inv"} on:click={() => setTab("inv", true)} aria-label="Invoices">
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 1.5h7l3 3V14.5H3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M5.5 8h5M5.5 11h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
                </button>
                <span class="side__item side__item--ghost" aria-hidden="true">
                  <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.6v2M8 12.4v2M1.6 8h2M12.4 8h2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M12.5 3.5l-1.4 1.4M4.9 11.1l-1.4 1.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                </span>
              </nav>
              <span class="side__add" aria-hidden="true">+</span>
            </aside>

            <!-- Main -->
            <div class="app__main">
              <div class="toast" class:on={toastOn}><i>AUTO</i><span>{toastText}</span></div>

              <div class="app__bar">
                <h4>{activeTab === "dash" ? "My Dashboard" : activeTab === "jobs" ? "Jobs" : "Invoices"}</h4>
                <span class="app__filter">Filter stats</span>
                <span class="app__squares" aria-hidden="true"><svg viewBox="0 0 14 14"><rect x="1" y="1" width="5" height="5" rx="1.4"/><rect x="8" y="1" width="5" height="5" rx="1.4"/><rect x="1" y="8" width="5" height="5" rx="1.4"/><rect x="8" y="8" width="5" height="5" rx="1.4"/></svg></span>
              </div>

              <div class="app__content">
                {#if activeTab === "dash"}
                  <div class="dash">
                    <div class="dash__left">
                      <section class="widget">
                        <header class="widget__head">
                          <h5>Total revenue</h5>
                          <span class="widget__range">from <b>Feb</b> to <b>Sep</b></span>
                        </header>
                        <div class="chart">
                          <div class="chart__tip">$4,820<i></i></div>
                          <svg class="chart__svg" viewBox="0 0 380 120" preserveAspectRatio="none" aria-hidden="true">
                            <defs>
                              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stop-color="#17b26a" stop-opacity="0.16"/>
                                <stop offset="1" stop-color="#17b26a" stop-opacity="0"/>
                              </linearGradient>
                            </defs>
                            <g class="chart__grid">
                              <line x1="0" y1="18" x2="380" y2="18"/>
                              <line x1="0" y1="50" x2="380" y2="50"/>
                              <line x1="0" y1="82" x2="380" y2="82"/>
                              <line x1="0" y1="114" x2="380" y2="114"/>
                            </g>
                            <path class="chart__ghost" d="M0,84 C34,92 60,64 92,70 C124,76 142,96 176,88 C210,80 228,58 262,64 C296,70 316,86 348,74 C362,69 372,66 380,64" />
                            <path class="chart__fill" d="M0,96 C30,74 56,104 88,90 C120,76 138,44 170,52 C202,60 222,88 254,78 C286,68 304,38 334,44 C352,48 368,36 380,30 L380,120 L0,120 Z" fill="url(#revFill)" stroke="none"/>
                            <path class="chart__line" d="M0,96 C30,74 56,104 88,90 C120,76 138,44 170,52 C202,60 222,88 254,78 C286,68 304,38 334,44 C352,48 368,36 380,30" />
                            <circle class="chart__dot" cx="170" cy="52" r="4.5"/>
                          </svg>
                          <div class="chart__axis">
                            <span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span>
                          </div>
                        </div>
                      </section>

                      <div class="dash__row">
                        <section class="widget">
                          <header class="widget__head">
                            <h5>Live activity</h5>
                            <span class="widget__live"><i></i>LIVE</span>
                          </header>
                          <ul class="feed">
                            {#each feedItems.slice(0, 4) as item (item.id)}
                              <li>
                                <span class="badge" class:badge--h={item.kind === "HUMAN"}>{item.kind}</span>
                                <span class="feed__text">{item.text}</span>
                                <span class="t">{item.t}</span>
                              </li>
                            {/each}
                          </ul>
                        </section>

                        <section class="widget">
                          <header class="widget__head">
                            <h5>Job sources</h5>
                            <span class="widget__range">for <b>August</b></span>
                          </header>
                          <div class="mix">
                            <div class="mix__scale"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div>
                            <div class="mix__bars">
                              <i class="mix__bar" style="width: 81%; background: #4f7cff;"></i>
                              <i class="mix__bar" style="width: 63%; background: #a259ff;"></i>
                              <i class="mix__bar" style="width: 52%; background: #f5b73d;"></i>
                              <i class="mix__bar" style="width: 47%; background: #17b26a;"></i>
                            </div>
                            <ul class="mix__legend">
                              <li><i style="border-color: #4f7cff;"></i>Repeat clients<b>81.4%</b></li>
                              <li><i style="border-color: #a259ff;"></i>Referrals<b>63.2%</b></li>
                              <li><i style="border-color: #f5b73d;"></i>Web form<b>52.9%</b></li>
                              <li><i style="border-color: #17b26a;"></i>Google Ads<b>47.2%</b></li>
                            </ul>
                          </div>
                        </section>
                      </div>
                    </div>

                    <aside class="dash__rail">
                      <div class="railcard">
                        <div class="railcard__head"><span>This month</span><b>August ▾</b></div>
                        <div class="railcard__bars" aria-hidden="true">
                          {#each [8, 13, 10, 16, 11, 15, 19, 12, 9, 15, 12, 18, 14, 20, 11, 16, 13, 21, 15, 18] as h}
                            <i style="height: {h}px;"></i>
                          {/each}
                        </div>
                        <div class="railcard__value">$48,250</div>
                        <div class="railcard__delta">▲ 12% vs July</div>
                      </div>

                      <section class="widget widget--up">
                        <header class="widget__head"><h5>Upcoming</h5><span class="widget__range">View all</span></header>
                        <ul class="up">
                          <li><i class="up__tile" style="background: #eef2ff; color: #4f7cff;">PU</i><div><b>Panel upgrade</b><span>Thu · 9:00 · Team B</span></div></li>
                          <li><i class="up__tile" style="background: #f4ecff; color: #a259ff;">HV</i><div><b>HVAC install</b><span>Fri · 8:30 · Team A</span></div></li>
                          <li><i class="up__tile" style="background: #e8f8f0; color: #0a9e42;">IN</i><div><b>Inspection</b><span>Mon · 11:00 · Team A</span></div></li>
                        </ul>
                      </section>
                    </aside>
                  </div>
                {:else if activeTab === "jobs"}
                  <div class="view">
                    <div class="chips">
                      <span class="chip chip--on">All</span><span class="chip">Active</span><span class="chip">Scheduled</span><span class="chip">Done</span>
                    </div>
                    <table class="tbl">
                      <thead><tr><th>Job</th><th>Client</th><th>Crew</th><th>Value</th><th>Status</th></tr></thead>
                      <tbody>
                        <tr><td>#2214 · Panel upgrade</td><td>Hendricks Plumbing</td><td><i class="crew" style="background: #eef2ff; color: #4f7cff;">TB</i></td><td>$4,200</td><td><span class="pillar p-crew">Crew assigned</span></td></tr>
                        <tr><td>#2213 · HVAC install</td><td>Marisol Realty</td><td><i class="crew" style="background: #fff4e0; color: #b97800;">TA</i></td><td>$6,900</td><td><span class="pillar p-sched">Scheduled</span></td></tr>
                        <tr><td>#2212 · Rewire, Unit 4</td><td>Bayline Property</td><td><i class="crew" style="background: #f4ecff; color: #a259ff;">TC</i></td><td>$3,150</td><td><span class="pillar p-done">Done</span></td></tr>
                        <tr><td>#2211 · Inspection</td><td>Kessler &amp; Co</td><td><i class="crew" style="background: #fff4e0; color: #b97800;">TA</i></td><td>$850</td><td><span class="pillar p-done">Done</span></td></tr>
                        <tr><td>#2210 · Generator swap</td><td>Northgate Dental</td><td><i class="crew" style="background: #eef2ff; color: #4f7cff;">TB</i></td><td>$5,400</td><td><span class="pillar p-done">Done · reviewed ★5</span></td></tr>
                      </tbody>
                    </table>
                  </div>
                {:else}
                  <div class="view">
                    <div class="inv-strip">
                      <div><span>Outstanding</span><b>$8,450</b></div>
                      <div><span>Overdue</span><b class="warn">1</b></div>
                      <div><span>Paid in August</span><b>$21,300</b></div>
                    </div>
                    <table class="tbl">
                      <thead><tr><th>Invoice</th><th>Client</th><th>Amount</th><th>Aging</th><th>Status</th></tr></thead>
                      <tbody>
                        <tr><td>#1042</td><td>Bayline Property</td><td>$3,200</td><td><span class="age age--warn">12d</span></td><td><span class="pillar p-chase">Auto-chasing</span></td></tr>
                        <tr><td>#1043</td><td>Northgate Dental</td><td>$5,250</td><td><span class="age">4d</span></td><td><span class="pillar p-sched">Sent</span></td></tr>
                        <tr><td>#1041</td><td>Kessler &amp; Co</td><td>$1,850</td><td><span class="age">—</span></td><td><span class="pillar p-paid">Paid</span></td></tr>
                        <tr><td>#1040</td><td>Marisol Realty</td><td>$3,400</td><td><span class="age">—</span></td><td><span class="pillar p-paid">Paid · auto-chased</span></td></tr>
                      </tbody>
                    </table>
                  </div>
                {/if}
              </div>

              <div class="handoff" class:on={showHandoff}>
                <b>HANDOFF</b>
                <span><i>✓</i>Repository</span>
                <span><i>✓</i>Documentation</span>
                <span><i>✓</i>Credentials</span>
                <span><i>✓</i>Yours, 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ══════════ SHEET 01 — WALKTHROUGH ══════════ -->
  <section class="walk" id="walk" bind:this={walkEl}>
    <div class="walk__inner">
      <div class="sheet-head">
        <span class="no">SHEET 01</span>
        <h2>Read the drawings.</h2>
        <span class="dim">SCALE 1:1 · AS BUILT</span>
      </div>
      <div class="walk__stage">
        <div class="walk__specs">
          <div class="spec" data-spec="dash">
            <span class="spec__no">SPEC 01 · THE WORKFLOW</span>
            <div class="spec__rule"></div>
            <h3>Built around how the work moves.</h3>
            <p>No template underneath. The screens map to how jobs, clients, and
            money actually flow through your business — because the scope is
            written from your operation, not a feature list.</p>
          </div>
          <div class="spec" data-spec="auto">
            <span class="spec__no">SPEC 02 · AUTOMATION INSIDE</span>
            <div class="spec__rule"></div>
            <h3>The system does the chasing.</h3>
            <p>Follow-ups, reminders, invoice chasing — fired by the app
            and logged in the feed. Watch the AUTO badges land on the right.
            That's the part you never do again.</p>
          </div>
          <div class="spec" data-spec="inv">
            <span class="spec__no">SPEC 03 · THE OWNER'S VIEW</span>
            <div class="spec__rule"></div>
            <h3>Money and work, one screen.</h3>
            <p>Invoices chase themselves and report back. The numbers update
            without anyone compiling a spreadsheet on Sunday night.</p>
          </div>
          <div class="spec" data-spec="handoff">
            <span class="spec__no">SPEC 04 · OWNERSHIP</span>
            <div class="spec__rule"></div>
            <h3>Yours. All of it.</h3>
            <p>Repository, documentation, credentials — handed over at Release 1.
            Host it anywhere, extend it with anyone. No lock-in, no dependency
            on us to keep it running.</p>
          </div>
        </div>
        <div class="walk__appcol">
          <div class="walk__sticky" bind:this={walkDock}></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ══════════ SHEET 02 — 30-DAY LINE ══════════ -->
  <section class="tl">
    <div class="tl__inner">
      <div class="sheet-head">
        <span class="no">SHEET 02</span>
        <h2>The 30-day line.</h2>
        <span class="dim">DIM IN DAYS · NTS</span>
      </div>
      <div class="tl__track">
        <svg class="tl__svg" preserveAspectRatio="none" viewBox="0 0 1000 10">
          <line class="rail" x1="0" y1="5" x2="1000" y2="5"/>
          <line class="fill" id="tlFill" x1="0" y1="5" x2="1000" y2="5" pathLength="1000"/>
        </svg>
        <div class="tl__ticks">
          {#each Array(31) as _, d}
            <i style="left: {(d / 30) * 100}%; {d % 5 === 0 ? 'height: 14px;' : ''}"></i>
          {/each}
        </div>
        <div class="tl__nodes">
          <div class="node">
            <div class="node__dot"></div>
            <span class="node__day">Day 0</span>
            <h3>Scoping call</h3>
            <p>30 minutes. You describe how the business runs; we ask the
            engineering questions. Free either way.</p>
            <span class="pay pay--ghost">$0</span>
          </div>
          <div class="node">
            <div class="node__dot"></div>
            <span class="node__day">Day 1</span>
            <h3>Scope signed, build starts</h3>
            <p>Written scope: included, excluded, timeline, fixed price. If it
            doesn't make sense, walk away having paid nothing.</p>
            <span class="pay">40%</span>
          </div>
          <div class="node">
            <div class="node__dot"></div>
            <span class="node__day">Day ~15</span>
            <h3>Mid-build demo</h3>
            <p>Demos every few days along the way. The second payment lands only
            after you've seen it working — not before.</p>
            <span class="pay">30%</span>
          </div>
          <div class="node">
            <div class="node__dot"></div>
            <span class="node__day">Day 30</span>
            <h3>Release 1 ships</h3>
            <p>Deployed, documented, handed off. Production-ready core —
            Releases 2 and 3 add depth once it's earning.</p>
            <span class="pay">30%</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ══════════ GUARANTEE ══════════ -->
  <section class="stampzone">
    <div class="stampzone__inner">
      <h2>If Release 1 doesn't match the written scope, <em>you don't pay the final payment.</em></h2>
      <p>Not bravado — just what a written scope makes possible. When "done" is
      defined on paper, you never have to take our word for anything.</p>
      <div class="payline"><span><b>40%</b> START</span><span><b>30%</b> MID-BUILD DEMO</span><span><b>30%</b> ON SCOPE-MATCH</span></div>
      <div class="stamp" id="stamp">Matches the scope<small>— or the final 30% is void —</small></div>
    </div>
  </section>

  <!-- ══════════ SHEET 03 — DOORS ══════════ -->
  <section class="doors">
    <div class="doors__inner">
      <div class="sheet-head">
        <span class="no">SHEET 03</span>
        <h2>Three ways in.<br />One path up.</h2>
        <span class="dim">REV A · CREDITS FORWARD</span>
      </div>
      <div class="doors__grid">
        <div class="door door--active">
          <span class="door__tag">You are here</span>
          <h3>Web Apps</h3>
          <p>A custom web app scoped in writing and shipped in 30 days —
          automation and AI included.</p>
        </div>
        <div class="door">
          <span class="door__tag">Start smaller</span>
          <h3>Automation Sprint</h3>
          <p>One workflow automated end-to-end — same written-scope process,
          about half the commitment. Credits toward a build.</p>
        </div>
        <div class="door">
          <span class="door__tag">When it's worth it</span>
          <h3>AI Employees</h3>
          <p>When the app runs your operations, staff it — a role
          handled 24/7 that never misses a lead.</p>
        </div>
      </div>
      <p class="doors__link">Not sure what to build yet? <a href="/ai-audit">Start with the AI Audit →</a></p>
    </div>
  </section>

  <!-- ══════════ SHEET 04 — NOTES ══════════ -->
  <section class="notes">
    <div class="notes__inner">
      <div class="sheet-head">
        <span class="no">SHEET 04</span>
        <h2>General notes.</h2>
        <span class="dim">U.N.O.</span>
      </div>
      {#each faqs as f, i}
        <div class="note"><span class="note__no">NOTE 4.{i + 1}</span><div><h3>{f.question}</h3><p>{f.answer}</p></div></div>
      {/each}
    </div>
  </section>

  <!-- ══════════ TITLE BLOCK ══════════ -->
  <section class="tb" id="titleblock">
    <div class="tb__inner">
      <div class="sheet-head">
        <span class="no">TITLE BLOCK</span>
        <h2>Open a drawing.</h2>
        <span class="dim">KT-26 · SHEET 1 OF 1</span>
      </div>
      <div class="tb__intro">
        <p>Book a 30-minute scoping call and you'll get a written scope and a
        fixed price for Release 1 — whether or not you build with us. If your
        operations live in spreadsheets and five disconnected tools, that's
        exactly what this replaces.</p>
      </div>
      <div class="tb__cta">
        <a class="btn btn--solid" href={calendly} target="_blank" rel="noopener">Book a 30-Minute Scoping Call</a>
      </div>
      <form class="titleblock" on:submit|preventDefault={handleInquirySubmit}>
        <div class="tb__trap" aria-hidden="true">
          <label for="tb-website">Website</label>
          <input id="tb-website" type="text" name="website" tabindex="-1" autocomplete="off" />
        </div>
        <input type="hidden" name="service" value="web-apps" />
        <div class="tb__cell"><label for="tb-name">Client</label><input id="tb-name" name="name" placeholder="Your name" required /></div>
        <div class="tb__cell"><label for="tb-company">Project / Business</label><input id="tb-company" name="company" placeholder="Business name" /></div>
        <div class="tb__cell"><label for="tb-email">Contact</label><input id="tb-email" type="email" name="email" placeholder="you@business.com" required /></div>
        <div class="tb__cell"><label for="tb-budget">Budget range</label>
          <select id="tb-budget" name="budget">
            <option value="">Not sure yet</option>
            <option value="$3,500–$7,500">$3,500–$7,500</option>
            <option value="$7,500–$15,000">$7,500–$15,000</option>
            <option value="$15,000+">$15,000+</option>
          </select>
        </div>
        <div class="tb__cell tb__cell--desc"><label for="tb-message">Scope description</label><textarea id="tb-message" name="message" required placeholder="Describe the business and the thing you wish existed — the spreadsheet mess, the manual scheduling, the portal your clients keep asking for..."></textarea></div>
        <div class="tb__cell tb__cell--submit">
          <span class="tb__meta"><span>KWANTUM TECH · WEB APPS</span> <span>Scope in writing · Fixed price · Code 100% yours</span></span>
          <div class="tb__actions">
            <Turnstile siteKey={turnstileSiteKey} onToken={(token) => (turnstileToken = token)} />
            <button class="btn btn--solid" type="submit" disabled={inquirySending}>
              {inquirySending ? "Sending..." : "Get My Written Scope"}
            </button>
          </div>
        </div>
      </form>
      {#if inquirySuccess}
        <p class="tb__success">Got it — we'll be in touch within 24 hours.</p>
      {/if}
      {#if inquiryError}
        <p class="tb__error">{inquiryError}</p>
      {/if}
    </div>
  </section>
</main>

<style>
  .v2 {
    --v2-bg: #020503;
    --v2-panel: #061008;
    --v2-line: rgba(224, 255, 224, 0.09);
    --v2-line-strong: rgba(224, 255, 224, 0.2);
    --v2-text: #dfe9e2;
    --app-green: #0a9e42;
    position: relative;
    background: var(--v2-bg);
    color: var(--v2-text);
    /* overflow: hidden would break position: sticky for the walkthrough dock —
       clip contains overflow without creating a scroll container */
    overflow-x: clip;
  }

  .bp {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      linear-gradient(var(--v2-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--v2-line) 1px, transparent 1px),
      linear-gradient(rgba(224, 255, 224, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(224, 255, 224, 0.035) 1px, transparent 1px);
    background-size: 120px 120px, 120px 120px, 24px 24px, 24px 24px;
    mask-image: radial-gradient(ellipse 90% 70% at 50% 30%, #000 40%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 90% 70% at 50% 30%, #000 40%, transparent 100%);
  }

  section { position: relative; z-index: 1; }

  .sheet-head {
    display: flex; align-items: baseline; gap: 1.2rem;
    border-bottom: 1px solid var(--v2-line-strong);
    padding-bottom: 0.9rem; margin-bottom: 2.6rem;
  }
  .sheet-head .no {
    font-family: var(--font-mono); color: var(--green);
    font-size: 0.78rem; letter-spacing: 0.22em;
  }
  .sheet-head h2 {
    margin: 0; font-size: clamp(1.7rem, 1.6vw + 1rem, 2.5rem);
    letter-spacing: -0.02em; color: #fff; font-weight: 600; text-shadow: none;
  }
  .sheet-head .dim {
    margin-left: auto; font-family: var(--font-mono);
    font-size: 0.66rem; color: rgba(223, 233, 226, 0.35); letter-spacing: 0.2em;
  }

  .btn {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 0.9rem 1.9rem; border-radius: 4px; text-decoration: none;
    font-weight: 700; cursor: pointer; border: 1px solid transparent;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    font-family: inherit; font-size: 0.95rem;
  }
  .btn--solid { background: var(--green); color: #000; text-transform: uppercase; letter-spacing: 0.04em; }
  .btn--solid:hover { background: #66ff8f; box-shadow: 0 0 26px rgba(0, 255, 65, 0.4); transform: translateY(-2px); }
  .btn--solid:disabled { cursor: wait; opacity: 0.65; }
  .btn--ghost {
    font-family: var(--font-mono); font-size: 0.8rem; letter-spacing: 0.16em;
    text-transform: uppercase; color: var(--v2-text);
    border: 1px solid var(--v2-line-strong); background: rgba(10, 16, 24, 0.5);
  }
  .btn--ghost:hover { border-color: var(--green); color: var(--green); }

  /* ── Hero ── */
  .v2hero { min-height: 100vh; display: grid; align-items: center; padding: clamp(5rem, 10vh, 8rem) 7vw 4rem; }
  .v2hero__inner {
    max-width: 1280px; margin: 0 auto; width: 100%;
    display: grid; grid-template-columns: 0.9fr 1.1fr;
    gap: clamp(2rem, 4vw, 4rem); align-items: center;
  }
  .hero__eyebrow {
    font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.26em;
    color: var(--green); margin: 0 0 1.6rem; text-transform: uppercase;
  }
  .hero__eyebrow .sep { color: rgba(223, 233, 226, 0.3); margin: 0 0.5rem; }
  h1 {
    font-size: clamp(2.6rem, 3.6vw + 1rem, 4.6rem); line-height: 1.02;
    letter-spacing: -0.04em; margin: 0 0 1.6rem; color: #fff; font-weight: 700;
  }
  h1 .draw { color: var(--green); text-shadow: 0 0 40px rgba(0, 255, 65, 0.4); }
  .hero__lead {
    font-size: clamp(1.05rem, 0.5vw + 0.95rem, 1.25rem); line-height: 1.65;
    color: rgba(223, 233, 226, 0.85); max-width: 46ch; margin: 0 0 2.4rem;
  }
  .hero__lead strong { color: #fff; }
  .hero__ctas { display: flex; gap: 1rem; flex-wrap: wrap; }
  .hero__spec {
    margin-top: 2.4rem; font-family: var(--font-mono); font-size: 0.68rem;
    letter-spacing: 0.18em; color: rgba(223, 233, 226, 0.45); text-transform: uppercase;
    display: flex; gap: 1.6rem; flex-wrap: wrap;
  }
  .hero__spec span::before { content: "▸ "; color: var(--green); }

  /* ── Browser + app ── */
  .appwrap { perspective: 1200px; }
  .browser {
    background: #e8eaed; border-radius: 12px; overflow: hidden;
    box-shadow: 0 40px 90px rgba(0, 0, 0, 0.6), 0 0 70px rgba(0, 255, 65, 0.12);
    transform-style: preserve-3d; width: 100%; max-width: 680px;
    border: 1px solid rgba(255, 255, 255, 0.14);
  }
  .browser__bar { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #dfe1e5; }
  .browser__dots { display: flex; gap: 6px; }
  .browser__dots i { width: 11px; height: 11px; border-radius: 50%; display: block; }
  .browser__dots i:nth-child(1) { background: #ff5f57; }
  .browser__dots i:nth-child(2) { background: #febc2e; }
  .browser__dots i:nth-child(3) { background: #28c840; }
  .browser__url {
    flex: 1; background: #fff; border-radius: 6px; padding: 5px 12px;
    font-family: var(--font-mono); font-size: 0.68rem; color: #444;
  }
  .browser__url b { color: #0a9e42; font-weight: 400; }

  .app {
    background: #f2f4f6;
    color: #171c22;
    min-height: 470px;
    display: flex;
    font-size: 12px;
    font-family: system-ui, "Segoe UI", sans-serif; /* demo app portrays a client product, not site type */
  }

  /* ── Icon sidebar ── */
  .side {
    width: 54px;
    flex: none;
    background: #ffffff;
    border-right: 1px solid #e8ebee;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 0;
    gap: 14px;
  }

  .side__avatar {
    position: relative;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: linear-gradient(135deg, #14181d, #3a4550);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    display: grid;
    place-items: center;
  }

  .side__avatar i {
    position: absolute;
    right: -1px;
    bottom: -1px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #17b26a;
    border: 2px solid #fff;
  }

  .side__nav {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 6px;
  }

  .side__item {
    width: 34px;
    height: 34px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: #9aa4ae;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  }

  .side__item svg {
    width: 15px;
    height: 15px;
    fill: currentColor;
  }

  .side__item:hover {
    background: #f1f3f5;
    color: #5b6570;
  }

  .side__item.on {
    background: #0a9e42;
    color: #ffffff;
    box-shadow: 0 6px 14px rgba(10, 158, 66, 0.35);
  }

  .side__item--ghost {
    cursor: default;
  }

  .side__add {
    margin-top: auto;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #17b26a;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    display: grid;
    place-items: center;
    box-shadow: 0 6px 14px rgba(23, 178, 106, 0.4);
  }

  /* ── Main column ── */
  .app__main {
    flex: 1;
    min-width: 0;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .app__bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px 10px;
  }

  .app__bar h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: -0.01em;
  }

  .app__filter {
    margin-left: auto;
    font-size: 10.5px;
    font-weight: 600;
    color: #7a8590;
  }

  .app__squares {
    width: 26px;
    height: 26px;
    border-radius: 7px;
    background: #ffffff;
    border: 1px solid #e8ebee;
    display: grid;
    place-items: center;
  }

  .app__squares svg {
    width: 12px;
    height: 12px;
    fill: #9aa4ae;
  }

  .app__content {
    padding: 0 14px 14px;
    flex: 1;
  }

  /* ── Dashboard grid ── */
  .dash {
    display: grid;
    grid-template-columns: 1fr 168px;
    gap: 10px;
    align-items: start;
  }

  .dash__left {
    display: grid;
    gap: 10px;
    min-width: 0;
  }

  .dash__row {
    display: grid;
    grid-template-columns: 1.15fr 1fr;
    gap: 10px;
    align-items: start;
  }

  .widget {
    background: #ffffff;
    border: 1px solid #e8ebee;
    border-radius: 12px;
    padding: 11px 13px 12px;
    box-shadow: 0 6px 18px rgba(20, 30, 40, 0.04);
    min-width: 0;
  }

  .widget__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 9px;
  }

  .widget__head h5 {
    margin: 0;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .widget__range {
    font-size: 9.5px;
    color: #9aa4ae;
    white-space: nowrap;
  }

  .widget__range b {
    color: #404a55;
    font-weight: 600;
  }

  .widget__live {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 8.5px;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: #0a9e42;
  }

  .widget__live i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #17b26a;
    box-shadow: 0 0 8px rgba(23, 178, 106, 0.8);
    animation: pulse 1.6s infinite;
  }

  @keyframes pulse {
    50% { opacity: 0.4; }
  }

  /* ── Revenue chart ── */
  .chart {
    position: relative;
  }

  .chart__svg {
    width: 100%;
    height: 96px;
    display: block;
  }

  .chart__grid line {
    stroke: #eef1f3;
    stroke-width: 1;
  }

  .chart__ghost {
    fill: none;
    stroke: #d9dee3;
    stroke-width: 1.6;
  }

  .chart__line {
    fill: none;
    stroke: #17b26a;
    stroke-width: 2.2;
    stroke-linecap: round;
  }

  .chart__dot {
    fill: #ffffff;
    stroke: #17b26a;
    stroke-width: 2.5;
  }

  .chart__tip {
    position: absolute;
    left: 38%;
    top: 8px;
    transform: translateX(-50%);
    background: #14181d;
    color: #ffffff;
    font-size: 10.5px;
    font-weight: 700;
    padding: 4px 9px;
    border-radius: 6px;
    white-space: nowrap;
  }

  .chart__tip i {
    position: absolute;
    left: 50%;
    bottom: -4px;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: #14181d;
    border-bottom: 0;
  }

  .chart__axis {
    display: flex;
    justify-content: space-between;
    margin-top: 6px;
    font-size: 8.5px;
    color: #9aa4ae;
  }

  /* ── Feed ── */
  .feed {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .feed li {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 6.5px 0;
    border-bottom: 1px solid #f2f4f5;
    font-size: 10.5px;
    color: #2a323b;
  }

  .feed li:last-child {
    border-bottom: 0;
  }

  .feed__text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .feed li .t {
    margin-left: auto;
    color: #9aa4ae;
    font-size: 9px;
    flex: none;
  }

  .badge {
    flex: none;
    font-size: 7.5px;
    font-weight: 800;
    letter-spacing: 0.08em;
    padding: 2px 6px;
    border-radius: 20px;
    background: #e7f8ec;
    color: #0a9e42;
  }

  .badge--h {
    background: #eef0f2;
    color: #5b6570;
  }

  /* ── Job sources ── */
  .mix__scale {
    display: flex;
    justify-content: space-between;
    font-size: 8px;
    color: #b3bcc4;
    margin-bottom: 6px;
  }

  .mix__bars {
    display: grid;
    gap: 7px;
    margin-bottom: 10px;
  }

  .mix__bar {
    display: block;
    height: 7px;
    border-radius: 4px;
  }

  .mix__legend {
    list-style: none;
    margin: 0;
    padding: 8px 0 0;
    border-top: 1px solid #f0f2f4;
    display: grid;
    gap: 6px;
  }

  .mix__legend li {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 10px;
    color: #404a55;
  }

  .mix__legend i {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    border: 2.5px solid;
    flex: none;
  }

  .mix__legend b {
    margin-left: auto;
    font-weight: 700;
    color: #171c22;
  }

  /* ── Right rail ── */
  .dash__rail {
    display: grid;
    gap: 10px;
    min-width: 0;
  }

  .railcard {
    background: linear-gradient(150deg, #12b76a, #0a9e42 60%, #078a38);
    border-radius: 12px;
    padding: 12px 13px;
    color: #ffffff;
    box-shadow: 0 10px 22px rgba(10, 158, 66, 0.28);
  }

  .railcard__head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 9.5px;
    opacity: 0.9;
    margin-bottom: 10px;
  }

  .railcard__head b {
    font-weight: 600;
  }

  .railcard__bars {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 24px;
    margin-bottom: 10px;
  }

  .railcard__bars i {
    flex: 1;
    background: rgba(255, 255, 255, 0.55);
    border-radius: 2px;
  }

  .railcard__value {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .railcard__delta {
    font-size: 9.5px;
    opacity: 0.9;
    margin-top: 2px;
  }

  .widget--up .up {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 9px;
  }

  .up li {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .up__tile {
    width: 28px;
    height: 28px;
    border-radius: 9px;
    display: grid;
    place-items: center;
    font-size: 9px;
    font-weight: 800;
    font-style: normal;
    flex: none;
  }

  .up li b {
    display: block;
    font-size: 10.5px;
    font-weight: 700;
  }

  .up li span {
    font-size: 9px;
    color: #9aa4ae;
  }

  /* ── Jobs / Invoices views ── */
  .view {
    display: grid;
    gap: 10px;
  }

  .chips {
    display: flex;
    gap: 6px;
  }

  .chip {
    font-size: 10px;
    font-weight: 600;
    color: #7a8590;
    background: #ffffff;
    border: 1px solid #e8ebee;
    border-radius: 20px;
    padding: 4px 11px;
  }

  .chip--on {
    background: #14181d;
    border-color: #14181d;
    color: #ffffff;
  }

  .inv-strip {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .inv-strip div {
    background: #ffffff;
    border: 1px solid #e8ebee;
    border-radius: 12px;
    padding: 9px 12px;
    box-shadow: 0 6px 18px rgba(20, 30, 40, 0.04);
  }

  .inv-strip span {
    display: block;
    font-size: 9px;
    font-weight: 600;
    color: #9aa4ae;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .inv-strip b {
    font-size: 14px;
    font-weight: 800;
  }

  .inv-strip .warn {
    color: #c0392b;
  }

  table.tbl {
    width: 100%;
    border-collapse: collapse;
    background: #ffffff;
    border: 1px solid #e8ebee;
    border-radius: 12px;
    overflow: hidden;
    font-size: 11px;
    box-shadow: 0 6px 18px rgba(20, 30, 40, 0.04);
  }

  .tbl th {
    text-align: left;
    font-size: 9px;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #9aa4ae;
    padding: 8px 11px;
    border-bottom: 1px solid #eef0f2;
    background: #fafbfb;
  }

  .tbl td {
    padding: 8px 11px;
    border-bottom: 1px solid #f2f4f5;
    color: #2a323b;
  }

  .tbl tr:last-child td {
    border-bottom: 0;
  }

  .crew {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: inline-grid;
    place-items: center;
    font-size: 8px;
    font-weight: 800;
    font-style: normal;
  }

  .age {
    font-size: 10px;
    color: #9aa4ae;
  }

  .age--warn {
    color: #c0392b;
    font-weight: 700;
  }

  .pillar {
    font-size: 8.5px;
    font-weight: 800;
    letter-spacing: 0.07em;
    padding: 3px 8px;
    border-radius: 20px;
    white-space: nowrap;
  }

  .p-sched { background: #fff4e0; color: #b97800; }
  .p-crew { background: #e5f0ff; color: #1b64c0; }
  .p-done, .p-paid { background: #e7f8ec; color: #0a9e42; }
  .p-chase { background: #fdeceb; color: #c0392b; }

  .handoff {
    position: absolute; inset: auto 18px 16px 18px; background: #14181d; color: #fff;
    border-radius: 12px; padding: 14px 16px; display: flex; gap: 18px; align-items: center;
    opacity: 0; transform: translateY(14px); pointer-events: none;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35); transition: all 0.5s ease;
    flex-wrap: wrap;
  }
  .handoff.on { opacity: 1; transform: none; }
  .handoff b { font-size: 11px; letter-spacing: 0.14em; font-family: var(--font-mono); color: var(--green); }
  .handoff span { font-size: 11.5px; color: #c9d2da; }
  .handoff span i { color: var(--green); font-style: normal; margin-right: 4px; }

  .toast {
    position: absolute; right: 16px; top: 14px; background: #14181d; color: #fff;
    font-size: 11.5px; padding: 9px 13px; border-radius: 9px; display: flex; gap: 8px;
    align-items: center; opacity: 0; transform: translateY(-8px);
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.3); z-index: 3; transition: all 0.35s ease;
  }
  .toast i { font-style: normal; color: var(--green); font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; }
  .toast.on { opacity: 1; transform: none; }

  /* ── Walkthrough ── */
  .walk { padding: 6rem 7vw; }
  .walk__inner { max-width: 1280px; margin: 0 auto; }
  .walk__stage { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: clamp(2rem, 4vw, 5rem); align-items: stretch; }
  .walk__specs { display: flex; flex-direction: column; gap: 40vh; padding-bottom: 20vh; padding-top: 8vh; }
  /* Copy is always fully legible — the active state is signaled by the green
     spec number and rule, never by dimming text. */
  .spec { max-width: 46ch; }
  .spec__no {
    font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.24em;
    color: rgba(0, 255, 65, 0.55); transition: color 0.4s ease, text-shadow 0.4s ease;
  }
  .spec.on .spec__no { color: var(--green); text-shadow: 0 0 14px rgba(0, 255, 65, 0.55); }
  .spec__rule { height: 1px; background: var(--v2-line-strong); position: relative; margin: 0.8rem 0 1.1rem; transform-origin: left; transition: background 0.4s ease; }
  .spec.on .spec__rule { background: rgba(0, 255, 65, 0.5); }
  .spec__rule::after {
    content: ""; position: absolute; right: -1px; top: -3.5px; width: 8px; height: 8px;
    border-right: 1px solid var(--v2-line-strong); border-top: 1px solid var(--v2-line-strong);
    transform: rotate(45deg);
  }
  .spec h3 { margin: 0 0 0.7rem; font-size: 1.5rem; letter-spacing: -0.02em; color: #fff; }
  .spec p { margin: 0; line-height: 1.7; color: rgba(223, 233, 226, 0.8); }
  .walk__appcol { position: relative; }
  .walk__sticky { position: sticky; top: 12vh; }

  /* ── 30-day line ── */
  .tl { padding: 7rem 7vw; }
  .tl__inner { max-width: 1280px; margin: 0 auto; }
  .tl__track { position: relative; margin-top: 4.5rem; padding-bottom: 1rem; }
  .tl__svg { width: 100%; height: 10px; display: block; overflow: visible; }
  .tl__svg .rail { stroke: var(--v2-line-strong); stroke-width: 2; }
  .tl__svg .fill { stroke: var(--green); stroke-width: 2; filter: drop-shadow(0 0 8px rgba(0, 255, 65, 0.6)); }
  .tl__ticks { position: absolute; inset: -8px 0 auto 0; height: 10px; pointer-events: none; }
  .tl__ticks i { position: absolute; top: 0; width: 1px; height: 8px; background: var(--v2-line-strong); }
  .tl__nodes { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.4rem; margin-top: 2.4rem; }
  .node { opacity: 0; transform: translateY(18px); }
  .node__dot { width: 13px; height: 13px; border-radius: 50%; background: var(--v2-bg); border: 2px solid var(--green); margin-bottom: 1rem; box-shadow: 0 0 14px rgba(0, 255, 65, 0.4); }
  .node__day { font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.22em; color: var(--green); text-transform: uppercase; }
  .node h3 { margin: 0.5rem 0; font-size: 1.12rem; color: #fff; }
  .node p { margin: 0; font-size: 0.92rem; line-height: 1.65; color: rgba(223, 233, 226, 0.75); }
  .node .pay { display: inline-block; margin-top: 0.7rem; font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.14em; color: #000; background: var(--green); padding: 3px 9px; border-radius: 3px; font-weight: 700; }
  .node .pay--ghost { background: transparent; color: rgba(223, 233, 226, 0.5); border: 1px solid var(--v2-line-strong); }

  /* ── Guarantee ── */
  .stampzone { padding: 8rem 7vw; }
  .stampzone__inner {
    max-width: 1080px; margin: 0 auto; text-align: center; position: relative;
    border: 1px solid var(--v2-line-strong);
    padding: clamp(3rem, 7vw, 6rem) clamp(1.5rem, 5vw, 5rem);
    background: rgba(8, 13, 20, 0.75);
  }
  .stampzone__inner::before, .stampzone__inner::after {
    content: "+"; position: absolute; font-family: var(--font-mono);
    color: var(--v2-line-strong); font-size: 1rem;
  }
  .stampzone__inner::before { top: -0.62em; left: -0.35em; }
  .stampzone__inner::after { bottom: -0.62em; right: -0.35em; }
  .stampzone h2 {
    font-size: clamp(1.9rem, 2.6vw + 1rem, 3.3rem); line-height: 1.1; letter-spacing: -0.03em;
    margin: 0 auto 1.6rem; color: #fff; max-width: 21ch; font-weight: 700; text-shadow: none;
  }
  .stampzone h2 em { font-style: normal; color: var(--green); text-shadow: 0 0 30px rgba(0, 255, 65, 0.35); }
  .stampzone p { max-width: 54ch; margin: 0 auto; line-height: 1.7; color: rgba(223, 233, 226, 0.78); }
  .stamp {
    position: absolute; right: clamp(0.5rem, 4vw, 3.5rem); bottom: clamp(0.8rem, 3vw, 2.2rem);
    font-family: var(--font-mono); color: var(--green);
    border: 2.5px solid var(--green); border-radius: 6px; padding: 0.7rem 1.1rem;
    font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase;
    transform: rotate(-8deg) scale(2.4); opacity: 0;
    text-shadow: 0 0 12px rgba(0, 255, 65, 0.5);
    box-shadow: inset 0 0 18px rgba(0, 255, 65, 0.12), 0 0 24px rgba(0, 255, 65, 0.18);
    mix-blend-mode: screen;
  }
  .stamp small { display: block; font-size: 0.56rem; letter-spacing: 0.3em; opacity: 0.8; margin-top: 0.3rem; }
  .payline {
    display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; margin-top: 2.4rem;
    font-family: var(--font-mono); font-size: 0.74rem; letter-spacing: 0.16em;
    color: rgba(223, 233, 226, 0.65);
  }
  .payline b { color: var(--green); font-weight: 400; }

  /* ── Doors ── */
  .doors { padding: 6rem 7vw; }
  .doors__inner { max-width: 1280px; margin: 0 auto; }
  .doors__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.4rem; }
  .door { border: 1px solid var(--v2-line); background: var(--v2-panel); padding: 2rem 1.8rem; }
  .door--active { border-color: rgba(0, 255, 65, 0.5); box-shadow: 0 0 34px rgba(0, 255, 65, 0.1); }
  .door__tag { font-family: var(--font-mono); font-size: 0.64rem; letter-spacing: 0.22em; color: rgba(223, 233, 226, 0.45); text-transform: uppercase; }
  .door--active .door__tag { color: var(--green); }
  .door h3 { margin: 0.8rem 0 0.6rem; color: #fff; }
  .door p { margin: 0; line-height: 1.65; color: rgba(223, 233, 226, 0.75); font-size: 0.95rem; }
  .doors__link { text-align: center; margin-top: 2.4rem; color: rgba(223, 233, 226, 0.7); }
  .doors__link a { color: var(--green); text-decoration: none; font-weight: 600; }

  /* ── Notes ── */
  .notes { padding: 6rem 7vw; }
  .notes__inner { max-width: 880px; margin: 0 auto; }
  .note { border-top: 1px solid var(--v2-line); padding: 1.7rem 0.2rem; display: grid; grid-template-columns: 90px 1fr; gap: 1.4rem; }
  .note:last-child { border-bottom: 1px solid var(--v2-line); }
  .note__no { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.2em; color: var(--green); padding-top: 0.35rem; }
  .note h3 { margin: 0 0 0.5rem; font-size: 1.1rem; color: #fff; }
  .note p { margin: 0; line-height: 1.7; color: rgba(223, 233, 226, 0.78); font-size: 0.96rem; }

  /* ── Title block ── */
  .tb { padding: 6rem 7vw 8rem; }
  .tb__inner { max-width: 1080px; margin: 0 auto; }
  .tb__intro { text-align: center; max-width: 620px; margin: 0 auto 3rem; }
  .tb__intro p { line-height: 1.7; color: rgba(223, 233, 226, 0.8); }
  .tb__cta { text-align: center; margin-bottom: 2.6rem; }
  .titleblock { border: 1px solid var(--v2-line-strong); background: rgba(8, 13, 20, 0.8); display: grid; grid-template-columns: 1fr 1fr 1fr; }
  .tb__trap { position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden; }
  .tb__cell { border: 1px solid var(--v2-line); padding: 1rem 1.2rem 1.2rem; display: grid; gap: 0.5rem; align-content: start; }
  .tb__cell--desc { grid-column: 2 / -1; grid-row: 2; }
  .tb__cell--submit { grid-column: 1 / -1; padding: 1.4rem 1.2rem; display: flex; align-items: center; justify-content: space-between; gap: 1.4rem; flex-wrap: wrap; }
  .tb__cell label { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.24em; text-transform: uppercase; color: var(--green); }
  .tb__cell input, .tb__cell select, .tb__cell textarea {
    background: transparent; border: 0; border-bottom: 1px solid var(--v2-line-strong);
    color: var(--v2-text); font-family: inherit; font-size: 0.98rem;
    padding: 0.45rem 0.1rem; outline: none; width: 100%; border-radius: 0;
  }
  .tb__cell select { cursor: pointer; appearance: none; -webkit-appearance: none; }
  .tb__cell select option { background: #0a1018; color: var(--v2-text); }
  .tb__cell input:focus, .tb__cell select:focus, .tb__cell textarea:focus { border-bottom-color: var(--green); }
  .tb__cell textarea { resize: vertical; min-height: 84px; line-height: 1.6; }
  .tb__meta > span {
    display: block;
  }

  .tb__meta { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.2em; color: rgba(223, 233, 226, 0.4); text-transform: uppercase; line-height: 2; }
  .tb__actions { display: grid; gap: 0.8rem; justify-items: end; }
  .tb__success { text-align: center; color: var(--green); font-weight: 600; margin: 1.2rem 0 0; }
  .tb__error { text-align: center; color: #ff7a7a; font-weight: 600; margin: 1.2rem 0 0; }

  /* ── Responsive ── */
  @media (max-width: 980px) {
    /* Static mobile experience: no scroll choreography, everything visible,
       the app lives in the hero only. */
    .v2hero { min-height: auto; padding-top: 4rem; }
    .v2hero__inner, .walk__stage { grid-template-columns: 1fr; }
    .walk__specs { gap: 3rem; padding-bottom: 0; padding-top: 0; }
    .spec { opacity: 1; }
    .walk__appcol { display: none; }
    .walk__sticky { position: relative; top: 0; }
    .spec__rule { transform: none !important; }
    .node { opacity: 1; transform: none; }
    .stamp {
      position: relative; display: inline-block; right: auto; bottom: auto;
      margin-top: 2rem; opacity: 1; transform: rotate(-8deg) scale(1);
    }
    .sheet-head { flex-wrap: wrap; row-gap: 0.3rem; }
    .sheet-head .dim { margin-left: 0; flex-basis: 100%; }
    .app__content { overflow-x: auto; }
    .dash { grid-template-columns: 1fr; }

    /* The 30-day line becomes a vertical timeline on mobile: the horizontal
       ruler makes no sense stacked, so hide it and connect the dots with a
       left rail instead. */
    .tl { padding: 4rem 6vw; }
    .tl__svg, .tl__ticks { display: none; }
    .tl__track { margin-top: 1.5rem; }
    .tl__nodes {
      grid-template-columns: 1fr;
      gap: 0;
      margin-top: 0;
      position: relative;
    }
    .tl__nodes::before {
      content: "";
      position: absolute;
      left: 6px;
      top: 10px;
      bottom: 24px;
      width: 2px;
      background: linear-gradient(
        180deg,
        rgba(0, 255, 65, 0.55),
        rgba(0, 255, 65, 0.25),
        rgba(0, 255, 65, 0.1)
      );
    }
    .node {
      position: relative;
      padding: 0 0 2.2rem 2.1rem;
    }
    .node:last-child { padding-bottom: 0.4rem; }
    .node__dot {
      position: absolute;
      left: 0;
      top: 4px;
      margin-bottom: 0;
    }
    .doors__grid { grid-template-columns: 1fr; }
    .titleblock { grid-template-columns: 1fr; }
    .tb__cell--desc { grid-column: auto; grid-row: auto; }
  }
  @media (max-width: 640px) {
    /* Payment line: stacked and left-aligned instead of a centered wrap */
    .stampzone { padding: 4rem 6vw; }
    .stampzone__inner { padding: 2.6rem 1.5rem; }
    .payline {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.8rem;
      max-width: max-content;
      margin-inline: auto;
      text-align: left;
    }
    .payline b {
      display: inline-block;
      min-width: 2.6rem;
      text-align: right;
      margin-right: 0.4rem;
    }
    .note { grid-template-columns: 1fr; gap: 0.4rem; }
    .dash__row { grid-template-columns: 1fr; }
    .hero__ctas .btn { width: 100%; }
    .browser__url { display: none; }
    .app { min-height: 380px; font-size: 11px; }
    .handoff { gap: 10px; padding: 12px 14px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .spec { opacity: 1 !important; }
  }
</style>
