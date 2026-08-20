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
    var openBtn = document.getElementById("openComposer");
    var form = document.getElementById("liveComposer");
    if (openBtn && form) {
      openBtn.addEventListener("click", function () { form.classList.toggle("open"); });
    }
    if (location.hash === "#upload" && form) form.classList.add("open");
    var close = document.getElementById("storyClose");
    if (close) close.addEventListener("click", closeStory);
    var next = document.getElementById("storyNext");
    var prev = document.getElementById("storyPrev");
    if (next) next.addEventListener("click", function () { storyIdx += 1; showStory(); });
    if (prev) prev.addEventListener("click", function () { storyIdx = Math.max(0, storyIdx - 1); showStory(); });
  });

  window.CeLive = { load: load, save: save, renderStoriesHome: renderStoriesHome };
})();
