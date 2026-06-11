import type { Massnahme } from '@/types';

// Maximaler §40-Abs.4-Zuschuss je Maßnahme (Stand 01.01.2025, indexiert)
export const FOERDERBETRAG_PRO_TRAEGER = 4180;
// Höchstzahl an Pflegegrad-Trägern, die den Förderbetrag multiplizieren
export const MAX_TRAEGER = 4;

export interface FoerderErgebnis {
  vkGesamt: number;
  ekGesamt: number;
  maxBudget: number;
  foerderBetrag: number;
  eigenanteil: number;
  rohertrag: number; // VK - EK (vor Provision)
  provision: number;
  nettoertrag: number; // Rohertrag - Provision
  budgetAuslastungProzent: number;
}

// Zentrale Förder-Logik gemäß CLAUDE.md:
// maxBudget = min(Träger, 4) × 4.180€; Eigenanteil wird auf 0 geklemmt,
// solange die Förderung die Kosten deckt.
export function berechneFoerderung(
  ausgewaehlt: Massnahme[],
  personenMitPflegegrad: number,
  provisionProzent = 0,
): FoerderErgebnis {
  const maxBudget = Math.min(personenMitPflegegrad, MAX_TRAEGER) * FOERDERBETRAG_PRO_TRAEGER;
  const vkGesamt = ausgewaehlt.reduce((s, m) => s + m.vk_brutto, 0);
  const ekGesamt = ausgewaehlt.reduce((s, m) => s + m.ek_netto, 0);
  const foerderBetrag = Math.min(vkGesamt, maxBudget);
  const eigenanteil = Math.max(0, vkGesamt - foerderBetrag);
  const rohertrag = vkGesamt - ekGesamt;
  const provision = (vkGesamt * provisionProzent) / 100;
  const nettoertrag = rohertrag - provision;
  const budgetAuslastungProzent =
    maxBudget > 0 ? Math.min((foerderBetrag / maxBudget) * 100, 100) : 0;

  return {
    vkGesamt,
    ekGesamt,
    maxBudget,
    foerderBetrag,
    eigenanteil,
    rohertrag,
    provision,
    nettoertrag,
    budgetAuslastungProzent,
  };
}

// Einheitliche Euro-Formatierung (de-DE)
export function euro(betrag: number): string {
  return betrag.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });
}
