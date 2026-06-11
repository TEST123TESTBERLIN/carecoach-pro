// CareCoach Pro — §40-Antrag (druckbar) inkl. Nachweis-Checkliste als Anhang.
// Die Checkliste bildet die Pflichtunterlagen ab und markiert je Fall, was erforderlich ist.

import type { MassnahmeKatalog, Wohnform } from '@/domain/types';
import { dokumentSeite, escapeHtml, euroFmt } from './html';

export interface ChecklistePunkt {
  label: string;
  erforderlich: boolean;
  hinweis?: string;
}

// Leitet die Antrags-Checkliste aus den gewählten Maßnahmen und dem Fall ab.
export function baueAntragCheckliste(
  massnahmen: MassnahmeKatalog[],
  opts: { wohnform: Wohnform; bevollmaechtigt: boolean },
): ChecklistePunkt[] {
  const kategorien = new Set(massnahmen.map((m) => m.kategorie));
  // Maßskizze/Grundriss bei Handläufen (treppen_lift), Rampen, Bad sowie wo explizit gefordert.
  const brauchtMasskizze =
    kategorien.has('rampe') ||
    kategorien.has('treppen_lift') ||
    kategorien.has('bad') ||
    massnahmen.some((m) => m.zusatz_nachweise.includes('masskizze'));
  // Vermieterzustimmung bei Mietwohnung + baulichem Eingriff (Bohrung).
  const brauchtVermieter =
    opts.wohnform === 'miete' &&
    massnahmen.some(
      (m) => m.hv_genehmigung_noetig || m.zusatz_nachweise.includes('vermieterzustimmung'),
    );

  return [
    { label: 'Fotos Ist-Zustand (je Maßnahme 1–2 Fotos)', erforderlich: true },
    {
      label: 'Maßskizze / Grundriss',
      erforderlich: brauchtMasskizze,
      hinweis: 'bei Handläufen, Rampen, Bad/Treppenlift',
    },
    { label: 'Ärztliches Attest mit ICD-10 und Funktionseinschränkung', erforderlich: true },
    { label: 'Kostenvoranschlag mit Einzelpositionen', erforderlich: true },
    { label: 'Abtretungserklärung unterschrieben', erforderlich: true },
    { label: 'Vollmacht Angehörige', erforderlich: opts.bevollmaechtigt, hinweis: 'falls vorhanden' },
    {
      label: 'Vermieterzustimmung',
      erforderlich: brauchtVermieter,
      hinweis: 'bei Bohrungen/baulichen Maßnahmen',
    },
    { label: 'DSGVO-Einwilligung', erforderlich: true },
  ];
}

export interface AntragPosition {
  bezeichnung: string;
  paragraph: string;
  betrag: number;
  begruendung: string;
}

export interface AntragDaten {
  versicherter: {
    name: string;
    geburtsdatum?: string;
    anschrift: string;
    versichertennummer: string;
    pflegegrad: number;
    diagnose: string;
    icd10: string[];
  };
  pflegekasse: { name: string; ik_nummer: string };
  positionen: AntragPosition[];
  checkliste: ChecklistePunkt[];
  beantragter_betrag: number;
}

// Erzeugt den vollständigen Antrag inkl. Checklisten-Anhang als druckbare HTML-Seite.
export function baueAntragHtml(daten: AntragDaten): string {
  const v = daten.versicherter;
  const geb = v.geburtsdatum ? `, geb. ${escapeHtml(v.geburtsdatum)}` : '';
  const summeVk = daten.positionen.reduce((s, p) => s + p.betrag, 0);

  const positionen = daten.positionen
    .map(
      (p) => `
    <div style="margin:12px 0;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px">
      <div style="display:flex;justify-content:space-between;gap:12px">
        <strong>${escapeHtml(p.bezeichnung)}</strong>
        <span>${euroFmt(p.betrag)} · ${escapeHtml(p.paragraph)}</span>
      </div>
      <p class="recht" style="margin-top:6px">${escapeHtml(p.begruendung)}</p>
    </div>`,
    )
    .join('');

  const check = daten.checkliste
    .map((c) => {
      const mark = c.erforderlich
        ? '<span class="ja">✓</span>'
        : '<span class="nein">○</span>';
      const status = c.erforderlich ? '' : ' <span class="nein">— entfällt</span>';
      const hint = c.hinweis ? ` <span class="hint">(${escapeHtml(c.hinweis)})</span>` : '';
      return `<li>${mark} ${escapeHtml(c.label)}${hint}${status}</li>`;
    })
    .join('');

  const inhalt = `
  <h1>Antrag auf Zuschuss zu wohnumfeldverbessernden Maßnahmen</h1>
  <div class="meta">§ 40 Abs. 4 SGB XI i. V. m. § 28a Abs. 1 Nr. 5 SGB XI</div>

  <h2>Versicherter</h2>
  <p>${escapeHtml(v.name)}${geb}<br>
  ${escapeHtml(v.anschrift)}<br>
  Versichertennummer: ${escapeHtml(v.versichertennummer || '—')} · Pflegegrad: ${v.pflegegrad}</p>

  <h2>Pflegekasse</h2>
  <p>${escapeHtml(daten.pflegekasse.name)} · IK ${escapeHtml(daten.pflegekasse.ik_nummer || '—')}</p>

  <h2>Diagnose</h2>
  <p>${escapeHtml(v.diagnose || '—')}${v.icd10.length ? ` (ICD-10: ${escapeHtml(v.icd10.join(', '))})` : ''}</p>

  <h2>Beantragte Maßnahmen und Begründung</h2>
  ${positionen || '<p>—</p>'}

  <table>
    <tfoot><tr>
      <th>Projektkosten (brutto)</th>
      <th style="text-align:right">${euroFmt(summeVk)}</th>
    </tr>
    <tr>
      <th>Beantragter Zuschuss § 40 Abs. 4</th>
      <th style="text-align:right">${euroFmt(daten.beantragter_betrag)}</th>
    </tr></tfoot>
  </table>

  <h2>Anhang: Nachweis-Checkliste</h2>
  <ul class="check">${check}</ul>
  `;

  return dokumentSeite(`Antrag § 40 Abs. 4 — ${v.name}`, inhalt);
}
