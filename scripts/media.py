#!/usr/bin/env python3
"""Kwantum Tech media pipeline.

Two trees, and the split is enforced:

    assets/          source art  - hand-managed, NEVER served
    static/assets/   GENERATED   - never edited by hand
                     (static/ is SvelteKit's public dir; everything in it
                      is served verbatim at /assets/...)

This script is the ONLY thing that writes into static/assets/. It must
rebuild byte-identically: run `python3 scripts/media.py --verify` to
regenerate into a temp dir and diff sha256 hashes against the committed
tree. Determinism choices are commented inline (threads=1, bitexact,
no metadata, fixed encoder settings).

Requirements:
    - ffmpeg/ffprobe on PATH (brew install ffmpeg)
    - Pillow (pinned): scripts/.venv/bin/python scripts/media.py
      (create with: python3 -m venv scripts/.venv &&
                    scripts/.venv/bin/pip install pillow==11.3.0)
"""

import argparse
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets"
OUT_DEFAULT = ROOT / "static" / "assets"

# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

# Unsharp mask applied after EVERY resize: LANCZOS always softens slightly,
# and this exact recipe (radius=1.1, percent=58, threshold=3) restores edge
# acuity without haloing on the neon-line renders we use.
UNSHARP = ImageFilter.UnsharpMask(radius=1.1, percent=58, threshold=3)


def resize(im: Image.Image, width: int) -> Image.Image:
    if im.width == width:
        return im
    height = round(im.height * width / im.width)
    out = im.resize((width, height), Image.LANCZOS)
    return out.filter(UNSHARP)


def save_png(im: Image.Image, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    # optimize=True is deterministic in Pillow (fixed zlib strategy sweep).
    im.save(dest, format="PNG", optimize=True)


def save_webp(im: Image.Image, dest: Path, quality: int) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    # method=6 = slowest/best; deterministic for a given libwebp build.
    im.save(dest, format="WEBP", quality=quality, method=6)


def save_avif(im: Image.Image, dest: Path, quality: int) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    # speed=4 balances encode time vs density; max_threads=1 keeps the AV1
    # encoder deterministic (threaded aom can tile-split differently).
    im.save(dest, format="AVIF", quality=quality, speed=4, max_threads=1)


def save_jpeg(im: Image.Image, dest: Path, quality: int) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if im.mode != "RGB":
        im = im.convert("RGB")
    # progressive: smaller at these sizes and perceived-faster; optimize is
    # deterministic (huffman table optimization is input-driven).
    im.save(dest, format="JPEG", quality=quality, optimize=True, progressive=True)


def run(cmd: list[str]) -> None:
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        sys.exit(f"command failed: {' '.join(cmd)}\n{proc.stderr[-2000:]}")


# ---------------------------------------------------------------------------
# Video: hero wave-terrain loop
# ---------------------------------------------------------------------------

VIDEO_MASTER = SRC / "video" / "wave-terrain-portrait-1080x1920.mp4"

# Tier ladder picked at runtime from devicePixelRatio + navigator.connection
# (see src/lib/videoTier.js). The hero renders the portrait video into a
# half-viewport mirrored panel, so panel width ~= viewport/2: 1080 source
# covers panels up to ~1300 CSS px * 1dppx or ~650px * 2dppx before passing
# the 1.3x upscale limit. 720 covers laptops at 1dppx; 540 is the
# constrained-network floor.
VIDEO_TIERS = [1080, 720, 540]

# Grade baked into the encode, NOT applied as CSS filters (compositor cost,
# and it would desync the poster from the video):
#   eq=brightness=-0.05:contrast=1.04:saturation=1.15
# -0.05 brightness buys headline contrast headroom on the bright specular
# ridge-lines without crushing the terrain floor; saturation 1.15 keeps the
# teal/amber wires vivid so the darker grade doesn't read muddy.
#
# hqdn3d (light temporal denoise) + fps=24: the master's particle shimmer is
# encoder poison — it re-costs every frame. Denoising it and dropping 30->24fps
# (the terrain drift is slow; 24 is imperceptible here) cut the 1080 tier from
# 12MB to ~3MB at equal perceived quality.
GRADE = "eq=brightness=-0.05:contrast=1.04:saturation=1.15,hqdn3d=1.5:1.5:6:6,fps=24"

# Per-tier CRF: chosen by A/B frame inspection (27 vs 31 stacked crops were
# indistinguishable on this content — black field + glow mask quantisation).
# 30 lands the 1080 tier near 4MB; the constrained tiers take one more notch.
TIER_CRF = {1080: 30, 720: 30, 540: 31}

# Seamless forward-only loop (a forward+reverse palindrome reads as a
# glitch): body = source 1..10s, head = source 0..1s, and the last second of
# the body cross-dissolves into the head. The final frame therefore equals
# the first frame and the loop point is invisible. Output runs 9s.
LOOP_FILTER = (
    "[0:v]trim=1:10,setpts=PTS-STARTPTS[body];"
    "[0:v]trim=0:1,setpts=PTS-STARTPTS[head];"
    "[body][head]xfade=transition=fade:duration=1:offset=8[looped]"
)


def build_video(out: Path, manifest: dict) -> None:
    vids = []
    for width in VIDEO_TIERS:
        height = width * 16 // 9  # portrait 9:16 master
        dest = out / "video" / f"wave-terrain-{width}.mp4"
        dest.parent.mkdir(parents=True, exist_ok=True)
        # lanczos downscale + the same "sharpen after resize" rule as images,
        # translated to ffmpeg: mild luma-only unsharp (amount 0.4) — video
        # grain tolerates less sharpening than stills before it shimmers.
        scale = (
            f"scale={width}:{height}:flags=lanczos,unsharp=5:5:0.4:5:5:0.0"
            if width != 1080
            else "null"
        )
        run([
            "ffmpeg", "-y", "-i", str(VIDEO_MASTER),
            "-filter_complex", f"{LOOP_FILTER};[looped]{GRADE},{scale}[v]",
            "-map", "[v]",
            "-an",                       # ambient loop is silent; strip audio
            "-c:v", "libx264",
            # H.264 high profile only — never HEVC (no Chrome/Firefox decode).
            "-profile:v", "high", "-level", "4.2",
            # CRF (quality-target) instead of bitrate: the terrain is mostly
            # black, so CRF spends bits only on the neon lines. See TIER_CRF
            # for the per-tier values and the denoise note above GRADE.
            "-crf", str(TIER_CRF[width]), "-preset", "slow",
            "-pix_fmt", "yuv420p",
            # Determinism: single-threaded x264 (thread count changes output),
            # bitexact muxing, no metadata (encoder tag/creation time).
            "-threads", "1",
            "-map_metadata", "-1",
            "-fflags", "+bitexact", "-flags:v", "+bitexact",
            "-movflags", "+faststart",
            str(dest),
        ])
        vids.append({"width": width, "height": height, "src": f"/assets/video/{dest.name}"})
    manifest["video"] = vids


def build_posters(out: Path, manifest: dict) -> None:
    """Poster = the encoded loop's OWN first frame, so playback starts with
    zero jump and zero colour shift (same grade, same encode chain)."""
    tier1080 = out / "video" / "wave-terrain-1080.mp4"
    with tempfile.TemporaryDirectory() as td:
        frame = Path(td) / "poster.png"
        run([
            "ffmpeg", "-y", "-i", str(tier1080),
            "-frames:v", "1", "-fflags", "+bitexact", str(frame),
        ])
        master = Image.open(frame).convert("RGB")
        posters = []
        for width in (1080, 720, 540):
            im = resize(master, width)
            base = out / "images" / f"wave-terrain-poster-{width}"
            save_avif(im, base.with_suffix(".avif"), quality=55)
            save_webp(im, base.with_suffix(".webp"), quality=68)
            save_jpeg(im, base.with_suffix(".jpg"), quality=72)
            posters.append({"width": width, "height": im.height,
                            "base": f"/assets/images/{base.name}"})
        manifest["poster"] = posters


# ---------------------------------------------------------------------------
# OG cards — re-emitted so nothing in static/assets/ bypasses the pipeline
# ---------------------------------------------------------------------------

def build_og(out: Path, manifest: dict) -> None:
    cards = []
    for src in sorted((SRC / "og").glob("*.png")):
        im = Image.open(src).convert("RGB")
        assert im.size == (1200, 630), f"OG card {src.name} must be 1200x630"
        dest = out / "og" / src.name
        # PNG (not JPEG): these cards are flat black fields with sharp neon
        # type — PNG is both smaller and artifact-free on this content.
        save_png(im, dest)
        cards.append(f"/assets/og/{src.name}")
    manifest["og"] = cards


# ---------------------------------------------------------------------------
# Entry
# ---------------------------------------------------------------------------

def build_icons(out: Path, manifest: dict) -> None:
    """apple-touch-icon (180x180) from the 256px favicon master. iOS composites
    its own rounded mask, so the icon ships square on the solid black field."""
    src = Image.open(SRC / "images" / "favicon-256.png").convert("RGBA")
    flat = Image.new("RGB", src.size, (0, 0, 0))
    flat.paste(src, mask=src.getchannel("A"))
    icon = resize(flat, 180)
    save_png(icon, out / "apple-touch-icon.png")
    manifest["appleTouchIcon"] = "/assets/apple-touch-icon.png"


def build(out: Path) -> dict:
    if out.exists():
        shutil.rmtree(out)  # generated tree: always rebuilt from zero
    out.mkdir(parents=True)
    manifest: dict = {}
    build_video(out, manifest)
    build_posters(out, manifest)
    build_og(out, manifest)
    build_icons(out, manifest)
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    return manifest


def tree_hashes(root: Path) -> dict:
    return {
        str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest()
        for p in sorted(root.rglob("*")) if p.is_file()
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--verify", action="store_true",
                    help="rebuild into a temp dir and diff hashes against static/assets/")
    args = ap.parse_args()

    if args.verify:
        committed = tree_hashes(OUT_DEFAULT)
        with tempfile.TemporaryDirectory() as td:
            fresh_root = Path(td) / "assets"
            build(fresh_root)
            fresh = tree_hashes(fresh_root)
        if committed == fresh:
            print(f"byte-identical: {len(fresh)} files match")
        else:
            all_keys = sorted(set(committed) | set(fresh))
            for k in all_keys:
                if committed.get(k) != fresh.get(k):
                    print(f"MISMATCH {k}: {committed.get(k, 'missing')[:12]} != "
                          f"{fresh.get(k, 'missing')[:12]}")
            sys.exit(1)
    else:
        manifest = build(OUT_DEFAULT)
        total = sum(p.stat().st_size for p in OUT_DEFAULT.rglob("*") if p.is_file())
        print(json.dumps(manifest, indent=2))
        print(f"generated {total/1024:.0f} KB into {OUT_DEFAULT}")


if __name__ == "__main__":
    main()
