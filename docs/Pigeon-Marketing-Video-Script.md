# Pigeon Fuel Stations Management App — Marketing Video Script

Production guide for a 90-second hero video, with a 30-second social cut.

---

## 1. Brief

| | |
|---|---|
| **Goal** | Convince owners and directors of Nigerian fuel marketing companies to request a demo. |
| **Audience** | Owners, directors and operations leads of independent and mid-sized marketers running 3 to 50 stations. Secondary: their IT partners. |
| **Core message** | Every day, your tanks and your pumps tell two stories. Pigeon shows you when they disagree, and why. |
| **Length** | Hero: 90 seconds. Social cut: 30 seconds. Both 16:9; export a 9:16 crop of the social cut for WhatsApp status and Instagram. |
| **Tone** | Calm, confident, practical. Speaks like an experienced operator, not a startup pitch. No hype, no made-up statistics. |
| **Language** | English voiceover with a Nigerian voice. Optional Pidgin line in the hook (marked below). |
| **Call to action** | "Request a demo" with the sales phone number and website on screen. |

---

## 2. Pre-production checklist

### Demo environment

Record all screens against a clean demo database. Do not show real customer data.

- [ ] Backend running with seed data; frontend served on a 1920×1080 display at 100% zoom, light mode for most shots, one dark-mode shot for the manager at night.
- [ ] Rename the seed stations to a believable network: Lekki, Ikeja, Wuse, Garki, Port Harcourt, Kano (these are already the seed names).
- [ ] Create three managers with real-sounding Nigerian names and phone numbers, e.g. Oluwaseun Adebayo, Amina Yusuf, Chukwuemeka Obi. Assign each to a station.
- [ ] Set prices to current street prices on the day of recording (PMS, AGO, DPK in ₦/litre).
- [ ] Prepare one station with a deliberate variance: record a day where petrol Pump 2 sold about 4% less than the reservoir drop, so the review band shows amber on the product and red on that pump. This is the "reveal" shot.
- [ ] Prepare a director account that has at least 30 days of records so the sales chart has a shape.
- [ ] Browser: hide bookmarks bar, use a neutral profile, no extensions, cursor visible and slowed in post.
- [ ] Phone recording: Android, screen recording at 1080p, in portrait, for the manager scenes. Clean the status bar (airplane mode off, full battery, no notifications).

### Screen recordings to capture (in order of appearance)

| # | Route / action | Notes |
|---|---|---|
| S1 | Login page, type `director`, sign in | Show the landing on the director dashboard |
| S2 | `/director/dashboard` | Hover the sales chart so the crosshair and tooltip appear; change station filter to one station, then back to All |
| S3 | `/director/stations` → click Lekki Station | Scroll slowly through Location, Manager, Prices, Pumps, Reservoirs |
| S4 | Station details → edit Petrol price inline → Save | Capture the value changing and the activity being logged later (S8) |
| S5 | Phone: `/manager/my-station` | Status banner, today's card, "Record today's sales" |
| S6 | Phone: Record today's sales modal | Type closing readings; the litres, ₦ and variance update live. Leave the amber variance on petrol |
| S7 | Desktop: station details → Daily sales records → expand the day | The per-pump table with the red variance on Pump 2 |
| S8 | `/admin/users` → click the director → Recent activity | Timeline showing "Set Petrol (PMS) price…", "Signed in", etc. |
| S9 | `/director/stations` → Add Station modal | Choose a state from the dropdown, type an LGA |
| S10 | Dark mode toggle on the manager phone | For the night-shift beat |

### Live footage (B-roll)

Half a day with a two-person crew at a cooperating station. Get written permission; blur any third-party branding.

- Forecourt wide shot at golden hour, pumps in use.
- Attendant resetting a pump, close on the totaliser numbers.
- Dip stick going into a tank, reading the wet line.
- Manager on a phone at close of day under canopy lights.
- Director in an office or car looking at a laptop or phone.
- Tanker arriving, hose connected (for the "delivered litres" beat).
- Price board being changed by hand (for the "prices move" beat).

### Other assets

- Logo (PNG with transparency) and brand colours: blue `#1877F2`, green `#42B72A`, yellow `#F5C33B`, red `#F02849`, ink `#050505`, grey `#65676B`.
- Typeface for on-screen text: the system sans used in the app (Segoe UI / SF / Roboto). Bold for numbers.
- Music: understated, mid-tempo, Afrobeats-adjacent percussion under the hook, dropping to a clean pad under the product scenes. No vocals.
- Voice: Nigerian English, male or female, 35 to 50 sounding, warm and direct.
- Sound design: one soft "tick" per on-screen number change, a low "thud" on the variance reveal.

---

## 3. Hero video script (90 seconds)

Timings are targets. Keep total under 95 seconds.

### Scene 1 — The two stories (0:00–0:12)

**Visual:** Golden-hour forecourt. Cut to a close-up of a pump totaliser ticking. Cut to a dip stick coming out of a tank, wet line catching the light. Hold on the number on the stick.

**On-screen text:** none yet.

**VO:**
> Every evening, your station tells you two stories.
> The pumps say how much they sold.
> The tanks say how much went out.

*(Optional Pidgin alt for the third line: "The tank go tell you wetin really comot.")*

**Music:** percussion in, low.

---

### Scene 2 — The gap (0:12–0:22)

**Visual:** A notebook page of handwritten readings. A WhatsApp photo of a meter, blurry. A director at a desk doing the sum on a calculator, then stopping. Cut to black.

**On-screen text (white on black, one line at a time):**
> Most networks never compare the two.
> So the gap goes unnoticed. For weeks.

**VO:**
> When those two numbers live in a logbook and a WhatsApp group, nobody does the arithmetic.
> And the difference, litre by litre, is money you never see.

**SFX:** the low thud on "money you never see". Music drops out for a half-beat.

---

### Scene 3 — Introducing Pigeon (0:22–0:30)

**Visual:** Logo animates in on white. Cut to S1: the director signs in and lands on the dashboard. Smooth zoom into the station tiles.

**On-screen text:**
> Pigeon Fuel Stations Management App

**VO:**
> Pigeon is the fuel station management app built for Nigeria.
> One place for your stations, your managers, your prices, and the daily reconciliation that catches the gap.

**Music:** clean pad under; percussion softens.

---

### Scene 4 — The network at a glance (0:30–0:40)

**Visual:** S2. Dashboard tiles: Stations, Active, Under maintenance, Managers assigned and unassigned. Cursor moves over the sales chart; crosshair and tooltip appear. Station filter changes to "Kano Station" and back to "All stations".

**On-screen text (lower third):**
> Every station. Every day. One screen.

**VO:**
> From Lagos to Kano, see every station's status, who is running it, and what it sold, by day, by station, without a single phone call.

---

### Scene 5 — Prices in your hands (0:40–0:48)

**Visual:** Live: a hand changing a price board, then a director typing on a phone. Cut to S4: inline price edit, Save. The new price appears.

**On-screen text:**
> ₦ per litre, per station, from anywhere.

**VO:**
> When prices move, change them from wherever you are.
> Every change is dated, attributed, and locked into that day's records.

---

### Scene 6 — Five minutes at close of day (0:48–1:02)

**Visual:** Live: a manager under canopy lights takes out a phone. Cut to S5 then S6 on the phone: the form opens pre-filled with yesterday's closings; the manager types closing meters and dip levels; litres, ₦ and variance update as they type.

**On-screen text (as each appears in the form):**
> Opening readings carried over
> Litres and ₦ computed as you type
> Expected vs actual, per product

**VO:**
> For the manager, it is one form at close of day.
> Opening readings are already there. Type the closings and the dip levels, and Pigeon does the arithmetic: litres sold, naira earned, and what the tank says should have been sold.

---

### Scene 7 — The reveal (1:02–1:14)

**Visual:** S7 on desktop. The director expands the day. The per-pump table. Slow push-in to Pump 2's row: red variance figure. Then the product's amber badge. Then the range totals above.

**On-screen text:**
> Variance, per pump, per product, per day.

**VO:**
> The next morning the director sees exactly where the two stories disagree.
> Not "petrol is short this month". Pump 2, yesterday, by this many litres.

**SFX:** the thud, softer, on "Pump 2". Hold the shot for a full second.

---

### Scene 8 — Built for here, built to be trusted (1:14–1:24)

**Visual:** Quick cuts: S9 state dropdown scrolling (Abia… Lagos… Zamfara), LGA typed; S8 the activity timeline ("Set Petrol (PMS) price to ₦…", "Signed in", "Assigned @amina_yusuf to Wuse Station"); S10 dark mode toggle on the phone at night.

**On-screen text (one per cut):**
> 36 states and the FCT · LGAs · PMS, AGO, DPK
> Who did what, when
> Works on the phone already in their pocket

**VO:**
> Nigerian addresses, Nigerian products, Naira throughout.
> A record of who changed what and when.
> No hardware at the station, nothing to install, and it runs on the phone your manager already has.

---

### Scene 9 — Call to action (1:24–1:32)

**Visual:** Live: director closes the laptop, looks up, relaxed. Cut to end card: logo, product name, one line, contact details.

**On-screen text (end card):**
> Pigeon Fuel Stations Management App
> Expected vs actual, every pump, every day.
> Request a demo · [phone] · [website]

**VO:**
> Pigeon. Expected versus actual, every pump, every day.
> Request a demo today, and see your network the way it really is.

**Music:** resolves and ends on the end card.

---

## 4. Social cut (30 seconds)

Same footage, tighter. For WhatsApp status, Instagram and LinkedIn. Burn in captions; most viewers watch muted.

| Time | Visual | Caption (burned in) | VO |
|---|---|---|---|
| 0:00–0:05 | Totaliser ticking, dip stick reading | Your pumps say one number. Your tanks say another. | Your pumps say one number. Your tanks say another. |
| 0:05–0:10 | Notebook, blurry WhatsApp photo | Who's checking the difference? | Most stations never check the difference. |
| 0:10–0:17 | Manager phone: form filling, variance updating live | One form at close of day. Expected vs actual, as you type. | Pigeon turns one form at close of day into expected versus actual, per pump. |
| 0:17–0:24 | Desktop: expanded record, push to the red Pump 2 variance | Variance, per pump, per product, per day. | So the director sees exactly which pump, which product, which day. |
| 0:24–0:30 | End card | Pigeon · Request a demo · [phone] · [website] | Pigeon. Expected versus actual, every pump, every day. Request a demo. |

---

## 5. Clean voiceover copy (for the voice artist)

Read at a measured pace, about 140 words per minute. Pauses marked with `/`.

> Every evening, your station tells you two stories. / The pumps say how much they sold. / The tanks say how much went out.
>
> When those two numbers live in a logbook and a WhatsApp group, nobody does the arithmetic. / And the difference, litre by litre, is money you never see.
>
> Pigeon is the fuel station management app built for Nigeria. / One place for your stations, your managers, your prices, and the daily reconciliation that catches the gap.
>
> From Lagos to Kano, see every station's status, who is running it, and what it sold, / by day, by station, / without a single phone call.
>
> When prices move, change them from wherever you are. / Every change is dated, attributed, and locked into that day's records.
>
> For the manager, it is one form at close of day. / Opening readings are already there. / Type the closings and the dip levels, and Pigeon does the arithmetic: litres sold, naira earned, and what the tank says should have been sold.
>
> The next morning the director sees exactly where the two stories disagree. / Not "petrol is short this month". / Pump 2, yesterday, by this many litres.
>
> Nigerian addresses, Nigerian products, Naira throughout. / A record of who changed what and when. / No hardware at the station, nothing to install, and it runs on the phone your manager already has.
>
> Pigeon. / Expected versus actual, every pump, every day. / Request a demo today, and see your network the way it really is.

Word count: about 230. Fits 90 seconds with room for the pauses.

---

## 6. Editing notes

- **Numbers are the hero.** Whenever a figure changes on screen (price saved, litres computed, variance appearing), hold on it for at least a second and add the soft tick.
- **Never show a real customer's data.** Demo names and figures only. Blur any third-party logos in B-roll.
- **Cursor and taps.** Slow screen recordings to 85% in post where the cursor moves; add a subtle tap ripple on phone recordings.
- **Captions.** Burn in captions on the social cut; provide an SRT for the hero video. Keep captions to one line, lower third.
- **Colour.** Grade B-roll warm; keep UI recordings untouched so the product looks exactly as it ships.
- **Claims.** Every statement in the script describes a shipped feature. Do not add percentages, savings figures or customer counts unless the sales team supplies verified ones.
- **End card.** Replace `[phone]` and `[website]` before export. Hold the end card for a full 5 seconds.

---

## 7. Deliverables

| File | Spec |
|---|---|
| `pigeon-hero-90s.mp4` | 1920×1080, H.264, 25 fps, stereo, with SRT |
| `pigeon-social-30s-16x9.mp4` | 1920×1080, burned-in captions |
| `pigeon-social-30s-9x16.mp4` | 1080×1920 crop, burned-in captions, for WhatsApp status and Instagram |
| `pigeon-endcard.png` | 1920×1080 still for the website and proposals |
| VO stems, music stem, project file | For future re-cuts (new prices, new features) |
