import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const APPOINTMENT_BLOCKS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/appointment-blocks-list.page').then(
        (m) => m.AppointmentBlocksListPage
      ),
    canActivate: [roleGuard(['Admin', 'Receptionist', 'Doctor'])]
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./form/appointment-blocks-form.page').then(
        (m) => m.AppointmentBlocksFormPage
      ),
    canActivate: [roleGuard(['Admin', 'Doctor'])]
  }
];
