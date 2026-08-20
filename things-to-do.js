/* =========================================================
   CE VOYAGE — "Things to Do & Events in Sri Lanka" — JS
   Interactive filtering, events data & CMS panel
   ========================================================= */

(function () {
  "use strict";

  /* --------------------------------------------------------
     CONFIGURATION — WhatsApp & Contact
     -------------------------------------------------------- */
  var WA_URL = "https://wa.me/33744284269";

  /* --------------------------------------------------------
     CULTURAL EVENTS (fixed — major traditional festivals)
     -------------------------------------------------------- */
  var CULTURAL_EVENTS = [
    {
      id: "evt-perahera",
      title: "Kandy Esala Perahera",
      date: "July – August (Annually)",
      venue: "Kandy, Sri Lanka",
      image: "images/events-perahera.jpg",
      description: "One of Asia's oldest and grandest Buddhist festivals — featuring over 100 decorated elephants, Kandyan dancers, drummers, fire performers and the sacred tooth relic procession.",
      category: "cultural",
      type: "cultural"
    },
    {
      id: "evt-vesak",
      title: "Vesak Festival",
      date: "May (Full Moon Day)",
      venue: "Island-wide, Sri Lanka",
      image: "https://images.unsplash.com/photo-1566766189268-ecac9118f2b7?auto=format&fit=crop&w=900&q=85",
      description: "Celebrates the birth, enlightenment and passing of Buddha. Streets light up with lanterns, pandals and 'thorana' — illuminated stories from Jataka tales.",
      category: "cultural",
      type: "cultural"
    },
    {
      id: "evt-newyear",
      title: "Sinhala & Tamil New Year",
      date: "April 13–14",
      venue: "Island-wide, Sri Lanka",
      image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=900&q=85",
      description: "A nationwide celebration of harvest, togetherness and tradition — featuring oil baths, sweets, traditional games and the lighting of the hearth.",
      category: "cultural",
      type: "cultural"
    },
    {
      id: "evt-poson",
      title: "Poson Festival",
      date: "June (Full Moon Day)",
      venue: "Mihintale & Anuradhapura",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Tooth_Relic_Temple_Kandy_Sri_Lanka.jpg/1200px-Tooth_Relic_Temple_Kandy_Sri_Lanka.jpg",
      description: "Marks the arrival of Buddhism in Sri Lanka. Mihintale and Anuradhapura come alive with illuminated decorations, processions and ceremonies.",
      category: "cultural",
      type: "cultural"
    }
  ];

  /* --------------------------------------------------------
     DYNAMIC / SEASONAL EVENTS (CMS-managed — user-editable)
     -------------------------------------------------------- */
  var defaultSeasonalEvents = [
    {
      id: "evt-whale",
      title: "Whale Watching Season",
      date: "November – April",
      venue: "Mirissa & Trincomalee",
      image: "images/events-whale.jpg",
      description: "Blue whales, sperm whales and spinner dolphins frequent Sri Lanka's southern and eastern waters during this peak season.",
      category: "seasonal",
      type: "seasonal"
    },
    {
      id: "evt-elephant",
      title: "The Great Elephant Gathering",
      date: "July – September",
      venue: "Minneriya & Kaudulla",
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=900&q=85",
      description: "Over 300 wild elephants converge around the Minneriya reservoir — one of Asia's most spectacular wildlife events.",
      category: "seasonal",
      type: "seasonal"
    },
    {
      id: "evt-kitesurf",
      title: "Kalpitiya Kite Festival",
      date: "May – October",
      venue: "Kalpitiya Peninsula",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Kalpitiya_Beach_Sunset.jpg/1000px-Kalpitiya_Beach_Sunset.jpg",
      description: "Wind season brings kitesurfers from around the world. Join the festival with competitions, beach parties and lessons.",
      category: "seasonal",
      type: "seasonal"
    },
    {
      id: "evt-paddy",
      title: "Paddy Harvest Festival",
      date: "March & September",
      venue: "Rice paddies across Sri Lanka",
      image: "https://images.unsplash.com/photo-1566766189268-ecac9118f2b7?auto=format&fit=crop&w=900&q=85",
      description: "Experience traditional harvest celebrations in rural Sri Lanka — village feasts, music, dance and authentic farming life.",
      category: "seasonal",
      type: "seasonal"
    }
  ];

  /* --------------------------------------------------------
     ACTIVITY CATEGORIES & DATA
     -------------------------------------------------------- */
  var CATEGORIES = [
    {
      id: "wildlife",
      icon: "🐆",
      title: "Wildlife & Safari",
      subtitle: "Encounters with the island's incredible fauna",
      activities: [
        { name: "Jeep Safari", desc: "Yala, Udawalawe, Wilpattu, Minneriya, Kaudulla, Bundala, Kumana", location: "South & Central Sri Lanka", emoji: "🚙" },
        { name: "The Elephant Gathering", desc: "Over 300 wild elephants at Minneriya & Kaudulla — July to October", location: "Minneriya / Kaudulla", emoji: "🐘" },
        { name: "Whale & Dolphin Watching", desc: "Blue whales, sperm whales and spinner dolphins", location: "Mirissa & Trincomalee", emoji: "🐋" },
        { name: "Bird Watching", desc: "Over 400 species including endemic birds in lush forests", location: "Sinharaja & Bundala", emoji: "🦜" },
        { name: "Turtle Watching & Conservation", desc: "Witness sea turtles nesting and support conservation centres", location: "South Coast", emoji: "🐢" }
      ]
    },
    {
      id: "adventure",
      icon: "⛰️",
      title: "Adventure & Extreme Sports",
      subtitle: "Adrenaline-pumping experiences in the wild",
      activities: [
        { name: "Hiking & Trekking", desc: "Adam's Peak, Ella Rock, Little Adam's Peak, Pidurangala, Horton Plains – World's End, Knuckles Range, Pekoe Trail", location: "Hill Country", emoji: "🥾" },
        { name: "White Water Rafting", desc: "Thrilling rapids through tropical jungle gorges", location: "Kitulgala", emoji: "RAFT" },
        { name: "Hot Air Ballooning", desc: "Sunrise flights over Sigiriya and ancient cities", location: "Sigiriya Area", emoji: "🎈" },
        { name: "Scenic Flights & Helicopter Tours", desc: "Aerial views of tea hills, coastline and fortresses", location: "Island-wide", emoji: "🚁" },
        { name: "Zip-lining, Canyoning & Abseiling", desc: "Waterfall abseiling and jungle canopy zip-lines", location: "Kitulgala & Hiyare", emoji: "🪢" },
        { name: "Rock Climbing & Mountain Biking", desc: "Limestone crags and mountain trails for all levels", location: "Kitulgala & Knuckles", emoji: "🧗" },
        { name: "Kayaking & Canoeing", desc: "Paddle through mangrove tunnels and lagoons", location: "Madu River & Bentota", emoji: "🛶" }
      ]
    },
    {
      id: "beach",
      icon: "🏖️",
      title: "Water & Beach Activities",
      subtitle: "Sun, surf and the warm Indian Ocean",
      activities: [
        { name: "Surfing", desc: "Year-round waves for beginners and pros alike", location: "Arugam Bay, Weligama, Hikkaduwa, Hiriketiya, Mirissa, Ahangama", emoji: "🏄" },
        { name: "Kitesurfing & Windsurfing", desc: "Consistent monsoon winds on wide lagoons", location: "Kalpitiya", emoji: "🪁" },
        { name: "Snorkeling & Scuba Diving", desc: "Coral reefs, sea turtles and vibrant marine life", location: "Hikkaduwa, Trincomalee, Unawatuna, Pigeon Island", emoji: "🤿" },
        { name: "Boat Rides & River Safaris", desc: "Mangrove tunnels, river wildlife and quiet waterways", location: "Madu River, Bentota, Koggala Lake", emoji: "⛵" },
        { name: "Deep Sea / River / Lagoon Fishing", desc: "Offshore big-game fishing and calm lagoon angling", location: "South & East Coast", emoji: "🎣" },
        { name: "Jet Skiing, Banana Boat & SUP", desc: "Beach water sports for families and groups", location: "Bentota, Negombo, Hikkaduwa", emoji: "🏄‍♂️" },
        { name: "Swimming & Beach Relaxation", desc: "Golden sand bays and secluded crescent beaches", location: "Island-wide", emoji: "☀️" }
      ]
    },
    {
      id: "nature",
      icon: "🌿",
      title: "Nature & Scenic Highlights",
      subtitle: "Island landscapes that take your breath away",
      activities: [
        { name: "Iconic Train Ride", desc: "Kandy → Nuwara Eliya → Ella — one of the world's most scenic rail journeys", location: "Hill Country", emoji: "🚂" },
        { name: "Tea Plantation & Factory Visits", desc: "Walk through emerald tea fields and learn the art of Ceylon tea", location: "Nuwara Eliya, Ella, Haputale", emoji: "🍃" },
        { name: "Royal Botanical Gardens", desc: "147 acres of orchids, palms, spice trees and rare tropical flora", location: "Peradeniya", emoji: "🌺" },
        { name: "Rainforest Exploration", desc: "UNESCO World Heritage rainforest with endemic species", location: "Sinharaja", emoji: "🌴" },
        { name: "Waterfall Chasing & Nature Trails", desc: "Diya falls, Bambarakanda, St. Clair's and hidden cascades", location: "Hill Country", emoji: "💧" }
      ]
    },
    {
      id: "culture",
      icon: "🏛️",
      title: "Cultural, Village & Heritage",
      subtitle: "Two thousand five hundred years of civilisation",
      activities: [
        { name: "UNESCO Ancient Cities & Temples", desc: "Sigiriya, Dambulla, Anuradhapura, Polonnaruwa, Temple of the Tooth, Galle Fort", location: "Cultural Triangle & South", emoji: "🏛️" },
        { name: "Traditional Village Tours", desc: "Bullock cart rides, canoe trips, paddy field walks and local village life", location: "Rural Sri Lanka", emoji: "🏡" },
        { name: "Kandyan Cultural Dance Shows", desc: "Traditional drumming, fire dancing and acrobatic performances", location: "Kandy", emoji: "💃" },
        { name: "Authentic Cooking Classes", desc: "Learn to make rice & curry, hoppers, sambols and kottu", location: "Island-wide", emoji: "🍛" },
        { name: "Spice Garden Tours", desc: "Cinnamon, cardamom, clove and vanilla — the Spice Island explained", location: "Matale & Hill Country", emoji: "🫚" },
        { name: "Ayurveda Treatments & Wellness Retreats", desc: "Panchakarma, herbal massage and holistic healing", location: "Island-wide", emoji: "🧘" }
      ]
    },
    {
      id: "food",
      icon: "🍽️",
      title: "Food & Lifestyle",
      subtitle: "A culinary journey through Sri Lanka",
      activities: [
        { name: "Hands-on Cooking Classes", desc: "Market visits and kitchen sessions with local home cooks", location: "Galle, Colombo, Kandy", emoji: "👩‍🍳" },
        { name: "Street Food Tours & Culinary Crawls", desc: "Kottu roti, isso wade, egg hoppers and sweet treats", location: "Colombo & Fort areas", emoji: "🍜" },
        { name: "Premium Tea Tasting Experiences", desc: "Cup the finest Ceylon single-origin teas with expert guidance", location: "Nuwara Eliya & Ella", emoji: "🫖" },
        { name: "Traditional Village Meals & Dining", desc: "Banana-leaf rice & curry, wood-fired cooking and farm-to-table", location: "Rural areas & boutique hotels", emoji: "🥬" }
      ]
    },
    {
      id: "sports",
      icon: "⛳",
      title: "Sports & Fitness",
      subtitle: "Stay active while exploring paradise",
      activities: [
        { name: "Golfing", desc: "Colonial-era courses in cool hill country and coastal resorts", location: "Nuwara Eliya, Victoria, Colombo", emoji: "⛳" },
        { name: "Gym & Fitness Centres", desc: "Modern gyms and outdoor fitness parks in major cities", location: "Colombo & tourist areas", emoji: "💪" },
        { name: "Live Cricket Match Viewing", desc: "Experience the island's passion for cricket at the stadium", location: "Colombo (SSC / Premadasa)", emoji: "🏏" }
      ]
    },
    {
      id: "nightlife",
      icon: "🌙",
      title: "Entertainment & Nightlife",
      subtitle: "After-dark experiences across the island",
      activities: [
        { name: "Nightclubs & Clubbing", desc: "Electro, hip-hop and dance venues in Colombo", location: "Colombo", emoji: "🪩" },
        { name: "Live Music Bars & Rooftop Lounges", desc: "Acoustic sets, jazz and cocktail bars with skyline views", location: "Colombo & South Coast", emoji: "🎶" },
        { name: "Beach Parties", desc: "Full-moon and seasonal parties on the sand", location: "Arugam Bay & South Coast", emoji: "🎆" },
        { name: "Casinos & Entertainment", desc: "Casino floors, karaoke, cinema and gaming zones", location: "Colombo", emoji: "🎰" },
        { name: "Hotel Entertainment Nights", desc: "Cultural shows, BBQ buffets and live entertainment", location: "Resort areas", emoji: "🎭" }
      ]
    },
    {
      id: "unique",
      icon: "✨",
      title: "Other Unique Experiences",
      subtitle: "Only-in-Sri-Lanka moments",
      activities: [
        { name: "Traditional Stilt Fishermen", desc: "Watch fishermen perched on wooden stilts at sunset", location: "South Coast (Koggala)", emoji: "🎣" },
        { name: "Tuk-Tuk City Tours", desc: "Ride through bustling streets and hidden alleyways", location: "Colombo, Galle, Kandy", emoji: "🛺" },
        { name: "Cinnamon Island Boat Trips", desc: "Learn the art of cinnamon peeling on a private island", location: "Madu River, Balapitiya", emoji: "🏝️" },
        { name: "Yoga & Meditation Retreats", desc: "Beach yoga, forest meditation and silent retreats", location: "South Coast & Hill Country", emoji: "🧘‍♀️" },
        { name: "Colonial Architecture Guided Walks", desc: "Dutch, Portuguese and British heritage through historic streets", location: "Galle Fort & Colombo", emoji: "🏘️" }
      ]
    }
  ];

  /* --------------------------------------------------------
     LOCAL STORAGE HELPERS (CMS-like events management)
     -------------------------------------------------------- */
  var EVENTS_KEY = "cevoyage-things-to-do-events";

  function loadSeasonalEvents() {
    try {
      var stored = localStorage.getItem(EVENTS_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultSeasonalEvents.slice();
  }

  function saveSeasonalEvents(events) {
    try {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch (e) {}
  }

  /* --------------------------------------------------------
     RENDER FUNCTIONS
     -------------------------------------------------------- */
  function renderEvents(filter) {
    var container = document.getElementById("eventsGrid");
    if (!container) return;

    var allEvents = CULTURAL_EVENTS.concat(loadSeasonalEvents());

    var filtered;
    if (filter === "all") {
      filtered = allEvents;
    } else if (filter === "cultural") {
      filtered = CULTURAL_EVENTS;
    } else {
      filtered = loadSeasonalEvents();
    }

    if (filtered.length === 0) {
      container.innerHTML = '<div class="ttd-no-results show"><h3>No events yet</h3><p>Add seasonal events via the CMS panel below.</p></div>';
      return;
    }

    var html = "";
    filtered.forEach(function (evt) {
      var badgeClass = evt.type === "cultural" ? "ttd-event-badge-cultural" : "ttd-event-badge-seasonal";
      var badgeLabel = evt.type === "cultural" ? "Cultural" : "Seasonal";
      html += '<article class="ttd-event-card" data-type="' + evt.type + '">';
      html += '  <div class="ttd-event-card-img">';
      html += '    <img alt="' + evt.title + '" src="' + evt.image + '" loading="lazy"/>';
      html += '    <span class="ttd-event-card-badge ' + badgeClass + '">' + badgeLabel + '</span>';
      html += "  </div>";
      html += '  <div class="ttd-event-card-body">';
      html += '    <div class="ttd-event-card-date">' + evt.date + "</div>";
      html += "    <h3>" + evt.title + "</h3>";
      html += '    <div class="ttd-event-card-venue">📍 ' + evt.venue + "</div>";
      html += "    <p>" + evt.description + "</p>";
      html += '    <a class="ttd-event-card-cta" href="' + WA_URL + "?text=" + encodeURIComponent("Hi! I'd like to know more about: " + evt.title) + '" target="_blank" rel="noopener">Inquire Now ↗</a>';
      html += "  </div>";
      html += "</article>";
    });

    container.innerHTML = html;
  }

  function renderActivities(categoryFilter) {
    var container = document.getElementById("activitiesContainer");
    if (!container) return;

    var targetCategories;
    if (categoryFilter === "all") {
      targetCategories = CATEGORIES;
    } else {
      targetCategories = CATEGORIES.filter(function (c) {
        return c.id === categoryFilter;
      });
    }

    var html = "";
    targetCategories.forEach(function (cat) {
      html += '<div class="ttd-category-group" data-category="' + cat.id + '">';
      html += '  <div class="ttd-category-header">';
      html += '    <div class="ttd-category-icon">' + cat.icon + "</div>";
      html += "    <div>";
      html += "      <h2>" + cat.title + "</h2>";
      html += "      <p>" + cat.subtitle + "</p>";
      html += "    </div>";
      html += "  </div>";
      html += '  <div class="ttd-activity-grid">';

      cat.activities.forEach(function (act) {
        html += '<div class="ttd-activity-card">';
        html += '  <div class="ttd-activity-card-top">';
        html += '    <div class="ttd-activity-emoji">' + act.emoji + "</div>";
        html += '    <div class="ttd-activity-info">';
        html += "      <h3>" + act.name + "</h3>";
        html += "      <p>" + act.desc + "</p>";
        html += '      <div class="ttd-activity-location">📍 ' + act.location + "</div>";
        html += "    </div>";
        html += "  </div>";
        html += '  <div class="ttd-activity-tags">';
        html += '    <span class="ttd-activity-tag">' + cat.title + "</span>";
        html += "  </div>";
        html += '  <a class="ttd-activity-card-cta" href="' + WA_URL + "?text=" + encodeURIComponent("Hi! I'd like to book: " + act.name) + '" target="_blank" rel="noopener">Inquire / Book Tour ↗</a>';
        html += "</div>";
      });

      html += "  </div>";
      html += "</div>";
    });

    if (targetCategories.length === 0) {
      html = '<div class="ttd-no-results show"><h3>No activities found</h3><p>Select a different category to explore more.</p></div>';
    }

    container.innerHTML = html;
  }

  /* --------------------------------------------------------
     CMS ADMIN PANEL
     -------------------------------------------------------- */
  function renderAdminEventsList() {
    var listEl = document.getElementById("adminEventsList");
    if (!listEl) return;

    var events = loadSeasonalEvents();
    if (events.length === 0) {
      listEl.innerHTML = "<p style='color:#6e7773;font-size:13px'>No seasonal events added yet.</p>";
      return;
    }

    var html = "";
    events.forEach(function (evt, idx) {
      html += '<div class="ttd-admin-event-item">';
      html += "  <div>";
      html += "    <strong>" + evt.title + "</strong>";
      html += "    <br/><small>" + evt.date + " — " + evt.venue + "</small>";
      html += "  </div>";
      html += '  <button class="ttd-admin-delete" data-idx="' + idx + '">Delete</button>';
      html += "</div>";
    });

    listEl.innerHTML = html;

    listEl.querySelectorAll(".ttd-admin-delete").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(this.getAttribute("data-idx"), 10);
        var evts = loadSeasonalEvents();
        evts.splice(idx, 1);
        saveSeasonalEvents(evts);
        renderAdminEventsList();
        renderEvents(currentEventFilter);
      });
    });
  }

  function handleAdminSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var title = form.querySelector("[name='eventTitle']").value.trim();
    var date = form.querySelector("[name='eventDate']").value.trim();
    var venue = form.querySelector("[name='eventVenue']").value.trim();
    var image = form.querySelector("[name='eventImage']").value.trim();
    var desc = form.querySelector("[name='eventDesc']").value.trim();
    var link = form.querySelector("[name='eventLink']").value.trim();

    if (!title || !date) {
      alert("Please fill in at least the Title and Date.");
      return;
    }

    /* Use uploaded file if available, otherwise fall back to URL */
    var uploadedImage = window.__ttdUploadedImage || null;

    var newEvent = {
      id: "evt-cms-" + Date.now(),
      title: title,
      date: date,
      venue: venue || "Sri Lanka",
      image: uploadedImage || image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85",
      description: desc || "",
      category: "seasonal",
      type: "seasonal",
      link: link || ""
    };

    var events = loadSeasonalEvents();
    events.push(newEvent);
    saveSeasonalEvents(events);

    form.reset();
    window.__ttdUploadedImage = null;
    var preview = document.getElementById("uploadPreview");
    if (preview) preview.remove();
    var zone = document.getElementById("uploadZone");
    if (zone) {
      zone.classList.remove("dragover");
      zone.querySelector(".ttd-upload-text").textContent = "Click or drag to upload an image";
      zone.querySelector(".ttd-upload-icon").style.display = "";
    }
    renderAdminEventsList();
    renderEvents(currentEventFilter);
  }

  /* --------------------------------------------------------
     IMAGE UPLOAD HANDLER
     -------------------------------------------------------- */
  function initImageUpload() {
    var zone = document.getElementById("uploadZone");
    var fileInput = document.getElementById("eventImageFile");
    if (!zone || !fileInput) return;

    var MAX_SIZE = 2 * 1024 * 1024; // 2 MB

    function handleFile(file) {
      if (!file || !file.type.startsWith("image/")) {
        alert("Please upload a valid image file (JPG, PNG, or WebP).");
        return;
      }
      if (file.size > MAX_SIZE) {
        alert("Image is too large. Maximum size is 2 MB. Please compress or resize your image.");
        return;
      }
      var reader = new FileReader();
      reader.onload = function (ev) {
        var dataUrl = ev.target.result;
        window.__ttdUploadedImage = dataUrl;

        /* Show preview */
        var existing = document.getElementById("uploadPreview");
        if (existing) existing.remove();

        var img = document.createElement("img");
        img.id = "uploadPreview";
        img.className = "ttd-upload-preview";
        img.src = dataUrl;
        img.alt = "Upload preview";
        zone.appendChild(img);

        /* Show remove button */
        var removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "ttd-upload-remove";
        removeBtn.textContent = "✕ Remove";
        removeBtn.addEventListener("click", function (ev) {
          ev.stopPropagation();
          window.__ttdUploadedImage = null;
          fileInput.value = "";
          img.remove();
          removeBtn.remove();
          zone.querySelector(".ttd-upload-text").textContent = "Click or drag to upload an image";
          zone.querySelector(".ttd-upload-icon").style.display = "";
        });
        zone.appendChild(removeBtn);

        zone.querySelector(".ttd-upload-text").textContent = file.name + " — ready to add!";
        zone.querySelector(".ttd-upload-icon").style.display = "none";
      };
      reader.readAsDataURL(file);
    }

    /* Click to open file picker */
    zone.addEventListener("click", function (e) {
      if (e.target === zone || e.target.classList.contains("ttd-upload-icon") || e.target.classList.contains("ttd-upload-text") || e.target.classList.contains("ttd-upload-hint")) {
        fileInput.click();
      }
    });

    /* File input change */
    fileInput.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        handleFile(this.files[0]);
      }
    });

    /* Drag & Drop */
    zone.addEventListener("dragover", function (e) {
      e.preventDefault();
      this.classList.add("dragover");
    });

    zone.addEventListener("dragleave", function () {
      this.classList.remove("dragover");
    });

    zone.addEventListener("drop", function (e) {
      e.preventDefault();
      this.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    });
  }

  /* --------------------------------------------------------
     HERO BACKGROUND SLIDESHOW
     -------------------------------------------------------- */
  var heroImages = [
    "https://images.unsplash.com/photo-1588598198321-9735fd52455b?auto=format&fit=crop&w=2000&q=85",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85",
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2000&q=85",
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=2000&q=85"
  ];
  var heroIndex = 0;

  function rotateHero() {
    heroIndex = (heroIndex + 1) % heroImages.length;
    var bg = document.getElementById("ttdHeroBg");
    if (bg) {
      bg.style.opacity = "0";
      setTimeout(function () {
        bg.style.backgroundImage = "url('" + heroImages[heroIndex] + "')";
        bg.style.opacity = "1";
      }, 600);
    }
  }

  /* --------------------------------------------------------
     INITIALIZATION
     -------------------------------------------------------- */
  var currentEventFilter = "all";
  var currentActivityFilter = "all";

  function init() {
    /* Header scroll */
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

    /* Trip badge */
    try {
      var n = JSON.parse(localStorage.getItem("cevoyage-trip") || "[]").length;
      document.querySelectorAll("[data-trip-badge]").forEach(function (b) {
        b.textContent = n;
        b.hidden = !n;
      });
    } catch (e) {}

    /* Event filter tabs */
    var eventTabs = document.querySelectorAll(".ttd-events-tab");
    eventTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        eventTabs.forEach(function (t) {
          t.classList.remove("active");
        });
        this.classList.add("active");
        currentEventFilter = this.getAttribute("data-filter");
        renderEvents(currentEventFilter);
      });
    });

    /* Activity filter buttons */
    var filterBtns = document.querySelectorAll(".ttd-filter-btn");
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) {
          b.classList.remove("active");
        });
        this.classList.add("active");
        currentActivityFilter = this.getAttribute("data-filter");
        renderActivities(currentActivityFilter);
      });
    });

    /* Admin panel toggle */
    var adminToggle = document.getElementById("adminToggle");
    var adminPanel = document.getElementById("adminPanel");
    if (adminToggle && adminPanel) {
      adminToggle.addEventListener("click", function () {
        adminPanel.classList.toggle("visible");
        this.textContent = adminPanel.classList.contains("visible") ? "Hide CMS Panel ▲" : "Manage Events (CMS) ▼";
      });
    }

    /* Admin form submit */
    var adminForm = document.getElementById("adminEventForm");
    if (adminForm) {
      adminForm.addEventListener("submit", handleAdminSubmit);
    }

    /* Admin cancel */
    var adminCancel = document.getElementById("adminCancel");
    if (adminCancel) {
      adminCancel.addEventListener("click", function () {
        adminPanel.classList.remove("visible");
        adminToggle.textContent = "Manage Events (CMS) ▼";
      });
    }

    /* Initial renders */
    renderEvents("all");
    renderActivities("all");
    renderAdminEventsList();

    /* Image upload */
    initImageUpload();

    /* Hero slideshow */
    setInterval(rotateHero, 6000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
