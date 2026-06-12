// Gemeinsame Typdefinitionen für das Dashboard.
// Spiegelt das JSON-Datenmodell aus CLAUDE.md (Klient, Maßnahme, Dokument) wider.

export type Pflegegrad = 1 | 2 | 3 | 4 | 5;

// Status eines Kunden im Förder-Prozess.
export type KlientStatus =
  | 'neu'
  | 'in_bearbeitung'
  | 'antrag_gestellt'
  | 'bewilligt'
  | 'abgeschlossen';

// Kontaktdaten eines/einer Angehörigen.
export interface Angehoeriger {
  name: string;
  telefon: string;
  email: string;
}

// Ambulanter Pflegedienst inkl. Kontaktperson.
export interface AmbulantePflege {
  dienst: string;
  kontaktperson: string;
  telefon: string;
}

// Kategorien für Kundennotizen (Kontakt-Historie).
export type NotizKategorie =
  | 'telefonat'
  | 'hausbesuch'
  | 'pflegekasse'
  | 'angehoerige'
  | 'handwerker'
  | 'intern';

// Einzelne Notiz am Kunden — Autor und Zeitstempel werden automatisch gesetzt.
export interface KundenNotiz {
  id: string;
  kategorie: NotizKategorie;
  text: string;
  autor: string;
  zeitpunkt: string; // ISO
}

export interface Klient {
  id: string;
  // Person
  vorname: string;
  nachname: string;
  // Adresse
  strasse: string;
  plz: string;
  ort: string;
  // Pflege & Kasse
  pflegegrad: Pflegegrad;
  krankenkasse: string;
  krankenkasse_ansprechpartner: string;
  // Kontakt
  telefon: string;
  email: string;
  // Angehörige & ambulante Pflege
  angehoeriger: Angehoeriger;
  ambulante_pflege: AmbulantePflege;
  // Prozess
  status: KlientStatus;
  // Anzahl Personen mit Pflegegrad im Haushalt (Förder-Multiplikator, max. 4).
  // Optional — Standard 1, wird im Förderrechner verwendet.
  personen_mit_pflegegrad?: number;
  // Chronologische Notiz-Historie (neueste zuerst).
  notizen?: KundenNotiz[];
}

// Eingabedaten für Anlegen/Bearbeiten (ohne generierte id).
export type KlientEingabe = Omit<Klient, 'id'>;

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
