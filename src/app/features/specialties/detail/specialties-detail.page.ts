import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Specialty } from '../../../core/models/specialty.model';
import { NotificationService } from '../../../core/services/notification.service';
import { SpecialtyService } from '../../../core/services/specialty.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-specialties-detail-page',
  standalone: true,
  imports: [RouterLink, SharedMaterialModule, PageHeaderComponent],
  templateUrl: './specialties-detail.page.html',
  styleUrl: './specialties-detail.page.scss'
})
export class SpecialtiesDetailPage implements OnInit {
  private readonly specialtyService = inject(SpecialtyService);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);

  protected readonly loading = signal(false);
  protected readonly specialty = signal<Specialty | null>(null);

  ngOnInit(): void {
    this.loading.set(true);
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.specialtyService.getById(id).subscribe({
      next: (specialty) => {
        this.specialty.set(specialty);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar la especialidad');
        this.loading.set(false);
      }
    });
  }
}
