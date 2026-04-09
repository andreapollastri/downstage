/* Demo-only scripts for index.html (combobox API, search, remote table, OTP fields) */
document.addEventListener("DOMContentLoaded", function () {
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
