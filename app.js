/* Ce Voyage — Homepage application logic */
(function () {
  "use strict";

  const cfg = window.CE_VOYAGE || {};
  const supportedLangs = ["en", "fr", "ru", "tr", "de", "ar"];
  let currentLang = localStorage.getItem("cevoyage-lang") || cfg.defaultLang || "en";
  if (!supportedLangs.includes(currentLang)) currentLang = "en";

  // ---------- Loader ----------
  window.addEventListener("load", () => {
    const loader = document.getElementById("pageLoader");
    if (loader) {
      setTimeout(() => loader.classList.add("hidden"), 400);
    }
    initReveal();
  });

  // ---------- Header scroll ----------
  const header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Mobile menu ----------
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });
    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => mobileMenu.classList.remove("open"));
    });
  }

  // ---------- Language (en, fr, ru, tr, de, ar + RTL) ----------
  function t(key, fallback) {
    const dict = (window.I18N && window.I18N[currentLang]) || {};
    return dict[key] !== undefined ? dict[key] : fallback || key;
  }

  function applyLanguage(lang) {
    if (!supportedLangs.includes(lang)) lang = "en";
    currentLang = lang;
    localStorage.setItem("cevoyage-lang", lang);
    const dict = (window.I18N && window.I18N[lang]) || {};
    const meta = (window.CE_LANG_META && window.CE_LANG_META[lang]) || { code: lang.toUpperCase(), dir: "ltr" };

    document.documentElement.lang = lang;
    document.documentElement.dir = meta.dir || "ltr";
    document.body.classList.toggle("is-rtl", meta.dir === "rtl");

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) {
        if (key === "introTitle" || String(dict[key]).indexOf("<") !== -1) {
          el.innerHTML = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (dict[key] !== undefined) el.placeholder = dict[key];
    });

    const label = document.getElementById("languageLabel");
    if (label) label.textContent = meta.code || lang.toUpperCase();

    document.querySelectorAll(".footer-lang").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });

    document.querySelectorAll("#langMenu [data-lang]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });

    closeLangMenu();
  }

  const langBtn = document.getElementById("languageBtn");
  const langMenu = document.getElementById("langMenu");
  const langDropdown = document.getElementById("langDropdown");

  function closeLangMenu() {
    if (!langMenu || !langBtn) return;
    langMenu.hidden = true;
    langBtn.setAttribute("aria-expanded", "false");
  }

  function openLangMenu() {
    if (!langMenu || !langBtn) return;
    langMenu.hidden = false;
    langBtn.setAttribute("aria-expanded", "true");
  }

  if (langBtn && langMenu) {
    langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (langMenu.hidden) openLangMenu();
      else closeLangMenu();
    });
    langMenu.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        applyLanguage(btn.getAttribute("data-lang"));
      });
    });
    document.addEventListener("click", (e) => {
      if (langDropdown && !langDropdown.contains(e.target)) closeLangMenu();
    });
  }

  document.querySelectorAll(".footer-lang").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyLanguage(btn.getAttribute("data-lang"));
    });
  });

  applyLanguage(currentLang);

  // ---------- Reveal on scroll ----------
  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  // ---------- Region filters ----------
  const filterBtns = document.querySelectorAll(".filter-btn");
  const regionCards = document.querySelectorAll(".region-card");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");
      regionCards.forEach((card) => {
        const cat = card.getAttribute("data-category");
        const show = filter === "all" || cat === filter;
        card.classList.toggle("hidden", !show);
      });
    });
  });

  // ---------- Featured slider (simple scroll) ----------
  const track = document.getElementById("featuredTrack");
  const prevBtn = document.getElementById("prevFeatured");
  const nextBtn = document.getElementById("nextFeatured");
  if (track && prevBtn && nextBtn) {
    const scrollAmount = 320;
    prevBtn.addEventListener("click", () => {
      track.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    });
    nextBtn.addEventListener("click", () => {
      track.scrollBy({ left: scrollAmount, behavior: "smooth" });
    });
  }

  // ---------- Search ----------
  function performSearch(query) {
    const q = (query || "").trim().toLowerCase();
    if (!q) return;
    const cards = document.querySelectorAll("[data-searchable]");
    let found = null;
    cards.forEach((card) => {
      const text = (card.getAttribute("data-searchable") || "").toLowerCase();
      if (text.includes(q) && !found) found = card;
    });
    if (found) {
      found.scrollIntoView({ behavior: "smooth", block: "center" });
      found.style.outline = "2px solid #d5aa56";
      setTimeout(() => (found.style.outline = ""), 2000);
    } else {
      showToast(t("noResults", "No results found"));
    }
  }

  const heroSearch = document.getElementById("heroSearch");
  const heroSearchBtn = document.getElementById("heroSearchBtn");
  if (heroSearchBtn) {
    heroSearchBtn.addEventListener("click", () => performSearch(heroSearch && heroSearch.value));
  }
  if (heroSearch) {
    heroSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        performSearch(heroSearch.value);
      }
    });
  }

  document.querySelectorAll("[data-search]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const term = btn.getAttribute("data-search");
      if (heroSearch) heroSearch.value = term;
      performSearch(term);
    });
  });

  // ---------- Map (Leaflet) ----------
  function initMap() {
    const mapEl = document.getElementById("travelMap");
    if (!mapEl || typeof L === "undefined") return;

    const map = L.map("travelMap", {
      scrollWheelZoom: false,
      zoomControl: true
    }).setView(cfg.mapCenter || [7.87, 80.77], cfg.mapZoom || 7);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO',
      subdomains: "abcd",
      maxZoom: 18
    }).addTo(map);

    const destinations = cfg.destinations || [];
    destinations.forEach((d) => {
      const marker = L.circleMarker([d.lat, d.lng], {
        radius: 9,
        fillColor: "#d5aa56",
        color: "#0a3d33",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(map);

      marker.bindPopup(
        `<strong style="font-family:Playfair Display,serif;font-size:16px">${d.name}</strong><br/><span style="font-size:13px;opacity:.8">${d.desc || ""}</span>`
      );
    });

    // Enable scroll zoom on focus
    mapEl.addEventListener("click", () => map.scrollWheelZoom.enable());
  }

  if (document.readyState === "complete") {
    initMap();
  } else {
    window.addEventListener("load", initMap);
  }

  // ---------- Lead form → WhatsApp ----------
  const leadForm = document.getElementById("leadForm");
  if (leadForm) {
    leadForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(leadForm);
      const name = data.get("name") || "";
      const email = data.get("email") || "";
      const phone = data.get("phone") || "";
      const travelDate = data.get("travelDate") || "";
      const travellers = data.get("travellers") || "";
      const interest = data.get("interest") || "";
      const message = data.get("message") || "";

      const text = [
        "🌍 *Ce Voyage — Demande de voyage*",
        `👤 Nom: ${name}`,
        `📧 Email: ${email}`,
        `📱 Téléphone: ${phone}`,
        travelDate ? `📅 Date: ${travelDate}` : null,
        travellers ? `👥 Voyageurs: ${travellers}` : null,
        interest ? `✨ Intérêt: ${interest}` : null,
        "",
        message
      ]
        .filter(Boolean)
        .join("\n");

      const wa = cfg.whatsappFrance || "33744284269";
      const url = `https://wa.me/${wa.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank", "noopener");

      const status = document.getElementById("leadStatus");
      if (status) {
        status.textContent = t("openingWhatsApp", "Opening WhatsApp...");
      }
      showToast(t("waToast", "WhatsApp is opening with your request"));
    });
  }

  // ---------- Newsletter (demo) ----------
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = document.getElementById("formMessage");
      if (msg) {
        msg.textContent = t("thanksSubscribe", "Thank you! We'll send you inspiration soon.");
      }
      newsletterForm.reset();
      showToast(t("subSaved", "Subscription saved"));
    });
  }

  // ---------- Toast ----------
  function showToast(text) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3200);
  }

  // ---------- Smooth anchor offset for fixed header ----------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
})();

  // ---------- Cinema hero slideshow ----------
  (function initCinemaHero() {
    var stage = document.getElementById("cinemaStage");
    if (!stage) return;
    var slides = Array.prototype.slice.call(stage.querySelectorAll(".cinema-slide"));
    if (!slides.length) return;
    var label = document.getElementById("cinemaLabel");
    var tag = document.getElementById("cinemaTag");
    var dotsWrap = document.getElementById("cinemaDots");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".stack-card"));
    var idx = 0;
    var timer;

    slides.forEach(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Slide " + (i + 1));
      if (i === 0) b.className = "is-active";
      b.addEventListener("click", function () { go(i); });
      if (dotsWrap) dotsWrap.appendChild(b);
    });

    function playVideo(slide) {
      var vids = stage.querySelectorAll("video");
      vids.forEach(function (v) {
        try { v.pause(); } catch (e) {}
      });
      var v = slide.querySelector("video");
      if (!v) return;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    }

    function go(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) {
        s.classList.toggle("is-active", n === idx);
      });
      if (dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (d, n) {
          d.classList.toggle("is-active", n === idx);
        });
      }
      var active = slides[idx];
      if (label) label.textContent = active.getAttribute("data-label") || "";
      if (tag) tag.textContent = active.getAttribute("data-tag") || "";
      cards.forEach(function (c) {
        c.classList.toggle("is-focus", String(c.getAttribute("data-slide")) === String(idx));
      });
      playVideo(active);
      clearInterval(timer);
      timer = setInterval(function () { go(idx + 1); }, 7000);
    }

    cards.forEach(function (c) {
      c.addEventListener("mouseenter", function () {
        var s = parseInt(c.getAttribute("data-slide"), 10);
        if (!isNaN(s)) go(s);
      });
    });

    // particles
    var parts = document.getElementById("cinemaParticles");
    if (parts) {
      for (var i = 0; i < 18; i++) {
        var s = document.createElement("span");
        s.style.left = Math.random() * 100 + "%";
        s.style.animationDuration = 8 + Math.random() * 12 + "s";
        s.style.animationDelay = Math.random() * 8 + "s";
        s.style.opacity = String(0.25 + Math.random() * 0.5);
        parts.appendChild(s);
      }
    }

    go(0);
  })();


  // Featured horizontal slider + autoplay
  (function () {
    var track = document.getElementById("featuredTrack");
    var prev = document.getElementById("prevFeatured");
    var next = document.getElementById("nextFeatured");
    if (!track) return;
    function step() {
      var card = track.querySelector(".feature-card");
      return card ? card.offsetWidth + 18 : 300;
    }
    if (prev) prev.addEventListener("click", function () {
      track.scrollBy({ left: -step(), behavior: "smooth" });
    });
    if (next) next.addEventListener("click", function () {
      track.scrollBy({ left: step(), behavior: "smooth" });
    });
    var auto = setInterval(function () {
      if (!track) return;
      var max = track.scrollWidth - track.clientWidth - 4;
      if (track.scrollLeft >= max) track.scrollTo({ left: 0, behavior: "smooth" });
      else track.scrollBy({ left: step(), behavior: "smooth" });
    }, 4500);
    track.addEventListener("mouseenter", function () { clearInterval(auto); });
  })();


  // Featured section background slideshow
  (function () {
    var slides = document.querySelectorAll(".featured-bg-slide");
    if (!slides.length) return;
    var i = 0;
    setInterval(function () {
      slides[i].classList.remove("is-active");
      i = (i + 1) % slides.length;
      slides[i].classList.add("is-active");
    }, 5000);
  })();
