# downstage.css

Minimal Nordic design system — lightweight, zero dependencies, for sites and web apps where content comes before ornament. **downstage.js** adds **JavaScript with built-in components** (tabs, lightbox, HTML editor, Kanban, data table, i18n, and more).

Clean typography, warm desaturated palette, thin borders, light shadows, integrated dark mode.

## Table of contents

1. [File structure](#file-structure)
2. [Quick start](#quick-start)
3. [Theme](#theme-light--dark--auto)
4. [Design tokens (CSS variables)](#design-tokens-css-variables)
5. [Typography & text utilities](#typography--text-utilities)
6. [Icons](#icons)
7. [Layout](#layout)
8. [Components](#components)
9. [Utilities](#utilities)
10. [JavaScript (`downstage.js`)](#javascript-downstagejs)
11. [HTML editor (detailed)](#html-editor-detailed)
12. [Demo page](#demo-page)
13. [Philosophy](#philosophy)
14. [Customization](#customization)
15. [License](#license)

---

## File structure

```
your-project/
├── downstage.css            ← styles (required)
├── downstage.js             ← JS with built-in components (~few KB)
├── downstage-icons.svg      ← 170+ icon sprite (stroke icons)
├── fonts/                   ← Space Grotesk (self-hosted)
├── demo/                    ← gallery-only assets (not required in your app)
│   ├── demo.css             ← page-specific styles for `index.html`
│   ├── demo.js              ← page-specific scripts for `index.html`
│   └── kanban-board.json    ← sample Kanban payload for the demo
└── index.html               ← full component gallery (reference)
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

Layout and styling work from **CSS alone**; **`downstage.js`** layers **built-in interactive components** (theme persistence, navbar, tabs, accordion, lightbox, HTML editor, combobox, Kanban, data table, and more).

---

## Theme (light / dark / auto)

Set `data-theme` on `<html>` to `light`, `dark`, or `auto` (follows `prefers-color-scheme`).

Wire theme buttons (any element):

```html
<button type="button" data-set-theme="light">Light</button>
<button type="button" data-set-theme="dark">Dark</button>
<button type="button" data-set-theme="auto">Auto</button>
```

With `downstage.js`, clicks persist the choice under **`localStorage`** key `downstage-theme`, sync `<html data-theme>`, and toggle `btn-primary` on the active control.

**API:** `Downstage.theme.get()` → `'light' | 'dark' | 'auto'` (falls back to stored or `'light'`). `Downstage.theme.set('dark')` applies immediately.

---

## Design tokens (CSS variables)

| Token | Role |
| ----- | ---- |
| `--bg`, `--bg-elevated`, `--bg-sunken`, `--bg-hover` | Surfaces |
| `--text`, `--text-soft`, `--text-muted`, `--text-subtle` | Text hierarchy |
| `--border`, `--border-strong` | Hairline borders |
| `--link`, `--link-hover` | Links |
| `--brand-primary`, `--brand-secondary` | Brand (sage / taupe) |
| `--color-success`, `--color-danger`, `--color-warning`, `--color-info` | Semantic |
| `--space-1` … `--space-24` | Spacing (4–96px scale) |
| `--radius`, `--radius-sm`, `--radius-lg` | Corners |
| `--fs-xs` … `--fs-3xl`, `--lh-*`, `--fw-*` | Type scale |
| `--container`, `--container-narrow`, `--container-wide` | Max widths |
| `--shadow`, `--shadow-lg` | Shadows |
| `--z-modal`, … | Stacking |

Override in a stylesheet **after** `downstage.css` (see [Customization](#customization)).

---

## Typography & text utilities

Semantic headings `h1`–`h6` use the type scale. Utility classes:

- **Size / tone:** `.text-xs`, `.text-sm`, `.text-muted`, `.text-soft`, `.text-subtle`
- **Font:** `.text-mono` (tabular figures where relevant)
- **Alignment:** `.text-left`, `.text-center`, `.text-right`
- **Spacing helpers:** `.mt-*`, `.mb-*` (0, 2, 4, 6, 8, 10, 12, 16)
- **Screen readers:** `.sr-only` (visually hidden, available to AT)

Code: `code`, `kbd`, `pre` are styled in the base sheet.

---

## Icons

SVG sprite (`downstage-icons.svg`) with **170+** stroke icons; color follows `currentColor`.

```html
<svg class="icon" aria-hidden="true"><use href="downstage-icons.svg#rocket" /></svg>
```

**Size classes:** `.icon-sm`, `.icon` (default), `.icon-lg`, `.icon-xl`, `.icon-2xl`.

**Families:** navigation, actions, files, comms, users, dev/tech, media, status, time/place, misc. The gallery in `index.html` lists symbol ids.

---

## Layout

| Utility | Description |
| ------- | ----------- |
| `.container` / `.container-narrow` / `.container-wide` | Centered horizontal padding + max-width |
| `.stack` / `.stack-sm` / `.stack-lg` | Vertical flex column + gap |
| `.cluster` | Horizontal flex, wrap, gap (actions, tags) |
| `.grid` | 12-column grid; children `.col-1` … `.col-12` |
| `.grid-auto` | Auto-fit minmax column grid (where used in demos) |

The grid collapses for small viewports (see breakpoints in CSS — mobile-first around **768px** for nav).

---

## Components

Below: class names, required markup hooks, and `downstage.js` behavior where applicable. **`index.html`** is the canonical visual reference for every block.

### Buttons

`.btn` + variant: `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-danger-solid`, `.btn-success`. Modifiers: `.btn-sm`, `.btn-lg`, `.btn-block`. Use on `<button>` or `<a>`.

### Forms

- **Field:** `.field` wrapping `.label` + `.input` / `.textarea` / `.select`
- **States:** `.field.has-error`, `.error`, `.help`
- **Controls:** `.check` (checkbox), `.switch` + `.switch-slider`
- **Minimal:** `.input-minimal`, `.select-minimal` (underline style)

### Navbar

`.navbar` > `.navbar-inner` > brand, `.navbar-toggle` (three spans), `.navbar-menu` with `.navbar-link`, optional `.navbar-actions`, optional `details.navbar-dropdown` with `.navbar-dropdown-link`.

**JS:** toggles `.is-open`, updates `aria-expanded`, closes on link click / Esc / resize to desktop; locks body scroll on small viewports when open.

### Breadcrumb

`ol.breadcrumb` with `li` + links; first item often a home icon.

### Tabs

```html
<div class="tabs" data-tabs>
  <ul class="tabs-list" role="tablist">…</ul>
  <div class="tab-panel" data-tab-panel="id">…</div>
</div>
```

Buttons use `role="tab"`, `data-tab="id"`, class `.tab` (active state `.active`). Panels: `data-tab-panel="id"`.

**JS:** `[data-tabs]` — activates panels; **← / →** move focus between tabs.

### Accordion

`.accordion` with `[data-accordion="single"]` (only one open) or omit for independent items. Structure: `.accordion-item` > `.accordion-header` + `.accordion-content` > `.accordion-body`. Open state: `.accordion-item.is-open`.

### Table

`.table-wrap` (scroll / focus) > `table.table`. Variants: `.table-minimal`, `.table-compact`, `.table-striped` (combinable).

### Card, alert, badge

- **Card:** `.card`, `.card-header`, `.card-footer`
- **Alert:** `.alert` + `.alert-info` | `.alert-success` | `.alert-warning` | `.alert-danger`
- **Badge:** `.badge` + same semantic suffixes

### Modal

`.modal-overlay` (fixed backdrop) > `.modal` with `.modal-title`, `.modal-body`, `.modal-footer`. Toggle visibility with `.hidden` on the overlay. Click backdrop to close is optional (see demo).

### Image frame

`.image-frame` + ratio class `.is-square`, `.is-4-5`, `.is-16-9`, `.is-3-2` > `.image-media` > `img`, optional `.image-caption`.

### Gallery + lightbox

`.gallery` (optional `.gallery-2` / `3` / `4`) + `[data-lightbox="unique-set-name"]`. Items: `a.gallery-item` pointing to full-size `href`, thumbnail `img` inside.

**JS:** builds a single `.lightbox` at end of `body`; **`Downstage.lightbox.open(arrayOf { src, alt }, index)`** and **`close()`**. Clicks on gallery items call `open` with the derived set. Keys: Esc, ← / →.

### Slider / carousel

```html
<div class="slider" data-slider>
  <div class="slider-track">
    <div class="slider-slide">…</div>
  </div>
</div>
```

**Attributes:** `data-slider-dots`, `data-slider-arrows`, `data-slider-auto="5000"` (ms). Optional markup: `.slider-prev`, `.slider-next`, `.slider-dots` > `.slider-dot` (generated if missing when dots/arrows requested).

### Video player

```html
<div class="video-player" data-video-player>
  <video src="…"></video>
</div>
```

**JS:** injects controls (play, progress, time, mute, fullscreen), removes native `controls` attribute.

### Audio player

```html
<div class="audio-player" data-audio-player data-src="file.mp3" data-title="Title" data-artist="Artist"></div>
```

**JS:** builds minimal UI if empty; uses Web Audio `Audio` element.

### File upload (drag & drop)

Root **`[data-upload-drop]`** must contain:

- `input[type=file]` (often class `.sr-only`)
- `.upload-drop-zone`
- optional `ul.upload-drop-list` for filenames

Merges dropped files into the input; click on zone opens file dialog.

### HTML editor

See [HTML editor (detailed)](#html-editor-detailed).

### App UI (auth, combobox, Kanban, data table)

Markup plus **`downstage.js`** built-in behaviors for sign-in flows, autocomplete fields, boards, and tables. Demos: `#auth`, `#app-data` in `index.html`.

#### Authentication shells

Centered **`.auth-shell`** (optional min-height) wraps **`.auth-card`** (max-width, padding). Use **`.auth-brand`**, **`.auth-title`**, **`.auth-subtitle`**, **`.auth-form`**, **`.auth-actions`**, **`.auth-footer`**, **`.auth-links-row`**. Wide variant: **`.auth-card-wide`**. **`.auth-otp`** holds one-character inputs for 2FA codes (pair with your own paste / validation logic).

#### Combobox (autocomplete select)

**`.combobox`** > **`.combobox-input-wrap`** > **`.combobox-input`** + **`.combobox-list`** > **`.combobox-option`**. States: **`.is-open`**, **`.is-active`** (keyboard highlight), **`.combobox-empty`**, **`.combobox-loading`**. Search-style icon: **`.combobox--search`** (icon + padded input).

**Declarative:** **`[data-combobox]`** with optional **`data-combobox-local='[{"value":"…","label":"…"},…]'`**, **`data-combobox-fetch="/api?q="`** (GET, JSON array or `{ results: [] }`), **`data-combobox-placeholder`**, **`data-combobox-name`**, **`data-combobox-min-chars`**, **`data-combobox-debounce`**.

**JS:** **`Downstage.combobox.mount(el, options)`** — `options`: `options` (local array), `fetchOptions(query)` (async), `fetchUrl` (same-origin friendly), `minChars`, `debounceMs`, `placeholder`, `name`, `value`, `prependIcon: 'search'`. Emits **`combobox-change`** on the root when a value is chosen.

#### Search autocomplete

**`.search-autocomplete`** (optional **`.search-autocomplete--wide`**) wraps the same combobox pattern with a leading search icon. **`Downstage.searchAutocomplete.mount(el, options)`** — `fetchSuggestions` or `fetchOptions` / `fetchUrl` like the combobox.

#### Kanban

**`.kanban-board`** (horizontal scroll) > **`.kanban-column`** > header **`.kanban-column-header`** + **`.kanban-column-body`** > **`.kanban-card`** (draggable). Toolbar: **`.kanban-toolbar`**. Drop highlight: **`.kanban-column.is-drop-target`**.

**JS — AJAX:** Prefer **`fetchUrl`** + **`moveUrl`** (built-in `fetch`). **`fetchUrl`** — GET JSON shaped as `{ columns: [...] }` (each column: `id`, `title`, `cards: [{ id, title, meta? }]`). **`moveUrl`** — POST (or **`moveMethod`**: `PATCH`, etc.) with JSON body `{ cardId, fromColumnId, toColumnId, toIndex }`. Cross-origin **`moveUrl`** uses `credentials: omit` unless you set **`moveCredentials`**. Optional **`fetchCredentials`** for the board request.

**Programmatic:** **`Downstage.kanban.mount(el, { fetchUrl, moveUrl, fetchBoard, moveCard, initialColumns })`** — custom **`fetchBoard`** / **`moveCard`** override URL-based helpers.

**Declarative:** **`data-kanban-fetch-url`**, **`data-kanban-move-url`**, **`data-kanban-move-method`**, **`data-kanban-move-credentials`**, **`data-kanban-fetch-credentials`**. Demo: **`[data-kanban][data-kanban-demo]`** loads **`demo/kanban-board.json`** and POSTs moves to **`https://httpbin.org/post`** (replace with your API).

#### Data table

**`.data-table-wrap`** > **`.data-table-toolbar`** (search) + **`.data-table-scroll`** > **`table.table.data-table`** + **`.data-table-footer`** with **`.data-table-pagination`**. Sortable headers: **`th.sortable`** + **`.sort-indicator`**. Loading: **`.data-table-wrap.is-loading`**.

**JS:** **`Downstage.dataTable.mount(el, options)`** — `columns: [{ key, label, sortable? }]`, `mode: 'local' | 'remote'`, `rows` (local), `pageSize`, `fetchRemote({ page, pageSize, sortKey, sortDir, q })` → `Promise<{ rows, total }>`. Local demo: **`[data-data-table][data-data-table-demo]`**.

### File card

`a.file-card` with `.file-card-icon`, `.file-card-body`, `.file-card-title`, `.file-card-meta`.

### Footer

`.footer` > `.footer-inner` > `.footer-grid`, `.footer-title`, `.footer-links`, `.footer-bottom`, `.footer-social`.

### Page templates (demo sections in `index.html`)

| Anchor | Highlights |
| ------ | ---------- |
| `#docs-demo` | `.docs-layout`, `.docs-sidebar`, `.docs-content`, in-page `.docs-nav` |
| `#dashboard-demo` | `.stat-card`, charts, data density |
| `#portfolio` | `.portfolio`, `.portfolio-item`, `.portfolio--minimal` |
| `#blog` | `.blog-list`, `.blog-card`, minimal variants |
| `#links` | `.link-list`, `.link-item` (link-in-bio style) |
| `#about` | Split layout, `.about-*` |
| `#profile` | `.profile-shell`, `.profile-block` |
| `#team` | `.team-grid`, `.team-card`, `.team-avatar` |
| `#timeline` | `ol.timeline`, `.timeline-item`, `.timeline--compact` |
| `#shop` | `.shop-grid`, `.shop-card`, `.product-detail`, `.cart`, checkout / payment panels |
| `#auth` | `.auth-shell`, `.auth-card`, sign in / sign up / recovery / 2FA patterns |
| `#app-data` | Combobox, search autocomplete, Kanban, data table (JS-backed demos) |
| `#filters` | Image filter classes (see [Utilities](#utilities)) |

### Sidebar nav (settings-style)

`nav.nav-vertical` with `a` / `.active` — used beside modal in the demo.

---

## Utilities

- **Images:** `.img-bw`, `.img-sepia`, `.img-muted`, `.img-warm`; hover variants `.img-bw-hover`, `.img-sepia-hover` (hover clears filter). See `#filters` in `index.html`.
- **Display / flex helpers:** as in CSS (e.g. utility clusters in demos).
- **Reduced motion:** `prefers-reduced-motion` respected where transitions are used.

---

## JavaScript (`downstage.js`)

Global: **`window.Downstage`**. Every module exposes **`init()`**, invoked once on **`DOMContentLoaded`**. After adding new DOM that uses a module, call **`Downstage.<name>.init()`** again (or only that module).

### `Downstage.theme`

| Method | Description |
| ------ | ----------- |
| `get()` | Current theme (`localStorage` + `<html data-theme>`). |
| `set('light' \| 'dark' \| 'auto')` | Sets attribute, persists, updates `[data-set-theme]` button styles. |
| `init()` | Restores saved theme; binds `[data-set-theme]` buttons. |

### `Downstage.navbar`

| Selector / behavior |
| --------------------- |
| `.navbar` with `.navbar-toggle` + `.navbar-menu` — hamburger, Esc, resize, link close. |

### `Downstage.tabs`

| Selector | Description |
| -------- | ----------- |
| `[data-tabs]` | Binds `.tab` `[data-tab]` to `.tab-panel` `[data-tab-panel]`. |

### `Downstage.accordion`

| Selector | Description |
| -------- | ----------- |
| `[data-accordion]` | Optional `data-accordion="single"` for exclusive panels. |

### `Downstage.lightbox`

| Method | Description |
| ------ | ----------- |
| `init()` | Wires each `[data-lightbox]` gallery: builds `{ src, alt }[]` from `.gallery-item` links. |
| `open(set, index)` | `set`: array of `{ src, alt }`; `index`: starting slide. |
| `close()` | Hides overlay, restores body scroll. |

### `Downstage.slider`

| Selector | Description |
| -------- | ----------- |
| `[data-slider]` | Requires `.slider-track` and `.slider-slide` children. |

### `Downstage.videoPlayer`

| Selector | Description |
| -------- | ----------- |
| `[data-video-player]` | Wraps `<video>`; injects custom controls. |

### `Downstage.audioPlayer`

| Selector | Description |
| -------- | ----------- |
| `[data-audio-player]` | Requires `data-src`; optional `data-title`, `data-artist`. |

### `Downstage.uploadDrop`

| Selector | Description |
| -------- | ----------- |
| `[data-upload-drop]` | File input + drop zone + optional file list (see above). |

### `Downstage.htmlEditor`

| Method / property | Description |
| ----------------- | ----------- |
| `init()` | Mounts `[data-html-editor-mount]` then wires legacy `[data-html-editor]` (without `data-html-editor-mounted`). |
| `mount(target, options?)` | `target`: element or CSS selector. Builds UI, then runs internal setup. Returns the root element or `null`. |
| `presets` | Built-in preset objects (e.g. `demo`) for copy + defaults. |

### `Downstage.combobox`

| Method / selector | Description |
| ----------------- | ----------- |
| `init()` | Mounts `[data-combobox]` (skips `[data-search-autocomplete]`). |
| `mount(el, options)` | Builds combobox; see [App UI](#app-ui-auth-combobox-kanban-data-table). Returns `{ input, hidden, root }`. |

### `Downstage.searchAutocomplete`

| Method / selector | Description |
| ----------------- | ----------- |
| `init()` | Mounts `[data-search-autocomplete]` with `data-search-fetch`, `data-search-placeholder`, etc. |
| `mount(el, options)` | Same as combobox with search icon (`prependIcon` internally). |

### `Downstage.kanban`

| Method / selector | Description |
| ----------------- | ----------- |
| `init()` | Mounts `[data-kanban]`; **`[data-kanban-demo]`** uses `demo/kanban-board.json` + HTTP POST for moves (see README). |
| `mount(el, options)` | **`fetchUrl` / `moveUrl`** (AJAX) or **`fetchBoard` / `moveCard`** functions; optional **`initialColumns`**. Returns `{ refresh }`. |

### `Downstage.dataTable`

| Method / selector | Description |
| ----------------- | ----------- |
| `init()` | Mounts `[data-data-table][data-data-table-demo]` with sample rows. |
| `mount(el, options)` | Local or remote table; `fetchRemote` for server-driven pagination/sort/filter. Returns `{ refresh }`. |

---

## HTML editor (detailed)

The editor uses **`document.execCommand`** on a **`contenteditable`** region (browser-dependent but widely supported). Link insertion uses a modal for URL type (`mailto`, `tel`, custom), **target**, and **`rel`**.

### Mounting

1. **Programmatic**

   ```js
   Downstage.htmlEditor.mount("#editor", {
     preset: "demo",
     initialHtml: "<p>…</p>",
     showRawSwitch: false,
     toolbarExclude: [],
     iconsBase: "downstage-icons.svg",
     uid: "optional-stable-id",
   });
   ```

2. **Declarative** — empty or content-filled container:

   ```html
   <div
     class="html-editor"
     data-html-editor-mount
     data-html-editor-preset="demo"
     data-html-editor-placeholder="…"
     data-html-editor-icons="downstage-icons.svg"
     data-html-editor-show-raw
     data-html-editor-exclude="bold,strikeThrough"
   >
     <p>Optional initial HTML here…</p>
   </div>
   ```

   `data-html-editor-show-raw`: attribute present ⇒ rich/HTML source switch **on**; `="false"` or `="0"` ⇒ **off**.  
   `data-html-editor-exclude`: comma- or space-separated command ids (see below).

### Initial HTML resolution

1. If **`options.initialHtml`** is passed to `mount`, it wins.
2. Else, **inner HTML** of the mount container (before it is cleared) is used.
3. Else, preset default (e.g. demo paragraph).

### Options (merged with preset)

| Option | Default (demo preset) | Description |
| ------ | ---------------------- | ----------- |
| `preset` | `'demo'` | Key in `Downstage.htmlEditor.presets`. |
| `initialHtml` | preset | HTML string for the editable region. |
| `placeholder` | preset | `data-placeholder` on the contenteditable. |
| `iconsBase` | `'downstage-icons.svg'` | Sprite path for modal and toolbar icons. |
| `showRawSwitch` | `false` | If `true`, shows Rich text / HTML source switch and raw `<textarea>`. |
| `toolbarExclude` | `[]` | List of toolbar command ids to **omit** (case-insensitive). |
| `linkModal` | preset object | Shallow merge with preset; nested `linkModal` fields merge for dialog copy. |
| `uid` | random | Suffix for dialog heading id (accessibility). |

**Toolbar command ids** (for `toolbarExclude`):  
`bold`, `italic`, `underline`, `strikeThrough`, `createLink`, `justifyLeft`, `justifyCenter`, `justifyRight`, `justifyFull`, `h1`–`h7`, `p`, `inlineCode`, `blockquote`.

**“H7”:** not a native element; implemented as `<p class="ds-h7">` with `role="heading"` and `aria-level="7"`.

### Legacy markup

You can still hand-write the full editor DOM under **`[data-html-editor]`** (toolbar + content + link modal) and only call **`init()`** — no `data-html-editor-mount`. Do not set `data-html-editor-mounted` unless already initialized.

---

## Demo page

**`index.html`** is the interactive catalog: tutorial, palette, typography, icons, every component block, utilities, and copy-paste snippets. Page-only assets live under **`demo/`** (`demo.css`, `demo.js`, `kanban-board.json` for the Kanban demo). Open **`index.html`** locally or via a static server so SVG `<use href>` resolves correctly (some browsers restrict `file://` external sprites).

---

## Philosophy

1. **CSS variables over utility soup** — readable, themeable tokens.
2. **Semantic components** — `.btn-primary`, not dozens of atomic classes.
3. **One theme surface** — change variables, the whole UI shifts.
4. **JS with built-in components** — **`downstage.js`** ships ready-made modules; core layout and style need only CSS.
5. **Mobile-first** — sensible breakpoints without breakpoint explosion.
6. **Accessibility** — focus styles, contrast, ARIA patterns where components require JS.

---

## Customization

Load a file **after** `downstage.css`:

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

- **CSS / JS / icons** in this repo: **MIT**
- **Space Grotesk** (fonts): **SIL Open Font License (OFL)**
