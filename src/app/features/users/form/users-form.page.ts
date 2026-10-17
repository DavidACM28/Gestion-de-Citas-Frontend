import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdministrativeRole, CreateUserRequest } from '../../../core/models/user.model';
import { NotificationService } from '../../../core/services/notification.service';
import { UserService } from '../../../core/services/user.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-users-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SharedMaterialModule, PageHeaderComponent],
  templateUrl: './users-form.page.html',
  styleUrl: './users-form.page.scss'
})
export class UsersFormPage {
  private readonly userService = inject(UserService);
  private readonly notification = inject(NotificationService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly administrativeRoles: AdministrativeRole[] = ['Admin', 'Receptionist'];

  protected readonly form = this.formBuilder.group({
    username: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    password: ['', [Validators.required, Validators.pattern(/\S/)]],
    role: [null as AdministrativeRole | null, [Validators.required]]
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: CreateUserRequest = {
      username: value.username!.trim(),
      email: value.email!.trim(),
      password: value.password!,
      role: value.role!
    };

    this.loading.set(true);

    this.userService.create(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success('Usuario registrado correctamente');
        this.router.navigate(['/users']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        const message =
          error.error?.message ?? error.error?.errors?.[0] ?? 'Error al registrar el usuario';
        this.notification.error(message);
      }
    });
  }
}
