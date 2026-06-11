import type { ReactNode } from 'react';
import type { KlientStatus, DokumentStatus } from '@/types';

// Wiederverwendbare Karten- und Badge-Bausteine.

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-card p-6 ${className}`}>{children}</div>
  );
}

export function SeitenKopf({ titel, untertitel }: { titel: string; untertitel?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-ink">{titel}</h1>
      {untertitel && <p className="mt-1 text-sm text-muted">{untertitel}</p>}
    </div>
  );
}

type BadgeFarbe = 'brand' | 'warn' | 'danger' | 'blau' | 'neutral';

const BADGE_KLASSEN: Record<BadgeFarbe, string> = {
  brand: 'bg-emerald-500/15 text-brand border-emerald-500/40',
  warn: 'bg-amber-500/15 text-warn border-amber-500/40',
  danger: 'bg-red-500/15 text-danger border-red-500/40',
  blau: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
  neutral: 'bg-white/5 text-muted border-white/15',
};

export function Badge({ farbe, children }: { farbe: BadgeFarbe; children: ReactNode }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${BADGE_KLASSEN[farbe]}`}
    >
      {children}
    </span>
  );
}

// Zuordnung Klient-Status → Label + Badge-Farbe
const KLIENT_STATUS: Record<KlientStatus, { label: string; farbe: BadgeFarbe }> = {
  lead: { label: 'Lead', farbe: 'neutral' },
  beratung: { label: 'Beratung', farbe: 'blau' },
  antrag_gestellt: { label: 'Antrag gestellt', farbe: 'warn' },
  bewilligt: { label: 'Bewilligt', farbe: 'brand' },
  abgeschlossen: { label: 'Abgeschlossen', farbe: 'brand' },
  abgelehnt: { label: 'Abgelehnt', farbe: 'danger' },
};

export function KlientStatusBadge({ status }: { status: KlientStatus }) {
  const s = KLIENT_STATUS[status];
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
