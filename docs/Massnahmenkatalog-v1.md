# CareCoach Pro — Maßnahmenkatalog & Rechtsgrundlagen (MVP v1)

> Detaillierte Seed-Daten für die 6 Standardmaßnahmen nach **§40 Abs.4 SGB XI** sowie das
> zugehörige Rechtsgrundlagen-Register. Ergänzt `CRM-Datenmodell.md` (Tabellen
> `massnahme_katalog`, `massnahme_komponente`, `rechtsgrundlage`, `nachweis_anforderung`).
>
> **Preise = Standardkalkulation (Richtwerte, brutto inkl. 19 % USt, netto-EK).** Vor
> Produktivbetrieb sind Förderhöhen, Fristen und Paragraphen-Bezüge durch eine Fachjurist:in
> zu verifizieren (Priorität 1: Rechtssicherheit). Gekennzeichnet mit ⚠︎ wo zu prüfen.

---

## 1. Überblick & Bewilligungs-Strategie

Reihenfolge nach **Bewilligungs-Komplexität** (für die Pilotphase: einfachste zuerst):

| Reihenfolge | Code | Maßnahme | VK brutto | Bruttoertrag | Komplexität | Zusatznachweise |
|---|---|---|---|---|---|---|
| 1 | `STD-HALTEGRIFF` | Haltegriffe Bad/WC | ~498 € | ~315 € (63 %) | **niedrig** | keine |
| 2 | `STD-HANDLAUF` | Handläufe Flur/Treppe | ~630 € | ~395 € (63 %) | **niedrig** | keine |
| 3 | `STD-SCHWELLE` | Schwellenabbau/-ausgleich | ~435 € | ~275 € (63 %) | **niedrig** | ggf. Vermieterzustimmung |
| 4 | `STD-RAMPE` | Rampe Hauseingang (modular) | ~1.450 € | ~830 € (57 %) | **mittel** | Maßskizze Steigung, ggf. WEG-/Vermieterzustimmung |
| 5 | `STD-BAD` | Bodengleiche Dusche | ~3.800 € | ~2.200 € (58 %) | **mittel** | Maßskizze, Vermieterzustimmung (Miete) |
| 6 | `STD-TUER` | Türverbreiterung | ~2.300 € | ~1.390 € (60 %) | **mittel–hoch** | Vermieterzustimmung, ggf. **Statiknachweis** (tragende Wand) |

Alle: `foerderfaehig_status = gesichert`, `foerdertopf = 40.4`, Förderdeckel 4.180 € je Maßnahme
(×4 bei mehreren PG-Trägern im Haushalt). Mehrere Maßnahmen kombinierbar bis zum Deckel.

---

## 2. Standardmaßnahmen (detailliert)

Jede Maßnahme: Indikation, DIN-Bezug, vollständige BOM (`massnahme_komponente`), Kalkulation,
Standard-Begründung (Textbaustein mit Platzhaltern) und genutztes Gesetzeskriterium.

> **Die drei Gesetzeskriterien (§40 Abs.4):** (K1) „ermöglicht die häusliche Pflege" ·
> (K2) „erleichtert die häusliche Pflege erheblich" · (K3) „stellt die selbstständige
> Lebensführung (wieder) her". Jede Begründung referenziert **genau eines** als Hauptkriterium.

---

### 2.1 `STD-HALTEGRIFF` — Haltegriffe (Bad/WC)

- **Kategorie:** bad · **DIN 18040-2:** §4.4 (Sanitärräume, Stützklappgriffe)
- **Indikation (typisch):** Gang-/Standunsicherheit, Z. n. Sturz, Gonarthrose (M17.-),
  Z. n. Schlaganfall (I69.-), allgemeine Muskelschwäche/Sarkopenie.
- **Hauptkriterium:** K2 (erhebliche Erleichterung) + Sturzprophylaxe.

| Position | Menge | EK netto | VK brutto |
|---|---|---|---|
| Haltegriff Edelstahl, gerade 60 cm | 2 | 36 € | 98 € |
| Stützklappgriff WC 80 cm | 1 | 55 € | 145 € |
| Befestigungsset (tragfähig, Fliese/Hohlwand) | 1 | 12 € | 35 € |
| Fachmontage inkl. Tragfähigkeitsprüfung (1–2 h) | 1 | 80 € | 220 € |
| **Summe** | | **183 €** | **498 €** |
| **Bruttoertrag / Marge** | | | **315 € · 63 %** |

**Standard-Begründung:**
> „Aufgrund {{diagnose}} ({{icd10}}) mit {{funktionseinschraenkung}} besteht beim Aufstehen,
> Hinsetzen und Stehen im Sanitärbereich ein erhebliches Sturzrisiko. Die Anbringung
> tragfähiger Halte- und Stützklappgriffe nach DIN 18040-2 erleichtert die häusliche Pflege
> erheblich und sichert die selbstständige Körperpflege. Ein Sturz mit Folgeverletzung und
> stationärer Versorgung wäre wirtschaftlich deutlich aufwändiger."

---

### 2.2 `STD-HANDLAUF` — Handläufe (Flur/Treppe)

- **Kategorie:** treppen_lift · **DIN 18040-2:** §4.3.6 (Handläufe Ø 3–4,5 cm, beidseitig)
- **Indikation:** Gangunsicherheit, Treppensturz-Risiko, COPD/Belastungsdyspnoe,
  neurologische Gangstörung.
- **Hauptkriterium:** K2.

| Position | Menge | EK netto | VK brutto |
|---|---|---|---|
| Handlauf Edelstahl Ø 42 mm, 2 m | 2 | 90 € | 240 € |
| Wandhalter + Endkappen-Set | 1 | 25 € | 70 € |
| Fachmontage (tragfähige Befestigung, 2–3 h) | 1 | 110 € | 290 € |
| Kleinmaterial | 1 | 10 € | 30 € |
| **Summe** | | **235 €** | **630 €** |
| **Bruttoertrag / Marge** | | | **395 € · 63 %** |

**Standard-Begründung:**
> „Infolge {{diagnose}} ({{icd10}}) ist die sichere Nutzung von Flur und Treppe ohne
> beidseitige Greifsicherung nicht mehr gewährleistet ({{funktionseinschraenkung}}). Der
> beidseitige Handlauf nach DIN 18040-2 erleichtert die häusliche Pflege erheblich und beugt
> Stürzen vor; er erhält die selbstständige Fortbewegung innerhalb der Wohnung."

---

### 2.3 `STD-SCHWELLE` — Schwellenabbau / -ausgleich

- **Kategorie:** bodenbelag · **DIN 18040-2:** untere Türschwellen **≤ 2 cm** (möglichst 0 cm)
- **Indikation:** Rollator-/Rollstuhlnutzung, Stolpersturz-Risiko, Gangapraxie.
- **Hauptkriterium:** K2 (erhebliche Erleichterung) bzw. K1 bei Rollstuhl.

| Position | Menge | EK netto | VK brutto |
|---|---|---|---|
| Schwellenrampe/-ausgleich Alu/Gummi (innen/außen) | 1 | 35 € | 95 € |
| Absenkbare Türboden-/Bürstendichtung | 1 | 25 € | 70 € |
| Anpassung Türblatt / Bodenausgleich (Arbeit) | 1 | 90 € | 240 € |
| Kleinmaterial | 1 | 10 € | 30 € |
| **Summe** | | **160 €** | **435 €** |
| **Bruttoertrag / Marge** | | | **275 € · 63 %** |

**Standard-Begründung:**
> „Die vorhandene Türschwelle (> 2 cm) stellt bei {{diagnose}} ({{icd10}}) eine erhebliche
> Sturz- bzw. Mobilitätsbarriere dar ({{funktionseinschraenkung}}). Der Schwellenabbau auf
> ein DIN-konformes Maß erleichtert die häusliche Pflege erheblich und ermöglicht die
> sichere Nutzung von Rollator/Rollstuhl innerhalb der Wohnung."

---

### 2.4 `STD-RAMPE` — Rampe Hauseingang (modular)

- **Kategorie:** rampe · **DIN 18040-2:** §4.3.8 (Rampen, Neigung ≤ 6 %, Handlauf, Radabweiser)
- **Indikation:** Rollstuhl-/Rollatornutzung, Z. n. Amputation, hochgradige Gehbehinderung.
- **Hauptkriterium:** K1 (ermöglicht die häusliche Pflege — Zugang zur Wohnung).

| Position | Menge | EK netto | VK brutto |
|---|---|---|---|
| Modulrampe Aluminium (höhenanpassbar) | 1 | 380 € | 850 € |
| Geländer/Handlauf für Rampe | 1 | 120 € | 320 € |
| Anti-Rutsch-Belag | 1 | 40 € | 110 € |
| Montage/Anpassung vor Ort (2–3 h) | 1 | 80 € | 170 € |
| **Summe** | | **620 €** | **1.450 €** |
| **Bruttoertrag / Marge** | | | **830 € · 57 %** |

**Standard-Begründung:**
> „Bei {{diagnose}} ({{icd10}}) ist der Zugang zur Wohnung über die vorhandenen Stufen nicht
> mehr selbstständig oder sicher möglich ({{funktionseinschraenkung}}). Die modulare Rampe
> (Neigung ≤ 6 %, DIN 18040-2) ermöglicht die häusliche Pflege, indem sie das Verlassen und
> Betreten der Wohnung mit Rollator/Rollstuhl überhaupt erst sicherstellt."

---

### 2.5 `STD-BAD` — Badewanne → bodengleiche Dusche

- **Kategorie:** bad · **DIN 18040-2:** §4.4.1 (bodengleiche, rutschhemmende Dusche)
- **Indikation:** Gonarthrose/Coxarthrose (M16.-/M17.-), Z. n. Schlaganfall, eingeschränkte
  Beugefähigkeit/Standsicherheit — kein sicherer Wanneneinstieg mehr.
- **Hauptkriterium:** K3 (stellt selbstständige Lebensführung wieder her) + K1.

| Position | Menge | EK netto | VK brutto |
|---|---|---|---|
| SMC-Duschwanne 170 × 75 cm | 1 | 180 € | 490 € |
| High-Flow Ablaufset | 1 | 15 € | 45 € |
| Alu-Verbundplatten (3er-Set) | 1 | 220 € | 680 € |
| Profile & Spezialkleber | 1 | 40 € | 120 € |
| Glastrennwand 8 mm ESG | 1 | 110 € | 340 € |
| Glasschiebetür-Set (Front) | 1 | 240 € | 750 € |
| Montage (1,5 Tage) | 1 | 750 € | 1.250 € |
| Entsorgung & Kleinmaterial | 1 | 45 € | 125 € |
| **Summe** | | **1.600 €** | **3.800 €** |
| **Bruttoertrag / Marge** | | | **2.200 € · 58 %** |

**Standard-Begründung:**
> „Aufgrund {{diagnose}} ({{icd10}}) mit {{funktionseinschraenkung}} ist ein sicheres Ein- und
> Aussteigen in die vorhandene Badewanne nicht mehr möglich; es besteht erhebliches
> Sturzrisiko. Die Umrüstung auf eine bodengleiche, rutschhemmende Dusche mit Haltegriffen
> nach DIN 18040-2 stellt die selbstständige Körperpflege wieder her und ermöglicht die
> häusliche Pflege, die andernfalls stationärer Versorgung bedürfte."

---

### 2.6 `STD-TUER` — Türverbreiterung

- **Kategorie:** tueren · **DIN 18040-2:** §4.3.3 (lichte Durchgangsbreite **≥ 90 cm**)
- **Indikation:** Rollstuhlnutzung, Pflegebett-/Hilfsmittelzugang, hochgradige Mobilitäts-
  einschränkung.
- **Hauptkriterium:** K1 (ermöglicht die häusliche Pflege — Erreichbarkeit der Räume).
- **⚠︎ Hinweis:** Bei **tragenden Wänden** Statiknachweis/Sturzberechnung erforderlich; bei
  Miete Vermieterzustimmung Pflicht. Diese Zusatznachweise werden in v1 als Pflicht-Checkpunkte
  geführt.

| Position | Menge | EK netto | VK brutto |
|---|---|---|---|
| Demontage alte Zarge/Tür + Entsorgung | 1 | 60 € | 180 € |
| Stemm-/Maurerarbeiten Laibung verbreitern (≥ 90 cm lichte Breite) | 1 | 280 € | 720 € |
| Neue Zarge + barrierefreies Türblatt 90 cm | 1 | 240 € | 560 € |
| Putz-/Maleranpassung | 1 | 90 € | 240 € |
| Montage inkl. Sturz/Statik-Anpassung | 1 | 200 € | 480 € |
| Entsorgung/Kleinmaterial | 1 | 40 € | 120 € |
| **Summe** | | **910 €** | **2.300 €** |
| **Bruttoertrag / Marge** | | | **1.390 € · 60 %** |

**Standard-Begründung:**
> „Bei {{diagnose}} ({{icd10}}) ist {{funktionseinschraenkung}}; die vorhandene
> Türdurchgangsbreite (< 90 cm) verhindert das Erreichen wesentlicher Wohnräume mit
> Rollstuhl/Rollator. Die Türverbreiterung auf ≥ 90 cm lichte Breite (DIN 18040-2) ermöglicht
> die häusliche Pflege, da Bad/Schlafraum andernfalls nicht erreichbar sind."

---

## 3. Nachweis-Profil je Maßnahme (`nachweis_anforderung`)

**Globale §40-Pflichtnachweise (für ALLE Standardmaßnahmen):**
Antrag-vor-Beginn · Begründung (1 Kriterium) · ärztliches Attest (ICD-10 +
Funktionseinschränkung) · detaillierter Kostenvoranschlag · Fotos Ist-Zustand ·
Einwilligung DSGVO · Abtretungserklärung §398 (für 0 €-Modell).

**Maßnahmenspezifische Zusatznachweise:**

| Maßnahme | Zusatz-Pflichtnachweis | Auslöser |
|---|---|---|
| `STD-HALTEGRIFF` | — | — |
| `STD-HANDLAUF` | — | — |
| `STD-SCHWELLE` | Vermieterzustimmung | wenn `wohnform = miete` |
| `STD-RAMPE` | Maßskizze Steigung; WEG-/Vermieterzustimmung | Außenbereich/Gemeinschaftsfläche |
| `STD-BAD` | Maßskizze/Grundriss; Vermieterzustimmung | `wohnform = miete` |
| `STD-TUER` | Vermieterzustimmung; **Statiknachweis** | Miete bzw. tragende Wand |

> Diese Zusatznachweise werden in `nachweis_anforderung` mit `massnahme_kategorie`-Bezug bzw.
> bedingter Pflicht (`wohnform`) hinterlegt und von der Vollständigkeitsprüfung (§7.4) erzwungen.

---

## 4. Rechtsgrundlagen-Register (`rechtsgrundlage`)

| Kürzel | Typ | Datum | Kerninhalt | Relevanz / Flag |
|---|---|---|---|---|
| **§ 40 Abs. 4 SGB XI** | gesetz | — | Zuschuss zu **wohnumfeldverbessernden Maßnahmen** bis **4.180 €** je Maßnahme, wenn die häusliche Pflege dadurch *ermöglicht*, *erheblich erleichtert* oder *selbstständige Lebensführung wiederhergestellt* wird. Subsidiär, individuell (keine Pauschale). | Anspruchsgrundlage aller v1-Maßnahmen |
| **§ 28a Abs. 1 Nr. 5 SGB XI** | gesetz | — | Öffnet §40 Abs.4 auch für **Pflegegrad 1**. | ermöglicht PG-1-Förderung |
| **§ 40 Abs. 4 S. … SGB XI (Entscheidungsfrist)** ⚠︎ | gesetz | — | Entscheidung der Pflegekasse binnen **3 Wochen** (bzw. **5 Wochen** bei MD-Begutachtung); bei Fristüberschreitung **Genehmigungsfiktion**. ⚠︎ konkrete Norm/Frist vor Go-live juristisch bestätigen. | Fristen-/Fiktions-Engine |
| **§ 398 BGB** | gesetz | — | **Abtretung** einer Forderung; Grundlage des 0 €-Modells (Direktabrechnung CareCoach ↔ Pflegekasse, keine Vorleistung des Klienten). | Abtretungserklärung |
| **DIN 18040-2** | richtlinie | 2011 | Technische Planungsgrundlage **barrierefreies Bauen – Wohnungen** (Durchgangsbreiten ≥ 90 cm, Schwellen ≤ 2 cm, Rampen ≤ 6 %, Sanitärräume/Haltegriffe). | technischer Referenzrahmen aller Maßnahmen |
| **BSG B 3 P 4/16 R** | urteil | 25.01.2017 | Elektrische **Türantriebe** = wohnumfeldverbessernde Maßnahme nach §40 Abs.4 (fest eingebaut, verbleibt). | `foerderfaehig` |
| **BSG B 3 P 5/22 R** | urteil | 30.11.2023 | Kabellose **Video-Gegensprechanlage** NICHT §40-förderfähig (GKV-Zuständigkeit §33 SGB V). | `nicht_foerderfaehig` |

> **Bezug zu v1-Maßnahmen:** Alle sechs Standardmaßnahmen sind fest mit der Bausubstanz
> verbunden und verbleiben bei Auszug → sie fallen unmittelbar unter §40 Abs.4
> (`foerderfaehig_status = gesichert`). Die BSG-Urteile dienen v. a. der Abgrenzung
> (was NICHT in den MVP-Katalog gehört) und als Argumentationsreserve.

---

## 5. Mapping auf das Datenmodell (Seed-Zuordnung)

| Dieses Dokument | Zieltabelle (CRM-Datenmodell.md) |
|---|---|
| §2 Kopf je Maßnahme | `massnahme_katalog` (code, bezeichnung, kategorie, din18040_ref, foerderfaehig_status, standard_begruendung, standard_vk_brutto, standard_ek_netto) |
| §2 BOM-Tabellen | `massnahme_komponente` (position, menge, ek_netto, vk_brutto, ist_montage) |
| §3 Nachweis-Profile | `nachweis_anforderung` (foerdertopf_id=40.4, nachweis_typ_id, pflicht, massnahme_kategorie/Bedingung) |
| §4 Register | `rechtsgrundlage` (typ, kuerzel, datum, kerninhalt, relevanz) + `foerdertopf` (40.4 = 4.180 €) |

→ Diese Tabellen bilden die **Seed-Daten** der Hybrid-Service-Schicht (Mock-Repository) und
später die PostgreSQL-Migration.
