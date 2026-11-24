import {
  EVENTO_SESION_EXPIRADA,
  guardarSesion,
  limpiarSesion,
  obtenerAccessToken,
  obtenerRefreshToken
} from './sesion';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api')
  .replace(/\/+$/, '');

let renovacionEnCurso = null;

// Pide un token de acceso nuevo con el token de renovación (una sola vez aunque haya varias peticiones).
async function renovarAccessToken() {
  const refresh = obtenerRefreshToken();
  if (!refresh) return null;

  if (!renovacionEnCurso) {
    renovacionEnCurso = fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh })
    })
      .then(async (respuesta) => {
        if (!respuesta.ok) return null;
        const datos = await respuesta.json();
        guardarSesion({ access: datos.access, refresh: datos.refresh });
        return datos.access;
      })
      .catch(() => null)
      .finally(() => {
        renovacionEnCurso = null;
      });
  }
  return renovacionEnCurso;
}

function mensajeDeError(payload, status) {
  if (payload && typeof payload === 'object') {
    if (typeof payload.detail === 'string') return payload.detail;
    const textos = Object.values(payload).flat().filter((valor) => typeof valor === 'string');
    if (textos.length) return textos.join(' ');
  }
  if (typeof payload === 'string' && payload && !payload.trim().startsWith('<')) return payload;
  return `Error del servidor (${status}).`;
}

export async function apiRequest(path, { method = 'GET', body, auth = true, ...options } = {}) {
  const url = `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;

  const enviar = (token) => fetch(url, {
    ...options,
    method,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });

  let response;
  try {
    response = await enviar(auth ? obtenerAccessToken() : null);

    // Token vencido: se renueva y se repite la petición una vez.
    if (auth && response.status === 401) {
      const nuevoToken = await renovarAccessToken();
      if (nuevoToken) {
        response = await enviar(nuevoToken);
      }
      if (response.status === 401) {
        limpiarSesion();
        window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
        throw new Error('Tu sesión expiró. Inicia sesión de nuevo.');
      }
    }
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('No se pudo conectar con Django. Comprueba que el backend esté iniciado.', { cause: error });
    }
    throw error;
  }

  const responseText = response.status === 204 ? '' : await response.text();
  let payload = null;
  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = responseText;
    }
  }

  if (!response.ok) {
    const error = new Error(mensajeDeError(payload, response.status));
    error.status = response.status;
    error.datos = payload;
    throw error;
  }

  return payload;
}
