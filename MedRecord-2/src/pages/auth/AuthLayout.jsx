function AuthLayout({ titulo, subtitulo, children, pie }) {
  return (
    <main className="auth-pantalla">
      <section className="auth-tarjeta">
        <div className="auth-marca">
          <span className="auth-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="9" y="3" width="6" height="18" rx="1.5" fill="currentColor" />
              <rect x="3" y="9" width="18" height="6" rx="1.5" fill="currentColor" />
            </svg>
          </span>
          <span>MedRecord</span>
        </div>
        <h1>{titulo}</h1>
        {subtitulo && <p className="texto-suave auth-subtitulo">{subtitulo}</p>}
        {children}
        {pie && <div className="auth-pie">{pie}</div>}
      </section>
    </main>
  );
}

export default AuthLayout;
