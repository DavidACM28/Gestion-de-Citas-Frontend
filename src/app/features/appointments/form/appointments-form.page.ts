import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Appointment, CreateAppointmentRequest } from '../../../core/models/appointment.model';
import { BusinessHours, WeekDay } from '../../../core/models/business-hours.model';
import { Doctor } from '../../../core/models/doctor.model';
import { Patient } from '../../../core/models/patient.model';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { BusinessHoursService } from '../../../core/services/business-hours.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PatientService } from '../../../core/services/patient.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-appointments-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SharedMaterialModule, PageHeaderComponent],
  templateUrl: './appointments-form.page.html',
  styleUrl: './appointments-form.page.scss'
})
export class AppointmentsFormPage implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly doctorService = inject(DoctorService);
  private readonly patientService = inject(PatientService);
  private readonly businessHoursService = inject(BusinessHoursService);
  private readonly notification = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly role = this.auth.currentUser()!.role;
  protected readonly isPatient = this.role === 'Patient';
  protected readonly doctors = signal<Doctor[]>([]);
  protected readonly patients = signal<Patient[]>([]);
  protected readonly currentPatient = signal<Patient | null>(null);
  protected readonly schedules = signal<BusinessHours[]>([]);
  protected readonly availableSlots = signal<string[]>([]);
  protected readonly selectedSchedule = signal<BusinessHours | null>(null);
  protected readonly loading = signal(false);
  protected readonly loadingData = signal(false);
  protected readonly loadingSchedule = signal(false);
  protected readonly minDate = new Date();
  protected isEditMode = false;
  protected appointmentId: number | null = null;

  protected readonly form = this.formBuilder.group({
    doctorId: [null as number | null, [Validators.required]],
    patientId: [null as number | null, [Validators.required]],
    date: [null as Date | null, [Validators.required]],
    startTime: ['', [Validators.required]],
    reason: ['', [Validators.required, Validators.maxLength(250), Validators.pattern(/\S/)]],
    note: ['', [Validators.maxLength(500)]]
  });

  protected get title(): string {
    return this.isEditMode ? 'Editar cita' : 'Nueva cita';
  }

  protected get description(): string {
    return this.isEditMode
      ? 'Modifica los datos de la cita solicitada'
      : 'Completa los datos para solicitar una cita médica';
  }

  ngOnInit(): void {
    this.form.controls.doctorId.valueChanges.subscribe((doctorId) => {
      if (doctorId) {
        this.loadBusinessHours(doctorId);
      } else {
        this.schedules.set([]);
        this.availableSlots.set([]);
        this.selectedSchedule.set(null);
      }
    });

    this.form.controls.date.valueChanges.subscribe(() => this.calculateSlots());

    this.loadCatalogs();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.appointmentId = Number(id);
      this.loadAppointment(this.appointmentId);
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: CreateAppointmentRequest = {
      doctorId: Number(value.doctorId),
      patientId: Number(value.patientId),
      date: this.formatDate(value.date!),
      startTime: this.normalizeTime(value.startTime!),
      reason: value.reason!.trim(),
      note: value.note?.trim() ?? ''
    };

    this.loading.set(true);

    const operation$ = this.isEditMode
      ? this.appointmentService.update(this.appointmentId!, request)
      : this.appointmentService.create(request);

    operation$.subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success(
          this.isEditMode ? 'Cita actualizada correctamente' : 'Cita creada correctamente'
        );
        this.router.navigate(['/appointments']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        const message =
          error.error?.message ?? error.error?.errors?.[0] ?? 'Error al guardar la cita';
        this.notification.error(message);
      }
    });
  }

  private loadCatalogs(): void {
    this.doctorService.list({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (doctors) => this.doctors.set(doctors),
      error: () => this.notification.error('No se pudieron cargar los médicos')
    });

    if (this.isPatient) {
      this.patientService.getMe().subscribe({
        next: (patient) => {
          this.currentPatient.set(patient);
          this.form.controls.patientId.setValue(patient.id);
        },
        error: () => this.notification.error('No se pudo cargar el perfil del paciente')
      });
      return;
    }

    this.patientService.list().subscribe({
      next: (patients) => this.patients.set(patients),
      error: () => this.notification.error('No se pudieron cargar los pacientes')
    });
  }

  private loadAppointment(id: number): void {
    this.loadingData.set(true);

    this.appointmentService.getForEdit(id, this.role).subscribe({
      next: (appointment) => {
        this.patchAppointment(appointment);
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('No se pudo cargar la cita');
        this.loadingData.set(false);
      }
    });
  }

  private patchAppointment(appointment: Appointment): void {
    this.form.patchValue({
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      date: this.parseDate(appointment.date),
      startTime: appointment.startTime.slice(0, 5),
      reason: appointment.reason,
      note: appointment.note ?? ''
    });
  }

  private loadBusinessHours(doctorId: number): void {
    this.loadingSchedule.set(true);
    this.availableSlots.set([]);
    this.selectedSchedule.set(null);

    this.businessHoursService.listByDoctor(doctorId).subscribe({
      next: (schedules) => {
        this.schedules.set(schedules);
        this.loadingSchedule.set(false);
        this.calculateSlots();
      },
      error: () => {
        this.schedules.set([]);
        this.loadingSchedule.set(false);
        this.notification.error('No se pudieron cargar los horarios del médico');
      }
    });
  }

  private calculateSlots(): void {
    const date = this.form.controls.date.value;
    if (!date) {
      this.availableSlots.set([]);
      this.selectedSchedule.set(null);
      return;
    }

    const day = this.weekDay(date);
    const schedule = this.schedules().find((item) => item.dayOfWeek === day) ?? null;
    this.selectedSchedule.set(schedule);

    if (!schedule) {
      this.availableSlots.set([]);
      this.form.controls.startTime.setValue('', { emitEvent: false });
      return;
    }

    const slots: string[] = [];
    const start = this.toMinutes(schedule.startTime);
    const end = this.toMinutes(schedule.endTime);
    const duration = schedule.appointmentDurationMin;

    for (let minutes = start; minutes + duration <= end; minutes += 15) {
      slots.push(this.fromMinutes(minutes));
    }

    this.availableSlots.set(slots);

    const currentTime = this.form.controls.startTime.value;
    if (currentTime && !slots.includes(currentTime)) {
      this.form.controls.startTime.setValue('', { emitEvent: false });
    }
  }

  private weekDay(date: Date): WeekDay {
    const days: WeekDay[] = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];
    return days[date.getDay()];
  }

  private toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private fromMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseDate(date: string): Date {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private normalizeTime(time: string): string {
    return time.length === 5 ? `${time}:00` : time;
  }
}
