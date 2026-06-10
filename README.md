# CareCoach Pro

> Integriertes Dienstleistungs- und Software-Unternehmen für die ambulante Pflege in
> Deutschland — Start in Berlin, Skalierung deutschlandweit.

CareCoach Pro kombiniert Leistungen, die ambulante Pflegedienste strukturell **nicht
erbringen dürfen oder können**: Wohnumfeldverbesserung (§40 Abs.4 SGB XI), Alltagsunterstützung
(§45b), KfW-Barrierereduzierung, AAL-Sturzerkennung, ein B2B-SaaS für Pflegedienste sowie
Premium-Direktverkauf. Kern ist das **0€-Eigenanteil-Modell** über Abtretung nach §398 BGB:
Der Klient zahlt nichts, die Pflegekasse zahlt direkt an CareCoach Pro.

## Repository-Aufbau

Dieses Monorepo bündelt drei unabhängig getoolte Teilprojekte plus Dokumentation:

| Verzeichnis | Stack | Zweck |
|---|---|---|
| `app/` | Flutter 3.x / Dart (iOS · iPadOS) | KI-Raumscan (Apple RoomPlan/LiDAR + Vision), Förder-Kalkulator, Antragsstellung vor Ort |
| `backend/` | Python (FastAPI), PostgreSQL + Redis | REST/JSON + WebSocket API, §40-Antragsgenerator (Claude/GPT-4o Vision), PDF-Erzeugung |
| `dashboard/` | React 18 + TypeScript + Tailwind | Desktop-CRM für Klienten, Maßnahmen, Margen und Pflegedienst-Provisionen |
| `docs/` | — | Dokumentation |

> **Status:** Frühe Scaffolding-Phase — die Teilprojekt-Verzeichnisse sind noch leer.
> Build-, Lint- und Test-Befehle werden in `CLAUDE.md` ergänzt, sobald die jeweiligen
> Projekte angelegt sind.

## Architektur (Überblick)

```
Flutter App (iOS/iPad)  ─┐
                         ├─ REST/JSON + WebSocket ─→  FastAPI Backend ─→ PostgreSQL + Redis
React Dashboard (Web)   ─┘                                  │
                                                            └─→ KI: Claude Vision / GPT-4o, PDF-Generator
```

Das gemeinsame Datenmodell (Klient, Raumscan, Maßnahmen-Paket, Antrag) ist der Vertrag
zwischen App, Backend und Dashboard. Siehe `CLAUDE.md` für das vollständige JSON-Schema,
die Förder-Logik und die rechtlichen/compliance-relevanten Vorgaben.

## Wichtige Compliance-Hinweise

- **Förderbudget §40 Abs.4:** bis 4.180€ je Maßnahme, multipliziert mit der Zahl der
  Pflegegrad-Träger im Haushalt (max. 4 → bis 16.720€).
- **Verbotenes Wording** (z. B. bei AAL/Vayyar): keine „garantierte Kostenübernahme",
  keine Behauptung einer GKV-Hilfsmittel-Listung. Immer: „bezuschussungsfähig als
  wohnumfeldverbessernde Maßnahme nach §40 Abs.4 SGB XI — Einzelfallentscheidung der Pflegekasse".
- Kunden-Ansicht (0€ Eigenanteil) und interne Margenkalkulation strikt getrennt halten.

## Mitwirken

- Produktionsreifer Code ohne Platzhalter/TODOs; deutsche Inline-Kommentare.
- TypeScript strict mode bzw. Dart null-safety, vollständige Typisierung.
- Secrets gehören in `.env` (nicht committen) — siehe `.gitignore`.
