import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  APPOINTMENT_DURATIONS,
  BusinessHours,
  CreateBusinessHoursRequest,
  UpdateBusinessHoursRequest,
  WEEK_DAYS,
  WeekDay
} from '../../../core/models/business-hours.model';
import { Doctor } from '../../../core/models/doctor.model';
import { AuthService } from '../../../core/services/auth.service';
import { BusinessHoursService } from '../../../core/services/business-hours.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-business-hours-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SharedMaterialModule, PageHeaderComponent],
  templateUrl: './business-hours-form.page.html',
  styleUrl: './business-hours-form.page.scss'
})
export class BusinessHoursFormPage implements OnInit {
  private readonly businessHoursService = inject(BusinessHoursService);
  private readonly doctorService = inject(DoctorService);
  private readonly notification = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly timeRangeValidator: ValidatorFn = (control) => {
    const startTime = control.get('startTime')?.value as string | null;
    const endTime = control.get('endTime')?.value as string | null;

    if (!startTime || !endTime) {
      return null;
    }

    return startTime < endTime ? null : { timeRange: true };
  };

  protected readonly isAdmin = this.auth.currentUser()?.role === 'Admin';
  protected readonly doctors = signal<Doctor[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadingData = signal(false);
  protected readonly weekDays = WEEK_DAYS;
  protected readonly appointmentDurations = APPOINTMENT_DURATIONS;
  protected isEditMode = false;
  protected scheduleId: number | null = null;
  protected selectedDoctorId: number | null = null;
  protected doctorName = '';

  protected readonly form = this.formBuilder.group(
    {
      doctorId: [null as number | null, [Validators.required]],
      dayOfWeek: [null as WeekDay | null, [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      appointmentDurationMin: [15 as number | null, [Validators.required, Validators.min(15)]]
    },
    { validators: this.timeRangeValidator }
  );

  protected get title(): string {
    return this.isEditMode ? 'Editar horario' : 'Nuevo horario';
  }

  protected get description(): string {
    return this.isEditMode
      ? 'Modifica la disponibilidad y duración de las citas'
      : 'Configura un día de atención para el médico';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const queryDoctorId = Number(this.route.snapshot.queryParamMap.get('doctorId'));
    this.selectedDoctorId = Number.isInteger(queryDoctorId) && queryDoctorId > 0
      ? queryDoctorId
      : null;

    if (id) {
      this.isEditMode = true;
      this.scheduleId = Number(id);

      if (this.isAdmin) {
        this.loadSchedule(this.scheduleId);
      } else {
        this.loadDoctorSchedule(this.scheduleId);
      }
      return;
    }

    this.loadDoctors();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: UpdateBusinessHoursRequest = {
      dayOfWeek: value.dayOfWeek!,
      startTime: this.normalizeTime(value.startTime!),
      endTime: this.normalizeTime(value.endTime!),
      appointmentDurationMin: Number(value.appointmentDurationMin)
    };

    if (!this.isEditMode) {
      this.selectedDoctorId = Number(value.doctorId);
    }

    this.loading.set(true);

    const operation$ = this.isEditMode
      ? this.businessHoursService.update(this.scheduleId!, request)
      : this.businessHoursService.create({
          ...request,
          doctorId: Number(value.doctorId)
        } satisfies CreateBusinessHoursRequest);

    operation$.subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success(
          this.isEditMode
            ? 'Horario actualizado correctamente'
            : 'Horario creado correctamente'
        );
        this.router.navigate(['/business-hours'], {
          queryParams: this.selectedDoctorId ? { doctorId: this.selectedDoctorId } : undefined
        });
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        const message =
          error.error?.message ?? error.error?.errors?.[0] ?? 'Error al guardar el horario';
        this.notification.error(message);
      }
    });
  }

  private loadDoctors(): void {
    this.loadingData.set(true);

    this.doctorService.list({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (doctors) => {
        this.doctors.set(doctors);
        const doctor =
          doctors.find((item) => item.id === this.selectedDoctorId) ?? doctors[0] ?? null;

        this.selectedDoctorId = doctor?.id ?? null;
        this.form.controls.doctorId.setValue(this.selectedDoctorId);
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('No se pudieron cargar los médicos');
        this.loadingData.set(false);
      }
    });
  }

  private loadSchedule(id: number): void {
    this.loadingData.set(true);

    this.businessHoursService.getById(id).subscribe({
      next: (schedule) => {
        this.doctorName = schedule.doctorName;
        this.patchSchedule(schedule);
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar el horario');
        this.loadingData.set(false);
      }
    });
  }

  private loadDoctorSchedule(id: number): void {
    this.loadingData.set(true);

    this.doctorService.getMe().subscribe({
      next: (doctor) => {
        this.selectedDoctorId = doctor.id;
        this.doctorName = `${doctor.firstName} ${doctor.lastName}`;

        this.businessHoursService.listByDoctor(doctor.id).subscribe({
          next: (schedules) => {
            const schedule = schedules.find((item) => item.id === id);
            if (!schedule) {
              this.notification.error('Horario no encontrado');
              this.loadingData.set(false);
              return;
            }

            this.patchSchedule(schedule);
            this.loadingData.set(false);
          },
          error: () => {
            this.notification.error('Error al cargar el horario');
            this.loadingData.set(false);
          }
        });
      },
      error: () => {
        this.notification.error('No se pudo cargar el perfil del médico');
        this.loadingData.set(false);
      }
    });
  }

  private patchSchedule(schedule: BusinessHours): void {
    this.form.patchValue({
      doctorId: this.selectedDoctorId,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime.slice(0, 5),
      endTime: schedule.endTime.slice(0, 5),
      appointmentDurationMin: schedule.appointmentDurationMin
    });
  }

  private normalizeTime(time: string): string {
    return time.length === 5 ? `${time}:00` : time;
  }
}
