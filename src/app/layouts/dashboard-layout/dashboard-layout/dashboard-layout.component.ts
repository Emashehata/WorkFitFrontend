import { Component, HostListener, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/components/header/header/header.component';
import { ToastComponent } from '../../../shared/components/toast/toast/toast.component';
import { AgentChatWidgetComponent } from '../../../shared/components/agent-chat-widget/agent-chat-widget.component';
import { SidebarService } from '../../../core/services/sidebar/sidebar.service';
import { SidebarSection } from '../../../core/models/sidebar.models';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UserRole } from '../../../core/enums/user-role.enum';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent, ToastComponent, AgentChatWidgetComponent],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent implements OnInit {
  private sidebarService = inject(SidebarService);
  private authService = inject(AuthService);

  sidebarOpen = signal(true);
  isMobile = signal(window.innerWidth < 992);

  isTeamLeaderOrOwner = computed(() =>
    this.authService.isTeamLeader() ||
    this.authService.isOrganizationOwner() ||
    this.authService.isAdmin() ||
    this.authService.hasRole(UserRole.TeamLeader)
  );

  ngOnInit(): void {
    this.configureMenu();
  }

  configureMenu(): void {
    const role = this.authService.role();
    console.log('Current Role:', role);
    console.log('All Roles:', this.authService.getUserRoles());
    let sections: SidebarSection[] = [];

    if (role === UserRole.SuperAdmin) {
      sections = [
        {
          title: 'Main',
          items: [
            {
              title: 'Dashboard',
              icon: 'fa-solid fa-house',
              route: '/home',
            },
          ],
        },
        {
          title: 'Administration',
          items: [
            {
              title: 'Organizations',
              icon: 'fa-solid fa-building',
              route: '/organizations',
            },
            {
              title: 'Admins',
              icon: 'fa-solid fa-user-shield',
              route: '/admins',
            },
            {
              title: 'Settings',
              icon: 'fa-solid fa-gear',
              route: '/settings',
            },
          ],
        },
      ];
    }

    else if (role === UserRole.Admin) {
      sections = [
        {
          title: 'Main',
          items: [
            {
              title: 'Dashboard',
              icon: 'fa-solid fa-house',
              route: '/home',
            },
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
          ],
        },
      ];
    }

    else if (role === UserRole.OrganizationOwner) {
      sections = [
        {
          title: 'Main',
          items: [
            {
              title: 'Dashboard',
              icon: 'fa-solid fa-house',
              route: '/home',
            },
          ],
        },
        {
          title: 'Organization',
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
              title: 'Teams',
              icon: 'fa-solid fa-people-group',
              route: '/teams',
            },
            {
              title: 'Invitation approvals',
              icon: 'fa-solid fa-user-check',
              route: '/invitation-approvals',
            },
            {
              title: 'Settings',
              icon: 'fa-solid fa-gear',
              route: '/organization_settings',
            },
          ],
        },
      ];
    }

    else if (role === UserRole.TeamLeader) {
      sections = [
        {
          title: 'Main',
          items: [
            {
              title: 'Dashboard',
              icon: 'fa-solid fa-house',
              route: '/home',
            },
          ],
        },
        {
          title: 'Team',
          items: [
            {
              title: 'My Team',
              icon: 'fa-solid fa-users',
              route: '/my-team',
            },
            {
              title: 'Projects',
              icon: 'fa-solid fa-diagram-project',
              route: '/projects',
            },
             { title: 'Assessments', icon: 'fa-solid fa-clipboard-check', route: '/team-assessments' },
          ],
        },
      ];
    }

    else if (role === UserRole.Employee) {
      sections = [
        {
          title: 'Main',
          items: [
            {
              title: 'Dashboard',
              icon: 'fa-solid fa-house',
              route: '/home',
            },
            {
              title: 'My Profile',
              icon: 'fa-solid fa-user',
              route: '/profile',
            },
            {
              title: 'My Tasks',
              icon: 'fa-solid fa-list-check',
              route: '/my-tasks',
            },
            {
              title: 'My Projects',
              icon: 'fa-solid fa-diagram-project',
              route: '/my-projects',
            },
            {
              title: 'Settings',
              icon: 'fa-solid fa-gear',
              route: '/settings',
            },
            { title: 'My Assessments', icon: 'fa-solid fa-clipboard-check', route: '/my-assessments' },
          ],
        },
      ];
    }

    this.sidebarService.setMenuSections(sections);
  }

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
