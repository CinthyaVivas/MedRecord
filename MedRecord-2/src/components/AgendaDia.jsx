function AgendaDia({ titulo, subtitulo, citas, mostrarFecha, onCancelar, mensajeVacio }) {
  return (
    <aside className="agenda-dia">
      <div className="agenda-encabezado">
        <div>
          <p className="etiqueta">{titulo}</p>
          <h3>{subtitulo}</h3>
        </div>
      </div>

      {citas.length > 0 ? (
        <div className="lista-citas">
          {citas.map((cita) => (
            <article key={cita.id} className="tarjeta-cita">
              <div className="hora-cita">{cita.hora}</div>
              <div className="datos-cita">
                <h4>{cita.paciente}</h4>
                <p>{cita.especialidad}</p>
                <p>{cita.medico}</p>
                {mostrarFecha && <p>{cita.fecha}</p>}
                <p className="lugar-cita">{cita.lugar}</p>
              </div>
              <button type="button" className="boton-cancelar" onClick={() => onCancelar(cita.id)}>
                Cancelar
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="sin-citas">
          <h4>{mensajeVacio.titulo}</h4>
          <p>{mensajeVacio.texto}</p>
        </div>
      )}
    </aside>
  );
}

export default AgendaDia;