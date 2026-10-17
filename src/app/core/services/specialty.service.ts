import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ROUTES } from '../constants/api-routes.constants';
import { ApiResult } from '../models/auth.model';
import { PagedRequest } from '../models/pagination.model';
import { CreateSpecialtyRequest, Specialty } from '../models/specialty.model';
import { ApiServiceFactory } from './api-service-factory';

@Injectable({
  providedIn: 'root'
})
export class SpecialtyService {
  private readonly http = inject(HttpClient);
  private readonly factory = inject(ApiServiceFactory);

  private get baseUrl(): string {
    return this.factory.create(API_ROUTES.SPECIALTIES.BASE).url;
  }

  list(request: PagedRequest): Observable<Specialty[]> {
    const params = new HttpParams()
      .set('pageNumber', request.pageNumber.toString())
      .set('pageSize', request.pageSize.toString());

    return this.http
      .get<ApiResult<Specialty[]>>(this.baseUrl, { params })
      .pipe(map((result) => result.value ?? ([] as Specialty[])));
  }

  getById(id: number): Observable<Specialty> {
    return this.http
      .get<ApiResult<Specialty>>(this.factory.create(API_ROUTES.SPECIALTIES.BY_ID(id)).url)
      .pipe(map((result) => result.value!));
  }

  create(request: CreateSpecialtyRequest): Observable<ApiResult<Specialty>> {
    return this.http.post<ApiResult<Specialty>>(this.baseUrl, request);
  }
}
