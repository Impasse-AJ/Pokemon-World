import { useEffect, useRef, useState } from "react";
import { motion as Motion } from "motion/react";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { confirmarCuenta } from "../services/auth";
import "../styles/auth.css";

export default function ConfirmAccountPage({ token, onLogin, onVolver }) {
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const peticionIniciada = useRef(false);

  useEffect(() => {
    if (peticionIniciada.current) {
      return;
    }

    peticionIniciada.current = true;

    if (!token) {
      setError("El enlace de activacion no es valido.");
      setCargando(false);
      return;
    }

    let componenteActivo = true;

    async function confirmar() {
      try {
        const respuesta = await confirmarCuenta(token);

        if (componenteActivo) {
          setMensaje(
            respuesta?.mensaje ?? "Cuenta confirmada correctamente. Ya puedes iniciar sesion.",
          );
        }
      } catch (errorPeticion) {
        if (componenteActivo) {
          setError(errorPeticion.message);
        }
      } finally {
        if (componenteActivo) {
          setCargando(false);
        }
      }
    }

    confirmar();

    return () => {
      componenteActivo = false;
    };
  }, [token]);

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
            {cargando ? (
              <Loader2 size={30} />
            ) : mensaje ? (
              <CheckCircle size={30} />
            ) : (
              <AlertTriangle size={30} />
            )}
          </div>
          <h2 className="form-titulo">Confirmar Cuenta</h2>
          <p className="form-subtitulo">Validando tu acceso al atlas</p>
        </div>

        {cargando ? (
          <p className="auth-mensaje auth-mensaje--dev">Confirmando tu cuenta...</p>
        ) : null}
        {mensaje ? <p className="auth-mensaje auth-mensaje--exito">{mensaje}</p> : null}
        {error ? <p className="auth-mensaje auth-mensaje--error">{error}</p> : null}

        <div className="registro-acciones-finales">
          <button type="button" className="form-btn-submit" onClick={onLogin} disabled={cargando}>
            Ir a iniciar sesion <ArrowRight size={18} />
          </button>
          <button type="button" className="form-btn-volver" onClick={onVolver}>
            <ArrowLeft size={12} /> Volver al Inicio
          </button>
        </div>
      </Motion.div>
    </div>
  );
}
