import { apiRequest } from './client';
import { formatearFechaISO } from '../utils/calendario';

export async function registrarCita(datos) {
  const { medico, especialidad, fecha, hora, lugar, id_usuario } = datos;

  if (!id_usuario) throw new Error('Selecciona un usuario para asociar la cita.');
  if (!medico?.trim()) throw new Error('El médico es obligatorio.');
  if (!especialidad?.trim()) throw new Error('La especialidad es obligatoria.');
  if (!fecha) throw new Error('La fecha es obligatoria.');
  if (!hora) throw new Error('La hora es obligatoria.');
  if (!lugar?.trim()) throw new Error('El lugar de la consulta es obligatorio.');

  const hoy = formatearFechaISO(new Date());
  if (fecha < hoy) throw new Error('No puedes registrar una cita en una fecha anterior a hoy.');
  const citas = await consultarCitas();
  if (existeConflicto(citas, medico, fecha, hora)) {
    throw new Error('El médico ya tiene una cita registrada para esa fecha y hora.');
  }

  const cuerpo = {
    ...datos,
    paciente: '',
    id_usuario: Number(id_usuario),
    estado: 'programada',
  };

  const cita = await apiRequest('citas/', {
    method: 'POST',
    body: cuerpo
  });
  return { ...cita, id: cita.id_cita };
}

export async function consultarCitas() {
  const citas = await apiRequest('citas/');
  return citas
    .filter((cita) => cita.estado !== 'cancelada')
    .map((cita) => ({ ...cita, id: cita.id_cita }));
}

export async function consultarCitasPorFecha(fecha) {
  return (await consultarCitas()).filter((cita) => cita.fecha === fecha);
}

export async function consultarCitasPorPaciente(nombre) {
  const q = nombre.trim().toLowerCase();
  return (await consultarCitas()).filter((cita) =>
    cita.paciente.toLowerCase().includes(q)
  );
}

export async function cancelarCita(id) {
  const cita = await apiRequest(`citas/${id}/`, {
    method: 'PATCH',
    body: { estado: 'cancelada' }
  });
  return { ...cita, id: cita.id_cita };
}

function existeConflicto(citas, medico, fecha, hora) {
  return citas.some(
    (cita) => cita.medico.toLowerCase() === medico.toLowerCase()
      && cita.fecha === fecha
      && cita.hora === hora
  );
}