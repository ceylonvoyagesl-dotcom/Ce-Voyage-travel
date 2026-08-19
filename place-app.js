/* Ce Voyage — Place page + trip cart (localStorage) */
(function () {
  "use strict";

  const CART_KEY = "cevoyage-trip";

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    renderCart();
    syncActivityButtons();
    updateTripBadges();
  }

  function cartKey(placeId, activityId) {
    return placeId + "::" + activityId;
  }

  function isInCart(placeId, activityId) {
    return getCart().some(function (i) {
      return i.placeId === placeId && i.activityId === activityId;
    });
  }

  function addToCart(item) {
    var cart = getCart();
    if (cart.some(function (i) { return i.placeId === item.placeId && i.activityId === item.activityId; })) {
      showToast("Already in your trip");
      return;
    }
    cart.push(item);
    saveCart(cart);
    showToast("Added to your trip");
  }

  function removeFromCart(placeId, activityId) {
    saveCart(
      getCart().filter(function (i) {
        return !(i.placeId === placeId && i.activityId === activityId);
      })
    );
  }

  function showToast(text) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("show");
    setTimeout(function () {
      toast.classList.remove("show");
    }, 2800);
  }

  function renderCart() {
    var list = document.getElementById("tripItems");
    var empty = document.getElementById("tripEmpty");
    var count = document.getElementById("tripCount");
    var cart = getCart();
    if (count) count.textContent = cart.length ? cart.length + " item(s) in trip" : "Your trip is empty";
    if (!list) return;
    list.innerHTML = "";
    if (!cart.length) {
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    cart.forEach(function (item) {
      var row = document.createElement("div");
      row.className = "trip-item";
      row.innerHTML =
        "<span><strong>" +
        escapeHtml(item.activityName) +
        "</strong><br/><small>" +
        escapeHtml(item.placeName) +
        "</small></span>";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Remove";
      btn.addEventListener("click", function () {
        removeFromCart(item.placeId, item.activityId);
      });
      row.appendChild(btn);
      list.appendChild(row);
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function syncActivityButtons() {
    document.querySelectorAll("[data-add-activity]").forEach(function (btn) {
      var placeId = btn.getAttribute("data-place");
      var activityId = btn.getAttribute("data-add-activity");
      if (isInCart(placeId, activityId)) {
        btn.textContent = "Added";
        btn.classList.add("added");
      } else {
        btn.textContent = "Add to trip";
        btn.classList.remove("added");
      }
    });
  }

  function updateTripBadges() {
    var n = getCart().length;
    document.querySelectorAll("[data-trip-badge]").forEach(function (el) {
      el.textContent = n;
      el.hidden = !n;
    });
  }

  // ---------- Video (Pexels stock clips, source fallback chain) ----------
  function videoUrls(id) {
    var base = "https://videos.pexels.com/video-files/" + id + "/" + id;
    return [
      base + "-uhd_2560_1440_30fps.mp4",
      base + "-uhd_2560_1440_25fps.mp4",
      base + "-uhd_2560_1440_24fps.mp4",
      base + "-hd_1920_1080_30fps.mp4",
      base + "-hd_1920_1080_25fps.mp4"
    ];
  }

  function renderVideo(place) {
    if (!place || !place.video) return;
    var gallery = document.getElementById("placeGallery");
    if (!gallery) return;

    var section = document.createElement("section");
    section.className = "place-video-section";
    section.innerHTML =
      '<h2 class="place-section-title">Watch the film</h2>' +
      '<div class="place-video-frame"><video class="place-video" controls playsinline preload="none"></video></div>' +
      '<p class="place-video-note" hidden></p>';
    gallery.insertAdjacentElement("afterend", section);

    var v = section.querySelector(".place-video");
    var note = section.querySelector(".place-video-note");
    v.setAttribute("poster", place.hero || "");

    var urls = videoUrls(place.video);
    urls.forEach(function (url) {
      var s = document.createElement("source");
      s.type = "video/mp4";
      s.src = url;
      v.appendChild(s);
    });

    // If even the last candidate fails, fall back to gallery-only
    var lastSource = v.querySelector("source:last-of-type");
    if (lastSource) {
      lastSource.addEventListener("error", function () {
        note.hidden = false;
        note.textContent = "This film is not available right now — enjoy the gallery instead.";
        v.closest(".place-video-frame").hidden = true;
      });
    }
  }

  function initPlacePage() {
    var root = document.body;
    var placeId = root.getAttribute("data-place-id");
    if (!placeId || !window.CE_PLACES || !window.CE_PLACES[placeId]) return;
    var place = window.CE_PLACES[placeId];

    document.querySelectorAll("[data-add-activity]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var activityId = btn.getAttribute("data-add-activity");
        var activity = (place.activities || []).find(function (a) {
          return a.id === activityId;
        });
        if (!activity) return;
        if (isInCart(placeId, activityId)) {
          removeFromCart(placeId, activityId);
          showToast("Removed from trip");
        } else {
          addToCart({
            placeId: placeId,
            placeName: place.name,
            activityId: activity.id,
            activityName: activity.name,
            type: activity.type,
            duration: activity.duration
          });
        }
      });
    });

    var addPlaceBtn = document.getElementById("addPlaceBtn");
    if (addPlaceBtn) {
      addPlaceBtn.addEventListener("click", function () {
        addToCart({
          placeId: placeId,
          placeName: place.name,
          activityId: "place-visit",
          activityName: "Visit " + place.name,
          type: place.tag,
          duration: place.duration
        });
      });
    }

    var waTrip = document.getElementById("waTripBtn");
    if (waTrip) {
      waTrip.addEventListener("click", function () {
        var cart = getCart();
        var lines = ["🌍 *Ce Voyage — Trip request*", ""];
        if (!cart.length) {
          lines.push("Interested in: " + place.name);
        } else {
          lines.push("My trip plan:");
          cart.forEach(function (i, idx) {
            lines.push(idx + 1 + ". " + i.activityName + " (" + i.placeName + ")");
          });
        }
        lines.push("", "Please help me plan this journey.");
        var phone = (window.CE_VOYAGE && window.CE_VOYAGE.whatsappFrance) || "33744284269";
        var url =
          "https://wa.me/" +
          String(phone).replace(/\D/g, "") +
          "?text=" +
          encodeURIComponent(lines.join("\n"));
        window.open(url, "_blank", "noopener");
      });
    }

    renderCart();
    syncActivityButtons();
    renderVideo(place);
    updateTripBadges();
  }

  // Header scroll on place pages
  var header = document.getElementById("siteHeader");
  if (header) {
    window.addEventListener(
      "scroll",
      function () {
        header.classList.toggle("scrolled", window.scrollY > 40);
      },
      { passive: true }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPlacePage);
  } else {
    initPlacePage();
  }

  window.CE_TRIP = {
    getCart: getCart,
    addToCart: addToCart,
    removeFromCart: removeFromCart
  };
})();
