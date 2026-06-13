// CareCoach Pro — Vollmacht zur Antragstellung nach § 40 Abs. 4 SGB XI.
// Erzeugt ein druckbares Vollmacht-Dokument für den Bevollmächtigten (Angehöriger).
// Nur erzeugen, wenn im Wizard „Bevollmächtigter" aktiviert ist.

import { dokumentSeite, escapeHtml, baueKopfzeile } from './html';
import { getUnternehmen } from '@/services/localStorageRepository';

const BEZIEHUNG_TEXT: Record<string, string> = {
  ehepartner: 'Ehepartner/in',
  kind: 'Kind',
  elternteil: 'Elternteil',
  geschwister: 'Geschwister',
  betreuer: 'gesetzliche/r Betreuer/in',
  sonstige: 'sonstige bevollmächtigte Person',
};

export interface VollmachtDaten {
  versicherter: {
    name: string;
    geburtsdatum?: string;
    anschrift: string;
    versichertennummer: string;
    pflegegrad: number;
  };
  bevollmaechtigter: {
    name: string;
    beziehung: string;
  };
  pflegekasse: { name: string };
  ort?: string;
  datum?: string;
}

export function baueVollmachtHtml(daten: VollmachtDaten): string {
  const u = getUnternehmen();
  const v = daten.versicherter;
  const bev = daten.bevollmaechtigter;
  const geb = v.geburtsdatum ? `, geb. ${escapeHtml(v.geburtsdatum)}` : '';
  const beziehungText = BEZIEHUNG_TEXT[bev.beziehung] ?? escapeHtml(bev.beziehung);
  const ort = daten.ort ?? '';
  const datum = daten.datum ?? '';

  const inhalt = `
${baueKopfzeile(u)}
<h1>Vollmacht zur Antragstellung</h1>
<div class="meta">Wohnumfeldverbesserung nach § 40 Abs. 4 SGB XI</div>

<h2>Vollmachtgeber/in (Versicherte/r)</h2>
<p>${escapeHtml(v.name)}${geb}<br>
${escapeHtml(v.anschrift)}<br>
Versichertennummer: ${escapeHtml(v.versichertennummer || '—')} &nbsp;·&nbsp; Pflegegrad: ${v.pflegegrad}<br>
Pflegekasse: ${escapeHtml(daten.pflegekasse.name)}</p>

<h2>Bevollmächtigte/r</h2>
<p>${escapeHtml(bev.name)} &nbsp;(${escapeHtml(beziehungText)})<br>
<em style="color:#888;font-size:12px">Anschrift: ___________________________________________</em></p>

<h2>Vollmacht</h2>
<p class="recht">Ich, der/die oben genannte Vollmachtgeber/in, bevollmächtige hiermit
<strong>${escapeHtml(bev.name)}</strong> (${escapeHtml(beziehungText)}), mich in allen Angelegenheiten
rund um die Antragstellung auf Zuschuss zu wohnumfeldverbessernden Maßnahmen nach
<strong>§ 40 Abs. 4 SGB XI</strong> gegenüber der ${escapeHtml(daten.pflegekasse.name)} zu vertreten.
Die Vollmacht umfasst insbesondere:</p>
<ul style="font-size:12px;color:#444;margin:8px 0 8px 24px;line-height:1.8">
  <li>Unterzeichnung und Einreichung des Antrags auf Wohnumfeldverbesserung</li>
  <li>Unterzeichnung der Abtretungserklärung nach § 398 BGB</li>
  <li>Entgegennahme von Bescheiden und Schriftsätzen der Pflegekasse</li>
  <li>Einlegung von Widersprüchen bei Ablehnung des Antrags</li>
  <li>alle sonstigen im Zusammenhang stehenden Erklärungen und Willenserklärungen</li>
</ul>
<p class="recht">Die Vollmacht gilt bis zum vollständigen Abschluss des Bewilligungsverfahrens
einschließlich etwaiger Widerspruchs- und Klageverfahren.</p>

<div class="box hinweis">
  <strong>Hinweis:</strong> Diese Vollmacht bezieht sich ausschließlich auf das oben genannte
  Förderverfahren nach § 40 Abs. 4 SGB XI und erlischt mit dessen Abschluss.
</div>

<div class="sig">
  <div>
    <div class="sigline">${escapeHtml(ort)}${ort ? ', ' : ''}${escapeHtml(datum)} &nbsp;—&nbsp; Ort, Datum</div>
  </div>
  <div>
    <div class="sigline">Unterschrift Vollmachtgeber/in &mdash; ${escapeHtml(v.name)}</div>
  </div>
  <div>
    <div class="sigline">Unterschrift Bevollmächtigte/r &mdash; ${escapeHtml(bev.name)}</div>
  </div>
</div>`;

  return dokumentSeite(`Vollmacht — ${v.name}`, inhalt);
}
