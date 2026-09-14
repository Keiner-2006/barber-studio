export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'BUSINESS_RULE_VIOLATION'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'APPOINTMENT_CONFLICT'
  | 'IDEMPOTENCY_KEY_REUSE'

export type ErrorDetails = Record<string, unknown>

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly details?: ErrorDetails

  constructor(code: ErrorCode, message: string, details?: ErrorDetails) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = AppError.getStatusCode(code)
    this.details = details
  }

  private static getStatusCode(code: ErrorCode): number {
    const statusMap: Record<ErrorCode, number> = {
      VALIDATION_ERROR: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      CONFLICT: 409,
      BUSINESS_RULE_VIOLATION: 422,
      RATE_LIMITED: 429,
      INTERNAL_ERROR: 500,
      APPOINTMENT_CONFLICT: 409,
      IDEMPOTENCY_KEY_REUSE: 409,
    }
    return statusMap[code] || 500
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super('VALIDATION_ERROR', message, details)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super('NOT_FOUND', id ? `${resource} con id ${id} no encontrado` : `${resource} no encontrado`)
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super('CONFLICT', message, details)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autenticado') {
    super('UNAUTHORIZED', message)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Sin permisos') {
    super('FORBIDDEN', message)
  }
}

export class AppointmentConflictError extends ConflictError {
  constructor(availableSlots?: Array<{ startsAt: string; endsAt: string }>) {
    super('El horario ya no está disponible', { availableSlots })
  }
}

export type ApiErrorResponse = {
  error: {
    code: string
    message: string
    details?: ErrorDetails
  }
  requestId?: string
}
