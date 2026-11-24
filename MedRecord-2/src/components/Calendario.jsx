import { obtenerSemanasDelMes, formatearFechaISO, NOMBRES_MES, DIAS_SEMANA } from '../utils/calendario';

function Calendario({ anio, mes, fechaSeleccionada, citasPorFecha, onSelectFecha, onCambiarMes }) {
  const semanas = obtenerSemanasDelMes(anio, mes);
  const hoyISO = formatearFechaISO(new Date());

  const irMesAnterior = () => (mes === 1 ? onCambiarMes(anio - 1, 12) : onCambiarMes(anio, mes - 1));
  const irMesSiguiente = () => (mes === 12 ? onCambiarMes(anio + 1, 1) : onCambiarMes(anio, mes + 1));

  return (
    <div className="calendario-columna">
      <div className="navegacion-mes">
        <button type="button" className="boton-icono" onClick={irMesAnterior} aria-label="Mes anterior">‹</button>
        <h3>{NOMBRES_MES[mes - 1]} {anio}</h3>
        <button type="button" className="boton-icono" onClick={irMesSiguiente} aria-label="Mes siguiente">›</button>
      </div>

      <div className="cabecera-semana">
        {DIAS_SEMANA.map((d) => <span key={d}>{d}</span>)}
      </div>

      <div className="cuadricula-calendario">
        {semanas.flat().map((dia) => {
          const fechaISO = formatearFechaISO(dia);
          const esOtroMes = dia.getMonth() + 1 !== mes;
          const esSeleccionado = fechaISO === fechaSeleccionada;
          const esHoy = fechaISO === hoyISO;
          const citasDelDia = citasPorFecha[fechaISO] || [];

          return (
            <button
              type="button"
              key={fechaISO}
              className={`dia-calendario ${esOtroMes ? 'otro-mes' : ''} ${esSeleccionado ? 'seleccionado' : ''} ${esHoy ? 'hoy' : ''}`}
              onClick={() => onSelectFecha(fechaISO)}
            >
              <span className="numero-dia">{dia.getDate()}</span>
              {citasDelDia.length > 0 && (
                <span className="indicador-cita">
                  {citasDelDia.length} cita{citasDelDia.length !== 1 ? 's' : ''}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Calendario;