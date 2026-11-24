import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { restablecerPassword } from '../../api/auth';
import AuthLayout from './AuthLayout';
import CampoPassword from './CampoPassword';

function RestablecerPage() {
  const [parametros] = useSearchParams();
  const navegar = useNavigate();
  const uid = parametros.get('uid') || '';
  const token = parametros.get('token') || '';
  const [form, setForm] = useState({ password: '', confirmar: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setEnviando(true);
    try {
      const respuesta = await restablecerPassword(uid, token, form.password);
      navegar('/login', { replace: true, state: { mensaje: respuesta.detail } });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (!uid || !token) {
    return (
      <AuthLayout titulo="Enlace incompleto" pie={<Link to="/recuperar">Solicitar un enlace nuevo</Link>}>
        <p className="alerta alerta-error">Abre el enlace completo que llegó a tu correo.</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      titulo="Nueva contraseña"
      subtitulo="Elige una contraseña que no hayas usado antes."
      pie={<Link to="/login">Volver a iniciar sesión</Link>}
    >
      {error && <p className="alerta alerta-error" role="alert">{error}</p>}
      <form className="auth-form" onSubmit={enviar}>
        <CampoPassword
          id="nueva-password"
          label="Contraseña nueva"
          value={form.password}
          onChange={cambiar}
          autoComplete="new-password"
          ayuda="Mínimo 8 caracteres, que no sea solo números ni muy común."
        />
        <CampoPassword
          id="nueva-confirmar"
          name="confirmar"
          label="Confirmar contraseña"
          value={form.confirmar}
          onChange={cambiar}
          autoComplete="new-password"
        />
        <button type="submit" disabled={enviando}>{enviando ? 'Guardando...' : 'Guardar contraseña'}</button>
      </form>
    </AuthLayout>
  );
}

export default RestablecerPage;
