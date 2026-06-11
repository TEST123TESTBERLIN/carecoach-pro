import { useState, useMemo } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { Card, SeitenKopf, DokumentStatusBadge, Badge } from '@/components/ui';
import { DOKUMENTE } from '@/data/mockData';
import type { DokumentTyp } from '@/types';

// Lesbare Labels für Dokumenttypen
const TYP_LABEL: Record<DokumentTyp, string> = {
  antrag: 'Antrag',
  abtretungserklaerung: 'Abtretung',
  attest: 'Attest',
  kostenvoranschlag: 'Kostenvoranschlag',
  bescheid: 'Bescheid',
  rechnung: 'Rechnung',
};

type Filter = 'alle' | DokumentTyp;

const FILTER: { wert: Filter; label: string }[] = [
  { wert: 'alle', label: 'Alle' },
  { wert: 'antrag', label: 'Anträge' },
  { wert: 'abtretungserklaerung', label: 'Abtretungen' },
  { wert: 'bescheid', label: 'Bescheide' },
  { wert: 'kostenvoranschlag', label: 'Kostenvoranschläge' },
];

export default function Dokumente() {
  const [filter, setFilter] = useState<Filter>('alle');

  const gefiltert = useMemo(
    () => (filter === 'alle' ? DOKUMENTE : DOKUMENTE.filter((d) => d.typ === filter)),
    [filter],
  );

  return (
    <div>
      <SeitenKopf
        titel="Dokumente"
        untertitel="Anträge, Abtretungserklärungen, Atteste und Bescheide"
      />

      {/* Filterleiste */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTER.map((f) => (
          <button
            key={f.wert}
            onClick={() => setFilter(f.wert)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.wert
                ? 'bg-brand text-[#0D1B2A]'
                : 'bg-elevated text-muted hover:bg-hover hover:text-ink'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card className="overflow-x-auto !p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase tracking-wider text-faint">
            <tr>
              <th className="px-5 py-3 font-semibold">Dokument</th>
              <th className="px-5 py-3 font-semibold">Kunde</th>
              <th className="px-5 py-3 font-semibold">Typ</th>
              <th className="px-5 py-3 font-semibold">Datum</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {gefiltert.map((d) => (
              <tr key={d.id} className="border-t border-white/5 hover:bg-elevated">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-elevated text-faint">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-ink">{d.titel}</div>
                      <div className="text-xs text-faint">{d.groesse_kb} KB · PDF</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted">{d.klient_name}</td>
                <td className="px-5 py-3">
                  <Badge farbe="neutral">{TYP_LABEL[d.typ]}</Badge>
                </td>
                <td className="px-5 py-3 text-muted">
                  {new Date(d.erstellt_am).toLocaleDateString('de-DE')}
                </td>
                <td className="px-5 py-3">
                  <DokumentStatusBadge status={d.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  <button className="inline-flex items-center gap-1.5 rounded-lg bg-elevated px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-hover">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Öffnen
                  </button>
                </td>
              </tr>
            ))}
            {gefiltert.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted">
                  Keine Dokumente in dieser Kategorie.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
