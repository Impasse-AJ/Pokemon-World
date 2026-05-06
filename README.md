# Pokemon World Map

Aplicación React + Vite que muestra un mapa mundial interactivo con estética Pokémon. El usuario selecciona un país en el mapa y la aplicación abre una ficha con datos reales del país, clima actual y una lista de Pokémon recomendados según la temperatura.

El mapa es el elemento principal de la interfaz. El panel del país es una capa informativa que se adapta al espacio disponible sin sustituir el protagonismo del mapa.

## Tecnologías

- React 19
- Vite 7
- CSS puro
- Simplemaps como mapa externo
- REST Countries API
- Open-Meteo API
- PokéAPI
- ESLint

## Instalación Y Ejecución

Instalar dependencias:

```bash
npm install
```

Arrancar en desarrollo:

```bash
npm run dev
```

Generar build de producción:

```bash
npm run build
```

Levantar la build real:

```bash
npm run preview
```

Revisar lint:

```bash
npm run lint
```

Para validar rendimiento y comportamiento final, la referencia correcta es `npm run build` + `npm run preview`. El modo `dev` incluye cliente de Vite, HMR y comportamiento propio de desarrollo.

## Estructura Del Proyecto

```text
Pokemon World/
├── public/
│   ├── media/
│   │   └── pokeball-logo.png
│   └── simplemaps/
│       ├── mapdata.js
│       └── worldmap.js
├── src/
│   ├── components/
│   │   ├── PanelPais.jsx
│   │   └── WorldMap.jsx
│   ├── styles/
│   │   ├── mapa.css
│   │   └── panel.css
│   ├── utils/
│   │   ├── mapa.js
│   │   ├── paisClima.js
│   │   └── pokemon.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── MEJORAS_VISUALES.md
├── package.json
└── README.md
```

## Responsabilidad De Archivos

### `src/main.jsx`

Punto de entrada de React. Importa `index.css`, monta `App` con `createRoot` y envuelve la app en `StrictMode`.

### `src/App.jsx`

Componente raíz. Renderiza `WorldMap`. No importa estilos propios ni depende de `App.css`.

### `src/components/WorldMap.jsx`

Componente principal de la aplicación. Controla:

- carga de scripts de Simplemaps
- escucha del evento `simplemaps-country-change`
- país seleccionado
- apertura y cierre del panel
- carga de país, clima y Pokémon
- errores por API
- estados de carga
- limpieza de datos al cambiar de país
- control de peticiones tardías
- cálculo dinámico de alto del mapa y panel
- importación de `src/styles/mapa.css`
- carga lazy de `PanelPais`

### `src/components/PanelPais.jsx`

Componente visual del panel. Muestra:

- nombre del país
- ID del país
- bandera
- capital
- coordenadas
- idiomas
- temperatura actual
- categoría climática
- tipos Pokémon recomendados
- lista de Pokémon
- estados de carga, error y vacío

También añade atributos visuales:

- `data-tipo={tipo}` en chips de tipos Pokémon
- `data-categoria={categoriaPokemon}` en el bloque de clima
- `panel-estado--cargando` durante carga de clima o Pokémon

Importa `src/styles/panel.css`.

### `src/utils/mapa.js`

Contiene la integración con Simplemaps y los cálculos de layout:

- `TITULO_INICIAL`
- `cargarScript()`
- `registrarEventosMapa()`
- `calcularAltoMapa()`
- `calcularAltoPanel()`

No modifica el bundle de Simplemaps. Solo usa sus objetos globales y su hook `plugin_hooks.zooming_complete`.

### `src/utils/paisClima.js`

Agrupa las peticiones a APIs de país y clima:

- `pedirPais(idPais, senal)`
- `pedirClima(coordenadas, senal)`
- `pedirJson(ruta, senal, textoError)`

### `src/utils/pokemon.js`

Contiene la lógica Pokémon:

- clasificación de temperatura
- selección de tipos recomendados
- generación determinista por semilla
- mezcla pseudoaleatoria estable
- control de duplicados
- validación de imagen
- carga de Pokémon por lotes

### `src/index.css`

Base global de la app:

- `--world-map-proporcion`
- tokens de color globales
- `box-sizing`
- fondo base
- tipografía base
- `min-width: 320px`
- `overflow-x: hidden`

### `src/styles/mapa.css`

Estilos del mapa y la estructura principal:

- página
- contenedor principal
- logo Poké Ball
- cabecera
- título
- marco del mapa
- lienzo de Simplemaps
- animaciones del mapa y cabecera
- responsive del contenedor

### `src/styles/panel.css`

Estilos del panel:

- capa del panel
- ficha del país
- cabecera del panel
- bloques internos
- bandera
- clima
- tipos Pokémon
- lista de Pokémon
- estados de carga, error y vacío
- responsive interno del panel

### `public/simplemaps/mapdata.js`

Configuración del mapa:

- nombres de países
- estilos base de Simplemaps
- zoom
- labels
- `div: "map"`
- `state_description: ""`

### `public/simplemaps/worldmap.js`

Bundle externo de Simplemaps. No debe editarse salvo que se quiera sustituir toda la librería.

## Flujo Funcional

El flujo completo es:

1. El usuario hace click en un país del mapa.
2. Simplemaps actualiza su selección interna.
3. `registrarEventosMapa()` escucha `plugin_hooks.zooming_complete`.
4. `obtenerSeleccionMapa()` resuelve el país seleccionado.
5. Se lanza el evento global `simplemaps-country-change`.
6. `WorldMap.jsx` recibe el evento.
7. Se limpian datos anteriores.
8. Se actualiza `paisSeleccionado`.
9. Se abre el panel.
10. Se actualiza el título visible.
11. Se pide el país a REST Countries.
12. Si hay coordenadas de capital, se pide el clima a Open-Meteo.
13. Con la temperatura, se calcula categoría climática y tipos Pokémon.
14. Con los tipos, se pide información a PokéAPI.
15. Se genera una lista final de hasta 20 Pokémon válidos.
16. `PanelPais.jsx` muestra la información.

## Datos Externos

### REST Countries

Endpoint usado:

```text
https://restcountries.com/v3.1/alpha/:id?fields=name,capital,capitalInfo,flags,languages,cca2
```

Campos usados:

- `name.common`
- `capital`
- `capitalInfo.latlng`
- `flags.png`
- `flags.svg`
- `languages`
- `cca2`

Uso:

- nombre del país
- capital
- coordenadas de la capital
- bandera
- idiomas

### Open-Meteo

Endpoint construido con latitud y longitud:

```text
https://api.open-meteo.com/v1/forecast?latitude=:latitud&longitude=:longitud&current=temperature_2m
```

Campo usado:

- `current.temperature_2m`

La temperatura decide la categoría climática y los tipos Pokémon recomendados.

### PokéAPI

Primero se consultan tipos:

```text
https://pokeapi.co/api/v2/type/:tipo
```

Luego se consulta detalle individual:

```text
https://pokeapi.co/api/v2/pokemon/:nombre
```

## Clasificación De Temperatura

La función `clasificarTemperatura()` devuelve una categoría y tres tipos Pokémon:

| Temperatura | Categoría | Tipos |
|---|---|---|
| `<= -5` | `polar` | `ice`, `water`, `steel` |
| `<= 3` | `muy frío` | `ice`, `water`, `flying` |
| `<= 9` | `frío` | `ice`, `water`, `normal` |
| `<= 15` | `fresco` | `grass`, `flying`, `normal` |
| `<= 21` | `templado` | `grass`, `normal`, `bug` |
| `<= 27` | `templado cálido` | `grass`, `ground`, `fighting` |
| `<= 33` | `cálido` | `fire`, `ground`, `rock` |
| `<= 39` | `muy cálido` | `fire`, `rock`, `dragon` |
| `> 39` | `extremo` | `fire`, `ground`, `dragon` |

## Generación De Pokémon

La lista no es aleatoria pura. Es determinista.

La semilla base es:

```js
`${idPais}-${Math.round(temperatura)}`
```

Con esa semilla:

- se mezclan los Pokémon del primer tipo
- se mezclan los Pokémon del segundo tipo
- se mezclan los Pokémon del tercer tipo
- se combinan resultados sin duplicados
- se genera una lista de hasta 40 candidatos
- se cargan detalles por lotes de 10
- se devuelven hasta 20 Pokémon válidos

## Validación De Imagen Pokémon

No todos los Pokémon devueltos por PokéAPI tienen las mismas imágenes disponibles. Por eso se usa este orden de fallback:

1. `official-artwork`
2. `home`
3. `dream_world`
4. `front_default`

Si un Pokémon no tiene ninguna imagen válida, se descarta y no aparece en el panel.

## Gestión De Estado

Estados principales de `WorldMap.jsx`:

- `titulo`
- `paisSeleccionado`
- `panelAbierto`
- `datosPais`
- `datosClima`
- `listaPokemon`
- `errorPais`
- `errorClima`
- `errorPokemons`
- `cargandoPais`
- `cargandoClima`
- `cargandoPokemons`
- `altoMapa`
- `altoPanel`
- `claveSeleccion`
- `panelDebajo`
- `movilHorizontal`

Al seleccionar un país nuevo se limpian:

- datos del país anterior
- clima anterior
- lista anterior de Pokémon
- errores anteriores
- estados de carga secundarios

Para evitar mezclas por peticiones tardías se usa:

- `AbortController`
- `claveSeleccion`
- `claveSeleccionActual`

Antes de escribir datos en estado, cada petición comprueba que sigue perteneciendo a la selección activa.

## Panel Del País

El panel se abre cuando hay un país seleccionado y `panelAbierto` es `true`.

Puede cerrarse manualmente con el botón `×`. Cerrar el panel no borra el país activo ni rompe el mapa. Si se selecciona otro país, el panel vuelve a abrirse automáticamente.

El panel contempla:

- carga de país
- carga de clima
- carga de Pokémon
- error de REST Countries
- error de Open-Meteo
- error de PokéAPI
- datos incompletos
- lista vacía

Mensajes principales:

- `Cargando datos del país...`
- `Cargando clima...`
- `Cargando Pokémon...`
- `No se pudo cargar la información del país`
- `No se pudo obtener el clima`
- `Error al cargar los Pokémon`
- `No disponible`

## Estilos Y Responsive

La app no usa `App.css`.

Los estilos están separados por responsabilidad:

- `src/styles/mapa.css`: mapa, página, título, logo, marco, animaciones y responsive del mapa.
- `src/styles/panel.css`: panel, datos del país, clima, tipos, Pokémon, estados y responsive del panel.
- `src/index.css`: estilos globales mínimos y tokens base.

### Comportamiento Responsive

En escritorio amplio:

- el mapa queda centrado y grande
- el panel aparece superpuesto lateralmente

En ventanas más pequeñas:

- el panel pasa debajo del mapa
- el mapa mantiene prioridad visual
- el panel usa scroll interno

Condiciones principales:

- panel debajo si `innerWidth <= 1100`
- panel debajo si `innerWidth <= 1180 && innerHeight <= 760`
- móvil horizontal específico si `innerWidth <= 932`, `innerWidth > innerHeight` e `innerHeight <= 540`

En móvil horizontal:

- cabecera más compacta
- mapa protagonista
- panel lateral superpuesto

### Cálculo Dinámico

`WorldMap.jsx` usa `ResizeObserver` para observar:

- contenedor principal
- logo
- cabecera
- panel, cuando corresponde

Con eso calcula:

- `--alto-maximo-mapa`
- `--alto-maximo-panel`

Estas variables se usan en CSS para mantener el mapa y el panel ajustados al viewport.

## Mejoras Visuales Actuales

El archivo `MEJORAS_VISUALES.md` registra cambios visuales aplicados sin modificar la lógica.

Resumen:

- mejora de `line-height` del nombre del país
- `:focus-visible` en botón de cierre
- scrollbar del panel adaptado también para Firefox
- colores por tipo Pokémon usando `data-tipo`
- color semántico del clima usando `data-categoria`
- tokens de color globales en `index.css`
- fondo neutral para sprites Pokémon
- consolidación del `text-shadow` del título con variables CSS
- estado de carga pulsante con `panel-estado--cargando`
- soporte de `prefers-reduced-motion`

## Rendimiento

`PanelPais` se carga con `lazy()` y `Suspense`, por lo que el panel se separa en un chunk propio en producción.

Los estilos también quedan separados:

- CSS principal del mapa
- CSS del panel cargado junto al chunk del panel

Los scripts de Simplemaps se cargan dinámicamente mediante `cargarScript()`. La función evita duplicar scripts y marca los scripts cargados con `data-loaded`.

Los logs de estudio están protegidos por:

```js
import.meta.env.DEV
```

Eso evita que los logs de desarrollo se ejecuten en producción.

## Decisiones Técnicas

- Mantener React + Vite.
- Mantener frontend puro.
- No usar backend todavía.
- No usar router todavía.
- No usar librerías de estado global.
- No modificar `public/simplemaps/worldmap.js`.
- No usar versiones `.min` experimentales de Simplemaps.
- Mantener `mapdata.js` y `worldmap.js` originales.
- Mantener lógica determinista para Pokémon.
- Mantener validación de imagen Pokémon.
- Mantener separación de estilos por responsabilidad.

## Archivos Que No Deben Tocarse Sin Motivo

- `public/simplemaps/worldmap.js`: vendor externo.
- `public/simplemaps/mapdata.js`: configuración base del mapa.

Si se modifica Simplemaps, hay riesgo de romper la carga del mapa, el zoom o el evento de selección.

## Posibles Mejoras Futuras

Extensiones coherentes con la arquitectura actual:

- página de detalle de Pokémon
- router para navegar a detalles
- caché ligera de respuestas de APIs
- tests de interacción para cambios rápidos de país
- tests de peticiones tardías
- reintentos manuales en errores de API
- backend futuro para usuarios, favoritos o historial

## Estado Del Proyecto

Estado actual:

- aplicación funcional
- mapa operativo
- panel operativo
- estilos separados
- lógica de APIs separada en utilidades
- panel lazy
- validaciones de imagen
- control de peticiones concurrentes
- documentación visual adicional en `MEJORAS_VISUALES.md`
