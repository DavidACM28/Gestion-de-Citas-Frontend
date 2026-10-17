import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { Doctor } from '../../../core/models/doctor.model';
import { Specialty } from '../../../core/models/specialty.model';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SpecialtyService } from '../../../core/services/specialty.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-doctors-list-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SharedMaterialModule,
    EmptyStateComponent,
    PageHeaderComponent
  ],
  templateUrl: './doctors-list.page.html',
  styleUrl: './doctors-list.page.scss'
})
export class DoctorsListPage implements OnInit {
  private readonly doctorService = inject(DoctorService);
  private readonly specialtyService = inject(SpecialtyService);
  private readonly notification = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly role = this.auth.currentUser()!.role;
  protected readonly isAdmin = this.role === 'Admin';
  protected readonly isDoctor = this.role === 'Doctor';
  protected readonly canViewDetails = this.isAdmin || this.role === 'Receptionist';
  protected readonly displayedColumns: string[] = this.canViewDetails
    ? ['doctor', 'specialty', 'phoneNumber', 'email', 'actions']
    : ['doctor', 'specialty', 'phoneNumber', 'email'];
  protected readonly dataSource = new MatTableDataSource<Doctor>();
  protected readonly specialties = signal<Specialty[]>([]);
  protected readonly loading = signal(false);
  protected pageIndex = 0;
  protected pageSize = 10;
  protected totalItems = 0;

  protected readonly filters = this.formBuilder.group({
    name: [''],
    specialty: ['']
  });

  ngOnInit(): void {
    this.loadSpecialties();
    this.loadDoctors();
  }

  protected applyFilters(): void {
    this.pageIndex = 0;
    this.loadDoctors();
  }

  protected clearFilters(): void {
    this.filters.reset({ name: '', specialty: '' });
    this.pageIndex = 0;
    this.loadDoctors();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadDoctors();
  }

  private loadDoctors(): void {
    const value = this.filters.getRawValue();
    this.loading.set(true);

    this.doctorService
      .list({
        name: value.name?.trim() ?? '',
        specialty: value.specialty ?? '',
        pageNumber: this.pageIndex + 1,
        pageSize: this.pageSize
      })
      .subscribe({
        next: (doctors) => {
          this.dataSource.data = doctors;
          const loadedItems = this.pageIndex * this.pageSize + doctors.length;
          this.totalItems = doctors.length === this.pageSize ? loadedItems + 1 : loadedItems;
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.dataSource.data = [];
          this.totalItems = this.pageIndex * this.pageSize;
          this.loading.set(false);

          if (error.status !== 404) {
            const message = error.error?.message ?? 'Error al cargar los médicos';
            this.notification.error(message);
          }
        }
      });
  }

  private loadSpecialties(): void {
    this.specialtyService.list({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (specialties) => this.specialties.set(specialties),
      error: () => this.notification.error('No se pudieron cargar las especialidades')
    });
  }
}
