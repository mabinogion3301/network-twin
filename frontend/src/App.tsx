import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './routes/LoginPage';
import { GeoMapPage } from './routes/GeoMapPage';
import { DashboardPage } from './routes/DashboardPage';
import { StationsPage } from './routes/StationsPage';
import { EquipmentsPage } from './routes/EquipmentsPage';
import { ConnectionsPage } from './routes/ConnectionsPage';
import { SimulationsHistoryPage } from './routes/SimulationsHistoryPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/geo-map" element={<GeoMapPage />} />
            <Route path="/topology" element={<Navigate to="/geo-map" replace />} />
            <Route path="/stations" element={<StationsPage />} />
            <Route path="/equipments" element={<EquipmentsPage />} />
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="/simulations" element={<SimulationsHistoryPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
