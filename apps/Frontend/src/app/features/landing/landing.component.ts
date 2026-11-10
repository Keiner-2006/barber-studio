import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="landing">
      <header class="site-header">
        <a class="brand" routerLink="/" aria-label="BarberShop Management System, inicio">
          <span class="brand-mark" aria-hidden="true"><span class="material-symbols-outlined">content_cut</span></span>
          <span class="brand-text">BarberShop<small>Management System</small></span>
        </a>
        <nav class="nav" aria-label="Navegación principal">
          <a href="#caracteristicas">Características</a>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#planes">Planes</a>
          <a href="#testimonios">Testimonios</a>
        </nav>
        <div class="header-actions">
          <a class="link-login" routerLink="/login">Iniciar sesión</a>
          <a class="btn btn-copper btn-sm" routerLink="/onboarding">Comenzar</a>
        </div>
      </header>

      <main>
        <section class="hero">
          <div class="hero-glow" aria-hidden="true"></div>
          <div class="hero-grid" aria-hidden="true"></div>
          <div class="shell hero-inner">
            <div class="hero-copy">
              <span class="chip"><span class="dot" aria-hidden="true"></span> Software para barberías · Colombia y Latam</span>
              <h1>Tu barbería, <em>afilada</em> al detalle.</h1>
              <p class="lead">Agenda, clientes, inventario, caja y tu página de reservas en un solo panel. Menos libreta, más sillas ocupadas.</p>
              <div class="hero-actions">
                <a class="btn btn-copper" routerLink="/onboarding">
                  Comenzar gratis <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                </a>
                <a class="btn btn-ghost" href="#caracteristicas">Ver funcionalidades</a>
              </div>
              <ul class="perks">
                <li><span class="material-symbols-outlined" aria-hidden="true">bolt</span> Sin instalación</li>
                <li><span class="material-symbols-outlined" aria-hidden="true">payments</span> Precios en COP</li>
                <li><span class="material-symbols-outlined" aria-hidden="true">lock</span> Datos aislados por negocio</li>
              </ul>
            </div>

            <div class="mockup" aria-label="Vista previa del panel de agenda" role="img">
              <div class="mock-window">
                <div class="mock-bar"><i></i><i></i><i></i><span>Agenda · Hoy</span></div>
                <div class="mock-body">
                  <div class="mock-head">
                    <div><small>Martes</small><strong>Agenda del día</strong></div>
                    <span class="mock-pill">8 citas</span>
                  </div>
                  <div class="slot slot-copper"><time>09:00</time><div><b>Corte + barba</b><span>Barbero · Silla 1</span></div><em>Confirmada</em></div>
                  <div class="slot"><time>10:30</time><div><b>Fade clásico</b><span>Barbero · Silla 2</span></div><em class="muted">Pendiente</em></div>
                  <div class="slot slot-green"><time>11:15</time><div><b>Perfilado de barba</b><span>Barbero · Silla 1</span></div><em>En curso</em></div>
                  <div class="slot ghost"><time>12:00</time><div><b>Disponible</b><span>Reserva online abierta</span></div></div>
                </div>
              </div>
              <div class="float float-cash">
                <span class="material-symbols-outlined" aria-hidden="true">point_of_sale</span>
                <div><small>Caja de hoy</small><strong>Abierta</strong></div>
              </div>
              <div class="float float-toast">
                <span class="material-symbols-outlined" aria-hidden="true">notifications_active</span>
                <div><strong>Nueva reserva</strong><small>Desde tu página pública</small></div>
              </div>
            </div>
          </div>

          <div class="marquee" aria-hidden="true">
            <div class="marquee-track">
              @for (item of modulesTwice; track $index) {
                <span>{{ item }}</span><i>✦</i>
              }
            </div>
          </div>
        </section>

        <section class="section shell" id="caracteristicas">
          <div class="section-head">
            <p class="eyebrow">Características</p>
            <h2>Todo lo que pasa en tu barbería, en orden.</h2>
            <p>Herramientas pensadas para el flujo real de un barbershop: de la reserva al cierre de caja.</p>
          </div>
          <div class="bento">
            <article class="card card-feature span-2 dark">
              <span class="icon material-symbols-outlined" aria-hidden="true">calendar_month</span>
              <h3>Agenda inteligente</h3>
              <p>Citas por barbero y sucursal, bloques de disponibilidad y estados claros. Tus clientes reservan en segundos.</p>
              <div class="mini-slots" aria-hidden="true"><span></span><span class="on"></span><span></span><span class="on"></span><span class="on"></span><span></span><span></span><span class="on"></span></div>
            </article>
            <article class="card card-feature">
              <span class="icon material-symbols-outlined" aria-hidden="true">group</span>
              <h3>Clientes</h3>
              <p>Historial, preferencias y consentimientos de cada cliente.</p>
            </article>
            <article class="card card-feature">
              <span class="icon material-symbols-outlined" aria-hidden="true">inventory_2</span>
              <h3>Inventario</h3>
              <p>Productos, compras a proveedores y alertas de stock bajo.</p>
            </article>
            <article class="card card-feature">
              <span class="icon material-symbols-outlined" aria-hidden="true">account_balance_wallet</span>
              <h3>Caja y finanzas</h3>
              <p>Apertura, cierre, movimientos y reportes del día.</p>
            </article>
            <article class="card card-feature span-2 copper">
              <span class="icon material-symbols-outlined" aria-hidden="true">storefront</span>
              <h3>Tu página pública</h3>
              <p>Una ficha de tu negocio con servicios, fotos y reserva online. Compártela por WhatsApp o Instagram.</p>
              <span class="url-pill" aria-hidden="true">tudominio.com/<b>tu-barberia</b></span>
            </article>
            <article class="card card-feature">
              <span class="icon material-symbols-outlined" aria-hidden="true">palette</span>
              <h3>Tu marca</h3>
              <p>Logo, colores y configuración por sucursal.</p>
            </article>
          </div>
        </section>

        <section class="section shell" id="como-funciona">
          <div class="section-head">
            <p class="eyebrow">Cómo funciona</p>
            <h2>En marcha el mismo día.</h2>
          </div>
          <ol class="steps">
            <li><span class="step-n">01</span><h3>Registra tu negocio</h3><p>Crea tu cuenta y tu primera sucursal en minutos.</p></li>
            <li><span class="step-n">02</span><h3>Configura servicios y equipo</h3><p>Precios, duraciones, barberos y horarios.</p></li>
            <li><span class="step-n">03</span><h3>Recibe reservas</h3><p>Comparte tu página y gestiona todo desde la agenda.</p></li>
          </ol>
        </section>

        <section class="section shell" id="planes">
          <div class="section-head">
            <p class="eyebrow">Planes</p>
            <h2>Empieza gratis, crece sin límites.</h2>
            <p>Sin sorpresas. Cancela cuando quieras.</p>
          </div>
          <div class="pricing">
            <article class="card plan">
              <p class="plan-name">Starter</p>
              <p class="price">$0 <small>COP</small></p>
              <ul>
                <li>1 barbería</li><li>Hasta 50 citas/mes</li><li>Gestión de clientes</li><li>Agenda básica</li>
              </ul>
              <a class="btn btn-outline" routerLink="/onboarding">Comenzar</a>
            </article>
            <article class="card plan featured">
              <span class="plan-badge">Más popular</span>
              <p class="plan-name">Professional</p>
              <p class="price">$49.900 <small>COP/mes</small></p>
              <ul>
                <li>Hasta 3 barberías</li><li>Citas ilimitadas</li><li>Inventario y proveedores</li><li>Caja y reportes</li><li>Página pública</li><li>Personalización de marca</li>
              </ul>
              <a class="btn btn-copper" routerLink="/onboarding">Comenzar</a>
            </article>
            <article class="card plan">
              <p class="plan-name">Enterprise</p>
              <p class="price">A medida</p>
              <ul>
                <li>Barberías ilimitadas</li><li>Equipo ilimitado</li><li>API dedicada</li><li>Soporte prioritario</li><li>Onboarding dedicado</li>
              </ul>
              <a class="btn btn-outline" routerLink="/booking">Contacto</a>
            </article>
          </div>
        </section>

        <section class="section shell" id="testimonios">
          <div class="section-head">
            <p class="eyebrow">Testimonios</p>
            <h2>Barbershops que ya confían en nosotros.</h2>
          </div>
          <div class="quotes">
            <figure class="card quote"><blockquote>“Antes teníamos agendas en papel y ahora todo es digital, rápido y confiable.”</blockquote><figcaption><strong>Andrés Morales</strong><span>Barbería El Aristocracia</span></figcaption></figure>
            <figure class="card quote"><blockquote>“La página pública nos trajo clientes nuevos todos los meses. El booking online aumentó nuestras reservas un 40%.”</blockquote><figcaption><strong>Santiago Vega</strong><span>Grooming Studio Bogotá</span></figcaption></figure>
            <figure class="card quote"><blockquote>“Por fin una plataforma que entiende a los barbershops colombianos. Precios en COP y soporte local.”</blockquote><figcaption><strong>Mariana Reyes</strong><span>Salón Roma Norte</span></figcaption></figure>
          </div>
        </section>

        <section class="shell">
          <div class="cta">
            <div class="cta-stripes" aria-hidden="true"></div>
            <div class="cta-copy">
              <p class="eyebrow light">Tu próximo paso</p>
              <h2>Es hora de digitalizar tu barbería.</h2>
              <p>Empieza gratis hoy. Sin tarjeta de crédito.</p>
            </div>
            <a class="btn btn-cream" routerLink="/onboarding">Crear mi cuenta <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></a>
          </div>
        </section>
      </main>

      <footer class="footer shell">
        <div>
          <span class="brand-text footer-brand">BarberShop<small>Management System</small></span>
          <p>La plataforma para barbershops en Latam. Hecho en Colombia.</p>
        </div>
        <nav aria-label="Enlaces">
          <p class="eyebrow">Enlaces</p>
          <a routerLink="/booking">Reservar</a><a href="#caracteristicas">Características</a><a href="#planes">Planes</a><a routerLink="/login">Iniciar sesión</a>
        </nav>
        <nav aria-label="Legal">
          <p class="eyebrow">Legal</p>
          <a href="#">Privacidad</a><a href="#">Términos</a>
        </nav>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .landing {
      --espresso: #17100c; --ink: #2a1b12; --deep: #412311; --copper: #c4703f; --copper-2: #e09a68; --copper-soft: #ffdbca;
      --cream: #fbf7ef; --paper: #f3ede1; --line: #e6dccc; --text: #1c1c16; --muted: #5e5149; --green: #2f8a5b;
      background: var(--cream); color: var(--text); font: 16px/1.6 'Plus Jakarta Sans', sans-serif; overflow-x: clip;
    }
    .material-symbols-outlined { font-size: 20px; line-height: 1; }
    .shell { margin: 0 auto; max-width: 1200px; padding-inline: clamp(16px, 5vw, 48px); }
    a { color: inherit; }
    a:focus-visible, button:focus-visible { outline: 3px solid var(--copper-2); outline-offset: 3px; border-radius: 10px; }

    /* Header */
    .site-header { align-items: center; display: flex; gap: 16px; justify-content: space-between; left: 50%; max-width: 1200px; padding: 10px 10px 10px 18px; position: fixed; top: 14px; transform: translateX(-50%); width: calc(100% - 32px); z-index: 50;
      background: rgba(23,16,12,.62); backdrop-filter: blur(16px) saturate(140%); -webkit-backdrop-filter: blur(16px) saturate(140%); border: 1px solid rgba(255,255,255,.08); border-radius: 18px; color: #f6eee4; }
    .brand { align-items: center; display: flex; gap: 10px; text-decoration: none; }
    .brand-mark { align-items: center; background: linear-gradient(135deg, var(--copper-2), var(--copper)); border-radius: 10px; color: var(--espresso); display: flex; height: 36px; justify-content: center; width: 36px; }
    .brand-text { display: flex; flex-direction: column; font: 700 19px/1 'Vollkorn', serif; }
    .brand-text small { font: 600 10px/1.4 'Plus Jakarta Sans', sans-serif; letter-spacing: .14em; opacity: .7; text-transform: uppercase; }
    .nav { display: flex; gap: 2px; }
    .nav a { border-radius: 10px; font-size: 14px; font-weight: 500; opacity: .85; padding: 9px 14px; text-decoration: none; transition: background .2s, opacity .2s; }
    .nav a:hover { background: rgba(255,255,255,.08); opacity: 1; }
    .header-actions { align-items: center; display: flex; gap: 8px; }
    .link-login { font-size: 14px; font-weight: 600; padding: 9px 12px; text-decoration: none; }
    .link-login:hover { color: var(--copper-2); }

    /* Buttons */
    .btn { align-items: center; border: 1px solid transparent; border-radius: 12px; cursor: pointer; display: inline-flex; font: 700 15px/1 'Plus Jakarta Sans', sans-serif; gap: 8px; justify-content: center; min-height: 48px; padding: 0 22px; text-decoration: none; transition: transform .2s ease, background .2s ease, box-shadow .2s ease, border-color .2s; }
    .btn-sm { font-size: 14px; min-height: 40px; padding: 0 16px; }
    .btn-copper { background: linear-gradient(135deg, var(--copper-2), var(--copper)); box-shadow: 0 8px 24px rgba(196,112,63,.35); color: var(--espresso); }
    .btn-copper:hover { box-shadow: 0 12px 30px rgba(196,112,63,.45); transform: translateY(-2px); }
    .btn-ghost { border-color: rgba(255,255,255,.22); color: #f6eee4; }
    .btn-ghost:hover { background: rgba(255,255,255,.08); }
    .btn-outline { border-color: var(--line); color: var(--ink); }
    .btn-outline:hover { background: var(--paper); border-color: var(--copper); }
    .btn-cream { background: var(--cream); color: var(--ink); }
    .btn-cream:hover { transform: translateY(-2px); }

    /* Hero */
    .hero { background: var(--espresso); color: #f6eee4; overflow: hidden; padding-top: 130px; position: relative; }
    .hero-glow { background: radial-gradient(600px 400px at 78% 30%, rgba(196,112,63,.38), transparent 70%), radial-gradient(500px 360px at 8% 90%, rgba(148,73,40,.32), transparent 70%); inset: 0; position: absolute; }
    .hero-grid { background-image: linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px); background-size: 56px 56px; inset: 0; mask-image: radial-gradient(ellipse at 60% 40%, #000 20%, transparent 75%); -webkit-mask-image: radial-gradient(ellipse at 60% 40%, #000 20%, transparent 75%); position: absolute; }
    .hero-inner { align-items: center; display: grid; gap: clamp(40px, 6vw, 72px); grid-template-columns: 1.05fr .95fr; padding-bottom: 88px; position: relative; }
    .chip { align-items: center; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); border-radius: 999px; display: inline-flex; font-size: 13px; font-weight: 600; gap: 8px; padding: 7px 14px; }
    .dot { background: #5fd49a; border-radius: 50%; box-shadow: 0 0 0 4px rgba(95,212,154,.18); height: 8px; width: 8px; }
    .hero h1 { font: 700 clamp(42px, 6.2vw, 78px)/1.02 'Vollkorn', serif; letter-spacing: -.02em; margin: 22px 0 20px; }
    .hero h1 em { background: linear-gradient(120deg, var(--copper-soft), var(--copper-2) 50%, var(--copper)); -webkit-background-clip: text; background-clip: text; color: transparent; font-style: italic; }
    .lead { color: #d9cdc1; font-size: clamp(16px, 1.6vw, 19px); margin: 0 0 30px; max-width: 34em; }
    .hero-actions { display: flex; flex-wrap: wrap; gap: 12px; }
    .perks { display: flex; flex-wrap: wrap; gap: 10px 22px; list-style: none; margin: 30px 0 0; padding: 0; }
    .perks li { align-items: center; color: #cbbdb0; display: flex; font-size: 14px; font-weight: 600; gap: 6px; }
    .perks .material-symbols-outlined { color: var(--copper-2); font-size: 18px; }

    /* Mockup */
    .mockup { position: relative; }
    .mock-window { animation: rise .8s cubic-bezier(.2,.7,.2,1) both; background: rgba(255,255,255,.06); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,.12); border-radius: 22px; box-shadow: 0 40px 80px rgba(0,0,0,.45); overflow: hidden; transform: perspective(1400px) rotateY(-6deg) rotateX(3deg); }
    .mock-bar { align-items: center; border-bottom: 1px solid rgba(255,255,255,.08); display: flex; gap: 6px; padding: 12px 16px; }
    .mock-bar i { background: rgba(255,255,255,.18); border-radius: 50%; height: 10px; width: 10px; }
    .mock-bar span { color: #b9ab9e; font-size: 12px; margin-left: 10px; }
    .mock-body { display: grid; gap: 10px; padding: 18px; }
    .mock-head { align-items: end; display: flex; justify-content: space-between; margin-bottom: 4px; }
    .mock-head small { color: #b9ab9e; display: block; font-size: 12px; }
    .mock-head strong { font: 600 22px 'Vollkorn', serif; }
    .mock-pill { background: rgba(196,112,63,.2); border-radius: 999px; color: var(--copper-soft); font-size: 12px; font-weight: 700; padding: 5px 10px; }
    .slot { align-items: center; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08); border-left: 3px solid rgba(255,255,255,.25); border-radius: 12px; display: grid; gap: 14px; grid-template-columns: 48px 1fr auto; padding: 12px 14px; }
    .slot time { color: #b9ab9e; font-size: 13px; font-weight: 700; }
    .slot b { display: block; font-size: 14px; }
    .slot span { color: #a99a8c; font-size: 12px; }
    .slot em { background: rgba(255,255,255,.08); border-radius: 999px; font-size: 11px; font-style: normal; font-weight: 700; padding: 4px 9px; }
    .slot em.muted { color: #b9ab9e; }
    .slot-copper { border-left-color: var(--copper-2); }
    .slot-copper em { background: rgba(224,154,104,.2); color: var(--copper-soft); }
    .slot-green { border-left-color: #5fd49a; }
    .slot-green em { background: rgba(95,212,154,.16); color: #a6f0c8; }
    .slot.ghost { border-style: dashed; opacity: .6; }
    .float { align-items: center; animation: bob 6s ease-in-out infinite; background: var(--cream); border-radius: 16px; box-shadow: 0 18px 40px rgba(0,0,0,.35); color: var(--ink); display: flex; gap: 12px; padding: 12px 16px; position: absolute; }
    .float .material-symbols-outlined { align-items: center; background: var(--paper); border-radius: 10px; color: var(--copper); display: flex; height: 36px; justify-content: center; width: 36px; }
    .float small { color: var(--muted); display: block; font-size: 12px; }
    .float strong { display: block; font-size: 14px; }
    .float-cash { bottom: -22px; left: -28px; }
    .float-toast { animation-delay: -3s; right: -18px; top: -26px; }
    .float-toast .material-symbols-outlined { background: rgba(47,138,91,.12); color: var(--green); }

    /* Marquee */
    .marquee { border-top: 1px solid rgba(255,255,255,.08); overflow: hidden; padding: 18px 0; position: relative; }
    .marquee-track { animation: scroll 32s linear infinite; display: flex; gap: 28px; white-space: nowrap; width: max-content; }
    .marquee span { color: #d9cdc1; font: 600 20px 'Vollkorn', serif; }
    .marquee i { color: var(--copper); font-style: normal; }

    /* Sections */
    .section { padding-block: clamp(72px, 10vw, 120px) 0; }
    .section-head { margin-bottom: 40px; max-width: 680px; }
    .eyebrow { color: var(--copper); font-size: 13px; font-weight: 700; letter-spacing: .16em; margin: 0 0 12px; text-transform: uppercase; }
    .eyebrow.light { color: var(--copper-soft); }
    .section-head h2 { color: var(--ink); font: 700 clamp(32px, 4.4vw, 52px)/1.08 'Vollkorn', serif; letter-spacing: -.01em; margin: 0 0 14px; }
    .section-head > p:last-child { color: var(--muted); font-size: 17px; margin: 0; }
    .card { background: #fff; border: 1px solid var(--line); border-radius: 22px; padding: 28px; transition: transform .25s ease, box-shadow .25s ease, border-color .25s; }

    /* Bento */
    .bento { display: grid; gap: 16px; grid-template-columns: repeat(3, 1fr); }
    .span-2 { grid-column: span 2; }
    .card-feature:hover { border-color: #d8c4ae; box-shadow: 0 20px 40px rgba(65,35,17,.08); transform: translateY(-3px); }
    .card-feature .icon { align-items: center; background: var(--paper); border-radius: 14px; color: var(--copper); display: flex; font-size: 24px; height: 48px; justify-content: center; margin-bottom: 18px; width: 48px; }
    .card-feature h3 { color: var(--ink); font: 600 24px/1.2 'Vollkorn', serif; margin: 0 0 8px; }
    .card-feature p { color: var(--muted); font-size: 15px; margin: 0; max-width: 36em; }
    .card-feature.dark { background: var(--ink); border-color: var(--ink); }
    .card-feature.dark h3 { color: var(--copper-soft); }
    .card-feature.dark p { color: #d9cdc1; }
    .card-feature.dark .icon { background: rgba(255,255,255,.08); color: var(--copper-2); }
    .card-feature.copper { background: linear-gradient(135deg, #f7e2d1, #f1d0b6); border-color: #ecc8ab; }
    .card-feature.copper .icon { background: rgba(255,255,255,.6); }
    .mini-slots { display: grid; gap: 6px; grid-template-columns: repeat(8, 1fr); margin-top: 24px; }
    .mini-slots span { background: rgba(255,255,255,.08); border-radius: 6px; height: 34px; }
    .mini-slots span.on { background: linear-gradient(180deg, var(--copper-2), var(--copper)); }
    .url-pill { background: rgba(255,255,255,.75); border-radius: 999px; color: var(--muted); display: inline-block; font-size: 14px; margin-top: 20px; padding: 8px 14px; }
    .url-pill b { color: var(--deep); }

    /* Steps */
    .steps { counter-reset: none; display: grid; gap: 16px; grid-template-columns: repeat(3, 1fr); list-style: none; margin: 0; padding: 0; }
    .steps li { border-top: 2px solid var(--line); padding-top: 22px; position: relative; }
    .steps li::before { background: var(--copper); content: ''; height: 2px; left: 0; position: absolute; top: -2px; width: 56px; }
    .step-n { color: var(--copper); font: 700 15px 'Plus Jakarta Sans', sans-serif; letter-spacing: .1em; }
    .steps h3 { color: var(--ink); font: 600 24px/1.2 'Vollkorn', serif; margin: 8px 0 6px; }
    .steps p { color: var(--muted); margin: 0; }

    /* Pricing */
    .pricing { align-items: stretch; display: grid; gap: 16px; grid-template-columns: repeat(3, 1fr); }
    .plan { display: flex; flex-direction: column; position: relative; }
    .plan-name { color: var(--muted); font-size: 14px; font-weight: 700; letter-spacing: .12em; margin: 0 0 6px; text-transform: uppercase; }
    .price { color: var(--ink); font: 700 40px/1.1 'Vollkorn', serif; margin: 0 0 22px; }
    .price small { color: var(--muted); font: 600 14px 'Plus Jakarta Sans', sans-serif; }
    .plan ul { display: grid; flex: 1; gap: 10px; list-style: none; margin: 0 0 28px; padding: 0; }
    .plan li { align-items: center; color: var(--muted); display: flex; font-size: 15px; gap: 10px; }
    .plan li::before { background: var(--paper); border-radius: 50%; color: var(--copper); content: '✓'; display: grid; flex: none; font-size: 12px; font-weight: 700; height: 22px; place-items: center; width: 22px; }
    .plan.featured { background: var(--ink); border-color: var(--ink); box-shadow: 0 30px 60px rgba(42,27,18,.25); transform: translateY(-8px); }
    .plan.featured .plan-name, .plan.featured li { color: #d9cdc1; }
    .plan.featured .price { color: #fff; }
    .plan.featured .price small { color: #b9ab9e; }
    .plan.featured li::before { background: rgba(224,154,104,.2); color: var(--copper-2); }
    .plan-badge { background: linear-gradient(135deg, var(--copper-2), var(--copper)); border-radius: 999px; color: var(--espresso); font-size: 12px; font-weight: 700; padding: 5px 12px; position: absolute; right: 22px; top: 22px; }

    /* Quotes */
    .quotes { display: grid; gap: 16px; grid-template-columns: repeat(3, 1fr); }
    .quote { display: flex; flex-direction: column; justify-content: space-between; margin: 0; }
    .quote blockquote { color: var(--ink); font: 400 20px/1.5 'Vollkorn', serif; margin: 0 0 24px; }
    .quote figcaption strong { color: var(--ink); display: block; font-size: 15px; }
    .quote figcaption span { color: var(--copper); font-size: 14px; }

    /* CTA */
    .cta { align-items: center; background: var(--espresso); border-radius: 28px; color: #f6eee4; display: flex; gap: 30px; justify-content: space-between; margin-top: clamp(72px, 10vw, 120px); overflow: hidden; padding: clamp(36px, 6vw, 72px); position: relative; }
    .cta-stripes { background: repeating-linear-gradient(-45deg, rgba(196,112,63,.22) 0 18px, transparent 18px 36px); inset: 0 0 0 auto; mask-image: linear-gradient(90deg, transparent, #000); -webkit-mask-image: linear-gradient(90deg, transparent, #000); position: absolute; width: 45%; }
    .cta-copy, .cta .btn { position: relative; }
    .cta h2 { font: 700 clamp(30px, 4vw, 48px)/1.1 'Vollkorn', serif; margin: 0 0 10px; }
    .cta p:last-child { color: #d9cdc1; margin: 0; }

    /* Footer */
    .footer { border-top: 1px solid var(--line); display: grid; gap: 40px; grid-template-columns: 1.6fr 1fr 1fr; margin-top: 80px; padding-block: 48px 56px; }
    .footer-brand { color: var(--ink); margin-bottom: 10px; }
    .footer p { color: var(--muted); font-size: 15px; margin: 0; }
    .footer nav { display: flex; flex-direction: column; gap: 6px; }
    .footer nav a { color: var(--muted); font-size: 15px; padding: 4px 0; text-decoration: none; }
    .footer nav a:hover { color: var(--copper); }

    @keyframes rise { from { opacity: 0; transform: perspective(1400px) rotateY(-6deg) rotateX(3deg) translateY(30px); } }
    @keyframes bob { 50% { transform: translateY(-10px); } }
    @keyframes scroll { to { transform: translateX(-50%); } }
    @media (prefers-reduced-motion: reduce) {
      .mock-window, .float, .marquee-track { animation: none; }
      .btn, .card { transition: none; }
    }

    @media (max-width: 1000px) {
      .nav { display: none; }
      .hero-inner { grid-template-columns: 1fr; }
      .mockup { margin: 20px auto 0; max-width: 520px; width: 100%; }
      .bento, .pricing, .quotes { grid-template-columns: 1fr 1fr; }
      .plan.featured { transform: none; }
    }
    @media (max-width: 680px) {
      .site-header { padding: 8px 8px 8px 12px; top: 8px; width: calc(100% - 16px); }
      .brand-text small, .link-login { display: none; }
      .hero { padding-top: 104px; }
      .hero-actions .btn { width: 100%; }
      .mock-window { transform: none; }
      .float-cash { left: -6px; }
      .float-toast { right: -6px; }
      .bento, .pricing, .quotes, .steps, .footer { grid-template-columns: 1fr; }
      .span-2 { grid-column: auto; }
      .cta { align-items: flex-start; flex-direction: column; }
      .cta .btn { width: 100%; }
    }
  `],
})
export class LandingComponent {
  private readonly modules = ['Agenda', 'Clientes', 'Servicios', 'Inventario', 'Caja', 'Reportes', 'Página pública', 'Sucursales']
  // Duplicated so the CSS marquee loops seamlessly at -50%.
  readonly modulesTwice = [...this.modules, ...this.modules]
}
