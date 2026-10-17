import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ROUTES } from '../constants/api-routes.constants';
import {
  AppointmentBlock,
  AppointmentBlockListRequest,
  CreateAppointmentBlockRequest
} from '../models/appointment-block.model';
import { ApiResult } from '../models/auth.model';
import { ApiServiceFactory } from './api-service-factory';

@Injectable({
  providedIn: 'root'
})
export class AppointmentBlockService {
  private readonly http = inject(HttpClient);
  private readonly factory = inject(ApiServiceFactory);

  private get baseUrl(): string {
    return this.factory.create(API_ROUTES.APPOINTMENT_BLOCKS.BASE).url;
  }

  list(request: AppointmentBlockListRequest): Observable<AppointmentBlock[]> {
    let params = new HttpParams().set('doctorId', (request.doctorId ?? 0).toString());

    if (request.startDate) {
      params = params.set('startDate', request.startDate);
    }
    if (request.endDate) {
      params = params.set('endDate', request.endDate);
    }

    return this.http
      .get<ApiResult<AppointmentBlock[]>>(this.baseUrl, { params })
      .pipe(map((result) => result.value ?? ([] as AppointmentBlock[])));
  }

  create(request: CreateAppointmentBlockRequest): Observable<ApiResult<AppointmentBlock>> {
    return this.http.post<ApiResult<AppointmentBlock>>(this.baseUrl, request);
  }

  deactivate(id: number): Observable<ApiResult> {
    const url = this.factory.create(API_ROUTES.APPOINTMENT_BLOCKS.BY_ID(id)).url;
    return this.http.delete<ApiResult>(url);
  }
}
