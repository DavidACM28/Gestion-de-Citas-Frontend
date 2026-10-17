import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CreateSpecialtyRequest } from '../../../core/models/specialty.model';
import { NotificationService } from '../../../core/services/notification.service';
import { SpecialtyService } from '../../../core/services/specialty.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-specialties-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SharedMaterialModule, PageHeaderComponent],
  templateUrl: './specialties-form.page.html',
  styleUrl: './specialties-form.page.scss'
})
export class SpecialtiesFormPage {
  private readonly specialtyService = inject(SpecialtyService);
  private readonly notification = inject(NotificationService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);

  protected readonly form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    description: [
      '',
      [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]
    ]
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request: CreateSpecialtyRequest = {
      name: this.form.controls.name.value!.trim(),
      description: this.form.controls.description.value!.trim()
    };

    this.loading.set(true);

    this.specialtyService.create(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success('Especialidad creada correctamente');
        this.router.navigate(['/specialties']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        const message =
          error.error?.message ?? error.error?.errors?.[0] ?? 'Error al guardar la especialidad';
        this.notification.error(message);
      }
    });
  }
}
