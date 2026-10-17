import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BusinessHours, WEEK_DAYS } from '../../../core/models/business-hours.model';
import { Doctor } from '../../../core/models/doctor.model';
import { AuthService } from '../../../core/services/auth.service';
import { BusinessHoursService } from '../../../core/services/business-hours.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  ConfirmDialogComponent
} from '../../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { HasRoleDirective } from '../../../shared/directives/has-role-directive';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-business-hours-list-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SharedMaterialModule,
    HasRoleDirective,
    EmptyStateComponent,
    PageHeaderComponent
  ],
  templateUrl: './business-hours-list.page.html',
  styleUrl: './business-hours-list.page.scss'
})
export class BusinessHoursListPage implements OnInit {
  private readonly businessHoursService = inject(BusinessHoursService);
  private readonly doctorService = inject(DoctorService);
  private readonly notification = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  protected readonly isAdmin = this.auth.currentUser()?.role === 'Admin';
  protected readonly displayedColumns: string[] = [
    'dayOfWeek',
    'timeRange',
    'appointmentDuration',
    'specialty',
    'actions'
  ];
  protected readonly dataSource = new MatTableDataSource<BusinessHours>();
  protected readonly doctors = signal<Doctor[]>([]);
  protected readonly currentDoctor = signal<Doctor | null>(null);
  protected readonly loading = signal(false);
  protected readonly loadingDoctors = signal(false);
  protected readonly selectedDoctorId = new FormControl<number | null>(null);

  ngOnInit(): void {
    this.selectedDoctorId.valueChanges.subscribe((doctorId) => {
      if (doctorId) {
        this.currentDoctor.set(
          this.doctors().find((doctor) => doctor.id === doctorId) ?? this.currentDoctor()
        );
        this.loadBusinessHours(doctorId);
      } else {
        this.currentDoctor.set(null);
        this.dataSource.data = [];
      }
    });

    if (this.isAdmin) {
      this.loadDoctors();
    } else {
      this.loadCurrentDoctor();
    }
  }

  protected dayLabel(day: string): string {
    return WEEK_DAYS.find((item) => item.value === day)?.label ?? day;
  }

  protected formatTime(time: string): string {
    return time.slice(0, 5);
  }

  protected confirmDeactivate(schedule: BusinessHours): void {
    const reference = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Desactivar horario',
        message: `¿Estás seguro de desactivar el horario del ${this.dayLabel(schedule.dayOfWeek)}?`,
        confirmLabel: 'Desactivar'
      }
    });

    reference.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deactivateSchedule(schedule.id);
      }
    });
  }

  private loadDoctors(): void {
    this.loadingDoctors.set(true);

    this.doctorService
      .list({ pageNumber: 1, pageSize: 100 })
      .subscribe({
        next: (doctors) => {
          this.doctors.set(doctors);
          this.loadingDoctors.set(false);

          const queryDoctorId = Number(this.route.snapshot.queryParamMap.get('doctorId'));
          const selectedDoctor =
            doctors.find((doctor) => doctor.id === queryDoctorId) ?? doctors[0] ?? null;

          this.selectedDoctorId.setValue(selectedDoctor?.id ?? null);
        },
        error: () => {
          this.notification.error('No se pudieron cargar los médicos');
          this.loadingDoctors.set(false);
        }
      });
  }

  private loadCurrentDoctor(): void {
    this.loadingDoctors.set(true);

    this.doctorService.getMe().subscribe({
      next: (doctor) => {
        this.currentDoctor.set(doctor);
        this.loadingDoctors.set(false);
        this.selectedDoctorId.setValue(doctor.id);
      },
      error: () => {
        this.notification.error('No se pudo cargar el perfil del médico');
        this.loadingDoctors.set(false);
      }
    });
  }

  private loadBusinessHours(doctorId: number): void {
    this.loading.set(true);

    this.businessHoursService.listByDoctor(doctorId).subscribe({
      next: (schedules) => {
        this.dataSource.data = schedules;
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar los horarios de atención');
        this.loading.set(false);
      }
    });
  }

  private deactivateSchedule(id: number): void {
    this.businessHoursService.deactivate(id).subscribe({
      next: () => {
        this.notification.success('Horario desactivado correctamente');
        const doctorId = this.selectedDoctorId.value;
        if (doctorId) {
          this.loadBusinessHours(doctorId);
        }
      },
      error: () => this.notification.error('Error al desactivar el horario')
    });
  }
}
