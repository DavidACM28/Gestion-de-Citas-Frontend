import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ROUTES } from '../constants/api-routes.constants';
import { ApiResult } from '../models/auth.model';
import { CreateDoctorRequest, Doctor, DoctorListRequest } from '../models/doctor.model';
import { ApiServiceFactory } from './api-service-factory';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private readonly http = inject(HttpClient);
  private readonly factory = inject(ApiServiceFactory);

  private get baseUrl(): string {
    return this.factory.create(API_ROUTES.DOCTORS.BASE).url;
  }

  list(request: DoctorListRequest): Observable<Doctor[]> {
    const params = new HttpParams()
      .set('specialty', request.specialty ?? '')
      .set('name', request.name ?? '')
      .set('pageNumber', request.pageNumber.toString())
      .set('pageSize', request.pageSize.toString());

    return this.http
      .get<ApiResult<Doctor[]>>(this.baseUrl, { params })
      .pipe(map((result) => result.value ?? ([] as Doctor[])));
  }

  getMe(): Observable<Doctor> {
    const url = this.factory.create(API_ROUTES.DOCTORS.ME).url;
    return this.http.get<ApiResult<Doctor>>(url).pipe(map((result) => result.value!));
  }

  getById(id: number): Observable<Doctor> {
    const url = this.factory.create(API_ROUTES.DOCTORS.BY_ID(id)).url;
    return this.http.get<ApiResult<Doctor>>(url).pipe(map((result) => result.value!));
  }

  create(request: CreateDoctorRequest): Observable<ApiResult<Doctor>> {
    return this.http.post<ApiResult<Doctor>>(this.baseUrl, request);
  }
}
