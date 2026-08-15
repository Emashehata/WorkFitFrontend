import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/components/header/header/header.component';
import { ToastComponent } from '../../../shared/components/toast/toast/toast.component';
import { AgentChatWidgetComponent } from '../../../shared/components/agent-chat-widget/agent-chat-widget.component';
import { SidebarService } from '../../../core/services/sidebar/sidebar.service';
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
  isTeamLeaderOrOwner = computed(() => this.authService.isTeamLeader() || this.authService.isOrganizationOwner() || this.authService.isAdmin() || this.authService.hasRole(UserRole.TeamLeader));

  ngOnInit(): void { this.sidebarService.initializeMenu(); }
  resetMenu(): void { this.sidebarService.resetMenu(); }
  @HostListener('window:resize') onResize(): void { const mobile = window.innerWidth < 992; this.isMobile.set(mobile); this.sidebarOpen.set(!mobile); }
  toggleSidebar(): void { this.sidebarOpen.update(value => !value); }
  closeSidebar(): void { if (this.isMobile()) this.sidebarOpen.set(false); }
}
