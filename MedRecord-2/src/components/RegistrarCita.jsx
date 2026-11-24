import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { registrarCita } from '../api/citas';
import { formatearFechaISO } from '../utils/calendario';

function RegistrarCita({ fechaInicial, onSuccess }) {
  const hoyISO = formatearFechaISO(new Date());
  const [form, setForm] = useState({
    medico: '', especialidad: '',
    fecha: fechaInicial || hoyISO, hora: '', lugar: '', id_usuario: ''
  });
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    apiRequest('usuarios/')
      .then((datos) => {
        if (!activo) return;
        setUsuarios(datos);
      })
      .catch(() => {
        if (activo) setError('No se pudieron cargar los usuarios.');
      });

    return () => {
      activo = false;
    };
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const nuevaCita = await registrarCita(form);
      onSuccess(nuevaCita);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Registrar cita médica</h2>
      {error && <div className="alerta alerta-error">{error}</div>}
      <form onSubmit={handleSubmit} className="form-vertical">
        <label className="campo-label" htmlFor="usuario-cita">Usuario asociado</label>
        <select
          id="usuario-cita"
          name="id_usuario"
          value={form.id_usuario}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona un usuario</option>
          {usuarios.map((usuario) => (
            <option key={usuario.id_usuario} value={usuario.id_usuario}>
              {usuario.nombre} {usuario.apellido}
            </option>
          ))}
        </select>

        <label className="campo-label">Médico</label>
        <input name="medico" value={form.medico} onChange={handleChange} placeholder="Ej. Dra. Ana Pérez" />

        <label className="campo-label" htmlFor="especialidad-cita">Especialidad</label>
        <select
          id="especialidad-cita"
          name="especialidad"
          value={form.especialidad}
          onChange={handleChange}
        >
          <option value="">Selecciona una especialidad</option>
          <option value="Medicina general">Medicina general</option>
          <option value="Cardiología">Cardiología</option>
          <option value="Dermatología">Dermatología</option>
          <option value="Endocrinología">Endocrinología</option>
          <option value="Ginecología">Ginecología</option>
          <option value="Neurología">Neurología</option>
          <option value="Oftalmología">Oftalmología</option>
          <option value="Pediatría">Pediatría</option>
          <option value="Psicología">Psicología</option>
          <option value="Traumatología">Traumatología</option>
        </select>

        <label className="campo-label">Fecha</label>
        <input type="date" name="fecha" value={form.fecha} min={hoyISO} onChange={handleChange} />

        <label className="campo-label">Hora</label>
        <input type="time" name="hora" value={form.hora} onChange={handleChange} />

        <label className="campo-label" htmlFor="lugar-cita">Lugar de la consulta</label>
        <select
          id="lugar-cita"
          name="lugar"
          value={form.lugar}
          onChange={handleChange}
        >
          <option value="">Selecciona un lugar</option>
          <option value="Consultorio particular">Consultorio particular</option>
          <option value="Clínica">Clínica</option>
          <option value="Hospital">Hospital</option>
          <option value="Centro médico">Centro médico</option>
          <option value="Centro de salud">Centro de salud</option>
        </select>

        <button type="submit">Guardar cita</button>
      </form>
    </div>
  );
}

export default RegistrarCita;