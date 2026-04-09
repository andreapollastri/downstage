# downstage.css

Minimal Nordic Design System — lightweight, zero dependencies, built for
sites and web apps where content comes before ornament.

Clean typography, warm desaturated palette, thin borders, no heavy shadows,
integrated dark mode.

---

## File structure

```
your-project/
├── downstage.css            ← styles (required)
├── downstage.js             ← interactivity (optional)
├── downstage-icons.svg      ← 170+ icon sprite
├── fonts/                   ← Space Grotesk self-hosted
└── index.html
```

---

## Quick start

```html
<!DOCTYPE html>
<html lang="en" data-theme="auto">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="downstage.css" />
    <script src="downstage.js" defer></script>
  </head>
  <body>
    <main class="container">
      <h1>Hello world</h1>
      <button class="btn btn-primary">
        <svg class="icon"><use href="downstage-icons.svg#rocket" /></svg>
        Launch
      </button>
    </main>
  </body>
</html>
```

---

## Theme (light / dark / auto)

`data-theme` on `<html>` accepts `light`, `dark` or `auto` (follows system).
Automatic theme switcher by adding buttons with `data-set-theme`:

```html
<button data-set-theme="light">Light</button>
<button data-set-theme="dark">Dark</button>
<button data-set-theme="auto">Auto</button>
```

`downstage.js` intercepts them, persists in `localStorage`, marks the active one.

---

## CSS variables

| Token                                                 | Usage                   |
| ----------------------------------------------------- | ----------------------- |
| `--bg` `--bg-elevated` `--bg-sunken`                  | 3-level backgrounds     |
| `--text` `--text-soft` `--text-muted` `--text-subtle` | 4-level text            |
| `--border` `--border-strong`                          | Thin and strong borders |
| `--brand-primary` `--brand-secondary`                 | Sage + taupe            |
| `--color-success/danger/warning/info`                 | Semantic colors         |
| `--space-1`...`--space-24`                            | Spacing scale (4–96px)  |
| `--radius` `--radius-sm` `--radius-lg`                | Border radius           |
| `--fs-xs`...`--fs-3xl`                                | Type scale              |

---

## Icons

SVG sprite with 170+ minimal stroke icons. They inherit `currentColor`
and scale with font-size.

```html
<svg class="icon"><use href="downstage-icons.svg#rocket" /></svg>
<svg class="icon icon-lg"><use href="downstage-icons.svg#download" /></svg>
```

Sizes: `.icon-sm`, `.icon`, `.icon-lg`, `.icon-xl`, `.icon-2xl`.

**Categories:** navigation/arrows, actions (edit/save/delete/copy),
file types (file/pdf/image/code), communication (mail/bell/phone),
user/social, dev/tech (rocket/code/terminal/github/database/server/cloud),
media, status (info/alert/lock), time/place, misc.

See `index.html` for the full gallery with names.

---

## Components

### Layout

`.container` · `.stack` · `.cluster` · `.grid` + `.col-N` · `.grid-auto`

### Buttons

`.btn` · `.btn-primary` · `.btn-secondary` · `.btn-ghost` · `.btn-danger` ·
`.btn-danger-solid` · `.btn-success`. Modifiers: `.btn-sm`, `.btn-lg`,
`.btn-block`. Works on `<button>` and `<a>`.

### Forms

`.field` + `.label` + `.input` / `.textarea` / `.select`, `.check`, `.switch`,
`.field.has-error`.

### Navbar (top + mobile hamburger)

```html
<nav class="navbar" id="main-nav">
  <div class="navbar-inner">
    <a class="navbar-brand" href="/">brand</a>

    <button class="navbar-toggle" aria-label="Menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>

    <div class="navbar-menu">
      <a href="#" class="navbar-link active">Home</a>
      <a href="#" class="navbar-link">Docs</a>
      <div class="navbar-actions">
        <a href="#" class="btn btn-sm btn-primary">Sign up</a>
      </div>
    </div>
  </div>
</nav>
```

`downstage.js` handles hamburger toggle, link close, Esc, resize.

### Breadcrumb

```html
<ol class="breadcrumb">
  <li>
    <a href="#"
      ><svg class="icon"><use href="downstage-icons.svg#home" /></svg
    ></a>
  </li>
  <li><a href="#">Section</a></li>
  <li>Current page</li>
</ol>
```

### Tabs

```html
<div class="tabs" data-tabs>
  <ul class="tabs-list" role="tablist">
    <li><button class="tab" data-tab="t1">One</button></li>
    <li><button class="tab" data-tab="t2">Two</button></li>
  </ul>
  <div class="tab-panel" data-tab-panel="t1">Content one</div>
  <div class="tab-panel" data-tab-panel="t2">Content two</div>
</div>
```

Auto-init via `data-tabs`. Arrow keys ←/→ for keyboard navigation.

### Accordion

```html
<div class="accordion" data-accordion="single">
  <div class="accordion-item">
    <button class="accordion-header">
      Question
      <svg class="icon accordion-icon">
        <use href="downstage-icons.svg#plus" />
      </svg>
    </button>
    <div class="accordion-content">
      <div class="accordion-body">Answer...</div>
    </div>
  </div>
</div>
```

`data-accordion="single"` = exclusive (one at a time). Without = independent.

### Image frame

```html
<figure class="image-frame is-16-9">
  <div class="image-media"><img src="..." alt="..." /></div>
  <figcaption class="image-caption">Caption</figcaption>
</figure>
```

Aspect ratios: `.is-square`, `.is-4-5`, `.is-16-9`, `.is-3-2`.

### Gallery + Lightbox

```html
<div class="gallery gallery-4" data-lightbox="set-name">
  <a href="big1.jpg" class="gallery-item"><img src="thumb1.jpg" alt="" /></a>
  <a href="big2.jpg" class="gallery-item"><img src="thumb2.jpg" alt="" /></a>
</div>
```

`data-lightbox` activates the overlay on click. Arrow keys ←/→ to navigate,
Esc to close. Variants: `.gallery-2/3/4` or auto-fit by default.

### File card

```html
<a href="..." class="file-card">
  <span class="file-card-icon">
    <svg class="icon icon-xl"><use href="downstage-icons.svg#file-pdf" /></svg>
  </span>
  <div class="file-card-body">
    <div class="file-card-title">contract.pdf</div>
    <div class="file-card-meta">2.4 MB · 12 pages</div>
  </div>
  <svg class="icon"><use href="downstage-icons.svg#download" /></svg>
</a>
```

### Footer

```html
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-grid">
      <div>...brand...</div>
      <div>
        <div class="footer-title">Section</div>
        <ul class="footer-links">
          <li><a href="#">Link</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div>© 2026</div>
      <div class="footer-social">
        <a href="#"
          ><svg class="icon"><use href="downstage-icons.svg#github" /></svg
        ></a>
      </div>
    </div>
  </div>
</footer>
```

### Card · Alert · Badge · Modal · Table · Kbd

See `index.html` for complete markup examples.

---

## JavaScript API

`downstage.js` exposes `window.Downstage` with modules:

```js
Downstage.theme.set("dark");
Downstage.theme.get();
Downstage.lightbox.open(set, index);
Downstage.lightbox.close();
```

All modules (`theme`, `navbar`, `tabs`, `accordion`, `lightbox`) have
`init()` called automatically on `DOMContentLoaded`. If you add DOM
dynamically, call init again on the new node.

---

## Philosophy

1. **CSS variables, not utility classes** — readability > brevity
2. **Semantic components** — `.btn-primary`, not `.bg-black .text-white .px-4...`
3. **Single source of truth for theming** — change variables and everything adapts
4. **Optional JS** — the site works without it, JS only adds behaviors
5. **Mobile-first but not rigid** — grid collapses at 768px, no unnecessary breakpoints
6. **Built-in accessibility** — focus visible, prefers-reduced-motion, ARIA, AA contrast

---

## Customization

Override variables in a CSS file after `downstage.css`:

```css
:root {
  --brand-primary: #2c5f5d;
  --radius: 2px;
  --container: 800px;
}
[data-theme="dark"] {
  --brand-primary: #7fbfa3;
}
```

---

## License

- **CSS / JS / Icons**: MIT
- **Space Grotesk**: SIL Open Font License (OFL)
