import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DOCUMENT_TYPES, DocumentType } from '../../../core/models/document-type.model';
import { CreatePatientRequest } from '../../../core/models/patient.model';
import { NotificationService } from '../../../core/services/notification.service';
import { PatientService } from '../../../core/services/patient.service';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-patients-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SharedMaterialModule],
  templateUrl: './patients-form.page.html',
  styleUrl: './patients-form.page.scss'
})
export class PatientsFormPage {
  private readonly patientService = inject(PatientService);
  private readonly notification = inject(NotificationService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly documentTypes = Object.values(DOCUMENT_TYPES);
  protected readonly maxDate = new Date();

  protected readonly form = this.formBuilder.group({
    firstName: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    lastName: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    documentType: [null as DocumentType | null, [Validators.required]],
    documentNumber: [
      '',
      [Validators.required, Validators.maxLength(50), Validators.pattern(/\S/)]
    ],
    dateOfBirth: [null as Date | null, [Validators.required]],
    phoneNumber: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/\S/)]],
    address: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/\S/)]],
    username: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    password: ['', [Validators.required, Validators.pattern(/\S/)]]
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: CreatePatientRequest = {
      username: value.username!.trim(),
      email: value.email!.trim(),
      password: value.password!,
      documentType: value.documentType!,
      documentNumber: value.documentNumber!.trim(),
      firstName: value.firstName!.trim(),
      lastName: value.lastName!.trim(),
      dateOfBirth: this.formatDate(value.dateOfBirth!),
      phoneNumber: value.phoneNumber!.trim(),
      address: value.address!.trim()
    };

    this.loading.set(true);

    this.patientService.create(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success('Paciente registrado correctamente');
        this.router.navigate(['/login']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        const message =
          error.error?.message ?? error.error?.errors?.[0] ?? 'Error al registrar el paciente';
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
}
