import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { findeBenutzer, type BenutzerRolle } from '@/domain/users';

// Minimaler Auth-Kontext (Demo). In Produktion: Token vom Backend (JWT) +
// sichere Speicherung. Hier nur sessionStorage als Platzhalter-Persistenz.
interface Benutzer {
  email: string;
  name: string;
  rolle: BenutzerRolle;
}

interface AuthContextValue {
  benutzer: Benutzer | null;
  istAngemeldet: boolean;
  anmelden: (email: string, passwort: string) => Promise<void>;
  abmelden: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'ccpro_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [benutzer, setBenutzer] = useState<Benutzer | null>(() => {
    const roh = sessionStorage.getItem(STORAGE_KEY);
    return roh ? (JSON.parse(roh) as Benutzer) : null;
  });

  const anmelden = useCallback(async (email: string, passwort: string) => {
    // Validierung gegen die Konten-Liste (Mock). Später: POST /api/auth/login.
    if (!email || !passwort) {
      throw new Error('Bitte E-Mail und Passwort eingeben.');
    }
    const konto = findeBenutzer(email, passwort);
    if (!konto) {
      throw new Error('Unbekannte Zugangsdaten.');
    }
    const neuerBenutzer: Benutzer = { email: konto.email, name: konto.name, rolle: konto.rolle };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(neuerBenutzer));
    setBenutzer(neuerBenutzer);
  }, []);

  const abmelden = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setBenutzer(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ benutzer, istAngemeldet: benutzer !== null, anmelden, abmelden }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook für den Zugriff auf den Auth-Kontext.
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth muss innerhalb von <AuthProvider> verwendet werden.');
  return ctx;
}
