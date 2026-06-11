// CareCoach Pro — Vollständigkeitsprüfung (§7.4 des Datenmodells, MVP-Herzstück).
// Prüft einen Antrag vor dem Einreichen auf Rechtssicherheit und Vollständigkeit.
// Gate-Regel: Übergang `antrag → pruefung` nur erlaubt, wenn kein `fehler` vorliegt.

import type { Antrag, Projekt, Kunde, Dokument } from './types';

export type PruefStatus = 'ok' | 'warnung' | 'fehler';

export interface Pruefpunkt {
  nr: number;
  titel: string;
  status: PruefStatus;
  meldung: string;
}

export interface Pruefergebnis {
  punkte: Pruefpunkt[];
  bestanden: boolean; // kein Punkt mit Status 'fehler'
  fehler: number;
  warnungen: number;
}

export interface PruefKontext {
  antrag: Antrag;
  projekt: Projekt;
  kunde: Kunde;
  dokumente: Dokument[];
  // Ist dem Fördertopf eine Rechtsgrundlage zugeordnet?
  rechtsgrundlageVorhanden: boolean;
}

const FOERDER_PRO_TRAEGER = 4180;

// Verbotene Marketing-/Antrags-Formulierungen (Compliance, vgl. CLAUDE.md §5.4).
const VERBOTENE_PHRASEN = ['garantierte kostenübernahme', 'hilfsmittelverzeichnis gelistet'];

// Erkennt, ob ein Text eines der drei §40-Gesetzeskriterien enthält.
function enthaeltKriterium(text: string): boolean {
  const t = text.toLowerCase();
  const ermoeglicht = t.includes('häusliche pflege') && t.includes('ermöglich');
  const erleichtert = t.includes('häusliche pflege') && t.includes('erleichter');
  const selbststaendig = t.includes('selbstständige');
  return ermoeglicht || erleichtert || selbststaendig;
}

function vorhanden(status: string): boolean {
  return status === 'vorhanden' || status === 'geprueft';
}

// Hauptfunktion: führt alle Prüfpunkte aus.
export function pruefeAntrag(ctx: PruefKontext): Pruefergebnis {
  const { antrag, projekt, kunde, dokumente, rechtsgrundlageVorhanden } = ctx;
  const p: Pruefpunkt[] = [];

  // 1 — Gesetzesgrundlage
  p.push({
    nr: 1,
    titel: 'Gesetzesgrundlage',
    ...(antrag.foerdertopf_id && rechtsgrundlageVorhanden
      ? { status: 'ok' as const, meldung: 'Fördertopf mit Rechtsgrundlage verknüpft.' }
      : { status: 'fehler' as const, meldung: 'Fördertopf oder Rechtsgrundlage fehlt.' }),
  });

  // 2 — Antrag vor Maßnahmenbeginn
  if (!antrag.gestellt_am) {
    p.push({ nr: 2, titel: 'Antrag vor Beginn', status: 'fehler', meldung: 'Antragsdatum fehlt.' });
  } else if (
    antrag.geplanter_umsetzungsbeginn &&
    new Date(antrag.gestellt_am) > new Date(antrag.geplanter_umsetzungsbeginn)
  ) {
    p.push({
      nr: 2,
      titel: 'Antrag vor Beginn',
      status: 'fehler',
      meldung: 'Antrag wurde nach dem geplanten Maßnahmenbeginn gestellt → Förderverlust.',
    });
  } else {
    p.push({ nr: 2, titel: 'Antrag vor Beginn', status: 'ok', meldung: 'Antrag liegt vor Beginn.' });
  }

  // 3 — Begründung mit Gesetzeskriterium
  const ohneBegruendung = projekt.massnahmen.filter((m) => !m.begruendung.trim());
  const ohneKriterium = projekt.massnahmen.filter(
    (m) => m.begruendung.trim() && !enthaeltKriterium(m.begruendung),
  );
  if (projekt.massnahmen.length === 0) {
    p.push({ nr: 3, titel: 'Begründung', status: 'fehler', meldung: 'Keine Maßnahmen am Projekt.' });
  } else if (ohneBegruendung.length > 0) {
    p.push({
      nr: 3,
      titel: 'Begründung',
      status: 'fehler',
      meldung: `${ohneBegruendung.length} Maßnahme(n) ohne Begründung.`,
    });
  } else if (ohneKriterium.length > 0) {
    p.push({
      nr: 3,
      titel: 'Begründung',
      status: 'fehler',
      meldung: `${ohneKriterium.length} Begründung(en) ohne klares §40-Kriterium.`,
    });
  } else {
    p.push({ nr: 3, titel: 'Begründung', status: 'ok', meldung: 'Alle Begründungen mit Kriterium.' });
  }

  // 4 — Pflichtunterlagen (Nachweis-Checkliste)
  const offenePflicht = antrag.nachweise.filter((n) => n.pflicht && !vorhanden(n.status));
  p.push({
    nr: 4,
    titel: 'Pflichtunterlagen',
    ...(offenePflicht.length === 0
      ? { status: 'ok' as const, meldung: 'Alle Pflichtnachweise vorhanden.' }
      : {
          status: 'fehler' as const,
          meldung: `Fehlend: ${offenePflicht.map((n) => n.bezeichnung).join(', ')}.`,
        }),
  });

  // 5 — Fotos Ist-Zustand
  const hatFoto =
    dokumente.some((d) => d.kategorie === 'foto') ||
    antrag.nachweise.some((n) => n.code === 'foto_ist_zustand' && vorhanden(n.status));
  p.push({
    nr: 5,
    titel: 'Fotos Ist-Zustand',
    status: hatFoto ? 'ok' : 'fehler',
    meldung: hatFoto ? 'Fotos vorhanden.' : 'Keine Fotos des Ist-Zustands hinterlegt.',
  });

  // 6 — Kostenvoranschlag
  const hatKv =
    dokumente.some((d) => d.kategorie === 'kostenvoranschlag') ||
    antrag.nachweise.some((n) => n.code === 'kostenvoranschlag' && vorhanden(n.status));
  p.push({
    nr: 6,
    titel: 'Kostenvoranschlag',
    status: hatKv ? 'ok' : 'fehler',
    meldung: hatKv ? 'Kostenvoranschlag vorhanden.' : 'Detaillierter Kostenvoranschlag fehlt.',
  });

  // 7 — Einwilligung DSGVO
  p.push({
    nr: 7,
    titel: 'Einwilligung DSGVO',
    status: kunde.einwilligung_dsgvo ? 'ok' : 'fehler',
    meldung: kunde.einwilligung_dsgvo ? 'Einwilligung erteilt.' : 'DSGVO-Einwilligung fehlt.',
  });

  // 8 — Abtretung §398 (nur bei 0-€-Modell)
  if (projekt.abtretung_aktiv) {
    const hatAbtretung =
      antrag.nachweise.some((n) => n.code === 'abtretungserklaerung' && vorhanden(n.status)) ||
      dokumente.some((d) => d.kategorie === 'abtretungserklaerung' && d.unterschrieben);
    p.push({
      nr: 8,
      titel: 'Abtretung §398',
      status: hatAbtretung ? 'ok' : 'fehler',
      meldung: hatAbtretung ? 'Abtretung unterschrieben.' : 'Unterschriebene Abtretung fehlt.',
    });
  } else {
    p.push({
      nr: 8,
      titel: 'Abtretung §398',
      status: 'warnung',
      meldung: 'Keine Abtretung — Kunde trägt ggf. Eigenanteil/Vorleistung.',
    });
  }

  // 9 — Förder-Deckel
  const deckel = Math.min(kunde.personen_mit_pflegegrad, 4) * FOERDER_PRO_TRAEGER;
  const summeFoerderung = projekt.massnahmen.reduce((s, m) => s + m.foerderbetrag_beantragt, 0);
  p.push({
    nr: 9,
    titel: 'Förder-Deckel',
    status: summeFoerderung <= deckel ? 'ok' : 'warnung',
    meldung:
      summeFoerderung <= deckel
        ? `Beantragt ${summeFoerderung} € ≤ Deckel ${deckel} €.`
        : `Beantragt ${summeFoerderung} € über Deckel ${deckel} € → Eigenanteil/anderer Topf.`,
  });

  // 10 — Wording-Compliance
  const verstoesse = projekt.massnahmen.filter((m) =>
    VERBOTENE_PHRASEN.some((ph) => m.begruendung.toLowerCase().includes(ph)),
  );
  p.push({
    nr: 10,
    titel: 'Wording-Compliance',
    status: verstoesse.length === 0 ? 'ok' : 'fehler',
    meldung:
      verstoesse.length === 0
        ? 'Keine unzulässigen Formulierungen.'
        : 'Unzulässige Formulierung (z. B. „garantierte Kostenübernahme") gefunden.',
  });

  // 11 — Frist-Status
  if (
    antrag.entscheidungsfrist &&
    (antrag.status === 'eingereicht' || antrag.status === 'in_pruefung') &&
    new Date(antrag.entscheidungsfrist) < new Date()
  ) {
    p.push({
      nr: 11,
      titel: 'Frist-Status',
      status: 'warnung',
      meldung: 'Entscheidungsfrist überschritten — Genehmigungsfiktion prüfen.',
    });
  } else {
    p.push({ nr: 11, titel: 'Frist-Status', status: 'ok', meldung: 'Fristen im Rahmen.' });
  }

  const fehler = p.filter((x) => x.status === 'fehler').length;
  const warnungen = p.filter((x) => x.status === 'warnung').length;
  return { punkte: p, bestanden: fehler === 0, fehler, warnungen };
}
