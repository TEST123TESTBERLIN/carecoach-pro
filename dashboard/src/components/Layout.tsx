import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';

// Responsives Grundlayout:
// - Desktop (lg+): feste Sidebar, optional auf Icon-Breite einklappbar.
// - Tablet/Mobile (< lg): Sidebar als Overlay-Drawer über einen Hamburger-Button.
export default function Layout() {
  const [eingeklappt, setEingeklappt] = useState(false); // Desktop-Schmal-Modus
  const [mobilOffen, setMobilOffen] = useState(false); // Drawer auf kleinen Screens

  return (
    <div className="flex h-screen overflow-hidden bg-base">
      {/* --- Desktop-Sidebar (ab lg sichtbar) --- */}
      <aside
        className={`hidden shrink-0 border-r border-white/10 transition-[width] duration-200 lg:block ${
          eingeklappt ? 'w-16' : 'w-60'
        }`}
      >
        <Sidebar
          eingeklappt={eingeklappt}
          onToggleEinklappen={() => setEingeklappt((v) => !v)}
        />
      </aside>

      {/* --- Mobile-Drawer (unter lg) --- */}
      {mobilOffen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Abdunkelnder Hintergrund */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobilOffen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 h-full w-64 border-r border-white/10 shadow-xl">
            <Sidebar
              eingeklappt={false}
              onToggleEinklappen={() => setMobilOffen(false)}
              onNavigate={() => setMobilOffen(false)}
            />
          </div>
        </div>
      )}

      {/* --- Inhaltsbereich --- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile-Topbar mit Hamburger (nur < lg) */}
        <header className="flex items-center gap-3 border-b border-white/10 bg-panel px-4 py-3 lg:hidden">
          <button
            onClick={() => setMobilOffen((v) => !v)}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-elevated hover:text-ink"
            aria-label="Menü öffnen"
          >
            {mobilOffen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-sm font-bold text-[#0D1B2A]">
              CC
            </div>
            <span className="text-sm font-bold text-ink">CareCoach Pro</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
