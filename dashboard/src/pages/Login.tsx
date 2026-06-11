import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface VonState {
  von?: string;
}

// Login-Seite. Leitet nach erfolgreicher Anmeldung auf den ursprünglich
// angeforderten Pfad (oder das Dashboard) um.
export default function Login() {
  const { anmelden } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const ziel = (location.state as VonState | null)?.von ?? '/';

  const [email, setEmail] = useState('');
  const [passwort, setPasswort] = useState('');
  const [fehler, setFehler] = useState('');
  const [laedt, setLaedt] = useState(false);

  async function absenden(e: FormEvent) {
    e.preventDefault();
    setFehler('');
    setLaedt(true);
    try {
      await anmelden(email, passwort);
      navigate(ziel, { replace: true });
    } catch (err) {
      setFehler(err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen.');
    } finally {
      setLaedt(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm">
        {/* Marke */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-xl font-bold text-[#0D1B2A]">
            CC
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-ink">CareCoach Pro</div>
            <div className="text-sm text-faint">Admin Dashboard</div>
          </div>
        </div>

        <form
          onSubmit={absenden}
          className="space-y-4 rounded-2xl border border-white/10 bg-card p-6"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@carecoach.pro"
              autoComplete="username"
              className="w-full rounded-xl border border-white/10 bg-elevated px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-brand"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">Passwort</label>
            <input
              type="password"
              value={passwort}
              onChange={(e) => setPasswort(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/10 bg-elevated px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-brand"
            />
          </div>

          {fehler && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-danger">
              {fehler}
            </div>
          )}

          <button
            type="submit"
            disabled={laedt}
            className="w-full rounded-xl bg-brand py-2.5 text-sm font-bold text-[#0D1B2A] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {laedt ? 'Anmeldung…' : 'Anmelden'}
          </button>

          <p className="text-center text-xs text-faint">
            Zugang nur mit hinterlegtem Testkonto.
          </p>
        </form>
      </div>
    </div>
  );
}
