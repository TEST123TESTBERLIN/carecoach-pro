// CareCoach Pro — LocalStorage-Implementierung der Service-Schicht (Mock für MVP).
// Persistiert Kunden/Projekte/Anträge im Browser; Stammdaten kommen aus dem Seed.

import type {
  Kunde,
  KundeEingabe,
  Projekt,
  Antrag,
  Kasse,
  KasseEingabe,
  Pflegeunternehmen,
  PflegeunternehmenEingabe,
  Dienstleister,
  DienstleisterEingabe,
  Unternehmen,
} from '@/domain/types';
import {
  STANDORTE,
  FOERDERTOEPFE,
  RECHTSGRUNDLAGEN,
  MASSNAHMEN_KATALOG,
} from '@/domain/seed';
import {
  KASSEN,
  PFLEGEUNTERNEHMEN,
  DIENSTLEISTER,
  NACHWEIS_TYPEN,
  NACHWEIS_ANFORDERUNGEN,
  FRIST_REGELN,
  ABLEHNUNGSGRUENDE,
  WIDERSPRUCHSGRUENDE,
  DOKUMENT_VORLAGEN,
} from '@/domain/stammdatenSeed';
import {
  type CareCoachRepository,
  type KundeRepository,
  type ProjektRepository,
  type AntragRepository,
  type KasseRepository,
  type PflegeunternehmenRepository,
  type DienstleisterRepository,
  type StammdatenRepository,
  type UnternehmenRepository,
  type ProjektEingabe,
  type AntragEingabe,
  neueId,
} from './repository';

const KEYS = {
  kunden: 'ccpro_v1_kunden',
  projekte: 'ccpro_v1_projekte',
  antraege: 'ccpro_v1_antraege',
  kassen: 'ccpro_v1_kassen',
  pflegeunternehmen: 'ccpro_v1_pflegeunternehmen',
  dienstleister: 'ccpro_v1_dienstleister',
  unternehmen: 'ccpro_v1_unternehmen',
} as const;

// --- LocalStorage-Hilfen ---
function lade<T>(key: string, fallback: T[]): T[] {
  try {
    const roh = localStorage.getItem(key);
    if (roh) {
      const daten = JSON.parse(roh) as T[];
      if (Array.isArray(daten)) return daten;
    }
  } catch {
    // beschädigte Daten ignorieren
  }
  return fallback;
}

function speichere<T>(key: string, daten: T[]): void {
  localStorage.setItem(key, JSON.stringify(daten));
}

function jetzt(): string {
  return new Date().toISOString();
}

// --- Kunden ---
function kundeRepo(): KundeRepository {
  let cache = lade<Kunde>(KEYS.kunden, []);
  const persist = () => speichere(KEYS.kunden, cache);

  return {
    list: () => cache,
    get: (id) => cache.find((k) => k.id === id),
    create: (input: KundeEingabe) => {
      const kunde: Kunde = { ...input, id: neueId('k-'), erstellt_am: jetzt(), geaendert_am: jetzt() };
      cache = [kunde, ...cache];
      persist();
      return kunde;
    },
    update: (id, input) => {
      const vorhanden = cache.find((k) => k.id === id);
      if (!vorhanden) return undefined;
      const aktualisiert: Kunde = {
        ...input,
        id,
        erstellt_am: vorhanden.erstellt_am,
        geaendert_am: jetzt(),
      };
      cache = cache.map((k) => (k.id === id ? aktualisiert : k));
      persist();
      return aktualisiert;
    },
    remove: (id) => {
      cache = cache.filter((k) => k.id !== id);
      persist();
    },
  };
}

// --- Projekte ---
function projektRepo(): ProjektRepository {
  let cache = lade<Projekt>(KEYS.projekte, []);
  const persist = () => speichere(KEYS.projekte, cache);

  return {
    list: () => cache,
    listByKunde: (kundeId) => cache.filter((p) => p.kunde_id === kundeId),
    get: (id) => cache.find((p) => p.id === id),
    create: (input: ProjektEingabe) => {
      const projekt: Projekt = {
        ...input,
        id: neueId('p-'),
        erstellt_am: jetzt(),
        geaendert_am: jetzt(),
      };
      cache = [projekt, ...cache];
      persist();
      return projekt;
    },
    update: (id, input) => {
      const vorhanden = cache.find((p) => p.id === id);
      if (!vorhanden) return undefined;
      const aktualisiert: Projekt = {
        ...input,
        id,
        erstellt_am: vorhanden.erstellt_am,
        geaendert_am: jetzt(),
      };
      cache = cache.map((p) => (p.id === id ? aktualisiert : p));
      persist();
      return aktualisiert;
    },
    remove: (id) => {
      cache = cache.filter((p) => p.id !== id);
      persist();
    },
  };
}

// --- Anträge ---
function antragRepo(): AntragRepository {
  let cache = lade<Antrag>(KEYS.antraege, []);
  const persist = () => speichere(KEYS.antraege, cache);

  return {
    list: () => cache,
    listByProjekt: (projektId) => cache.filter((a) => a.projekt_id === projektId),
    get: (id) => cache.find((a) => a.id === id),
    create: (input: AntragEingabe) => {
      const antrag: Antrag = { ...input, id: neueId('a-') };
      cache = [antrag, ...cache];
      persist();
      return antrag;
    },
    update: (id, input) => {
      if (!cache.some((a) => a.id === id)) return undefined;
      const aktualisiert: Antrag = { ...input, id };
      cache = cache.map((a) => (a.id === id ? aktualisiert : a));
      persist();
      return aktualisiert;
    },
    remove: (id) => {
      cache = cache.filter((a) => a.id !== id);
      persist();
    },
  };
}

// --- Kassen (CRUD, aus Seed initialisiert) ---
function kasseRepo(): KasseRepository {
  let cache = lade<Kasse>(KEYS.kassen, KASSEN);
  const persist = () => speichere(KEYS.kassen, cache);
  return {
    list: () => cache,
    get: (id) => cache.find((x) => x.id === id),
    create: (input: KasseEingabe) => {
      const kasse: Kasse = { ...input, id: neueId('ka-') };
      cache = [kasse, ...cache];
      persist();
      return kasse;
    },
    update: (id, input) => {
      if (!cache.some((x) => x.id === id)) return undefined;
      const aktualisiert: Kasse = { ...input, id };
      cache = cache.map((x) => (x.id === id ? aktualisiert : x));
      persist();
      return aktualisiert;
    },
    remove: (id) => {
      cache = cache.filter((x) => x.id !== id);
      persist();
    },
  };
}

// --- Pflegeunternehmen (CRUD, aus Seed initialisiert) ---
function pflegeunternehmenRepo(): PflegeunternehmenRepository {
  let cache = lade<Pflegeunternehmen>(KEYS.pflegeunternehmen, PFLEGEUNTERNEHMEN);
  const persist = () => speichere(KEYS.pflegeunternehmen, cache);
  return {
    list: () => cache,
    get: (id) => cache.find((x) => x.id === id),
    create: (input: PflegeunternehmenEingabe) => {
      const pu: Pflegeunternehmen = {
        ...input,
        id: neueId('pu-'),
        erstellt_am: jetzt(),
        geaendert_am: jetzt(),
      };
      cache = [pu, ...cache];
      persist();
      return pu;
    },
    update: (id, input) => {
      const vorhanden = cache.find((x) => x.id === id);
      if (!vorhanden) return undefined;
      const aktualisiert: Pflegeunternehmen = {
        ...input,
        id,
        erstellt_am: vorhanden.erstellt_am,
        geaendert_am: jetzt(),
      };
      cache = cache.map((x) => (x.id === id ? aktualisiert : x));
      persist();
      return aktualisiert;
    },
    remove: (id) => {
      cache = cache.filter((x) => x.id !== id);
      persist();
    },
  };
}

// --- Dienstleister (CRUD, aus Seed initialisiert) ---
function dienstleisterRepo(): DienstleisterRepository {
  let cache = lade<Dienstleister>(KEYS.dienstleister, DIENSTLEISTER);
  const persist = () => speichere(KEYS.dienstleister, cache);
  return {
    list: () => cache,
    listByGewerk: (gewerk) => cache.filter((x) => x.gewerk === gewerk),
    get: (id) => cache.find((x) => x.id === id),
    create: (input: DienstleisterEingabe) => {
      const dl: Dienstleister = { ...input, id: neueId('dl-') };
      cache = [dl, ...cache];
      persist();
      return dl;
    },
    update: (id, input) => {
      if (!cache.some((x) => x.id === id)) return undefined;
      const aktualisiert: Dienstleister = { ...input, id };
      cache = cache.map((x) => (x.id === id ? aktualisiert : x));
      persist();
      return aktualisiert;
    },
    remove: (id) => {
      cache = cache.filter((x) => x.id !== id);
      persist();
    },
  };
}

// --- Eigenes Unternehmen (Singleton mit Defaults: GLJ Germany GmbH) ---
export const UNTERNEHMEN_DEFAULTS: Unternehmen = {
  firmenname: 'GLJ Germany GmbH',
  strasse: 'Reichsstraße 107',
  plz: '14052',
  ort: 'Berlin',
  telefon: '',
  email: '',
  website: '',
  geschaeftsfuehrer: '',
  handelsregister: '',
  ust_id: '',
  bank: { bank_name: '', iban: '', bic: '' },
  logo_data_url: '',
};

function ladeUnternehmen(): Unternehmen {
  try {
    const roh = localStorage.getItem(KEYS.unternehmen);
    if (roh) {
      const daten = JSON.parse(roh) as Partial<Unternehmen>;
      // Defaults mergen — neue Felder bleiben bei Altbeständen befüllt.
      return {
        ...UNTERNEHMEN_DEFAULTS,
        ...daten,
        bank: { ...UNTERNEHMEN_DEFAULTS.bank, ...(daten.bank ?? {}) },
      };
    }
  } catch {
    // beschädigte Daten ignorieren
  }
  return UNTERNEHMEN_DEFAULTS;
}

function unternehmenRepo(): UnternehmenRepository {
  let cache = ladeUnternehmen();
  return {
    get: () => cache,
    update: (input: Unternehmen) => {
      cache = input;
      localStorage.setItem(KEYS.unternehmen, JSON.stringify(cache));
      return cache;
    },
  };
}

// --- Stammdaten/Kataloge (read-only aus Seed) ---
function stammdatenRepo(): StammdatenRepository {
  return {
    standorte: () => STANDORTE,
    foerdertoepfe: () => FOERDERTOEPFE,
    foerdertopf: (id) => FOERDERTOEPFE.find((f) => f.id === id),
    rechtsgrundlagen: () => RECHTSGRUNDLAGEN,
    rechtsgrundlage: (id) => RECHTSGRUNDLAGEN.find((r) => r.id === id),
    massnahmen: () => MASSNAHMEN_KATALOG,
    massnahme: (id) => MASSNAHMEN_KATALOG.find((m) => m.id === id),
    nachweisTypen: () => NACHWEIS_TYPEN,
    nachweisAnforderungen: (foerdertopfId) =>
      NACHWEIS_ANFORDERUNGEN.filter((n) => n.foerdertopf_id === foerdertopfId),
    fristRegel: (foerdertopfId) => FRIST_REGELN.find((f) => f.foerdertopf_id === foerdertopfId),
    ablehnungsgruende: () => ABLEHNUNGSGRUENDE,
    widerspruchsgruende: () => WIDERSPRUCHSGRUENDE,
    dokumentVorlagen: () => DOKUMENT_VORLAGEN,
    dokumentVorlagenByKategorie: (kategorie) =>
      DOKUMENT_VORLAGEN.filter((v) => v.kategorie === kategorie),
    dokumentVorlage: (id) => DOKUMENT_VORLAGEN.find((v) => v.id === id),
  };
}

// Factory: liefert eine vollständige Repository-Instanz auf LocalStorage-Basis.
export function createLocalStorageRepository(): CareCoachRepository {
  return {
    kunden: kundeRepo(),
    projekte: projektRepo(),
    antraege: antragRepo(),
    kassen: kasseRepo(),
    pflegeunternehmen: pflegeunternehmenRepo(),
    dienstleister: dienstleisterRepo(),
    stammdaten: stammdatenRepo(),
    unternehmen: unternehmenRepo(),
  };
}

// App-weite Singleton-Instanz (LocalStorage-Backend, MVP).
export const repository: CareCoachRepository = createLocalStorageRepository();

// Komfort-Zugriff für Dokument-Templates (Briefkopf, Zessionar, Bankverbindung).
export function getUnternehmen(): Unternehmen {
  return repository.unternehmen.get();
}
