import AuthFooter from "./AuthFooter";
import AuthNav from "./AuthNav";
import "../../styles/auth.css";

export default function AuthLayout({
  children,
  usuario,
  vistaActual,
  onInicio,
  onMapa,
  onLogin,
  onRegistro,
  onLogout,
}) {
  return (
    <div className="auth-pantalla">
      <AuthNav
        usuario={usuario}
        vistaActual={vistaActual}
        onInicio={onInicio}
        onMapa={onMapa}
        onLogin={onLogin}
        onRegistro={onRegistro}
        onLogout={onLogout}
      />
      <main className="auth-main auth-layout-main">{children}</main>
      <AuthFooter />
    </div>
  );
}
