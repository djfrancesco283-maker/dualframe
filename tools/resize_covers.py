#!/usr/bin/env python3
"""Rigenera le derivate responsive delle cover progetto.

Ogni `assets/img/projects/<slug>.webp` (1920x1080) produce le versioni
600w, 800w e 1200w usate da `srcset` nella griglia lavori, nelle card delle
pagine servizio e nella cover delle pagine progetto.

Serve Pillow:  pip install Pillow
Uso:           python3 tools/resize_covers.py
"""

from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Serve Pillow: pip install Pillow")

WIDTHS = (600, 800, 1200)
QUALITY = 80
PROJECTS = Path(__file__).resolve().parent.parent / "assets" / "img" / "projects"


def main() -> int:
    sources = sorted(
        p for p in PROJECTS.glob("*.webp")
        if not any(p.stem.endswith(f"-{w}") for w in WIDTHS)
    )
    if not sources:
        sys.exit(f"Nessuna cover trovata in {PROJECTS}")

    for src in sources:
        with Image.open(src) as im:
            im = im.convert("RGB")
            for width in WIDTHS:
                if width >= im.width:
                    continue
                out = src.with_name(f"{src.stem}-{width}.webp")
                height = round(im.height * width / im.width)
                im.resize((width, height), Image.LANCZOS).save(
                    out, "WEBP", quality=QUALITY, method=6
                )
                print(f"  {out.name:34} {width}x{height}  {out.stat().st_size / 1024:5.0f} KB")

    print("\nFatto. Ricordati di lanciare tools/check_site.py.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
