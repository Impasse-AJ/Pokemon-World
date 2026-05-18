import { useEffect, useState } from "react";
import WorldMap from "./components/WorldMap";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import ConfirmAccountPage from "./components/ConfirmAccountPage";
import AuthLayout from "./components/layout/AuthLayout";
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
      irALogin("Estamos comprobando tu sesión. Inténtalo de nuevo en un momento.");
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
      irALogin("Inicia sesión para acceder al mapa.");
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
      // Si el backend ya cerró la sesión, limpiamos igualmente el estado local.
    } finally {
      setUsuario(null);
      setMensajeLogin("");
      limpiarRutaConfirmacion();
      setVista("landing");
    }
  };

  const renderizarVistaPublica = () => {
    if (vista === "landing") {
      return <LandingPage usuario={usuario} onMapa={irAlMapa} onLogin={() => irALogin()} />;
    }

    if (vista === "login") {
      return (
        <LoginPage
          onVolver={irAInicio}
          onRegistro={irARegistro}
          onLoginCorrecto={manejarLoginCorrecto}
          mensajeInicial={mensajeLogin}
        />
      );
    }

    if (vista === "register") {
      return (
        <RegisterPage
          onVolver={irAInicio}
          onLogin={() => irALogin()}
          onRegistroCorrecto={manejarRegistroCorrecto}
        />
      );
    }

    if (vista === VISTA_CONFIRMAR_CUENTA) {
      return (
        <ConfirmAccountPage
          token={tokenConfirmacion}
          onLogin={() => irALogin()}
          onVolver={irAInicio}
        />
      );
    }

    return null;
  };

  const contenidoPublico = renderizarVistaPublica();

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
            Cerrar sesión
          </button>
        </div>
      ) : null}

      {contenidoPublico ? (
        <AuthLayout
          usuario={usuario}
          vistaActual={vista}
          onInicio={irAInicio}
          onMapa={irAlMapa}
          onLogin={() => irALogin()}
          onRegistro={irARegistro}
          onLogout={manejarLogout}
        >
          {contenidoPublico}
        </AuthLayout>
      ) : null}
    </>
  );
}

export default App;
