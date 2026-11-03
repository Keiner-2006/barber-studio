import { Injectable, Inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../environments/environment'
import { OnboardingSubmitData } from './onboarding.models'
import { AuthService } from '../../core/auth/auth.service'

@Injectable({
  providedIn: 'root'
})
export class OnboardingApi {
  private readonly apiUrl = environment.apiUrl

  constructor(private http: HttpClient, @Inject(AuthService) private auth: AuthService) {}

  private authHeaders(): { headers: { Authorization: string } } {
    const token = this.auth.getToken()
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    }
  }

  getUploadParams(folder?: string): Observable<{ cloudName: string; uploadPreset: string; uploadUrl: string; folder: string }> {
    let params = new HttpParams()
    if (folder) {
      params = params.set('folder', folder)
    }
    return this.http.get<{ cloudName: string; uploadPreset: string; uploadUrl: string; folder: string }>(`${this.apiUrl}/media/upload`, { params })
  }

  submitAll(data: OnboardingSubmitData): Observable<{ data: { jobId: string; tenantId: string; status: string } }> {
    return this.http.post<{ data: { jobId: string; tenantId: string; status: string } }>(`${this.apiUrl}/onboarding/tenants`, data, this.authHeaders())
  }

  checkSlugAvailability(slug: string): Observable<{ data: { slug: string; available: boolean } }> {
    const params = new HttpParams().set('slug', slug)
    return this.http.get<{ data: { slug: string; available: boolean } }>(`${this.apiUrl}/onboarding/slug`, { params })
  }

  getJobStatus(jobId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/onboarding/tenants/${jobId}`, this.authHeaders())
  }

  completeJob(jobId: string, status: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding/tenants/${jobId}`, { status }, this.authHeaders())
  }
}
