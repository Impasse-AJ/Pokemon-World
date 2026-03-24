import { useEffect, useRef, useState } from "react";

const TITULO_INICIAL = "Pokémon World Map";
const ALTO_MINIMO_MAPA = 220;
const LIMITE_POKEMON = 20;

function clasificarTemperatura(temperatura) {
  if (temperatura === null || temperatura === undefined) return null;

  if (temperatura <= -5) {
    return { categoria: "polar", tipos: ["ice", "water", "steel"] };
  }

  if (temperatura <= 3) {
    return { categoria: "muy frío", tipos: ["ice", "water", "flying"] };
  }

  if (temperatura <= 9) {
    return { categoria: "frío", tipos: ["ice", "water", "normal"] };
  }

  if (temperatura <= 15) {
    return { categoria: "fresco", tipos: ["grass", "flying", "normal"] };
  }

  if (temperatura <= 21) {
    return { categoria: "templado", tipos: ["grass", "normal", "bug"] };
  }

  if (temperatura <= 27) {
    return {
      categoria: "templado cálido",
      tipos: ["grass", "ground", "fighting"],
    };
  }

  if (temperatura <= 33) {
    return { categoria: "cálido", tipos: ["fire", "ground", "rock"] };
  }

  if (temperatura <= 39) {
    return { categoria: "muy cálido", tipos: ["fire", "rock", "dragon"] };
  }

  return { categoria: "extremo", tipos: ["fire", "ground", "dragon"] };
}

function crearSemilla(texto) {
  let semilla = 0;

  for (let i = 0; i < texto.length; i++) {
    semilla = (semilla * 31 + texto.charCodeAt(i)) >>> 0;
  }

  return semilla;
}

function mezclarConSemilla(lista, semilla) {
  const copia = [...lista];
  let semillaActual = semilla;

  function numeroAleatorio() {
    semillaActual = (semillaActual * 1664525 + 1013904223) % 4294967296;
    return semillaActual / 4294967296;
  }

  for (let i = copia.length - 1; i > 0; i--) {
    const indice = Math.floor(numeroAleatorio() * (i + 1));
    [copia[i], copia[indice]] = [copia[indice], copia[i]];
  }

  return copia;
}

function cargarScript(src, id) {
  return new Promise((resolve, reject) => {
    const scriptActual = document.getElementById(id);

    if (scriptActual) {
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

function registrarEventosMapa() {
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

async function pedirJson(url, signal, errorTexto) {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`${errorTexto}: ${response.status}`);
  }

  return response.json();
}

async function pedirPais(idPais, signal) {
  const data = await pedirJson(
    `https://restcountries.com/v3.1/alpha/${idPais}?fields=name,capital,capitalInfo,flags,languages,cca2`,
    signal,
    "Error REST Countries"
  );

  return Array.isArray(data) ? data[0] : data;
}

async function pedirClima(coords, signal) {
  const [latitud, longitud] = coords;

  return pedirJson(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&current=temperature_2m`,
    signal,
    "Error Open-Meteo"
  );
}

function sacarNombresTipo(dataTipo) {
  return dataTipo.pokemon.map((item) => item.pokemon.name);
}

function meterNombresUnicos(resultado, usados, lista, limite) {
  for (const nombre of lista) {
    if (!usados.has(nombre)) {
      usados.add(nombre);
      resultado.push(nombre);
    }

    if (resultado.length >= limite) return;
  }
}

function crearListaNombres(idPais, temperatura, nombresPorTipo) {
  const [lista1, lista2, lista3] = nombresPorTipo;
  const semillaBase = crearSemilla(`${idPais}-${Math.round(temperatura)}`);

  const mezcla1 = mezclarConSemilla(lista1, semillaBase + 1);
  const mezcla2 = mezclarConSemilla(lista2, semillaBase + 2);
  const mezcla3 = mezclarConSemilla(lista3, semillaBase + 3);

  const nombres = [];
  const usados = new Set();

  meterNombresUnicos(nombres, usados, mezcla1, 8);
  meterNombresUnicos(nombres, usados, mezcla2, 14);
  meterNombresUnicos(nombres, usados, mezcla3, 18);

  const resto = mezclarConSemilla(
    [...new Set([...lista1, ...lista2, ...lista3])],
    semillaBase + 99
  );

  meterNombresUnicos(nombres, usados, resto, LIMITE_POKEMON);

  return nombres.slice(0, LIMITE_POKEMON);
}

function crearPokemon(dataPokemon) {
  return {
    id: dataPokemon.id,
    name: dataPokemon.name,
    image:
      dataPokemon.sprites.other["official-artwork"].front_default ||
      dataPokemon.sprites.front_default,
    types: dataPokemon.types.map((tipo) => tipo.type.name),
  };
}

async function pedirPokemons(tipos, idPais, temperatura, signal) {
  const datosTipos = await Promise.all(
    tipos.map((tipo) =>
      pedirJson(
        `https://pokeapi.co/api/v2/type/${tipo}`,
        signal,
        "Error PokéAPI tipos"
      )
    )
  );

  const nombresPorTipo = datosTipos.map(sacarNombresTipo);
  const nombres = crearListaNombres(idPais, temperatura, nombresPorTipo);

  const datosPokemon = await Promise.all(
    nombres.map((nombre) =>
      pedirJson(
        `https://pokeapi.co/api/v2/pokemon/${nombre}`,
        signal,
        "Error PokéAPI detalle"
      )
    )
  );

  return datosPokemon.map(crearPokemon);
}

function calcularAltoMapa(contenedor, logo, encabezado) {
  const estilos = window.getComputedStyle(contenedor);
  const gap = parseFloat(estilos.rowGap || estilos.gap || "0");

  const altoDisponible =
    contenedor.clientHeight - logo.offsetHeight - encabezado.offsetHeight - gap * 2;

  return Math.max(ALTO_MINIMO_MAPA, Math.floor(altoDisponible));
}

export default function WorldMap() {
  const [titulo, setTitulo] = useState(TITULO_INICIAL);
  const [paisSeleccionado, setPaisSeleccionado] = useState(null);
  const [datosPais, setDatosPais] = useState(null);
  const [datosClima, setDatosClima] = useState(null);
  const [listaPokemon, setListaPokemon] = useState([]);
  const [altoMapa, setAltoMapa] = useState(null);

  const contenedorRef = useRef(null);
  const logoRef = useRef(null);
  const encabezadoRef = useRef(null);

  const coordsCapital = datosPais?.capitalInfo?.latlng ?? null;
  const temperatura = datosClima?.current?.temperature_2m;
  const perfilPokemon = clasificarTemperatura(temperatura);
  const categoriaPokemon = perfilPokemon?.categoria ?? null;
  const tiposPokemon = perfilPokemon?.tipos ?? null;
  const tiposTexto = tiposPokemon ? tiposPokemon.join(",") : "";

  useEffect(() => {
    let cancelado = false;

    const cambiarPais = (event) => {
      const detalle = event.detail ?? {};

      setDatosPais(null);
      setDatosClima(null);
      setListaPokemon([]);
      setPaisSeleccionado(detalle.pais ?? null);
      setTitulo(detalle.titulo ?? TITULO_INICIAL);
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

    async function cargarPais() {
      try {
        const pais = await pedirPais(paisSeleccionado.id, controller.signal);
        setDatosPais(pais);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Error cargando datos del país:", error);
        setDatosPais(null);
      }
    }

    cargarPais();

    return () => controller.abort();
  }, [paisSeleccionado?.id]);

  useEffect(() => {
    if (!coordsCapital || coordsCapital.length < 2) return;

    const controller = new AbortController();

    async function cargarClima() {
      try {
        const clima = await pedirClima(coordsCapital, controller.signal);
        setDatosClima(clima);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Error cargando clima:", error);
        setDatosClima(null);
      }
    }

    cargarClima();

    return () => controller.abort();
  }, [coordsCapital]);

  useEffect(() => {
    const tipos = tiposTexto ? tiposTexto.split(",") : [];

    if (
      !paisSeleccionado?.id ||
      temperatura === null ||
      temperatura === undefined ||
      tipos.length < 3
    )
      return;

    const controller = new AbortController();

    const fetchPokemonList = async () => {
      try {
        const [type1, type2, type3] = types;

        const typeResponses = await Promise.all([
          fetch(`https://pokeapi.co/api/v2/type/${type1}`, {
            signal: controller.signal,
          }),
          fetch(`https://pokeapi.co/api/v2/type/${type2}`, {
            signal: controller.signal,
          }),
          fetch(`https://pokeapi.co/api/v2/type/${type3}`, {
            signal: controller.signal,
          }),
        ]);

        for (const response of typeResponses) {
          if (!response.ok) {
            throw new Error(`Error PokéAPI tipos: ${response.status}`);
          }
        }

        const [data1, data2, data3] = await Promise.all(
          typeResponses.map((response) => response.json())
        );

        const pool1 = data1.pokemon.map((entry) => entry.pokemon.name);
        const pool2 = data2.pokemon.map((entry) => entry.pokemon.name);
        const pool3 = data3.pokemon.map((entry) => entry.pokemon.name);

        const seedBase = `${selectedState.id}-${Math.round(temperature)}`;
        const seed = stringToSeed(seedBase);

        const shuffled1 = seededShuffle(pool1, seed + 1);
        const shuffled2 = seededShuffle(pool2, seed + 2);
        const shuffled3 = seededShuffle(pool3, seed + 3);

        const uniqueNames = [];
        const used = new Set();

        const takeFromPool = (pool, targetLength) => {
          for (const name of pool) {
            if (!used.has(name)) {
              used.add(name);
              uniqueNames.push(name);
            }
            if (uniqueNames.length >= targetLength) return;
          }
        };

        // Base: 8 + 6 + 4 = 18
        takeFromPool(shuffled1, 8);
        takeFromPool(shuffled2, 14);
        takeFromPool(shuffled3, 18);

        // Relleno hasta 20
        const combinedPool = seededShuffle(
          [...new Set([...pool1, ...pool2, ...pool3])],
          seed + 99
        );

        for (const name of combinedPool) {
          if (!used.has(name)) {
            used.add(name);
            uniqueNames.push(name);
          }
          if (uniqueNames.length >= 20) break;
        }

        const detailResponses = await Promise.all(
          uniqueNames.slice(0, 20).map((name) =>
            fetch(`https://pokeapi.co/api/v2/pokemon/${name}`, {
              signal: controller.signal,
            })
          )
        );

        for (const response of detailResponses) {
          if (!response.ok) {
            throw new Error(`Error PokéAPI detalle: ${response.status}`);
          }
        }

        const detailData = await Promise.all(
          detailResponses.map((response) => response.json())
        );

        const finalPokemonList = detailData.map((pokemon) => ({
          id: pokemon.id,
          name: pokemon.name,
          image:
            pokemon.sprites.other["official-artwork"].front_default ||
            pokemon.sprites.front_default,
          types: pokemon.types.map((typeInfo) => typeInfo.type.name),
        }));

        setPokemonList(finalPokemonList);
        console.log("Lista final de Pokémon:", finalPokemonList);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Error generando lista de Pokémon:", error);
        setListaPokemon([]);
      }
    }

    cargarPokemons();

    return () => controller.abort();
  }, [paisSeleccionado?.id, temperatura, tiposTexto]);

  useEffect(() => {
    if (paisSeleccionado) {
      console.log("País seleccionado:", paisSeleccionado);
    } else {
      console.log("País seleccionado limpiado");
    }
  }, [paisSeleccionado]);

  useEffect(() => {
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
    if (datosClima) {
      console.log("Temperatura actual:", datosClima.current?.temperature_2m);
    }
  }, [datosClima]);

  useEffect(() => {
    if (categoriaPokemon && tiposTexto) {
      console.log("Categoría Pokémon:", categoriaPokemon);
      console.log("Tipos Pokémon recomendados:", tiposTexto.split(","));
    }
  }, [categoriaPokemon, tiposTexto]);

  useEffect(() => {
    if (listaPokemon.length > 0) {
      console.log("Pokémon listos para mostrar:", listaPokemon);
    }
  }, [listaPokemon]);

  useEffect(() => {
    const contenedor = contenedorRef.current;
    const logo = logoRef.current;
    const encabezado = encabezadoRef.current;

    if (!contenedor || !logo || !encabezado) return;

    const actualizarAlto = () => {
      setAltoMapa(calcularAltoMapa(contenedor, logo, encabezado));
    };

    actualizarAlto();

    const resizeObserver = new ResizeObserver(actualizarAlto);
    resizeObserver.observe(contenedor);
    resizeObserver.observe(logo);
    resizeObserver.observe(encabezado);
    window.addEventListener("resize", actualizarAlto);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", actualizarAlto);
    };
  }, [titulo]);

  return (
    <main className="world-map-page">
      <section
        ref={contenedorRef}
        className="world-map-shell"
        style={
          altoMapa
            ? { "--map-stage-max-height": `${altoMapa}px` }
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
          <h1 id="mapTitle" className="world-map-title">
            {titulo}
          </h1>
        </header>

        <div className="world-map-stage">
          <div id="map" className="world-map-canvas" />
        </div>
      </section>
    </main>
  );
}
