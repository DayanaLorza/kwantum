<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  let isLoading = true;
  let progress = 0;

  onMount(() => {
    const isMobile = window.innerWidth <= 640;
    let hasFinished = false;
    let maxWaitTimeout;
    let pageLoaded = false;

    // Check if page is already loaded
    if (document.readyState === 'complete') {
      pageLoaded = true;
    }

    // INSTANT load on mobile - super fast progress
    const progressSpeed = isMobile ? 20 : 100; // Mobile: 20ms interval (5x faster)
    const progressIncrement = isMobile ? 25 : 15; // Mobile: bigger jumps

    // Simulate progress while assets load
    const progressInterval = setInterval(() => {
      progress = Math.min(progress + Math.random() * progressIncrement, 99);
      if (progress >= 99) {
        clearInterval(progressInterval);
        // Once we hit 99%, finish immediately if page already loaded, otherwise wait
        if (pageLoaded) {
          handleLoad();
        } else {
          // Mobile: only wait 300ms max at 99%, Desktop: 1.5s
          maxWaitTimeout = setTimeout(() => {
            handleLoad();
          }, isMobile ? 300 : 1500);
        }
      }
    }, progressSpeed);

    // Wait for all assets to load
    const handleLoad = () => {
      if (hasFinished) return;
      hasFinished = true;
      clearInterval(progressInterval);
      if (maxWaitTimeout) clearTimeout(maxWaitTimeout);
      progress = 100;
      setTimeout(() => {
        isLoading = false;
      }, isMobile ? 100 : 300); // Mobile: 100ms exit delay, Desktop: 300ms
    };

    if (!pageLoaded) {
      window.addEventListener('load', () => {
        pageLoaded = true;
        // If we're already at 99%, finish now
        if (progress >= 99) {
          if (maxWaitTimeout) clearTimeout(maxWaitTimeout);
          handleLoad();
        }
      });
    }

    return () => {
      window.removeEventListener('load', handleLoad);
      if (maxWaitTimeout) clearTimeout(maxWaitTimeout);
      clearInterval(progressInterval);
    };
  });
</script>

{#if isLoading}
  <div class="preloader" transition:fade={{ duration: 400 }}>
    <div class="preloader__content">
      <div class="preloader__logo">
        <span class="preloader__text">KT</span>
      </div>
      <div class="preloader__bar">
        <div class="preloader__progress" style="width: {Math.min(progress, 100)}%"></div>
      </div>
      <div class="preloader__percent">{Math.min(Math.round(progress), 100)}%</div>
    </div>
  </div>
{/if}

<style>
  .preloader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000000;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .preloader__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .preloader__logo {
    font-family: 'Share Tech Mono', monospace;
    font-size: 4rem;
    font-weight: 500;
    color: #00ff41;
    text-shadow:
      0 0 2px #00ff41,
      0 0 10px #00ff41,
      0 0 20px #00ff41;
    animation: pulse 2s ease-in-out infinite;
  }

  .preloader__text {
    letter-spacing: 0.1em;
  }

  .preloader__bar {
    width: 300px;
    height: 2px;
    background: rgba(0, 255, 65, 0.2);
    border-radius: 2px;
    overflow: hidden;
    position: relative;
  }

  .preloader__progress {
    height: 100%;
    background: linear-gradient(90deg, #00ff41, #00cc33);
    border-radius: 2px;
    transition: width 0.3s ease;
    box-shadow: 0 0 10px #00ff41;
  }

  .preloader__percent {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.9rem;
    color: #00ff41;
    opacity: 0.7;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      text-shadow:
        0 0 2px #00ff41,
        0 0 10px #00ff41,
        0 0 20px #00ff41;
    }
    50% {
      opacity: 0.8;
      text-shadow:
        0 0 2px #00ff41,
        0 0 15px #00ff41,
        0 0 30px #00ff41;
    }
  }

  @media (max-width: 640px) {
    .preloader__logo {
      font-size: 3rem;
    }

    .preloader__bar {
      width: 240px;
    }
  }
</style>
