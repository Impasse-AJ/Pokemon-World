# Pokemon World Map

Proyecto preparado para separarse en dos responsabilidades:

- `front/`: aplicación React + Vite actual, encargada de landing, login/register visuales y mapa interactivo.
- `back/`: espacio reservado para el futuro backend Spring Boot.

El frontend muestra una landing de presentación, pantallas visuales de login/registro y un mapa mundial interactivo con estética Pokémon. El usuario puede entrar al atlas, seleccionar un país en el mapa y abrir una ficha con datos reales del país, clima actual y una lista de Pokémon recomendados según la temperatura.

El mapa es el elemento principal de la interfaz. El panel del país es una capa informativa que se adapta al espacio disponible sin sustituir el protagonismo del mapa.

## Tecnologías

- React 19
- Vite 7
- CSS puro
- Simplemaps como mapa externo
- REST Countries API
- Open-Meteo API
- PokéAPI
- Motion
- Lucide React
- ESLint

## Instalación Y Ejecución

Los comandos del frontend se ejecutan dentro de `front/`:

Instalar dependencias:

```bash
cd front
npm install
```

Arrancar en desarrollo:

```bash
cd front
npm run dev
```

Generar build de producción:

```bash
cd front
npm run build
```

Levantar la build real:

```bash
cd front
npm run preview
```

Revisar lint:

```bash
cd front
npm run lint
```

Alternativa desde la raíz:

```bash
npm --prefix front run dev
npm --prefix front run build
npm --prefix front run preview
npm --prefix front run lint
```

Para validar rendimiento y comportamiento final, la referencia correcta es `npm run build` + `npm run preview`. El modo `dev` incluye cliente de Vite, HMR y comportamiento propio de desarrollo.

## Estructura Del Proyecto

```text
Pokemon World/
├── front/
│   ├── public/
│   │   ├── media/
│   │   │   ├── mapa-preview.png
│   │   │   └── pokeball-logo.png
│   │   └── simplemaps/
│   │       ├── mapdata.js
│   │       └── worldmap.js
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── PanelPais.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── WorldMap.jsx
│   │   ├── styles/
│   │   │   ├── auth.css
│   │   │   ├── mapa.css
│   │   │   └── panel.css
│   │   ├── utils/
│   │   │   ├── mapa.js
│   │   │   ├── paisClima.js
│   │   │   └── pokemon.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   └── vite.config.js
├── back/
│   └── .gitkeep
├── .gitignore
└── README.md
```

Las rutas `src/...`, `public/...` y `styles/...` que aparecen en las secciones siguientes pertenecen al proyecto frontend dentro de `front/`.

## Responsabilidad De Archivos

### `src/main.jsx`

Punto de entrada de React. Importa `index.css`, monta `App` con `createRoot` y envuelve la app en `StrictMode`.

### `src/App.jsx`

Componente raíz. Gestiona las vistas internas de la aplicación sin usar router:

- `landing`
- `login`
- `register`
- `mapa`

Cuando el usuario entra al mapa por primera vez, `App.jsx` monta `WorldMap`. Después lo mantiene en el DOM y solo lo oculta cuando se vuelve a otras vistas. Esta decisión evita desmontar Simplemaps y reduce riesgos de reinicialización del mapa.

No importa estilos propios ni depende de `App.css`.

### `src/components/LandingPage.jsx`

Pantalla inicial del proyecto. Contiene:

- navegación superior
- hero principal
- vista previa del mapa real usando `public/media/mapa-preview.png`
- explicación de funcionamiento
- flujo de datos
- footer informativo

Usa `Motion` para animaciones de entrada y `lucide-react` para iconos.

### `src/components/LoginPage.jsx`

Pantalla visual de inicio de sesión. Actualmente no conecta con backend. Su formulario previene el submit por defecto y, al enviar, lleva al usuario al mapa mediante `onMapa`.

### `src/components/RegisterPage.jsx`

Pantalla visual de registro. Actualmente no conecta con backend. Mantiene estructura preparada para usuario, email, contraseña y repetición de contraseña.

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
- botón opcional para volver a la landing mediante `onVolver`
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
- clases `vista-mapa` y `vista-mapa--activa` para ocultar o mostrar el mapa sin desmontarlo

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

### `src/styles/auth.css`

Estilos de landing, login y registro:

- navegación superior
- hero
- preview estático del mapa
- tarjetas de explicación
- flujo de datos
- formularios
- footer
- responsive de las vistas de autenticación

No contiene estilos del mapa real ni del panel del país.

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

### `public/media/`

Carpeta de recursos visuales públicos:

- `pokeball-logo.png`: logo usado en landing, mapa y favicon.
- `mapa-preview.png`: captura estática del mapa real usada en la landing para no cargar Simplemaps antes de entrar al atlas.

## Flujo Funcional

### Flujo De Navegación

1. La aplicación arranca en `landing`.
2. Desde la landing se puede ir a login, registro o mapa.
3. Login permite volver a la landing, ir a registro o entrar al mapa.
4. Registro permite volver a la landing o ir a login.
5. Al entrar al mapa, `App.jsx` marca `mapaInicializado` como `true`.
6. A partir de ese momento `WorldMap` se mantiene montado para no reiniciar Simplemaps.

### Flujo Del Mapa

El flujo completo del mapa es:

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

- `src/styles/auth.css`: landing, login, registro, formularios, preview estático y footer.
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

Mejoras visuales aplicadas sin modificar la lógica de datos, endpoints ni flujo principal:

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

Detalles relevantes:

- los tipos Pokémon se pintan mediante `data-tipo`
- el clima adapta color mediante `data-categoria`
- el título del mapa usa variables CSS para evitar repetir bloques largos de `text-shadow`
- el fondo de imagen Pokémon se neutralizó para no favorecer ningún tipo concreto

## Evolución Reciente Del Frontend

El proyecto pasó de estar centrado casi exclusivamente en el mapa a tener una estructura frontend más completa.

Antes de esta fase:

- `WorldMap.jsx` era el componente central de entrada.
- `PanelPais.jsx` mostraba datos del país, clima y Pokémon.
- No existían vistas reales de landing, login o register.
- No existía separación física entre frontend y backend.

Cambios aplicados:

- se añadió `LandingPage.jsx`
- se añadió `LoginPage.jsx`
- se añadió `RegisterPage.jsx`
- se añadió `auth.css` para landing/login/register
- se añadió `mapa-preview.png` como captura estática del mapa real
- `App.jsx` pasó a gestionar vistas internas: `landing`, `login`, `register`, `mapa`
- `WorldMap` se mantiene montado tras inicializarse para no reiniciar Simplemaps
- se eliminó `App.css` porque estaba vacío y no se importaba
- se movieron estilos inline simples a CSS
- se limpiaron props muertas como `onMapa` en `PieNav`
- se sustituyeron enlaces decorativos `href="#"` por texto visual
- el proyecto Vite completo se movió a `front/`
- se dejó `back/` reservado para Spring Boot

La lógica principal del mapa no se cambió en esta fase.

## Rendimiento

`PanelPais` se carga con `lazy()` y `Suspense`, por lo que el panel se separa en un chunk propio en producción.

Las vistas de landing, login y registro usan `motion` y `lucide-react`. Esto aumenta el bundle principal respecto a la versión que solo renderizaba el mapa, pero permite una entrada visual completa al proyecto.

Los estilos también quedan separados:

- CSS de landing/login/register
- CSS principal del mapa
- CSS del panel cargado junto al chunk del panel

Los scripts de Simplemaps se cargan dinámicamente mediante `cargarScript()`. La función evita duplicar scripts y marca los scripts cargados con `data-loaded`.

La preview del landing usa una imagen estática del mapa real (`public/media/mapa-preview.png`). Esto evita cargar Simplemaps dos veces solo para enseñar una vista previa.

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
- Mantener login y registro como vistas visuales sin autenticación real hasta implementar backend.
- No usar librerías de estado global.
- Mantener `WorldMap` montado después de inicializarlo para no romper Simplemaps al navegar entre vistas.
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

## Archivos Clave Para Compartir Con Otra IA

Si otra IA necesita entender el estado actual del proyecto, los archivos importantes son:

```text
README.md
.gitignore
front/package.json
front/package-lock.json
front/index.html
front/vite.config.js
front/eslint.config.js
front/src/App.jsx
front/src/index.css
front/src/main.jsx
front/src/components/LandingPage.jsx
front/src/components/LoginPage.jsx
front/src/components/RegisterPage.jsx
front/src/components/WorldMap.jsx
front/src/components/PanelPais.jsx
front/src/styles/auth.css
front/src/styles/mapa.css
front/src/styles/panel.css
front/src/utils/mapa.js
front/src/utils/paisClima.js
front/src/utils/pokemon.js
front/public/media/mapa-preview.png
front/public/media/pokeball-logo.png
front/public/simplemaps/mapdata.js
front/public/simplemaps/worldmap.js
```

No hace falta compartir:

```text
front/node_modules/
front/dist/
dist/
.vite/
```

Motivo:

- `node_modules/` son dependencias instaladas.
- `dist/` es build generado.
- `.vite/` es caché.
- No son fuente de verdad.

## Siguiente Paso Backend

El siguiente paso lógico es crear el backend Spring Boot dentro de `back/`.

Responsabilidades previstas del backend:

- registro de usuarios
- login
- validación de credenciales
- autenticación
- conexión con base de datos propia
- API REST consumida por el frontend

Conexión futura esperada desde el frontend:

```text
front/src/services/auth.js
```

Variable futura probable:

```env
VITE_API_URL=http://localhost:8080
```

Flujo futuro esperado:

1. El usuario rellena login o registro.
2. El frontend valida mínimos de formulario.
3. El frontend llama al backend Spring Boot.
4. El backend valida y responde.
5. El backend persiste usuarios en base de datos.
6. El frontend gestiona sesión, token o estado autenticado.

## Estado Del Proyecto

Estado actual:

- aplicación funcional
- landing funcional
- login visual funcional
- registro visual funcional
- mapa operativo
- panel operativo
- estilos separados
- preview estática del mapa en la landing
- lógica de APIs separada en utilidades
- panel lazy
- validaciones de imagen
- control de peticiones concurrentes
- README como documentación única del proyecto
