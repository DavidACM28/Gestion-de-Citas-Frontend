import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { API_ROUTES } from '../constants/api-routes.constants';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token();
  const isLoginRequest = req.url.includes(API_ROUTES.AUTH.LOGIN);
  const isApiProtectedRequest = req.url.includes('/api/') && !req.url.includes('/api/auth/');
  const isPreflight = req.method.toUpperCase() === 'OPTIONS';

  const authRequest = token && !isLoginRequest && !isPreflight
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      }) : req;

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        isApiProtectedRequest &&
        !isLoginRequest &&
        !isPreflight &&
        auth.token()
      ) {
        auth.logout();
        router.navigate(['/login'], { queryParams: { expired: true } });
      }

      return throwError(() => error);
    })
  );
};
