import { useRef, useState } from 'react';
import { Check, RotateCcw, Trash2, Upload, Moon, Sun } from 'lucide-react';
import { Card, SeitenKopf } from '@/components/ui';
import {
  repository,
  UNTERNEHMEN_DEFAULTS,
} from '@/services/localStorageRepository';
import type { Unternehmen } from '@/domain/types';

// Einstellungen — Stammdaten des eigenen Unternehmens (Briefkopf, Zessionar,
// Bankverbindung, Logo). Persistenz über das UnternehmenRepository; die
// Dokument-Templates lesen die Daten über getUnternehmen().
export default function Einstellungen() {
  const [u, setU] = useState<Unternehmen>(() => repository.unternehmen.get());
  const [gespeichert, setGespeichert] = useState(false);
  const dateiInput = useRef<HTMLInputElement>(null);

  // Theme-Zustand — synchron aus dem <html>-Element lesen.
  const [lightMode, setLightMode] = useState(
    () => document.documentElement.classList.contains('light'),
  );

  function themeUmschalten() {
    const naechstes = !lightMode;
    setLightMode(naechstes);
    if (naechstes) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  }

  function setFeld<K extends keyof Unternehmen>(key: K, wert: Unternehmen[K]) {
    setU((prev) => ({ ...prev, [key]: wert }));
    setGespeichert(false);
  }

  function setBankFeld<K extends keyof Unternehmen['bank']>(
    key: K,
    wert: Unternehmen['bank'][K],
  ) {
    setU((prev) => ({ ...prev, bank: { ...prev.bank, [key]: wert } }));
    setGespeichert(false);
  }

  function speichern() {
    repository.unternehmen.update(u);
    setGespeichert(true);
  }

  function zuruecksetzen() {
    setU(UNTERNEHMEN_DEFAULTS);
    repository.unternehmen.update(UNTERNEHMEN_DEFAULTS);
    setGespeichert(true);
  }

  // Logo als Daten-URL einlesen (bleibt komplett im Browser/LocalStorage).
  function logoWaehlen(datei: File | undefined) {
    if (!datei) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setFeld('logo_data_url', reader.result);
    };
    reader.readAsDataURL(datei);
  }

  return (
    <div>
      <SeitenKopf
        titel="Einstellungen"
        untertitel="Unternehmens-Stammdaten — werden in allen generierten Dokumenten verwendet"
        aktion={
          <div className="flex items-center gap-3">
            {gespeichert && (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-brand">
                <Check className="h-4 w-4" /> Gespeichert
              </span>
            )}
            <button
              onClick={zuruecksetzen}
              title="Auf Standardwerte zurücksetzen"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-elevated px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-ink"
            >
              <RotateCcw className="h-4 w-4" /> Zurücksetzen
            </button>
            <button
              onClick={speichern}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-[#0D1B2A] transition-opacity hover:opacity-90"
            >
              <Check className="h-4 w-4" /> Speichern
            </button>
          </div>
        }
      />

      {/* Darstellung */}
      <Card className="mb-6">
        <Abschnitt titel="Darstellung" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {lightMode ? (
              <Sun className="h-5 w-5 text-warn" />
            ) : (
              <Moon className="h-5 w-5 text-brand" />
            )}
            <div>
              <p className="text-sm font-semibold text-ink">
                {lightMode ? 'Light Mode' : 'Dark Mode'}
              </p>
              <p className="text-xs text-faint">
                {lightMode
                  ? 'Helles Design — weißer Hintergrund, dunkle Schrift'
                  : 'Dunkles Design — Standard'}
              </p>
            </div>
          </div>
          {/* Toggle-Switch */}
          <button
            role="switch"
            aria-checked={lightMode}
            onClick={themeUmschalten}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              lightMode ? 'bg-brand' : 'bg-elevated'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                lightMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Firma & Anschrift */}
        <Card>
          <Abschnitt titel="Firma & Anschrift" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Feld
                label="Firmenname"
                wert={u.firmenname}
                onChange={(v) => setFeld('firmenname', v)}
              />
            </div>
            <div className="sm:col-span-2">
              <Feld label="Straße & Nr." wert={u.strasse} onChange={(v) => setFeld('strasse', v)} />
            </div>
            <Feld label="PLZ" wert={u.plz} onChange={(v) => setFeld('plz', v)} />
            <Feld label="Ort" wert={u.ort} onChange={(v) => setFeld('ort', v)} />
          </div>
        </Card>

        {/* Kontakt */}
        <Card>
          <Abschnitt titel="Kontakt" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Feld label="Telefon" wert={u.telefon} onChange={(v) => setFeld('telefon', v)} />
            <Feld
              label="E-Mail"
              type="email"
              wert={u.email}
              onChange={(v) => setFeld('email', v)}
            />
            <div className="sm:col-span-2">
              <Feld label="Website" wert={u.website} onChange={(v) => setFeld('website', v)} />
            </div>
          </div>
        </Card>

        {/* Rechtliches */}
        <Card>
          <Abschnitt titel="Rechtliches" />
          <div className="grid grid-cols-1 gap-4">
            <Feld
              label="Geschäftsführer"
              wert={u.geschaeftsfuehrer}
              onChange={(v) => setFeld('geschaeftsfuehrer', v)}
            />
            <Feld
              label="Handelsregister (HRB)"
              wert={u.handelsregister}
              onChange={(v) => setFeld('handelsregister', v)}
              placeholder="z. B. HRB 123456 B, Amtsgericht Charlottenburg"
            />
            <Feld
              label="USt-IdNr."
              wert={u.ust_id}
              onChange={(v) => setFeld('ust_id', v)}
              placeholder="z. B. DE123456789"
            />
          </div>
        </Card>

        {/* Bankverbindung */}
        <Card>
          <Abschnitt titel="Bankverbindung" />
          <div className="grid grid-cols-1 gap-4">
            <Feld
              label="Bank"
              wert={u.bank.bank_name}
              onChange={(v) => setBankFeld('bank_name', v)}
            />
            <Feld label="IBAN" wert={u.bank.iban} onChange={(v) => setBankFeld('iban', v)} />
            <Feld label="BIC" wert={u.bank.bic} onChange={(v) => setBankFeld('bic', v)} />
          </div>
        </Card>

        {/* Logo */}
        <Card className="lg:col-span-2">
          <Abschnitt titel="Logo" />
          <div className="flex flex-wrap items-center gap-5">
            {u.logo_data_url ? (
              <img
                src={u.logo_data_url}
                alt="Firmenlogo"
                className="h-20 max-w-[240px] rounded-xl border border-white/10 bg-white object-contain p-2"
              />
            ) : (
              <div className="flex h-20 w-40 items-center justify-center rounded-xl border border-dashed border-white/20 text-xs text-faint">
                Kein Logo
              </div>
            )}
            <input
              ref={dateiInput}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              className="hidden"
              onChange={(e) => logoWaehlen(e.target.files?.[0])}
            />
            <button
              onClick={() => dateiInput.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-elevated px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-hover"
            >
              <Upload className="h-4 w-4" /> Logo hochladen
            </button>
            {u.logo_data_url && (
              <button
                onClick={() => setFeld('logo_data_url', '')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-elevated px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-red-500/15 hover:text-danger"
              >
                <Trash2 className="h-4 w-4" /> Entfernen
              </button>
            )}
            <p className="w-full text-xs text-faint">
              PNG, JPG oder SVG — wird lokal gespeichert und im Briefkopf der Dokumente verwendet.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Abschnitt({ titel }: { titel: string }) {
  return (
    <div className="mb-4 text-xs font-bold uppercase tracking-wider text-faint">{titel}</div>
  );
}

function Feld({
  label,
  wert,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  wert: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>
      <input
        type={type}
        value={wert}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-elevated px-3 py-2.5 text-sm text-ink outline-none placeholder:text-faint focus:border-brand"
      />
    </label>
  );
}
