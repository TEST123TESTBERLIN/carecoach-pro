import { useState, useMemo } from 'react';
import { Card, SeitenKopf, Badge } from '@/components/ui';
import { MASSNAHMEN } from '@/data/mockData';
import { useKunden } from '@/context/KundenContext';
import { berechneFoerderung, euro, FOERDERBETRAG_PRO_TRAEGER } from '@/lib/foerderung';

// Förderrechner: Maßnahmen wählen → §40-Förderung, Eigenanteil (Kundensicht)
// und interne Marge (Admin-Sicht) werden getrennt dargestellt.
export default function Foerderrechner() {
  const { kunden } = useKunden();
  const [klientId, setKlientId] = useState(kunden[0]?.id ?? '');
  const [ausgewaehlt, setAusgewaehlt] = useState<Set<string>>(new Set(['m1']));

  const klient = kunden.find((k) => k.id === klientId) ?? kunden[0];
  // Ohne B2B-Provisionsvertrag wird hier keine Provision angesetzt.
  const provisionProzent = 0;
  const traeger = klient?.personen_mit_pflegegrad ?? 1;

  const gewaehlteMassnahmen = useMemo(
    () => MASSNAHMEN.filter((m) => ausgewaehlt.has(m.id)),
    [ausgewaehlt],
  );

  const erg = useMemo(
    () => berechneFoerderung(gewaehlteMassnahmen, traeger, provisionProzent),
    [gewaehlteMassnahmen, traeger, provisionProzent],
  );

  function toggle(id: string) {
    setAusgewaehlt((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  const barFarbe =
    erg.budgetAuslastungProzent > 90
      ? '#FF6B6B'
      : erg.budgetAuslastungProzent > 70
        ? '#F5A623'
        : '#2ECC8A';

  return (
    <div>
      <SeitenKopf
        titel="Förderrechner"
        untertitel="§40 Abs.4 SGB XI — Maßnahmen kombinieren und Eigenanteil berechnen"
      />

      {/* Kundenauswahl */}
      <Card className="mb-6 !p-5">
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm font-medium text-muted">Kunde</label>
          <select
            value={klientId}
            onChange={(e) => setKlientId(e.target.value)}
            className="rounded-xl border border-white/10 bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-brand"
          >
            {kunden.map((k) => (
              <option key={k.id} value={k.id} className="bg-elevated">
                {k.vorname} {k.nachname} · PG {k.pflegegrad}
              </option>
            ))}
          </select>
          <Badge farbe="brand">
            {traeger}× Träger → max. {euro(traeger * FOERDERBETRAG_PRO_TRAEGER)}
          </Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Maßnahmen-Auswahl */}
        <div className="space-y-2 lg:col-span-2">
          {MASSNAHMEN.map((m) => {
            const sel = ausgewaehlt.has(m.id);
            const marge = m.vk_brutto - m.ek_netto;
            const margePct = Math.round((marge / m.vk_brutto) * 100);
            return (
              <button
                key={m.id}
                onClick={() => toggle(m.id)}
                className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all ${
                  sel
                    ? 'border-emerald-500/40 bg-brand/10'
                    : 'border-white/10 bg-card hover:border-white/25'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border ${
                      sel ? 'border-brand bg-brand' : 'border-white/30'
                    }`}
                  >
                    {sel && <span className="text-xs font-bold text-[#0D1B2A]">✓</span>}
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${sel ? 'text-brand' : 'text-ink'}`}>
                      {m.bezeichnung}
                    </div>
                    <div className="mt-0.5 text-xs text-faint">{m.paragraph}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${sel ? 'text-brand' : 'text-ink'}`}>
                    {euro(m.vk_brutto)}
                  </div>
                  <div className="text-xs text-brand">
                    +{euro(marge)} ({margePct}%)
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Ergebnis-Spalte */}
        <div className="space-y-4">
          {/* Budget-Balken */}
          <Card className="!p-5">
            <div className="mb-1.5 flex justify-between text-xs text-faint">
              <span>Budget genutzt: {euro(erg.foerderBetrag)}</span>
              <span>Max: {euro(erg.maxBudget)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-base">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${erg.budgetAuslastungProzent}%`, backgroundColor: barFarbe }}
              />
            </div>
          </Card>

          {/* Kundensicht */}
          <div className="rounded-2xl border border-emerald-500/30 bg-[#0A4028] p-5">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-300/70">
              Kunden-Kalkulation
            </div>
            <Zeile label="Projektkosten" wert={euro(erg.vkGesamt)} />
            <Zeile label="§40-Förderung" wert={`−${euro(erg.foerderBetrag)}`} farbe="brand" />
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
              <span className="font-bold text-ink">Eigenanteil Kunde</span>
              <span
                className={`text-lg font-bold ${
                  erg.eigenanteil === 0 ? 'text-brand' : 'text-warn'
                }`}
              >
                {erg.eigenanteil === 0 ? '0 € ✓' : euro(erg.eigenanteil)}
              </span>
            </div>
          </div>

          {/* Interne Sicht — bewusst getrennt von der Kundensicht */}
          <div className="rounded-2xl border border-white/10 bg-elevated p-5">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-faint">
              Interne Kalkulation
            </div>
            <Zeile label="VK gesamt" wert={euro(erg.vkGesamt)} />
            <Zeile label="EK gesamt" wert={`−${euro(erg.ekGesamt)}`} farbe="danger" />
            {erg.provision > 0 && (
              <Zeile label="Provision PD" wert={`−${euro(erg.provision)}`} farbe="warn" />
            )}
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
              <span className="font-bold text-ink">Nettoertrag</span>
              <span className="text-lg font-bold text-brand">{euro(erg.nettoertrag)}</span>
            </div>
          </div>

          <button
            disabled={gewaehlteMassnahmen.length === 0}
            className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-[#0D1B2A] transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {erg.eigenanteil === 0 ? 'Antrag stellen — 0 € für den Kunden' : 'Weiter → Antrag'}
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
