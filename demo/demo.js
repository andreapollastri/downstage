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

document.addEventListener("DOMContentLoaded", function () {
  syncDocsBrowseDropdownActive();
  initDocsInPageNav();
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
});
