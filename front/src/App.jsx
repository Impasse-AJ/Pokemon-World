import { useEffect, useState } from "react";
import WorldMap from "./components/WorldMap";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import ConfirmAccountPage from "./components/ConfirmAccountPage";
import { cerrarSesion, obtenerUsuarioActual } from "./services/auth";

// Vistas posibles: 'landing' | 'login' | 'register' | 'mapa' | 'confirmar-cuenta'
const VISTA_INICIAL = "landing";
const VISTA_CONFIRMAR_CUENTA = "confirmar-cuenta";

function esRutaConfirmacionCuenta() {
  return window.location.pathname === "/confirmar-cuenta";
}

function obtenerTokenConfirmacionUrl() {
  if (!esRutaConfirmacionCuenta()) {
    return "";
  }

  const parametros = new URLSearchParams(window.location.search);
  return parametros.get("token") ?? "";
}

function obtenerVistaInicial() {
  return esRutaConfirmacionCuenta() ? VISTA_CONFIRMAR_CUENTA : VISTA_INICIAL;
}

function App() {
  const [vista, setVista] = useState(obtenerVistaInicial);
  // Simplemaps se inicializa una sola vez. Una vez que WorldMap se monta,
  // lo mantenemos en el DOM y solo lo ocultamos para no romper el mapa.
  const [mapaInicializado, setMapaInicializado] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [comprobandoSesion, setComprobandoSesion] = useState(true);
  const [mensajeLogin, setMensajeLogin] = useState("");
  const [tokenConfirmacion, setTokenConfirmacion] = useState(obtenerTokenConfirmacionUrl);
  const clasesVistaMapa = vista === "mapa" ? "vista-mapa vista-mapa--activa" : "vista-mapa";

  useEffect(() => {
    let componenteActivo = true;

    async function comprobarSesion() {
      try {
        const usuarioActual = await obtenerUsuarioActual();

        if (componenteActivo) {
          setUsuario(usuarioActual);
        }
      } catch {
        if (componenteActivo) {
          setUsuario(null);
        }
      } finally {
        if (componenteActivo) {
          setComprobandoSesion(false);
        }
      }
    }

    comprobarSesion();

    return () => {
      componenteActivo = false;
    };
  }, []);

  const limpiarRutaConfirmacion = () => {
    if (esRutaConfirmacionCuenta()) {
      window.history.replaceState({}, "", "/");
    }

    setTokenConfirmacion("");
  };

  const irAInicio = () => {
    limpiarRutaConfirmacion();
    setVista("landing");
  };

  const irALogin = (mensaje = "") => {
    limpiarRutaConfirmacion();
    setMensajeLogin(mensaje);
    setVista("login");
  };

  const irARegistro = () => {
    limpiarRutaConfirmacion();
    setMensajeLogin("");
    setVista("register");
  };

  const irAlMapa = async () => {
    if (comprobandoSesion) {
      irALogin("Estamos comprobando tu sesion. Intentalo de nuevo en un momento.");
      return;
    }

    try {
      const usuarioActual = await obtenerUsuarioActual();
      setUsuario(usuarioActual);
      setMapaInicializado(true);
      limpiarRutaConfirmacion();
      setVista("mapa");
    } catch {
      setUsuario(null);
      irALogin("Inicia sesion para acceder al mapa.");
    }
  };

  const manejarLoginCorrecto = (usuarioLogeado) => {
    setUsuario(usuarioLogeado);
    setMensajeLogin("");
    setMapaInicializado(true);
    setVista("mapa");
  };

  const manejarRegistroCorrecto = (mensaje) => {
    setMensajeLogin(
      mensaje || "Registro completado. Revisa tu bandeja de entrada para activar tu cuenta.",
    );
    setVista("login");
  };

  const manejarLogout = async () => {
    try {
      await cerrarSesion();
    } catch {
      // Si el backend ya cerro la sesion, limpiamos igualmente el estado local.
    } finally {
      setUsuario(null);
      setMensajeLogin("");
      limpiarRutaConfirmacion();
      setVista("landing");
    }
  };

  return (
    <>
      {/* WorldMap: se monta cuando el usuario entra por primera vez y nunca se desmonta */}
      <div className={clasesVistaMapa}>
        {mapaInicializado && <WorldMap onVolver={irAInicio} />}
      </div>

      {vista === "mapa" && usuario ? (
        <div className="sesion-mapa-barra">
          <span>Hola, {usuario.username}</span>
          <button type="button" onClick={manejarLogout}>
            Cerrar sesion
          </button>
        </div>
      ) : null}

      {vista === "landing" && (
        <LandingPage
          usuario={usuario}
          onMapa={irAlMapa}
          onLogout={manejarLogout}
          onLogin={() => irALogin()}
          onRegistro={irARegistro}
        />
      )}

      {vista === "login" && (
        <LoginPage
          onVolver={irAInicio}
          onRegistro={irARegistro}
          onMapa={irAlMapa}
          onLoginCorrecto={manejarLoginCorrecto}
          mensajeInicial={mensajeLogin}
        />
      )}

      {vista === "register" && (
        <RegisterPage
          onVolver={irAInicio}
          onLogin={() => irALogin()}
          onRegistroCorrecto={manejarRegistroCorrecto}
        />
      )}

      {vista === VISTA_CONFIRMAR_CUENTA && (
        <ConfirmAccountPage
          token={tokenConfirmacion}
          onLogin={() => irALogin()}
          onVolver={irAInicio}
        />
      )}
    </>
  );
}

export default App;
