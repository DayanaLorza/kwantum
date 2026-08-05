<script>
  import { onMount } from "svelte";
  import mark from "$lib/assets/logo/kwantum-mark.svg";

  // The hero thread: the realtor (boss) and THEIR AI employee, Haven, over
  // iMessage on the realtor's own iPhone. `from`: "ai" (Haven — received,
  // left, brand cyan) or "boss" (Dana, the realtor — sent, right, understated).
  // Script is the source of truth from the brief's §3 (Day rulings 2026-07-17,
  // do not regress): the AI runs at full autonomy as Dana's NORMAL setting —
  // no surprise beat, she is never startled. Booking is two-step — Haven HOLDS
  // the open slot overnight, Dana picks/corrects the time, THEN it books (Jordan
  // gets one confirmation, never a reschedule). Dana correcting to 12pm shows
  // the boss stays in charge with zero friction; Haven acknowledges in its own
  // short bubble, then continues. It escalates on JUDGMENT only (the Hendersons
  // beat — named items: roof, A/C, open permit), shown not explained. Her calm
  // brevity IS the aspiration. `typing` = indicator time before the bubble
  // lands; `pause` = beat after. ms.
  const script = [
    { from: "ai",   text: "Morning Dana — overnight recap: new lead Jordan came in from Zillow at 11:47 PM asking about 412 Maple. Answered in under 2 minutes — he's pre-approved ✅ Slot's open on your calendar for Sat 10:30.", typing: 1500, pause: 1000 },
    { from: "boss", text: "Saturday works, but change it to 12pm 👌 what else", typing: 1000, pause: 700 },
    { from: "ai",   text: "Done — Jordan's booked for 12, confirmation sent.", typing: 950, pause: 450 },
    { from: "ai",   text: "Miami Beach follow-up sent. Hendersons' inspection is back — roof, A/C, and an open permit. Want to go over it?", typing: 1300, pause: 900 },
    { from: "boss", text: "after my 9am", typing: 800, pause: 650 },
    { from: "ai",   text: "On your calendar for 11. Summary's in your inbox.", typing: 1050, pause: 900 },
  ];

  let visibleCount = $state(0);   // messages revealed so far
  let typingFrom = $state(null);  // "ai" | "boss" | null
  let scroller;                   // messages viewport (for auto-scroll)
  let root;                       // component root (for IntersectionObserver)
  let runId = 0;                  // cancels a stale animation loop

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  async function play() {
    const id = ++runId;
    while (id === runId) {
      visibleCount = 0;
      typingFrom = null;
      await wait(600);

      for (let i = 0; i < script.length; i++) {
        if (id !== runId) return;
        typingFrom = script[i].from;
        await wait(script[i].typing ?? 900);
        if (id !== runId) return;
        typingFrom = null;
        visibleCount = i + 1;
        await wait(script[i].pause ?? 700);
      }

      if (id !== runId) return;
      await wait(30000); // hold on the finished thread for 30s, then loop
    }
  }

  // Auto-scroll the transcript as new bubbles land.
  $effect(() => {
    visibleCount;
    typingFrom;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  });

  onMount(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      // Show the whole conversation at once — no animation.
      visibleCount = script.length;
      return;
    }

    // Only animate once the phone scrolls into view; stop when it leaves.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) play();
          else runId++; // cancel the loop while off-screen
        }
      },
      { threshold: 0.35 }
    );
    io.observe(root);

    return () => {
      runId++;
      io.disconnect();
    };
  });
</script>

<div class="demo" bind:this={root}>
  <div class="phone" role="img"
       aria-label="Sample text conversation at 7:02 AM: Haven, the realtor's AI employee, gives Dana an overnight recap — a new lead answered in under two minutes, pre-approved, with a Saturday slot held. Dana moves it to 12pm and Haven confirms the booking. Haven adds that the Miami Beach follow-up is sent and the Hendersons' inspection is back with three items — roof, A/C, and an open permit — and asks to review. Dana defers to after her 9am. She replies in a few calm words; her business ran while she slept.">
    <div class="phone__island" aria-hidden="true"></div>
    <div class="phone__screen">
      <div class="statusbar" aria-hidden="true">
        <span class="statusbar__time">7:02</span>
        <span class="statusbar__right">
          <svg viewBox="0 0 18 12" width="17" height="11"><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="5" y="4.5" width="3" height="7.5" rx="1"/><rect x="10" y="2" width="3" height="10" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1" opacity="0.35"/></svg>
          <span class="statusbar__5g">5G</span>
          <svg class="statusbar__batt" viewBox="0 0 26 12" width="25" height="11"><rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity="0.4"/><rect x="2" y="2" width="19" height="8" rx="1.5"/><rect x="23.5" y="4" width="2" height="4" rx="1" opacity="0.4"/></svg>
        </span>
      </div>

      <div class="thread__bar">
        <svg class="thread__back" viewBox="0 0 12 20" width="11" height="18" aria-hidden="true"><path d="M10 1 L2 10 L10 19" fill="none" stroke="#0a84ff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <div class="thread__id">
          <div class="thread__avatar" aria-hidden="true">
            <img src={mark} alt="" width="30" height="30" />
          </div>
          <span class="thread__name">Haven: AI employee <span class="thread__chevron">›</span></span>
        </div>
        <svg class="thread__video" viewBox="0 0 26 18" width="24" height="17" aria-hidden="true"><rect x="1" y="3" width="16" height="12" rx="3.5" fill="none" stroke="#111" stroke-width="2"/><path d="M18 7 L25 3 L25 15 L18 11 Z" fill="none" stroke="#111" stroke-width="2" stroke-linejoin="round"/></svg>
      </div>

      <div class="thread__body" bind:this={scroller}>
        {#each script as msg, i}
          {#if i < visibleCount}
            <div class="msg msg--{msg.from}">
              <span class="bubble">{msg.text}</span>
            </div>
          {/if}
        {/each}

        {#if typingFrom}
          <div class="msg msg--{typingFrom}">
            <span class="bubble bubble--typing" aria-hidden="true">
              <i></i><i></i><i></i>
            </span>
          </div>
        {/if}
      </div>

      <div class="composer" aria-hidden="true">
        <span class="composer__plus">+</span>
        <span class="composer__field">iMessage</span>
        <svg class="composer__mic" viewBox="0 0 14 20" width="13" height="18"><rect x="4" y="1" width="6" height="11" rx="3" fill="none" stroke="#8a8d93" stroke-width="1.6"/><path d="M1.5 9 a5.5 5.5 0 0 0 11 0 M7 14.5 L7 18 M4 18.5 L10 18.5" fill="none" stroke="#8a8d93" stroke-width="1.6" stroke-linecap="round"/></svg>
      </div>
    </div>
  </div>

  <p class="demo__disclaimer">Sample conversation — illustrative of a real deployment.</p>
</div>

<style>
  .demo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.9rem;
  }

  /* ── White / silver iPhone frame ────────────────── */
  .phone {
    position: relative;
    width: min(350px, 80vw);
    /* iPhone 16 Pro body: 149.6 × 71.5 mm ≈ 2.09:1 */
    aspect-ratio: 71.5 / 149.6;
    padding: 13px;
    border-radius: 48px;
    background:
      linear-gradient(150deg, #fdfdfe 0%, #e6e7ea 22%, #c3c5cb 50%, #eceef1 78%, #d4d6db 100%);
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.7) inset,
      0 0 0 2px rgba(120, 124, 132, 0.4),
      0 34px 70px rgba(0, 0, 0, 0.55),
      0 0 48px rgba(255, 255, 255, 0.12);
  }

  .phone__island {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 30%;
    height: 22px;
    background: #000;
    border-radius: 14px;
    z-index: 2;
  }

  .phone__screen {
    height: 100%;
    border-radius: 36px;
    overflow: hidden;
    background: #ffffff;
    display: flex;
    flex-direction: column;
  }

  /* iOS status bar */
  .statusbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.7rem 1.4rem 0.55rem;
    color: #111114;
    font-family: -apple-system, "SF Pro Text", system-ui, sans-serif;
  }
  .statusbar__time { font-size: 0.82rem; font-weight: 700; letter-spacing: 0.02em; }
  .statusbar__right { display: inline-flex; align-items: center; gap: 5px; }
  .statusbar__right svg { fill: #111114; }
  .statusbar__5g { font-size: 0.72rem; font-weight: 600; }
  .statusbar__batt { color: #111114; }

  .thread__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.35rem 0.9rem 0.7rem;
    background: rgba(247, 247, 248, 0.96);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .thread__back { flex: 0 0 auto; }
  .thread__video { flex: 0 0 auto; }

  .thread__id {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    flex: 1;
  }

  .thread__avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    overflow: hidden;
    background: #0a0f0c;
    border: 1px solid rgba(0, 255, 65, 0.35);
  }
  .thread__avatar img { display: block; width: 68%; height: 68%; object-fit: contain; }

  .thread__name {
    color: #111114;
    font-size: 0.82rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-family: -apple-system, system-ui, sans-serif;
  }
  .thread__chevron { color: rgba(0, 0, 0, 0.3); font-size: 0.9rem; }

  .thread__body {
    flex: 1 1 0;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 1rem 0.85rem 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    scroll-behavior: smooth;
    background: #ffffff;
    scrollbar-width: none;
  }
  .thread__body::-webkit-scrollbar { display: none; }

  .msg { display: flex; text-align: left; }
  .msg--ai { justify-content: flex-start; }
  .msg--boss { justify-content: flex-end; text-align: right; }

  .bubble {
    position: relative;
    text-align: left;
    max-width: 78%;
    padding: 0.5rem 0.78rem;
    border-radius: 19px;
    font-size: 0.86rem;
    line-height: 1.34;
    font-family: -apple-system, "SF Pro Text", system-ui, sans-serif;
    animation: pop 0.28s ease both;
  }

  /* Haven (the AI employee) — incoming, gray iMessage bubble */
  .msg--ai .bubble {
    background: #e9e9eb;
    color: #111114;
    font-weight: 400;
    border-bottom-left-radius: 5px;
  }

  /* Dana (the realtor/boss) — outgoing, blue iMessage bubble */
  .msg--boss .bubble {
    background: #248bf5;
    color: #ffffff;
    border-bottom-right-radius: 5px;
  }

  /* iMessage composer / input bar */
  .composer {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.55rem 0.85rem 0.9rem;
    background: #ffffff;
  }
  .composer__plus {
    flex: 0 0 auto;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: #e6e7ea;
    color: #555;
    font-size: 1.2rem;
    line-height: 1;
    font-weight: 400;
  }
  .composer__field {
    flex: 1;
    display: flex;
    align-items: center;
    height: 30px;
    padding: 0 0.85rem;
    border-radius: 999px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    color: #8a8d93;
    font-size: 0.82rem;
    font-family: -apple-system, system-ui, sans-serif;
  }
  .composer__mic { flex: 0 0 auto; margin-left: -1.9rem; }

  .bubble--typing {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 0.7rem 0.85rem;
  }

  .bubble--typing i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.4);
    animation: blink 1.1s infinite ease-in-out;
  }
  .msg--ai .bubble--typing i { background: rgba(0, 0, 0, 0.45); }
  .msg--boss .bubble--typing i { background: rgba(255, 255, 255, 0.9); }
  .bubble--typing i:nth-child(2) { animation-delay: 0.18s; }
  .bubble--typing i:nth-child(3) { animation-delay: 0.36s; }

  .demo__disclaimer {
    text-align: center;
    margin: 0;
    font-family: "Share Tech Mono", ui-monospace, monospace;
    font-size: 0.66rem;
    letter-spacing: 0.04em;
    color: rgba(224, 255, 224, 0.4);
  }

  @keyframes pop {
    from { opacity: 0; transform: translateY(6px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes blink {
    0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
    30% { opacity: 0.9; transform: translateY(-2px); }
  }

  @media (prefers-reduced-motion: reduce) {
    .bubble { animation: none; }
    .thread__body { overflow-y: auto; }
  }
</style>
