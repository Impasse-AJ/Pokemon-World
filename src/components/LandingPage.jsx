import { motion as Motion } from "motion/react";
import { Compass, Map as MapIcon, Globe, ThermometerSun, Sparkles } from "lucide-react";
import "../styles/auth.css";

export default function LandingPage({ onLogin, onRegistro, onMapa }) {
  return (
    <div className="auth-pantalla">
      <Nav onLogin={onLogin} onRegistro={onRegistro} onMapa={onMapa} />
      <main className="auth-main">
        <HeroSection onMapa={onMapa} onLogin={onLogin} />
        <FeaturesSection />
        <FlujoDatosSection />
      </main>
      <Footer />
    </div>
  );
}

/* ── Navegación ── */
function Nav({ onLogin, onRegistro, onMapa }) {
  return (
    <nav className="auth-nav">
      <div className="auth-nav-inner">
        <div className="auth-nav-logo">
          <span className="auth-nav-logo-icono"><Compass size={20} /></span>
          <span className="auth-nav-logo-texto">Pokemon World Map</span>
        </div>
        <div className="auth-nav-acciones">
          <button className="auth-btn-nav-texto auth-btn-nav-activo" disabled>Inicio</button>
          <button className="auth-btn-nav-outline" onClick={onMapa}>Explorar Mapa</button>
          <div className="auth-nav-separador" />
          <button className="auth-btn-nav-texto auth-nav-solo-desktop" onClick={onLogin}>Entrar</button>
          <button className="auth-btn-nav-dorado" onClick={onRegistro}>Registrarse</button>
        </div>
      </div>
    </nav>
  );
}

/* ── Sección Hero ── */
function HeroSection({ onMapa, onLogin }) {
  return (
    <section className="landing-hero">
      <div className="landing-hero-fondo">
        <div className="landing-hero-burbuja-1" />
        <div className="landing-hero-burbuja-2" />
      </div>

      <Motion.div
        className="landing-hero-contenido"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <div className="landing-encabezado">
          <p className="landing-subtitulo">Pokemon World Atlas</p>
          <h1 className="landing-titulo" data-title="Explore Your Real World">Explore Your Real World</h1>
        </div>
        <p className="landing-descripcion">
          Selecciona cualquier país del mapa interactivo y descubre qué Pokémon habitan en ese lugar
          según la temperatura real de su capital, en tiempo real.
        </p>
        <div className="landing-acciones">
          <button className="auth-btn-secundario" onClick={onMapa}>
            <MapIcon size={20} className="auth-icono-dorado" />
            Explorar el Atlas
          </button>
          <button className="auth-btn-primario" onClick={onLogin}>
            Iniciar mi Sesión
          </button>
        </div>
      </Motion.div>

      {/* Vista previa del mapa real */}
      <Motion.div
        className="preview-outer"
        initial={{ opacity: 0, y: 52 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.8 }}
      >
        <MapaPreview onMapa={onMapa} />
      </Motion.div>
    </section>
  );
}

/* ── Preview del mapa: replica exacta del layout real ── */
function MapaPreview({ onMapa }) {
  return (
    <div className="preview-container auth-glass">
      {/* Chrome superior: pokeball + título (idéntico al WorldMap real) */}
      <div className="preview-header-area">
        <img
          src="/media/pokeball-logo.png"
          alt=""
          aria-hidden="true"
          className="preview-pokeball-img"
        />
        <div className="preview-title-block">
          <p className="preview-atlas-sub">Pokemon world atlas</p>
          <p className="preview-map-title">Pokémon World Map</p>
        </div>
      </div>

      {/* Marco del mapa: imagen real del mapa + CTA flotante */}
      <div className="preview-map-frame">
        <img
          src="/media/mapa-preview.png"
          alt="Vista previa del mapa mundial Pokémon"
          className="preview-map-img"
          draggable="false"
        />
        <div className="preview-map-overlay" />

        {/* CTA flotante sobre el mapa */}
        <button className="preview-cta-movil" onClick={onMapa}>
          Explorar el Atlas →
        </button>
      </div>
    </div>
  );
}

/* ── Cómo funciona ── */
function FeaturesSection() {
  const features = [
    {
      icon: <Globe size={26} />,
      titulo: "Selecciona el país",
      desc: "Haz clic en cualquier país del mapa interactivo. Obtendrás nombre, capital, bandera, idiomas y coordenadas exactas.",
    },
    {
      icon: <ThermometerSun size={26} />,
      titulo: "Temperatura real",
      desc: "Consultamos Open-Meteo para obtener la temperatura actual de la capital. Datos meteorológicos en tiempo real.",
    },
    {
      icon: <Sparkles size={26} />,
      titulo: "Pokémon del clima",
      desc: "La temperatura se clasifica en 9 categorías climáticas y obtienes tipos y Pokémon adaptados al entorno real.",
    },
  ];

  return (
    <section className="landing-features">
      <div className="landing-features-inner">
        <div className="landing-features-cabecera">
          <h2 className="landing-features-titulo">Cómo funciona</h2>
          <p className="landing-features-desc">
            Tres pasos conectan el mapa real con el ecosistema Pokémon.
          </p>
        </div>
        <div className="landing-features-grid">
          {features.map((f, i) => (
            <Motion.div
              key={f.titulo}
              className="feature-card auth-glass"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
            >
              <div className="feature-card-icono">{f.icon}</div>
              <h3 className="feature-card-titulo">{f.titulo}</h3>
              <p className="feature-card-desc">{f.desc}</p>
            </Motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Flujo de datos ── */
function FlujoDatosSection() {
  const pasos = [
    { icono: "🗺️", label: "País" },
    { icono: "🌡️", label: "Temperatura" },
    { icono: "❄️", label: "Categoría" },
    { icono: "⚡", label: "Tipos" },
    { icono: "🎮", label: "Pokémon" },
  ];
  return (
    <section className="flujo-section">
      <div className="flujo-inner">
        <p className="flujo-titulo">Flujo de datos</p>
        <div className="flujo-pasos">
          {pasos.map((p, i) => (
            <div key={p.label} className="flujo-paso-grupo">
              <Motion.div
                className="flujo-paso"
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.32 }}
              >
                <span className="flujo-paso-icono">{p.icono}</span>
                <span className="flujo-paso-label">{p.label}</span>
              </Motion.div>
              {i < pasos.length - 1 && (
                <span className="flujo-flecha" aria-hidden="true">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
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
