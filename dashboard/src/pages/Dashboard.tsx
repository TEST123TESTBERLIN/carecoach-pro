import { Link } from 'react-router-dom';
import {
  Users,
  Activity,
  FileCheck2,
  TrendingUp,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { Card, SeitenKopf, KlientStatusBadge } from '@/components/ui';
import { DOKUMENTE, MASSNAHMEN } from '@/data/mockData';
import { useKunden } from '@/context/KundenContext';
import { berechneFoerderung, euro } from '@/lib/foerderung';

// Standard-Projektannahme je Kunde für Pipeline-/Umsatzschätzungen:
// das Badumbau-Paket als wahrscheinlichstes §40-Projekt.
const STANDARD_PAKET = MASSNAHMEN.slice(0, 1);

type Akzent = 'brand' | 'blau' | 'warn' | 'violett';

const AKZENT_KLASSEN: Record<Akzent, { icon: string; wert: string }> = {
  brand: { icon: 'bg-emerald-500/15 text-brand', wert: 'text-ink' },
  blau: { icon: 'bg-blue-500/15 text-blue-400', wert: 'text-ink' },
  warn: { icon: 'bg-amber-500/15 text-warn', wert: 'text-ink' },
  violett: { icon: 'bg-violet-500/15 text-violet-400', wert: 'text-ink' },
};

// Eine KPI-Kachel mit Icon, Wert und Hinweis.
function KpiKachel({
  label,
  wert,
  hinweis,
  Icon,
  akzent,
}: {
  label: string;
  wert: string;
  hinweis: string;
  Icon: LucideIcon;
  akzent: Akzent;
}) {
  const k = AKZENT_KLASSEN[akzent];
  return (
    <Card className="!p-5">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${k.icon}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className={`mt-4 text-2xl font-bold sm:text-3xl ${k.wert}`}>{wert}</div>
      <div className="mt-1 text-sm font-medium text-ink">{label}</div>
      <div className="mt-0.5 text-xs text-faint">{hinweis}</div>
    </Card>
  );
}

export default function Dashboard() {
  const { kunden } = useKunden();

  // --- Kennzahlen aus den Daten ableiten ---
  const kundenGesamt = kunden.length;

  const aktiveProjekte = kunden.filter((k) =>
    ['in_bearbeitung', 'antrag_gestellt', 'bewilligt'].includes(k.status),
  ).length;

  // Fördermittel beantragt: §40-Förderbetrag der Kunden mit laufendem/bewilligtem Antrag
  const foerdermittelBeantragt = kunden
    .filter((k) => ['antrag_gestellt', 'bewilligt'].includes(k.status))
    .reduce(
      (s, k) =>
        s + berechneFoerderung(STANDARD_PAKET, k.personen_mit_pflegegrad ?? 1).foerderBetrag,
      0,
    );

  // Umsatzpotential: Brutto-Projektvolumen über alle Kunden
  const umsatzpotential = kunden.reduce(
    (s, k) => s + berechneFoerderung(STANDARD_PAKET, k.personen_mit_pflegegrad ?? 1).vkGesamt,
    0,
  );

  const offeneDokumente = DOKUMENTE.filter((d) => d.status !== 'bewilligt').length;
  const letzteKlienten = kunden.slice(0, 4);

  return (
    <div>
      <SeitenKopf
        titel="Dashboard"
        untertitel="Überblick über Kunden, Projekte und Fördervolumen"
      />

      {/* KPI-Kacheln — responsiv: 1 Spalte mobil, 2 auf Tablet, 4 auf Desktop */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiKachel
          label="Kunden gesamt"
          wert={String(kundenGesamt)}
          hinweis="im Bestand"
          Icon={Users}
          akzent="blau"
        />
        <KpiKachel
          label="Aktive Projekte"
          wert={String(aktiveProjekte)}
          hinweis="in Beratung, Antrag oder bewilligt"
          Icon={Activity}
          akzent="brand"
        />
        <KpiKachel
          label="Fördermittel beantragt"
          wert={euro(foerdermittelBeantragt)}
          hinweis="§40 Abs.4 SGB XI"
          Icon={FileCheck2}
          akzent="warn"
        />
        <KpiKachel
          label="Umsatzpotential"
          wert={euro(umsatzpotential)}
          hinweis="Projektvolumen brutto"
          Icon={TrendingUp}
          akzent="violett"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Letzte Kunden */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Zuletzt aktive Kunden</h2>
            <Link
              to="/kunden"
              className="flex items-center gap-1 text-sm font-medium text-brand hover:underline"
            >
              Alle anzeigen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {letzteKlienten.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between rounded-xl bg-elevated px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-ink">
                    {k.vorname} {k.nachname}
                  </div>
                  <div className="truncate text-xs text-faint">
                    PG {k.pflegegrad} · {k.krankenkasse}
                  </div>
                </div>
                <KlientStatusBadge status={k.status} />
              </div>
            ))}
          </div>
        </Card>

        {/* Offene Dokumente */}
        <Card>
          <h2 className="mb-4 text-lg font-bold text-ink">Offene Dokumente</h2>
          <div className="mb-4 text-4xl font-bold text-warn">{offeneDokumente}</div>
          <p className="mb-4 text-sm text-muted">
            Dokumente im Entwurf oder zur Einreichung bei der Pflegekasse.
          </p>
          <Link
            to="/dokumente"
            className="inline-flex items-center gap-1.5 rounded-xl bg-elevated px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-hover"
          >
            Zu den Dokumenten <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>
    </div>
  );
}
