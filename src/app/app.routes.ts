import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Rutas públicas (sin autenticación)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.page').then((m) => m.LoginPage)
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
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage)
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
