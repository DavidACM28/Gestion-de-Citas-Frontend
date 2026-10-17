import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import {
  Appointment,
  AppointmentTransition
} from '../../../core/models/appointment.model';
import {
  APPOINTMENT_STATUS,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_OPTIONS,
  AppointmentStatus
} from '../../../core/models/appointment-status.model';
import { Role } from '../../../core/models/auth.model';
import { Doctor } from '../../../core/models/doctor.model';
import { Patient } from '../../../core/models/patient.model';
import { Specialty } from '../../../core/models/specialty.model';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PatientService } from '../../../core/services/patient.service';
import { SpecialtyService } from '../../../core/services/specialty.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-appointments-list-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SharedMaterialModule,
    EmptyStateComponent,
    PageHeaderComponent
  ],
  templateUrl: './appointments-list.page.html',
  styleUrl: './appointments-list.page.scss'
})
export class AppointmentsListPage implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly doctorService = inject(DoctorService);
  private readonly patientService = inject(PatientService);
  private readonly specialtyService = inject(SpecialtyService);
  private readonly notification = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);

  protected readonly role: Role = this.auth.currentUser()!.role;
  protected readonly isDoctor = this.role === 'Doctor';
  protected readonly isPatient = this.role === 'Patient';
  protected readonly isManager = this.role === 'Admin' || this.role === 'Receptionist';
  protected readonly canCreate = !this.isDoctor;
  protected readonly statuses = APPOINTMENT_STATUS_OPTIONS;
  protected readonly displayedColumns: string[] = [
    'date',
    'doctor',
    'patient',
    'status',
    'reason',
    'actions'
  ];
  protected readonly dataSource = new MatTableDataSource<Appointment>();
  protected readonly doctors = signal<Doctor[]>([]);
  protected readonly patients = signal<Patient[]>([]);
  protected readonly specialties = signal<Specialty[]>([]);
  protected readonly loading = signal(false);
  protected pageIndex = 0;
  protected pageSize = 10;
  protected totalItems = 0;

  protected readonly filters = this.formBuilder.group({
    doctorId: [null as number | null],
    patientId: [null as number | null],
    specialtyId: [null as number | null],
    status: ['' as AppointmentStatus | ''],
    startDate: [null as Date | null],
    endDate: [null as Date | null]
  });

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadAppointments();
  }

  protected applyFilters(): void {
    const { startDate, endDate } = this.filters.getRawValue();
    if (startDate && endDate && startDate > endDate) {
      this.notification.error('La fecha inicial no puede ser mayor a la fecha final');
      return;
    }

    this.pageIndex = 0;
    this.loadAppointments();
  }

  protected clearFilters(): void {
    this.filters.reset({
      doctorId: null,
      patientId: null,
      specialtyId: null,
      status: '',
      startDate: null,
      endDate: null
    });
    this.pageIndex = 0;
    this.loadAppointments();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAppointments();
  }

  protected doctorName(doctorId: number): string {
    const doctor = this.doctors().find((item) => item.id === doctorId);
    return doctor ? `${doctor.firstName} ${doctor.lastName}` : `Médico #${doctorId}`;
  }

  protected doctorSpecialty(doctorId: number): string {
    return this.doctors().find((item) => item.id === doctorId)?.specialty.name ?? '';
  }

  protected statusLabel(status: AppointmentStatus): string {
    return APPOINTMENT_STATUS_LABELS[status] ?? status;
  }

  protected statusClass(status: AppointmentStatus): string {
    return `status-chip status-chip--${status.toLowerCase().replaceAll('_', '-')}`;
  }

  protected canEdit(appointment: Appointment): boolean {
    return !this.isDoctor && appointment.status === APPOINTMENT_STATUS.REQUESTED;
  }

  protected canCancel(appointment: Appointment): boolean {
    return (
      !this.isDoctor &&
      (appointment.status === APPOINTMENT_STATUS.REQUESTED ||
        appointment.status === APPOINTMENT_STATUS.CONFIRMED)
    );
  }

  protected confirmTransition(
    appointment: Appointment,
    transition: AppointmentTransition,
    title: string,
    message: string,
    confirmLabel: string
  ): void {
    const reference = this.dialog.open(ConfirmDialogComponent, {
      data: { title, message, confirmLabel }
    });

    reference.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.appointmentService.transition(appointment.id, transition).subscribe({
        next: () => {
          this.notification.success('Estado de la cita actualizado correctamente');
          this.loadAppointments();
        },
        error: (error: HttpErrorResponse) => {
          const errorMessage =
            error.error?.message ?? error.error?.errors?.[0] ?? 'No se pudo actualizar la cita';
          this.notification.error(errorMessage);
        }
      });
    });
  }

  private loadAppointments(): void {
    const value = this.filters.getRawValue();
    this.loading.set(true);

    this.appointmentService
      .list(
        {
          doctorId: value.doctorId ?? undefined,
          patientId: value.patientId ?? undefined,
          specialtyId: value.specialtyId ?? undefined,
          status: value.status ?? '',
          startDate: value.startDate ? this.formatDate(value.startDate) : undefined,
          endDate: value.endDate ? this.formatDate(value.endDate) : undefined,
          pageNumber: this.pageIndex + 1,
          pageSize: this.pageSize
        },
        this.role
      )
      .subscribe({
        next: (appointments) => {
          this.dataSource.data = appointments;
          const loadedItems = this.pageIndex * this.pageSize + appointments.length;
          this.totalItems = appointments.length === this.pageSize ? loadedItems + 1 : loadedItems;
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.dataSource.data = [];
          this.totalItems = this.pageIndex * this.pageSize;
          this.loading.set(false);

          if (error.status !== 404) {
            const message = error.error?.message ?? 'Error al cargar las citas';
            this.notification.error(message);
          }
        }
      });
  }

  private loadCatalogs(): void {
    if (this.isDoctor) {
      this.doctorService.getMe().subscribe({
        next: (doctor) => this.doctors.set([doctor]),
        error: () => this.notification.error('No se pudo cargar el perfil del médico')
      });
      return;
    }

    this.doctorService.list({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (doctors) => this.doctors.set(doctors),
      error: () => this.notification.error('No se pudieron cargar los médicos')
    });

    this.specialtyService.list({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (specialties) => this.specialties.set(specialties),
      error: () => this.notification.error('No se pudieron cargar las especialidades')
    });

    if (this.isManager) {
      this.patientService.list().subscribe({
        next: (patients) => this.patients.set(patients),
        error: () => this.notification.error('No se pudieron cargar los pacientes')
      });
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
