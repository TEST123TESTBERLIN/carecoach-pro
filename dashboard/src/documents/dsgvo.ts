// CareCoach Pro — DSGVO-Einwilligung nach Art. 6 Abs. 1 lit. a + Art. 9 Abs. 2 lit. a DSGVO.
// Gesundheitsdaten (Pflegegrad, Diagnose, ICD-10) fallen unter Art. 9 Abs. 1 DSGVO (besondere
// Kategorien) und erfordern eine explizite schriftliche Einwilligung.

import { dokumentSeite, escapeHtml, baueKopfzeile } from './html';
import { getUnternehmen } from '@/services/localStorageRepository';

export interface DsgvoDaten {
  versicherter: {
    name: string;
    anschrift: string;
  };
  pflegekasse: { name: string };
  bevollmaechtigter?: { name: string };
  ort?: string;
  datum?: string;
}

export function baueDsgvoHtml(daten: DsgvoDaten): string {
  const u = getUnternehmen();
  const v = daten.versicherter;
  const ort = daten.ort ?? '';
  const datum = daten.datum ?? '';

  const verantwortlicher = [
    escapeHtml(u.firmenname),
    escapeHtml(u.strasse),
    `${escapeHtml(u.plz)} ${escapeHtml(u.ort)}`,
    u.email ? escapeHtml(u.email) : '',
    u.geschaeftsfuehrer ? `Geschäftsführer: ${escapeHtml(u.geschaeftsfuehrer)}` : '',
  ]
    .filter(Boolean)
    .join('<br>');

  const inhalt = `
${baueKopfzeile(u)}
<h1>Einwilligung zur Datenverarbeitung</h1>
<div class="meta">gemäß Art. 6 Abs. 1 lit. a und Art. 9 Abs. 2 lit. a DSGVO</div>

<h2>Betroffene Person</h2>
<p>${escapeHtml(v.name)}<br>${escapeHtml(v.anschrift)}</p>

<h2>Verantwortlicher</h2>
<p>${verantwortlicher}</p>

<h2>Zweck der Datenverarbeitung</h2>
<p class="recht">Ich willige ein, dass der Verantwortliche meine personenbezogenen Daten
einschließlich besonderer Kategorien personenbezogener Daten (Gesundheitsdaten, Pflegegrad,
Diagnosen, ICD-10-Codes; Art. 9 Abs. 1 DSGVO) für folgende Zwecke verarbeitet:</p>
<ul style="font-size:12px;color:#444;margin:8px 0 8px 24px;line-height:1.8">
  <li>Beratung, Planung und Beantragung von Leistungen zur Wohnumfeldverbesserung nach § 40 Abs. 4 SGB XI</li>
  <li>Kommunikation mit der Pflegekasse (${escapeHtml(daten.pflegekasse.name)}) im Rahmen des Bewilligungsverfahrens</li>
  <li>Erstellung und Verwaltung von Antragsunterlagen, Kostenvoranschlägen und Bescheiden</li>
  <li>Weitergabe der erforderlichen Daten an ausführende Handwerks- und Dienstleistungsbetriebe zur Umsetzung bewilligter Maßnahmen</li>
  <li>Interne Qualitätssicherung und Optimierung der Beratungsleistung (anonymisiert)</li>
</ul>

<h2>Speicherdauer</h2>
<p class="recht">Die Daten werden für die Dauer des Förder- und Umsetzungsverfahrens sowie für die
gesetzlich vorgeschriebenen Aufbewahrungsfristen gespeichert (10 Jahre gemäß § 147 Abs. 3 AO,
§ 257 Abs. 4 HGB). Nach Ablauf der Aufbewahrungsfrist werden die Daten gelöscht.</p>

<h2>Empfänger der Daten</h2>
<p class="recht">Empfänger der Daten sind: ${escapeHtml(daten.pflegekasse.name)},
ausführende Handwerksbetriebe (soweit für die Umsetzung der Maßnahme erforderlich) sowie
behördliche Stellen (soweit gesetzlich vorgeschrieben). Eine Weitergabe an Dritte zu Werbezwecken
erfolgt nicht.</p>

<h2>Ihre Rechte</h2>
<p class="recht">Sie haben folgende Rechte gegenüber dem Verantwortlichen:
<strong>Auskunft</strong> (Art. 15 DSGVO) · <strong>Berichtigung</strong> (Art. 16) ·
<strong>Löschung</strong> (Art. 17) · <strong>Einschränkung der Verarbeitung</strong> (Art. 18) ·
<strong>Datenübertragbarkeit</strong> (Art. 20) · <strong>Widerspruch</strong> (Art. 21 DSGVO).
Diese Rechte können Sie jederzeit schriftlich oder per E-Mail gegenüber dem Verantwortlichen geltend machen.</p>

<h2>Widerrufsrecht</h2>
<p class="recht">Sie können diese Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen.
Die Rechtmäßigkeit der aufgrund der Einwilligung bis zum Widerruf erfolgten Verarbeitung
bleibt davon unberührt. Widerruf schriftlich oder per E-Mail an:
${escapeHtml(u.firmenname)}${u.email ? `, ${escapeHtml(u.email)}` : ''}.
Sie haben außerdem das Recht auf Beschwerde bei der Aufsichtsbehörde:
<strong>Berliner Beauftragte für Datenschutz und Informationsfreiheit</strong>,
Friedrichstr. 219, 10969 Berlin, mailbox@datenschutz-berlin.de.</p>

<div class="sig">
  <div>
    <div class="sigline">${escapeHtml(ort)}${ort ? ', ' : ''}${escapeHtml(datum)} &nbsp;—&nbsp; Ort, Datum</div>
  </div>
  <div>
    <div class="sigline">Unterschrift Einwilligende/r &mdash; ${escapeHtml(v.name)}</div>
  </div>
  ${
    daten.bevollmaechtigter
      ? `<div><div class="sigline">Unterschrift Bevollmächtigte/r &mdash; ${escapeHtml(daten.bevollmaechtigter.name)}</div></div>`
      : ''
  }
</div>`;

  return dokumentSeite(`DSGVO-Einwilligung — ${v.name}`, inhalt);
}
