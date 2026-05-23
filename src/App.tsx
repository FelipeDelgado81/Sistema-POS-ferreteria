import { type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import Inventario from './pages/inventario/Inventario';
import POS from './pages/ventas/POS';
import Historial from './pages/ventas/Historial';
import Clientes from './pages/clientes/Clientes';
import Proveedores from './pages/proveedores/Proveedores';
import Caja from './pages/caja/Caja';
import Reportes from './pages/reportes/Reportes';
import Login from './pages/auth/Login';
import { useAuth } from './hooks/useAuth';

function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-asr-background">
        <div className="w-8 h-8 border-2 border-asr-border border-t-asr-primary rounded-full animate-spin" />
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inventario" element={<Inventario />} />
        <Route path="ventas" element={<POS />} />
        <Route path="historial" element={<Historial />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="proveedores" element={<Proveedores />} />
        <Route path="caja" element={<Caja />} />
        <Route path="reportes" element={<Reportes />} />
      </Route>
    </Routes>
  );
}

export default App;
