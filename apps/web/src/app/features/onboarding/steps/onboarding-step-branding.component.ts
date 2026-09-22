import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { OnboardingStore } from '../onboarding.store'
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
          <span class="material-icons text-sm">palette</span>
          Paso 5 de {{ store.totalSteps }} · Estética y Medios Digitales
        </span>
        <h2>Identidad Visual y Presencia Online</h2>
        <p>Personaliza el logotipo y acento cromático que verán tus clientes al agendar desde dispositivos móviles.</p>
      </div>

      <div class="step-form">
        <div class="form-group">
          <label>
            Isotipo / Emblema de la Barbería
            <span class="optional">PNG o SVG transparente máx 5MB</span>
          </label>
          <div class="upload-zone" (click)="fileInput.click()" (dragover)="dragging=true" (dragleave)="dragging=false" [class.drag-active]="dragging">
            <input type="file" #fileInput accept="image/png,image/svg+xml,image/jpeg" (change)="onFileSelected($event)" hidden />
            @if (logoUrl) {
              <img [src]="logoUrl" class="logo-preview" />
            } @else {
              <div class="upload-icon">
                <span class="material-icons text-2xl">cloud_upload</span>
              </div>
              <span class="upload-title">{{ dragging ? 'Suelta el archivo aquí' : 'Arrastra tu archivo de logo aquí o haz clic para explorar' }}</span>
              <span class="upload-hint">Subida directa a Cloudinary — optimización automática</span>
            }
            <div class="upload-badges">
              <span class="badge">512x512px recomendado</span>
              <span class="badge badge-success">Auto-opt Cloudinary</span>
            </div>
          </div>
          @if (uploadError) {
            <span class="upload-error">{{ uploadError }}</span>
          }
        </div>

        <div class="form-group">
          <label>Atmósfera Cromática del Portal</label>
          <div class="color-presets">
            @for (preset of colorPresets; track preset.name) {
              <div
                class="preset-card"
                [class.selected]="store.branding().colorPreset === preset.name"
                (click)="selectPreset(preset)"
              >
                <span class="color-dot" [style.background]="preset.color"></span>
                <div class="preset-info">
                  <span class="preset-name">{{ preset.name }}</span>
                  <span class="preset-sublabel">{{ preset.sublabel }}</span>
                </div>
                @if (store.branding().colorPreset === preset.name) {
                  <span class="check"><span class="material-icons text-sm">check</span></span>
                }
              </div>
            }
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="instagram">Instagram Oficial</label>
            <div class="input-wrap">
              <span class="material-icons">photo_camera</span>
              <input id="instagram" [(ngModel)]="store.branding().instagram" name="instagram" placeholder="@tu_negocio" />
            </div>
          </div>

          <div class="form-group">
            <label for="tiktok">TikTok Barber Showcase</label>
            <div class="input-wrap">
              <span class="material-icons">videocam</span>
              <input id="tiktok" [(ngModel)]="store.branding().tiktok" name="tiktok" placeholder="@tu_negocio" />
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .step-card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 3px 20px #4a2e1b0d; }
    .step-header { margin-bottom: 28px; }
    .step-badge { display: inline-flex; align-items: center; gap: 6px; color: #944928; font-size: 12px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; }
    .step-header h2 { color: #412311; font: 700 28px/1.1 'Vollkorn', serif; margin: 8px 0; }
    .step-header p { color: #50443e; font-size: 14px; margin: 0; }
    .step-form { display: flex; flex-direction: column; gap: 24px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group label { color: #412311; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 6px; justify-content: space-between; }
    .optional { color: #50443e; font-size: 10px; font-weight: 400; }
    .upload-zone { border: 2px dashed rgba(160,141,126,0.4); border-radius: 12px; padding: 32px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: all .2s; text-align: center; background: #f5f0e8; }
    .upload-zone:hover { border-color: rgba(148,73,40,0.6); }
    .upload-zone.drag-active { border-color: #944928; background: #fdf9f0; }
    .upload-icon { width: 56px; height: 56px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; color: #944928; }
    .upload-title { font-weight: 600; color: #412311; font-size: 14px; }
    .upload-hint { font-size: 12px; color: #50443e; }
    .upload-error { color: #dc2626; font-size: 12px; font-weight: 500; }
    .logo-preview { width: 120px; height: 120px; object-fit: contain; border-radius: 8px; background: white; padding: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .upload-badges { display: flex; gap: 8px; margin-top: 4px; flex-wrap: wrap; justify-content: center; }
    .badge { font-size: 10px; text-transform: uppercase; font-weight: 700; letter-spacing: .05em; padding: 3px 8px; border-radius: 4px; background: white; color: #50443e; }
    .badge-success { background: rgba(77,124,93,0.15); color: #4D7C5D; }
    .color-presets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .preset-card { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 8px; background: #f5f0e8; cursor: pointer; transition: all .2s; border: 2px solid transparent; }
    .preset-card:hover { background: #e6e2d9; }
    .preset-card.selected { border-color: #944928; background: #fdf9f0; }
    .color-dot { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
    .preset-info { display: flex; flex-direction: column; flex: 1; }
    .preset-name { font-weight: 600; color: #412311; font-size: 13px; }
    .preset-sublabel { font-size: 11px; color: #50443e; }
    .check { color: #944928; }
    .input-wrap { display: flex; align-items: center; position: relative; }
    .input-wrap .material-icons { position: absolute; left: 12px; color: #50443e; font-size: 18px; }
    .input-wrap input { width: 100%; padding: 12px 14px 12px 38px; border: 1px solid #e6e2d9; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
    .input-wrap input:focus { outline: none; border-color: #944928; box-shadow: 0 0 0 3px #94492822; }
    @media (max-width: 768px) { .color-presets { grid-template-columns: 1fr; } }
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
