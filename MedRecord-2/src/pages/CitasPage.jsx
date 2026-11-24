import { useEffect, useMemo, useState } from 'react';
import Calendario from '../components/Calendario';
import AgendaDia from '../components/AgendaDia';
import RegistrarCita from '../components/RegistrarCita';
import Modal from '../components/Modal';
import { consultarCitas, cancelarCita } from '../api/citas';
import { formatearFechaISO } from '../utils/calendario';

function CitasPage() {
  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(formatearFechaISO(hoy));
  const [busqueda, setBusqueda] = useState('');
  const [terminoBuscado, setTerminoBuscado] = useState('');
  const [todasLasCitas, setTodasLasCitas] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState('');

  const citasPorFecha = useMemo(() => todasLasCitas.reduce((acc, cita) => {
    acc[cita.fecha] = acc[cita.fecha] || [];
    acc[cita.fecha].push(cita);
    return acc;
  }, {}), [todasLasCitas]);

  const citasDelDia = useMemo(
    () => todasLasCitas.filter((cita) => cita.fecha === fechaSeleccionada),
    [fechaSeleccionada, todasLasCitas]
  );
  const resultadosBusqueda = useMemo(() => {
    const termino = terminoBuscado.toLocaleLowerCase();
    return todasLasCitas.filter((cita) =>
      (cita.paciente || '').toLocaleLowerCase().includes(termino)
    );
  }, [terminoBuscado, todasLasCitas]);

  useEffect(() => {
    let activo = true;
    consultarCitas()
      .then((citas) => {
        if (!activo) return;
        setTodasLasCitas(citas);
        setError('');
      })
      .catch((err) => {
        if (!activo) return;
        setTodasLasCitas([]);
        setError(err.message);
      });

    return () => {
      activo = false;
    };
  }, [refreshTrigger]);

  const handleCambiarMes = (nuevoAnio, nuevoMes) => {
    setAnio(nuevoAnio);
    setMes(nuevoMes);
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    setTerminoBuscado(busqueda.trim());
  };

  const handleCancelar = async (id) => {
    if (!window.confirm('¿Deseas cancelar esta cita?')) return;
    try {
      await cancelarCita(id);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSuccess = () => {
    setModalAbierto(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const mostrandoBusqueda = Boolean(terminoBuscado);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Citas</h1>
        <button onClick={() => setModalAbierto(true)}>+ Agregar nueva cita</button>
      </div>

      <div className="panel-busqueda">
        <form className="formulario-busqueda" onSubmit={handleBuscar}>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre del paciente"
          />
          <button type="submit">Buscar</button>
          {mostrandoBusqueda && (
            <button type="button" className="boton-claro" onClick={() => { setBusqueda(''); setTerminoBuscado(''); }}>
              Limpiar
            </button>
          )}
        </form>
      </div>

      {error && <p className="alerta alerta-error" role="alert">{error}</p>}

      <section className="panel-calendario">
        <Calendario
          anio={anio}
          mes={mes}
          fechaSeleccionada={fechaSeleccionada}
          citasPorFecha={citasPorFecha}
          onSelectFecha={setFechaSeleccionada}
          onCambiarMes={handleCambiarMes}
        />

        <AgendaDia
          titulo={mostrandoBusqueda ? 'RESULTADOS DE BÚSQUEDA' : 'DÍA SELECCIONADO'}
          subtitulo={mostrandoBusqueda ? `"${terminoBuscado}"` : fechaSeleccionada}
          citas={mostrandoBusqueda ? resultadosBusqueda : citasDelDia}
          mostrarFecha={mostrandoBusqueda}
          onCancelar={handleCancelar}
          mensajeVacio={
            mostrandoBusqueda
              ? { titulo: 'No se encontraron resultados', texto: 'No existe ninguna cita para ese paciente.', mostrarBoton: false }
              : { titulo: 'No hay citas este día', texto: 'Agrega una cita para organizar la agenda médica.', mostrarBoton: true }
          }
        />
      </section>

      <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)}>
        <RegistrarCita fechaInicial={fechaSeleccionada} onSuccess={handleSuccess} />
      </Modal>
    </div>
  );
}

export default CitasPage;