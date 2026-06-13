// CareCoach Pro — Seed-Daten (MVP v1)
// Quelle: docs/Massnahmenkatalog-v1.md. Diese Stammdaten initialisieren die
// Mock-Repositories und entsprechen 1:1 der späteren PostgreSQL-Migration.

import type {
  Standort,
  Rechtsgrundlage,
  Foerdertopf,
  MassnahmeKatalog,
  MassnahmeKomponente,
  NachweisCode,
} from './types';

// --- Standort (v1: nur Berlin) ---
export const STANDORTE: Standort[] = [
  { id: 'st-berlin', name: 'Berlin', bundesland: 'BE', leitkasse: 'AOK Nordost', aktiv: true },
];

// --- Rechtsgrundlagen-Register ---
export const RECHTSGRUNDLAGEN: Rechtsgrundlage[] = [
  {
    id: 'rg-40-4',
    typ: 'gesetz',
    kuerzel: '§ 40 Abs. 4 SGB XI',
    titel: 'Zuschüsse zu wohnumfeldverbessernden Maßnahmen',
    kerninhalt:
      'Zuschuss bis 4.180 € je Maßnahme, wenn die häusliche Pflege dadurch ermöglicht, ' +
      'erheblich erleichtert oder die selbstständige Lebensführung wiederhergestellt wird. ' +
      'Individuell, subsidiär, keine Pauschale.',
  },
  {
    id: 'rg-28a',
    typ: 'gesetz',
    kuerzel: '§ 28a Abs. 1 Nr. 5 SGB XI',
    titel: 'Leistungen für Pflegegrad 1',
    kerninhalt: 'Öffnet den Anspruch nach § 40 Abs. 4 auch für Pflegegrad 1.',
  },
  {
    id: 'rg-frist',
    typ: 'gesetz',
    kuerzel: '§ 40 SGB XI (Entscheidungsfrist)',
    titel: 'Entscheidungsfrist & Genehmigungsfiktion',
    kerninhalt:
      'Entscheidung binnen 3 Wochen (5 Wochen mit MD-Begutachtung); bei Fristüberschreitung ' +
      'Genehmigungsfiktion. ⚠︎ Konkrete Norm/Frist vor Go-live juristisch bestätigen.',
  },
  {
    id: 'rg-398',
    typ: 'gesetz',
    kuerzel: '§ 398 BGB',
    titel: 'Abtretung',
    kerninhalt:
      'Abtretung der Forderung; Grundlage des 0-€-Modells (Direktabrechnung mit der Pflegekasse).',
  },
  {
    id: 'rg-din18040',
    typ: 'richtlinie',
    kuerzel: 'DIN 18040-2',
    titel: 'Barrierefreies Bauen — Wohnungen',
    datum: '2011-09-01',
    kerninhalt:
      'Technische Planungsgrundlage: Durchgangsbreiten ≥ 90 cm, Schwellen ≤ 2 cm, ' +
      'Rampen ≤ 6 %, Sanitärräume/Haltegriffe.',
  },
  {
    id: 'rg-bsg-4-16',
    typ: 'urteil',
    kuerzel: 'BSG B 3 P 4/16 R',
    titel: 'Elektrische Türantriebe',
    datum: '2017-01-25',
    kerninhalt: 'Elektrische Türantriebe sind wohnumfeldverbessernde Maßnahme nach § 40 Abs. 4.',
    relevanz: 'foerderfaehig',
  },
  {
    id: 'rg-bsg-5-22',
    typ: 'urteil',
    kuerzel: 'BSG B 3 P 5/22 R',
    titel: 'Video-Gegensprechanlage',
    datum: '2023-11-30',
    kerninhalt: 'Kabellose Video-Gegensprechanlage ist nicht § 40-förderfähig (GKV § 33 SGB V).',
    relevanz: 'nicht_foerderfaehig',
  },
  {
    id: 'rg-40-1',
    typ: 'gesetz',
    kuerzel: '§ 40 Abs. 1 SGB XI',
    titel: 'Pflegehilfsmittel (technisch)',
    kerninhalt:
      'Anspruch auf Pflegehilfsmittel, die zur Erleichterung der Pflege, zur Linderung der ' +
      'Beschwerden oder zur selbstständigeren Lebensführung beitragen (z. B. Pflegebett).',
  },
  {
    id: 'rg-40-2',
    typ: 'gesetz',
    kuerzel: '§ 40 Abs. 2 SGB XI',
    titel: 'Zum Verbrauch bestimmte Pflegehilfsmittel',
    kerninhalt:
      'Monatlicher Höchstbetrag für Verbrauchshilfsmittel (z. B. Handschuhe, Desinfektion). ' +
      '⚠︎ Betrag (40 €/42 €) und Stand vor Go-live verifizieren.',
  },
  {
    id: 'rg-40-3',
    typ: 'gesetz',
    kuerzel: '§ 40 Abs. 3 SGB XI',
    titel: 'Leihweise Überlassung / Eigenanteil',
    kerninhalt:
      'Technische Pflegehilfsmittel vorrangig leihweise; bei Erwerb Eigenanteil 10 %, ' +
      'höchstens 25 € je Hilfsmittel. ⚠︎ vor Go-live verifizieren.',
  },
  {
    id: 'rg-40-5',
    typ: 'gesetz',
    kuerzel: '§ 40 Abs. 5 SGB XI',
    titel: 'Wohnumfeld — ergänzende Regelungen',
    kerninhalt:
      '⚠︎ Inhalt/Existenz im aktuell geltenden SGB XI juristisch zu verifizieren ' +
      '(ergänzende Regelungen zu Höchstbeträgen/Eigenanteil bei wohnumfeldverbessernden Maßnahmen).',
  },
  {
    id: 'rg-18',
    typ: 'gesetz',
    kuerzel: '§ 18 SGB XI',
    titel: 'Begutachtung durch den Medizinischen Dienst',
    kerninhalt:
      'Regelt die Begutachtung (MD) und zugehörige Fristen; relevant für die verlängerte ' +
      'Entscheidungsfrist bei MD-Einschaltung.',
  },
  {
    id: 'rg-45b',
    typ: 'gesetz',
    kuerzel: '§ 45b SGB XI',
    titel: 'Entlastungsbetrag',
    kerninhalt:
      'Entlastungsbetrag 131 €/Monat ab Pflegegrad 1 für qualitätsgesicherte Angebote zur ' +
      'Unterstützung im Alltag; übertragbar bis 30.06. des Folgejahres.',
  },
  {
    id: 'rg-kfw',
    typ: 'richtlinie',
    kuerzel: 'KfW 455-B',
    titel: 'Investitionszuschuss Barrierereduzierung',
    kerninhalt:
      'Zuschuss bis 6.250 € (12,5 % von max. 50.000 € förderfähigen Kosten); kein Pflegegrad ' +
      'erforderlich; mit § 40 für unterschiedliche Maßnahmenteile kombinierbar (getrennte Rechnungen).',
  },
  {
    id: 'rg-33-sgbv',
    typ: 'gesetz',
    kuerzel: '§ 33 SGB V',
    titel: 'Hilfsmittel (gesetzliche Krankenversicherung)',
    kerninhalt:
      'Anspruch auf Hilfsmittel der GKV (z. B. Duschhocker, Toilettensitzerhöhung). Vorrangig ' +
      'vor § 40 SGB XI zu prüfen; Versorgung über Hilfsmittelverzeichnis / ärztliche Verordnung.',
  },
  {
    id: 'rg-widerspruch',
    typ: 'gesetz',
    kuerzel: '§ 84 SGG',
    titel: 'Widerspruch (Sozialgerichtsverfahren)',
    kerninhalt:
      'Widerspruch gegen den Bescheid binnen eines Monats nach Bekanntgabe; schriftlich oder ' +
      'zur Niederschrift bei der Kasse.',
  },
];

// --- Fördertöpfe (MVP: §40 Abs.4; weitere als Referenz) ---
export const FOERDERTOEPFE: Foerdertopf[] = [
  {
    id: 'ft-40-4',
    code: '40.4',
    bezeichnung: 'Wohnumfeldverbessernde Maßnahmen',
    rechtsgrundlage_id: 'rg-40-4',
    max_betrag: 4180,
    betrag_einheit: 'je_massnahme',
    multiplikator_moeglich: true,
    max_multiplikator: 4,
    ab_pflegegrad: 1,
    pflegegrad_erforderlich: true,
    art: 'kostenerstattung',
  },
  {
    id: 'ft-40-1',
    code: '40.1',
    bezeichnung: 'Technische Pflegehilfsmittel',
    rechtsgrundlage_id: 'rg-40-1',
    max_betrag: 0, // einzelfallabhängig / Sachleistung
    betrag_einheit: 'einmalig',
    multiplikator_moeglich: false,
    max_multiplikator: 1,
    ab_pflegegrad: 1,
    pflegegrad_erforderlich: true,
    art: 'sachleistung',
  },
  {
    id: 'ft-40-2',
    code: '40.2',
    bezeichnung: 'Verbrauchshilfsmittel',
    rechtsgrundlage_id: 'rg-40-2',
    max_betrag: 42, // ⚠︎ Betrag vor Go-live verifizieren
    betrag_einheit: 'monatlich',
    multiplikator_moeglich: false,
    max_multiplikator: 1,
    ab_pflegegrad: 1,
    pflegegrad_erforderlich: true,
    art: 'sachleistung',
  },
  {
    id: 'ft-45b',
    code: '45b',
    bezeichnung: 'Entlastungsbetrag',
    rechtsgrundlage_id: 'rg-45b',
    max_betrag: 131,
    betrag_einheit: 'monatlich',
    multiplikator_moeglich: false,
    max_multiplikator: 1,
    ab_pflegegrad: 1,
    pflegegrad_erforderlich: true,
    art: 'kostenerstattung',
  },
  {
    id: 'ft-33-sgbv',
    code: '33',
    bezeichnung: 'Hilfsmittel (GKV)',
    rechtsgrundlage_id: 'rg-33-sgbv',
    max_betrag: 0, // einzelfallabhängig / Sachleistung über Hilfsmittelverzeichnis
    betrag_einheit: 'einmalig',
    multiplikator_moeglich: false,
    max_multiplikator: 1,
    pflegegrad_erforderlich: false,
    art: 'sachleistung',
  },
  {
    id: 'ft-kfw455b',
    code: 'kfw455b',
    bezeichnung: 'KfW 455-B Barrierereduzierung',
    rechtsgrundlage_id: 'rg-kfw',
    max_betrag: 6250,
    betrag_einheit: 'einmalig',
    multiplikator_moeglich: false,
    max_multiplikator: 1,
    pflegegrad_erforderlich: false,
    art: 'zuschuss',
  },
];

// Hilfsfunktion: Summen aus der BOM ableiten.
function summe(komponenten: MassnahmeKomponente[]): { ek: number; vk: number } {
  return komponenten.reduce(
    (acc, k) => ({ ek: acc.ek + k.ek_netto, vk: acc.vk + k.vk_brutto }),
    { ek: 0, vk: 0 },
  );
}

// Globales §40-Pflichtnachweis-Profil (gilt für alle Standardmaßnahmen).
export const GLOBALE_NACHWEISE: { code: NachweisCode; bezeichnung: string }[] = [
  { code: 'antrag_vor_beginn', bezeichnung: 'Antragstellung vor Maßnahmenbeginn' },
  { code: 'begruendung', bezeichnung: 'Begründung mit Gesetzeskriterium' },
  { code: 'aerztliches_attest', bezeichnung: 'Ärztliches Attest (ICD-10 + Funktionseinschränkung)' },
  { code: 'kostenvoranschlag', bezeichnung: 'Detaillierter Kostenvoranschlag' },
  { code: 'foto_ist_zustand', bezeichnung: 'Fotos Ist-Zustand' },
  { code: 'einwilligung_dsgvo', bezeichnung: 'Einwilligung (DSGVO)' },
  { code: 'abtretungserklaerung', bezeichnung: 'Abtretungserklärung § 398 BGB' },
];

// Lesbare Bezeichnungen für Zusatznachweise.
export const NACHWEIS_BEZEICHNUNG: Record<NachweisCode, string> = {
  antrag_vor_beginn: 'Antragstellung vor Maßnahmenbeginn',
  begruendung: 'Begründung mit Gesetzeskriterium',
  aerztliches_attest: 'Ärztliches Attest (ICD-10 + Funktionseinschränkung)',
  kostenvoranschlag: 'Detaillierter Kostenvoranschlag',
  foto_ist_zustand: 'Fotos Ist-Zustand',
  einwilligung_dsgvo: 'Einwilligung (DSGVO)',
  abtretungserklaerung: 'Abtretungserklärung § 398 BGB',
  vollmacht: 'Vollmacht (Angehörige)',
  vermieterzustimmung: 'Vermieterzustimmung',
  masskizze: 'Maßskizze / Grundriss',
  statiknachweis: 'Statiknachweis (tragende Wand)',
};

// Komponenten-Factory (kompakt) — vergibt deterministische IDs je Maßnahme.
function k(
  id: string,
  position: string,
  menge: number,
  ek: number,
  vk: number,
  montage = false,
): MassnahmeKomponente {
  return { id, position, menge, ek_netto: ek, vk_brutto: vk, ist_montage: montage };
}

// --- Maßnahmenkatalog (6 Standardmaßnahmen) ---
function baue(
  m: Omit<MassnahmeKatalog, 'standard_ek_netto' | 'standard_vk_brutto'>,
): MassnahmeKatalog {
  const s = summe(m.komponenten);
  return { ...m, standard_ek_netto: s.ek, standard_vk_brutto: s.vk };
}

export const MASSNAHMEN_KATALOG: MassnahmeKatalog[] = [
  baue({
    id: 'mk-haltegriff',
    code: 'STD-HALTEGRIFF',
    bezeichnung: 'Haltegriffe (Bad/WC)',
    kategorie: 'bad',
    beschreibung: 'Tragfähige Halte- und Stützklappgriffe im Sanitärbereich.',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2 §4.4',
    foerderfaehig_status: 'gesichert',
    standard_begruendung:
      'Aufgrund {{diagnose}} ({{icd10}}) mit {{funktionseinschraenkung}} besteht im ' +
      'Sanitärbereich ein erhebliches Sturzrisiko. Tragfähige Halte- und Stützklappgriffe ' +
      'nach DIN 18040-2 erleichtern die häusliche Pflege erheblich.',
    komponenten: [
      k('mk-haltegriff-1', 'Haltegriff Edelstahl gerade 60 cm', 2, 36, 98),
      k('mk-haltegriff-2', 'Stützklappgriff WC 80 cm', 1, 55, 145),
      k('mk-haltegriff-3', 'Befestigungsset (tragfähig)', 1, 12, 35),
      k('mk-haltegriff-4', 'Fachmontage inkl. Tragfähigkeitsprüfung', 1, 80, 220, true),
    ],
    zusatz_nachweise: [],
    benoetigte_gewerke: ['sanitaer'],
    pflichtfotos: [
      'WC-Bereich Ist-Zustand (frontal)',
      'Wandbeschaffenheit Montagepunkt (Seitenansicht)',
    ],
    aktiv: true,
  }),
  baue({
    id: 'mk-handlauf',
    code: 'STD-HANDLAUF',
    bezeichnung: 'Handläufe (Flur/Treppe)',
    kategorie: 'treppen_lift',
    beschreibung: 'Beidseitige Handläufe nach DIN 18040-2.',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2 §4.3.6',
    foerderfaehig_status: 'gesichert',
    standard_begruendung:
      'Infolge {{diagnose}} ({{icd10}}) ist die sichere Nutzung von Flur und Treppe ohne ' +
      'beidseitige Greifsicherung nicht mehr gewährleistet ({{funktionseinschraenkung}}). ' +
      'Der beidseitige Handlauf nach DIN 18040-2 erleichtert die häusliche Pflege erheblich.',
    komponenten: [
      k('mk-handlauf-1', 'Handlauf Edelstahl Ø 42 mm, 2 m', 2, 90, 240),
      k('mk-handlauf-2', 'Wandhalter + Endkappen-Set', 1, 25, 70),
      k('mk-handlauf-3', 'Fachmontage (tragfähig)', 1, 110, 290, true),
      k('mk-handlauf-4', 'Kleinmaterial', 1, 10, 30),
    ],
    zusatz_nachweise: [],
    benoetigte_gewerke: ['metallbau', 'schreiner'],
    pflichtfotos: [
      'Flur Ist-Zustand (Gesamtansicht)',
      'Treppenabschnitt mit Maßangabe',
    ],
    aktiv: true,
  }),
  baue({
    id: 'mk-schwelle',
    code: 'STD-SCHWELLE',
    bezeichnung: 'Schwellenabbau / -ausgleich',
    kategorie: 'bodenbelag',
    beschreibung: 'Abbau/Ausgleich von Türschwellen auf DIN-konformes Maß (≤ 2 cm).',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2 (Schwellen ≤ 2 cm)',
    foerderfaehig_status: 'gesichert',
    standard_begruendung:
      'Die vorhandene Türschwelle (> 2 cm) stellt bei {{diagnose}} ({{icd10}}) eine erhebliche ' +
      'Sturz- bzw. Mobilitätsbarriere dar ({{funktionseinschraenkung}}). Der Schwellenabbau ' +
      'erleichtert die häusliche Pflege erheblich und ermöglicht die sichere Nutzung von ' +
      'Rollator/Rollstuhl.',
    komponenten: [
      k('mk-schwelle-1', 'Schwellenrampe/-ausgleich Alu/Gummi', 1, 35, 95),
      k('mk-schwelle-2', 'Absenkbare Türboden-/Bürstendichtung', 1, 25, 70),
      k('mk-schwelle-3', 'Anpassung Türblatt / Bodenausgleich', 1, 90, 240, true),
      k('mk-schwelle-4', 'Kleinmaterial', 1, 10, 30),
    ],
    zusatz_nachweise: ['vermieterzustimmung'],
    benoetigte_gewerke: ['schreiner', 'trockenbau'],
    pflichtfotos: [
      'Schwelle Nahaufnahme mit Maßband',
      'Türrahmen Gesamtansicht',
    ],
    aktiv: true,
  }),
  baue({
    id: 'mk-rampe',
    code: 'STD-RAMPE',
    bezeichnung: 'Rampe Hauseingang (modular)',
    kategorie: 'rampe',
    beschreibung: 'Modulare Aluminiumrampe, Neigung ≤ 6 %, mit Handlauf.',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2 §4.3.8',
    foerderfaehig_status: 'gesichert',
    standard_begruendung:
      'Bei {{diagnose}} ({{icd10}}) ist der Zugang zur Wohnung über die vorhandenen Stufen ' +
      'nicht mehr selbstständig/sicher möglich ({{funktionseinschraenkung}}). Die modulare ' +
      'Rampe (≤ 6 %, DIN 18040-2) ermöglicht die häusliche Pflege.',
    komponenten: [
      k('mk-rampe-1', 'Modulrampe Aluminium (höhenanpassbar)', 1, 380, 850),
      k('mk-rampe-2', 'Geländer/Handlauf für Rampe', 1, 120, 320),
      k('mk-rampe-3', 'Anti-Rutsch-Belag', 1, 40, 110),
      k('mk-rampe-4', 'Montage/Anpassung vor Ort', 1, 80, 170, true),
    ],
    zusatz_nachweise: ['masskizze', 'vermieterzustimmung'],
    benoetigte_gewerke: ['metallbau', 'grosshandel'],
    pflichtfotos: [
      'Hauseingang Ist-Zustand (mit Stufen)',
      'Stufenhöhe mit Maßband',
    ],
    aktiv: true,
  }),
  baue({
    id: 'mk-bad',
    code: 'STD-BAD',
    bezeichnung: 'Bodengleiche Dusche (Badumbau)',
    kategorie: 'bad',
    beschreibung: 'Umbau Badewanne → bodengleiche, rutschhemmende Dusche.',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2 §4.4.1',
    foerderfaehig_status: 'gesichert',
    standard_begruendung:
      'Aufgrund {{diagnose}} ({{icd10}}) mit {{funktionseinschraenkung}} ist ein sicheres ' +
      'Ein- und Aussteigen in die vorhandene Badewanne nicht mehr möglich. Die Umrüstung auf ' +
      'eine bodengleiche, rutschhemmende Dusche nach DIN 18040-2 stellt die selbstständige ' +
      'Körperpflege wieder her und ermöglicht die häusliche Pflege.',
    komponenten: [
      k('mk-bad-1', 'SMC-Duschwanne 170 × 75 cm', 1, 180, 490),
      k('mk-bad-2', 'High-Flow Ablaufset', 1, 15, 45),
      k('mk-bad-3', 'Alu-Verbundplatten (3er-Set)', 1, 220, 680),
      k('mk-bad-4', 'Profile & Spezialkleber', 1, 40, 120),
      k('mk-bad-5', 'Glastrennwand 8 mm ESG', 1, 110, 340),
      k('mk-bad-6', 'Glasschiebetür-Set (Front)', 1, 240, 750),
      k('mk-bad-7', 'Montage (1,5 Tage)', 1, 750, 1250, true),
      k('mk-bad-8', 'Entsorgung & Kleinmaterial', 1, 45, 125),
    ],
    zusatz_nachweise: ['masskizze', 'vermieterzustimmung'],
    benoetigte_gewerke: ['sanitaer', 'fliesen', 'trockenbau'],
    pflichtfotos: [
      'Badewanne Ist-Zustand (frontal)',
      'Badezimmer Gesamtansicht',
      'Ablaufbereich (Nahaufnahme)',
      'Wandfläche Duschzone',
    ],
    aktiv: true,
  }),
  baue({
    id: 'mk-tuer',
    code: 'STD-TUER',
    bezeichnung: 'Türverbreiterung',
    kategorie: 'tueren',
    beschreibung: 'Verbreiterung auf ≥ 90 cm lichte Durchgangsbreite.',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2 §4.3.3',
    foerderfaehig_status: 'gesichert',
    standard_begruendung:
      'Bei {{diagnose}} ({{icd10}}) ist {{funktionseinschraenkung}}; die vorhandene ' +
      'Türdurchgangsbreite (< 90 cm) verhindert das Erreichen wesentlicher Wohnräume mit ' +
      'Rollstuhl/Rollator. Die Türverbreiterung auf ≥ 90 cm (DIN 18040-2) ermöglicht die ' +
      'häusliche Pflege.',
    komponenten: [
      k('mk-tuer-1', 'Demontage alte Zarge/Tür + Entsorgung', 1, 60, 180, true),
      k('mk-tuer-2', 'Stemm-/Maurerarbeiten Laibung verbreitern', 1, 280, 720, true),
      k('mk-tuer-3', 'Neue Zarge + barrierefreies Türblatt 90 cm', 1, 240, 560),
      k('mk-tuer-4', 'Putz-/Maleranpassung', 1, 90, 240, true),
      k('mk-tuer-5', 'Montage inkl. Sturz/Statik-Anpassung', 1, 200, 480, true),
      k('mk-tuer-6', 'Entsorgung/Kleinmaterial', 1, 40, 120),
    ],
    zusatz_nachweise: ['vermieterzustimmung', 'statiknachweis'],
    benoetigte_gewerke: ['maurer', 'schreiner', 'maler'],
    typische_ablehnungsgrund_ids: ['ag-erforderlichkeit', 'ag-zustaendigkeit'],
    pflichtfotos: [
      'Tür Ist-Zustand (frontal, mit Maßband Breite)',
      'Türlaibung seitlich',
      'Wandbereich neben Türöffnung (Statik)',
    ],
    aktiv: true,
  }),
  baue({
    id: 'mk-wannentuer',
    code: 'STD-WANNENTUER',
    bezeichnung: 'Nachträgliche Wannentür (Einstiegshilfe)',
    kategorie: 'bad',
    beschreibung: 'Fest eingebaute Tür in vorhandene Badewanne für stufenarmen Einstieg.',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2 §4.4',
    foerderfaehig_status: 'gesichert',
    standard_begruendung:
      'Aufgrund {{diagnose}} ({{icd10}}) mit {{funktionseinschraenkung}} ist der Einstieg in ' +
      'die Badewanne nicht mehr sicher möglich. Die fest eingebaute Wannentür erleichtert die ' +
      'häusliche Pflege erheblich und sichert die selbstständige Körperpflege.',
    komponenten: [
      k('mk-wannentuer-1', 'Wannentür-Set (fest eingebaut)', 1, 280, 690),
      k('mk-wannentuer-2', 'Abdichtung & Anpassung', 1, 60, 160),
      k('mk-wannentuer-3', 'Einbau/Montage', 1, 180, 450, true),
    ],
    zusatz_nachweise: ['vermieterzustimmung'],
    benoetigte_gewerke: ['sanitaer'],
    pflichtfotos: [
      'Badewanne Ist-Zustand (Einstiegsseite)',
      'Wannenrand Profil (Nahaufnahme)',
    ],
    aktiv: true,
  }),
  baue({
    id: 'mk-wc',
    code: 'STD-WC',
    bezeichnung: 'WC-Anpassung (Erhöhung / Dusch-WC)',
    kategorie: 'bad',
    beschreibung: 'Erhöhung des WC bzw. fest installiertes Dusch-WC zur selbstständigen Hygiene.',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2 §4.4',
    foerderfaehig_status: 'gesichert',
    standard_begruendung:
      'Bei {{diagnose}} ({{icd10}}) ist {{funktionseinschraenkung}}; die selbstständige ' +
      'Toilettennutzung/Hygiene ist ohne Anpassung nicht mehr gewährleistet. Die WC-Anpassung ' +
      'erleichtert die häusliche Pflege erheblich.',
    komponenten: [
      k('mk-wc-1', 'Dusch-WC-Anlage bzw. Erhöhungsrahmen', 1, 380, 890),
      k('mk-wc-2', 'Stützklappgriffe WC', 1, 55, 145),
      k('mk-wc-3', 'Montage inkl. Elektro/Wasseranschluss', 1, 120, 320, true),
    ],
    zusatz_nachweise: ['vermieterzustimmung'],
    benoetigte_gewerke: ['sanitaer', 'elektro'],
    typische_ablehnungsgrund_ids: ['ag-zustaendigkeit'],
    pflichtfotos: [
      'WC-Bereich Ist-Zustand (Gesamtansicht)',
      'Wasseranschluss (Seitenansicht)',
    ],
    aktiv: true,
  }),
  baue({
    id: 'mk-tuerantrieb',
    code: 'STD-TUERANTRIEB',
    bezeichnung: 'Elektrischer Türantrieb',
    kategorie: 'tueren',
    beschreibung: 'Fest eingebauter elektrischer Türantrieb (BSG-gestützt förderfähig).',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-bsg-4-16',
    din18040_ref: 'DIN 18040-2 §4.3.3',
    foerderfaehig_status: 'gesichert',
    standard_begruendung:
      'Bei {{diagnose}} ({{icd10}}) ({{funktionseinschraenkung}}) ist das selbstständige ' +
      'Öffnen der Tür nicht mehr möglich. Der fest eingebaute elektrische Türantrieb ermöglicht ' +
      'die häusliche Pflege (vgl. BSG B 3 P 4/16 R).',
    komponenten: [
      k('mk-tuerantrieb-1', 'Türantrieb (fest montiert)', 1, 900, 1900),
      k('mk-tuerantrieb-2', 'Sensorik/Taster', 1, 120, 320),
      k('mk-tuerantrieb-3', 'Elektroanschluss', 1, 150, 380, true),
      k('mk-tuerantrieb-4', 'Montage', 1, 120, 300, true),
    ],
    zusatz_nachweise: [],
    benoetigte_gewerke: ['elektro', 'metallbau'],
    typische_ablehnungsgrund_ids: ['ag-zustaendigkeit'],
    pflichtfotos: [
      'Tür Außenansicht Ist-Zustand',
      'Türrahmen Konstruktion (Befestigungspunkte)',
    ],
    aktiv: true,
  }),
  baue({
    id: 'mk-treppenlift',
    code: 'STD-TREPPENLIFT',
    bezeichnung: 'Treppenlift (Sitzlift, fest verbaut)',
    kategorie: 'treppen_lift',
    beschreibung: 'Fest installierter Sitz-Treppenlift; Förderung als Teilbetrag (über Deckel).',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2 §4.3.6',
    foerderfaehig_status: 'gesichert',
    standard_begruendung:
      'Bei {{diagnose}} ({{icd10}}) ist das sichere Überwinden der Treppe nicht mehr möglich ' +
      '({{funktionseinschraenkung}}). Der fest installierte Treppenlift ermöglicht die häusliche ' +
      'Pflege und den Verbleib in der Wohnung. Förderung als Teilbetrag bis zum Höchstbetrag.',
    komponenten: [
      k('mk-treppenlift-1', 'Schienensystem (gerade)', 1, 2800, 4900),
      k('mk-treppenlift-2', 'Sitz & Antriebseinheit', 1, 1500, 2600),
      k('mk-treppenlift-3', 'Montage/Elektro', 1, 400, 900, true),
    ],
    zusatz_nachweise: ['masskizze'],
    benoetigte_gewerke: ['metallbau', 'elektro'],
    typische_ablehnungsgrund_ids: ['ag-erforderlichkeit', 'ag-wirtschaftlichkeit'],
    pflichtfotos: [
      'Treppe Gesamtansicht (Ist-Zustand)',
      'Treppenmündung unten',
      'Treppenmündung oben',
    ],
    aktiv: true,
  }),
  baue({
    id: 'mk-bodenbelag',
    code: 'STD-BODENBELAG',
    bezeichnung: 'Rutschhemmender, schwellenfreier Bodenbelag',
    kategorie: 'bodenbelag',
    beschreibung: 'Austausch gegen rutschhemmenden, stolperfreien Bodenbelag.',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2',
    foerderfaehig_status: 'gesichert',
    standard_begruendung:
      'Der vorhandene Bodenbelag stellt bei {{diagnose}} ({{icd10}}) ein erhebliches Sturzrisiko ' +
      'dar ({{funktionseinschraenkung}}). Ein rutschhemmender, schwellenfreier Belag erleichtert ' +
      'die häusliche Pflege erheblich.',
    komponenten: [
      k('mk-bodenbelag-1', 'Rutschhemmender Designbelag (R10/R11)', 1, 220, 560),
      k('mk-bodenbelag-2', 'Untergrundvorbereitung/Ausgleich', 1, 90, 240, true),
      k('mk-bodenbelag-3', 'Verlegung', 1, 180, 450, true),
    ],
    zusatz_nachweise: ['vermieterzustimmung'],
    benoetigte_gewerke: ['schreiner', 'maler'],
    aktiv: true,
  }),
  baue({
    id: 'mk-motorisierung',
    code: 'STD-MOTORISIERUNG',
    bezeichnung: 'Elektrische Rollladen-/Fensterbedienung',
    kategorie: 'sonstige',
    beschreibung: 'Motorisierung von Rollläden/Fenstern zur selbstständigen Bedienung.',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2',
    foerderfaehig_status: 'einzelfall',
    standard_begruendung:
      'Bei {{diagnose}} ({{icd10}}) ({{funktionseinschraenkung}}) ist die manuelle Bedienung von ' +
      'Rollläden/Fenstern nicht mehr möglich. Die Motorisierung stellt die selbstständige ' +
      'Lebensführung in diesem Bereich wieder her (Einzelfallentscheidung).',
    komponenten: [
      k('mk-motorisierung-1', 'Rohrmotoren inkl. Steuerung', 1, 200, 540),
      k('mk-motorisierung-2', 'Elektroinstallation/Montage', 1, 150, 380, true),
    ],
    zusatz_nachweise: [],
    benoetigte_gewerke: ['elektro'],
    typische_ablehnungsgrund_ids: ['ag-pflegebezug'],
    aktiv: true,
  }),
  baue({
    id: 'mk-kueche',
    code: 'STD-KUECHE',
    bezeichnung: 'Höhenverstellbare / unterfahrbare Küchenanpassung',
    kategorie: 'sonstige',
    beschreibung: 'Anpassung von Arbeitsplatte/Spüle für Rollstuhlnutzung.',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2',
    foerderfaehig_status: 'einzelfall',
    standard_begruendung:
      'Bei {{diagnose}} ({{icd10}}) ({{funktionseinschraenkung}}) ist die selbstständige ' +
      'Nutzung der Küche nicht mehr möglich. Die unterfahrbare/höhenangepasste Küchenzeile stellt ' +
      'die selbstständige Lebensführung wieder her (Einzelfallentscheidung).',
    komponenten: [
      k('mk-kueche-1', 'Höhenverstellbares Unterschrank-/Arbeitsplattenmodul', 1, 600, 1400),
      k('mk-kueche-2', 'Anpassung Wasser-/Elektroanschlüsse', 1, 150, 380, true),
      k('mk-kueche-3', 'Montage', 1, 120, 300, true),
    ],
    zusatz_nachweise: ['masskizze'],
    benoetigte_gewerke: ['schreiner', 'sanitaer', 'elektro'],
    typische_ablehnungsgrund_ids: ['ag-pflegebezug', 'ag-wirtschaftlichkeit'],
    aktiv: true,
  }),
  baue({
    id: 'mk-beleuchtung',
    code: 'STD-BELEUCHTUNG',
    bezeichnung: 'Orientierungsbeleuchtung mit Bewegungsmeldern',
    kategorie: 'beleuchtung',
    beschreibung: 'Bewegungsgesteuerte Wegebeleuchtung zur Sturzprophylaxe (nachts).',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2',
    foerderfaehig_status: 'einzelfall',
    standard_begruendung:
      'Bei {{diagnose}} ({{icd10}}) besteht nächtliches Sturzrisiko ({{funktionseinschraenkung}}). ' +
      'Bewegungsgesteuerte Orientierungsbeleuchtung erleichtert die häusliche Pflege und beugt ' +
      'Stürzen vor (Einzelfallentscheidung).',
    komponenten: [
      k('mk-beleuchtung-1', 'LED-Bewegungslicht-Set (Weg/Flur)', 1, 90, 240),
      k('mk-beleuchtung-2', 'Elektroinstallation/Montage', 1, 120, 320, true),
    ],
    zusatz_nachweise: [],
    benoetigte_gewerke: ['elektro'],
    typische_ablehnungsgrund_ids: ['ag-pflegebezug'],
    aktiv: true,
  }),

  // --- Sprint 1: Sicherheit / Sturzprophylaxe ---
  baue({
    id: 'mk-sich-bewegungsmelder',
    code: 'SICH-001',
    bezeichnung: 'Bewegungsmelder-Beleuchtung Flur',
    kategorie: 'beleuchtung',
    beschreibung: 'Bewegungsgesteuerte Flurbeleuchtung zur nächtlichen Sturzprophylaxe.',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2',
    foerderfaehig_status: 'gesichert',
    standard_begruendung:
      'Bei {{diagnose}} (Pflegegrad {{pflegegrad}}) besteht im Flur ein nächtliches Sturzrisiko ' +
      '({{funktionseinschraenkung}}). Die bewegungsgesteuerte Flurbeleuchtung erleichtert die ' +
      'häusliche Pflege erheblich und beugt Stürzen vor.',
    komponenten: [
      k('mk-sich-bewegungsmelder-1', 'LED-Bewegungsmelder-Leuchten-Set (Flur)', 1, 60, 180),
      k('mk-sich-bewegungsmelder-2', 'Elektro-Kleinmaterial', 1, 5, 20),
      k('mk-sich-bewegungsmelder-3', 'Fachmontage (1,5 h)', 1, 20, 80, true),
    ],
    zusatz_nachweise: [],
    benoetigte_gewerke: ['elektro'],
    typische_ablehnungsgrund_ids: ['ag-pflegebezug'],
    typische_widerspruchsgrund_ids: ['wg-funktionsbezug'],
    montagezeit_stunden: 1.5,
    hv_genehmigung_noetig: false,
    reversibel: true,
    pflegegrad_voraussetzung: 1,
    genehmigungswahrscheinlichkeit: 'hoch',
    aktiv: true,
  }),
  baue({
    id: 'mk-sich-nachtbeleuchtung',
    code: 'SICH-002',
    bezeichnung: 'Nachtbeleuchtung Schlafzimmer → Bad',
    kategorie: 'beleuchtung',
    beschreibung: 'Sensorgesteuertes Orientierungslicht auf dem nächtlichen Weg Schlafzimmer–Bad.',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2',
    foerderfaehig_status: 'gesichert',
    standard_begruendung:
      'Bei {{diagnose}} (Pflegegrad {{pflegegrad}}) besteht auf dem nächtlichen Weg vom ' +
      'Schlafzimmer ins Bad ein erhebliches Sturzrisiko ({{funktionseinschraenkung}}). Das ' +
      'sensorgesteuerte Orientierungslicht erleichtert die häusliche Pflege erheblich.',
    komponenten: [
      k('mk-sich-nachtbeleuchtung-1', 'Orientierungslicht-System Schlafzimmer→Bad (Sensor-LED)', 1, 100, 240),
      k('mk-sich-nachtbeleuchtung-2', 'Kleinmaterial & Kabelkanal', 1, 10, 40),
      k('mk-sich-nachtbeleuchtung-3', 'Fachmontage (2 h)', 1, 30, 100, true),
    ],
    zusatz_nachweise: [],
    benoetigte_gewerke: ['elektro'],
    typische_ablehnungsgrund_ids: ['ag-pflegebezug'],
    typische_widerspruchsgrund_ids: ['wg-funktionsbezug'],
    montagezeit_stunden: 2,
    hv_genehmigung_noetig: false,
    reversibel: true,
    pflegegrad_voraussetzung: 1,
    genehmigungswahrscheinlichkeit: 'hoch',
    aktiv: true,
  }),
  baue({
    id: 'mk-sich-funkklingel',
    code: 'SICH-004',
    bezeichnung: 'Funkklingel mit Blitzlicht',
    kategorie: 'sicherheit',
    beschreibung: 'Funk-Türklingel mit optischem Blitzlicht-Signal (bei Hör-/Mobilitätseinschränkung).',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2',
    foerderfaehig_status: 'gesichert',
    standard_begruendung:
      'Bei {{diagnose}} (Pflegegrad {{pflegegrad}}) ist das Wahrnehmen der Türklingel nicht ' +
      'zuverlässig möglich ({{funktionseinschraenkung}}). Die Funkklingel mit optischem ' +
      'Blitzlicht-Signal erleichtert die häusliche Pflege erheblich und sichert den Zugang ' +
      'von Pflege- und Hilfspersonen.',
    komponenten: [
      k('mk-sich-funkklingel-1', 'Funk-Türklingel mit Blitzlicht-Signalgeber', 1, 45, 150),
      k('mk-sich-funkklingel-2', 'Funk-Sender & Batterien', 1, 5, 20),
      k('mk-sich-funkklingel-3', 'Einrichtung & Montage (1 h)', 1, 10, 50, true),
    ],
    zusatz_nachweise: [],
    benoetigte_gewerke: ['elektro'],
    typische_ablehnungsgrund_ids: ['ag-pflegebezug'],
    typische_widerspruchsgrund_ids: ['wg-funktionsbezug'],
    montagezeit_stunden: 1,
    hv_genehmigung_noetig: false,
    reversibel: true,
    pflegegrad_voraussetzung: 1,
    genehmigungswahrscheinlichkeit: 'mittel',
    aktiv: true,
  }),

  // --- Sprint 1: Bad / Sanitär (Kleinmaßnahmen & GKV-Hilfsmittel) ---
  baue({
    id: 'mk-bad-haltegriff-wc',
    code: 'BAD-001',
    bezeichnung: 'Haltegriff WC wandmontiert 60 cm',
    kategorie: 'bad',
    beschreibung: 'Fest verschraubter Haltegriff (60 cm) neben dem WC.',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2 §4.4',
    foerderfaehig_status: 'gesichert',
    standard_begruendung:
      'Aufgrund {{diagnose}} (Pflegegrad {{pflegegrad}}) mit {{funktionseinschraenkung}} ist ' +
      'das selbstständige Hinsetzen und Aufstehen am WC nicht mehr sicher möglich. Der ' +
      'wandmontierte Haltegriff nach DIN 18040-2 erleichtert die häusliche Pflege erheblich ' +
      'und sichert die selbstständige Körperpflege.',
    komponenten: [
      k('mk-bad-haltegriff-wc-1', 'Haltegriff Edelstahl gerade 60 cm', 1, 30, 90),
      k('mk-bad-haltegriff-wc-2', 'Befestigungsset (tragfähig)', 1, 5, 20),
      k('mk-bad-haltegriff-wc-3', 'Fachmontage inkl. Tragfähigkeitsprüfung (1 h)', 1, 20, 70, true),
    ],
    zusatz_nachweise: ['vermieterzustimmung'],
    benoetigte_gewerke: ['sanitaer'],
    typische_widerspruchsgrund_ids: ['wg-funktionsbezug', 'wg-attest'],
    montagezeit_stunden: 1,
    hv_genehmigung_noetig: true,
    reversibel: false,
    pflegegrad_voraussetzung: 1,
    genehmigungswahrscheinlichkeit: 'sehr_hoch',
    pflichtfotos: [
      'WC-Bereich Ist-Zustand (Montagewand)',
    ],
    aktiv: true,
  }),
  baue({
    id: 'mk-bad-stuetzklappgriff',
    code: 'BAD-002',
    bezeichnung: 'Stützklappgriff WC beidseitig',
    kategorie: 'bad',
    beschreibung: 'Beidseitige, hochklappbare Stützgriffe am WC.',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2 §4.4',
    foerderfaehig_status: 'gesichert',
    standard_begruendung:
      'Bei {{diagnose}} (Pflegegrad {{pflegegrad}}) ist {{funktionseinschraenkung}}; die ' +
      'selbstständige WC-Nutzung ist ohne beidseitige Abstützung nicht mehr gewährleistet. ' +
      'Die beidseitigen Stützklappgriffe nach DIN 18040-2 erleichtern die häusliche Pflege ' +
      'erheblich.',
    komponenten: [
      k('mk-bad-stuetzklappgriff-1', 'Stützklappgriff WC (Paar, beidseitig)', 1, 80, 280),
      k('mk-bad-stuetzklappgriff-2', 'Befestigungsset (tragfähig)', 1, 10, 30),
      k('mk-bad-stuetzklappgriff-3', 'Fachmontage (2 h)', 1, 20, 70, true),
    ],
    zusatz_nachweise: ['vermieterzustimmung'],
    benoetigte_gewerke: ['sanitaer'],
    typische_widerspruchsgrund_ids: ['wg-funktionsbezug', 'wg-attest'],
    montagezeit_stunden: 2,
    hv_genehmigung_noetig: true,
    reversibel: false,
    pflegegrad_voraussetzung: 1,
    genehmigungswahrscheinlichkeit: 'sehr_hoch',
    pflichtfotos: [
      'WC-Bereich beidseitig Ist-Zustand',
    ],
    aktiv: true,
  }),
  baue({
    id: 'mk-bad-wannengriff-klemm',
    code: 'BAD-004',
    bezeichnung: 'Haltegriff Badewanne (Klemm)',
    kategorie: 'bad',
    beschreibung: 'Geklemmter Wannenrand-Einstiegsgriff, ohne Bohren / rückbaubar.',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2 §4.4',
    foerderfaehig_status: 'gesichert',
    standard_begruendung:
      'Aufgrund {{diagnose}} (Pflegegrad {{pflegegrad}}) mit {{funktionseinschraenkung}} ist ' +
      'der Ein- und Ausstieg in die Badewanne nicht mehr sicher möglich. Der geklemmte ' +
      'Wannengriff erleichtert die häusliche Pflege erheblich und ist rückstandsfrei rückbaubar.',
    komponenten: [
      k('mk-bad-wannengriff-klemm-1', 'Badewannen-Klemmgriff (höhenverstellbar)', 1, 50, 150),
      k('mk-bad-wannengriff-klemm-2', 'Schutz-/Klemmbacken-Set', 1, 5, 20),
      k('mk-bad-wannengriff-klemm-3', 'Anbringung & Sicherheitsprüfung (1 h)', 1, 10, 50, true),
    ],
    zusatz_nachweise: [],
    benoetigte_gewerke: ['sanitaer'],
    typische_widerspruchsgrund_ids: ['wg-funktionsbezug'],
    montagezeit_stunden: 1,
    hv_genehmigung_noetig: false,
    reversibel: true,
    pflegegrad_voraussetzung: 1,
    genehmigungswahrscheinlichkeit: 'sehr_hoch',
    aktiv: true,
  }),
  baue({
    id: 'mk-bad-duschhocker',
    code: 'BAD-005',
    bezeichnung: 'Duschhocker höhenverstellbar',
    kategorie: 'bad',
    beschreibung:
      'Höhenverstellbarer, rutschhemmender Duschhocker. Vorrangig als GKV-Hilfsmittel nach ' +
      '§ 33 SGB V zu beantragen (Hilfsmittelverzeichnis / ärztliche Verordnung).',
    foerdertopf_id: 'ft-33-sgbv',
    rechtsgrundlage_id: 'rg-33-sgbv',
    din18040_ref: 'DIN 18040-2 §4.4',
    foerderfaehig_status: 'gesichert',
    standard_begruendung:
      'Der höhenverstellbare Duschhocker ist vorrangig als Hilfsmittel der gesetzlichen ' +
      'Krankenversicherung nach § 33 SGB V zu beantragen. Aufgrund {{diagnose}} (Pflegegrad ' +
      '{{pflegegrad}}) mit {{funktionseinschraenkung}} ist sicheres Duschen im Stehen nicht ' +
      'mehr möglich; der Duschhocker erleichtert die häusliche Pflege erheblich.',
    komponenten: [
      k('mk-bad-duschhocker-1', 'Duschhocker höhenverstellbar (rutschhemmend)', 1, 25, 75),
      k('mk-bad-duschhocker-2', 'Anlieferung & Einweisung (0,5 h)', 1, 5, 20, true),
    ],
    zusatz_nachweise: [],
    benoetigte_gewerke: ['grosshandel'],
    typische_ablehnungsgrund_ids: ['ag-zustaendigkeit'],
    typische_widerspruchsgrund_ids: ['wg-funktionsbezug'],
    montagezeit_stunden: 0.5,
    hv_genehmigung_noetig: false,
    reversibel: true,
    pflegegrad_voraussetzung: 0,
    genehmigungswahrscheinlichkeit: 'sehr_hoch',
    aktiv: true,
  }),
  baue({
    id: 'mk-bad-wc-sitzerhoehung',
    code: 'BAD-007',
    bezeichnung: 'WC-Sitzerhöhung mit Armlehnen',
    kategorie: 'bad',
    beschreibung:
      'Aufgesetzte WC-Sitzerhöhung mit Armlehnen. Vorrangig als GKV-Hilfsmittel nach ' +
      '§ 33 SGB V zu beantragen (Hilfsmittelverzeichnis / ärztliche Verordnung).',
    foerdertopf_id: 'ft-33-sgbv',
    rechtsgrundlage_id: 'rg-33-sgbv',
    din18040_ref: 'DIN 18040-2 §4.4',
    foerderfaehig_status: 'gesichert',
    standard_begruendung:
      'Die WC-Sitzerhöhung mit Armlehnen ist vorrangig als Hilfsmittel der gesetzlichen ' +
      'Krankenversicherung nach § 33 SGB V zu beantragen. Aufgrund {{diagnose}} (Pflegegrad ' +
      '{{pflegegrad}}) mit {{funktionseinschraenkung}} ist das Hinsetzen und Aufstehen am WC ' +
      'nicht mehr selbstständig möglich; die Sitzerhöhung erleichtert die häusliche Pflege erheblich.',
    komponenten: [
      k('mk-bad-wc-sitzerhoehung-1', 'WC-Sitzerhöhung mit Armlehnen', 1, 20, 65),
      k('mk-bad-wc-sitzerhoehung-2', 'Anlieferung & Einweisung (0,5 h)', 1, 5, 20, true),
    ],
    zusatz_nachweise: [],
    benoetigte_gewerke: ['grosshandel'],
    typische_ablehnungsgrund_ids: ['ag-zustaendigkeit'],
    typische_widerspruchsgrund_ids: ['wg-funktionsbezug'],
    montagezeit_stunden: 0.5,
    hv_genehmigung_noetig: false,
    reversibel: true,
    pflegegrad_voraussetzung: 0,
    genehmigungswahrscheinlichkeit: 'sehr_hoch',
    aktiv: true,
  }),

  // --- Sprint 1: Wohnumfeld ---
  baue({
    id: 'mk-wohn-schwellenrampe-innen',
    code: 'WOHN-003',
    bezeichnung: 'Schwellenrampe innen (Alu)',
    kategorie: 'bodenbelag',
    beschreibung: 'Lose aufliegende Alu-Schwellenrampe für innenliegende Türschwellen (rückbaubar).',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2 (Schwellen ≤ 2 cm)',
    foerderfaehig_status: 'gesichert',
    standard_begruendung:
      'Die innenliegende Türschwelle (> 2 cm) stellt bei {{diagnose}} (Pflegegrad {{pflegegrad}}) ' +
      'eine erhebliche Sturz- bzw. Mobilitätsbarriere dar ({{funktionseinschraenkung}}). Die ' +
      'Alu-Schwellenrampe erleichtert die häusliche Pflege erheblich und ermöglicht die sichere ' +
      'Nutzung von Rollator/Rollstuhl.',
    komponenten: [
      k('mk-wohn-schwellenrampe-innen-1', 'Alu-Schwellenrampe innen (höhenverstellbar)', 1, 35, 130),
      k('mk-wohn-schwellenrampe-innen-2', 'Anpassung & Montage (1 h)', 1, 10, 50, true),
    ],
    zusatz_nachweise: [],
    benoetigte_gewerke: ['schreiner'],
    typische_widerspruchsgrund_ids: ['wg-funktionsbezug'],
    montagezeit_stunden: 1,
    hv_genehmigung_noetig: false,
    reversibel: true,
    pflegegrad_voraussetzung: 1,
    genehmigungswahrscheinlichkeit: 'sehr_hoch',
    aktiv: true,
  }),

  // --- Sprint 1: Smart-Home / AAL ---
  baue({
    id: 'mk-smart-vayyar',
    code: 'SMART-001',
    bezeichnung: 'Vayyar Home G2 — Radar-Sturzsensor',
    kategorie: 'aal_technik',
    beschreibung:
      'Kameraloser Radar-Sturzsensor. Nicht im GKV-Hilfsmittelverzeichnis (PG 52) geführt; ' +
      'bezuschussungsfähig als wohnumfeldverbessernde Maßnahme nach § 40 Abs. 4 SGB XI — ' +
      'Einzelfallentscheidung der Pflegekasse.',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2',
    foerderfaehig_status: 'einzelfall',
    standard_begruendung:
      'Bei {{diagnose}} (Pflegegrad {{pflegegrad}}) besteht ein erhöhtes Sturzrisiko ' +
      '({{funktionseinschraenkung}}). Der kameralose Radar-Sturzsensor ist bezuschussungsfähig ' +
      'als wohnumfeldverbessernde Maßnahme nach § 40 Abs. 4 SGB XI (Einzelfallentscheidung der ' +
      'Pflegekasse) und erleichtert die häusliche Pflege erheblich.',
    komponenten: [
      k('mk-smart-vayyar-1', 'Vayyar Home G2 Radar-Sturzsensor', 1, 480, 589),
      k('mk-smart-vayyar-2', 'Inbetriebnahme & Einrichtung (0,5 h)', 1, 20, 60, true),
    ],
    zusatz_nachweise: [],
    benoetigte_gewerke: ['aal'],
    typische_ablehnungsgrund_ids: ['ag-pflegebezug', 'ag-zustaendigkeit'],
    typische_widerspruchsgrund_ids: ['wg-funktionsbezug', 'wg-bsg'],
    montagezeit_stunden: 0.5,
    hv_genehmigung_noetig: false,
    reversibel: true,
    pflegegrad_voraussetzung: 1,
    genehmigungswahrscheinlichkeit: 'gering',
    aktiv: true,
  }),
  baue({
    id: 'mk-smart-herdabschaltung',
    code: 'SMART-005',
    bezeichnung: 'Herdabschaltung automatisch (Demenz)',
    kategorie: 'aal_technik',
    beschreibung: 'Sensorgestützte automatische Herdabschaltung zur Brandprävention bei Demenz.',
    foerdertopf_id: 'ft-40-4',
    rechtsgrundlage_id: 'rg-40-4',
    din18040_ref: 'DIN 18040-2',
    foerderfaehig_status: 'gesichert',
    standard_begruendung:
      'Bei {{diagnose}} (Pflegegrad {{pflegegrad}}) mit kognitiver Einschränkung besteht durch ' +
      'unbeaufsichtigte Herdnutzung eine erhebliche Gefährdungslage ({{funktionseinschraenkung}}). ' +
      'Die automatische Herdabschaltung ermöglicht die häusliche Pflege und sichert den Verbleib ' +
      'in der Wohnung.',
    komponenten: [
      k('mk-smart-herdabschaltung-1', 'Herdüberwachung & automatische Abschaltung (Sensor + Schaltmodul)', 1, 100, 300),
      k('mk-smart-herdabschaltung-2', 'Elektro-Kleinmaterial', 1, 10, 40),
      k('mk-smart-herdabschaltung-3', 'Elektro-Fachmontage (2 h)', 1, 20, 80, true),
    ],
    zusatz_nachweise: [],
    benoetigte_gewerke: ['elektro', 'aal'],
    typische_ablehnungsgrund_ids: ['ag-pflegebezug'],
    typische_widerspruchsgrund_ids: ['wg-funktionsbezug'],
    montagezeit_stunden: 2,
    hv_genehmigung_noetig: false,
    reversibel: false,
    pflegegrad_voraussetzung: 2,
    genehmigungswahrscheinlichkeit: 'mittel',
    aktiv: true,
  }),
];
