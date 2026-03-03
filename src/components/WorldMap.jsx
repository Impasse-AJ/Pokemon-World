import { useEffect } from "react";

export default function WorldMap() {
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
        // 🔹 TU LÓGICA EXACTA DEL MAPA (SIN CAMBIOS)
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
                } else if (mapdata.regions && mapdata.regions[stateId]) {
                  itemName = mapdata.regions[stateId].name;
                } else {
                  itemName = stateId;
                }
                document.getElementById("mapTitle").textContent = itemName;
              } else {
                document.getElementById("mapTitle").textContent =
                  "Pokémon World Map";
              }
            }
          );
        }
      }
    };

    // 5️⃣ Iniciar carga
    document.body.appendChild(mapdataScript);
  }, []);

  return (
    <>
      <h1 id="mapTitle" style={{ textAlign: "center" }}>
        Pokémon World Map
      </h1>

      <div
        id="map"
        style={{
          width: "100%",
          height: "calc(100vh - 60px)",
        }}
      />
    </>
  );
}