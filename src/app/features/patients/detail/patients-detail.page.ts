import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Patient } from '../../../core/models/patient.model';
import { NotificationService } from '../../../core/services/notification.service';
import { PatientService } from '../../../core/services/patient.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-patients-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SharedMaterialModule, PageHeaderComponent],
  templateUrl: './patients-detail.page.html',
  styleUrl: './patients-detail.page.scss'
})
export class PatientsDetailPage implements OnInit {
  private readonly patientService = inject(PatientService);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);

  protected readonly loading = signal(false);
  protected readonly patient = signal<Patient | null>(null);
  protected readonly isOwnProfile = this.route.snapshot.routeConfig?.path === 'me';

  ngOnInit(): void {
    this.loading.set(true);

    const request$ = this.isOwnProfile
      ? this.patientService.getMe()
      : this.patientService.getById(Number(this.route.snapshot.paramMap.get('id')));

    request$.subscribe({
      next: (patient) => {
        this.patient.set(patient);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar la información del paciente');
        this.loading.set(false);
      }
    });
  }
}
