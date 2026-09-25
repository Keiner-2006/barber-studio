import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="admin"><h1>Panel de Administración</h1></div>`,
  styles: [':host { display: block; padding: 24px; }'],
})
export class AdminComponent {}
