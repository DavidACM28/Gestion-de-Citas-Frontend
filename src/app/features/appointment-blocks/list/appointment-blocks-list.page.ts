import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppointmentBlock } from '../../../core/models/appointment-block.model';
import { Doctor } from '../../../core/models/doctor.model';
import { AppointmentBlockService } from '../../../core/services/appointment-block.service';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-appointment-blocks-list-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SharedMaterialModule,
    EmptyStateComponent,
    PageHeaderComponent
  ],
  templateUrl: './appointment-blocks-list.page.html',
  styleUrl: './appointment-blocks-list.page.scss'
})
export class AppointmentBlocksListPage implements OnInit {
  private readonly appointmentBlockService = inject(AppointmentBlockService);
  private readonly doctorService = inject(DoctorService);
  private readonly notification = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  protected readonly role = this.auth.currentUser()!.role;
  protected readonly isDoctor = this.role === 'Doctor';
  protected readonly canCreate = this.role === 'Admin' || this.isDoctor;
  protected readonly canDeactivate = this.canCreate;
  protected readonly displayedColumns: string[] = [
    'date',
    'timeRange',
    'doctor',
    'reason',
    'actions'
  ];
  protected readonly dataSource = new MatTableDataSource<AppointmentBlock>();
  protected readonly doctors = signal<Doctor[]>([]);
  protected readonly currentDoctor = signal<Doctor | null>(null);
  protected readonly loading = signal(false);
  protected readonly loadingDoctors = signal(false);

  protected readonly filters = this.formBuilder.group({
    doctorId: [null as number | null],
    startDate: [null as Date | null],
    endDate: [null as Date | null]
  });

  ngOnInit(): void {
    if (this.isDoctor) {
      this.loadCurrentDoctor();
    } else {
      this.loadDoctors();
    }
  }

  protected applyFilters(): void {
    const { startDate, endDate } = this.filters.getRawValue();
    if (startDate && endDate && startDate > endDate) {
      this.notification.error('La fecha inicial no puede ser mayor a la fecha final');
      return;
    }

    this.loadBlocks();
  }

  protected clearFilters(): void {
    this.filters.reset({ doctorId: null, startDate: null, endDate: null });
    this.loadBlocks();
  }

  protected doctorName(doctorId: number): string {
    const doctor = this.doctors().find((item) => item.id === doctorId);
    return doctor ? `${doctor.firstName} ${doctor.lastName}` : `Médico #${doctorId}`;
  }

  protected doctorSpecialty(doctorId: number): string {
    return this.doctors().find((item) => item.id === doctorId)?.specialty.name ?? '';
  }

  protected formatTime(time: string): string {
    return time.slice(0, 5);
  }

  protected confirmDeactivate(block: AppointmentBlock): void {
    const reference = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Desactivar bloqueo',
        message: `¿Estás seguro de desactivar el bloqueo del ${this.formatDateLabel(block.date)} de ${this.formatTime(block.startTime)} a ${this.formatTime(block.endTime)}?`,
        confirmLabel: 'Desactivar'
      }
    });

    reference.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.appointmentBlockService.deactivate(block.id).subscribe({
        next: () => {
          this.notification.success('Bloqueo desactivado correctamente');
          this.loadBlocks();
        },
        error: (error: HttpErrorResponse) => {
          const message =
            error.error?.message ?? error.error?.errors?.[0] ?? 'No se pudo desactivar el bloqueo';
          this.notification.error(message);
        }
      });
    });
  }

  private loadDoctors(): void {
    this.loadingDoctors.set(true);

    this.doctorService.list({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (doctors) => {
        this.doctors.set(doctors);
        this.loadingDoctors.set(false);

        const queryDoctorId = Number(this.route.snapshot.queryParamMap.get('doctorId'));
        if (doctors.some((doctor) => doctor.id === queryDoctorId)) {
          this.filters.controls.doctorId.setValue(queryDoctorId);
        }

        this.loadBlocks();
      },
      error: () => {
        this.loadingDoctors.set(false);
        this.notification.error('No se pudieron cargar los médicos');
        this.loadBlocks();
      }
    });
  }

  private loadCurrentDoctor(): void {
    this.loadingDoctors.set(true);

    this.doctorService.getMe().subscribe({
      next: (doctor) => {
        this.currentDoctor.set(doctor);
        this.doctors.set([doctor]);
        this.loadingDoctors.set(false);
        this.loadBlocks();
      },
      error: () => {
        this.loadingDoctors.set(false);
        this.notification.error('No se pudo cargar el perfil del médico');
        this.loadBlocks();
      }
    });
  }

  private loadBlocks(): void {
    const value = this.filters.getRawValue();
    this.loading.set(true);

    this.appointmentBlockService
      .list({
        doctorId: this.isDoctor ? undefined : value.doctorId ?? undefined,
        startDate: value.startDate ? this.formatDate(value.startDate) : undefined,
        endDate: value.endDate ? this.formatDate(value.endDate) : undefined
      })
      .subscribe({
        next: (blocks) => {
          this.dataSource.data = blocks;
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.dataSource.data = [];
          this.loading.set(false);

          if (error.status !== 404) {
            const message = error.error?.message ?? 'Error al cargar los bloqueos de agenda';
            this.notification.error(message);
          }
        }
      });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDateLabel(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
}
