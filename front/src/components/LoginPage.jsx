import { useEffect, useState } from "react";
import { motion as Motion } from "motion/react";
import { LogIn, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { iniciarSesion } from "../services/auth";
import "../styles/auth.css";

export default function LoginPage({
  onVolver,
  onRegistro,
  onLoginCorrecto,
  mensajeInicial,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState(mensajeInicial ?? "");

  useEffect(() => {
    setMensaje(mensajeInicial ?? "");
  }, [mensajeInicial]);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (!email.trim() || !password) {
      setError("Introduce tu email y contraseña.");
      return;
    }

    try {
      setCargando(true);

      const usuario = await iniciarSesion({
        email,
        password,
      });

      onLoginCorrecto?.(usuario);
    } catch (errorPeticion) {
      setError(errorPeticion.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="form-pantalla">
      <Motion.div
        className="form-panel auth-glass"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="form-panel-brillo form-panel-brillo--tr" />

        <div className="form-cabecera">
          <div className="form-icono-wrapper">
            <LogIn size={30} />
          </div>
          <h2 className="form-titulo">Iniciar Sesión</h2>
          <p className="form-subtitulo">Continúa tu viaje como Entrenador</p>
        </div>

        {mensaje ? <p className="auth-mensaje auth-mensaje--exito">{mensaje}</p> : null}
        {error ? <p className="auth-mensaje auth-mensaje--error">{error}</p> : null}

        <form className="form-campos" onSubmit={manejarSubmit}>
          <div className="form-grupo">
            <label className="form-label">Email</label>
            <div className="form-input-wrapper">
              <span className="form-input-icono">
                <Mail size={18} />
              </span>
              <input
                type="email"
                placeholder="entrenador@atlas.com"
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="form-btn-submit" disabled={cargando}>
            {cargando ? "Entrando..." : "Entrar al Mapa"} <ArrowRight size={18} />
          </button>
        </form>

        <div className="form-pie">
          <p className="form-pie-texto">
            ¿Eres nuevo aquí?{" "}
            <button className="form-pie-enlace" onClick={onRegistro}>
              Crear cuenta
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
