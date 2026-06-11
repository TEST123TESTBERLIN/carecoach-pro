// CareCoach Pro — gemeinsame Helfer für druckbare Dokumente.
// Liefert eigenständige HTML-Seiten, die im Browser als PDF gedruckt werden können
// (kein PDF-Server nötig). Reine Funktionen, framework-unabhängig.

// HTML-Sonderzeichen escapen (gegen kaputtes Markup bei freien Texten).
export function escapeHtml(s: string): string {
  return s
    .split('&')
    .join('&amp;')
    .split('<')
    .join('&lt;')
    .split('>')
    .join('&gt;')
    .split('"')
    .join('&quot;');
}

// Euro-Formatierung (de-DE), 2 Nachkommastellen für rechtsverbindliche Dokumente.
export function euroFmt(betrag: number): string {
  return betrag.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Rahmen-Dokument mit dezenter, druckfreundlicher CSS.
export function dokumentSeite(titel: string, inhalt: string): string {
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><title>${escapeHtml(titel)}</title>
<style>
  :root { font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif; }
  * { box-sizing: border-box; }
  body { color: #1a1a1a; line-height: 1.5; max-width: 820px; margin: 0 auto; padding: 32px; }
  h1 { font-size: 21px; margin: 0 0 4px; }
  h2 { font-size: 15px; margin: 22px 0 8px; border-bottom: 1px solid #dde2e8; padding-bottom: 4px; }
  p { margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 13px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
  th { background: #f4f6f8; }
  tfoot th { background: transparent; border-top: 2px solid #333; }
  .meta { font-size: 12px; color: #666; }
  .box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 14px; margin: 14px 0; }
  .hinweis { background: #ecfdf5; border-color: #34d399; }
  .recht { font-size: 12px; color: #444; }
  .sig { margin-top: 40px; display: flex; gap: 40px; flex-wrap: wrap; }
  .sig > div { flex: 1 1 220px; }
  .sigline { border-top: 1px solid #333; margin-top: 44px; padding-top: 4px; font-size: 12px; color: #555; }
  .check { list-style: none; padding: 0; margin: 8px 0; font-size: 13px; }
  .check li { padding: 5px 0; border-bottom: 1px solid #eee; }
  .check .ja { color: #047857; font-weight: 600; }
  .check .nein { color: #9ca3af; }
  .check .hint { color: #6b7280; font-size: 12px; }
  @media print { body { padding: 0; } .noprint { display: none; } }
</style></head>
<body>${inhalt}
<p class="noprint meta" style="margin-top:32px">Erstellt mit CareCoach Pro · Drucken bzw. „Als PDF speichern" über das Druckmenü des Browsers.</p>
</body></html>`;
}
