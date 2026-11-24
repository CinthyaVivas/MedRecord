import { apiRequest } from './client';

export const consultarUsuarios = () => apiRequest('usuarios/');
export function consultarCitasRecordatorio(idUsuario) {
  if (!idUsuario) return apiRequest('citas/');
  const params = new URLSearchParams({ id_usuario: String(idUsuario) });
  return apiRequest(`citas/?${params}`);
}
export const consultarTratamientosRecordatorio = () => apiRequest('tratamientos/');
export const consultarMedicamentosRecordatorio = () => apiRequest('medicamentos/');

export function consultarRecordatorios(idUsuario) {
  const params = new URLSearchParams({ id_usuario: String(idUsuario) });
  return apiRequest(`recordatorios/?${params}`);
}

export const crearRecordatorio = (datos) => apiRequest('recordatorios/', {
  method: 'POST',
  body: datos
});

export const marcarRecordatorioAtendido = (id) => apiRequest(`recordatorios/${id}/`, {
  method: 'PATCH',
  body: { estado: 'completado' }
});
