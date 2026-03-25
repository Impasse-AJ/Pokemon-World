export const TITULO_INICIAL = "Pokémon World Map";

const ALTO_MINIMO_MAPA = 220;
const ALTO_MINIMO_MAPA_COMPACTO = 96;
const ALTO_OBJETIVO_PANEL = 180;
const ALTO_OBJETIVO_PANEL_COMPACTO = 140;
const RELACION_MAPA = 2018.99 / 864.56;

function esPantallaCompacta(contenedor) {
  return contenedor.clientWidth <= 480 || contenedor.clientHeight <= 560;
}

function esMovilHorizontal(contenedor) {
  return contenedor.classList.contains("world-map-shell--movil-horizontal");
}

export function cargarScript(src, id) {
  return new Promise((resolve, reject) => {
    const scriptActual = document.getElementById(id);

    if (scriptActual) {
      const srcActual = scriptActual.getAttribute("src");

      if (srcActual !== src) {
        scriptActual.remove();
      } else {
        if (scriptActual.dataset.loaded === "true") {
          resolve();
        } else {
          scriptActual.addEventListener("load", resolve, { once: true });
          scriptActual.addEventListener(
            "error",
            () => reject(new Error(`No se pudo cargar ${src}`)),
            { once: true }
          );
        }
        return;
      }
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = false;

    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };

    script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));

    document.body.appendChild(script);
  });
}

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

export function registrarEventosMapa() {
  if (window.__simplemaps_hooks_registered__) return;

  const hooks = window.simplemaps_worldmap?.plugin_hooks?.zooming_complete;
  if (!Array.isArray(hooks)) return;

  window.__simplemaps_hooks_registered__ = true;

  hooks.push(function () {
    const seleccion = obtenerSeleccionMapa();

    window.dispatchEvent(
      new CustomEvent("simplemaps-country-change", {
        detail: seleccion,
      })
    );
  });
}

export function calcularAltoMapa(contenedor, logo, encabezado, panelDebajo = false) {
  const estilos = window.getComputedStyle(contenedor);
  const gap = parseFloat(estilos.rowGap || estilos.gap || "0");

  if (panelDebajo) {
    const pantallaCompacta = esPantallaCompacta(contenedor);
    const altoDisponible =
      contenedor.clientHeight - logo.offsetHeight - encabezado.offsetHeight - gap * 3;
    const altoNatural = Math.floor(contenedor.clientWidth / RELACION_MAPA);
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
    ? Math.max(logo.offsetHeight, encabezado.offsetHeight) + gap
    : logo.offsetHeight + encabezado.offsetHeight + gap * 2;

  let altoDisponible = contenedor.clientHeight - altoCabecera;

  return Math.max(ALTO_MINIMO_MAPA, Math.floor(altoDisponible));
}

export function calcularAltoPanel(contenedor, logo, encabezado) {
  const estilos = window.getComputedStyle(contenedor);
  const gap = parseFloat(estilos.rowGap || estilos.gap || "0");

  const altoLibre =
    contenedor.clientHeight -
    logo.offsetHeight -
    encabezado.offsetHeight -
    gap * 3;

  const altoMapa = calcularAltoMapa(contenedor, logo, encabezado, true);

  return Math.max(0, Math.floor(altoLibre - altoMapa));
}
