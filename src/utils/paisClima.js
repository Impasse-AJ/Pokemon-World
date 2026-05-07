// Hace una petición fetch y convierte cualquier fallo HTTP en un error controlado.
// Así WorldMap puede mostrar mensajes claros sin depender del formato interno de cada API.
async function pedirJson(ruta, senal, textoError) {
  const respuesta = await fetch(ruta, { signal: senal });

  if (!respuesta.ok) {
    throw new Error(`${textoError}: ${respuesta.status}`);
  }

  return respuesta.json();
}

// Consulta REST Countries usando el ID del país que llega desde Simplemaps.
// Solo pide los campos que usamos en el panel: nombre, capital, coordenadas, bandera e idiomas.
export async function pedirPais(idPais, senal) {
  const datos = await pedirJson(
    `https://restcountries.com/v3.1/alpha/${idPais}?fields=name,capital,capitalInfo,flags,languages,cca2`,
    senal,
    "Error REST Countries"
  );

  return Array.isArray(datos) ? datos[0] : datos;
}

// Consulta Open-Meteo con las coordenadas de la capital para obtener la temperatura actual.
// Esa temperatura después se usa para clasificar el clima y elegir tipos Pokémon recomendados.
export function pedirClima(coordenadas, senal) {
  const [latitud, longitud] = coordenadas;

  return pedirJson(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&current=temperature_2m`,
    senal,
    "Error Open-Meteo"
  );
}
