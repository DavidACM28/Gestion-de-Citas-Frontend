import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-notfound-page',
  standalone: true,
  imports: [RouterLink, SharedMaterialModule],
  templateUrl: './notfound.page.html',
  styleUrl: './notfound.page.scss',
})
export class NotfoundPage {}
