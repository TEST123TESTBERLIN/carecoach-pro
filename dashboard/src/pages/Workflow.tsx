import { useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  FileText,
  Plus,
  Printer,
} from 'lucide-react';
import { Card, SeitenKopf, Badge } from '@/components/ui';
import type { BadgeFarbe } from '@/lib/kundenStatus';
import { berechneFoerderung, euro } from '@/lib/foerderung';
import { useAuth } from '@/context/AuthContext';
import type { Massnahme } from '@/types';
import {
  MASSNAHMEN_KATALOG,
  NACHWEIS_BEZEICHNUNG,
  GLOBALE_NACHWEISE,
} from '@/domain/seed';
import {
  KASSEN,
  NACHWEIS_ANFORDERUNGEN,
  ABLEHNUNGSGRUENDE,
  WIDERSPRUCHSGRUENDE,
} from '@/domain/stammdatenSeed';
import { pruefeAntrag, type Pruefpunkt, type PruefStatus } from '@/domain/pruefung';
import { DEMO_KUNDE, DEMO_PROJEKT } from '@/domain/demoData';
import { baueAbtretungserklaerungHtml } from '@/documents/abtretungserklaerung';
import { baueAntragHtml, baueAntragCheckliste } from '@/documents/antrag';
import { baueVollmachtHtml } from '@/documents/vollmacht';
import { baueDsgvoHtml } from '@/documents/dsgvo';
import { baueAnschreibenHtml } from '@/documents/anschreiben';
import { baueAnlageChecklisteHtml } from '@/documents/anlageCheckliste';
import type {
  Pflegegrad,
  Wohnform,
  NachweisCode,
  Genehmigungswahrscheinlichkeit,
  ProjektNachweis,
  VorgangsNotiz,
  Antrag,
  Projekt,
  Kunde,
} from '@/domain/types';

// Öffnet eine generierte HTML-Seite in einem neuen Tab (Druck/PDF im Browser).
function oeffneDokument(html: string) {
  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

// ---------------------------------------------------------------------------
// Kernworkflow als 6-Schritt-Wizard: Kunde → Pflegegrad → Kasse → Maßnahmen →
// Vollständigkeitsprüfung → Zusammenfassung. Nutzt den Domänen-Layer (Seed,
// Nachweismatrix, pruefeAntrag) und ist mit der Demo-Klientin (demoData) vorbefüllt.
// ---------------------------------------------------------------------------

const SCHRITTE = [
  'Kundendaten',
  'Pflegegrad',
  'Pflegekasse',
  'Maßnahmen',
  'Prüfung',
  'Zusammenfassung',
] as const;

// Bewilligungswahrscheinlichkeit → Badge-Darstellung.
const WAHRSCHEINLICHKEIT_META: Record<
  Genehmigungswahrscheinlichkeit,
  { label: string; farbe: BadgeFarbe }
> = {
  sehr_hoch: { label: 'Sehr hoch', farbe: 'brand' },
  hoch: { label: 'Hoch', farbe: 'brand' },
  mittel: { label: 'Mittel', farbe: 'warn' },
  gering: { label: 'Gering', farbe: 'danger' },
};

// Lesbare Paragraph-Bezeichnung je Fördertopf (für die Maßnahmenkarte / Antrag).
function paragraphLabel(foerdertopfId: string): string {
  return foerdertopfId === 'ft-33-sgbv' ? '§ 33 SGB V' : '§ 40 Abs. 4 SGB XI';
}

// Platzhalter in der Standardbegründung mit den Kundendaten füllen.
function fuelleBegruendung(
  text: string,
  diagnose: string,
  pflegegrad: number,
  icd10: string[],
): string {
  // split/join statt replaceAll (ES2020-Target).
  const ersetze = (s: string, von: string, nach: string) => s.split(von).join(nach);
  let out = ersetze(text, '{{diagnose}}', diagnose || 'der vorliegenden Erkrankung');
  out = ersetze(out, '{{pflegegrad}}', String(pflegegrad));
  out = ersetze(out, '{{icd10}}', icd10.length ? icd10.join(', ') : '—');
  out = ersetze(out, '{{funktionseinschraenkung}}', 'eingeschränkter Mobilität');
  return out;
}

// Entwurf der im Wizard erfassten Kundendaten (Teilmenge des Domänen-Kunde).
interface KundeEntwurf {
  vorname: string;
  nachname: string;
  geburtsdatum: string;
  strasse: string;
  plz: string;
  ort: string;
  pflegegrad: Pflegegrad;
  pflegekasse_id: string;
  wohnform: Wohnform;
  personen_mit_pflegegrad: number;
  hauptdiagnose: string;
  icd10_codes: string[];
  bevollmaechtigt: boolean;
}

// Vorbefüllung aus der Demo-Klientin (demoData.ts) — sofort testbar.
function demoEntwurf(): KundeEntwurf {
  const kasse = KASSEN.find((k) => k.name === DEMO_KUNDE.pflegekasse);
  return {
    vorname: DEMO_KUNDE.vorname,
    nachname: DEMO_KUNDE.nachname,
    geburtsdatum: DEMO_KUNDE.geburtsdatum ?? '',
    strasse: DEMO_KUNDE.strasse,
    plz: DEMO_KUNDE.plz,
    ort: DEMO_KUNDE.ort,
    pflegegrad: DEMO_KUNDE.pflegegrad,
    pflegekasse_id: kasse?.id ?? KASSEN[0].id,
    wohnform: DEMO_KUNDE.wohnform,
    personen_mit_pflegegrad: DEMO_KUNDE.personen_mit_pflegegrad,
    hauptdiagnose: DEMO_KUNDE.hauptdiagnose,
    icd10_codes: DEMO_KUNDE.icd10_codes,
    bevollmaechtigt: DEMO_KUNDE.angehoeriger.ist_bevollmaechtigter,
  };
}

// Demo-Vorauswahl: BAD-001 + WOHN-003 + SICH-001 (aus DEMO_PROJEKT abgeleitet).
const DEMO_MASSNAHME_IDS = new Set(DEMO_PROJEKT.massnahmen.map((m) => m.massnahme_id));

type KatalogEintrag = (typeof MASSNAHMEN_KATALOG)[number];

// Katalog-Maßnahme → Adapter für die zentrale Förder-Logik (lib/foerderung).
function alsMassnahme(m: KatalogEintrag): Massnahme {
  return {
    id: m.id,
    bezeichnung: m.bezeichnung,
    paragraph: paragraphLabel(m.foerdertopf_id),
    vk_brutto: m.standard_vk_brutto,
    ek_netto: m.standard_ek_netto,
  };
}

interface Warnung {
  icon: string;
  text: string;
}

// Warnhinweise je Maßnahme (als Icon + Tooltip in der Auswahl).
function massnahmeWarnungen(m: KatalogEintrag, wohnform: Wohnform): Warnung[] {
  const out: Warnung[] = [];
  if (m.foerdertopf_id === 'ft-33-sgbv')
    out.push({ icon: '🏥', text: 'Über Arzt beantragen — Hilfsmittel nach § 33 SGB V, nicht § 40' });
  if (m.foerderfaehig_status === 'einzelfall')
    out.push({ icon: '⚠️', text: 'Einzelfallentscheidung — keine Garantie der Kostenübernahme' });
  if (
    (m.hv_genehmigung_noetig || m.zusatz_nachweise.includes('vermieterzustimmung')) &&
    wohnform === 'miete'
  )
    out.push({ icon: '🏠', text: 'Vermieterzustimmung erforderlich' });
  if (m.genehmigungswahrscheinlichkeit === 'mittel' || m.genehmigungswahrscheinlichkeit === 'gering')
    out.push({ icon: '⏱️', text: 'Kann bis zu 5 Wochen dauern (MD-Prüfung möglich)' });
  return out;
}

export default function Workflow() {
  const { benutzer } = useAuth();
  const istAdmin = benutzer?.rolle === 'admin';

  const [schritt, setSchritt] = useState(0);
  const [entwurf, setEntwurf] = useState<KundeEntwurf>(demoEntwurf);
  const [ausgewaehlt, setAusgewaehlt] = useState<Set<string>>(new Set(DEMO_MASSNAHME_IDS));
  // Status der Pflichtnachweise (true = vorhanden). Demo startet vollständig.
  const [nachweisVorhanden, setNachweisVorhanden] = useState<Record<string, boolean>>({});
  // Interne Lernnotizen + Besonderheiten dieses Vorgangs (nur Admin).
  const [besonderheiten, setBesonderheiten] = useState('');
  const [notizen, setNotizen] = useState<VorgangsNotiz[]>([]);
  const [notizText, setNotizText] = useState('');
  // Datum, an dem erstmals Dokumente für diesen Vorgang erzeugt wurden.
  const [dokErstelltAm, setDokErstelltAm] = useState<string | null>(null);

  function notizHinzufuegen() {
    const text = notizText.trim();
    if (!text) return;
    const eintrag: VorgangsNotiz = {
      id: `notiz-${notizen.length + 1}-${text.length}`,
      autor: benutzer?.name ?? '—',
      rolle: benutzer?.rolle ?? 'tester',
      zeitpunkt: new Date().toISOString(),
      text,
    };
    setNotizen((prev) => [eintrag, ...prev]);
    setNotizText('');
  }

  // Generiert die Abtretungserklärung (§398 BGB) aus dem aktuellen Vorgang.
  function abtretungOeffnen() {
    const kasseObj = KASSEN.find((k) => k.id === entwurf.pflegekasse_id);
    oeffneDokument(
      baueAbtretungserklaerungHtml({
        versicherter: {
          name: `${entwurf.vorname} ${entwurf.nachname}`,
          geburtsdatum: entwurf.geburtsdatum,
          anschrift: `${entwurf.strasse}, ${entwurf.plz} ${entwurf.ort}`,
          versichertennummer: DEMO_KUNDE.versichertennummer,
        },
        pflegekasse: { name: kasseObj?.name ?? '', ik_nummer: kasseObj?.ik_nummer ?? '' },
        bevollmaechtigter: entwurf.bevollmaechtigt
          ? { name: DEMO_KUNDE.angehoeriger.name }
          : undefined,
        massnahmen: gewaehlteKatalog.map((m) => ({
          bezeichnung: m.bezeichnung,
          paragraph: paragraphLabel(m.foerdertopf_id),
          betrag: m.standard_vk_brutto,
        })),
        ort: entwurf.ort,
        datum: new Date().toLocaleDateString('de-DE'),
      }),
    );
  }

  // Generiert den §40-Antrag inkl. Nachweis-Checkliste als Anhang.
  function antragOeffnen() {
    const kasseObj = KASSEN.find((k) => k.id === entwurf.pflegekasse_id);
    oeffneDokument(
      baueAntragHtml({
        versicherter: {
          name: `${entwurf.vorname} ${entwurf.nachname}`,
          geburtsdatum: entwurf.geburtsdatum,
          anschrift: `${entwurf.strasse}, ${entwurf.plz} ${entwurf.ort}`,
          versichertennummer: DEMO_KUNDE.versichertennummer,
          pflegegrad: entwurf.pflegegrad,
          diagnose: entwurf.hauptdiagnose,
          icd10: entwurf.icd10_codes,
        },
        pflegekasse: { name: kasseObj?.name ?? '', ik_nummer: kasseObj?.ik_nummer ?? '' },
        positionen: gewaehlteKatalog.map((m) => ({
          bezeichnung: m.bezeichnung,
          paragraph: paragraphLabel(m.foerdertopf_id),
          betrag: m.standard_vk_brutto,
          begruendung: fuelleBegruendung(
            m.standard_begruendung,
            entwurf.hauptdiagnose,
            entwurf.pflegegrad,
            entwurf.icd10_codes,
          ),
        })),
        checkliste: baueAntragCheckliste(gewaehlteKatalog, {
          wohnform: entwurf.wohnform,
          bevollmaechtigt: entwurf.bevollmaechtigt,
        }),
        beantragter_betrag: kalk.foerder40,
      }),
    );
  }

  function anschreibenOeffnen() {
    const kasseObj = KASSEN.find((k) => k.id === entwurf.pflegekasse_id);
    const anlagen = [
      'Antrag auf Wohnumfeldverbesserung nach § 40 Abs. 4 SGB XI',
      'Ärztliches Attest mit ICD-10-Diagnose',
      'Kostenvoranschlag mit Einzelpositionen',
      'Abtretungserklärung nach § 398 BGB',
      'DSGVO-Einwilligung',
      ...(entwurf.bevollmaechtigt ? ['Vollmacht des Bevollmächtigten'] : []),
      ...(entwurf.wohnform === 'miete' ? ['Vermieterzustimmung der Hausverwaltung'] : []),
      `Fotos Ist-Zustand (${gewaehlteKatalog.length} Maßnahmen)`,
      'Anlagen-Checkliste',
    ];
    oeffneDokument(
      baueAnschreibenHtml({
        kasse: {
          name: kasseObj?.name ?? '',
          postanschrift_antraege: kasseObj?.postanschrift_antraege ?? '',
          ik_nummer: kasseObj?.ik_nummer ?? '',
        },
        versicherter: {
          name: `${entwurf.vorname} ${entwurf.nachname}`,
          anschrift: `${entwurf.strasse}, ${entwurf.plz} ${entwurf.ort}`,
          versichertennummer: DEMO_KUNDE.versichertennummer,
          pflegegrad: entwurf.pflegegrad,
        },
        beantragter_betrag: kalk.foerder40,
        anlagen,
        ort: entwurf.ort,
        datum: new Date().toLocaleDateString('de-DE'),
      }),
    );
  }

  function vollmachtOeffnen() {
    const kasseObj = KASSEN.find((k) => k.id === entwurf.pflegekasse_id);
    oeffneDokument(
      baueVollmachtHtml({
        versicherter: {
          name: `${entwurf.vorname} ${entwurf.nachname}`,
          geburtsdatum: entwurf.geburtsdatum,
          anschrift: `${entwurf.strasse}, ${entwurf.plz} ${entwurf.ort}`,
          versichertennummer: DEMO_KUNDE.versichertennummer,
          pflegegrad: entwurf.pflegegrad,
        },
        bevollmaechtigter: {
          name: DEMO_KUNDE.angehoeriger.name,
          beziehung: DEMO_KUNDE.angehoeriger.beziehung,
        },
        pflegekasse: { name: kasseObj?.name ?? '' },
        ort: entwurf.ort,
        datum: new Date().toLocaleDateString('de-DE'),
      }),
    );
  }

  function dsgvoOeffnen() {
    const kasseObj = KASSEN.find((k) => k.id === entwurf.pflegekasse_id);
    oeffneDokument(
      baueDsgvoHtml({
        versicherter: {
          name: `${entwurf.vorname} ${entwurf.nachname}`,
          anschrift: `${entwurf.strasse}, ${entwurf.plz} ${entwurf.ort}`,
        },
        pflegekasse: { name: kasseObj?.name ?? '' },
        bevollmaechtigter: entwurf.bevollmaechtigt
          ? { name: DEMO_KUNDE.angehoeriger.name }
          : undefined,
        ort: entwurf.ort,
        datum: new Date().toLocaleDateString('de-DE'),
      }),
    );
  }

  function checklisteOeffnen() {
    const kasseObj = KASSEN.find((k) => k.id === entwurf.pflegekasse_id);
    oeffneDokument(
      baueAnlageChecklisteHtml({
        versicherter: {
          name: `${entwurf.vorname} ${entwurf.nachname}`,
          pflegegrad: entwurf.pflegegrad,
        },
        pflegekasse: { name: kasseObj?.name ?? '' },
        massnahmen: gewaehlteKatalog.map((m) => ({
          bezeichnung: m.bezeichnung,
          raum:
            m.kategorie === 'bad'
              ? 'Bad'
              : m.kategorie === 'treppen_lift'
                ? 'Treppe'
                : m.kategorie === 'tueren'
                  ? 'Tür/Eingang'
                  : 'Wohnung',
          kategorie: m.kategorie,
        })),
        wohnform: entwurf.wohnform,
        bevollmaechtigt: entwurf.bevollmaechtigt,
        datum: new Date().toLocaleDateString('de-DE'),
      }),
    );
  }

  function setFeld<K extends keyof KundeEntwurf>(key: K, wert: KundeEntwurf[K]) {
    setEntwurf((e) => ({ ...e, [key]: wert }));
  }

  function toggleMassnahme(id: string) {
    setAusgewaehlt((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  // Maßnahmen, die für den gewählten Pflegegrad infrage kommen.
  const verfuegbareMassnahmen = useMemo(
    () =>
      MASSNAHMEN_KATALOG.filter(
        (m) => m.aktiv && (m.pflegegrad_voraussetzung ?? 1) <= entwurf.pflegegrad,
      ),
    [entwurf.pflegegrad],
  );

  const gewaehlteKatalog = useMemo(
    () => MASSNAHMEN_KATALOG.filter((m) => ausgewaehlt.has(m.id)),
    [ausgewaehlt],
  );

  // Topf-getrennte Live-Kalkulation: §40 Abs.4 zählt gegen den §40-Deckel
  // (zentrale Logik), §33 SGB V läuft separat über die Arztverordnung (GKV)
  // und belastet weder den §40-Deckel noch den Eigenanteil.
  const kalk = useMemo(() => {
    const m40 = gewaehlteKatalog.filter((m) => m.foerdertopf_id === 'ft-40-4');
    const m33 = gewaehlteKatalog.filter((m) => m.foerdertopf_id === 'ft-33-sgbv');
    const mAndere = gewaehlteKatalog.filter(
      (m) => m.foerdertopf_id !== 'ft-40-4' && m.foerdertopf_id !== 'ft-33-sgbv',
    );
    // §40-Bucket über die kanonische Förder-Logik.
    const e40 = berechneFoerderung(m40.map(alsMassnahme), entwurf.personen_mit_pflegegrad, 0);
    const summe = (liste: KatalogEintrag[]) =>
      liste.reduce((s, m) => s + m.standard_vk_brutto, 0);
    const vk33 = summe(m33);
    const vkAndere = summe(mAndere);
    const vkGesamt = e40.vkGesamt + vk33 + vkAndere;
    return {
      vk40: e40.vkGesamt,
      deckel: e40.maxBudget,
      foerder40: e40.foerderBetrag,
      eigenanteil: e40.eigenanteil, // nur §40-Überschuss
      budgetProzent: e40.budgetAuslastungProzent,
      ueber: e40.vkGesamt > e40.maxBudget,
      vk33,
      vkAndere,
      vkGesamt,
      // alles, was nicht zum Eigenanteil wird (Kostenträger §40 + GKV §33 + …).
      gedeckt: vkGesamt - e40.eigenanteil,
    };
  }, [gewaehlteKatalog, entwurf.personen_mit_pflegegrad]);

  // Pflichtnachweise aus der Nachweismatrix (ft-40-4) ableiten: global +
  // bedingt nach Wohnform und ausgewählten Maßnahmenkategorien.
  const pflichtnachweise = useMemo(() => {
    const kategorien = new Set(gewaehlteKatalog.map((m) => m.kategorie));
    const codes = new Map<NachweisCode, { code: NachweisCode; bezeichnung: string; pflicht: boolean }>();
    for (const a of NACHWEIS_ANFORDERUNGEN.filter((n) => n.foerdertopf_id === 'ft-40-4')) {
      const wohnformPasst = !a.bedingung_wohnform || a.bedingung_wohnform === entwurf.wohnform;
      const kategoriePasst = !a.massnahme_kategorie || kategorien.has(a.massnahme_kategorie);
      // Vollmacht nur, wenn ein Bevollmächtigter handelt.
      if (a.nachweis_code === 'vollmacht' && !entwurf.bevollmaechtigt) continue;
      if (wohnformPasst && kategoriePasst) {
        const vorhanden = codes.get(a.nachweis_code);
        // Pflicht „gewinnt", falls ein Code mehrfach (bedingt) auftritt.
        codes.set(a.nachweis_code, {
          code: a.nachweis_code,
          bezeichnung: NACHWEIS_BEZEICHNUNG[a.nachweis_code],
          pflicht: (vorhanden?.pflicht ?? false) || a.pflicht,
        });
      }
    }
    return [...codes.values()];
  }, [gewaehlteKatalog, entwurf.wohnform, entwurf.bevollmaechtigt]);

  // Default: noch nicht gesetzte Nachweise gelten als „vorhanden" (Demo-freundlich,
  // Anwender kann gezielt auf „offen" stellen).
  const istVorhanden = (code: string) => nachweisVorhanden[code] ?? true;
  function toggleNachweis(code: string) {
    setNachweisVorhanden((prev) => ({ ...prev, [code]: !istVorhanden(code) }));
  }

  // Vollständigkeitsprüfung über pruefeAntrag — aus dem aktuellen Entwurf konstruiert.
  const pruefung = useMemo(() => {
    // lokale Sicht auf den Nachweis-Status (Default „vorhanden") — hält die Memo-Deps schlank.
    const vorhandenIn = (code: string) => nachweisVorhanden[code] ?? true;
    const heute = new Date();
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const plus = (tage: number) => {
      const d = new Date(heute);
      d.setDate(d.getDate() + tage);
      return iso(d);
    };

    const nachweise: ProjektNachweis[] = pflichtnachweise.map((n) => ({
      code: n.code,
      bezeichnung: n.bezeichnung,
      pflicht: n.pflicht,
      status: vorhandenIn(n.code) ? 'vorhanden' : 'offen',
    }));

    const projekt: Projekt = {
      id: 'wizard-projekt',
      projektnummer: '—',
      standort_id: 'st-berlin',
      kunde_id: 'wizard-kunde',
      titel: 'Neuer Vorgang',
      pipeline_status: 'antrag',
      abtretung_aktiv: true,
      massnahmen: gewaehlteKatalog.map((m) => ({
        id: `wizard-${m.id}`,
        massnahme_id: m.id,
        bezeichnung: m.bezeichnung,
        foerdertopf_id: m.foerdertopf_id,
        vk_brutto: m.standard_vk_brutto,
        ek_netto: m.standard_ek_netto,
        // Nur §40-Maßnahmen sind §40-Anträge; §33 läuft über die GKV-Verordnung.
        foerderbetrag_beantragt: m.foerdertopf_id === 'ft-40-4' ? m.standard_vk_brutto : 0,
        raum: '—',
        begruendung: fuelleBegruendung(
          m.standard_begruendung,
          entwurf.hauptdiagnose,
          entwurf.pflegegrad,
          entwurf.icd10_codes,
        ),
      })),
      erstellt_am: heute.toISOString(),
      geaendert_am: heute.toISOString(),
    };

    const antrag: Antrag = {
      id: 'wizard-antrag',
      antragsnummer: '—',
      projekt_id: projekt.id,
      foerdertopf_id: 'ft-40-4',
      kasse: KASSEN.find((k) => k.id === entwurf.pflegekasse_id)?.name ?? '',
      status: 'entwurf',
      gestellt_am: iso(heute),
      entscheidungsfrist: plus(21),
      genehmigungsfiktion_ab: plus(21),
      beantragter_betrag: kalk.foerder40,
      geplanter_umsetzungsbeginn: plus(30),
      nachweise,
    };

    const kunde: Kunde = {
      ...DEMO_KUNDE,
      id: 'wizard-kunde',
      vorname: entwurf.vorname,
      nachname: entwurf.nachname,
      pflegegrad: entwurf.pflegegrad,
      wohnform: entwurf.wohnform,
      personen_mit_pflegegrad: entwurf.personen_mit_pflegegrad,
      // DSGVO-Einwilligung folgt der Nachweis-Checkliste.
      einwilligung_dsgvo: vorhandenIn('einwilligung_dsgvo'),
    };

    return pruefeAntrag({ antrag, projekt, kunde, dokumente: [], rechtsgrundlageVorhanden: true });
  }, [pflichtnachweise, gewaehlteKatalog, entwurf, kalk.foerder40, nachweisVorhanden]);

  // Pro Schritt: darf weiter geklickt werden?
  const kannWeiter = (() => {
    switch (schritt) {
      case 0:
        return (
          entwurf.vorname.trim() !== '' &&
          entwurf.nachname.trim() !== '' &&
          entwurf.geburtsdatum.trim() !== '' &&
          entwurf.strasse.trim() !== '' &&
          entwurf.plz.trim() !== '' &&
          entwurf.ort.trim() !== ''
        );
      case 2:
        return entwurf.pflegekasse_id !== '';
      case 3:
        return ausgewaehlt.size > 0;
      default:
        return true;
    }
  })();

  return (
    <div>
      <SeitenKopf
        titel="Neuer Vorgang"
        untertitel="Kernworkflow §40 Abs.4 SGB XI — von den Kundendaten bis zur 0-€-Zusammenfassung"
        aktion={
          <button
            onClick={() => {
              setEntwurf(demoEntwurf());
              setAusgewaehlt(new Set(DEMO_MASSNAHME_IDS));
              setNachweisVorhanden({});
              setSchritt(0);
            }}
            className="rounded-xl border border-white/15 bg-elevated px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-ink"
          >
            Demo zurücksetzen
          </button>
        }
      />

      <SchrittIndikator aktiv={schritt} onWechsel={setSchritt} />

      <Card className="mt-6">
        {schritt === 0 && <SchrittKunde entwurf={entwurf} setFeld={setFeld} />}
        {schritt === 1 && (
          <SchrittPflegegrad
            wert={entwurf.pflegegrad}
            onWahl={(pg) => setFeld('pflegegrad', pg)}
          />
        )}
        {schritt === 2 && (
          <SchrittPflegekasse
            wert={entwurf.pflegekasse_id}
            onWahl={(id) => setFeld('pflegekasse_id', id)}
          />
        )}
        {schritt === 3 && (
          <SchrittMassnahmen
            massnahmen={verfuegbareMassnahmen}
            ausgewaehlt={ausgewaehlt}
            onToggle={toggleMassnahme}
            pflegegrad={entwurf.pflegegrad}
            wohnform={entwurf.wohnform}
            kalk={kalk}
          />
        )}
        {schritt === 4 && (
          <SchrittPruefung
            nachweise={pflichtnachweise}
            istVorhanden={istVorhanden}
            onToggle={toggleNachweis}
            punkte={pruefung.punkte}
            bestanden={pruefung.bestanden}
            fehler={pruefung.fehler}
            warnungen={pruefung.warnungen}
          />
        )}
        {schritt === 5 && (
          <div className="space-y-6">
            <SchrittZusammenfassung
              entwurf={entwurf}
              gewaehlt={gewaehlteKatalog}
              vkGesamt={kalk.vkGesamt}
              gedeckt={kalk.gedeckt}
              eigenanteil={kalk.eigenanteil}
              maxBudget={kalk.deckel}
              kasse={KASSEN.find((k) => k.id === entwurf.pflegekasse_id)?.name ?? '—'}
              bestanden={pruefung.bestanden}
            />

            {/* Dokumente erstellen — 6 druckfertige Dokumente für den Antrag */}
            <div className="border-t border-white/10 pt-5">
              <DokumentePaket
                karten={[
                  {
                    id: 'anschreiben',
                    titel: 'Anschreiben an Pflegekasse',
                    beschreibung: `${KASSEN.find((k) => k.id === entwurf.pflegekasse_id)?.name ?? '—'} · inkl. Hinweis auf 3-Wochen-Frist & Genehmigungsfiktion`,
                    verfuegbar: true,
                    oeffnen: anschreibenOeffnen,
                  },
                  {
                    id: 'antrag',
                    titel: 'Antrag § 40 Abs. 4 SGB XI + Nachweis-Checkliste',
                    beschreibung: `${gewaehlteKatalog.length} Maßnahmen · beantragter Zuschuss: ${euro(kalk.foerder40)}`,
                    verfuegbar: true,
                    oeffnen: antragOeffnen,
                  },
                  {
                    id: 'abtretung',
                    titel: 'Abtretungserklärung § 398 BGB',
                    beschreibung: '0-€-Modell — Pflegekasse zahlt direkt an CareCoach Pro',
                    verfuegbar: true,
                    oeffnen: abtretungOeffnen,
                  },
                  {
                    id: 'vollmacht',
                    titel: 'Vollmacht Angehörige',
                    beschreibung: entwurf.bevollmaechtigt
                      ? `Bevollmächtigte/r: ${DEMO_KUNDE.angehoeriger.name}`
                      : 'Kein Bevollmächtigter angegeben (Schritt 1)',
                    verfuegbar: entwurf.bevollmaechtigt,
                    oeffnen: vollmachtOeffnen,
                  },
                  {
                    id: 'dsgvo',
                    titel: 'DSGVO-Einwilligung',
                    beschreibung: 'Einwilligung zur Verarbeitung von Gesundheitsdaten (Art. 9 DSGVO)',
                    verfuegbar: true,
                    oeffnen: dsgvoOeffnen,
                  },
                  {
                    id: 'checkliste',
                    titel: 'Anlagen-Checkliste',
                    beschreibung: `Dynamische Ablage-Checkliste für ${gewaehlteKatalog.length} Maßnahmen`,
                    verfuegbar: true,
                    oeffnen: checklisteOeffnen,
                  },
                ]}
                dokErstelltAm={dokErstelltAm}
                onDokumentOeffnen={() =>
                  setDokErstelltAm((prev) => prev ?? new Date().toLocaleDateString('de-DE'))
                }
              />
            </div>

            {/* Interne Notizen — nur für Admins sichtbar */}
            {istAdmin && (
              <InterneNotizen
                besonderheiten={besonderheiten}
                onBesonderheiten={setBesonderheiten}
                notizen={notizen}
                notizText={notizText}
                onNotizText={setNotizText}
                onNotizHinzufuegen={notizHinzufuegen}
              />
            )}
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setSchritt((s) => Math.max(0, s - 1))}
          disabled={schritt === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-elevated px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-ink disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Zurück
        </button>

        {schritt < SCHRITTE.length - 1 ? (
          <button
            onClick={() => setSchritt((s) => Math.min(SCHRITTE.length - 1, s + 1))}
            disabled={!kannWeiter}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-[#0D1B2A] transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Weiter <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            disabled={!pruefung.bestanden}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-[#0D1B2A] transition-opacity hover:opacity-90 disabled:opacity-40"
            title={pruefung.bestanden ? undefined : 'Prüfung noch nicht bestanden'}
          >
            <Check className="h-4 w-4" /> Antrag stellen — {kalk.eigenanteil === 0 ? '0 € für den Kunden' : euro(kalk.eigenanteil)}
          </button>
        )}
      </div>
    </div>
  );
}

// --- Schritt-Indikator (klickbare Stepper-Leiste) ---
function SchrittIndikator({
  aktiv,
  onWechsel,
}: {
  aktiv: number;
  onWechsel: (n: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SCHRITTE.map((titel, i) => {
        const erledigt = i < aktiv;
        const jetzt = i === aktiv;
        return (
          <button
            key={titel}
            onClick={() => onWechsel(i)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
              jetzt
                ? 'border-brand/50 bg-brand/15 text-brand'
                : erledigt
                  ? 'border-emerald-500/30 bg-card text-muted hover:text-ink'
                  : 'border-white/10 bg-card text-faint hover:text-muted'
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                jetzt
                  ? 'bg-brand text-[#0D1B2A]'
                  : erledigt
                    ? 'bg-emerald-500/30 text-brand'
                    : 'bg-elevated text-faint'
              }`}
            >
              {erledigt ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className="hidden font-medium sm:inline">{titel}</span>
          </button>
        );
      })}
    </div>
  );
}

// --- Schritt 1: Kundendaten ---
function SchrittKunde({
  entwurf,
  setFeld,
}: {
  entwurf: KundeEntwurf;
  setFeld: <K extends keyof KundeEntwurf>(key: K, wert: KundeEntwurf[K]) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-ink">Kundendaten</h2>
      <p className="mt-1 text-sm text-muted">Person und Anschrift des pflegebedürftigen Kunden.</p>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Feld label="Vorname" wert={entwurf.vorname} onChange={(v) => setFeld('vorname', v)} />
        <Feld label="Nachname" wert={entwurf.nachname} onChange={(v) => setFeld('nachname', v)} />
        <Feld
          label="Geburtsdatum"
          type="date"
          wert={entwurf.geburtsdatum}
          onChange={(v) => setFeld('geburtsdatum', v)}
        />
        <Feld label="Straße & Nr." wert={entwurf.strasse} onChange={(v) => setFeld('strasse', v)} />
        <Feld label="PLZ" wert={entwurf.plz} onChange={(v) => setFeld('plz', v)} />
        <Feld label="Ort" wert={entwurf.ort} onChange={(v) => setFeld('ort', v)} />
      </div>
    </div>
  );
}

function Feld({
  label,
  wert,
  onChange,
  type = 'text',
}: {
  label: string;
  wert: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>
      <input
        type={type}
        value={wert}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-elevated px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
      />
    </label>
  );
}

// --- Schritt 2: Pflegegrad als Kacheln ---
function SchrittPflegegrad({
  wert,
  onWahl,
}: {
  wert: Pflegegrad;
  onWahl: (pg: Pflegegrad) => void;
}) {
  const grade: Pflegegrad[] = [1, 2, 3, 4, 5];
  return (
    <div>
      <h2 className="text-lg font-bold text-ink">Pflegegrad</h2>
      <p className="mt-1 text-sm text-muted">
        Ab PG 1 besteht Anspruch auf § 40 Abs. 4 SGB XI (über § 28a für PG 1).
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {grade.map((pg) => {
          const sel = pg === wert;
          return (
            <button
              key={pg}
              onClick={() => onWahl(pg)}
              className={`flex flex-col items-center gap-1 rounded-2xl border px-4 py-6 transition-all ${
                sel
                  ? 'border-brand/50 bg-brand/15'
                  : 'border-white/10 bg-elevated hover:border-white/25'
              }`}
            >
              <span className={`text-3xl font-bold ${sel ? 'text-brand' : 'text-ink'}`}>{pg}</span>
              <span className="text-xs text-faint">Pflegegrad</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- Schritt 3: Pflegekasse (Dropdown aus KASSEN) ---
function SchrittPflegekasse({
  wert,
  onWahl,
}: {
  wert: string;
  onWahl: (id: string) => void;
}) {
  const kasse = KASSEN.find((k) => k.id === wert);
  return (
    <div>
      <h2 className="text-lg font-bold text-ink">Pflegekasse</h2>
      <p className="mt-1 text-sm text-muted">Zuständige Kasse für die Antragstellung.</p>
      <label className="mt-5 block max-w-md">
        <span className="mb-1.5 block text-sm font-medium text-muted">Pflegekasse</span>
        <select
          value={wert}
          onChange={(e) => onWahl(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-elevated px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
        >
          {KASSEN.filter((k) => k.aktiv).map((k) => (
            <option key={k.id} value={k.id} className="bg-elevated">
              {k.name}
            </option>
          ))}
        </select>
      </label>
      {kasse && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge farbe={kasse.akzeptiert_abtretung ? 'brand' : 'warn'}>
            {kasse.akzeptiert_abtretung ? 'Abtretung akzeptiert (0-€-Modell)' : 'Keine Abtretung'}
          </Badge>
          <Badge farbe="neutral">Frist {kasse.standard_frist_tage} Tage</Badge>
          {kasse.ik_nummer && <Badge farbe="neutral">IK {kasse.ik_nummer}</Badge>}
        </div>
      )}
    </div>
  );
}

// Aggregierte Live-Kalkulation (Rückgabe der kalk-useMemo).
interface Kalk {
  vk40: number;
  deckel: number;
  foerder40: number;
  eigenanteil: number;
  budgetProzent: number;
  ueber: boolean;
  vk33: number;
  vkAndere: number;
  vkGesamt: number;
  gedeckt: number;
}

// --- Schritt 4: Maßnahmen (gefiltert nach Pflegegrad) + Live-Kalkulation ---
function SchrittMassnahmen({
  massnahmen,
  ausgewaehlt,
  onToggle,
  pflegegrad,
  wohnform,
  kalk,
}: {
  massnahmen: KatalogEintrag[];
  ausgewaehlt: Set<string>;
  onToggle: (id: string) => void;
  pflegegrad: Pflegegrad;
  wohnform: Wohnform;
  kalk: Kalk;
}) {
  // Aufgeklappte Genehmigungsassistenten (pro Maßnahme).
  const [assistentOffen, setAssistentOffen] = useState<Set<string>>(new Set());

  function toggleAssistent(id: string) {
    setAssistentOffen((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-ink">Maßnahmen auswählen</h2>
      <p className="mt-1 text-sm text-muted">
        {massnahmen.length} Maßnahmen für Pflegegrad {pflegegrad} verfügbar — Live-Kalkulation rechts.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        {/* Maßnahmenliste */}
        <div className="space-y-2 lg:col-span-2">
          {massnahmen.map((m) => {
            const sel = ausgewaehlt.has(m.id);
            const offen = assistentOffen.has(m.id);
            const w = m.genehmigungswahrscheinlichkeit
              ? WAHRSCHEINLICHKEIT_META[m.genehmigungswahrscheinlichkeit]
              : undefined;
            const warnungen = massnahmeWarnungen(m, wohnform);
            return (
              <div
                key={m.id}
                className={`rounded-xl border transition-all ${
                  sel ? 'border-brand/40 bg-brand/10' : 'border-white/10 bg-elevated hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between gap-3 p-4">
                  <button
                    onClick={() => onToggle(m.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                        sel ? 'border-brand bg-brand' : 'border-white/30'
                      }`}
                    >
                      {sel && <Check className="h-3.5 w-3.5 text-[#0D1B2A]" />}
                    </div>
                    <div className="min-w-0">
                      <div className={`truncate text-sm font-semibold ${sel ? 'text-brand' : 'text-ink'}`}>
                        {m.code} · {m.bezeichnung}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-base/60 px-1.5 py-0.5 text-xs text-faint">
                          {paragraphLabel(m.foerdertopf_id)}
                        </span>
                        {w && <Badge farbe={w.farbe}>{w.label}</Badge>}
                        {warnungen.map((warn) => (
                          <span
                            key={warn.icon}
                            title={warn.text}
                            className="cursor-help text-sm leading-none"
                            aria-label={warn.text}
                          >
                            {warn.icon}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="text-right">
                      <div className={`text-sm font-bold ${sel ? 'text-brand' : 'text-ink'}`}>
                        {euro(m.standard_vk_brutto)}
                      </div>
                      <div className="text-xs text-faint">VK brutto</div>
                    </div>
                    <button
                      onClick={() => toggleAssistent(m.id)}
                      title="Genehmigungsassistent (Begründung, Unterlagen, Ablehnung/Widerspruch)"
                      aria-expanded={offen}
                      className="rounded-lg p-1.5 text-faint transition-colors hover:bg-hover hover:text-ink"
                    >
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${offen ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                </div>
                {offen && <GenehmigungsAssistent massnahme={m} />}
              </div>
            );
          })}
        </div>

        {/* Sticky Budget-Panel (oben rechts) */}
        <div className="lg:sticky lg:top-6">
          <BudgetPanel kalk={kalk} />
        </div>
      </div>

      {/* Zusammenfassung nach Fördertopf (vor „Weiter") */}
      <ToepfeZusammenfassung kalk={kalk} />
    </div>
  );
}

// --- Genehmigungsassistent: rendert die vorhandenen Katalog-Felder einer
// Maßnahme (Standardbegründung, Pflichtunterlagen, typische Ablehnungs- und
// Widerspruchsgründe) als Aufklapp-Bereich. Keine neuen Inhalte — reine Sicht
// auf die Seed-Daten. ---
function GenehmigungsAssistent({ massnahme }: { massnahme: KatalogEintrag }) {
  // Pflichtunterlagen: globales §40-Profil + maßnahmenspezifische Zusatznachweise.
  const unterlagen = [
    ...GLOBALE_NACHWEISE.map((n) => n.bezeichnung),
    ...massnahme.zusatz_nachweise.map((code) => NACHWEIS_BEZEICHNUNG[code]),
  ];
  const ablehnungen = ABLEHNUNGSGRUENDE.filter((a) =>
    (massnahme.typische_ablehnungsgrund_ids ?? []).includes(a.id),
  );
  // Widerspruchsgründe: direkt verknüpfte + über die Ablehnungsgründe verlinkte.
  const widerspruchIds = new Set([
    ...(massnahme.typische_widerspruchsgrund_ids ?? []),
    ...ablehnungen.flatMap((a) => a.widerspruchsgrund_ids),
  ]);
  const widersprueche = WIDERSPRUCHSGRUENDE.filter((w) => widerspruchIds.has(w.id));

  return (
    <div className="space-y-4 border-t border-white/10 px-4 py-4">
      {/* Standardbegründung */}
      <div>
        <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-faint">
          Standardbegründung
        </div>
        <p className="rounded-lg bg-base/50 px-3 py-2 text-sm italic text-muted">
          {massnahme.standard_begruendung}
        </p>
      </div>

      {/* Pflichtunterlagen */}
      <div>
        <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-faint">
          Pflichtunterlagen
        </div>
        <ul className="space-y-1">
          {unterlagen.map((u) => (
            <li key={u} className="flex items-start gap-2 text-sm text-muted">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
              {u}
            </li>
          ))}
        </ul>
      </div>

      {/* Typische Ablehnungsgründe */}
      {ablehnungen.length > 0 && (
        <div>
          <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-faint">
            Typische Ablehnungsgründe
          </div>
          <div className="space-y-1.5">
            {ablehnungen.map((a) => (
              <div key={a.id} className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold text-warn">{a.bezeichnung}</span>
                  <Badge farbe="neutral">{a.haeufigkeit}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted">{a.beschreibung}</p>
                <p className="mt-1 text-xs text-faint">
                  <span className="font-semibold">Empfohlene Reaktion:</span>{' '}
                  {a.empfohlene_reaktion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Widerspruchsgründe */}
      {widersprueche.length > 0 && (
        <div>
          <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-faint">
            Widerspruchsgründe (bei Ablehnung)
          </div>
          <div className="space-y-1.5">
            {widersprueche.map((wg) => (
              <div key={wg.id} className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2">
                <div className="text-sm font-semibold text-blue-400">{wg.bezeichnung}</div>
                <p className="mt-1 text-xs text-muted">{wg.argumentation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Budget-Balken §40 Abs.4 — wird bei Überschreitung rot, zeigt dann den Eigenanteil.
function BudgetPanel({ kalk }: { kalk: Kalk }) {
  const farbe = kalk.ueber ? '#FF6B6B' : kalk.budgetProzent > 70 ? '#F5A623' : '#2ECC8A';
  return (
    <div className="rounded-2xl border border-white/10 bg-elevated p-5">
      <div className="text-xs font-bold uppercase tracking-wider text-faint">
        Förderbudget § 40 Abs. 4
      </div>
      <div className="mb-1.5 mt-3 flex justify-between text-xs">
        <span className={kalk.ueber ? 'font-semibold text-danger' : 'text-muted'}>
          {euro(kalk.vk40)}
        </span>
        <span className="text-faint">max. {euro(kalk.deckel)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-base">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${kalk.budgetProzent}%`, backgroundColor: farbe }}
        />
      </div>

      {kalk.ueber ? (
        <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-warn">
          ⚠️ {euro(kalk.eigenanteil)} Eigenanteil
        </div>
      ) : (
        <div className="mt-3 text-xs font-medium text-brand">✓ im Budget</div>
      )}

      {kalk.vk33 > 0 && (
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
          <span className="text-muted">🏥 § 33 SGB V (über Arzt)</span>
          <span className="font-semibold text-ink">{euro(kalk.vk33)}</span>
        </div>
      )}
    </div>
  );
}

// Zusammenfassung nach Fördertopf — getrennt §40 / §33 / Eigenanteil / Gesamt.
function ToepfeZusammenfassung({ kalk }: { kalk: Kalk }) {
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-card p-5">
      <div className="mb-3 text-xs font-bold uppercase tracking-wider text-faint">Kalkulation</div>
      <div className="space-y-2 text-sm">
        <TopfZeile
          label="§ 40 Abs. 4"
          wert={euro(kalk.vk40)}
          hinweis={kalk.ueber ? `⚠ ${euro(kalk.eigenanteil)} Eigenanteil` : '✓ im Budget'}
          hinweisFarbe={kalk.ueber ? 'text-warn' : 'text-brand'}
        />
        {kalk.vk33 > 0 && (
          <TopfZeile
            label="§ 33 SGB V"
            wert={euro(kalk.vk33)}
            hinweis="→ Arztverordnung nötig"
            hinweisFarbe="text-faint"
          />
        )}
        {kalk.vkAndere > 0 && <TopfZeile label="Weitere" wert={euro(kalk.vkAndere)} />}
        <TopfZeile
          label="Eigenanteil"
          wert={euro(kalk.eigenanteil)}
          wertFarbe={kalk.eigenanteil === 0 ? 'text-brand' : 'text-warn'}
        />
        <div className="flex items-center justify-between border-t border-white/10 pt-2">
          <span className="font-bold text-ink">Gesamtprojekt</span>
          <span className="text-base font-bold text-ink">{euro(kalk.vkGesamt)}</span>
        </div>
      </div>
    </div>
  );
}

function TopfZeile({
  label,
  wert,
  hinweis,
  hinweisFarbe = 'text-faint',
  wertFarbe = 'text-ink',
}: {
  label: string;
  wert: string;
  hinweis?: string;
  hinweisFarbe?: string;
  wertFarbe?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted">{label}</span>
      <div className="flex items-center gap-3">
        {hinweis && <span className={`text-xs ${hinweisFarbe}`}>{hinweis}</span>}
        <span className={`w-20 text-right font-semibold ${wertFarbe}`}>{wert}</span>
      </div>
    </div>
  );
}

// --- Schritt 5: Vollständigkeitsprüfung (Checkliste + pruefeAntrag) ---
function SchrittPruefung({
  nachweise,
  istVorhanden,
  onToggle,
  punkte,
  bestanden,
  fehler,
  warnungen,
}: {
  nachweise: { code: NachweisCode; bezeichnung: string; pflicht: boolean }[];
  istVorhanden: (code: string) => boolean;
  onToggle: (code: string) => void;
  punkte: Pruefpunkt[];
  bestanden: boolean;
  fehler: number;
  warnungen: number;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-ink">Vollständigkeitsprüfung</h2>
      <p className="mt-1 text-sm text-muted">
        Pflichtunterlagen abhaken — die Prüfung läuft live (Gate für „Antrag stellen").
      </p>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Checkliste */}
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-faint">
            Pflichtunterlagen
          </div>
          <div className="space-y-2">
            {nachweise.map((n) => {
              const vorhanden = istVorhanden(n.code);
              return (
                <button
                  key={n.code}
                  onClick={() => onToggle(n.code)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    vorhanden ? 'border-emerald-500/40 bg-brand/10' : 'border-white/10 bg-elevated'
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      vorhanden ? 'border-brand bg-brand' : 'border-white/30'
                    }`}
                  >
                    {vorhanden && <Check className="h-3.5 w-3.5 text-[#0D1B2A]" />}
                  </div>
                  <span className={`text-sm ${vorhanden ? 'text-ink' : 'text-muted'}`}>
                    {n.bezeichnung}
                  </span>
                  {!n.pflicht && (
                    <span className="ml-auto text-xs text-faint">optional</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Prüfergebnis */}
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-faint">
            Prüfergebnis
          </div>
          <div
            className={`mb-3 rounded-xl border p-3 text-sm font-semibold ${
              bestanden
                ? 'border-emerald-500/40 bg-brand/10 text-brand'
                : 'border-red-500/40 bg-red-500/10 text-danger'
            }`}
          >
            {bestanden
              ? '✓ Antrag vollständig — bereit zum Einreichen.'
              : `${fehler} Fehler${warnungen ? `, ${warnungen} Warnung(en)` : ''} — bitte beheben.`}
          </div>
          <div className="space-y-1.5">
            {punkte.map((p) => (
              <div key={p.nr} className="flex items-start gap-2 text-sm">
                <PruefIcon status={p.status} />
                <div>
                  <span className="font-medium text-ink">{p.titel}</span>
                  <span className="text-muted"> — {p.meldung}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PruefIcon({ status }: { status: PruefStatus }) {
  if (status === 'ok') return <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />;
  if (status === 'warnung')
    return <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" />;
  return <X className="mt-0.5 h-4 w-4 shrink-0 text-danger" />;
}

// --- Schritt 6: Zusammenfassung ---
function SchrittZusammenfassung({
  entwurf,
  gewaehlt,
  vkGesamt,
  gedeckt,
  eigenanteil,
  maxBudget,
  kasse,
  bestanden,
}: {
  entwurf: KundeEntwurf;
  gewaehlt: KatalogEintrag[];
  vkGesamt: number;
  gedeckt: number;
  eigenanteil: number;
  maxBudget: number;
  kasse: string;
  bestanden: boolean;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-ink">Zusammenfassung</h2>
      <p className="mt-1 text-sm text-muted">
        {entwurf.vorname} {entwurf.nachname} · PG {entwurf.pflegegrad} · {kasse}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Maßnahmenliste */}
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-faint">
            Gewählte Maßnahmen ({gewaehlt.length})
          </div>
          <div className="space-y-2">
            {gewaehlt.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-elevated p-3"
              >
                <span className="text-sm text-ink">{m.bezeichnung}</span>
                <span className="text-sm font-semibold text-ink">{euro(m.standard_vk_brutto)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kundensicht — bewusst getrennt von interner Marge (CLAUDE.md §3.4) */}
        <div>
          <div className="rounded-2xl border border-emerald-500/30 bg-[#0A4028] p-5">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-300/70">
              Kunden-Kalkulation
            </div>
            <Summenzeile label="Projektkosten (VK)" wert={euro(vkGesamt)} />
            <Summenzeile label="Kostenträger (§40 + §33)" wert={`−${euro(gedeckt)}`} farbe="brand" />
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
              <span className="font-bold text-ink">Eigenanteil Kunde</span>
              <span className={`text-xl font-bold ${eigenanteil === 0 ? 'text-brand' : 'text-warn'}`}>
                {eigenanteil === 0 ? '0 € ✓' : euro(eigenanteil)}
              </span>
            </div>
            <div className="mt-2 text-xs text-emerald-300/60">
              Max. Förderbudget §40 Abs.4: {euro(maxBudget)}
            </div>
          </div>

          <div
            className={`mt-4 rounded-xl border p-3 text-sm font-semibold ${
              bestanden
                ? 'border-emerald-500/40 bg-brand/10 text-brand'
                : 'border-amber-500/40 bg-amber-500/10 text-warn'
            }`}
          >
            {bestanden
              ? '✓ Vollständigkeitsprüfung bestanden — Antrag kann gestellt werden.'
              : '⚠ Prüfung noch offen — Schritt 5 abschließen.'}
          </div>
        </div>
      </div>
    </div>
  );
}

function Summenzeile({
  label,
  wert,
  farbe = 'ink',
}: {
  label: string;
  wert: string;
  farbe?: 'ink' | 'brand';
}) {
  return (
    <div className="flex justify-between py-0.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className={`font-semibold ${farbe === 'brand' ? 'text-brand' : 'text-ink'}`}>{wert}</span>
    </div>
  );
}

// --- Dokumente-Paket: Auswahlliste + Druckbuttons für alle 6 Dokumente ---

interface DokumentKarte {
  id: string;
  titel: string;
  beschreibung: string;
  verfuegbar: boolean;
  oeffnen: () => void;
}

function DokumentePaket({
  karten,
  dokErstelltAm,
  onDokumentOeffnen,
}: {
  karten: DokumentKarte[];
  dokErstelltAm: string | null;
  onDokumentOeffnen: () => void;
}) {
  const verfuegbar = karten.filter((k) => k.verfuegbar);

  function handleOeffnen(k: DokumentKarte) {
    k.oeffnen();
    onDokumentOeffnen();
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wider text-faint">
          Dokumente ({verfuegbar.length} verfügbar)
        </div>
        {dokErstelltAm && (
          <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand">
            ✓ erstellt am {dokErstelltAm}
          </span>
        )}
      </div>
      <div className="space-y-2">
        {karten.map((k) => (
          <div
            key={k.id}
            className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-opacity ${
              k.verfuegbar ? 'border-white/10 bg-elevated' : 'border-white/5 bg-elevated opacity-40'
            }`}
          >
            <div className="flex min-w-0 items-start gap-3">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink">{k.titel}</div>
                <div className="truncate text-xs text-muted">{k.beschreibung}</div>
              </div>
            </div>
            <button
              onClick={() => handleOeffnen(k)}
              disabled={!k.verfuegbar}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 bg-elevated px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Printer className="h-3.5 w-3.5 text-brand" /> Drucken
            </button>
          </div>
        ))}
      </div>
      {!dokErstelltAm && (
        <p className="mt-3 text-xs text-faint">
          Dokumente werden im Browser als neue Tabs geöffnet → „Als PDF speichern" oder drucken.
        </p>
      )}
    </div>
  );
}

// --- Interne Notizen & Besonderheiten (nur Admin) ---
function InterneNotizen({
  besonderheiten,
  onBesonderheiten,
  notizen,
  notizText,
  onNotizText,
  onNotizHinzufuegen,
}: {
  besonderheiten: string;
  onBesonderheiten: (v: string) => void;
  notizen: VorgangsNotiz[];
  notizText: string;
  onNotizText: (v: string) => void;
  onNotizHinzufuegen: () => void;
}) {
  return (
    <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-5">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-violet-300">
          Interne Notizen
        </span>
        <Badge farbe="violett">nur Admin</Badge>
      </div>
      <p className="mb-4 text-xs text-faint">
        Lernnotizen für zukünftige Verbesserungen — für den Kunden nicht sichtbar.
      </p>

      {/* Besonderheiten dieses Falls */}
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-muted">
          Besonderheiten dieses Falls
        </span>
        <textarea
          value={besonderheiten}
          onChange={(e) => onBesonderheiten(e.target.value)}
          rows={2}
          placeholder="z. B. Vermieter zögerlich, MD-Begutachtung angekündigt, Sonderfall Diagnose…"
          className="w-full resize-y rounded-xl border border-white/10 bg-elevated px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
        />
      </label>

      {/* Lernnotiz hinzufügen */}
      <div className="mt-4">
        <span className="mb-1.5 block text-sm font-medium text-muted">Lernnotiz hinzufügen</span>
        <div className="flex gap-2">
          <input
            value={notizText}
            onChange={(e) => onNotizText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onNotizHinzufuegen();
            }}
            placeholder="Notiz eingeben und Enter…"
            className="flex-1 rounded-xl border border-white/10 bg-elevated px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
          />
          <button
            onClick={onNotizHinzufuegen}
            disabled={notizText.trim() === ''}
            className="inline-flex items-center gap-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-[#0D1B2A] transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" /> Notiz
          </button>
        </div>
      </div>

      {/* Notiz-Historie mit Zeitstempel (wer/wann/was) */}
      {notizen.length > 0 && (
        <div className="mt-4 space-y-2">
          {notizen.map((n) => (
            <div key={n.id} className="rounded-xl border border-white/10 bg-card p-3">
              <div className="mb-1 flex items-center justify-between text-xs text-faint">
                <span className="font-semibold text-muted">
                  {n.autor} · {n.rolle}
                </span>
                <span>{new Date(n.zeitpunkt).toLocaleString('de-DE')}</span>
              </div>
              <div className="text-sm text-ink">{n.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
