# -*- coding: utf-8 -*-
"""
Ce Voyage — 10-Day Classic Tour PDF generator (EN + FR)
Run:  python3 tools/generate-pdfs.py
Output: pdfs/ce-voyage-10-day-classic-tour-en.pdf, -fr.pdf
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.utils import ImageReader
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Image,
                                Table, TableStyle, PageBreak, KeepTogether)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "pdfs")
LOGO = os.path.join(ROOT, "ce-voyage-logo.png")

FOREST = colors.HexColor("#0a3d33")
DEEP = colors.HexColor("#072a24")
LEAF = colors.HexColor("#14765d")
GOLD = colors.HexColor("#d5aa56")
SAND = colors.HexColor("#f3ecdf")
INK = colors.HexColor("#22302b")
GREY = colors.HexColor("#4c5753")
WHITE = colors.white

PAGE_W, PAGE_H = A4
MARGIN = 2.1 * cm

# ---------------------------------------------------------------- styles
def styles():
    return {
        "coverBrand": ParagraphStyle("coverBrand", fontName="Helvetica-Bold", fontSize=30, leading=34, textColor=WHITE, alignment=TA_CENTER),
        "coverTitle": ParagraphStyle("coverTitle", fontName="Helvetica-Bold", fontSize=21, leading=26, textColor=GOLD, alignment=TA_CENTER),
        "coverSub": ParagraphStyle("coverSub", fontName="Helvetica", fontSize=11.5, leading=17, textColor=colors.HexColor("#e8efe9"), alignment=TA_CENTER),
        "coverContact": ParagraphStyle("coverContact", fontName="Helvetica", fontSize=9.5, leading=14, textColor=colors.HexColor("#cfe0d8"), alignment=TA_CENTER),
        "h1": ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=17, leading=21, textColor=FOREST, spaceAfter=4),
        "sub": ParagraphStyle("sub", fontName="Helvetica", fontSize=10, leading=14, textColor=GREY, spaceAfter=14),
        "dayTitle": ParagraphStyle("dayTitle", fontName="Helvetica-Bold", fontSize=13, leading=16, textColor=FOREST),
        "dayPlace": ParagraphStyle("dayPlace", fontName="Helvetica-Bold", fontSize=9.5, leading=13, textColor=LEAF),
        "dayText": ParagraphStyle("dayText", fontName="Helvetica", fontSize=10, leading=14.5, textColor=GREY),
        "li": ParagraphStyle("li", fontName="Helvetica", fontSize=10, leading=14.5, textColor=INK, leftIndent=14, bulletIndent=2, spaceAfter=3),
        "liHead": ParagraphStyle("liHead", fontName="Helvetica-Bold", fontSize=11, leading=15, textColor=FOREST, spaceAfter=6),
        "small": ParagraphStyle("small", fontName="Helvetica", fontSize=9, leading=13, textColor=GREY),
        "goldRule": ParagraphStyle("goldRule", fontName="Helvetica-Bold", fontSize=9, leading=12, textColor=GOLD),
    }

# ---------------------------------------------------------------- content
CONTENT = {
    "en": {
        "brand": "CE VOYAGE",
        "title": "The 10-Day Classic Tour",
        "sub": "Ancient cities, tea-country trains, wild safaris and southern beaches — the best of Sri Lanka in one loop.",
        "days": [
            ("Day 1 · Arrival — Negombo", "Welcome to Sri Lanka",
             "Land at Colombo Bandaranaike Airport, where your driver welcomes you. Short transfer to a beach hotel in Negombo to rest, swim and enjoy your first Sri Lankan dinner."),
            ("Day 2 · Sigiriya", "Lion Rock & the Cultural Triangle",
             "Drive into the green heart of the island. Late-afternoon climb of the Sigiriya rock fortress for sunset over the jungle — the frescoes, the Mirror Wall and the Lion's Paws."),
            ("Day 3 · Dambulla · Minneriya · Polonnaruwa", "Cave Temples & Wild Elephants",
             "Morning at the Dambulla cave temples, then an afternoon safari in Minneriya or Kaudulla National Park, famous for its wild elephant gatherings."),
            ("Day 4 · Kandy", "The Sacred City",
             "Drive to Kandy, the last royal capital. Visit the Temple of the Tooth, stroll around Kandy Lake and end the day with a traditional Kandyan dance performance."),
            ("Day 5 · Nuwara Eliya", "Into the Tea Country",
             "Board the morning train for one of the world's great rail journeys, winding through tea plantations and cloud forest. Tea factory visit and tasting in Nuwara Eliya."),
            ("Day 6 · Ella", "Hills, Trains & Waterfalls",
             "Continue by rail or road to Ella. Walk the Nine Arch Bridge, hike Little Adam's Peak and cool off at Ravana Falls. Free evening in Ella's cafés."),
            ("Day 7 · Yala", "Leopards & Wildlife Safari",
             "Descend to the south-east for an afternoon jeep safari in Yala National Park — leopards, elephants, sloth bears and a wild coastline."),
            ("Day 8 · Mirissa · Galle", "The Southern Beaches",
             "Drive along the south coast to Mirissa. Optional early-morning whale watching (November–April), then beach time and a sunset walk on the Galle Fort ramparts."),
            ("Day 9 · Colombo", "Capital Day",
             "Return to Colombo by the coast road or the ocean-side train. City tour of the markets, the Lotus Tower and Galle Face Green, with time for souvenirs."),
            ("Day 10 · Departure", "Ayubowan — until next time",
             "Breakfast at the hotel, then transfer to the airport for your flight home — with a phone full of memories and a promise to return."),
        ],
        "inclHead": "INCLUDED",
        "incl": [
            "Private air-conditioned car & English-speaking driver-guide for 10 days",
            "9 nights in hand-picked 3–4★ hotels with breakfast",
            "Reserved train seats (Kandy → Nuwara Eliya → Ella)",
            "Yala & Minneriya safari jeeps with park tickets",
            "All entry tickets mentioned in the itinerary",
            "Airport transfers & 24/7 local support",
        ],
        "exclHead": "NOT INCLUDED",
        "excl": [
            "International flights",
            "Visa / ETA fees (if applicable)",
            "Lunches & dinners (except hotel breakfast)",
            "Personal expenses & tips",
            "Travel insurance",
        ],
        "price": "Price: on request — depends on your dates, group size and hotel level. Send us your dates and we reply with a detailed offer, usually within 24 hours.",
        "practical": [
            ("Weather", "Two monsoons, two coasts: south & west are best December–April; the east coast shines May–September. The hills are green year-round with the clearest views December–March."),
            ("Money", "Sri Lankan Rupee (LKR). ATMs are everywhere; cards work in hotels and restaurants. Budget roughly USD 80–150 per person/day for a comfort trip."),
            ("Visas", "Many nationalities (including France and most of Europe) currently enter visa-free or with a free ETA. Check www.immigration.gov.lk before booking."),
            ("Health & safety", "Drink bottled water, use mosquito repellent, and travel with insurance. Sri Lanka is generally safe — book transport through your hotel or Ce Voyage."),
        ],
        "contactLine": "Questions? WhatsApp France +33 7 44 28 42 69 · Sri Lanka +94 77 66 55 493 · ceylonvoyage.sl@gmail.com · www.ce-voyage.com",
        "footerTag": "Journeys Beyond Borders",
    },
    "fr": {
        "brand": "CE VOYAGE",
        "title": "Le Circuit Classique de 10 Jours",
        "sub": "Cités anciennes, trains du pays du thé, safaris sauvages et plages du sud — le meilleur du Sri Lanka en une boucle.",
        "days": [
            ("Jour 1 · Arrivée — Negombo", "Bienvenue au Sri Lanka",
             "Atterrissage à l'aéroport de Colombo, où votre chauffeur vous accueille. Court transfert vers un hôtel en bord de mer à Negombo pour vous reposer et savourer votre premier dîner srilankais."),
            ("Jour 2 · Sigiriya", "Le Rocher du Lion et le Triangle Culturel",
             "Route vers le cœur vert de l'île. Ascension en fin d'après-midi de la forteresse de Sigiriya au coucher du soleil — fresques, mur des miroirs et pattes du lion."),
            ("Jour 3 · Dambulla · Minneriya · Polonnaruwa", "Temples rupestres et éléphants sauvages",
             "Matinée aux temples rupestres de Dambulla, puis safari l'après-midi à Minneriya ou Kaudulla, célèbres pour leurs rassemblements d'éléphants sauvages."),
            ("Jour 4 · Kandy", "La ville sacrée",
             "Route vers Kandy, dernière capitale royale. Visite du Temple de la Dent, promenade autour du lac et spectacle de danse kandyanne en soirée."),
            ("Jour 5 · Nuwara Eliya", "Au cœur du pays du thé",
             "Train du matin pour l'un des plus beaux voyages ferroviaires du monde, entre plantations de thé et forêt de nuages. Visite d'une fabrique de thé avec dégustation."),
            ("Jour 6 · Ella", "Collines, trains et cascades",
             "Continuation en train ou par la route vers Ella. Pont aux Neuf Arches, randonnée au Little Adam's Peak et baignade aux chutes de Ravana. Soirée libre dans les cafés d'Ella."),
            ("Jour 7 · Yala", "Léopards et safari",
             "Descente vers le sud-est pour un safari en jeep dans le parc national de Yala — léopards, éléphants, ours lippus et côte sauvage."),
            ("Jour 8 · Mirissa · Galle", "Les plages du sud",
             "Route le long de la côte sud jusqu'à Mirissa. Observation des baleines en option au petit matin (novembre–avril), puis plage et coucher de soleil sur les remparts de Galle."),
            ("Jour 9 · Colombo", "Journée capitale",
             "Retour à Colombo par la route côtière ou le train en bord de mer. Visite des marchés, de la Tour du Lotus et de Galle Face Green, avec du temps pour les souvenirs."),
            ("Jour 10 · Départ", "Ayubowan — à bientôt",
             "Petit-déjeuner à l'hôtel, puis transfert à l'aéroport — des souvenirs plein la tête et une promesse de revenir."),
        ],
        "inclHead": "INCLUS",
        "incl": [
            "Voiture privée climatisée et chauffeur-guide (français/anglais) pendant 10 jours",
            "9 nuits en hôtels 3–4★ sélectionnés, petit-déjeuner inclus",
            "Sièges réservés en train (Kandy → Nuwara Eliya → Ella)",
            "Safaris en jeep à Yala et Minneriya avec billets de parc",
            "Tous les billets d'entrée mentionnés dans l'itinéraire",
            "Transferts aéroport et assistance locale 24h/24",
        ],
        "exclHead": "NON INCLUS",
        "excl": [
            "Vols internationaux",
            "Visa / ETA (si applicable)",
            "Déjeuners et dîners (sauf petit-déjeuner)",
            "Dépenses personnelles et pourboires",
            "Assurance voyage",
        ],
        "price": "Prix : sur demande — selon vos dates, la taille du groupe et le niveau d'hôtel. Envoyez-nous vos dates et nous répondons avec une offre détaillée, généralement sous 24 heures.",
        "practical": [
            ("Météo", "Deux moussons, deux côtes : le sud et l'ouest sont au mieux de décembre à avril ; la côte est brille de mai à septembre. Les collines sont vertes toute l'année, plus claires de décembre à mars."),
            ("Argent", "Roupie srilankaise (LKR). Distributeurs partout ; cartes acceptées dans les hôtels et restaurants. Comptez environ 80–150 USD par personne et par jour en confort."),
            ("Visas", "De nombreuses nationalités (dont la France et la plupart de l'Europe) entrent actuellement sans visa ou avec un ETA gratuit. Vérifiez www.immigration.gov.lk avant de réserver."),
            ("Santé et sécurité", "Buvez de l'eau en bouteille, utilisez un répulsif anti-moustiques et voyagez assuré. Le Sri Lanka est globalement sûr — réservez vos transports via votre hôtel ou Ce Voyage."),
        ],
        "contactLine": "Des questions ? WhatsApp France +33 7 44 28 42 69 · Sri Lanka +94 77 66 55 493 · ceylonvoyage.sl@gmail.com · www.ce-voyage.com",
        "footerTag": "Journeys Beyond Borders",
    },
}

# ---------------------------------------------------------------- drawing
def make_on_first_page(lang):
    def on_first_page(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(FOREST)
        canvas.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
        canvas.setStrokeColor(GOLD)
        canvas.setLineWidth(1.4)
        canvas.line(4.2 * cm, PAGE_H - 4.6 * cm, PAGE_W - 4.2 * cm, PAGE_H - 4.6 * cm)
        canvas.setFont("Helvetica-Bold", 10)
        canvas.setFillColor(GOLD)
        canvas.drawCentredString(PAGE_W / 2, PAGE_H - 4.35 * cm, "10-DAY CLASSIC TOUR")
        canvas.setFont("Helvetica", 8.5)
        canvas.setFillColor(colors.HexColor("#cfe0d8"))
        canvas.drawCentredString(PAGE_W / 2, 1.35 * cm, CONTENT[lang]["contactLine"][:110])
        canvas.restoreState()
    return on_first_page

def make_on_page(lang):
    def on_page(canvas, doc):
        canvas.saveState()
        # header band
        canvas.setFillColor(FOREST)
        canvas.rect(0, PAGE_H - 1.9 * cm, PAGE_W, 1.9 * cm, stroke=0, fill=1)
        canvas.setFillColor(GOLD)
        canvas.rect(0, PAGE_H - 2.05 * cm, PAGE_W, 0.15 * cm, stroke=0, fill=1)
        canvas.setFont("Helvetica-Bold", 10)
        canvas.setFillColor(WHITE)
        canvas.drawString(MARGIN, PAGE_H - 1.25 * cm, "CE VOYAGE — " + CONTENT[lang]["title"].upper()[:42])
        canvas.setFont("Helvetica", 8.5)
        canvas.setFillColor(colors.HexColor("#cfe0d8"))
        canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 1.25 * cm, CONTENT[lang]["footerTag"])
        # footer
        canvas.setStrokeColor(GOLD)
        canvas.setLineWidth(0.8)
        canvas.line(MARGIN, 1.55 * cm, PAGE_W - MARGIN, 1.55 * cm)
        canvas.setFont("Helvetica", 8.5)
        canvas.setFillColor(GREY)
        canvas.drawString(MARGIN, 1.05 * cm, CONTENT[lang]["contactLine"][:95])
        canvas.drawRightString(PAGE_W - MARGIN, 1.05 * cm, "Page %d" % doc.page)
        canvas.restoreState()
    return on_page

def build(lang):
    c = CONTENT[lang]
    S = styles()
    out = os.path.join(OUT_DIR, "ce-voyage-10-day-classic-tour-%s.pdf" % lang)
    os.makedirs(OUT_DIR, exist_ok=True)

    doc = SimpleDocTemplate(
        out, pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=2.7 * cm, bottomMargin=2.4 * cm,
        title=c["title"], author="Ce Voyage",
        subject="10-Day Classic Tour — Sri Lanka",
    )

    story = []

    # ---------------- cover
    story.append(Spacer(1, 2.2 * cm))
    if os.path.exists(LOGO):
        img = Image(LOGO)
        iw, ih = ImageReader(LOGO).getSize()
        w = 4.6 * cm
        h = w * ih / iw
        img.drawWidth = w
        img.drawHeight = h
        img.hAlign = "CENTER"
        story.append(img)
    story.append(Spacer(1, 1.2 * cm))
    story.append(Paragraph(c["brand"], S["coverBrand"]))
    story.append(Spacer(1, 0.5 * cm))
    story.append(Paragraph(c["title"], S["coverTitle"]))
    story.append(Spacer(1, 0.9 * cm))
    story.append(Paragraph(c["sub"], S["coverSub"]))
    story.append(Spacer(1, 2.4 * cm))
    story.append(Paragraph("SRI LANKA", ParagraphStyle("x", parent=S["goldRule"], fontSize=11)))
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph(c["contactLine"], S["coverContact"]))
    story.append(PageBreak())

    # ---------------- itinerary
    story.append(Paragraph(c["title"], S["h1"]))
    story.append(Paragraph(c["sub"], S["sub"]))
    for i in range(0, len(c["days"]), 2):
        blocks = []
        for place, title, desc in c["days"][i:i + 2]:
            blocks.append(Paragraph(place, S["dayPlace"]))
            blocks.append(Paragraph(title, S["dayTitle"]))
            blocks.append(Spacer(1, 0.12 * cm))
            blocks.append(Paragraph(desc, S["dayText"]))
            blocks.append(Spacer(1, 0.55 * cm))
        story.append(KeepTogether(blocks))
        if i + 2 < len(c["days"]):
            story.append(Spacer(1, 0.2 * cm))
    story.append(PageBreak())

    # ---------------- included / not included
    story.append(Paragraph("Inclusions", S["h1"]))
    story.append(Spacer(1, 0.25 * cm))
    left = [Paragraph(c["inclHead"], S["liHead"])] + [Paragraph("•  " + t, S["li"]) for t in c["incl"]]
    right = [Paragraph(c["exclHead"], S["liHead"])] + [Paragraph("•  " + t, S["li"]) for t in c["excl"]]
    tbl = Table([[left, right]], colWidths=[(PAGE_W - 2 * MARGIN) / 2.0 - 0.3 * cm] * 2)
    tbl.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("BACKGROUND", (0, 0), (-1, -1), SAND),
        ("BOX", (0, 0), (-1, -1), 0.5, GOLD),
    ]))
    story.append(tbl)
    story.append(Spacer(1, 0.5 * cm))
    story.append(Paragraph(c["price"], S["sub"]))
    story.append(PageBreak())

    # ---------------- practical
    story.append(Paragraph("Good to know", S["h1"]))
    story.append(Spacer(1, 0.25 * cm))
    for head, text in c["practical"]:
        story.append(KeepTogether([
            Paragraph(head, S["dayTitle"]),
            Spacer(1, 0.1 * cm),
            Paragraph(text, S["dayText"]),
            Spacer(1, 0.5 * cm),
        ]))
    story.append(Spacer(1, 0.4 * cm))
    contact = Table(
        [[Paragraph("CE VOYAGE — " + c["footerTag"], S["liHead"]),
          Paragraph(c["contactLine"], S["small"])]],
        colWidths=[4.6 * cm, PAGE_W - 2 * MARGIN - 4.6 * cm],
    )
    contact.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), FOREST),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
    ]))
    # white text inside dark cell — rebuild paragraphs with white styles
    wh = ParagraphStyle("wh", fontName="Helvetica-Bold", fontSize=11, leading=15, textColor=GOLD)
    ws = ParagraphStyle("ws", fontName="Helvetica", fontSize=9, leading=13, textColor=colors.HexColor("#e8efe9"))
    contact = Table(
        [[Paragraph("CE VOYAGE — " + c["footerTag"], wh), Paragraph(c["contactLine"], ws)]],
        colWidths=[4.8 * cm, PAGE_W - 2 * MARGIN - 4.8 * cm],
    )
    contact.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), FOREST),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("BOX", (0, 0), (-1, -1), 0.8, GOLD),
    ]))
    story.append(contact)

    doc.build(story, onFirstPage=make_on_first_page(lang), onLaterPages=make_on_page(lang))
    print("wrote", os.path.relpath(out, ROOT), os.path.getsize(out), "bytes")

if __name__ == "__main__":
    build("en")
    build("fr")
