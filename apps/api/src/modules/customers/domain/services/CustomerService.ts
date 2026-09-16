import { Customer } from '../entities/Customer'

export class CustomerService {
  /**
   * Calcula el valor de vida del cliente (LTV)
   */
  calculateLTV(customer: Customer, averageVisitValue: number, visitsPerYear: number, lifespanYears: number = 2): number {
    return averageVisitValue * visitsPerYear * lifespanYears
  }

  /**
   * Verifica si un cliente es frecuente (más de X visitas)
   */
  isFrequentCustomer(customer: Customer, threshold: number = 5): boolean {
    return customer.totalVisitsNumber >= threshold
  }

  /**
   * Verifica si un cliente está inactivo (sin visitas en X días)
   */
  isInactive(customer: Customer, daysThreshold: number = 90): boolean {
    if (!customer.lastVisitAt) return true
    const daysSinceLastVisit = Math.floor(
      (Date.now() - customer.lastVisitAt.getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysSinceLastVisit > daysThreshold
  }

  /**
   * Calcula el promedio de gasto por visita
   */
  calculateAverageSpend(customer: Customer): number {
    if (customer.totalVisitsNumber === 0) return 0
    return customer.totalSpentNumber / customer.totalVisitsNumber
  }

  /**
   * Genera un nombre completo formateado
   */
  getFullName(customer: Customer): string {
    return `${customer.firstName} ${customer.lastName}`.trim()
  }

  /**
   * Verifica si el cliente tiene Preferencias de notificación
   */
  wantsNotifications(customer: Customer): boolean {
    const prefs = customer.preferences as any
    return prefs?.notifications !== false
  }

  /**
   * Actualiza las estadísticas del cliente después de una visita
   */
  recordVisit(customer: Customer, amountSpent: number): Customer {
    const newVisits = customer.totalVisitsNumber + 1
    const newSpent = customer.totalSpentNumber + amountSpent

    return Customer.fromPlain({
      ...customer.toPlain(),
      totalVisits: newVisits.toString(),
      totalSpent: newSpent.toString(),
      lastVisitAt: new Date(),
    })
  }
}