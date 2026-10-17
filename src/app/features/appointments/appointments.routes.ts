import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const APPOINTMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/appointments-list.page').then((m) => m.AppointmentsListPage),
    canActivate: [roleGuard(['Admin', 'Receptionist', 'Doctor', 'Patient'])]
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./form/appointments-form.page').then((m) => m.AppointmentsFormPage),
    canActivate: [roleGuard(['Admin', 'Receptionist', 'Patient'])]
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./form/appointments-form.page').then((m) => m.AppointmentsFormPage),
    canActivate: [roleGuard(['Admin', 'Receptionist', 'Patient'])]
  }
];
