const LIMITE_POKEMON = 20;
const LIMITE_CANDIDATOS = 40;
const TAMANO_LOTE = 10;

export function clasificarTemperatura(temperatura) {
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

  meterNombresUnicos(nombres, usados, resto, LIMITE_CANDIDATOS);

  return nombres.slice(0, LIMITE_CANDIDATOS);
}

function sacarImagenPokemon(dataPokemon) {
  return (
    dataPokemon.sprites.other?.["official-artwork"]?.front_default ||
    dataPokemon.sprites.other?.home?.front_default ||
    dataPokemon.sprites.other?.dream_world?.front_default ||
    dataPokemon.sprites.front_default ||
    null
  );
}

function crearPokemon(dataPokemon) {
  const image = sacarImagenPokemon(dataPokemon);

  if (!image) return null;

  return {
    id: dataPokemon.id,
    name: dataPokemon.name,
    image,
    types: dataPokemon.types.map((tipo) => tipo.type.name),
  };
}

async function pedirJson(url, signal, errorTexto) {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`${errorTexto}: ${response.status}`);
  }

  return response.json();
}

export async function pedirPokemons(tipos, idPais, temperatura, signal) {
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
  const pokemons = [];

  for (let i = 0; i < nombres.length; i += TAMANO_LOTE) {
    const lote = nombres.slice(i, i + TAMANO_LOTE);
    const datosPokemon = await Promise.all(
      lote.map((nombre) =>
        pedirJson(
          `https://pokeapi.co/api/v2/pokemon/${nombre}`,
          signal,
          "Error PokéAPI detalle"
        )
      )
    );

    const pokemonsValidos = datosPokemon
      .map(crearPokemon)
      .filter(Boolean);

    pokemons.push(...pokemonsValidos);

    if (pokemons.length >= LIMITE_POKEMON) {
      return pokemons.slice(0, LIMITE_POKEMON);
    }
  }

  return pokemons.slice(0, LIMITE_POKEMON);
}
