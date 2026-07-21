import { Component, HostListener, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/components/header/header/header.component';
import { ToastComponent } from '../../../shared/components/toast/toast/toast.component';
import { SidebarService } from '../../../core/services/sidebar/sidebar.service';
import { SidebarSection } from '../../../core/models/sidebar.models';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, ToastComponent],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent implements OnInit {
  private sidebarService = inject(SidebarService);

  sidebarOpen = signal(true);
  isMobile = signal(window.innerWidth < 992);

  ngOnInit(): void {
    // ⭐ Layout decides what menu items to show!
    this.configureMenu();
  }

  configureMenu(): void {
    // ⭐ Example: Different menus based on user role
    const userRole = 'Manager'; // Get from auth service

    let sections: SidebarSection[] = [];

    if (userRole === 'Manager') {
      sections = [
        {
          title: 'Main',
          items: [
            { title: 'Dashboard', icon: 'fa-solid fa-house', route: '/home' },
          ],
        },
        {
          title: 'Management',
          items: [
            {
              title: 'Employees',
              icon: 'fa-solid fa-users',
              route: '/employees',
            },
            {
              title: 'Projects',
              icon: 'fa-solid fa-diagram-project',
              route: '/projects',
            },
            {
              title: 'Roles',
              icon: 'fa-solid fa-user-shield',
              route: '/roles',
            },
            {
              title: 'Settings',
              icon: 'fa-solid fa-gear',
              route: '/organization_settings',
            },
          ],
        }
      ];
    } else {
      // Default: Employee
      sections = [
        {
          title: 'Main',
          items: [
            { title: 'Dashboard', icon: 'fa-solid fa-house', route: '/home' },
            {
              title: 'My Profile',
              icon: 'fa-solid fa-user',
              route: '/profile',
            },
            {
              title: 'My Projects',
              icon: 'fa-solid fa-diagram-project',
              route: '/my-projects',
            },
          ],
        },
        {
          title: 'Settings',
          items: [
            { title: 'Settings', icon: 'fa-solid fa-gear', route: '/settings' },
          ],
        },
      ];
    }

    this.sidebarService.setMenuSections(sections);
  }

  // ⭐ Reset menu when user changes
  resetMenu(): void {
    this.configureMenu();
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
