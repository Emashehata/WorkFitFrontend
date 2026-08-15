import { Component, HostListener, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/components/header/header/header.component';
import { ToastComponent } from '../../../shared/components/toast/toast/toast.component';
import { SidebarService } from '../../../core/services/sidebar/sidebar.service';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, ToastComponent],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent implements OnInit {
  private sidebarService = inject(SidebarService);
  private authService = inject(AuthService);

  sidebarOpen = signal(true);
  isMobile = signal(window.innerWidth < 992);

  ngOnInit(): void {
    // ⭐ Ensure menu is initialized based on user roles
    this.sidebarService.initializeMenu();

    // ⭐ Listen for auth changes
    this.authService.currentUser();
  }

  @HostListener('window:resize')
  onResize() {
    const mobile = window.innerWidth < 992;
    this.isMobile.set(mobile);

    if (mobile) {
      this.sidebarOpen.set(false);
    } else {
      this.sidebarOpen.set(true);
    }
  }

  toggleSidebar() {
    this.sidebarOpen.update((value) => !value);
  }

  closeSidebar() {
    if (this.isMobile()) {
      this.sidebarOpen.set(false);
    }
  }
}