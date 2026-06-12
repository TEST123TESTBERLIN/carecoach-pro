// CareCoach Pro — Abtretungserklärung nach § 398 BGB (druckbar).
// Grundlage des 0-€-Modells: Die Pflegekasse zahlt den bewilligten §40-Zuschuss
// direkt an die CareCoach Pro GmbH; der Versicherte hat keinen Eigenanteil.

import { dokumentSeite, escapeHtml, euroFmt } from './html';
import { getUnternehmen } from '@/services/localStorageRepository';

// Zessionar (Abtretungsempfänger) — aus den Unternehmens-Einstellungen.
function zessionar(): { name: string; anschrift: string } {
  const u = getUnternehmen();
  return { name: u.firmenname, anschrift: `${u.strasse}, ${u.plz} ${u.ort}` };
}

export interface AbtretungMassnahme {
  bezeichnung: string;
  paragraph: string;
  betrag: number; // VK brutto
}

export interface AbtretungDaten {
  versicherter: {
    name: string;
    geburtsdatum?: string;
    anschrift: string;
    versichertennummer: string;
  };
  pflegekasse: { name: string; ik_nummer: string };
  // Optional: handelnder Bevollmächtigter (z. B. Angehöriger).
  bevollmaechtigter?: { name: string };
  massnahmen: AbtretungMassnahme[];
  ort?: string;
  datum?: string; // bereits formatiert (z. B. "11.06.2026")
}

// Erzeugt die vollständige Abtretungserklärung als druckbare HTML-Seite.
export function baueAbtretungserklaerungHtml(daten: AbtretungDaten): string {
  const ZESSIONAR = zessionar();
  const summe = daten.massnahmen.reduce((s, m) => s + m.betrag, 0);
  const ort = daten.ort ?? '';
  const datum = daten.datum ?? '';

  const zeilen = daten.massnahmen
    .map(
      (m) =>
        `<tr><td>${escapeHtml(m.bezeichnung)}</td><td>${escapeHtml(m.paragraph)}</td>` +
        `<td style="text-align:right">${euroFmt(m.betrag)}</td></tr>`,
    )
    .join('');

  const geb = daten.versicherter.geburtsdatum
    ? `, geb. ${escapeHtml(daten.versicherter.geburtsdatum)}`
    : '';

  const inhalt = `
  <h1>Abtretungserklärung</h1>
  <div class="meta">gemäß § 398 BGB — Zuschuss zu wohnumfeldverbessernden Maßnahmen nach § 40 Abs. 4 SGB XI</div>

  <h2>Versicherter (Zedent)</h2>
  <p>${escapeHtml(daten.versicherter.name)}${geb}<br>
  ${escapeHtml(daten.versicherter.anschrift)}<br>
  Versichertennummer: ${escapeHtml(daten.versicherter.versichertennummer || '—')}</p>

  <h2>Pflegekasse (Drittschuldner)</h2>
  <p>${escapeHtml(daten.pflegekasse.name)}<br>
  IK-Nummer: ${escapeHtml(daten.pflegekasse.ik_nummer || '—')}</p>

  <h2>Zessionar (Abtretungsempfänger)</h2>
  <p>${escapeHtml(ZESSIONAR.name)}<br>${escapeHtml(ZESSIONAR.anschrift)}</p>

  <h2>Abgetretene Maßnahmen und Beträge</h2>
  <table>
    <thead><tr><th>Maßnahme</th><th>Rechtsgrundlage</th><th style="text-align:right">Betrag (brutto)</th></tr></thead>
    <tbody>${zeilen || '<tr><td colspan="3">—</td></tr>'}</tbody>
    <tfoot><tr><th colspan="2">Gesamtbetrag der Abtretung</th><th style="text-align:right">${euroFmt(summe)}</th></tr></tfoot>
  </table>

  <h2>Abtretungserklärung</h2>
  <p class="recht">Hiermit trete ich, der oben genannte Versicherte, meinen Anspruch auf den Zuschuss
  bzw. die Kostenerstattung gegenüber der oben genannten Pflegekasse aus den vorstehend aufgeführten
  wohnumfeldverbessernden Maßnahmen nach § 40 Abs. 4 SGB XI in Höhe des jeweils bewilligten Betrages
  gemäß § 398 BGB an die ${escapeHtml(ZESSIONAR.name)} ab. Die ${escapeHtml(ZESSIONAR.name)} nimmt diese
  Abtretung an. Die Pflegekasse wird angewiesen und ermächtigt, den bewilligten Betrag mit befreiender
  Wirkung unmittelbar an die ${escapeHtml(ZESSIONAR.name)} auszuzahlen.</p>

  <div class="box hinweis"><strong>Hinweis:</strong> Die Pflegekasse zahlt direkt an die
  ${escapeHtml(ZESSIONAR.name)}. Der Versicherte hat keinen Eigenanteil.</div>

  <div class="sig">
    <div><div class="sigline">${escapeHtml(ort)}${ort ? ', ' : ''}${escapeHtml(datum)} &nbsp;—&nbsp; Ort, Datum</div></div>
    <div><div class="sigline">Unterschrift Versicherter</div></div>
    ${
      daten.bevollmaechtigter
        ? `<div><div class="sigline">Unterschrift Bevollmächtigter — ${escapeHtml(daten.bevollmaechtigter.name)}</div></div>`
        : ''
    }
  </div>

  <h2>Widerrufsbelehrung</h2>
  <p class="recht">Sie können diese Abtretungserklärung innerhalb von <strong>14 Tagen</strong> ohne Angabe
  von Gründen in Textform (z. B. Brief oder E-Mail) widerrufen. Die Frist beginnt am Tag der Unterzeichnung
  dieser Erklärung. Zur Wahrung der Widerrufsfrist genügt die rechtzeitige Absendung des Widerrufs an:
  ${escapeHtml(ZESSIONAR.name)}, ${escapeHtml(ZESSIONAR.anschrift)}. Im Falle eines wirksamen Widerrufs
  gilt die Abtretung als nicht erfolgt; der Anspruch verbleibt beim Versicherten.</p>
  `;

  return dokumentSeite(`Abtretungserklärung — ${daten.versicherter.name}`, inhalt);
}
