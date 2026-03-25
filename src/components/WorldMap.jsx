import { Suspense, lazy, useEffect, useRef, useState } from "react";
import {
  calcularAltoPanel,
  calcularAltoMapa,
  cargarScript,
  registrarEventosMapa,
  TITULO_INICIAL,
} from "../utils/mapa";
import { pedirClima, pedirPais } from "../utils/paisClima";
import { clasificarTemperatura, pedirPokemons } from "../utils/pokemon";

const PanelPais = lazy(() => import("./PanelPais"));
const ES_DESARROLLO = import.meta.env.DEV;

export default function WorldMap() {
  const [titulo, setTitulo] = useState(TITULO_INICIAL);
  const [paisSeleccionado, setPaisSeleccionado] = useState(null);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [datosPais, setDatosPais] = useState(null);
  const [datosClima, setDatosClima] = useState(null);
  const [listaPokemon, setListaPokemon] = useState([]);
  const [errorPais, setErrorPais] = useState(null);
  const [errorClima, setErrorClima] = useState(null);
  const [errorPokemons, setErrorPokemons] = useState(null);
  const [cargandoPais, setCargandoPais] = useState(false);
  const [cargandoClima, setCargandoClima] = useState(false);
  const [cargandoPokemons, setCargandoPokemons] = useState(false);
  const [altoMapa, setAltoMapa] = useState(null);
  const [altoPanel, setAltoPanel] = useState(null);
  const [claveSeleccion, setClaveSeleccion] = useState(0);

  const contenedorRef = useRef(null);
  const logoRef = useRef(null);
  const encabezadoRef = useRef(null);
  const panelRef = useRef(null);
  const claveSeleccionRef = useRef(0);

  const coordsCapital = datosPais?.capitalInfo?.latlng ?? null;
  const temperatura = datosClima?.current?.temperature_2m;
  const perfilPokemon = clasificarTemperatura(temperatura);
  const categoriaPokemon = perfilPokemon?.categoria ?? null;
  const tiposPokemon = perfilPokemon?.tipos ?? null;
  const tiposTexto = tiposPokemon ? tiposPokemon.join(",") : "";
  const panelVisible = Boolean(paisSeleccionado?.id) && panelAbierto;
  const [panelDebajo, setPanelDebajo] = useState(false);
  const [movilHorizontal, setMovilHorizontal] = useState(false);
  const clasesShell = [
    "world-map-shell",
    movilHorizontal ? "world-map-shell--movil-horizontal" : "",
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    const comprobarPanel = () => {
      const telefonoHorizontal =
        window.innerWidth <= 932 &&
        window.innerWidth > window.innerHeight &&
        window.innerHeight <= 540;
      const pantallaPequena = window.innerWidth <= 1100;
      const ventanaBaja = window.innerWidth <= 1180 && window.innerHeight <= 760;

      setMovilHorizontal(telefonoHorizontal);
      setPanelDebajo(!telefonoHorizontal && (pantallaPequena || ventanaBaja));
    };

    comprobarPanel();
    window.addEventListener("resize", comprobarPanel);

    return () => window.removeEventListener("resize", comprobarPanel);
  }, []);

  useEffect(() => {
    let cancelado = false;

    const cambiarPais = (event) => {
      const detalle = event.detail ?? {};
      const nuevaClave = claveSeleccionRef.current + 1;

      claveSeleccionRef.current = nuevaClave;

      setDatosPais(null);
      setDatosClima(null);
      setListaPokemon([]);
      setErrorPais(null);
      setErrorClima(null);
      setErrorPokemons(null);
      setCargandoPais(Boolean(detalle.pais));
      setCargandoClima(false);
      setCargandoPokemons(false);
      setPaisSeleccionado(detalle.pais ?? null);
      setPanelAbierto(Boolean(detalle.pais));
      setTitulo(detalle.titulo ?? TITULO_INICIAL);
      setClaveSeleccion(nuevaClave);
    };

    async function iniciarMapa() {
      try {
        await cargarScript("/simplemaps/mapdata.js", "simplemaps-mapdata");
        await cargarScript("/simplemaps/worldmap.js", "simplemaps-worldmap");

        if (cancelado) return;

        registrarEventosMapa();

        setTimeout(() => {
          document.body.style.removeProperty("position");
        }, 0);
      } catch (error) {
        console.error("Error inicializando el mapa:", error);
      }
    }

    window.addEventListener("simplemaps-country-change", cambiarPais);
    iniciarMapa();

    return () => {
      cancelado = true;
      window.removeEventListener("simplemaps-country-change", cambiarPais);
    };
  }, []);

  useEffect(() => {
    if (!paisSeleccionado?.id) return;

    const controller = new AbortController();
    const claveActual = claveSeleccion;

    async function cargarPais() {
      setCargandoPais(true);
      setErrorPais(null);

      try {
        const pais = await pedirPais(paisSeleccionado.id, controller.signal);

        if (controller.signal.aborted || claveSeleccionRef.current !== claveActual) {
          return;
        }

        setDatosPais(pais);
      } catch (error) {
        if (error.name === "AbortError" || claveSeleccionRef.current !== claveActual) {
          return;
        }

        console.error("Error cargando datos del país:", error);
        setDatosPais(null);
        setDatosClima(null);
        setListaPokemon([]);
        setErrorPais("No se pudo cargar la información del país");
        setErrorClima(null);
        setErrorPokemons(null);
      } finally {
        if (!controller.signal.aborted && claveSeleccionRef.current === claveActual) {
          setCargandoPais(false);
        }
      }
    }

    cargarPais();

    return () => controller.abort();
  }, [paisSeleccionado?.id, claveSeleccion]);

  useEffect(() => {
    if (!coordsCapital || coordsCapital.length < 2) {
      setDatosClima(null);
      setListaPokemon([]);
      setErrorClima(null);
      setErrorPokemons(null);
      setCargandoClima(false);
      setCargandoPokemons(false);
      return;
    }

    const controller = new AbortController();
    const claveActual = claveSeleccion;

    async function cargarClima() {
      setCargandoClima(true);
      setErrorClima(null);

      try {
        const clima = await pedirClima(coordsCapital, controller.signal);

        if (controller.signal.aborted || claveSeleccionRef.current !== claveActual) {
          return;
        }

        setDatosClima(clima);
      } catch (error) {
        if (error.name === "AbortError" || claveSeleccionRef.current !== claveActual) {
          return;
        }

        console.error("Error cargando clima:", error);
        setDatosClima(null);
        setListaPokemon([]);
        setErrorClima("No se pudo obtener el clima");
        setErrorPokemons(null);
      } finally {
        if (!controller.signal.aborted && claveSeleccionRef.current === claveActual) {
          setCargandoClima(false);
        }
      }
    }

    cargarClima();

    return () => controller.abort();
  }, [coordsCapital, claveSeleccion]);

  useEffect(() => {
    const tipos = tiposTexto ? tiposTexto.split(",") : [];

    if (
      !paisSeleccionado?.id ||
      temperatura === null ||
      temperatura === undefined ||
      tipos.length < 3
    ) {
      setListaPokemon([]);
      setErrorPokemons(null);
      setCargandoPokemons(false);
      return;
    }

    const controller = new AbortController();
    const claveActual = claveSeleccion;

    async function cargarPokemons() {
      setCargandoPokemons(true);
      setErrorPokemons(null);
      setListaPokemon([]);

      try {
        const pokemons = await pedirPokemons(
          tipos,
          paisSeleccionado.id,
          temperatura,
          controller.signal
        );

        if (controller.signal.aborted || claveSeleccionRef.current !== claveActual) {
          return;
        }

        setListaPokemon(pokemons);
      } catch (error) {
        if (error.name === "AbortError" || claveSeleccionRef.current !== claveActual) {
          return;
        }

        console.error("Error generando lista de Pokémon:", error);
        setListaPokemon([]);
        setErrorPokemons("Error al cargar los Pokémon");
      } finally {
        if (!controller.signal.aborted && claveSeleccionRef.current === claveActual) {
          setCargandoPokemons(false);
        }
      }
    }

    cargarPokemons();

    return () => controller.abort();
  }, [paisSeleccionado?.id, temperatura, tiposTexto, claveSeleccion]);

  useEffect(() => {
    if (!ES_DESARROLLO) return;

    if (paisSeleccionado) {
      console.log("País seleccionado:", paisSeleccionado);
    } else {
      console.log("País seleccionado limpiado");
    }
  }, [paisSeleccionado]);

  useEffect(() => {
    if (!ES_DESARROLLO) return;

    if (datosPais) {
      console.log("Datos útiles del país:");
      console.log("Nombre:", datosPais.name?.common);
      console.log("Capital:", datosPais.capital?.[0]);
      console.log("Coordenadas capital:", datosPais.capitalInfo?.latlng);
      console.log("Bandera:", datosPais.flags?.png || datosPais.flags?.svg);
      console.log("Idiomas:", datosPais.languages);
    }
  }, [datosPais]);

  useEffect(() => {
    if (!ES_DESARROLLO) return;

    if (datosClima) {
      console.log("Temperatura actual:", datosClima.current?.temperature_2m);
    }
  }, [datosClima]);

  useEffect(() => {
    if (!ES_DESARROLLO) return;

    if (categoriaPokemon && tiposTexto) {
      console.log("Categoría Pokémon:", categoriaPokemon);
      console.log("Tipos Pokémon recomendados:", tiposTexto.split(","));
    }
  }, [categoriaPokemon, tiposTexto]);

  useEffect(() => {
    if (!ES_DESARROLLO) return;

    if (listaPokemon.length > 0) {
      console.log("Pokémon listos para mostrar:", listaPokemon);
    }
  }, [listaPokemon]);

  useEffect(() => {
    const contenedor = contenedorRef.current;
    const logo = logoRef.current;
    const encabezado = encabezadoRef.current;
    const panel = panelRef.current;

    if (!contenedor || !logo || !encabezado) return;

    const actualizarAlto = () => {
      if (panelVisible && panelDebajo) {
        setAltoPanel(calcularAltoPanel(contenedor, logo, encabezado));
      } else {
        setAltoPanel(null);
      }

      setAltoMapa(calcularAltoMapa(contenedor, logo, encabezado, panelVisible && panelDebajo));
    };

    actualizarAlto();

    const resizeObserver = new ResizeObserver(actualizarAlto);
    resizeObserver.observe(contenedor);
    resizeObserver.observe(logo);
    resizeObserver.observe(encabezado);
    if (panelVisible && panelDebajo && panel) {
      resizeObserver.observe(panel);
    }
    window.addEventListener("resize", actualizarAlto);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", actualizarAlto);
    };
  }, [titulo, panelVisible, panelDebajo]);

  return (
    <main className="world-map-page">
      <section
        ref={contenedorRef}
        className={clasesShell}
        style={
          altoMapa !== null || altoPanel !== null
            ? {
                ...(altoMapa !== null
                  ? { "--map-stage-max-height": `${altoMapa}px` }
                  : {}),
                ...(altoPanel !== null ? { "--panel-max-height": `${altoPanel}px` } : {}),
              }
            : undefined
        }
      >
        <img
          ref={logoRef}
          className="pokemon-logo"
          src="/media/pokeball-logo.png"
          alt="Poké Ball"
        />

        <header ref={encabezadoRef} className="world-map-header">
          <p className="world-map-eyebrow">Pokemon world atlas</p>
          <h1 id="mapTitle" className="world-map-title" data-title={titulo}>
            {titulo}
          </h1>
        </header>

        <div className="world-map-stage">
          <div id="map" className="world-map-canvas" />
        </div>

        {panelVisible ? (
          <Suspense fallback={null}>
            <PanelPais
              abierto={panelVisible}
              alCerrar={() => setPanelAbierto(false)}
              panelRef={panelRef}
              paisSeleccionado={paisSeleccionado}
              datosPais={datosPais}
              datosClima={datosClima}
              categoriaPokemon={categoriaPokemon}
              tiposPokemon={tiposPokemon}
              listaPokemon={listaPokemon}
              errorPais={errorPais}
              errorClima={errorClima}
              errorPokemons={errorPokemons}
              cargandoPais={cargandoPais}
              cargandoClima={cargandoClima}
              cargandoPokemons={cargandoPokemons}
            />
          </Suspense>
        ) : null}
      </section>
    </main>
  );
}
