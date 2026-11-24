import { useEffect, useRef, useState } from 'react';
import { consultarMedicamentos } from '../api/medicamentos';

function ListaMedicamentos({ refreshTrigger }) {
  const [medicamentos, setMedicamentos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const solicitudActual = useRef(0);

  const cargar = async (query = '') => {
    const solicitud = ++solicitudActual.current;
    setError('');
    try {
      const resultados = await consultarMedicamentos(query);
      if (solicitud === solicitudActual.current) {
        setMedicamentos(resultados);
      }
    } catch (err) {
      if (solicitud === solicitudActual.current) {
        setMedicamentos([]);
        setError(err.message);
      }
    }
  };

  useEffect(() => {
    const solicitud = ++solicitudActual.current;
    consultarMedicamentos()
      .then((resultados) => {
        if (solicitud === solicitudActual.current) {
          setMedicamentos(resultados);
          setError('');
        }
      })
      .catch((err) => {
        if (solicitud === solicitudActual.current) {
          setMedicamentos([]);
          setError(err.message);
        }
      });

    return () => {
      if (solicitud === solicitudActual.current) {
        solicitudActual.current += 1;
      }
    };
  }, [refreshTrigger]);

  return (
    <div className="card">
      <div className="search-bar">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar medicamento"
        />
        <button onClick={() => cargar(busqueda)}>Buscar</button>
      </div>

      {error && <p className="alerta alerta-error" role="alert">{error}</p>}

      <ul className="lista">
        {medicamentos.map((m) => (
          <li key={m.id_medicamento} className="medicamento-item">
            <div className="medicamento-header">
              <strong>{m.nombre}</strong>
              {m.fecha_formulacion && <span className="medicamento-fecha">{m.fecha_formulacion}</span>}
            </div>
            <div className="medicamento-detalles">
              {[
                m.dosis_valor !== null && m.dosis_valor !== '' && `${m.dosis_valor} ${m.dosis_unidad}`,
                m.frecuencia,
                m.duracion_valor !== null && m.duracion_valor !== '' && `${m.duracion_valor} ${m.duracion_unidad}`,
                m.cantidad_valor !== null && m.cantidad_valor !== '' && `${m.cantidad_valor} ${m.cantidad_unidad}`
              ].filter(Boolean).map((detalle, index) => (
                <span key={detalle}>{index > 0 && ' · '}{detalle}</span>
              ))}
            </div>
            {m.indicaciones && (
              <p className="medicamento-indicaciones">{m.indicaciones}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaMedicamentos;