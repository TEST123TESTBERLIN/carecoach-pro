import type { KlientStatus } from '@/types';

// Mögliche Badge-Farben (zentral, damit ui.tsx und Status-Metadaten konsistent bleiben).
export type BadgeFarbe = 'brand' | 'warn' | 'danger' | 'blau' | 'violett' | 'neutral';

export interface StatusMeta {
  wert: KlientStatus;
  label: string;
  farbe: BadgeFarbe;
}

// Reihenfolge entspricht dem Förder-Prozessverlauf.
export const KUNDEN_STATUS: StatusMeta[] = [
  { wert: 'neu', label: 'Neu', farbe: 'neutral' },
  { wert: 'in_bearbeitung', label: 'In Bearbeitung', farbe: 'blau' },
  { wert: 'antrag_gestellt', label: 'Antrag gestellt', farbe: 'warn' },
  { wert: 'bewilligt', label: 'Bewilligt', farbe: 'brand' },
  { wert: 'abgeschlossen', label: 'Abgeschlossen', farbe: 'violett' },
];

const STATUS_MAP: Record<KlientStatus, StatusMeta> = KUNDEN_STATUS.reduce(
  (acc, s) => {
    acc[s.wert] = s;
    return acc;
  },
  {} as Record<KlientStatus, StatusMeta>,
);

export function statusMeta(status: KlientStatus): StatusMeta {
  return STATUS_MAP[status];
}
