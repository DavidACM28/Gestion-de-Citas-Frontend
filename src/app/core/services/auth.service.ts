import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { API_ROUTES } from '../constants/api-routes.constants';
import { ApiResult, CurrentUser, LoginRequest, LoginResponse } from '../models/auth.model';
import { ApiServiceFactory } from './api-service-factory';

const SESSION_KEY = 'session';
const TOKEN_KEY = 'token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly factory = inject(ApiServiceFactory);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly loginEndpoint = this.factory.create(API_ROUTES.AUTH.LOGIN).url;
  private readonly _currentUser = signal<CurrentUser | null>(this.loadFromSession());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);

  login(request: LoginRequest): Observable<CurrentUser> {
    return this.http
      .post<ApiResult<LoginResponse>>(this.loginEndpoint, request)
      .pipe(
        map((result) => {
          if (!result.value) {
            throw new Error(result.message ?? 'La respuesta de autenticación no contiene datos.');
          }
          return {
            userName: request.userName,
            role: result.value.role,
            token: result.value.token,
            expiresAt: result.value.expirationDate,
          };
        }),
        tap((user) => this.setSession(user)),
      );
  }

  logout(): void {
    this._currentUser.set(null);
    this.clearStorage();
  }

  isAuthenticated(): boolean {
    const user = this._currentUser();

    if (!user || this.isExpired(user.expiresAt)) {
      this.logout();
      return false;
    }

    return true;
  }

  token(): string | null {
    return this.isAuthenticated() ? this._currentUser()?.token ?? null : null;
  }

  private setSession(user: CurrentUser): void {
    this._currentUser.set(user);

    const storage = this.getSessionStorage();
    if (storage) {
      storage.setItem(SESSION_KEY, JSON.stringify(user));
      storage.setItem(TOKEN_KEY, user.token);
    }
  }

  private loadFromSession(): CurrentUser | null {
    const storage = this.getSessionStorage();
    const sessionData = storage?.getItem(SESSION_KEY);

    if (!storage || !sessionData) {
      return null;
    }

    try {
      const user = JSON.parse(sessionData) as CurrentUser;

      if (!user.token || !user.expiresAt || this.isExpired(user.expiresAt)) {
        this.clearStorage();
        return null;
      }

      return user;
    } catch {
      this.clearStorage();
      return null;
    }
  }

  private isExpired(expiresAt: string): boolean {
    const expirationTime = Date.parse(expiresAt);
    return Number.isNaN(expirationTime) || expirationTime <= Date.now();
  }

  private clearStorage(): void {
    const storage = this.getSessionStorage();
    storage?.removeItem(SESSION_KEY);
    storage?.removeItem(TOKEN_KEY);
  }

  private getSessionStorage(): Storage | null {
    if (!this.isBrowser || typeof sessionStorage === 'undefined') {
      return null;
    }

    return sessionStorage;
  }
}
