import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ROUTES } from '../constants/api-routes.constants';
import { ApiResult } from '../models/auth.model';
import { CreatePatientRequest, Patient } from '../models/patient.model';
import { ApiServiceFactory } from './api-service-factory';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly http = inject(HttpClient);
  private readonly factory = inject(ApiServiceFactory);

  private get baseUrl(): string {
    return this.factory.create(API_ROUTES.PATIENTS.BASE).url;
  }

  list(): Observable<Patient[]> {
    return this.http
      .get<ApiResult<Patient[]>>(this.baseUrl)
      .pipe(map((result) => result.value ?? ([] as Patient[])));
  }

  getById(id: number): Observable<Patient> {
    const url = this.factory.create(API_ROUTES.PATIENTS.BY_ID(id)).url;
    return this.http.get<ApiResult<Patient>>(url).pipe(map((result) => result.value!));
  }

  getMe(): Observable<Patient> {
    const url = this.factory.create(API_ROUTES.PATIENTS.ME).url;
    return this.http.get<ApiResult<Patient>>(url).pipe(map((result) => result.value!));
  }

  create(request: CreatePatientRequest): Observable<ApiResult<Patient>> {
    return this.http.post<ApiResult<Patient>>(this.baseUrl, request);
  }
}
