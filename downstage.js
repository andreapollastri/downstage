/* ============================================================================
   downstage.js — JavaScript helper for downstage.css
   by Andrea Pollastri
   ----------------------------------------------------------------------------
   Zero dependencies. Vanilla JS. Auto-init on DOMContentLoaded.
   JavaScript with built-in components — theme, navbar, tabs, lightbox, slider, media players,
   HTML editor, combobox, search, Kanban, data table, calendar, i18n. Exposes window.Downstage.

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
   - Input autocomplete    ([data-input-autocomplete] + Downstage.inputAutocomplete.mount — GET search + POST create)
   - Tag input             ([data-tag-input] + Downstage.tagInput.mount — multi-tag with GET search + POST create)
   - Kanban                ([data-kanban] + fetchUrl/moveUrl AJAX or mount callbacks)
   - Data table            ([data-data-table] + Downstage.dataTable.mount)
   - Date picker           ([data-datepicker] + Downstage.datePicker.mount — date / datetime)
   - Date range            ([data-daterange] + Downstage.dateRange.mount — from/to with auto min-max)
   - Calendar              ([data-calendar] + Downstage.calendar.mount — month/week/day/timeline)
   - Wizard                ([data-wizard] + Downstage.wizard.mount — linear / free nav, vertical / dots)
   - Form validate         (form[data-form-validate] + Downstage.formValidate.mount)
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
    '{"navbar":{"openMenu":"Open menu","closeMenu":"Close menu"},"password":{"show":"Show password","hide":"Hide password"},"copyField":{"copy":"Copy","copied":"Copied"},"lightbox":{"close":"Close","previous":"Previous","next":"Next"},"slider":{"previous":"Previous","next":"Next","slide":"Slide {n}"},"wizard":{"previous":"Previous","next":"Next","finish":"Finish","stepOf":"Step {current} of {total}"},"formValidate":{"required":"This field is required.","email":"Enter a valid email address.","minLength":"Use at least {min} characters.","pattern":"Invalid format."},"videoPlayer":{"play":"Play","pause":"Pause","mute":"Mute","unmute":"Unmute","enterFullscreen":"Enter fullscreen","exitFullscreen":"Exit fullscreen"},"audioPlayer":{"play":"Play","pause":"Pause","untitled":"Untitled"},"combobox":{"loading":"Loading…","noResults":"No results"},"searchAutocomplete":{"placeholder":"Search…"},"inputAutocomplete":{"loading":"Loading…","noResults":"No results","createNew":"Create \\"{text}\\"…","creating":"Creating…","createFailed":"Creation failed","modalCreate":"Create new…","modalTitle":"New item","modalClose":"Close","modalCancel":"Cancel","modalSave":"Create","modalSaving":"Saving…","modalFailed":"Creation failed. Please try again."},"tagInput":{"loading":"Loading…","noResults":"No results","createNew":"Create \\"{text}\\"…","creating":"Creating…","createFailed":"Creation failed","removeTag":"Remove {tag}"},"kanban":{"dragHint":"Drag cards between columns","refresh":"Refresh","loading":"Loading…","noColumns":"No columns","loadFailed":"Failed to load board"},"dataTable":{"filterPlaceholder":"Filter…","filterAria":"Filter table","showing":"Showing {start}–{end} of {total}","noRows":"No rows","pageInfo":"Page {page} / {totalPages}","previous":"Previous","next":"Next"},"dateRange":{"from":"From","to":"To"},"calendar":{"previous":"Prev","next":"Next","today":"Today","month":"Month","week":"Week","day":"Day","timeline":"Timeline","resource":"Resource","allEvents":"All events","loading":"Loading…","loadFailed":"Failed to load events"},"orderList":{"searchPlaceholder":"Search items…","removeItem":"Remove","dragHint":"Drag to reorder","manualSort":"Manual sort","columnSort":"Column sort","switchToManual":"Switch to manual sort order","switchToColumn":"Switch to column sort order","itemCount":"{count} items","empty":"No items","createNew":"Create new item…","createTitle":"New item","createClose":"Close","createCancel":"Cancel","createSave":"Add item","createSaving":"Saving…","createFailed":"Creation failed. Please try again."},"htmlEditor":{"initialHtml":"<p>Select text and use the toolbar to format.</p>","placeholder":"Write here…","rawLeft":"Rich text","rawRight":"HTML source","rawSwitchTitle":"Switch to HTML source","rawSwitchAria":"HTML source mode","toolbarAria":"Text formatting","rawTextareaAria":"HTML source","toolbar":{"bold":{"title":"Bold","aria":"Bold"},"italic":{"title":"Italic","aria":"Italic"},"underline":{"title":"Underline","aria":"Underline"},"strikeThrough":{"title":"Strikethrough","aria":"Strikethrough"},"createLink":{"title":"Link","aria":"Insert link","label":"Link"},"justifyLeft":{"title":"Align left","aria":"Align left","label":"◀"},"justifyCenter":{"title":"Align center","aria":"Align center","label":"▣"},"justifyRight":{"title":"Align right","aria":"Align right","label":"▶"},"justifyFull":{"title":"Justify","aria":"Justify","label":"≡"},"h1":{"title":"Heading 1","aria":"Heading 1","label":"H1"},"h2":{"title":"Heading 2","aria":"Heading 2","label":"H2"},"h3":{"title":"Heading 3","aria":"Heading 3","label":"H3"},"h4":{"title":"Heading 4","aria":"Heading 4","label":"H4"},"h5":{"title":"Heading 5","aria":"Heading 5","label":"H5"},"h6":{"title":"Heading 6","aria":"Heading 6","label":"H6"},"h7":{"title":"Heading 7 (styled paragraph)","aria":"Heading 7","label":"H7"},"p":{"title":"Paragraph","aria":"Paragraph","label":"P"},"inlineCode":{"title":"Inline code","aria":"Inline code","html":"&lt;code&gt;"},"blockquote":{"title":"Quote","aria":"Quote","label":"“ ”"}},"linkModal":{"title":"Link","lede":"Website, email, phone, or custom URL (<code class=\\"text-mono\\">mailto:</code>, <code class=\\"text-mono\\">tel:</code>, anchors…).","kindLabel":"Type","kindAria":"Link type","valueLabelPlaceholder":"Address","valueAria":"Link address","valueLabelMailto":"Email address","valueLabelTel":"Phone number","valueLabelCustom":"URL or path","valueLabelUrl":"Web address","placeholderMailto":"name@example.com","placeholderTel":"+1 555 123 4567","placeholderCustom":"page.html#section or /path","placeholderUrl":"https://…","subjectLabel":"Email subject (optional)","subjectPh":"Message subject","targetLabel":"Open link in","relSpan":"<code class=\\"text-mono\\">rel=\\"noopener noreferrer\\"</code> (recommended for new-tab links)","cancel":"Cancel","apply":"Apply","closeAria":"Close dialog","kindOptions":[{"value":"url","label":"Web page (https)"},{"value":"mailto","label":"Email"},{"value":"tel","label":"Phone"},{"value":"custom","label":"Custom URL"}],"targetOptions":[{"value":"_self","label":"Same tab / window"},{"value":"_blank","label":"New tab"}]}}}',
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
     4b. WIZARD (stepper)
     Markup:
       <div class="wizard" data-wizard data-wizard-free="false">
         <nav class="wizard-nav" aria-label="Steps"> … buttons[data-wizard-goto] … </nav>
         <div class="wizard-panels">
           <section class="wizard-panel" data-wizard-panel="0">…</section>
         </div>
         <div class="wizard-footer">
           <button type="button" data-wizard-prev>…</button>
           <button type="button" data-wizard-next>…</button>
         </div>
       </div>
     Options: free, onStepChange(step,total), onComplete()
     Classes: .wizard--vertical, .wizard-nav--dots
     ========================================================================== */

  Downstage.wizard = (function () {
    function parseBool(v, def) {
      if (v === undefined || v === null || v === "") return def;
      var s = String(v).toLowerCase();
      if (s === "false" || s === "0" || s === "no") return false;
      if (s === "true" || s === "1" || s === "yes") return true;
      return def;
    }

    function datasetOptions(el) {
      var o = {};
      if (el.dataset.wizardFree != null) o.free = parseBool(el.dataset.wizardFree, false);
      return o;
    }

    function mount(root, options) {
      var el = typeof root === "string" ? document.querySelector(root) : root;
      if (!el) return null;
      if (el.getAttribute("data-wizard-mounted") === "true") return null;
      options = options || {};

      var free =
        options.free !== undefined
          ? !!options.free
          : parseBool(el.getAttribute("data-wizard-free"), false);

      var list = Array.prototype.slice.call(el.querySelectorAll(".wizard-panel"));
      if (!list.length) return null;
      var n = list.length;

      list.forEach(function (p, i) {
        p.setAttribute("data-wizard-panel", String(i));
      });

      var current = 0;
      var maxReached = 0;

      var navBtns = el.querySelectorAll("[data-wizard-goto]");
      var prevBtn = el.querySelector("[data-wizard-prev]");
      var nextBtn = el.querySelector("[data-wizard-next]");
      var progressEl = el.querySelector("[data-wizard-progress]");

      function t(key) {
        return Downstage.i18n.t("wizard." + key);
      }

      function canGoTo(idx) {
        if (idx < 0 || idx >= n) return false;
        if (free) return true;
        /* Linear: any already-visited step, or exactly one step ahead (Next / one-at-a-time nav). */
        if (idx <= maxReached) return true;
        if (idx === maxReached + 1) return true;
        return false;
      }

      function setNavState() {
        Array.prototype.forEach.call(navBtns, function (btn) {
          var idx = parseInt(btn.getAttribute("data-wizard-goto"), 10);
          if (isNaN(idx)) return;
          var active = idx === current;
          btn.classList.toggle("is-active", active);
          btn.setAttribute("aria-selected", active ? "true" : "false");
          if (!free) {
            btn.disabled = idx > maxReached;
          } else {
            btn.disabled = false;
          }
        });
      }

      function setPanelState() {
        list.forEach(function (p, i) {
          var active = i === current;
          p.classList.toggle("is-active", active);
          p.setAttribute("aria-hidden", active ? "false" : "true");
          p.hidden = !active;
        });
      }

      function setFooterState() {
        if (prevBtn) {
          prevBtn.disabled = current <= 0;
          prevBtn.setAttribute("aria-label", t("previous"));
        }
        if (nextBtn) {
          var last = current >= n - 1;
          var nextText = last ? t("finish") : t("next");
          var nextLbl = nextBtn.querySelector(".wizard-btn-label");
          if (nextLbl) nextLbl.textContent = nextText;
          else nextBtn.textContent = nextText;
          nextBtn.setAttribute("aria-label", nextText);
        }
        if (progressEl) {
          progressEl.textContent = Downstage.i18n.t("wizard.stepOf", {
            current: current + 1,
            total: n,
          });
        }
      }

      function emitStep() {
        if (typeof options.onStepChange === "function") {
          options.onStepChange.call(el, current, n);
        }
      }

      function goTo(idx) {
        if (!canGoTo(idx)) return;
        current = idx;
        if (idx > maxReached) maxReached = idx;
        setPanelState();
        setNavState();
        setFooterState();
        emitStep();
      }

      function next() {
        if (current >= n - 1) {
          if (typeof options.onComplete === "function") {
            options.onComplete.call(el, { step: current, total: n });
          }
          return;
        }
        goTo(current + 1);
      }

      function prev() {
        goTo(current - 1);
      }

      Array.prototype.forEach.call(navBtns, function (btn) {
        btn.addEventListener("click", function () {
          var idx = parseInt(btn.getAttribute("data-wizard-goto"), 10);
          if (isNaN(idx)) return;
          goTo(idx);
        });
      });

      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          prev();
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          next();
        });
      }

      var initial = el.querySelector(".wizard-panel.is-active");
      if (initial) {
        var ini = list.indexOf(initial);
        if (ini >= 0) {
          current = ini;
          maxReached = ini;
        }
      } else {
        maxReached = 0;
      }

      setPanelState();
      setNavState();
      setFooterState();
      emitStep();

      el.setAttribute("data-wizard-mounted", "true");

      return {
        root: el,
        getStep: function () {
          return current;
        },
        getTotal: function () {
          return n;
        },
        goToStep: function (idx) {
          goTo(idx);
        },
        next: next,
        prev: prev,
        destroy: function () {
          el.removeAttribute("data-wizard-mounted");
        },
      };
    }

    function init() {
      document.querySelectorAll("[data-wizard]:not([data-wizard-mounted])").forEach(function (node) {
        mount(node, datasetOptions(node));
      });
    }

    return { init: init, mount: mount };
  })();

  /* ==========================================================================
     4c. FORM VALIDATE (lightweight client-side checks)
     Markup:
       <form data-form-validate novalidate>
         <div class="field">
           <label class="label" for="e">Email</label>
           <input id="e" class="input" type="email" required>
           <span class="error" aria-live="polite"></span>
         </div>
       </form>
     Optional on .field: data-error-required, data-error-email, data-error-minlength, data-error-pattern
     ========================================================================== */

  Downstage.formValidate = (function () {
    var DEFAULT_MSG = {
      required: "This field is required.",
      email: "Enter a valid email address.",
      minLength: "Use at least {min} characters.",
      pattern: "Invalid format.",
    };

    function translate(key, vars) {
      var s = Downstage.i18n.t("formValidate." + key);
      if (s === "formValidate." + key || !s) s = DEFAULT_MSG[key] || "";
      if (vars && s) {
        return s.replace(/\{(\w+)\}/g, function (_, k) {
          return vars[k] != null ? String(vars[k]) : "";
        });
      }
      return s;
    }

    function clearFieldError(input) {
      var field = input.closest(".field");
      if (!field) return;
      field.classList.remove("has-error");
      input.removeAttribute("aria-invalid");
      var err = field.querySelector(".error[data-form-err]");
      if (err) err.textContent = "";
    }

    function showFieldError(input, message) {
      var field = input.closest(".field");
      if (!field) return;
      field.classList.add("has-error");
      input.setAttribute("aria-invalid", "true");
      var err = field.querySelector(".error");
      if (!err) {
        err = document.createElement("span");
        err.className = "error";
        err.setAttribute("aria-live", "polite");
        field.appendChild(err);
      }
      err.setAttribute("data-form-err", "true");
      err.textContent = message;
    }

    function validateField(input) {
      var field = input.closest(".field");
      if (!field || input.disabled) return true;
      if (input.type === "hidden") return true;

      if (input.type === "checkbox") {
        if (input.required && !input.checked) {
          showFieldError(
            input,
            field.getAttribute("data-error-required") ||
              input.getAttribute("data-error-required") ||
              translate("required"),
          );
          return false;
        }
        clearFieldError(input);
        return true;
      }

      var v = String(input.value || "").trim();

      if (input.required && !v) {
        showFieldError(
          input,
          field.getAttribute("data-error-required") ||
            input.getAttribute("data-error-required") ||
            translate("required"),
        );
        return false;
      }

      if (v && (input.type === "email" || input.getAttribute("data-validate") === "email")) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
          showFieldError(
            input,
            field.getAttribute("data-error-email") || input.getAttribute("data-error-email") || translate("email"),
          );
          return false;
        }
      }

      var minL = input.getAttribute("minlength");
      if (minL && v.length < parseInt(minL, 10)) {
        showFieldError(
          input,
          field.getAttribute("data-error-minlength") ||
            translate("minLength", { min: minL }),
        );
        return false;
      }

      var pat = input.getAttribute("pattern");
      if (pat && v) {
        try {
          var re = new RegExp("^(?:" + pat + ")$");
          if (!re.test(v)) {
            showFieldError(
              input,
              field.getAttribute("data-error-pattern") || translate("pattern"),
            );
            return false;
          }
        } catch (e) {
          /* ignore invalid pattern attr */
        }
      }

      clearFieldError(input);
      return true;
    }

    function mount(form, options) {
      if (!form || form.getAttribute("data-form-validate-mounted")) return null;
      options = options || {};
      form.setAttribute("novalidate", "novalidate");
      form.setAttribute("data-form-validate-mounted", "true");

      form.addEventListener("submit", function (e) {
        var ok = true;
        var fields = form.querySelectorAll("input, textarea, select");
        for (var i = 0; i < fields.length; i++) {
          var f = fields[i];
          if (f.form !== form) continue;
          if (f.type === "submit" || f.type === "button" || f.type === "reset") continue;
          if (!validateField(f)) ok = false;
        }
        if (!ok) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (typeof options.onValid === "function") {
          e.preventDefault();
          options.onValid.call(form, e);
        }
      });

      if (options.live !== false) {
        form.querySelectorAll("input, textarea, select").forEach(function (inp) {
          if (inp.type === "submit" || inp.type === "button" || inp.type === "reset") return;
          inp.addEventListener("input", function () {
            var fd = inp.closest(".field");
            if (fd && fd.classList.contains("has-error")) validateField(inp);
          });
          inp.addEventListener("blur", function () {
            validateField(inp);
          });
        });
      }

      form.addEventListener("reset", function () {
        window.setTimeout(function () {
          form.querySelectorAll("input, textarea, select").forEach(function (inp) {
            clearFieldError(inp);
          });
        }, 0);
      });

      return form;
    }

    function init() {
      document.querySelectorAll("form[data-form-validate]").forEach(function (form) {
        if (!form.getAttribute("data-form-validate-mounted")) mount(form, {});
      });
    }

    return { mount: mount, init: init, validateField: validateField };
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
     INPUT AUTOCOMPLETE — GET search + POST create-on-the-fly
     Stores value in a hidden input, displays label.
     When fetchOptions returns nothing the user can type free text and
     a POST is fired via createOption to persist a new record.
     ========================================================================== */

  Downstage.inputAutocomplete = (function () {

    function debounce(fn, ms) {
      var t;
      return function () {
        var ctx = this, args = arguments;
        clearTimeout(t);
        t = setTimeout(function () { fn.apply(ctx, args); }, ms);
      };
    }

    function norm(s) { return String(s || "").toLowerCase().trim(); }

    function mount(root, options) {
      if (!root) return null;
      if (typeof root === "string") root = document.querySelector(root);
      if (!root) return null;
      var opts = options || {};

      var fetchFn        = opts.fetchOptions;
      var fetchUrl       = opts.fetchUrl || (root.dataset && root.dataset.inputAutocompleteFetch);
      var createFn       = opts.createOption;
      var createUrl      = opts.createUrl || (root.dataset && root.dataset.inputAutocompleteCreate);
      var createMethod   = (opts.createMethod || (root.dataset && root.dataset.inputAutocompleteCreateMethod) || "POST").toUpperCase();
      var createPayloadKey = opts.createPayloadKey || (root.dataset && root.dataset.inputAutocompleteCreateKey) || "name";
      var createFields   = opts.createFields || null;
      var createTitle    = opts.createTitle || Downstage.i18n.t("inputAutocomplete.modalTitle");
      var useModal       = false;
      var minChars       = opts.minChars != null ? opts.minChars : parseInt((root.dataset && root.dataset.inputAutocompleteMinChars) || "1", 10) || 1;
      var debounceMs     = opts.debounceMs != null ? opts.debounceMs : parseInt((root.dataset && root.dataset.inputAutocompleteDebounce) || "300", 10) || 300;
      var placeholder    = opts.placeholder != null ? opts.placeholder : (root.dataset && root.dataset.inputAutocompletePlaceholder) || "";
      var name           = opts.name || (root.dataset && root.dataset.inputAutocompleteName) || "";
      var inputId        = opts.id || "iac-" + Math.random().toString(36).slice(2, 9);
      var listId         = inputId + "-list";
      var hiddenName     = name || "inputAutocomplete";

      if (fetchUrl && !fetchFn) {
        fetchFn = function (query) {
          var u = new URL(fetchUrl, window.location.href);
          u.searchParams.set("q", query);
          return fetch(u.toString(), { credentials: "same-origin" })
            .then(function (r) { if (!r.ok) throw new Error("fetch"); return r.json(); })
            .then(function (j) {
              if (Array.isArray(j)) return j;
              if (j && Array.isArray(j.results)) return j.results;
              if (j && Array.isArray(j.items)) return j.items;
              if (j && Array.isArray(j.data)) return j.data;
              return [];
            });
        };
      }

      if (createUrl && !createFn) {
        if (createFields) {
          createFn = function (data) {
            return fetch(createUrl, {
              method: createMethod,
              credentials: "same-origin",
              headers: { "Content-Type": "application/json", Accept: "application/json" },
              body: JSON.stringify(data)
            }).then(function (r) { if (!r.ok) throw new Error("create"); return r.json(); })
              .then(function (j) {
                return { value: j.value != null ? j.value : j.id, label: j.label != null ? j.label : j.name || "" };
              });
          };
        } else {
          createFn = function (text) {
            var body = {};
            body[createPayloadKey] = text;
            return fetch(createUrl, {
              method: createMethod,
              credentials: "same-origin",
              headers: { "Content-Type": "application/json", Accept: "application/json" },
              body: JSON.stringify(body)
            }).then(function (r) { if (!r.ok) throw new Error("create"); return r.json(); })
              .then(function (j) {
                return { value: j.value != null ? j.value : j.id, label: j.label != null ? j.label : j.name || text };
              });
          };
        }
      }

      useModal = !!(createFields && createFields.length && createFn);

      root.classList.add("combobox", "input-autocomplete");
      root.innerHTML = "";

      var hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.name = hiddenName;
      hidden.value = opts.value != null ? String(opts.value) : "";
      root.appendChild(hidden);

      var wrap = document.createElement("div");
      wrap.className = "combobox-input-wrap";
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

      /* ---- create-via-modal ---- */
      var iacModalOverlay = null;
      var iacModalInputs = {};
      var iacModalSubmitting = false;
      var openIacModal = null;

      if (useModal) {
        iacModalOverlay = document.createElement("div");
        iacModalOverlay.className = "iac-create-modal modal-overlay hidden";
        iacModalOverlay.setAttribute("aria-hidden", "true");

        var iacPanel = document.createElement("div");
        iacPanel.className = "modal";
        iacPanel.setAttribute("role", "dialog");
        iacPanel.setAttribute("aria-modal", "true");
        var iacHeadId = "iac-modal-" + Math.random().toString(36).slice(2, 9);
        iacPanel.setAttribute("aria-labelledby", iacHeadId);

        var iacClose = document.createElement("button");
        iacClose.type = "button";
        iacClose.className = "iac-modal-close btn btn-ghost btn-sm";
        iacClose.setAttribute("aria-label", Downstage.i18n.t("inputAutocomplete.modalClose"));
        iacClose.innerHTML = "&times;";

        var iacTitle = document.createElement("div");
        iacTitle.className = "modal-title";
        iacTitle.id = iacHeadId;
        iacTitle.textContent = createTitle;

        var iacBody = document.createElement("div");
        iacBody.className = "modal-body";
        var iacForm = document.createElement("div");
        iacForm.className = "stack";

        createFields.forEach(function (f) {
          var field = document.createElement("div");
          field.className = "field";
          var label = document.createElement("label");
          label.className = "label";
          label.textContent = f.label || f.key;
          field.appendChild(label);
          var inp;
          if (f.type === "select" && f.options) {
            inp = document.createElement("select");
            inp.className = "select";
            if (!f.required) {
              var oe = document.createElement("option");
              oe.value = ""; oe.textContent = "—";
              inp.appendChild(oe);
            }
            f.options.forEach(function (opt) {
              var o = document.createElement("option");
              if (typeof opt === "object") { o.value = opt.value; o.textContent = opt.label; }
              else { o.value = String(opt); o.textContent = String(opt); }
              inp.appendChild(o);
            });
          } else if (f.type === "textarea") {
            inp = document.createElement("textarea");
            inp.className = "input"; inp.rows = 3;
          } else {
            inp = document.createElement("input");
            inp.className = "input";
            inp.type = f.type || "text";
            if (f.step) inp.step = String(f.step);
          }
          if (f.placeholder) inp.placeholder = f.placeholder;
          if (f.required) inp.required = true;
          if (f.default != null) inp.value = String(f.default);
          inp.setAttribute("data-create-field", f.key);
          field.appendChild(inp);
          iacForm.appendChild(field);
          iacModalInputs[f.key] = inp;
        });

        iacBody.appendChild(iacForm);

        var iacError = document.createElement("div");
        iacError.className = "iac-create-error alert alert-danger mt-4 hidden";
        iacBody.appendChild(iacError);

        var iacFoot = document.createElement("div");
        iacFoot.className = "modal-footer";
        var iacCancelBtn = document.createElement("button");
        iacCancelBtn.type = "button";
        iacCancelBtn.className = "btn btn-secondary";
        iacCancelBtn.textContent = Downstage.i18n.t("inputAutocomplete.modalCancel");
        var iacSubmitBtn = document.createElement("button");
        iacSubmitBtn.type = "button";
        iacSubmitBtn.className = "btn btn-primary";
        iacSubmitBtn.textContent = Downstage.i18n.t("inputAutocomplete.modalSave");

        iacFoot.appendChild(iacCancelBtn);
        iacFoot.appendChild(iacSubmitBtn);
        iacPanel.appendChild(iacClose);
        iacPanel.appendChild(iacTitle);
        iacPanel.appendChild(iacBody);
        iacPanel.appendChild(iacFoot);
        iacModalOverlay.appendChild(iacPanel);
        root.appendChild(iacModalOverlay);

        openIacModal = function (prefill) {
          Object.keys(iacModalInputs).forEach(function (k) {
            var f = null;
            createFields.forEach(function (cf) { if (cf.key === k) f = cf; });
            iacModalInputs[k].value = f && f.default != null ? String(f.default) : "";
            iacModalInputs[k].classList.remove("is-invalid");
          });
          if (prefill && createFields[0] && iacModalInputs[createFields[0].key]) {
            iacModalInputs[createFields[0].key].value = prefill;
          }
          iacError.classList.add("hidden");
          iacModalSubmitting = false;
          iacSubmitBtn.disabled = false;
          iacSubmitBtn.textContent = Downstage.i18n.t("inputAutocomplete.modalSave");
          iacModalOverlay.classList.remove("hidden");
          iacModalOverlay.setAttribute("aria-hidden", "false");
          document.body.style.overflow = "hidden";
          var first = iacForm.querySelector("input, select, textarea");
          if (first) setTimeout(function () { first.focus(); }, 0);
        };

        function closeIacModal() {
          iacModalOverlay.classList.add("hidden");
          iacModalOverlay.setAttribute("aria-hidden", "true");
          document.body.style.overflow = "";
          input.focus();
        }

        function submitIacModal() {
          if (iacModalSubmitting) return;
          var data = {};
          var valid = true;
          createFields.forEach(function (f) {
            var inp = iacModalInputs[f.key];
            var val = inp.value;
            if (f.type === "number" && val !== "") val = parseFloat(val);
            data[f.key] = val;
            if (f.required && (val === "" || val == null)) { valid = false; inp.classList.add("is-invalid"); }
            else { inp.classList.remove("is-invalid"); }
          });
          if (!valid) return;
          iacModalSubmitting = true;
          iacSubmitBtn.disabled = true;
          iacSubmitBtn.textContent = Downstage.i18n.t("inputAutocomplete.modalSaving");
          iacError.classList.add("hidden");

          var resultP;
          try { resultP = createFn(data); } catch (e) { resultP = Promise.reject(e); }

          resultP
            .then(function (result) {
              var val = result && result.value != null ? String(result.value) : "";
              var lbl = result && result.label != null ? result.label : "";
              if (!lbl) {
                var parts = [];
                createFields.forEach(function (f) { if (data[f.key]) parts.push(String(data[f.key])); });
                lbl = parts.join(" — ");
              }
              hidden.value = val;
              input.value = lbl;
              closeIacModal();
              emitChange(val, lbl, true);
            })
            .catch(function () {
              iacError.textContent = Downstage.i18n.t("inputAutocomplete.modalFailed");
              iacError.classList.remove("hidden");
              iacModalSubmitting = false;
              iacSubmitBtn.disabled = false;
              iacSubmitBtn.textContent = Downstage.i18n.t("inputAutocomplete.modalSave");
            });
        }

        iacCancelBtn.addEventListener("click", closeIacModal);
        iacClose.addEventListener("click", closeIacModal);
        iacModalOverlay.addEventListener("click", function (e) { if (e.target === iacModalOverlay) closeIacModal(); });
        iacModalOverlay.addEventListener("keydown", function (e) { if (e.key === "Escape") closeIacModal(); });
        iacSubmitBtn.addEventListener("click", submitIacModal);
        iacForm.addEventListener("keydown", function (e) {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitIacModal(); }
        });
      }

      var items = [];
      var active = -1;
      var loading = false;
      var creating = false;
      var isOpen = false;
      var lastQuery = "";
      var lastResults = [];

      function t(key) { return Downstage.i18n.t(key); }

      function setOpen(v) {
        isOpen = v;
        input.setAttribute("aria-expanded", v ? "true" : "false");
        list.hidden = !v;
        root.classList.toggle("is-open", v);
      }

      function highlight(i) {
        items.forEach(function (el, j) {
          el.classList.toggle("is-active", j === i);
          el.setAttribute("aria-selected", j === i ? "true" : "false");
        });
        active = i;
      }

      function emitChange(val, lbl, isNew) {
        root.dispatchEvent(new CustomEvent("input-autocomplete-change", {
          bubbles: true,
          detail: { value: val, label: lbl, created: !!isNew }
        }));
      }

      function selectByIndex(i) {
        if (i < 0 || i >= items.length) return;
        var row = items[i];
        if (row.dataset.create === "1") {
          doCreate(lastQuery);
          return;
        }
        var val = row.dataset.value;
        hidden.value = val;
        input.value = row.textContent;
        setOpen(false);
        active = -1;
        emitChange(val, row.textContent, false);
      }

      function renderRows(rows, query) {
        list.innerHTML = "";
        items = [];
        if (loading) {
          var li0 = document.createElement("li");
          li0.className = "combobox-loading";
          li0.textContent = t("inputAutocomplete.loading");
          list.appendChild(li0);
          return;
        }
        if (creating) {
          var lic = document.createElement("li");
          lic.className = "combobox-loading";
          lic.textContent = t("inputAutocomplete.creating");
          list.appendChild(lic);
          return;
        }
        if (rows && rows.length) {
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
        if (useModal && createFn) {
          var createLiM = document.createElement("li");
          createLiM.className = "combobox-option combobox-create iac-create-modal-option";
          createLiM.setAttribute("role", "option");
          createLiM.setAttribute("id", listId + "-create");
          createLiM.innerHTML = '<svg class="icon icon-sm" aria-hidden="true"><use href="' + iconsHref("plus") + '" /></svg> ' +
            t("inputAutocomplete.modalCreate");
          createLiM.dataset.create = "1";
          list.appendChild(createLiM);
          items.push(createLiM);
        } else if ((!rows || !rows.length) && query && norm(query).length >= minChars) {
          if (createFn) {
            var createLi = document.createElement("li");
            createLi.className = "combobox-option combobox-create";
            createLi.setAttribute("role", "option");
            createLi.setAttribute("id", listId + "-create");
            createLi.textContent = t("inputAutocomplete.createNew").replace("{text}", query);
            createLi.dataset.create = "1";
            list.appendChild(createLi);
            items.push(createLi);
          } else {
            var liEmpty = document.createElement("li");
            liEmpty.className = "combobox-empty";
            liEmpty.textContent = t("inputAutocomplete.noResults");
            liEmpty.setAttribute("role", "presentation");
            list.appendChild(liEmpty);
          }
        }
      }

      function doCreate(text) {
        if (!createFn) return;
        if (useModal) {
          setOpen(false);
          active = -1;
          if (openIacModal) openIacModal(text);
          return;
        }
        if (!text) return;
        creating = true;
        renderRows([], text);
        setOpen(true);
        createFn(text)
          .then(function (result) {
            creating = false;
            var val = result.value != null ? String(result.value) : "";
            var lbl = result.label != null ? result.label : text;
            hidden.value = val;
            input.value = lbl;
            setOpen(false);
            active = -1;
            emitChange(val, lbl, true);
          })
          .catch(function () {
            creating = false;
            renderRows([], text);
            var errLi = document.createElement("li");
            errLi.className = "combobox-empty combobox-create-error";
            errLi.textContent = t("inputAutocomplete.createFailed");
            list.innerHTML = "";
            list.appendChild(errLi);
          });
      }

      function runFilter(q) {
        lastQuery = q;
        if (!fetchFn) { renderRows([], q); return; }
        if (norm(q).length < minChars) { renderRows([]); setOpen(false); return; }
        loading = true;
        renderRows([], q);
        setOpen(true);
        fetchFn(q)
          .then(function (rows) {
            loading = false;
            lastResults = (rows || []).map(function (r) {
              if (typeof r === "string") return { value: r, label: r };
              return { value: r.value != null ? r.value : r.id, label: r.label != null ? r.label : String(r.value || r.id) };
            });
            renderRows(lastResults, q);
          })
          .catch(function () {
            loading = false;
            lastResults = [];
            renderRows([], q);
          });
      }

      var debouncedRun = debounce(function () { runFilter(input.value); }, debounceMs);

      input.addEventListener("input", function () {
        hidden.value = "";
        debouncedRun();
        if (!isOpen) setOpen(true);
        highlight(-1);
      });

      input.addEventListener("focus", function () {
        if (input.value && norm(input.value).length >= minChars) {
          runFilter(input.value);
        }
      });

      input.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { setOpen(false); return; }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (!isOpen) setOpen(true);
          highlight(Math.min(active + 1, items.length - 1));
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          highlight(Math.max(active - 1, 0));
          return;
        }
        if (e.key === "Enter" && isOpen && active >= 0) {
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

      document.addEventListener("click", function (e) {
        if (!root.contains(e.target)) setOpen(false);
      }, true);

      if (opts.value != null && opts.initialLabel) {
        hidden.value = String(opts.value);
        input.value = opts.initialLabel;
      }

      root.setAttribute("data-input-autocomplete-mounted", "true");

      return {
        root: root,
        input: input,
        hidden: hidden,
        getValue: function () { return hidden.value; },
        setValue: function (val, label) {
          hidden.value = val != null ? String(val) : "";
          input.value = label || "";
        },
        clear: function () { hidden.value = ""; input.value = ""; },
        destroy: function () { root.innerHTML = ""; root.classList.remove("combobox", "input-autocomplete", "is-open"); }
      };
    }

    function datasetOptions(el) {
      var o = {};
      if (el.dataset.inputAutocompletePlaceholder) o.placeholder = el.dataset.inputAutocompletePlaceholder;
      if (el.dataset.inputAutocompleteName)        o.name = el.dataset.inputAutocompleteName;
      if (el.dataset.inputAutocompleteMinChars)    o.minChars = parseInt(el.dataset.inputAutocompleteMinChars, 10);
      if (el.dataset.inputAutocompleteDebounce)    o.debounceMs = parseInt(el.dataset.inputAutocompleteDebounce, 10);
      if (el.dataset.inputAutocompleteFetch)       o.fetchUrl = el.dataset.inputAutocompleteFetch;
      if (el.dataset.inputAutocompleteCreate)      o.createUrl = el.dataset.inputAutocompleteCreate;
      if (el.dataset.inputAutocompleteCreateMethod) o.createMethod = el.dataset.inputAutocompleteCreateMethod;
      if (el.dataset.inputAutocompleteCreateKey)   o.createPayloadKey = el.dataset.inputAutocompleteCreateKey;
      return o;
    }

    function init() {
      document.querySelectorAll("[data-input-autocomplete]:not([data-input-autocomplete-mounted])").forEach(function (el) {
        mount(el, datasetOptions(el));
      });
    }

    return { init: init, mount: mount };
  })();

  /* ==========================================================================
     TAG INPUT — multi-value tags with GET search + POST create
     Displays selected values as removable badges.
     Dropdown suggests matches from fetchOptions (GET); when nothing matches
     and createOption (POST) is provided, offers to create a new tag.
     Hidden input stores a JSON array of {value,label} objects.
     ========================================================================== */

  Downstage.tagInput = (function () {

    function debounce(fn, ms) {
      var t;
      return function () {
        var ctx = this, args = arguments;
        clearTimeout(t);
        t = setTimeout(function () { fn.apply(ctx, args); }, ms);
      };
    }

    function norm(s) { return String(s || "").toLowerCase().trim(); }

    function mount(root, options) {
      if (!root) return null;
      if (typeof root === "string") root = document.querySelector(root);
      if (!root) return null;
      var opts = options || {};

      var fetchFn        = opts.fetchOptions;
      var fetchUrl       = opts.fetchUrl || (root.dataset && root.dataset.tagInputFetch);
      var createFn       = opts.createOption;
      var createUrl      = opts.createUrl || (root.dataset && root.dataset.tagInputCreate);
      var createMethod   = (opts.createMethod || (root.dataset && root.dataset.tagInputCreateMethod) || "POST").toUpperCase();
      var createPayloadKey = opts.createPayloadKey || (root.dataset && root.dataset.tagInputCreateKey) || "name";
      var minChars       = opts.minChars != null ? opts.minChars : parseInt((root.dataset && root.dataset.tagInputMinChars) || "1", 10) || 1;
      var debounceMs     = opts.debounceMs != null ? opts.debounceMs : parseInt((root.dataset && root.dataset.tagInputDebounce) || "300", 10) || 300;
      var placeholder    = opts.placeholder != null ? opts.placeholder : (root.dataset && root.dataset.tagInputPlaceholder) || "";
      var name           = opts.name || (root.dataset && root.dataset.tagInputName) || "";
      var maxTags        = opts.maxTags != null ? opts.maxTags : parseInt((root.dataset && root.dataset.tagInputMax) || "0", 10) || 0;
      var inputId        = opts.id || "taginput-" + Math.random().toString(36).slice(2, 9);
      var listId         = inputId + "-list";
      var hiddenName     = name || "tags";

      if (fetchUrl && !fetchFn) {
        fetchFn = function (query) {
          var u = new URL(fetchUrl, window.location.href);
          u.searchParams.set("q", query);
          return fetch(u.toString(), { credentials: "same-origin" })
            .then(function (r) { if (!r.ok) throw new Error("fetch"); return r.json(); })
            .then(function (j) {
              if (Array.isArray(j)) return j;
              if (j && Array.isArray(j.results)) return j.results;
              if (j && Array.isArray(j.items)) return j.items;
              if (j && Array.isArray(j.data)) return j.data;
              return [];
            });
        };
      }

      if (createUrl && !createFn) {
        createFn = function (text) {
          var body = {};
          body[createPayloadKey] = text;
          return fetch(createUrl, {
            method: createMethod,
            credentials: "same-origin",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(body)
          }).then(function (r) { if (!r.ok) throw new Error("create"); return r.json(); })
            .then(function (j) {
              return { value: j.value != null ? j.value : j.id, label: j.label != null ? j.label : j.name || text };
            });
        };
      }

      root.classList.add("tag-input");
      root.innerHTML = "";

      var hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.name = hiddenName;
      hidden.value = "[]";
      root.appendChild(hidden);

      var wrap = document.createElement("div");
      wrap.className = "tag-input-wrap";

      var pillsWrap = document.createElement("div");
      pillsWrap.className = "tag-input-pills";
      wrap.appendChild(pillsWrap);

      var input = document.createElement("input");
      input.type = "text";
      input.className = "tag-input-field";
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

      var selected = [];
      var items = [];
      var active = -1;
      var loading = false;
      var creating = false;
      var isOpen = false;
      var lastQuery = "";

      function t(key) { return Downstage.i18n.t(key); }

      function syncHidden() {
        hidden.value = JSON.stringify(selected.map(function (s) { return { value: s.value, label: s.label }; }));
      }

      function hasValue(val) {
        return selected.some(function (s) { return String(s.value) === String(val); });
      }

      function atMax() {
        return maxTags > 0 && selected.length >= maxTags;
      }

      function emitChange() {
        root.dispatchEvent(new CustomEvent("tag-input-change", {
          bubbles: true,
          detail: { tags: selected.slice() }
        }));
      }

      function renderPills() {
        pillsWrap.innerHTML = "";
        selected.forEach(function (tag, i) {
          var pill = document.createElement("span");
          pill.className = "tag-input-pill";
          pill.textContent = tag.label;
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "tag-input-pill-remove";
          btn.setAttribute("aria-label", t("tagInput.removeTag").replace("{tag}", tag.label));
          btn.innerHTML = "&times;";
          btn.addEventListener("click", function (e) {
            e.stopPropagation();
            removeByIndex(i);
          });
          pill.appendChild(btn);
          pillsWrap.appendChild(pill);
        });
        input.placeholder = selected.length ? "" : placeholder;
      }

      function addTag(val, lbl, isNew) {
        if (hasValue(val) || atMax()) return;
        selected.push({ value: String(val), label: lbl });
        syncHidden();
        renderPills();
        input.value = "";
        setOpen(false);
        emitChange();
      }

      function removeByIndex(i) {
        selected.splice(i, 1);
        syncHidden();
        renderPills();
        emitChange();
        input.focus();
      }

      function setOpen(v) {
        isOpen = v;
        input.setAttribute("aria-expanded", v ? "true" : "false");
        list.hidden = !v;
        root.classList.toggle("is-open", v);
      }

      function highlight(i) {
        items.forEach(function (el, j) {
          el.classList.toggle("is-active", j === i);
          el.setAttribute("aria-selected", j === i ? "true" : "false");
        });
        active = i;
      }

      function renderRows(rows, query) {
        list.innerHTML = "";
        items = [];
        if (loading) {
          var li0 = document.createElement("li");
          li0.className = "combobox-loading";
          li0.textContent = t("tagInput.loading");
          list.appendChild(li0);
          return;
        }
        if (creating) {
          var lic = document.createElement("li");
          lic.className = "combobox-loading";
          lic.textContent = t("tagInput.creating");
          list.appendChild(lic);
          return;
        }
        var filtered = (rows || []).filter(function (r) { return !hasValue(r.value); });
        if (filtered.length) {
          filtered.forEach(function (row, i) {
            var opt = document.createElement("li");
            opt.className = "combobox-option";
            opt.setAttribute("role", "option");
            opt.setAttribute("id", listId + "-opt-" + i);
            opt.textContent = row.label != null ? row.label : String(row.value);
            opt.dataset.value = row.value != null ? String(row.value) : "";
            opt.dataset.label = row.label != null ? row.label : String(row.value);
            list.appendChild(opt);
            items.push(opt);
          });
        }
        if (!filtered.length && query && norm(query).length >= minChars) {
          if (createFn) {
            var createLi = document.createElement("li");
            createLi.className = "combobox-option combobox-create";
            createLi.setAttribute("role", "option");
            createLi.setAttribute("id", listId + "-create");
            createLi.textContent = t("tagInput.createNew").replace("{text}", query);
            createLi.dataset.create = "1";
            list.appendChild(createLi);
            items.push(createLi);
          } else {
            var liEmpty = document.createElement("li");
            liEmpty.className = "combobox-empty";
            liEmpty.textContent = t("tagInput.noResults");
            liEmpty.setAttribute("role", "presentation");
            list.appendChild(liEmpty);
          }
        }
      }

      function selectByIndex(i) {
        if (i < 0 || i >= items.length) return;
        var row = items[i];
        if (row.dataset.create === "1") {
          doCreate(lastQuery);
          return;
        }
        addTag(row.dataset.value, row.dataset.label, false);
        active = -1;
      }

      function doCreate(text) {
        if (!createFn || !text) return;
        creating = true;
        renderRows([], text);
        setOpen(true);
        createFn(text)
          .then(function (result) {
            creating = false;
            addTag(result.value, result.label, true);
          })
          .catch(function () {
            creating = false;
            list.innerHTML = "";
            var errLi = document.createElement("li");
            errLi.className = "combobox-empty combobox-create-error";
            errLi.textContent = t("tagInput.createFailed");
            list.appendChild(errLi);
          });
      }

      function runFilter(q) {
        lastQuery = q;
        if (!fetchFn) { renderRows([], q); return; }
        if (norm(q).length < minChars) { renderRows([]); setOpen(false); return; }
        if (atMax()) { setOpen(false); return; }
        loading = true;
        renderRows([], q);
        setOpen(true);
        fetchFn(q)
          .then(function (rows) {
            loading = false;
            var mapped = (rows || []).map(function (r) {
              if (typeof r === "string") return { value: r, label: r };
              return { value: r.value != null ? r.value : r.id, label: r.label != null ? r.label : String(r.value || r.id) };
            });
            renderRows(mapped, q);
          })
          .catch(function () {
            loading = false;
            renderRows([], q);
          });
      }

      var debouncedRun = debounce(function () { runFilter(input.value); }, debounceMs);

      input.addEventListener("input", function () {
        debouncedRun();
        if (!isOpen) setOpen(true);
        highlight(-1);
      });

      input.addEventListener("focus", function () {
        if (input.value && norm(input.value).length >= minChars) {
          runFilter(input.value);
        }
      });

      input.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { setOpen(false); return; }
        if (e.key === "Backspace" && !input.value && selected.length) {
          e.preventDefault();
          removeByIndex(selected.length - 1);
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (!isOpen) setOpen(true);
          highlight(Math.min(active + 1, items.length - 1));
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          highlight(Math.max(active - 1, 0));
          return;
        }
        if (e.key === "Enter" && isOpen && active >= 0) {
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

      wrap.addEventListener("click", function () { input.focus(); });

      document.addEventListener("click", function (e) {
        if (!root.contains(e.target)) setOpen(false);
      }, true);

      if (opts.initialTags && Array.isArray(opts.initialTags)) {
        opts.initialTags.forEach(function (tag) {
          if (tag && tag.value != null) {
            selected.push({ value: String(tag.value), label: tag.label || String(tag.value) });
          }
        });
        syncHidden();
        renderPills();
      }

      root.setAttribute("data-tag-input-mounted", "true");

      return {
        root: root,
        input: input,
        hidden: hidden,
        getTags: function () { return selected.slice(); },
        setTags: function (tags) {
          selected = (tags || []).map(function (t) {
            return { value: String(t.value), label: t.label || String(t.value) };
          });
          syncHidden();
          renderPills();
        },
        addTag: function (val, lbl) { addTag(val, lbl || String(val), false); },
        removeTag: function (val) {
          var idx = -1;
          selected.forEach(function (s, i) { if (String(s.value) === String(val)) idx = i; });
          if (idx >= 0) removeByIndex(idx);
        },
        clear: function () { selected = []; syncHidden(); renderPills(); emitChange(); },
        destroy: function () { root.innerHTML = ""; root.classList.remove("tag-input", "is-open"); }
      };
    }

    function datasetOptions(el) {
      var o = {};
      if (el.dataset.tagInputPlaceholder)   o.placeholder = el.dataset.tagInputPlaceholder;
      if (el.dataset.tagInputName)          o.name = el.dataset.tagInputName;
      if (el.dataset.tagInputMinChars)      o.minChars = parseInt(el.dataset.tagInputMinChars, 10);
      if (el.dataset.tagInputDebounce)      o.debounceMs = parseInt(el.dataset.tagInputDebounce, 10);
      if (el.dataset.tagInputFetch)         o.fetchUrl = el.dataset.tagInputFetch;
      if (el.dataset.tagInputCreate)        o.createUrl = el.dataset.tagInputCreate;
      if (el.dataset.tagInputCreateMethod)  o.createMethod = el.dataset.tagInputCreateMethod;
      if (el.dataset.tagInputCreateKey)     o.createPayloadKey = el.dataset.tagInputCreateKey;
      if (el.dataset.tagInputMax)           o.maxTags = parseInt(el.dataset.tagInputMax, 10);
      return o;
    }

    function init() {
      document.querySelectorAll("[data-tag-input]:not([data-tag-input-mounted])").forEach(function (el) {
        mount(el, datasetOptions(el));
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
     DATE PICKER — date / datetime single field + date range with auto min-max
     ========================================================================== */

  Downstage.datePicker = (function () {

    function buildInput(root, opts) {
      var type = opts.type === "datetime" ? "datetime-local" : "date";
      var inp = root.querySelector("input[type=date], input[type=datetime-local]");
      var created = false;
      if (!inp) {
        inp = document.createElement("input");
        inp.type = type;
        inp.className = "input";
        created = true;
      }
      if (opts.name) inp.name = opts.name;
      if (opts.min) inp.min = opts.min;
      if (opts.max) inp.max = opts.max;
      if (opts.value) inp.value = opts.value;
      if (opts.required) inp.required = true;
      if (opts.disabled) inp.disabled = true;
      if (opts.ariaLabel) inp.setAttribute("aria-label", opts.ariaLabel);
      if (opts.id) inp.id = opts.id;
      inp.classList.add("input");
      if (opts.minimal) inp.classList.add("input-minimal");
      if (created) root.appendChild(inp);
      return inp;
    }

    function mount(root, options) {
      if (!root) return null;
      if (typeof root === "string") root = document.querySelector(root);
      if (!root) return null;
      var opts = options || {};
      var inp = buildInput(root, opts);

      root.setAttribute("data-datepicker-mounted", "true");

      function api() {
        return {
          root: root,
          input: inp,
          getValue: function () { return inp.value; },
          setValue: function (v) { inp.value = v; inp.dispatchEvent(new Event("change", { bubbles: true })); },
          setMin: function (v) { inp.min = v || ""; },
          setMax: function (v) { inp.max = v || ""; },
        };
      }
      return api();
    }

    function init() {
      document.querySelectorAll("[data-datepicker]:not([data-datepicker-mounted]):not([data-daterange])").forEach(function (el) {
        var opts = {};
        var ds = el.dataset;
        if (ds.datepickerType) opts.type = ds.datepickerType;
        if (ds.datepickerMin) opts.min = ds.datepickerMin;
        if (ds.datepickerMax) opts.max = ds.datepickerMax;
        if (ds.datepickerValue) opts.value = ds.datepickerValue;
        if (ds.datepickerName) opts.name = ds.datepickerName;
        if (ds.datepickerRequired != null) opts.required = true;
        if (ds.datepickerMinimal != null) opts.minimal = true;
        mount(el, opts);
      });
    }

    return { init: init, mount: mount };
  })();

  /* ==========================================================================
     DATE RANGE — from / to fields with automatic min-max constraints
     ========================================================================== */

  Downstage.dateRange = (function () {

    function mount(root, options) {
      if (!root) return null;
      if (typeof root === "string") root = document.querySelector(root);
      if (!root) return null;
      var opts = options || {};
      var type = opts.type === "datetime" ? "datetime-local" : "date";
      var minimal = opts.minimal || false;

      root.classList.add("date-range");
      root.setAttribute("data-daterange-mounted", "true");

      var fromWrap = root.querySelector(".date-range-from");
      var toWrap = root.querySelector(".date-range-to");
      var createdStructure = false;

      if (!fromWrap || !toWrap) {
        createdStructure = true;
        root.innerHTML = "";

        fromWrap = document.createElement("div");
        fromWrap.className = "date-range-from field";
        var fromLabel = document.createElement("label");
        fromLabel.className = "label";
        fromLabel.textContent = opts.fromLabel || Downstage.i18n.t("dateRange.from");
        fromWrap.appendChild(fromLabel);

        toWrap = document.createElement("div");
        toWrap.className = "date-range-to field";
        var toLabel = document.createElement("label");
        toLabel.className = "label";
        toLabel.textContent = opts.toLabel || Downstage.i18n.t("dateRange.to");
        toWrap.appendChild(toLabel);

        var sep = document.createElement("span");
        sep.className = "date-range-sep";
        sep.setAttribute("aria-hidden", "true");
        sep.textContent = "–";

        root.appendChild(fromWrap);
        root.appendChild(sep);
        root.appendChild(toWrap);
      }

      var fromInput = fromWrap.querySelector("input[type=date], input[type=datetime-local]");
      if (!fromInput) {
        fromInput = document.createElement("input");
        fromInput.type = type;
        fromInput.className = "input" + (minimal ? " input-minimal" : "");
        fromWrap.appendChild(fromInput);
      }
      if (opts.fromName) fromInput.name = opts.fromName;
      if (opts.fromId) fromInput.id = opts.fromId;
      if (opts.min) fromInput.min = opts.min;
      if (opts.fromValue) fromInput.value = opts.fromValue;
      if (opts.required) fromInput.required = true;
      fromInput.setAttribute("aria-label", opts.fromLabel || Downstage.i18n.t("dateRange.from"));

      var toInput = toWrap.querySelector("input[type=date], input[type=datetime-local]");
      if (!toInput) {
        toInput = document.createElement("input");
        toInput.type = type;
        toInput.className = "input" + (minimal ? " input-minimal" : "");
        toWrap.appendChild(toInput);
      }
      if (opts.toName) toInput.name = opts.toName;
      if (opts.toId) toInput.id = opts.toId;
      if (opts.max) toInput.max = opts.max;
      if (opts.toValue) toInput.value = opts.toValue;
      if (opts.required) toInput.required = true;
      toInput.setAttribute("aria-label", opts.toLabel || Downstage.i18n.t("dateRange.to"));

      function syncConstraints() {
        var fv = fromInput.value;
        var tv = toInput.value;
        toInput.min = fv || opts.min || "";
        fromInput.max = tv || opts.max || "";
      }

      fromInput.addEventListener("change", function () {
        syncConstraints();
        root.dispatchEvent(new CustomEvent("daterange-change", {
          bubbles: true,
          detail: { from: fromInput.value, to: toInput.value },
        }));
      });
      toInput.addEventListener("change", function () {
        syncConstraints();
        root.dispatchEvent(new CustomEvent("daterange-change", {
          bubbles: true,
          detail: { from: fromInput.value, to: toInput.value },
        }));
      });

      syncConstraints();

      return {
        root: root,
        fromInput: fromInput,
        toInput: toInput,
        getFrom: function () { return fromInput.value; },
        getTo: function () { return toInput.value; },
        setFrom: function (v) { fromInput.value = v || ""; syncConstraints(); },
        setTo: function (v) { toInput.value = v || ""; syncConstraints(); },
        setMin: function (v) { opts.min = v || ""; syncConstraints(); },
        setMax: function (v) { opts.max = v || ""; syncConstraints(); },
      };
    }

    function init() {
      document.querySelectorAll("[data-daterange]:not([data-daterange-mounted])").forEach(function (el) {
        var ds = el.dataset;
        var opts = {};
        if (ds.daterangeType) opts.type = ds.daterangeType;
        if (ds.daterangeMin) opts.min = ds.daterangeMin;
        if (ds.daterangeMax) opts.max = ds.daterangeMax;
        if (ds.daterangeFromName) opts.fromName = ds.daterangeFromName;
        if (ds.daterangeToName) opts.toName = ds.daterangeToName;
        if (ds.daterangeFromLabel) opts.fromLabel = ds.daterangeFromLabel;
        if (ds.daterangeToLabel) opts.toLabel = ds.daterangeToLabel;
        if (ds.daterangeFromValue) opts.fromValue = ds.daterangeFromValue;
        if (ds.daterangeToValue) opts.toValue = ds.daterangeToValue;
        if (ds.daterangeRequired != null) opts.required = true;
        if (ds.daterangeMinimal != null) opts.minimal = true;
        mount(el, opts);
      });
    }

    return { init: init, mount: mount };
  })();

  /* ==========================================================================
     CALENDAR — month / week / day + resource timeline (Gantt)
     ========================================================================== */

  Downstage.calendar = (function () {

    /* ---- helpers ---- */

    function pad(n) { return n < 10 ? "0" + n : String(n); }
    function fmtDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
    function fmtISO(d) { return fmtDate(d) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes()); }
    function parseDate(s) {
      if (s instanceof Date) return s;
      var d = new Date(s);
      if (isNaN(d.getTime())) return null;
      return d;
    }

    function startOfWeek(d, weekStart) {
      var day = d.getDay();
      var diff = (day < weekStart ? 7 : 0) + day - weekStart;
      var r = new Date(d);
      r.setDate(r.getDate() - diff);
      r.setHours(0, 0, 0, 0);
      return r;
    }

    function addDays(d, n) { var r = new Date(d); r.setDate(r.getDate() + n); return r; }

    function sameDay(a, b) {
      return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    function daysBetween(a, b) {
      var msA = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
      var msB = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
      return Math.round((msB - msA) / 86400000);
    }

    function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

    function eventColor(ev) {
      return ev.color || "var(--brand-primary)";
    }

    function shortWeekdays(locale) {
      var names = [];
      var base = new Date(2026, 0, 5); // Monday 5 Jan 2026
      for (var i = 0; i < 7; i++) {
        var d = new Date(base);
        d.setDate(d.getDate() + i);
        try {
          names.push(d.toLocaleDateString(locale, { weekday: "short" }));
        } catch (e) {
          names.push(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]);
        }
      }
      return names;
    }

    function monthName(date, locale) {
      try {
        return date.toLocaleDateString(locale, { month: "long", year: "numeric" });
      } catch (e) {
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return months[date.getMonth()] + " " + date.getFullYear();
      }
    }

    function formatDayHeader(date, locale) {
      try {
        return date.toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" });
      } catch (e) {
        return fmtDate(date);
      }
    }

    function formatHour(h) {
      return pad(h) + ":00";
    }

    /* ---- fetch resolve (like kanban) ---- */

    function resolveFetch(opts) {
      if (opts.fetchEvents) return opts.fetchEvents;
      if (opts.fetchUrl) {
        var creds = opts.fetchCredentials;
        if (creds == null) creds = "same-origin";
        return function (params) {
          var u = new URL(opts.fetchUrl, window.location.href);
          if (params.start) u.searchParams.set("start", params.start);
          if (params.end) u.searchParams.set("end", params.end);
          if (params.view) u.searchParams.set("view", params.view);
          return fetch(u.toString(), {
            credentials: creds,
            headers: { Accept: "application/json" },
          }).then(function (r) {
            if (!r.ok) throw new Error("calendar fetch");
            return r.json();
          });
        };
      }
      return null;
    }

    /* ---- view range helpers ---- */

    function viewRange(view, anchor, weekStart) {
      var s, e;
      if (view === "month") {
        s = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
        e = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
        s = startOfWeek(s, weekStart);
        e = addDays(startOfWeek(e, weekStart), 6);
        if (daysBetween(s, e) < 35) e = addDays(e, 7);
      } else if (view === "week") {
        s = startOfWeek(anchor, weekStart);
        e = addDays(s, 6);
      } else if (view === "day") {
        s = new Date(anchor);
        s.setHours(0, 0, 0, 0);
        e = new Date(s);
      } else {
        s = startOfWeek(anchor, weekStart);
        e = addDays(s, 6);
      }
      return { start: s, end: e };
    }

    /* ---- MOUNT ---- */

    function mount(root, options) {
      if (!root) return null;
      if (typeof root === "string") root = document.querySelector(root);
      if (!root) return null;

      var opts = options || {};
      var view = opts.defaultView || "month";
      var anchor = parseDate(opts.initialDate) || new Date();
      anchor.setHours(0, 0, 0, 0);
      var weekStart = opts.weekStart != null ? opts.weekStart : 1;
      var locale = opts.locale || (navigator.language || "en");
      var hourStart = (opts.timelineHours && opts.timelineHours[0]) || 0;
      var hourEnd = (opts.timelineHours && opts.timelineHours[1]) || 24;
      var slotMinutes = opts.timeSlotMinutes || 60;
      var onEventClick = opts.onEventClick || null;
      var fetchFn = resolveFetch(opts);
      var initialEvents = opts.events || [];
      var initialResources = opts.resources || [];

      var state = {
        events: initialEvents,
        resources: initialResources,
        view: view,
        anchor: anchor,
      };

      root.classList.add("cal-root");
      root.innerHTML = "";

      /* -- shell -- */
      var toolbar = document.createElement("div");
      toolbar.className = "cal-toolbar";

      var navGroup = document.createElement("div");
      navGroup.className = "cal-toolbar-nav";

      var prevBtn = document.createElement("button");
      prevBtn.type = "button";
      prevBtn.className = "btn btn-sm btn-secondary";

      var todayBtn = document.createElement("button");
      todayBtn.type = "button";
      todayBtn.className = "btn btn-sm btn-secondary";

      var nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "btn btn-sm btn-secondary";

      var titleEl = document.createElement("span");
      titleEl.className = "cal-toolbar-title";

      var viewGroup = document.createElement("div");
      viewGroup.className = "btn-group cal-view-group";
      viewGroup.setAttribute("role", "group");

      var views = ["month", "week", "day", "timeline"];
      var viewBtns = {};
      views.forEach(function (v) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "btn btn-sm";
        b.dataset.calView = v;
        viewBtns[v] = b;
        viewGroup.appendChild(b);
      });

      navGroup.appendChild(prevBtn);
      navGroup.appendChild(todayBtn);
      navGroup.appendChild(nextBtn);

      toolbar.appendChild(navGroup);
      toolbar.appendChild(titleEl);
      toolbar.appendChild(viewGroup);
      root.appendChild(toolbar);

      var body = document.createElement("div");
      body.className = "cal-body";
      root.appendChild(body);

      /* -- labels -- */
      function refreshLabels() {
        prevBtn.textContent = Downstage.i18n.t("calendar.previous");
        nextBtn.textContent = Downstage.i18n.t("calendar.next");
        todayBtn.textContent = Downstage.i18n.t("calendar.today");
        viewBtns.month.textContent = Downstage.i18n.t("calendar.month");
        viewBtns.week.textContent = Downstage.i18n.t("calendar.week");
        viewBtns.day.textContent = Downstage.i18n.t("calendar.day");
        viewBtns.timeline.textContent = Downstage.i18n.t("calendar.timeline");
      }

      /* -- set active view button -- */
      function syncViewBtns() {
        views.forEach(function (v) {
          viewBtns[v].classList.toggle("btn-primary", v === state.view);
          viewBtns[v].classList.toggle("btn-secondary", v !== state.view);
        });
      }

      /* -- events for a date -- */
      function eventsOnDay(d) {
        return state.events.filter(function (ev) {
          var s = parseDate(ev.start);
          var e = parseDate(ev.end) || s;
          if (!s) return false;
          var ds = new Date(d); ds.setHours(0, 0, 0, 0);
          var de = new Date(d); de.setHours(23, 59, 59, 999);
          return s <= de && e >= ds;
        });
      }

      /* -- make event chip -- */
      function chipEl(ev, showTime) {
        var chip = document.createElement("div");
        chip.className = "cal-event";
        chip.style.setProperty("--cal-event-color", eventColor(ev));
        var label = "";
        if (showTime && ev.start) {
          var sd = parseDate(ev.start);
          if (sd) label = pad(sd.getHours()) + ":" + pad(sd.getMinutes()) + " ";
        }
        label += ev.title || "";
        chip.textContent = label;
        chip.title = ev.title || "";
        if (onEventClick) {
          chip.style.cursor = "pointer";
          chip.addEventListener("click", function (e) {
            e.stopPropagation();
            onEventClick(ev);
          });
        }
        return chip;
      }

      /* ========== RENDERERS ========== */

      function renderMonth() {
        body.innerHTML = "";
        body.className = "cal-body cal-month";
        var range = viewRange("month", state.anchor, weekStart);
        var wdNames = shortWeekdays(locale);
        var ordered = [];
        for (var w = 0; w < 7; w++) ordered.push(wdNames[(weekStart + w) % 7 === 0 ? 6 : (weekStart + w) % 7 === 1 ? 0 : (weekStart + w) % 7 - 1]);
        ordered = [];
        var base = range.start;
        for (var wd = 0; wd < 7; wd++) {
          var dd = addDays(base, wd);
          try { ordered.push(dd.toLocaleDateString(locale, { weekday: "short" })); }
          catch (e2) { ordered.push(fmtDate(dd)); }
        }

        var headerRow = document.createElement("div");
        headerRow.className = "cal-month-header";
        ordered.forEach(function (n) {
          var c = document.createElement("div");
          c.className = "cal-month-wday";
          c.textContent = n;
          headerRow.appendChild(c);
        });
        body.appendChild(headerRow);

        var grid = document.createElement("div");
        grid.className = "cal-month-grid";

        var cur = new Date(range.start);
        var today = new Date(); today.setHours(0, 0, 0, 0);
        var thisMonth = state.anchor.getMonth();

        while (cur <= range.end) {
          var cell = document.createElement("div");
          cell.className = "cal-month-cell";
          if (cur.getMonth() !== thisMonth) cell.classList.add("cal-other-month");
          if (sameDay(cur, today)) cell.classList.add("cal-today");

          var num = document.createElement("span");
          num.className = "cal-month-day-num";
          num.textContent = String(cur.getDate());
          cell.appendChild(num);

          var dayEvts = eventsOnDay(cur);
          var maxShow = 3;
          dayEvts.slice(0, maxShow).forEach(function (ev) {
            cell.appendChild(chipEl(ev, false));
          });
          if (dayEvts.length > maxShow) {
            var more = document.createElement("div");
            more.className = "cal-event-more";
            more.textContent = "+" + (dayEvts.length - maxShow);
            cell.appendChild(more);
          }

          grid.appendChild(cell);
          cur = addDays(cur, 1);
        }
        body.appendChild(grid);
        titleEl.textContent = monthName(state.anchor, locale);
      }

      function renderWeek() {
        body.innerHTML = "";
        body.className = "cal-body cal-week";
        var range = viewRange("week", state.anchor, weekStart);
        var today = new Date(); today.setHours(0, 0, 0, 0);

        var container = document.createElement("div");
        container.className = "cal-time-grid";

        /* time gutter */
        var gutter = document.createElement("div");
        gutter.className = "cal-time-gutter";
        gutter.innerHTML = '<div class="cal-time-gutter-corner"></div>';
        for (var h = hourStart; h < hourEnd; h++) {
          var slot = document.createElement("div");
          slot.className = "cal-time-label";
          slot.textContent = formatHour(h);
          gutter.appendChild(slot);
        }
        container.appendChild(gutter);

        /* day columns */
        var cur = new Date(range.start);
        for (var d = 0; d < 7; d++) {
          var col = document.createElement("div");
          col.className = "cal-day-col";
          if (sameDay(cur, today)) col.classList.add("cal-today");

          var hdr = document.createElement("div");
          hdr.className = "cal-day-col-header";
          hdr.textContent = formatDayHeader(cur, locale);
          col.appendChild(hdr);

          var slots = document.createElement("div");
          slots.className = "cal-day-slots";
          for (var h2 = hourStart; h2 < hourEnd; h2++) {
            var sl = document.createElement("div");
            sl.className = "cal-time-slot";
            slots.appendChild(sl);
          }

          /* position events */
          var dayEvts = eventsOnDay(cur);
          dayEvts.forEach(function (ev) {
            var s = parseDate(ev.start);
            var e = parseDate(ev.end) || s;
            if (!s) return;
            var topMin = clamp(s.getHours() * 60 + s.getMinutes() - hourStart * 60, 0, (hourEnd - hourStart) * 60);
            var botMin = clamp(e.getHours() * 60 + e.getMinutes() - hourStart * 60, 0, (hourEnd - hourStart) * 60);
            if (botMin <= topMin) botMin = topMin + slotMinutes;
            var totalMin = (hourEnd - hourStart) * 60;
            var chip = chipEl(ev, true);
            chip.classList.add("cal-event-abs");
            chip.style.top = (topMin / totalMin * 100) + "%";
            chip.style.height = ((botMin - topMin) / totalMin * 100) + "%";
            slots.appendChild(chip);
          });

          col.appendChild(slots);
          container.appendChild(col);
          cur = addDays(cur, 1);
        }

        body.appendChild(container);
        var ws = range.start;
        var we = range.end;
        try {
          titleEl.textContent = ws.toLocaleDateString(locale, { month: "short", day: "numeric" }) + " – " + we.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
        } catch (e) {
          titleEl.textContent = fmtDate(ws) + " – " + fmtDate(we);
        }
      }

      function renderDay() {
        body.innerHTML = "";
        body.className = "cal-body cal-day-view";
        var today = new Date(); today.setHours(0, 0, 0, 0);
        var d = new Date(state.anchor); d.setHours(0, 0, 0, 0);

        var container = document.createElement("div");
        container.className = "cal-time-grid cal-time-grid-single";

        var gutter = document.createElement("div");
        gutter.className = "cal-time-gutter";
        gutter.innerHTML = '<div class="cal-time-gutter-corner"></div>';
        for (var h = hourStart; h < hourEnd; h++) {
          var slot = document.createElement("div");
          slot.className = "cal-time-label";
          slot.textContent = formatHour(h);
          gutter.appendChild(slot);
        }
        container.appendChild(gutter);

        var col = document.createElement("div");
        col.className = "cal-day-col cal-day-col-full";
        if (sameDay(d, today)) col.classList.add("cal-today");

        var hdr = document.createElement("div");
        hdr.className = "cal-day-col-header";
        hdr.textContent = formatDayHeader(d, locale);
        col.appendChild(hdr);

        var slots = document.createElement("div");
        slots.className = "cal-day-slots";
        for (var h2 = hourStart; h2 < hourEnd; h2++) {
          var sl = document.createElement("div");
          sl.className = "cal-time-slot";
          slots.appendChild(sl);
        }

        var dayEvts = eventsOnDay(d);
        dayEvts.forEach(function (ev) {
          var s = parseDate(ev.start);
          var e = parseDate(ev.end) || s;
          if (!s) return;
          var topMin = clamp(s.getHours() * 60 + s.getMinutes() - hourStart * 60, 0, (hourEnd - hourStart) * 60);
          var botMin = clamp(e.getHours() * 60 + e.getMinutes() - hourStart * 60, 0, (hourEnd - hourStart) * 60);
          if (botMin <= topMin) botMin = topMin + slotMinutes;
          var totalMin = (hourEnd - hourStart) * 60;
          var chip = chipEl(ev, true);
          chip.classList.add("cal-event-abs");
          chip.style.top = (topMin / totalMin * 100) + "%";
          chip.style.height = ((botMin - topMin) / totalMin * 100) + "%";
          slots.appendChild(chip);
        });

        col.appendChild(slots);
        container.appendChild(col);
        body.appendChild(container);

        try {
          titleEl.textContent = d.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
        } catch (e) {
          titleEl.textContent = fmtDate(d);
        }
      }

      function renderTimeline() {
        body.innerHTML = "";
        body.className = "cal-body cal-timeline";
        var range = viewRange("week", state.anchor, weekStart);
        var days = [];
        var cur = new Date(range.start);
        while (cur <= range.end) {
          days.push(new Date(cur));
          cur = addDays(cur, 1);
        }
        var totalDays = days.length;
        var resources = state.resources.length ? state.resources : [{ id: "__default", title: Downstage.i18n.t("calendar.allEvents") }];
        var today = new Date(); today.setHours(0, 0, 0, 0);

        /* header */
        var header = document.createElement("div");
        header.className = "cal-tl-header";
        header.style.setProperty("--cal-tl-cols", String(totalDays));

        var corner = document.createElement("div");
        corner.className = "cal-tl-corner";
        corner.textContent = Downstage.i18n.t("calendar.resource");
        header.appendChild(corner);

        days.forEach(function (d) {
          var th = document.createElement("div");
          th.className = "cal-tl-day-header";
          if (sameDay(d, today)) th.classList.add("cal-today");
          try { th.textContent = d.toLocaleDateString(locale, { weekday: "short", day: "numeric" }); }
          catch (e) { th.textContent = fmtDate(d); }
          header.appendChild(th);
        });
        body.appendChild(header);

        /* rows */
        var rowsWrap = document.createElement("div");
        rowsWrap.className = "cal-tl-rows";

        resources.forEach(function (res) {
          var row = document.createElement("div");
          row.className = "cal-tl-row";
          row.style.setProperty("--cal-tl-cols", String(totalDays));

          var label = document.createElement("div");
          label.className = "cal-tl-res-label";
          label.textContent = res.title || res.id;
          row.appendChild(label);

          var track = document.createElement("div");
          track.className = "cal-tl-track";

          /* day cells for the grid lines */
          days.forEach(function (d) {
            var cell = document.createElement("div");
            cell.className = "cal-tl-cell";
            if (sameDay(d, today)) cell.classList.add("cal-today");
            track.appendChild(cell);
          });

          /* events as bars */
          var resEvts = state.events.filter(function (ev) {
            if (res.id === "__default") return true;
            return String(ev.resourceId) === String(res.id);
          });
          resEvts.forEach(function (ev) {
            var s = parseDate(ev.start);
            var e = parseDate(ev.end) || s;
            if (!s) return;
            var sDay = new Date(s); sDay.setHours(0, 0, 0, 0);
            var eDay = new Date(e); eDay.setHours(0, 0, 0, 0);
            var rangeStart = new Date(range.start); rangeStart.setHours(0, 0, 0, 0);
            var rangeEnd = new Date(range.end); rangeEnd.setHours(23, 59, 59, 999);

            if (eDay < rangeStart || sDay > rangeEnd) return;

            var offStart = Math.max(0, daysBetween(rangeStart, sDay));
            var offEnd = Math.min(totalDays - 1, daysBetween(rangeStart, eDay));
            var span = offEnd - offStart + 1;

            var bar = document.createElement("div");
            bar.className = "cal-tl-bar";
            bar.style.setProperty("--cal-tl-bar-start", String(offStart));
            bar.style.setProperty("--cal-tl-bar-span", String(span));
            bar.style.setProperty("--cal-event-color", eventColor(ev));
            bar.textContent = ev.title || "";
            bar.title = (ev.title || "") + (ev.meta ? " — " + ev.meta : "");
            if (onEventClick) {
              bar.style.cursor = "pointer";
              bar.addEventListener("click", function (evt) {
                evt.stopPropagation();
                onEventClick(ev);
              });
            }
            track.appendChild(bar);
          });

          row.appendChild(track);
          rowsWrap.appendChild(row);
        });

        body.appendChild(rowsWrap);

        var ws = range.start;
        var we = range.end;
        try {
          titleEl.textContent = ws.toLocaleDateString(locale, { month: "short", day: "numeric" }) + " – " + we.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
        } catch (e) {
          titleEl.textContent = fmtDate(ws) + " – " + fmtDate(we);
        }
      }

      /* ========== ORCHESTRATION ========== */

      function render() {
        refreshLabels();
        syncViewBtns();
        if (state.view === "month") renderMonth();
        else if (state.view === "week") renderWeek();
        else if (state.view === "day") renderDay();
        else renderTimeline();
      }

      function load() {
        body.innerHTML = '<p class="cal-loading">' + Downstage.i18n.t("calendar.loading") + "</p>";
        if (!fetchFn) {
          render();
          return;
        }
        var range = viewRange(state.view, state.anchor, weekStart);
        root.classList.add("is-loading");
        fetchFn({ start: fmtISO(range.start), end: fmtISO(range.end), view: state.view })
          .then(function (data) {
            state.events = data.events || data.data || [];
            if (data.resources) state.resources = data.resources;
            render();
          })
          .catch(function () {
            body.innerHTML = '<p class="cal-empty">' + Downstage.i18n.t("calendar.loadFailed") + "</p>";
          })
          .finally(function () {
            root.classList.remove("is-loading");
          });
      }

      function navigate(dir) {
        var d = state.anchor;
        if (state.view === "month") {
          d = new Date(d.getFullYear(), d.getMonth() + dir, 1);
        } else if (state.view === "week" || state.view === "timeline") {
          d = addDays(d, dir * 7);
        } else {
          d = addDays(d, dir);
        }
        state.anchor = d;
        load();
      }

      /* -- wiring -- */
      prevBtn.addEventListener("click", function () { navigate(-1); });
      nextBtn.addEventListener("click", function () { navigate(1); });
      todayBtn.addEventListener("click", function () {
        state.anchor = new Date();
        state.anchor.setHours(0, 0, 0, 0);
        load();
      });

      views.forEach(function (v) {
        viewBtns[v].addEventListener("click", function () {
          if (state.view === v) return;
          state.view = v;
          load();
        });
      });

      load();
      root.setAttribute("data-calendar-mounted", "true");

      return {
        root: root,
        refresh: load,
        setView: function (v) {
          if (views.indexOf(v) !== -1) { state.view = v; load(); }
        },
        setDate: function (d) {
          var p = parseDate(d);
          if (p) { state.anchor = p; load(); }
        },
        getView: function () { return state.view; },
        getDate: function () { return new Date(state.anchor); },
      };
    }

    /* ---- dataset options (data-calendar-* → camelCase) ---- */

    function datasetOptions(el) {
      var o = {};
      if (!el || !el.dataset) return o;
      var prefix = "calendar";
      var keys = Object.keys(el.dataset);
      keys.forEach(function (k) {
        if (k.indexOf(prefix) === 0 && k.length > prefix.length) {
          var rest = k.charAt(prefix.length).toLowerCase() + k.slice(prefix.length + 1);
          o[rest] = el.dataset[k];
        }
      });
      return o;
    }

    /* ---- init / mount ---- */

    function init() {
      document.querySelectorAll("[data-calendar]:not([data-calendar-mounted]):not([data-calendar-demo])").forEach(function (el) {
        var merged = datasetOptions(el);
        mount(el, merged);
      });
    }

    return { init: init, mount: mount };
  })();

  /* ==========================================================================
     ORDER LIST — searchable item list with qty, column/manual sort, JSON output
     Search + add items, qty +/−, column sort or drag-reorder, hidden JSON.
     ========================================================================== */

  Downstage.orderList = (function () {
    function debounce(fn, ms) {
      var t;
      return function () {
        var a = arguments;
        clearTimeout(t);
        t = setTimeout(function () { fn.apply(null, a); }, ms);
      };
    }

    function norm(s) {
      return String(s || "").toLowerCase().trim();
    }

    function resolvePath(obj, path) {
      if (obj == null || !path) return undefined;
      var parts = String(path).split(".");
      var cur = obj;
      for (var i = 0; i < parts.length; i++) {
        if (cur == null) return undefined;
        cur = cur[parts[i]];
      }
      return cur;
    }

    function mount(root, options) {
      if (!root) return null;
      if (typeof root === "string") root = document.querySelector(root);
      if (!root) return null;
      var opts = options || {};
      var columns = opts.columns || [];
      var name = opts.name || "order_items";
      var itemKey = opts.itemKey || null;
      var sortMode = opts.sortMode || "column";
      var fetchFn = opts.fetchOptions || null;
      var fetchUrl = opts.fetchUrl || null;
      var localOpts = opts.options || [];
      var minChars = opts.minChars != null ? opts.minChars : (fetchFn || fetchUrl ? 1 : 0);
      var dMs = opts.debounceMs != null ? opts.debounceMs : 250;
      var placeholder = opts.placeholder || Downstage.i18n.t("orderList.searchPlaceholder");
      var onChangeCallback = opts.onChange || null;
      var createFields = opts.createFields || null;
      var createFn = opts.createOption || null;
      var createUrl = opts.createUrl || null;
      var createTitle = opts.createTitle || Downstage.i18n.t("orderList.createTitle");
      var canCreate = !!(createFields && (createFn || createUrl));
      var items = [];
      var sortKey = "";
      var sortDir = "asc";

      if (opts.items && opts.items.length) {
        items = opts.items.map(function (item, i) {
          return {
            value: item.value != null ? item.value : item,
            qty: item.qty != null ? item.qty : 1,
            sort_order: item.sort_order != null ? item.sort_order : i
          };
        });
      }

      var qtyCol = null;
      columns.forEach(function (col) { if (col.type === "qty") qtyCol = col; });

      if (createUrl && !createFn) {
        createFn = function (data) {
          return fetch(createUrl, {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }).then(function (r) { if (!r.ok) throw new Error("create"); return r.json(); });
        };
        canCreate = !!createFields;
      }

      if (fetchUrl && !fetchFn) {
        fetchFn = function (query) {
          var u = new URL(fetchUrl, window.location.href);
          u.searchParams.set("q", query);
          return fetch(u.toString(), { credentials: "same-origin" })
            .then(function (r) { if (!r.ok) throw new Error("fetch"); return r.json(); })
            .then(function (j) {
              if (Array.isArray(j)) return j;
              if (j && Array.isArray(j.results)) return j.results;
              if (j && Array.isArray(j.items)) return j.items;
              return [];
            });
        };
      }

      /* ---- DOM ---- */
      root.classList.add("order-list-host");
      root.innerHTML = "";

      var wrap = document.createElement("div");
      wrap.className = "order-list-wrap";

      var hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.name = name;
      root.appendChild(hiddenInput);

      /* toolbar */
      var toolbar = document.createElement("div");
      toolbar.className = "order-list-toolbar";

      var searchWrap = document.createElement("div");
      searchWrap.className = "order-list-search combobox combobox--search";
      var inputWrap = document.createElement("div");
      inputWrap.className = "combobox-input-wrap";
      var sIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      sIcon.setAttribute("class", "icon");
      sIcon.setAttribute("aria-hidden", "true");
      sIcon.innerHTML = '<use href="' + iconsHref("search") + '" />';
      inputWrap.appendChild(sIcon);

      var searchInput = document.createElement("input");
      searchInput.type = "text";
      searchInput.className = "combobox-input";
      searchInput.placeholder = placeholder;
      searchInput.setAttribute("autocomplete", "off");
      searchInput.setAttribute("role", "combobox");
      searchInput.setAttribute("aria-autocomplete", "list");
      searchInput.setAttribute("aria-expanded", "false");
      inputWrap.appendChild(searchInput);
      searchWrap.appendChild(inputWrap);

      var searchListId = "ol-list-" + Math.random().toString(36).slice(2, 9);
      var searchList = document.createElement("ul");
      searchList.id = searchListId;
      searchList.className = "combobox-list";
      searchList.setAttribute("role", "listbox");
      searchList.hidden = true;
      searchWrap.appendChild(searchList);
      toolbar.appendChild(searchWrap);

      var sortToggleBtn = document.createElement("button");
      sortToggleBtn.type = "button";
      sortToggleBtn.className = "btn btn-sm btn-secondary order-list-sort-toggle";

      function updateSortToggle() {
        if (sortMode === "column") {
          sortToggleBtn.innerHTML =
            '<svg class="icon icon-sm" aria-hidden="true"><use href="' + iconsHref("menu") + '" /></svg> ' +
            Downstage.i18n.t("orderList.manualSort");
          sortToggleBtn.title = Downstage.i18n.t("orderList.switchToManual");
        } else {
          sortToggleBtn.innerHTML =
            '<svg class="icon icon-sm" aria-hidden="true"><use href="' + iconsHref("arrows-up-down") + '" /></svg> ' +
            Downstage.i18n.t("orderList.columnSort");
          sortToggleBtn.title = Downstage.i18n.t("orderList.switchToColumn");
        }
      }
      updateSortToggle();
      toolbar.appendChild(sortToggleBtn);

      /* table */
      var scroll = document.createElement("div");
      scroll.className = "order-list-scroll";
      var table = document.createElement("table");
      table.className = "table table-striped order-list-table";
      var thead = document.createElement("thead");
      var trh = document.createElement("tr");

      var thDrag = document.createElement("th");
      thDrag.className = "order-list-th-drag";
      trh.appendChild(thDrag);

      columns.forEach(function (col) {
        var th = document.createElement("th");
        th.textContent = col.label || col.key;
        if (col.sortable !== false && col.type !== "qty" && !col.compute) {
          th.classList.add("sortable");
          th.dataset.sortKey = col.key;
        }
        trh.appendChild(th);
      });

      var thActions = document.createElement("th");
      thActions.className = "order-list-th-actions";
      trh.appendChild(thActions);
      thead.appendChild(trh);

      var tbody = document.createElement("tbody");
      table.appendChild(thead);
      table.appendChild(tbody);
      scroll.appendChild(table);

      /* footer */
      var footer = document.createElement("div");
      footer.className = "order-list-footer";
      var footerMeta = document.createElement("span");
      footerMeta.className = "order-list-meta";
      footer.appendChild(footerMeta);

      wrap.appendChild(toolbar);
      wrap.appendChild(scroll);
      wrap.appendChild(footer);
      root.appendChild(wrap);

      /* ---- create-item modal ---- */
      var modalOverlay = null;
      var modalInputs = {};
      var modalSubmitting = false;
      var openCreateModal = null;

      if (canCreate) {
        modalOverlay = document.createElement("div");
        modalOverlay.className = "order-list-create-modal modal-overlay hidden";
        modalOverlay.setAttribute("aria-hidden", "true");

        var modalPanel = document.createElement("div");
        modalPanel.className = "modal";
        modalPanel.setAttribute("role", "dialog");
        modalPanel.setAttribute("aria-modal", "true");
        var modalHeadingId = "ol-modal-" + Math.random().toString(36).slice(2, 9);
        modalPanel.setAttribute("aria-labelledby", modalHeadingId);

        var modalClose = document.createElement("button");
        modalClose.type = "button";
        modalClose.className = "order-list-modal-close btn btn-ghost btn-sm";
        modalClose.setAttribute("aria-label", Downstage.i18n.t("orderList.createClose"));
        modalClose.innerHTML = "&times;";

        var modalTitle = document.createElement("div");
        modalTitle.className = "modal-title";
        modalTitle.id = modalHeadingId;
        modalTitle.textContent = createTitle;

        var modalBody = document.createElement("div");
        modalBody.className = "modal-body";
        var modalForm = document.createElement("div");
        modalForm.className = "stack";

        createFields.forEach(function (f) {
          var field = document.createElement("div");
          field.className = "field";
          var label = document.createElement("label");
          label.className = "label";
          label.textContent = f.label || f.key;
          field.appendChild(label);

          var inp;
          if (f.type === "select" && f.options) {
            inp = document.createElement("select");
            inp.className = "select";
            if (!f.required) {
              var optEmpty = document.createElement("option");
              optEmpty.value = "";
              optEmpty.textContent = "—";
              inp.appendChild(optEmpty);
            }
            f.options.forEach(function (opt) {
              var o = document.createElement("option");
              if (typeof opt === "object") { o.value = opt.value; o.textContent = opt.label; }
              else { o.value = String(opt); o.textContent = String(opt); }
              inp.appendChild(o);
            });
          } else if (f.type === "textarea") {
            inp = document.createElement("textarea");
            inp.className = "input";
            inp.rows = 3;
          } else {
            inp = document.createElement("input");
            inp.className = "input";
            inp.type = f.type || "text";
            if (f.step) inp.step = String(f.step);
          }
          if (f.placeholder) inp.placeholder = f.placeholder;
          if (f.required) inp.required = true;
          if (f.default != null) inp.value = String(f.default);
          inp.setAttribute("data-create-field", f.key);
          field.appendChild(inp);
          modalForm.appendChild(field);
          modalInputs[f.key] = inp;
        });

        modalBody.appendChild(modalForm);

        var modalError = document.createElement("div");
        modalError.className = "order-list-create-error alert alert-danger mt-4 hidden";
        modalBody.appendChild(modalError);

        var modalFoot = document.createElement("div");
        modalFoot.className = "modal-footer";
        var cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.className = "btn btn-secondary";
        cancelBtn.textContent = Downstage.i18n.t("orderList.createCancel");
        var submitBtn = document.createElement("button");
        submitBtn.type = "button";
        submitBtn.className = "btn btn-primary";
        submitBtn.textContent = Downstage.i18n.t("orderList.createSave");

        modalFoot.appendChild(cancelBtn);
        modalFoot.appendChild(submitBtn);

        modalPanel.appendChild(modalClose);
        modalPanel.appendChild(modalTitle);
        modalPanel.appendChild(modalBody);
        modalPanel.appendChild(modalFoot);
        modalOverlay.appendChild(modalPanel);
        root.appendChild(modalOverlay);

        openCreateModal = function () {
          Object.keys(modalInputs).forEach(function (k) {
            var f = null;
            createFields.forEach(function (cf) { if (cf.key === k) f = cf; });
            modalInputs[k].value = f && f.default != null ? String(f.default) : "";
          });
          modalError.classList.add("hidden");
          modalSubmitting = false;
          submitBtn.disabled = false;
          submitBtn.textContent = Downstage.i18n.t("orderList.createSave");
          modalOverlay.classList.remove("hidden");
          modalOverlay.setAttribute("aria-hidden", "false");
          document.body.style.overflow = "hidden";
          var firstInp = modalForm.querySelector("input, select, textarea");
          if (firstInp) setTimeout(function () { firstInp.focus(); }, 0);
        };

        function closeCreateModal() {
          modalOverlay.classList.add("hidden");
          modalOverlay.setAttribute("aria-hidden", "true");
          document.body.style.overflow = "";
          searchInput.focus();
        }

        function submitCreateModal() {
          if (modalSubmitting) return;
          var data = {};
          var valid = true;
          createFields.forEach(function (f) {
            var inp = modalInputs[f.key];
            var val = inp.value;
            if (f.type === "number" && val !== "") val = parseFloat(val);
            data[f.key] = val;
            if (f.required && (val === "" || val == null)) { valid = false; inp.classList.add("is-invalid"); }
            else { inp.classList.remove("is-invalid"); }
          });
          if (!valid) return;
          modalSubmitting = true;
          submitBtn.disabled = true;
          submitBtn.textContent = Downstage.i18n.t("orderList.createSaving");
          modalError.classList.add("hidden");

          var resultP;
          try { resultP = createFn(data); } catch (e) { resultP = Promise.reject(e); }

          resultP
            .then(function (result) {
              var value, label;
              if (result && result.value !== undefined) { value = result.value; label = result.label; }
              else { value = result || data; }
              if (!label) {
                var parts = [];
                createFields.forEach(function (f) { if (data[f.key]) parts.push(String(data[f.key])); });
                label = parts.join(" — ");
              }
              if (localOpts && Array.isArray(localOpts)) {
                localOpts.push({ value: value, label: label });
              }
              addItem(value);
              closeCreateModal();
            })
            .catch(function (err) {
              modalError.textContent = Downstage.i18n.t("orderList.createFailed");
              modalError.classList.remove("hidden");
              modalSubmitting = false;
              submitBtn.disabled = false;
              submitBtn.textContent = Downstage.i18n.t("orderList.createSave");
            });
        }

        cancelBtn.addEventListener("click", closeCreateModal);
        modalClose.addEventListener("click", closeCreateModal);
        modalOverlay.addEventListener("click", function (e) {
          if (e.target === modalOverlay) closeCreateModal();
        });
        modalOverlay.addEventListener("keydown", function (e) {
          if (e.key === "Escape") closeCreateModal();
        });
        submitBtn.addEventListener("click", submitCreateModal);
        modalForm.addEventListener("keydown", function (e) {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitCreateModal(); }
        });
      }

      /* ---- search state ---- */
      var sActive = -1;
      var sItems = [];
      var sOpen = false;
      var sLoading = false;
      var sResultMap = {};

      function setSearchOpen(v) {
        sOpen = v;
        searchInput.setAttribute("aria-expanded", v ? "true" : "false");
        searchList.hidden = !v;
        searchWrap.classList.toggle("is-open", v);
      }

      function renderSearchRows(rows) {
        searchList.innerHTML = "";
        sItems = [];
        sResultMap = {};
        if (sLoading) {
          var li0 = document.createElement("li");
          li0.className = "combobox-loading";
          li0.textContent = Downstage.i18n.t("combobox.loading");
          searchList.appendChild(li0);
          return;
        }
        if (!rows || !rows.length) {
          if (canCreate) {
            var liC = document.createElement("li");
            liC.className = "combobox-option order-list-create-option";
            liC.setAttribute("role", "option");
            liC.setAttribute("id", searchListId + "-create");
            liC.innerHTML = '<svg class="icon icon-sm" aria-hidden="true"><use href="' + iconsHref("plus") + '" /></svg> ' +
              Downstage.i18n.t("orderList.createNew");
            liC.dataset.createAction = "true";
            searchList.appendChild(liC);
            sItems.push(liC);
          } else {
            var liE = document.createElement("li");
            liE.className = "combobox-empty";
            liE.textContent = Downstage.i18n.t("combobox.noResults");
            liE.setAttribute("role", "presentation");
            searchList.appendChild(liE);
          }
          return;
        }
        rows.forEach(function (row, i) {
          var li = document.createElement("li");
          li.className = "combobox-option";
          li.setAttribute("role", "option");
          li.setAttribute("id", searchListId + "-opt-" + i);
          li.textContent = row.label != null ? row.label : String(row.value);
          li.dataset.optIndex = String(i);
          searchList.appendChild(li);
          sItems.push(li);
          sResultMap[i] = row;
        });
        if (canCreate) {
          var liCr = document.createElement("li");
          liCr.className = "combobox-option order-list-create-option";
          liCr.setAttribute("role", "option");
          liCr.setAttribute("id", searchListId + "-create");
          liCr.innerHTML = '<svg class="icon icon-sm" aria-hidden="true"><use href="' + iconsHref("plus") + '" /></svg> ' +
            Downstage.i18n.t("orderList.createNew");
          liCr.dataset.createAction = "true";
          searchList.appendChild(liCr);
          sItems.push(liCr);
        }
      }

      function selectSearchItem(idx) {
        if (idx < 0 || idx >= sItems.length) return;
        var el = sItems[idx];
        if (el && el.dataset.createAction) {
          setSearchOpen(false);
          sActive = -1;
          if (openCreateModal) openCreateModal();
          return;
        }
        var option = sResultMap[idx];
        if (!option) return;
        addItem(option.value);
        searchInput.value = "";
        setSearchOpen(false);
        sActive = -1;
      }

      function highlightSearch(i) {
        sItems.forEach(function (el, j) {
          el.classList.toggle("is-active", j === i);
          el.setAttribute("aria-selected", j === i ? "true" : "false");
        });
        sActive = i;
      }

      function filterLocalOpts(q) {
        if (!q && !localOpts.length) return [];
        if (!q) return localOpts.slice();
        var nq = norm(q);
        return localOpts.filter(function (o) {
          var lbl = norm(o.label);
          var val = typeof o.value === "object" ? norm(JSON.stringify(o.value)) : norm(String(o.value));
          return lbl.indexOf(nq) !== -1 || val.indexOf(nq) !== -1;
        });
      }

      function runSearch(q) {
        if (fetchFn) {
          if (norm(q).length < minChars) { renderSearchRows([]); return; }
          sLoading = true;
          renderSearchRows([]);
          setSearchOpen(true);
          fetchFn(q)
            .then(function (rows) {
              sLoading = false;
              renderSearchRows(
                (rows || []).map(function (r) {
                  if (typeof r === "string") return { value: r, label: r };
                  return {
                    value: r.value != null ? r.value : r,
                    label: r.label != null ? r.label : String(r.value || r.id || r)
                  };
                })
              );
            })
            .catch(function () {
              sLoading = false;
              renderSearchRows([]);
            });
          return;
        }
        renderSearchRows(filterLocalOpts(q));
      }

      var debouncedSearch = debounce(function () { runSearch(searchInput.value); }, dMs);

      searchInput.addEventListener("input", function () { debouncedSearch(); setSearchOpen(true); highlightSearch(-1); });
      searchInput.addEventListener("focus", function () { if (!fetchFn) runSearch(searchInput.value); setSearchOpen(true); });
      searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { setSearchOpen(false); return; }
        if (e.key === "ArrowDown") { e.preventDefault(); if (!sOpen) setSearchOpen(true); highlightSearch(Math.min(sActive + 1, sItems.length - 1)); return; }
        if (e.key === "ArrowUp") { e.preventDefault(); highlightSearch(Math.max(sActive - 1, 0)); return; }
        if (e.key === "Enter" && sOpen && sActive >= 0) { e.preventDefault(); selectSearchItem(sActive); }
      });

      searchList.addEventListener("mousedown", function (e) {
        var li = e.target.closest(".combobox-option");
        if (!li || !searchList.contains(li)) return;
        e.preventDefault();
        var idx = sItems.indexOf(li);
        if (idx >= 0) selectSearchItem(idx);
      });

      document.addEventListener("click", function (e) {
        if (!searchWrap.contains(e.target)) setSearchOpen(false);
      }, true);

      /* ---- item management ---- */
      function getItemKey(value) {
        if (itemKey) return String(resolvePath(value, itemKey));
        if (typeof value === "object" && value !== null) return JSON.stringify(value);
        return String(value);
      }

      function findExistingIndex(value) {
        var key = getItemKey(value);
        for (var i = 0; i < items.length; i++) {
          if (getItemKey(items[i].value) === key) return i;
        }
        return -1;
      }

      function addItem(value) {
        var existIdx = findExistingIndex(value);
        if (existIdx >= 0 && qtyCol) {
          items[existIdx].qty = (items[existIdx].qty || 1) + 1;
        } else if (existIdx < 0) {
          var newItem = { value: value, sort_order: items.length };
          if (qtyCol) newItem.qty = 1;
          items.push(newItem);
        }
        emitChange();
        paint();
      }

      function removeItem(index) {
        items.splice(index, 1);
        reindex();
        emitChange();
        paint();
      }

      function setQty(index, qty) {
        if (qty < 1) qty = 1;
        items[index].qty = qty;
        emitChange();
        paint();
      }

      function reindex() {
        items.forEach(function (item, i) { item.sort_order = i; });
      }

      /* ---- sorting ---- */
      function sortByColumn() {
        if (!sortKey) return;
        var col = null;
        columns.forEach(function (c) { if (c.key === sortKey) col = c; });
        if (!col) return;
        items.sort(function (a, b) {
          var av = col.from ? resolvePath(a, col.from) : undefined;
          var bv = col.from ? resolvePath(b, col.from) : undefined;
          if (av == null) av = "";
          if (bv == null) bv = "";
          if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
          av = String(av); bv = String(bv);
          if (av < bv) return sortDir === "asc" ? -1 : 1;
          if (av > bv) return sortDir === "asc" ? 1 : -1;
          return 0;
        });
        reindex();
      }

      /* ---- JSON output ---- */
      function buildOutput() {
        return items.map(function (item, i) {
          var out = { value: item.value, sort_order: i };
          if (qtyCol) out.qty = item.qty || 1;
          return out;
        });
      }

      function syncHidden() {
        hiddenInput.value = JSON.stringify(buildOutput());
      }

      function emitChange() {
        syncHidden();
        var output = buildOutput();
        if (onChangeCallback) onChangeCallback(output);
        root.dispatchEvent(new CustomEvent("order-list-change", { bubbles: true, detail: { items: output } }));
      }

      /* ---- sort toggle ---- */
      sortToggleBtn.addEventListener("click", function () {
        sortMode = sortMode === "column" ? "manual" : "column";
        sortKey = "";
        updateSortToggle();
        paintHeaders();
        paint();
      });

      function paintHeaders() {
        var ths = trh.querySelectorAll("th");
        ths.forEach(function (th) {
          if (th.classList.contains("order-list-th-drag") || th.classList.contains("order-list-th-actions")) return;
          th.classList.remove("sortable");
          delete th.dataset.sortKey;
          var ind = th.querySelector(".sort-indicator");
          if (ind) ind.remove();
        });
        if (sortMode === "column") {
          columns.forEach(function (col, i) {
            var th = trh.children[i + 1];
            if (col.sortable !== false && col.type !== "qty" && !col.compute) {
              th.classList.add("sortable");
              th.dataset.sortKey = col.key;
            }
          });
        }
        table.classList.toggle("order-list-manual-sort", sortMode === "manual");
      }

      /* ---- render ---- */
      function getCellValue(item, col) {
        if (col.type === "qty") return item.qty || 1;
        if (col.compute) return col.compute(item);
        if (col.from) return resolvePath(item, col.from);
        return "";
      }

      function paint() {
        if (sortMode === "column" && sortKey) sortByColumn();

        tbody.innerHTML = "";
        items.forEach(function (item, rowIdx) {
          var tr = document.createElement("tr");
          tr.dataset.rowIndex = String(rowIdx);

          var tdDrag = document.createElement("td");
          tdDrag.className = "order-list-td-drag";
          if (sortMode === "manual") {
            tr.draggable = true;
            tdDrag.innerHTML = '<span class="order-list-drag-handle" title="' + Downstage.i18n.t("orderList.dragHint") + '">⠿</span>';
          }
          tr.appendChild(tdDrag);

          columns.forEach(function (col) {
            var td = document.createElement("td");
            if (col.type === "qty") {
              td.className = "order-list-td-qty";
              var qWrap = document.createElement("span");
              qWrap.className = "order-list-qty-wrap";
              var minusBtn = document.createElement("button");
              minusBtn.type = "button";
              minusBtn.className = "btn btn-sm btn-secondary";
              minusBtn.textContent = "\u2212";
              minusBtn.addEventListener("click", function () { setQty(rowIdx, (item.qty || 1) - 1); });
              var qtyInput = document.createElement("input");
              qtyInput.type = "number";
              qtyInput.className = "input input-sm order-list-qty-input";
              qtyInput.value = String(item.qty || 1);
              qtyInput.min = "1";
              qtyInput.addEventListener("change", function () {
                var v = parseInt(qtyInput.value, 10);
                if (isNaN(v) || v < 1) v = 1;
                setQty(rowIdx, v);
              });
              var plusBtn = document.createElement("button");
              plusBtn.type = "button";
              plusBtn.className = "btn btn-sm btn-secondary";
              plusBtn.textContent = "+";
              plusBtn.addEventListener("click", function () { setQty(rowIdx, (item.qty || 1) + 1); });
              qWrap.appendChild(minusBtn);
              qWrap.appendChild(qtyInput);
              qWrap.appendChild(plusBtn);
              td.appendChild(qWrap);
            } else {
              var val = getCellValue(item, col);
              if (col.render) {
                td.innerHTML = col.render(val, item);
              } else {
                td.textContent = val != null ? String(val) : "";
              }
            }
            tr.appendChild(td);
          });

          var tdAct = document.createElement("td");
          tdAct.className = "order-list-td-actions";
          var rmBtn = document.createElement("button");
          rmBtn.type = "button";
          rmBtn.className = "btn btn-sm btn-danger order-list-remove";
          rmBtn.title = Downstage.i18n.t("orderList.removeItem");
          rmBtn.textContent = "\u00d7";
          rmBtn.addEventListener("click", function () { removeItem(rowIdx); });
          tdAct.appendChild(rmBtn);
          tr.appendChild(tdAct);

          tbody.appendChild(tr);
        });

        thead.querySelectorAll("th").forEach(function (th) {
          var ind = th.querySelector(".sort-indicator");
          if (ind) ind.remove();
          if (sortMode === "column" && th.dataset.sortKey === sortKey) {
            var span = document.createElement("span");
            span.className = "sort-indicator";
            span.textContent = sortDir === "asc" ? "\u25b2" : "\u25bc";
            th.appendChild(span);
          }
        });

        var count = items.length;
        footerMeta.textContent = count
          ? Downstage.i18n.t("orderList.itemCount", { count: count })
          : Downstage.i18n.t("orderList.empty");

        table.classList.toggle("order-list-manual-sort", sortMode === "manual");
        syncHidden();
      }

      /* ---- column sort click ---- */
      thead.addEventListener("click", function (e) {
        if (sortMode !== "column") return;
        var th = e.target.closest("th.sortable");
        if (!th || !table.contains(th)) return;
        var key = th.dataset.sortKey;
        if (sortKey === key) sortDir = sortDir === "asc" ? "desc" : "asc";
        else { sortKey = key; sortDir = "asc"; }
        paint();
      });

      /* ---- drag-and-drop (manual sort) ---- */
      var dragRow = null;

      tbody.addEventListener("dragstart", function (e) {
        if (sortMode !== "manual") return;
        var tr = e.target.closest("tr");
        if (!tr) return;
        dragRow = tr;
        tr.classList.add("is-dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", "");
      });

      tbody.addEventListener("dragover", function (e) {
        if (sortMode !== "manual" || !dragRow) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        var tr = e.target.closest("tr");
        if (!tr || tr === dragRow || !tbody.contains(tr)) return;
        var rect = tr.getBoundingClientRect();
        var mid = rect.top + rect.height / 2;
        if (e.clientY < mid) tbody.insertBefore(dragRow, tr);
        else tbody.insertBefore(dragRow, tr.nextSibling);
      });

      tbody.addEventListener("dragend", function () {
        if (!dragRow) return;
        dragRow.classList.remove("is-dragging");
        var rows = tbody.querySelectorAll("tr");
        var newItems = [];
        rows.forEach(function (tr) {
          var idx = parseInt(tr.dataset.rowIndex, 10);
          if (!isNaN(idx) && items[idx]) newItems.push(items[idx]);
        });
        items = newItems;
        reindex();
        dragRow = null;
        emitChange();
        paint();
      });

      tbody.addEventListener("drop", function (e) { e.preventDefault(); });

      /* ---- initial render ---- */
      paintHeaders();
      paint();
      root.setAttribute("data-order-list-mounted", "true");

      return {
        root: root,
        getItems: function () { return buildOutput(); },
        setItems: function (newItems) {
          items = (newItems || []).map(function (item, i) {
            return {
              value: item.value != null ? item.value : item,
              qty: item.qty != null ? item.qty : 1,
              sort_order: item.sort_order != null ? item.sort_order : i
            };
          });
          paint();
        },
        addItem: function (value) { addItem(value); },
        removeItem: function (idx) { removeItem(idx); },
        refresh: function () { paint(); },
      };
    }

    function init() {
      document
        .querySelectorAll("[data-order-list]:not([data-order-list-mounted]):not([data-order-list-demo])")
        .forEach(function (el) { mount(el, {}); });
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
      Downstage.wizard.init();
      Downstage.lightbox.init();
      Downstage.slider.init();
      Downstage.videoPlayer.init();
      Downstage.audioPlayer.init();
      Downstage.uploadDrop.init();
      Downstage.htmlEditor.init();
      Downstage.combobox.init();
      Downstage.searchAutocomplete.init();
      Downstage.inputAutocomplete.init();
      Downstage.tagInput.init();
      Downstage.kanban.init();
      Downstage.dataTable.init();
      Downstage.datePicker.init();
      Downstage.dateRange.init();
      Downstage.calendar.init();
      Downstage.orderList.init();
      Downstage.passwordInput.init();
      Downstage.copyField.init();
      Downstage.formValidate.init();
    });
  });

  window.Downstage = Downstage;
})(window, document);
