import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { environment } from '../../../environments/environment'

interface PublicBusiness {
  tradeName: string
  slug: string
  phone: string | null
  branding: {
    logoUrl: string | null
    primaryColor: string | null
    description: string | null
    socialLinks: Record<string, string> | null
  } | null
}

@Component({
  selector: 'app-public-business',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="public-page">
      <a routerLink="/" class="platform-link">Navaja Studio</a>
      @if (loading) {
        <p class="status">Cargando el perfil del negocio...</p>
      } @else if (error) {
        <section class="profile-card" role="alert">
          <h1>No encontramos este negocio</h1>
          <p>{{ error }}</p>
          <a routerLink="/">Volver al inicio</a>
        </section>
      } @else if (business) {
        <section class="profile-card" [style.--brand-color]="business.branding?.primaryColor || '#944928'">
          @if (business.branding?.logoUrl) {
            <img class="logo" [src]="business.branding?.logoUrl" [alt]="'Logo de ' + business.tradeName" />
          } @else {
            <div class="logo-placeholder">{{ business.tradeName.slice(0, 1).toUpperCase() }}</div>
          }
          <p class="eyebrow">Perfil público</p>
          <h1>{{ business.tradeName }}</h1>
          @if (business.branding?.description) {
            <p class="description">{{ business.branding?.description }}</p>
          } @else {
            <p class="description">Conoce y contacta a {{ business.tradeName }}.</p>
          }
          @if (whatsappUrl) {
            <a class="contact-button" [href]="whatsappUrl" target="_blank" rel="noopener noreferrer">
              Contactar por WhatsApp
            </a>
          }
          @if (business.branding?.socialLinks?.['instagram']) {
            <a class="social-link" [href]="socialUrl('instagram', business.branding?.socialLinks?.['instagram'] || '')" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          }
          @if (business.branding?.socialLinks?.['tiktok']) {
            <a class="social-link" [href]="socialUrl('tiktok', business.branding?.socialLinks?.['tiktok'] || '')" target="_blank" rel="noopener noreferrer">
              TikTok
            </a>
          }
        </section>
      }
    </main>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #fdf9f0; color: #412311; font-family: 'Plus Jakarta Sans', sans-serif; }
    .public-page { min-height: 100vh; padding: 28px 20px; }
    .platform-link { color: #412311; font-family: 'Vollkorn', serif; font-size: 20px; font-weight: 700; text-decoration: none; }
    .status { color: #50443e; margin: 20vh auto; text-align: center; }
    .profile-card { --brand-color: #944928; background: white; border-radius: 18px; box-shadow: 0 8px 36px #4a2e1b14; margin: 10vh auto; max-width: 560px; padding: clamp(28px, 6vw, 56px); text-align: center; }
    .logo, .logo-placeholder { align-items: center; background: #f5f0e8; border-radius: 16px; color: var(--brand-color); display: flex; height: 92px; justify-content: center; margin: 0 auto 20px; object-fit: contain; width: 92px; }
    .logo-placeholder { font: 700 40px 'Vollkorn', serif; }
    .eyebrow { color: var(--brand-color); font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
    h1 { font: 700 clamp(28px, 6vw, 40px)/1.1 'Vollkorn', serif; margin: 8px 0 16px; }
    .description { color: #50443e; line-height: 1.7; white-space: pre-wrap; }
    .contact-button { background: var(--brand-color); border-radius: 8px; color: white; display: inline-flex; font-weight: 700; margin: 18px 8px 0; padding: 13px 18px; text-decoration: none; }
    .social-link { color: var(--brand-color); display: inline-block; font-size: 13px; font-weight: 700; margin: 18px 8px 0; }
  `],
})
export class PublicBusinessComponent implements OnInit {
  business: PublicBusiness | null = null
  loading = true
  error = ''

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
  ) {}

  get whatsappUrl(): string {
    const digits = this.business?.phone?.replace(/\D/g, '') ?? ''
    return digits.length >= 8 ? `https://wa.me/${digits}` : ''
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug')
    if (!slug) {
      this.loading = false
      this.error = 'El enlace no incluye un negocio válido.'
      return
    }

    this.http.get<{ data: PublicBusiness }>(`${environment.apiUrl}/public/businesses/${encodeURIComponent(slug)}`).subscribe({
      next: (response) => {
        this.business = response.data
        this.loading = false
      },
      error: (response: { error?: { error?: { message?: string }; message?: string } }) => {
        this.loading = false
        this.error = response.error?.error?.message || response.error?.message || 'El perfil no está disponible por el momento.'
      },
    })
  }

  socialUrl(network: 'instagram' | 'tiktok', handle: string): string {
    if (/^https?:\/\//i.test(handle)) return handle
    const value = handle.trim().replace(/^@/, '')
    return `https://${network}.com/${encodeURIComponent(value)}`
  }
}
