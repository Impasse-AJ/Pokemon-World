import { useState } from "react";
import { Compass, Menu, X } from "lucide-react";

function claseBotonTexto(activo) {
  return activo ? "auth-btn-nav-texto auth-btn-nav-activo" : "auth-btn-nav-texto";
}

function claseBotonDorado(activo) {
  return activo ? "auth-btn-nav-dorado auth-btn-nav-dorado-activo" : "auth-btn-nav-dorado";
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
  const [menuAbierto, setMenuAbierto] = useState(false);

  const manejarClick = (accion) => {
    setMenuAbierto(false);
    accion?.();
  };

  const renderAcciones = (esMovil = false) => (
    <>
      <button className={claseBotonTexto(esLanding)} onClick={() => manejarClick(onInicio)}>
        Inicio
      </button>
      <button className="auth-btn-nav-outline" onClick={() => manejarClick(onMapa)}>
        Explorar Mapa
      </button>

      {!esMovil ? <div className="auth-nav-separador" /> : null}

      {usuario ? (
        <>
          <span className="auth-nav-usuario">Hola, {usuario.username}</span>
          <button className="auth-btn-nav-dorado auth-btn-nav-suave" onClick={() => manejarClick(onLogout)}>
            Cerrar sesión
          </button>
        </>
      ) : (
        <>
          <button className={claseBotonTexto(esLogin)} onClick={() => manejarClick(onLogin)}>
            Entrar
          </button>
          <button className={claseBotonDorado(esRegistro)} onClick={() => manejarClick(onRegistro)}>
            Registrarse
          </button>
        </>
      )}
    </>
  );

  return (
    <nav className="auth-nav">
      <div className="auth-nav-inner">
        <button className="auth-nav-logo auth-nav-logo-boton" onClick={() => manejarClick(onInicio)}>
          <span className="auth-nav-logo-icono">
            <Compass size={22} />
          </span>
          <span className="auth-nav-logo-texto">Pokémon World Map</span>
        </button>

        <div className="auth-nav-acciones auth-nav-links">
          {renderAcciones()}
        </div>

        <button
          type="button"
          className="auth-nav-menu-btn"
          onClick={() => setMenuAbierto((valor) => !valor)}
          aria-label={menuAbierto ? "Cerrar menu de navegacion" : "Abrir menu de navegacion"}
          aria-expanded={menuAbierto}
          aria-controls="auth-nav-mobile"
        >
          {menuAbierto ? <X size={19} /> : <Menu size={19} />}
          <span>Menú</span>
        </button>
      </div>

      {menuAbierto ? (
        <div id="auth-nav-mobile" className="auth-nav-mobile">
          {renderAcciones(true)}
        </div>
      ) : null}
    </nav>
  );
}
