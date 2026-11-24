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

  return (
    <div className="page">
      <div className="page-header">
        <h1>Citas</h1>
        <button onClick={() => setModalAbierto(true)}>+ Agregar nueva cita</button>
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
          titulo="DÍA SELECCIONADO"
          subtitulo={fechaSeleccionada}
          citas={citasDelDia}
          mostrarFecha={false}
          onCancelar={handleCancelar}
          mensajeVacio={{
            titulo: 'No hay citas este día',
            texto: 'Agrega una cita para organizar la agenda médica.',
            mostrarBoton: true
          }}
        />
      </section>

      <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)}>
        <RegistrarCita fechaInicial={fechaSeleccionada} onSuccess={handleSuccess} />
      </Modal>
    </div>
  );
}

export default CitasPage;