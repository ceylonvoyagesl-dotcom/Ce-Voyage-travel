# 🇱🇰 Ce Voyage Website — සම්පූර්ණ සිංහල Guide

මේ guide එකෙන් ඔයාට පුළුවන්:
1. Website එක ඉතිරි ටික හදන්න (image, video, page information add කරන්න)
2. Files මොනවද, මොකක්ද කරන්නේ කියලා තේරුම් ගන්න

---

## 1. Website එකේ Files ටික — මොකක්ද මොකක්ද කරන්නේ?

| File එක | කරන්නේ මොකක්ද |
|---|---|
| `index.html` | **Homepage** — hero video slides, featured places, map, contact form |
| `styles.css` | මුළු site එකේම design (colours, fonts, layout) |
| `config.js` | **Contact info + brand** — phone, WhatsApp, email, address, map |
| `content.js` | භාෂා 6ක text (EN, FR, RU, TR, DE, AR) |
| `app.js` | Homepage එකේ logic (slideshow, search, map, form) |
| `places-data.js` | ⭐ **හැම තැනකම information** — 23 places වල data |
| `places/` folder | ⭐ එක එක place එකට **page එක බැගින්** (ella.html, kandy.html...) |
| `place-app.js` | Trip card ("Add to trip" cart) logic |
| `place.css` | Place pages වල design |
| `images/` folder | Local images (anuradhapura, arugam-bay + homepage backgrounds) |

**රන් නීතිය (Golden rule):** ඔයා මොනවා add කළත් මේ තැන් 3න් එකක් වෙනස් වෙනවා:
- **Image/video/දත්ත** → `places-data.js` හෝ `index.html`
- **Design** → `styles.css`
- **Contact info** → `config.js`

---

## 2. 🖼️ IMAGE ADD කරන හැටි

### ක්රමය A — Internet එකෙන් (ලේසිම ක්රමය)

1. [unsplash.com](https://unsplash.com) හෝ [pexels.com](https://www.pexels.com) යන්න (free, login ඕන නෑ)
2. ඕන photo එකක් click කරන්න → **Copy image URL** කරන්න
3. ඒ URL එක `places-data.js` එකේ `"hero"` හෝ `"gallery"` එකට paste කරන්න

**Tip:** URL එකේ අගට `?auto=format&fit=crop&w=1600&q=80` දාන්න (size හරි වෙන්න).

### ක්රමය B — ඔයාගේම Photo (offline වැඩ, විශ්වාසදායකම ක්රමය)

මේක දැනටමත් **Anuradhapura** සහ **Arugam Bay** වලට කරලා තියෙනවා — ඒ විදිහටම කරන්න:

**Step 1:** `images/` folder එක ඇතුළේ place එකේ නමින් folder එකක් හදන්න:
```
images/
└── ella/
    ├── 01-hero.jpg   ← විශාල main photo (1600px+ wide)
    ├── 02.jpg
    ├── 03.jpg
    └── 04.jpg        ← gallery photos (1000px wide ඇති)
```

**Step 2:** `places-data.js` open කරලා place එක හොයාගෙන මේ විදිහට වෙනස් කරන්න:

```js
"ella": {
  "id": "ella",
  "name": "Ella",
  ...
  "hero": "../images/ella/01-hero.jpg",       // ← local file එක
  "gallery": [
    "../images/ella/02.jpg",
    "../images/ella/03.jpg",
    "../images/ella/04.jpg"
  ],
```

> ⚠️ **වැදගත්:** path එක `../images/` කියලා **ඉස්සරහට `../` දාන්නම ඕන** — මොකද place pages තියෙන්නේ `places/` folder එක ඇතුළේ නිසා. (Arugam Bay entry එකේ විදිහ බලන්න — හරියටම ඒ විදිහ.)

**Image size guide:**
- Hero photo → **1600–1800px** wide, JPG, 300KB ට අඩු
- Gallery/card photo → **800–1000px** wide, JPG, 200KB ට අඩු
- Large photos site එක slow කරනවා — [tinypng.com](https://tinypng.com) වලින් compress කරන්න

### Homepage Featured Cards වල image වෙනස් කරන්න

`index.html` open කරන්න → `featuredTrack` section එක හොයන්න (~line 1035). එක card එකක් මේ වගේ:

```html
<article class="feature-card" data-searchable="ella hill">
<a class="feature-card-link" href="places/ella.html">
<img alt="Ella" src="https://images.unsplash.com/photo-1566766189268-ecac9118f2b7?..."/>
```

`src="..."` එක ඔයාගේ photo එකේ path/URL එකෙන් replace කරන්න. (Homepage එක root එකේ නිසා local file නම් `images/ella/01-hero.jpg` කියලා **`../` නැතුව** දාන්න.)

### Homepage background slideshow

`index.html` ~line 1017, මේ 4 lines:
```html
<div class="featured-bg-slide is-active" style="background-image:url('images/slide-city.jpg')"></div>
```
`images/` folder එකට අලුත් photo දාලා, `slide-*.jpg` කියන names replace කරන්න. (ඔයාගේම නමක් දැම්මත් කමක් නෑ — path එක හරි වෙන්න ඕන.)

---

## 3. 🎬 VIDEO ADD කරන හැටි

### ක්රමය A — Homepage Hero Video (cinema slides)

Homepage එකේ උඩම විශාල video slides 4ක් තියෙනවා — `index.html` ~line 913:

```html
<video class="cinema-video" muted loop playsinline preload="metadata"
       poster="https://images.unsplash.com/photo-1588598198321-9735fd52455b?...">
  <source src="https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4" type="video/mp4"/>
</video>
```

Video එක වෙනස් කරන්න:
1. [pexels.com/videos](https://www.pexels.com/videos) යන්න → video එකක් download/URL copy කරන්න
2. `src="..."` එක replace කරන්න
3. `poster="..."` එකටත් ඒ video එකට ගැළපෙන photo URL එකක් දාන්න

### ක්රමය B — Place Page එකකට Video add කරන්න (අලුත්)

දැන් place pages වල video support නෑ — මේක add කරන්න ලේසියි.

**Step 1:** `places-data.js` එකේ place එකට මේ 2 lines add කරන්න (`"nearby"` එකට කලින්):

```js
"video": "https://videos.pexels.com/video-files/2169880/2169880-uhd_2560_1440_30fps.mp4",
"videoPoster": "https://images.unsplash.com/photo-1566766189268-ecac9118f2b7?auto=format&fit=crop&w=1200&q=80",
```

**Step 2:** Place page එකේ (උදා: `places/ella.html`) Gallery section එකට පස්සේ මේ block එක paste කරන්න:

```html
<h2 class="place-section-title" id="videoTitle" style="display:none">Video</h2>
<div id="placeVideoWrap" style="display:none;margin-bottom:40px">
  <video id="placeVideo" controls playsinline preload="none"
         style="width:100%;border-radius:18px;background:#000"></video>
</div>
```

**Step 3:** ඒම page එකේම පහළ තියෙන `<script>` block එකේ, gallery render කරන කොටසට පස්සේ මේක add කරන්න:

```js
// --- Video ---
var vw = document.getElementById("placeVideoWrap");
var vt = document.getElementById("videoTitle");
if (vw && vt && p.video) {
  vt.style.display = "";
  vw.style.display = "";
  var v = document.getElementById("placeVideo");
  v.setAttribute("poster", p.videoPoster || p.hero);
  var s = document.createElement("source");
  s.src = p.video;
  s.type = "video/mp4";
  v.appendChild(s);
}
```

Video නැති places වලට මේක කරේ නෑ — හැම page එකකටම script එක paste කරාට කමක් නෑ.

### ක්රමය C — YouTube Video embed කරන්න

ඕනම page එකකට මේක paste කරන්න (place page නම් gallery ට පස්සේ):

```html
<div style="position:relative;padding-top:56.25%;border-radius:18px;overflow:hidden;margin:20px 0">
  <iframe src="https://www.youtube.com/embed/VIDEO_ID"
          title="Ella video" style="position:absolute;inset:0;width:100%;height:100%"
          allowfullscreen loading="lazy"></iframe>
</div>
```

`VIDEO_ID` වෙනුවට YouTube link එකේ අග තියෙන code එක දාන්න (උදා: `watch?v=AbCdEf123` → `AbCdEf123`).

---

## 4. 📝 PAGE INFORMATION add කරන හැටි

### A) තියෙන Place එකක info වෙනස් කරන්න → `places-data.js` open කරන්න

එක place එකක block එක මේ වගේ — හැම field එකක්ම තේරෙන සිංහලෙන්:

```js
"ella": {
  "id": "ella",                              // URL එකේ නම — වෙනස් කරන්න එපා
  "name": "Ella",                            // Page එකේ උඩම ලොකු නම
  "region": "Uva Province",                  // Region එක
  "tag": "Hill Country",                     // කුඩා label එක (Heritage/Coast/...)
  "tagline": "Tea hills, train tracks...",   // නමට යටින් එන කෙටි වැකිය
  "hero": "...",                             // උඩම විශාල photo එක
  "gallery": [ ... ],                        // Photo list එක
  "summary": "...",                          // Intro paragraph එක
  "highlights": [                            // Bullet points 4ක්
    "Walk to Nine Arch Bridge...",
    ...
  ],
  "bestTime": "January – September",         // යන්න හොඳම කාලය
  "duration": "1–2 days",                    // කොච්චර වෙලාවක් ඕනද
  "activities": [                            // ⭐ Activities list — trip card එකට add වෙන්නේ මේවා
    { "id": "ella-nine", "name": "Nine Arch Bridge Walk", "type": "Nature", "duration": "2 hrs" },
    ...
  ],
  "nearby": [ "kandy", "sigiriya" ]          // Nearby places — id වලින් දාන්න
}
```

Activity එකක් add කරන්න නම් `activities` list එකට අලුත් `{...}` block එකක් දාන්න. `id` එක unique වෙන්න ඕන (උදා: `"ella-waterfall"`).

### B) අලුත් Place Page එකක් හදන්න — පියවර 5යි

**Step 1 — Page එක copy කරන්න:**
`places/mirissa.html` copy කරලා `places/unawatuna.html` කියලා නම දෙන්න (ඕනම තියෙන page එකකින් කරන්න පුළුවන්).

**Step 2 — HTML head එකේ 3 තැනක් වෙනස් කරන්න:**

```html
<!-- line 6: meta description -->
<meta name="description" content="Ce Voyage — Unawatuna, Sri Lanka travel guide..."/>

<!-- line 7: title -->
<title>Unawatuna | Ce Voyage Sri Lanka</title>

<!-- body tag එකේ: page ID එක -->
<body class="place-page" data-place-id="unawatuna">
```

**Step 3 — `places-data.js` එකට block එකක් add කරන්න:** ඉහළ "ella" block එකක් copy කරලා අන්තිමට paste කරලා, fields ටික unawatuna වලට වෙනස් කරන්න (`"id": "unawatuna"` කියලා නම හරියටම HTML එකේ `data-place-id` එකට match වෙන්න ඕන).

**Step 4 — `config.js` map එකට add කරන්න (ඕන නම්):**
```js
{ name: "Unawatuna", lat: 6.0080, lng: 80.2485, type: "coast", desc: "Palm-fringed beach" }
```

**Step 5 — Homepage එකට card එකක් add කරන්න (ඕන නම්):** `index.html` featured track එකේ තියෙන card එකක් copy කරලා name/image/link ටික වෙනස් කරන්න.

> ✅ `places/index.html` එක **automatic** — `places-data.js` එකට add කරපු ගමන් ඒ list එකටත් එනවා. මුකුත් කරන්න ඕන නෑ!

### C) Contact info වෙනස් කරන්න → `config.js`

```js
whatsappFrance: "+33744284269",   // WhatsApp number
whatsappSriLanka: "+94776655493",
email: "ceylonvoyage.sl@gmail.com",
addressFrance: "8 rue Estienne d'Orves, ...",
mapCenter: [7.8731, 80.7718],     // map එකේ centre එක
```

### D) භාෂා වල text වෙනස් කරන්න → `content.js`

`I18N.en.heroTitleOne = "Discover Sri Lanka,"` වගේ — English වෙනස් කරන්න `en:` block එක, French වෙනස් කරන්න `fr:` block එක. කෙටි text නම් `data-i18n="..."` tag එක තියෙන තැන් index.html එකේ බලන්න.

---

## 5. ✅ වෙනස් කරපු ගමන්ම CHECK කරන විදිහ (මේක අත්හරින්න එපා!)

**Local preview:**
1. Project folder එකේ Terminal open කරන්න (Windows: folder එකේ right-click → "Open in Terminal"; Mac: cd path)
2. මේක type කරන්න:
```bash
python3 -m http.server 8080
```
3. Browser එකේ `http://localhost:8080` යන්න
4. වෙනස්කම් බලන්න page එක refresh කරන්න (Ctrl+Shift+R / Cmd+Shift+R — cache නැතුව)

**වැරදි හොයන්න:** Browser එකේ **F12** → Console tab එක. Red error messages තියෙනවද බලන්න. "Not Found" errors නම් — photo path එක වැරදියි.

**Publish:** GitHub Pages වලට දාන විදිහ `DEPLOY.md` file එකේ තියෙනවා — ගොඩක් සරලයි.

---

## 6. 🚀 Website එක ඉතිරි ටික හදන Order එක (Roadmap)

README.md එකේ තියෙන plan එක:

1. ✅ Home — done
2. ⬜ Place pages වලට videos add කරන්න (ඉහළ ක්රමය B)
3. ⬜ අලුත් places add කරන්න (Step 4B) — උදා: Unawatuna, Bentota, Pinnawala...
4. ⬜ Travel Guide page එකක් (weather, transport, culture)
5. ⬜ Trip planner / cart එක improve කරන්න
6. ⬜ 10-Day Tour PDFs + transport form

**දවසකට එකක් කරන්න plan:**
- අද: Place 3කට videos + images
- හෙට: අලුත් places 2ක් (Unawatuna, Bentota)
- ඊළඟ: Travel Guide page එක

---

## 7. 🧾 කෙටි Checklist එක (copy කරලා තියාගන්න)

**Image add කරද්දී:**
- [ ] Photo එක `images/<place>/` folder එකේ (local නම්)
- [ ] `places-data.js` එකේ path එක `../images/...` වලින් පටන් ගන්නවා
- [ ] Homepage එකේ නම් `images/...` (../ නැතුව)
- [ ] F12 Console එකේ errors නෑ
- [ ] Mobile එකෙත් (phone එකෙන්) බැලුවා

**Video add කරද්දී:**
- [ ] MP4 link එක direct (.mp4 වලින් ඉවරයි)
- [ ] Poster image එකකුත් දැම්මා
- [ ] Page load වෙනකම් video download වෙන්නේ නෑ (`preload="none"`)

**අලුත් page එකක් හදද්දී:**
- [ ] `data-place-id` + places-data.js `"id"` — දෙකම එකයි
- [ ] `<title>` + meta description වෙනස් කළා
- [ ] Nearby links වල ids නිවැරදියි
- [ ] Homepage card එකෙන් link එක වැඩ (`places/xxx.html`)

**Upload කරන්න කලින්:**
- [ ] Local preview එකේ හැම පිටුවක්ම බැලුවා
- [ ] Sinhala/English/Tamil අකුරු කැඩිලා නෑ (UTF-8)
- [ ] `git add . && git commit && git push`

---

## 8. 🔴 LIVE Page එක — Post link copy කරලා Social Media වලට දාන හැටි

Live page එකේ (`live.html`) post එකක් publish කරාම **ඒ post එකටම වෙනම link එකක්** හැදෙනවා.

### වැඩ කරන විදිහ
1. `live.html` → **+ Upload** → post එකක් හදලා **Publish** කරන්න
2. Publish කරාම පස්සේ මතක තියාගන්නවා: **"✅ Post live වුණා!"** panel එකක් එනවා — ඒකේ තමයි ඒ post එකේ link එක
3. **🔗 Copy** බටන් එකෙන් link එක copy කරලා Facebook / WhatsApp / Instagram bio වලට දාන්න
4. Feed එකේ එක එක post card එක යටත් **🔗 Copy link / WhatsApp / Facebook / 👁 Open** බටන් තියෙනවා
5. Story එකක් open කරලා පහළ දකුණු කෙළවරේ **🔗 Copy link** එකෙන් story link එකත් copy කරන්න පුළුවන්
6. Link එක open කරාම post එක **විශාල viewer** එකකින් පේනවා (+ Ce Voyage ලින්කුවකුත් එක්කම)

### වැදගත් — link වර්ග 2ක් තියෙනවා
| Post වර්ගය | Link එක වැඩ කරන්නේ |
|---|---|
| Text post / Internet photo URL එකක් තියෙන post | **හැමෝටම** වැඩ කරනවා (post data ම link එක ඇතුළේම encode වෙලා තියෙනවා) |
| Phone එකෙන් upload කරපු photo/video | ඒ upload කරපු **browser එකේ විතරයි** වැඩ කරන්නේ (photo එක device එකේ save වෙලා තියෙන නිසා) |

**Tip:** හැමෝටම පේන post එකක් ඕන නම් — photo එක internet URL එකකින් (unsplash/pexels) දාන්න, phone upload එකෙන් නෙමෙයි.

**සටහන:** Posts ඔයාගේ browser එකේ save වෙනවා (localStorage). ඒ නිසා phone එකේ දාපු post එකක් අනිත් browser එකක පේන්නේ නෑ — ඒත් link එකේ data encode වෙලා තියෙන නිසා බොහෝ posts හැම තැනම වැඩ කරනවා.

### 📱 Social media post එකක් website feed එකට එන්න (Import)
1. Instagram / Facebook / YouTube / TikTok / X එකේ ඔයාගේ post එකේ **link එක copy** කරන්න
2. `live.html` → **+ Social post** → link එක paste කරලා caption එකක් දාන්න (optional) → **Add to feed**
3. ඒ post එක **Live feed එකට කෙලින්ම එනවා** — original post එකම embed වෙලා (play කරන්නත් පුළුවන්)
4. Platform badge එකකුත් එනවා (Instagram / Facebook / YouTube / TikTok / X) + "↗ Instagram" වගේ button එකකින් original post එකට යන්න පුළුවන්
5. ඒ card එකටත් **🔗 Copy link** එකෙන් website link එක copy කරන්න පුළුවන්

**සටහන:** මේක fully automatic නෙමෙයි (API keys + server එකක් ඕන නිසයි) — ඒත් seconds දෙකයි වැඩේ: social එකේ post කරලා link එක paste කරන එක විතරයි. Connect social එකේ page timelines (Facebook page / X / YouTube channel) automatic update වෙනවා.
