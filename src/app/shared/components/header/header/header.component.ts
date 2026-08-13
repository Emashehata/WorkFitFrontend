import { Component, inject, output, computed } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  toggleSidebar = output<void>();

  currentUser = this.authService.currentUser;

  userName = computed(() => {
    const user = this.currentUser();
    return user?.displayName || user?.email?.split('@')[0] || 'User';
  });

  userRole = computed(() => {
    const user = this.currentUser();
    return user?.roles?.[0] || 'Member';
  });

  userInitials = computed(() => {
    const name = this.userName();
    return name ? name.charAt(0).toUpperCase() : 'U';
  });

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
