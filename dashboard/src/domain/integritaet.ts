// CareCoach Pro — Integritätsprüfung der Stammdaten (Phase-2-Abschluss).
// Validiert referenzielle Konsistenz aller Seed-Beziehungen. Wird in der Service-Schicht
// (Dev) ausgeführt und kann als Self-Check im Build/Test genutzt werden.

import { STANDORTE, FOERDERTOEPFE, RECHTSGRUNDLAGEN, MASSNAHMEN_KATALOG } from '@/domain/seed';
import {
  KASSEN,
  PFLEGEUNTERNEHMEN,
  DIENSTLEISTER,
  NACHWEIS_TYPEN,
  NACHWEIS_ANFORDERUNGEN,
  FRIST_REGELN,
  ABLEHNUNGSGRUENDE,
  WIDERSPRUCHSGRUENDE,
  DOKUMENT_VORLAGEN,
} from '@/domain/stammdatenSeed';

export interface IntegritaetErgebnis {
  ok: boolean;
  probleme: string[];
  statistik: Record<string, number>;
}

// Prüft alle Fremdschlüssel-/Code-Beziehungen der Seed-Daten.
export function pruefeStammdatenIntegritaet(): IntegritaetErgebnis {
  const probleme: string[] = [];

  const standortIds = new Set(STANDORTE.map((s) => s.id));
  const topfIds = new Set(FOERDERTOEPFE.map((f) => f.id));
  const rgIds = new Set(RECHTSGRUNDLAGEN.map((r) => r.id));
  const nachweisCodes = new Set(NACHWEIS_TYPEN.map((n) => n.code));
  const widerspruchIds = new Set(WIDERSPRUCHSGRUENDE.map((w) => w.id));
  const ablehnungIds = new Set(ABLEHNUNGSGRUENDE.map((a) => a.id));

  // Fördertöpfe → Rechtsgrundlage
  for (const f of FOERDERTOEPFE) {
    if (!rgIds.has(f.rechtsgrundlage_id))
      probleme.push(`Fördertopf ${f.code}: unbekannte rechtsgrundlage_id "${f.rechtsgrundlage_id}".`);
  }

  // Maßnahmen → Fördertopf, Rechtsgrundlage, Nachweis-Codes
  for (const m of MASSNAHMEN_KATALOG) {
    if (!topfIds.has(m.foerdertopf_id))
      probleme.push(`Maßnahme ${m.code}: unbekannte foerdertopf_id "${m.foerdertopf_id}".`);
    if (m.rechtsgrundlage_id && !rgIds.has(m.rechtsgrundlage_id))
      probleme.push(`Maßnahme ${m.code}: unbekannte rechtsgrundlage_id "${m.rechtsgrundlage_id}".`);
    for (const c of m.zusatz_nachweise)
      if (!nachweisCodes.has(c))
        probleme.push(`Maßnahme ${m.code}: unbekannter Nachweis-Code "${c}".`);
    // Summen müssen der BOM entsprechen
    const ek = m.komponenten.reduce((s, k) => s + k.ek_netto, 0);
    const vk = m.komponenten.reduce((s, k) => s + k.vk_brutto, 0);
    if (ek !== m.standard_ek_netto)
      probleme.push(`Maßnahme ${m.code}: standard_ek_netto (${m.standard_ek_netto}) ≠ BOM-Summe (${ek}).`);
    if (vk !== m.standard_vk_brutto)
      probleme.push(`Maßnahme ${m.code}: standard_vk_brutto (${m.standard_vk_brutto}) ≠ BOM-Summe (${vk}).`);
    for (const agId of m.typische_ablehnungsgrund_ids ?? [])
      if (!ablehnungIds.has(agId))
        probleme.push(`Maßnahme ${m.code}: unbekannte ablehnungsgrund_id "${agId}".`);
    for (const wgId of m.typische_widerspruchsgrund_ids ?? [])
      if (!widerspruchIds.has(wgId))
        probleme.push(`Maßnahme ${m.code}: unbekannte widerspruchsgrund_id "${wgId}".`);
  }

  // Nachweistypen → Rechtsgrundlage
  for (const n of NACHWEIS_TYPEN)
    if (n.rechtsgrundlage_id && !rgIds.has(n.rechtsgrundlage_id))
      probleme.push(`Nachweistyp ${n.code}: unbekannte rechtsgrundlage_id "${n.rechtsgrundlage_id}".`);

  // Nachweis-Anforderungen → Fördertopf + Code
  for (const a of NACHWEIS_ANFORDERUNGEN) {
    if (!topfIds.has(a.foerdertopf_id))
      probleme.push(`Nachweis-Anforderung ${a.id}: unbekannte foerdertopf_id "${a.foerdertopf_id}".`);
    if (!nachweisCodes.has(a.nachweis_code))
      probleme.push(`Nachweis-Anforderung ${a.id}: unbekannter Nachweis-Code "${a.nachweis_code}".`);
  }

  // Fristregeln → Fördertopf + Rechtsgrundlage
  for (const fr of FRIST_REGELN) {
    if (!topfIds.has(fr.foerdertopf_id))
      probleme.push(`Fristregel ${fr.id}: unbekannte foerdertopf_id "${fr.foerdertopf_id}".`);
    if (fr.rechtsgrundlage_id && !rgIds.has(fr.rechtsgrundlage_id))
      probleme.push(`Fristregel ${fr.id}: unbekannte rechtsgrundlage_id "${fr.rechtsgrundlage_id}".`);
  }

  // Ablehnungsgründe → Widerspruchsgründe
  for (const ag of ABLEHNUNGSGRUENDE)
    for (const wid of ag.widerspruchsgrund_ids)
      if (!widerspruchIds.has(wid))
        probleme.push(`Ablehnungsgrund ${ag.code}: unbekannte widerspruchsgrund_id "${wid}".`);

  // Widerspruchsgründe → Rechtsgrundlage
  for (const wg of WIDERSPRUCHSGRUENDE)
    if (wg.rechtsgrundlage_id && !rgIds.has(wg.rechtsgrundlage_id))
      probleme.push(`Widerspruchsgrund ${wg.code}: unbekannte rechtsgrundlage_id "${wg.rechtsgrundlage_id}".`);

  // Pflegeunternehmen → Standort
  for (const pu of PFLEGEUNTERNEHMEN)
    if (!standortIds.has(pu.standort_id))
      probleme.push(`Pflegeunternehmen ${pu.firmenname}: unbekannte standort_id "${pu.standort_id}".`);

  // Dokumentvorlagen → Fördertopf / Rechtsgrundlage (optional)
  for (const dv of DOKUMENT_VORLAGEN) {
    if (dv.foerdertopf_id && !topfIds.has(dv.foerdertopf_id))
      probleme.push(`Dokumentvorlage ${dv.code}: unbekannte foerdertopf_id "${dv.foerdertopf_id}".`);
    if (dv.rechtsgrundlage_id && !rgIds.has(dv.rechtsgrundlage_id))
      probleme.push(`Dokumentvorlage ${dv.code}: unbekannte rechtsgrundlage_id "${dv.rechtsgrundlage_id}".`);
  }

  const statistik = {
    standorte: STANDORTE.length,
    foerdertoepfe: FOERDERTOEPFE.length,
    rechtsgrundlagen: RECHTSGRUNDLAGEN.length,
    massnahmen: MASSNAHMEN_KATALOG.length,
    kassen: KASSEN.length,
    pflegeunternehmen: PFLEGEUNTERNEHMEN.length,
    dienstleister: DIENSTLEISTER.length,
    nachweis_typen: NACHWEIS_TYPEN.length,
    nachweis_anforderungen: NACHWEIS_ANFORDERUNGEN.length,
    frist_regeln: FRIST_REGELN.length,
    ablehnungsgruende: ABLEHNUNGSGRUENDE.length,
    widerspruchsgruende: WIDERSPRUCHSGRUENDE.length,
    dokument_vorlagen: DOKUMENT_VORLAGEN.length,
  };

  return { ok: probleme.length === 0, probleme, statistik };
}
