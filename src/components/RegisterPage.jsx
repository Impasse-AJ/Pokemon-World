import { motion as Motion } from "motion/react";
import { Compass, UserPlus, User, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import "../styles/auth.css";

export default function RegisterPage({ onVolver, onLogin }) {
  return (
    <div className="auth-pantalla">
      <Nav onVolver={onVolver} onLogin={onLogin} />

      <main className="auth-main">
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

            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-grid-2">
                <div className="form-grupo form-campo-completo">
                  <label className="form-label">Usuario</label>
                  <div className="form-input-wrapper">
                    <span className="form-input-icono">
                      <User size={18} />
                    </span>
                    <input
                      type="text"
                      placeholder="EntrenadorLegendario"
                      className="form-input"
                      autoComplete="username"
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
                    />
                  </div>
                </div>

                <div className="form-campo-completo" style={{ marginTop: "0.5rem" }}>
                  <button type="submit" className="form-btn-submit">
                    Registrarse <ArrowRight size={18} />
                  </button>
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
      </main>

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
            <a href="#">TFG Project</a>
            <a href="#">Abraham Pauta</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Nav({ onVolver, onLogin }) {
  return (
    <nav className="auth-nav">
      <div className="auth-nav-inner">
        <button
          className="auth-nav-logo"
          onClick={onVolver}
          style={{ background: "none", border: "none" }}
        >
          <span className="auth-nav-logo-icono">
            <Compass size={22} />
          </span>
          <span className="auth-nav-logo-texto">Pokemon World Map</span>
        </button>

        <div className="auth-nav-acciones">
          <button className="auth-btn-nav-texto auth-nav-solo-desktop" onClick={onLogin}>
            Entrar
          </button>
          <div className="auth-nav-separador" />
          <button className="auth-btn-nav-dorado" style={{ background: "rgba(74,116,223,0.15)", color: "var(--auth-texto-sub)", border: "1px solid rgba(74,116,223,0.3)" }} onClick={onVolver}>
            Volver
          </button>
        </div>
      </div>
    </nav>
  );
}
