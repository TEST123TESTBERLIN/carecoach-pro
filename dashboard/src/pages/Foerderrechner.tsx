import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { Card, SeitenKopf, Badge } from '@/components/ui';
import { MASSNAHMEN_KATALOG } from '@/domain/seed';
import type { Pflegegrad } from '@/domain/types';
import type { Massnahme } from '@/types';
import {
  berechneFoerderung,
  euro,
  FOERDERBETRAG_PRO_TRAEGER,
  MAX_TRAEGER,
} from '@/lib/foerderung';

// Förderrechner: Pflegegrad + Personen mit PG wählen, Maßnahmen aus dem
// Katalog kombinieren. §40-Abs.4-Maßnahmen zählen gegen den Haushalts-Deckel
// (4.180 € × Personen, max. 16.720 €); §33-SGB-V-Hilfsmittel laufen über die
// GKV-Verordnung und belasten das §40-Budget nicht. Kundensicht und interne
// Marge bleiben strikt getrennte Panels.

type KatalogEintrag = (typeof MASSNAHMEN_KATALOG)[number];

// Katalog-Maßnahme → Adapter für die zentrale Förder-Logik (lib/foerderung).
function alsMassnahme(m: KatalogEintrag): Massnahme {
  return {
    id: m.id,
    bezeichnung: m.bezeichnung,
    paragraph: m.foerdertopf_id === 'ft-33-sgbv' ? '§ 33 SGB V' : '§ 40 Abs. 4 SGB XI',
    vk_brutto: m.standard_vk_brutto,
    ek_netto: m.standard_ek_netto,
  };
}

export default function Foerderrechner() {
  const [pflegegrad, setPflegegrad] = useState<Pflegegrad>(3);
  const [personen, setPersonen] = useState(1); // Personen mit PG im Haushalt (1–4)
  const [ausgewaehlt, setAusgewaehlt] = useState<Set<string>>(new Set());

  // Nur Maßnahmen, deren Pflegegrad-Voraussetzung erfüllt ist.
  const verfuegbar = useMemo(
    () =>
      MASSNAHMEN_KATALOG.filter(
        (m) => m.aktiv && (m.pflegegrad_voraussetzung ?? 1) <= pflegegrad,
      ),
    [pflegegrad],
  );

  const gewaehlt = useMemo(
    () => verfuegbar.filter((m) => ausgewaehlt.has(m.id)),
    [verfuegbar, ausgewaehlt],
  );

  // Topf-getrennte Kalkulation: §40 gegen den Deckel, §33 separat (GKV).
  const kalk = useMemo(() => {
    const m40 = gewaehlt.filter((m) => m.foerdertopf_id !== 'ft-33-sgbv');
    const m33 = gewaehlt.filter((m) => m.foerdertopf_id === 'ft-33-sgbv');
    const e40 = berechneFoerderung(m40.map(alsMassnahme), personen, 0);
    const vk33 = m33.reduce((s, m) => s + m.standard_vk_brutto, 0);
    const ek33 = m33.reduce((s, m) => s + m.standard_ek_netto, 0);
    return {
      ...e40,
      vk33,
      gesamtkosten: e40.vkGesamt + vk33,
      rest: Math.max(0, e40.maxBudget - e40.foerderBetrag),
      // Interne Sicht über alle Töpfe hinweg.
      ekAlle: e40.ekGesamt + ek33,
      rohertragAlle: e40.vkGesamt + vk33 - (e40.ekGesamt + ek33),
    };
  }, [gewaehlt, personen]);

  function toggle(id: string) {
    setAusgewaehlt((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  const barFarbe =
    kalk.budgetAuslastungProzent > 90
      ? '#FF6B6B'
      : kalk.budgetAuslastungProzent > 70
        ? '#F5A623'
        : '#2ECC8A';

  return (
    <div>
      <SeitenKopf
        titel="Förderrechner"
        untertitel="§40 Abs.4 SGB XI — Maßnahmen kombinieren, Budget und Eigenanteil live berechnen"
      />

      {/* Parameter: Pflegegrad + Personen mit PG */}
      <Card className="mb-6 !p-5">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div>
            <div className="mb-1.5 text-sm font-medium text-muted">Pflegegrad</div>
            <div className="flex gap-1.5">
              {([1, 2, 3, 4, 5] as Pflegegrad[]).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setPflegegrad(pg)}
                  className={`h-10 w-10 rounded-xl border text-sm font-bold transition-all ${
                    pg === pflegegrad
                      ? 'border-brand/50 bg-brand/15 text-brand'
                      : 'border-white/10 bg-elevated text-muted hover:border-white/25'
                  }`}
                >
                  {pg}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-sm font-medium text-muted">
              Personen mit Pflegegrad im Haushalt
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((p) => (
                <button
                  key={p}
                  onClick={() => setPersonen(p)}
                  className={`h-10 w-10 rounded-xl border text-sm font-bold transition-all ${
                    p === personen
                      ? 'border-brand/50 bg-brand/15 text-brand'
                      : 'border-white/10 bg-elevated text-muted hover:border-white/25'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <Badge farbe="brand">
            Budget: {personen}× {euro(FOERDERBETRAG_PRO_TRAEGER)} ={' '}
            {euro(Math.min(personen, MAX_TRAEGER) * FOERDERBETRAG_PRO_TRAEGER)}
          </Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        {/* Maßnahmen-Auswahl (Katalog, gefiltert nach Pflegegrad) */}
        <div className="space-y-2 lg:col-span-2">
          {verfuegbar.map((m) => {
            const sel = ausgewaehlt.has(m.id);
            const ist33 = m.foerdertopf_id === 'ft-33-sgbv';
            return (
              <button
                key={m.id}
                onClick={() => toggle(m.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition-all ${
                  sel
                    ? 'border-emerald-500/40 bg-brand/10'
                    : 'border-white/10 bg-card hover:border-white/25'
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      sel ? 'border-brand bg-brand' : 'border-white/30'
                    }`}
                  >
                    {sel && <Check className="h-3.5 w-3.5 text-[#0D1B2A]" />}
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`truncate text-sm font-semibold ${sel ? 'text-brand' : 'text-ink'}`}
                    >
                      {m.bezeichnung}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-faint">
                      <span>{ist33 ? '§ 33 SGB V' : '§ 40 Abs. 4 SGB XI'}</span>
                      {ist33 && (
                        <span
                          title="Hilfsmittel über Arztverordnung (GKV) — belastet das §40-Budget nicht"
                          className="cursor-help"
                        >
                          🏥 ohne §40-Budget
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className={`text-sm font-bold ${sel ? 'text-brand' : 'text-ink'}`}>
                    {euro(m.standard_vk_brutto)}
                  </div>
                  <div className="text-xs text-faint">VK brutto</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live-Ergebnis */}
        <div className="space-y-4 lg:sticky lg:top-6">
          {/* Budget-Balken §40 */}
          <Card className="!p-5">
            <div className="mb-1.5 flex justify-between text-xs text-faint">
              <span>
                Auslastung: {Math.round(kalk.budgetAuslastungProzent)}{' '}%
              </span>
              <span>Budget: {euro(kalk.maxBudget)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-base">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${kalk.budgetAuslastungProzent}%`, backgroundColor: barFarbe }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <span className="text-muted">Rest-Budget §40</span>
              <span className="font-semibold text-ink">{euro(kalk.rest)}</span>
            </div>
          </Card>

          {/* Kundensicht */}
          <div className="rounded-2xl border border-emerald-500/30 bg-[#0A4028] p-5">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-300/70">
              Kunden-Kalkulation
            </div>
            <Zeile label="Gesamtkosten" wert={euro(kalk.gesamtkosten)} />
            <Zeile label="§40-Förderung" wert={`−${euro(kalk.foerderBetrag)}`} farbe="brand" />
            {kalk.vk33 > 0 && (
              <Zeile label="§33 GKV (über Arzt)" wert={`−${euro(kalk.vk33)}`} farbe="brand" />
            )}
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
              <span className="font-bold text-ink">Eigenanteil Kunde</span>
              <span
                className={`text-lg font-bold ${
                  kalk.eigenanteil === 0 ? 'text-brand' : 'text-warn'
                }`}
              >
                {kalk.eigenanteil === 0 ? '0 € ✓' : euro(kalk.eigenanteil)}
              </span>
            </div>
          </div>

          {/* Interne Sicht — bewusst getrennt von der Kundensicht */}
          <div className="rounded-2xl border border-white/10 bg-elevated p-5">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-faint">
              Interne Kalkulation
            </div>
            <Zeile label="VK gesamt" wert={euro(kalk.gesamtkosten)} />
            <Zeile label="EK gesamt" wert={`−${euro(kalk.ekAlle)}`} farbe="danger" />
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
              <span className="font-bold text-ink">Rohertrag</span>
              <span className="text-lg font-bold text-brand">{euro(kalk.rohertragAlle)}</span>
            </div>
          </div>

          <button
            disabled={gewaehlt.length === 0}
            className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-[#0D1B2A] transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {kalk.eigenanteil === 0 ? 'Antrag stellen — 0 € für den Kunden' : 'Weiter → Antrag'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Zeile({
  label,
  wert,
  farbe = 'ink',
}: {
  label: string;
  wert: string;
  farbe?: 'ink' | 'brand' | 'warn' | 'danger';
}) {
  const klasse =
    farbe === 'brand'
      ? 'text-brand'
      : farbe === 'warn'
        ? 'text-warn'
        : farbe === 'danger'
          ? 'text-danger'
          : 'text-ink';
  return (
    <div className="flex justify-between py-0.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className={`font-semibold ${klasse}`}>{wert}</span>
    </div>
  );
}
