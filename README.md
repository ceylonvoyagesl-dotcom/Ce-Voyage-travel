# Ce Voyage — Sri Lanka Travel Guide Website

Premium bilingual (FR / EN) travel **information centre** for Sri Lanka.

## Structure

```
CeVoyage_Website/
├── index.html              # Homepage
├── styles.css              # Design system
├── config.js               # Brand, contacts, map data
├── content.js              # FR / EN strings
├── app.js                  # UI logic, map, forms, i18n
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

## Next pages (build one by one)

1. Home — done  
2. Region / destination detail pages (images, activities, “Add to trip”)  
3. Experiences pages  
4. Travel Guide (weather, transport, culture)  
5. Trip planner / cart  
6. Link 10-Day Tour PDFs + transport form  

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
