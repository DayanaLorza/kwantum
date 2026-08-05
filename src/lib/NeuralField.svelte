<script>
  // Deterministic node-mesh: a loose jittered grid connected into an organic
  // network. Seeded so the layout is stable across renders.
  const W = 1200;
  const H = 600;

  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const rand = mulberry32(20240622);
  const cols = 6;
  const rows = 3;
  const cellW = W / cols;
  const cellH = H / rows;

  const nodes = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = cellW * (c + 0.5) + (rand() - 0.5) * cellW * 0.7;
      const y = cellH * (r + 0.5) + (rand() - 0.5) * cellH * 0.7;
      const roll = rand();
      const color = roll > 0.82 ? "violet" : roll > 0.6 ? "cyan" : "green";
      nodes.push({ x, y, color, delay: (rand() * 6).toFixed(2) });
    }
  }

  const threshold = 300;
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (d < threshold) {
        edges.push({ i, j, color: nodes[i].color, delay: (rand() * 8).toFixed(2) });
      }
    }
  }

  // A handful of traveling "signal" pulses to suggest data moving through the mesh.
  const signals = edges
    .filter((_, k) => k % 4 === 0)
    .slice(0, 6)
    .map((e, idx) => ({
      x: nodes[e.i].x,
      y: nodes[e.i].y,
      dx: (nodes[e.j].x - nodes[e.i].x).toFixed(1),
      dy: (nodes[e.j].y - nodes[e.i].y).toFixed(1),
      color: nodes[e.j].color,
      dur: (6 + idx).toFixed(1),
      delay: (idx * 1.3).toFixed(1)
    }));
</script>

<div class="field" aria-hidden="true">
  <svg viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice">
    <g class="layer layer--a">
      {#each edges as e}
        <line
          class="edge edge--{e.color}"
          x1={nodes[e.i].x}
          y1={nodes[e.i].y}
          x2={nodes[e.j].x}
          y2={nodes[e.j].y}
          style="--delay:{e.delay}s"
        />
      {/each}
    </g>
    <g class="layer layer--b">
      {#each nodes as n}
        <circle
          class="node node--{n.color}"
          cx={n.x}
          cy={n.y}
          r="3.5"
          style="--delay:{n.delay}s"
        />
      {/each}
    </g>
    <g class="layer layer--c">
      {#each signals as s}
        <circle
          class="signal signal--{s.color}"
          cx={s.x}
          cy={s.y}
          r="3"
          style="--dx:{s.dx}px;--dy:{s.dy}px;--dur:{s.dur}s;--delay:{s.delay}s"
        />
      {/each}
    </g>
  </svg>
</div>

<style>
  .field {
    position: absolute;
    inset: 0;
    overflow: hidden;
    -webkit-mask-image: radial-gradient(ellipse at center, #000 35%, transparent 80%);
    mask-image: radial-gradient(ellipse at center, #000 35%, transparent 80%);
  }

  .field svg {
    width: 100%;
    height: 100%;
  }

  /* Parallax drift on the layers */
  .layer {
    transform-box: view-box;
    will-change: transform;
  }

  .layer--a {
    animation: drift-a 26s ease-in-out infinite alternate;
  }

  .layer--b {
    animation: drift-b 22s ease-in-out infinite alternate;
  }

  .layer--c {
    animation: drift-a 30s ease-in-out infinite alternate;
  }

  .node {
    transform-box: fill-box;
    transform-origin: center;
    animation: node-pulse 5s ease-in-out infinite;
    animation-delay: var(--delay);
  }

  .node--green {
    fill: #00ff41;
    filter: drop-shadow(0 0 4px rgba(0, 255, 65, 0.8));
  }

  .node--cyan {
    fill: #00e5ff;
    filter: drop-shadow(0 0 4px rgba(0, 229, 255, 0.8));
  }

  .node--violet {
    fill: #b66bff;
    filter: drop-shadow(0 0 4px rgba(182, 107, 255, 0.8));
  }

  .edge {
    stroke-width: 0.8;
    opacity: 0.12;
    animation: edge-pulse 7s ease-in-out infinite;
    animation-delay: var(--delay);
  }

  .edge--green {
    stroke: #00ff41;
  }
  .edge--cyan {
    stroke: #00e5ff;
  }
  .edge--violet {
    stroke: #b66bff;
  }

  .signal {
    animation: signal-move var(--dur) linear infinite;
    animation-delay: var(--delay);
  }

  .signal--green {
    fill: #7dffa6;
    filter: drop-shadow(0 0 6px #00ff41);
  }
  .signal--cyan {
    fill: #8af3ff;
    filter: drop-shadow(0 0 6px #00e5ff);
  }
  .signal--violet {
    fill: #d6b0ff;
    filter: drop-shadow(0 0 6px #b66bff);
  }

  @keyframes node-pulse {
    0%,
    100% {
      opacity: 0.35;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.6);
    }
  }

  @keyframes edge-pulse {
    0%,
    100% {
      opacity: 0.06;
    }
    50% {
      opacity: 0.3;
    }
  }

  @keyframes signal-move {
    0% {
      opacity: 0;
      transform: translate(0, 0);
    }
    12% {
      opacity: 1;
    }
    88% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translate(var(--dx), var(--dy));
    }
  }

  @keyframes drift-a {
    from {
      transform: translate(0, 0);
    }
    to {
      transform: translate(18px, -12px);
    }
  }

  @keyframes drift-b {
    from {
      transform: translate(0, 0);
    }
    to {
      transform: translate(-16px, 10px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .layer,
    .node,
    .edge {
      animation: none;
    }
    .node {
      opacity: 0.7;
    }
    .edge {
      opacity: 0.16;
    }
    .signal {
      display: none;
    }
  }
</style>
