#!/usr/bin/env python3
"""
Optimize a generated image for web delivery.

Converts a PNG/JPEG/WebP input to a WebP output, optionally resizing it to a
maximum width and stripping EXIF metadata. Designed for the typical case where
a generated image lives at, say, 1536x1024 pixels but the actual display width
on the page is 800-1280px and shipping the source PNG (~2-3MB) is wasteful.

Quality 82 + LANCZOS resampling gives output that is visually
indistinguishable from the source for almost all web use cases while cutting
file size by 60-90%.

Usage examples:
    # default: write <input-stem>.webp next to the input, quality 82
    python optimize_for_web.py --input hero.png

    # explicit output, cap width at 1920, custom quality
    python optimize_for_web.py \\
        --input hero.png \\
        --output public/hero.webp \\
        --max-width 1920 \\
        --quality 82

    # for cases that need lossless WebP (e.g. UI screenshot, line art)
    python optimize_for_web.py --input diagram.png --lossless

Don't use this for:
    - YouTube thumbnails (YouTube re-encodes on upload)
    - Open Graph cards (some crawlers don't render WebP previews)
    - Print pieces, posters, infographics (you want full-resolution PNG)
    - App icons / favicons (use a dedicated favicon generator)
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path


def _require_pillow():
    """Import Pillow and produce a helpful message if it's not installed."""
    try:
        from PIL import Image  # noqa: F401
    except ImportError:
        sys.stderr.write(
            "error: this script requires Pillow.\n"
            "install it with one of:\n"
            "    pip install Pillow\n"
            "    pip3 install Pillow\n"
            "    python -m pip install Pillow\n"
        )
        sys.exit(2)


def _human_size(num_bytes: int) -> str:
    """Format a byte count as a short human-readable string."""
    for unit in ("B", "KB", "MB", "GB"):
        if num_bytes < 1024 or unit == "GB":
            return f"{num_bytes:.1f} {unit}" if unit != "B" else f"{num_bytes} {unit}"
        num_bytes /= 1024
    return f"{num_bytes:.1f} GB"


def optimize(
    input_path: Path,
    output_path: Path,
    max_width: int | None,
    quality: int,
    lossless: bool,
    strip_metadata: bool,
) -> tuple[int, int]:
    """Resize + re-encode the image. Returns (input_bytes, output_bytes)."""
    from PIL import Image

    input_size = input_path.stat().st_size

    with Image.open(input_path) as img:
        # Convert paletted/grayscale to RGB(A) so WebP encoding works cleanly.
        # Preserve alpha when present so transparent PNGs survive the round trip.
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA" if "A" in img.mode or img.mode == "P" else "RGB")

        if max_width is not None and img.width > max_width:
            ratio = max_width / img.width
            new_size = (max_width, max(1, round(img.height * ratio)))
            img = img.resize(new_size, Image.Resampling.LANCZOS)

        save_kwargs: dict = {
            "format": "WEBP",
            "method": 6,  # slowest/best compression — fine for one-shot CLI use
        }
        if lossless:
            save_kwargs["lossless"] = True
            # Quality maps to compression effort on lossless WebP.
            save_kwargs["quality"] = 100
        else:
            save_kwargs["quality"] = quality

        if strip_metadata:
            # Strip everything Pillow might otherwise carry over.
            save_kwargs["exif"] = b""
            save_kwargs["icc_profile"] = None

        output_path.parent.mkdir(parents=True, exist_ok=True)
        img.save(output_path, **save_kwargs)

    output_size = output_path.stat().st_size
    return input_size, output_size


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert + resize an image for web delivery (WebP output).",
    )
    parser.add_argument(
        "--input",
        required=True,
        type=Path,
        help="Path to the source image (PNG, JPEG, or WebP).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Destination .webp path. Defaults to <input-stem>.webp next to the input.",
    )
    parser.add_argument(
        "--max-width",
        type=int,
        default=None,
        help=(
            "Cap the output width in pixels (preserving aspect ratio). "
            "Skip the flag to keep the source dimensions. Typical values: "
            "800 (inline blog), 1200 (card grid), 1920 (hero)."
        ),
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=82,
        help="WebP quality, 0-100. Default 82 is a good web sweet spot.",
    )
    parser.add_argument(
        "--lossless",
        action="store_true",
        help="Emit lossless WebP. Use for UI screenshots / line art; not for photos.",
    )
    parser.add_argument(
        "--keep-metadata",
        action="store_true",
        help="Preserve EXIF/ICC metadata. Default is to strip it (smaller files, no leaked camera info).",
    )

    args = parser.parse_args(argv)

    if not (0 <= args.quality <= 100):
        parser.error("--quality must be between 0 and 100")

    if args.max_width is not None and args.max_width < 1:
        parser.error("--max-width must be a positive integer")

    if not args.input.exists():
        parser.error(f"input file does not exist: {args.input}")

    if args.output is None:
        args.output = args.input.with_suffix(".webp")

    return args


def main(argv: list[str] | None = None) -> int:
    _require_pillow()
    args = parse_args(argv if argv is not None else sys.argv[1:])

    try:
        input_bytes, output_bytes = optimize(
            input_path=args.input,
            output_path=args.output,
            max_width=args.max_width,
            quality=args.quality,
            lossless=args.lossless,
            strip_metadata=not args.keep_metadata,
        )
    except Exception as exc:
        sys.stderr.write(f"error: {exc}\n")
        return 1

    savings_pct = (1 - output_bytes / input_bytes) * 100 if input_bytes else 0
    print(
        f"wrote {args.output}\n"
        f"  {_human_size(input_bytes)} -> {_human_size(output_bytes)} "
        f"({savings_pct:+.1f}%)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
