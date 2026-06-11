import { useState, useMemo } from 'react';
import { Search, Plus, Pencil, Trash2, UserPlus } from 'lucide-react';
import { Card, SeitenKopf, KlientStatusBadge, Badge, Modal } from '@/components/ui';
import KundeForm from '@/components/KundeForm';
import { useKunden } from '@/context/KundenContext';
import { KUNDEN_STATUS } from '@/lib/kundenStatus';
import type { Klient, KlientStatus, KlientEingabe } from '@/types';

type Filter = 'alle' | KlientStatus;

export default function Kunden() {
  const { kunden, addKunde, updateKunde, deleteKunde } = useKunden();

  const [suche, setSuche] = useState('');
  const [statusFilter, setStatusFilter] = useState<Filter>('alle');
  // Formular: null = geschlossen, 'neu' = anlegen, Klient = bearbeiten
  const [formZustand, setFormZustand] = useState<'zu' | 'neu' | Klient>('zu');
  const [loeschKandidat, setLoeschKandidat] = useState<Klient | null>(null);

  const gefiltert = useMemo(() => {
    const q = suche.trim().toLowerCase();
    return kunden.filter((k) => {
      const passtStatus = statusFilter === 'alle' || k.status === statusFilter;
      if (!passtStatus) return false;
      if (!q) return true;
      const heuhaufen =
        `${k.vorname} ${k.nachname} ${k.ort} ${k.plz} ${k.krankenkasse} ${k.telefon} ${k.email} ${k.ambulante_pflege.dienst}`.toLowerCase();
      return heuhaufen.includes(q);
    });
  }, [kunden, suche, statusFilter]);

  function speichern(daten: KlientEingabe) {
    if (formZustand === 'neu') {
      addKunde(daten);
    } else if (formZustand !== 'zu') {
      updateKunde(formZustand.id, daten);
    }
    setFormZustand('zu');
  }

  function loeschenBestaetigen() {
    if (loeschKandidat) deleteKunde(loeschKandidat.id);
    setLoeschKandidat(null);
  }

  return (
    <div>
      <SeitenKopf
        titel="Kunden"
        untertitel={`${kunden.length} Kunden im Bestand`}
        aktion={
          <button
            onClick={() => setFormZustand('neu')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-[#0D1B2A] transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Neuer Kunde
          </button>
        }
      />

      {/* Status-Filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <FilterChip aktiv={statusFilter === 'alle'} onClick={() => setStatusFilter('alle')}>
          Alle
        </FilterChip>
        {KUNDEN_STATUS.map((s) => (
          <FilterChip
            key={s.wert}
            aktiv={statusFilter === s.wert}
            onClick={() => setStatusFilter(s.wert)}
          >
            {s.label}
          </FilterChip>
        ))}
      </div>

      {/* Suche */}
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          placeholder="Suche nach Name, Ort, Kasse, Telefon…"
          className="w-full rounded-xl border border-white/10 bg-elevated py-2.5 pl-10 pr-4 text-sm text-ink outline-none placeholder:text-faint focus:border-brand"
        />
      </div>

      {/* Tabelle */}
      <Card className="overflow-x-auto !p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase tracking-wider text-faint">
            <tr>
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Ort</th>
              <th className="px-5 py-3 font-semibold">PG</th>
              <th className="px-5 py-3 font-semibold">Krankenkasse</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {gefiltert.map((k) => (
              <tr key={k.id} className="border-t border-white/5 hover:bg-elevated">
                <td className="px-5 py-3">
                  <div className="font-semibold text-ink">
                    {k.vorname} {k.nachname}
                  </div>
                  <div className="text-xs text-faint">{k.email || k.telefon || '—'}</div>
                </td>
                <td className="px-5 py-3 text-muted">
                  {k.plz} {k.ort}
                </td>
                <td className="px-5 py-3">
                  <Badge farbe="warn">PG {k.pflegegrad}</Badge>
                </td>
                <td className="px-5 py-3 text-muted">{k.krankenkasse || '—'}</td>
                <td className="px-5 py-3">
                  <KlientStatusBadge status={k.status} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setFormZustand(k)}
                      title="Bearbeiten"
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-hover hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setLoeschKandidat(k)}
                      title="Löschen"
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-red-500/15 hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {gefiltert.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted">
                    <UserPlus className="h-8 w-8 text-faint" />
                    <p>
                      {kunden.length === 0
                        ? 'Noch keine Kunden angelegt.'
                        : 'Keine Kunden für diese Suche/Filter.'}
                    </p>
                    {kunden.length === 0 && (
                      <button
                        onClick={() => setFormZustand('neu')}
                        className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-[#0D1B2A] hover:opacity-90"
                      >
                        Ersten Kunden anlegen
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Formular-Modal (anlegen/bearbeiten) */}
      {formZustand !== 'zu' && (
        <KundeForm
          initial={formZustand === 'neu' ? undefined : formZustand}
          onAbbrechen={() => setFormZustand('zu')}
          onSpeichern={speichern}
        />
      )}

      {/* Lösch-Bestätigung */}
      {loeschKandidat && (
        <Modal
          titel="Kunde löschen"
          onClose={() => setLoeschKandidat(null)}
          footer={
            <>
              <button
                onClick={() => setLoeschKandidat(null)}
                className="rounded-xl bg-elevated px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-ink"
              >
                Abbrechen
              </button>
              <button
                onClick={loeschenBestaetigen}
                className="rounded-xl bg-danger px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                Endgültig löschen
              </button>
            </>
          }
        >
          <p className="text-sm text-muted">
            Soll der Kunde{' '}
            <span className="font-semibold text-ink">
              {loeschKandidat.vorname} {loeschKandidat.nachname}
            </span>{' '}
            wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
        </Modal>
      )}
    </div>
  );
}

function FilterChip({
  aktiv,
  onClick,
  children,
}: {
  aktiv: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        aktiv ? 'bg-brand text-[#0D1B2A]' : 'bg-elevated text-muted hover:bg-hover hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}
