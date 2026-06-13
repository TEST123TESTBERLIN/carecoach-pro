// Fotoverwaltung je Kunde: Upload, Galerie-Ansicht und Pflichtfotos-Checkliste.

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ChangeEvent,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Camera,
  Upload,
  X,
  CheckCircle2,
  XCircle,
  Trash2,
  ImageOff,
  ChevronDown,
  SwitchCamera,
} from 'lucide-react';
import { SeitenKopf, Card } from '@/components/ui';
import { useKunden } from '@/context/KundenContext';
import { MASSNAHMEN_KATALOG } from '@/domain/seed';
import type { FotoKategorie, FotoMetadaten } from '@/domain/types';
import {
  fotoSpeichern,
  fotosNachKunde,
  fotoLoeschen,
  fotoObjectUrl,
} from '@/services/fotoDB';

// ---------------------------------------------------------------------------
// Konstanten
// ---------------------------------------------------------------------------

const KATEGORIEN: { wert: FotoKategorie; label: string }[] = [
  { wert: 'bad', label: 'Bad' },
  { wert: 'wc', label: 'WC' },
  { wert: 'dusche', label: 'Dusche' },
  { wert: 'badewanne', label: 'Badewanne' },
  { wert: 'flur', label: 'Flur' },
  { wert: 'treppe', label: 'Treppe' },
  { wert: 'eingang', label: 'Eingang' },
  { wert: 'schlafzimmer', label: 'Schlafzimmer' },
  { wert: 'kueche', label: 'Küche' },
  { wert: 'sonstiges', label: 'Sonstiges' },
];

// Nur Katalogeinträge mit definierten Pflichtfotos für die Checkliste.
const MASSNAHMEN_MIT_PFLICHTFOTOS = MASSNAHMEN_KATALOG.filter(
  (m) => m.aktiv && m.pflichtfotos && m.pflichtfotos.length > 0,
);

// ---------------------------------------------------------------------------
// Thumbnail-Kachel — lädt Blob-URL asynchron aus IndexedDB
// ---------------------------------------------------------------------------

function FotoKachel({
  meta,
  onLoeschen,
  onClick,
}: {
  meta: FotoMetadaten;
  onLoeschen: (id: string) => void;
  onClick: (meta: FotoMetadaten) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    let aktiv = true;
    fotoObjectUrl(meta.id).then((u) => {
      if (aktiv && u) {
        urlRef.current = u;
        setUrl(u);
      }
    });
    return () => {
      aktiv = false;
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [meta.id]);

  const vonLabel = meta.vorherNachher === 'vorher' ? 'Vorher' : 'Nachher';
  const vonFarbe =
    meta.vorherNachher === 'vorher'
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';

  return (
    <div className="group relative rounded-xl overflow-hidden border border-white/10 bg-[#1B3050] aspect-square cursor-pointer">
      {url ? (
        <img
          src={url}
          alt={meta.beschreibung || 'Foto'}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          onClick={() => onClick(meta)}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-[#3A5070]"
          onClick={() => onClick(meta)}
        >
          <ImageOff className="w-8 h-8" />
        </div>
      )}

      {/* Badges */}
      <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${vonFarbe}`}
        >
          {vonLabel}
        </span>
      </div>

      {/* Löschen-Button (sichtbar bei Hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onLoeschen(meta.id);
        }}
        className="absolute top-2 right-2 p-1 rounded-lg bg-red-900/80 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-800"
        title="Foto löschen"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {/* Beschreibung */}
      {meta.beschreibung && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
          <p className="text-[11px] text-white/90 truncate">{meta.beschreibung}</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pflichtfotos-Checkliste
// ---------------------------------------------------------------------------

function PflichtfotosCheckliste({
  massnahmeCode,
  fotos,
}: {
  massnahmeCode: string;
  fotos: FotoMetadaten[];
}) {
  const massnahme = MASSNAHMEN_KATALOG.find((m) => m.code === massnahmeCode);
  if (!massnahme?.pflichtfotos?.length) return null;

  const vorherFotos = fotos.filter(
    (f) => f.massnahmeCode === massnahmeCode && f.vorherNachher === 'vorher',
  );

  const erledigte = new Set(vorherFotos.map((f) => f.beschreibung));
  const alle = massnahme.pflichtfotos.length;
  const erledigt = massnahme.pflichtfotos.filter((p) => erledigte.has(p)).length;
  const vollstaendig = erledigt === alle;

  return (
    <div
      className={`rounded-xl border p-4 ${
        vollstaendig
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-amber-500/10 border-amber-500/30'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B7F90]">
            Pflichtfotos
          </span>
          <p className="text-sm font-semibold text-[#F0EDE8] mt-0.5">
            {massnahme.bezeichnung}
          </p>
        </div>
        <span
          className={`text-sm font-bold px-2.5 py-1 rounded-full ${
            vollstaendig
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/20 text-amber-400'
          }`}
        >
          {erledigt}/{alle}
        </span>
      </div>
      <ul className="space-y-1.5">
        {massnahme.pflichtfotos.map((pf) => {
          const ok = erledigte.has(pf);
          return (
            <li key={pf} className="flex items-center gap-2 text-sm">
              {ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className={ok ? 'text-[#A8B4C0]' : 'text-[#F0EDE8]'}>{pf}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upload-Modal
// ---------------------------------------------------------------------------

interface UploadFormDaten {
  kategorie: FotoKategorie;
  massnahmeCode: string;
  pflichtfotoLabel: string;
  vorherNachher: 'vorher' | 'nachher';
  beschreibung: string;
}

function UploadModal({
  kundeId,
  onGespeichert,
  onSchliessen,
}: {
  kundeId: string;
  onGespeichert: (meta: FotoMetadaten) => void;
  onSchliessen: () => void;
}) {
  const [datei, setDatei] = useState<File | null>(null);
  const [vorschauUrl, setVorschauUrl] = useState<string | null>(null);
  const [speichert, setSpeichert] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [form, setForm] = useState<UploadFormDaten>({
    kategorie: 'bad',
    massnahmeCode: '',
    pflichtfotoLabel: '',
    vorherNachher: 'vorher',
    beschreibung: '',
  });
  const dateiInputRef = useRef<HTMLInputElement>(null);
  const kameraInputRef = useRef<HTMLInputElement>(null);
  const vorschauRef = useRef<string | null>(null);

  // Vorschau-URL aufräumen beim Schließen.
  useEffect(() => {
    return () => {
      if (vorschauRef.current) URL.revokeObjectURL(vorschauRef.current);
    };
  }, []);

  const dateiWaehlen = useCallback((f: File) => {
    if (vorschauRef.current) URL.revokeObjectURL(vorschauRef.current);
    const url = URL.createObjectURL(f);
    vorschauRef.current = url;
    setDatei(f);
    setVorschauUrl(url);
    setFehler(null);
  }, []);

  const handleDateiInput = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) dateiWaehlen(f);
    e.target.value = '';
  };

  const aktuellesMassnahme = MASSNAHMEN_KATALOG.find(
    (m) => m.code === form.massnahmeCode,
  );
  const pflichtfotos = aktuellesMassnahme?.pflichtfotos ?? [];

  const setzeFormFeld = <K extends keyof UploadFormDaten>(
    feld: K,
    wert: UploadFormDaten[K],
  ) => {
    setForm((prev) => {
      const aktualisiert = { ...prev, [feld]: wert };
      // Pflichtfoto-Auswahl zurücksetzen wenn Maßnahme wechselt.
      if (feld === 'massnahmeCode') {
        aktualisiert.pflichtfotoLabel = '';
        aktualisiert.beschreibung = '';
      }
      // Beschreibung aus Pflichtfoto-Label vorausfüllen.
      if (feld === 'pflichtfotoLabel' && typeof wert === 'string') {
        aktualisiert.beschreibung = wert;
      }
      return aktualisiert;
    });
  };

  const speichern = async () => {
    if (!datei) {
      setFehler('Bitte ein Foto auswählen.');
      return;
    }
    setSpeichert(true);
    setFehler(null);
    try {
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `f_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
      const meta = await fotoSpeichern(
        {
          id,
          kundeId,
          kategorie: form.kategorie,
          massnahmeCode: form.massnahmeCode || undefined,
          vorherNachher: form.vorherNachher,
          zeitstempel: new Date().toISOString(),
          beschreibung: form.beschreibung,
        },
        datei,
      );
      onGespeichert(meta);
    } catch {
      setFehler('Speichern fehlgeschlagen. Bitte erneut versuchen.');
    } finally {
      setSpeichert(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#162840] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-base font-bold text-[#F0EDE8]">Foto hochladen</h2>
          <button
            onClick={onSchliessen}
            className="p-1.5 rounded-lg text-[#6B7F90] hover:bg-[#1B3050] hover:text-[#F0EDE8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Datei / Kamera */}
          <div>
            <div className="flex gap-3">
              <button
                onClick={() => dateiInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1B3050] border border-white/10 text-sm text-[#A8B4C0] hover:border-brand/50 hover:text-[#F0EDE8] transition-colors"
              >
                <Upload className="w-4 h-4" />
                Datei wählen
              </button>
              <button
                onClick={() => kameraInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1B3050] border border-white/10 text-sm text-[#A8B4C0] hover:border-brand/50 hover:text-[#F0EDE8] transition-colors"
              >
                <Camera className="w-4 h-4" />
                Kamera
              </button>
            </div>
            {/* Versteckte Inputs */}
            <input
              ref={dateiInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleDateiInput}
            />
            <input
              ref={kameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleDateiInput}
            />
          </div>

          {/* Vorschau */}
          {vorschauUrl && (
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0D1B2A] aspect-video">
              <img
                src={vorschauUrl}
                alt="Vorschau"
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => {
                  if (vorschauRef.current) URL.revokeObjectURL(vorschauRef.current);
                  vorschauRef.current = null;
                  setDatei(null);
                  setVorschauUrl(null);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Formular */}
          <div className="grid grid-cols-2 gap-3">
            {/* Kategorie */}
            <div>
              <label className="block text-xs font-medium text-[#6B7F90] mb-1.5">
                Kategorie
              </label>
              <div className="relative">
                <select
                  value={form.kategorie}
                  onChange={(e) =>
                    setzeFormFeld('kategorie', e.target.value as FotoKategorie)
                  }
                  className="w-full appearance-none bg-[#1B3050] border border-white/10 text-[#F0EDE8] text-sm rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:border-brand/50"
                >
                  {KATEGORIEN.map((k) => (
                    <option key={k.wert} value={k.wert}>
                      {k.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7F90] pointer-events-none" />
              </div>
            </div>

            {/* Vorher / Nachher */}
            <div>
              <label className="block text-xs font-medium text-[#6B7F90] mb-1.5">
                Zeitpunkt
              </label>
              <div className="flex rounded-xl border border-white/10 overflow-hidden bg-[#1B3050]">
                {(['vorher', 'nachher'] as const).map((wert) => (
                  <button
                    key={wert}
                    onClick={() => setzeFormFeld('vorherNachher', wert)}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                      form.vorherNachher === wert
                        ? wert === 'vorher'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                        : 'text-[#6B7F90] hover:text-[#A8B4C0]'
                    }`}
                  >
                    {wert === 'vorher' ? 'Vorher' : 'Nachher'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Maßnahme */}
          <div>
            <label className="block text-xs font-medium text-[#6B7F90] mb-1.5">
              Maßnahme (optional)
            </label>
            <div className="relative">
              <select
                value={form.massnahmeCode}
                onChange={(e) => setzeFormFeld('massnahmeCode', e.target.value)}
                className="w-full appearance-none bg-[#1B3050] border border-white/10 text-[#F0EDE8] text-sm rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:border-brand/50"
              >
                <option value="">— keine Zuordnung —</option>
                {MASSNAHMEN_MIT_PFLICHTFOTOS.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.bezeichnung}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7F90] pointer-events-none" />
            </div>
          </div>

          {/* Pflichtfoto-Slot (nur wenn Maßnahme mit Pflichtfotos gewählt) */}
          {pflichtfotos.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-[#6B7F90] mb-1.5">
                Pflichtfoto-Slot (füllt Beschreibung vor)
              </label>
              <div className="relative">
                <select
                  value={form.pflichtfotoLabel}
                  onChange={(e) =>
                    setzeFormFeld('pflichtfotoLabel', e.target.value)
                  }
                  className="w-full appearance-none bg-[#1B3050] border border-amber-500/30 text-[#F0EDE8] text-sm rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:border-amber-500/60"
                >
                  <option value="">— keines auswählen —</option>
                  {pflichtfotos.map((pf) => (
                    <option key={pf} value={pf}>
                      {pf}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7F90] pointer-events-none" />
              </div>
            </div>
          )}

          {/* Beschreibung */}
          <div>
            <label className="block text-xs font-medium text-[#6B7F90] mb-1.5">
              Beschreibung
            </label>
            <input
              type="text"
              value={form.beschreibung}
              onChange={(e) => setzeFormFeld('beschreibung', e.target.value)}
              placeholder="z. B. Badewanne frontal, Ist-Zustand"
              className="w-full bg-[#1B3050] border border-white/10 text-[#F0EDE8] text-sm rounded-xl px-3 py-2.5 placeholder-[#3A5070] focus:outline-none focus:border-brand/50"
            />
          </div>

          {fehler && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
              {fehler}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-white/10">
          <button
            onClick={onSchliessen}
            className="flex-1 py-2.5 rounded-xl bg-[#1B3050] border border-white/10 text-sm text-[#A8B4C0] hover:text-[#F0EDE8] transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={speichern}
            disabled={!datei || speichert}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {speichert ? 'Speichert …' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vollbild-Vorschau eines gespeicherten Fotos
// ---------------------------------------------------------------------------

function FotoVollbild({
  meta,
  onSchliessen,
}: {
  meta: FotoMetadaten;
  onSchliessen: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    let aktiv = true;
    fotoObjectUrl(meta.id).then((u) => {
      if (aktiv && u) {
        urlRef.current = u;
        setUrl(u);
      }
    });
    return () => {
      aktiv = false;
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [meta.id]);

  const kb = Math.round(meta.groesse_bytes / 1024);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      onClick={onSchliessen}
    >
      <div
        className="flex items-start justify-between p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="text-sm font-semibold text-white">
            {meta.beschreibung || 'Foto'}
          </p>
          <p className="text-xs text-white/50 mt-0.5">
            {new Date(meta.zeitstempel).toLocaleString('de-DE')} · {kb} KB
            {meta.breite_px && meta.hoehe_px
              ? ` · ${meta.breite_px}×${meta.hoehe_px}`
              : ''}
          </p>
        </div>
        <button
          onClick={onSchliessen}
          className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        {url ? (
          <img
            src={url}
            alt={meta.beschreibung || 'Foto'}
            className="max-w-full max-h-full object-contain rounded-xl"
          />
        ) : (
          <div className="text-white/30">
            <ImageOff className="w-12 h-12 mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hauptseite
// ---------------------------------------------------------------------------

export default function Fotos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { kunden } = useKunden();

  const kundeId = searchParams.get('kunde') ?? '';
  const setKundeId = (id: string) =>
    setSearchParams(id ? { kunde: id } : {}, { replace: true });

  const [fotos, setFotos] = useState<FotoMetadaten[]>([]);
  const [laed, setLaed] = useState(false);
  const [uploadOffen, setUploadOffen] = useState(false);
  const [vollbildFoto, setVollbildFoto] = useState<FotoMetadaten | null>(null);

  // Filterstate
  const [filterKategorie, setFilterKategorie] = useState<FotoKategorie | ''>('');
  const [filterMassnahme, setFilterMassnahme] = useState('');
  const [filterVoN, setFilterVoN] = useState<'alle' | 'vorher' | 'nachher'>('alle');

  // Maßnahmen-Auswahl für die Checkliste
  const [checklisteMassnahmen, setChecklisteMassnahmen] = useState<string[]>([]);

  const ladeFotos = useCallback(async (kid: string) => {
    if (!kid) {
      setFotos([]);
      return;
    }
    setLaed(true);
    try {
      const ergebnis = await fotosNachKunde(kid);
      setFotos(ergebnis);
    } catch {
      // IndexedDB-Fehler ignorieren, leeres Array anzeigen
      setFotos([]);
    } finally {
      setLaed(false);
    }
  }, []);

  useEffect(() => {
    ladeFotos(kundeId);
  }, [kundeId, ladeFotos]);

  const handleGespeichert = (meta: FotoMetadaten) => {
    setFotos((prev) => [meta, ...prev]);
    setUploadOffen(false);
  };

  const handleLoeschen = async (id: string) => {
    await fotoLoeschen(id);
    setFotos((prev) => prev.filter((f) => f.id !== id));
  };

  // Gefilterte Fotos
  const gefilterteFotos = fotos.filter((f) => {
    if (filterKategorie && f.kategorie !== filterKategorie) return false;
    if (filterMassnahme && f.massnahmeCode !== filterMassnahme) return false;
    if (filterVoN !== 'alle' && f.vorherNachher !== filterVoN) return false;
    return true;
  });

  // Maßnahmen, für die bereits Fotos vorhanden sind (als Filteroptionen).
  const vorhandeneMassnahmen = [
    ...new Set(fotos.map((f) => f.massnahmeCode).filter(Boolean) as string[]),
  ];

  const aktuellerKunde = kunden.find((k) => k.id === kundeId);

  const checklisteMassnahmenToggle = (code: string) =>
    setChecklisteMassnahmen((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SeitenKopf
          titel="Fotoverwaltung"
          untertitel="Ist-Zustand und Nachweise je Kunde — Blobs in IndexedDB"
        />
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => kundeId && setUploadOffen(true)}
            disabled={!kundeId}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            Foto hochladen
          </button>
        </div>
      </div>

      {/* Kunde wählen */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <label className="block text-xs font-medium text-[#6B7F90] mb-1.5">
              Kunde auswählen
            </label>
            <div className="relative">
              <select
                value={kundeId}
                onChange={(e) => {
                  setKundeId(e.target.value);
                  setFilterKategorie('');
                  setFilterMassnahme('');
                  setFilterVoN('alle');
                  setChecklisteMassnahmen([]);
                }}
                className="w-full appearance-none bg-[#1B3050] border border-white/10 text-[#F0EDE8] text-sm rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:border-brand/50"
              >
                <option value="">— Kunde wählen —</option>
                {kunden.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.vorname} {k.nachname} · PG {k.pflegegrad} · {k.ort}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7F90] pointer-events-none" />
            </div>
          </div>
          {aktuellerKunde && (
            <div className="text-sm text-[#A8B4C0] shrink-0">
              <span className="text-[#F0EDE8] font-semibold">
                {fotos.length}
              </span>{' '}
              Foto{fotos.length !== 1 ? 's' : ''} gespeichert
            </div>
          )}
        </div>
      </Card>

      {kundeId && (
        <>
          {/* Filter + Checklisten-Auswahl */}
          <Card>
            <div className="space-y-4">
              {/* Filterzeile */}
              <div className="flex flex-wrap gap-3">
                {/* Kategorie-Filter */}
                <div className="relative">
                  <select
                    value={filterKategorie}
                    onChange={(e) =>
                      setFilterKategorie(e.target.value as FotoKategorie | '')
                    }
                    className="appearance-none bg-[#1B3050] border border-white/10 text-[#A8B4C0] text-sm rounded-xl px-3 py-2 pr-7 focus:outline-none focus:border-brand/50"
                  >
                    <option value="">Alle Kategorien</option>
                    {KATEGORIEN.map((k) => (
                      <option key={k.wert} value={k.wert}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7F90] pointer-events-none" />
                </div>

                {/* Maßnahmen-Filter (nur vorhandene) */}
                {vorhandeneMassnahmen.length > 0 && (
                  <div className="relative">
                    <select
                      value={filterMassnahme}
                      onChange={(e) => setFilterMassnahme(e.target.value)}
                      className="appearance-none bg-[#1B3050] border border-white/10 text-[#A8B4C0] text-sm rounded-xl px-3 py-2 pr-7 focus:outline-none focus:border-brand/50"
                    >
                      <option value="">Alle Maßnahmen</option>
                      {vorhandeneMassnahmen.map((code) => {
                        const m = MASSNAHMEN_KATALOG.find((x) => x.code === code);
                        return (
                          <option key={code} value={code}>
                            {m?.bezeichnung ?? code}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7F90] pointer-events-none" />
                  </div>
                )}

                {/* Vorher/Nachher-Filter */}
                <div className="flex rounded-xl border border-white/10 overflow-hidden bg-[#1B3050]">
                  {(
                    [
                      { wert: 'alle', label: 'Alle' },
                      { wert: 'vorher', label: 'Vorher' },
                      { wert: 'nachher', label: 'Nachher' },
                    ] as { wert: typeof filterVoN; label: string }[]
                  ).map(({ wert, label }) => (
                    <button
                      key={wert}
                      onClick={() => setFilterVoN(wert)}
                      className={`px-3 py-2 text-sm transition-colors ${
                        filterVoN === wert
                          ? 'bg-brand/20 text-brand font-medium'
                          : 'text-[#6B7F90] hover:text-[#A8B4C0]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checklisten-Maßnahmen-Auswahl */}
              <div>
                <p className="text-xs font-medium text-[#6B7F90] mb-2">
                  Pflichtfotos-Checkliste für Maßnahmen:
                </p>
                <div className="flex flex-wrap gap-2">
                  {MASSNAHMEN_MIT_PFLICHTFOTOS.map((m) => {
                    const aktiv = checklisteMassnahmen.includes(m.code);
                    return (
                      <button
                        key={m.code}
                        onClick={() => checklisteMassnahmenToggle(m.code)}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                          aktiv
                            ? 'bg-brand/20 text-brand border-brand/40'
                            : 'bg-[#1B3050] text-[#6B7F90] border-white/10 hover:border-white/30 hover:text-[#A8B4C0]'
                        }`}
                      >
                        {m.bezeichnung}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Pflichtfotos-Checklisten */}
          {checklisteMassnahmen.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {checklisteMassnahmen.map((code) => (
                <PflichtfotosCheckliste
                  key={code}
                  massnahmeCode={code}
                  fotos={fotos}
                />
              ))}
            </div>
          )}

          {/* Galerie */}
          {laed ? (
            <div className="flex items-center justify-center py-16 text-[#6B7F90]">
              <div className="text-sm">Fotos werden geladen …</div>
            </div>
          ) : gefilterteFotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#3A5070]">
              <SwitchCamera className="w-10 h-10" />
              <p className="text-sm">
                {fotos.length === 0
                  ? 'Noch keine Fotos für diesen Kunden.'
                  : 'Keine Fotos für den gewählten Filter.'}
              </p>
              {fotos.length === 0 && (
                <button
                  onClick={() => setUploadOffen(true)}
                  className="mt-1 text-sm text-brand hover:underline"
                >
                  Erstes Foto hochladen →
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {gefilterteFotos.map((f) => (
                <FotoKachel
                  key={f.id}
                  meta={f}
                  onLoeschen={handleLoeschen}
                  onClick={setVollbildFoto}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Platzhalter wenn kein Kunde gewählt */}
      {!kundeId && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-[#3A5070]">
          <Camera className="w-12 h-12" />
          <p className="text-sm">Bitte oben einen Kunden auswählen.</p>
        </div>
      )}

      {/* Upload-Modal */}
      {uploadOffen && kundeId && (
        <UploadModal
          kundeId={kundeId}
          onGespeichert={handleGespeichert}
          onSchliessen={() => setUploadOffen(false)}
        />
      )}

      {/* Vollbild-Vorschau */}
      {vollbildFoto && (
        <FotoVollbild
          meta={vollbildFoto}
          onSchliessen={() => setVollbildFoto(null)}
        />
      )}
    </div>
  );
}
