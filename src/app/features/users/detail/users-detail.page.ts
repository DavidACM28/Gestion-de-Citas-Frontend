import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { User } from '../../../core/models/user.model';
import { NotificationService } from '../../../core/services/notification.service';
import { UserService } from '../../../core/services/user.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-users-detail-page',
  standalone: true,
  imports: [RouterLink, SharedMaterialModule, PageHeaderComponent],
  templateUrl: './users-detail.page.html',
  styleUrl: './users-detail.page.scss'
})
export class UsersDetailPage implements OnInit {
  private readonly userService = inject(UserService);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);

  protected readonly loading = signal(false);
  protected readonly user = signal<User | null>(null);
  protected readonly isOwnProfile = this.route.snapshot.routeConfig?.path === 'me';

  ngOnInit(): void {
    this.loading.set(true);

    const request$ = this.isOwnProfile
      ? this.userService.getMe()
      : this.userService.getById(Number(this.route.snapshot.paramMap.get('id')));

    request$.subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar la información del usuario');
        this.loading.set(false);
      }
    });
  }
}
