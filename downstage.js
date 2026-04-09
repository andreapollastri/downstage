/* ============================================================================
   downstage.js — JavaScript helper for downstage.css
   by Andrea Pollastri
   ----------------------------------------------------------------------------
   Zero dependencies. Vanilla JS. Auto-init on DOMContentLoaded.
   JavaScript with built-in components — theme, navbar, tabs, lightbox, slider, media players,
   HTML editor, combobox, search, Kanban, data table, i18n. Exposes window.Downstage.

   Components:
     - Theme switcher        ([data-set-theme])
     - Navbar hamburger      (.navbar)
     - Tabs                  (.tabs)
     - Accordion             (.accordion)
     - Lightbox / Gallery    (.gallery [data-lightbox])
     - File drop zone        ([data-upload-drop])
     - HTML editor           ([data-html-editor-mount] + Downstage.htmlEditor.mount)
   - Combobox              ([data-combobox] + Downstage.combobox.mount)
   - Search autocomplete   ([data-search-autocomplete] + Downstage.searchAutocomplete.mount)
   - Kanban                ([data-kanban] + fetchUrl/moveUrl AJAX or mount callbacks)
   - Data table            ([data-data-table] + Downstage.dataTable.mount)
   - Password visibility   (input[type=password] — eye toggle; opt out with data-password-toggle="off")
   - Copy field           (.input-copy-wrap + .input-copy-btn — clipboard for readonly/disabled inputs)
   ============================================================================ */

(function (window, document) {
  "use strict";

  const Downstage = {};

  var _iconsBase = "downstage-icons.svg";
  function iconsHref(id) { return _iconsBase + "#" + id; }

  /* Built-in English (default fallback; override with locales/*.json or setLocale) */
  /* locales/_embed.js */
  var EMBEDDED_I18N_EN = JSON.parse(
    '{"navbar":{"openMenu":"Open menu","closeMenu":"Close menu"},"password":{"show":"Show password","hide":"Hide password"},"copyField":{"copy":"Copy","copied":"Copied"},"lightbox":{"close":"Close","previous":"Previous","next":"Next"},"slider":{"previous":"Previous","next":"Next","slide":"Slide {n}"},"videoPlayer":{"play":"Play","pause":"Pause","mute":"Mute","unmute":"Unmute","enterFullscreen":"Enter fullscreen","exitFullscreen":"Exit fullscreen"},"audioPlayer":{"play":"Play","pause":"Pause","untitled":"Untitled"},"combobox":{"loading":"Loading…","noResults":"No results"},"searchAutocomplete":{"placeholder":"Search…"},"kanban":{"dragHint":"Drag cards between columns","refresh":"Refresh","loading":"Loading…","noColumns":"No columns","loadFailed":"Failed to load board"},"dataTable":{"filterPlaceholder":"Filter…","filterAria":"Filter table","showing":"Showing {start}–{end} of {total}","noRows":"No rows","pageInfo":"Page {page} / {totalPages}","previous":"Previous","next":"Next"},"htmlEditor":{"initialHtml":"<p>Select text and use the toolbar to format.</p>","placeholder":"Write here…","rawLeft":"Rich text","rawRight":"HTML source","rawSwitchTitle":"Switch to HTML source","rawSwitchAria":"HTML source mode","toolbarAria":"Text formatting","rawTextareaAria":"HTML source","toolbar":{"bold":{"title":"Bold","aria":"Bold"},"italic":{"title":"Italic","aria":"Italic"},"underline":{"title":"Underline","aria":"Underline"},"strikeThrough":{"title":"Strikethrough","aria":"Strikethrough"},"createLink":{"title":"Link","aria":"Insert link","label":"Link"},"justifyLeft":{"title":"Align left","aria":"Align left","label":"◀"},"justifyCenter":{"title":"Align center","aria":"Align center","label":"▣"},"justifyRight":{"title":"Align right","aria":"Align right","label":"▶"},"justifyFull":{"title":"Justify","aria":"Justify","label":"≡"},"h1":{"title":"Heading 1","aria":"Heading 1","label":"H1"},"h2":{"title":"Heading 2","aria":"Heading 2","label":"H2"},"h3":{"title":"Heading 3","aria":"Heading 3","label":"H3"},"h4":{"title":"Heading 4","aria":"Heading 4","label":"H4"},"h5":{"title":"Heading 5","aria":"Heading 5","label":"H5"},"h6":{"title":"Heading 6","aria":"Heading 6","label":"H6"},"h7":{"title":"Heading 7 (styled paragraph)","aria":"Heading 7","label":"H7"},"p":{"title":"Paragraph","aria":"Paragraph","label":"P"},"inlineCode":{"title":"Inline code","aria":"Inline code","html":"&lt;code&gt;"},"blockquote":{"title":"Quote","aria":"Quote","label":"“ ”"}},"linkModal":{"title":"Link","lede":"Website, email, phone, or custom URL (<code class=\\"text-mono\\">mailto:</code>, <code class=\\"text-mono\\">tel:</code>, anchors…).","kindLabel":"Type","kindAria":"Link type","valueLabelPlaceholder":"Address","valueAria":"Link address","valueLabelMailto":"Email address","valueLabelTel":"Phone number","valueLabelCustom":"URL or path","valueLabelUrl":"Web address","placeholderMailto":"name@example.com","placeholderTel":"+1 555 123 4567","placeholderCustom":"page.html#section or /path","placeholderUrl":"https://…","subjectLabel":"Email subject (optional)","subjectPh":"Message subject","targetLabel":"Open link in","relSpan":"<code class=\\"text-mono\\">rel=\\"noopener noreferrer\\"</code> (recommended for new-tab links)","cancel":"Cancel","apply":"Apply","closeAria":"Close dialog","kindOptions":[{"value":"url","label":"Web page (https)"},{"value":"mailto","label":"Email"},{"value":"tel","label":"Phone"},{"value":"custom","label":"Custom URL"}],"targetOptions":[{"value":"_self","label":"Same tab / window"},{"value":"_blank","label":"New tab"}]}}}',
  );

  Downstage.i18n = (function () {
    var basePath = "locales/";
    var currentLocale = "en";

    function deepMerge(a, b) {
      if (a === undefined || a === null) a = {};
      if (b === undefined || b === null) return a;
      if (Array.isArray(b)) return b.slice();
      if (typeof b !== "object") return b;
      var out = {};
      var k;
      for (k in a) out[k] = a[k];
      for (k in b) {
        if (b[k] && typeof b[k] === "object" && !Array.isArray(b[k]) && typeof (out[k] || {}) === "object" && !Array.isArray(out[k])) {
          out[k] = deepMerge(out[k] || {}, b[k]);
        } else {
          out[k] = b[k];
        }
      }
      return out;
    }

    var merged = deepMerge({}, EMBEDDED_I18N_EN);

    function getByPath(obj, path) {
      var parts = path.split(".");
      var o = obj;
      for (var i = 0; i < parts.length; i++) {
        if (o == null) return undefined;
        o = o[parts[i]];
      }
      return o;
    }

    function t(key, vars) {
      var s = getByPath(merged, key);
      if (typeof s !== "string") s = getByPath(EMBEDDED_I18N_EN, key);
      if (typeof s !== "string") return key;
      if (!vars) return s;
      return s.replace(/\{(\w+)\}/g, function (_, k) {
        return vars[k] != null ? String(vars[k]) : "";
      });
    }

    function get(path) {
      var v = getByPath(merged, path);
      if (v !== undefined) return v;
      return getByPath(EMBEDDED_I18N_EN, path);
    }

    function setLocale(code, customMessages) {
      currentLocale = code || "en";
      if (customMessages) {
        merged = deepMerge(deepMerge({}, EMBEDDED_I18N_EN), customMessages);
        return Promise.resolve();
      }
      if (code === "en") {
        return fetch(basePath + "en.json")
          .then(function (r) {
            return r.json();
          })
          .then(function (d) {
            merged = deepMerge(deepMerge({}, EMBEDDED_I18N_EN), d);
          })
          .catch(function () {
            merged = deepMerge({}, EMBEDDED_I18N_EN);
          });
      }
      return fetch(basePath + code + ".json")
        .then(function (r) {
          if (!r.ok) throw new Error("locale");
          return r.json();
        })
        .then(function (d) {
          merged = deepMerge(deepMerge({}, EMBEDDED_I18N_EN), d);
        })
        .catch(function () {
          merged = deepMerge({}, EMBEDDED_I18N_EN);
        });
    }

    function configure(options) {
      options = options || {};
      if (options.basePath != null) basePath = options.basePath;
      if (options.messages) {
        merged = deepMerge(deepMerge({}, EMBEDDED_I18N_EN), options.messages);
        if (options.locale) currentLocale = options.locale;
        return Promise.resolve();
      }
      return setLocale(options.locale != null ? options.locale : "en");
    }

    function getLocale() {
      return currentLocale;
    }

    return { configure: configure, setLocale: setLocale, getLocale: getLocale, t: t, get: get };
  })();

  Downstage.configure = function (options) {
    return Downstage.i18n.configure(options);
  };

  /* ==========================================================================
     1. THEME SWITCHER
     Persists in localStorage. Auto-binds to [data-set-theme="light|dark|auto"].
     ========================================================================== */

  Downstage.theme = (function () {
    const KEY = "downstage-theme";
    const html = document.documentElement;

    function get() {
      try {
        return localStorage.getItem(KEY) || "light";
      } catch (e) {
        return "light";
      }
    }

    function set(theme) {
      html.setAttribute("data-theme", theme);
      try {
        localStorage.setItem(KEY, theme);
      } catch (e) {}
      // Update visual state of buttons
      document.querySelectorAll("[data-set-theme]").forEach(function (btn) {
        const isActive = btn.getAttribute("data-set-theme") === theme;
        btn.classList.toggle("btn-primary", isActive);
      });
    }

    function init() {
      set(get());
      document.querySelectorAll("[data-set-theme]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          set(btn.getAttribute("data-set-theme"));
        });
      });
    }

    return { get: get, set: set, init: init };
  })();

  /* ==========================================================================
     2. NAVBAR — hamburger toggle
     Adds .is-open on .navbar. Closes on link click, ESC, resize → desktop.
     ========================================================================== */

  Downstage.navbar = (function () {
    function setup(nav) {
      const toggle = nav.querySelector(".navbar-toggle");
      const menu = nav.querySelector(".navbar-menu");
      if (!toggle || !menu) return;

      function setOpen(open) {
        nav.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? Downstage.i18n.t("navbar.closeMenu") : Downstage.i18n.t("navbar.openMenu"));
        /* Lock page scroll on small viewports so touch scrolls the menu panel, not the body */
        if (window.matchMedia("(max-width: 768px)").matches) {
          document.body.style.overflow = open ? "hidden" : "";
        } else if (!open) {
          document.body.style.overflow = "";
        }
      }

      toggle.addEventListener("click", function () {
        setOpen(!nav.classList.contains("is-open"));
      });

      // Close on navigation link click (not on <summary> dropdown toggles)
      menu.querySelectorAll(".navbar-link, .navbar-dropdown-link").forEach(function (link) {
        link.addEventListener("click", function () {
          setOpen(false);
          if (link.classList.contains("navbar-dropdown-link")) {
            var parentDetails = link.closest("details");
            if (parentDetails) parentDetails.removeAttribute("open");
          }
        });
      });

      // Close with ESC
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && nav.classList.contains("is-open")) {
          setOpen(false);
        }
      });

      // Close when returning to desktop
      const mq = window.matchMedia("(min-width: 769px)");
      const onChange = function (e) {
        if (e.matches) {
          setOpen(false);
          document.body.style.overflow = "";
        }
      };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else mq.addListener(onChange); // Safari < 14
    }

    function init() {
      document.querySelectorAll(".navbar").forEach(setup);
    }

    function mount(target) {
      var el = typeof target === "string" ? document.querySelector(target) : target;
      if (!el) return null;
      setup(el);
      return el;
    }

    return { init: init, mount: mount };
  })();

  /* ==========================================================================
     3. TABS
     Required markup:
       <div class="tabs" data-tabs>
         <ul class="tabs-list" role="tablist">
           <li><button class="tab" role="tab" data-tab="t1">One</button></li>
           <li><button class="tab" role="tab" data-tab="t2">Two</button></li>
         </ul>
         <div class="tab-panel" data-tab-panel="t1">...</div>
         <div class="tab-panel" data-tab-panel="t2">...</div>
       </div>
     ========================================================================== */

  Downstage.tabs = (function () {
    function setup(root) {
      const tabs = root.querySelectorAll("[data-tab]");
      const panels = root.querySelectorAll("[data-tab-panel]");
      if (!tabs.length) return;

      function activate(name) {
        tabs.forEach(function (t) {
          const active = t.getAttribute("data-tab") === name;
          t.classList.toggle("active", active);
          t.setAttribute("aria-selected", active ? "true" : "false");
          t.setAttribute("tabindex", active ? "0" : "-1");
        });
        panels.forEach(function (p) {
          const active = p.getAttribute("data-tab-panel") === name;
          p.classList.toggle("active", active);
          p.setAttribute("aria-hidden", active ? "false" : "true");
        });
      }

      tabs.forEach(function (t) {
        t.addEventListener("click", function () {
          activate(t.getAttribute("data-tab"));
        });

        // Arrow keys ←/→ to navigate between tabs (a11y)
        t.addEventListener("keydown", function (e) {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          e.preventDefault();
          const list = Array.from(tabs);
          const idx = list.indexOf(t);
          const next =
            e.key === "ArrowRight"
              ? list[(idx + 1) % list.length]
              : list[(idx - 1 + list.length) % list.length];
          next.focus();
          activate(next.getAttribute("data-tab"));
        });
      });

      // Activate the first (or the one already marked as .active)
      const initial = root.querySelector("[data-tab].active") || tabs[0];
      activate(initial.getAttribute("data-tab"));
    }

    function init() {
      document.querySelectorAll("[data-tabs]").forEach(setup);
    }

    function mount(target) {
      var el = typeof target === "string" ? document.querySelector(target) : target;
      if (!el) return null;
      setup(el);
      return el;
    }

    return { init: init, mount: mount };
  })();

  /* ==========================================================================
     4. ACCORDION
     Required markup:
       <div class="accordion" data-accordion>  <!-- data-accordion="single" for exclusive -->
         <div class="accordion-item">
           <button class="accordion-header">
             Title
             <svg class="icon accordion-icon"><use href="downstage-icons.svg#plus"/></svg>
           </button>
           <div class="accordion-content">
             <div class="accordion-body">content</div>
           </div>
         </div>
       </div>
     ========================================================================== */

  Downstage.accordion = (function () {
    function setup(root) {
      const single = root.getAttribute("data-accordion") === "single";
      const items = root.querySelectorAll(".accordion-item");

      items.forEach(function (item) {
        const header = item.querySelector(".accordion-header");
        if (!header) return;

        // Setup ARIA
        header.setAttribute(
          "aria-expanded",
          item.classList.contains("is-open") ? "true" : "false",
        );

        header.addEventListener("click", function () {
          const isOpen = item.classList.contains("is-open");

          if (single && !isOpen) {
            items.forEach(function (other) {
              other.classList.remove("is-open");
              const h = other.querySelector(".accordion-header");
              if (h) h.setAttribute("aria-expanded", "false");
            });
          }

          item.classList.toggle("is-open", !isOpen);
          header.setAttribute("aria-expanded", !isOpen ? "true" : "false");
        });
      });
    }

    function init() {
      document.querySelectorAll("[data-accordion]").forEach(setup);
    }

    function mount(target) {
      var el = typeof target === "string" ? document.querySelector(target) : target;
      if (!el) return null;
      setup(el);
      return el;
    }

    return { init: init, mount: mount };
  })();

  /* ==========================================================================
     5. LIGHTBOX
     Minimal markup to activate:
       <div class="gallery" data-lightbox="my-set">
         <a href="big1.jpg" class="gallery-item"><img src="thumb1.jpg" alt=""></a>
         <a href="big2.jpg" class="gallery-item"><img src="thumb2.jpg" alt=""></a>
       </div>
     Creates a single .lightbox instance at the end of body, reused.
     ========================================================================== */

  Downstage.lightbox = (function () {
    let overlay, imgEl, counterEl;
    let currentSet = [];
    let currentIndex = 0;

    function build() {
      overlay = document.createElement("div");
      overlay.className = "lightbox";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.innerHTML =
        '<button class="lightbox-btn lightbox-close" aria-label="' +
        Downstage.i18n.t("lightbox.close") +
        '">' +
        '<svg class="icon" width="20" height="20"><use href="' + iconsHref("x") + '"/></svg>' +
        "</button>" +
        '<button class="lightbox-btn lightbox-prev" aria-label="' +
        Downstage.i18n.t("lightbox.previous") +
        '">' +
        '<svg class="icon" width="20" height="20"><use href="' + iconsHref("chevron-left") + '"/></svg>' +
        "</button>" +
        '<button class="lightbox-btn lightbox-next" aria-label="' +
        Downstage.i18n.t("lightbox.next") +
        '">' +
        '<svg class="icon" width="20" height="20"><use href="' + iconsHref("chevron-right") + '"/></svg>' +
        "</button>" +
        '<img class="lightbox-img" alt="">' +
        '<div class="lightbox-counter"></div>';
      document.body.appendChild(overlay);

      imgEl = overlay.querySelector(".lightbox-img");
      counterEl = overlay.querySelector(".lightbox-counter");

      overlay.querySelector(".lightbox-close").addEventListener("click", close);
      overlay.querySelector(".lightbox-prev").addEventListener("click", prev);
      overlay.querySelector(".lightbox-next").addEventListener("click", next);
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) close();
      });

      document.addEventListener("keydown", function (e) {
        if (!overlay.classList.contains("is-open")) return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
      });
    }

    function open(set, index) {
      if (!overlay) build();
      currentSet = set;
      currentIndex = index;
      render();
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function close() {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    function prev() {
      currentIndex = (currentIndex - 1 + currentSet.length) % currentSet.length;
      render();
    }

    function next() {
      currentIndex = (currentIndex + 1) % currentSet.length;
      render();
    }

    function render() {
      const item = currentSet[currentIndex];
      imgEl.src = item.src;
      imgEl.alt = item.alt || "";
      counterEl.textContent = currentIndex + 1 + " / " + currentSet.length;
      // Show/hide arrows if there's only one image
      const hasMany = currentSet.length > 1;
      overlay.querySelector(".lightbox-prev").style.display = hasMany
        ? ""
        : "none";
      overlay.querySelector(".lightbox-next").style.display = hasMany
        ? ""
        : "none";
    }

    function wireGallery(gallery) {
      const items = gallery.querySelectorAll(".gallery-item");
      const set = Array.from(items).map(function (a) {
        return {
          src:
            a.getAttribute("href") ||
            (a.querySelector("img") && a.querySelector("img").src),
          alt: (a.querySelector("img") && a.querySelector("img").alt) || "",
        };
      });

      items.forEach(function (item, i) {
        item.addEventListener("click", function (e) {
          e.preventDefault();
          open(set, i);
        });
      });
    }

    function init() {
      document.querySelectorAll("[data-lightbox]").forEach(wireGallery);
    }

    function mount(target) {
      var el = typeof target === "string" ? document.querySelector(target) : target;
      if (!el) return null;
      wireGallery(el);
      return el;
    }

    return { init: init, open: open, close: close, mount: mount };
  })();

  /* ==========================================================================
     6. SLIDER / CAROUSEL
     Markup:
       <div class="slider" data-slider>
         <div class="slider-track">
           <div class="slider-slide"><img src="..."></div>
         </div>
       </div>
     Options via data attributes:
       data-slider-dots   — show dot navigation
       data-slider-arrows — show prev/next arrows
       data-slider-auto="5000" — auto-play interval in ms
     ========================================================================== */

  Downstage.slider = (function () {
    function setup(root) {
      var track = root.querySelector(".slider-track");
      if (!track) return;
      var slides = track.querySelectorAll(".slider-slide");
      if (!slides.length) return;

      var current = 0;
      var total = slides.length;
      var dots = [];

      function go(idx) {
        current = ((idx % total) + total) % total;
        track.style.transform = "translateX(-" + current * 100 + "%)";
        dots.forEach(function (d, i) {
          d.classList.toggle("active", i === current);
        });
      }

      if (
        root.hasAttribute("data-slider-arrows") ||
        root.querySelector(".slider-prev")
      ) {
        var prev = root.querySelector(".slider-prev");
        var next = root.querySelector(".slider-next");
        if (!prev) {
          prev = document.createElement("button");
          prev.className = "slider-prev";
          prev.setAttribute("aria-label", Downstage.i18n.t("slider.previous"));
          prev.innerHTML =
            '<svg class="icon" width="18" height="18"><use href="' + iconsHref("chevron-left") + '"/></svg>';
          root.appendChild(prev);
        }
        if (!next) {
          next = document.createElement("button");
          next.className = "slider-next";
          next.setAttribute("aria-label", Downstage.i18n.t("slider.next"));
          next.innerHTML =
            '<svg class="icon" width="18" height="18"><use href="' + iconsHref("chevron-right") + '"/></svg>';
          root.appendChild(next);
        }
        prev.addEventListener("click", function () {
          go(current - 1);
        });
        next.addEventListener("click", function () {
          go(current + 1);
        });
      }

      if (
        root.hasAttribute("data-slider-dots") ||
        root.querySelector(".slider-dots")
      ) {
        var dotsWrap = root.querySelector(".slider-dots");
        if (!dotsWrap) {
          dotsWrap = document.createElement("div");
          dotsWrap.className = "slider-dots";
          root.appendChild(dotsWrap);
        }
        if (!dotsWrap.children.length) {
          for (var i = 0; i < total; i++) {
            var dot = document.createElement("button");
            dot.className = "slider-dot" + (i === 0 ? " active" : "");
            dot.setAttribute("aria-label", Downstage.i18n.t("slider.slide", { n: i + 1 }));
            (function (idx) {
              dot.addEventListener("click", function () {
                go(idx);
              });
            })(i);
            dotsWrap.appendChild(dot);
            dots.push(dot);
          }
        } else {
          dotsWrap.querySelectorAll(".slider-dot").forEach(function (d) {
            dots.push(d);
          });
        }
      }

      var autoVal = root.getAttribute("data-slider-auto");
      if (autoVal) {
        var interval = parseInt(autoVal, 10) || 5000;
        setInterval(function () {
          go(current + 1);
        }, interval);
      }

      go(0);
    }

    function init() {
      document.querySelectorAll("[data-slider]").forEach(setup);
    }

    function mount(target) {
      var el = typeof target === "string" ? document.querySelector(target) : target;
      if (!el) return null;
      setup(el);
      return el;
    }

    return { init: init, mount: mount };
  })();

  /* ==========================================================================
     7. VIDEO PLAYER
     <div class="video-player" data-video-player>
       <video src="..."></video>
     </div>
     ========================================================================== */

  Downstage.videoPlayer = (function () {
    function setup(root) {
      var video = root.querySelector("video");
      if (!video) return;

      if (!root.querySelector(".video-player-controls")) {
        var controls = document.createElement("div");
        controls.className = "video-player-controls";
        controls.innerHTML =
          '<button class="video-btn video-play-btn" aria-label="' +
          Downstage.i18n.t("videoPlayer.play") +
          '">' +
          '<svg class="icon"><use href="' + iconsHref("play") + '"/></svg>' +
          "</button>" +
          '<div class="video-progress"><div class="video-progress-bar"></div></div>' +
          '<span class="video-time">0:00</span>' +
          '<button class="video-btn video-mute-btn" aria-label="' +
          Downstage.i18n.t("videoPlayer.mute") +
          '">' +
          '<svg class="icon"><use href="' + iconsHref("volume") + '"/></svg>' +
          "</button>" +
          '<button type="button" class="video-btn video-fullscreen-btn" aria-label="' +
          Downstage.i18n.t("videoPlayer.enterFullscreen") +
          '">' +
          '<svg class="icon"><use href="' + iconsHref("fullscreen") + '"/></svg>' +
          "</button>";
        root.appendChild(controls);
      }

      var overlay = root.querySelector(".video-overlay-play");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "video-overlay-play";
        overlay.innerHTML =
          '<svg class="icon"><use href="' + iconsHref("play") + '"/></svg>';
        root.insertBefore(overlay, root.firstChild.nextSibling);
      }

      var playBtn = root.querySelector(".video-play-btn");
      var progressWrap = root.querySelector(".video-progress");
      var progressBar = root.querySelector(".video-progress-bar");
      var timeEl = root.querySelector(".video-time");
      var muteBtn = root.querySelector(".video-mute-btn");
      var fullscreenBtn = root.querySelector(".video-fullscreen-btn");

      function fmt(s) {
        var m = Math.floor(s / 60);
        s = Math.floor(s % 60);
        return m + ":" + (s < 10 ? "0" : "") + s;
      }

      function togglePlay() {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      }

      function updateUI() {
        var playing = !video.paused;
        root.classList.toggle("is-playing", playing);
        playBtn.setAttribute(
          "aria-label",
          playing ? Downstage.i18n.t("videoPlayer.pause") : Downstage.i18n.t("videoPlayer.play")
        );
        playBtn.innerHTML =
          '<svg class="icon"><use href="' + iconsHref(playing ? "pause" : "play") + '"/></svg>';
      }

      video.addEventListener("play", updateUI);
      video.addEventListener("pause", updateUI);
      video.addEventListener("timeupdate", function () {
        if (video.duration) {
          progressBar.style.width =
            (video.currentTime / video.duration) * 100 + "%";
          timeEl.textContent =
            fmt(video.currentTime) + " / " + fmt(video.duration);
        }
      });

      playBtn.addEventListener("click", togglePlay);
      overlay.addEventListener("click", togglePlay);

      progressWrap.addEventListener("click", function (e) {
        var rect = progressWrap.getBoundingClientRect();
        video.currentTime =
          ((e.clientX - rect.left) / rect.width) * video.duration;
      });

      muteBtn.addEventListener("click", function () {
        video.muted = !video.muted;
        muteBtn.setAttribute(
          "aria-label",
          video.muted ? Downstage.i18n.t("videoPlayer.unmute") : Downstage.i18n.t("videoPlayer.mute")
        );
        muteBtn.innerHTML =
          '<svg class="icon"><use href="' + iconsHref("volume") + '"/></svg>';
        muteBtn.style.opacity = video.muted ? "0.4" : "1";
      });

      function getFullscreenElement() {
        return (
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement
        );
      }

      function requestFs(el) {
        if (el.requestFullscreen) return el.requestFullscreen();
        if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
        if (el.msRequestFullscreen) return el.msRequestFullscreen();
        return Promise.reject();
      }

      function exitFs() {
        if (document.exitFullscreen) return document.exitFullscreen();
        if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
        if (document.msExitFullscreen) return document.msExitFullscreen();
        return Promise.reject();
      }

      function updateFullscreenBtn() {
        if (!fullscreenBtn) return;
        var fs = getFullscreenElement() === root;
        fullscreenBtn.setAttribute(
          "aria-label",
          fs ? Downstage.i18n.t("videoPlayer.exitFullscreen") : Downstage.i18n.t("videoPlayer.enterFullscreen")
        );
        fullscreenBtn.innerHTML =
          '<svg class="icon"><use href="' + iconsHref(fs ? "fullscreen-exit" : "fullscreen") + '"/></svg>';
      }

      if (fullscreenBtn) {
        fullscreenBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          if (getFullscreenElement() === root) {
            exitFs().catch(function () {});
          } else {
            requestFs(root).catch(function () {});
          }
        });

        document.addEventListener("fullscreenchange", updateFullscreenBtn);
        document.addEventListener("webkitfullscreenchange", updateFullscreenBtn);
        document.addEventListener("MSFullscreenChange", updateFullscreenBtn);
        updateFullscreenBtn();
      }

      video.removeAttribute("controls");
    }

    function init() {
      document.querySelectorAll("[data-video-player]").forEach(setup);
    }

    function mount(target) {
      var el = typeof target === "string" ? document.querySelector(target) : target;
      if (!el) return null;
      setup(el);
      return el;
    }

    return { init: init, mount: mount };
  })();

  /* ==========================================================================
     8. AUDIO PLAYER
     <div class="audio-player" data-audio-player data-src="file.mp3"
          data-title="Title" data-artist="Artist">
     </div>
     ========================================================================== */

  Downstage.audioPlayer = (function () {
    function setup(root) {
      var src = root.getAttribute("data-src");
      var title = root.getAttribute("data-title") || Downstage.i18n.t("audioPlayer.untitled");
      var artist = root.getAttribute("data-artist") || "";
      if (!src) return;

      var audio = new Audio(src);
      audio.preload = "metadata";

      if (!root.querySelector(".audio-btn")) {
        root.innerHTML =
          '<button class="audio-btn audio-play" aria-label="' +
          Downstage.i18n.t("audioPlayer.play") +
          '">' +
          '<svg class="icon"><use href="' + iconsHref("play") + '"/></svg>' +
          "</button>" +
          '<div class="audio-info">' +
          '<div class="audio-title">' +
          title +
          "</div>" +
          (artist ? '<div class="audio-artist">' + artist + "</div>" : "") +
          "</div>" +
          '<div class="audio-progress">' +
          '<div class="audio-progress-bar"><div class="audio-progress-fill"></div></div>' +
          '<div class="audio-times"><span class="audio-current">0:00</span><span class="audio-duration">0:00</span></div>' +
          "</div>";
      }

      var playBtn = root.querySelector(".audio-play");
      var fill = root.querySelector(".audio-progress-fill");
      var bar = root.querySelector(".audio-progress-bar");
      var currentEl = root.querySelector(".audio-current");
      var durationEl = root.querySelector(".audio-duration");

      function fmt(s) {
        if (isNaN(s)) return "0:00";
        var m = Math.floor(s / 60);
        s = Math.floor(s % 60);
        return m + ":" + (s < 10 ? "0" : "") + s;
      }

      audio.addEventListener("loadedmetadata", function () {
        durationEl.textContent = fmt(audio.duration);
      });
      audio.addEventListener("timeupdate", function () {
        if (audio.duration) {
          fill.style.width = (audio.currentTime / audio.duration) * 100 + "%";
          currentEl.textContent = fmt(audio.currentTime);
        }
      });
      function setPlayAria(playing) {
        playBtn.setAttribute(
          "aria-label",
          playing ? Downstage.i18n.t("audioPlayer.pause") : Downstage.i18n.t("audioPlayer.play")
        );
      }
      audio.addEventListener("play", function () {
        setPlayAria(true);
        playBtn.innerHTML =
          '<svg class="icon"><use href="' + iconsHref("pause") + '"/></svg>';
      });
      audio.addEventListener("pause", function () {
        setPlayAria(false);
        playBtn.innerHTML =
          '<svg class="icon"><use href="' + iconsHref("play") + '"/></svg>';
      });
      audio.addEventListener("ended", function () {
        setPlayAria(false);
        playBtn.innerHTML =
          '<svg class="icon"><use href="' + iconsHref("play") + '"/></svg>';
      });

      playBtn.addEventListener("click", function () {
        if (audio.paused) audio.play();
        else audio.pause();
      });

      bar.addEventListener("click", function (e) {
        var rect = bar.getBoundingClientRect();
        audio.currentTime =
          ((e.clientX - rect.left) / rect.width) * audio.duration;
      });
    }

    function init() {
      document.querySelectorAll("[data-audio-player]").forEach(setup);
    }

    function mount(target) {
      var el = typeof target === "string" ? document.querySelector(target) : target;
      if (!el) return null;
      setup(el);
      return el;
    }

    return { init: init, mount: mount };
  })();

  /* ==========================================================================
     9. FILE UPLOAD — drag & drop + list
     Markup: [data-upload-drop] > input[type=file].sr-only + .upload-drop-zone + ul.upload-drop-list
     ========================================================================== */

  Downstage.uploadDrop = (function () {
    function setup(root) {
      var input = root.querySelector('input[type="file"]');
      var zone = root.querySelector(".upload-drop-zone");
      var list = root.querySelector(".upload-drop-list");
      if (!input || !zone) return;

      var dragDepth = 0;

      function renderNames() {
        if (!list) return;
        list.innerHTML = "";
        if (!input.files || !input.files.length) {
          list.hidden = true;
          return;
        }
        list.hidden = false;
        Array.from(input.files).forEach(function (f) {
          var li = document.createElement("li");
          li.textContent = f.name;
          list.appendChild(li);
        });
      }

      function mergeFiles(fileList) {
        if (!fileList || !fileList.length) return;
        var dt = new DataTransfer();
        if (input.multiple && input.files && input.files.length) {
          Array.from(input.files).forEach(function (f) {
            dt.items.add(f);
          });
        }
        Array.from(fileList).forEach(function (f) {
          dt.items.add(f);
        });
        input.files = dt.files;
        renderNames();
      }

      zone.addEventListener("dragenter", function (e) {
        e.preventDefault();
        e.stopPropagation();
        dragDepth++;
        zone.classList.add("is-dragover");
      });

      zone.addEventListener("dragleave", function (e) {
        e.preventDefault();
        e.stopPropagation();
        dragDepth--;
        if (dragDepth <= 0) {
          dragDepth = 0;
          zone.classList.remove("is-dragover");
        }
      });

      zone.addEventListener("dragover", function (e) {
        e.preventDefault();
        e.stopPropagation();
      });

      zone.addEventListener("drop", function (e) {
        e.preventDefault();
        e.stopPropagation();
        dragDepth = 0;
        zone.classList.remove("is-dragover");
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
          mergeFiles(e.dataTransfer.files);
        }
      });

      zone.addEventListener("click", function (e) {
        if (e.target.closest && e.target.closest('label[for="' + input.id + '"]')) {
          return;
        }
        input.click();
      });

      zone.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          input.click();
        }
      });

      input.addEventListener("change", renderNames);
    }

    function init() {
      document.querySelectorAll("[data-upload-drop]").forEach(setup);
    }

    function mount(target) {
      var el = typeof target === "string" ? document.querySelector(target) : target;
      if (!el) return null;
      setup(el);
      return el;
    }

    return { init: init, mount: mount };
  })();

  /* ==========================================================================
     HTML EDITOR — contenteditable toolbar
     - mount(container, options): setup; initial HTML = options.initialHtml || container innerHTML
     - options: showRawSwitch (default false), toolbarExclude ([] = all buttons)
     - init(): [data-html-editor-mount] auto-mount, then legacy [data-html-editor] setup
     ========================================================================== */

  Downstage.htmlEditor = (function () {
    /* Non-text defaults; copy comes from Downstage.i18n.get("htmlEditor") */
    var PRESETS = {
      demo: {
        iconsBase: null,
        showRawSwitch: false,
        toolbarExclude: [],
      },
    };

    var TOOLBAR_LAYOUT = [
      [
        { cmd: "bold", html: "<strong>B</strong>" },
        { cmd: "italic", html: "<em>I</em>" },
        { cmd: "underline", label: "U", cls: "html-editor-btn-u" },
        { cmd: "strikeThrough", html: "<s>S</s>" },
        { cmd: "createLink", label: "Link" },
      ],
      [
        { cmd: "justifyLeft", label: "◀" },
        { cmd: "justifyCenter", label: "▣" },
        { cmd: "justifyRight", label: "▶" },
        { cmd: "justifyFull", label: "≡" },
      ],
      [
        { block: "h1", label: "H1" },
        { block: "h2", label: "H2" },
        { block: "h3", label: "H3" },
        { block: "h4", label: "H4" },
        { block: "h5", label: "H5" },
        { block: "h6", label: "H6" },
        { block: "h7", label: "H7" },
        { block: "p", label: "P" },
        { inlineCode: true, html: "&lt;code&gt;" },
        { block: "blockquote", label: "\u201c \u201d" },
      ],
    ];

    function deepMerge(a, b) {
      if (a === undefined || a === null) a = {};
      if (b === undefined || b === null) return a;
      if (Array.isArray(b)) return b.slice();
      if (typeof b !== "object") return b;
      var out = {};
      var k;
      for (k in a) out[k] = a[k];
      for (k in b) {
        if (b[k] && typeof b[k] === "object" && !Array.isArray(b[k]) && typeof (out[k] || {}) === "object" && !Array.isArray(out[k])) {
          out[k] = deepMerge(out[k] || {}, b[k]);
        } else {
          out[k] = b[k];
        }
      }
      return out;
    }

    function mergeOptions(base, extra) {
      var o = {};
      var k;
      for (k in base) o[k] = base[k];
      if (extra) for (k in extra) o[k] = extra[k];
      return o;
    }

    function baseHtmlEditorOptions() {
      var fromI18n = Downstage.i18n.get("htmlEditor");
      if (!fromI18n || typeof fromI18n !== "object") fromI18n = {};
      return deepMerge(deepMerge({}, PRESETS.demo), fromI18n);
    }

    function resolveOptions(options) {
      var preset = (options && options.preset) || "demo";
      var base = baseHtmlEditorOptions();
      if (preset !== "demo" && PRESETS[preset]) {
        base = deepMerge(base, PRESETS[preset]);
      }
      var o = mergeOptions({}, base);
      if (!options) return o;
      var k;
      for (k in options) {
        if (Object.prototype.hasOwnProperty.call(options, k)) {
          if (k === "linkModal" && options.linkModal && o.linkModal) {
            o.linkModal = deepMerge(o.linkModal, options.linkModal);
          } else if (k === "toolbar" && options.toolbar && o.toolbar) {
            o.toolbar = deepMerge(o.toolbar, options.toolbar);
          } else {
            o[k] = options[k];
          }
        }
      }
      return o;
    }

    function applyToolbarI18n(spec, tb) {
      var key = toolbarSpecKey(spec);
      var tr = (key && tb && tb[key]) || {};
      var out = {};
      var k;
      for (k in spec) out[k] = spec[k];
      if (tr.title) out.title = tr.title;
      if (tr.aria) out.aria = tr.aria;
      if (tr.label != null) out.label = tr.label;
      if (tr.html != null) out.html = tr.html;
      if (!out.title) out.title = out.aria || key || "";
      if (!out.aria) out.aria = out.title;
      return out;
    }

    function datasetMountOptions(el) {
      var o = {};
      if (el.dataset.htmlEditorPreset) o.preset = el.dataset.htmlEditorPreset;
      if (el.dataset.htmlEditorIcons) o.iconsBase = el.dataset.htmlEditorIcons;
      if (el.dataset.htmlEditorPlaceholder) o.placeholder = el.dataset.htmlEditorPlaceholder;
      if (el.hasAttribute("data-html-editor-show-raw")) {
        var rv = el.getAttribute("data-html-editor-show-raw");
        o.showRawSwitch = rv !== "false" && rv !== "0";
      }
      if (el.dataset.htmlEditorExclude) {
        o.toolbarExclude = el.dataset.htmlEditorExclude.split(/[,\s]+/).map(function (s) {
          return s.trim();
        }).filter(Boolean);
      }
      return o;
    }

    function toolbarSpecKey(spec) {
      if (spec.cmd) return spec.cmd;
      if (spec.block) return spec.block;
      if (spec.inlineCode) return "inlineCode";
      return "";
    }

    function toolbarExcludeSet(opts) {
      var ex = {};
      (opts.toolbarExclude || []).forEach(function (x) {
        var k = String(x).trim().toLowerCase();
        if (k) ex[k] = true;
      });
      return ex;
    }

    function makeToolbarButton(spec) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "html-editor-btn" + (spec.cls ? " " + spec.cls : "");
      if (spec.cmd) btn.setAttribute("data-html-cmd", spec.cmd);
      if (spec.block) btn.setAttribute("data-html-block", spec.block);
      if (spec.inlineCode) btn.setAttribute("data-html-inline-code", "");
      btn.title = spec.title;
      btn.setAttribute("aria-label", spec.aria || spec.title);
      if (spec.html) btn.innerHTML = spec.html;
      else if (spec.label) btn.innerHTML = spec.label;
      return btn;
    }

    function buildModeBar(opts) {
      var bar = document.createElement("div");
      bar.className = "html-editor-mode-bar";
      var left = document.createElement("span");
      left.className = "text-sm text-muted";
      left.textContent = opts.rawLeft;
      var lab = document.createElement("label");
      lab.className = "switch";
      lab.title = opts.rawSwitchTitle;
      var sw = document.createElement("input");
      sw.type = "checkbox";
      sw.setAttribute("data-html-editor-raw-switch", "");
      sw.setAttribute("aria-label", opts.rawSwitchAria);
      var sl = document.createElement("span");
      sl.className = "switch-slider";
      lab.appendChild(sw);
      lab.appendChild(sl);
      var right = document.createElement("span");
      right.className = "text-sm text-muted";
      right.textContent = opts.rawRight;
      bar.appendChild(left);
      bar.appendChild(lab);
      bar.appendChild(right);
      return bar;
    }

    function buildToolbar(opts) {
      var tb = document.createElement("div");
      tb.className = "html-editor-toolbar";
      tb.setAttribute("role", "toolbar");
      tb.setAttribute("aria-label", opts.toolbarAria);
      tb.setAttribute("data-html-editor-toolbar", "");
      var exSet = toolbarExcludeSet(opts);
      var tbI18n = opts.toolbar || {};
      TOOLBAR_LAYOUT.forEach(function (group) {
        var wrap = document.createElement("span");
        wrap.className = "html-editor-toolbar-group";
        var n = 0;
        group.forEach(function (spec) {
          var key = toolbarSpecKey(spec);
          if (key && exSet[key.toLowerCase()]) return;
          wrap.appendChild(makeToolbarButton(applyToolbarI18n(spec, tbI18n)));
          n++;
        });
        if (n) tb.appendChild(wrap);
      });
      return tb;
    }

    function buildPane(opts) {
      var pane = document.createElement("div");
      pane.className = "html-editor-pane";
      var ed = document.createElement("div");
      ed.className = "html-editor-content";
      ed.setAttribute("contenteditable", "true");
      ed.setAttribute("role", "textbox");
      ed.setAttribute("aria-multiline", "true");
      ed.setAttribute("spellcheck", "true");
      ed.setAttribute("data-placeholder", opts.placeholder || "");
      ed.innerHTML = opts.initialHtml || "";
      pane.appendChild(ed);
      if (opts.showRawSwitch) {
        var ta = document.createElement("textarea");
        ta.className = "html-editor-raw input text-mono";
        ta.setAttribute("data-html-editor-raw", "");
        ta.setAttribute("aria-label", opts.rawTextareaAria);
        ta.setAttribute("spellcheck", "false");
        ta.setAttribute("tabindex", "-1");
        pane.appendChild(ta);
      }
      return pane;
    }

    function svgUse(iconsBase, symbol) {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "icon");
      svg.setAttribute("aria-hidden", "true");
      var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", iconsBase + "#" + symbol);
      svg.appendChild(use);
      return svg;
    }

    function buildLinkModal(opts, uid) {
      var icons = opts.iconsBase || _iconsBase;
      var lm = opts.linkModal;
      var overlay = document.createElement("div");
      overlay.className = "html-editor-link-modal modal-overlay hidden";
      overlay.setAttribute("data-html-editor-link-modal", "");
      overlay.setAttribute("aria-hidden", "true");
      var panel = document.createElement("div");
      panel.className = "modal html-editor-link-panel";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "true");
      var hid = "html-editor-link-heading-" + uid;
      panel.setAttribute("aria-labelledby", hid);

      var closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "html-editor-link-close btn btn-ghost btn-sm";
      closeBtn.setAttribute("data-html-editor-link-close", "");
      closeBtn.setAttribute("aria-label", lm.closeAria);
      closeBtn.innerHTML = "&times;";

      var title = document.createElement("div");
      title.className = "modal-title html-editor-link-title";
      title.id = hid;
      title.appendChild(svgUse(icons, "link"));
      title.appendChild(document.createTextNode(" " + lm.title));

      var lede = document.createElement("p");
      lede.className = "html-editor-link-lede text-subtle text-sm";
      lede.innerHTML = lm.lede;

      var body = document.createElement("div");
      body.className = "modal-body stack html-editor-link-fields";

      var fKind = document.createElement("div");
      fKind.className = "field";
      var lKind = document.createElement("label");
      lKind.className = "label";
      var spanKind = document.createElement("span");
      spanKind.setAttribute("data-html-editor-link-kind-label", "");
      spanKind.textContent = lm.kindLabel;
      lKind.appendChild(spanKind);
      var selKind = document.createElement("select");
      selKind.className = "select";
      selKind.setAttribute("data-html-editor-link-kind", "");
      selKind.setAttribute("aria-label", lm.kindAria || lm.kindLabel);
      lm.kindOptions.forEach(function (opt) {
        var o = document.createElement("option");
        o.value = opt.value;
        o.textContent = opt.label;
        selKind.appendChild(o);
      });
      fKind.appendChild(lKind);
      fKind.appendChild(selKind);

      var fVal = document.createElement("div");
      fVal.className = "field";
      var lVal = document.createElement("label");
      lVal.className = "label";
      var spanVal = document.createElement("span");
      spanVal.setAttribute("data-html-editor-link-value-label", "");
      spanVal.textContent = lm.valueLabelPlaceholder || "Address";
      lVal.appendChild(spanVal);
      var inpVal = document.createElement("input");
      inpVal.className = "input";
      inpVal.type = "text";
      inpVal.setAttribute("data-html-editor-link-value", "");
      inpVal.placeholder = lm.placeholderUrl || "https://…";
      inpVal.setAttribute("autocomplete", "off");
      inpVal.setAttribute("aria-label", lm.valueAria || lm.valueLabelPlaceholder || "URL");
      fVal.appendChild(lVal);
      fVal.appendChild(inpVal);

      var fSub = document.createElement("div");
      fSub.className = "field hidden";
      fSub.setAttribute("data-html-editor-link-subject-wrap", "");
      var lSub = document.createElement("label");
      lSub.className = "label";
      lSub.textContent = lm.subjectLabel;
      var inpSub = document.createElement("input");
      inpSub.className = "input";
      inpSub.type = "text";
      inpSub.setAttribute("data-html-editor-link-subject", "");
      inpSub.placeholder = lm.subjectPh;
      inpSub.setAttribute("autocomplete", "off");
      inpSub.setAttribute("aria-label", lm.subjectLabel);
      fSub.appendChild(lSub);
      fSub.appendChild(inpSub);

      var fTgt = document.createElement("div");
      fTgt.className = "field";
      var lTgt = document.createElement("label");
      lTgt.className = "label";
      lTgt.textContent = lm.targetLabel;
      var selTgt = document.createElement("select");
      selTgt.className = "select";
      selTgt.setAttribute("data-html-editor-link-target", "");
      selTgt.setAttribute("aria-label", lm.targetLabel);
      lm.targetOptions.forEach(function (opt) {
        var o = document.createElement("option");
        o.value = opt.value;
        o.textContent = opt.label;
        selTgt.appendChild(o);
      });
      fTgt.appendChild(lTgt);
      fTgt.appendChild(selTgt);

      var labRel = document.createElement("label");
      labRel.className = "check";
      labRel.setAttribute("data-html-editor-link-rel-wrap", "");
      var relInp = document.createElement("input");
      relInp.type = "checkbox";
      relInp.setAttribute("data-html-editor-link-rel", "");
      relInp.checked = true;
      var relSpan = document.createElement("span");
      relSpan.innerHTML = lm.relSpan;
      labRel.appendChild(relInp);
      labRel.appendChild(relSpan);

      body.appendChild(fKind);
      body.appendChild(fVal);
      body.appendChild(fSub);
      body.appendChild(fTgt);
      body.appendChild(labRel);

      var foot = document.createElement("div");
      foot.className = "modal-footer";
      var cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "btn btn-secondary";
      cancel.setAttribute("data-html-editor-link-cancel", "");
      cancel.textContent = lm.cancel;
      var apply = document.createElement("button");
      apply.type = "button";
      apply.className = "btn btn-primary";
      apply.setAttribute("data-html-editor-link-apply", "");
      apply.appendChild(svgUse(icons, "check"));
      apply.appendChild(document.createTextNode(" " + lm.apply));

      foot.appendChild(cancel);
      foot.appendChild(apply);

      panel.appendChild(closeBtn);
      panel.appendChild(title);
      panel.appendChild(lede);
      panel.appendChild(body);
      panel.appendChild(foot);
      overlay.appendChild(panel);
      return overlay;
    }

    function mount(target, options) {
      var el = typeof target === "string" ? document.querySelector(target) : target;
      if (!el) return null;
      var inlineHtml = el.innerHTML.trim();
      options = options || {};
      var opts = resolveOptions(options);
      /* options.initialHtml overrides inline markup in the container; otherwise container HTML is used */
      if (Object.prototype.hasOwnProperty.call(options, "initialHtml")) {
        opts.initialHtml = options.initialHtml;
      } else if (inlineHtml) {
        opts.initialHtml = inlineHtml;
      }
      var uid = options.uid || Math.random().toString(36).slice(2, 10);
      el.classList.add("html-editor");
      el.setAttribute("data-html-editor", "");
      el.setAttribute("data-html-editor-mounted", "true");
      el.innerHTML = "";
      if (opts.showRawSwitch) {
        el.appendChild(buildModeBar(opts));
      }
      var tbEl = buildToolbar(opts);
      if (tbEl.querySelector(".html-editor-toolbar-group")) {
        el.appendChild(tbEl);
      }
      el.appendChild(buildPane(opts));
      el.appendChild(buildLinkModal(opts, uid));
      setup(el);
      return el;
    }

    function escapeHtml(text) {
      var div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    function findBlockAncestor(node, root) {
      var n = node;
      if (n && n.nodeType === 3) n = n.parentElement;
      while (n && n !== root) {
        var tag = n.nodeName;
        if (/^P$/i.test(tag) || /^H[1-6]$/i.test(tag) || /^BLOCKQUOTE$/i.test(tag) || /^PRE$/i.test(tag)) {
          return n;
        }
        n = n.parentElement;
      }
      return null;
    }

    function getAnchorFromSelection(ed) {
      var sel = window.getSelection();
      if (!sel.rangeCount) return null;
      var node = sel.anchorNode;
      if (node.nodeType === 3) node = node.parentElement;
      while (node && node !== ed) {
        if (node.nodeName === "A") return node;
        node = node.parentElement;
      }
      return null;
    }

    function parseHrefForForm(href) {
      var o = { kind: "url", value: "", subject: "" };
      if (!href) return o;
      if (/^mailto:/i.test(href)) {
        o.kind = "mailto";
        var rest = href.replace(/^mailto:/i, "");
        var q = rest.indexOf("?");
        var addr = q >= 0 ? rest.slice(0, q) : rest;
        try {
          o.value = decodeURIComponent(addr);
        } catch (e) {
          o.value = addr;
        }
        if (q >= 0) {
          var params = new URLSearchParams(rest.slice(q + 1));
          o.subject = params.get("subject") || "";
        }
        return o;
      }
      if (/^tel:/i.test(href)) {
        o.kind = "tel";
        o.value = href.replace(/^tel:/i, "").replace(/\s/g, "");
        return o;
      }
      o.value = href;
      if (/^https?:\/\//i.test(href)) o.kind = "url";
      else o.kind = "custom";
      return o;
    }

    function buildHref(kind, value, subject) {
      value = (value || "").trim();
      if (!value) return "";
      if (kind === "mailto") {
        var q = subject && String(subject).trim() ? "?subject=" + encodeURIComponent(String(subject).trim()) : "";
        return "mailto:" + value + q;
      }
      if (kind === "tel") {
        return "tel:" + value.replace(/\s/g, "");
      }
      if (kind === "custom") {
        return value;
      }
      if (!/^https?:\/\//i.test(value)) {
        return "https://" + value;
      }
      return value;
    }

    function applyH7(ed) {
      document.execCommand("formatBlock", false, "p");
      var sel = window.getSelection();
      if (!sel.rangeCount) return;
      var block = findBlockAncestor(sel.anchorNode, ed);
      if (block && block.tagName === "P") {
        block.classList.add("ds-h7");
        block.setAttribute("role", "heading");
        block.setAttribute("aria-level", "7");
      }
    }

    function stripH7FromParagraph(ed) {
      document.execCommand("formatBlock", false, "p");
      var sel = window.getSelection();
      if (!sel.rangeCount) return;
      var block = findBlockAncestor(sel.anchorNode, ed);
      if (block && block.tagName === "P") {
        block.classList.remove("ds-h7");
        block.removeAttribute("role");
        block.removeAttribute("aria-level");
      }
    }

    function wrapInlineCode() {
      var sel = window.getSelection();
      if (!sel.rangeCount || sel.isCollapsed) return;
      var text = sel.toString();
      if (!text) return;
      document.execCommand("insertHTML", false, "<code>" + escapeHtml(text) + "</code>");
    }

    function runFormatBlock(tag) {
      try {
        document.execCommand("formatBlock", false, tag);
      } catch (e) {
        var wrapped = "<" + tag + ">";
        try {
          document.execCommand("formatBlock", false, wrapped);
        } catch (e2) {}
      }
    }

    function applyLink(ed, range, href, target, useRel) {
      if (!href) return;
      var sel = window.getSelection();
      var aEl = null;
      ed.focus();
      try {
        sel.removeAllRanges();
        sel.addRange(range);
        aEl = getAnchorFromSelection(ed);
      } catch (e) {}

      if (aEl && ed.contains(aEl)) {
        aEl.href = href;
        if (target === "_blank") {
          aEl.target = "_blank";
          if (useRel) aEl.setAttribute("rel", "noopener noreferrer");
          else aEl.removeAttribute("rel");
        } else {
          aEl.removeAttribute("target");
          aEl.removeAttribute("rel");
        }
        return;
      }

      ed.focus();
      try {
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (e2) {
        return;
      }
      var text = "";
      try {
        text = range.cloneContents().textContent || "";
      } catch (e3) {}
      if (!text) text = href;
      var tmp = document.createElement("div");
      var a = document.createElement("a");
      a.href = href;
      a.textContent = text;
      if (target === "_blank") {
        a.target = "_blank";
        if (useRel) a.setAttribute("rel", "noopener noreferrer");
      }
      tmp.appendChild(a);
      document.execCommand("insertHTML", false, tmp.innerHTML);
    }

    function setup(root) {
      var ed = root.querySelector(".html-editor-content[contenteditable]");
      if (!ed) return;

      var toolbar = root.querySelector("[data-html-editor-toolbar]");
      var rawTa = root.querySelector("[data-html-editor-raw]");
      var rawSwitch = root.querySelector("[data-html-editor-raw-switch]");
      var linkModal = root.querySelector("[data-html-editor-link-modal]");
      var savedRange = null;

      function setToolbarDisabled(disabled) {
        if (!toolbar) return;
        toolbar.classList.toggle("html-editor-toolbar--disabled", disabled);
        if (disabled) toolbar.setAttribute("aria-disabled", "true");
        else toolbar.removeAttribute("aria-disabled");
      }

      function isRawMode() {
        return root.classList.contains("is-raw-mode");
      }

      if (rawSwitch && rawTa) {
        rawSwitch.addEventListener("change", function () {
          if (rawSwitch.checked) {
            rawTa.value = ed.innerHTML;
            root.classList.add("is-raw-mode");
            rawTa.removeAttribute("tabindex");
            ed.setAttribute("tabindex", "-1");
          } else {
            ed.innerHTML = rawTa.value;
            root.classList.remove("is-raw-mode");
            rawTa.setAttribute("tabindex", "-1");
            ed.removeAttribute("tabindex");
          }
          setToolbarDisabled(rawSwitch.checked);
        });
      }

      /* ----- Link modal ----- */
      var kindSel = linkModal && linkModal.querySelector("[data-html-editor-link-kind]");
      var valueInp = linkModal && linkModal.querySelector("[data-html-editor-link-value]");
      var subjectInp = linkModal && linkModal.querySelector("[data-html-editor-link-subject]");
      var subjectWrap = linkModal && linkModal.querySelector("[data-html-editor-link-subject-wrap]");
      var targetSel = linkModal && linkModal.querySelector("[data-html-editor-link-target]");
      var relCb = linkModal && linkModal.querySelector("[data-html-editor-link-rel]");
      var relWrap = linkModal && linkModal.querySelector("[data-html-editor-link-rel-wrap]");
      var valueLabel = linkModal && linkModal.querySelector("[data-html-editor-link-value-label]");

      function syncKindFields() {
        if (!kindSel || !valueInp || !valueLabel) return;
        var lm = Downstage.i18n.get("htmlEditor.linkModal") || {};
        var k = kindSel.value;
        if (subjectWrap) subjectWrap.classList.toggle("hidden", k !== "mailto");
        if (k === "mailto") {
          valueLabel.textContent = lm.valueLabelMailto || "Email address";
          valueInp.placeholder = lm.placeholderMailto || "name@example.com";
          valueInp.type = "email";
        } else if (k === "tel") {
          valueLabel.textContent = lm.valueLabelTel || "Phone number";
          valueInp.placeholder = lm.placeholderTel || "+1 555 123 4567";
          valueInp.type = "tel";
        } else if (k === "custom") {
          valueLabel.textContent = lm.valueLabelCustom || "URL or path";
          valueInp.placeholder = lm.placeholderCustom || "page.html#section or /path";
          valueInp.type = "text";
        } else {
          valueLabel.textContent = lm.valueLabelUrl || "Web address";
          valueInp.placeholder = lm.placeholderUrl || "https://…";
          valueInp.type = "url";
        }
      }

      function syncRelVisibility() {
        if (!relWrap || !targetSel) return;
        relWrap.classList.toggle("hidden", targetSel.value !== "_blank");
      }

      function openLinkModal() {
        if (!linkModal || !kindSel || !valueInp || !targetSel) return;
        var sel = window.getSelection();
        savedRange = null;
        if (sel.rangeCount) {
          try {
            savedRange = sel.getRangeAt(0).cloneRange();
          } catch (e) {}
        }
        var anchor = getAnchorFromSelection(ed);
        var parsed = anchor ? parseHrefForForm(anchor.href) : { kind: "url", value: "", subject: "" };
        kindSel.value = parsed.kind;
        valueInp.value = parsed.value;
        if (subjectInp) subjectInp.value = parsed.subject || "";
        if (anchor) {
          targetSel.value = anchor.target === "_blank" ? "_blank" : "_self";
          if (relCb) relCb.checked = /noopener/.test(anchor.getAttribute("rel") || "");
        } else {
          targetSel.value = "_self";
          if (relCb) relCb.checked = true;
        }
        syncKindFields();
        syncRelVisibility();
        linkModal.classList.remove("hidden");
        linkModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        window.setTimeout(function () {
          if (valueInp) valueInp.focus();
        }, 0);
      }

      function closeLinkModal() {
        if (!linkModal) return;
        linkModal.classList.add("hidden");
        linkModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        savedRange = null;
        if (!isRawMode()) ed.focus();
      }

      function submitLinkModal() {
        if (!kindSel || !valueInp || !targetSel) {
          closeLinkModal();
          return;
        }
        var href = buildHref(kindSel.value, valueInp.value, subjectInp ? subjectInp.value : "");
        if (!href) {
          closeLinkModal();
          return;
        }
        var target = targetSel.value || "_self";
        var useRel = target === "_blank" && relCb && relCb.checked;
        var range = savedRange;
        if (!range) {
          ed.focus();
          var sel = window.getSelection();
          if (sel.rangeCount) {
            try {
              range = sel.getRangeAt(0).cloneRange();
            } catch (e) {}
          }
        }
        if (!range) {
          var r = document.createRange();
          r.selectNodeContents(ed);
          r.collapse(false);
          range = r;
        }
        applyLink(ed, range, href, target, useRel);
        closeLinkModal();
      }

      if (linkModal) {
        if (kindSel) kindSel.addEventListener("change", syncKindFields);
        if (targetSel) targetSel.addEventListener("change", syncRelVisibility);

        linkModal.addEventListener("click", function (e) {
          if (e.target === linkModal) closeLinkModal();
        });

        linkModal.addEventListener("keydown", function (e) {
          if (e.key === "Escape" && !linkModal.classList.contains("hidden")) {
            e.preventDefault();
            closeLinkModal();
          }
        });

        var closeBtn = linkModal.querySelector("[data-html-editor-link-close]");
        var cancelBtn = linkModal.querySelector("[data-html-editor-link-cancel]");
        var applyBtn = linkModal.querySelector("[data-html-editor-link-apply]");
        if (closeBtn) closeBtn.addEventListener("click", closeLinkModal);
        if (cancelBtn) cancelBtn.addEventListener("click", closeLinkModal);
        if (applyBtn) applyBtn.addEventListener("click", submitLinkModal);
      }

      root.addEventListener("mousedown", function (e) {
        if (e.target.closest && e.target.closest(".html-editor-toolbar")) {
          e.preventDefault();
        }
      });

      root.addEventListener("click", function (e) {
        var btn = e.target.closest("button");
        if (!btn || !root.contains(btn)) return;
        if (!btn.closest(".html-editor-toolbar")) return;

        e.preventDefault();
        if (isRawMode()) return;
        ed.focus();

        if (btn.hasAttribute("data-html-inline-code")) {
          wrapInlineCode();
          return;
        }

        var block = btn.getAttribute("data-html-block");
        if (block) {
          if (block === "h7") {
            applyH7(ed);
            return;
          }
          if (block === "p") {
            stripH7FromParagraph(ed);
            return;
          }
          runFormatBlock(block);
          return;
        }

        var cmd = btn.getAttribute("data-html-cmd");
        if (!cmd) return;

        if (cmd === "createLink") {
          openLinkModal();
          return;
        }

        document.execCommand(cmd, false, null);
      });
    }

    function init() {
      document.querySelectorAll("[data-html-editor-mount]").forEach(function (el) {
        if (el.getAttribute("data-html-editor-mounted")) return;
        mount(el, datasetMountOptions(el));
      });
      document.querySelectorAll("[data-html-editor]").forEach(function (el) {
        if (el.getAttribute("data-html-editor-mounted")) return;
        setup(el);
        el.setAttribute("data-html-editor-mounted", "true");
      });
    }

    return { init: init, mount: mount, presets: PRESETS };
  })();

  /* ==========================================================================
     COMBOBOX — accessible autocomplete (local list or fetchOptions / data URL)
     ========================================================================== */

  Downstage.combobox = (function () {
    function debounce(fn, ms) {
      var t;
      return function () {
        var ctx = this;
        var args = arguments;
        clearTimeout(t);
        t = setTimeout(function () {
          fn.apply(ctx, args);
        }, ms);
      };
    }

    function norm(s) {
      return String(s || "")
        .toLowerCase()
        .trim();
    }

    function filterLocal(opts, q) {
      if (!q) return opts.slice();
      var nq = norm(q);
      return opts.filter(function (o) {
        return norm(o.label).indexOf(nq) !== -1 || norm(String(o.value)).indexOf(nq) !== -1;
      });
    }

    function mount(root, options) {
      if (!root) return null;
      var opts = options || {};
      var staticOpts = opts.options || [];
      var fetchFn = opts.fetchOptions;
      var fetchUrl = opts.fetchUrl || (root.dataset && root.dataset.comboboxFetch);
      var minChars =
        opts.minChars != null
          ? opts.minChars
          : fetchUrl || fetchFn
            ? parseInt(root.dataset.comboboxMinChars || "1", 10) || 1
            : 0;
      var debounceMs = opts.debounceMs != null ? opts.debounceMs : parseInt(root.dataset.comboboxDebounce || "250", 10) || 250;
      var placeholder = opts.placeholder != null ? opts.placeholder : root.dataset.comboboxPlaceholder || "";
      var name = opts.name || root.dataset.comboboxName || "";
      var inputId = opts.id || "combobox-" + Math.random().toString(36).slice(2, 9);
      var listId = inputId + "-list";
      var hiddenName = name || "combobox";

      if (fetchUrl && !fetchFn) {
        fetchFn = function (query) {
          var u = new URL(fetchUrl, window.location.href);
          u.searchParams.set("q", query);
          return fetch(u.toString(), { credentials: "same-origin" }).then(function (r) {
            if (!r.ok) throw new Error("fetch");
            return r.json();
          }).then(function (j) {
            if (Array.isArray(j)) return j;
            if (j && Array.isArray(j.results)) return j.results;
            if (j && Array.isArray(j.items)) return j.items;
            return [];
          });
        };
      }

      root.classList.add("combobox");
      if (opts.prependIcon === "search") {
        root.classList.add("combobox--search");
      }
      root.innerHTML = "";
      var hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.name = hiddenName;
      hidden.value = opts.value != null ? String(opts.value) : "";
      root.appendChild(hidden);

      var wrap = document.createElement("div");
      wrap.className = "combobox-input-wrap";
      if (opts.prependIcon === "search") {
        var searchIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        searchIcon.setAttribute("class", "icon");
        searchIcon.setAttribute("aria-hidden", "true");
        searchIcon.innerHTML = '<use href="' + iconsHref("search") + '" />';
        wrap.appendChild(searchIcon);
      }
      var input = document.createElement("input");
      input.type = "text";
      input.className = "combobox-input";
      input.id = inputId;
      input.setAttribute("role", "combobox");
      input.setAttribute("aria-autocomplete", "list");
      input.setAttribute("aria-expanded", "false");
      input.setAttribute("aria-controls", listId);
      input.setAttribute("autocomplete", "off");
      input.placeholder = placeholder;
      wrap.appendChild(input);
      root.appendChild(wrap);

      var list = document.createElement("ul");
      list.id = listId;
      list.className = "combobox-list";
      list.setAttribute("role", "listbox");
      list.hidden = true;
      root.appendChild(list);

      var items = [];
      var active = -1;
      var loading = false;
      var open = false;

      function setOpen(v) {
        open = v;
        input.setAttribute("aria-expanded", v ? "true" : "false");
        list.hidden = !v;
        root.classList.toggle("is-open", v);
      }

      function syncLabelFromValue() {
        var v = hidden.value;
        if (!v) {
          input.value = "";
          return;
        }
        var found = staticOpts.filter(function (o) {
          return String(o.value) === String(v);
        })[0];
        if (found) input.value = found.label;
      }

      function renderRows(rows) {
        list.innerHTML = "";
        items = [];
        if (loading) {
          var li0 = document.createElement("li");
          li0.className = "combobox-loading";
          li0.textContent = Downstage.i18n.t("combobox.loading");
          list.appendChild(li0);
          return;
        }
        if (!rows || !rows.length) {
          var li = document.createElement("li");
          li.className = "combobox-empty";
          li.textContent = Downstage.i18n.t("combobox.noResults");
          li.setAttribute("role", "presentation");
          list.appendChild(li);
          return;
        }
        rows.forEach(function (row, i) {
          var opt = document.createElement("li");
          opt.className = "combobox-option";
          opt.setAttribute("role", "option");
          opt.setAttribute("id", listId + "-opt-" + i);
          opt.textContent = row.label != null ? row.label : String(row.value);
          opt.dataset.value = row.value != null ? String(row.value) : "";
          list.appendChild(opt);
          items.push(opt);
        });
      }

      function selectByIndex(i) {
        if (i < 0 || i >= items.length) return;
        var row = items[i];
        var val = row.dataset.value;
        hidden.value = val;
        input.value = row.textContent;
        setOpen(false);
        active = -1;
        input.dispatchEvent(new CustomEvent("combobox-change", { bubbles: true, detail: { value: val } }));
      }

      function highlight(i) {
        items.forEach(function (el, j) {
          el.classList.toggle("is-active", j === i);
          el.setAttribute("aria-selected", j === i ? "true" : "false");
        });
        active = i;
      }

      function runFilter(q) {
        if (fetchFn) {
          if (norm(q).length < minChars) {
            renderRows([]);
            return;
          }
          loading = true;
          renderRows([]);
          setOpen(true);
          fetchFn(q)
            .then(function (rows) {
              loading = false;
              renderRows(
                (rows || []).map(function (r) {
                  if (typeof r === "string") return { value: r, label: r };
                  return { value: r.value != null ? r.value : r.id, label: r.label != null ? r.label : String(r.value || r.id) };
                })
              );
            })
            .catch(function () {
              loading = false;
              renderRows([]);
            });
          return;
        }
        renderRows(filterLocal(staticOpts, q));
      }

      var debouncedRun = debounce(function () {
        runFilter(input.value);
      }, debounceMs);

      input.addEventListener("input", function () {
        hidden.value = "";
        debouncedRun();
        setOpen(true);
        highlight(-1);
      });

      input.addEventListener("focus", function () {
        if (!fetchFn) runFilter(input.value);
        setOpen(true);
      });

      input.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          setOpen(false);
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (!open) setOpen(true);
          highlight(Math.min(active + 1, items.length - 1));
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          highlight(Math.max(active - 1, 0));
          return;
        }
        if (e.key === "Enter" && open && active >= 0) {
          e.preventDefault();
          selectByIndex(active);
        }
      });

      list.addEventListener("mousedown", function (e) {
        var li = e.target.closest(".combobox-option");
        if (!li || !list.contains(li)) return;
        e.preventDefault();
        var idx = items.indexOf(li);
        if (idx >= 0) selectByIndex(idx);
      });

      document.addEventListener(
        "click",
        function (e) {
          if (!root.contains(e.target)) setOpen(false);
        },
        true
      );

      syncLabelFromValue();
      if (!fetchFn) runFilter("");

      root.setAttribute("data-combobox-mounted", "true");
      return { root: root, input: input, hidden: hidden, destroy: function () {} };
    }

    function datasetOptions(el) {
      var o = {};
      if (el.dataset.comboboxPlaceholder) o.placeholder = el.dataset.comboboxPlaceholder;
      if (el.dataset.comboboxName) o.name = el.dataset.comboboxName;
      if (el.dataset.comboboxMinChars) o.minChars = parseInt(el.dataset.comboboxMinChars, 10);
      if (el.dataset.comboboxDebounce) o.debounceMs = parseInt(el.dataset.comboboxDebounce, 10);
      if (el.dataset.comboboxFetch) o.fetchUrl = el.dataset.comboboxFetch;
      if (el.dataset.comboboxLocal) {
        try {
          o.options = JSON.parse(el.dataset.comboboxLocal);
        } catch (err) {
          o.options = [];
        }
      }
      return o;
    }

    function init() {
      document.querySelectorAll("[data-combobox]:not([data-combobox-mounted])").forEach(function (el) {
        if (el.hasAttribute("data-search-autocomplete")) return;
        mount(el, datasetOptions(el));
      });
    }

    return { init: init, mount: mount };
  })();

  /* ==========================================================================
     SEARCH AUTocomplete — API-backed (or local) search field
     ========================================================================== */

  Downstage.searchAutocomplete = (function () {
    function mount(root, options) {
      if (!root) return null;
      var opts = options || {};
      root.classList.add("search-autocomplete");
      if (opts.wide) root.classList.add("search-autocomplete--wide");
      var api = Downstage.combobox.mount(root, {
        prependIcon: "search",
        options: opts.options,
        fetchOptions: opts.fetchSuggestions || opts.fetchOptions,
        fetchUrl: opts.fetchUrl || (root.dataset && root.dataset.searchFetch),
        minChars: opts.minChars != null ? opts.minChars : 1,
        debounceMs: opts.debounceMs,
        placeholder: opts.placeholder || Downstage.i18n.t("searchAutocomplete.placeholder"),
        name: opts.name || "",
        value: opts.value,
        id: opts.id,
      });
      root.setAttribute("data-search-autocomplete-mounted", "true");
      return api;
    }

    function init() {
      document.querySelectorAll("[data-search-autocomplete]:not([data-search-autocomplete-mounted])").forEach(function (el) {
        var o = {};
        if (el.dataset.searchFetch) o.fetchUrl = el.dataset.searchFetch;
        if (el.dataset.searchPlaceholder) o.placeholder = el.dataset.searchPlaceholder;
        if (el.dataset.searchMinChars) o.minChars = parseInt(el.dataset.searchMinChars, 10);
        mount(el, o);
      });
    }

    return { init: init, mount: mount };
  })();

  /* ==========================================================================
     KANBAN — columns + cards, drag-drop, optional fetchBoard / moveCard
     ========================================================================== */

  Downstage.kanban = (function () {
    function datasetOptions(el) {
      var o = {};
      if (!el.dataset) return o;
      if (el.dataset.kanbanFetchUrl) o.fetchUrl = el.dataset.kanbanFetchUrl;
      if (el.dataset.kanbanMoveUrl) o.moveUrl = el.dataset.kanbanMoveUrl;
      if (el.dataset.kanbanMoveMethod) o.moveMethod = el.dataset.kanbanMoveMethod;
      if (el.dataset.kanbanMoveCredentials) o.moveCredentials = el.dataset.kanbanMoveCredentials;
      if (el.dataset.kanbanFetchCredentials) o.fetchCredentials = el.dataset.kanbanFetchCredentials;
      return o;
    }

    function resolveFetchBoard(opts) {
      if (opts.fetchBoard) return opts.fetchBoard;
      if (opts.fetchUrl) {
        var fc = opts.fetchCredentials;
        if (fc == null) fc = "same-origin";
        return function () {
          return fetch(opts.fetchUrl, {
            credentials: fc,
            headers: { Accept: "application/json" },
          }).then(function (r) {
            if (!r.ok) throw new Error("kanban fetch");
            return r.json();
          });
        };
      }
      return null;
    }

    function resolveMoveCard(opts) {
      if (opts.moveCard) return opts.moveCard;
      if (opts.moveUrl) {
        var method = (opts.moveMethod || "POST").toUpperCase();
        var creds = opts.moveCredentials;
        if (creds == null) {
          try {
            var u = new URL(opts.moveUrl, window.location.href);
            creds = u.origin === window.location.origin ? "same-origin" : "omit";
          } catch (e) {
            creds = "omit";
          }
        }
        return function (payload) {
          return fetch(opts.moveUrl, {
            method: method,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
            credentials: creds,
          }).then(function (r) {
            if (!r.ok) throw new Error("kanban move");
          });
        };
      }
      return function () {
        return Promise.resolve();
      };
    }

    function mount(root, options) {
      if (!root) return null;
      var opts = options || {};
      var merged = {};
      var k;
      var fromDataset = datasetOptions(root);
      for (k in fromDataset) merged[k] = fromDataset[k];
      for (k in opts) merged[k] = opts[k];

      var state = { columns: [] };
      var fetchBoard = resolveFetchBoard(merged);
      var moveCard = resolveMoveCard(merged);

      root.classList.add("kanban-root");
      root.innerHTML = '<div class="kanban-toolbar"></div><div class="kanban-board"></div>';
      var toolbar = root.querySelector(".kanban-toolbar");
      var board = root.querySelector(".kanban-board");

      function cardEl(card, columnId) {
        var article = document.createElement("article");
        article.className = "kanban-card";
        article.draggable = true;
        article.dataset.cardId = String(card.id);
        article.dataset.columnId = String(columnId);
        article.innerHTML =
          '<h3 class="kanban-card-title"></h3><p class="kanban-card-meta"></p>';
        article.querySelector(".kanban-card-title").textContent = card.title || "";
        article.querySelector(".kanban-card-meta").textContent = card.meta || "";
        article.addEventListener("dragstart", function (e) {
          e.dataTransfer.setData("text/plain", card.id);
          e.dataTransfer.setData("application/x-column-id", columnId);
          article.classList.add("is-dragging");
        });
        article.addEventListener("dragend", function () {
          article.classList.remove("is-dragging");
          root.querySelectorAll(".kanban-column.is-drop-target").forEach(function (c) {
            c.classList.remove("is-drop-target");
          });
        });
        return article;
      }

      function render() {
        board.innerHTML = "";
        if (!state.columns.length) {
          board.innerHTML =
            '<p class="kanban-empty">' + Downstage.i18n.t("kanban.noColumns") + "</p>";
          return;
        }
        state.columns.forEach(function (col) {
          var colWrap = document.createElement("section");
          colWrap.className = "kanban-column";
          colWrap.dataset.columnId = String(col.id);
          colWrap.innerHTML =
            '<header class="kanban-column-header"><span class="kanban-column-title"></span><span class="kanban-count"></span></header><div class="kanban-column-body"></div>';
          colWrap.querySelector(".kanban-column-title").textContent = col.title || "";
          var count = colWrap.querySelector(".kanban-count");
          var body = colWrap.querySelector(".kanban-column-body");
          var cards = col.cards || [];
          count.textContent = String(cards.length);
          cards.forEach(function (c) {
            body.appendChild(cardEl(c, col.id));
          });

          body.addEventListener("dragover", function (e) {
            e.preventDefault();
            colWrap.classList.add("is-drop-target");
          });
          body.addEventListener("dragleave", function (e) {
            if (!body.contains(e.relatedTarget)) colWrap.classList.remove("is-drop-target");
          });
          body.addEventListener("drop", function (e) {
            e.preventDefault();
            colWrap.classList.remove("is-drop-target");
            var cardId = e.dataTransfer.getData("text/plain");
            var fromCol = e.dataTransfer.getData("application/x-column-id");
            if (!cardId || String(fromCol) === String(col.id)) return;
            var from = state.columns.filter(function (c) {
              return String(c.id) === String(fromCol);
            })[0];
            var to = col;
            if (!from || !to) return;
            var card;
            var idx = -1;
            from.cards.forEach(function (x, i) {
              if (String(x.id) === String(cardId)) {
                card = x;
                idx = i;
              }
            });
            if (!card) return;
            from.cards.splice(idx, 1);
            to.cards.push(card);
            var toIndex = to.cards.length - 1;
            moveCard({
              cardId: card.id,
              fromColumnId: from.id,
              toColumnId: to.id,
              toIndex: toIndex,
            }).catch(function () {
              to.cards.pop();
              from.cards.splice(idx, 0, card);
              render();
            });
            render();
          });

          board.appendChild(colWrap);
        });
      }

      function load() {
        board.innerHTML =
          '<p class="kanban-loading">' + Downstage.i18n.t("kanban.loading") + "</p>";
        if (!fetchBoard) {
          state.columns = merged.initialColumns || [];
          render();
          return;
        }
        fetchBoard()
          .then(function (data) {
            state.columns = (data && data.columns) || [];
            render();
          })
          .catch(function () {
            board.innerHTML =
              '<p class="kanban-empty">' + Downstage.i18n.t("kanban.loadFailed") + "</p>";
          });
      }

      toolbar.innerHTML =
        '<span class="text-sm text-muted">' +
        Downstage.i18n.t("kanban.dragHint") +
        '</span><button type="button" class="btn btn-sm btn-secondary">' +
        Downstage.i18n.t("kanban.refresh") +
        "</button>";
      toolbar.querySelector("button").addEventListener("click", load);

      load();
      root.setAttribute("data-kanban-mounted", "true");
      return { root: root, refresh: load };
    }

    function init() {
      document
        .querySelectorAll("[data-kanban]:not([data-kanban-mounted]):not([data-kanban-demo])")
        .forEach(function (el) {
          mount(el, {});
        });
    }

    return { init: init, mount: mount };
  })();

  /* ==========================================================================
     DATA TABLE — local or remote pagination / sort / search
     ========================================================================== */

  Downstage.dataTable = (function () {
    function mount(root, options) {
      if (!root) return null;
      var opts = options || {};
      var columns = opts.columns || [];
      var mode = opts.mode || "local";
      var pageSize = opts.pageSize || 10;
      var page = 1;
      var sortKey = opts.initialSortKey || (columns[0] && columns[0].key) || "";
      var sortDir = opts.initialSortDir === "desc" ? "desc" : "asc";
      var q = "";
      var localRows = opts.rows || [];
      var fetchRemote = opts.fetchRemote;

      root.classList.add("data-table-host");
      root.innerHTML = "";

      var wrap = document.createElement("div");
      wrap.className = "data-table-wrap";
      var toolbar = document.createElement("div");
      toolbar.className = "data-table-toolbar";
      var search = document.createElement("input");
      search.type = "search";
      search.className = "input";
      search.placeholder = opts.searchPlaceholder || Downstage.i18n.t("dataTable.filterPlaceholder");
      search.setAttribute("aria-label", Downstage.i18n.t("dataTable.filterAria"));
      var meta = document.createElement("span");
      meta.className = "data-table-meta";
      toolbar.appendChild(search);
      toolbar.appendChild(meta);

      var scroll = document.createElement("div");
      scroll.className = "data-table-scroll";
      var table = document.createElement("table");
      table.className = "table table-striped data-table";

      var thead = document.createElement("thead");
      var trh = document.createElement("tr");
      columns.forEach(function (col) {
        var th = document.createElement("th");
        th.textContent = col.label != null ? col.label : col.key;
        if (col.sortable !== false) {
          th.classList.add("sortable");
          th.dataset.sortKey = col.key;
        }
        trh.appendChild(th);
      });
      thead.appendChild(trh);
      var tbody = document.createElement("tbody");
      table.appendChild(thead);
      table.appendChild(tbody);

      var footer = document.createElement("div");
      footer.className = "data-table-footer";
      footer.innerHTML =
        '<span class="data-table-page-info"></span><div class="data-table-pagination"><button type="button" class="btn btn-sm btn-secondary" data-dt-prev></button><button type="button" class="btn btn-sm btn-secondary" data-dt-next></button></div>';

      var prevBtn = footer.querySelector("[data-dt-prev]");
      var nextBtn = footer.querySelector("[data-dt-next]");

      scroll.appendChild(table);
      wrap.appendChild(toolbar);
      wrap.appendChild(scroll);
      wrap.appendChild(footer);
      root.appendChild(wrap);

      var total = 0;
      var rows = [];

      function debounce(fn, ms) {
        var t;
        return function () {
          var a = arguments;
          clearTimeout(t);
          t = setTimeout(function () {
            fn.apply(null, a);
          }, ms);
        };
      }

      function sortLocal(arr) {
        if (!sortKey) return arr.slice();
        var copy = arr.slice();
        copy.sort(function (a, b) {
          var av = a[sortKey];
          var bv = b[sortKey];
          if (av == null) av = "";
          if (bv == null) bv = "";
          if (typeof av === "number" && typeof bv === "number") {
            return sortDir === "asc" ? av - bv : bv - av;
          }
          av = String(av);
          bv = String(bv);
          if (av < bv) return sortDir === "asc" ? -1 : 1;
          if (av > bv) return sortDir === "asc" ? 1 : -1;
          return 0;
        });
        return copy;
      }

      function filterLocal(arr) {
        if (!q) return arr.slice();
        var nq = q.toLowerCase();
        return arr.filter(function (row) {
          return columns.some(function (col) {
            var v = row[col.key];
            return v != null && String(v).toLowerCase().indexOf(nq) !== -1;
          });
        });
      }

      function paint() {
        tbody.innerHTML = "";
        rows.forEach(function (row) {
          var tr = document.createElement("tr");
          columns.forEach(function (col) {
            var td = document.createElement("td");
            td.textContent = row[col.key] != null ? String(row[col.key]) : "";
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });

        thead.querySelectorAll("th").forEach(function (th) {
          var ind = th.querySelector(".sort-indicator");
          if (ind) ind.remove();
          if (th.dataset.sortKey === sortKey) {
            var span = document.createElement("span");
            span.className = "sort-indicator";
            span.textContent = sortDir === "asc" ? "▲" : "▼";
            th.appendChild(span);
          }
        });

        var start = (page - 1) * pageSize + 1;
        var end = (page - 1) * pageSize + rows.length;
        if (rows.length === 0) start = 0;
        meta.textContent = rows.length
          ? Downstage.i18n.t("dataTable.showing", { start: start, end: end, total: total })
          : Downstage.i18n.t("dataTable.noRows");
        var totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        footer.querySelector(".data-table-page-info").textContent = Downstage.i18n.t("dataTable.pageInfo", {
          page: page,
          totalPages: totalPages,
        });
        prevBtn.textContent = Downstage.i18n.t("dataTable.previous");
        nextBtn.textContent = Downstage.i18n.t("dataTable.next");

        var maxPage = totalPages;
        prevBtn.disabled = page <= 1;
        nextBtn.disabled = page >= maxPage;
      }

      function applyLocal() {
        var filtered = filterLocal(localRows);
        total = filtered.length;
        var sorted = sortLocal(filtered);
        var maxPage = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (page > maxPage) page = maxPage;
        var start = (page - 1) * pageSize;
        rows = sorted.slice(start, start + pageSize);
        paint();
      }

      function applyRemote() {
        wrap.classList.add("is-loading");
        fetchRemote({
          page: page,
          pageSize: pageSize,
          sortKey: sortKey,
          sortDir: sortDir,
          q: q,
        })
          .then(function (res) {
            rows = res.rows || res.data || [];
            total = res.total != null ? res.total : rows.length;
            paint();
          })
          .catch(function () {
            rows = [];
            total = 0;
            paint();
          })
          .finally(function () {
            wrap.classList.remove("is-loading");
          });
      }

      function refresh() {
        if (mode === "remote" && fetchRemote) applyRemote();
        else applyLocal();
      }

      search.addEventListener(
        "input",
        debounce(function () {
          q = search.value;
          page = 1;
          refresh();
        }, 200)
      );

      thead.addEventListener("click", function (e) {
        var th = e.target.closest("th.sortable");
        if (!th || !table.contains(th)) return;
        var key = th.dataset.sortKey;
        if (sortKey === key) sortDir = sortDir === "asc" ? "desc" : "asc";
        else {
          sortKey = key;
          sortDir = "asc";
        }
        page = 1;
        refresh();
      });

      footer.querySelector("[data-dt-prev]").addEventListener("click", function () {
        if (page > 1) {
          page--;
          refresh();
        }
      });
      footer.querySelector("[data-dt-next]").addEventListener("click", function () {
        var maxPage = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (page < maxPage) {
          page++;
          refresh();
        }
      });

      refresh();
      root.setAttribute("data-data-table-mounted", "true");
      return { root: root, refresh: refresh };
    }

    function init() {}

    return { init: init, mount: mount };
  })();

  /* ==========================================================================
     PASSWORD VISIBILITY TOGGLE
     Wraps input[type=password] with a button (eye / eye-off). Opt out: data-password-toggle="off".
     ========================================================================== */

  Downstage.passwordInput = (function () {
    function updateToggle(btn, useEl, input) {
      var visible = input.type === "text";
      btn.setAttribute("aria-pressed", visible ? "true" : "false");
      btn.setAttribute("aria-label", visible ? Downstage.i18n.t("password.hide") : Downstage.i18n.t("password.show"));
      useEl.setAttribute("href", iconsHref(visible ? "eye-off" : "eye"));
    }

    function mount(input) {
      if (!input || input.getAttribute("data-password-toggle") === "off") return null;
      if (input.closest(".input-password-wrap")) return null;
      if (input.type !== "password") return null;

      var wrap = document.createElement("div");
      wrap.className = "input-password-wrap";
      if (input.classList.contains("input-minimal")) wrap.classList.add("input-password-wrap-minimal");

      input.parentNode.insertBefore(wrap, input);
      wrap.appendChild(input);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "input-password-toggle";

      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "icon");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("width", "20");
      svg.setAttribute("height", "20");
      var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", iconsHref("eye"));
      svg.appendChild(use);
      btn.appendChild(svg);

      updateToggle(btn, use, input);
      wrap.appendChild(btn);

      btn.addEventListener("click", function () {
        input.type = input.type === "password" ? "text" : "password";
        updateToggle(btn, use, input);
      });

      return { wrap: wrap, input: input, button: btn };
    }

    function init() {
      document.querySelectorAll('input[type="password"]').forEach(function (el) {
        mount(el);
      });
    }

    return { init: init, mount: mount };
  })();

  /* ==========================================================================
     COPY FIELD — .input-copy-wrap > input | textarea + .input-copy-btn
     ========================================================================== */

  Downstage.copyField = (function () {
    var FEEDBACK_MS = 1800;

    function getValue(el) {
      if (!el) return "";
      if (typeof el.value === "string") return el.value;
      return el.textContent || "";
    }

    function copyToClipboard(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
      return new Promise(function (resolve, reject) {
        try {
          var ta = document.createElement("textarea");
          ta.value = text;
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    }

    function bind(wrap) {
      var field = wrap.querySelector("input, textarea");
      var btn = wrap.querySelector(".input-copy-btn");
      if (!field || !btn) return;

      var labelEl = btn.querySelector(".input-copy-btn-label");
      var copyMsg = Downstage.i18n.t("copyField.copy");
      var copiedMsg = Downstage.i18n.t("copyField.copied");
      if (labelEl) labelEl.textContent = copyMsg;
      btn.setAttribute("aria-label", copyMsg);

      var timer = null;
      btn.addEventListener("click", function () {
        copyToClipboard(getValue(field)).then(
          function () {
            if (labelEl) labelEl.textContent = copiedMsg;
            btn.setAttribute("aria-label", copiedMsg);
            if (timer) clearTimeout(timer);
            timer = setTimeout(function () {
              if (labelEl) labelEl.textContent = copyMsg;
              btn.setAttribute("aria-label", copyMsg);
            }, FEEDBACK_MS);
          },
          function () {}
        );
      });
    }

    function init() {
      document.querySelectorAll(".input-copy-wrap").forEach(bind);
    }

    function mount(wrap) {
      if (wrap && wrap.classList && wrap.classList.contains("input-copy-wrap")) bind(wrap);
    }

    return { init: init, mount: mount };
  })();

  /* ==========================================================================
     AUTO-INIT
     ========================================================================== */

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    if (typeof window !== "undefined" && window.__DOWNSTAGE_ICONS_BASE__) {
      _iconsBase = window.__DOWNSTAGE_ICONS_BASE__;
    }
    Downstage.theme.init();
    var localeBase =
      typeof window !== "undefined" && window.__DOWNSTAGE_LOCALE_BASE__
        ? window.__DOWNSTAGE_LOCALE_BASE__
        : "locales/";
    Downstage.i18n.configure({ locale: "en", basePath: localeBase }).then(function () {
      Downstage.navbar.init();
      Downstage.tabs.init();
      Downstage.accordion.init();
      Downstage.lightbox.init();
      Downstage.slider.init();
      Downstage.videoPlayer.init();
      Downstage.audioPlayer.init();
      Downstage.uploadDrop.init();
      Downstage.htmlEditor.init();
      Downstage.combobox.init();
      Downstage.searchAutocomplete.init();
      Downstage.kanban.init();
      Downstage.dataTable.init();
      Downstage.passwordInput.init();
      Downstage.copyField.init();
    });
  });

  window.Downstage = Downstage;
})(window, document);
