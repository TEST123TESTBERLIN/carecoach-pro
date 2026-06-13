import { useState, useMemo, type ReactNode, type ChangeEvent } from 'react';
import { Modal } from './ui';
import { KUNDEN_STATUS } from '@/lib/kundenStatus';
import type { Klient, KlientEingabe, Pflegegrad } from '@/types';
import { KASSEN } from '@/domain/stammdatenSeed';
import { ladePartner } from '@/services/partnerRepository';

// Leeres Formular als Ausgangszustand beim Anlegen.
const LEER: KlientEingabe = {
  vorname: '',
  nachname: '',
  strasse: '',
  plz: '',
  ort: '',
  pflegegrad: 1,
  krankenkasse: '',
  versicherungsnummer: '',
  krankenkasse_ansprechpartner: '',
  telefon: '',
  email: '',
  angehoeriger: { name: '', telefon: '', email: '' },
  ambulante_pflege: { dienst: '', kontaktperson: '', telefon: '' },
  status: 'neu',
  personen_mit_pflegegrad: 1,
};

// Wandelt einen vorhandenen Kunden in Formulardaten (ohne id) um.
function ausKlient(k: Klient): KlientEingabe {
  const { id: _id, ...rest } = k;
  return { ...LEER, ...rest };
}

interface Props {
  // Wenn gesetzt → Bearbeiten-Modus, sonst Anlegen.
  initial?: Klient;
  onAbbrechen: () => void;
  onSpeichern: (daten: KlientEingabe) => void;
}

export default function KundeForm({ initial, onAbbrechen, onSpeichern }: Props) {
  const [daten, setDaten] = useState<KlientEingabe>(initial ? ausKlient(initial) : LEER);
  const [fehler, setFehler] = useState<Record<string, string>>({});

  // Pflegedienst-Namen aus localStorage — einmalig für die Type-ahead-Vorschläge.
  const pflegedienste = useMemo(
    () => ladePartner().filter((p) => p.typ === 'pflegedienst').map((p) => p.firmenname),
    [],
  );

  // Setzt ein Top-Level-Feld.
  function setFeld<K extends keyof KlientEingabe>(feld: K, wert: KlientEingabe[K]) {
    setDaten((d) => ({ ...d, [feld]: wert }));
  }

  // Setzt ein Feld innerhalb von angehoeriger / ambulante_pflege.
  function setAngehoeriger(feld: keyof KlientEingabe['angehoeriger'], wert: string) {
    setDaten((d) => ({ ...d, angehoeriger: { ...d.angehoeriger, [feld]: wert } }));
  }
  function setPflege(feld: keyof KlientEingabe['ambulante_pflege'], wert: string) {
    setDaten((d) => ({ ...d, ambulante_pflege: { ...d.ambulante_pflege, [feld]: wert } }));
  }

  // Pflichtfelder und einfache E-Mail-Prüfung.
  function validieren(): boolean {
    const neu: Record<string, string> = {};
    if (!daten.vorname.trim()) neu.vorname = 'Pflichtfeld';
    if (!daten.nachname.trim()) neu.nachname = 'Pflichtfeld';
    if (!daten.versicherungsnummer.trim()) neu.versicherungsnummer = 'Pflichtfeld';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (daten.email && !emailRegex.test(daten.email)) neu.email = 'Ungültige E-Mail';
    setFehler(neu);
    return Object.keys(neu).length === 0;
  }

  function absenden() {
    if (!validieren()) return;
    onSpeichern({
      ...daten,
      vorname: daten.vorname.trim(),
      nachname: daten.nachname.trim(),
    });
  }

  return (
    <Modal
      titel={initial ? 'Kunde bearbeiten' : 'Neuer Kunde'}
      onClose={onAbbrechen}
      footer={
        <>
          <button
            onClick={onAbbrechen}
            className="rounded-xl bg-elevated px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-ink"
          >
            Abbrechen
          </button>
          <button
            onClick={absenden}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-[#0D1B2A] transition-opacity hover:opacity-90"
          >
            Speichern
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Person */}
        <Abschnitt titel="Person">
          <Feld label="Vorname" fehler={fehler.vorname}>
            <Input wert={daten.vorname} onChange={(v) => setFeld('vorname', v)} />
          </Feld>
          <Feld label="Nachname" fehler={fehler.nachname}>
            <Input wert={daten.nachname} onChange={(v) => setFeld('nachname', v)} />
          </Feld>
        </Abschnitt>

        {/* Adresse */}
        <Abschnitt titel="Adresse">
          <Feld label="Straße & Nr." voll>
            <Input wert={daten.strasse} onChange={(v) => setFeld('strasse', v)} />
          </Feld>
          <Feld label="PLZ">
            <Input wert={daten.plz} onChange={(v) => setFeld('plz', v)} inputMode="numeric" />
          </Feld>
          <Feld label="Ort">
            <Input wert={daten.ort} onChange={(v) => setFeld('ort', v)} />
          </Feld>
        </Abschnitt>

        {/* Pflege & Kasse */}
        <Abschnitt titel="Pflege & Krankenkasse">
          <Feld label="Pflegegrad">
            <select
              value={daten.pflegegrad}
              onChange={(e) => setFeld('pflegegrad', Number(e.target.value) as Pflegegrad)}
              className={selectKlasse}
            >
              {[1, 2, 3, 4, 5].map((pg) => (
                <option key={pg} value={pg} className="bg-elevated">
                  Pflegegrad {pg}
                </option>
              ))}
            </select>
          </Feld>
          <Feld label="Status">
            <select
              value={daten.status}
              onChange={(e) => setFeld('status', e.target.value as KlientEingabe['status'])}
              className={selectKlasse}
            >
              {KUNDEN_STATUS.map((s) => (
                <option key={s.wert} value={s.wert} className="bg-elevated">
                  {s.label}
                </option>
              ))}
            </select>
          </Feld>
          <Feld label="Krankenkasse">
            <>
              <input
                list="kasse-optionen"
                value={daten.krankenkasse}
                onChange={(e) => setFeld('krankenkasse', e.target.value)}
                placeholder="Suchen oder manuell eingeben"
                className={inputKlasse}
              />
              <datalist id="kasse-optionen">
                {KASSEN.filter((k) => k.aktiv).map((k) => (
                  <option key={k.id} value={k.name} />
                ))}
              </datalist>
            </>
          </Feld>
          <Feld label="Versicherungsnummer" fehler={fehler.versicherungsnummer}>
            <Input wert={daten.versicherungsnummer} onChange={(v) => setFeld('versicherungsnummer', v)} />
          </Feld>
          <Feld label="Ansprechpartner Krankenkasse">
            <Input
              wert={daten.krankenkasse_ansprechpartner}
              onChange={(v) => setFeld('krankenkasse_ansprechpartner', v)}
            />
          </Feld>
        </Abschnitt>

        {/* Kontakt */}
        <Abschnitt titel="Kontakt">
          <Feld label="Telefon">
            <Input wert={daten.telefon} onChange={(v) => setFeld('telefon', v)} inputMode="tel" />
          </Feld>
          <Feld label="E-Mail" fehler={fehler.email}>
            <Input wert={daten.email} onChange={(v) => setFeld('email', v)} type="email" />
          </Feld>
        </Abschnitt>

        {/* Angehörige */}
        <Abschnitt titel="Angehörige / Kontaktperson">
          <Feld label="Name" voll>
            <Input wert={daten.angehoeriger.name} onChange={(v) => setAngehoeriger('name', v)} />
          </Feld>
          <Feld label="Telefon">
            <Input
              wert={daten.angehoeriger.telefon}
              onChange={(v) => setAngehoeriger('telefon', v)}
              inputMode="tel"
            />
          </Feld>
          <Feld label="E-Mail">
            <Input
              wert={daten.angehoeriger.email}
              onChange={(v) => setAngehoeriger('email', v)}
              type="email"
            />
          </Feld>
        </Abschnitt>

        {/* Ambulante Pflege */}
        <Abschnitt titel="Ambulante Pflege">
          <Feld label="Pflegedienst" voll>
            <>
              <input
                list="pflegedienst-optionen"
                value={daten.ambulante_pflege.dienst}
                onChange={(e) => setPflege('dienst', e.target.value)}
                placeholder="Suchen oder manuell eingeben"
                className={inputKlasse}
              />
              <datalist id="pflegedienst-optionen">
                {pflegedienste.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </>
          </Feld>
          <Feld label="Kontaktperson">
            <Input
              wert={daten.ambulante_pflege.kontaktperson}
              onChange={(v) => setPflege('kontaktperson', v)}
            />
          </Feld>
          <Feld label="Telefon">
            <Input
              wert={daten.ambulante_pflege.telefon}
              onChange={(v) => setPflege('telefon', v)}
              inputMode="tel"
            />
          </Feld>
        </Abschnitt>
      </div>
    </Modal>
  );
}

// --- Layout-Bausteine des Formulars ---

function Abschnitt({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-faint">
        {titel}
      </legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Feld({
  label,
  children,
  fehler,
  voll,
}: {
  label: string;
  children: ReactNode;
  fehler?: string;
  voll?: boolean;
}) {
  return (
    <div className={voll ? 'sm:col-span-2' : ''}>
      <label className="mb-1.5 block text-sm font-medium text-muted">{label}</label>
      {children}
      {fehler && <p className="mt-1 text-xs text-danger">{fehler}</p>}
    </div>
  );
}

const inputKlasse =
  'w-full rounded-xl border border-white/10 bg-elevated px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-brand';
const selectKlasse = inputKlasse;

function Input({
  wert,
  onChange,
  type = 'text',
  inputMode,
}: {
  wert: string;
  onChange: (wert: string) => void;
  type?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
}) {
  return (
    <input
      type={type}
      inputMode={inputMode}
      value={wert}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      className={inputKlasse}
    />
  );
}
