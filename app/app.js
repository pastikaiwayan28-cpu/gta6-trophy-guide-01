// Leonida Trophy Atlas — offline tracker for the 55 GTA VI trophies (PS5).
// Data lives in data/trophies.json; progress lives in localStorage only.
(function () {
  "use strict";

  var STORE_KEY = "leonida-trophy-atlas-v3";
  var DATA_URL = "data/trophies.json";

  var trophies = [];
  var earned = {};
  var kind = "all";
  var grade = "all";
  var query = "";

  var grid = document.getElementById("grid");
  var resultCount = document.getElementById("resultCount");
  var emptyState = document.getElementById("emptyState");
  var progressText = document.getElementById("progressText");
  var progressFill = document.getElementById("progressFill");
  var progressBar = document.getElementById("progressBar");
  var searchInput = document.getElementById("search");
  var gradeFilter = document.getElementById("gradeFilter");
  var spoilerToggle = document.getElementById("spoilerToggle");
  var earnedOnlyBox = document.getElementById("earnedOnly");
  var unconfirmedOnlyBox = document.getElementById("unconfirmedOnly");
  var exportBtn = document.getElementById("exportBtn");
  var importFile = document.getElementById("importFile");
  var resetBtn = document.getElementById("resetBtn");
  var toolStatus = document.getElementById("toolStatus");

  function loadEarned() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return {};
      return parsed;
    } catch (err) {
      return {};
    }
  }

  function saveEarned() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(earned));
    } catch (err) {
      /* storage full or unavailable: the page still works for this visit */
    }
  }

  function gradeLabel(g) {
    return g.charAt(0).toUpperCase() + g.slice(1);
  }

  function kindLabel(k) {
    return k.charAt(0).toUpperCase() + k.slice(1);
  }

  function spoilerOn() {
    return spoilerToggle.checked;
  }

  function isHidden(t) {
    return t.hidden && spoilerOn() && !earned[t.id];
  }

  function matches(t) {
    if (kind !== "all" && t.kind !== kind) return false;
    if (grade !== "all" && t.grade !== grade) return false;
    if (earnedOnlyBox.checked && !earned[t.id]) return false;
    if (unconfirmedOnlyBox.checked && !t.unconfirmed) return false;
    if (!query) return true;
    var hay = (t.name + " " + t.description + " " + t.guide).toLowerCase();
    return hay.indexOf(query) !== -1;
  }

  function cardFor(t) {
    var card = document.createElement("article");
    card.className = "card" + (earned[t.id] ? " earned" : "");
    card.dataset.id = String(t.id);

    var top = document.createElement("div");
    top.className = "card-top";
    var title = document.createElement("h3");
    title.textContent = isHidden(t) ? "Hidden trophy" : t.name;
    if (isHidden(t)) title.className = "hidden-name";
    var badge = document.createElement("span");
    badge.className = "badge " + t.grade;
    badge.textContent = gradeLabel(t.grade);
    top.appendChild(title);
    top.appendChild(badge);
    card.appendChild(top);

    var official = document.createElement("p");
    official.className = "official";
    official.textContent = isHidden(t)
      ? "This story trophy stays hidden until you earn it."
      : "\u201C" + t.description + "\u201D";
    card.appendChild(official);

    if (!isHidden(t)) {
      var guide = document.createElement("p");
      guide.className = "guide";
      guide.textContent = t.guide;
      card.appendChild(guide);

      var source = document.createElement("p");
      source.className = "source";
      source.textContent = "Source: " + t.source;
      card.appendChild(source);
    }

    var tags = document.createElement("div");
    tags.className = "tags";
    if (t.kind !== "missable") {
      var kindTag = document.createElement("span");
      kindTag.className = "tag";
      kindTag.textContent = kindLabel(t.kind);
      tags.appendChild(kindTag);
    }
    if (t.hidden) {
      var hiddenTag = document.createElement("span");
      hiddenTag.className = "tag hidden-tag";
      hiddenTag.textContent = "Hidden";
      tags.appendChild(hiddenTag);
    }
    if (t.missable) {
      var missTag = document.createElement("span");
      missTag.className = "tag missable";
      missTag.textContent = "Missable";
      tags.appendChild(missTag);
    }
    if (t.unconfirmed) {
      var uncTag = document.createElement("span");
      uncTag.className = "tag unconfirmed";
      uncTag.textContent = "Unconfirmed";
      tags.appendChild(uncTag);
    }
    card.appendChild(tags);

    var earn = document.createElement("label");
    earn.className = "earn";
    var box = document.createElement("input");
    box.type = "checkbox";
    box.checked = !!earned[t.id];
    box.setAttribute("aria-label", "Mark " + t.name + " as earned");
    box.addEventListener("change", function () {
      if (box.checked) earned[t.id] = true;
      else delete earned[t.id];
      saveEarned();
      render();
    });
    earn.appendChild(box);
    earn.appendChild(document.createTextNode(box.checked ? "Earned" : "Mark as earned"));
    card.appendChild(earn);

    return card;
  }

  function renderProgress() {
    var total = trophies.length;
    var done = trophies.filter(function (t) { return earned[t.id]; }).length;
    var pct = total ? Math.round((done / total) * 100) : 0;
    progressText.textContent = done + " of " + total + " earned \u00B7 " + pct + "%";
    progressFill.style.width = pct + "%";
    progressBar.setAttribute("aria-valuenow", String(done));
  }

  function render() {
    renderProgress();
    grid.textContent = "";
    var shown = trophies.filter(matches);
    shown.forEach(function (t) { grid.appendChild(cardFor(t)); });
    resultCount.textContent = "Showing " + shown.length + " of " + trophies.length + " trophies.";
    emptyState.hidden = shown.length !== 0;
  }

  document.getElementById("kindChips").addEventListener("click", function (event) {
    var button = event.target.closest("[data-kind]");
    if (!button) return;
    kind = button.dataset.kind;
    var chips = document.querySelectorAll("#kindChips .chip");
    chips.forEach(function (chip) {
      chip.classList.toggle("active", chip === button);
    });
    render();
  });

  searchInput.addEventListener("input", function () {
    query = searchInput.value.trim().toLowerCase();
    render();
  });

  gradeFilter.addEventListener("change", function () {
    grade = gradeFilter.value;
    render();
  });

  spoilerToggle.addEventListener("change", render);
  earnedOnlyBox.addEventListener("change", render);
  unconfirmedOnlyBox.addEventListener("change", render);

  function setStatus(message) {
    toolStatus.textContent = message;
  }

  exportBtn.addEventListener("click", function () {
    var payload = {
      game: "Grand Theft Auto VI",
      exported_at: new Date().toISOString(),
      earned: Object.keys(earned).map(function (id) { return Number(id); }).sort(function (a, b) { return a - b; }),
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "leonida-trophy-atlas-checklist.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    setStatus("Checklist exported (" + payload.earned.length + " earned).");
  });

  importFile.addEventListener("change", function () {
    var file = importFile.files && importFile.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(String(reader.result));
        var ids = Array.isArray(parsed) ? parsed : parsed.earned;
        if (!Array.isArray(ids)) throw new Error("no earned list in file");
        var next = {};
        ids.forEach(function (id) {
          var n = Number(id);
          if (Number.isInteger(n) && n >= 1 && n <= 55) next[n] = true;
        });
        earned = next;
        saveEarned();
        render();
        setStatus("Checklist imported (" + Object.keys(next).length + " earned).");
      } catch (err) {
        setStatus("Import failed: that file is not a Leonida Trophy Atlas checklist.");
      }
      importFile.value = "";
    };
    reader.readAsText(file);
  });

  resetBtn.addEventListener("click", function () {
    if (!window.confirm("Clear every tick on this checklist?")) return;
    earned = {};
    saveEarned();
    render();
    setStatus("Checklist reset.");
  });

  earned = loadEarned();

  fetch(DATA_URL)
    .then(function (response) {
      if (!response.ok) throw new Error("Could not load " + DATA_URL);
      return response.json();
    })
    .then(function (data) {
      trophies = data.trophies || [];
      render();
    })
    .catch(function (err) {
      grid.textContent = "";
      resultCount.textContent = "Could not load the trophy list. " +
        "Serve this folder over http (for example, node serve.ts) and reload. " +
        "Error: " + err.message;
    });
})();
