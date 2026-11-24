import { useCallback, useEffect, useMemo, useState } from 'react';
import { cerrarSesion, iniciarSesion } from '../api/auth';
import { EVENTO_SESION_EXPIRADA, obtenerAccessToken, obtenerUsuarioGuardado } from '../api/sesion';
import { AuthContext } from './contexto';

function sesionInicial() {
  return obtenerAccessToken() ? obtenerUsuarioGuardado() : null;
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(sesionInicial);

  useEffect(() => {
    const alExpirar = () => setUsuario(null);
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
  }, []);

  const entrar = useCallback(async (correo, password) => {
    const datos = await iniciarSesion(correo, password);
    setUsuario(datos);
    return datos;
  }, []);

  const salir = useCallback(() => {
    cerrarSesion();
    setUsuario(null);
  }, []);

  const valor = useMemo(() => ({ usuario, entrar, salir }), [usuario, entrar, salir]);
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
