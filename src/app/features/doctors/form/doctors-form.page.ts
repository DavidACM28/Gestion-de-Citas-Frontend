import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CreateDoctorRequest } from '../../../core/models/doctor.model';
import { Specialty } from '../../../core/models/specialty.model';
import { DoctorService } from '../../../core/services/doctor.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SpecialtyService } from '../../../core/services/specialty.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-doctors-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SharedMaterialModule, PageHeaderComponent],
  templateUrl: './doctors-form.page.html',
  styleUrl: './doctors-form.page.scss'
})
export class DoctorsFormPage implements OnInit {
  private readonly doctorService = inject(DoctorService);
  private readonly specialtyService = inject(SpecialtyService);
  private readonly notification = inject(NotificationService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly specialties = signal<Specialty[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadingData = signal(false);

  protected readonly form = this.formBuilder.group({
    firstName: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    lastName: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    phoneNumber: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(/\S/)]],
    specialtyId: [null as number | null, [Validators.required]],
    username: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    password: ['', [Validators.required, Validators.pattern(/\S/)]]
  });

  ngOnInit(): void {
    this.loadSpecialties();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: CreateDoctorRequest = {
      firstName: value.firstName!.trim(),
      lastName: value.lastName!.trim(),
      phoneNumber: value.phoneNumber!.trim(),
      specialtyId: Number(value.specialtyId),
      username: value.username!.trim(),
      email: value.email!.trim(),
      password: value.password!
    };

    this.loading.set(true);

    this.doctorService.create(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success('Médico registrado correctamente');
        this.router.navigate(['/doctors']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        const message =
          error.error?.message ?? error.error?.errors?.[0] ?? 'Error al registrar el médico';
        this.notification.error(message);
      }
    });
  }

  private loadSpecialties(): void {
    this.loadingData.set(true);

    this.specialtyService.list({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (specialties) => {
        this.specialties.set(specialties);
        this.loadingData.set(false);
      },
      error: () => {
        this.loadingData.set(false);
        this.notification.error('No se pudieron cargar las especialidades');
      }
    });
  }
}
