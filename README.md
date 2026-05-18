# Pokémon World Map

Pokémon World Map es una aplicación web completa que combina un mapa mundial interactivo con autenticación de usuarios, activación por email, datos reales de países, clima actual y recomendaciones Pokémon según la temperatura.

El usuario puede entrar en una landing, registrarse, activar su cuenta, iniciar sesión y acceder al mapa. Una vez dentro del atlas, puede seleccionar países en el mapa y ver una ficha con información del país, clima actual y una lista de Pokémon recomendados.

La aplicación está desplegada en producción en:

```text
https://pokemon-world.es
```

Rutas públicas actuales:

```text
https://pokemon-world.es       -> frontend React/Vite
https://pokemon-world.es/api   -> backend Spring Boot
```

## Tecnologías Utilizadas

### Frontend

- React 19
- Vite 7
- CSS puro
- Motion
- Lucide React
- Simplemaps
- REST Countries
- Open-Meteo
- PokéAPI

### Backend

- Java 21
- Spring Boot 3.5.14
- Spring Web
- Spring Security
- Spring Data JPA
- Validation
- MySQL Driver
- Maven

### Infraestructura

- Docker
- Docker Compose
- MySQL 8.4
- Apache como reverse proxy en VPS
- Cloudflare
- Certbot/HTTPS
- Dominio IONOS
- VPS Hostinger

## Arquitectura Del Proyecto

El proyecto está separado en dos partes principales:

- `front/`: frontend React + Vite.
- `back/`: backend Spring Boot.
- raíz del proyecto: Docker Compose, variables de ejemplo, README y configuración general.

Estructura principal:

```text
Pokemon World/
├── front/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── public/
│   │   ├── media/
│   │   └── simplemaps/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ConfirmAccountPage.jsx
│   │   │   ├── WorldMap.jsx
│   │   │   ├── PanelPais.jsx
│   │   │   └── layout/
│   │   │       ├── AuthLayout.jsx
│   │   │       ├── AuthNav.jsx
│   │   │       └── AuthFooter.jsx
│   │   ├── services/
│   │   │   └── auth.js
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
│   ├── package.json
│   └── ...
├── back/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── pom.xml
│   ├── mvnw
│   └── src/
│       └── main/
│           ├── java/com/pokemonworld/backend/
│           │   ├── config/
│           │   ├── controller/
│           │   ├── dto/
│           │   ├── entity/
│           │   ├── exception/
│           │   ├── repository/
│           │   └── service/
│           └── resources/
│               └── application.properties
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

El archivo `.env` existe en local o en la VPS, pero no debe subirse al repositorio.

## Frontend

El frontend vive dentro de `front/` y está construido con React + Vite.

Componentes principales:

- `LandingPage.jsx`: página inicial, presentación del proyecto, acceso a login, registro y mapa.
- `LoginPage.jsx`: formulario de inicio de sesión conectado al backend.
- `RegisterPage.jsx`: formulario de registro conectado al backend, con activación dev y validación visual.
- `ConfirmAccountPage.jsx`: pantalla visual que confirma la cuenta desde `/confirmar-cuenta?token=...`.
- `WorldMap.jsx`: componente principal del mapa.
- `PanelPais.jsx`: ficha con datos del país, clima y Pokémon.
- `layout/AuthLayout.jsx`: estructura común para vistas públicas.
- `layout/AuthNav.jsx`: navegación común de landing, login, registro y confirmación, con menú móvil responsive.
- `layout/AuthFooter.jsx`: footer común de las vistas públicas.

`App.jsx` gestiona las vistas internas sin React Router:

- `landing`
- `login`
- `register`
- `confirmar-cuenta`
- `mapa`

Las vistas públicas se envuelven con `AuthLayout` para compartir navbar, footer e identidad visual. La vista `mapa` queda fuera de ese layout para mantener el mapa como protagonista y evitar interferencias con Simplemaps.

Cuando el usuario accede al mapa por primera vez, `WorldMap` se monta y después se mantiene en el DOM. Solo se oculta con clases CSS cuando se cambia de vista. Esta decisión evita reinicializar Simplemaps y reduce el riesgo de romper el mapa al navegar.

### Integración Frontend-Backend

`front/src/services/auth.js` centraliza las llamadas de autenticación:

- `registrarUsuario()`
- `confirmarCuenta()`
- `iniciarSesion()`
- `obtenerUsuarioActual()`
- `cerrarSesion()`

Todas las llamadas usan:

```js
credentials: "include"
```

Esto es necesario porque el backend usa sesión con cookie `JSESSIONID`.

### Estilos Frontend

Los estilos están separados por responsabilidad:

- `front/src/styles/auth.css`: landing, login, registro, formularios, mensajes y footer.
- `front/src/styles/mapa.css`: página del mapa, cabecera, marco, logo, título y responsive del mapa.
- `front/src/styles/panel.css`: panel del país, datos, clima, tipos, lista Pokémon y estados internos.
- `front/src/index.css`: estilos globales mínimos, tokens base y clases para mantener el mapa montado.

El mapa es núcleo protegido. No se deben tocar sin motivo:

- `front/src/components/WorldMap.jsx`
- `front/src/components/PanelPais.jsx`
- `front/src/utils/mapa.js`
- `front/src/utils/paisClima.js`
- `front/src/utils/pokemon.js`
- `front/public/simplemaps/mapdata.js`
- `front/public/simplemaps/worldmap.js`

## Flujo Funcional Del Mapa

El flujo real del mapa es:

1. El usuario intenta acceder al mapa.
2. `App.jsx` comprueba la sesión con `/api/auth/me`.
3. Si hay sesión, se muestra el mapa.
4. El usuario selecciona un país en Simplemaps.
5. Simplemaps dispara el evento de cambio de país.
6. React captura la selección activa.
7. Se limpian datos anteriores para evitar mezclas.
8. Se consulta REST Countries.
9. Se consulta Open-Meteo usando las coordenadas de la capital.
10. Se clasifica la temperatura.
11. Se seleccionan tres tipos Pokémon recomendados.
12. Se consulta PokéAPI.
13. Se genera una lista determinista de candidatos.
14. Se descartan Pokémon sin imagen válida.
15. Se muestran hasta 20 Pokémon en el panel.

### REST Countries

Endpoint usado:

```text
https://restcountries.com/v3.1/alpha/:id?fields=name,capital,capitalInfo,flags,languages,cca2
```

Datos usados:

- nombre del país
- capital
- coordenadas de capital
- bandera
- idiomas
- código `cca2`

### Open-Meteo

Endpoint construido con latitud y longitud:

```text
https://api.open-meteo.com/v1/forecast?latitude=:latitud&longitude=:longitud&current=temperature_2m
```

Dato usado:

- `current.temperature_2m`

### PokéAPI

Primero se consultan tipos:

```text
https://pokeapi.co/api/v2/type/:tipo
```

Luego se consulta el detalle individual:

```text
https://pokeapi.co/api/v2/pokemon/:nombre
```

### Clasificación De Temperatura

La función `clasificarTemperatura()` traduce la temperatura a categoría climática y tipos Pokémon:

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

### Generación De Pokémon

La lista no es aleatoria pura. Es determinista.

La semilla base se construye con:

```js
`${idPais}-${Math.round(temperatura)}`
```

Con esa semilla se mezclan los pools de Pokémon por tipo, se eliminan duplicados y se piden detalles por lotes. La lista final puede mostrar hasta 20 Pokémon.

### Validación De Imagen Pokémon

No todos los Pokémon tienen imagen disponible. El orden de fallback es:

1. `official-artwork`
2. `home`
3. `dream_world`
4. `front_default`

Si un Pokémon no tiene ninguna imagen válida, se descarta.

## Backend

El backend vive dentro de `back/` y está construido con Spring Boot.

Responsabilidades actuales:

- registro de usuarios
- activación de cuenta por token
- login
- logout
- consulta de sesión actual
- validaciones de registro
- envío de email real de activación
- conexión con MySQL
- configuración CORS por variables

La configuración CORS no está hardcodeada en Java. Se lee desde `CORS_ALLOWED_ORIGINS` mediante `application.properties`, lo que permite usar el mismo código en local y producción cambiando solo variables de entorno.

Endpoints actuales:

```text
GET  /api/health
POST /api/auth/register
GET  /api/auth/confirm?token=...
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### Resumen De Endpoints

`GET /api/health`

Devuelve estado básico del backend.

```json
{"status":"ok","service":"pokemon-world-backend"}
```

`POST /api/auth/register`

Registra un usuario inactivo, genera token de confirmación, envía email de activación si el mail está habilitado y devuelve la URL dev solo si está configurada.

En producción, el enlace enviado por email apunta al frontend:

```text
https://pokemon-world.es/confirmar-cuenta?token=...
```

La pantalla frontend lee el token y llama internamente al endpoint real del backend.

`GET /api/auth/confirm?token=...`

Activa la cuenta si el token es válido y no ha expirado.

`POST /api/auth/login`

Comprueba credenciales. Solo permite login si el usuario está activo. Si es correcto, crea sesión con `JSESSIONID`.

`GET /api/auth/me`

Devuelve el usuario actual si hay sesión activa.

`POST /api/auth/logout`

Invalida la sesión actual.

## Autenticación Y Sesión

El proyecto no usa JWT.

El flujo actual es:

1. El usuario se registra.
2. El backend crea el usuario con `activo = false`.
3. Se genera `tokenConfirmacion`.
4. Se guarda `fechaExpiracionToken`.
5. Si `MAIL_ENABLED=true`, se envía un email real de activación.
6. Si `MAIL_SHOW_DEV_CONFIRMATION_URL=true`, también se devuelve la URL de confirmación para desarrollo.
7. El usuario abre `/confirmar-cuenta?token=...` en el frontend.
8. El frontend llama a `/api/auth/confirm?token=...`.
9. El backend marca `activo = true`.
10. El token y la fecha de expiración se limpian.
11. El usuario puede iniciar sesión.
12. Login crea una cookie `JSESSIONID`.
13. `/api/auth/me` valida la sesión.
14. Logout invalida la sesión.

No se guardan tokens en `localStorage`. El frontend depende de cookies de sesión y usa `credentials: "include"`.

## Validaciones De Registro

El backend valida el formulario de registro con `jakarta.validation`.

Username:

- obligatorio
- entre 3 y 30 caracteres
- solo letras, números y guion bajo
- único en base de datos

Email:

- obligatorio
- formato válido
- único en base de datos

Password:

- obligatorio
- entre 8 y 100 caracteres
- al menos una mayúscula
- al menos una minúscula
- al menos un número
- sin espacios

Confirm password:

- obligatorio
- debe coincidir con password

Los errores de validación de campos se devuelven mediante `ValidacionResponse` y `GlobalExceptionHandler`:

```json
{
  "mensaje": "Revisa los campos del formulario",
  "errores": {
    "password": "La contraseña debe tener entre 8 y 100 caracteres"
  }
}
```

Errores de negocio como email duplicado o username duplicado se devuelven con un mensaje simple:

```json
{"mensaje":"Ya existe un usuario registrado con ese email"}
```

En login se mantiene un mensaje genérico para credenciales incorrectas.

## Variables De Entorno

El proyecto usa `.env` en local/VPS y `.env.example` como plantilla segura.

Variables actuales:

```env
MYSQL_DATABASE=pokemon_world
MYSQL_USER=pokemon_user
MYSQL_PASSWORD=change_me
MYSQL_ROOT_PASSWORD=change_me
MYSQL_PORT=3307

BACK_PORT=8080
FRONT_PORT=5173
SERVER_PORT=8080

VITE_API_URL=http://localhost:8080/api
BACKEND_URL=http://localhost:8080
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000

MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=change_me
MAIL_PASSWORD=change_me
MAIL_FROM=no-reply@pokemon-world.es
MAIL_FROM_NAME="Pokémon World Map"
MAIL_SMTP_AUTH=true
MAIL_SMTP_STARTTLS_ENABLE=true
MAIL_ENABLED=false
MAIL_SHOW_DEV_CONFIRMATION_URL=true
```

Valores esperados en local:

```env
VITE_API_URL=http://localhost:8080/api
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
MAIL_ENABLED=false
MAIL_SHOW_DEV_CONFIRMATION_URL=true
```

Valores esperados en producción:

```env
VITE_API_URL=https://pokemon-world.es/api
FRONTEND_URL=https://pokemon-world.es
BACKEND_URL=https://pokemon-world.es
CORS_ALLOWED_ORIGINS=https://pokemon-world.es,https://www.pokemon-world.es
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=change_me
MAIL_PASSWORD=change_me
MAIL_FROM=no-reply@pokemon-world.es
MAIL_FROM_NAME="Pokémon World Map"
MAIL_SMTP_AUTH=true
MAIL_SMTP_STARTTLS_ENABLE=true
MAIL_ENABLED=true
MAIL_SHOW_DEV_CONFIRMATION_URL=false
```

`MAIL_USERNAME` y `MAIL_PASSWORD` deben configurarse con los valores reales del SMTP de Brevo en la VPS, pero no deben subirse a Git ni copiarse en documentación pública.

No se deben incluir contraseñas reales, tokens, cookies ni credenciales en el README.

## Ejecución Local Sin Docker Completo

Primero crea un `.env` a partir de `.env.example` y ajusta valores locales.

Levantar solo MySQL:

```bash
docker compose up -d mysql
```

Arrancar backend:

```bash
cd back
set -a
source ../.env
set +a
./mvnw spring-boot:run
```

Arrancar frontend:

```bash
npm --prefix front run dev
```

URLs locales:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:8080/api/health
MySQL:    127.0.0.1:3307
```

## Ejecucion Con Docker Compose

Construir y levantar todo:

```bash
docker compose up -d --build
```

Comprobar servicios:

```bash
docker compose ps
```

Validar backend:

```bash
curl http://localhost:8080/api/health
```

Validar frontend:

```bash
curl -I http://localhost:5173
```

Servicios definidos:

- `mysql`: MySQL 8.4 con volumen persistente.
- `back`: Spring Boot escuchando internamente en `8080`.
- `front`: build Vite servido con `serve` en `5173`.

En el `docker-compose.yml` actual, los puertos se publican ligados a `127.0.0.1`. Esto encaja con el despliegue en VPS, donde Apache expone públicamente el frontend y la API.

## Dockerfiles

### Backend

`back/Dockerfile` usa multi-stage build:

- fase build con Eclipse Temurin JDK 21
- empaquetado con Maven Wrapper
- fase runtime con Eclipse Temurin JRE 21
- ejecución final con `java -jar app.jar`

### Frontend

`front/Dockerfile` usa multi-stage build:

- build con Node 22
- `npm ci`
- `npm run build`
- runtime con Node 22 y `serve@14`

`VITE_API_URL` se fija en build time porque Vite inyecta las variables durante el build.

Las imágenes base usan AWS ECR Public:

```text
public.ecr.aws/docker/library/...
```

Esto se dejó así porque en este entorno hubo timeouts descargando capas desde Docker Hub/Cloudflare.

## Despliegue En Producción

Producción funciona con esta arquitectura:

```text
Usuario
↓
Cloudflare
↓
Apache en VPS Hostinger
↓
Docker Compose
├── front
├── back
└── mysql
```

Elementos del despliegue:

- Dominio comprado en IONOS.
- DNS gestionado/proxied con Cloudflare.
- VPS Hostinger con Ubuntu.
- Docker y Docker Compose.
- Apache como reverse proxy.
- Certbot para HTTPS.
- Certificado para `pokemon-world.es` y `www.pokemon-world.es`.
- UFW permitiendo los puertos necesarios como `22`, `80` y `443`.
- No se usa Nginx en esta configuración.

Rutas en Apache:

```text
/api  -> 127.0.0.1:8080/api
/     -> 127.0.0.1:5173/
```

La regla de `/api` debe ir antes que la regla `/` para que las peticiones de API no terminen en el frontend.

En producción, `.env` debe tener:

```env
VITE_API_URL=https://pokemon-world.es/api
FRONTEND_URL=https://pokemon-world.es
BACKEND_URL=https://pokemon-world.es
CORS_ALLOWED_ORIGINS=https://pokemon-world.es,https://www.pokemon-world.es
MAIL_USERNAME=valor_real_en_vps
MAIL_PASSWORD=valor_real_en_vps
```

Si cambian variables usadas por Vite, hay que reconstruir el frontend.

## Comandos De Validación

Frontend:

```bash
npm --prefix front run lint
npm --prefix front run build
```

Backend:

```bash
cd back
./mvnw test
./mvnw clean package -DskipTests
```

Docker:

```bash
docker compose config
docker compose ps
```

API local:

```bash
curl http://localhost:8080/api/health
curl -i http://localhost:8080/api/auth/me
```

API producción:

```bash
curl https://pokemon-world.es/api/health
curl -i https://pokemon-world.es/api/auth/me
```

Preflight CORS:

```bash
curl -i -X OPTIONS https://pokemon-world.es/api/auth/register \
  -H "Origin: https://pokemon-world.es" \
  -H "Access-Control-Request-Method: POST"
```

Debe devolver `Access-Control-Allow-Origin` con el origen permitido y `Access-Control-Allow-Credentials: true`.

## Limpieza Y Archivos Ignorados

No se suben al repositorio:

- `.env`
- `front/node_modules/`
- `front/dist/`
- `front/.vite/`
- `back/target/`
- `cookies.txt`
- logs
- caches

`.env.example` sí se sube como plantilla, pero no debe contener secretos reales.

## Estado Actual Del Proyecto

Estado actual:

- frontend terminado
- landing funcional
- login conectado al backend
- register conectado al backend
- activación de cuenta por token
- envío real de email de activación con SMTP
- pantalla frontend de confirmación de cuenta
- backend de autenticación funcional
- sesiones con `JSESSIONID`
- acceso al mapa protegido
- validaciones de registro mejoradas
- CORS configurable por variables
- Docker Compose funcional
- despliegue real funcionando en `https://pokemon-world.es`
- dominio HTTPS funcionando
- responsive de landing, login y register revisado
- limpieza de residuos de documentación/configuración realizada
- mapa y lógica Pokémon intactos

## Próximos Pasos

Próximos pasos realistas:

- mejorar plantilla visual del email de activación
- mejorar persistencia de sesión si se reinicia backend
- añadir favoritos o historial de países
- ampliar memoria técnica final del TFG

El proyecto se considera funcionalmente cerrado para la entrega del TFG. Las mejoras listadas quedan planteadas como evolución futura.
