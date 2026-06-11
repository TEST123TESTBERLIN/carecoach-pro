// CareCoach Pro — Benutzerkonten (MVP-Mock).
// ⚠️ NUR Entwicklung/Pilot: Klartext-Passwörter im Frontend, da noch kein Backend.
// Vor Produktivbetrieb zwingend durch serverseitige Authentifizierung (JWT, gehashte
// Passwörter) ersetzen — hier dürfen keine echten Geheimnisse stehen.

export type BenutzerRolle = 'admin' | 'tester';

export interface BenutzerKonto {
  name: string;
  email: string;
  passwort: string;
  rolle: BenutzerRolle;
}

export const BENUTZER_KONTEN: BenutzerKonto[] = [
  { name: 'LICHT', email: 'licht@licht123.com', passwort: '123456789+#', rolle: 'admin' },
  { name: 'TEST', email: 'test@test123.com', passwort: '987654321', rolle: 'tester' },
];

// Prüft Zugangsdaten gegen die Konten-Liste (E-Mail case-insensitive).
export function findeBenutzer(email: string, passwort: string): BenutzerKonto | undefined {
  const e = email.trim().toLowerCase();
  return BENUTZER_KONTEN.find((b) => b.email.toLowerCase() === e && b.passwort === passwort);
}
