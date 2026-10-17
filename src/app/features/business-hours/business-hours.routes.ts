import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const BUSINESS_HOURS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/business-hours-list.page').then((m) => m.BusinessHoursListPage),
    canActivate: [roleGuard(['Admin', 'Doctor'])]
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./form/business-hours-form.page').then((m) => m.BusinessHoursFormPage),
    canActivate: [roleGuard('Admin')]
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./form/business-hours-form.page').then((m) => m.BusinessHoursFormPage),
    canActivate: [roleGuard(['Admin', 'Doctor'])]
  }
];
