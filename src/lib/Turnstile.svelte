<script>
  import { onMount } from "svelte";

  let { siteKey = "", onToken = () => {} } = $props();
  let container = $state();
  let widgetId = $state();

  onMount(() => {
    if (!siteKey) return;

    const render = () => {
      if (!window.turnstile || !container || widgetId !== undefined) return;
      widgetId = window.turnstile.render(container, {
        sitekey: siteKey,
        action: "turnstile-spin-v2",
        theme: "dark",
        callback: (token) => onToken(token),
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken("")
      });
    };

    if (window.turnstile) {
      render();
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
    script.addEventListener("load", render);

    return () => script?.removeEventListener("load", render);
  });
</script>

{#if siteKey}<div class="cf-turnstile turnstile" data-action="turnstile-spin-v2" bind:this={container}></div>{/if}

<style>
  .turnstile { min-height: 65px; margin: .25rem 0 1rem; padding: 10px 0; }
</style>
