import { NavLink } from 'react-router-dom';
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
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Navigations-Einträge der Sidebar mit lucide-Icons.
interface NavEintrag {
  pfad: string;
  label: string;
  Icon: LucideIcon;
}

const NAV: NavEintrag[] = [
  { pfad: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { pfad: '/workflow', label: 'Neuer Vorgang', Icon: Wand2 },
  { pfad: '/kunden', label: 'Kunden', Icon: Users },
  { pfad: '/foerderrechner', label: 'Förderrechner', Icon: Calculator },
  { pfad: '/dokumente', label: 'Dokumente', Icon: FileText },
  { pfad: '/einstellungen', label: 'Einstellungen', Icon: Settings },
];

interface SidebarProps {
  // Auf Desktop: Schmal-Modus (nur Icons). Auf Mobile irrelevant (immer voll).
  eingeklappt: boolean;
  onToggleEinklappen: () => void;
  // Schließt den mobilen Drawer nach Navigation.
  onNavigate?: () => void;
}

export default function Sidebar({ eingeklappt, onToggleEinklappen, onNavigate }: SidebarProps) {
  const { benutzer, abmelden } = useAuth();

  return (
    <div className="flex h-full flex-col bg-panel">
      {/* Logo / Markenkopf + Einklapp-Schalter.
          Eingeklappt (w-16): vertikal gestapelt, sonst ragt der Schalter aus der
          Sidebar heraus und ist nicht mehr klickbar (Bug: Ausklappen unmöglich). */}
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
        {/* Einklappen nur auf Desktop sinnvoll (lg+) */}
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
