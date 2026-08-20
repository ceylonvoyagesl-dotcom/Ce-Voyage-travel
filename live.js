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

  /* ---------- Live post links (copy / share / open) ---------- */
  /* Detect a social media post URL and build its embed */
  function detectSocial(url) {
    var u = String(url || "").trim();
    if (!u) return null;
    if (!/^https?:\/\//i.test(u)) u = "https://" + u.replace(/^\/+/, "");
    var m;
    m = u.match(/instagram\.com\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);
    if (m) {
      var kind = m[1].toLowerCase() === "reels" ? "reel" : m[1].toLowerCase();
      return { platform: "instagram", label: "Instagram", embed: "https://www.instagram.com/" + kind + "/" + m[2] + "/embed", post: "https://www.instagram.com/" + kind + "/" + m[2] + "/" };
    }
    m = u.match(/tiktok\.com\/[^?]*\/video\/(\d+)/i);
    if (m) return { platform: "tiktok", label: "TikTok", embed: "https://www.tiktok.com/embed/v2/" + m[1], post: u.split("?")[0] };
    m = u.match(/(?:youtu\.be\/|youtube\.com\/watch\?[^\s#]*v=|youtube\.com\/(?:shorts|embed)\/)([A-Za-z0-9_-]{6,})/i);
    if (m) return { platform: "youtube", label: "YouTube", embed: "https://www.youtube.com/embed/" + m[1], post: u.split("?")[0] };
    if (/(?:x\.com|twitter\.com)\/[^/]+\/status\/(\d+)/i.test(u)) {
      return { platform: "x", label: "X / Twitter", embed: "https://platform.twitter.com/embed/Tweet.html?id=" + u.match(/status\/(\d+)/i)[1] + "&theme=light&dnt=true", post: u.split("?")[0] };
    }
    if (/facebook\.com|fb\.watch/i.test(u)) {
      if (/\/videos?\//i.test(u)) {
        return { platform: "facebook", label: "Facebook video", embed: "https://www.facebook.com/plugins/video.php?href=" + encodeURIComponent(u) + "&show_text=true", post: u };
      }
      return { platform: "facebook", label: "Facebook post", embed: "https://www.facebook.com/plugins/post.php?href=" + encodeURIComponent(u) + "&show_text=true&width=500", post: u };
    }
    return null;
  }

  function socialEmbedHtml(p) {
    if (!p || p.kind !== "social") return null;
    var d = detectSocial(p.src || p.post || "");
    if (!d) return null;
    return {
      d: d,
      iframe: '<iframe class="embed ' + d.platform + '" src="' + d.embed + '" loading="lazy" scrolling="no" allowfullscreen allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"></iframe>'
    };
  }

  function postBaseUrl() {
    var page = location.pathname.split("/").pop() || "live.html";
    var here = location.href.split("#")[0];
    if (/^live\.html$/i.test(page)) return here;
    return here.replace(/[^/]*$/, "") + "live.html";
  }

  /* Encode the whole post into the link when it is small enough,
     so anyone opening the link sees the post (even on another device). */
  function encodePostPayload(p) {
    var src = p.src || "";
    if (/^data:/.test(src)) return null; /* phone-upload media is too big for a link */
    var slim = {
      id: p.id,
      kind: p.kind || "post",
      platform: p.platform || "",
      title: p.title || p.name || "",
      body: p.body || p.caption || "",
      type: p.type || "image",
      src: src,
      time: p.time || Date.now()
    };
    var json;
    try { json = JSON.stringify(slim); } catch (e) { return null; }
    if (!json || json.length > 2600) return null;
    try { return btoa(unescape(encodeURIComponent(json))); } catch (e) { return null; }
  }

  function postLink(p) {
    var enc = encodePostPayload(p);
    return postBaseUrl() + "#post=" + (enc ? "d" + enc : p.id);
  }

  function shareTargets(p) {
    var link = postLink(p);
    var text = p.title || p.name || "Ce Voyage — live from Sri Lanka";
    return {
      link: link,
      whatsapp: "https://wa.me/?text=" + encodeURIComponent(text + " — " + link),
      facebook: "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(link),
      x: "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text) + "&url=" + encodeURIComponent(link)
    };
  }

  function copyText(text, msg) {
    function ok() { toast(msg || "Link copied ✓"); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { document.execCommand("copy"); ok(); } catch (e) { window.prompt("Copy this link:", text); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, fallback);
    } else { fallback(); }
  }

  function toast(msg) {
    document.querySelectorAll(".cv-toast").forEach(function (t) { t.remove(); });
    var t = document.createElement("div");
    t.className = "cv-toast";
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("show"); });
    setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 350);
    }, 2400);
  }

  /* ---------- Manage posts (edit / delete) ---------- */
  var BUCKETS = ["posts", "blogs", "stories"];
  var editingId = null;

  /* Find a saved item (post / blog / story) by id */
  function findItem(data, id) {
    if (!id) return null;
    for (var b = 0; b < BUCKETS.length; b++) {
      var arr = data[BUCKETS[b]] || [];
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].id === id) return { bucket: BUCKETS[b], index: i, item: arr[i] };
      }
    }
    return null;
  }

  function isSaved(id) {
    return !!findItem(load(), id);
  }

  function itemKind(found) {
    if (!found) return "post";
    if (found.item.kind) return found.item.kind;
    if (found.bucket === "blogs") return "blog";
    if (found.bucket === "stories") return "story";
    return "post";
  }

  function composerEls() {
    return {
      form: document.getElementById("liveComposer"),
      kind: document.getElementById("liveKind"),
      title: document.getElementById("liveTitle"),
      body: document.getElementById("liveBody"),
      file: document.getElementById("liveFile"),
      submit: document.querySelector("#liveComposer button[type=submit]"),
      row: document.querySelector("#liveComposer .row")
    };
  }

  /* Open the composer pre-filled with an existing post */
  function startEdit(p) {
    var els = composerEls();
    if (!els.form) return;
    var data = load();
    var found = findItem(data, p.id);
    if (!found) { toast("⚠️ This post is not saved in this browser"); return; }
    var item = found.item;
    var kind = itemKind(found);
    editingId = item.id;

    if (els.kind) {
      if (kind === "social" && !els.kind.querySelector('option[value="social"]')) {
        var opt = document.createElement("option");
        opt.value = "social";
        opt.textContent = "Imported social post";
        opt.setAttribute("data-temp", "1");
        els.kind.appendChild(opt);
      }
      els.kind.value = kind;
      els.kind.disabled = true;
    }
    if (els.title) els.title.value = item.title || item.name || "";
    if (els.body) els.body.value = item.body || item.caption || "";
    if (els.file) {
      els.file.value = "";
      var fileLabel = els.file.parentNode;
      if (fileLabel && fileLabel.tagName === "LABEL") {
        fileLabel.style.display = kind === "social" ? "none" : "";
      }
    }
    if (els.submit) els.submit.textContent = "💾 Save changes";
    if (els.row && !document.getElementById("cancelEdit")) {
      var cancel = document.createElement("button");
      cancel.type = "button";
      cancel.id = "cancelEdit";
      cancel.className = "chip-btn";
      cancel.textContent = "Cancel";
      cancel.addEventListener("click", function () { exitEdit(true); });
      els.row.appendChild(cancel);
    }
    els.form.classList.add("open", "editing");
    closePostView();
    els.form.scrollIntoView({ behavior: "smooth", block: "center" });
    if (els.title) els.title.focus();
  }

  /* Leave edit mode and put the composer back to "Publish" */
  function exitEdit(reset) {
    var els = composerEls();
    editingId = null;
    if (!els.form) return;
    if (els.kind) {
      els.kind.disabled = false;
      var temp = els.kind.querySelector('option[data-temp="1"]');
      if (temp && temp.parentNode) temp.parentNode.removeChild(temp);
    }
    if (els.file) {
      var fileLabel = els.file.parentNode;
      if (fileLabel && fileLabel.tagName === "LABEL") fileLabel.style.display = "";
    }
    if (reset !== false) els.form.reset();
    if (els.submit) els.submit.textContent = "Publish";
    var cancel = document.getElementById("cancelEdit");
    if (cancel && cancel.parentNode) cancel.parentNode.removeChild(cancel);
    els.form.classList.remove("editing");
    if (reset !== false) els.form.classList.remove("open");
  }

  /* Save the edits back into localStorage */
  function saveEdit() {
    var els = composerEls();
    var data = load();
    var found = findItem(data, editingId);
    if (!found) { toast("⚠️ This post is not saved in this browser"); exitEdit(true); return; }
    var item = found.item;
    var title = els.title ? els.title.value.trim() : "";
    var body = els.body ? els.body.value.trim() : "";
    var file = els.file && els.file.files ? els.file.files[0] : null;

    item.title = title;
    item.name = title || item.name || "Ce Voyage";
    item.body = body;
    item.caption = body;

    function finish() {
      save(data);
      exitEdit(true);
      renderLivePage();
      renderStoriesHome();
      showPublishDone(item, true);
      toast("✅ Post updated");
    }

    /* Imported social posts keep their embed — only the caption changes */
    if (file && item.kind !== "social") {
      fileToDataUrl(file).then(function (url) {
        item.src = url;
        item.type = file.type.indexOf("video") === 0 ? "video" : "image";
        finish();
      });
    } else {
      finish();
    }
  }

  function deletePost(p) {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    var data = load();
    var found = findItem(data, p.id);
    if (!found) { toast("⚠️ This post is not saved in this browser"); return; }
    data[found.bucket].splice(found.index, 1);
    save(data);
    if (editingId === p.id) exitEdit(true);
    closePostView();
    var box = document.getElementById("publishDone");
    if (box) box.innerHTML = "";
    renderLivePage();
    renderStoriesHome();
    toast("🗑 Post deleted");
  }

  function actionRow(p) {
    var wrap = document.createElement("div");
    wrap.className = "post-actions";
    if (p.kind === "social") {
      var d = detectSocial(p.src || p.post || "");
      if (d) {
        var orig = document.createElement("a");
        orig.className = "mini-btn";
        orig.href = d.post;
        orig.target = "_blank";
        orig.rel = "noopener";
        orig.textContent = "↗ " + d.label;
        wrap.appendChild(orig);
      }
    }
    var view = document.createElement("button");
    view.type = "button";
    view.className = "mini-btn view";
    view.textContent = "👁 Open";
    view.addEventListener("click", function () { openPostView(p); });
    wrap.appendChild(view);
    var copy = document.createElement("button");
    copy.type = "button";
    copy.className = "mini-btn copy";
    copy.textContent = "🔗 Copy link";
    copy.addEventListener("click", function () { copyText(postLink(p)); });
    wrap.appendChild(copy);
    var s = shareTargets(p);
    var wa = document.createElement("a");
    wa.className = "mini-btn wa";
    wa.href = s.whatsapp;
    wa.target = "_blank";
    wa.rel = "noopener";
    wa.textContent = "WhatsApp";
    var fb = document.createElement("a");
    fb.className = "mini-btn fb";
    fb.href = s.facebook;
    fb.target = "_blank";
    fb.rel = "noopener";
    fb.textContent = "Facebook";
    wrap.appendChild(wa);
    wrap.appendChild(fb);
    if (navigator.share) {
      var sh = document.createElement("button");
      sh.type = "button";
      sh.className = "mini-btn share";
      sh.textContent = "↗ Share";
      sh.addEventListener("click", function () {
        navigator.share({ title: p.title || "Ce Voyage", text: p.body || p.caption || "", url: postLink(p) }).catch(function () {});
      });
      wrap.appendChild(sh);
    }
    /* Manage: edit / delete — only for posts saved in this browser */
    if (p && p.id && isSaved(p.id)) {
      var ed = document.createElement("button");
      ed.type = "button";
      ed.className = "mini-btn edit";
      ed.textContent = "✏️ Edit";
      ed.addEventListener("click", function () { startEdit(p); });
      wrap.appendChild(ed);
      var del = document.createElement("button");
      del.type = "button";
      del.className = "mini-btn del";
      del.textContent = "🗑 Delete";
      del.addEventListener("click", function () { deletePost(p); });
      wrap.appendChild(del);
    }
    return wrap;
  }

  function openPostView(p) {
    closePostView();
    var v = document.createElement("div");
    v.className = "post-viewer";
    v.id = "postViewer";
    var media = "";
    var soc = socialEmbedHtml(p);
    if (soc) {
      media = soc.iframe;
    } else if (p.src && p.type === "video") media = '<video src="' + p.src + '" controls playsinline></video>';
    else if (p.src) media = '<img alt="" src="' + p.src + '"/>';
    v.innerHTML =
      '<button class="close" type="button" aria-label="Close">×</button>' +
      '<div class="pv-card"><div class="pv-media">' + media + "</div>" +
      '<div class="pv-body">' +
      '<div class="feed-meta">' + (p.kind === "blog" ? "Blog" : p.kind === "story" ? "Story" : soc ? soc.d.label : "Live update") + " · " + new Date(p.time || Date.now()).toLocaleString() + "</div>" +
      "<h2>" + escapeHtml(p.title || p.name || "Update") + "</h2>" +
      "<p>" + escapeHtml(p.body || p.caption || "") + "</p>" +
      '<div class="pv-actions"></div>' +
      '<a class="pv-site" href="index.html">Ce Voyage — Home →</a>' +
      "</div></div>";
    document.body.appendChild(v);
    v.querySelector(".pv-actions").appendChild(actionRow(p));
    v.querySelector(".close").addEventListener("click", closePostView);
    v.addEventListener("click", function (e) { if (e.target === v) closePostView(); });
    document.addEventListener("keydown", escClosePost);
    document.body.style.overflow = "hidden";
  }
  function escClosePost(e) { if (e.key === "Escape") closePostView(); }
  function closePostView() {
    var v = document.getElementById("postViewer");
    if (v && v.parentNode) v.parentNode.removeChild(v);
    document.removeEventListener("keydown", escClosePost);
    document.body.style.overflow = "";
  }

  /* Open #post=... links (from social media) */
  function handlePostLink() {
    var m = location.hash.match(/#post=([A-Za-z0-9_+=/-]+)/);
    if (!m) return;
    var tok = m[1];
    if (tok.charAt(0) === "d") {
      try {
        var p = JSON.parse(decodeURIComponent(escape(atob(tok.slice(1).replace(/-/g, "+").replace(/_/g, "/")))));
        if (p && (p.title || p.body || p.src)) { openPostView(p); return; }
      } catch (e) {}
    }
    var data = load();
    var all = (data.posts || []).concat(data.blogs || []).concat(data.stories || []);
    var found = null;
    for (var i = 0; i < all.length; i++) if (all[i].id === tok) { found = all[i]; break; }
    if (found) { openPostView(found); return; }
    var main = document.querySelector(".live-page main") || document.querySelector("main");
    if (main) {
      var note = document.createElement("div");
      note.className = "post-notfound";
      note.innerHTML = "⚠️ This post is not saved in this browser. Open the link on the device the post was uploaded from.";
      main.insertBefore(note, main.firstChild);
    }
  }

  function showPublishDone(item, edited) {
    var box = document.getElementById("publishDone");
    if (!box) return;
    box.innerHTML = "";
    var localOnly = item.src && /^data:/.test(item.src);
    var card = document.createElement("div");
    card.className = "publish-done";
    card.innerHTML =
      (edited
        ? "<strong>✅ Post updated!</strong> Old links keep the old version — copy the link again:"
        : "<strong>✅ Post is live!</strong> This is the link to this post — copy it and share it on social media:") +
      '<div class="post-link-box"><input readonly value="' + postLink(item).replace(/"/g, "&quot;") + '"/><button type="button" class="mini-btn copy">🔗 Copy</button></div>' +
      '<div class="row-actions"></div>' +
      (localOnly ? '<p class="note">ℹ️ A photo uploaded from your phone is stored on this device only, so the link will not show it in other browsers. Use a photo URL if you need a link everyone can see.</p>' : "");
    box.appendChild(card);
    card.querySelector(".post-link-box .copy").addEventListener("click", function () { copyText(postLink(item)); });
    card.querySelector(".row-actions").appendChild(actionRow(item));
    card.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* "+ Social post" — import a social media post link into the Live feed */
  function bindSocialPost() {
    var form = document.getElementById("socialPostComposer");
    var open = document.getElementById("openSocialPost");
    if (open && form) open.addEventListener("click", function () { form.classList.toggle("open"); });
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var urlEl = document.getElementById("spUrl");
      var capEl = document.getElementById("spCaption");
      var url = urlEl ? urlEl.value.trim() : "";
      var cap = capEl ? capEl.value.trim() : "";
      var d = detectSocial(url);
      if (!d) {
        toast("⚠️ Link not recognised — paste an Instagram / Facebook / YouTube / TikTok / X post link");
        return;
      }
      var data = load();
      var item = {
        id: "sp" + Date.now(),
        kind: "social",
        platform: d.platform,
        title: cap || d.label + " post",
        body: cap || "",
        caption: cap,
        type: "embed",
        src: d.post,
        time: Date.now()
      };
      data.posts.unshift(item);
      save(data);
      form.reset();
      form.classList.remove("open");
      renderLivePage();
      showPublishDone(item);
      toast("✅ " + d.label + " post added to the feed");
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
      var soc = socialEmbedHtml(p);
      if (soc) {
        media = soc.iframe;
      } else if (p.src) {
        media = p.type === "video"
          ? '<video src="' + p.src + '" controls playsinline></video>'
          : '<img alt="" src="' + p.src + '"/>';
      }
      var meta = soc
        ? '<span class="pf ' + soc.d.platform + '">' + soc.d.label + "</span> · " + new Date(p.time).toLocaleString()
        : "Live update · " + new Date(p.time).toLocaleString();
      el.innerHTML = media + '<div class="feed-body"><div class="feed-meta">' + meta + "</div><h3>" + escapeHtml(p.title || "Update") + "</h3><p>" + escapeHtml(p.body || "") + "</p></div>";
      var pbody = el.querySelector(".feed-body");
      if (pbody) pbody.appendChild(actionRow(p));
      feed.appendChild(el);
    });

    if (blogs) {
      blogs.innerHTML = "";
      data.blogs.slice().sort(function (a, b) { return b.time - a.time; }).forEach(function (p) {
        var el = document.createElement("article");
        el.className = "feed-card blog-card";
        el.innerHTML = '<div class="feed-meta">Blog</div><h3>' + escapeHtml(p.title) + "</h3><p>" + escapeHtml(p.body) + "</p>";
        el.appendChild(actionRow(p));
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
  var currentStoryItem = null;
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
    currentStoryItem = s;
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
    if (!form || form.getAttribute("data-bound") === "1") return;
    form.setAttribute("data-bound", "1");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (editingId) { saveEdit(); return; }
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
        showPublishDone(item);
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
    handlePostLink();
    bindSocialPost();
    var openBtn = document.getElementById("openComposer");
    var form = document.getElementById("liveComposer");
    if (openBtn && form) {
      openBtn.addEventListener("click", function () {
        if (editingId) { exitEdit(true); return; }
        form.classList.toggle("open");
      });
    }
    if (location.hash === "#upload" && form) form.classList.add("open");
    if (location.hash === "#socialpost") {
      var spf = document.getElementById("socialPostComposer");
      if (spf) spf.classList.add("open");
    }
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
    var storyShare = document.getElementById("storyShare");
    if (storyShare) storyShare.addEventListener("click", function () {
      if (currentStoryItem) copyText(postLink(currentStoryItem), "Story link copied ✓");
    });
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
      ? '<div class="ig-grid">' + igLines.slice(0, 6).map(function (u) {
          var src = igEmbedSrc(u);
          return src ? '<iframe src="' + src + '" loading="lazy" allowtransparency="true"></iframe>' : "";
        }).join("") + "</div>"
      : '<div class="empty">Add an Instagram post / Reel link under Connect social. The profile link opens your page.</div>';

    var fbHtml = s.facebook
      ? '<iframe src="https://www.facebook.com/plugins/page.php?href=' + encodeURIComponent(s.facebook) + '&tabs=timeline&width=500&height=520&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false" loading="lazy" allow="encrypted-media"></iframe>'
      : '<div class="empty">Add your Facebook page URL — the timeline appears here.</div>';

    var user = twUser(s.twitter);
    var twHtml = user
      ? '<a class="twitter-timeline" data-height="520" href="https://twitter.com/' + encodeURIComponent(user) + '">Tweets by @' + escapeHtml(user) + "</a>"
      : '<div class="empty">Add your X / Twitter profile URL.</div>';

    var yt = ytEmbed(s.youtube);
    var ytHtml = yt
      ? '<iframe src="' + yt + '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      : '<div class="empty">Add a YouTube video, playlist or @channel.</div>';

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
