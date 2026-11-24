const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api')
  .replace(/\/+$/, '');

export async function apiRequest(path, { method = 'GET', body, ...options } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/${path.replace(/^\/+/, '')}`, {
      ...options,
      method,
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
  } catch {
    throw new Error('No se pudo conectar con Django. Comprueba que el backend esté iniciado.');
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
    const details = payload && typeof payload === 'object'
      ? Object.values(payload).flat().join(' ')
      : payload;
    throw new Error(details || `Error del servidor (${response.status}).`);
  }

  return payload;
}