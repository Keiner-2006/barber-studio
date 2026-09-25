import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class OnboardingApi {
  private readonly apiUrl = environment.apiUrl

  constructor(private http: HttpClient) {}

  getUploadParams(folder?: string): Observable<{ cloudName: string; uploadPreset: string; uploadUrl: string; folder: string }> {
    let params = new HttpParams()
    if (folder) {
      params = params.set('folder', folder)
    }
    return this.http.get<{ cloudName: string; uploadPreset: string; uploadUrl: string; folder: string }>(`${this.apiUrl}/media/upload`, { params })
  }

  submitAll(data: { account: { name: string; email: string; userId: string }; business: { tradeName: string; legalName: string; slug: string; businessType: string; description: string }; location: { city: string; neighborhood: string; address: string; whatsapp: string; email: string }; schedule: { schedules: { days: string; open: string; close: string; active: boolean }[]; services: { id: string; name: string; description: string; duration: string; price: number; selected: boolean }[] }; branding: { primaryColor: string; colorPreset: string; logoUrl: string; instagram: string; tiktok: string } }) {
    return this.http.post<{ jobId: string }>(`${this.apiUrl}/onboarding/tenants`, data)
  }

  getJobStatus(jobId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/onboarding/${jobId}`)
  }

  completeJob(jobId: string, status: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding/${jobId}`, { status })
  }
}
