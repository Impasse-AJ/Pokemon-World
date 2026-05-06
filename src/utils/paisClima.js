async function pedirJson(ruta, senal, textoError) {
  const respuesta = await fetch(ruta, { signal: senal });

  if (!respuesta.ok) {
    throw new Error(`${textoError}: ${respuesta.status}`);
  }

  return respuesta.json();
}

export async function pedirPais(idPais, senal) {
  const datos = await pedirJson(
    `https://restcountries.com/v3.1/alpha/${idPais}?fields=name,capital,capitalInfo,flags,languages,cca2`,
    senal,
    "Error REST Countries"
  );

  return Array.isArray(datos) ? datos[0] : datos;
}

export function pedirClima(coordenadas, senal) {
  const [latitud, longitud] = coordenadas;

  return pedirJson(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&current=temperature_2m`,
    senal,
    "Error Open-Meteo"
  );
}
