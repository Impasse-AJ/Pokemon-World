import { Compass } from "lucide-react";

export default function AuthFooter() {
  return (
    <footer className="auth-footer">
      <div className="auth-footer-inner">
        <div className="auth-footer-logo">
          <Compass size={26} />
          <div className="auth-footer-logo-texto">
            <p className="nombre">Pokemon World Map</p>
            <p className="sub">Pokemon World Atlas</p>
          </div>
        </div>
        <div className="auth-footer-links">
          <span className="auth-footer-link">TFG Project</span>
          <span className="auth-footer-link">Abraham Pauta</span>
        </div>
      </div>
      <div className="auth-footer-copy">
        <span>&copy; 2026 Pokemon World Atlas. Todos los derechos reservados.</span>
        <span className="auth-footer-copy-sep">·</span>
        <span className="auth-footer-link">Política de privacidad</span>
        <span className="auth-footer-copy-sep">·</span>
        <span className="auth-footer-link">Aviso legal</span>
      </div>
    </footer>
  );
}
