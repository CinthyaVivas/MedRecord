// Guarda y lee la sesión (tokens JWT y datos del usuario) en el navegador.

const CLAVE_ACCESS = 'medrecord.access';
const CLAVE_REFRESH = 'medrecord.refresh';
const CLAVE_USUARIO = 'medrecord.usuario';

export const EVENTO_SESION_EXPIRADA = 'medrecord:sesion-expirada';

function leer(clave) {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function escribir(clave, valor) {
  try {
    if (valor === null || valor === undefined) localStorage.removeItem(clave);
    else localStorage.setItem(clave, valor);
  } catch {
    // Almacenamiento no disponible (modo privado estricto): la sesión dura lo que la pestaña.
  }
}

export const obtenerAccessToken = () => leer(CLAVE_ACCESS);
export const obtenerRefreshToken = () => leer(CLAVE_REFRESH);

export function obtenerUsuarioGuardado() {
  const texto = leer(CLAVE_USUARIO);
  if (!texto) return null;
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

export function guardarSesion({ access, refresh, usuario }) {
  if (access) escribir(CLAVE_ACCESS, access);
  if (refresh) escribir(CLAVE_REFRESH, refresh);
  if (usuario) escribir(CLAVE_USUARIO, JSON.stringify(usuario));
}

export function limpiarSesion() {
  escribir(CLAVE_ACCESS, null);
  escribir(CLAVE_REFRESH, null);
  escribir(CLAVE_USUARIO, null);
}
