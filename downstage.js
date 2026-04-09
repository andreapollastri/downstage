/* ============================================================================
   downstage.js — JavaScript helper for downstage.css
   by Andrea Pollastri
   ----------------------------------------------------------------------------
   Zero dependencies. Vanilla JS. Auto-init on DOMContentLoaded.
   Exposes window.Downstage with minimal APIs.

   Components:
     - Theme switcher        ([data-set-theme])
     - Navbar hamburger      (.navbar)
     - Tabs                  (.tabs)
     - Accordion             (.accordion)
     - Lightbox / Gallery    (.gallery [data-lightbox])
   ============================================================================ */

(function (window, document) {
  "use strict";

  const Downstage = {};

  /* ==========================================================================
     1. THEME SWITCHER
     Persiste in localStorage. Bind automatico su [data-set-theme="light|dark|auto"].
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
      // Aggiorna stato visivo dei bottoni
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
     Aggiunge .is-open su .navbar. Chiude su click link, ESC, resize → desktop.
     ========================================================================== */

  Downstage.navbar = (function () {
    function setup(nav) {
      const toggle = nav.querySelector(".navbar-toggle");
      const menu = nav.querySelector(".navbar-menu");
      if (!toggle || !menu) return;

      function setOpen(open) {
        nav.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      }

      toggle.addEventListener("click", function () {
        setOpen(!nav.classList.contains("is-open"));
      });

      // Chiudi al click su un link
      menu.querySelectorAll(".navbar-link").forEach(function (link) {
        link.addEventListener("click", function () {
          setOpen(false);
        });
      });

      // Chiudi con ESC
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && nav.classList.contains("is-open")) {
          setOpen(false);
        }
      });

      // Chiudi se torno a desktop
      const mq = window.matchMedia("(min-width: 769px)");
      const onChange = function (e) {
        if (e.matches) setOpen(false);
      };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else mq.addListener(onChange); // Safari < 14
    }

    function init() {
      document.querySelectorAll(".navbar").forEach(setup);
    }

    return { init: init };
  })();

  /* ==========================================================================
     3. TABS
     Markup richiesto:
       <div class="tabs" data-tabs>
         <ul class="tabs-list" role="tablist">
           <li><button class="tab" role="tab" data-tab="t1">Uno</button></li>
           <li><button class="tab" role="tab" data-tab="t2">Due</button></li>
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

        // Frecce ←/→ per navigare tra i tab (a11y)
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

      // Attiva il primo (o quello già marcato come .active)
      const initial = root.querySelector("[data-tab].active") || tabs[0];
      activate(initial.getAttribute("data-tab"));
    }

    function init() {
      document.querySelectorAll("[data-tabs]").forEach(setup);
    }

    return { init: init };
  })();

  /* ==========================================================================
     4. ACCORDION
     Markup richiesto:
       <div class="accordion" data-accordion>  <!-- data-accordion="single" per esclusivo -->
         <div class="accordion-item">
           <button class="accordion-header">
             Titolo
             <svg class="icon accordion-icon"><use href="downstage-icons.svg#plus"/></svg>
           </button>
           <div class="accordion-content">
             <div class="accordion-body">contenuto</div>
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

    return { init: init };
  })();

  /* ==========================================================================
     5. LIGHTBOX
     Markup minimo per attivare:
       <div class="gallery" data-lightbox="my-set">
         <a href="big1.jpg" class="gallery-item"><img src="thumb1.jpg" alt=""></a>
         <a href="big2.jpg" class="gallery-item"><img src="thumb2.jpg" alt=""></a>
       </div>
     Crea una sola istanza di .lightbox in fondo al body, riutilizzata.
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
        '<button class="lightbox-btn lightbox-close" aria-label="Close">' +
        '<svg class="icon" width="20" height="20"><use href="downstage-icons.svg#x"/></svg>' +
        "</button>" +
        '<button class="lightbox-btn lightbox-prev" aria-label="Previous">' +
        '<svg class="icon" width="20" height="20"><use href="downstage-icons.svg#chevron-left"/></svg>' +
        "</button>" +
        '<button class="lightbox-btn lightbox-next" aria-label="Next">' +
        '<svg class="icon" width="20" height="20"><use href="downstage-icons.svg#chevron-right"/></svg>' +
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
      // Mostra/nascondi frecce se c'è una sola immagine
      const hasMany = currentSet.length > 1;
      overlay.querySelector(".lightbox-prev").style.display = hasMany
        ? ""
        : "none";
      overlay.querySelector(".lightbox-next").style.display = hasMany
        ? ""
        : "none";
    }

    function init() {
      document.querySelectorAll("[data-lightbox]").forEach(function (gallery) {
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
      });
    }

    return { init: init, open: open, close: close };
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
          prev.setAttribute("aria-label", "Previous");
          prev.innerHTML =
            '<svg class="icon" width="18" height="18"><use href="downstage-icons.svg#chevron-left"/></svg>';
          root.appendChild(prev);
        }
        if (!next) {
          next = document.createElement("button");
          next.className = "slider-next";
          next.setAttribute("aria-label", "Next");
          next.innerHTML =
            '<svg class="icon" width="18" height="18"><use href="downstage-icons.svg#chevron-right"/></svg>';
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
            dot.setAttribute("aria-label", "Slide " + (i + 1));
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

    return { init: init };
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
          '<button class="video-btn video-play-btn" aria-label="Play">' +
          '<svg class="icon"><use href="downstage-icons.svg#play"/></svg>' +
          "</button>" +
          '<div class="video-progress"><div class="video-progress-bar"></div></div>' +
          '<span class="video-time">0:00</span>' +
          '<button class="video-btn video-mute-btn" aria-label="Mute">' +
          '<svg class="icon"><use href="downstage-icons.svg#volume"/></svg>' +
          "</button>";
        root.appendChild(controls);
      }

      var overlay = root.querySelector(".video-overlay-play");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "video-overlay-play";
        overlay.innerHTML =
          '<svg class="icon"><use href="downstage-icons.svg#play"/></svg>';
        root.insertBefore(overlay, root.firstChild.nextSibling);
      }

      var playBtn = root.querySelector(".video-play-btn");
      var progressWrap = root.querySelector(".video-progress");
      var progressBar = root.querySelector(".video-progress-bar");
      var timeEl = root.querySelector(".video-time");
      var muteBtn = root.querySelector(".video-mute-btn");

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
        playBtn.innerHTML =
          '<svg class="icon"><use href="downstage-icons.svg#' +
          (playing ? "pause" : "play") +
          '"/></svg>';
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
        muteBtn.innerHTML =
          '<svg class="icon"><use href="downstage-icons.svg#' +
          (video.muted ? "volume" : "volume") +
          '"/></svg>';
        muteBtn.style.opacity = video.muted ? "0.4" : "1";
      });

      video.removeAttribute("controls");
    }

    function init() {
      document.querySelectorAll("[data-video-player]").forEach(setup);
    }

    return { init: init };
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
      var title = root.getAttribute("data-title") || "Untitled";
      var artist = root.getAttribute("data-artist") || "";
      if (!src) return;

      var audio = new Audio(src);
      audio.preload = "metadata";

      if (!root.querySelector(".audio-btn")) {
        root.innerHTML =
          '<button class="audio-btn audio-play" aria-label="Play">' +
          '<svg class="icon"><use href="downstage-icons.svg#play"/></svg>' +
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
      audio.addEventListener("play", function () {
        playBtn.innerHTML =
          '<svg class="icon"><use href="downstage-icons.svg#pause"/></svg>';
      });
      audio.addEventListener("pause", function () {
        playBtn.innerHTML =
          '<svg class="icon"><use href="downstage-icons.svg#play"/></svg>';
      });
      audio.addEventListener("ended", function () {
        playBtn.innerHTML =
          '<svg class="icon"><use href="downstage-icons.svg#play"/></svg>';
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

    return { init: init };
  })();

  /* ==========================================================================
     AUTO-INIT
     ========================================================================== */

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    Downstage.theme.init();
    Downstage.navbar.init();
    Downstage.tabs.init();
    Downstage.accordion.init();
    Downstage.lightbox.init();
    Downstage.slider.init();
    Downstage.videoPlayer.init();
    Downstage.audioPlayer.init();
  });

  window.Downstage = Downstage;
})(window, document);
