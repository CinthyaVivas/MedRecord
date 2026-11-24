import { useEffect, useState } from 'react';
import { consultarCatalogos } from '../api/catalogos';
import { registrarCita } from '../api/citas';
import { formatearFechaISO } from '../utils/calendario';

function RegistrarCita({ fechaInicial, onSuccess }) {
  const hoyISO = formatearFechaISO(new Date());
  const [form, setForm] = useState({
    medico: '', especialidad: '',
    fecha: fechaInicial || hoyISO, hora: '', lugar: ''
  });
  const [error, setError] = useState('');
  const [especialidades, setEspecialidades] = useState([]);
  const [lugares, setLugares] = useState([]);

  useEffect(() => {
    let activo = true;
    consultarCatalogos()
      .then((catalogos) => {
        if (!activo) return;
        setEspecialidades(catalogos.especialidades);
        setLugares(catalogos.lugares);
      })
      .catch(() => {
        if (activo) setError('No se pudieron cargar las especialidades y médicos.');
      });
    return () => {
      activo = false;
    };
  }, []);

  const medicosDisponibles = especialidades.find((e) => e.nombre === form.especialidad)?.medicos || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Al cambiar de especialidad se limpia el médico, porque cada médico tiene la suya.
    setForm({ ...form, [name]: value, ...(name === 'especialidad' ? { medico: '' } : {}) });
  };

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
        <label className="campo-label" htmlFor="especialidad-cita">Especialidad</label>
        <select
          id="especialidad-cita"
          name="especialidad"
          value={form.especialidad}
          onChange={handleChange}
        >
          <option value="">Selecciona una especialidad</option>
          {especialidades.map((especialidad) => (
            <option key={especialidad.nombre} value={especialidad.nombre}>{especialidad.nombre}</option>
          ))}
        </select>

        <label className="campo-label" htmlFor="medico-cita">Médico</label>
        <select
          id="medico-cita"
          name="medico"
          value={form.medico}
          onChange={handleChange}
          disabled={!form.especialidad}
        >
          <option value="">
            {form.especialidad ? 'Selecciona un médico' : 'Primero elige la especialidad'}
          </option>
          {medicosDisponibles.map((medico) => (
            <option key={medico} value={medico}>{medico}</option>
          ))}
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
          {lugares.map((lugar) => (
            <option key={lugar} value={lugar}>{lugar}</option>
          ))}
        </select>

        <button type="submit">Guardar cita</button>
      </form>
    </div>
  );
}

export default RegistrarCita;