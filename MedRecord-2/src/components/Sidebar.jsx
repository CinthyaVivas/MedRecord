import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

function Sidebar() {
  const [colapsado, setColapsado] = useState(false);
  const { usuario, salir } = useAuth();
  const navegar = useNavigate();

  const cerrarSesion = () => {
    salir();
    navegar('/login', { replace: true });
  };

  const nombre = `${usuario?.nombre || ''} ${usuario?.apellido || ''}`.trim() || usuario?.correo;

  return (
    <aside className={`sidebar ${colapsado ? 'sidebar-colapsado' : ''}`}>
      <div className="sidebar-header">
        {!colapsado && <h2>MedRecord</h2>}
        <button
          className="sidebar-toggle"
          onClick={() => setColapsado(!colapsado)}
          aria-label="Contraer menú"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink
  to="/medicamentos"
  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
>
  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="7" width="15" height="7.5" rx="3.75" transform="rotate(-35 1.5 7)" fill="currentColor"/>
    <circle cx="15" cy="15" r="6.5" fill="currentColor"/>
    <line x1="10.5" y1="19.5" x2="19.5" y2="10.5" stroke="var(--sidebar-icon-bg, #3683FF)" strokeWidth="1.6"/>
  </svg>
  {!colapsado && <span>Medicamentos</span>}
</NavLink>

<NavLink
  to="/citas"
  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
>
  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6 C9 3.5 10.5 2 12 2 C13.5 2 15 3.5 15 6 C15 8 13.8 9 12 9.5 C10.2 9 9 8 9 6 Z"/>
    <path d="M8.5 9.5 C6.5 10.2 5 12 5 15 L5 20 L19 20 L19 15 C19 12 17.5 10.2 15.5 9.5"/>
    <path d="M9 13.5 C9 15.5 10.5 16.5 12 16.5 C13.5 16.5 15 15.5 15 13.5"/>
  </svg>
  {!colapsado && <span>Citas</span>}
</NavLink>

<NavLink
  to="/recordatorios"
  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
>
  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 7v5l3 2"/>
  </svg>
  {!colapsado && <span>Recordatorios</span>}
</NavLink>
      </nav>

      <div className="sidebar-usuario">
        {!colapsado && (
          <div className="sidebar-usuario-datos">
            <strong>{nombre}</strong>
            <span>{usuario?.correo}</span>
          </div>
        )}
        <button
          type="button"
          className="sidebar-salir"
          onClick={cerrarSesion}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
            <path d="M10 17l-5-5 5-5" />
            <path d="M5 12h11" />
          </svg>
          {!colapsado && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;