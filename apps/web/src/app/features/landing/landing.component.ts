import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="landing-page">
      <header class="site-header">
        <a class="brand" routerLink="/" aria-label="Navaja Studio OS inicio">
          <span class="brand-mark">✂</span>
          <span>Navaja Studio <small>OS</small></span>
        </a>
        <nav class="desktop-nav" aria-label="Navegación principal">
          <a href="#caracteristicas">Características</a>
          <a href="#planes">Planes</a>
          <a href="#testimonios">Testimonios</a>
        </nav>
        <div class="header-actions">
          <a class="login-link" routerLink="/login">Iniciar sesión</a>
          <a class="button button-dark" routerLink="/booking"><span>▣</span> Comenzar</a>
        </div>
      </header>

      <main>
        <section class="hero section-shell">
          <div class="hero-copy">
            <div class="badge-row">
              <span class="badge">★ Plataforma Todo-en-Uno</span>
              <span class="badge badge-muted">📍 Colombia · Latam</span>
            </div>
            <p class="eyebrow">NAJA STUDIO OS</p>
            <h1>Gestiona tu barbería con<br>precisión y estilo.</h1>
            <p class="lead">Agenda citas, administra tu inventario, procesa pagos y atrae clientes — desde un solo panel diseñado para barbershops.</p>
            <div class="hero-actions">
              <a class="button button-dark" routerLink="/booking">▣ Comenzar Gratis →</a>
              <a class="button button-light" href="#caracteristicas">Ver Funcionalidades ↓</a>
            </div>
            <div class="perks">
              <span>⚡ Sin instalación</span>
              <span>💰 Planes desde COP $0</span>
              <span>🔒 Seguro y confiable</span>
            </div>
          </div>
          <div class="hero-visual">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAubVCNIVudhrapcMd17-AbO1IUdwFIWeBWEzh3I_8_pRMDorr2jXU2UgD3xqewfZOewrdQxiRu2iYgATwwB9jbihdgSMjI9Z5T742xXgA0DpeSMK2pL7K5PQjrNhCQCEfajL73_snLDht2P8KT4LvNblVo22TbfFOG7qdGeN-ornMKMMblKB4AELpvfe76wD0I96LNTN3ZHs52wvInJFgCmUNTIc7q2W40MHfFWjOP4MB3W35Hw9Zsxw" alt="Navaja Studio OS — plataforma de gestión para barberías" />
            <div class="visual-caption"><small>PLATAFORMA TODO-EN-UNO</small><strong>Control total desde un solo lugar.</strong><span>Diseñado para barbershops en Latam</span></div>
          </div>
        </section>

        <section class="features section-shell" id="caracteristicas">
          <div class="section-heading"><div><p class="eyebrow">CARACTERÍSTICAS</p><h2>Todo lo que tu barbería necesita.</h2></div><p>Herramientas potentes pensadas para el flujo diario de un barbershop.</p></div>
          <div class="feature-grid">
            <article class="feature-card"><div class="feature-icon">📅</div><h3>Agenda Inteligente</h3><p>Gestiona citas, bloques de disponibilidad y confirmaciones automáticas. Tus clientes reservan en segundos.</p></article>
            <article class="feature-card"><div class="feature-icon">👥</div><h3>Gestión de Clientes</h3><p>Historial completo, preferencias, consentimientos y marketing segmentado. Conoce a cada cliente como nadie.</p></article>
            <article class="feature-card"><div class="feature-icon">📦</div><h3>Inventario en Tiempo Real</h3><p>Control de productos, compras a proveedores y alertas de stock bajo. Nunca te quedes sin insumos.</p></article>
            <article class="feature-card"><div class="feature-icon">💰</div><h3>Caja y Finanzas</h3><p>Registro de transacciones, reportes financieros y conciliación. Tu contabilidad en un solo lugar.</p></article>
            <article class="feature-card"><div class="feature-icon">🏪</div><h3>Páginas Públicas</h3><p>Ficha de tu negocio con fotos, servicios y reserva online. Atrae nuevos clientes con tu página profesional.</p></article>
            <article class="feature-card"><div class="feature-icon">⚙️</div><h3>Personalización Total</h3><p>Branding, colores, logo y configuración por sucursal. Tu marca, tu estilo, tu plataforma.</p></article>
          </div>
        </section>

        <section class="pricing section-shell" id="planes">
          <div class="section-heading"><div><p class="eyebrow">PLANES</p><h2>Empieza gratis, crece sin límites.</h2></div><p>Sin sorpresas. Cancela cuando quieras.</p></div>
          <div class="pricing-grid">
            <article class="pricing-card">
              <div class="pricing-badge">GRATUITO</div>
              <h3>Starter <small>$0 COP</small></h3>
              <ul>
                <li>1 barbería</li>
                <li>Hasta 50 citas/mes</li>
                <li>Gestión de clientes</li>
                <li>Agenda básica</li>
              </ul>
              <a class="button button-light" routerLink="/booking">Comenzar →</a>
            </article>
            <article class="pricing-card featured">
              <div class="pricing-badge">✦ EL MÁS POPULAR</div>
              <h3>Professional <small>$49.900 COP/mes</small></h3>
              <ul>
                <li>Hasta 3 barberías</li>
                <li>Citas ilimitadas</li>
                <li>Inventario + proveedores</li>
                <li>Caja y reportes</li>
                <li>Página pública</li>
                <li>Personalización de marca</li>
              </ul>
              <a class="button button-dark" routerLink="/booking">Comenzar →</a>
            </article>
            <article class="pricing-card">
              <div class="pricing-badge">EMPRESA</div>
              <h3>Enterprise <small>Personalizado</small></h3>
              <ul>
                <li>Barberías ilimitadas</li>
                <li>Equipo ilimitado</li>
                <li>API dedicada</li>
                <li>Soporte prioritario</li>
                <li>Onboarding dedicado</li>
              </ul>
              <a class="button button-light" routerLink="/booking">Contacto →</a>
            </article>
          </div>
        </section>

        <section class="testimonials section-shell" id="testimonios">
          <div class="section-heading"><div><p class="eyebrow">TESTIMONIOS</p><h2>Barbershops que ya confían en nosotros.</h2></div></div>
          <div class="testimonial-grid">
            <article><p>"Navaja Studio nos cambió la vida. Antes teníamos agendas en papel y ahora todo es digital, rápido y confiable."</p><strong>Andrés Morales</strong><small>Barbería El Aristocracia</small></article>
            <article><p>"La página pública nos trajo clientes nuevos todos los meses. El booking online aumentó nuestras reservas un 40%."</p><strong>Santiago Vega</strong><small>Grooming Studio Bogotá</small></article>
            <article><p>"Finalmente una plataforma que entiende las necesidades de los barbershops colombianos. Precios en COP, soporte local."</p><strong>Mariana Reyes</strong><small>Salón Roma Norte</small></article>
          </div>
        </section>

        <section class="cta section-shell">
          <div><p class="eyebrow">TU PRÓXIMO PASO</p><h2>Es hora de digitalizar tu barbería.</h2><p>Empieza gratis hoy y lleva tu negocio al siguiente nivel.</p></div>
          <a class="button button-cream" routerLink="/booking">Comenzar ahora →</a>
        </section>
      </main>

      <footer class="site-footer">
        <div><span class="footer-brand">Navaja Studio OS</span><p>La plataforma definitiva para barbershops en Latam. Hecho con ❤️ en Colombia.</p></div>
        <div><p class="footer-label">ENLACES</p><a routerLink="/booking">Reservar</a><a href="#caracteristicas">Características</a><a href="#planes">Planes</a></div>
        <div><p class="footer-label">LEGAL</p><a href="#">Privacidad</a><a href="#">Términos</a></div>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .landing-page { --ink: #412311; --deep: #5a3825; --brown: #944928; --cream: #fdf9f0; --paper: #f7f3ea; --line: #e6e2d9; color: #1c1c16; background: var(--cream); font: 14px/1.5 'Plus Jakarta Sans', sans-serif; }
    .site-header { align-items: center; background: rgba(253,249,240,.92); backdrop-filter: blur(14px); display: flex; height: 80px; justify-content: space-between; padding: 0 clamp(20px, 5vw, 64px); position: sticky; top: 0; z-index: 5; }
    .brand, .footer-brand { align-items: center; color: var(--ink); display: flex; font: 700 22px/1 'Vollkorn', serif; gap: 10px; text-decoration: none; }
    .brand small { font: 400 11px/1 'Plus Jakarta Sans', sans-serif; color: var(--brown); margin-left: 4px; }
    .brand-mark { align-items: center; background: var(--deep); border-radius: 8px; color: #ffdbca; display: flex; font: 18px sans-serif; height: 34px; justify-content: center; width: 34px; }
    .desktop-nav { display: flex; gap: 8px; }
    .desktop-nav a, .login-link { color: #50443e; padding: 10px 12px; text-decoration: none; }
    .desktop-nav a:hover, .login-link:hover { color: var(--brown); }
    .header-actions { align-items: center; display: flex; gap: 14px; }
    .button { align-items: center; border: 0; border-radius: 8px; display: inline-flex; font-weight: 700; gap: 8px; justify-content: center; padding: 13px 20px; text-decoration: none; transition: .2s ease; }
    .button-dark { background: var(--ink); color: white; }
    .button-dark:hover { background: var(--deep); transform: translateY(-1px); }
    .button-light { background: white; color: var(--ink); }
    .button-cream { background: var(--cream); color: var(--ink); }
    .section-shell { margin: 0 auto; max-width: 1280px; padding-left: clamp(20px, 5vw, 64px); padding-right: clamp(20px, 5vw, 64px); }
    .hero { align-items: center; display: grid; gap: clamp(40px, 6vw, 88px); grid-template-columns: 1.05fr .75fr; min-height: 650px; padding-bottom: 90px; padding-top: 88px; }
    .badge-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
    .badge { background: white; border-radius: 999px; box-shadow: 0 2px 10px #4a2e1b0d; color: var(--ink); font-size: 11px; font-weight: 700; padding: 8px 12px; }
    .badge-muted { background: #f1eee5; color: #50443e; }
    .eyebrow { color: var(--brown); font-size: 11px; font-weight: 700; letter-spacing: .16em; margin: 0 0 10px; }
    .hero h1 { color: var(--ink); font: 700 clamp(38px, 5vw, 64px)/1.08 'Vollkorn', serif; margin: 0 0 20px; max-width: 720px; }
    .lead { color: #50443e; font-size: 16px; line-height: 1.65; margin: 0 0 28px; max-width: 650px; }
    .hero-actions { display: flex; flex-wrap: wrap; gap: 12px; }
    .perks { background: #f1eee5aa; border-radius: 12px; display: flex; flex-wrap: wrap; gap: 18px; margin-top: 30px; padding: 16px; }
    .perks span { color: #50443e; font-size: 12px; font-weight: 700; }
    .hero-visual { position: relative; }
    .hero-visual > img { aspect-ratio: 4/5; border-radius: 18px; box-shadow: 0 18px 40px #4a2e1b1f; display: block; object-fit: cover; width: 100%; }
    .visual-caption { background: linear-gradient(transparent, #412311e8); border-radius: 0 0 18px 18px; bottom: 0; color: white; display: flex; flex-direction: column; gap: 4px; left: 0; padding: 70px 24px 22px; position: absolute; right: 0; }
    .visual-caption small { color: #ffb598; font-weight: 700; letter-spacing: .12em; }
    .visual-caption strong { font: 600 22px/1.2 'Vollkorn', serif; }
    .visual-caption span { color: #f1eee5; font-size: 12px; }
    .features, .pricing, .testimonials, .cta { padding-bottom: 100px; padding-top: 40px; }
    .section-heading { align-items: end; display: flex; gap: 30px; justify-content: space-between; margin-bottom: 30px; }
    .section-heading h2 { color: var(--ink); font: 700 42px/1.1 'Vollkorn', serif; margin: 0; }
    .section-heading > p { max-width: 420px; color: #50443e; font-size: 13px; margin: 0; }
    .feature-grid { display: grid; gap: 20px; grid-template-columns: repeat(3, 1fr); }
    .feature-card { background: white; border-radius: 16px; padding: 28px; display: flex; flex-direction: column; }
    .feature-icon { font-size: 32px; margin-bottom: 12px; }
    .feature-card h3 { color: var(--ink); font: 600 22px 'Vollkorn', serif; margin: 0 0 10px; }
    .feature-card p { color: #50443e; font-size: 13px; margin: 0; line-height: 1.6; }
    .pricing-grid { display: grid; gap: 20px; grid-template-columns: repeat(3, 1fr); }
    .pricing-card { background: white; border-radius: 16px; padding: 32px; display: flex; flex-direction: column; position: relative; }
    .pricing-card.featured { background: var(--deep); color: white; }
    .pricing-badge { background: var(--brown); border-radius: 999px; color: white; display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: .08em; margin-bottom: 15px; padding: 6px 9px; }
    .pricing-card.featured .pricing-badge { background: #944928; }
    .pricing-card h3 { color: var(--ink); font: 600 24px 'Vollkorn', serif; margin: 0 0 20px; }
    .pricing-card.featured h3, .pricing-card.featured p { color: white; }
    .pricing-card h3 small { float: right; font: 700 16px 'Plus Jakarta Sans', sans-serif; }
    .pricing-card ul { list-style: none; margin: 0 0 28px; padding: 0; }
    .pricing-card li { color: #50443e; font-size: 13px; padding: 4px 0; }
    .pricing-card.featured li { color: #f1eee5; }
    .testimonial-grid { display: grid; gap: 20px; grid-template-columns: repeat(3, 1fr); }
    .testimonial-grid article { background: white; border-radius: 16px; padding: 28px; }
    .testimonial-grid article p { color: #50443e; font-style: italic; font-size: 14px; line-height: 1.6; margin: 0 0 16px; }
    .testimonial-grid article strong { color: var(--ink); display: block; font: 600 16px 'Vollkorn', serif; }
    .testimonial-grid article small { color: #944928; font-size: 12px; }
    .cta { align-items: center; background: var(--deep); color: white; display: flex; gap: 30px; justify-content: space-between; padding: 72px max(20px, calc((100% - 1152px)/2)); }
    .cta h2 { font: 700 44px 'Vollkorn', serif; margin: 0 0 5px; }
    .cta p { color: #f1eee5; margin: 0; }
    .site-footer { background: #f1eee5; display: grid; gap: 48px; grid-template-columns: 1.5fr 1fr .8fr; padding: 60px max(20px, calc((100% - 1152px)/2)); }
    .site-footer > div { display: flex; flex-direction: column; gap: 8px; }
    .footer-label { color: var(--brown); font-size: 10px; font-weight: 700; letter-spacing: .12em; }
    .site-footer a { color: #50443e; font-size: 13px; text-decoration: none; }
    .site-footer a:hover { color: var(--brown); }
    .site-footer p, .footer-brand { font-size: 13px; }
    .site-footer p { color: #50443e; margin: 0; }
    @media (max-width: 900px) { .desktop-nav, .login-link { display: none; } .hero { grid-template-columns: 1fr; padding-top: 48px; } .hero-visual { margin: 0 auto; max-width: 520px; width: 100%; } .feature-grid, .pricing-grid, .testimonial-grid { grid-template-columns: 1fr; } .section-heading { align-items: start; flex-direction: column; } }
    @media (max-width: 600px) { .site-header { height: 68px; padding: 0 18px; } .brand { font-size: 20px; } .header-actions .button { font-size: 11px; padding: 10px 12px; } .hero h1 { font-size: 40px; } .hero-actions .button { width: 100%; } .perks { flex-direction: column; gap: 9px; } .feature-grid, .pricing-grid, .testimonial-grid, .site-footer { grid-template-columns: 1fr; } .section-heading h2, .cta h2 { font-size: 35px; } .cta { align-items: start; flex-direction: column; } }
  `],
})
export class LandingComponent {}
