# Pokemon World Map

Aplicación React construida con Vite que combina un mapa mundial interactivo con una capa temática de Pokémon. El usuario selecciona un país en el mapa y la app muestra una ficha con información del país, clima actual y una lista de Pokémon recomendados según la temperatura.

## Qué Hace La App

- Muestra un mapa mundial interactivo con `Simplemaps`.
- Permite seleccionar países directamente desde el mapa.
- Consulta datos reales del país con `REST Countries`.
- Consulta la temperatura actual con `Open-Meteo`.
- Clasifica esa temperatura en una categoría climática.
- Genera una lista determinista de Pokémon usando `PokéAPI`.
- Abre un panel con país, clima, tipos recomendados y Pokémon.

## Tecnologías Usadas

- React 19
- Vite 7
- CSS puro
- Simplemaps como scripts externos
- REST Countries API
- Open-Meteo API
- PokéAPI
- ESLint

## Cómo Se Ejecuta

Instala dependencias:

```bash
npm install
```

Modo desarrollo:

```bash
npm run dev
```

Qué esperar:
- servidor Vite con recarga en caliente
- logs de desarrollo activos
- útil para iterar interfaz y lógica

Build de producción:

```bash
npm run build
```

Qué esperar:
- salida optimizada en `dist/`
- `PanelPais` separado en un chunk lazy

Preview de producción:

```bash
npm run preview
```

Qué esperar:
- arranque de la build real
- es el modo correcto para validar comportamiento y rendimiento final

Lint:

```bash
npm run lint
```

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
│   ├── utils/
│   │   ├── mapa.js
│   │   ├── paisClima.js
│   │   └── pokemon.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
└── package.json
```

## Responsabilidad De Cada Archivo

### `src/components/WorldMap.jsx`

Es el componente principal. Controla:

- estado global visible de la app
- carga de scripts externos del mapa
- escucha del evento `simplemaps-country-change`
- selección de país
- apertura y cierre del panel
- carga de país, clima y Pokémon
- control de concurrencia con `AbortController`
- protección adicional con `claveSeleccion`
- cálculo dinámico de alturas del mapa y panel
- render del lienzo del mapa
- carga lazy del panel

### `src/components/PanelPais.jsx`

Renderiza la ficha del país. Muestra:

- nombre del país
- ID
- bandera
- capital
- coordenadas
- idiomas
- temperatura
- categoría climática
- tipos recomendados
- lista de Pokémon
- estados de carga, error y vacío

### `src/utils/mapa.js`

Contiene la lógica auxiliar del mapa:

- `TITULO_INICIAL`
- `cargarScript()` para inyectar `mapdata.js` y `worldmap.js`
- `registrarEventosMapa()` para engancharse al hook de zoom de Simplemaps
- `calcularAltoMapa()` para mantener el mapa protagonista
- `calcularAltoPanel()` para ajustar el panel cuando va debajo

### `src/utils/paisClima.js`

Gestiona peticiones de datos externas:

- `pedirJson()` como helper común
- `pedirPais()` contra `REST Countries`
- `pedirClima()` contra `Open-Meteo`

### `src/utils/pokemon.js`

Contiene la lógica de dominio Pokémon:

- clasificación por temperatura
- asociación de tipos Pokémon a cada rango térmico
- generación determinista de semilla
- mezcla pseudoaleatoria estable de listas
- deduplicado de nombres
- validación de imagen del Pokémon
- carga por lotes desde `PokéAPI`

### `src/App.jsx`

Importa `App.css` y renderiza `WorldMap`.

### `src/main.jsx`

Punto de entrada de React. Monta la aplicación con `createRoot` dentro de `StrictMode`.

### `src/index.css`

Define la base global:

- `box-sizing`
- tipografía base
- fondo global
- `min-width: 320px`
- `overflow-x: hidden`

### `src/App.css`

Contiene toda la capa visual real:

- layout general
- header
- mapa
- panel
- animaciones
- responsive aprobado

### `index.html`

Configura:

- `lang="es"`
- favicon de Poké Ball
- título `Pokemon World Map`

### `public/simplemaps/mapdata.js`

Archivo de configuración del mapa:

- estilos base
- nombres de países
- `div: "map"`
- `state_description: ""`
- configuración de zoom, labels y comportamiento general

### `public/simplemaps/worldmap.js`

Bundle vendor de `Simplemaps`. El proyecto no reescribe su lógica interna. Se usa como motor del mapa y se consume a través de sus globals y del hook `plugin_hooks.zooming_complete`.

## Flujo Funcional Completo

El flujo real es este:

1. El usuario hace click en un país del mapa.
2. `Simplemaps` actualiza su estado interno de zoom/selección.
3. `registrarEventosMapa()` escucha `plugin_hooks.zooming_complete`.
4. Desde ahí se construye un objeto con:
   - `titulo`
   - `pais`
5. Se lanza el evento global:

```js
simplemaps-country-change
```

6. `WorldMap.jsx` escucha ese evento.
7. Al recibir una nueva selección:
   - limpia estado anterior
   - incrementa `claveSeleccion`
   - actualiza el país activo
   - abre el panel
   - cambia el título
8. Se pide el país a `REST Countries`.
9. Si hay capital y coordenadas válidas, se pide el clima a `Open-Meteo`.
10. Con la temperatura actual, `clasificarTemperatura()` devuelve:
    - categoría climática
    - tipos Pokémon recomendados
11. Con esos tipos, `pedirPokemons()` genera una lista determinista.
12. Cuando todo llega, `PanelPais` renderiza los datos.

## Lógica De Datos

### REST Countries

Se usa:

```text
https://restcountries.com/v3.1/alpha/:id?fields=name,capital,capitalInfo,flags,languages,cca2
```

Campos usados realmente:

- `name.common`
- `capital`
- `capitalInfo.latlng`
- `flags.png`
- `flags.svg`
- `languages`
- `cca2`

Uso:

- `name.common` para el nombre visible
- `capital[0]` para capital
- `capitalInfo.latlng` para pedir el clima
- bandera para la ficha
- idiomas para la sección de datos

### Open-Meteo

Se usa con las coordenadas de la capital para obtener:

- `current.temperature_2m`

Ese valor alimenta la lógica de clasificación climática.

### PokéAPI

Se usa en dos niveles:

1. pools por tipo:

```text
https://pokeapi.co/api/v2/type/:tipo
```

2. detalle individual:

```text
https://pokeapi.co/api/v2/pokemon/:nombre
```

## Clasificación De Temperatura

La clasificación actual en `pokemon.js` es:

- `<= -5`: `polar` → `ice`, `water`, `steel`
- `<= 3`: `muy frío` → `ice`, `water`, `flying`
- `<= 9`: `frío` → `ice`, `water`, `normal`
- `<= 15`: `fresco` → `grass`, `flying`, `normal`
- `<= 21`: `templado` → `grass`, `normal`, `bug`
- `<= 27`: `templado cálido` → `grass`, `ground`, `fighting`
- `<= 33`: `cálido` → `fire`, `ground`, `rock`
- `<= 39`: `muy cálido` → `fire`, `rock`, `dragon`
- `> 39`: `extremo` → `fire`, `ground`, `dragon`

## Lista Determinista De Pokémon

La lista no es aleatoria pura. Es estable para el mismo país y temperatura.

Base del sistema:

- semilla: `${idPais}-${Math.round(temperatura)}`
- mezcla con semilla para cada tipo
- mezcla final del pool combinado

Construcción actual:

- primer tipo: hasta 8 nombres
- segundo tipo: hasta 14
- tercer tipo: hasta 18
- relleno desde el resto mezclado
- máximo de 40 candidatos
- resultado final: hasta 20 Pokémon válidos

## Validaciones Importantes

### Imagen Del Pokémon

El orden real de fallback es:

1. `official-artwork`
2. `home`
3. `dream_world`
4. `front_default`

Si no existe ninguna imagen válida, el Pokémon se descarta.

### Candidatos Extra

Para no quedarse sin resultados:

- se generan hasta 40 candidatos
- se procesan por lotes de 10
- se guardan solo los 20 primeros válidos

### Duplicados

Se controlan con `Set` al construir la lista de nombres.

### Peticiones Concurrentes

El proyecto protege el flujo con:

- `AbortController`
- `claveSeleccion`
- `claveSeleccionRef`

Esto evita que respuestas antiguas sobrescriban una selección más nueva.

### Limpieza Al Cambiar País

Cada nueva selección limpia:

- `datosPais`
- `datosClima`
- `listaPokemon`
- errores previos

Así se evita mezclar datos antiguos y nuevos.

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

Cómo se sincroniza el panel:

- el panel se abre cuando llega una selección válida
- se cierra manualmente con botón
- si el usuario vuelve a seleccionar otro país, se reabre automáticamente

Cómo se evita mezcla de datos:

- cada selección nueva incrementa `claveSeleccion`
- cada efecto comprueba si sigue siendo la selección activa antes de escribir estado

## Panel De País

El panel muestra:

- nombre del país
- ID
- bandera
- capital
- coordenadas
- idiomas
- temperatura
- categoría
- tipos recomendados
- lista de Pokémon

Comportamiento:

- se abre al seleccionar país
- se puede cerrar manualmente
- reaparece al seleccionar otro país

Carga lazy:

- `PanelPais` se carga con `lazy()`
- se renderiza con `Suspense`

Estados visuales existentes:

- carga
- error
- vacío

Todos están integrados dentro del panel, no como texto aislado.

## Responsive Y Layout

### Panel lateral vs debajo

Reglas actuales:

- panel debajo si `window.innerWidth <= 1100`
- o si `window.innerWidth <= 1180 && window.innerHeight <= 760`
- excepto en móvil horizontal específico

### Móvil horizontal

Se activa si:

- `window.innerWidth <= 932`
- `window.innerWidth > window.innerHeight`
- `window.innerHeight <= 540`

En ese caso:

- header compacto
- mapa protagonista
- panel lateral superpuesto

### Alturas dinámicas

`ResizeObserver` observa:

- contenedor principal
- logo
- cabecera
- panel si procede

Con eso se recalculan:

- `--alto-maximo-mapa`
- `--alto-maximo-panel`

### Scroll

- el objetivo es que la página no haga scroll raro
- cuando el panel va debajo, el scroll útil ocurre dentro del panel

## Decisiones Técnicas Aprobadas

- frontend con React + Vite
- sin backend en esta versión
- sin router
- sin librerías de estado global
- mapa con `Simplemaps` y scripts externos
- uso directo de APIs externas
- lista Pokémon determinista
- `PanelPais` con lazy + `Suspense`
- logs solo en desarrollo
- uso de `mapdata.js` y `worldmap.js` originales
- no uso de versiones `.min` experimentales

## Rendimiento

Puntos clave del estado actual:

- `PanelPais` se carga en chunk separado
- los logs de desarrollo no se ejecutan en producción
- la validación real debe hacerse con `build + preview`
- los scripts externos del mapa se cargan una sola vez y con guardas para no duplicarse

Diferencia entre dev y producción:

- en dev hay HMR, `StrictMode` y cliente de Vite
- en producción desaparece ese ruido y se valida el comportamiento real

## Qué Esperar En Cada Modo

### `npm run dev`

- desarrollo con recarga rápida
- útil para iteración
- logs de desarrollo visibles

### `npm run build`

- empaquetado final
- chunk lazy del panel

### `npm run preview`

- simulación real de producción
- es la referencia correcta para revisar estabilidad y rendimiento

## Posibles Extensiones Futuras

Mejoras coherentes con el estado actual:

- detalle completo de un Pokémon al hacer click en la lista
- tests automáticos del flujo asíncrono país → clima → Pokémon
- pequeña caché de respuestas para reducir repeticiones
- reintento manual en estados de error
- backend futuro para autenticación o persistencia si el proyecto evoluciona

## Nota Final

La lógica interna completa de `public/simplemaps/worldmap.js` no está documentada aquí porque es un vendor bundle externo. En este proyecto solo se documenta el uso real que el código hace de esa librería.
