import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { Patient } from '../../../core/models/patient.model';
import { NotificationService } from '../../../core/services/notification.service';
import { PatientService } from '../../../core/services/patient.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-patients-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SharedMaterialModule,
    EmptyStateComponent,
    PageHeaderComponent
  ],
  templateUrl: './patients-list.page.html',
  styleUrl: './patients-list.page.scss'
})
export class PatientsListPage implements OnInit {
  private readonly patientService = inject(PatientService);
  private readonly notification = inject(NotificationService);

  protected readonly displayedColumns: string[] = [
    'fullName',
    'document',
    'email',
    'phoneNumber',
    'actions'
  ];
  protected readonly dataSource = new MatTableDataSource<Patient>();
  protected readonly loading = signal(false);

  ngOnInit(): void {
    this.loadPatients();
  }

  protected loadPatients(): void {
    this.loading.set(true);

    this.patientService.list().subscribe({
      next: (patients) => {
        this.dataSource.data = patients;
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar los pacientes');
        this.loading.set(false);
      }
    });
  }
}
