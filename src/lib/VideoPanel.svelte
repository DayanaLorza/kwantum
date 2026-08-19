<script>
  import { onMount } from 'svelte';
  import { pickTier, videoSrc, posterSrcset } from '$lib/videoTier.js';

  /** One hero video panel: poster paints immediately (it IS the loop's first
   * frame, same grade), the video costs nothing until the panel is visible —
   * no autoplay attribute, preload="none", src attached via
   * IntersectionObserver, paused again when scrolled away.
   * Under prefers-reduced-motion the poster simply stays. */
  let { mirrored = false, sizes = '50vw', position = '50% 30%' } = $props();

  let videoEl;
  let panelEl;
  let playing = $state(false);

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!videoEl.src) {
          videoEl.src = videoSrc(pickTier(panelEl.clientWidth));
        }
        videoEl.play().then(() => (playing = true)).catch(() => {});
      } else {
        videoEl.pause();
      }
    });
    io.observe(panelEl);
    return () => io.disconnect();
  });
</script>

<div
  class="panel"
  class:panel--mirrored={mirrored}
  style="--pos: {position}"
  bind:this={panelEl}
  aria-hidden="true"
>
  <picture>
    <source type="image/avif" srcset={posterSrcset('avif')} {sizes} />
    <source type="image/webp" srcset={posterSrcset('webp')} {sizes} />
    <!-- <picture> breaks a child img's height:100%, so the img is positioned
         absolutely by the .panel class instead (known trap) -->
    <img
      class="panel__media"
      src="/assets/images/wave-terrain-poster-1080.jpg"
      srcset={posterSrcset('jpg')}
      {sizes}
      width="1080"
      height="1920"
      alt=""
      fetchpriority="high"
      decoding="async"
    />
  </picture>
  <video
    class="panel__media panel__video"
    class:panel__video--on={playing}
    bind:this={videoEl}
    muted
    loop
    playsinline
    preload="none"
  ></video>
</div>

<style>
  .panel {
    position: relative;
    overflow: hidden;
    height: 100%;
  }

  .panel__media {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* portrait master in a landscape panel: bias the crop toward the darker
       sky band so the copy column sits over the calmest region */
    object-position: var(--pos, 50% 30%);
  }

  .panel__video {
    opacity: 0;
    transition: opacity 1.2s var(--ease-out);
  }

  .panel__video--on {
    opacity: 1;
  }

  .panel--mirrored .panel__media {
    transform: scaleX(-1);
  }
</style>
