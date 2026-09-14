import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="landing-page">
      <header class="site-header">
        <a class="brand" routerLink="/" aria-label="Navaja Studio inicio">
          <span class="brand-mark">✂</span>
          <span>Navaja Studio</span>
        </a>
        <nav class="desktop-nav" aria-label="Navegación principal">
          <a href="#rituales">Servicios</a>
          <a href="#barberos">Maestros Barberos</a>
          <a href="#experiencia">Experiencia</a>
          <a href="#ubicacion">Sucursales</a>
        </nav>
        <div class="header-actions">
          <a class="login-link" routerLink="/login">Iniciar sesión</a>
          <a class="button button-dark" routerLink="/booking"><span>▣</span> Reservar Cita</a>
          <span class="profile-mark" aria-hidden="true">●</span>
        </div>
      </header>

      <main>
        <section class="hero section-shell">
          <div class="hero-copy">
            <div class="badge-row">
              <span class="badge">★ 4.9 en Google Reviews</span>
              <span class="badge badge-muted"><i></i> Roma Norte · Abierto hoy</span>
            </div>
            <p class="eyebrow">ROMA NORTE GROOMING ATELIER</p>
            <h1>El arte del corte clásico y el cuidado masculino contemporáneo.</h1>
            <p class="lead">Un espacio exclusivo donde la tradición de la barbería clásica se fusiona con técnicas de vanguardia, café de especialidad y rituales de toalla caliente.</p>
            <div class="hero-actions">
              <a class="button button-dark" routerLink="/booking">▣ Reservar Cita Online</a>
              <a class="button button-light" href="#rituales">Explorar Menú de Servicios ↓</a>
            </div>
            <div class="perks">
              <span>☕ Espresso & Whisky</span>
              <span>♨ Toallas al Vapor</span>
              <span>◷ Puntualidad Absoluta</span>
            </div>
          </div>
          <div class="hero-visual">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAubVCNIVudhrapcMd17-AbO1IUdwFIWeBWEzh3I_8_pRMDorr2jXU2UgD3xqewfZOewrdQxiRu2iYgATwwB9jbihdgSMjI9Z5T742xXgA0DpeSMK2pL7K5PQjrNhCQCEfajL73_snLDht2P8KT4LvNblVo22TbfFOG7qdGeN-ornMKMMblKB4AELpvfe76wD0I96LNTN3ZHs52wvInJFgCmUNTIc7q2W40MHfFWjOP4MB3W35Hw9Zsxw" alt="Barbero atendiendo a un cliente en Navaja Studio" />
            <div class="visual-caption"><small>ATELIER ROMA NORTE</small><strong>Cuidado artesanal, precisión milimétrica.</strong><span>⌖ Colima 184, Roma Norte, CDMX</span></div>
            <div class="floating-note"><b>✂</b><span>Navaja Libre Japonesa<small>Acero al carbono forjado a mano</small></span></div>
          </div>
        </section>

        <section class="metrics section-shell">
          <article><small>COMUNIDAD</small><strong>4,800+</strong><p>Clientes habituales en Roma Norte y Condesa</p></article>
          <article><small>EXPERIENCIA</small><strong>12</strong><p>Barberos Maestros con certificación internacional</p></article>
          <article><small>APROBACIÓN</small><strong>98%</strong><p>Satisfacción en afeitado y diseño de barba</p></article>
          <article><small>HOSPITALIDAD</small><strong>100%</strong><p>Barra de café de especialidad incluida</p></article>
        </section>

        <section class="rituals section-shell" id="rituales">
          <div class="section-heading"><div><p class="eyebrow">MENÚ CURADO DE AUTOR</p><h2>Nuestros Rituales</h2></div><p>Cada servicio es un momento de pausa y rejuvenecimiento. Incluye diagnóstico capilar, toalla humectante tibia y bebida de bienvenida.</p></div>
          <div class="service-grid">
            <article class="service-card"><div><h3>Corte Clásico Navaja <b>$450 <small>MXN</small></b></h3><p>Lavado previo con champú botánico, corte a tijera y máquina artesanal con acabado en navaja libre al cuello, estilización y pomada orgánica.</p></div><footer><span>◷ 45 minutos</span><a routerLink="/booking">Seleccionar →</a></footer></article>
            <article class="service-card"><div><h3>Ritual de Barba Completo <b>$380 <small>MXN</small></b></h3><p>Triple toalla caliente al vapor, aceites esenciales nutritivos, afeitado y perfilado con navaja libre, finalizado con bálsamo calmante.</p></div><footer><span>◷ 40 minutos</span><a routerLink="/booking">Seleccionar →</a></footer></article>
            <article class="service-card featured"><div><span class="popular">✦ EL MÁS SOLICITADO</span><h3>Experiencia Navaja Signature <b>$760 <small>MXN</small></b></h3><p>Corte clásico de autor + ritual completo de barba al vapor + exfoliación facial artesanal + bebida de alta gama de cortesía.</p></div><footer><span>◷ 80 minutos · Tratamiento Integral</span><a routerLink="/booking">Agendar Signature →</a></footer></article>
            <article class="service-card"><div><h3>Cuidado Capilar & Matiz <b>$390 <small>MXN</small></b></h3><p>Tratamiento revitalizante para cuero cabelludo con barro volcánico y matizado sutil y natural de canas.</p></div><footer><span>◷ 35 minutos</span><a routerLink="/booking">Seleccionar →</a></footer></article>
          </div>
        </section>

        <section class="experience section-shell" id="experiencia">
          <div class="section-heading"><div><p class="eyebrow">MÁS QUE UN CORTE</p><h2>Una pausa con carácter.</h2></div><p>Texturas nobles, conversación honesta y rituales pensados para salir renovado.</p></div>
          <div class="experience-grid"><div class="experience-photo"></div><div class="experience-copy"><span class="quote">“</span><h3>La precisión también puede sentirse.</h3><p>Desde el primer café hasta el último trazo de navaja, cada detalle está diseñado para que el tiempo se detenga.</p><a class="text-link" routerLink="/booking">Conoce la experiencia →</a></div></div>
        </section>

        <section class="team section-shell" id="barberos">
          <div class="section-heading"><div><p class="eyebrow">MANOS EXPERTAS</p><h2>Maestros Barberos</h2></div><p>Oficio, criterio y una mirada propia para cada rostro.</p></div>
          <div class="team-grid">
            <article><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4lk-8daN6Rn8KlRk57b_NsFYlg2z8JUOb6CnEVBIxdxO4TrD-9mXwYYmrV0qWUTldz2iJ_3wkvAo2u4XfngLczZ5xmWDPZLxGFVWVYKe903PPWumxCwdC63cVv7EvneYGNWjzrPV-Oy9fy0FPM_E-tQUnf7WGD2lq0FmD-vl_IOwLtsveaJ1idonJ9mq0_5MxEk6me5MXWaEz-AHYbf4fpeJ8NXwKfttrqEHvTmQZGwDHfrmOhSJDOA" alt="Andrés Morales, maestro barbero" /><h3>Andrés Morales</h3><p>Corte clásico · 14 años de oficio</p></article>
              <article><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsR1rNUt830DBaYr8DsCGDIcbQpkRWBim_eoJrno2Z2jmxZixv-PRtwYiNgKPGmRbuCe4JUYe2X_o-e1v5pKW5uQ_dNcenGe7bZm9feE4_WpfVKV3MAl8D7BETxQbPL7LEHOnTU6XQNcKUGjN_Lpduov25ll-HiJ-Pd-XMxdH2fVWT0uhPNrJ799EGcNXY1foxmHEW7JzWLeU_1tKHSvoUHWVb7_a_LjZVJ7rZJzKNm4max0Hd5P1zQ" alt="Santiago Vega, maestro barbero" /><h3>Santiago Vega</h3><p>Barba tradicional · Diseño de rostro</p></article>
              <article><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6VO6MWMfkUaLihHzHKMss2xHJVvY7vGcGLRaJA4JIAfpqiNynmErYxaG3ECEumBir8Dgud_6ow9SRPo-Tqy2D28OLe-ZzvIksPkCVWOkb9GcpyjzD9O7r7qkVNIWTtgawMphUHwhWJoSN2UsqktXOs6kYabDnD5Drfw53ybeP3NtAu8ux9-9TDv535OexO3wiLphLYqR0tIvTEPrgXHsEuyQsfThDs0aLiA9dS4mcKVfLeMBdvPG8DQ" alt="Mariana Reyes, directora de barbería" /><h3>Mariana Reyes</h3><p>Dirección creativa · Textura y color natural</p></article>
          </div>
        </section>

        <section class="booking-cta" id="reservar"><div><p class="eyebrow">TU PRÓXIMO RITUAL</p><h2>Haz espacio para ti.</h2><p>Reserva en línea y déjanos preparar tu experiencia.</p></div><a class="button button-cream" routerLink="/booking">Reservar mi cita →</a></section>
      </main>

      <footer class="site-footer" id="ubicacion"><div><span class="footer-brand">Navaja Studio</span><p>Atelier de cuidado masculino, tradición artesanal y barbería de precisión en el corazón de la Ciudad de México.</p><small>● ESTUDIO ABIERTO · ROMA NORTE</small></div><div><p class="footer-label">UBICACIÓN & HORARIOS</p><strong>Colima 184, Roma Norte</strong><p>Cuauhtémoc, 06700 CDMX</p><p class="hours">Lunes – Viernes: 09:00 – 20:00<br />Sábados: 09:00 – 19:00<br />Domingos: 10:00 – 16:00</p></div><div><p class="footer-label">COMUNIDAD</p><a href="#barberos">El Equipo</a><a href="#rituales">Rituales Navaja</a><a routerLink="/booking">Contacto & Prensa</a></div></footer>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .landing-page { --ink: #412311; --deep: #5a3825; --brown: #944928; --cream: #fdf9f0; --paper: #f7f3ea; --line: #e6e2d9; color: #1c1c16; background: var(--cream); font: 14px/1.5 'Plus Jakarta Sans', sans-serif; }
    .site-header { align-items: center; background: rgba(253,249,240,.92); backdrop-filter: blur(14px); display: flex; height: 80px; justify-content: space-between; padding: 0 clamp(20px, 5vw, 64px); position: sticky; top: 0; z-index: 5; }
    .brand, .footer-brand { align-items: center; color: var(--ink); display: flex; font: 700 22px/1 'Vollkorn', serif; gap: 10px; text-decoration: none; }.brand-mark { align-items: center; background: var(--deep); border-radius: 8px; color: #ffdbca; display: flex; font: 18px sans-serif; height: 34px; justify-content: center; width: 34px; }
    .desktop-nav { display: flex; gap: 8px; }.desktop-nav a, .login-link { color: #50443e; padding: 10px 12px; text-decoration: none; }.desktop-nav a:hover, .login-link:hover { color: var(--brown); }
    .header-actions { align-items: center; display: flex; gap: 14px; }.button { align-items: center; border: 0; border-radius: 8px; display: inline-flex; font-weight: 700; gap: 8px; justify-content: center; padding: 13px 20px; text-decoration: none; transition: .2s ease; }.button-dark { background: var(--ink); color: white; }.button-dark:hover { background: var(--deep); transform: translateY(-1px); }.button-light { background: white; color: var(--ink); }.button-cream { background: var(--cream); color: var(--ink); }.profile-mark { align-items: center; background: var(--ink); border-radius: 50%; color: white; display: flex; font-size: 12px; height: 32px; justify-content: center; width: 32px; }
    .section-shell { margin: 0 auto; max-width: 1280px; padding-left: clamp(20px, 5vw, 64px); padding-right: clamp(20px, 5vw, 64px); }.hero { align-items: center; display: grid; gap: clamp(40px, 6vw, 88px); grid-template-columns: 1.05fr .75fr; min-height: 650px; padding-bottom: 90px; padding-top: 88px; }.badge-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }.badge { background: white; border-radius: 999px; box-shadow: 0 2px 10px #4a2e1b0d; color: var(--ink); font-size: 11px; font-weight: 700; padding: 8px 12px; }.badge-muted { background: #f1eee5; color: #50443e; }.badge-muted i { background: #014a2f; border-radius: 50%; display: inline-block; height: 8px; margin-right: 5px; width: 8px; }.eyebrow { color: var(--brown); font-size: 11px; font-weight: 700; letter-spacing: .16em; margin: 0 0 10px; }.hero h1 { color: var(--ink); font: 700 clamp(38px, 5vw, 64px)/1.08 'Vollkorn', serif; margin: 0 0 20px; max-width: 720px; }.lead { color: #50443e; font-size: 16px; line-height: 1.65; margin: 0 0 28px; max-width: 650px; }.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; }.perks { background: #f1eee5aa; border-radius: 12px; display: flex; flex-wrap: wrap; gap: 18px; margin-top: 30px; padding: 16px; }.perks span { color: #50443e; font-size: 12px; font-weight: 700; }.hero-visual { position: relative; }.hero-visual > img { aspect-ratio: 4/5; border-radius: 18px; box-shadow: 0 18px 40px #4a2e1b1f; display: block; object-fit: cover; width: 100%; }.visual-caption { background: linear-gradient(transparent, #412311e8); border-radius: 0 0 18px 18px; bottom: 0; color: white; display: flex; flex-direction: column; gap: 4px; left: 0; padding: 70px 24px 22px; position: absolute; right: 0; }.visual-caption small { color: #ffb598; font-weight: 700; letter-spacing: .12em; }.visual-caption strong { font: 600 22px/1.2 'Vollkorn', serif; }.visual-caption span { color: #f1eee5; font-size: 12px; }.floating-note { align-items: center; background: white; border-radius: 12px; bottom: -22px; box-shadow: 0 12px 30px #4a2e1b1c; display: flex; gap: 12px; left: -22px; padding: 13px; position: absolute; }.floating-note b { align-items: center; background: #f1eee5; border-radius: 8px; color: var(--ink); display: flex; font-size: 20px; height: 46px; justify-content: center; width: 46px; }.floating-note span { color: var(--ink); font-size: 12px; font-weight: 700; }.floating-note small { color: #50443e; display: block; font-weight: 400; margin-top: 3px; }
    .metrics { display: grid; gap: 16px; grid-template-columns: repeat(4, 1fr); padding-bottom: 72px; }.metrics article { background: white; border-radius: 12px; box-shadow: 0 3px 14px #4a2e1b0b; padding: 22px; }.metrics small, .footer-label { color: var(--brown); font-size: 10px; font-weight: 700; letter-spacing: .12em; }.metrics strong { color: var(--ink); display: block; font-size: 30px; margin: 12px 0 2px; }.metrics p, .service-card p, .section-heading > p { color: #50443e; font-size: 13px; margin: 0; }
    .rituals, .experience, .team { padding-bottom: 100px; padding-top: 40px; }.section-heading { align-items: end; display: flex; gap: 30px; justify-content: space-between; margin-bottom: 30px; }.section-heading h2 { color: var(--ink); font: 700 42px/1.1 'Vollkorn', serif; margin: 0; }.section-heading > p { max-width: 420px; }.service-grid { display: grid; gap: 18px; grid-template-columns: repeat(2, 1fr); }.service-card { background: white; border-radius: 16px; display: flex; flex-direction: column; justify-content: space-between; min-height: 240px; padding: 28px; }.service-card.featured { background: var(--deep); color: white; grid-column: span 2; }.service-card h3 { color: var(--ink); font: 600 24px/1.15 'Vollkorn', serif; margin: 0 0 18px; }.service-card h3 b { float: right; font: 700 25px/1 'Plus Jakarta Sans', sans-serif; }.service-card h3 small { color: #83746d; font-size: 11px; }.service-card.featured h3, .service-card.featured p { color: white; }.service-card.featured h3 b { color: #ffb598; }.service-card.featured h3 small { color: #d2a289; }.service-card footer { align-items: center; background: #f7f3ea; border-radius: 10px; color: #50443e; display: flex; font-size: 12px; justify-content: space-between; margin-top: 28px; padding: 13px; }.service-card.featured footer { background: #41231199; color: #f1eee5; }.service-card footer a { color: var(--brown); font-weight: 700; text-decoration: none; }.service-card.featured footer a { background: var(--cream); border-radius: 7px; color: var(--ink); padding: 8px 10px; }.popular { background: #944928; border-radius: 999px; color: white; display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: .08em; margin-bottom: 15px; padding: 6px 9px; }
    .experience { background: #f7f3ea; max-width: none; padding-left: max(20px, calc((100% - 1152px)/2)); padding-right: max(20px, calc((100% - 1152px)/2)); }.experience-grid { align-items: stretch; display: grid; grid-template-columns: 1.1fr .9fr; min-height: 390px; }.experience-photo { background: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAP_LQoKkJ61NOcSttL30yE_nctSqmv6rC06dWfSU5MmJ1bhCRTvNu9gkxhAUAXKIZuKEXWauaZyZ8kaEm4Q7mhvdgJ0xcTQz7rDaBKwY57bm0o07DFmAmMiiQg0t7XLp11iK3_QgWPvaXe62TwCVly_MBZS9fI7ZelKg3If6-T3qk5yBq_EtwUGbzws9v3h4ItEchj-O6j4MPi92jLa7uHJoI3mtAKGAsJeVP8q7UX9gsVBbcJw73JZg') center/cover; min-height: 320px; }.experience-copy { align-items: flex-start; background: var(--ink); color: white; display: flex; flex-direction: column; justify-content: center; padding: clamp(28px, 5vw, 70px); }.quote { color: #fe9e76; font: 70px/0.6 'Vollkorn', serif; }.experience-copy h3 { font: 700 34px/1.15 'Vollkorn', serif; margin: 20px 0 14px; }.experience-copy p { color: #f1eee5; line-height: 1.7; }.text-link { color: #ffb598; font-weight: 700; margin-top: 22px; text-decoration: none; }.team-grid { display: grid; gap: 20px; grid-template-columns: repeat(3, 1fr); }.team-grid article img { aspect-ratio: 1/1.08; border-radius: 14px; display: block; object-fit: cover; width: 100%; }.team-grid h3 { color: var(--ink); font: 600 22px 'Vollkorn', serif; margin: 12px 0 2px; }.team-grid p { color: #50443e; font-size: 12px; margin: 0; }.booking-cta { align-items: center; background: var(--deep); color: white; display: flex; gap: 30px; justify-content: space-between; padding: 72px max(20px, calc((100% - 1152px)/2)); }.booking-cta h2 { font: 700 44px 'Vollkorn', serif; margin: 0 0 5px; }.booking-cta p:last-child { color: #f1eee5; margin: 0; }.site-footer { background: #f1eee5; display: grid; gap: 48px; grid-template-columns: 1.5fr 1fr .8fr; padding: 60px max(20px, calc((100% - 1152px)/2)); }.site-footer > div { display: flex; flex-direction: column; gap: 8px; }.site-footer p { color: #50443e; font-size: 13px; margin: 5px 0; }.site-footer a { color: #50443e; font-size: 13px; text-decoration: none; }.site-footer a:hover { color: var(--brown); }.site-footer small { color: #50443e; font-size: 10px; letter-spacing: .1em; margin-top: 10px; }.hours { line-height: 1.8; margin-top: 14px !important; }
    @media (max-width: 900px) { .desktop-nav, .login-link { display: none; }.hero { grid-template-columns: 1fr; padding-top: 48px; }.hero-visual { margin: 0 auto; max-width: 520px; width: 100%; }.metrics { grid-template-columns: repeat(2, 1fr); }.section-heading { align-items: start; flex-direction: column; }.experience-grid { grid-template-columns: 1fr; }.experience-photo { min-height: 280px; }.site-footer { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 600px) { .site-header { height: 68px; padding: 0 18px; }.brand { font-size: 20px; }.header-actions .button { font-size: 11px; padding: 10px 12px; }.hero h1 { font-size: 40px; }.hero-actions .button { width: 100%; }.perks { flex-direction: column; gap: 9px; }.floating-note { display: none; }.metrics, .service-grid, .team-grid, .site-footer { grid-template-columns: 1fr; }.service-card.featured { grid-column: auto; }.service-card h3 b { display: block; float: none; margin-top: 12px; }.section-heading h2, .booking-cta h2 { font-size: 35px; }.booking-cta { align-items: start; flex-direction: column; }.site-footer { gap: 28px; } }
  `],
})
export class LandingComponent {}
