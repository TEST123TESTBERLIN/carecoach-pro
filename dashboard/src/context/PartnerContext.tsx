import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Partner, PartnerEingabe } from '@/domain/types';
import { ladePartner, speicherePartner } from '@/services/partnerRepository';

interface PartnerContextValue {
  partner: Partner[];
  addPartner: (daten: PartnerEingabe) => Partner;
  updatePartner: (id: string, daten: PartnerEingabe) => void;
  deletePartner: (id: string) => void;
}

const PartnerContext = createContext<PartnerContextValue | undefined>(undefined);

function neueId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `p_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export function PartnerProvider({ children }: { children: ReactNode }) {
  const [partner, setPartner] = useState<Partner[]>(ladePartner);

  useEffect(() => {
    speicherePartner(partner);
  }, [partner]);

  const addPartner = useCallback((daten: PartnerEingabe): Partner => {
    const neu: Partner = { ...daten, id: neueId(), erstellt_am: new Date().toISOString().slice(0, 10) };
    setPartner((prev) => [neu, ...prev]);
    return neu;
  }, []);

  const updatePartner = useCallback((id: string, daten: PartnerEingabe) => {
    setPartner((prev) => prev.map((p) => (p.id === id ? { ...daten, id, erstellt_am: p.erstellt_am } : p)));
  }, []);

  const deletePartner = useCallback((id: string) => {
    setPartner((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <PartnerContext.Provider value={{ partner, addPartner, updatePartner, deletePartner }}>
      {children}
    </PartnerContext.Provider>
  );
}

export function usePartner(): PartnerContextValue {
  const ctx = useContext(PartnerContext);
  if (!ctx) throw new Error('usePartner muss innerhalb von <PartnerProvider> verwendet werden.');
  return ctx;
}
