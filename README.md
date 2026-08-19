# Ce Voyage — Sri Lanka Travel Guide Website

Premium bilingual (FR / EN) travel **information centre** for Sri Lanka.

## Structure

```
CeVoyage_Website/
├── index.html              # Homepage
├── guide.html              # Travel Guide (weather, transport, culture…)
├── tours.html              # 10-Day Tour + booking form → WhatsApp / PDF
├── trip.html               # Trip planner (saved items cart)
├── styles.css              # Design system
├── config.js               # Brand, contacts, map data
├── content.js              # FR / EN strings
├── app.js                  # UI logic, map, forms, i18n
├── place-app.js            # Place pages: video player + trip cart
├── places/                 # 22 destination pages + index
├── places-data.js          # All places, activities, images & videos
├── images/                 # Local photos (backgrounds + per-place folders)
├── ce-voyage-logo.webp     # Official logo (transparent) — header
├── ce-voyage-logo-lg.webp  # Larger logo — contact / footer
├── ce-voyage-logo.png      # Master transparent PNG
└── README.md
```

## Product direction (toward Travel OS)

1. **Information centre** covering the whole of Sri Lanka  
2. Explore places with **images + videos**  
3. Each place → related **activities / experiences**  
4. User can “shop” places & activities into a **trip card / cart** (planner)  
5. Lead forms + WhatsApp already wired for France / Sri Lanka  

## Homepage features

- Official logo (background removed)
- Fixed glass header + language switch (FR / EN)
- Hero, featured places, region filters, experiences
- Interactive map (Leaflet)
- Contact + lead form → WhatsApp
- Floating WhatsApp button

## Pages status

1. ✅ Home — hero videos, featured places, map, contact  
2. ✅ 22 destination detail pages — images, activities, “Add to trip” + **videos**  
3. ✅ Travel Guide — `guide.html` (weather, transport, culture, money, visas)  
4. ✅ Trip planner — `trip.html` (saved items → WhatsApp)  
5. ✅ 10-Day Tour — `tours.html` (itinerary, booking form → WhatsApp, Print/Save as PDF)  
6. ⬜ Experiences deep pages  
7. ⬜ 10-Day Tour PDFs as downloadable files  

## Brand

| Token  | Hex       |
|--------|-----------|
| Forest | `#0a3d33` |
| Deep   | `#072a24` |
| Leaf   | `#14765d` |
| Gold   | `#d5aa56` |
| Sand   | `#f3ecdf` |

Contacts: WhatsApp FR +33 7 44 28 42 69 · SL +94 77 66 55 493 · ceylonvoyage.sl@gmail.com

## Languages

| Code | Language | Direction |
|------|----------|-----------|
| en | English (default) | LTR |
| fr | Français | LTR |
| ru | Русский | LTR |
| tr | Türkçe | LTR |
| de | Deutsch | LTR |
| ar | العربية | RTL |

Language preference is saved in `localStorage` (`cevoyage-lang`).

## Host on GitHub Pages

1. Create a **public** GitHub repository (e.g. `ce-voyage-website`).
2. Upload all files from this folder to the **root** of the repo (or `/docs`).
3. Repo → **Settings → Pages**
   - Source: **Deploy from a branch**
   - Branch: `main` (root) or `main` / `docs`
4. Save — site URL will be:
   `https://YOUR_USERNAME.github.io/ce-voyage-website/`

Optional custom domain: Settings → Pages → Custom domain → `www.ce-voyage.com`

```bash
# Local preview before push
cd CeVoyage_Website
python3 -m http.server 8080
```
