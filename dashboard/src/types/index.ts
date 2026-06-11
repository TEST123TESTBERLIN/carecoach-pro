// Gemeinsame Typdefinitionen für das Dashboard.
// Spiegelt das JSON-Datenmodell aus CLAUDE.md (Klient, Maßnahme, Dokument) wider.

export type Pflegegrad = 1 | 2 | 3 | 4 | 5;

export type Bundesland = 'BE' | 'BY' | 'HH' | 'NW' | 'BW' | 'HE' | 'SN' | 'NI';

export interface Pflegekasse {
  name: string;
  versichertennummer: string;
}

export interface PflegedienstPartner {
  name: string;
  provision_prozent: number;
}

export interface Klient {
  id: string;
  vorname: string;
  nachname: string;
  alter: number;
  pflegegrad: Pflegegrad;
  hauptdiagnose: string;
  pflegekasse: Pflegekasse;
  bundesland: Bundesland;
  stadt: string;
  status: KlientStatus;
  // Anzahl Personen mit Pflegegrad im Haushalt (Förder-Multiplikator, max. 4)
  personen_mit_pflegegrad: number;
  pflegedienst_partner?: PflegedienstPartner;
}

export type KlientStatus =
  | 'lead'
  | 'beratung'
  | 'antrag_gestellt'
  | 'bewilligt'
  | 'abgeschlossen'
  | 'abgelehnt';

export interface Massnahme {
  id: string;
  bezeichnung: string;
  paragraph: string;
  vk_brutto: number; // Verkaufspreis brutto (Kunde / Kasse)
  ek_netto: number; // Einkaufspreis netto (intern)
}

export type DokumentTyp =
  | 'antrag'
  | 'abtretungserklaerung'
  | 'attest'
  | 'kostenvoranschlag'
  | 'bescheid'
  | 'rechnung';

export type DokumentStatus = 'entwurf' | 'eingereicht' | 'bewilligt' | 'abgelehnt';

export interface Dokument {
  id: string;
  klient_id: string;
  klient_name: string;
  typ: DokumentTyp;
  titel: string;
  status: DokumentStatus;
  erstellt_am: string; // ISO-Datum
  groesse_kb: number;
}
