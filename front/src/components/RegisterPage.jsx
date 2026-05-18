import { useState } from "react";
import { motion as Motion } from "motion/react";
import { UserPlus, User, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { confirmarCuenta, registrarUsuario } from "../services/auth";
import "../styles/auth.css";

function obtenerTokenDesdeUrl(url) {
  try {
    const urlObjeto = new URL(url);
    return urlObjeto.searchParams.get("token");
  } catch {
    return null;
  }
}

function validarPassword(password) {
  const errores = [];

  if (password.length < 8) {
    errores.push("La contraseña debe tener al menos 8 caracteres.");
  }

  if (password.length > 100) {
    errores.push("La contraseña no puede superar los 100 caracteres.");
  }

  if (!/[A-Z]/.test(password)) {
    errores.push("La contraseña debe contener al menos una letra mayúscula.");
  }

  if (!/[a-z]/.test(password)) {
    errores.push("La contraseña debe contener al menos una letra minúscula.");
  }

  if (!/\d/.test(password)) {
    errores.push("La contraseña debe contener al menos un número.");
  }

  if (/\s/.test(password)) {
    errores.push("La contraseña no puede contener espacios.");
  }

  return errores;
}

export default function RegisterPage({ onVolver, onLogin, onRegistroCorrecto }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [urlConfirmacionDev, setUrlConfirmacionDev] = useState("");
  const [cuentaActivada, setCuentaActivada] = useState(false);
  const [erroresCampos, setErroresCampos] = useState([]);

  const limpiarFormulario = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setUrlConfirmacionDev("");
    setCuentaActivada(false);
    setErroresCampos([]);

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Completa todos los campos antes de registrarte.");
      return;
    }

    const erroresPassword = validarPassword(password);

    if (erroresPassword.length > 0) {
      setError("La contraseña no cumple los requisitos.");
      setErroresCampos(erroresPassword);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setErroresCampos(["Las contraseñas no coinciden."]);
      return;
    }

    try {
      setCargando(true);

      const respuesta = await registrarUsuario({
        username,
        email,
        password,
        confirmPassword,
      });

      const textoMensaje =
        respuesta?.mensaje ??
        "Registro completado. Revisa tu bandeja de entrada para activar tu cuenta.";
      const urlDev = respuesta?.urlConfirmacionDev ?? "";

      setErroresCampos([]);
      limpiarFormulario();

      if (urlDev) {
        setMensaje(textoMensaje);
        setUrlConfirmacionDev(urlDev);
        return;
      }

      onRegistroCorrecto?.(textoMensaje);
    } catch (errorPeticion) {
      setError(errorPeticion.message);
      setErroresCampos(errorPeticion.errores ? Object.values(errorPeticion.errores) : []);
    } finally {
      setCargando(false);
    }
  };

  const manejarActivacionDev = async () => {
    const token = obtenerTokenDesdeUrl(urlConfirmacionDev);

    if (!token) {
      setError("No se pudo obtener el token de activacion.");
      return;
    }

    try {
      setCargando(true);
      setError("");
      setErroresCampos([]);

      const respuesta = await confirmarCuenta(token);

      setMensaje(respuesta?.mensaje ?? "Cuenta confirmada correctamente. Ya puedes iniciar sesion.");
      setUrlConfirmacionDev("");
      setCuentaActivada(true);
    } catch (errorPeticion) {
      setError(errorPeticion.message);
      setErroresCampos(errorPeticion.errores ? Object.values(errorPeticion.errores) : []);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="form-pantalla">
      <Motion.div
        className="form-panel form-panel--ancho auth-glass"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="form-panel-brillo form-panel-brillo--tl" />

        <div className="form-cabecera">
          <div className="form-icono-wrapper">
            <UserPlus size={30} />
          </div>
          <h2 className="form-titulo">Nueva Cuenta</h2>
          <p className="form-subtitulo">Empieza tu aventura hoy mismo</p>
        </div>

        {error ? <p className="auth-mensaje auth-mensaje--error">{error}</p> : null}
        {erroresCampos.length > 0 ? (
          <ul className="auth-lista-errores">
            {erroresCampos.map((mensajeError) => (
              <li key={mensajeError}>{mensajeError}</li>
            ))}
          </ul>
        ) : null}
        {mensaje ? <p className="auth-mensaje auth-mensaje--exito">{mensaje}</p> : null}
        {urlConfirmacionDev ? (
          <div className="auth-mensaje auth-mensaje--dev">
            <p>Enlace de activacion para desarrollo:</p>
            <a href={urlConfirmacionDev}>{urlConfirmacionDev}</a>
            <button
              type="button"
              className="auth-mensaje-accion"
              onClick={manejarActivacionDev}
              disabled={cargando}
            >
              {cargando ? "Activando..." : "Activar cuenta ahora"}
            </button>
          </div>
        ) : null}

        <form onSubmit={manejarSubmit}>
          <div className="form-grid-2">
            <div className="form-grupo form-campo-completo">
              <label className="form-label">Usuario</label>
              <div className="form-input-wrapper">
                <span className="form-input-icono">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Entrenador Legendario"
                  className="form-input"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grupo form-campo-completo">
              <label className="form-label">Email</label>
              <div className="form-input-wrapper">
                <span className="form-input-icono">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="form-input"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grupo">
              <label className="form-label">Contraseña</label>
              <div className="form-input-wrapper">
                <span className="form-input-icono">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="form-input"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grupo">
              <label className="form-label">Repetir</label>
              <div className="form-input-wrapper">
                <span className="form-input-icono">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="form-input"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-campo-completo form-submit-registro">
              {mensaje ? (
                <div className="registro-acciones-finales">
                  <button
                    type="button"
                    className="form-btn-submit"
                    onClick={() => onRegistroCorrecto?.(mensaje)}
                  >
                    Ir a iniciar sesion <ArrowRight size={18} />
                  </button>
                  {!cuentaActivada && urlConfirmacionDev ? (
                    <p className="registro-ayuda">
                      Activa la cuenta antes de iniciar sesion.
                    </p>
                  ) : null}
                </div>
              ) : (
                <button type="submit" className="form-btn-submit" disabled={cargando}>
                  {cargando ? "Registrando..." : "Registrarse"} <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="form-pie">
          <p className="form-pie-texto">
            ¿Ya tienes cuenta?{" "}
            <button className="form-pie-enlace" onClick={onLogin}>
              Iniciar sesión
            </button>
          </p>
          <button className="form-btn-volver" onClick={onVolver}>
            <ArrowLeft size={12} /> Volver al Inicio
          </button>
        </div>
      </Motion.div>
    </div>
  );
}
