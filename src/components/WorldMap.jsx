import { useEffect, useState } from "react";

export default function WorldMap() {
  const [selectedState, setSelectedState] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    // Evitar cargar los scripts más de una vez
    if (window.__simplemaps_loaded__) return;
    window.__simplemaps_loaded__ = true;

    // 1️⃣ Cargar mapdata.js
    const mapdataScript = document.createElement("script");
    mapdataScript.src = "/simplemaps/mapdata.js";
    mapdataScript.async = false;

    // 2️⃣ Cargar worldmap.js
    const worldmapScript = document.createElement("script");
    worldmapScript.src = "/simplemaps/worldmap.js";
    worldmapScript.async = false;

    // 3️⃣ Cuando mapdata cargue, cargamos worldmap
    mapdataScript.onload = () => {
      document.body.appendChild(worldmapScript);
    };

    // 4️⃣ Cuando worldmap cargue, registramos los hooks
    worldmapScript.onload = () => {
      if (
        window.simplemaps_worldmap &&
        window.simplemaps_worldmap.plugin_hooks
      ) {
        if (
          Array.isArray(
            window.simplemaps_worldmap.plugin_hooks.zooming_complete
          )
        ) {
          window.simplemaps_worldmap.plugin_hooks.zooming_complete.push(
            function () {
              var map = window.simplemaps_worldmap;
              var mapdata = window.simplemaps_worldmap_mapdata;
              var stateId = map.zoom_level_id;

              if (stateId) {
                var itemName = null;

                if (
                  mapdata.state_specific &&
                  mapdata.state_specific[stateId]
                ) {
                  itemName = mapdata.state_specific[stateId].name;

                  setSelectedState({
                    id: stateId,
                    name: itemName,
                  });
                } else if (mapdata.regions && mapdata.regions[stateId]) {
                  itemName = mapdata.regions[stateId].name;
                  setSelectedState(null);
                } else {
                  itemName = stateId;
                  setSelectedState(null);
                }

                document.getElementById("mapTitle").textContent = itemName;
              } else {
                document.getElementById("mapTitle").textContent =
                  "Pokémon World Map";
                setSelectedState(null);
              }
            }
          );
        }
      }

      setTimeout(() => {
        document.body.style.removeProperty("position");
      }, 0);
    };

    // 5️⃣ Iniciar carga
    document.body.appendChild(mapdataScript);
  }, []);

  // Log limpio del país seleccionado
  useEffect(() => {
    if (selectedState) {
      console.log("selectedState cambiado:", selectedState);
    } else {
      console.log("selectedState limpiado");
      setCountryData(null);
      setWeatherData(null);
    }
  }, [selectedState]);

  // REST Countries: solo los campos necesarios
  useEffect(() => {
    if (!selectedState?.id) return;

    const fetchCountryData = async () => {
      try {
        const response = await fetch(
          `https://restcountries.com/v3.1/alpha/${selectedState.id}?fields=name,capital,capitalInfo,flags,languages,cca2`
        );

        if (!response.ok) {
          throw new Error(`Error REST Countries: ${response.status}`);
        }

        const data = await response.json();
        const country = Array.isArray(data) ? data[0] : data;

        setCountryData(country);
        console.log("countryData cargado:", country);
      } catch (error) {
        console.error("Error cargando datos del país:", error);
        setCountryData(null);
      }
    };

    fetchCountryData();
  }, [selectedState]);

  // Open-Meteo: temperatura actual de la capital
  useEffect(() => {
    const latlng = countryData?.capitalInfo?.latlng;

    if (!latlng || latlng.length < 2) {
      setWeatherData(null);
      return;
    }

    const [latitude, longitude] = latlng;

    const fetchWeatherData = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`
        );

        if (!response.ok) {
          throw new Error(`Error Open-Meteo: ${response.status}`);
        }

        const data = await response.json();
        setWeatherData(data);
        console.log("weatherData cargado:", data);
      } catch (error) {
        console.error("Error cargando clima:", error);
        setWeatherData(null);
      }
    };

    fetchWeatherData();
  }, [countryData]);

  // Logs limpios de los datos útiles
  useEffect(() => {
    if (countryData) {
      console.log("Datos útiles del país:");
      console.log("Nombre:", countryData.name?.common);
      console.log("Capital:", countryData.capital?.[0]);
      console.log("Coordenadas capital:", countryData.capitalInfo?.latlng);
      console.log("Bandera:", countryData.flags?.png || countryData.flags?.svg);
      console.log("Idiomas:", countryData.languages);
    }
  }, [countryData]);

  useEffect(() => {
    if (weatherData) {
      console.log("Temperatura actual:", weatherData.current?.temperature_2m);
    }
  }, [weatherData]);

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