#!/usr/bin/env python3
"""Split catalog-full.html into docs/*.html — run from repo root: python3 demo/split_catalog.py"""
from __future__ import annotations

import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "catalog-full.html"
OUT = ROOT / "docs"

PAGES: list[dict] = [
    {
        "file": "getting-started.html",
        "title": "Getting started",
        "slug": "start",
        "lines": [(162, 355)],
        "sidebar": [("#tutorial", "Quick start"), ("#palette", "Palette"), ("#typography", "Typography")],
    },
    {"file": "icons.html", "title": "Icons", "slug": "icons", "lines": [(356, 996)]},
    {
        "file": "foundation.html",
        "title": "Layout & forms",
        "slug": "foundation",
        "lines": [(997, 1334), (1566, 1740)],
        "sidebar": [
            ("#grid", "Layout grid"),
            ("#buttons", "Buttons"),
            ("#forms", "Forms"),
            ("#copy-fields", "Copyable fields"),
            ("#table", "Table"),
        ],
    },
    {"file": "apps.html", "title": "Apps & data", "slug": "apps", "lines": [(1337, 1535)]},
    {"file": "html-editor.html", "title": "HTML editor", "slug": "editor", "lines": [(1538, 1565)]},
    {
        "file": "interactive.html",
        "title": "Interactive",
        "slug": "interactive",
        "lines": [(1741, 1897)],
        "sidebar": [("#tabs", "Tabs"), ("#accordion", "Accordion"), ("#modal", "Modal")],
    },
    {"file": "media.html", "title": "Media", "slug": "media", "lines": [(1900, 2046)]},
    {"file": "javascript-api.html", "title": "JavaScript API", "slug": "api", "lines": [(2047, 2136)]},
    {"file": "templates.html", "title": "Page templates", "slug": "templates", "lines": [(2139, 2688)]},
    {"file": "content.html", "title": "Marketing & content", "slug": "content", "lines": [(2689, 2879)]},
    {"file": "commerce.html", "title": "Commerce & profile", "slug": "commerce", "lines": [(2882, 3195)]},
    {"file": "utilities.html", "title": "Utilities", "slug": "utilities", "lines": [(3198, 3256)]},
]


def read_lines(path: pathlib.Path) -> list[str]:
    return path.read_text(encoding="utf-8").splitlines(keepends=True)


def extract(lines: list[str], ranges: list[tuple[int, int]]) -> str:
    out: list[str] = []
    for start, end in ranges:
        out.extend(lines[start - 1 : end])
    return "".join(out)


def fix_asset_paths(html: str, depth: str) -> str:
    """depth is '../' for docs/ pages."""
    html = html.replace('href="downstage-icons.svg#', f'href="{depth}downstage-icons.svg#')
    html = html.replace("href='downstage-icons.svg#", f"href='{depth}downstage-icons.svg#")
    return html


def sidebar_html(items: list[tuple[str, str]], current_slug: str) -> str:
    nav = "\n".join(
        f'            <a href="{href}">{label}</a>' for href, label in items
    )
    return f"""      <div class="docs-layout doc-page-docs-inner">
        <aside class="docs-sidebar">
          <div class="docs-sidebar-title">On this page</div>
          <nav class="docs-nav" aria-label="Section">
{nav}
          </nav>
        </aside>
        <div class="docs-content doc-stack">
"""


def postprocess(name: str, body: str) -> str:
    if name == "getting-started.html":
        body = body.replace(
            '<section class="demo-section">\n      <p class="demo-section-title">02 — Palette',
            '<section class="demo-section" id="palette">\n      <p class="demo-section-title">02 — Palette',
            1,
        )
        body = body.replace(
            '<section class="demo-section">\n      <p class="demo-section-title">03 — Typography',
            '<section class="demo-section" id="typography">\n      <p class="demo-section-title">03 — Typography',
            1,
        )
    if name == "apps.html":
        body = body.replace(
            "<div data-kanban data-kanban-demo></div>",
            '<div data-kanban data-kanban-fetch-url="../demo/kanban-board.json" '
            'data-kanban-move-url="https://httpbin.org/post" data-kanban-move-method="POST" '
            'data-kanban-move-credentials="omit"></div>',
        )
        body = body.replace(
            "<code class=\"text-mono\">demo/kanban-board.json</code>",
            "<code class=\"text-mono\">../demo/kanban-board.json</code>",
        )
    return body


def nav_docs(active: str) -> str:
    """active is slug: start, icons, ..."""
    links = [
        ("start", "getting-started.html", "Getting started"),
        ("icons", "icons.html", "Icons"),
        ("foundation", "foundation.html", "Layout & forms"),
        ("apps", "apps.html", "Apps & data"),
        ("editor", "html-editor.html", "HTML editor"),
        ("interactive", "interactive.html", "Interactive"),
        ("media", "media.html", "Media"),
        ("api", "javascript-api.html", "JavaScript API"),
        ("templates", "templates.html", "Templates"),
        ("content", "content.html", "Marketing"),
        ("commerce", "commerce.html", "Commerce"),
        ("utilities", "utilities.html", "Utilities"),
    ]
    parts = []
    for slug, href, label in links:
        # Active state is applied at runtime by demo/demo.js (syncDocsBrowseDropdownActive).
        parts.append(f'              <a href="{href}" class="navbar-dropdown-link">{label}</a>')
    inner = "\n".join(parts)
    doc_nav_active = " active" if active == "hub" else ""
    return f"""  <nav class="navbar" id="main-nav">
    <div class="navbar-inner">
      <a class="navbar-brand" href="../index.html">
        <svg class="icon" width="20" height="20">
          <use href="../downstage-icons.svg#hash" />
        </svg>
        downstage<span class="text-muted">.css</span>
      </a>

      <button class="navbar-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="navbar-menu">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div class="navbar-menu" id="navbar-menu">
        <div class="navbar-menu-scroll">
          <a href="../index.html" class="navbar-link">Home</a>
          <a href="index.html" class="navbar-link{doc_nav_active}">Documentation</a>

          <details class="navbar-dropdown">
            <summary class="navbar-dropdown-summary">
              Browse
              <svg class="icon icon-sm navbar-dropdown-chevron" aria-hidden="true">
                <use href="../downstage-icons.svg#chevron-down" />
              </svg>
            </summary>
            <div class="navbar-dropdown-panel" role="group" aria-label="Documentation sections">
{inner}
            </div>
          </details>

          <div class="navbar-actions">
            <div class="btn-group" role="group" aria-label="Theme">
              <button class="btn btn-sm" data-set-theme="light" aria-label="Light theme">
                <svg class="icon"><use href="../downstage-icons.svg#sun" /></svg>
              </button>
              <button class="btn btn-sm" data-set-theme="dark" aria-label="Dark theme">
                <svg class="icon"><use href="../downstage-icons.svg#moon" /></svg>
              </button>
              <button class="btn btn-sm" data-set-theme="auto" aria-label="Auto theme">Auto</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
"""


def footer_docs() -> str:
    return """  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">
            <svg class="icon" width="20" height="20">
              <use href="../downstage-icons.svg#hash" />
            </svg>
            downstage.css
          </div>
          <p class="footer-tagline">Minimal Nordic design system — zero dependencies.</p>
        </div>
        <div>
          <div class="footer-title">Documentation</div>
          <ul class="footer-links">
            <li><a href="index.html">All sections</a></li>
            <li><a href="getting-started.html">Getting started</a></li>
            <li><a href="javascript-api.html">JavaScript API</a></li>
          </ul>
        </div>
        <div>
          <div class="footer-title">Site</div>
          <ul class="footer-links">
            <li><a href="../index.html">Home</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <div>© 2026 <a href="https://web.ap.it" target="_blank" rel="noopener">Andrea Pollastri</a></div>
      </div>
    </div>
  </footer>
"""


def wrap_page(title: str, slug: str, body: str, sidebar: list[tuple[str, str]] | None) -> str:
    depth = "../"
    body = fix_asset_paths(body, depth)
    if sidebar:
        body = sidebar_html(sidebar, slug) + body + "        </div>\n      </div>\n"
    return f"""<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} — downstage.css</title>
  <link rel="stylesheet" href="{depth}downstage.css">
  <link rel="stylesheet" href="{depth}demo/demo.css">
  <link rel="stylesheet" href="{depth}demo/docs.css">
</head>
<body class="doc-page">
  <div hidden></div>
  <object data="{depth}downstage-icons.svg" type="image/svg+xml" style="display:none" aria-hidden="true"></object>

{nav_docs(slug)}

  <main class="container doc-page-main">
{body}  </main>

{footer_docs()}
  <script>window.__DOWNSTAGE_LOCALE_BASE__ = "{depth}locales/";</script>
  <script src="{depth}downstage.js" defer></script>
  <script src="{depth}demo/demo.js" defer></script>
</body>
</html>
"""


def hub_page() -> str:
    """Documentation home — card grid linking to all sections."""
    cards = [
        ("getting-started.html", "Getting started", "Install, theme tokens, palette, and typography."),
        ("icons.html", "Icons", "SVG sprite, sizing, and the full icon grid."),
        ("foundation.html", "Layout & forms", "Grid, buttons, form controls, and tables."),
        ("apps.html", "Apps & data", "Auth shells, combobox, search, Kanban, and data tables."),
        ("html-editor.html", "HTML editor", "Toolbar, links modal, and contenteditable patterns."),
        ("interactive.html", "Interactive", "Tabs, accordion, modal, and vertical nav."),
        ("media.html", "Media", "Image frames, gallery, lightbox, slider, video, and audio."),
        ("javascript-api.html", "JavaScript API", "window.Downstage modules, i18n, and mount()."),
        ("templates.html", "Page templates", "Dashboard, portfolio, blog, and link-in-bio layouts."),
        ("content.html", "Marketing & content", "About, team, and timeline patterns."),
        ("commerce.html", "Commerce & profile", "Shop, cart, checkout, and account profile."),
        ("utilities.html", "Utilities", "Image filter classes and helpers."),
    ]
    grid = []
    for href, title, desc in cards:
        grid.append(
            f"""        <li class="col-6">
          <a href="{href}" class="doc-hub-card">
            <h2 class="doc-hub-card-title">{title}</h2>
            <p class="doc-hub-card-desc text-soft">{desc}</p>
            <span class="doc-hub-card-cta text-sm">Open →</span>
          </a>
        </li>"""
        )
    grid_html = "\n".join(grid)
    return f"""<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documentation — downstage.css</title>
  <link rel="stylesheet" href="../downstage.css">
  <link rel="stylesheet" href="../demo/demo.css">
  <link rel="stylesheet" href="../demo/docs.css">
</head>
<body class="doc-page doc-hub">
  <div hidden></div>
  <object data="../downstage-icons.svg" type="image/svg+xml" style="display:none" aria-hidden="true"></object>

{nav_docs("hub")}

  <main class="container doc-page-main">
    <header class="doc-hub-header">
      <p class="demo-section-title">Documentation</p>
      <h1 class="doc-hub-title">Browse every component</h1>
      <p class="doc-hub-lead text-soft">The gallery is split by topic. Each page uses a sidebar for in-page sections where it helps.</p>
    </header>

    <ul class="grid doc-hub-grid" style="gap: var(--space-6); list-style: none; padding: 0; margin: 0;">
{grid_html}
    </ul>
  </main>

{footer_docs()}
  <script>window.__DOWNSTAGE_LOCALE_BASE__ = "../locales/";</script>
  <script src="../downstage.js" defer></script>
  <script src="../demo/demo.js" defer></script>
</body>
</html>
"""


def main() -> None:
    if not SRC.is_file():
        raise SystemExit(f"Missing {SRC}")
    lines = read_lines(SRC)
    OUT.mkdir(parents=True, exist_ok=True)

    (OUT / "index.html").write_text(hub_page(), encoding="utf-8")
    print("Wrote", OUT / "index.html")

    for page in PAGES:
        name = page["file"]
        body = extract(lines, page["lines"])
        body = postprocess(name, body)
        sidebar = page.get("sidebar")
        html = wrap_page(page["title"], page["slug"], body, sidebar)
        (OUT / name).write_text(html, encoding="utf-8")
        print("Wrote", OUT / name)

    print("Done.")


if __name__ == "__main__":
    main()
