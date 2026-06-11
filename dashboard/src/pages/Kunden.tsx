import { useState, useMemo } from 'react';
import { Search, Building2, ShieldCheck } from 'lucide-react';
import { Card, SeitenKopf, KlientStatusBadge, Badge } from '@/components/ui';
import { KLIENTEN } from '@/data/mockData';
import { berechneFoerderung, euro } from '@/lib/foerderung';

// Kundenliste mit Suche und Detailauswahl.
export default function Kunden() {
  const [suche, setSuche] = useState('');
  const [aktivId, setAktivId] = useState<string | null>(KLIENTEN[0]?.id ?? null);

  const gefiltert = useMemo(() => {
    const q = suche.trim().toLowerCase();
    if (!q) return KLIENTEN;
    return KLIENTEN.filter((k) =>
      `${k.vorname} ${k.nachname} ${k.pflegekasse.name} ${k.stadt}`.toLowerCase().includes(q),
    );
  }, [suche]);

  const aktiv = KLIENTEN.find((k) => k.id === aktivId) ?? null;

  // Beispiel-Förderbudget des ausgewählten Kunden (max. §40-Budget)
  const budget = aktiv
    ? berechneFoerderung([], aktiv.personen_mit_pflegegrad).maxBudget
    : 0;

  return (
    <div>
      <SeitenKopf titel="Kunden" untertitel={`${KLIENTEN.length} Kunden im Bestand`} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Liste */}
        <div className="lg:col-span-2">
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              value={suche}
              onChange={(e) => setSuche(e.target.value)}
              placeholder="Suche nach Name, Kasse oder Stadt…"
              className="w-full rounded-xl border border-white/10 bg-elevated py-2.5 pl-10 pr-4 text-sm text-ink outline-none placeholder:text-faint focus:border-brand"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-panel text-xs uppercase tracking-wider text-faint">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">PG</th>
                  <th className="px-4 py-3 font-semibold">Pflegekasse</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {gefiltert.map((k) => (
                  <tr
                    key={k.id}
                    onClick={() => setAktivId(k.id)}
                    className={`cursor-pointer border-t border-white/5 transition-colors ${
                      k.id === aktivId ? 'bg-brand/10' : 'bg-card hover:bg-elevated'
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-ink">
                      {k.vorname} {k.nachname}
                      <span className="ml-2 text-xs font-normal text-faint">{k.alter} J.</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge farbe="warn">PG {k.pflegegrad}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{k.pflegekasse.name}</td>
                    <td className="px-4 py-3">
                      <KlientStatusBadge status={k.status} />
                    </td>
                  </tr>
                ))}
                {gefiltert.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted">
                      Keine Kunden gefunden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail */}
        <div>
          {aktiv ? (
            <Card>
              <h2 className="text-lg font-bold text-ink">
                {aktiv.vorname} {aktiv.nachname}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {aktiv.alter} Jahre · {aktiv.stadt}
              </p>

              <div className="mt-4 space-y-3 text-sm">
                <Detailzeile label="Pflegegrad" wert={`PG ${aktiv.pflegegrad}`} />
                <Detailzeile label="Diagnose" wert={aktiv.hauptdiagnose} />
                <Detailzeile label="Pflegekasse" wert={aktiv.pflegekasse.name} />
                <Detailzeile label="Vers.-Nr." wert={aktiv.pflegekasse.versichertennummer} />
                <Detailzeile
                  label="PG-Träger im Haushalt"
                  wert={`${aktiv.personen_mit_pflegegrad}× (Faktor)`}
                />
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="flex items-center gap-1.5 text-muted">
                    <ShieldCheck className="h-4 w-4 text-brand" />
                    Max. §40-Budget
                  </span>
                  <span className="text-base font-bold text-brand">{euro(budget)}</span>
                </div>
              </div>

              {aktiv.pflegedienst_partner && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2.5">
                  <span className="flex min-w-0 items-center gap-1.5 text-sm text-muted">
                    <Building2 className="h-4 w-4 shrink-0 text-blue-400" />
                    <span className="truncate">{aktiv.pflegedienst_partner.name}</span>
                  </span>
                  <Badge farbe="blau">
                    {aktiv.pflegedienst_partner.provision_prozent}% Provision
                  </Badge>
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <p className="text-sm text-muted">Kein Kunde ausgewählt.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Detailzeile({ label, wert }: { label: string; wert: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium text-ink">{wert}</span>
    </div>
  );
}
