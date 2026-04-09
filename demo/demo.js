/* Demo-only scripts: home demos (combobox, search, tables, OTP) + documentation site
   (Browse dropdown active state, in-page sidebar TOC). Loaded by index.html and docs/*.html. */

function demoKanbanBoardUrl() {
  var s = document.querySelector('script[src*="demo.js"]');
  if (s && s.src) {
    try {
      return new URL("kanban-board.json", s.src).href;
    } catch (e) {}
  }
  return "demo/kanban-board.json";
}

/** Resolved URL for the map-pins demo JSON (same folder as demo.js). */
function demoMapPinsUrl() {
  var s = document.querySelector('script[src*="demo.js"]');
  if (s && s.src) {
    try {
      return new URL("map-pins.json", s.src).href;
    } catch (e) {}
  }
  return "demo/map-pins.json";
}

/** Resolved URL for stats dashboard demo JSON (docs/data.html#stats). */
function demoStatsApiUrl() {
  var s = document.querySelector('script[src*="demo.js"]');
  if (s && s.src) {
    try {
      return new URL("stats-api.json", s.src).href;
    } catch (e) {}
  }
  return "demo/stats-api.json";
}

function dsStatsChartCssVar(name, fallback) {
  var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** Theme tokens from CSS variables (Chart.js + stat cards). */
function dsStatsChartTheme() {
  return {
    text: dsStatsChartCssVar("--text", "#1a1a1a"),
    muted: dsStatsChartCssVar("--text-muted", "#666"),
    border: dsStatsChartCssVar("--border", "#ddd"),
    elevated: dsStatsChartCssVar("--bg-elevated", "#fff"),
    primary: dsStatsChartCssVar("--brand-primary", "#5a6b5d"),
    success: dsStatsChartCssVar("--color-success", "#6b8266"),
    info: dsStatsChartCssVar("--color-info", "#5f7a8a"),
    warning: dsStatsChartCssVar("--color-warning", "#c08a3e"),
  };
}

/** Wire Region → Province → City from nested { regions: [{ provinces: [{ cities }] }] } */
function wireCascadingGeoSelects(container, data) {
  if (!container || !data || !data.regions) return;
  var regSel = container.querySelector("[data-cascade-region]");
  var provSel = container.querySelector("[data-cascade-province]");
  var citySel = container.querySelector("[data-cascade-city]");
  if (!regSel || !provSel || !citySel) return;

  container._cascadeGeoData = data;

  function fillSelect(sel, items, placeholder, getVal, getLabel) {
    sel.innerHTML = "";
    var o0 = document.createElement("option");
    o0.value = "";
    o0.textContent = placeholder;
    sel.appendChild(o0);
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var o = document.createElement("option");
      o.value = getVal(it);
      o.textContent = getLabel(it);
      sel.appendChild(o);
    }
  }

  function findRegion(id) {
    var d = container._cascadeGeoData;
    if (!d || !d.regions) return null;
    for (var i = 0; i < d.regions.length; i++) {
      if (d.regions[i].id === id) return d.regions[i];
    }
    return null;
  }

  function findProvince(region, pid) {
    if (!region || !region.provinces) return null;
    for (var j = 0; j < region.provinces.length; j++) {
      if (region.provinces[j].id === pid) return region.provinces[j];
    }
    return null;
  }

  if (!container._cascadeGeoDelegated) {
    container._cascadeGeoDelegated = true;
    container.addEventListener("change", function (e) {
      var t = e.target;
      var rs = container.querySelector("[data-cascade-region]");
      var ps = container.querySelector("[data-cascade-province]");
      var cs = container.querySelector("[data-cascade-city]");
      if (t === rs) {
        var region = findRegion(rs.value);
        var provinces = region && region.provinces ? region.provinces : [];
        fillSelect(ps, provinces, "Select province…", function (p) {
          return p.id;
        }, function (p) {
          return p.name;
        });
        fillSelect(cs, [], "Select city…", function (c) {
          return c.id;
        }, function (c) {
          return c.name;
        });
      } else if (t === ps) {
        var region2 = findRegion(rs.value);
        var province = findProvince(region2, ps.value);
        var cities = province && province.cities ? province.cities : [];
        fillSelect(cs, cities, "Select city…", function (c) {
          return c.id;
        }, function (c) {
          return c.name;
        });
      }
    });
  }

  fillSelect(regSel, data.regions, "Select region…", function (r) {
    return r.id;
  }, function (r) {
    return r.name;
  });
  fillSelect(provSel, [], "Select province…", function (p) {
    return p.id;
  }, function (p) {
    return p.name;
  });
  fillSelect(citySel, [], "Select city…", function (c) {
    return c.id;
  }, function (c) {
    return c.name;
  });
}

var JSONPLACEHOLDER_BASE = "https://jsonplaceholder.typicode.com";

/** Cascading selects against real public API (CORS-enabled): users → posts → comments. */
function initJsonPlaceholderCascading() {
  var root = document.getElementById("demo-cascade-remote");
  var statusEl = document.getElementById("demo-cascade-remote-status");
  if (!root) return;
  var userSel = root.querySelector("[data-jp-user]");
  var postSel = root.querySelector("[data-jp-post]");
  var commentSel = root.querySelector("[data-jp-comment]");
  if (!userSel || !postSel || !commentSel) return;

  function fillSelect(sel, items, placeholder, getVal, getLabel) {
    sel.innerHTML = "";
    var o0 = document.createElement("option");
    o0.value = "";
    o0.textContent = placeholder;
    sel.appendChild(o0);
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var o = document.createElement("option");
      o.value = String(getVal(it));
      o.textContent = getLabel(it);
      sel.appendChild(o);
    }
  }

  function setStatus(msg, isErr) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.classList.remove("badge", "badge-danger");
    if (isErr) {
      statusEl.classList.add("badge", "badge-danger");
    }
  }

  function loadUsers() {
    var url = JSONPLACEHOLDER_BASE + "/users";
    setStatus("Loading… GET " + url.replace(JSONPLACEHOLDER_BASE, "jsonplaceholder.typicode.com"));
    if (typeof console !== "undefined" && console.info) {
      console.info("[downstage demo] GET", url);
    }
    return fetch(url, { credentials: "omit", cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("http");
        return r.json();
      })
      .then(function (users) {
        fillSelect(userSel, users, "Select user…", function (u) {
          return u.id;
        }, function (u) {
          return u.name + " (id " + u.id + ")";
        });
        fillSelect(postSel, [], "Select post…", function (p) {
          return p.id;
        }, function (p) {
          return p.title || "";
        });
        fillSelect(commentSel, [], "Select comment…", function (c) {
          return c.id;
        }, function (c) {
          return (c.body || "").slice(0, 40);
        });
        setStatus(
          "Request 1 of 3: GET /users — choose a user to load posts (GET /posts?userId=…).",
        );
      })
      .catch(function () {
        setStatus(
          "Could not reach JSONPlaceholder (network or block). HTTPS access to jsonplaceholder.typicode.com is required.",
          true,
        );
      });
  }

  if (!root._jpDelegated) {
    root._jpDelegated = true;
    root.addEventListener("change", function (e) {
      var t = e.target;
      if (t === userSel && userSel.value) {
        var uid = userSel.value;
        var url = JSONPLACEHOLDER_BASE + "/posts?userId=" + encodeURIComponent(uid);
        if (typeof console !== "undefined" && console.info) {
          console.info("[downstage demo] GET", url);
        }
        setStatus("Loading posts…");
        fetch(url, { credentials: "omit", cache: "no-store" })
          .then(function (r) {
            if (!r.ok) throw new Error("http");
            return r.json();
          })
          .then(function (posts) {
            fillSelect(postSel, posts, "Select post…", function (p) {
              return p.id;
            }, function (p) {
              var title = p.title || "";
              return title.length > 45 ? title.slice(0, 45) + "…" : title;
            });
            fillSelect(commentSel, [], "Select comment…", function (c) {
              return c.id;
            }, function (c) {
              return c.body || "";
            });
            setStatus(
              "Request 2 of 3: GET /posts?userId=" +
                uid +
                " — choose a post to load comments (GET /comments?postId=…).",
            );
          })
          .catch(function () {
            setStatus("Failed to load posts.", true);
          });
      } else if (t === postSel && postSel.value) {
        var pid = postSel.value;
        var url = JSONPLACEHOLDER_BASE + "/comments?postId=" + encodeURIComponent(pid);
        if (typeof console !== "undefined" && console.info) {
          console.info("[downstage demo] GET", url);
        }
        setStatus("Loading comments…");
        fetch(url, { credentials: "omit", cache: "no-store" })
          .then(function (r) {
            if (!r.ok) throw new Error("http");
            return r.json();
          })
          .then(function (comments) {
            fillSelect(commentSel, comments, "Select comment…", function (c) {
              return c.id;
            }, function (c) {
              var b = (c.body || "").replace(/\s+/g, " ").trim();
              return b.length > 52 ? b.slice(0, 52) + "…" : b;
            });
            setStatus(
              "Request 3 of 3: GET /comments?postId=" +
                pid +
                " — three live HTTP requests to an external host.",
            );
          })
          .catch(function () {
            setStatus("Failed to load comments.", true);
          });
      }
    });

    var refetchBtn = document.getElementById("demo-cascade-remote-refetch");
    if (refetchBtn) {
      refetchBtn.addEventListener("click", function () {
        loadUsers();
      });
    }
  }

  loadUsers();
}

function initDemoCascadingSelects() {
  var elJson = document.getElementById("demo-cascade-geo-local-data");
  var localData = null;
  if (elJson) {
    try {
      localData = JSON.parse(elJson.textContent);
    } catch (e) {}
  }
  var rootLocal = document.getElementById("demo-cascade-local");
  if (rootLocal && localData) wireCascadingGeoSelects(rootLocal, localData);

  if (document.getElementById("demo-cascade-remote")) {
    initJsonPlaceholderCascading();
  }
}

function dsLeafletVoyagerTileLayer(L) {
  return L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
      '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20,
  });
}

function dsEscapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Data UI docs: map fed by GET JSON (see docs/data.html#map). */
function initDemoMapFromApi() {
  var el = document.getElementById("demo-map-data-api");
  if (!el || !window.L) return;

  var map = L.map(el, { scrollWheelZoom: true }).setView([42.5, 12.5], 6);
  dsLeafletVoyagerTileLayer(L).addTo(map);

  fetch(demoMapPinsUrl(), { credentials: "omit" })
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      var markers = data.markers || data;
      if (!Array.isArray(markers)) return;

      var group = L.featureGroup();
      markers.forEach(function (m) {
        if (m.lat == null || m.lng == null) return;
        var raw = m.color;
        var color =
          typeof raw === "string" && /^#[0-9A-Fa-f]{3,8}$/.test(raw) ? raw : "#5a6b5d";
        var icon = L.divIcon({
          className: "ds-leaflet-marker-wrap",
          html:
            '<div class="ds-leaflet-marker-pin" style="--pin-color:' + color + '"></div>',
          iconSize: [32, 40],
          iconAnchor: [16, 40],
          popupAnchor: [0, -36],
        });
        var title = dsEscapeHtml(m.title || "");
        var desc = dsEscapeHtml(m.description || "");
        L.marker([m.lat, m.lng], { icon: icon })
          .bindPopup("<strong>" + title + "</strong><br>" + desc)
          .addTo(group);
      });
      group.addTo(map);
      if (!group.getLayers().length) {
        return;
      }
      if (group.getLayers().length === 1) {
        var ll = group.getLayers()[0].getLatLng();
        map.setView([ll.lat, ll.lng], 8);
      } else {
        try {
          map.fitBounds(group.getBounds().pad(0.12));
        } catch (e) {}
      }
    })
    .catch(function () {});

  window.setTimeout(function () {
    map.invalidateSize();
  }, 0);
}

/** UI Components docs: compact maps + custom divIcon (see docs/ui-components.html#mini-map). */
function initDemoUiMiniMaps() {
  if (!window.L) return;

  var lat = 45.4642;
  var lng = 9.19;

  function mountOne(elId, minimal) {
    var el = document.getElementById(elId);
    if (!el) return;

    var map = L.map(el, { scrollWheelZoom: false, zoomControl: true }).setView([lat, lng], 15);
    dsLeafletVoyagerTileLayer(L).addTo(map);

    var icon;
    if (minimal) {
      icon = L.divIcon({
        className: "ds-leaflet-marker-wrap",
        html: '<div class="ds-leaflet-marker-pin" style="--pin-color:var(--brand-primary)"></div>',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -36],
      });
    } else {
      icon = L.divIcon({
        className: "ds-leaflet-marker-wrap",
        html:
          '<div class="ds-leaflet-marker-pin ds-leaflet-marker-pin--card" style="--pin-color:var(--brand-primary)"></div>',
        iconSize: [40, 48],
        iconAnchor: [20, 48],
        popupAnchor: [0, -44],
      });
    }

    L.marker([lat, lng], { icon: icon }).addTo(map).bindPopup("Showroom · Milan");

    window.setTimeout(function () {
      map.invalidateSize();
    }, 0);
  }

  mountOne("demo-ui-mini-map", false);
  mountOne("demo-ui-mini-map-minimal", true);
}

/** Current HTML filename from the URL path (e.g. getting-started.html). */
function docsPageBasename() {
  var p = location.pathname.replace(/\/$/, "");
  var last = p.split("/").pop() || "";
  if (!last || last === "docs") return "index.html";
  return last;
}

/** True on the documentation hub (docs/ or docs/index.html), where no Browse item is current. */
function docsIsHubPage() {
  var p = location.pathname.replace(/\/$/, "");
  return /\/docs$/i.test(p) || /\/docs\/index\.html$/i.test(p);
}

/** Sets .active on the matching navbar "Browse" link from the current page URL (path only). */
function syncDocsBrowseDropdownActive() {
  var panel = document.querySelector("#main-nav .navbar-dropdown-panel");
  if (!panel) return;
  var links = panel.querySelectorAll("a.navbar-dropdown-link");
  if (!links.length) return;
  var current = docsPageBasename();
  var hub = docsIsHubPage();
  links.forEach(function (a) {
    a.classList.remove("active");
    if (hub) return;
    var href = a.getAttribute("href");
    if (!href) return;
    try {
      var file = new URL(href, location.href).pathname.split("/").pop() || "";
      if (file && file === current) a.classList.add("active");
    } catch (e) {}
  });
}

/** Highlights the "On this page" sidebar link for the section in view (hash + scroll). */
function initDocsInPageNav() {
  var nav = document.querySelector(".docs-layout nav.docs-nav");
  if (!nav) return;
  var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
  if (!links.length) return;
  var entries = [];
  links.forEach(function (a) {
    var id = (a.getAttribute("href") || "").replace(/^#/, "");
    if (!id) return;
    var section = document.getElementById(id);
    if (section) entries.push({ id: id, link: a, section: section });
  });
  if (!entries.length) return;

  var offset = 120;

  function update() {
    var current = entries[0].id;
    for (var i = entries.length - 1; i >= 0; i--) {
      if (entries[i].section.getBoundingClientRect().top <= offset) {
        current = entries[i].id;
        break;
      }
    }
    entries.forEach(function (e) {
      var on = e.id === current;
      e.link.classList.toggle("active", on);
      if (on) e.link.setAttribute("aria-current", "location");
      else e.link.removeAttribute("aria-current");
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      update();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("hashchange", update);
  window.addEventListener("resize", onScroll);
  window.addEventListener("load", update);
  update();
  requestAnimationFrame(function () {
    requestAnimationFrame(update);
  });
}

/** docs/data.html#stats — KPIs + Chart.js bar/line/doughnut from JSON (API-shaped). */
function initStatsApiDemo() {
  var root = document.getElementById("demo-stats-api-root");
  if (!root || typeof Chart === "undefined") return;

  var kpisEl = document.getElementById("demo-stats-kpis");
  var statusEl = document.getElementById("demo-stats-status");
  var barCanvas = document.getElementById("demo-stats-chart-bar");
  var lineCanvas = document.getElementById("demo-stats-chart-line");
  var doughCanvas = document.getElementById("demo-stats-chart-doughnut");

  var charts = { bar: null, line: null, doughnut: null };

  function destroyCharts() {
    if (charts.bar) {
      charts.bar.destroy();
      charts.bar = null;
    }
    if (charts.line) {
      charts.line.destroy();
      charts.line = null;
    }
    if (charts.doughnut) {
      charts.doughnut.destroy();
      charts.doughnut = null;
    }
  }

  function render(data) {
    destroyCharts();
    var th = dsStatsChartTheme();

    if (kpisEl && data.kpis && Array.isArray(data.kpis)) {
      kpisEl.innerHTML = "";
      data.kpis.forEach(function (k) {
        var article = document.createElement("article");
        article.className = "stat-card";
        var changeCls = k.deltaClass === "down" ? "is-down" : "is-up";
        article.innerHTML =
          '<span class="stat-label">' +
          dsEscapeHtml(k.label || "") +
          "</span>" +
          '<span class="stat-value">' +
          dsEscapeHtml(k.value != null ? String(k.value) : "") +
          "</span>" +
          (k.change
            ? '<span class="stat-change ' + changeCls + '">' + dsEscapeHtml(String(k.change)) + "</span>"
            : "");
        kpisEl.appendChild(article);
      });
    }

    if (barCanvas && data.bar && data.bar.labels && data.bar.values) {
      var barRgb = th.primary;
      charts.bar = new Chart(barCanvas.getContext("2d"), {
        type: "bar",
        data: {
          labels: data.bar.labels,
          datasets: [
            {
              label: data.bar.datasetLabel || "Values",
              data: data.bar.values,
              backgroundColor: barRgb + "cc",
              borderColor: barRgb,
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              ticks: { color: th.muted },
              grid: { color: th.border },
            },
            y: {
              ticks: { color: th.muted },
              grid: { color: th.border },
              beginAtZero: true,
            },
          },
        },
      });
    }

    if (lineCanvas && data.line && data.line.labels && data.line.values) {
      charts.line = new Chart(lineCanvas.getContext("2d"), {
        type: "line",
        data: {
          labels: data.line.labels,
          datasets: [
            {
              label: data.line.datasetLabel || "Series",
              data: data.line.values,
              borderColor: th.primary,
              backgroundColor: th.primary + "22",
              fill: true,
              tension: 0.35,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              ticks: { color: th.muted },
              grid: { color: th.border },
            },
            y: {
              ticks: { color: th.muted },
              grid: { color: th.border },
              beginAtZero: true,
            },
          },
        },
      });
    }

    if (doughCanvas && data.pie && data.pie.labels && data.pie.values) {
      var cols = [th.primary, th.success, th.info, th.warning];
      charts.doughnut = new Chart(doughCanvas.getContext("2d"), {
        type: "doughnut",
        data: {
          labels: data.pie.labels,
          datasets: [
            {
              data: data.pie.values,
              backgroundColor: data.pie.labels.map(function (_, i) {
                return cols[i % cols.length];
              }),
              borderColor: th.elevated,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: { color: th.muted, padding: 12 },
            },
          },
        },
      });
    }

    if (statusEl) {
      statusEl.textContent =
        "Loaded " + demoStatsApiUrl() + " · " + new Date().toLocaleTimeString();
    }
  }

  function load() {
    if (statusEl) statusEl.textContent = "Loading…";
    fetch(demoStatsApiUrl(), { credentials: "omit", cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("http");
        return r.json();
      })
      .then(render)
      .catch(function () {
        if (statusEl) statusEl.textContent = "Could not load statistics JSON.";
      });
  }

  var refetch = document.getElementById("demo-stats-refetch");
  if (refetch) refetch.addEventListener("click", load);

  load();
}

/**
 * Same line style as “sessions over time”, but each point is appended from a live HTTP fetch
 * (Binance BTC/USDT spot — public, CORS). Poll interval 4s; shift window after 18 points.
 */
function initStatsLineLiveDemo() {
  var canvas = document.getElementById("demo-stats-chart-line-live");
  var statusEl = document.getElementById("demo-stats-line-live-status");
  if (!canvas || typeof Chart === "undefined") return;

  var th = dsStatsChartTheme();
  var labels = [];
  var values = [];
  var maxPoints = 18;
  var pollMs = 4000;
  var binanceUrl = "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT";

  var chart = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "BTC / USDT",
          data: values,
          borderColor: th.primary,
          backgroundColor: th.primary + "22",
          fill: true,
          tension: 0.35,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: { display: true, labels: { color: th.muted } },
      },
      scales: {
        x: {
          ticks: { color: th.muted, maxRotation: 40, minRotation: 0 },
          grid: { color: th.border },
        },
        y: {
          ticks: {
            color: th.muted,
            callback: function (val) {
              return typeof val === "number"
                ? val.toLocaleString(undefined, { maximumFractionDigits: 0 })
                : val;
            },
          },
          grid: { color: th.border },
        },
      },
    },
  });

  function tick() {
    fetch(binanceUrl, { credentials: "omit", cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("http");
        return r.json();
      })
      .then(function (d) {
        var price = parseFloat(d.price);
        if (isNaN(price)) throw new Error("parse");
        var t = new Date().toLocaleTimeString();
        labels.push(t);
        values.push(price);
        if (labels.length > maxPoints) {
          labels.shift();
          values.shift();
        }
        chart.data.labels = labels;
        chart.data.datasets[0].data = values;
        chart.update("none");
        if (statusEl) {
          statusEl.textContent =
            "Last fetch " +
            t +
            " · " +
            price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
            " USDT (Binance public API)";
        }
      })
      .catch(function () {
        if (statusEl) {
          statusEl.textContent =
            "Could not load live prices (offline, rate limit, or blocked). Use a server proxy in production.";
        }
      });
  }

  tick();
  var timer = window.setInterval(tick, pollMs);
  window.addEventListener("pagehide", function () {
    window.clearInterval(timer);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  syncDocsBrowseDropdownActive();
  initDocsInPageNav();
  initDemoMapFromApi();
  initDemoUiMiniMaps();
  initStatsApiDemo();
  initStatsLineLiveDemo();
  if (window.Downstage && Downstage.kanban) {
    document.querySelectorAll("[data-kanban][data-kanban-demo]:not([data-kanban-mounted])").forEach(function (el) {
      Downstage.kanban.mount(el, {
        fetchUrl: demoKanbanBoardUrl(),
        moveUrl: "https://httpbin.org/post",
        moveMethod: "POST",
        moveCredentials: "omit",
      });
    });
  }

  if (window.Downstage && Downstage.dataTable) {
    document
      .querySelectorAll("[data-data-table][data-data-table-demo]:not([data-data-table-mounted])")
      .forEach(function (el) {
        Downstage.dataTable.mount(el, {
          mode: "local",
          pageSize: 5,
          columns: [
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "role", label: "Role" },
          ],
          rows: [
            { name: "Ada Lovelace", email: "ada@example.com", role: "Admin" },
            { name: "Alan Turing", email: "alan@example.com", role: "Editor" },
            { name: "Grace Hopper", email: "grace@example.com", role: "Editor" },
            { name: "Edsger Dijkstra", email: "edsger@example.com", role: "Viewer" },
            { name: "Margaret Hamilton", email: "margaret@example.com", role: "Admin" },
            { name: "Ken Thompson", email: "ken@example.com", role: "Viewer" },
          ],
        });
      });
  }

  if (window.Downstage && Downstage.calendar) {
    document.querySelectorAll("[data-calendar][data-calendar-demo]:not([data-calendar-mounted])").forEach(function (el) {
      var eventsUrl = (function () {
        var s = document.querySelector('script[src*="demo.js"]');
        if (s && s.src) {
          try { return new URL("calendar-events.json", s.src).href; }
          catch (e) {}
        }
        return "demo/calendar-events.json";
      })();

      Downstage.calendar.mount(el, {
        defaultView: el.dataset.calendarDefaultView || "month",
        fetchUrl: eventsUrl,
        fetchCredentials: "omit",
        timelineHours: [8, 18],
        onEventClick: function (ev) {
          /* eslint-disable-next-line no-alert */
          alert(ev.title + (ev.start ? "\n" + ev.start : ""));
        },
      });
    });
  }

  if (window.Downstage && Downstage.orderList) {
    document.querySelectorAll("[data-order-list][data-order-list-demo]:not([data-order-list-mounted])").forEach(function (el) {
      var products = [
        { value: { codice: "P001", nome: "Widget Pro", unita: "pz", costo: 12.50 }, label: "P001 — Widget Pro" },
        { value: { codice: "P002", nome: "Gadget Lite", unita: "pz", costo: 8.00 }, label: "P002 — Gadget Lite" },
        { value: { codice: "P003", nome: "Service Pack", unita: "h", costo: 45.00 }, label: "P003 — Service Pack" },
        { value: { codice: "P004", nome: "Cable 2m", unita: "pz", costo: 3.20 }, label: "P004 — Cable 2m" },
        { value: { codice: "P005", nome: "Cloud Licence", unita: "yr", costo: 120.00 }, label: "P005 — Cloud Licence" },
        { value: { codice: "P006", nome: "Mounting Bracket", unita: "pz", costo: 5.75 }, label: "P006 — Mounting Bracket" },
        { value: { codice: "P007", nome: "Firmware Update", unita: "ea", costo: 25.00 }, label: "P007 — Firmware Update" },
        { value: { codice: "P008", nome: "Adapter USB-C", unita: "pz", costo: 9.90 }, label: "P008 — Adapter USB-C" },
      ];

      Downstage.orderList.mount(el, {
        name: "invoice_items",
        placeholder: "Search products…",
        itemKey: "codice",
        options: products,
        columns: [
          { key: "codice", label: "Code", from: "value.codice" },
          { key: "nome", label: "Product", from: "value.nome" },
          { key: "qty", label: "Qty", type: "qty" },
          { key: "unita", label: "Unit", from: "value.unita" },
          { key: "costo", label: "Unit price", from: "value.costo" },
          {
            key: "totale",
            label: "Total",
            compute: function (item) {
              return ((item.qty || 1) * (item.value.costo || 0)).toFixed(2);
            },
          },
        ],
        createTitle: "New product",
        createFields: [
          { key: "codice", label: "Product code", type: "text", required: true, placeholder: "e.g. P009" },
          { key: "nome", label: "Product name", type: "text", required: true },
          { key: "unita", label: "Unit", type: "select", options: ["pz", "h", "yr", "ea", "kg", "m"], required: true },
          { key: "costo", label: "Unit price", type: "number", required: true, step: "0.01", placeholder: "0.00" },
        ],
        createOption: function (data) {
          return new Promise(function (resolve) {
            setTimeout(function () {
              resolve({
                value: { codice: data.codice, nome: data.nome, unita: data.unita, costo: parseFloat(data.costo) || 0 },
                label: data.codice + " — " + data.nome,
              });
            }, 500);
          });
        },
        onChange: function (items) {
          var pre = document.getElementById("demo-order-list-json");
          var box = document.getElementById("demo-order-list-output");
          if (pre && box) {
            box.style.display = items.length ? "" : "none";
            pre.textContent = JSON.stringify(items, null, 2);
          }
        },
      });
    });
  }

  if (window.Downstage && Downstage.combobox) {
    var apiBox = document.getElementById("demo-combobox-api");
    if (apiBox) {
      Downstage.combobox.mount(apiBox, {
        minChars: 1,
        placeholder: "Type a name…",
        name: "userId",
        fetchOptions: function (query) {
          return fetch("https://jsonplaceholder.typicode.com/users")
            .then(function (r) {
              return r.json();
            })
            .then(function (all) {
              var nq = String(query).toLowerCase();
              return all
                .filter(function (u) {
                  return !nq || u.name.toLowerCase().indexOf(nq) !== -1;
                })
                .slice(0, 8)
                .map(function (u) {
                  return { value: String(u.id), label: u.name + " — " + u.email };
                });
            });
        },
      });
    }

    var iacEl = document.getElementById("demo-input-autocomplete");
    if (iacEl && Downstage.inputAutocomplete) {
      Downstage.inputAutocomplete.mount(iacEl, {
        name: "authorId",
        placeholder: "Search or create an author…",
        minChars: 1,
        fetchOptions: function (query) {
          return fetch("https://jsonplaceholder.typicode.com/users")
            .then(function (r) { return r.json(); })
            .then(function (all) {
              var q = String(query).toLowerCase();
              return all
                .filter(function (u) {
                  return !q || u.name.toLowerCase().indexOf(q) !== -1;
                })
                .slice(0, 8)
                .map(function (u) {
                  return { value: String(u.id), label: u.name };
                });
            });
        },
        createOption: function (text) {
          return fetch("https://jsonplaceholder.typicode.com/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: text })
          })
            .then(function (r) { return r.json(); })
            .then(function (u) {
              return { value: String(u.id), label: text };
            });
        }
      });
    }

    var iacModalEl = document.getElementById("demo-iac-modal");
    if (iacModalEl && Downstage.inputAutocomplete) {
      Downstage.inputAutocomplete.mount(iacModalEl, {
        name: "authorId2",
        placeholder: "Search or create an author…",
        minChars: 1,
        fetchOptions: function (query) {
          return fetch("https://jsonplaceholder.typicode.com/users")
            .then(function (r) { return r.json(); })
            .then(function (all) {
              var q = String(query).toLowerCase();
              return all
                .filter(function (u) { return !q || u.name.toLowerCase().indexOf(q) !== -1; })
                .slice(0, 8)
                .map(function (u) { return { value: String(u.id), label: u.name }; });
            });
        },
        createTitle: "New Author",
        createFields: [
          { key: "name", label: "Full name", required: true, placeholder: "Jane Doe" },
          { key: "email", label: "E-mail", required: true, type: "email", placeholder: "jane@example.com" },
          { key: "role", label: "Role", type: "select", options: [
            { value: "author", label: "Author" },
            { value: "editor", label: "Editor" },
            { value: "reviewer", label: "Reviewer" }
          ]}
        ],
        createOption: function (data) {
          return fetch("https://jsonplaceholder.typicode.com/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          })
          .then(function (r) { return r.json(); })
          .then(function (u) { return { value: String(u.id), label: data.name }; });
        }
      });
    }

    var tagEl = document.getElementById("demo-tag-input");
    if (tagEl && Downstage.tagInput) {
      Downstage.tagInput.mount(tagEl, {
        name: "skills",
        placeholder: "Add a skill…",
        minChars: 1,
        fetchOptions: function (query) {
          return fetch("https://jsonplaceholder.typicode.com/users")
            .then(function (r) { return r.json(); })
            .then(function (all) {
              var q = String(query).toLowerCase();
              return all
                .filter(function (u) {
                  return !q || u.name.toLowerCase().indexOf(q) !== -1;
                })
                .slice(0, 8)
                .map(function (u) {
                  return { value: String(u.id), label: u.name };
                });
            });
        },
        createOption: function (text) {
          return fetch("https://jsonplaceholder.typicode.com/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: text })
          })
            .then(function (r) { return r.json(); })
            .then(function (u) {
              return { value: String(u.id), label: text };
            });
        }
      });
    }

    var searchEl = document.getElementById("demo-search-autocomplete");
    if (searchEl) {
      Downstage.searchAutocomplete.mount(searchEl, {
        minChars: 1,
        placeholder: "Search users…",
        fetchSuggestions: function (query) {
          return fetch("https://jsonplaceholder.typicode.com/users")
            .then(function (r) {
              return r.json();
            })
            .then(function (all) {
              var nq = String(query).toLowerCase();
              return all
                .filter(function (u) {
                  return !nq || u.name.toLowerCase().indexOf(nq) !== -1;
                })
                .slice(0, 10)
                .map(function (u) {
                  return { value: String(u.id), label: u.name + " (" + u.email + ")" };
                });
            });
        },
      });
    }

    var remoteTable = document.getElementById("demo-data-table-remote");
    if (remoteTable && Downstage.dataTable) {
      Downstage.dataTable.mount(remoteTable, {
        mode: "remote",
        pageSize: 4,
        searchPlaceholder: "Filter loaded users…",
        columns: [
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "company", label: "Company" },
        ],
        fetchRemote: function (params) {
          return fetch("https://jsonplaceholder.typicode.com/users")
            .then(function (r) {
              return r.json();
            })
            .then(function (all) {
              var rows = all.map(function (u) {
                return {
                  name: u.name,
                  email: u.email,
                  company: u.company && u.company.name ? u.company.name : "—",
                };
              });
              var q = (params.q || "").toLowerCase();
              if (q) {
                rows = rows.filter(function (row) {
                  return (
                    String(row.name).toLowerCase().indexOf(q) !== -1 ||
                    String(row.email).toLowerCase().indexOf(q) !== -1 ||
                    String(row.company).toLowerCase().indexOf(q) !== -1
                  );
                });
              }
              var sk = params.sortKey || "name";
              var sd = params.sortDir === "desc" ? "desc" : "asc";
              rows = rows.slice().sort(function (a, b) {
                var av = a[sk];
                var bv = b[sk];
                if (av == null) av = "";
                if (bv == null) bv = "";
                av = String(av);
                bv = String(bv);
                var cmp = av < bv ? -1 : av > bv ? 1 : 0;
                return sd === "asc" ? cmp : -cmp;
              });
              var total = rows.length;
              var start = (params.page - 1) * params.pageSize;
              var pageRows = rows.slice(start, start + params.pageSize);
              return { rows: pageRows, total: total };
            });
        },
      });
    }
  }

  document.querySelectorAll("[data-demo-otp]").forEach(function (group) {
    var inputs = group.querySelectorAll(".input");
    inputs.forEach(function (inp, i) {
      inp.addEventListener("input", function () {
        if (inp.value.length >= 1 && inputs[i + 1]) {
          inp.value = inp.value.slice(-1);
          inputs[i + 1].focus();
        }
      });
      inp.addEventListener("keydown", function (e) {
        if (e.key === "Backspace" && !inp.value && inputs[i - 1]) {
          inputs[i - 1].focus();
        }
      });
    });
  });

  /* docs/ui-components.html — form validation demo */
  if (window.Downstage && window.Downstage.formValidate) {
    var demoFormVal = document.getElementById("demo-form-validation");
    if (demoFormVal) {
      window.Downstage.formValidate.mount(demoFormVal, {
        live: true,
        onValid: function (e) {
          e.preventDefault();
          var st = document.getElementById("demo-validate-status");
          if (st) {
            st.textContent = "Valid — demo only (no data sent).";
            st.style.display = "inline-block";
          }
        },
      });
      demoFormVal.addEventListener("reset", function () {
        window.setTimeout(function () {
          var st = document.getElementById("demo-validate-status");
          if (st) {
            st.style.display = "none";
            st.textContent = "";
          }
        }, 0);
      });
    }
    var demoChainForm = document.getElementById("demo-form-chain");
    if (demoChainForm) {
      window.Downstage.formValidate.mount(demoChainForm, {
        live: true,
        onValid: function (e) {
          e.preventDefault();
          var m = document.getElementById("demo-modal-chain-form");
          if (m) m.classList.add("hidden");
        },
      });
    }
    var demoSoForm = document.getElementById("demo-slideover-form");
    if (demoSoForm) {
      window.Downstage.formValidate.mount(demoSoForm, {
        live: true,
        onValid: function (e) {
          e.preventDefault();
          var so = document.getElementById("demo-slideover");
          if (so) {
            so.classList.add("hidden");
            so.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
          }
        },
      });
    }
  }

  /* docs/interactive.html — chained modals + slideover */
  var chainOpenBtn = document.getElementById("demo-modal-chain-open");
  var chainModalConfirm = document.getElementById("demo-modal-chain-confirm");
  var chainModalForm = document.getElementById("demo-modal-chain-form");
  if (chainOpenBtn && chainModalConfirm && chainModalForm) {
    function hideModal(el) {
      el.classList.add("hidden");
    }
    chainOpenBtn.addEventListener("click", function () {
      chainModalConfirm.classList.remove("hidden");
    });
    chainModalConfirm.querySelectorAll("[data-chain-close]").forEach(function (b) {
      b.addEventListener("click", function () {
        hideModal(chainModalConfirm);
      });
    });
    var chainContinue = chainModalConfirm.querySelector("[data-chain-continue]");
    if (chainContinue) {
      chainContinue.addEventListener("click", function () {
        hideModal(chainModalConfirm);
        chainModalForm.classList.remove("hidden");
      });
    }
    chainModalForm.querySelectorAll("[data-chain-close]").forEach(function (b) {
      b.addEventListener("click", function () {
        hideModal(chainModalForm);
      });
    });
  }

  var slideoverEl = document.getElementById("demo-slideover");
  var slideoverOpenBtn = document.getElementById("demo-slideover-open");
  if (slideoverEl && slideoverOpenBtn) {
    slideoverOpenBtn.addEventListener("click", function () {
      slideoverEl.classList.remove("hidden");
      slideoverEl.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
    slideoverEl.querySelectorAll("[data-slideover-close]").forEach(function (b) {
      b.addEventListener("click", function () {
        slideoverEl.classList.add("hidden");
        slideoverEl.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      });
    });
  }
});

/* Isolated listener so a throw earlier in demo.js does not skip cascading-select init. */
document.addEventListener("DOMContentLoaded", function () {
  initDemoCascadingSelects();
});
