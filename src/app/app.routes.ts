import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  // Rutas públicas (sin autenticación)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.page').then((m) => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/patients/form/patients-form.page').then(
        (m) => m.PatientsFormPage
      )
  },
  {
    path: '403',
    loadComponent: () =>
      import('./features/errors/forbidden/forbidden.page').then((m) => m.ForbiddenPage)
  },
  {
    path: '404',
    loadComponent: () =>
      import('./features/errors/notfound/notfound.page').then((m) => m.NotfoundPage)
  },

  // Rutas protegidas (con autenticación)
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage)
      },
      {
        path: 'specialties',
        loadChildren: () =>
          import('./features/specialties/specialties.routes').then(
            (m) => m.SPECIALTIES_ROUTES
          )
      },
      {
        path: 'patients',
        loadChildren: () =>
          import('./features/patients/patients.routes').then((m) => m.PATIENTS_ROUTES)
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.USERS_ROUTES)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Catch-all
  {
    path: '**',
    loadComponent: () =>
      import('./features/errors/notfound/notfound.page').then((m) => m.NotfoundPage)
  }
];
