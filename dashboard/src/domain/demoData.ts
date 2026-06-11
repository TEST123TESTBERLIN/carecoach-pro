// CareCoach Pro — Demo-/Pilotdaten (Sprint 1).
// Eine vollständige Beispiel-Akte (Kunde → Projekt → Antrag → Dokumente) für den
// Pilottest. Bewusst so gewählt, dass die Vollständigkeitsprüfung (pruefung.ts) grün ist.
// Maßnahmen-Auswahl: BAD-001 (Haltegriff WC) + WOHN-003 (Schwellenrampe) + SICH-001 (Bewegungsmelder).

import type { Kunde, Projekt, Antrag, Dokument, ProjektNachweis } from './types';
import { GLOBALE_NACHWEISE, NACHWEIS_BEZEICHNUNG } from './seed';
import type { PruefKontext } from './pruefung';

// --- Demo-Klientin ---
export const DEMO_KUNDE: Kunde = {
  id: 'demo-k-meier',
  standort_id: 'st-berlin',
  vorname: 'Elisabeth',
  nachname: 'Meier',
  geburtsdatum: '1947-03-14', // 78 Jahre (Stand 2026)
  strasse: 'Musterstraße 12',
  plz: '10115',
  ort: 'Berlin',
  bundesland: 'BE',
  telefon: '030 12345678',
  email: 'e.meier@beispiel.de',
  pflegegrad: 3,
  hauptdiagnose: 'Gonarthrose beidseits',
  icd10_codes: ['M17.1', 'Z87.39'],
  krankenkasse: 'AOK Nordost',
  krankenkasse_ansprechpartner: 'Frau Wagner',
  pflegekasse: 'AOK Nordost',
  versichertennummer: 'A123456789',
  personen_mit_pflegegrad: 1, // Förder-Multiplikator 1 → Deckel 4.180 €
  wohnform: 'miete',
  angehoeriger: {
    name: 'Michael Meier',
    beziehung: 'kind',
    telefon: '0171 9876543',
    email: 'm.meier@beispiel.de',
    ist_hauptkontakt: true,
    ist_bevollmaechtigter: true,
  },
  ambulante_pflege: {
    dienst: 'Pflegeteam Berlin GmbH',
    kontaktperson: 'Sandra Koch',
    telefon: '030 98765433',
  },
  einwilligung_dsgvo: true,
  einwilligung_datum: '2026-05-28',
  lebenszyklus: 'aktiv',
  notiz: 'Demo-Klientin (Pilottest). Sohn als Bevollmächtigter, Abtretung § 398 BGB unterschrieben.',
  erstellt_am: '2026-05-28T09:00:00.000Z',
  geaendert_am: '2026-06-01T09:00:00.000Z',
};

// --- Demo-Projekt mit 3 ausgewählten Maßnahmen (0-€-Modell via Abtretung) ---
export const DEMO_PROJEKT: Projekt = {
  id: 'demo-p-meier',
  projektnummer: 'CCP-2026-0001',
  standort_id: 'st-berlin',
  kunde_id: 'demo-k-meier',
  titel: 'Wohnumfeldverbesserung Bad & Flur — E. Meier',
  pipeline_status: 'antrag',
  abtretung_aktiv: true,
  massnahmen: [
    {
      id: 'demo-pm-1',
      massnahme_id: 'mk-bad-haltegriff-wc', // BAD-001
      bezeichnung: 'Haltegriff WC wandmontiert 60 cm',
      foerdertopf_id: 'ft-40-4',
      vk_brutto: 180,
      ek_netto: 55,
      foerderbetrag_beantragt: 180,
      raum: 'Bad/WC',
      begruendung:
        'Aufgrund der Gonarthrose beidseits (M17.1) mit eingeschränkter Beugefähigkeit der ' +
        'Kniegelenke ist das selbstständige Hinsetzen und Aufstehen am WC nicht mehr sicher ' +
        'möglich. Der wandmontierte Haltegriff erleichtert die häusliche Pflege erheblich und ' +
        'sichert die selbstständige Körperpflege.',
    },
    {
      id: 'demo-pm-2',
      massnahme_id: 'mk-wohn-schwellenrampe-innen', // WOHN-003
      bezeichnung: 'Schwellenrampe innen (Alu)',
      foerdertopf_id: 'ft-40-4',
      vk_brutto: 180,
      ek_netto: 45,
      foerderbetrag_beantragt: 180,
      raum: 'Flur',
      begruendung:
        'Die Türschwelle zwischen Flur und Wohnraum stellt bei Gonarthrose beidseits (M17.1) ' +
        'eine erhebliche Sturz- und Mobilitätsbarriere dar. Die innenliegende Alu-Schwellenrampe ' +
        'erleichtert die häusliche Pflege erheblich und ermöglicht die sichere Nutzung des Rollators.',
    },
    {
      id: 'demo-pm-3',
      massnahme_id: 'mk-sich-bewegungsmelder', // SICH-001
      bezeichnung: 'Bewegungsmelder-Beleuchtung Flur',
      foerdertopf_id: 'ft-40-4',
      vk_brutto: 280,
      ek_netto: 85,
      foerderbetrag_beantragt: 280,
      raum: 'Flur',
      begruendung:
        'Bei Gonarthrose beidseits (M17.1) besteht im Flur ein nächtliches Sturzrisiko. Die ' +
        'bewegungsgesteuerte Beleuchtung erleichtert die häusliche Pflege erheblich und beugt ' +
        'Stürzen vor.',
    },
  ],
  erstellt_am: '2026-05-29T10:00:00.000Z',
  geaendert_am: '2026-06-01T09:00:00.000Z',
};

// Beantragte Gesamtförderung (Summe der Maßnahmen): 180 + 180 + 280 = 640 € (≤ Deckel 4.180 €).
const DEMO_FOERDERSUMME = DEMO_PROJEKT.massnahmen.reduce(
  (s, m) => s + m.foerderbetrag_beantragt,
  0,
);

// --- Nachweis-Checkliste: §40-Pflichtprofil + Vermieterzustimmung (Miete) + Vollmacht (Sohn) ---
const DEMO_NACHWEISE: ProjektNachweis[] = [
  ...GLOBALE_NACHWEISE.map(
    (n): ProjektNachweis => ({
      code: n.code,
      bezeichnung: n.bezeichnung,
      pflicht: true,
      status: 'vorhanden',
    }),
  ),
  {
    code: 'vermieterzustimmung',
    bezeichnung: NACHWEIS_BEZEICHNUNG.vermieterzustimmung,
    pflicht: true, // Mietwohnung
    status: 'vorhanden',
  },
  {
    code: 'vollmacht',
    bezeichnung: NACHWEIS_BEZEICHNUNG.vollmacht,
    pflicht: false, // Sohn handelt als Bevollmächtigter
    status: 'vorhanden',
  },
];

// --- Demo-Antrag (eingereicht, fristgerecht vor Maßnahmenbeginn) ---
export const DEMO_ANTRAG: Antrag = {
  id: 'demo-a-meier',
  antragsnummer: 'CCP-A-2026-0001',
  projekt_id: 'demo-p-meier',
  foerdertopf_id: 'ft-40-4',
  kasse: 'AOK Nordost',
  status: 'eingereicht',
  gestellt_am: '2026-06-01',
  eingangsbestaetigung_am: '2026-06-02',
  entscheidungsfrist: '2026-06-22', // 21 Tage
  genehmigungsfiktion_ab: '2026-06-22',
  beantragter_betrag: DEMO_FOERDERSUMME,
  geplanter_umsetzungsbeginn: '2026-07-01', // nach Antragstellung
  nachweise: DEMO_NACHWEISE,
};

// --- Demo-Dokumente (Pflicht-Antragspaket inkl. unterschriebener Abtretung & Vollmacht) ---
export const DEMO_DOKUMENTE: Dokument[] = [
  {
    id: 'demo-d-foto',
    projekt_id: 'demo-p-meier',
    kunde_id: 'demo-k-meier',
    antrag_id: 'demo-a-meier',
    kategorie: 'foto',
    titel: 'Fotos Ist-Zustand Bad & Flur',
    status: 'generiert',
    unterschrift_erforderlich: false,
    unterschrieben: false,
    erstellt_am: '2026-05-29T10:30:00.000Z',
  },
  {
    id: 'demo-d-kva',
    projekt_id: 'demo-p-meier',
    kunde_id: 'demo-k-meier',
    antrag_id: 'demo-a-meier',
    kategorie: 'kostenvoranschlag',
    titel: 'Detaillierter Kostenvoranschlag (3 Maßnahmen)',
    status: 'generiert',
    unterschrift_erforderlich: false,
    unterschrieben: false,
    erstellt_am: '2026-05-30T11:00:00.000Z',
  },
  {
    id: 'demo-d-abtretung',
    projekt_id: 'demo-p-meier',
    kunde_id: 'demo-k-meier',
    antrag_id: 'demo-a-meier',
    kategorie: 'abtretungserklaerung',
    titel: 'Abtretungserklärung § 398 BGB',
    status: 'unterschrieben',
    unterschrift_erforderlich: true,
    unterschrieben: true,
    erstellt_am: '2026-05-28T14:00:00.000Z',
  },
  {
    id: 'demo-d-vollmacht',
    projekt_id: 'demo-p-meier',
    kunde_id: 'demo-k-meier',
    antrag_id: 'demo-a-meier',
    kategorie: 'vollmacht',
    titel: 'Vollmacht Michael Meier (Sohn)',
    status: 'unterschrieben',
    unterschrift_erforderlich: true,
    unterschrieben: true,
    erstellt_am: '2026-05-28T14:00:00.000Z',
  },
];

// Fertig verdrahteter Prüfkontext — direkt an pruefeAntrag() übergebbar (Pilot-Self-Check).
export const DEMO_PRUEFKONTEXT: PruefKontext = {
  antrag: DEMO_ANTRAG,
  projekt: DEMO_PROJEKT,
  kunde: DEMO_KUNDE,
  dokumente: DEMO_DOKUMENTE,
  rechtsgrundlageVorhanden: true,
};
