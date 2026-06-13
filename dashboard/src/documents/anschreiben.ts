// CareCoach Pro — Anschreiben an die Pflegekasse (§ 40 Abs. 4 SGB XI).
// Professionelles Begleitschreiben mit Anlageninventar und Hinweis auf
// die 3-Wochen-Frist + Genehmigungsfiktion (§ 40 Abs. 7 SGB XI).

import { dokumentSeite, escapeHtml, euroFmt, baueKopfzeile } from './html';
import { getUnternehmen } from '@/services/localStorageRepository';

export interface AnschreibenDaten {
  kasse: {
    name: string;
    // Postanschrift speziell für Antragseingang (aus KASSEN-Seed).
    postanschrift_antraege: string;
    ik_nummer: string;
  };
  versicherter: {
    name: string;
    anschrift: string;
    versichertennummer: string;
    pflegegrad: number;
  };
  beantragter_betrag: number;
  // Geordnete Liste der beigefügten Anlagen (werden nummeriert ausgegeben).
  anlagen: string[];
  ort?: string;
  datum?: string;
}

export function baueAnschreibenHtml(daten: AnschreibenDaten): string {
  const u = getUnternehmen();
  const v = daten.versicherter;
  const ort = daten.ort ?? u.ort;
  const datum = daten.datum ?? new Date().toLocaleDateString('de-DE');

  const anlagenZeilen = daten.anlagen
    .map((a, i) => `<li>${i + 1}.&nbsp; ${escapeHtml(a)}</li>`)
    .join('');

  const inhalt = `
${baueKopfzeile(u)}

<div style="margin-bottom:22px">
  <div style="font-size:11px;color:#888;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin-bottom:10px">
    ${escapeHtml(u.firmenname)} · ${escapeHtml(u.strasse)} · ${escapeHtml(u.plz)} ${escapeHtml(u.ort)}
  </div>
  <div>
    <strong style="font-size:14px">${escapeHtml(daten.kasse.name)}</strong><br>
    <span style="font-size:13px;color:#333;white-space:pre-line">${escapeHtml(daten.kasse.postanschrift_antraege)}</span>
    ${daten.kasse.ik_nummer ? `<br><span style="font-size:11px;color:#888">IK-Nummer: ${escapeHtml(daten.kasse.ik_nummer)}</span>` : ''}
  </div>
  <div style="text-align:right;font-size:13px;color:#333;margin-top:-36px">${escapeHtml(ort)}, ${escapeHtml(datum)}</div>
</div>

<div style="margin:28px 0 18px;padding:10px 14px;background:#f4f6f8;border-radius:6px">
  <strong>Antrag auf Zuschuss zu wohnumfeldverbessernden Maßnahmen nach § 40 Abs. 4 SGB XI</strong><br>
  <span style="font-size:13px;color:#555">
    Versicherter: ${escapeHtml(v.name)} &nbsp;·&nbsp;
    Versichertennummer: ${escapeHtml(v.versichertennummer)} &nbsp;·&nbsp;
    Pflegegrad: ${v.pflegegrad}
  </span>
</div>

<p>Sehr geehrte Damen und Herren,</p>

<p>im Auftrag unseres Klienten übersenden wir Ihnen anliegend den Antrag auf Gewährung eines
Zuschusses zu wohnumfeldverbessernden Maßnahmen gemäß <strong>§ 40 Abs. 4 SGB XI</strong> für:</p>

<p style="margin:10px 0 10px 18px">
  <strong>${escapeHtml(v.name)}</strong><br>
  ${escapeHtml(v.anschrift)}<br>
  Versichertennummer: ${escapeHtml(v.versichertennummer)} &nbsp;·&nbsp; Pflegegrad ${v.pflegegrad}
</p>

<p>Der beantragte Förderbetrag beläuft sich auf <strong>${euroFmt(daten.beantragter_betrag)}</strong>.
Eine Abtretungserklärung nach § 398 BGB ist beigefügt; der Versicherte bittet, den bewilligten
Betrag mit befreiender Wirkung direkt an die ${escapeHtml(u.firmenname)} auszuzahlen.</p>

<p><strong>Wir bitten höflich um schriftliche Bestätigung des Eingangs dieses Antrags.</strong>
Die gesetzliche Entscheidungsfrist nach <strong>§ 40 Abs. 7 SGB XI</strong> (3 Wochen ohne,
5 Wochen mit Beteiligung des Medizinischen Dienstes) beginnt mit dem Tag des Eingangs bei Ihrer
Kasse zu laufen. Sollte die Frist ohne Mitteilung eines hinreichenden Grundes überschritten werden,
tritt kraft Gesetzes die <strong>Genehmigungsfiktion</strong> nach § 40 Abs. 7 Satz 5 SGB XI ein.</p>

<p>Die vollständigen Antragsunterlagen (s. Anlage) sind beigefügt. Für Rückfragen stehen wir
gerne zur Verfügung.</p>

<p style="margin-top:24px">Mit freundlichen Grüßen</p>

<div class="sig">
  <div style="flex:0 0 auto;min-width:240px">
    <div class="sigline">
      ${escapeHtml(u.firmenname)}
      ${u.geschaeftsfuehrer ? `<br><span style="font-size:11px">i.&nbsp;A. ${escapeHtml(u.geschaeftsfuehrer)}</span>` : ''}
    </div>
  </div>
</div>

<div style="margin-top:36px;border-top:1px solid #dde2e8;padding-top:14px">
  <strong style="font-size:13px">Anlage (${daten.anlagen.length} Dokumente):</strong>
  <ol style="font-size:13px;margin:8px 0 0 22px;line-height:1.9;color:#333">
    ${anlagenZeilen}
  </ol>
</div>`;

  return dokumentSeite(`Anschreiben — ${v.name}`, inhalt);
}
