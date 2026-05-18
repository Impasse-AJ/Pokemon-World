import { Compass } from "lucide-react";

function claseBotonTexto(activo) {
  return activo ? "auth-btn-nav-texto auth-btn-nav-activo" : "auth-btn-nav-texto";
}

export default function AuthNav({
  usuario,
  vistaActual,
  onInicio,
  onMapa,
  onLogin,
  onRegistro,
  onLogout,
}) {
  const esLanding = vistaActual === "landing";
  const esLogin = vistaActual === "login";
  const esRegistro = vistaActual === "register";

  return (
    <nav className="auth-nav">
      <div className="auth-nav-inner">
        <button className="auth-nav-logo auth-nav-logo-boton" onClick={onInicio}>
          <span className="auth-nav-logo-icono">
            <Compass size={22} />
          </span>
          <span className="auth-nav-logo-texto">Pokemon World Map</span>
        </button>

        <div className="auth-nav-acciones">
          <button className={claseBotonTexto(esLanding)} onClick={onInicio}>
            Inicio
          </button>
          <button className="auth-btn-nav-outline" onClick={onMapa}>
            Explorar Mapa
          </button>
          <div className="auth-nav-separador" />

          {usuario ? (
            <>
              <span className="auth-nav-usuario">Hola, {usuario.username}</span>
              <button className="auth-btn-nav-dorado auth-btn-nav-suave" onClick={onLogout}>
                Cerrar sesion
              </button>
            </>
          ) : (
            <>
              <button className={claseBotonTexto(esLogin)} onClick={onLogin}>
                Entrar
              </button>
              <button
                className={
                  esRegistro ? "auth-btn-nav-dorado auth-btn-nav-dorado-activo" : "auth-btn-nav-dorado"
                }
                onClick={onRegistro}
              >
                Registrarse
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
