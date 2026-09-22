import { Injectable, signal, computed } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { Observable, tap, catchError, of, switchMap, map, throwError } from 'rxjs'
import { environment } from '../../../environments/environment'
import { TenantService } from '../tenancy/tenant.service'
import { User, Session, LoginRequest, LoginResponse, RegisterRequest, SessionResponse } from './auth.models'

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
    private router: Router,
    private tenantService: TenantService
  ) {
    this.loadFromStorage()
    if (this.currentSession() && !environment.production && environment.demoAuth) {
      this.currentUser.set({
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@navaja.local',
        name: 'Administrador Navaja',
        role: 'admin',
      })
      this.currentSession.set({
        token: 'navaja-demo-session',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      })
    }
    if (this.currentSession()) {
      this.tenantService.load().subscribe({
        error: () => {
          this.clearSession()
        },
      })
    }
  }

  login(email: string, password: string, expectedRole?: string): Observable<LoginResponse> {
    const body: LoginRequest = { email, password, ...(expectedRole ? { expectedRole: expectedRole as any } : {}) }
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, body).pipe(
      tap((response) => {
        this.currentUser.set(response.user)
        this.currentSession.set(response.session)
        this.saveToStorage(response)
      }),
      switchMap((response) =>
        this.tenantService.load().pipe(
          map(() => response),
          catchError(() => {
            this.clearSession()
            return throwError(() => new Error('No se pudo cargar la información del estudio'))
          })
        )
      )
    )
  }

  signInWithGoogle(): void {
    window.location.href = `${environment.betterAuthUrl}/api/auth/signin/google`
  }

  register(email: string, password: string, name: string, tenantId?: string): Observable<LoginResponse> {
    const body: RegisterRequest = { email, password, name }
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, body).pipe(
      tap((response) => {
        this.currentUser.set(response.user)
        this.currentSession.set(response.session)
        this.saveToStorage(response)
        if (tenantId && typeof localStorage !== 'undefined') {
          localStorage.setItem('navaja_tenant_id', tenantId)
        }
      })
    )
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/session`, {}).pipe(
      tap(() => {
        this.clearSession()
        this.tenantService.clear()
        this.router.navigate(['/login'])
      }),
      catchError(() => {
        this.clearSession()
        this.tenantService.clear()
        this.router.navigate(['/login'])
        return of(void 0)
      })
    )
  }

  getSession(): Observable<SessionResponse | null> {
    return this.http.get<SessionResponse>(`${this.apiUrl}/session`).pipe(
      tap((response) => {
        this.currentUser.set(response.user)
        this.currentSession.set(response.session)
      }),
      catchError(() => {
        this.clearStorage()
        this.currentUser.set(null)
        this.currentSession.set(null)
        return of(null)
      })
    )
  }

  getToken(): string | null {
    return this.currentSession()?.token ?? null
  }

  private saveToStorage(response: LoginResponse): void {
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

  private clearSession(): void {
    this.clearStorage()
    this.currentUser.set(null)
    this.currentSession.set(null)
    this.tenantService.clear()
  }

  private clearStorage(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('navaja_user')
      localStorage.removeItem('navaja_session')
    }
  }
}