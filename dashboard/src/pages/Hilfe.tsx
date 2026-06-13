import { useMemo, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { SeitenKopf } from '@/components/ui';
import handbuchRoh from '../../../docs/HANDBUCH.md?raw';

// ---------------------------------------------------------------------------
// Mini Markdown → HTML-Konverter (kein externer Parser).
// Verarbeitet: Überschriften (###), Absätze, geordnete/ungeordnete Listen,
// Aufgabenlisten, Tabellen (mit thead), Blockquotes, Inline-Formatierung.
// ---------------------------------------------------------------------------
function mdZuHtml(md: string): string {
  const zeilen = md.split('\n');
  const out: string[] = [];
  let listTyp: 'ul' | 'ol' | null = null;
  let listKlasse = '';
  let inTabelle = false;
  let ersteTabellenzeile = true;
  let gepuffertKopf = '';

  function inline(t: string): string {
    return t
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="md-code">$1</code>');
  }

  function listSchliessen() {
    if (listTyp) { out.push(`</${listTyp}>`); listTyp = null; listKlasse = ''; }
  }

  function tabelleSchliessen() {
    if (!inTabelle) return;
    if (gepuffertKopf) {
      out.push(`<table class="md-table"><tbody>${gepuffertKopf}</tbody></table>`);
      gepuffertKopf = '';
    } else {
      out.push('</tbody></table>');
    }
    inTabelle = false;
    ersteTabellenzeile = true;
  }

  for (const zeile of zeilen) {
    // Trennlinie --- (nur Trenner, kein <hr>)
    if (/^-{3,}$/.test(zeile)) { listSchliessen(); tabelleSchliessen(); continue; }

    // Unterüberschrift ###
    if (zeile.startsWith('### ')) {
      listSchliessen(); tabelleSchliessen();
      out.push(`<h3>${inline(zeile.slice(4))}</h3>`);
      continue;
    }

    // Tabellen-Trennzeile (|---|---| oder |:---|---:|)
    if (zeile.startsWith('|') && /^[|\-:\s]+$/.test(zeile)) {
      if (inTabelle && ersteTabellenzeile && gepuffertKopf) {
        const thZeile = gepuffertKopf.replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>');
        out.push(`<table class="md-table"><thead>${thZeile}</thead><tbody>`);
        gepuffertKopf = '';
        ersteTabellenzeile = false;
      }
      continue;
    }

    // Tabellenzeile
    if (zeile.startsWith('|')) {
      listSchliessen();
      const zellen = zeile.split('|').slice(1, -1).map((z) => z.trim());
      const zeileHtml = `<tr>${zellen.map((z) => `<td>${inline(z)}</td>`).join('')}</tr>`;
      if (!inTabelle) {
        inTabelle = true;
        ersteTabellenzeile = true;
        gepuffertKopf = zeileHtml;
      } else if (ersteTabellenzeile) {
        // Zweite Zeile vor Trennzeile: gepufferte Kopfzeile als <tr> ausgeben,
        // neue Zeile direkt danach (kein separater <thead>).
        out.push(`<table class="md-table"><tbody>${gepuffertKopf}`);
        gepuffertKopf = '';
        ersteTabellenzeile = false;
        out.push(zeileHtml);
      } else {
        out.push(zeileHtml);
      }
      continue;
    }

    // Aufgabenliste - [ ] / - [x]
    if (/^- \[[ x]\]/.test(zeile)) {
      tabelleSchliessen();
      if (listTyp !== 'ul' || listKlasse !== 'md-tasks') {
        listSchliessen();
        out.push('<ul class="md-tasks">');
        listTyp = 'ul';
        listKlasse = 'md-tasks';
      }
      const erledigt = zeile[3] === 'x';
      out.push(`<li class="${erledigt ? 'md-done' : 'md-offen'}">${inline(zeile.slice(6))}</li>`);
      continue;
    }

    // Ungeordnete Liste
    if (/^[*-] /.test(zeile)) {
      tabelleSchliessen();
      if (listTyp !== 'ul') { listSchliessen(); out.push('<ul>'); listTyp = 'ul'; }
      out.push(`<li>${inline(zeile.slice(2))}</li>`);
      continue;
    }

    // Geordnete Liste
    if (/^\d+\. /.test(zeile)) {
      tabelleSchliessen();
      if (listTyp !== 'ol') { listSchliessen(); out.push('<ol>'); listTyp = 'ol'; }
      out.push(`<li>${inline(zeile.replace(/^\d+\. /, ''))}</li>`);
      continue;
    }

    // Blockquote
    if (zeile.startsWith('> ')) {
      listSchliessen(); tabelleSchliessen();
      out.push(`<blockquote><p>${inline(zeile.slice(2))}</p></blockquote>`);
      continue;
    }

    // Leerzeile
    if (!zeile.trim()) { listSchliessen(); tabelleSchliessen(); continue; }

    // Normaler Absatz
    listSchliessen(); tabelleSchliessen();
    out.push(`<p>${inline(zeile)}</p>`);
  }

  listSchliessen();
  tabelleSchliessen();
  return out.join('');
}

// ---------------------------------------------------------------------------
// Kapitel-Parser: splittet das Handbuch an ## Überschriften.
// ---------------------------------------------------------------------------
interface Kapitel {
  titel: string;
  html: string;
  suchtext: string; // Kleinbuchstaben-Rohtext für die Suche
}

function parseKapitel(roh: string): Kapitel[] {
  // Alles vor dem ersten ## (Titel + Version + TOC) verwerfen.
  const teile = roh.split(/\n(?=## )/);
  return teile
    .filter((t) => t.startsWith('## '))
    .map((t) => {
      const nl = t.indexOf('\n');
      const titel = nl > 0 ? t.slice(3, nl).trim() : t.slice(3).trim();
      const koerper = nl > 0 ? t.slice(nl + 1) : '';
      return {
        titel,
        html: mdZuHtml(koerper),
        suchtext: t.toLowerCase(),
      };
    });
}

// ---------------------------------------------------------------------------
// Akkordeon-Kapitel
// ---------------------------------------------------------------------------
function AkkordeonKapitel({
  kapitel,
  offen,
  onToggle,
}: {
  kapitel: Kapitel;
  offen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-card">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-elevated"
        aria-expanded={offen}
      >
        <span className="text-sm font-semibold text-ink">{kapitel.titel}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-faint transition-transform duration-200 ${offen ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`akk-content ${offen ? 'offen' : ''}`}>
        <div>
          <div
            className="md-prose border-t border-white/8 px-5 py-5"
            dangerouslySetInnerHTML={{ __html: kapitel.html }}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hilfe-Seite
// ---------------------------------------------------------------------------
const ALLE_KAPITEL = parseKapitel(handbuchRoh);

export default function Hilfe() {
  const [suche, setSuche] = useState('');
  // Manuell geöffnete Kapitel (Index-Set) — nur relevant wenn keine Suche aktiv.
  const [manuelOffen, setManuelOffen] = useState<Set<number>>(new Set([0]));

  const treffer = useMemo<number[]>(() => {
    const q = suche.trim().toLowerCase();
    if (!q) return ALLE_KAPITEL.map((_, i) => i);
    return ALLE_KAPITEL.reduce<number[]>((acc, k, i) => {
      if (k.suchtext.includes(q)) acc.push(i);
      return acc;
    }, []);
  }, [suche]);

  function toggleKapitel(i: number) {
    setManuelOffen((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  }

  // Bei aktiver Suche: alle Treffer aufklappen; sonst: manueller Zustand.
  const istOffen = (i: number) => (suche.trim() ? treffer.includes(i) : manuelOffen.has(i));

  return (
    <div>
      <SeitenKopf
        titel="Hilfe & Handbuch"
        untertitel="CareCoach Pro v1.0 · Stand Juni 2026"
      />

      {/* Suchfeld */}
      <div className="relative mb-5 max-w-lg">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          type="text"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          placeholder="Handbuch durchsuchen…"
          className="w-full rounded-xl border border-white/10 bg-elevated py-2.5 pl-10 pr-10 text-sm text-ink outline-none transition-colors focus:border-brand placeholder:text-faint"
        />
        {suche && (
          <button
            onClick={() => setSuche('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-ink"
            aria-label="Suche zurücksetzen"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Trefferanzeige bei aktiver Suche */}
      {suche.trim() && (
        <p className="mb-4 text-xs text-faint">
          {treffer.length === 0
            ? 'Keine Kapitel gefunden.'
            : `${treffer.length} Kapitel gefunden für „${suche.trim()}"`}
        </p>
      )}

      {/* Kapitel-Akkordeons */}
      <div className="space-y-2">
        {ALLE_KAPITEL.map((k, i) => (
          <div key={i} className={treffer.includes(i) ? '' : 'hidden'}>
            <AkkordeonKapitel
              kapitel={k}
              offen={istOffen(i)}
              onToggle={() => toggleKapitel(i)}
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-faint">
        CareCoach Pro GmbH · Berlin · Handbuch wird laufend aktualisiert
      </p>
    </div>
  );
}
