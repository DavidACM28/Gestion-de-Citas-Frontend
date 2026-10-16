import { Component, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Role } from '../../core/models/auth.model';
import { AuthService } from '../../core/services/auth.service';
import { HasRoleDirective } from '../../shared/directives/has-role-directive';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: Role[];
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    HasRoleDirective
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {
  protected readonly auth = inject(AuthService);

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Citas', icon: 'event', route: '/appointments' },
    { label: 'Médicos', icon: 'medical_services', route: '/doctors' },
    {
      label: 'Pacientes',
      icon: 'people',
      route: '/patients',
      roles: ['Admin', 'Receptionist']
    },
    {
      label: 'Especialidades',
      icon: 'local_hospital',
      route: '/specialties',
      roles: ['Admin']
    },
    {
      label: 'Horarios',
      icon: 'schedule',
      route: '/business-hours',
      roles: ['Admin', 'Doctor']
    },
    {
      label: 'Bloqueos de agenda',
      icon: 'event_busy',
      route: '/appointment-blocks',
      roles: ['Admin', 'Receptionist', 'Doctor']
    },
    {
      label: 'Usuarios',
      icon: 'manage_accounts',
      route: '/users',
      roles: ['Admin']
    }
  ];
}
