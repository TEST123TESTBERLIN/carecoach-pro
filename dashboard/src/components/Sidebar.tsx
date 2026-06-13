import { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wand2,
  Calculator,
  FileText,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Camera,
  HelpCircle,
  Handshake,
  Search,
  UserRound,
  Building2,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useKunden } from '@/context/KundenContext';
import { usePartner } from '@/context/PartnerContext';

interface NavEintrag {
  pfad: string;
  label: string;
  Icon: LucideIcon;
}

const NAV: NavEintrag[] = [
  { pfad: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { pfad: '/workflow', label: 'Neuer Vorgang', Icon: Wand2 },
  { pfad: '/kunden', label: 'Kunden', Icon: Users },
  { pfad: '/partner', label: 'Partner', Icon: Handshake },
  { pfad: '/foerderrechner', label: 'Förderrechner', Icon: Calculator },
  { pfad: '/dokumente', label: 'Dokumente', Icon: FileText },
  { pfad: '/fotos', label: 'Fotos', Icon: Camera },
  { pfad: '/einstellungen', label: 'Einstellungen', Icon: Settings },
];

const NAV_UNTEN: NavEintrag[] = [
  { pfad: '/hilfe', label: 'Hilfe', Icon: HelpCircle },
];

interface SidebarProps {
  eingeklappt: boolean;
  onToggleEinklappen: () => void;
  onNavigate?: () => void;
}

// ---------------------------------------------------------------------------
// Globale Suchleiste
// ---------------------------------------------------------------------------

function GlobaleSuche({ onNavigate }: { onNavigate?: () => void }) {
  const [suche, setSuche] = useState('');
  const [offen, setOffen] = useState(false);
  const { kunden } = useKunden();
  const { partner } = usePartner();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const ergebnisse = useMemo(() => {
    const q = suche.trim().toLowerCase();
    if (q.length < 2) return [];
    const kErg = kunden
      .filter((k) => `${k.vorname} ${k.nachname} ${k.ort ?? ''} ${k.strasse ?? ''} ${k.plz ?? ''}`.toLowerCase().includes(q))
      .slice(0, 5)
      .map((k) => ({ typ: 'kunde' as const, id: k.id, name: `${k.vorname} ${k.nachname}`, sub: k.ort ?? '' }));
    const pErg = partner
      .filter((p) => `${p.firmenname} ${p.geschaeftsfuehrer ?? ''} ${p.ort ?? ''}`.toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => ({ typ: 'partner' as const, id: p.id, name: p.firmenname, sub: p.ort ?? '' }));
    return [...kErg, ...pErg];
  }, [suche, kunden, partner]);

  // Dropdown schließen bei Klick außerhalb.
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOffen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function springe(pfad: string) {
    navigate(pfad);
    setSuche('');
    setOffen(false);
    onNavigate?.();
  }

  return (
    <div ref={containerRef} className="relative px-3 pb-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint pointer-events-none" />
        <input
          className="w-full rounded-xl border border-white/10 bg-elevated py-2 pl-9 pr-3 text-sm text-ink placeholder:text-faint focus:border-brand focus:outline-none"
          placeholder="Suche …"
          value={suche}
          onChange={(e) => { setSuche(e.target.value); setOffen(true); }}
          onFocus={() => setOffen(true)}
        />
      </div>

      {offen && ergebnisse.length > 0 && (
        <div className="absolute left-3 right-3 top-full z-50 mt-1 overflow-hidden rounded-xl border border-white/15 bg-panel shadow-xl">
          {ergebnisse.map((e) => (
            <button
              key={`${e.typ}-${e.id}`}
              onMouseDown={() => springe(e.typ === 'kunde' ? '/kunden' : '/partner')}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-elevated"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-elevated">
                {e.typ === 'kunde'
                  ? <UserRound className="h-4 w-4 text-brand" />
                  : <Building2 className="h-4 w-4 text-blue-400" />}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-ink">{e.name}</div>
                {e.sub && <div className="truncate text-xs text-faint">{e.sub}</div>}
              </div>
              <span className="ml-auto shrink-0 text-xs text-faint">
                {e.typ === 'kunde' ? 'Kunde' : 'Partner'}
              </span>
            </button>
          ))}
        </div>
      )}

      {offen && suche.trim().length >= 2 && ergebnisse.length === 0 && (
        <div className="absolute left-3 right-3 top-full z-50 mt-1 rounded-xl border border-white/15 bg-panel px-4 py-3 text-sm text-faint shadow-xl">
          Keine Ergebnisse für „{suche}"
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

export default function Sidebar({ eingeklappt, onToggleEinklappen, onNavigate }: SidebarProps) {
  const { benutzer, abmelden } = useAuth();

  return (
    <div className="flex h-full flex-col bg-panel">
      {/* Logo / Markenkopf + Einklapp-Schalter */}
      <div
        className={`flex py-5 ${
          eingeklappt ? 'flex-col items-center gap-3 px-2' : 'items-center gap-2 px-4'
        }`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-base font-bold text-[#0D1B2A]">
          CC
        </div>
        {!eingeklappt && (
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm font-bold text-ink">CareCoach</div>
            <div className="truncate text-xs text-faint">Pro · Admin</div>
          </div>
        )}
        <button
          onClick={onToggleEinklappen}
          title={eingeklappt ? 'Sidebar ausklappen' : 'Sidebar einklappen'}
          className="hidden shrink-0 rounded-lg p-1.5 text-faint transition-colors hover:bg-elevated hover:text-ink lg:block"
        >
          {eingeklappt ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Globale Suche — nur im ausgeklappten Modus */}
      {!eingeklappt && <GlobaleSuche onNavigate={onNavigate} />}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map(({ pfad, label, Icon }) => (
          <NavLink
            key={pfad}
            to={pfad}
            end={pfad === '/'}
            onClick={onNavigate}
            title={eingeklappt ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                eingeklappt ? 'justify-center' : ''
              } ${
                isActive ? 'bg-brand/15 text-brand' : 'text-muted hover:bg-elevated hover:text-ink'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!eingeklappt && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Hilfe ganz unten */}
      <div className="border-t border-white/10 px-3 py-2">
        {NAV_UNTEN.map(({ pfad, label, Icon }) => (
          <NavLink
            key={pfad}
            to={pfad}
            onClick={onNavigate}
            title={eingeklappt ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                eingeklappt ? 'justify-center' : ''
              } ${
                isActive ? 'bg-brand/15 text-brand' : 'text-muted hover:bg-elevated hover:text-ink'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!eingeklappt && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </div>

      {/* Benutzer + Abmelden */}
      <div className="border-t border-white/10 p-3">
        {!eingeklappt && (
          <div className="mb-2 px-2">
            <div className="truncate text-sm font-semibold text-ink">{benutzer?.name}</div>
            <div className="truncate text-xs text-faint">{benutzer?.email}</div>
          </div>
        )}
        <button
          onClick={abmelden}
          title="Abmelden"
          className={`flex w-full items-center gap-2 rounded-xl bg-elevated px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-ink ${
            eingeklappt ? 'justify-center' : ''
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!eingeklappt && 'Abmelden'}
        </button>
      </div>
    </div>
  );
}
