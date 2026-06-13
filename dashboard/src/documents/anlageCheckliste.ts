// CareCoach Pro — Anlagen-Checkliste als eigenständiges Dokument.
// Listet alle Pflichtunterlagen und Pflichtfotos je Maßnahme dynamisch auf.
// Wichtigster Hinweis: Antrag MUSS vor Maßnahmenbeginn eingehen (§ 40 Abs. 7 SGB XI).

import { dokumentSeite, escapeHtml } from './html';
import type { Wohnform } from '@/domain/types';

export interface ChecklisteMassnahme {
  bezeichnung: string;
  raum?: string;
  kategorie?: string;
}

export interface ChecklistenDaten {
  versicherter: { name: string; pflegegrad: number };
  pflegekasse: { name: string };
  massnahmen: ChecklisteMassnahme[];
  wohnform: Wohnform;
  bevollmaechtigt: boolean;
  datum?: string;
}

// Erzeugt eine druckbare Anlagen-Checkliste, die dem Antrag beizulegen ist.
export function baueAnlageChecklisteHtml(daten: ChecklistenDaten): string {
  const v = daten.versicherter;
  const datum = daten.datum ?? new Date().toLocaleDateString('de-DE');

  // Pflichtunterlagen gemäß §40-Standardprofil + fallspezifische Bedingungen.
  const pflichtPunkte: { text: string; pflicht: boolean; hinweis?: string }[] = [
    { text: 'Antrag auf Wohnumfeldverbesserung nach § 40 Abs. 4 SGB XI (ausgefülltes Antragsformular)', pflicht: true },
    { text: 'Ärztliches Attest mit ICD-10-Diagnose und konkreter Funktionseinschränkung', pflicht: true },
    { text: 'Kostenvoranschlag mit Einzelpositionen (alle beantragten Maßnahmen)', pflicht: true },
    { text: 'Abtretungserklärung nach § 398 BGB (eigenhändig unterschrieben)', pflicht: true },
    { text: 'DSGVO-Einwilligung zur Datenverarbeitung (eigenhändig unterschrieben)', pflicht: true },
    {
      text: 'Vollmacht des Bevollmächtigten',
      pflicht: daten.bevollmaechtigt,
      hinweis: 'nur wenn Angehöriger als Bevollmächtigter handelt',
    },
    {
      text: 'Vermieterzustimmung der Hausverwaltung',
      pflicht: daten.wohnform === 'miete',
      hinweis: 'nur bei Mietwohnung mit baulichen Eingriffen (Bohrungen etc.)',
    },
    {
      text: 'Maßskizze / Grundriss mit Maßangaben',
      pflicht: daten.massnahmen.some((m) =>
        ['bad', 'treppen_lift', 'rampe'].includes(m.kategorie ?? ''),
      ),
      hinweis: 'bei Badumbau, Treppenlift oder Rampe',
    },
  ];

  const pflichtZeilen = pflichtPunkte
    .map((p) => {
      const hinweis = p.hinweis
        ? ` <span style="color:#888;font-size:11px">(${escapeHtml(p.hinweis)})</span>`
        : '';
      const entfaellt = !p.pflicht
        ? ' <span style="color:#bbb;font-size:12px">&mdash; entfällt</span>'
        : '';
      const checkFarbe = p.pflicht ? '#047857' : '#d1d5db';
      return `<li style="display:flex;align-items:flex-start;gap:10px;padding:6px 0;border-bottom:1px solid #f0f0f0">
        <span style="font-size:16px;color:${checkFarbe};flex-shrink:0;margin-top:-1px">${p.pflicht ? '☐' : '○'}</span>
        <span style="color:${p.pflicht ? '#1a1a1a' : '#9ca3af'}">${escapeHtml(p.text)}${hinweis}${entfaellt}</span>
      </li>`;
    })
    .join('');

  const fotoZeilen =
    daten.massnahmen.length > 0
      ? daten.massnahmen
          .map(
            (m) =>
              `<li style="display:flex;align-items:flex-start;gap:10px;padding:6px 0;border-bottom:1px solid #f0f0f0">
            <span style="font-size:16px;color:#047857;flex-shrink:0;margin-top:-1px">☐</span>
            <span>1–2 Fotos Ist-Zustand: <strong>${escapeHtml(m.bezeichnung)}</strong>${m.raum ? ` <span style="color:#888">(${escapeHtml(m.raum)})</span>` : ''}</span>
          </li>`,
          )
          .join('')
      : '<li style="color:#888;padding:8px 0">Keine Maßnahmen ausgewählt.</li>';

  const pflichtAnzahl = pflichtPunkte.filter((p) => p.pflicht).length;

  const inhalt = `
<h1>Anlagen-Checkliste</h1>
<div class="meta">§ 40 Abs. 4 SGB XI &nbsp;·&nbsp; ${escapeHtml(v.name)} &nbsp;·&nbsp; Pflegegrad ${v.pflegegrad} &nbsp;·&nbsp; ${escapeHtml(daten.pflegekasse.name)}</div>
<div class="meta" style="margin-top:3px">Erstellt: ${escapeHtml(datum)}</div>

<div class="box" style="background:#fff8ed;border-color:#f5a623;margin:16px 0">
  <strong>⚠ Wichtig:</strong> Der vollständige Antrag muss <strong>vor Beginn der Maßnahmen</strong>
  bei der Pflegekasse eingehen. Kein Antrag vor Beginn = Anspruchsverlust (§ 40 Abs. 4 Satz 2 SGB XI).
  Bitte Eingangsbeweis sichern (Einschreiben, Fax-Protokoll oder Eingangsbestätigung der Kasse).
</div>

<h2>Pflichtunterlagen (${pflichtAnzahl} erforderlich)</h2>
<ul style="list-style:none;padding:0;margin:0">${pflichtZeilen}</ul>

<h2>Pflichtfotos je Maßnahme (${daten.massnahmen.length} Maßnahmen)</h2>
<ul style="list-style:none;padding:0;margin:0">${fotoZeilen}</ul>

<div style="margin-top:20px;padding:10px 14px;background:#f4f6f8;border-radius:6px;font-size:12px;color:#555">
  <strong>Fototipps:</strong> Fotos mit Datum-/Uhrzeitstempel aufnehmen. Gute Auflösung (≥ 2 MP).
  Empfohlene Benennung: <em>Klient_Raum_Barriere.jpg</em> (z.&nbsp;B. Meier_Bad_Badewanne.jpg).
  Fotos zeigen deutlich die Barriere / den Ist-Zustand — keine Gegenlichtaufnahmen.
</div>`;

  return dokumentSeite(`Anlagen-Checkliste — ${v.name}`, inhalt);
}
