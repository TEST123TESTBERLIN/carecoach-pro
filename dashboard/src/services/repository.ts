// CareCoach Pro — Service-Schicht (Repository-Verträge)
// Die UI spricht ausschließlich diese Interfaces an. Implementierung 1 = LocalStorage (Mock),
// Implementierung 2 (später) = HTTP/FastAPI — identische Signaturen, kein UI-Umbau nötig.

import type {
  Kunde,
  KundeEingabe,
  Projekt,
  Antrag,
  Standort,
  Foerdertopf,
  Rechtsgrundlage,
  MassnahmeKatalog,
  Kasse,
  KasseEingabe,
  Pflegeunternehmen,
  PflegeunternehmenEingabe,
  Dienstleister,
  DienstleisterEingabe,
  NachweisTyp,
  NachweisAnforderung,
  FristRegel,
  Ablehnungsgrund,
  Widerspruchsgrund,
  DokumentVorlage,
  DokumentKategorie,
} from '@/domain/types';

export type ProjektEingabe = Omit<Projekt, 'id' | 'erstellt_am' | 'geaendert_am'>;
export type AntragEingabe = Omit<Antrag, 'id'>;

export interface KundeRepository {
  list(): Kunde[];
  get(id: string): Kunde | undefined;
  create(input: KundeEingabe): Kunde;
  update(id: string, input: KundeEingabe): Kunde | undefined;
  remove(id: string): void;
}

export interface ProjektRepository {
  list(): Projekt[];
  listByKunde(kundeId: string): Projekt[];
  get(id: string): Projekt | undefined;
  create(input: ProjektEingabe): Projekt;
  update(id: string, input: ProjektEingabe): Projekt | undefined;
  remove(id: string): void;
}

export interface AntragRepository {
  list(): Antrag[];
  listByProjekt(projektId: string): Antrag[];
  get(id: string): Antrag | undefined;
  create(input: AntragEingabe): Antrag;
  update(id: string, input: AntragEingabe): Antrag | undefined;
  remove(id: string): void;
}

export interface KasseRepository {
  list(): Kasse[];
  get(id: string): Kasse | undefined;
  create(input: KasseEingabe): Kasse;
  update(id: string, input: KasseEingabe): Kasse | undefined;
  remove(id: string): void;
}

export interface PflegeunternehmenRepository {
  list(): Pflegeunternehmen[];
  get(id: string): Pflegeunternehmen | undefined;
  create(input: PflegeunternehmenEingabe): Pflegeunternehmen;
  update(id: string, input: PflegeunternehmenEingabe): Pflegeunternehmen | undefined;
  remove(id: string): void;
}

export interface DienstleisterRepository {
  list(): Dienstleister[];
  listByGewerk(gewerk: Dienstleister['gewerk']): Dienstleister[];
  get(id: string): Dienstleister | undefined;
  create(input: DienstleisterEingabe): Dienstleister;
  update(id: string, input: DienstleisterEingabe): Dienstleister | undefined;
  remove(id: string): void;
}

// Stammdaten/Kataloge sind in v1 schreibgeschützt (aus Seed).
export interface StammdatenRepository {
  standorte(): Standort[];
  foerdertoepfe(): Foerdertopf[];
  foerdertopf(id: string): Foerdertopf | undefined;
  rechtsgrundlagen(): Rechtsgrundlage[];
  rechtsgrundlage(id: string): Rechtsgrundlage | undefined;
  massnahmen(): MassnahmeKatalog[];
  massnahme(id: string): MassnahmeKatalog | undefined;
  nachweisTypen(): NachweisTyp[];
  // Nachweis-Anforderungen für einen Fördertopf (Pflichtnachweismatrix).
  nachweisAnforderungen(foerdertopfId: string): NachweisAnforderung[];
  fristRegel(foerdertopfId: string): FristRegel | undefined;
  ablehnungsgruende(): Ablehnungsgrund[];
  widerspruchsgruende(): Widerspruchsgrund[];
  dokumentVorlagen(): DokumentVorlage[];
  dokumentVorlagenByKategorie(kategorie: DokumentKategorie): DokumentVorlage[];
  dokumentVorlage(id: string): DokumentVorlage | undefined;
}

// Aggregierter Zugang — eine Instanz pro App.
export interface CareCoachRepository {
  kunden: KundeRepository;
  projekte: ProjektRepository;
  antraege: AntragRepository;
  kassen: KasseRepository;
  pflegeunternehmen: PflegeunternehmenRepository;
  dienstleister: DienstleisterRepository;
  stammdaten: StammdatenRepository;
}

// Eindeutige ID (Browser-API mit Fallback).
export function neueId(praefix = ''): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${praefix}${crypto.randomUUID()}`;
  }
  return `${praefix}${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}
