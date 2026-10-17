import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const DOCTORS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/doctors-list.page').then((m) => m.DoctorsListPage),
    canActivate: [roleGuard(['Admin', 'Receptionist', 'Doctor', 'Patient'])]
  },
  {
    path: 'me',
    loadComponent: () =>
      import('./detail/doctors-detail.page').then((m) => m.DoctorsDetailPage),
    canActivate: [roleGuard('Doctor')]
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./form/doctors-form.page').then((m) => m.DoctorsFormPage),
    canActivate: [roleGuard('Admin')]
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detail/doctors-detail.page').then((m) => m.DoctorsDetailPage),
    canActivate: [roleGuard(['Admin', 'Receptionist'])]
  }
];
