const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

async function pedirJson(ruta, opciones = {}) {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      ...(opciones.headers ?? {}),
    },
    credentials: "include",
  });

  let datos = null;

  try {
    datos = await respuesta.json();
  } catch {
    datos = null;
  }

  if (!respuesta.ok) {
    const mensaje = datos?.mensaje ?? "Ha ocurrido un error inesperado";
    const error = new Error(mensaje);
    error.errores = datos?.errores ?? null;
    throw error;
  }

  return datos;
}

export function registrarUsuario({ username, email, password, confirmPassword }) {
  return pedirJson("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      username,
      email,
      password,
      confirmPassword,
    }),
  });
}

export function iniciarSesion({ email, password }) {
  return pedirJson("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export function confirmarCuenta(token) {
  return pedirJson(`/auth/confirm?token=${encodeURIComponent(token)}`, {
    method: "GET",
  });
}

export function obtenerUsuarioActual() {
  return pedirJson("/auth/me", {
    method: "GET",
  });
}

export function cerrarSesion() {
  return pedirJson("/auth/logout", {
    method: "POST",
  });
}
