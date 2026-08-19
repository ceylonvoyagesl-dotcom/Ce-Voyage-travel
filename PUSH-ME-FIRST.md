# 🌍 Ce Voyage — Travel Website Repository Guide

> **Official Live Website URL:** [https://ceylonvoyagesl-dotcom.github.io/Ce-Voyage-travel/](https://ceylonvoyagesl-dotcom.github.io/Ce-Voyage-travel/)  
> **Brand:** Ce Voyage — *Journeys Beyond Borders*  
> **Contact (France):** +33 7 44 28 42 69  
> **Contact (Sri Lanka):** +94 77 66 55 493  
> **Email:** ceylonvoyage.sl@gmail.com  

---

## 📌 සිංහල සාරාංශය (Quick Sinhala Overview)

Ce Voyage වෙබ් අඩවියේ සම්පූර්ණ source code එක සහ assets මෙම repository එකෙහි ඇතුළත් වේ. 
- GitHub Pages හරහා වෙබ් අඩවිය සජීවීව (Live) ක්‍රියාත්මක වේ: `https://ceylonvoyagesl-dotcom.github.io/Ce-Voyage-travel/`
- ඔබ යම් වෙනස්කමක් සිදු කර `main` branch එකට push / merge කළ විට GitHub Pages ස්වයංක්‍රීයව (automatically) තත්පර කිහිපයකින් යාවත්කාලීන වේ.
- Local පරිගණකයක බලන්නේ නම් ZIP extract කර `index.html` double click කරන්න හෝ `python3 -m http.server 8080` run කරන්න.

---

## 📂 Repository File Structure

```text
Ce-Voyage-travel/
├── index.html                 # Main Homepage (Hero, Leaflet Map, Filterable Destinations, FAQ, Reviews)
├── guide.html                 # Comprehensive Travel Guide (Weather, Transport, Culture, Visas, Health)
├── tours.html                 # 10-Day Classic Tour Package (Interactive Itinerary, WhatsApp Bookings, PDF download)
├── trip.html                  # Interactive Trip Planner (Saved destination cart, Custom Notes, WhatsApp export)
├── styles.css                 # Master modern responsive stylesheet
├── app.js                     # Homepage logic, interactive map, filters, search, animations
├── config.js                  # Central configuration (Phone numbers, WhatsApp, Email, Map coordinates)
├── content.js                 # Multilingual & marketing content
├── places-data.js             # Data source for all 22 destinations (images, videos, tags, coordinates)
├── place-app.js               # Logic for individual destination pages + video player fallback + trip cart
├── place.css                  # Specific stylesheet for destination detail pages
├── experiences-app.js         # Logic for themed experience pages
│
├── places/                    # 22 Dedicated Destination Pages
│   ├── index.html             # All places catalog / directory
│   ├── colombo.html, sigiriya.html, ella.html, galle.html, kandy.html, yala.html, ...
│   └── anuradhapura.html, arugam-bay.html, dambulla.html, mirissa.html, trincomalee.html, ...
│
├── experiences/               # 6 Themed Experience Pages
│   ├── index.html             # Experiences Overview
│   ├── heritage.html          # Cultural & Historical Heritage
│   ├── wildlife.html          # Safari, Leopards, Elephants & Marine Life
│   ├── beaches.html           # Tropical Coastlines & Surfing
│   ├── adventure.html         # Hiking, Rafting & Train Rides
│   ├── wellness.html          # Ayurveda, Yoga & Mountain Retreats
│   └── food.html              # Ceylon Tea, Street Food & Spice Trails
│
├── pdfs/                      # Downloadable Tour Itinerary Brochures
│   ├── ce-voyage-10-day-classic-tour-en.pdf  # English Tour Brochure (High Quality Print-ready)
│   └── ce-voyage-10-day-classic-tour-fr.pdf  # French Tour Brochure (High Quality Print-ready)
│
├── tools/
│   └── generate-pdfs.py       # Python ReportLab script to regenerate tour PDFs
│
├── images/                    # Destination galleries, logos, background artwork & hero images
├── DEPLOY.md                  # Detailed GitHub Pages deploy guide
├── GUIDE-SINHALA.md           # Step-by-step Sinhala customization tutorial
├── OPEN-ME-FIRST.txt          # Desktop offline user instructions
└── PUSH-ME-FIRST.md           # This master instruction manual
```

---

## 🚀 Key Features Built-in

1. **22 Dynamic Destination Pages**
   - Rich descriptions, key highlights, best travel times, ideal duration, top activities.
   - Integrated HD video player ("Watch the film") with automatic fallback sources.
   - Interactive *"Add to My Trip"* action buttons.
   - Direct WhatsApp booking button pre-filled with destination context.

2. **Interactive Trip Planner (`trip.html`)**
   - Travellers can bookmark destinations across the site.
   - Stored in browser `localStorage` and synchronized across all pages.
   - Shows badge counter in the top navigation bar (`My Trip (N)`).
   - Generates a customized itinerary summary sent directly to Ce Voyage agents via WhatsApp.

3. **10-Day Signature Tour (`tours.html`)**
   - Day-by-day interactive timeline (Colombo → Sigiriya → Kandy → Nuwara Eliya → Ella → Yala → Galle).
   - Price inclusions / exclusions breakdown.
   - Direct PDF Download for English and French brochures.
   - "Print / Save as PDF" instant browser trigger.

4. **Comprehensive Travel Guide (`guide.html`)**
   - Best seasons and monsoon breakdowns (Yala vs Maha).
   - Transport guide (Scenic trains, private chauffeurs, domestic flights).
   - Cultural etiquette & temple dress codes.
   - Visa regulations (ETA), currency tips, SIM card / connectivity advice.

5. **6 Themed Experience Hubs (`experiences/`)**
   - Dedicated curated pages linking related destinations with dynamic filters.

---

## 🛠️ How to Update and Deploy

### 1. Local Testing
To preview the website locally:
```bash
python3 -m http.server 8080
# Open http://localhost:8080 in your browser
```

### 2. Push Updates to Live Site
When you make changes to HTML, CSS, JS, or images:
```bash
git add -A
git commit -m "Update destination content and guide"
git push origin <working-branch>
```
Open a Pull Request to `main` and merge it. GitHub Pages will deploy within 1–2 minutes automatically.

### 3. Updating Contact Details or WhatsApp
To update phone numbers or emails across the entire website, simply edit `config.js`:
```javascript
window.CE_VOYAGE = {
  brand: "Ce Voyage",
  tagline: "Journeys Beyond Borders",
  email: "ceylonvoyage.sl@gmail.com",
  whatsappFrance: "+33744284269",
  whatsappSriLanka: "+94776655493",
  ...
};
```

---

## ✨ Developed with care for Ce Voyage
*Journeys Beyond Borders — Ceylon Voyages*
