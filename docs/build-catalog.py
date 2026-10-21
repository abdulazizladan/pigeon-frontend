"""Builds docs/Pigeon-Product-Catalog.pdf (multi-page A4). Run: python3 docs/build-catalog.py
Requires: pip install reportlab. Uses the system Arial fonts on macOS for the Naira sign."""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak, Table, TableStyle,
    NextPageTemplate, Flowable, ListFlowable, ListItem,
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Polygon

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "Pigeon-Product-Catalog.pdf")
LOGO = os.path.join(HERE, "..", "public", "img", "logo.png")
EDITION = "Nigerian Market Edition · October 2026 (rev. 2)"

# ---------------------------------------------------------------- fonts
pdfmetrics.registerFont(TTFont("Body", "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"))
pdfmetrics.registerFont(TTFont("Bold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"))
pdfmetrics.registerFontFamily("Body", normal="Body", bold="Bold", italic="Body", boldItalic="Bold")

# ---------------------------------------------------------------- palette (styleguide.md)
BLUE = colors.HexColor("#1877F2"); BLUE_DARK = colors.HexColor("#0A56C8")
GREEN = colors.HexColor("#42B72A"); YELLOW = colors.HexColor("#F5C33B"); RED = colors.HexColor("#F02849")
INK = colors.HexColor("#050505"); INK2 = colors.HexColor("#65676B"); LINE = colors.HexColor("#CED0D4")
SURFACE = colors.HexColor("#F0F2F5"); WHITE = colors.white

PAGE_W, PAGE_H = A4
MARGIN = 18 * mm
CONTENT_W = PAGE_W - 2 * MARGIN

# ---------------------------------------------------------------- styles
def style(name, **kw):
    base = dict(fontName="Body", fontSize=10.5, leading=15, textColor=INK, spaceAfter=6)
    base.update(kw)
    return ParagraphStyle(name, **base)

S = {
    "h1": style("h1", fontName="Bold", fontSize=24, leading=28, spaceAfter=10),
    "h2": style("h2", fontName="Bold", fontSize=14, leading=17, textColor=BLUE_DARK, spaceBefore=9, spaceAfter=5),
    "h3": style("h3", fontName="Bold", fontSize=11.5, leading=14, spaceBefore=8, spaceAfter=3),
    "kicker": style("kicker", fontName="Bold", fontSize=9, leading=11, textColor=BLUE, spaceAfter=4),
    "body": style("body"),
    "lead": style("lead", fontSize=12, leading=18, textColor=INK2, spaceAfter=10),
    "small": style("small", fontSize=8.5, leading=11.5, textColor=INK2, spaceAfter=0),
    "cell": style("cell", fontSize=9.2, leading=12.5, spaceAfter=0),
    "cellw": style("cellw", fontName="Bold", fontSize=9.5, leading=13, textColor=WHITE, spaceAfter=0),
    "bullet": style("bullet", spaceAfter=2, fontSize=10.2, leading=14),
    "toc1": style("toc1", fontSize=11, leading=20, spaceAfter=0),
}

def P(text, st="body"):
    return Paragraph(text, S[st])

def bullets(items):
    return ListFlowable([ListItem(Paragraph(t, S["bullet"]), leftIndent=12, value="•") for t in items],
                        bulletType="bullet", start="•", bulletFontName="Body", bulletFontSize=10, leftIndent=12)

# ---------------------------------------------------------------- flowables
class Callout(Flowable):
    def __init__(self, flowables, bar=BLUE, bg=SURFACE, pad=10, width=CONTENT_W):
        super().__init__()
        self.flowables, self.bar, self.bg, self.pad, self.width = flowables, bar, bg, pad, width
        self._h = 0
    def wrap(self, availW, availH):
        w = self.width - 2 * self.pad - 4
        h = sum(f.wrap(w, availH)[1] for f in self.flowables)
        self._h = h + 2 * self.pad
        return self.width, self._h
    def draw(self):
        c = self.canv
        c.setFillColor(self.bg); c.roundRect(0, 0, self.width, self._h, 6, fill=1, stroke=0)
        c.setFillColor(self.bar); c.rect(0, 0, 4, self._h, fill=1, stroke=0)
        w = self.width - 2 * self.pad - 4
        y = self._h - self.pad
        for f in self.flowables:
            _, fh = f.wrap(w, 10000); y -= fh; f.drawOn(c, self.pad + 4, y)

def stat_tiles(items, cols=3):
    row = [[Paragraph(v, style("tv", fontName="Bold", fontSize=15, leading=18, textColor=col, spaceAfter=2)), Paragraph(l, S["small"])]
           for l, v, col in items]
    t = Table([row], colWidths=[CONTENT_W / cols] * cols)
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), SURFACE), ("BOX", (0, 0), (-1, -1), 0.6, LINE),
                           ("INNERGRID", (0, 0), (-1, -1), 0.6, WHITE), ("VALIGN", (0, 0), (-1, -1), "TOP"),
                           ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                           ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10)]))
    return t

def table(header, rows, widths, zebra=True, header_bg=BLUE):
    data = [[Paragraph(h, S["cellw"]) for h in header]] + [[c if isinstance(c, Flowable) else Paragraph(c, S["cell"]) for c in r] for r in rows]
    t = Table(data, colWidths=widths, repeatRows=1)
    st = [("BACKGROUND", (0, 0), (-1, 0), header_bg), ("VALIGN", (0, 0), (-1, -1), "TOP"),
          ("LINEBELOW", (0, 0), (-1, -1), 0.5, LINE),
          ("TOPPADDING", (0, 0), (-1, -1), 4.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 4.5),
          ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8)]
    if zebra:
        st += [("BACKGROUND", (0, i), (-1, i), SURFACE) for i in range(2, len(data), 2)]
    t.setStyle(TableStyle(st))
    return t

def reconciliation_diagram():
    W, H = CONTENT_W, 72 * mm
    d = Drawing(W, H)
    bw, bh = 52 * mm, 26 * mm
    gap = (W - 3 * bw) / 2
    y_top = H - bh - 4
    boxes = [
        ("RESERVOIR DIP (per product)", ["Opening level", "+ Delivered", "− Closing level", "= EXPECTED litres"], GREEN),
        ("PUMP METERS (per pump)", ["Closing reading", "− Opening reading", "= litres sold", "Σ pumps = ACTUAL litres"], BLUE),
        ("PRICE SNAPSHOT (₦ per litre)", ["Price in force that day", "is stored on the record", "so later changes never", "rewrite history"], YELLOW),
    ]
    for i, (title, lines, col) in enumerate(boxes):
        x = i * (bw + gap)
        d.add(Rect(x, y_top, bw, bh, rx=5, ry=5, fillColor=SURFACE, strokeColor=LINE, strokeWidth=0.6))
        d.add(Rect(x, y_top + bh - 4, bw, 4, fillColor=col, strokeColor=col))
        d.add(String(x + 6, y_top + bh - 14, title, fontName="Bold", fontSize=7.6, fillColor=INK))
        for j, ln in enumerate(lines):
            d.add(String(x + 6, y_top + bh - 26 - j * 10, ln, fontName="Body", fontSize=7.6, fillColor=INK2))
    vb_w, vb_h = W - 16 * mm, 20 * mm
    vx, vy = (W - vb_w) / 2, 2
    for i in range(3):
        cx = i * (bw + gap) + bw / 2
        d.add(Line(cx, y_top, cx, vy + vb_h + 6, strokeColor=LINE, strokeWidth=0.8))
        d.add(Polygon([cx - 3, vy + vb_h + 8, cx + 3, vy + vb_h + 8, cx, vy + vb_h + 3], fillColor=LINE, strokeColor=LINE))
    d.add(Rect(vx, vy, vb_w, vb_h, rx=5, ry=5, fillColor=WHITE, strokeColor=BLUE, strokeWidth=1))
    d.add(String(W / 2, vy + vb_h - 13, "VARIANCE = ACTUAL − EXPECTED, in litres and in ₦", fontName="Bold", fontSize=8.5, fillColor=INK, textAnchor="middle"))
    d.add(String(W / 2, vy + vb_h - 25, "Per pump, per product, per day and over the whole range. Within 1%: normal drift · 1–5%: review · above 5%: investigate.", fontName="Body", fontSize=7.2, fillColor=INK2, textAnchor="middle"))
    d.add(String(W / 2, vy + vb_h - 35, "Shown to the manager while typing, and to the director afterwards.", fontName="Body", fontSize=7.2, fillColor=INK2, textAnchor="middle"))
    return d

def phase_timeline():
    W, H = CONTENT_W, 30 * mm
    d = Drawing(W, H)
    phases = [("Discovery", "Phase 0 · 1 week", INK2), ("Pilot", "Phase 1 · 3–4 weeks", BLUE), ("Regional rollout", "Phase 2 · 4–8 weeks", GREEN), ("Scale & optimise", "Phase 3 · ongoing", YELLOW)]
    weights = [2, 3, 4.5, 3]; total = sum(weights); x = 0
    for (name, dur, col), wgt in zip(phases, weights):
        w = W * wgt / total - 3
        d.add(Rect(x, 12 * mm, w, 9 * mm, rx=4, ry=4, fillColor=col, strokeColor=col))
        d.add(String(x + 6, 12 * mm + 9 * mm / 2 - 3, name, fontName="Bold", fontSize=8, fillColor=WHITE))
        d.add(String(x + 2, 6 * mm, dur, fontName="Body", fontSize=7.5, fillColor=INK2))
        x += w + 3
    d.add(String(0, 25 * mm, "Indicative timeline for a network of 10–30 stations", fontName="Body", fontSize=7.5, fillColor=INK2))
    return d

# ---------------------------------------------------------------- document / page decorations
class CatalogDoc(BaseDocTemplate):
    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and flowable.style.name == "h1":
            key = "sec-%d" % id(flowable)
            self.canv.bookmarkPage(key)
            self.notify("TOCEntry", (0, flowable.getPlainText(), self.page, key))

def on_cover(canv, doc):
    canv.saveState()
    canv.setFillColor(BLUE_DARK); canv.rect(0, PAGE_H * 0.38, PAGE_W, PAGE_H * 0.62, fill=1, stroke=0)
    canv.setFillColor(BLUE); canv.rect(0, PAGE_H * 0.38, PAGE_W, 6, fill=1, stroke=0)
    card_w, card_h = 46 * mm, 30 * mm
    cx, cy = MARGIN, PAGE_H - 28 * mm - card_h
    canv.setFillColor(WHITE); canv.roundRect(cx, cy, card_w, card_h, 8, fill=1, stroke=0)
    try:
        canv.drawImage(LOGO, cx + 3 * mm, cy + 3 * mm, width=card_h - 6 * mm, height=card_h - 6 * mm, mask="auto", preserveAspectRatio=True)
    except Exception:
        pass
    stripe_y = 16 * mm
    for i, col in enumerate([GREEN, YELLOW, BLUE]):
        canv.setFillColor(col); canv.rect(MARGIN + i * 22 * mm, stripe_y, 18 * mm, 4, fill=1, stroke=0)
    canv.setFillColor(INK2); canv.setFont("Body", 8.5)
    canv.drawString(MARGIN, stripe_y - 12, "Petrol (PMS) · Diesel (AGO) · Kerosene (DPK)")
    canv.drawRightString(PAGE_W - MARGIN, stripe_y - 12, EDITION)
    canv.restoreState()

def on_page(canv, doc):
    canv.saveState()
    canv.setFillColor(BLUE); canv.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)
    try:
        canv.drawImage(LOGO, MARGIN, PAGE_H - 16 * mm, width=7 * mm, height=7 * mm, mask="auto")
    except Exception:
        pass
    canv.setFillColor(INK); canv.setFont("Bold", 9)
    canv.drawString(MARGIN + 9 * mm, PAGE_H - 13.5 * mm, "Pigeon Fuel Stations Management App")
    canv.setFillColor(INK2); canv.setFont("Body", 8.5)
    canv.drawRightString(PAGE_W - MARGIN, PAGE_H - 13.5 * mm, "Product Catalog · Nigerian Market Edition")
    canv.setStrokeColor(LINE); canv.setLineWidth(0.5)
    canv.line(MARGIN, PAGE_H - 18 * mm, PAGE_W - MARGIN, PAGE_H - 18 * mm)
    canv.line(MARGIN, 14 * mm, PAGE_W - MARGIN, 14 * mm)
    canv.setFont("Body", 8.5); canv.setFillColor(INK2)
    canv.drawString(MARGIN, 9 * mm, "Expected vs actual, every pump, every day.")
    canv.drawRightString(PAGE_W - MARGIN, 9 * mm, "Page %d" % doc.page)
    canv.restoreState()

doc = CatalogDoc(OUT, pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN, topMargin=24 * mm, bottomMargin=20 * mm,
                 title="Pigeon Fuel Stations Management App — Product Catalog", author="Pigeon",
                 subject="Product catalog, Nigerian market edition")
cover_frame = Frame(MARGIN, MARGIN, CONTENT_W, PAGE_H - 2 * MARGIN, id="cover", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
body_frame = Frame(MARGIN, 20 * mm, CONTENT_W, PAGE_H - 44 * mm, id="body", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
doc.addPageTemplates([PageTemplate(id="Cover", frames=[cover_frame], onPage=on_cover),
                      PageTemplate(id="Body", frames=[body_frame], onPage=on_page)])

story = []
FEATURE_W = [42 * mm, CONTENT_W - 42 * mm]

# ================================================================ COVER
story += [
    Spacer(1, 52 * mm),
    Paragraph("PRODUCT CATALOG", style("ck", fontName="Bold", fontSize=10, leading=12, textColor=colors.HexColor("#9EC5F4"), spaceAfter=14)),
    Paragraph("Pigeon Fuel Stations<br/>Management App", style("ct", fontName="Bold", fontSize=34, leading=38, textColor=WHITE, spaceAfter=10)),
    Paragraph("One place to run every station in your network: stations and their managers, pumps, reservoirs and "
              "Naira prices, daily sales reconciliation, stock levels in every tank, and a clear trail from a faulty "
              "pump to an authorized repair.", style("cs", fontSize=13.5, leading=19, textColor=colors.HexColor("#DCE9FB"))),
    Spacer(1, 62 * mm),
    Paragraph("Built for Nigerian fuel marketers", style("cb", fontName="Bold", fontSize=12, leading=15, spaceAfter=4)),
    Paragraph("36 states and the FCT · Local Government Areas · ₦ per litre pricing · PMS, AGO and DPK · Admin, Director and Manager roles",
              style("cb2", fontSize=10, leading=14, textColor=INK2)),
    NextPageTemplate("Body"), PageBreak(),
]

# ================================================================ CONTENTS + AT A GLANCE
toc = TableOfContents(); toc.levelStyles = [S["toc1"]]; toc.dotsMinLevel = 0
story += [
    Paragraph("Contents", S["h2"]), toc, Spacer(1, 8 * mm),
    Paragraph("Pigeon at a glance", S["h2"]),
    stat_tiles([("Roles with their own workspace: Admin, Director, Manager", "3", BLUE),
                ("Products tracked per station, each with its own reservoir and pumps", "3", GREEN),
                ("Nigerian states plus the FCT available when registering a station", "37", BLUE_DARK)]),
    Spacer(1, 4 * mm),
    stat_tiles([("Daily records per station: sales readings, a health check, end-of-day tank levels", "3", BLUE),
                ("Variance band treated as normal meter drift before a review is suggested", "≤ 1%", GREEN),
                ("Decisions a director can give a repair request: authorize, deny, no action", "3", INK2)]),
    Spacer(1, 6 * mm),
    Callout([P("<b>Who this catalog is for.</b> Owners and directors of independent and mid-sized fuel marketing companies in "
               "Nigeria, their operations leads, and the IT partners who will deploy and support the system. It describes the "
               "product as it ships today; the deployment section explains how to put it to work across a multi-station network.")]),
    PageBreak(),
]

# ================================================================ PROBLEM STATEMENT
story += [
    Paragraph("THE CHALLENGE", S["kicker"]), Paragraph("Problem statement", S["h1"]),
    P("Running fuel stations in Nigeria today means managing fast-moving prices, dispersed sites and a daily flow of litres "
      "that is easy to lose track of. Most networks still depend on paper and phone calls.", "lead"),
    Paragraph("Prices move, records do not keep up", S["h3"]),
    P("Since the end of the petrol subsidy and the move to market-reflective pricing, pump prices change far more often than "
      "they used to, and they can differ from one station to the next. A director needs to change a price at a station in Kano "
      "without driving there, and later needs to know exactly which price was in force on any given day. Notebooks and WhatsApp "
      "messages cannot answer that reliably."),
    Paragraph("Litres leave the tank without being accounted for", S["h3"]),
    P("Every station has a simple truth check available: the drop in each reservoir between morning and evening should match "
      "what its pumps dispensed. When readings live in logbooks, nobody does that arithmetic daily. Under-dispensing, pilferage, "
      "leaks and unrecorded deliveries only surface at month-end stock-taking, if they surface at all."),
    Paragraph("Nobody knows what is in the ground, or what is broken", S["h3"]),
    P("Head office finds out a tank is nearly empty when the manager calls in a panic, and finds out a pump has been faulty for "
      "a week when sales drop. Faults are reported by phone, approved by phone, and forgotten by phone."),
    Paragraph("Directors see their network late and second-hand", S["h3"]),
    P("A marketer with sites in Lagos, Abuja, Port Harcourt and Kano relies on managers to call in figures. Numbers arrive late, "
      "in different formats, and cannot be compared across stations or checked against anything."),
    Paragraph("Tools must fit Nigerian operating conditions", S["h3"]),
    P("Station managers work from Android phones on mobile data that comes and goes, often with unreliable power. A system that "
      "needs a desktop, heavy downloads or hours of training will not be used at the close of a long day. It has to be light, "
      "quick to fill in once a day, and forgiving of mistakes."),
    Spacer(1, 4 * mm),
    Callout([P("<b>The cost of not knowing.</b> On a station selling several thousand litres of PMS a day, a persistent two to three "
               "percent gap between tank drop and pump meters represents a material monthly loss at today's prices, and it is "
               "invisible without a daily reconciliation.")], bar=RED, bg=colors.HexColor("#FDECEF")),
    PageBreak(),
]

# ================================================================ INTRODUCTION
story += [
    Paragraph("THE PRODUCT", S["kicker"]), Paragraph("Introducing Pigeon", S["h1"]),
    P("Pigeon is a web application for fuel marketing companies that run one or many retail stations. It gives each role in "
      "the business its own workspace and connects them through one shared record of stations, people, prices, stock and daily sales.", "lead"),
    Paragraph("Three roles, one system", S["h3"]),
    table(["Role", "Who they are", "What Pigeon gives them"], [
        ["<b>Admin</b>", "Head office or IT. Owns accounts and system configuration.",
         "Full access: all users, managers, stations, repair requests, tickets, and the activity history of any user."],
        ["<b>Director</b>", "Owner or operations lead responsible for a network of stations.",
         "A dashboard of station status, manager coverage, pending repairs and sales; station and manager management; price "
         "setting; expected versus actual sales, tank levels and health checks for every station; the say on every repair request."],
        ["<b>Manager</b>", "Runs one station day to day.",
         "A My Station view with status, tank gauges and sales; daily forms for pump meters, tank levels and a health check of "
         "the station and each pump; a way to report faults and ask for repair authorization; their own support tickets."],
    ], [28 * mm, 58 * mm, CONTENT_W - 86 * mm]),
    Paragraph("Built around how a Nigerian station actually works", S["h3"]),
    bullets([
        "Every station carries a Nigerian address: street, Local Government Area and one of the 36 states or the FCT.",
        "Each station sells <b>Petrol (PMS)</b>, <b>Diesel (AGO)</b> and <b>Kerosene (DPK)</b>, each priced in Naira per litre and each with its own underground reservoir.",
        "Pumps dispense exactly one product and draw from that product's reservoir; a pump can be taken out of service without deleting its history.",
        "Station status is explicit: <b>active</b>, <b>under maintenance</b> or <b>inactive</b>, so a closed station never looks like an under-performing one.",
        "Prices are snapshotted onto each day's record: changing a price tomorrow never rewrites yesterday's sales.",
    ]),
    Paragraph("The daily loop", S["h3"]),
    P("A director registers a station, sets its prices, adds its pumps and tanks and assigns a manager. Each evening the manager "
      "records closing meters and dip levels, confirms the condition of the station and each pump, and notes the litres left in "
      "every tank. Pigeon turns that into litres and Naira per pump, compares the pump total with the reservoir drop, flags the "
      "variance, updates the tank gauges, and, if a pump is faulty, lets the manager ask for a repair in two taps. The director "
      "sees all of it across every station the next morning, and answers the repair request from the same screen."),
    Callout([P("<b>Light by design.</b> Pigeon runs in any modern browser on a phone, tablet or laptop, in light or dark mode, "
               "with small pages that load quickly on mobile data. Nothing to install at the station.")], bar=GREEN, bg=colors.HexColor("#EAF7E6")),
    PageBreak(),
]

# ================================================================ FEATURES
story += [
    Paragraph("WHAT IT DOES", S["kicker"]), Paragraph("Features", S["h1"]),
    Paragraph("Station network management", S["h2"]),
    table(["Feature", "Detail"], [
        ["Stations directory", "Searchable table of every station with address, LGA, state, status, manager and a stock chip per tank: green above 75%, amber from 25% to 74%, red below 25%."],
        ["Station details", "Location, status, assigned manager, selling prices, pumps and reservoirs, tank gauges, health checks, repair requests, a sales chart and the daily records, on one page."],
        ["Manager assignment", "Assign or unassign a manager from the station or from the manager's own page. One active manager per station; inactive staff cannot be assigned."],
        ["Prices", "Set Naira-per-litre prices per product per station. The change is logged and applies from the next recorded day."],
        ["Pumps and reservoirs", "Register pumps by name and product, take them in and out of service; register one reservoir per product with its capacity in litres."],
    ], FEATURE_W),
    Paragraph("People and access", S["h2"]),
    table(["Feature", "Detail"], [
        ["Role-based access", "Admin, Director and Manager each see only their own workspace. Every rule is enforced by the server, not just hidden in the interface."],
        ["Users and managers", "Create accounts with first name, last name, phone and username. Directors can create managers; admins can create any role."],
        ["Deactivation", "Removing a manager deactivates the account, blocks sign-in and frees their station. History is preserved."],
        ["Activity log", "Every sign-in, price change, station update, assignment, health check, repair decision, ticket action and daily record is attributed to a person and listed newest first on their profile."],
        ["Secure sessions", "Signed sessions that expire after one hour, automatic sign-out when they do, and a confirmation before any manual sign-out."],
    ], FEATURE_W),
    Paragraph("Dashboards and support", S["h2"]),
    table(["Feature", "Detail"], [
        ["Director dashboard", "Station counts by status, managers assigned and unassigned, pending repairs, and a daily sales chart with date-range presets and a station filter."],
        ["Station sales chart", "Every station page, and the manager's My Station, carries its own sales line with 7, 30 and 90 day, month-to-date and custom ranges."],
        ["Support tickets", "Directors and managers raise, edit, close and reopen their own tickets with a priority; admins see and triage every ticket."],
        ["Light and dark mode", "Follows the device setting or a manual toggle, for night shifts and bright forecourts alike."],
    ], FEATURE_W),
    PageBreak(),
]

# ================================================================ HEALTH, REPAIRS, STOCK
story += [
    Paragraph("WHAT IT DOES", S["kicker"]), Paragraph("Station health, repairs and stock", S["h1"]),
    P("Selling fuel is only half of running a station. Pigeon also keeps an eye on the equipment that sells it and the product "
      "sitting in the ground, and gives every fault a path to a decision.", "lead"),
    Paragraph("Health checks", S["h2"]),
    table(["Feature", "Detail"], [
        ["Daily walk-round", "The manager records the overall condition of the station (good, fair or faulty) and marks every pump OK, faulty or out of service, with notes. One check per day, editable afterwards."],
        ["Pre-filled", "Each pump opens on its last recorded condition, so a routine check takes under a minute."],
        ["Visible to the director", "The latest check and its history sit on the station page, so a pump that has been faulty for a week is impossible to miss."],
    ], FEATURE_W),
    Paragraph("Repair requests", S["h2"]),
    table(["Feature", "Detail"], [
        ["Report a fault", "From a faulty pump on the health check, or for any other facility (canopy lights, generator, forecourt), with a description and a priority: high / urgent, medium or low."],
        ["Director decision", "Authorize, deny (with a reason), or take no action for now. Ignored requests can be revisited; authorized and denied ones are final. The manager sees the decision and the director's note."],
        ["At a glance", "Pending and high-priority counts on the director dashboard; a Repair Requests page with status and priority filters for directors and admins."],
    ], FEATURE_W),
    Paragraph("Reservoir levels", S["h2"]),
    table(["Feature", "Detail"], [
        ["Tank gauges", "A filled tank per product on the station page and on My Station: percentage, litres against capacity, a stock status, and an estimate of days of stock left from recent sales."],
        ["End-of-day readings", "The manager dips each tank at close of business and enters the litres; the same day can be corrected. Closing levels from the sales record count too, and the newest reading always wins."],
        ["Network view", "The stations list shows every tank as a colour-coded percentage chip, so head office sees which stations need a delivery before anyone calls."],
    ], FEATURE_W),
    Callout([P("<b>One trail, start to finish.</b> A pump marked faulty on Tuesday's check becomes a repair request with a priority, "
               "a director's authorization with a note on Wednesday, and an activity-log entry for each step, all attributed and dated.")],
            bar=GREEN, bg=colors.HexColor("#EAF7E6")),
    PageBreak(),
]

# ================================================================ RECONCILIATION DEEP DIVE
story += [
    Paragraph("THE CORE FEATURE", S["kicker"]), Paragraph("Daily sales reconciliation", S["h1"]),
    P("The heart of Pigeon is a single daily record per station that compares two independent measurements of the same thing: "
      "fuel that left the tanks, and fuel that went through the pumps.", "lead"),
    reconciliation_diagram(), Spacer(1, 4 * mm),
    Paragraph("How a manager records a day", S["h3"]),
    bullets([
        "Open <b>Record today's sales</b>. The form lists every active pump and every reservoir, with opening values carried over from the last record.",
        "Enter each pump's closing meter and each reservoir's closing dip level, plus any litres delivered by tanker during the day.",
        "Watch litres sold, Naira amount, expected litres and variance update as you type. Impossible entries (a closing meter below opening, a level above tank capacity) are flagged before you submit.",
        "Submit once. A day can be corrected later; the correction is logged against the person who made it.",
    ]),
    Paragraph("What directors and admins see", S["h3"]),
    bullets([
        "Each day's record for a station, expandable into a per-product, per-pump table: opening, closing, actual litres, expected litres, variance in litres and in Naira.",
        "Range totals for the last 7, 30 or 90 days, so a slow leak shows up as a trend, not a one-off.",
        "Colour and text cues on every line: within 1% is normal meter drift, 1 to 5% is worth a look, above 5% needs investigation. The sign is always spelled out, never left to colour alone.",
        "A sales chart per station and for the whole network, filterable by date range, built from the same meter readings.",
    ]),
    Callout([P("<b>Why both measurements matter.</b> Pump meters tell you what was sold. Reservoir dips tell you what was consumed. "
               "When the two disagree, the gap is your shrinkage, your calibration problem or your unrecorded delivery, and Pigeon "
               "shows you which product and which pump to look at first.")]),
    PageBreak(),
]

# ================================================================ BENEFITS
story += [
    Paragraph("WHY IT PAYS", S["kicker"]), Paragraph("Benefits", S["h1"]),
    Paragraph("For owners and directors", S["h2"]),
    bullets([
        "<b>Catch shrinkage within a day, not a month.</b> Variance per pump and per product, every day, with the trend over the range.",
        "<b>Change prices anywhere, instantly, with a record.</b> Set ₦ per litre per station from your phone; every change is attributed and dated.",
        "<b>One view of the whole network.</b> Station status, manager coverage, tank levels and sales for Lagos, the FCT, Rivers and Kano on one screen.",
        "<b>Know what is in the ground.</b> Tank levels for every station on one list, with days of stock left, so deliveries are planned rather than panicked.",
        "<b>Decide on repairs with the facts.</b> Each request arrives with a priority and the pump's check history; authorize, deny or hold, and the decision is on record.",
        "<b>Know who did what.</b> The activity log answers questions that used to take a day of phone calls.",
    ]),
    Paragraph("For station managers", S["h2"]),
    bullets([
        "<b>Five minutes at close of day.</b> Sales readings, tank levels and a health check, each pre-filled, on the phone already in their pocket.",
        "<b>Fewer mistakes.</b> Impossible readings are caught before submission; the arithmetic is done for them.",
        "<b>Faults get answered.</b> Reporting a broken pump takes two taps and comes back with a decision and a note, not silence.",
        "<b>A place to ask for help.</b> Support tickets reach head office with a priority attached, and the manager can follow and close them.",
    ]),
    Paragraph("For the business", S["h2"]),
    bullets([
        "<b>Decisions on numbers, not recollections.</b> Comparable, dated, attributed figures across every site.",
        "<b>Audit-ready records.</b> Prices in force, litres dispensed, stock levels and equipment condition for every day, useful for regulators, auditors, lenders and insurers.",
        "<b>Low cost of adoption.</b> No hardware at the station, no software to install, works on existing phones and browsers.",
        "<b>Grows with the network.</b> Add a station, its pumps and tanks and a manager in minutes; the dashboards extend automatically.",
    ]),
    Spacer(1, 3 * mm),
    stat_tiles([("Daily, not monthly: how often every station is reconciled and checked", "Every day", BLUE),
                ("Manager effort per station per day, once set up", "About 5 min", GREEN),
                ("Hardware required at each station", "None", INK2)]),
    PageBreak(),
]

# ================================================================ DEPLOYMENT STRATEGY
story += [
    Paragraph("PUTTING IT TO WORK", S["kicker"]), Paragraph("Deployment strategy", S["h1"]),
    P("Pigeon is rolled out station by station, starting small, proving the daily routine at a few sites, then extending region "
      "by region. The sequence below fits a network of ten to thirty stations.", "lead"),
    phase_timeline(),
    table(["Phase", "Activities", "Outcome"], [
        ["<b>0 · Discovery</b><br/>1 week", "Collect the station master list (name, address, LGA, state, status), pump and tank inventory, current prices and the staff roster. Agree variance thresholds and who decides repairs.", "Clean data ready to load; named admin and directors."],
        ["<b>1 · Pilot</b><br/>3–4 weeks", "Deploy for one to three stations in one city. Train their managers and the director. Record sales, levels and a health check every day; hold a weekly variance and repairs review.", "Daily habit established; first variance and fault findings; sign-off to proceed."],
        ["<b>2 · Regional rollout</b><br/>4–8 weeks", "Add the remaining stations region by region (for example Lagos, then the FCT, Rivers and Kano). Train managers in batches. Directors switch from phone round-ups to the dashboard.", "Whole network recording daily; comparable figures across regions."],
        ["<b>3 · Scale and optimise</b><br/>ongoing", "Monthly review of variance, stock and repair trends by station and product. Tighten thresholds where meters are reliable. Use the ticket module for support with agreed response times.", "Sustained reduction in unexplained losses; faster price moves; fewer surprise stock-outs."],
    ], [34 * mm, CONTENT_W - 34 * mm - 50 * mm, 50 * mm]),
    Paragraph("Hosting options", S["h2"]),
    table(["Option", "Fits", "Notes"], [
        ["<b>Cloud (recommended)</b>", "Most networks", "The web app is served from a global content network; the API and database run on a cloud server in a region close to Nigeria. Automatic HTTPS, daily backups, no hardware to maintain."],
        ["<b>Nigerian data centre</b>", "Networks with data-residency requirements", "API and database hosted with a Nigerian provider, keeping operational data in-country in line with the Nigeria Data Protection Act. Same application, different server location."],
        ["<b>Private / on-premises</b>", "Large marketers with their own IT", "Deployed inside the company's own infrastructure and managed by its IT team, with Pigeon providing updates and support."],
    ], [40 * mm, 42 * mm, CONTENT_W - 82 * mm]),
    PageBreak(),
]

# ================================================================ OPERATIONS, TRAINING, TECH
story += [
    Paragraph("PUTTING IT TO WORK", S["kicker"]), Paragraph("Operations, training and technical requirements", S["h1"]),
    Paragraph("Security and data protection", S["h2"]),
    bullets([
        "All traffic over HTTPS; sessions expire after one hour; passwords are stored only as salted hashes.",
        "Every permission is enforced by the API: a manager cannot read another station, and deactivated accounts cannot sign in.",
        "An append-only activity log records sign-ins and every change with the responsible person and time; daily backups are kept for 30 days as standard.",
    ]),
    Paragraph("Connectivity and devices", S["h2"]),
    bullets([
        "Works in current versions of Chrome, Safari, Edge and Firefox on Android, iOS, Windows and macOS; nothing to install. Pages are small and each daily form is one screen, so it completes comfortably on 3G-class mobile data.",
        "Submission needs a connection at that moment. We recommend recording at close of day when data is available; an offline-first mode is on the roadmap for stations with the weakest coverage.",
    ]),
    Paragraph("Training and support", S["h2"]),
    table(["Audience", "Format", "Duration"], [
        ["Station managers", "Hands-on session at the station or by video: My Station, recording sales, tank levels and a health check, reporting a fault, reading the variance. One-page quick reference card in English (Hausa, Yoruba and Igbo on request).", "About 1 hour"],
        ["Directors and operations leads", "Dashboard, stations, managers, prices, tank levels, health checks, deciding repair requests, reading daily records, using the activity log.", "About 2 hours"],
        ["Admins / IT", "Accounts, roles, deployment, backups, activity log, ticket triage.", "About 2 hours"],
        ["Ongoing", "In-app support tickets with priorities; monthly review call during the first quarter.", "As agreed"],
    ], [40 * mm, CONTENT_W - 40 * mm - 28 * mm, 28 * mm]),
    Paragraph("Measuring success", S["h2"]),
    bullets([
        "Share of station-days with sales, levels and a health check recorded on time (target: above 95% by the end of the pilot).",
        "Unexplained variance as a share of litres sold, per station and product, trending down month on month.",
        "Time from a fault report to a director's decision, and from a price decision to the new price being in force at every station (targets: hours and minutes respectively).",
    ]),
    Paragraph("What the client provides", S["h2"]),
    bullets([
        "Station master data, pump and tank inventory and current prices (a spreadsheet is enough), plus a named admin and the list of directors and managers with phone numbers.",
        "Phones or tablets for managers (any recent Android device is sufficient) and a decision on the hosting option.",
    ]),
    PageBreak(),
]

# ================================================================ NEXT STEPS
story += [
    Paragraph("GET STARTED", S["kicker"]), Paragraph("Next steps", S["h1"]),
    P("A pilot at one to three stations is the fastest way to see Pigeon's value: within a month you will have a daily routine in "
      "place, your first variance findings, and your first repair decided with a record.", "lead"),
    table(["Step", "What happens", "When"], [
        ["<b>1 · Demo</b>", "A 45-minute walkthrough of the director dashboard, a station page with its tank gauges and health checks, a repair decision, and the manager's daily forms, using sample Nigerian stations.", "This week"],
        ["<b>2 · Discovery</b>", "We collect your station, pump, tank and price data and agree the pilot sites.", "Week 1"],
        ["<b>3 · Pilot</b>", "Pilot stations live, managers trained, weekly variance and repairs reviews.", "Weeks 2–5"],
        ["<b>4 · Rollout</b>", "Remaining stations added region by region.", "From week 6"],
    ], [34 * mm, CONTENT_W - 34 * mm - 32 * mm, 32 * mm]),
    Spacer(1, 8 * mm),
    Callout([Paragraph("<b>Request a demo</b>", style("rd", fontName="Bold", fontSize=13, leading=16, spaceAfter=6)),
             P("Phone: ____________________________"), P("Email: ____________________________"), P("Website: ____________________________"),
             P("Fill in your sales contact details above before distributing this catalog.", "small")]),
    Spacer(1, 10 * mm),
    Paragraph("Product summary", S["h2"]),
    table(["", ""], [
        ["<b>Product</b>", "Pigeon Fuel Stations Management App"],
        ["<b>Edition</b>", "Nigerian Market Edition, October 2026, revision 2"],
        ["<b>Users</b>", "Admins, Directors, Station Managers"],
        ["<b>Covers</b>", "Stations · Managers · Prices (₦/L) · Pumps · Reservoirs · Daily sales reconciliation · Station sales charts · Health checks · Repair requests · Tank levels · Support tickets · Activity log"],
        ["<b>Products</b>", "Petrol (PMS), Diesel (AGO), Kerosene (DPK)"],
        ["<b>Runs on</b>", "Any modern browser on phone, tablet or computer"],
        ["<b>Hosting</b>", "Cloud, Nigerian data centre, or private"],
    ], [34 * mm, CONTENT_W - 34 * mm], header_bg=WHITE),
]

doc.multiBuild(story)
print("written", OUT)
