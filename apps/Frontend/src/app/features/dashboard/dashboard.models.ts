export type KpiTone = 'copper' | 'green' | 'blue' | 'neutral'

export interface Kpi {
  label: string
  value: string
  detail: string
  /** Material Symbols ligature name. */
  icon: string
  tone: KpiTone
}

export type StatusTone = 'pending' | 'confirmed' | 'waiting' | 'active' | 'done' | 'cancelled'

export interface AppointmentRow {
  id: string
  time: string
  name: string
  service: string
  barber: string
  status: string
  statusTone: StatusTone
  initials: string
}
