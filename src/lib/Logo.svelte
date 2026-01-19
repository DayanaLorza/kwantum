<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';

  export let size = 36;

  let textContainer;
  let cursorElement;
  const originalText = "KWANTUM      TECH";
  const originalText2 = "KWANTUM";
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
  let letters = [];

  onMount(() => {
    letters = Array.from(textContainer.children);

    function createDecoderAnimation() {
      const tl = gsap.timeline({
        delay: 0.3,
        onComplete: () => {
          gsap.delayedCall(3, () => {
            // Hide cursor before restarting
            cursorElement.style.animationPlayState = 'paused';
            gsap.set(cursorElement, { opacity: 0 });
            tl.restart();
          });
        }
      });

      // Keep cursor hidden during animation
      tl.set(cursorElement, { opacity: 0 }, 0);

      letters.forEach((letter, i) => {
        const finalChar = originalText2[i] || '';
        let proxy = { charIndex: 0 };

        tl.to(proxy, {
          charIndex: chars.length - 1,
          duration: 1,
          ease: "power2.inOut",
          onUpdate: () => {
            const randomIndex = Math.floor(Math.random() * chars.length);
            letter.textContent = chars[randomIndex];
          },
          onComplete: () => {
            letter.textContent = finalChar;
          }
        }, i * 0.1);
      });

      // Show cursor only after animation completes and text has settled
      tl.to(cursorElement, {
        opacity: 1,
        duration: 0.3,
        onStart: () => {
          cursorElement.style.animationPlayState = 'running';
        }
      }, "+=0.5");

      tl.to({}, { duration: 10 });
    }

    createDecoderAnimation();
  });
</script>

<div class="kwantum-logo">
  <div bind:this={textContainer} class="logo-text">
    {#each originalText.split('') as char}
      <span class="logo-letter">{char}</span>
    {/each}
  </div>
  <span bind:this={cursorElement} class="cursor">|</span>
</div>

<style>
  .kwantum-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Share Tech Mono', monospace;
  }

  .logo-text {
    display: flex;
    gap: 2px;
  }

  .logo-letter {
    font-size: 24px;
    font-weight: 700;
    color: #00ff41;
    text-shadow:
      0 0 2px #00ff41,
      0 0 6px #00ff41,
      0 0 12px #00ff41;
    user-select: none;
    display: inline-block;
  }

  .cursor {
    font-size: 24px;
    font-weight: 700;
    color: #00ff41;
    text-shadow:
      0 0 2px #00ff41,
      0 0 6px #00ff41,
      0 0 12px #00ff41;
    margin-left: -15px;
    opacity: 0;
    animation: blink 1s step-end infinite paused;
  }

  @keyframes blink {
    0%, 50% {
      visibility: visible;
    }
    50.01%, 100% {
      visibility: hidden;
    }
  }
</style>