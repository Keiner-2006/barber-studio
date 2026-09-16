import { Injectable } from '@angular/core'
import { Observable, map } from 'rxjs'
import { ApiClient } from '../../core/http/api-client'
import { ApiResponse } from '@navaja/shared'
import { StaffMember } from './staff.models'

@Injectable({ providedIn: 'root' })
export class StaffApi {
  constructor(private api: ApiClient) {}

  getStaff(): Observable<StaffMember[]> {
    return this.api.get<ApiResponse<StaffMember[]>>('/staff').pipe(map((r) => r.data))
  }
}
