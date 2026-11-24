import { useState } from 'react';

function CampoPassword({ id, label, value, onChange, autoComplete, name = 'password', ayuda }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="auth-campo">
      <label htmlFor={id}>{label}</label>
      <div className="auth-password">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          className="auth-ver"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? 'Ocultar' : 'Ver'}
        </button>
      </div>
      {ayuda && <small className="texto-suave">{ayuda}</small>}
    </div>
  );
}

export default CampoPassword;
