/* Ce Voyage — Experience pages: linked places + trip badge */
(function () {
  "use strict";

  function renderPlaces() {
    var wrap = document.getElementById("linkedPlaces");
    if (!wrap || !window.CE_PLACES) return;
    var ids = (document.body.getAttribute("data-places") || "")
      .split(",")
      .map(function (s) { return s.trim(); })
      .filter(Boolean);
    ids.forEach(function (id) {
      var p = window.CE_PLACES[id];
      if (!p) return;
      var a = document.createElement("a");
      a.className = "exp-card";
      a.href = "../places/" + id + ".html";
      a.innerHTML = '<img alt=""/><div class="body"><span></span><h3></h3><p></p></div>';
      a.querySelector("img").src = p.hero;
      a.querySelector("img").alt = p.name;
      a.querySelector("span").textContent = p.tag;
      a.querySelector("h3").textContent = p.name;
      a.querySelector("p").textContent = p.tagline;
      wrap.appendChild(a);
    });
  }

  function syncBadges() {
    var n = 0;
    try {
      n = JSON.parse(localStorage.getItem("cevoyage-trip") || "[]").length;
    } catch (e) { /* ignore */ }
    document.querySelectorAll("[data-trip-badge]").forEach(function (b) {
      b.textContent = n;
      b.hidden = !n;
    });
  }

  var header = document.getElementById("siteHeader");
  if (header) {
    window.addEventListener("scroll", function () {
      header.classList.toggle("scrolled", window.scrollY > 40);
    }, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      renderPlaces();
      syncBadges();
    });
  } else {
    renderPlaces();
    syncBadges();
  }
})();
