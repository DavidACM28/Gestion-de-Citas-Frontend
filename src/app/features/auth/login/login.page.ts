import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedMaterialModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);

  form = this.fb.group({
    userName: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(3)]],
  });

  loading = false;
  hidePassword = true;
  sessionExpiredMessage = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.sessionExpiredMessage = params['expired'] === 'true';
    });

    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  submit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const { userName, password } = this.form.value;

    this.authService.login({ userName: userName!, password: password! }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        const message =
          err.status === 400 || err.status === 401
            ? 'Usuario o contraseña incorrectos.'
            : 'No se pudo conectar con el servidor.';
        this.notification.error(message);
      },
    });
  }
}
