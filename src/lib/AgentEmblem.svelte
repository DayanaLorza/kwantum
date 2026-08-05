<script>
  // variant: "acquisition" | "operations"
  let { variant = "acquisition" } = $props();
</script>

<div class="emblem emblem--{variant}" aria-hidden="true">
  <svg viewBox="0 0 160 160">
    <!-- Concentric pulse rings -->
    <circle class="pulse pulse--1" cx="80" cy="80" r="52" />
    <circle class="pulse pulse--2" cx="80" cy="80" r="52" />

    <!-- Slowly rotating dashed orbit -->
    <g class="orbit">
      <circle cx="80" cy="80" r="62" class="orbit__track" />
      <circle cx="80" cy="18" r="3.5" class="orbit__dot" />
      <circle cx="80" cy="142" r="2.5" class="orbit__dot" />
    </g>

    <!-- Core ring -->
    <circle cx="80" cy="80" r="46" class="core" />

    {#if variant === "acquisition"}
      <!-- Winged comms sigil: an upward dispatch glyph with swept wings -->
      <g class="glyph">
        <path class="glyph__send" d="M80 50 L102 104 L80 90 L58 104 Z" />
        <path class="glyph__wing" d="M44 78 q18 -10 30 -2" />
        <path class="glyph__wing" d="M116 78 q-18 -10 -30 -2" />
        <circle class="glyph__spark" cx="80" cy="58" r="2.4" />
      </g>
    {:else}
      <!-- Faceted assistant core: a chat-bracket frame around a gem core -->
      <g class="glyph">
        <path class="glyph__core" d="M80 56 L100 80 L80 104 L60 80 Z" />
        <path class="glyph__facet" d="M80 56 L80 104" />
        <path class="glyph__facet" d="M60 80 L100 80" />
        <path class="glyph__claw" d="M52 62 q-10 18 0 36" />
        <path class="glyph__claw" d="M108 62 q10 18 0 36" />
        <circle class="glyph__dot" cx="72" cy="80" r="2" />
        <circle class="glyph__dot" cx="80" cy="80" r="2" />
        <circle class="glyph__dot" cx="88" cy="80" r="2" />
      </g>
    {/if}
  </svg>
</div>

<style>
  .emblem {
    width: 100%;
    max-width: 200px;
    aspect-ratio: 1;
    color: var(--emblem);
  }

  .emblem--acquisition {
    --emblem: #00e5ff;
    --emblem-soft: rgba(0, 229, 255, 0.5);
  }

  .emblem--operations {
    --emblem: #b66bff;
    --emblem-soft: rgba(182, 107, 255, 0.5);
  }

  .emblem svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  /* Pulse rings */
  .pulse {
    fill: none;
    stroke: var(--emblem);
    stroke-width: 1;
    transform-box: fill-box;
    transform-origin: center;
    opacity: 0;
  }

  .pulse--1 {
    animation: emblem-pulse 4s ease-out infinite;
  }

  .pulse--2 {
    animation: emblem-pulse 4s ease-out infinite;
    animation-delay: 2s;
  }

  /* Orbit */
  .orbit {
    transform-box: fill-box;
    transform-origin: center;
    animation: emblem-spin 24s linear infinite;
  }

  .orbit__track {
    fill: none;
    stroke: var(--emblem);
    stroke-width: 0.75;
    stroke-dasharray: 3 9;
    opacity: 0.5;
  }

  .orbit__dot {
    fill: var(--emblem);
    filter: drop-shadow(0 0 5px var(--emblem));
  }

  /* Core ring */
  .core {
    fill: rgba(0, 0, 0, 0.4);
    stroke: var(--emblem);
    stroke-width: 1.25;
    filter: drop-shadow(0 0 12px var(--emblem-soft));
  }

  /* Glyph shared */
  .glyph {
    transform-box: fill-box;
    transform-origin: center;
    animation: emblem-float 6s ease-in-out infinite;
  }

  .glyph path {
    fill: none;
    stroke: var(--emblem);
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    filter: drop-shadow(0 0 6px var(--emblem-soft));
  }

  .glyph__send {
    fill: var(--emblem);
    fill-opacity: 0.12;
  }

  .glyph__wing,
  .glyph__claw,
  .glyph__facet {
    opacity: 0.8;
  }

  .glyph__core {
    fill: var(--emblem);
    fill-opacity: 0.14;
  }

  .glyph__spark,
  .glyph__dot {
    fill: var(--emblem);
    stroke: none;
    filter: drop-shadow(0 0 5px var(--emblem));
  }

  .glyph__dot {
    animation: emblem-blink 2.4s ease-in-out infinite;
  }

  .glyph__dot:nth-of-type(2) {
    animation-delay: 0.3s;
  }
  .glyph__dot:nth-of-type(3) {
    animation-delay: 0.6s;
  }

  @keyframes emblem-pulse {
    0% {
      opacity: 0.5;
      transform: scale(0.85);
    }
    100% {
      opacity: 0;
      transform: scale(1.5);
    }
  }

  @keyframes emblem-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes emblem-float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }

  @keyframes emblem-blink {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pulse,
    .orbit,
    .glyph,
    .glyph__dot {
      animation: none;
    }
    .pulse {
      display: none;
    }
  }
</style>
