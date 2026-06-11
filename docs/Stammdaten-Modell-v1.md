# CareCoach Pro — Implementiertes Stammdaten-Modell (Phase 2)

> Stand: Service-Schicht implementiert (Typen + Seed + Repositories + Prüfungen).
> **Noch nicht enthalten:** Projekt-/Antragserstellung (UI/Workflow) — bewusst zurückgestellt.
> Geprüft via Integritäts-Self-Check (`ok: true`) und `tsc` strict (Build grün).

## 1. Implementierte Bausteine (Code)

| Datei | Inhalt |
|---|---|
| `src/domain/types.ts` | Alle Entitäts-Typen + Enums (Domänenmodell) |
| `src/domain/seed.ts` | Standorte, Fördertopf §40.4, Rechtsgrundlagen, 6 Maßnahmen (BOM) |
| `src/domain/stammdatenSeed.ts` | Kassen, Pflegeunternehmen, Dienstleister, Nachweismatrix, Fristen, Ablehnungs-/Widerspruchsgründe |
| `src/domain/pruefung.ts` | `pruefeAntrag()` — 11-Punkte-Vollständigkeitsprüfung |
| `src/domain/integritaet.ts` | `pruefeStammdatenIntegritaet()` — referenzielle Konsistenz |
| `src/services/repository.ts` | Austauschbare Repository-Verträge (`CareCoachRepository`) |
| `src/services/localStorageRepository.ts` | Mock-Implementierung (LocalStorage + Seed) |

## 2. Entitäten-Inventar

**Operativ (CRUD):** `Kunde` (+ `Angehoeriger`, `AmbulantePflege`), `Kasse` (+ `KasseAnsprechpartner`),
`Pflegeunternehmen` (+ `PflegeunternehmenAnsprechpartner`), `Dienstleister`,
`Projekt` (+ `ProjektMassnahme`)*, `Antrag` (+ `ProjektNachweis`)*.
*\*Repository vorhanden, Erstellung/UI bewusst noch nicht aktiv.*

**Kataloge / Recht (read-only Seed):** `Standort`, `Foerdertopf`, `Rechtsgrundlage`,
`MassnahmeKatalog` (+ `MassnahmeKomponente`), `NachweisTyp`, `NachweisAnforderung`,
`FristRegel`, `Ablehnungsgrund`, `Widerspruchsgrund`.

## 3. Beziehungen (implementierte Fremdschlüssel)

| Von | Feld | Nach | Kardinalität |
|---|---|---|---|
| Kunde | `standort_id` | Standort | n:1 |
| Pflegeunternehmen | `standort_id` | Standort | n:1 |
| Foerdertopf | `rechtsgrundlage_id` | Rechtsgrundlage | n:1 |
| MassnahmeKatalog | `foerdertopf_id` | Foerdertopf | n:1 |
| MassnahmeKatalog | `rechtsgrundlage_id` | Rechtsgrundlage | n:1 |
| MassnahmeKatalog | `komponenten[]` | MassnahmeKomponente | 1:n |
| MassnahmeKatalog | `zusatz_nachweise[]` | NachweisTyp (code) | n:m |
| MassnahmeKatalog | `benoetigte_gewerke[]` | Gewerk (enum) | n:m |
| NachweisAnforderung | `foerdertopf_id` | Foerdertopf | n:1 |
| NachweisAnforderung | `nachweis_code` | NachweisTyp | n:1 |
| NachweisTyp | `rechtsgrundlage_id?` | Rechtsgrundlage | n:1 |
| FristRegel | `foerdertopf_id` | Foerdertopf | 1:1 |
| Ablehnungsgrund | `widerspruchsgrund_ids[]` | Widerspruchsgrund | n:m |
| Widerspruchsgrund | `rechtsgrundlage_id?` | Rechtsgrundlage | n:1 |
| Projekt | `kunde_id`, `standort_id` | Kunde, Standort | n:1 |
| Antrag | `projekt_id`, `foerdertopf_id` | Projekt, Foerdertopf | n:1 |

## 4. Pflichtnachweismatrix §40 Abs.4 (`NACHWEIS_ANFORDERUNGEN`)

| Nachweis | Pflicht | Bedingung |
|---|---|---|
| Antrag vor Beginn | ✓ | immer |
| Begründung (Kriterium) | ✓ | immer |
| Ärztliches Attest | ✓ | immer |
| Kostenvoranschlag | ✓ | immer |
| Fotos Ist-Zustand | ✓ | immer |
| Einwilligung DSGVO | ✓ | immer |
| Abtretung §398 | ✓ | 0-€-Modell |
| Vollmacht | – | falls Angehöriger handelt |
| Vermieterzustimmung | ✓ | `wohnform = miete` |
| Maßskizze | ✓ | Kategorie `bad`, `rampe` |
| Statiknachweis | ✓ | Kategorie `tueren` (tragende Wand) |

## 5. Fristen (`FRIST_REGELN`, §40.4)

Entscheidungsfrist **21 Tage** · mit MD **35 Tage** · Genehmigungsfiktion **ja** ·
Widerspruchsfrist **30 Tage** · Umsetzungsfrist **180 Tage**. (Norm-Bezug ⚠︎ vor Go-live prüfen.)

## 6. Ablehnungs-/Widerspruchs-Mapping

6 typische Ablehnungsgründe mit empfohlener Reaktion und verknüpften Widerspruchsgründen
(5). Beispiel: „Maßnahme nicht erforderlich" → Widerspruch via Funktionsbezug + Attest.
„Vor Antragstellung begonnen" → kein erfolgversprechender Widerspruch (durch Prüfpunkt 2
vorab vermeidbar).

## 7. Verifikation (Ergebnisse)

**Integritätsprüfung** (`pruefeStammdatenIntegritaet`, ausgeführt):
```
ok: true · probleme: []
Standorte 1 · Fördertöpfe 1 · Rechtsgrundlagen 7 · Maßnahmen 6 · Kassen 4 ·
Pflegeunternehmen 2 · Dienstleister 9 · Nachweistypen 11 · Nachweis-Anforderungen 12 ·
Fristregeln 1 · Ablehnungsgründe 6 · Widerspruchsgründe 5
```
Geprüft: alle FK-Referenzen auflösbar; alle Nachweis-Codes existieren; BOM-Summen =
`standard_ek_netto`/`standard_vk_brutto` je Maßnahme.

**Typprüfung:** `tsc -b` (strict) + `vite build` grün.

## 8. Repository-Vertrag (`CareCoachRepository`)

`kunden`, `kassen`, `pflegeunternehmen`, `dienstleister` → volle CRUD.
`projekte`, `antraege` → CRUD vorhanden (Erstellung-UI folgt).
`stammdaten` → read-only Kataloge inkl. `nachweisAnforderungen(topf)`, `fristRegel(topf)`,
`ablehnungsgruende()`, `widerspruchsgruende()`.

→ Identische Signaturen für die spätere HTTP/FastAPI-Implementierung (Hybrid-Strategie).

## 9. Bewusst noch offen (nächste Phase)

- Projekt-/Antragserstellung (Workflow + UI) inkl. Maßnahmenauswahl und Live-Vollständigkeitsprüfung.
- Anbindung der bestehenden Dashboard-UI an `CareCoachRepository` (Ablösung des alten `KundenContext`).
- Dokumentengenerator (Vorlagen → generierte Dokumente).
