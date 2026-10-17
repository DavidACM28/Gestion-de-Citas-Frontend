import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Doctor } from '../../../core/models/doctor.model';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-doctors-detail-page',
  standalone: true,
  imports: [RouterLink, SharedMaterialModule, PageHeaderComponent],
  templateUrl: './doctors-detail.page.html',
  styleUrl: './doctors-detail.page.scss'
})
export class DoctorsDetailPage implements OnInit {
  private readonly doctorService = inject(DoctorService);
  private readonly notification = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  protected readonly doctor = signal<Doctor | null>(null);
  protected readonly loading = signal(false);
  protected readonly isOwnProfile = this.route.snapshot.routeConfig?.path === 'me';
  protected readonly canManageHours =
    this.isOwnProfile || this.auth.currentUser()?.role === 'Admin';

  ngOnInit(): void {
    this.loading.set(true);

    const request$ = this.isOwnProfile
      ? this.doctorService.getMe()
      : this.doctorService.getById(Number(this.route.snapshot.paramMap.get('id')));

    request$.subscribe({
      next: (doctor) => {
        this.doctor.set(doctor);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar la información del médico');
        this.loading.set(false);
      }
    });
  }
}
