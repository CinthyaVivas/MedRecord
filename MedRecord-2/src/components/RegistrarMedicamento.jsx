import { useEffect, useState } from 'react';
import { consultarCatalogos } from '../api/catalogos';
import { crearMedicamento } from '../api/medicamentos';

function RegistrarMedicamento({ onSuccess }) {
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    dosis_valor: '',
    dosis_unidad: 'mg',
    frecuencia: '',
    duracion_valor: '',
    duracion_unidad: 'días',
    cantidad_valor: '',
    cantidad_unidad: 'tabletas',
    fecha_formulacion: '',
    indicaciones: ''
  });

  const [grupos, setGrupos] = useState([]);

  useEffect(() => {
    let activo = true;
    consultarCatalogos()
      .then((catalogos) => {
        if (activo) setGrupos(catalogos.medicamentos);
      })
      .catch(() => {
        if (activo) setError('No se pudo cargar la lista de medicamentos.');
      });
    return () => {
      activo = false;
    };
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Al elegir un medicamento se proponen sus unidades habituales (se pueden cambiar).
  const elegirMedicamento = (e) => {
    const nombre = e.target.value;
    const item = grupos.flatMap((grupo) => grupo.items).find((m) => m.nombre === nombre);
    setForm({
      ...form,
      nombre,
      ...(item ? { dosis_unidad: item.dosis_unidad, cantidad_unidad: item.cantidad_unidad } : {})
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.nombre) {
      setError('Selecciona un medicamento de la lista.');
      return;
    }
    try {
      await crearMedicamento(form);
      onSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Añadir medicamento</h2>
      {error && <div className="alerta alerta-error" role="alert">{error}</div>}
      <form onSubmit={handleSubmit} className="form-vertical">

        <label className="campo-label" htmlFor="nombre-medicamento">Medicamento</label>
        <select
          id="nombre-medicamento"
          name="nombre"
          value={form.nombre}
          onChange={elegirMedicamento}
          required
        >
          <option value="">Selecciona un medicamento</option>
          {grupos.map((grupo) => (
            <optgroup key={grupo.categoria} label={grupo.categoria}>
              {grupo.items.map((item) => (
                <option key={item.nombre} value={item.nombre}>{item.nombre}</option>
              ))}
            </optgroup>
          ))}
        </select>

        <label className="campo-label">Dosis</label>
        <div className="campo-con-unidad">
          <input
            type="number"
            name="dosis_valor"
            value={form.dosis_valor}
            onChange={handleChange}
            placeholder="500"
          />
          <select name="dosis_unidad" value={form.dosis_unidad} onChange={handleChange}>
            <option value="mg">mg</option>
            <option value="mcg">mcg</option>
            <option value="g">g</option>
            <option value="ml">ml</option>
            <option value="UI">UI</option>
          </select>
        </div>

        <label className="campo-label">Frecuencia</label>
        <input
          name="frecuencia"
          value={form.frecuencia}
          onChange={handleChange}
          placeholder="Ej. Cada 8 horas"
        />

        <label className="campo-label">Duración</label>
        <div className="campo-con-unidad">
          <input
            type="number"
            name="duracion_valor"
            value={form.duracion_valor}
            onChange={handleChange}
            placeholder="7"
          />
          <select name="duracion_unidad" value={form.duracion_unidad} onChange={handleChange}>
            <option value="días">días</option>
            <option value="semanas">semanas</option>
            <option value="meses">meses</option>
          </select>
        </div>

        <label className="campo-label">Cantidad</label>
        <div className="campo-con-unidad">
          <input
            type="number"
            name="cantidad_valor"
            value={form.cantidad_valor}
            onChange={handleChange}
            placeholder="30"
          />
          <select name="cantidad_unidad" value={form.cantidad_unidad} onChange={handleChange}>
            <option value="tabletas">tabletas</option>
            <option value="cápsulas">cápsulas</option>
            <option value="ml">ml</option>
            <option value="gotas">gotas</option>
            <option value="sobres">sobres</option>
          </select>
        </div>

        <label className="campo-label">Fecha de formulación</label>
        <input
          type="date"
          name="fecha_formulacion"
          value={form.fecha_formulacion}
          onChange={handleChange}
        />

        <label className="campo-label">Indicaciones</label>
        <textarea
          name="indicaciones"
          value={form.indicaciones}
          onChange={handleChange}
          placeholder="Ej. Tomar con alimentos"
          rows={3}
        />

        <button type="submit">Guardar</button>
      </form>
    </div>
  );
}

export default RegistrarMedicamento;