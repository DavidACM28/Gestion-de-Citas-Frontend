import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, ToolbarComponent, SidenavComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  private readonly breakpointObserver = inject(BreakpointObserver);

  protected readonly isHandset = this.breakpointObserver.isMatched(Breakpoints.Handset);

  protected toggleSidenav(): void {
    this.sidenav.toggle();
  }
}
