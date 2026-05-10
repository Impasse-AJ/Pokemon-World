import { useEffect, useState } from "react";
import WorldMap from "./components/WorldMap";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import { cerrarSesion, obtenerUsuarioActual } from "./services/auth";

// Vistas posibles: 'landing' | 'login' | 'register' | 'mapa'
const VISTA_INICIAL = "landing";

function App() {
  const [vista, setVista] = useState(VISTA_INICIAL);
  // Simplemaps se inicializa una sola vez. Una vez que WorldMap se monta,
  // lo mantenemos en el DOM y solo lo ocultamos para no romper el mapa.
  const [mapaInicializado, setMapaInicializado] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [comprobandoSesion, setComprobandoSesion] = useState(true);
  const [mensajeLogin, setMensajeLogin] = useState("");
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

  const irALogin = (mensaje = "") => {
    setMensajeLogin(mensaje);
    setVista("login");
  };

  const irARegistro = () => {
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
      setVista("landing");
    }
  };

  return (
    <>
      {/* WorldMap: se monta cuando el usuario entra por primera vez y nunca se desmonta */}
      <div className={clasesVistaMapa}>
        {mapaInicializado && <WorldMap onVolver={() => setVista("landing")} />}
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
          onVolver={() => setVista("landing")}
          onRegistro={irARegistro}
          onMapa={irAlMapa}
          onLoginCorrecto={manejarLoginCorrecto}
          mensajeInicial={mensajeLogin}
        />
      )}

      {vista === "register" && (
        <RegisterPage
          onVolver={() => setVista("landing")}
          onLogin={() => irALogin()}
          onRegistroCorrecto={manejarRegistroCorrecto}
        />
      )}
    </>
  );
}

export default App;
