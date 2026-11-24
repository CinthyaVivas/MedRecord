import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  consultarCitasRecordatorio,
  consultarMedicamentosRecordatorio,
  consultarRecordatorios,
  consultarTratamientosRecordatorio,
  crearRecordatorio,
  marcarRecordatorioAtendido
} from '../api/recordatorios';
import { useAuth } from '../auth/useAuth';

function fechaLocalParaInput() {
  const fecha = new Date();
  const ajustar = (valor) => String(valor).padStart(2, '0');
  return `${fecha.getFullYear()}-${ajustar(fecha.getMonth() + 1)}-${ajustar(fecha.getDate())}`;
}

const FORMULARIO_INICIAL = {
  tipo: 'cita',
  fecha: fechaLocalParaInput(),
  hora: '',
  anticipacion_minutos: '15',
  id_cita: '',
  id_medicamento: ''
};

function nombreUsuario(usuario) {
  return `${usuario?.nombre || ''} ${usuario?.apellido || ''}`.trim() || 'Usuario';
}

function fechaHoraLegible(fechaHora) {
  const fecha = new Date(fechaHora);
  if (Number.isNaN(fecha.getTime())) return fechaHora;
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(fecha);
}

function RecordatoriosPage() {
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const { usuario } = useAuth();
  const [citas, setCitas] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [recordatorios, setRecordatorios] = useState([]);
  const [cargandoReferencias, setCargandoReferencias] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [actualizacion, setActualizacion] = useState(0);

  useEffect(() => {
    let activo = true;
    Promise.all([
      consultarCitasRecordatorio(),
      consultarTratamientosRecordatorio(),
      consultarMedicamentosRecordatorio()
    ])
      .then(([citasData, tratamientosData, medicamentosData]) => {
        if (!activo) return;
        setCitas(citasData);
        setTratamientos(tratamientosData);
        setMedicamentos(medicamentosData);
      })
      .catch((err) => {
        if (activo) setError(err.message);
      })
      .finally(() => {
        if (activo) setCargandoReferencias(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    let activo = true;
    consultarRecordatorios()
      .then((datos) => {
        if (activo) setRecordatorios(datos);
      })
      .catch((err) => {
        if (activo) setError(err.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [actualizacion]);

  const resolverDetalles = useCallback((recordatorio) => {
    if (recordatorio.tipo === 'cita') {
      const cita = citas.find((item) => String(item.id_cita) === String(recordatorio.id_cita));
      return {
        titulo: cita ? `Cita médica · ${cita.especialidad}` : 'Recordatorio de cita médica',
        paciente: cita?.paciente || nombreUsuario(usuario),
        descripcion: cita ? `${cita.medico} · ${cita.lugar}` : ''
      };
    }

    const tratamiento = tratamientos.find(
      (item) => String(item.id_tratamiento) === String(recordatorio.id_tratamiento)
    );
    const medicamento = medicamentos.find((item) =>
      String(item.id_medicamento) === String(recordatorio.id_medicamento || tratamiento?.id_medicamento)
    );
    return {
      titulo: medicamento ? `Medicación · ${medicamento.nombre}` : 'Recordatorio de medicación',
      paciente: nombreUsuario(usuario),
      descripcion: tratamiento
        ? `${tratamiento.dosis} · ${tratamiento.frecuencia}`
        : medicamento
          ? [
            medicamento.dosis_valor && `${medicamento.dosis_valor} ${medicamento.dosis_unidad}`,
            medicamento.frecuencia
          ].filter(Boolean).join(' · ')
          : ''
    };
  }, [citas, medicamentos, tratamientos, usuario]);

  // Primero los pendientes (del más próximo al más lejano) y al final los atendidos.
  const recordatoriosOrdenados = useMemo(() => [...recordatorios].sort((a, b) => {
    const pendienteA = a.estado === 'pendiente' ? 0 : 1;
    const pendienteB = b.estado === 'pendiente' ? 0 : 1;
    if (pendienteA !== pendienteB) return pendienteA - pendienteB;
    return new Date(a.fecha_hora) - new Date(b.fecha_hora);
  }), [recordatorios]);

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'tipo' ? { id_cita: '', id_medicamento: '' } : {})
    }));
  };

  const guardarRecordatorio = async (evento) => {
    evento.preventDefault();
    setError('');

    const fechaHora = new Date(`${formulario.fecha}T${formulario.hora}:00`);
    if (Number.isNaN(fechaHora.getTime())) {
      setError('Ingresa una fecha y hora válidas.');
      return;
    }
    setGuardando(true);
    try {
      await crearRecordatorio({
        tipo: formulario.tipo,
        fecha_hora: fechaHora.toISOString(),
        anticipacion_minutos: Number(formulario.anticipacion_minutos),
        id_cita: formulario.tipo === 'cita' && formulario.id_cita
          ? Number(formulario.id_cita)
          : null,
        id_medicamento: formulario.tipo === 'medicacion' && formulario.id_medicamento
          ? Number(formulario.id_medicamento)
          : null
      });
      setCargando(true);
      setFormulario({ ...FORMULARIO_INICIAL, fecha: fechaLocalParaInput() });
      setActualizacion((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const marcarAtendido = async (id) => {
    if (!window.confirm('¿Marcar este recordatorio como atendido?')) return;
    setError('');
    try {
      await marcarRecordatorioAtendido(id);
      setCargando(true);
      setActualizacion((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <section className="encabezado-vista">
        <div>
          <p className="etiqueta">SEGUIMIENTO MÉDICO</p>
          <h2>Consultar recordatorios</h2>
          <p className="texto-suave">
            Revisa los pendientes y registra cuando hayan sido atendidos.
          </p>
        </div>
      </section>

      {error && <p className="alerta alerta-error" role="alert">{error}</p>}

      <section className="recordatorio-formulario-contenedor">
        <form className="recordatorio-formulario" onSubmit={guardarRecordatorio}>
          <div className="recordatorio-campo">
            <label htmlFor="recordatorio-tipo">Tipo</label>
            <select
              id="recordatorio-tipo"
              name="tipo"
              value={formulario.tipo}
              onChange={manejarCambio}
            >
              <option value="cita">Cita médica</option>
              <option value="medicacion">Medicación</option>
            </select>
          </div>
          {formulario.tipo === 'cita' && (
            <div className="recordatorio-campo recordatorio-campo-completo">
              <label htmlFor="recordatorio-cita">Cita asociada (opcional)</label>
              <select
                id="recordatorio-cita"
                name="id_cita"
                value={formulario.id_cita}
                onChange={manejarCambio}
              >
                <option value="">Sin cita asociada</option>
                {citas.map((cita) => (
                  <option key={cita.id_cita} value={cita.id_cita}>
                    {cita.especialidad} · {cita.fecha} {cita.hora}
                  </option>
                ))}
              </select>
            </div>
          )}
          {formulario.tipo === 'medicacion' && (
            <div className="recordatorio-campo recordatorio-campo-completo">
              <label htmlFor="recordatorio-medicamento">Medicamento asociado (opcional)</label>
              <select
                id="recordatorio-medicamento"
                name="id_medicamento"
                value={formulario.id_medicamento}
                onChange={manejarCambio}
              >
                <option value="">Sin medicamento asociado</option>
                {medicamentos.map((medicamento) => (
                  <option key={medicamento.id_medicamento} value={medicamento.id_medicamento}>
                    {medicamento.nombre}
                    {medicamento.dosis_valor ? ` · ${medicamento.dosis_valor} ${medicamento.dosis_unidad}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="recordatorio-campo">
            <label htmlFor="recordatorio-fecha">Fecha</label>
            <input
              id="recordatorio-fecha"
              name="fecha"
              type="date"
              value={formulario.fecha}
              onChange={manejarCambio}
              required
            />
          </div>
          <div className="recordatorio-campo">
            <label htmlFor="recordatorio-hora">Hora</label>
            <input
              id="recordatorio-hora"
              name="hora"
              type="time"
              value={formulario.hora}
              onChange={manejarCambio}
              required
            />
          </div>
          <div className="recordatorio-campo">
            <label htmlFor="recordatorio-anticipacion">Avisar con anticipación (minutos)</label>
            <input
              id="recordatorio-anticipacion"
              name="anticipacion_minutos"
              type="number"
              min="0"
              value={formulario.anticipacion_minutos}
              onChange={manejarCambio}
              required
            />
          </div>
          <div className="recordatorio-acciones recordatorio-campo-completo">
            <button type="submit" disabled={guardando || cargandoReferencias}>
              {guardando ? 'Guardando...' : 'Guardar recordatorio'}
            </button>
            <span className="texto-suave">
              La alerta llegará a {usuario?.correo} con la anticipación indicada.
            </span>
          </div>
        </form>
      </section>

      <section className="lista-recordatorios" aria-live="polite">
        {cargando ? (
          <p className="texto-suave">Cargando...</p>
        ) : recordatoriosOrdenados.length === 0 ? (
          <div className="sin-citas">
            <h4>No hay recordatorios para mostrar</h4>
            <p>Registra uno nuevo con el formulario de arriba.</p>
          </div>
        ) : (
          recordatoriosOrdenados.map((recordatorio) => {
            const detalles = resolverDetalles(recordatorio);
            const atendido = recordatorio.estado === 'completado';
            const cancelado = recordatorio.estado === 'cancelado';
            return (
              <article
                key={recordatorio.id_recordatorio}
                className={`tarjeta-recordatorio${atendido ? ' atendido' : ''}${cancelado ? ' cancelado' : ''}`}
              >
                <div className="recordatorio-fecha">
                  <strong>{fechaHoraLegible(recordatorio.fecha_hora)}</strong>
                  <span>{recordatorio.anticipacion_minutos} min de anticipación</span>
                </div>
                <div className="datos-recordatorio">
                  <span className="estado-recordatorio">
                    {atendido ? 'Atendido' : cancelado ? 'Cancelado' : 'Pendiente'}
                  </span>
                  <h3>{detalles.titulo}</h3>
                  <p><strong>Paciente:</strong> {detalles.paciente}</p>
                  {detalles.descripcion && <p>{detalles.descripcion}</p>}
                  {recordatorio.enviado && (
                    <p className="recordatorio-enviado">✉ Alerta enviada por correo</p>
                  )}
                </div>
                {!atendido && !cancelado && (
                  <button
                    className="boton-pequeno"
                    type="button"
                    onClick={() => marcarAtendido(recordatorio.id_recordatorio)}
                  >
                    Marcar como atendido
                  </button>
                )}
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}

export default RecordatoriosPage;
