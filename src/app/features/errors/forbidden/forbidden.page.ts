import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-forbidden-page',
  standalone: true,
  imports: [RouterLink, SharedMaterialModule],
  templateUrl: './forbidden.page.html',
  styleUrl: './forbidden.page.scss',
})
export class ForbiddenPage {}
