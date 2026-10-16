import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../models/auth.model';
import { AuthService } from '../services/auth.service';

export const roleGuard = (requiredRoles: Role | Role[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  if (roles.includes(auth.currentUser()?.role!)) {
    return true;
  }

  router.navigate(['/403']);
  return false;
};
