import { apiRequest } from './client';

export const crearMedicamento = (data) => apiRequest('medicamentos/', {
  method: 'POST',
  body: {
    ...data,
    dosis_valor: data.dosis_valor || null,
    duracion_valor: data.duracion_valor || null,
    cantidad_valor: data.cantidad_valor || null,
    fecha_formulacion: data.fecha_formulacion || null
  }
});

export const consultarMedicamentos = (query = '') => {
  const params = new URLSearchParams();
  if (query.trim()) params.set('search', query.trim());
  const queryString = params.toString();
  return apiRequest(`medicamentos/${queryString ? `?${queryString}` : ''}`);
};

