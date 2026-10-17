import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ROUTES } from '../constants/api-routes.constants';
import { ApiResult } from '../models/auth.model';
import { CreateUserRequest, User } from '../models/user.model';
import { ApiServiceFactory } from './api-service-factory';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly factory = inject(ApiServiceFactory);

  private get baseUrl(): string {
    return this.factory.create(API_ROUTES.USERS.BASE).url;
  }

  list(): Observable<User[]> {
    return this.http
      .get<ApiResult<User[]>>(this.baseUrl)
      .pipe(map((result) => result.value ?? ([] as User[])));
  }

  getById(id: number): Observable<User> {
    const url = this.factory.create(API_ROUTES.USERS.BY_ID(id)).url;
    return this.http.get<ApiResult<User>>(url).pipe(map((result) => result.value!));
  }

  getMe(): Observable<User> {
    const url = this.factory.create(API_ROUTES.USERS.ME).url;
    return this.http.get<ApiResult<User>>(url).pipe(map((result) => result.value!));
  }

  create(request: CreateUserRequest): Observable<ApiResult<User>> {
    return this.http.post<ApiResult<User>>(this.baseUrl, request);
  }
}
