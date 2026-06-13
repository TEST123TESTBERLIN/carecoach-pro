// CareCoach Pro — Domänenmodell (MVP v1)
// Umsetzung von docs/CRM-Datenmodell.md (MVP-Scope) und docs/Massnahmenkatalog-v1.md.
// Reine Typen/Enums — Framework-unabhängig, von der Service-Schicht genutzt.

// ---------------------------------------------------------------------------
// Enums (als String-Unions)
// ---------------------------------------------------------------------------

export type Pflegegrad = 1 | 2 | 3 | 4 | 5;

export type Bundesland = 'BE' | 'BY' | 'HH' | 'NW' | 'BW' | 'HE' | 'SN' | 'NI';

// Lebenszyklus des Kunden (nicht zu verwechseln mit der Projekt-Pipeline).
export type KundeLebenszyklus = 'lead' | 'interessent' | 'aktiv' | 'inaktiv' | 'archiviert';

// CRM-Pipeline am Projekt.
export type ProjektStatus =
  | 'lead'
  | 'beratung'
  | 'antrag'
  | 'pruefung'
  | 'bewilligt'
  | 'umsetzung'
  | 'abgerechnet'
  | 'abgelehnt'
  | 'widerspruch'
  | 'storniert';

export type AntragStatus =
  | 'entwurf'
  | 'eingereicht'
  | 'in_pruefung'
  | 'md_eingeschaltet'
  | 'bewilligt'
  | 'teilbewilligt'
  | 'abgelehnt'
  | 'genehmigungsfiktion'
  | 'widerspruch';

export type Beziehung =
  | 'ehepartner'
  | 'kind'
  | 'elternteil'
  | 'geschwister'
  | 'betreuer'
  | 'sonstige';

export type Wohnform = 'miete' | 'eigentum' | 'wg' | 'heim';

export type MassnahmeKategorie =
  | 'bad'
  | 'tueren'
  | 'treppen_lift'
  | 'bodenbelag'
  | 'beleuchtung'
  | 'rampe'
  | 'aal_technik'
  | 'sicherheit'
  | 'sonstige';

export type FoerderfaehigStatus = 'gesichert' | 'einzelfall' | 'nicht_foerderfaehig';

// Erfahrungsbasierte Bewilligungswahrscheinlichkeit einer Maßnahme bei der Pflegekasse.
export type Genehmigungswahrscheinlichkeit = 'sehr_hoch' | 'hoch' | 'mittel' | 'gering';

export type BetragEinheit = 'je_massnahme' | 'einmalig' | 'monatlich' | 'jaehrlich';

export type FoerderArt = 'zuschuss' | 'kostenerstattung' | 'sachleistung' | 'kredit' | 'steuervorteil';

export type RechtsgrundlageTyp = 'gesetz' | 'urteil' | 'richtlinie' | 'rundschreiben';

export type DokumentKategorie =
  | 'anschreiben'
  | 'antrag'
  | 'vollmacht'
  | 'einwilligung'
  | 'abtretungserklaerung'
  | 'kostenvoranschlag'
  | 'attest'
  | 'bescheid'
  | 'widerspruch'
  | 'rechnung'
  | 'foto'
  | 'scan'
  | 'masskizze'
  | 'statiknachweis'
  | 'vermieterzustimmung';

export type FristTyp =
  | 'entscheidungsfrist'
  | 'genehmigungsfiktion'
  | 'widerspruchsfrist'
  | 'nachweis_nachreichung'
  | 'umsetzung';

// Codes der Nachweisarten (siehe nachweis_typ).
export type NachweisCode =
  | 'antrag_vor_beginn'
  | 'begruendung'
  | 'aerztliches_attest'
  | 'kostenvoranschlag'
  | 'foto_ist_zustand'
  | 'einwilligung_dsgvo'
  | 'abtretungserklaerung'
  | 'vollmacht'
  | 'vermieterzustimmung'
  | 'masskizze'
  | 'statiknachweis';

export type NachweisStatus = 'offen' | 'vorhanden' | 'geprueft' | 'fehlt';

export type Kassenart = 'krankenkasse' | 'pflegekasse' | 'beides';

export type Traegergruppe =
  | 'aok'
  | 'ersatzkasse'
  | 'bkk'
  | 'ikk'
  | 'knappschaft'
  | 'landwirtschaftlich'
  | 'privat';

export type Rechtsform = 'gmbh' | 'ug' | 'ev' | 'gbr' | 'einzelunternehmen' | 'sonstige';

export type PartnerStatus = 'interessent' | 'partner' | 'inaktiv';

// Gewerke / Dienstleistertypen für die Umsetzung von Maßnahmen.
export type Gewerk =
  | 'sanitaer'
  | 'elektro'
  | 'trockenbau'
  | 'fliesen'
  | 'maurer'
  | 'schreiner'
  | 'maler'
  | 'metallbau'
  | 'aal'
  | 'grosshandel'
  | 'sonstige';

// ---------------------------------------------------------------------------
// Stammdaten
// ---------------------------------------------------------------------------

export interface Standort {
  id: string;
  name: string;
  bundesland: Bundesland;
  leitkasse?: string;
  aktiv: boolean;
}

export interface Angehoeriger {
  name: string;
  beziehung: Beziehung;
  telefon: string;
  email: string;
  ist_hauptkontakt: boolean;
  ist_bevollmaechtigter: boolean;
}

export interface AmbulantePflege {
  dienst: string;
  kontaktperson: string;
  telefon: string;
}

export interface Kunde {
  id: string;
  standort_id: string;
  vorname: string;
  nachname: string;
  geburtsdatum?: string; // ISO
  strasse: string;
  plz: string;
  ort: string;
  bundesland?: Bundesland;
  telefon: string;
  email: string;
  pflegegrad: Pflegegrad;
  hauptdiagnose: string;
  icd10_codes: string[];
  krankenkasse: string;
  krankenkasse_ansprechpartner: string;
  pflegekasse: string;
  versichertennummer: string;
  personen_mit_pflegegrad: number; // 1–4 (Förder-Multiplikator)
  wohnform: Wohnform;
  angehoeriger: Angehoeriger;
  ambulante_pflege: AmbulantePflege;
  einwilligung_dsgvo: boolean;
  einwilligung_datum?: string;
  lebenszyklus: KundeLebenszyklus;
  notiz: string;
  erstellt_am: string;
  geaendert_am: string;
}

// ---------------------------------------------------------------------------
// Recht & Maßnahmenkatalog
// ---------------------------------------------------------------------------

export interface Rechtsgrundlage {
  id: string;
  typ: RechtsgrundlageTyp;
  kuerzel: string;
  titel: string;
  datum?: string;
  kerninhalt: string;
  relevanz?: 'foerderfaehig' | 'nicht_foerderfaehig';
}

export interface Foerdertopf {
  id: string;
  code: string; // '40.4', '45b', …
  bezeichnung: string;
  rechtsgrundlage_id: string;
  max_betrag: number;
  betrag_einheit: BetragEinheit;
  multiplikator_moeglich: boolean;
  max_multiplikator: number;
  ab_pflegegrad?: Pflegegrad;
  pflegegrad_erforderlich: boolean;
  art: FoerderArt;
}

export interface MassnahmeKomponente {
  id: string;
  position: string;
  menge: number;
  ek_netto: number;
  vk_brutto: number;
  ist_montage: boolean;
}

export interface MassnahmeKatalog {
  id: string;
  code: string;
  bezeichnung: string;
  kategorie: MassnahmeKategorie;
  beschreibung: string;
  foerdertopf_id: string;
  rechtsgrundlage_id?: string;
  din18040_ref: string;
  foerderfaehig_status: FoerderfaehigStatus;
  standard_begruendung: string;
  standard_ek_netto: number;
  standard_vk_brutto: number;
  komponenten: MassnahmeKomponente[];
  // Zusätzliche Pflichtnachweise über das §40-Standardprofil hinaus.
  zusatz_nachweise: NachweisCode[];
  // Für die Umsetzung benötigte Gewerke/Dienstleistertypen.
  benoetigte_gewerke: Gewerk[];
  // Typische Ablehnungsgründe (ids → Ablehnungsgrund), die bei dieser Maßnahme erfahrungsgemäß auftreten.
  typische_ablehnungsgrund_ids?: string[];
  // Typische Widerspruchsgründe (ids → Widerspruchsgrund), die bei dieser Maßnahme greifen.
  typische_widerspruchsgrund_ids?: string[];
  // Geschätzte Montagezeit in Stunden (Kalkulations-/Planungsgrundlage).
  montagezeit_stunden?: number;
  // Erfordert die Maßnahme die Zustimmung der Hausverwaltung/des Vermieters (baulicher Eingriff)?
  hv_genehmigung_noetig?: boolean;
  // Rückbaubar ohne bleibende Substanzveränderung (relevant für Mietwohnungen)?
  reversibel?: boolean;
  // Mindest-Pflegegrad (0 = kein Pflegegrad erforderlich, z. B. §33-SGB-V-Hilfsmittel/KfW).
  pflegegrad_voraussetzung?: number;
  // Erfahrungsbasierte Bewilligungswahrscheinlichkeit bei der Pflegekasse.
  genehmigungswahrscheinlichkeit?: Genehmigungswahrscheinlichkeit;
  // Pflichtfotos, die vor Antragstellung aufgenommen werden müssen (Ist-Zustand).
  pflichtfotos?: string[];
  aktiv: boolean;
}

// ---------------------------------------------------------------------------
// CRM-Pipeline / Vorgang
// ---------------------------------------------------------------------------

export interface ProjektMassnahme {
  id: string;
  massnahme_id: string; // → MassnahmeKatalog
  bezeichnung: string;
  foerdertopf_id: string;
  vk_brutto: number;
  ek_netto: number;
  foerderbetrag_beantragt: number;
  raum: string;
  begruendung: string;
}

// Interne Lernnotiz an einem Vorgang (nur Admin-Sicht) — mit Audit-Zeitstempel.
export interface VorgangsNotiz {
  id: string;
  autor: string;
  rolle: string;
  zeitpunkt: string; // ISO
  text: string;
}

export interface Projekt {
  id: string;
  projektnummer: string;
  standort_id: string;
  kunde_id: string;
  titel: string;
  pipeline_status: ProjektStatus;
  massnahmen: ProjektMassnahme[];
  abtretung_aktiv: boolean;
  // Besonderheiten dieses Falls (für zukünftige Verbesserungen, intern).
  besonderheiten?: string;
  // Interne Lernnotizen (nur Admin sichtbar) inkl. wer/wann.
  interne_notizen?: VorgangsNotiz[];
  erstellt_am: string;
  geaendert_am: string;
}

export interface ProjektNachweis {
  code: NachweisCode;
  bezeichnung: string;
  pflicht: boolean;
  status: NachweisStatus;
  dokument_id?: string;
}

export interface Antrag {
  id: string;
  antragsnummer: string;
  projekt_id: string;
  foerdertopf_id: string;
  kasse: string;
  status: AntragStatus;
  gestellt_am?: string; // ISO — muss vor Maßnahmenbeginn liegen
  eingangsbestaetigung_am?: string;
  entscheidungsfrist?: string;
  genehmigungsfiktion_ab?: string;
  md_eingeschaltet_am?: string;
  beantragter_betrag: number;
  bewilligter_betrag?: number;
  bescheid_datum?: string;
  ablehnungsgrund?: string;
  widerspruch_frist?: string;
  // frühestes geplantes Umsetzungs-/Auftragsdatum (für Prüfung „Antrag vor Beginn")
  geplanter_umsetzungsbeginn?: string;
  nachweise: ProjektNachweis[];
}

export interface Dokument {
  id: string;
  projekt_id?: string;
  kunde_id?: string;
  antrag_id?: string;
  kategorie: DokumentKategorie;
  titel: string;
  status: 'entwurf' | 'generiert' | 'versendet' | 'unterschrieben' | 'eingereicht' | 'bewilligt' | 'abgelehnt';
  unterschrift_erforderlich: boolean;
  unterschrieben: boolean;
  erstellt_am: string;
}

// ---------------------------------------------------------------------------
// Kranken-/Pflegekassen
// ---------------------------------------------------------------------------

export interface KasseAnsprechpartner {
  name: string;
  abteilung: string;
  telefon: string;
  email: string;
  zustaendig_fuer: string; // z. B. "§40 Wohnumfeld"
}

export interface Kasse {
  id: string;
  name: string;
  kassenart: Kassenart;
  traegergruppe: Traegergruppe;
  ik_nummer: string;
  strasse: string;
  plz: string;
  ort: string;
  telefon: string;
  fax: string;
  email: string;
  postanschrift_antraege: string;
  elektronischer_eingang: string;
  akzeptiert_abtretung: boolean;
  standard_frist_tage: number; // Default 21
  frist_mit_md_tage: number; // Default 35
  ansprechpartner: KasseAnsprechpartner[];
  notiz: string;
  aktiv: boolean;
}

// ---------------------------------------------------------------------------
// Pflegeunternehmen (ambulante Dienste / Partner)
// ---------------------------------------------------------------------------

export interface PflegeunternehmenAnsprechpartner {
  name: string;
  funktion: string;
  telefon: string;
  email: string;
  ist_hauptkontakt: boolean;
}

export interface Pflegeunternehmen {
  id: string;
  standort_id: string;
  firmenname: string;
  rechtsform: Rechtsform;
  ik_nummer: string;
  zulassung_72_sgb_xi: boolean;
  strasse: string;
  plz: string;
  ort: string;
  telefon: string;
  email: string;
  website: string;
  iban: string;
  status: PartnerStatus;
  ansprechpartner: PflegeunternehmenAnsprechpartner[];
  notiz: string;
  erstellt_am: string;
  geaendert_am: string;
}

// ---------------------------------------------------------------------------
// Dienstleister (Handwerker/Lieferanten)
// ---------------------------------------------------------------------------

export interface Dienstleister {
  id: string;
  name: string;
  gewerk: Gewerk;
  ansprechpartner: string;
  telefon: string;
  email: string;
  strasse: string;
  plz: string;
  ort: string;
  provision_prozent: number; // Vermittlungsprovision 8–15 %
  bewertung?: number; // 1–5
  aktiv: boolean;
}

// ---------------------------------------------------------------------------
// Recht: Nachweismatrix, Fristen, Ablehnungs-/Widerspruchsgründe
// ---------------------------------------------------------------------------

export interface NachweisTyp {
  code: NachweisCode;
  bezeichnung: string;
  beschreibung: string;
  rechtsgrundlage_id?: string;
}

// Soll-Eintrag der Pflichtnachweismatrix (welcher Nachweis für welchen Topf nötig ist).
export interface NachweisAnforderung {
  id: string;
  foerdertopf_id: string;
  nachweis_code: NachweisCode;
  pflicht: boolean;
  // optional eingeschränkt auf bestimmte Maßnahmenkategorie …
  massnahme_kategorie?: MassnahmeKategorie;
  // … oder bedingt an die Wohnform (z. B. Vermieterzustimmung nur bei Miete).
  bedingung_wohnform?: Wohnform;
  hinweis: string;
}

export interface FristRegel {
  id: string;
  foerdertopf_id: string;
  entscheidungsfrist_tage: number; // 21
  frist_mit_md_tage: number; // 35
  genehmigungsfiktion: boolean;
  widerspruch_frist_tage: number; // 30 (1 Monat)
  umsetzung_frist_tage?: number;
  rechtsgrundlage_id?: string;
}

export interface Ablehnungsgrund {
  id: string;
  code: string;
  bezeichnung: string;
  beschreibung: string;
  haeufigkeit: 'haeufig' | 'gelegentlich' | 'selten';
  empfohlene_reaktion: string;
  // Verknüpfte Widerspruchsgründe (ids), die typischerweise greifen.
  widerspruchsgrund_ids: string[];
}

export interface Widerspruchsgrund {
  id: string;
  code: string;
  bezeichnung: string;
  argumentation: string;
  rechtsgrundlage_id?: string;
}

// ---------------------------------------------------------------------------
// Dokumentenbibliothek (Vorlagen)
// ---------------------------------------------------------------------------

export type DokumentFormat = 'pdf' | 'docx' | 'html';

export interface DokumentVorlage {
  id: string;
  code: string;
  bezeichnung: string;
  kategorie: DokumentKategorie;
  beschreibung: string;
  foerdertopf_id?: string;
  rechtsgrundlage_id?: string;
  format: DokumentFormat;
  platzhalter: string[];
  // Teil des Pflicht-Antragspakets?
  pflicht: boolean;
  version: number;
  aktiv: boolean;
}

// ---------------------------------------------------------------------------
// Eigenes Unternehmen (Stammdaten für Dokumente/Briefkopf)
// ---------------------------------------------------------------------------

export interface UnternehmenBank {
  bank_name: string;
  iban: string;
  bic: string;
}

export interface Unternehmen {
  firmenname: string;
  strasse: string;
  plz: string;
  ort: string;
  telefon: string;
  email: string;
  website: string;
  geschaeftsfuehrer: string;
  handelsregister: string; // z. B. "HRB 123456 B, Amtsgericht Charlottenburg"
  ust_id: string;
  bank: UnternehmenBank;
  // Logo als Daten-URL (Base64) — leer = kein Logo hinterlegt.
  logo_data_url: string;
}

// ---------------------------------------------------------------------------
// Eingabetypen (ohne generierte/abgeleitete Felder) für Anlegen/Bearbeiten
// ---------------------------------------------------------------------------

export type KundeEingabe = Omit<Kunde, 'id' | 'erstellt_am' | 'geaendert_am'>;
export type PflegeunternehmenEingabe = Omit<Pflegeunternehmen, 'id' | 'erstellt_am' | 'geaendert_am'>;
export type KasseEingabe = Omit<Kasse, 'id'>;
export type DienstleisterEingabe = Omit<Dienstleister, 'id'>;

// ---------------------------------------------------------------------------
// Fotoverwaltung (IndexedDB — Blobs + Metadaten)
// ---------------------------------------------------------------------------

export type FotoKategorie =
  | 'bad'
  | 'wc'
  | 'dusche'
  | 'badewanne'
  | 'flur'
  | 'treppe'
  | 'eingang'
  | 'schlafzimmer'
  | 'kueche'
  | 'sonstiges';

export interface FotoMetadaten {
  id: string;
  kundeId: string;
  kategorie: FotoKategorie;
  // Optionale Verknüpfung zu einem Katalogeintrag (MassnahmeKatalog.code).
  massnahmeCode?: string;
  vorherNachher: 'vorher' | 'nachher';
  zeitstempel: string; // ISO
  // Freier Text — bei gewähltem Pflichtfoto-Slot wird dieser vorausgefüllt.
  beschreibung: string;
  groesse_bytes: number;
  breite_px?: number;
  hoehe_px?: number;
}

// Phase 2: Automatisch generierte Grundriss-Skizze (noch nicht implementiert).
export interface SkizzenAnhang {
  id: string;
  kundeId: string;
  raumBezeichnung: string;
  erzeugtAm: string; // ISO
  svg_data?: string;
  massstaab?: string; // z. B. "1:50"
  quellFotoIds: string[];
}

// Phase 3: Ergebnis der KI-Barrierenerkennung (noch nicht implementiert).
export interface KIBarriere {
  id: string;
  typ: string;
  raum: string;
  prioritaet: 'hoch' | 'mittel' | 'niedrig';
  din18040_ref?: string;
  massnahmeCode?: string;
  beschreibung: string;
}

export interface KIAnalyseErgebnis {
  id: string;
  kundeId: string;
  fotoIds: string[];
  analysiertAm: string; // ISO
  modell: string; // z. B. "claude-opus-4-8"
  erkannteBarrieren: KIBarriere[];
  empfehlungen: string[];
  konfidenz: number; // 0–1
}
