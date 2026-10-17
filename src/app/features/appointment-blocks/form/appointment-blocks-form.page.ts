import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CreateAppointmentBlockRequest } from '../../../core/models/appointment-block.model';
import { Doctor } from '../../../core/models/doctor.model';
import { AppointmentBlockService } from '../../../core/services/appointment-block.service';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-appointment-blocks-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SharedMaterialModule, PageHeaderComponent],
  templateUrl: './appointment-blocks-form.page.html',
  styleUrl: './appointment-blocks-form.page.scss'
})
export class AppointmentBlocksFormPage implements OnInit {
  private readonly appointmentBlockService = inject(AppointmentBlockService);
  private readonly doctorService = inject(DoctorService);
  private readonly notification = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  private readonly timeRangeValidator: ValidatorFn = (control: AbstractControl) => {
    const startTime = control.get('startTime')?.value as string | null;
    const endTime = control.get('endTime')?.value as string | null;

    if (!startTime || !endTime) {
      return null;
    }

    return startTime < endTime ? null : { timeRange: true };
  };

  private readonly futureBlockValidator: ValidatorFn = (control: AbstractControl) => {
    const date = control.get('date')?.value as Date | null;
    const startTime = control.get('startTime')?.value as string | null;

    if (!date || !startTime) {
      return null;
    }

    const [hours, minutes] = startTime.split(':').map(Number);
    const startDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes
    );

    return startDateTime >= new Date() ? null : { pastBlock: true };
  };

  protected readonly isAdmin = this.auth.currentUser()?.role === 'Admin';
  protected readonly doctors = signal<Doctor[]>([]);
  protected readonly currentDoctor = signal<Doctor | null>(null);
  protected readonly loading = signal(false);
  protected readonly loadingData = signal(false);
  protected readonly minDate = this.today();

  protected readonly form = this.formBuilder.group(
    {
      doctorId: [null as number | null, [Validators.required]],
      date: [null as Date | null, [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      reason: ['', [Validators.required, Validators.maxLength(250), Validators.pattern(/\S/)]],
      force: [false]
    },
    { validators: [this.timeRangeValidator, this.futureBlockValidator] }
  );

  ngOnInit(): void {
    if (this.isAdmin) {
      this.loadDoctors();
    } else {
      this.loadCurrentDoctor();
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: CreateAppointmentBlockRequest = {
      doctorId: Number(value.doctorId),
      date: this.formatDate(value.date!),
      startTime: this.normalizeTime(value.startTime!),
      endTime: this.normalizeTime(value.endTime!),
      reason: value.reason!.trim(),
      force: this.isAdmin && Boolean(value.force)
    };

    if (!request.force) {
      this.createBlock(request);
      return;
    }

    const reference = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Crear bloqueo forzado',
        message:
          'Este bloqueo cancelará automáticamente las citas que coincidan con el periodo indicado. ¿Deseas continuar?',
        confirmLabel: 'Crear y cancelar citas'
      }
    });

    reference.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.createBlock(request);
      }
    });
  }

  private loadDoctors(): void {
    this.loadingData.set(true);

    this.doctorService.list({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (doctors) => {
        this.doctors.set(doctors);

        const queryDoctorId = Number(this.route.snapshot.queryParamMap.get('doctorId'));
        const doctor = doctors.find((item) => item.id === queryDoctorId) ?? doctors[0] ?? null;
        this.form.controls.doctorId.setValue(doctor?.id ?? null);
        this.loadingData.set(false);
      },
      error: () => {
        this.loadingData.set(false);
        this.notification.error('No se pudieron cargar los médicos');
      }
    });
  }

  private loadCurrentDoctor(): void {
    this.loadingData.set(true);

    this.doctorService.getMe().subscribe({
      next: (doctor) => {
        this.currentDoctor.set(doctor);
        this.form.controls.doctorId.setValue(doctor.id);
        this.loadingData.set(false);
      },
      error: () => {
        this.loadingData.set(false);
        this.notification.error('No se pudo cargar el perfil del médico');
      }
    });
  }

  private createBlock(request: CreateAppointmentBlockRequest): void {
    this.loading.set(true);

    this.appointmentBlockService.create(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success(
          request.force
            ? 'Bloqueo forzado creado y citas canceladas correctamente'
            : 'Bloqueo creado correctamente'
        );
        this.router.navigate(['/appointment-blocks'], {
          queryParams: this.isAdmin ? { doctorId: request.doctorId } : undefined
        });
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        const message =
          error.error?.message ?? error.error?.errors?.[0] ?? 'Error al crear el bloqueo';
        this.notification.error(message);
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private normalizeTime(time: string): string {
    return time.length === 5 ? `${time}:00` : time;
  }

  private today(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
}
