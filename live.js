/* Ce Voyage Live — stories, posts, blogs (localStorage) */
(function () {
  "use strict";
  var KEY = "cevoyage-live-v1";

  var SEED = {
    stories: [
      { id: "s1", name: "Ella", caption: "Nine Arch at golden hour", type: "image", src: "https://images.unsplash.com/photo-1566766189268-ecac9118f2b7?auto=format&fit=crop&w=900&q=80", time: Date.now() - 3600000 },
      { id: "s2", name: "Yala", caption: "Leopard country", type: "image", src: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=900&q=80", time: Date.now() - 7200000 },
      { id: "s3", name: "Mirissa", caption: "South coast morning", type: "image", src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80", time: Date.now() - 10800000 }
    ],
    posts: [
      { id: "p1", kind: "post", title: "Tea train through the hills", body: "The Kandy–Ella line is still the most cinematic ride on the island.", type: "image", src: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1400&q=80", time: Date.now() - 86400000 },
      { id: "p2", kind: "post", title: "Galle Fort at dusk", body: "Ocean walls, colonial streets, and ice cream on the ramparts.", type: "image", src: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1400&q=80", time: Date.now() - 172800000 }
    ],
    blogs: [
      { id: "b1", kind: "blog", title: "How to plan 10 days without rushing", body: "Start in the Cultural Triangle, sleep two nights in Kandy, then take the train to Ella. Finish on the south coast. Leave one empty day — Sri Lanka always adds a story.", time: Date.now() - 259200000 }
    ]
  };

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return JSON.parse(JSON.stringify(SEED));
  }
  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  function fileToDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  function renderStoriesHome() {
    var row = document.getElementById("homeStoriesRow");
    if (!row) return;
    var data = load();
    row.innerHTML = "";
    var add = document.createElement("a");
    add.className = "story-ring add";
    add.href = "live.html#upload";
    add.innerHTML = '<div class="avatar">+</div><span>Add</span>';
    row.appendChild(add);
    data.stories.slice(0, 12).forEach(function (s) {
      var b = document.createElement("a");
      b.className = "story-ring";
      b.href = "live.html";
      var media = s.type === "video"
        ? '<video src="' + s.src + '" muted></video>'
        : '<img alt="" src="' + s.src + '"/>';
      b.innerHTML = '<div class="avatar">' + media + "</div><span>" + (s.name || "Story") + "</span>";
      row.appendChild(b);
    });
  }

  function renderLivePage() {
    var feed = document.getElementById("liveFeed");
    var blogs = document.getElementById("liveBlogs");
    var stories = document.getElementById("liveStories");
    if (!feed) return;
    var data = load();

    if (stories) {
      stories.innerHTML = "";
      data.stories.forEach(function (s, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "story-ring";
        b.innerHTML = '<div class="avatar"><img alt="" src="' + (s.type === "video" ? s.src : s.src) + '"/></div><span>' + (s.name || "Story") + "</span>";
        b.addEventListener("click", function () { openStory(i); });
        stories.appendChild(b);
      });
    }

    feed.innerHTML = "";
    data.posts.slice().sort(function (a, b) { return b.time - a.time; }).forEach(function (p) {
      var el = document.createElement("article");
      el.className = "feed-card";
      var media = "";
      if (p.src) {
        media = p.type === "video"
          ? '<video src="' + p.src + '" controls playsinline></video>'
          : '<img alt="" src="' + p.src + '"/>';
      }
      el.innerHTML = media + '<div class="feed-body"><div class="feed-meta">Live update · ' + new Date(p.time).toLocaleString() + "</div><h3>" + escapeHtml(p.title || "Update") + "</h3><p>" + escapeHtml(p.body || "") + "</p></div>";
      feed.appendChild(el);
    });

    if (blogs) {
      blogs.innerHTML = "";
      data.blogs.slice().sort(function (a, b) { return b.time - a.time; }).forEach(function (p) {
        var el = document.createElement("article");
        el.className = "feed-card blog-card";
        el.innerHTML = '<div class="feed-meta">Blog</div><h3>' + escapeHtml(p.title) + "</h3><p>" + escapeHtml(p.body) + "</p>";
        blogs.appendChild(el);
      });
    }
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  var storyIdx = 0;
  var storyTimer;
  function openStory(i) {
    var data = load();
    var viewer = document.getElementById("storyViewer");
    if (!viewer || !data.stories.length) return;
    storyIdx = i;
    viewer.classList.add("open");
    showStory();
  }
  function closeStory() {
    var viewer = document.getElementById("storyViewer");
    if (viewer) viewer.classList.remove("open");
    clearTimeout(storyTimer);
    var v = document.getElementById("storyMediaVideo");
    if (v) { try { v.pause(); } catch (e) {} }
  }
  function showStory() {
    var data = load();
    var s = data.stories[storyIdx];
    if (!s) { closeStory(); return; }
    var img = document.getElementById("storyMediaImg");
    var vid = document.getElementById("storyMediaVideo");
    var cap = document.getElementById("storyCaption");
    var bar = document.getElementById("storyProgress");
    if (cap) cap.textContent = (s.name ? s.name + " · " : "") + (s.caption || "");
    if (bar) {
      bar.innerHTML = data.stories.map(function (_, n) {
        return "<i>" + (n < storyIdx ? "<b style='width:100%'></b>" : n === storyIdx ? "<b id='storyFill'></b>" : "<b></b>") + "</i>";
      }).join("");
    }
    if (s.type === "video") {
      if (img) img.style.display = "none";
      if (vid) { vid.style.display = "block"; vid.src = s.src; vid.play().catch(function () {}); }
    } else {
      if (vid) { vid.pause(); vid.style.display = "none"; }
      if (img) { img.style.display = "block"; img.src = s.src; }
    }
    clearTimeout(storyTimer);
    requestAnimationFrame(function () {
      var fill = document.getElementById("storyFill");
      if (fill) {
        fill.style.transition = "width 5s linear";
        fill.style.width = "100%";
      }
    });
    storyTimer = setTimeout(function () {
      storyIdx += 1;
      if (storyIdx >= data.stories.length) closeStory();
      else showStory();
    }, 5000);
  }

  function bindComposer() {
    var form = document.getElementById("liveComposer");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var kind = document.getElementById("liveKind").value;
      var title = document.getElementById("liveTitle").value.trim();
      var body = document.getElementById("liveBody").value.trim();
      var file = document.getElementById("liveFile").files[0];
      var data = load();
      function push(src, type) {
        var item = {
          id: "u" + Date.now(),
          name: title || "Ce Voyage",
          title: title,
          caption: body,
          body: body,
          type: type || "image",
          src: src || "",
          time: Date.now(),
          kind: kind
        };
        if (kind === "story") data.stories.unshift(item);
        else if (kind === "blog") data.blogs.unshift(item);
        else data.posts.unshift(item);
        save(data);
        form.reset();
        form.classList.remove("open");
        renderLivePage();
        renderStoriesHome();
      }
      if (file) {
        fileToDataUrl(file).then(function (url) {
          push(url, file.type.indexOf("video") === 0 ? "video" : "image");
        });
      } else {
        push("", "image");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderStoriesHome();
    renderLivePage();
    bindComposer();
    renderSocial();
    bindSocial();
    renderHomeSocial();
    var openBtn = document.getElementById("openComposer");
    var form = document.getElementById("liveComposer");
    if (openBtn && form) {
      openBtn.addEventListener("click", function () { form.classList.toggle("open"); });
    }
    if (location.hash === "#upload" && form) form.classList.add("open");
    if (location.hash === "#social") {
      var sf = document.getElementById("socialComposer");
      if (sf) sf.classList.add("open");
    }
    var close = document.getElementById("storyClose");
    if (close) close.addEventListener("click", closeStory);
    var next = document.getElementById("storyNext");
    var prev = document.getElementById("storyPrev");
    if (next) next.addEventListener("click", function () { storyIdx += 1; showStory(); });
    if (prev) prev.addEventListener("click", function () { storyIdx = Math.max(0, storyIdx - 1); showStory(); });
  });

  var SOCIAL_KEY = "cevoyage-social-v1";
  function loadSocial() {
    try {
      var raw = localStorage.getItem(SOCIAL_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { instagram: "", igPosts: "", facebook: "", twitter: "", youtube: "" };
  }
  function saveSocial(s) {
    try { localStorage.setItem(SOCIAL_KEY, JSON.stringify(s)); } catch (e) {}
  }

  function igEmbedSrc(url) {
    var m = String(url || "").match(/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
    if (!m) return "";
    return "https://www.instagram.com/" + m[1] + "/" + m[2] + "/embed";
  }
  function ytEmbed(url) {
    var u = String(url || "").trim();
    if (!u) return "";
    var vid = u.match(/(?:youtu\.be\/|v=|shorts\/)([A-Za-z0-9_-]{6,})/);
    if (vid) return "https://www.youtube.com/embed/" + vid[1];
    var list = u.match(/[?&]list=([A-Za-z0-9_-]+)/);
    if (list) return "https://www.youtube.com/embed/videoseries?list=" + list[1];
    var handle = u.match(/youtube\.com\/@([^/?#]+)/);
    if (handle) return "https://www.youtube.com/embed?listType=user_uploads&list=" + encodeURIComponent(handle[1]);
    var ch = u.match(/youtube\.com\/(?:c|user)\/([^/?#]+)/);
    if (ch) return "https://www.youtube.com/embed?listType=user_uploads&list=" + encodeURIComponent(ch[1]);
    return "";
  }
  function twUser(url) {
    var m = String(url || "").match(/(?:x\.com|twitter\.com)\/([A-Za-z0-9_]+)/);
    return m ? m[1] : String(url || "").replace(/^@/, "").trim();
  }

  function renderSocial() {
    var bar = document.getElementById("socialBar");
    var wall = document.getElementById("socialWall");
    var s = loadSocial();
    if (bar) {
      bar.innerHTML =
        '<a class="social-pill ig" href="' + (s.instagram || "https://www.instagram.com/") + '" target="_blank" rel="noopener"><i>IG</i> Instagram</a>' +
        '<a class="social-pill fb" href="' + (s.facebook || "https://www.facebook.com/") + '" target="_blank" rel="noopener"><i>f</i> Facebook</a>' +
        '<a class="social-pill tw" href="' + (s.twitter || "https://x.com/") + '" target="_blank" rel="noopener"><i>X</i> Twitter</a>' +
        '<a class="social-pill yt" href="' + (s.youtube || "https://www.youtube.com/") + '" target="_blank" rel="noopener"><i>▶</i> YouTube</a>';
    }
    if (!wall) return;
    var igLines = (s.igPosts || "").split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean);
    var igHtml = igLines.length
      ? '<div class="ig-grid">' + igLines.slice(0, 4).map(function (u) {
          var src = igEmbedSrc(u);
          return src ? '<iframe src="' + src + '" loading="lazy" allowtransparency="true"></iframe>' : "";
        }).join("") + "</div>"
      : '<div class="empty">Instagram post / Reel link එකක් Connect social එකෙන් දාන්න. Profile link එකෙන් page එක open වෙනවා.</div>';

    var fbHtml = s.facebook
      ? '<iframe src="https://www.facebook.com/plugins/page.php?href=' + encodeURIComponent(s.facebook) + '&tabs=timeline&width=500&height=520&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false" loading="lazy" allow="encrypted-media"></iframe>'
      : '<div class="empty">Facebook page URL එක දාන්න — timeline එක මෙතන පේනවා.</div>';

    var user = twUser(s.twitter);
    var twHtml = user
      ? '<a class="twitter-timeline" data-height="520" href="https://twitter.com/' + encodeURIComponent(user) + '">Tweets by @' + escapeHtml(user) + "</a>"
      : '<div class="empty">X / Twitter profile URL එක දාන්න.</div>';

    var yt = ytEmbed(s.youtube);
    var ytHtml = yt
      ? '<iframe src="' + yt + '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      : '<div class="empty">YouTube video, playlist හෝ @channel එක දාන්න.</div>';

    wall.innerHTML =
      '<div class="social-embed"><h3>Instagram</h3>' + igHtml + "</div>" +
      '<div class="social-embed"><h3>Facebook</h3>' + fbHtml + "</div>" +
      '<div class="social-embed"><h3>X / Twitter</h3>' + twHtml + "</div>" +
      '<div class="social-embed"><h3>YouTube</h3>' + ytHtml + "</div>";

    if (user && !document.getElementById("twWidgets")) {
      var sc = document.createElement("script");
      sc.id = "twWidgets";
      sc.async = true;
      sc.src = "https://platform.twitter.com/widgets.js";
      document.body.appendChild(sc);
    } else if (user && window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load(wall);
    }
  }

  function bindSocial() {
    var form = document.getElementById("socialComposer");
    var open = document.getElementById("openSocial");
    if (open && form) {
      open.addEventListener("click", function () { form.classList.toggle("open"); });
    }
    if (!form) return;
    var s = loadSocial();
    var ig = document.getElementById("socIg");
    var igp = document.getElementById("socIgPosts");
    var fb = document.getElementById("socFb");
    var tw = document.getElementById("socTw");
    var yt = document.getElementById("socYt");
    if (ig) ig.value = s.instagram || "";
    if (igp) igp.value = s.igPosts || "";
    if (fb) fb.value = s.facebook || "";
    if (tw) tw.value = s.twitter || "";
    if (yt) yt.value = s.youtube || "";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      saveSocial({
        instagram: ig.value.trim(),
        igPosts: igp.value.trim(),
        facebook: fb.value.trim(),
        twitter: tw.value.trim(),
        youtube: yt.value.trim()
      });
      form.classList.remove("open");
      renderSocial();
    });
  }

  function renderHomeSocial() {
    var bar = document.getElementById("homeSocialBar");
    if (!bar) return;
    var s = loadSocial();
    bar.innerHTML =
      '<a class="social-pill ig" href="live.html#social"><i>IG</i> Instagram</a>' +
      '<a class="social-pill fb" href="live.html#social"><i>f</i> Facebook</a>' +
      '<a class="social-pill tw" href="live.html#social"><i>X</i> Twitter</a>' +
      '<a class="social-pill yt" href="live.html#social"><i>▶</i> YouTube</a>';
    if (s.instagram) bar.querySelector(".ig").href = s.instagram;
    if (s.facebook) bar.querySelector(".fb").href = s.facebook;
    if (s.twitter) bar.querySelector(".tw").href = s.twitter;
    if (s.youtube) bar.querySelector(".yt").href = s.youtube;
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderSocial();
    bindSocial();
    renderHomeSocial();
    if (location.hash === "#social") {
      var f = document.getElementById("socialComposer");
      if (f) f.classList.add("open");
    }
  });

  window.CeLive = { load: load, save: save, renderStoriesHome: renderStoriesHome };
})();
