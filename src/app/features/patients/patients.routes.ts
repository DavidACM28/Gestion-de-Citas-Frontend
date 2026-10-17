import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const PATIENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/patients-list.page').then((m) => m.PatientsListPage),
    canActivate: [roleGuard(['Admin', 'Receptionist'])]
  },
  {
    path: 'me',
    loadComponent: () =>
      import('./detail/patients-detail.page').then((m) => m.PatientsDetailPage),
    canActivate: [roleGuard(['Patient', 'Admin'])]
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detail/patients-detail.page').then((m) => m.PatientsDetailPage),
    canActivate: [roleGuard(['Admin', 'Receptionist'])]
  }
];
