import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { RutaProtegida, SoloSinSesion } from './auth/RutaProtegida';
import Sidebar from './components/Sidebar';
import CitasPage from './pages/CitasPage';
import MedicamentosPage from './pages/MedicamentosPage';
import RecordatoriosPage from './pages/RecordatoriosPage';
import LoginPage from './pages/auth/LoginPage';
import RecuperarPage from './pages/auth/RecuperarPage';
import RegistroPage from './pages/auth/RegistroPage';
import RestablecerPage from './pages/auth/RestablecerPage';
import './App.css';

function LayoutApp() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SoloSinSesion />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/recuperar" element={<RecuperarPage />} />
          </Route>
          <Route path="/restablecer" element={<RestablecerPage />} />

          <Route element={<RutaProtegida />}>
            <Route element={<LayoutApp />}>
              <Route path="/" element={<Navigate to="/medicamentos" replace />} />
              <Route path="/medicamentos" element={<MedicamentosPage />} />
              <Route path="/citas" element={<CitasPage />} />
              <Route path="/recordatorios" element={<RecordatoriosPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
