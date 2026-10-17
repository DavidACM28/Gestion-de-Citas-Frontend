import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const SPECIALTIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/specialties-list.page').then((m) => m.SpecialtiesListPage)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./form/specialties-form.page').then((m) => m.SpecialtiesFormPage),
    canActivate: [roleGuard('Admin')]
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detail/specialties-detail.page').then((m) => m.SpecialtiesDetailPage)
  }
];
