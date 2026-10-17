import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { Specialty } from '../../../core/models/specialty.model';
import { NotificationService } from '../../../core/services/notification.service';
import { SpecialtyService } from '../../../core/services/specialty.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { HasRoleDirective } from '../../../shared/directives/has-role-directive';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-specialties-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SharedMaterialModule,
    HasRoleDirective,
    EmptyStateComponent,
    PageHeaderComponent
  ],
  templateUrl: './specialties-list.page.html',
  styleUrl: './specialties-list.page.scss'
})
export class SpecialtiesListPage implements OnInit {
  private readonly specialtyService = inject(SpecialtyService);
  private readonly notification = inject(NotificationService);

  protected readonly displayedColumns: string[] = ['name', 'description', 'actions'];
  protected readonly dataSource = new MatTableDataSource<Specialty>();
  protected readonly loading = signal(false);
  protected totalItems = 0;
  protected pageSize = 10;
  protected pageIndex = 0;

  ngOnInit(): void {
    this.loadSpecialties();
  }

  protected loadSpecialties(): void {
    this.loading.set(true);

    this.specialtyService
      .list({ pageNumber: this.pageIndex + 1, pageSize: this.pageSize })
      .subscribe({
        next: (response) => {
          this.dataSource.data = response;
          const loadedItems = this.pageIndex * this.pageSize + response.length;
          this.totalItems = response.length === this.pageSize ? loadedItems + 1 : loadedItems;
          this.loading.set(false);
        },
        error: () => {
          this.notification.error('Error al cargar las especialidades');
          this.loading.set(false);
        }
      });
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadSpecialties();
  }
}
