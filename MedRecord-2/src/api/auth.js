import { apiRequest } from './client';
import { guardarSesion, limpiarSesion } from './sesion';

export async function iniciarSesion(correo, password) {
  const datos = await apiRequest('auth/login/', {
    method: 'POST',
    auth: false,
    body: { correo: correo.trim().toLowerCase(), password }
  });
  guardarSesion(datos);
  return datos.usuario;
}

export const registrarUsuario = (datos) => apiRequest('auth/registro/', {
  method: 'POST',
  auth: false,
  body: { ...datos, correo: datos.correo.trim().toLowerCase() }
});

export const solicitarRecuperacion = (correo) => apiRequest('auth/recuperar/', {
  method: 'POST',
  auth: false,
  body: { correo: correo.trim().toLowerCase() }
});

export const restablecerPassword = (uid, token, password) => apiRequest('auth/restablecer/', {
  method: 'POST',
  auth: false,
  body: { uid, token, password }
});

export const consultarPerfil = () => apiRequest('auth/yo/');

export function cerrarSesion() {
  limpiarSesion();
}
