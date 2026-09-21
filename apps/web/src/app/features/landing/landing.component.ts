import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<main class="min-h-screen bg-surface font-sans">
<!-- Top Hero Section -->
<section class="relative w-full -mt-20 pt-28 pb-16 lg:pb-24 overflow-hidden bg-surface-container-low">
  <div class="absolute -top-24 right-0 w-[500px] h-[500px] bg-secondary-container/15 rounded-full blur-3xl pointer-events-none"></div>
  <div class="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-tertiary-fixed-dim/20 rounded-full blur-3xl pointer-events-none"></div>
  <div class="w-full px-6 mx-auto max-w-7xl relative z-10">
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <div class="inline-flex items-center gap-2 bg-surface-container-lowest px-4 py-1 rounded-full shadow-sm">
        <span class="material-symbols-outlined text-secondary text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
        <span class="font-label-md text-label-md text-on-surface">4.9 ★ en Google Reviews (1,240+ opiniones)</span>
      </div>
      <div class="inline-flex items-center gap-2 bg-surface-container-high px-4 py-1 rounded-full">
        <span class="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
        <span class="font-label-md text-label-md text-on-surface-variant">Roma Norte • Colima 184 • Abierto hoy</span>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      <div class="lg:col-span-7 flex flex-col items-start pr-0 lg:pr-6">
        <span class="font-label-md text-label-md uppercase tracking-widest text-secondary mb-4">Roma Norte Grooming Atelier</span>
        <h1 class="font-headline-xl text-headline-xl text-primary mb-4 leading-tight">El arte del corte clásico y el cuidado masculino contemporáneo.</h1>
        <p class="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-xl">Un espacio exclusivo en Roma Norte donde la tradición de la barbería clásica se fusiona con técnicas de vanguardia, café de especialidad y rituales de toalla caliente.</p>
        <div class="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <a class="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary px-8 py-3 rounded-lg font-label-lg text-label-lg shadow-md hover:shadow-lg transition-all duration-300" routerLink="/booking">
            <span class="material-symbols-outlined text-[20px]">calendar_today</span>
            <span>Reservar Cita Online</span>
          </a>
          <a class="inline-flex items-center justify-center gap-2 bg-surface-container-lowest hover:bg-surface-container text-primary px-8 py-3 rounded-lg font-label-lg text-label-lg shadow-sm transition-all duration-300" href="#rituales">
            <span>Explorar Menú de Servicios</span>
            <span class="material-symbols-outlined text-[18px]">arrow_downward</span>
          </a>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-10 pt-7 w-full bg-surface-container/60 rounded-xl p-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary text-[18px]">local_cafe</span>
            <span class="font-label-sm text-label-sm text-on-surface">Espresso &amp; Whisky</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary text-[18px]">hot_tub</span>
            <span class="font-label-sm text-label-sm text-on-surface">Toallas al Vapor</span>
          </div>
          <div class="flex items-center gap-2 col-span-2 sm:col-span-1">
            <span class="material-symbols-outlined text-secondary text-[18px]">timer</span>
            <span class="font-label-sm text-label-sm text-on-surface">Puntualidad Absoluta</span>
          </div>
        </div>
      </div>
      <div class="lg:col-span-5 relative">
        <div class="relative w-full rounded-2xl overflow-hidden shadow-xl bg-surface-container-highest aspect-[4/5]">
          <img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAubVCNIVudhrapcMd17-AbO1IUdwFIWeBWEzh3I_8_pRMDorr2jXU2UgD3xqewfZOewrdQxiRu2iYgATwwB9jbihdgSMjI9Z5T742xXgA0DpeSMK2pL7K5PQjrNhCQCEfajL73_snLDht2P8KT4LvNblVo22TbfFOG7qdGeN-ornMKMMblKB4AELpvfe76wD0I96LNTN3ZHs52wvInJFgCmUNTIc7q2W40MHfFWjOP4MB3W35Hw9Zsxw" alt="Barbero en Roma Norte"/>
          <div class="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-6 text-on-primary">
            <p class="font-label-sm text-label-sm uppercase tracking-wider text-secondary-fixed mb-2">Atelier Roma Norte</p>
            <p class="font-headline-sm text-headline-sm">Cuidado artesanal, precisión milimétrica.</p>
            <div class="flex items-center gap-2 mt-2 text-on-primary/80 font-body-sm text-body-sm">
              <span class="material-symbols-outlined text-[16px]">location_on</span>
              <span>Colima 184, Roma Norte, CDMX</span>
            </div>
          </div>
        </div>
        <div class="absolute -bottom-6 -left-6 bg-surface-container-lowest p-6 rounded-xl shadow-xl hidden sm:flex items-center gap-4 max-w-xs">
          <div class="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
            <span class="material-symbols-outlined text-[24px]">content_cut</span>
          </div>
          <div class="min-w-0">
            <p class="font-label-md text-label-md text-primary truncate">Navaja Libre Japonesa</p>
            <p class="font-body-sm text-body-sm text-on-surface-variant truncate">Acero al carbono forjado a mano</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
<!-- Metrics Bar -->
<section class="w-full bg-surface-container py-6">
  <div class="w-full px-6 mx-auto max-w-7xl">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 items-center">
      <div class="flex flex-col bg-surface-container-lowest p-6 rounded-xl shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Comunidad</span>
          <span class="material-symbols-outlined text-outline text-[18px]">group</span>
        </div>
        <span class="font-numeric-stat text-numeric-stat text-primary font-bold">4,800+</span>
        <span class="font-body-sm text-body-sm text-on-surface-variant mt-2">Clientes habituales en Roma Norte y Condesa</span>
      </div>
      <div class="flex flex-col bg-surface-container-lowest p-6 rounded-xl shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Experiencia</span>
          <span class="material-symbols-outlined text-outline text-[18px]">workspace_premium</span>
        </div>
        <span class="font-numeric-stat text-numeric-stat text-primary font-bold">12</span>
        <span class="font-body-sm text-body-sm text-on-surface-variant mt-2">Barberos Maestros con certificación internacional</span>
      </div>
      <div class="flex flex-col bg-surface-container-lowest p-6 rounded-xl shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Aprobación</span>
          <span class="material-symbols-outlined text-outline text-[18px]">verified</span>
        </div>
        <span class="font-numeric-stat text-numeric-stat text-primary font-bold">98%</span>
        <span class="font-body-sm text-body-sm text-on-surface-variant mt-2">Satisfacción en afeitado y diseño de barba</span>
      </div>
      <div class="flex flex-col bg-surface-container-lowest p-6 rounded-xl shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Hospitalidad</span>
          <span class="material-symbols-outlined text-outline text-[18px]">local_bar</span>
        </div>
        <span class="font-numeric-stat text-numeric-stat text-primary font-bold">100%</span>
        <span class="font-body-sm text-body-sm text-on-surface-variant mt-2">Barra de café de especialidad y coctelería incluida</span>
      </div>
    </div>
  </div>
</section>
<!-- Services Section -->
<section class="w-full py-6 lg:py-24 bg-surface" id="rituales">
  <div class="w-full px-6 mx-auto max-w-7xl">
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
      <div>
        <span class="font-label-sm text-label-sm uppercase tracking-widest text-secondary mb-4 block">Menú Curado de Autor</span>
        <h2 class="font-headline-xl text-headline-xl text-primary">Nuestros Rituales</h2>
      </div>
      <p class="font-body-md text-body-md text-on-surface-variant max-w-md">Cada servicio es un momento de pausa y rejuvenecimiento. Incluye diagnóstico capilar, toalla humectante tibia y bebida de bienvenida.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
      <div class="lg:col-span-6 bg-surface-container-lowest p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          <div class="flex items-start justify-between gap-4 mb-4">
            <h3 class="font-headline-md text-headline-md text-primary">Corte Clásico Navaja</h3>
            <div class="text-right flex-shrink-0">
              <span class="font-numeric-stat text-numeric-stat text-primary">$450</span>
              <span class="font-body-sm text-body-sm text-outline block">MXN</span>
            </div>
          </div>
          <p class="font-body-md text-body-md text-on-surface-variant mb-4">Lavado previo con champú botánico estimulante, corte a tijera y máquina artesanal con acabado en navaja libre al cuello, estilización y pomada orgánica.</p>
        </div>
        <div class="flex items-center justify-between pt-4 bg-surface-container-low p-4 rounded-xl">
          <div class="flex items-center gap-2 text-on-surface-variant">
            <span class="material-symbols-outlined text-[18px]">schedule</span>
            <span class="font-label-sm text-label-sm">45 minutos</span>
          </div>
          <a class="inline-flex items-center gap-2 text-secondary font-label-md text-label-md hover:text-primary transition-colors" routerLink="/booking">
            <span>Seleccionar</span>
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>
      </div>
      <div class="lg:col-span-6 bg-surface-container-lowest p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          <div class="flex items-start justify-between gap-4 mb-4">
            <h3 class="font-headline-md text-headline-md text-primary">Ritual de Barba Completo</h3>
            <div class="text-right flex-shrink-0">
              <span class="font-numeric-stat text-numeric-stat text-primary">$380</span>
              <span class="font-body-sm text-body-sm text-outline block">MXN</span>
            </div>
          </div>
          <p class="font-body-md text-body-md text-on-surface-variant mb-4">Triple toalla caliente al vapor aromatizada con eucalipto, aceites esenciales nutritivos, afeitado y perfilado con navaja libre, finalizado con bálsamo calmante.</p>
        </div>
        <div class="flex items-center justify-between pt-4 bg-surface-container-low p-4 rounded-xl">
          <div class="flex items-center gap-2 text-on-surface-variant">
            <span class="material-symbols-outlined text-[18px]">schedule</span>
            <span class="font-label-sm text-label-sm">40 minutos</span>
          </div>
          <a class="inline-flex items-center gap-2 text-secondary font-label-md text-label-md hover:text-primary transition-colors" routerLink="/booking">
            <span>Seleccionar</span>
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>
      </div>
      <div class="lg:col-span-8 bg-primary-container text-on-primary p-8 rounded-2xl shadow-md flex flex-col justify-between relative overflow-hidden">
        <div class="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-secondary-container/20 blur-2xl pointer-events-none"></div>
        <div>
          <div class="inline-flex items-center gap-2 bg-secondary px-4 py-1 rounded-full mb-4">
            <span class="material-symbols-outlined text-[14px]">auto_awesome</span>
            <span class="font-label-sm text-label-sm text-on-secondary uppercase tracking-wider">El Más Solicitado</span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-4">
            <h3 class="font-headline-lg text-headline-lg text-on-primary">Experiencia Navaja Signature</h3>
            <div class="text-left sm:text-right">
              <span class="font-numeric-stat text-numeric-stat text-secondary-fixed font-bold">$760</span>
              <span class="font-body-sm text-body-sm text-on-primary-container inline sm:block ml-1 sm:ml-0">MXN</span>
            </div>
          </div>
          <p class="font-body-lg text-body-lg text-on-primary/90 mb-8 max-w-2xl">Corte clásico de autor a la medida + ritual completo de barba al vapor + exfoliación facial artesanal con café chiapaneco y menta silvestre + bebida de alta gama de cortesía.</p>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-4 pt-4 bg-primary/40 p-4 rounded-xl">
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 text-on-primary/80">
              <span class="material-symbols-outlined text-[18px]">schedule</span>
              <span class="font-label-sm text-label-sm">80 minutos</span>
            </div>
            <span class="text-on-primary-container">•</span>
            <span class="font-label-sm text-label-sm text-secondary-fixed">Tratamiento Integral</span>
          </div>
          <a class="inline-flex items-center gap-2 bg-surface text-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-surface-bright transition-colors" routerLink="/booking">
            <span>Agendar Signature</span>
            <span class="material-symbols-outlined text-[16px]">calendar_today</span>
          </a>
        </div>
      </div>
      <div class="lg:col-span-4 bg-surface-container-lowest p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          <div class="flex items-start justify-between gap-4 mb-4">
            <h3 class="font-headline-md text-headline-md text-primary">Cuidado Capilar &amp; Matiz</h3>
            <div class="text-right flex-shrink-0">
              <span class="font-numeric-stat text-numeric-stat text-primary">$390</span>
              <span class="font-body-sm text-body-sm text-outline block">MXN</span>
            </div>
          </div>
          <p class="font-body-md text-body-md text-on-surface-variant mb-4">Tratamiento revitalizante para cuero cabelludo con barro volcánico y matizado sutil y natural de canas sin químicos agresivos.</p>
        </div>
        <div class="flex items-center justify-between pt-4 bg-surface-container-low p-4 rounded-xl">
          <div class="flex items-center gap-2 text-on-surface-variant">
            <span class="material-symbols-outlined text-[18px]">schedule</span>
            <span class="font-label-sm text-label-sm">35 minutos</span>
          </div>
          <a class="inline-flex items-center gap-2 text-secondary font-label-md text-label-md hover:text-primary transition-colors" routerLink="/booking">
            <span>Seleccionar</span>
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
<!-- Experience Section -->
<section class="w-full py-6 lg:py-24 bg-surface-container-low">
  <div class="w-full px-6 mx-auto max-w-7xl">
    <div class="text-center max-w-2xl mx-auto mb-8">
      <span class="font-label-sm text-label-sm uppercase tracking-widest text-secondary mb-4 block">El Atelier</span>
      <h2 class="font-headline-xl text-headline-xl text-primary mb-4">La Experiencia Navaja Studio</h2>
      <p class="font-body-md text-body-md text-on-surface-variant">Diseñado como un refugio de serenidad en el epicentro cultural de la Ciudad de México.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-surface-container-lowest p-8 rounded-2xl shadow-sm flex flex-col items-start">
        <div class="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-6">
          <span class="material-symbols-outlined text-[30px]">local_cafe</span>
        </div>
        <h3 class="font-headline-sm text-headline-sm text-primary mb-4">Cortesía en Barra de Autor</h3>
        <p class="font-body-md text-body-md text-on-surface-variant mb-4">Elige entre un espresso recién extraído con granos de altura de Veracruz o una medida de whisky single malt mientras tu barbero prepara la estación.</p>
        <span class="mt-auto font-label-sm text-label-sm text-secondary uppercase tracking-wider">Sin costo adicional</span>
      </div>
      <div class="bg-surface-container-lowest p-8 rounded-2xl shadow-sm flex flex-col items-start">
        <div class="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-6">
          <span class="material-symbols-outlined text-[30px]">alarm_on</span>
        </div>
        <h3 class="font-headline-sm text-headline-sm text-primary mb-4">Puntualidad Garantizada</h3>
        <p class="font-body-md text-body-md text-on-surface-variant mb-4">Tu tiempo es sagrado. Nuestro sistema de reservas sincronizado asegura que tu sillón esté listo en el minuto exacto de tu cita.</p>
        <span class="mt-auto font-label-sm text-label-sm text-secondary uppercase tracking-wider">Cero esperas imprevistas</span>
      </div>
      <div class="bg-surface-container-lowest p-8 rounded-2xl shadow-sm flex flex-col items-start">
        <div class="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-6">
          <span class="material-symbols-outlined text-[30px]">eco</span>
        </div>
        <h3 class="font-headline-sm text-headline-sm text-primary mb-4">Productos Botánicos Propios</h3>
        <p class="font-body-md text-body-md text-on-surface-variant mb-4">Pomadas base agua, tónicos de romero y aceites de jojoba prensados en frío, elaborados localmente y libres de sulfatos agresivos.</p>
        <span class="mt-auto font-label-sm text-label-sm text-secondary uppercase tracking-wider">Disponibles en tienda</span>
      </div>
    </div>
  </div>
</section>
<!-- Team Section -->
<section class="w-full py-6 lg:py-24 bg-surface" id="barberos">
  <div class="w-full px-6 mx-auto max-w-7xl">
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
      <div>
        <span class="font-label-sm text-label-sm uppercase tracking-widest text-secondary mb-4 block">Artesanía &amp; Precisión</span>
        <h2 class="font-headline-xl text-headline-xl text-primary">Los Maestros Barberos</h2>
      </div>
      <p class="font-body-md text-body-md text-on-surface-variant max-w-md">Profesionales apasionados por la geometría del rostro y la técnica tradicional a filo libre.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
        <div class="relative w-full aspect-[4/5] overflow-hidden bg-surface-container-highest">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4lk-8daN6Rn8KlRk57b_NsFYlg2z8JUOb6CnEVBIxdxO4TrD-9mXwYYmrV0qWUTldz2iJ_3wkvAo2u4XfngLczZ5xmWDPZLxGFVWVYKe903PPWumxCwdC63cVv7EvneYGNWjzrPV-Oy9fy0FPM_E-tQUnf7WGD2lq0FmD-vl_IOwLtsveaJ1idonJ9mq0_5MxEk6me5MXWaEz-AHYbf4fpeJ8NXwKfttrqEHvTmQZGwDHfrmOhSJDOA" alt="Andrés Morales"/>
          <div class="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md px-4 py-1 rounded-full font-label-sm text-label-sm text-primary">10 Años Exp.</div>
        </div>
        <div class="p-6">
          <h3 class="font-headline-sm text-headline-sm text-primary">Andrés Morales</h3>
          <p class="font-label-md text-label-md text-secondary mb-4">Especialista en Degradados &amp; Navaja Libre</p>
          <p class="font-body-sm text-body-sm text-on-surface-variant mb-4">Formado en academias de Londres y CDMX. Su enfoque combina fados impecables con rituales de toalla reconfortantes.</p>
          <a class="inline-flex items-center gap-2 text-primary font-label-sm text-label-sm hover:text-secondary transition-colors" routerLink="/booking">
            <span>Agendar con Andrés</span>
            <span class="material-symbols-outlined text-[16px]">chevron_right</span>
          </a>
        </div>
      </div>
      <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
        <div class="relative w-full aspect-[4/5] overflow-hidden bg-surface-container-highest">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsR1rNUt830DBaYr8DsCGDIcbQpkRWBim_eoJrno2Z2jmxZixv-PRtwYiNgKPGmRbuCe4JUYe2X_o-e1v5pKW5uQ_dNcenGe7bZm9feE4_WpfVKV3MAl8D7BETxQbPL7LEHOnTU6XQNcKUGjN_Lpduov25ll-HiJ-Pd-XMxdH2fVWT0uhPNrJ799EGcNXY1foxmHEW7JzWLeU_1tKHSvoUHWVb7_a_LjZVJ7rZJzKNm4max0Hd5P1zQ" alt="Santiago Vega"/>
          <div class="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md px-4 py-1 rounded-full font-label-sm text-label-sm text-primary">8 Años Exp.</div>
        </div>
        <div class="p-6">
          <h3 class="font-headline-sm text-headline-sm text-primary">Santiago Vega</h3>
          <p class="font-label-md text-label-md text-secondary mb-4">Maestro Barbero &amp; Estilismo Clásico</p>
          <p class="font-body-sm text-body-sm text-on-surface-variant mb-4">Especialista en cortes ejecutivos atemporales, barbas tupidas estructuradas y tratamiento con óleos tibios.</p>
          <a class="inline-flex items-center gap-2 text-primary font-label-sm text-label-sm hover:text-secondary transition-colors" routerLink="/booking">
            <span>Agendar con Santiago</span>
            <span class="material-symbols-outlined text-[16px]">chevron_right</span>
          </a>
        </div>
      </div>
      <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
        <div class="relative w-full aspect-[4/5] overflow-hidden bg-surface-container-highest">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6VO6MWMfkUaLihHzHKMss2xHJVvY7vGcGLRaJA4JIAfpqiNynmErYxaG3ECEumBir8Dgud_6ow9SRPo-Tqy2D28OLe-ZzvIksPkCVWOkb9GcpyjzD9O7r7qkVNIWTtgawMphUHwhWJoSN2UsqktXOs6kYabDnD5Drfw53ybeP3NtAu8ux9-9TDv535OexO3wiLphLYqR0tIvTEPrgXHsEuyQsfThDs0aLiA9dS4mcKVfLeMBdvPG8DQ" alt="Mariana Reyes"/>
          <div class="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md px-4 py-1 rounded-full font-label-sm text-label-sm text-primary">Directora Creativa</div>
        </div>
        <div class="p-6">
          <h3 class="font-headline-sm text-headline-sm text-primary">Mariana Reyes</h3>
          <p class="font-label-md text-label-md text-secondary mb-4">Cuidado Capilar &amp; Asesoría de Imagen</p>
          <p class="font-body-sm text-body-sm text-on-surface-variant mb-4">Pionera en tratamientos de cuero cabelludo y armonización visagista para caballeros que buscan una renovación completa.</p>
          <a class="inline-flex items-center gap-2 text-primary font-label-sm text-label-sm hover:text-secondary transition-colors" routerLink="/booking">
            <span>Agendar con Mariana</span>
            <span class="material-symbols-outlined text-[16px]">chevron_right</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
<!-- Testimonials Section -->
<section class="w-full py-6 lg:py-24 bg-surface-container-low">
  <div class="w-full px-6 mx-auto max-w-7xl">
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
      <div>
        <span class="font-label-sm text-label-sm uppercase tracking-widest text-secondary mb-4 block">Testimonios Reales</span>
        <h2 class="font-headline-xl text-headline-xl text-primary">Voces de Nuestra Comunidad</h2>
      </div>
      <div class="inline-flex items-center gap-2 bg-surface-container-lowest px-4 py-1 rounded-lg shadow-sm">
        <span class="material-symbols-outlined text-secondary text-[20px]" style="font-variation-settings: 'FILL' 1;">stars</span>
        <span class="font-label-md text-label-md text-primary">4.9 / 5 estrellas promedio de satisfacción</span>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-surface-container-lowest p-8 rounded-2xl shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex text-secondary mb-8">
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
          </div>
          <p class="font-body-md text-body-md text-on-surface-variant mb-8 italic">"Llevo 2 años atendiéndome con Santiago. La precisión en la navaja libre es inigualable en toda la Roma. El café de especialidad de cortesía y la música crean un ambiente inmejorable."</p>
        </div>
        <div class="flex items-center gap-3 pt-4 bg-surface-container/40 p-3 rounded-xl">
          <div class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-label-md text-primary font-bold">RL</div>
          <div>
            <p class="font-label-md text-label-md text-primary">Rodrigo Larrea</p>
            <p class="font-body-sm text-body-sm text-outline">Cliente desde 2022 • Roma Norte</p>
          </div>
        </div>
      </div>
      <div class="bg-surface-container-lowest p-8 rounded-2xl shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex text-secondary mb-8">
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
          </div>
          <p class="font-body-md text-body-md text-on-surface-variant mb-8 italic">"La Experiencia Navaja Signature vale cada centavo. La exfoliación con café y el vapor te quitan el cansancio de la semana por completo. Puntualidad impecable."</p>
        </div>
        <div class="flex items-center gap-3 pt-4 bg-surface-container/40 p-3 rounded-xl">
          <div class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-label-md text-primary font-bold">MC</div>
          <div>
            <p class="font-label-md text-label-md text-primary">Mateo Calderón</p>
            <p class="font-body-sm text-body-sm text-outline">Reserva online habitual • Condesa</p>
          </div>
        </div>
      </div>
      <div class="bg-surface-container-lowest p-8 rounded-2xl shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex text-secondary mb-8">
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
          </div>
          <p class="font-body-md text-body-md text-on-surface-variant mb-8 italic">"El sistema para reservar en línea es rapidísimo. Llegas y tu sillón está esperándote. Mariana es extraordinaria en el cuidado del cuero cabelludo."</p>
        </div>
        <div class="flex items-center gap-3 pt-4 bg-surface-container/40 p-3 rounded-xl">
          <div class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-label-md text-primary font-bold">EH</div>
          <div>
            <p class="font-label-md text-label-md text-primary">Emiliano Herrera</p>
            <p class="font-body-sm text-body-sm text-outline">Cliente frecuente • Cuauhtémoc</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
<!-- Booking Section -->
<section class="w-full py-6 lg:py-24 bg-surface" id="reservar">
  <div class="w-full px-6 mx-auto max-w-7xl">
    <div class="bg-primary-container text-on-primary rounded-3xl overflow-hidden shadow-2xl relative">
      <div class="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-secondary-container/15 blur-3xl pointer-events-none"></div>
      <div class="p-6 lg:p-16 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div class="lg:col-span-6 flex flex-col">
            <span class="font-label-sm text-label-sm uppercase tracking-widest text-secondary-fixed mb-4">Disponibilidad en Tiempo Real</span>
            <h2 class="font-headline-xl text-headline-xl text-on-primary mb-4">Asegura tu sillón esta semana.</h2>
            <p class="font-body-lg text-body-lg text-on-primary/80 mb-8 max-w-lg">Selecciona tu ritual preferido y maestro barbero. Confirmación instantánea por SMS o correo electrónico sin anticipos obligatorios.</p>
            <div class="flex flex-col gap-3 font-body-sm text-body-sm text-on-primary/90">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary-fixed text-[18px]">check_circle</span>
                <span>Estudio abierto de Lunes a Sábado desde las 09:00 AM</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary-fixed text-[18px]">check_circle</span>
                <span>Cancelación y reprogramación flexible con 2 horas de aviso</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary-fixed text-[18px]">check_circle</span>
                <span>Valet parking disponible en calle Colima</span>
              </div>
            </div>
          </div>
          <div class="lg:col-span-6 bg-surface-container-lowest text-on-surface p-8 rounded-2xl shadow-xl">
            <form class="flex flex-col gap-4" (ngSubmit)="onBookSubmit()">
              <div>
                <label class="font-label-sm text-label-sm uppercase tracking-wider text-secondary mb-4 block">1. Selecciona tu Ritual</label>
                <select class="w-full bg-surface-container-low px-4 py-2 rounded-lg font-body-md text-body-md text-on-surface focus:outline-none" [(ngModel)]="selectedService" name="service" required>
                  <option value="signature">Experiencia Navaja Signature (80 min - $760 MXN)</option>
                  <option value="corte">Corte Clásico Navaja (45 min - $450 MXN)</option>
                  <option value="barba">Ritual de Barba Completo (40 min - $380 MXN)</option>
                  <option value="capilar">Cuidado Capilar &amp; Matiz (35 min - $390 MXN)</option>
                </select>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="font-label-sm text-label-sm uppercase tracking-wider text-secondary mb-4 block">2. Barbero Maestro</label>
                  <select class="w-full bg-surface-container-low px-4 py-2 rounded-lg font-body-md text-body-md text-on-surface focus:outline-none" [(ngModel)]="selectedBarber" name="barber">
                    <option value="any">Cualquier Maestro disponible</option>
                    <option value="andres">Andrés Morales</option>
                    <option value="santiago">Santiago Vega</option>
                    <option value="mariana">Mariana Reyes</option>
                  </select>
                </div>
                <div>
                  <label class="font-label-sm text-label-sm uppercase tracking-wider text-secondary mb-4 block">3. Fecha &amp; Turno</label>
                  <select class="w-full bg-surface-container-low px-4 py-2 rounded-lg font-body-md text-body-md text-on-surface focus:outline-none" [(ngModel)]="selectedDate" name="date">
                    <option value="today-pm">Hoy • 17:30 hrs</option>
                    <option value="tomorrow-am">Mañana • 11:00 hrs</option>
                    <option value="tomorrow-pm">Mañana • 16:30 hrs</option>
                    <option value="sat-am">Sábado • 10:00 hrs</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="font-label-sm text-label-sm uppercase tracking-wider text-secondary mb-4 block">4. Tus Datos de Contacto</label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input class="bg-surface-container-low px-4 py-2 rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none" placeholder="Nombre completo" [(ngModel)]="contactName" name="name" type="text" required/>
                  <input class="bg-surface-container-low px-4 py-2 rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none" placeholder="Teléfono celular (+52)" [(ngModel)]="contactPhone" name="phone" type="tel" required/>
                </div>
              </div>
              <button class="mt-4 w-full bg-primary hover:bg-primary-container text-on-primary py-3 rounded-lg font-label-lg text-label-lg shadow-md transition-colors flex items-center justify-center gap-2" type="submit">
                <span class="material-symbols-outlined text-[20px]">check_circle</span>
                <span>Confirmar Reserva Inmediata</span>
              </button>
              <div class="bg-tertiary-fixed p-4 rounded-lg text-on-tertiary-fixed flex items-center gap-2" [hidden]="!bookingConfirmed">
                <span class="material-symbols-outlined text-[20px]">done_all</span>
                <span class="font-label-sm text-label-sm">¡Excelente! Tu cita en Roma Norte ha sido pre-reservada. Recibirás confirmación vía SMS.</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
</main>
<!-- Footer -->
<footer class="w-full bg-surface-container-low">
  <div class="w-full px-6 py-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mb-6">
      <div class="lg:col-span-4 flex flex-col gap-4">
        <div class="flex items-center gap-2"><span class="font-headline-lg text-headline-lg text-primary">Navaja Studio</span></div>
        <p class="font-body-md text-body-md text-on-surface-variant max-w-sm">Atelier de cuidado masculino, tradición artesanal y barbería de precisión en el corazón de la Ciudad de México.</p>
        <div class="flex items-center gap-2 pt-2"><span class="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span><span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Estudio Abierto • Roma Norte</span></div>
      </div>
      <div class="lg:col-span-3 flex flex-col gap-2">
        <span class="font-label-md text-label-md uppercase tracking-wider text-secondary mb-4">Ubicación &amp; Horarios</span>
        <p class="font-body-md text-body-md text-on-surface font-label-lg">Colima 184, Roma Norte</p>
        <p class="font-body-sm text-body-sm text-on-surface-variant">Cuauhtémoc, 06700 CDMX</p>
        <div class="mt-4 flex flex-col gap-3 font-body-sm text-body-sm text-on-surface-variant">
          <span>Lunes – Viernes: 09:00 – 20:00</span>
          <span>Sábados: 09:00 – 19:00</span>
          <span>Domingos: 10:00 – 16:00</span>
        </div>
      </div>
      <div class="lg:col-span-2 flex flex-col gap-3">
        <span class="font-label-md text-label-md uppercase tracking-wider text-secondary mb-4">Comunidad</span>
        <a class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" routerLink="/booking">Club Privado</a>
        <a class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#barberos">El Equipo</a>
        <a class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#rituales">Rituales</a>
      </div>
      <div class="lg:col-span-3 flex flex-col gap-3">
        <span class="font-label-md text-label-md uppercase tracking-wider text-secondary mb-4">Legal</span>
        <a class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Privacidad</a>
        <a class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Términos</a>
      </div>
    </div>
    <div class="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t border-surface-variant">
      <span class="font-label-sm text-label-sm text-on-surface-variant">© 2026 Navaja Studio OS. Todos los derechos reservados.</span>
      <span class="font-label-sm text-label-sm text-on-surface-variant">Hecho con ❤️ en Colombia</span>
    </div>
  </div>
</footer>
  `,
  styles: [`
    :host { display: block; }
    main { display: block; }
  `],
})
export class LandingComponent {
  selectedService = 'signature'
  selectedBarber = 'any'
  selectedDate = 'today-pm'
  contactName = ''
  contactPhone = ''
  bookingConfirmed = false

  onBookSubmit(): void {
    this.bookingConfirmed = true
  }
}
