import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SharedMaterialModule } from '../../shared/shared-material.module';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [SharedMaterialModule],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
