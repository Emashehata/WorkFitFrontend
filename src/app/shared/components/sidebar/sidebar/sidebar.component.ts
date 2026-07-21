import { Component, input, output, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarService } from '../../../../core/services/sidebar/sidebar.service';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private sidebarService = inject(SidebarService);
  private authService = inject(AuthService);

  opened = input(true);
  close = output<void>();

  sections = this.sidebarService.menuSections;
  expandedItems = new Set<string>();

  // ⭐ Get user info from auth service
  userName = computed(() => this.authService.currentUser()?.displayName || 'User');
  userRole = computed(() => this.authService.currentUser()?.roles[0] || 'Employee');
  userInitials = computed(() => {
    const name = this.userName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  });

  toggleItem(route: string): void {
    if (this.expandedItems.has(route)) {
      this.expandedItems.delete(route);
    } else {
      this.expandedItems.add(route);
    }
  }

  isExpanded(route: string): boolean {
    return this.expandedItems.has(route);
  }
}