import { Component, inject } from '@angular/core';
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

  protected readonly currentUser = this.authService.currentUser;
}
