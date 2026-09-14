import { Injectable, signal, computed } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { Observable, tap, catchError, of } from 'rxjs'
import { environment } from '../../../environments/environment'

export type User = {
  id: string
  email: string
  name: string
  role?: string
}

export type Session = {
  token: string
  expiresAt: string
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`

  private currentUser = signal<User | null>(null)
  private currentSession = signal<Session | null>(null)

  readonly user = this.currentUser.asReadonly()
  readonly session = this.currentSession.asReadonly()
  readonly isAuthenticated = computed(() => !!this.currentSession())

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadFromStorage()
    if (!this.currentSession() && !environment.production && environment.demoAuth) {
      this.currentUser.set({
        id: 'demo-user',
        email: 'admin@navaja.local',
        name: 'Administrador Navaja',
        role: 'admin',
      })
      this.currentSession.set({
        token: 'navaja-demo-session',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      })
    }
  }

  login(email: string, password: string): Observable<{ user: User; session: Session }> {
    return this.http
      .post<{ user: User; session: Session }>(`${this.apiUrl}/login`, {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          this.currentUser.set(response.user)
          this.currentSession.set(response.session)
          this.saveToStorage(response)
        })
      )
  }

  register(email: string, password: string, name: string): Observable<{ user: User; session: Session }> {
    return this.http
      .post<{ user: User; session: Session }>(`${this.apiUrl}/register`, {
        email,
        password,
        name,
      })
      .pipe(
        tap((response) => {
          this.currentUser.set(response.user)
          this.currentSession.set(response.session)
          this.saveToStorage(response)
        })
      )
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/logout`, {})
      .pipe(
        tap(() => {
          this.clearStorage()
          this.currentUser.set(null)
          this.currentSession.set(null)
          this.router.navigate(['/login'])
        }),
        catchError(() => {
          this.clearStorage()
          this.currentUser.set(null)
          this.currentSession.set(null)
          this.router.navigate(['/login'])
          return of(void 0)
        })
      )
  }

  getSession(): Observable<{ user: User; session: Session }> {
    return this.http
      .get<{ user: User; session: Session }>(`${this.apiUrl}/session`)
      .pipe(
        tap((response) => {
          this.currentUser.set(response.user)
          this.currentSession.set(response.session)
        }),
        catchError(() => {
          this.clearStorage()
          this.currentUser.set(null)
          this.currentSession.set(null)
          return of(null as any)
        })
      )
  }

  getToken(): string | null {
    return this.currentSession()?.token ?? null
  }

  private saveToStorage(response: { user: User; session: Session }): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('navaja_user', JSON.stringify(response.user))
      localStorage.setItem('navaja_session', JSON.stringify(response.session))
    }
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return

    const userStr = localStorage.getItem('navaja_user')
    const sessionStr = localStorage.getItem('navaja_session')

    if (userStr && sessionStr) {
      try {
        const user = JSON.parse(userStr) as User
        const session = JSON.parse(sessionStr) as Session

        if (new Date(session.expiresAt) > new Date()) {
          this.currentUser.set(user)
          this.currentSession.set(session)
        } else {
          this.clearStorage()
        }
      } catch {
        this.clearStorage()
      }
    }
  }

  private clearStorage(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('navaja_user')
      localStorage.removeItem('navaja_session')
    }
  }
}
