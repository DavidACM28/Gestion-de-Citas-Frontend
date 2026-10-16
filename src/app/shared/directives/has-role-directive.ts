import { Directive, inject, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/auth.model';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {
  private readonly auth = inject(AuthService);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly templateRef = inject(TemplateRef<unknown>);

  @Input('appHasRole') set role(requiredRoles: Role | Role[]) {
    const userRole = this.auth.currentUser()?.role;
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    this.viewContainer.clear();

    if (userRole && roles.includes(userRole)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
