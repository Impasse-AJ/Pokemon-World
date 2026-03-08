import { useEffect, useState } from "react";

function classifyTemperature(temp) {
  if (temp === null || temp === undefined) return null;

  if (temp <= -5) {
    return {
      category: "polar",
      types: ["ice", "water", "steel"],
    };
  }

  if (temp <= 3) {
    return {
      category: "muy frío",
      types: ["ice", "water", "flying"],
    };
  }

  if (temp <= 9) {
    return {
      category: "frío",
      types: ["ice", "water", "normal"],
    };
  }

  if (temp <= 15) {
    return {
      category: "fresco",
      types: ["grass", "flying", "normal"],
    };
  }

  if (temp <= 21) {
    return {
      category: "templado",
      types: ["grass", "normal", "bug"],
    };
  }

  if (temp <= 27) {
    return {
      category: "templado cálido",
      types: ["grass", "ground", "fighting"],
    };
  }

  if (temp <= 33) {
    return {
      category: "cálido",
      types: ["fire", "ground", "rock"],
    };
  }

  if (temp <= 39) {
    return {
      category: "muy cálido",
      types: ["fire", "rock", "dragon"],
    };
  }

  return {
    category: "extremo",
    types: ["fire", "ground", "dragon"],
  };
}

function stringToSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function seededShuffle(array, seed) {
  const result = [...array];
  let currentSeed = seed;

  function random() {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    return currentSeed / 4294967296;
  }

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function loadScriptOnce(src, id) {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id);

    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
      } else {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener(
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

function registerSimplemapsHooks() {
  if (window.__simplemaps_hooks_registered__) return;

  if (
    !window.simplemaps_worldmap ||
    !window.simplemaps_worldmap.plugin_hooks ||
    !Array.isArray(window.simplemaps_worldmap.plugin_hooks.zooming_complete)
  ) {
    return;
  }

  window.__simplemaps_hooks_registered__ = true;

  window.simplemaps_worldmap.plugin_hooks.zooming_complete.push(function () {
    const map = window.simplemaps_worldmap;
    const mapdata = window.simplemaps_worldmap_mapdata;
    const stateId = map.zoom_level_id;

    let itemName = "Pokémon World Map";
    let selected = null;

    if (stateId) {
      if (mapdata.state_specific && mapdata.state_specific[stateId]) {
        itemName = mapdata.state_specific[stateId].name;
        selected = {
          id: stateId,
          name: itemName,
        };
      } else if (mapdata.regions && mapdata.regions[stateId]) {
        itemName = mapdata.regions[stateId].name;
      } else if (
        window.simplemaps_worldmap_mapinfo &&
        window.simplemaps_worldmap_mapinfo.names &&
        window.simplemaps_worldmap_mapinfo.names[stateId]
      ) {
        itemName = window.simplemaps_worldmap_mapinfo.names[stateId];
        selected = {
          id: stateId,
          name: itemName,
        };
      } else {
        itemName = stateId;
      }
    }

    const title = document.getElementById("mapTitle");
    if (title) {
      title.textContent = itemName;
    }

    window.dispatchEvent(
      new CustomEvent("simplemaps-country-change", {
        detail: selected,
      })
    );
  });
}

export default function WorldMap() {
  const [selectedState, setSelectedState] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [pokemonProfile, setPokemonProfile] = useState(null);
  const [pokemonList, setPokemonList] = useState([]);

  // Carga scripts + escucha del país seleccionado
  useEffect(() => {
    let cancelled = false;

    const handleCountryChange = (event) => {
      setSelectedState(event.detail);
    };

    window.addEventListener("simplemaps-country-change", handleCountryChange);

    const initMap = async () => {
      try {
        await loadScriptOnce("/simplemaps/mapdata.js", "simplemaps-mapdata");
        await loadScriptOnce("/simplemaps/worldmap.js", "simplemaps-worldmap");

        if (cancelled) return;

        registerSimplemapsHooks();

        setTimeout(() => {
          document.body.style.removeProperty("position");
        }, 0);
      } catch (error) {
        console.error("Error inicializando el mapa:", error);
      }
    };

    initMap();

    return () => {
      cancelled = true;
      window.removeEventListener(
        "simplemaps-country-change",
        handleCountryChange
      );
    };
  }, []);

  // Cuando cambia el país, limpiamos TODO lo dependiente
  useEffect(() => {
    if (selectedState) {
      console.log("selectedState cambiado:", selectedState);
    } else {
      console.log("selectedState limpiado");
    }

    setCountryData(null);
    setWeatherData(null);
    setPokemonProfile(null);
    setPokemonList([]);
  }, [selectedState]);

  // REST Countries
  useEffect(() => {
    if (!selectedState?.id) return;

    const controller = new AbortController();

    const fetchCountryData = async () => {
      try {
        const response = await fetch(
          `https://restcountries.com/v3.1/alpha/${selectedState.id}?fields=name,capital,capitalInfo,flags,languages,cca2`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Error REST Countries: ${response.status}`);
        }

        const data = await response.json();
        const country = Array.isArray(data) ? data[0] : data;

        setCountryData(country);
        console.log("countryData cargado:", country);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Error cargando datos del país:", error);
        setCountryData(null);
      }
    };

    fetchCountryData();

    return () => controller.abort();
  }, [selectedState?.id]);

  // Open-Meteo
  useEffect(() => {
    const latlng = countryData?.capitalInfo?.latlng;

    if (!latlng || latlng.length < 2) {
      setWeatherData(null);
      return;
    }

    const [latitude, longitude] = latlng;
    const controller = new AbortController();

    const fetchWeatherData = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Error Open-Meteo: ${response.status}`);
        }

        const data = await response.json();
        setWeatherData(data);
        console.log("weatherData cargado:", data);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Error cargando clima:", error);
        setWeatherData(null);
      }
    };

    fetchWeatherData();

    return () => controller.abort();
  }, [countryData?.cca2]);

  // Clasificación clima -> tipos Pokémon
  useEffect(() => {
    const temperature = weatherData?.current?.temperature_2m;

    if (temperature === null || temperature === undefined) {
      setPokemonProfile(null);
      return;
    }

    const profile = classifyTemperature(temperature);
    setPokemonProfile(profile);

    console.log("Clasificación Pokémon:", profile);
  }, [weatherData?.current?.temperature_2m]);

  // Generación de lista Pokémon
  useEffect(() => {
    const temperature = weatherData?.current?.temperature_2m;
    const types = pokemonProfile?.types;

    if (
      !selectedState?.id ||
      temperature === null ||
      temperature === undefined ||
      !types ||
      types.length < 3
    ) {
      setPokemonList([]);
      return;
    }

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
        setPokemonList([]);
      }
    };

    fetchPokemonList();

    return () => controller.abort();
  }, [
    selectedState?.id,
    weatherData?.current?.temperature_2m,
    pokemonProfile?.types?.join(","),
  ]);

  // Logs útiles
  useEffect(() => {
    if (countryData) {
      console.log("Datos útiles del país:");
      console.log("Nombre:", countryData.name?.common);
      console.log("Capital:", countryData.capital?.[0]);
      console.log("Coordenadas capital:", countryData.capitalInfo?.latlng);
      console.log(
        "Bandera:",
        countryData.flags?.png || countryData.flags?.svg
      );
      console.log("Idiomas:", countryData.languages);
    }
  }, [countryData]);

  useEffect(() => {
    if (weatherData) {
      console.log("Temperatura actual:", weatherData.current?.temperature_2m);
    }
  }, [weatherData]);

  useEffect(() => {
    if (pokemonProfile) {
      console.log("Categoría climática:", pokemonProfile.category);
      console.log("Tipos Pokémon recomendados:", pokemonProfile.types);
    }
  }, [pokemonProfile]);

  useEffect(() => {
    if (pokemonList.length > 0) {
      console.log("Pokémon listos para mostrar:", pokemonList);
    }
  }, [pokemonList]);

  return (
    <>
      <h1
        id="mapTitle"
        style={{
          textAlign: "center",
          color: "rgba(255,255,255,0.95)",
          textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
        }}
      >
        Pokémon World Map
      </h1>

      <div
        id="map"
        style={{
          width: "100%",
        }}
      />
    </>
  );
}