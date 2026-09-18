import { Component, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { StaffStore } from './staff.store'
import { StaffMember, CreateStaffInput, UpdateStaffInput } from './staff.models'

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="staff-page">
      <header class="page-header">
        <h1>Personal</h1>
        <button class="btn btn-primary" (click)="openCreateModal()">+ Nuevo</button>
      </header>

      @if (store.loading()) {
        <div class="loading">Cargando...</div>
      } @else {
        <div class="table-container">
          <table class="staff-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Comisión</th>
                <th>Reservable</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (member of store.staff(); track member.id) {
                <tr>
                  <td>{{ member.displayName }}</td>
                  <td>{{ member.userEmail }}</td>
                  <td>{{ member.commissionRate }}%</td>
                  <td>
                    <span class="badge" [class.active]="member.isBookable">
                      {{ member.isBookable ? 'Sí' : 'No' }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" [class.active]="member.status === 'active'">
                      {{ member.status }}
                    </span>
                  </td>
                  <td>
                    <button class="btn-icon" (click)="openEditModal(member)" title="Editar">✏️</button>
                    <button class="btn-icon danger" (click)="confirmDelete(member)" title="Eliminar">🗑️</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (store.error()) {
        <div class="error">{{ store.error() }}</div>
      }
    </div>

    <!-- Modal Crear/Editar -->
    @if (editingStaff() || showCreateModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{ editingStaff() ? 'Editar Personal' : 'Nuevo Personal' }}</h2>
          <form (ngSubmit)="save()" #form="ngForm">
            <div class="form-group">
              <label>Email del usuario *</label>
              <input
                type="email"
                name="email"
                [(ngModel)]="formData.email"
                required
                [disabled]="!!editingStaff()"
                placeholder="buscar@usuario.com" />
            </div>
            <div class="form-group">
              <label>Nombre a mostrar *</label>
              <input
                type="text"
                name="displayName"
                [(ngModel)]="formData.displayName"
                required
                placeholder="Juan Pérez" />
            </div>
            <div class="form-group">
              <label>Biografía</label>
              <textarea name="bio" [(ngModel)]="formData.bio" rows="3" placeholder="Descripción corta..."></textarea>
            </div>
            <div class="form-group">
              <label>Comisión (%)</label>
              <input
                type="number"
                name="commissionRate"
                [(ngModel)]="formData.commissionRate"
                min="0"
                max="100"
                placeholder="0" />
            </div>
            <div class="form-group checkbox">
              <label>
                <input type="checkbox" name="isBookable" [(ngModel)]="formData.isBookable" />
                Reservable en agenda
              </label>
            </div>
            @if (editingStaff()) {
              <div class="form-group checkbox">
                <label>
                  <input type="checkbox" name="status" [(ngModel)]="formData.status" [ngModelOptions]="{ standalone: true }" />
                  Activo
                </label>
              </div>
            }
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || store.loading()">
                {{ editingStaff() ? 'Guardar' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .staff-page { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 24px; color: #2d2d2d; }
    .btn { padding: 10px 16px; border-radius: 8px; font-weight: 500; cursor: pointer; border: none; font-size: 13px; }
    .btn-primary { background: #b87333; color: white; }
    .btn-primary:hover { background: #a06028; }
    .btn-secondary { background: #f3f4f6; color: #374151; }
    .btn-secondary:hover { background: #e5e7eb; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 14px; padding: 6px; border-radius: 6px; }
    .btn-icon:hover { background: #f3f4f6; }
    .btn-icon.danger:hover { background: #fee2e2; }
    .table-container { overflow-x: auto; background: white; border-radius: 12px; border: 1px solid #e5e7eb; }
    .staff-table { width: 100%; border-collapse: collapse; }
    .staff-table th, .staff-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    .staff-table th { background: #fafaf8; font-weight: 600; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
    .staff-table tr:last-child td { border-bottom: none; }
    .staff-table tr:hover td { background: #fafaf8; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge.active { background: #dcfce7; color: #166534; }
    .badge:not(.active) { background: #fee2e2; color: #dc2626; }
    .error { margin-top: 16px; padding: 12px; background: #fee2e2; color: #dc2626; border-radius: 8px; }
    .loading { padding: 40px; text-align: center; color: #6b7280; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .modal { background: white; border-radius: 16px; padding: 24px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
    .modal h2 { margin: 0 0 24px; font-size: 20px; color: #2d2d2d; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: #374151; }
    .form-group input, .form-group textarea { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: inherit; }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #b87333; box-shadow: 0 0 0 3px rgba(184,115,51,0.1); }
    .form-group.checkbox label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .form-group.checkbox input { width: 18px; height: 18px; accent-color: #b87333; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
  `]
})
export class StaffComponent implements OnInit {
  showCreateModal = signal(false)
  editingStaff = signal<StaffMember | null>(null)

  formData: CreateStaffInput & { status?: 'active' | 'inactive' } = {
    email: '',
    displayName: '',
    bio: '',
    commissionRate: '0',
    isBookable: true,
    status: 'active',
  }

  constructor(public store: StaffStore) {}

  ngOnInit(): void {
    this.store.load()
  }

  openCreateModal(): void {
    this.formData = { email: '', displayName: '', bio: '', commissionRate: '0', isBookable: true, status: 'active' }
    this.editingStaff.set(null)
    this.showCreateModal.set(true)
  }

  openEditModal(member: StaffMember): void {
    this.formData = {
      email: member.userEmail,
      displayName: member.displayName,
      bio: member.bio || '',
      commissionRate: member.commissionRate,
      isBookable: member.isBookable,
      status: member.status,
    }
    this.editingStaff.set(member)
    this.showCreateModal.set(true)
  }

  closeModal(): void {
    this.showCreateModal.set(false)
    this.editingStaff.set(null)
  }

  save(): void {
    if (this.editingStaff()) {
      const { email, status, ...updateData } = this.formData
      this.store.update(this.editingStaff()!.id, updateData as UpdateStaffInput)
    } else {
      this.store.create(this.formData)
    }
    this.closeModal()
  }

  confirmDelete(member: StaffMember): void {
    if (confirm(`¿Eliminar a ${member.displayName}?`)) {
      this.store.delete(member.id)
    }
  }
}