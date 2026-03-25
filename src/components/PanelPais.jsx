function capitalizar(texto) {
  if (!texto) return texto;
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatearCoords(coords) {
  if (!coords || coords.length < 2) return "No disponible";
  return `${coords[0].toFixed(2)}, ${coords[1].toFixed(2)}`;
}

export default function PanelPais({
  abierto,
  alCerrar,
  panelRef,
  paisSeleccionado,
  datosPais,
  datosClima,
  categoriaPokemon,
  tiposPokemon,
  listaPokemon,
  errorPais,
  errorClima,
  errorPokemons,
  cargandoPais,
  cargandoClima,
  cargandoPokemons,
}) {
  if (!abierto || !paisSeleccionado?.id) return null;

  const nombrePais = datosPais?.name?.common ?? paisSeleccionado.name;
  const bandera = datosPais?.flags?.png || datosPais?.flags?.svg;
  const capital = errorPais
    ? "No disponible"
    : datosPais?.capital?.[0] ?? (cargandoPais ? "Cargando..." : "No disponible");
  const idiomas = datosPais?.languages ? Object.values(datosPais.languages) : [];
  const idiomasTexto = idiomas.length
    ? idiomas.join(", ")
    : errorPais
      ? "No disponible"
    : cargandoPais
      ? "Cargando..."
      : "No disponible";
  const temperatura = datosClima?.current?.temperature_2m;
  const temperaturaTexto =
    errorClima
      ? "No disponible"
      : temperatura === null || temperatura === undefined
        ? cargandoClima
          ? "Cargando..."
          : "No disponible"
        : `${temperatura.toFixed(1)} ºC`;
  const categoriaTexto = errorClima
    ? "No disponible"
    : temperatura === null || temperatura === undefined
      ? cargandoClima
        ? "Calculando..."
        : "No disponible"
      : capitalizar(categoriaPokemon ?? "No disponible");

  return (
    <div className="panel-overlay">
      <aside ref={panelRef} className="panel-pais" aria-live="polite">
        <div className="panel-pais-top">
          <div>
            <p className="panel-pais-etiqueta">Ficha del país</p>
            <h2 className="panel-pais-nombre">{nombrePais}</h2>
            <p className="panel-pais-id">ID: {paisSeleccionado.id}</p>
            {cargandoPais ? (
              <p className="panel-estado panel-estado-principal">Cargando datos del país...</p>
            ) : null}
          </div>

          <button
            type="button"
            className="panel-pais-cerrar"
            onClick={alCerrar}
            aria-label="Cerrar ficha"
          >
            ×
          </button>
        </div>

        <div className="panel-pais-body">
          <section className="panel-bloque panel-bloque-portada">
            {errorPais ? <p className="panel-error">{errorPais}</p> : null}

            {bandera ? (
              <img
                className="panel-pais-bandera"
                src={bandera}
                alt={`Bandera de ${nombrePais}`}
              />
            ) : null}

            <div className="panel-datos">
              <div>
                <dt>Capital</dt>
                <dd>{capital}</dd>
              </div>
              <div>
                <dt>Coordenadas</dt>
                <dd>
                  {errorPais
                    ? "No disponible"
                    : formatearCoords(datosPais?.capitalInfo?.latlng)}
                </dd>
              </div>
              <div>
                <dt>Idiomas</dt>
                <dd>{idiomasTexto}</dd>
              </div>
            </div>
          </section>

          <section className="panel-bloque">
            <div className="panel-bloque-cabecera">
              <h3>Clima</h3>
              {cargandoClima ? (
                <span className="panel-estado">Cargando clima...</span>
              ) : null}
            </div>

            {errorClima ? <p className="panel-error">{errorClima}</p> : null}

            <div className="panel-clima">
              <strong className="panel-temperatura">{temperaturaTexto}</strong>
              <span className="panel-categoria">{categoriaTexto}</span>
            </div>
          </section>

          <section className="panel-bloque">
            <div className="panel-bloque-cabecera">
              <h3>Tipos recomendados</h3>
            </div>

            <div className="panel-chips">
              {tiposPokemon?.length ? (
                tiposPokemon.map((tipo) => (
                  <span key={tipo} className="panel-chip">
                    {capitalizar(tipo)}
                  </span>
                ))
              ) : (
                <p className="panel-vacio">
                  {errorClima
                    ? "No disponible"
                    : cargandoClima
                      ? "Calculando tipos..."
                      : "No disponible"}
                </p>
              )}
            </div>
          </section>

          <section className="panel-bloque">
            <div className="panel-bloque-cabecera">
              <h3>Pokémon</h3>
              <span className="panel-estado">
                {cargandoPokemons ? "Cargando Pokémon..." : `${listaPokemon.length}/20`}
              </span>
            </div>

            {errorPokemons ? (
              <p className="panel-error">{errorPokemons}</p>
            ) : cargandoPokemons && !listaPokemon.length ? (
              <p className="panel-vacio">Cargando Pokémon...</p>
            ) : listaPokemon.length ? (
              <ul className="panel-pokemon-lista">
                {listaPokemon.map((pokemon) => (
                  <li key={pokemon.id} className="panel-pokemon-item">
                    <img
                      className="panel-pokemon-imagen"
                      src={pokemon.image}
                      alt={pokemon.name}
                    />

                    <div className="panel-pokemon-texto">
                      <strong>{capitalizar(pokemon.name)}</strong>
                      <div className="panel-pokemon-tipos">
                        {pokemon.types.map((tipo) => (
                          <span
                            key={`${pokemon.id}-${tipo}`}
                            className="panel-pokemon-tipo"
                          >
                            {capitalizar(tipo)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="panel-vacio">
                {errorClima
                  ? "No disponible"
                  : cargandoClima
                    ? "Esperando datos del clima..."
                    : "Aún no hay Pokémon para mostrar."}
              </p>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}
