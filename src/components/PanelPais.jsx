function capitalizar(texto) {
  if (!texto) return texto;
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatearCoords(coords) {
  if (!coords || coords.length < 2) return "Sin datos";
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
  cargandoPais,
  cargandoClima,
  cargandoPokemons,
}) {
  if (!abierto || !paisSeleccionado?.id) return null;

  const nombrePais = datosPais?.name?.common ?? paisSeleccionado.name;
  const bandera = datosPais?.flags?.png || datosPais?.flags?.svg;
  const capital = datosPais?.capital?.[0] ?? (cargandoPais ? "Cargando..." : "Sin datos");
  const idiomas = datosPais?.languages ? Object.values(datosPais.languages) : [];
  const idiomasTexto = idiomas.length
    ? idiomas.join(", ")
    : cargandoPais
      ? "Cargando..."
      : "Sin datos";
  const temperatura = datosClima?.current?.temperature_2m;
  const temperaturaTexto =
    temperatura === null || temperatura === undefined
      ? cargandoClima
        ? "Cargando..."
        : "Sin datos"
      : `${temperatura.toFixed(1)} ºC`;

  return (
    <div className="panel-overlay">
      <aside ref={panelRef} className="panel-pais" aria-live="polite">
        <div className="panel-pais-top">
          <div>
            <p className="panel-pais-etiqueta">Ficha del país</p>
            <h2 className="panel-pais-nombre">{nombrePais}</h2>
            <p className="panel-pais-id">ID: {paisSeleccionado.id}</p>
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
                <dd>{formatearCoords(datosPais?.capitalInfo?.latlng)}</dd>
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
              {cargandoClima ? <span className="panel-estado">Cargando</span> : null}
            </div>

            <div className="panel-clima">
              <strong className="panel-temperatura">{temperaturaTexto}</strong>
              <span className="panel-categoria">
                {capitalizar(categoriaPokemon ?? (cargandoClima ? "calculando..." : "pendiente"))}
              </span>
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
                  {cargandoClima ? "Calculando tipos..." : "Sin tipos todavía"}
                </p>
              )}
            </div>
          </section>

          <section className="panel-bloque">
            <div className="panel-bloque-cabecera">
              <h3>Pokémon</h3>
              <span className="panel-estado">{listaPokemon.length}/20</span>
            </div>

            {cargandoPokemons && !listaPokemon.length ? (
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
              <p className="panel-vacio">Aún no hay Pokémon para mostrar.</p>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}
