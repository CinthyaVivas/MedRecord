import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

// Solo deja pasar si hay sesión; si no, envía al login y recuerda a dónde quería ir.
export function RutaProtegida() {
  const { usuario } = useAuth();
  const ubicacion = useLocation();
  if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  return <Outlet />;
}

// Páginas como login o registro: si ya hay sesión, va directo a la app.
export function SoloSinSesion() {
  const { usuario } = useAuth();
  if (usuario) return <Navigate to="/medicamentos" replace />;
  return <Outlet />;
}
