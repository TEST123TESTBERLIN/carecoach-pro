import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Kunden from './pages/Kunden';
import Workflow from './pages/Workflow';
import Foerderrechner from './pages/Foerderrechner';
import Dokumente from './pages/Dokumente';

// Routing-Baum: /login ist öffentlich, alles andere liegt hinter
// <ProtectedRoute> und teilt sich das <Layout> mit Sidebar.
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/workflow" element={<Workflow />} />
        <Route path="/kunden" element={<Kunden />} />
        <Route path="/foerderrechner" element={<Foerderrechner />} />
        <Route path="/dokumente" element={<Dokumente />} />
      </Route>

      {/* Fallback: unbekannte Pfade zum Dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
