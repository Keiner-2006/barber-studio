import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { OnboardingStore } from '../onboarding.store'
import { ONB_STYLES } from '../onboarding.ui'
import { OnboardingApi } from '../onboarding.api'

const COLOR_PRESETS = [
  { name: 'Aged Brass', color: '#d98e3a', sublabel: 'Nogal & Latón Artesanal' },
  { name: 'Eucalyptus Bay', color: '#1b4332', sublabel: 'Verde Botánico & Cobre' },
  { name: 'Burgundy Velvet', color: '#7f1d1d', sublabel: 'Cuero Burdeos & Oro' },
]

@Component({
  selector: 'app-onboarding-step-branding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="step-card">
      <div class="step-header">
        <span class="step-badge">
          <span class="material-symbols-outlined" aria-hidden="true">palette</span>
          Paso 5 de {{ store.totalSteps }} · Marca
        </span>
        <h2>Dale tu estilo a la página</h2>
        <p>Tu logo y tu color aparecerán en la página pública donde tus clientes reservan. Todo es opcional.</p>
      </div>

      <div class="step-form">
        <div class="form-group">
          <span class="field-label">
            Logo
            <span class="optional">PNG, SVG o JPG · máx. 5 MB</span>
          </span>
          <div class="upload-zone" role="button" tabindex="0" aria-label="Subir logo" (click)="fileInput.click()" (keydown.enter)="fileInput.click()" (keydown.space)="fileInput.click(); $event.preventDefault()" (dragover)="dragging=true" (dragleave)="dragging=false" [class.drag-active]="dragging">
            <input type="file" #fileInput accept="image/png,image/svg+xml,image/jpeg" (change)="onFileSelected($event)" hidden />
            @if (logoUrl) {
              <img [src]="logoUrl" class="logo-preview" alt="Logo subido" />
            } @else {
              <div class="upload-icon">
                <span class="material-symbols-outlined" aria-hidden="true">{{ uploading ? 'progress_activity' : 'cloud_upload' }}</span>
              </div>
              <span class="upload-title">{{ uploading ? 'Subiendo…' : dragging ? 'Suelta el archivo aquí' : 'Arrastra tu logo o haz clic para elegirlo' }}</span>
              <span class="upload-hint">Lo optimizamos automáticamente.</span>
            }
            <div class="upload-badges">
              <span class="badge">512x512px recomendado</span>
            </div>
          </div>
          @if (uploadError) {
            <span class="upload-error" role="alert">{{ uploadError }}</span>
          }
        </div>

        <div class="form-group">
          <span class="field-label" id="color-label">Color de tu marca</span>
          <div class="color-presets" role="radiogroup" aria-labelledby="color-label">
            @for (preset of colorPresets; track preset.name) {
              <button
                type="button"
                role="radio"
                class="preset-card"
                [class.selected]="store.branding().colorPreset === preset.name"
                [attr.aria-checked]="store.branding().colorPreset === preset.name"
                (click)="selectPreset(preset)"
              >
                <span class="color-dot" [style.background]="preset.color"></span>
                <div class="preset-info">
                  <span class="preset-name">{{ preset.name }}</span>
                  <span class="preset-sublabel">{{ preset.sublabel }}</span>
                </div>
                @if (store.branding().colorPreset === preset.name) {
                  <span class="check"><span class="material-symbols-outlined" aria-hidden="true">check_circle</span></span>
                }
              </button>
            }
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="instagram">Instagram</label>
            <div class="input-wrap">
              <span class="material-symbols-outlined">photo_camera</span>
              <input id="instagram" [(ngModel)]="store.branding().instagram" name="instagram" placeholder="@tu_negocio" />
            </div>
          </div>

          <div class="form-group">
            <label for="tiktok">TikTok</label>
            <div class="input-wrap">
              <span class="material-symbols-outlined">videocam</span>
              <input id="tiktok" [(ngModel)]="store.branding().tiktok" name="tiktok" placeholder="@tu_negocio" />
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [ONB_STYLES, `
    .upload-zone { align-items: center; background: var(--paper); border: 2px dashed #d8c4ae; border-radius: 18px; cursor: pointer; display: flex; flex-direction: column; gap: 8px; padding: 28px; text-align: center; transition: border-color .2s, background .2s; }
    .upload-zone:hover, .upload-zone:focus-visible { border-color: #c4703f; }
    .upload-zone.drag-active { background: var(--copper-soft); border-color: #c4703f; }
    .upload-icon { align-items: center; background: #fff; border-radius: 50%; color: var(--copper); display: flex; height: 56px; justify-content: center; width: 56px; }
    .upload-title { color: var(--ink); font-size: 15px; font-weight: 700; }
    .upload-hint { color: var(--muted); font-size: 13px; }
    .upload-error { color: var(--red); font-size: 14px; font-weight: 600; }
    .logo-preview { background: #fff; border-radius: 14px; box-shadow: 0 6px 16px rgba(0,0,0,.1); height: 120px; object-fit: contain; padding: 8px; width: 120px; }
    .upload-badges { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 4px; }
    .badge { background: #fff; border-radius: 999px; color: var(--muted); font-size: 12px; font-weight: 700; padding: 4px 10px; }
    .color-presets { display: grid; gap: 12px; grid-template-columns: repeat(3, 1fr); }
    .preset-card { align-items: center; background: #fff; border: 1.5px solid var(--line); border-radius: 16px; color: inherit; cursor: pointer; display: flex; font: inherit; gap: 12px; padding: 14px; text-align: left; transition: border-color .2s, box-shadow .2s; width: 100%; }
    .preset-card:hover { border-color: #d8c4ae; }
    .preset-card.selected { background: var(--copper-soft); border-color: #c4703f; box-shadow: 0 0 0 3px rgba(196,112,63,.15); }
    .color-dot { border-radius: 50%; box-shadow: inset 0 0 0 2px rgba(255,255,255,.4); flex: none; height: 36px; width: 36px; }
    .preset-info { display: flex; flex: 1; flex-direction: column; }
    .preset-name { color: var(--ink); font-size: 15px; font-weight: 700; }
    .preset-sublabel { color: var(--muted); font-size: 13px; }
    .check { color: var(--copper); }
    @media (max-width: 720px) { .color-presets { grid-template-columns: 1fr; } }
  `],
})
export class OnboardingStepBrandingComponent {
  colorPresets = COLOR_PRESETS
  dragging = false
  uploadError = ''
  logoUrl = ''
  uploading = false

  constructor(
    public store: OnboardingStore,
    private api: OnboardingApi,
  ) {}

  async selectPreset(preset: { name: string; color: string; sublabel: string }): Promise<void> {
    this.store.updateBranding({
      colorPreset: preset.name,
      primaryColor: preset.color,
    })
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    this.uploadError = ''
    this.uploading = true

    try {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('El archivo debe ser menor a 5MB')
      }

      const validTypes = ['image/png', 'image/svg+xml', 'image/jpeg', 'image/jpg']
      if (!validTypes.includes(file.type)) {
        throw new Error('Solo se permiten archivos PNG, SVG o JPG')
      }

      const params = await this.api.getUploadParams('barbershop_staging').toPromise()
      if (!params) throw new Error('No se pudieron obtener los parámetros de subida')

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', params.uploadPreset)
      formData.append('folder', params.folder)

      const response = await fetch(params.uploadUrl, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Error al subir el logo a Cloudinary')
      }

      const result = await response.json()
      this.logoUrl = result.secure_url
      this.store.updateBranding({ logoUrl: this.logoUrl })
    } catch (error: any) {
      this.uploadError = error.message || 'Error al subir el logo'
    } finally {
      this.uploading = false
    }
  }
}
