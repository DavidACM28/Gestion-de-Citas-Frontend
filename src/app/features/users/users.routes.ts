import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/users-list.page').then((m) => m.UsersListPage),
    canActivate: [roleGuard('Admin')]
  },
  {
    path: 'me',
    loadComponent: () => import('./detail/users-detail.page').then((m) => m.UsersDetailPage),
    canActivate: [roleGuard(['Admin', 'Receptionist'])]
  },
  {
    path: 'new',
    loadComponent: () => import('./form/users-form.page').then((m) => m.UsersFormPage),
    canActivate: [roleGuard('Admin')]
  },
  {
    path: ':id',
    loadComponent: () => import('./detail/users-detail.page').then((m) => m.UsersDetailPage),
    canActivate: [roleGuard('Admin')]
  }
];
