export const TITULO_INICIAL = "Pokémon World Map";

const ALTO_MINIMO_MAPA = 220;
const ALTO_MINIMO_MAPA_COMPACTO = 96;
const ALTO_OBJETIVO_PANEL = 180;
const ALTO_OBJETIVO_PANEL_COMPACTO = 140;
const PROPORCION_MAPA = 2018.99 / 864.56;

// Detecta ventanas pequeñas donde el mapa y el panel necesitan alturas más contenidas.
function esPantallaCompacta(contenedor) {
  return contenedor.clientWidth <= 480 || contenedor.clientHeight <= 560;
}

// Detecta el modo móvil apaisado que se activa desde WorldMap mediante una clase CSS.
function esMovilHorizontal(contenedor) {
  return contenedor.classList.contains("world-map-contenedor--movil-horizontal");
}

// Carga los scripts originales de Simplemaps en orden y evita duplicarlos si ya existen.
export function cargarScript(rutaScript, id) {
  return new Promise((resolver, rechazar) => {
    const scriptActual = document.getElementById(id);

    if (scriptActual) {
      const rutaActual = scriptActual.getAttribute("src");

      if (rutaActual !== rutaScript) {
        scriptActual.remove();
      } else {
        if (scriptActual.dataset.loaded === "true") {
          resolver();
        } else {
          scriptActual.addEventListener("load", resolver, { once: true });
          scriptActual.addEventListener(
            "error",
            () => rechazar(new Error(`No se pudo cargar ${rutaScript}`)),
            { once: true }
          );
        }
        return;
      }
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = rutaScript;
    script.async = false;

    script.onload = () => {
      script.dataset.loaded = "true";
      resolver();
    };

    script.onerror = () => rechazar(new Error(`No se pudo cargar ${rutaScript}`));

    document.body.appendChild(script);
  });
}

// Lee la selección activa dentro de Simplemaps y la transforma en datos simples para React.
function obtenerSeleccionMapa() {
  const mapa = window.simplemaps_worldmap;
  const datosMapa = window.simplemaps_worldmap_mapdata;
  const id = mapa.zoom_level_id;

  if (!id) {
    return { titulo: TITULO_INICIAL, pais: null };
  }

  if (datosMapa.state_specific?.[id]) {
    const nombre = datosMapa.state_specific[id].name;
    return { titulo: nombre, pais: { id, name: nombre } };
  }

  if (datosMapa.regions?.[id]) {
    return { titulo: datosMapa.regions[id].name, pais: null };
  }

  if (window.simplemaps_worldmap_mapinfo?.names?.[id]) {
    const nombre = window.simplemaps_worldmap_mapinfo.names[id];
    return { titulo: nombre, pais: { id, name: nombre } };
  }

  return { titulo: id, pais: null };
}

// Conecta el evento interno de zoom de Simplemaps con un evento propio que WorldMap puede escuchar.
export function registrarEventosMapa() {
  if (window.__simplemaps_hooks_registered__) return;

  const ganchos = window.simplemaps_worldmap?.plugin_hooks?.zooming_complete;
  if (!Array.isArray(ganchos)) return;

  window.__simplemaps_hooks_registered__ = true;

  ganchos.push(function () {
    const seleccion = obtenerSeleccionMapa();

    window.dispatchEvent(
      new CustomEvent("simplemaps-country-change", {
        detail: seleccion,
      })
    );
  });
}

// Calcula la altura máxima del mapa según el espacio real disponible y si el panel va debajo.
export function calcularAltoMapa(contenedor, logo, encabezado, panelDebajo = false) {
  const estilos = window.getComputedStyle(contenedor);
  const separacion = parseFloat(estilos.rowGap || estilos.gap || "0");

  if (panelDebajo) {
    const pantallaCompacta = esPantallaCompacta(contenedor);
    const altoDisponible =
      contenedor.clientHeight - logo.offsetHeight - encabezado.offsetHeight - separacion * 3;
    const altoNatural = Math.floor(contenedor.clientWidth / PROPORCION_MAPA);
    const altoMinimo = Math.min(
      altoNatural,
      pantallaCompacta ? ALTO_MINIMO_MAPA_COMPACTO : ALTO_MINIMO_MAPA
    );
    const altoObjetivoPanel = pantallaCompacta
      ? ALTO_OBJETIVO_PANEL_COMPACTO
      : ALTO_OBJETIVO_PANEL;
    const altoSugerido = Math.min(altoNatural, Math.floor(altoDisponible - altoObjetivoPanel));

    return Math.max(altoMinimo, altoSugerido);
  }

  const altoCabecera = esMovilHorizontal(contenedor)
    ? Math.max(logo.offsetHeight, encabezado.offsetHeight) + separacion
    : logo.offsetHeight + encabezado.offsetHeight + separacion * 2;

  let altoDisponible = contenedor.clientHeight - altoCabecera;

  return Math.max(ALTO_MINIMO_MAPA, Math.floor(altoDisponible));
}

// Calcula cuánto espacio queda para el panel cuando se coloca debajo del mapa.
// La página no debe hacer scroll innecesario; el scroll principal queda dentro del panel.
export function calcularAltoPanel(contenedor, logo, encabezado) {
  const estilos = window.getComputedStyle(contenedor);
  const separacion = parseFloat(estilos.rowGap || estilos.gap || "0");

  const altoLibre =
    contenedor.clientHeight -
    logo.offsetHeight -
    encabezado.offsetHeight -
    separacion * 3;

  const altoMapa = calcularAltoMapa(contenedor, logo, encabezado, true);

  return Math.max(0, Math.floor(altoLibre - altoMapa));
}
