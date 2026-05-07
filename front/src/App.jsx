import { useState } from "react";
import WorldMap from "./components/WorldMap";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";

// Vistas posibles: 'landing' | 'login' | 'register' | 'mapa'
const VISTA_INICIAL = "landing";

function App() {
  const [vista, setVista] = useState(VISTA_INICIAL);
  // Simplemaps se inicializa una sola vez. Una vez que WorldMap se monta,
  // lo mantenemos en el DOM y solo lo ocultamos para no romper el mapa.
  const [mapaInicializado, setMapaInicializado] = useState(false);
  const clasesVistaMapa = vista === "mapa" ? "vista-mapa vista-mapa--activa" : "vista-mapa";

  const irAlMapa = () => {
    setMapaInicializado(true);
    setVista("mapa");
  };

  return (
    <>
      {/* WorldMap: se monta cuando el usuario entra por primera vez y nunca se desmonta */}
      <div className={clasesVistaMapa}>
        {mapaInicializado && <WorldMap onVolver={() => setVista("landing")} />}
      </div>

      {vista === "landing" && (
        <LandingPage
          onMapa={irAlMapa}
          onLogin={() => setVista("login")}
          onRegistro={() => setVista("register")}
        />
      )}

      {vista === "login" && (
        <LoginPage
          onVolver={() => setVista("landing")}
          onRegistro={() => setVista("register")}
          onMapa={irAlMapa}
        />
      )}

      {vista === "register" && (
        <RegisterPage
          onVolver={() => setVista("landing")}
          onLogin={() => setVista("login")}
        />
      )}
    </>
  );
}

export default App;
