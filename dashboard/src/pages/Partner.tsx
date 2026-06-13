import { useState, useMemo } from 'react';
import {
  Search, Plus, Pencil, Trash2, Download, Star, X, MapPin,
  ChevronUp, ChevronDown, ArrowUpDown,
} from 'lucide-react';
import { SeitenKopf, Modal } from '@/components/ui';
import { usePartner } from '@/context/PartnerContext';
import type {
  Partner, PartnerEingabe, PartnerTyp, PartnerBundesland,
  KooperationsStatus, CrmStatus,
} from '@/domain/types';

// ---------------------------------------------------------------------------
// Konstanten & Hilfsfunktionen
// ---------------------------------------------------------------------------

const TYP_LABEL: Record<PartnerTyp, string> = {
  pflegedienst: 'Pflegedienst',
  pflegeberater: 'Pflegeberater',
  pflege_wg: 'Pflege-WG',
  seniorenresidenz: 'Seniorenresidenz',
  wohnungsbau: 'Wohnungsbau',
  handwerker: 'Handwerker',
  lieferant: 'Lieferant',
  krankenkasse: 'Krankenkasse',
  pflegekasse: 'Pflegekasse',
};

const BUNDESLAND_LABEL: Record<PartnerBundesland, string> = {
  berlin: 'Berlin',
  brandenburg: 'Brandenburg',
  schleswig_holstein: 'Schleswig-Holstein',
  sonstige: 'Sonstige',
};

const KOOP_FARBE: Record<KooperationsStatus, string> = {
  Offen: 'bg-white/5 text-muted border-white/15',
  Kontaktiert: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
  Partner: 'bg-emerald-500/15 text-brand border-emerald-500/40',
  Inaktiv: 'bg-red-500/15 text-danger border-red-500/40',
};

const CRM_FARBE: Record<CrmStatus, string> = {
  Neu: 'bg-white/5 text-muted border-white/15',
  Recherche: 'bg-amber-500/15 text-warn border-amber-500/40',
  'In Gespräch': 'bg-blue-500/15 text-blue-400 border-blue-500/40',
  Abgeschlossen: 'bg-emerald-500/15 text-brand border-emerald-500/40',
};

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

type TabKey = 'alle' | 'pflegedienst' | 'pflege_wg' | 'seniorenresidenz' | 'handwerker' | 'krankenkasse' | 'pflegekasse' | 'lieferant';

const TABS: { key: TabKey; label: string; typen: PartnerTyp[] }[] = [
  { key: 'alle',             label: 'Alle',               typen: [] },
  { key: 'pflegedienst',     label: 'Pflegedienste',       typen: ['pflegedienst'] },
  { key: 'pflege_wg',        label: 'Pflege-WGs',          typen: ['pflege_wg'] },
  { key: 'seniorenresidenz', label: 'Seniorenresidenzen',  typen: ['seniorenresidenz'] },
  { key: 'handwerker',       label: 'Handwerker',          typen: ['handwerker'] },
  { key: 'krankenkasse',     label: 'Krankenkassen',       typen: ['krankenkasse'] },
  { key: 'pflegekasse',      label: 'Pflegekassen',        typen: ['pflegekasse'] },
  { key: 'lieferant',        label: 'Lieferanten',         typen: ['lieferant'] },
];

// ---------------------------------------------------------------------------
// Sortierung
// ---------------------------------------------------------------------------

type SortSpalte = 'name' | 'typ' | 'ort' | 'bundesland' | 'bezirk' | 'kooperation' | 'bewertung' | 'letzter_kontakt';

const KOOP_ORDER: KooperationsStatus[] = ['Partner', 'Kontaktiert', 'Offen', 'Inaktiv'];

function sortierePartner(liste: Partner[], spalte: SortSpalte, richtung: 'asc' | 'desc'): Partner[] {
  const m = richtung === 'asc' ? 1 : -1;
  return [...liste].sort((a, b) => {
    let v = 0;
    switch (spalte) {
      case 'name':          v = a.firmenname.localeCompare(b.firmenname, 'de'); break;
      case 'typ':           v = TYP_LABEL[a.typ].localeCompare(TYP_LABEL[b.typ], 'de'); break;
      case 'ort':           v = (a.ort ?? '').localeCompare(b.ort ?? '', 'de'); break;
      case 'bundesland':    v = a.bundesland.localeCompare(b.bundesland, 'de'); break;
      case 'bezirk':        v = (a.bezirk ?? '').localeCompare(b.bezirk ?? '', 'de'); break;
      case 'kooperation':   v = KOOP_ORDER.indexOf(a.kooperations_status) - KOOP_ORDER.indexOf(b.kooperations_status); break;
      case 'bewertung':     v = (b.bewertung ?? 0) - (a.bewertung ?? 0); break;
      case 'letzter_kontakt': v = (b.letzter_kontakt ?? '').localeCompare(a.letzter_kontakt ?? ''); break;
    }
    return v * m;
  });
}

// Spalten-Header mit Sortier-Indikator.
function SortTh({
  label, spalte, aktiv, richtung, onSort, className,
}: {
  label: string;
  spalte: SortSpalte;
  aktiv: SortSpalte;
  richtung: 'asc' | 'desc';
  onSort: (s: SortSpalte) => void;
  className?: string;
}) {
  const istAktiv = aktiv === spalte;
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide cursor-pointer select-none transition-colors hover:text-ink ${istAktiv ? 'text-brand' : 'text-faint'} ${className ?? ''}`}
      onClick={() => onSort(spalte)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {istAktiv
          ? (richtung === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)
          : <ArrowUpDown className="h-3 w-3 opacity-30" />}
      </span>
    </th>
  );
}

function StatusBadge({ label, klasse }: { label: string; klasse: string }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${klasse}`}>
      {label}
    </span>
  );
}

function Sterne({ wert }: { wert?: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3 w-3 ${wert && n <= wert ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`}
        />
      ))}
    </span>
  );
}

function exportiereCSV(partner: Partner[]) {
  const kopf = [
    'Firmenname', 'Typ', 'GF', 'Ansprechpartner', 'Strasse', 'PLZ', 'Ort', 'Bezirk', 'Bundesland',
    'Telefon', 'Mobil', 'Fax', 'E-Mail', 'Website', 'HRB', 'USt-ID', 'IK-Nummer',
    'Leistungen', '§72', 'Hauptkasse', 'Sprachen', 'Patienten ca.',
    'Kooperation', 'CRM-Status', 'Bewertung', 'Letzter Kontakt', 'Notiz', 'Erstellt am',
  ];
  const zeilen = partner.map((p) => [
    p.firmenname, TYP_LABEL[p.typ], p.geschaeftsfuehrer ?? '', p.ansprechpartner ?? '',
    p.strasse ?? '', p.plz ?? '', p.ort ?? '', p.bezirk ?? '', BUNDESLAND_LABEL[p.bundesland],
    p.telefon ?? '', p.mobil ?? '', p.fax ?? '', p.email ?? '', p.website ?? '',
    p.hrb ?? '', p.ust_id ?? '', p.ik_nummer ?? '', p.leistungen ?? '',
    p.paragraph72_zugelassen ? 'Ja' : 'Nein',
    p.hauptkasse ?? '', p.sprachen ?? '', p.patienten_ca?.toString() ?? '',
    p.kooperations_status, p.crm_status, p.bewertung?.toString() ?? '',
    p.letzter_kontakt ?? '', p.notiz ?? '', p.erstellt_am,
  ].map((v) => `"${v.replace(/"/g, '""')}"`));
  const csv = [kopf.join(';'), ...zeilen.map((z) => z.join(';'))].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `partner_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Leer-Formular
// ---------------------------------------------------------------------------

const LEER: PartnerEingabe = {
  typ: 'pflegedienst',
  firmenname: '',
  bundesland: 'berlin',
  kooperations_status: 'Offen',
  crm_status: 'Neu',
  aktiv: true,
};

// ---------------------------------------------------------------------------
// Detail-/Bearbeitungs-Modal
// ---------------------------------------------------------------------------

function PartnerModal({
  partner,
  allePartner,
  onClose,
  onSpeichern,
  onLoeschen,
}: {
  partner: Partner | null;
  allePartner: Partner[];
  onClose: () => void;
  onSpeichern: (id: string | null, daten: PartnerEingabe) => void;
  onLoeschen: (id: string) => void;
}) {
  const neuAnlegen = partner === null;
  const [bearbeiten, setBearbeiten] = useState(neuAnlegen);
  const [daten, setDaten] = useState<PartnerEingabe>(partner ? { ...partner } : LEER);
  const [loeschBestaetigung, setLoeschBestaetigung] = useState(false);

  const duplikat = useMemo(() => {
    const anderen = allePartner.filter(p => neuAnlegen ? true : p.id !== partner!.id);
    if (daten.ik_nummer?.trim()) {
      const k = anderen.find(p => p.ik_nummer === daten.ik_nummer!.trim());
      if (k) return { art: 'fehler' as const, text: `IK-Nummer bereits vergeben (${k.firmenname})` };
    }
    if (daten.firmenname.trim() && daten.plz?.trim()) {
      const k = anderen.find(p =>
        p.firmenname.toLowerCase() === daten.firmenname.toLowerCase().trim() &&
        p.plz === daten.plz!.trim()
      );
      if (k) return { art: 'warnung' as const, text: `Mögliches Duplikat: ${k.firmenname}, ${[k.plz, k.ort].filter(Boolean).join(' ')}` };
    }
    return null;
  }, [daten.ik_nummer, daten.firmenname, daten.plz, allePartner, neuAnlegen, partner]);

  function set<K extends keyof PartnerEingabe>(feld: K, wert: PartnerEingabe[K]) {
    setDaten((d) => ({ ...d, [feld]: wert }));
  }

  function speichern() {
    if (!daten.firmenname.trim()) return;
    if (duplikat?.art === 'fehler') return;
    onSpeichern(partner?.id ?? null, daten);
    onClose();
  }

  function FeldAnzeige({ label, wert }: { label: string; wert?: string | number | boolean }) {
    if (!wert && wert !== 0 && wert !== false) return null;
    return (
      <div>
        <div className="text-xs text-faint mb-0.5">{label}</div>
        <div className="text-sm text-ink">{wert === true ? 'Ja' : wert === false ? 'Nein' : String(wert)}</div>
      </div>
    );
  }

  const input = 'w-full rounded-lg border border-white/15 bg-elevated px-3 py-1.5 text-sm text-ink placeholder:text-faint focus:border-brand focus:outline-none';
  const select = 'w-full rounded-lg border border-white/15 bg-elevated px-3 py-1.5 text-sm text-ink focus:border-brand focus:outline-none';
  const labelCls = 'block text-xs text-faint mb-1';

  return (
    <Modal
      titel={neuAnlegen ? 'Partner anlegen' : (bearbeiten ? 'Partner bearbeiten' : partner!.firmenname)}
      onClose={onClose}
      footer={
        bearbeiten ? (
          <div className="flex justify-end gap-2">
            <button onClick={() => { setBearbeiten(false); if (neuAnlegen) onClose(); }} className="px-4 py-2 rounded-lg text-sm text-muted hover:bg-elevated">
              Abbrechen
            </button>
            <button
              onClick={speichern}
              disabled={duplikat?.art === 'fehler'}
              className={`px-4 py-2 rounded-lg bg-brand text-[#0D1B2A] text-sm font-semibold ${duplikat?.art === 'fehler' ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90'}`}
            >
              Speichern
            </button>
          </div>
        ) : (
          <div className="flex w-full justify-between items-center gap-2">
            <div>
              {!loeschBestaetigung ? (
                <button onClick={() => setLoeschBestaetigung(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-danger text-sm hover:bg-elevated">
                  <Trash2 className="h-4 w-4" /> Löschen
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-danger">Wirklich löschen?</span>
                  <button onClick={() => { onLoeschen(partner!.id); onClose(); }} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-danger text-sm hover:bg-red-500/30">Ja</button>
                  <button onClick={() => setLoeschBestaetigung(false)} className="px-3 py-1.5 rounded-lg text-muted text-sm hover:bg-elevated">Nein</button>
                </div>
              )}
            </div>
            <button onClick={() => setBearbeiten(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-elevated text-ink text-sm hover:bg-hover">
              <Pencil className="h-4 w-4" /> Bearbeiten
            </button>
          </div>
        )
      }
    >
      {bearbeiten ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Firmenname *</label>
              <input className={input} value={daten.firmenname} onChange={(e) => set('firmenname', e.target.value)} placeholder="Firmenname" />
            </div>
            <div>
              <label className={labelCls}>Typ</label>
              <select className={select} value={daten.typ} onChange={(e) => set('typ', e.target.value as PartnerTyp)}>
                {Object.entries(TYP_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Bundesland</label>
              <select className={select} value={daten.bundesland} onChange={(e) => set('bundesland', e.target.value as PartnerBundesland)}>
                {Object.entries(BUNDESLAND_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Geschäftsführer</label>
              <input className={input} value={daten.geschaeftsfuehrer ?? ''} onChange={(e) => set('geschaeftsfuehrer', e.target.value || undefined)} placeholder="Name(n)" />
            </div>
            <div>
              <label className={labelCls}>Ansprechpartner</label>
              <input className={input} value={daten.ansprechpartner ?? ''} onChange={(e) => set('ansprechpartner', e.target.value || undefined)} placeholder="Name" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3">
              <label className={labelCls}>Straße</label>
              <input className={input} value={daten.strasse ?? ''} onChange={(e) => set('strasse', e.target.value || undefined)} placeholder="Straße Nr." />
            </div>
            <div>
              <label className={labelCls}>PLZ</label>
              <input className={input} value={daten.plz ?? ''} onChange={(e) => set('plz', e.target.value || undefined)} placeholder="12345" />
            </div>
            <div>
              <label className={labelCls}>Ort</label>
              <input className={input} value={daten.ort ?? ''} onChange={(e) => set('ort', e.target.value || undefined)} placeholder="Stadt" />
            </div>
            <div>
              <label className={labelCls}>Bezirk</label>
              <input className={input} value={daten.bezirk ?? ''} onChange={(e) => set('bezirk', e.target.value || undefined)} placeholder="Bezirk" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Telefon</label>
              <input className={input} value={daten.telefon ?? ''} onChange={(e) => set('telefon', e.target.value || undefined)} placeholder="030 …" />
            </div>
            <div>
              <label className={labelCls}>Mobil</label>
              <input className={input} value={daten.mobil ?? ''} onChange={(e) => set('mobil', e.target.value || undefined)} placeholder="0176 …" />
            </div>
            <div>
              <label className={labelCls}>Fax</label>
              <input className={input} value={daten.fax ?? ''} onChange={(e) => set('fax', e.target.value || undefined)} placeholder="030 …" />
            </div>
            <div>
              <label className={labelCls}>E-Mail</label>
              <input className={input} value={daten.email ?? ''} onChange={(e) => set('email', e.target.value || undefined)} placeholder="info@…" />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Website</label>
              <input className={input} value={daten.website ?? ''} onChange={(e) => set('website', e.target.value || undefined)} placeholder="www.beispiel.de" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>HRB</label>
              <input className={input} value={daten.hrb ?? ''} onChange={(e) => set('hrb', e.target.value || undefined)} placeholder="HRB 12345" />
            </div>
            <div>
              <label className={labelCls}>USt-ID</label>
              <input className={input} value={daten.ust_id ?? ''} onChange={(e) => set('ust_id', e.target.value || undefined)} placeholder="DE…" />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>IK-Nummer (Institutionskennzeichen)</label>
              <input
                className={`${input} ${daten.ik_nummer && duplikat?.art === 'fehler' ? 'border-red-500/60' : ''}`}
                value={daten.ik_nummer ?? ''}
                onChange={(e) => set('ik_nummer', e.target.value || undefined)}
                placeholder="z. B. 104212505"
              />
            </div>
          </div>

          {duplikat && (
            <div className={`rounded-lg px-3 py-2 text-xs font-medium border ${
              duplikat.art === 'fehler'
                ? 'bg-red-500/15 text-red-400 border-red-500/40'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/40'
            }`}>
              {duplikat.art === 'fehler' ? 'Fehler: ' : 'Warnung: '}{duplikat.text}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Leistungen</label>
              <input className={input} value={daten.leistungen ?? ''} onChange={(e) => set('leistungen', e.target.value || undefined)} placeholder="Ambulante Pflege / …" />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="p72" checked={daten.paragraph72_zugelassen ?? false} onChange={(e) => set('paragraph72_zugelassen', e.target.checked || undefined)} className="h-4 w-4 accent-brand" />
              <label htmlFor="p72" className="text-sm text-ink cursor-pointer">§72 SGB XI zugelassen</label>
            </div>
            <div>
              <label className={labelCls}>Patienten ca.</label>
              <input type="number" className={input} value={daten.patienten_ca ?? ''} onChange={(e) => set('patienten_ca', e.target.value ? Number(e.target.value) : undefined)} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>Hauptkasse</label>
              <input className={input} value={daten.hauptkasse ?? ''} onChange={(e) => set('hauptkasse', e.target.value || undefined)} placeholder="AOK Nordost" />
            </div>
            <div>
              <label className={labelCls}>Sprachen</label>
              <input className={input} value={daten.sprachen ?? ''} onChange={(e) => set('sprachen', e.target.value || undefined)} placeholder="Deutsch / Russisch" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Kooperationsstatus</label>
              <select className={select} value={daten.kooperations_status} onChange={(e) => set('kooperations_status', e.target.value as KooperationsStatus)}>
                {(['Offen', 'Kontaktiert', 'Partner', 'Inaktiv'] as KooperationsStatus[]).map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>CRM-Status</label>
              <select className={select} value={daten.crm_status} onChange={(e) => set('crm_status', e.target.value as CrmStatus)}>
                {(['Neu', 'Recherche', 'In Gespräch', 'Abgeschlossen'] as CrmStatus[]).map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Bewertung (1–5)</label>
              <div className="flex gap-1 pt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => set('bewertung', daten.bewertung === n ? undefined : n as 1|2|3|4|5)}>
                    <Star className={`h-5 w-5 transition-colors ${daten.bewertung && n <= daten.bewertung ? 'fill-amber-400 text-amber-400' : 'text-white/20 hover:text-amber-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Letzter Kontakt</label>
              <input type="date" className={input} value={daten.letzter_kontakt ?? ''} onChange={(e) => set('letzter_kontakt', e.target.value || undefined)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Notiz</label>
            <textarea className={`${input} resize-none`} rows={3} value={daten.notiz ?? ''} onChange={(e) => set('notiz', e.target.value || undefined)} placeholder="Interne Notiz …" />
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={TYP_LABEL[partner!.typ]} klasse="bg-blue-500/15 text-blue-400 border-blue-500/40" />
            <StatusBadge label={partner!.kooperations_status} klasse={KOOP_FARBE[partner!.kooperations_status]} />
            <StatusBadge label={partner!.crm_status} klasse={CRM_FARBE[partner!.crm_status]} />
            {partner!.paragraph72_zugelassen && (
              <StatusBadge label="§72 zugelassen" klasse="bg-emerald-500/15 text-brand border-emerald-500/40" />
            )}
            {partner!.bewertung && <Sterne wert={partner!.bewertung} />}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <FeldAnzeige label="Geschäftsführer" wert={partner!.geschaeftsfuehrer} />
            <FeldAnzeige label="Ansprechpartner" wert={partner!.ansprechpartner} />
            {(partner!.strasse || partner!.ort) && (
              <div className="col-span-2">
                <div className="text-xs text-faint mb-0.5">Adresse</div>
                <div className="text-sm text-ink">
                  {[partner!.strasse, [partner!.plz, partner!.ort].filter(Boolean).join(' '), partner!.bezirk].filter(Boolean).join(', ')}
                </div>
              </div>
            )}
            <FeldAnzeige label="Bundesland" wert={BUNDESLAND_LABEL[partner!.bundesland]} />
            <FeldAnzeige label="Telefon" wert={partner!.telefon} />
            <FeldAnzeige label="Mobil" wert={partner!.mobil} />
            <FeldAnzeige label="Fax" wert={partner!.fax} />
            <FeldAnzeige label="E-Mail" wert={partner!.email} />
            <FeldAnzeige label="Website" wert={partner!.website} />
            <FeldAnzeige label="HRB" wert={partner!.hrb} />
            <FeldAnzeige label="USt-ID" wert={partner!.ust_id} />
            <FeldAnzeige label="IK-Nummer" wert={partner!.ik_nummer} />
          </div>

          {(partner!.leistungen || partner!.hauptkasse || partner!.sprachen || partner!.patienten_ca) && (
            <div className="border-t border-white/10 pt-4 grid grid-cols-2 gap-x-6 gap-y-3">
              <FeldAnzeige label="Leistungen" wert={partner!.leistungen} />
              <FeldAnzeige label="Hauptkasse" wert={partner!.hauptkasse} />
              <FeldAnzeige label="Sprachen" wert={partner!.sprachen} />
              <FeldAnzeige label="Patienten ca." wert={partner!.patienten_ca} />
            </div>
          )}

          <div className="border-t border-white/10 pt-4 grid grid-cols-2 gap-x-6 gap-y-3">
            <FeldAnzeige label="Letzter Kontakt" wert={partner!.letzter_kontakt} />
            <FeldAnzeige label="Erstellt am" wert={partner!.erstellt_am} />
            {partner!.notiz && (
              <div className="col-span-2">
                <div className="text-xs text-faint mb-0.5">Notiz</div>
                <div className="text-sm text-ink whitespace-pre-wrap">{partner!.notiz}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Hauptseite
// ---------------------------------------------------------------------------

export default function PartnerSeite() {
  const { partner, addPartner, updatePartner, deletePartner } = usePartner();

  const [suche, setSuche] = useState('');
  const [tabAktiv, setTabAktiv] = useState<TabKey>('alle');
  const [filterBundesland, setFilterBundesland] = useState<PartnerBundesland | 'alle'>('alle');
  const [filterBezirk, setFilterBezirk] = useState('');
  const [filterP72, setFilterP72] = useState<'alle' | 'ja' | 'nein'>('alle');
  const [filterKoop, setFilterKoop] = useState<KooperationsStatus | 'alle'>('alle');
  const [sortSpalte, setSortSpalte] = useState<SortSpalte>('name');
  const [sortRichtung, setSortRichtung] = useState<'asc' | 'desc'>('asc');

  const [modalZustand, setModalZustand] = useState<null | 'neu' | Partner>(null);

  const bezirke = useMemo(
    () => [...new Set(partner.map((p) => p.bezirk).filter(Boolean) as string[])].sort(),
    [partner],
  );

  function onSort(spalte: SortSpalte) {
    if (sortSpalte === spalte) {
      setSortRichtung((r) => (r === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortSpalte(spalte);
      setSortRichtung('asc');
    }
  }

  // Gefiltert ohne Tab-Filter → für Tab-Zähler.
  const gefiltertOhneTab = useMemo(() => {
    const q = suche.trim().toLowerCase();
    return partner.filter((p) => {
      if (filterBundesland !== 'alle' && p.bundesland !== filterBundesland) return false;
      if (filterBezirk && p.bezirk !== filterBezirk) return false;
      if (filterP72 === 'ja' && !p.paragraph72_zugelassen) return false;
      if (filterP72 === 'nein' && p.paragraph72_zugelassen) return false;
      if (filterKoop !== 'alle' && p.kooperations_status !== filterKoop) return false;
      if (!q) return true;
      const heuhaufen = [
        p.firmenname, p.geschaeftsfuehrer, p.ansprechpartner,
        p.strasse, p.plz, p.ort, p.bezirk, p.email, p.notiz,
        p.ik_nummer, p.hrb, p.telefon,
      ].filter(Boolean).join(' ').toLowerCase();
      return heuhaufen.includes(q);
    });
  }, [partner, suche, filterBundesland, filterBezirk, filterP72, filterKoop]);

  // Tab-Zähler.
  const tabZaehler = useMemo(() => {
    const z: Partial<Record<TabKey, number>> = {};
    for (const tab of TABS) {
      z[tab.key] = tab.typen.length === 0
        ? gefiltertOhneTab.length
        : gefiltertOhneTab.filter((p) => (tab.typen as PartnerTyp[]).includes(p.typ)).length;
    }
    return z;
  }, [gefiltertOhneTab]);

  // Finale gefilterte + sortierte Liste.
  const gefiltert = useMemo(() => {
    const tab = TABS.find((t) => t.key === tabAktiv)!;
    const mitTab = tab.typen.length === 0
      ? gefiltertOhneTab
      : gefiltertOhneTab.filter((p) => (tab.typen as PartnerTyp[]).includes(p.typ));
    return sortierePartner(mitTab, sortSpalte, sortRichtung);
  }, [gefiltertOhneTab, tabAktiv, sortSpalte, sortRichtung]);

  function speichern(id: string | null, daten: PartnerEingabe) {
    if (id) updatePartner(id, daten);
    else addPartner(daten);
  }

  const select = 'rounded-lg border border-white/15 bg-elevated px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none';

  return (
    <div className="space-y-6">
      <SeitenKopf
        titel="Partner"
        untertitel={`${gefiltert.length} von ${partner.length} Einträgen`}
        aktion={
          <div className="flex gap-2">
            <button
              onClick={() => exportiereCSV(gefiltert)}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-elevated px-4 py-2 text-sm text-muted hover:bg-hover hover:text-ink transition-colors"
            >
              <Download className="h-4 w-4" /> CSV
            </button>
            <button
              onClick={() => setModalZustand('neu')}
              className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-[#0D1B2A] hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" /> Neu anlegen
            </button>
          </div>
        }
      />

      {/* Suche + Filter */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
          <input
            className="w-full rounded-xl border border-white/15 bg-card pl-9 pr-4 py-2.5 text-sm text-ink placeholder:text-faint focus:border-brand focus:outline-none"
            placeholder="Suche in Name, GF, Ansprechpartner, Adresse, E-Mail, Notiz …"
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
          />
          {suche && (
            <button onClick={() => setSuche('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <select className={select} value={filterBundesland} onChange={(e) => setFilterBundesland(e.target.value as PartnerBundesland | 'alle')}>
            <option value="alle">Alle Bundesländer</option>
            {Object.entries(BUNDESLAND_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>

          {bezirke.length > 0 && (
            <select className={select} value={filterBezirk} onChange={(e) => setFilterBezirk(e.target.value)}>
              <option value="">Alle Bezirke</option>
              {bezirke.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          )}

          <select className={select} value={filterP72} onChange={(e) => setFilterP72(e.target.value as 'alle' | 'ja' | 'nein')}>
            <option value="alle">§72 alle</option>
            <option value="ja">§72 ja</option>
            <option value="nein">§72 nein</option>
          </select>

          <select className={select} value={filterKoop} onChange={(e) => setFilterKoop(e.target.value as KooperationsStatus | 'alle')}>
            <option value="alle">Alle Kooperationen</option>
            {(['Offen', 'Kontaktiert', 'Partner', 'Inaktiv'] as KooperationsStatus[]).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Typ-Tabs + Ergebniszähler */}
      <div className="flex gap-1 overflow-x-auto border-b border-white/10 pb-px">
        {TABS.map((tab) => {
          const anzahl = tabZaehler[tab.key] ?? 0;
          const aktiv = tabAktiv === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setTabAktiv(tab.key)}
              className={`shrink-0 rounded-t-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${
                aktiv
                  ? 'border-brand text-brand'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs ${aktiv ? 'text-brand/70' : 'text-faint'}`}>
                ({anzahl})
              </span>
            </button>
          );
        })}
      </div>

      <div className="text-xs text-faint px-1">
        {gefiltert.length} von {partner.length} Einträgen
      </div>

      {/* Tabelle */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <SortTh label="Name"       spalte="name"          aktiv={sortSpalte} richtung={sortRichtung} onSort={onSort} />
                <SortTh label="Typ"        spalte="typ"           aktiv={sortSpalte} richtung={sortRichtung} onSort={onSort} className="hidden sm:table-cell" />
                <SortTh label="Ort"        spalte="ort"           aktiv={sortSpalte} richtung={sortRichtung} onSort={onSort} className="hidden md:table-cell" />
                <th className="px-4 py-3 text-left text-xs font-semibold text-faint uppercase tracking-wide hidden lg:table-cell">Telefon</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-faint uppercase tracking-wide hidden lg:table-cell">GF</th>
                <SortTh label="Status"     spalte="kooperation"   aktiv={sortSpalte} richtung={sortRichtung} onSort={onSort} />
                <SortTh label="Bewertung"  spalte="bewertung"     aktiv={sortSpalte} richtung={sortRichtung} onSort={onSort} className="hidden sm:table-cell" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {gefiltert.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-faint">
                    Keine Partner gefunden.
                  </td>
                </tr>
              ) : (
                gefiltert.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setModalZustand(p)}
                    className="cursor-pointer transition-colors hover:bg-elevated"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{p.firmenname}</div>
                      {p.bezirk && <div className="text-xs text-faint">{p.bezirk}</div>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-muted">{TYP_LABEL[p.typ]}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1 text-muted">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {p.ort ?? BUNDESLAND_LABEL[p.bundesland]}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted">
                      {p.telefon ?? '—'}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-muted truncate max-w-[160px] block">{p.geschaeftsfuehrer ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <StatusBadge label={p.kooperations_status} klasse={KOOP_FARBE[p.kooperations_status]} />
                        <StatusBadge label={p.crm_status} klasse={CRM_FARBE[p.crm_status]} />
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {p.bewertung ? <Sterne wert={p.bewertung} /> : <span className="text-faint text-xs">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalZustand !== null && (
        <PartnerModal
          partner={modalZustand === 'neu' ? null : modalZustand}
          allePartner={partner}
          onClose={() => setModalZustand(null)}
          onSpeichern={speichern}
          onLoeschen={deletePartner}
        />
      )}
    </div>
  );
}
