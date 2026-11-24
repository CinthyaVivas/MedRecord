import { apiRequest } from './client';

export const consultarCitasRecordatorio = () => apiRequest('citas/');
export const consultarTratamientosRecordatorio = () => apiRequest('tratamientos/');
export const consultarMedicamentosRecordatorio = () => apiRequest('medicamentos/');

export const consultarRecordatorios = () => apiRequest('recordatorios/');

export const crearRecordatorio = (datos) => apiRequest('recordatorios/', {
  method: 'POST',
  body: datos
});

export const marcarRecordatorioAtendido = (id) => apiRequest(`recordatorios/${id}/`, {
  method: 'PATCH',
  body: { estado: 'completado' }
});
