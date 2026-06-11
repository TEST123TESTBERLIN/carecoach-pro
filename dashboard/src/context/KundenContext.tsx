import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Klient, KlientEingabe } from '@/types';
import { KLIENTEN_SEED } from '@/data/mockData';

// Kundenverwaltung mit Persistenz im LocalStorage.
// Quelle der Wahrheit ist der React-State; jede Änderung wird gespeichert.

const STORAGE_KEY = 'ccpro_kunden';

interface KundenContextValue {
  kunden: Klient[];
  getKunde: (id: string) => Klient | undefined;
  addKunde: (daten: KlientEingabe) => Klient;
  updateKunde: (id: string, daten: KlientEingabe) => void;
  deleteKunde: (id: string) => void;
}

const KundenContext = createContext<KundenContextValue | undefined>(undefined);

// Lädt Kunden aus dem LocalStorage; fällt auf die Seed-Daten zurück.
function ladeKunden(): Klient[] {
  try {
    const roh = localStorage.getItem(STORAGE_KEY);
    if (roh) {
      const daten = JSON.parse(roh) as Klient[];
      if (Array.isArray(daten)) return daten;
    }
  } catch {
    // Beschädigte Daten ignorieren und neu seeden.
  }
  return KLIENTEN_SEED;
}

// Erzeugt eine eindeutige ID (Browser-API mit Fallback).
function neueId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `k_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export function KundenProvider({ children }: { children: ReactNode }) {
  const [kunden, setKunden] = useState<Klient[]>(ladeKunden);

  // Bei jeder Änderung persistieren.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kunden));
  }, [kunden]);

  const getKunde = useCallback(
    (id: string) => kunden.find((k) => k.id === id),
    [kunden],
  );

  const addKunde = useCallback((daten: KlientEingabe) => {
    const neuerKunde: Klient = { ...daten, id: neueId() };
    setKunden((prev) => [neuerKunde, ...prev]);
    return neuerKunde;
  }, []);

  const updateKunde = useCallback((id: string, daten: KlientEingabe) => {
    setKunden((prev) => prev.map((k) => (k.id === id ? { ...daten, id } : k)));
  }, []);

  const deleteKunde = useCallback((id: string) => {
    setKunden((prev) => prev.filter((k) => k.id !== id));
  }, []);

  return (
    <KundenContext.Provider value={{ kunden, getKunde, addKunde, updateKunde, deleteKunde }}>
      {children}
    </KundenContext.Provider>
  );
}

// Hook für den Zugriff auf die Kundenverwaltung.
export function useKunden(): KundenContextValue {
  const ctx = useContext(KundenContext);
  if (!ctx) throw new Error('useKunden muss innerhalb von <KundenProvider> verwendet werden.');
  return ctx;
}
