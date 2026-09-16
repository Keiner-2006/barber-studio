import { Appointment } from '../entities/Appointment'
import { AppointmentStatus } from '../entities/Appointment'

export class AppointmentService {
  /**
   * Calcula si una reservación puede ser cancelada según la política del servicio
   */
  canCancel(appointment: Appointment, cancellationMinutes?: number): boolean {
    if (!appointment.canCancel()) return false

    if (cancellationMinutes && cancellationMinutes > 0) {
      const now = new Date()
      const hoursUntil = (appointment.startsAt.getTime() - now.getTime()) / (1000 * 60 * 60)
      const minHours = cancellationMinutes / 60
      return hoursUntil >= minHours
    }

    return true
  }

  /**
   * Calcula el monto de la devolución si aplica
   */
  calculateRefundAmount(appointment: Appointment, paymentAmount: number, cancellationMinutes?: number): number {
    if (!appointment.canCancel()) return 0

    const now = new Date()
    const hoursUntil = (appointment.startsAt.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (cancellationMinutes && cancellationMinutes > 0) {
      const minHours = cancellationMinutes / 60
      if (hoursUntil >= minHours) {
        return paymentAmount // 100% refund
      } else if (hoursUntil >= minHours / 2) {
        return paymentAmount * 0.5 // 50% refund
      }
      return 0
    }

    return paymentAmount
  }

  /**
   * Verifica si un horario está dentro del horario de operación
   */
  isWithinOperatingHours(startsAt: Date, endsAt: Date, operatingHours?: Record<string, any>): boolean {
    if (!operatingHours) return true

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayOfWeek = dayNames[startsAt.getDay()]
    const hours = operatingHours[dayOfWeek]

    if (!hours || !hours.open || !hours.close) return true

    const [openHour, openMin] = hours.open.split(':').map(Number)
    const [closeHour, closeMin] = hours.close.split(':').map(Number)

    const openTime = openHour * 60 + openMin
    const closeTime = closeHour * 60 + closeMin
    const startTime = startsAt.getHours() * 60 + startsAt.getMinutes()
    const endTime = endsAt.getHours() * 60 + endsAt.getMinutes()

    return startTime >= openTime && endTime <= closeTime
  }

  /**
   * Calcula la duración real de la atención
   */
  getActualDuration(checkInAt?: Date, completedAt?: Date): number | null {
    if (!checkInAt || !completedAt) return null
    return Math.round((completedAt.getTime() - checkInAt.getTime()) / (1000 * 60))
  }

  /**
   * Verifica si una reservación está vencida (no show)
   */
  isNoShow(appointment: Appointment, gracePeriodMinutes: number = 15): boolean {
    if (appointment.status !== 'confirmed' && appointment.status !== 'pending') return false
    const now = new Date()
    const endTime = new Date(appointment.startsAt.getTime() + gracePeriodMinutes * 60000)
    return now > endTime
  }

  /**
   * Agrupa reservaciones por fecha
   */
  groupByDate(appointments: Appointment[]): Map<string, Appointment[]> {
    const grouped = new Map<string, Appointment[]>()

    appointments.forEach((appointment) => {
      const dateKey = appointment.startsAt.toISOString().split('T')[0]
      const existing = grouped.get(dateKey) || []
      existing.push(appointment)
      grouped.set(dateKey, existing)
    })

    return grouped
  }

  /**
   * Calcula el total de ingresos de un grupo de reservaciones
   */
  calculateTotalRevenue(appointments: Appointment[]): number {
    return appointments
      .filter((a) => a.status === 'completed')
      .reduce((sum, a) => sum + a.total, 0)
  }

  /**
   * Calcula el ticket promedio
   */
  calculateAverageTicket(appointments: Appointment[]): number {
    const completed = appointments.filter((a) => a.status === 'completed')
    if (completed.length === 0) return 0
    return this.calculateTotalRevenue(completed) / completed.length
  }
}