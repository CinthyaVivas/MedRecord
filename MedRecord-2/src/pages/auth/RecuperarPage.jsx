import { useState } from 'react';
import { Link } from 'react-router-dom';
import { solicitarRecuperacion } from '../../api/auth';
import AuthLayout from './AuthLayout';

function RecuperarPage() {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setEnviando(true);
    try {
      const respuesta = await solicitarRecuperacion(correo);
      setMensaje(respuesta.detail);
    } catch (err) {
      setError(err.status === 429 ? 'Demasiados intentos. Espera un rato y vuelve a intentarlo.' : err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthLayout
      titulo="Recuperar contraseña"
      subtitulo="Escribe el correo de tu cuenta y te enviaremos un enlace para crear una contraseña nueva."
      pie={<Link to="/login">Volver a iniciar sesión</Link>}
    >
      {mensaje && <p className="alerta alerta-exito" role="status">{mensaje}</p>}
      {error && <p className="alerta alerta-error" role="alert">{error}</p>}
      <form className="auth-form" onSubmit={enviar}>
        <div className="auth-campo">
          <label htmlFor="rec-correo">Correo electrónico</label>
          <input
            id="rec-correo"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            autoComplete="email"
            required
            autoFocus
          />
        </div>
        <button type="submit" disabled={enviando}>{enviando ? 'Enviando...' : 'Enviar enlace'}</button>
      </form>
    </AuthLayout>
  );
}

export default RecuperarPage;
