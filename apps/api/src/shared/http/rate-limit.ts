type LoginAttempt = {
  count: number
  firstAttempt: number
}

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000
const loginAttempts = new Map<string, LoginAttempt>()

setInterval(() => {
  const now = Date.now()
  for (const [key, attempt] of loginAttempts) {
    if (now - attempt.firstAttempt > WINDOW_MS) {
      loginAttempts.delete(key)
    }
  }
}, 60 * 1000)

export function checkLoginRateLimit(key: string): boolean {
  const now = Date.now()
  const existing = loginAttempts.get(key)

  if (existing && now - existing.firstAttempt > WINDOW_MS) {
    loginAttempts.delete(key)
  }

  const current = loginAttempts.get(key)
  if (!current) {
    loginAttempts.set(key, { count: 1, firstAttempt: now })
    return true
  }

  if (current.count >= MAX_ATTEMPTS) {
    return false
  }

  current.count += 1
  return true
}

export function resetLoginRateLimit(key: string): void {
  loginAttempts.delete(key)
}
