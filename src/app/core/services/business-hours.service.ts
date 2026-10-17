import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ROUTES } from '../constants/api-routes.constants';
import { ApiResult } from '../models/auth.model';
import {
  BusinessHours,
  CreateBusinessHoursRequest,
  UpdateBusinessHoursRequest
} from '../models/business-hours.model';
import { ApiServiceFactory } from './api-service-factory';

@Injectable({
  providedIn: 'root'
})
export class BusinessHoursService {
  private readonly http = inject(HttpClient);
  private readonly factory = inject(ApiServiceFactory);

  private get baseUrl(): string {
    return this.factory.create(API_ROUTES.BUSINESS_HOURS.BASE).url;
  }

  listByDoctor(doctorId: number): Observable<BusinessHours[]> {
    const url = this.factory.create(API_ROUTES.DOCTORS.BUSINESS_HOURS(doctorId)).url;
    return this.http
      .get<ApiResult<BusinessHours[]>>(url)
      .pipe(map((result) => result.value ?? ([] as BusinessHours[])));
  }

  getById(id: number): Observable<BusinessHours> {
    const url = this.factory.create(API_ROUTES.BUSINESS_HOURS.BY_ID(id)).url;
    return this.http.get<ApiResult<BusinessHours>>(url).pipe(map((result) => result.value!));
  }

  create(request: CreateBusinessHoursRequest): Observable<ApiResult<BusinessHours>> {
    return this.http.post<ApiResult<BusinessHours>>(this.baseUrl, request);
  }

  update(
    id: number,
    request: UpdateBusinessHoursRequest
  ): Observable<ApiResult<BusinessHours>> {
    const url = this.factory.create(API_ROUTES.BUSINESS_HOURS.BY_ID(id)).url;
    return this.http.put<ApiResult<BusinessHours>>(url, request);
  }

  deactivate(id: number): Observable<ApiResult> {
    const url = this.factory.create(API_ROUTES.BUSINESS_HOURS.BY_ID(id)).url;
    return this.http.delete<ApiResult>(url);
  }
}
