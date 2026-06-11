import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import type { KlientStatus, DokumentStatus } from '@/types';
import { statusMeta, type BadgeFarbe } from '@/lib/kundenStatus';

// Wiederverwendbare Karten-, Badge- und Modal-Bausteine.

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-card p-6 ${className}`}>{children}</div>
  );
}

export function SeitenKopf({
  titel,
  untertitel,
  aktion,
}: {
  titel: string;
  untertitel?: string;
  aktion?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-ink">{titel}</h1>
        {untertitel && <p className="mt-1 text-sm text-muted">{untertitel}</p>}
      </div>
      {aktion}
    </div>
  );
}

const BADGE_KLASSEN: Record<BadgeFarbe, string> = {
  brand: 'bg-emerald-500/15 text-brand border-emerald-500/40',
  warn: 'bg-amber-500/15 text-warn border-amber-500/40',
  danger: 'bg-red-500/15 text-danger border-red-500/40',
  blau: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
  violett: 'bg-violet-500/15 text-violet-400 border-violet-500/40',
  neutral: 'bg-white/5 text-muted border-white/15',
};

export function Badge({ farbe, children }: { farbe: BadgeFarbe; children: ReactNode }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${BADGE_KLASSEN[farbe]}`}
    >
      {children}
    </span>
  );
}

// Kunden-Status als farbiger Badge (Mapping aus lib/kundenStatus).
export function KlientStatusBadge({ status }: { status: KlientStatus }) {
  const s = statusMeta(status);
  return <Badge farbe={s.farbe}>{s.label}</Badge>;
}

const DOK_STATUS: Record<DokumentStatus, { label: string; farbe: BadgeFarbe }> = {
  entwurf: { label: 'Entwurf', farbe: 'neutral' },
  eingereicht: { label: 'Eingereicht', farbe: 'warn' },
  bewilligt: { label: 'Bewilligt', farbe: 'brand' },
  abgelehnt: { label: 'Abgelehnt', farbe: 'danger' },
};

export function DokumentStatusBadge({ status }: { status: DokumentStatus }) {
  const s = DOK_STATUS[status];
  return <Badge farbe={s.farbe}>{s.label}</Badge>;
}

// Modal-Dialog (zentriert, scrollbar bei viel Inhalt, responsiv).
export function Modal({
  titel,
  onClose,
  children,
  footer,
}: {
  titel: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      {/* Hintergrund */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
      {/* Dialogfenster */}
      <div className="relative z-10 my-4 w-full max-w-2xl rounded-2xl border border-white/10 bg-card shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-bold text-ink">{titel}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-faint transition-colors hover:bg-elevated hover:text-ink"
            aria-label="Schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <footer className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
