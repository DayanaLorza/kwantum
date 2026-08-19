/* Runtime tier selection for the hero loop (ladder built by scripts/media.py).
 *
 * Rule set:
 *  - A panel must never upscale its source above ~1.3x or it reads soft, so
 *    the floor is set by rendered panel width x devicePixelRatio.
 *  - navigator.connection caps the tier downward on constrained links.
 *    The API is Chromium-only: where it's absent we assume a good link and
 *    default to quality rather than degrading.
 */

const TIERS = [540, 720, 1080]; // widths; files at /assets/video/wave-terrain-<w>.mp4

export function pickTier(panelCssWidth) {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const needed = (panelCssWidth * dpr) / 1.3; // smallest source that stays sharp
  let tier = TIERS.find((t) => t >= needed) ?? TIERS[TIERS.length - 1];

  const conn = navigator.connection;
  if (conn) {
    if (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') {
      tier = 540;
    } else if (conn.effectiveType === '3g') {
      tier = Math.min(tier, 720);
    }
  }
  return tier;
}

export const videoSrc = (tier) => `/assets/video/wave-terrain-${tier}.mp4`;

export const posterSrcset = (ext) =>
  TIERS.map((t) => `/assets/images/wave-terrain-poster-${t}.${ext} ${t}w`).join(', ');
