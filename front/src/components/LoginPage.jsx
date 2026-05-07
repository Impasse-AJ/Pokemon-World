import { motion as Motion } from "motion/react";
import { Compass, LogIn, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import "../styles/auth.css";

export default function LoginPage({ onVolver, onRegistro, onMapa }) {
  return (
    <div className="auth-pantalla">
      <Nav onVolver={onVolver} onRegistro={onRegistro} onMapa={onMapa} />

      <main className="auth-main">
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
              <p className="form-subtitulo">Continúa tu viaje como explorador</p>
            </div>

            <form className="form-campos" onSubmit={(e) => { e.preventDefault(); onMapa(); }}>
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
                  />
                </div>
              </div>

              <button type="submit" className="form-btn-submit">
                Entrar al Mapa <ArrowRight size={18} />
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
      </main>

      <PieNav />
    </div>
  );
}

function Nav({ onVolver, onRegistro, onMapa }) {
  return (
    <nav className="auth-nav">
      <div className="auth-nav-inner">
        <button
          className="auth-nav-logo auth-nav-logo-boton"
          onClick={onVolver}
        >
          <span className="auth-nav-logo-icono">
            <Compass size={22} />
          </span>
          <span className="auth-nav-logo-texto">Pokemon World Map</span>
        </button>

        <div className="auth-nav-acciones">
          <button className="auth-btn-nav-outline" onClick={onMapa}>
            Explorar Mapa
          </button>
          <div className="auth-nav-separador" />
          <button className="auth-btn-nav-dorado" onClick={onRegistro}>
            Registrarse
          </button>
        </div>
      </div>
    </nav>
  );
}

function PieNav() {
  return (
    <footer className="auth-footer">
      <div className="auth-footer-inner">
        <div className="auth-footer-logo">
          <Compass size={28} />
          <div className="auth-footer-logo-texto">
            <p className="nombre">Pokemon World Map</p>
            <p className="sub">Pokemon World Atlas &copy; 2026</p>
          </div>
        </div>
        <div className="auth-footer-links">
          <span className="auth-footer-link">TFG Project</span>
          <span className="auth-footer-link">Abraham Pauta</span>
        </div>
      </div>
    </footer>
  );
}
