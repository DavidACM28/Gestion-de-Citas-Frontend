import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { User } from '../../../core/models/user.model';
import { NotificationService } from '../../../core/services/notification.service';
import { UserService } from '../../../core/services/user.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { HasRoleDirective } from '../../../shared/directives/has-role-directive';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-users-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SharedMaterialModule,
    HasRoleDirective,
    EmptyStateComponent,
    PageHeaderComponent
  ],
  templateUrl: './users-list.page.html',
  styleUrl: './users-list.page.scss'
})
export class UsersListPage implements OnInit {
  private readonly userService = inject(UserService);
  private readonly notification = inject(NotificationService);

  protected readonly displayedColumns: string[] = ['username', 'email', 'role', 'actions'];
  protected readonly dataSource = new MatTableDataSource<User>();
  protected readonly loading = signal(false);

  ngOnInit(): void {
    this.loadUsers();
  }

  protected loadUsers(): void {
    this.loading.set(true);

    this.userService.list().subscribe({
      next: (users) => {
        this.dataSource.data = users.filter(
          (user) => user.role === 'Admin' || user.role === 'Receptionist'
        );
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar los usuarios');
        this.loading.set(false);
      }
    });
  }
}
