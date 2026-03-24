async function pedirJson(url, signal, errorTexto) {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`${errorTexto}: ${response.status}`);
  }

  return response.json();
}

export async function pedirPais(idPais, signal) {
  const data = await pedirJson(
    `https://restcountries.com/v3.1/alpha/${idPais}?fields=name,capital,capitalInfo,flags,languages,cca2`,
    signal,
    "Error REST Countries"
  );

  return Array.isArray(data) ? data[0] : data;
}

export function pedirClima(coords, signal) {
  const [latitud, longitud] = coords;

  return pedirJson(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&current=temperature_2m`,
    signal,
    "Error Open-Meteo"
  );
}
