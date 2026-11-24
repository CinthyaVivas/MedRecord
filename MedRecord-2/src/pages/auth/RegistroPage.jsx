import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../../api/auth';
import { useAuth } from '../../auth/useAuth';
import AuthLayout from './AuthLayout';
import CampoPassword from './CampoPassword';

const INICIAL = { nombre: '', apellido: '', correo: '', password: '', confirmar: '' };

function RegistroPage() {
  const { entrar } = useAuth();
  const navegar = useNavigate();
  const [form, setForm] = useState(INICIAL);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setErrores({});
    if (form.password !== form.confirmar) {
      setErrores({ confirmar: 'Las contraseñas no coinciden.' });
      return;
    }
    setEnviando(true);
    try {
      await registrarUsuario({
        nombre: form.nombre,
        apellido: form.apellido,
        correo: form.correo,
        password: form.password
      });
      await entrar(form.correo, form.password);
      navegar('/medicamentos', { replace: true });
    } catch (err) {
      if (err.status === 400 && err.datos && typeof err.datos === 'object') {
        const porCampo = {};
        Object.entries(err.datos).forEach(([campo, mensajes]) => {
          porCampo[campo] = [].concat(mensajes).join(' ');
        });
        setErrores(porCampo);
      } else {
        setError(err.message);
      }
    } finally {
      setEnviando(false);
    }
  };

  const errorDe = (campo) => errores[campo] && <small className="auth-error-campo">{errores[campo]}</small>;

  return (
    <AuthLayout
      titulo="Crear cuenta"
      subtitulo="Tu correo será tu usuario y a él llegarán las alertas."
      pie={<>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></>}
    >
      {error && <p className="alerta alerta-error" role="alert">{error}</p>}
      <form className="auth-form" onSubmit={enviar} noValidate={false}>
        <div className="auth-fila">
          <div className="auth-campo">
            <label htmlFor="reg-nombre">Nombre</label>
            <input id="reg-nombre" name="nombre" value={form.nombre} onChange={cambiar} autoComplete="given-name" required />
            {errorDe('nombre')}
          </div>
          <div className="auth-campo">
            <label htmlFor="reg-apellido">Apellido</label>
            <input id="reg-apellido" name="apellido" value={form.apellido} onChange={cambiar} autoComplete="family-name" required />
            {errorDe('apellido')}
          </div>
        </div>
        <div className="auth-campo">
          <label htmlFor="reg-correo">Correo electrónico</label>
          <input id="reg-correo" name="correo" type="email" value={form.correo} onChange={cambiar} autoComplete="email" required />
          {errorDe('correo')}
        </div>
        <CampoPassword
          id="reg-password"
          label="Contraseña"
          value={form.password}
          onChange={cambiar}
          autoComplete="new-password"
          ayuda="Mínimo 8 caracteres, que no sea solo números ni muy común."
        />
        {errorDe('password')}
        <CampoPassword
          id="reg-confirmar"
          name="confirmar"
          label="Confirmar contraseña"
          value={form.confirmar}
          onChange={cambiar}
          autoComplete="new-password"
        />
        {errorDe('confirmar')}
        <button type="submit" disabled={enviando}>{enviando ? 'Creando cuenta...' : 'Crear cuenta'}</button>
      </form>
    </AuthLayout>
  );
}

export default RegistroPage;
