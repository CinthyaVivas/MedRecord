import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import AuthLayout from './AuthLayout';
import CampoPassword from './CampoPassword';

function LoginPage() {
  const { entrar } = useAuth();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [form, setForm] = useState({ correo: '', password: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await entrar(form.correo, form.password);
      navegar(ubicacion.state?.desde || '/medicamentos', { replace: true });
    } catch (err) {
      setError(err.status === 401 ? 'Correo o contraseña incorrectos.' : err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthLayout
      titulo="Iniciar sesión"
      subtitulo="Ingresa con tu correo para ver tus medicamentos, citas y recordatorios."
      pie={<>¿No tienes cuenta? <Link to="/registro">Regístrate</Link></>}
    >
      {ubicacion.state?.mensaje && <p className="alerta alerta-exito">{ubicacion.state.mensaje}</p>}
      {error && <p className="alerta alerta-error" role="alert">{error}</p>}
      <form className="auth-form" onSubmit={enviar}>
        <div className="auth-campo">
          <label htmlFor="login-correo">Correo electrónico</label>
          <input
            id="login-correo"
            name="correo"
            type="email"
            value={form.correo}
            onChange={cambiar}
            autoComplete="email"
            required
            autoFocus
          />
        </div>
        <CampoPassword
          id="login-password"
          label="Contraseña"
          value={form.password}
          onChange={cambiar}
          autoComplete="current-password"
        />
        <Link className="auth-enlace-derecha" to="/recuperar">¿Olvidaste tu contraseña?</Link>
        <button type="submit" disabled={enviando}>{enviando ? 'Ingresando...' : 'Ingresar'}</button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
