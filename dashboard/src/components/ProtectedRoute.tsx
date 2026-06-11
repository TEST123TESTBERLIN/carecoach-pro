import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { ReactNode } from 'react';

// Wrapper, der nicht angemeldete Nutzer auf /login umleitet
// und den ursprünglich angeforderten Pfad merkt.
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { istAngemeldet } = useAuth();
  const location = useLocation();

  if (!istAngemeldet) {
    return <Navigate to="/login" state={{ von: location.pathname }} replace />;
  }
  return <>{children}</>;
}
