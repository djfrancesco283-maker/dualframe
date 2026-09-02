#!/usr/bin/env python3
"""Static sanity checks for the Dualframe site.

Runs with the standard library only, so it works locally and in CI without a
install step. Checks, per page:

  * every local href/src/link resolves to a file in the repo
  * every in-page "#anchor" target exists on that page
  * the head declares the pieces every page is supposed to carry
  * sitemap.xml lists exactly the indexable pages, and nothing that 404s
  * <img> tags carry alt text and intrinsic dimensions

Usage: python3 tools/check_site.py [--quiet]
"""

from __future__ import annotations

import html.parser
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://www.dualframe.it/"

# Pages that intentionally opt out of the shared head contract.
BARE_PAGES = {"googlefa3406cc42e3bebe.html"}
NOINDEX_PAGES = {"404.html", "googlefa3406cc42e3bebe.html"}
# 404 is served from arbitrary paths, so it uses absolute asset URLs.
NO_SKIP_LINK = {"404.html", "googlefa3406cc42e3bebe.html"}


class PageParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.links: list[tuple[str, str]] = []   # (attr value, tag)
        self.ids: set[str] = set()
        self.names: set[str] = set()
        self.images: list[dict[str, str]] = []
        self.tags: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        a = {k: (v or "") for k, v in attrs}
        self.tags.append(tag)
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "a" and "name" in a:
            self.names.add(a["name"])
        for attr in ("href", "src"):
            if attr in a and a[attr]:
                self.links.append((a[attr], tag))
        if tag == "img":
            self.images.append(a)


def load(path: Path) -> tuple[str, PageParser]:
    text = path.read_text(encoding="utf-8")
    parser = PageParser()
    parser.feed(text)
    return text, parser


def check_links(page: Path, parser: PageParser, errors: list[str]) -> None:
    for value, tag in parser.links:
        if value.startswith(("http://", "https://", "mailto:", "tel:", "data:", "javascript:")):
            continue
        target, _, fragment = value.partition("#")
        target = unquote(target)

        if not target:  # pure in-page anchor
            if fragment and fragment not in parser.ids and fragment not in parser.names:
                errors.append(f"{page.name}: anchor #{fragment} has no target on this page")
            continue

        resolved = (ROOT / target.lstrip("/")) if target.startswith("/") else (page.parent / target)
        if not resolved.exists():
            errors.append(f"{page.name}: <{tag}> points at missing file {value}")
            continue

        if fragment and resolved.suffix == ".html":
            _, other = load(resolved)
            if fragment not in other.ids and fragment not in other.names:
                errors.append(f"{page.name}: {target}#{fragment} has no such target")


def check_head(page: Path, text: str, errors: list[str], warnings: list[str]) -> None:
    name = page.name
    if name in BARE_PAGES:
        return

    required = [
        ('<html lang="it">', "lang attribute"),
        ('<meta charset="UTF-8"', "charset"),
        ("<title>", "title"),
        ('name="viewport"', "viewport"),
        ('http-equiv="Content-Security-Policy"', "CSP"),
        ('name="theme-color"', "theme-color"),
        ('rel="apple-touch-icon"', "apple-touch-icon"),
        ('rel="manifest"', "manifest"),
        ("assets/fonts/fonts.css", "self-hosted fonts"),
    ]
    for needle, label in required:
        if needle not in text:
            errors.append(f"{name}: head is missing {label}")

    if name not in NOINDEX_PAGES:
        for needle, label in [('rel="canonical"', "canonical"),
                              ('name="description"', "meta description"),
                              ('property="og:title"', "og:title"),
                              ('property="og:image"', "og:image"),
                              ('name="twitter:card"', "twitter:card")]:
            if needle not in text:
                errors.append(f"{name}: head is missing {label}")

    if "fonts.googleapis.com" in text or "fonts.gstatic.com" in text:
        errors.append(f"{name}: still references Google Fonts; fonts are self-hosted")

    if 'href="style.css"' in text and "no-js.css" not in text:
        errors.append(f"{name}: uses .reveal styles but has no <noscript> fallback")

    if name not in NO_SKIP_LINK and 'class="skip-link"' not in text and 'class="skip"' not in text:
        warnings.append(f"{name}: no skip link")

    if "<main" not in text:
        errors.append(f"{name}: no <main> landmark")

    if text.count("<h1") != 1:
        warnings.append(f"{name}: expected exactly one <h1>, found {text.count('<h1')}")


def check_images(page: Path, parser: PageParser, errors: list[str], warnings: list[str]) -> None:
    for img in parser.images:
        src = img.get("src", "(no src)")
        if "alt" not in img:
            errors.append(f"{page.name}: <img src={src}> has no alt attribute")
        if src.startswith("assets/") or src.startswith("/assets/"):
            if "width" not in img or "height" not in img:
                warnings.append(f"{page.name}: <img src={src}> has no intrinsic size (causes layout shift)")


def check_json_ld(page: Path, text: str, errors: list[str]) -> None:
    import json

    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', text, re.S):
        try:
            json.loads(block)
        except ValueError as exc:
            errors.append(f"{page.name}: invalid JSON-LD ({exc})")


def check_sitemap(pages: list[Path], errors: list[str], warnings: list[str]) -> None:
    sitemap = ROOT / "sitemap.xml"
    if not sitemap.exists():
        errors.append("sitemap.xml is missing")
        return

    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    listed = {loc.text.strip() for loc in ET.parse(sitemap).getroot().iterfind(".//s:loc", ns)}

    expected = set()
    for page in pages:
        if page.name in NOINDEX_PAGES:
            continue
        text = page.read_text(encoding="utf-8")
        if "noindex" in text:
            continue
        expected.add(SITE if page.name == "index.html" else SITE + page.name)

    for url in sorted(listed - expected):
        errors.append(f"sitemap.xml lists {url}, which is not an indexable page")
    for url in sorted(expected - listed):
        warnings.append(f"sitemap.xml does not list {url}")

    for url in sorted(listed):
        rel = url[len(SITE):] or "index.html"
        if not (ROOT / rel).exists():
            errors.append(f"sitemap.xml lists {url}, but {rel} does not exist")


def check_orphan_assets(pages: list[Path], warnings: list[str]) -> None:
    referenced: set[str] = set()
    for page in pages:
        text = page.read_text(encoding="utf-8")
        referenced.update(re.findall(r"assets/[A-Za-z0-9._/-]+", text))
    for css in ROOT.glob("*.css"):
        referenced.update(re.findall(r"assets/[A-Za-z0-9._/-]+", css.read_text(encoding="utf-8")))
    # fonts.css uses paths relative to itself
    for face in re.findall(r"url\('([^']+)'\)", (ROOT / "assets/fonts/fonts.css").read_text(encoding="utf-8")):
        referenced.add(f"assets/fonts/{face}")
    referenced.add("assets/fonts/fonts.css")
    manifest = ROOT / "site.webmanifest"
    if manifest.exists():
        referenced.update(re.findall(r"assets/[A-Za-z0-9._/-]+", manifest.read_text(encoding="utf-8")))

    for path in sorted((ROOT / "assets").rglob("*")):
        if path.is_dir():
            continue
        rel = path.relative_to(ROOT).as_posix()
        if rel not in referenced and rel not in {"assets/img/og-social.svg"}:
            warnings.append(f"{rel} is not referenced by any page or stylesheet")


def main() -> int:
    quiet = "--quiet" in sys.argv
    pages = sorted(p for p in ROOT.glob("*.html"))
    errors: list[str] = []
    warnings: list[str] = []

    for page in pages:
        text, parser = load(page)
        check_links(page, parser, errors)
        check_head(page, text, errors, warnings)
        check_images(page, parser, errors, warnings)
        check_json_ld(page, text, errors)

    check_sitemap(pages, errors, warnings)
    check_orphan_assets(pages, warnings)

    if warnings and not quiet:
        print(f"{len(warnings)} warning(s):")
        for line in warnings:
            print(f"  ! {line}")
    if errors:
        print(f"\n{len(errors)} error(s):")
        for line in errors:
            print(f"  x {line}")
        return 1

    print(f"\nOK — {len(pages)} pages checked, no errors.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
