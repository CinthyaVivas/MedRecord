import { useState } from 'react';
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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

        <label className="campo-label">Nombre</label>
        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej. Paracetamol" />

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